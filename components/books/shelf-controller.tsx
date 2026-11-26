'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, List, Library, X } from 'lucide-react'
import type { BookView } from '@/lib/books'
import { BookCover, BookInfo, formatAuthors } from '@/components/books/book-info'

const TITLE_ID = 'bk-dialog-title'
const SHELF_PATH = '/books/'
const VIEW_KEY = 'books-view'
type LibraryView = 'shelf' | 'list'

function slugFromPath(pathname: string): string | null {
  const m = /^\/books\/([a-z0-9-]+)\/?$/.exec(pathname)
  return m ? m[1] : null
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Fly a book between its place on the shelf and the dialog.
 *
 * The book is a box: its spine faces you and its front cover is the box's
 * right-hand side. Turning the box -90° about its vertical axis brings the
 * cover round to face you while it travels to where the dialog shows it.
 */
function flyBook(
  spine: HTMLElement,
  book: BookView,
  from: DOMRect,
  to: DOMRect,
  open: boolean,
  rootClass: string
): Promise<void> {
  const T = spine.offsetWidth || from.width
  const H = spine.offsetHeight || from.height
  const D = H * (book.cover.width / book.cover.height)
  const k = to.height / H

  const wrap = document.createElement('div')
  wrap.className = `${rootClass} bk-fly-wrap`
  wrap.setAttribute('aria-hidden', 'true')
  const box = document.createElement('div')
  box.className = 'bk-fly'

  const front = document.createElement('div')
  front.className = 'bk-face'
  front.setAttribute('style', spine.getAttribute('style') ?? '')
  Object.assign(front.style, {
    width: `${T}px`,
    height: `${H}px`,
    left: `${-T / 2}px`,
    top: `${-H / 2}px`,
    margin: '0',
    borderRadius: '2px',
    transform: `translateZ(${D / 2}px)`,
  })
  const art = spine.querySelector('.bk-spine')
  if (art) front.appendChild(art.cloneNode(true))

  const side = document.createElement('div')
  side.className = 'bk-face'
  Object.assign(side.style, {
    width: `${D}px`,
    height: `${H}px`,
    left: `${-D / 2}px`,
    top: `${-H / 2}px`,
    transform: `rotateY(90deg) translateZ(${T / 2}px)`,
  })
  const img = document.createElement('img')
  img.src = book.cover.src
  img.alt = ''
  const bind = document.createElement('i')
  bind.className = 'bk-bind'
  side.append(img, bind)

  box.append(front, side)
  wrap.appendChild(box)
  document.body.appendChild(wrap)

  const fx = from.left + from.width / 2
  const fy = from.top + from.height / 2
  const tx = to.left + to.width / 2
  const ty = to.top + to.height / 2
  const lean = parseFloat(spine.dataset.lean ?? '0')
  const rest = `translate3d(${fx}px,${fy}px,${-D / 2}px) scale(1) rotateZ(${lean}deg) rotateY(0deg)`
  const lifted = `translate3d(${fx}px,${fy - Math.round(H * 0.16)}px,${-D / 2 + 70}px) scale(1) rotateZ(0deg) rotateY(0deg)`
  const shown = `translate3d(${tx}px,${ty}px,${(-k * T) / 2}px) scale(${k}) rotateZ(0deg) rotateY(-90deg)`
  const frames: Keyframe[] = open
    ? [
        { transform: rest, easing: 'cubic-bezier(.4,0,.6,1)' },
        { transform: lifted, offset: 0.3, easing: 'cubic-bezier(.3,.6,.15,1)' },
        { transform: shown },
      ]
    : [
        { transform: shown, easing: 'cubic-bezier(.4,0,.6,1)' },
        { transform: lifted, offset: 0.7, easing: 'cubic-bezier(.3,.6,.2,1)' },
        { transform: rest },
      ]
  const anim = box.animate(frames, { duration: open ? 860 : 640, easing: 'linear', fill: 'forwards' })
  return anim.finished.then(
    () => wrap.remove(),
    () => wrap.remove()
  )
}

/**
 * Interaction for the shelf: hover captions, one-tab-stop keyboard movement,
 * and taking a book out to show its cover. The shelf markup itself is rendered
 * on the server and arrives as `children`.
 */
export function ShelfController({ books, shelf, list }: {
  books: BookView[]
  shelf: ReactNode
  list: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLSpanElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [view, setView] = useState<LibraryView>('shelf')
  const [open, setOpen] = useState<BookView | null>(null)
  const [mounted, setMounted] = useState(false)
  const [rootClass, setRootClass] = useState('bk')
  const state = useRef<{
    spine: HTMLElement | null
    pushed: boolean
    busy: boolean
    animateOpen: boolean
    focusAfterStep: 'prev' | 'next' | null
  }>({ spine: null, pushed: false, busy: false, animateOpen: false, focusAfterStep: null })
  const bySlug = useMemo(() => new Map(books.map((b) => [b.slug, b])), [books])
  const order = useMemo(() => books.map((b) => b.slug), [books])

  /** The layout CSS is currently showing. */
  const visibleLayout = useCallback((): HTMLElement | null => {
    const layouts = rootRef.current?.querySelectorAll<HTMLElement>('.bk-layout, .bk-list') ?? []
    return [...layouts].find((l) => l.offsetParent !== null) ?? null
  }, [])

  const entryFor = useCallback(
    (slug: string) => visibleLayout()?.querySelector<HTMLElement>(`[data-slug="${slug}"]`) ?? null,
    [visibleLayout]
  )

  // ── shrink any spine title that measures wider than its spine ──────────
  const fitTitles = useCallback((scope: HTMLElement) => {
    scope.querySelectorAll<HTMLElement>('.bk-tt').forEach((el) => {
      let size = parseFloat(getComputedStyle(el).fontSize)
      let n = 0
      while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && size > 5.5 && n++ < 30) {
        size -= 0.5
        el.style.fontSize = `${size}px`
      }
    })
  }, [])

  // ── one tab stop on the visible shelf ─────────────────────────────────
  const setRoving = useCallback(
    (current?: string) => {
      const root = rootRef.current
      if (!root) return
      root.querySelectorAll<HTMLElement>('.bk-book').forEach((b) => (b.tabIndex = -1))
      const layout = visibleLayout()
      if (!layout) return
      const books = [...layout.querySelectorAll<HTMLElement>('.bk-book')]
      const target = (current && books.find((b) => b.dataset.slug === current)) || books[0]
      if (target) target.tabIndex = 0
      fitTitles(layout)
    },
    [visibleLayout, fitTitles]
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    setRootClass(root.closest('.bk')?.className ?? 'bk')
    setMounted(true)
    try {
      if (localStorage.getItem(VIEW_KEY) === 'list') setView('list')
    } catch {
      // Storage may be disabled. The switch still works for this visit.
    }
  }, [])

  const chooseView = (next: LibraryView) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_KEY, next)
    } catch {
      // The current selection is already reflected in the page.
    }
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let lastLayout: HTMLElement | null = null
    const sync = () => {
      const layout = visibleLayout()
      if (layout === lastLayout) return
      const focused = (document.activeElement as HTMLElement | null)?.dataset?.slug
      lastLayout = layout
      setRoving(focused ?? state.current.spine?.dataset.slug)
      // A book that is out stays out in whichever layout is showing.
      if (state.current.spine && layout) {
        const slug = state.current.spine.dataset.slug!
        state.current.spine.classList.remove('is-out')
        const replacement = layout.querySelector<HTMLElement>(`[data-slug="${slug}"]`)
        if (replacement) {
          replacement.classList.toggle('is-out', replacement.matches('.bk-book'))
          state.current.spine = replacement
        }
      }
    }
    sync()
    document.fonts?.ready.then(() => {
      const layout = visibleLayout()
      if (layout) fitTitles(layout)
    })
    const ro = new ResizeObserver(sync)
    ro.observe(root)
    return () => ro.disconnect()
  }, [view, visibleLayout, setRoving, fitTitles])

  // ── captions under the shelf ──────────────────────────────────────────
  const caption = useCallback(
    (spine: HTMLElement, on: boolean) => {
      const row = spine.closest<HTMLElement>('.bk-row')
      const cap = row?.querySelector<HTMLElement>('.bk-cap span')
      if (!row || !cap) return
      if (!on || state.current.spine) {
        cap.style.opacity = '0'
        return
      }
      const book = bySlug.get(spine.dataset.slug!)
      if (!book) return
      cap.replaceChildren()
      const b = document.createElement('b')
      b.textContent = book.title
      cap.append(b, ` · ${formatAuthors(book.authors)}`)
      cap.style.top = ''
      cap.style.opacity = '1'
      // Centred under the book, kept inside both the shelf and the viewport.
      const box = cap.parentElement!.getBoundingClientRect()
      const spineBox = spine.getBoundingClientRect()
      const viewport = document.documentElement.clientWidth
      const min = Math.max(0, 8 - box.left)
      const max = Math.min(box.width, viewport - 8 - box.left)
      const w = cap.offsetWidth
      const cx = spineBox.left - box.left + spineBox.width / 2
      cap.style.left = `${Math.max(min, Math.min(cx - w / 2, max - w))}px`
      // Below the fold, it moves above the book instead.
      const h = cap.offsetHeight
      if (box.top + h > window.innerHeight - 8 && spineBox.top - h - 8 >= 0) {
        cap.style.top = `${spineBox.top - box.top - h - 8}px`
      }
    },
    [bySlug]
  )

  // ── open, step and close ──────────────────────────────────────────────
  const openBook = useCallback(
    (slug: string, animate: boolean) => {
      const book = bySlug.get(slug)
      if (!book || state.current.busy) return
      const spine = entryFor(slug)
      state.current.spine = spine
      state.current.animateOpen = animate && !!spine?.matches('.bk-book') && !reducedMotion()
      state.current.busy = true
      document.querySelectorAll('.bk-cap span').forEach((c) => ((c as HTMLElement).style.opacity = '0'))
      setOpen(book)
    },
    [bySlug, entryFor]
  )

  // Runs once the dialog for a newly opened book is in the DOM.
  useLayoutEffect(() => {
    const modal = modalRef.current
    const cover = coverRef.current
    if (!open || !modal || !cover || !state.current.busy) return
    const panel = modal.querySelector<HTMLElement>('.bk-panel')!
    panel.style.transition = 'none'
    modal.classList.add('is-on')
    void panel.offsetWidth
    panel.style.transition = ''
    closeRef.current?.focus({ preventScroll: true })

    const spine = state.current.spine
    if (!state.current.animateOpen || !spine) {
      cover.style.opacity = '1'
      spine?.classList.toggle('is-out', spine.matches('.bk-book'))
      closeRef.current?.focus({ preventScroll: true })
      state.current.busy = false
      return
    }
    cover.style.opacity = '0'
    cover.classList.remove('is-shown')
    const from = spine.getBoundingClientRect()
    const img = cover.querySelector('img')!
    const go = () => {
      const to = img.getBoundingClientRect()
      spine.classList.add('is-out')
      closeRef.current?.focus({ preventScroll: true })
      flyBook(spine, open, from, to, true, rootClass).then(() => {
        cover.classList.add('is-shown')
        cover.style.opacity = '1'
        state.current.busy = false
      })
    }
    if (img.complete) {
      go()
    } else {
      img.addEventListener('load', go, { once: true })
      img.addEventListener('error', go, { once: true })
      return () => {
        img.removeEventListener('load', go)
        img.removeEventListener('error', go)
      }
    }
    // Only when a different book is opened, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.slug])

  const finishClose = useCallback(() => {
    const spine = state.current.spine
    const modal = modalRef.current
    modal?.classList.remove('is-on')
    const done = () => {
      setOpen(null)
      state.current.busy = false
      state.current.spine = null
      if (spine?.isConnected) {
        spine.classList.remove('is-out')
        setRoving(spine.dataset.slug)
        spine.focus({ preventScroll: true })
      }
    }
    const cover = coverRef.current
    const book = spine ? bySlug.get(spine.dataset.slug!) : undefined
    if (!spine?.matches('.bk-book') || !cover || !book || !spine.isConnected || reducedMotion() || spine.offsetParent === null) {
      window.setTimeout(done, reducedMotion() ? 0 : 250)
      return
    }
    state.current.busy = true
    const to = cover.querySelector('img')!.getBoundingClientRect()
    cover.classList.remove('is-shown')
    cover.style.opacity = '0'
    flyBook(spine, book, spine.getBoundingClientRect(), to, false, rootClass).then(done)
  }, [bySlug, rootClass, setRoving])

  const requestClose = useCallback(() => {
    if (!open || state.current.busy) return
    if (state.current.pushed) {
      // The dialog's URL was pushed by the shelf: going back closes it, and
      // keeps the browser's back button and ours in agreement.
      state.current.pushed = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', SHELF_PATH)
      finishClose()
    }
  }, [open, finishClose])

  const step = useCallback(
    (delta: -1 | 1) => {
      if (!open || state.current.busy) return
      const i = order.indexOf(open.slug)
      const slug = order[i + delta]
      if (!slug) return
      const next = bySlug.get(slug)!
      state.current.spine?.classList.remove('is-out')
      const spine = entryFor(slug)
      spine?.classList.toggle('is-out', spine.matches('.bk-book'))
      state.current.spine = spine
      window.history.replaceState(null, '', `/books/${slug}/`)
      const cover = coverRef.current
      if (cover) cover.style.opacity = '0'
      window.setTimeout(
        () => {
          state.current.focusAfterStep = delta < 0 ? 'prev' : 'next'
          setOpen(next)
          if (cover) cover.style.opacity = '1'
        },
        reducedMotion() ? 0 : 160
      )
    },
    [bySlug, order, open, entryFor]
  )

  // Keep focus on the button that was used to step, or on close if it vanished.
  useEffect(() => {
    const which = state.current.focusAfterStep
    if (!which || !modalRef.current) return
    state.current.focusAfterStep = null
    const btn = modalRef.current.querySelector<HTMLButtonElement>(`[data-step="${which}"]`)
    ;(btn && !btn.disabled ? btn : closeRef.current)?.focus()
  }, [open])

  // ── browser back and forward ──────────────────────────────────────────
  useEffect(() => {
    const onPop = () => {
      const slug = slugFromPath(window.location.pathname)
      if (slug && !open) openBook(slug, true)
      else if (!slug && open) {
        state.current.pushed = false
        finishClose()
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [open, openBook, finishClose])

  // ── events on the shelf ───────────────────────────────────────────────
  const onClick = (e: React.MouseEvent) => {
    const spine = (e.target as HTMLElement).closest<HTMLElement>('.bk-book, .bk-entry')
    if (!spine || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    if (open || state.current.busy) return
    const slug = spine.dataset.slug!
    caption(spine, false)
    window.history.pushState(null, '', `/books/${slug}/`)
    state.current.pushed = true
    openBook(slug, true)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = (e.target as HTMLElement).closest<HTMLElement>('.bk-book')
    const layout = visibleLayout()
    if (!cur || !layout) return
    const books = [...layout.querySelectorAll<HTMLElement>('.bk-book')]
    const i = books.indexOf(cur)
    let next: HTMLElement | undefined
    if (e.key === 'ArrowRight') next = books[i + 1]
    else if (e.key === 'ArrowLeft') next = books[i - 1]
    else if (e.key === 'Home') next = books[0]
    else if (e.key === 'End') next = books[books.length - 1]
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = [...layout.querySelectorAll<HTMLElement>('.bk-row')]
      const target = rows[rows.indexOf(cur.closest('.bk-row')!) + (e.key === 'ArrowDown' ? 1 : -1)]
      if (target) {
        const x = cur.getBoundingClientRect().left + cur.offsetWidth / 2
        let best: { el: HTMLElement; d: number } | null = null
        target.querySelectorAll<HTMLElement>('.bk-book').forEach((el) => {
          const d = Math.abs(el.getBoundingClientRect().left + el.offsetWidth / 2 - x)
          if (!best || d < best.d) best = { el, d }
        })
        next = (best as { el: HTMLElement; d: number } | null)?.el
      }
    } else if (e.key === ' ') {
      e.preventDefault()
      cur.click()
      return
    } else return
    e.preventDefault()
    if (next) {
      books.forEach((b) => (b.tabIndex = -1))
      next.tabIndex = 0
      next.focus()
    }
  }

  const onPointerOver = (e: React.PointerEvent) => {
    const spine = (e.target as HTMLElement).closest<HTMLElement>('.bk-book')
    if (spine && e.pointerType !== 'touch') caption(spine, true)
  }
  const onPointerOut = (e: React.PointerEvent) => {
    const spine = (e.target as HTMLElement).closest<HTMLElement>('.bk-book')
    if (spine && !spine.contains(e.relatedTarget as Node) && document.activeElement !== spine) caption(spine, false)
  }
  const onFocus = (e: React.FocusEvent) => {
    const spine = (e.target as HTMLElement).closest<HTMLElement>('.bk-book')
    if (spine) caption(spine, true)
  }
  const onBlur = (e: React.FocusEvent) => {
    const spine = (e.target as HTMLElement).closest<HTMLElement>('.bk-book')
    if (spine) caption(spine, false)
  }

  // ── keys inside the dialog ────────────────────────────────────────────
  const onModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      requestClose()
    } else if (e.key === 'ArrowRight' && !(e.target as HTMLElement).closest('a')) step(1)
    else if (e.key === 'ArrowLeft' && !(e.target as HTMLElement).closest('a')) step(-1)
    else if (e.key === 'Tab') {
      const panel = modalRef.current?.querySelector<HTMLElement>('.bk-panel')
      if (!panel) return
      const focusable = [...panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')].filter(
        (el) => el.offsetParent !== null
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  const index = open ? order.indexOf(open.slug) : -1
  const prev = index > 0 ? bySlug.get(order[index - 1]) : undefined
  const next = index >= 0 ? bySlug.get(order[index + 1]) : undefined

  return (
    <div
      ref={rootRef}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="bk-view-switch" role="group" aria-label="Books view">
        <button type="button" aria-pressed={view === 'shelf'} onClick={() => chooseView('shelf')}>
          <Library aria-hidden="true" />
          Shelf
        </button>
        <button type="button" aria-pressed={view === 'list'} onClick={() => chooseView('list')}>
          <List aria-hidden="true" />
          List
        </button>
      </div>
      <div hidden={view !== 'shelf'}>{shelf}</div>
      <div hidden={view !== 'list'}>{list}</div>
      {mounted &&
        createPortal(
          <div
            ref={modalRef}
            className={`${rootClass} bk-modal`}
            hidden={!open}
            role="dialog"
            aria-modal="true"
            aria-labelledby={TITLE_ID}
            onKeyDown={onModalKeyDown}
          >
            <div className="bk-back" onClick={requestClose} />
            {open && (
              <div className="bk-panel">
                <div className="bk-stage">
                  <BookCover book={open} priority ref={coverRef} />
                </div>
                <div className="bk-info">
                  <BookInfo book={open} titleId={TITLE_ID} />
                  <nav className="bk-nav" aria-label="Neighbouring books">
                    <div className="bk-nav-inner">
                      <button
                        type="button"
                        className="bk-btn"
                        data-step="prev"
                        onClick={() => step(-1)}
                        disabled={!prev}
                        style={prev ? undefined : { visibility: 'hidden' }}
                      >
                        <ChevronLeft className="h-4 w-4 flex-none" aria-hidden="true" />
                        <span>{prev?.title}</span>
                      </button>
                      <button
                        type="button"
                        className="bk-btn"
                        data-step="next"
                        onClick={() => step(1)}
                        disabled={!next}
                        style={next ? { textAlign: 'right' } : { visibility: 'hidden' }}
                      >
                        <span>{next?.title}</span>
                        <ChevronRight className="h-4 w-4 flex-none" aria-hidden="true" />
                      </button>
                    </div>
                  </nav>
                </div>
                <button ref={closeRef} type="button" className="bk-x" onClick={requestClose} aria-label="Close">
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
