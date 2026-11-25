import type { Book, BookCategory } from './book-types'

/**
 * Shelf layout, as pure functions.
 *
 * The shelf is packed for a set of fixed column widths ("buckets") at build
 * time. The page renders one layout per bucket and a container query shows the
 * widest one that fits, so the shelves are in their final place in the static
 * HTML: no measuring, no reflow after hydration, and nothing to shift.
 */

/**
 * Column widths the shelf is packed for, widest first. They cover the content
 * column at every viewport the site supports: 720px at tablet width, 696px
 * beside the sidebar, down to 288px on a 320px phone. The last is a floor for
 * anything narrower.
 */
export const SHELF_BUCKETS = [720, 696, 640, 580, 520, 460, 420, 380, 358, 328, 300, 288, 240] as const

/** Gap before a category divider, and between a divider and its first book. */
const DIVIDER_WIDTH = 24
const DIVIDER_LINE = 14
const DIVIDER_GAP = 12
const FIRST_BOOK_GAP = 6

/**
 * A divider's label, in as many lines as it needs to stand no taller than the
 * book beside it. Lines break between words, as evenly as possible.
 */
export function dividerLines(label: string, height: number, k: number): string[] {
  const charWidth = k < 1 ? 5.9 : 6.4 // 11px / 12px Inter, measured average
  const room = height * 0.9
  if (label.length * charWidth <= room) return [label]
  const words = label.split(' ')
  let best: string[] = [label]
  let bestLongest = Infinity
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const longest = Math.max(...lines.map((l) => l.length))
    if (longest < bestLongest) {
      best = lines
      bestLongest = longest
    }
  }
  return best
}

/** Shelves scale with the column so a phone still shows several books per shelf. */
export function shelfScale(width: number): number {
  return width < 420 ? 0.74 : width < 640 ? 0.86 : 1
}

export interface SpineGeometry {
  /** Spine width and height in CSS pixels. */
  width: number
  height: number
  fontSize: number
  paddingTop: number
  paddingBottom: number
}

/** Approximate advance width of one character, as a fraction of the font size. */
const CHAR_WIDTH = { sans: 0.56, serif: 0.5, condensed: 0.44 } as const

/**
 * Size of a spine and the type on it. 1mm of the real book is 1px at full
 * scale. The title size is chosen so the title fits along the spine; on the
 * client the shelf only ever shrinks it further if a font measures wider.
 */
export function spineGeometry(book: Book, k: number): SpineGeometry {
  const s = book.spine
  const width = Math.max(9, Math.round(book.dimensions.thickness * k))
  const height = Math.round(book.dimensions.height * k)
  const lines = s.title.length
  const band = height * 0.11
  const paddingTop = s.accent && s.accentPosition === 'top' ? band + width * 0.3 : width * 0.5
  const paddingBottom = s.accent && s.accentPosition === 'bottom' ? band + width * 0.3 : width * 0.42

  // Across the spine: the title (or its lines) must fit the spine's width.
  let fontSize = Math.min(lines > 1 ? width * 0.3 : width * 0.42, 15)
  // Along the spine: title, author and mark share the length.
  const longest = Math.max(...s.title.map((line) => line.length))
  const authorShare = s.author.length * 0.7
  const markShare = s.mark && !(s.accent && s.accentPosition === 'bottom') ? s.mark.length * 0.48 : 0
  const gaps = width * 0.22 * (1 + (s.mark ? 1 : 0))
  const available = height - paddingTop - paddingBottom - gaps
  const along = available / ((longest + authorShare + markShare) * CHAR_WIDTH[s.font])
  fontSize = Math.max(5.5, Math.min(fontSize, along))

  return {
    width,
    height,
    fontSize: round1(fontSize),
    paddingTop: round1(paddingTop),
    paddingBottom: round1(paddingBottom),
  }
}

export type ShelfItem =
  | { kind: 'divider'; category: BookCategory; lines: string[]; height: number; width: number; gap: number }
  | { kind: 'book'; book: Book; width: number; gap: number }

/** Greedy packing into rows no wider than `width`. */
export function pack<T extends { width: number; gap: number }>(items: T[], width: number): T[][] {
  const rows: T[][] = []
  let row: T[] = []
  let used = 0
  for (const item of items) {
    const add = (row.length ? item.gap : 0) + item.width
    if (row.length && used + add > width) {
      rows.push(row)
      row = []
      used = 0
    }
    used += (row.length ? item.gap : 0) + item.width
    row.push(item)
  }
  if (row.length) rows.push(row)
  return rows
}

/**
 * The fewest shelves the width allows, each filled to a similar length, so no
 * shelf ends in a long empty run while the next one is crowded.
 */
export function packBalanced<T extends { width: number; gap: number }>(items: T[], width: number): T[][] {
  const first = pack(items, width)
  const n = first.length
  if (n < 2) return first
  const total = items.reduce((sum, it, i) => sum + it.width + (i ? it.gap : 0), 0)
  for (let target = Math.ceil(total / n); target <= width; target += 6) {
    const rows = pack(items, target)
    if (rows.length <= n) return rows
  }
  return first
}

export function rowWidth(row: { width: number; gap: number }[]): number {
  return row.reduce((sum, it, i) => sum + it.width + (i ? it.gap : 0), 0)
}

/** A stable small number from a slug, so the same book always leans the same way. */
function hash(text: string): number {
  let h = 7
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 997
  return h
}

export interface ShelfBook {
  kind: 'book'
  book: Book
  geometry: SpineGeometry
  /** Set on the one book at the end of a shelf that leans on its neighbour. */
  lean?: { degrees: number; offset: number }
}

export interface ShelfDivider {
  kind: 'divider'
  category: BookCategory
  /** The label, broken into lines when it is longer than the divider. */
  lines: string[]
  width: number
  /** The divider stands as tall as the book after it. */
  height: number
  first: boolean
}

export interface Shelf {
  items: (ShelfBook | ShelfDivider)[]
  /** Height of the space above the plank. */
  height: number
  /** Bookend height, when the shelf ends in a bookend rather than a leaning book. */
  bookend?: number
}

export interface ShelfLayout {
  width: number
  scale: number
  padding: number
  plank: number
  shelves: Shelf[]
}

/**
 * Lay the collection out for a column `width` pixels wide.
 *
 * One continuous collection: each category starts with a divider and the books
 * follow it left to right, across as many shelves as it takes.
 */
export function layoutShelves(books: Book[], categories: readonly BookCategory[], width: number): ShelfLayout {
  const k = shelfScale(width)
  const padding = Math.round(14 * k)
  const inner = width - 2 * padding - 24
  const geometry = new Map(books.map((b) => [b.slug, spineGeometry(b, k)]))

  const items: ShelfItem[] = []
  for (const category of categories) {
    const inCategory = books.filter((b) => b.category === category)
    if (!inCategory.length) continue
    const height = geometry.get(inCategory[0].slug)!.height
    const lines = dividerLines(category, height, k)
    const width = DIVIDER_WIDTH + (lines.length - 1) * DIVIDER_LINE
    items.push({ kind: 'divider', category, lines, height, width, gap: DIVIDER_GAP })
    inCategory.forEach((book, i) =>
      items.push({ kind: 'book', book, width: geometry.get(book.slug)!.width, gap: i ? 0 : FIRST_BOOK_GAP })
    )
  }

  const rows = packBalanced(items, inner)
  for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i]
    const next = rows[i + 1]
    // A divider never ends a shelf.
    if (row[row.length - 1].kind === 'divider') next.unshift(row.pop()!)
    // No single book stranded before the next category's divider.
    if (next.length > 1 && next[0].kind === 'book' && next[1].kind === 'divider' && row.length > 2) {
      next.unshift(row.pop()!)
    }
  }

  const shelves: Shelf[] = rows.map((row, ri) => {
    const heights = row.flatMap((it) => (it.kind === 'book' ? [geometry.get(it.book.slug)!.height] : []))
    const tallest = Math.max(...heights, Math.round(200 * k))
    const isLast = ri === rows.length - 1

    // Where a shelf has room at its end, its last book leans on its neighbour
    // instead of standing against a bookend.
    let lean: { slug: string; degrees: number; offset: number } | undefined
    const lastItem = row[row.length - 1]
    const before = row[row.length - 2]
    if (!isLast && lastItem?.kind === 'book' && before?.kind === 'book') {
      const degrees = 3 + (hash(lastItem.book.slug) % 20) / 10
      const lower = Math.min(geometry.get(lastItem.book.slug)!.height, geometry.get(before.book.slug)!.height)
      const offset = Math.round(lower * Math.tan((degrees * Math.PI) / 180))
      if (inner - rowWidth(row) > offset + 8) lean = { slug: lastItem.book.slug, degrees: -degrees, offset }
    }

    const items = row.map((it, i): ShelfBook | ShelfDivider => {
      if (it.kind === 'book') {
        const g = geometry.get(it.book.slug)!
        return lean?.slug === it.book.slug
          ? { kind: 'book', book: it.book, geometry: g, lean: { degrees: lean.degrees, offset: lean.offset } }
          : { kind: 'book', book: it.book, geometry: g }
      }
      return { kind: 'divider', category: it.category, lines: it.lines, width: it.width, height: it.height, first: i === 0 }
    })

    return {
      items,
      height: Math.round(tallest + 12 * k),
      bookend: lean ? undefined : Math.round(Math.min(...heights) * 0.5),
    }
  })

  return { width, scale: k, padding, plank: Math.round(24 * Math.max(k, 0.86)), shelves }
}

/** The narrowest bucket a container of `width` pixels can show. */
export function bucketFor(width: number): number {
  return SHELF_BUCKETS.find((b) => b <= width) ?? SHELF_BUCKETS[SHELF_BUCKETS.length - 1]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}
