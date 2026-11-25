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

/**
 * Category dividers. Each category starts with a divider card standing among
 * the books; a shelf that opens in the middle of a category starts with a
 * smaller continuation card. Sizes are at full scale.
 */
const DIVIDER = { gap: 20, after: 8 }
const CONTINUATION = { after: 6 }
const FIRST_BOOK_GAP = DIVIDER.after

/**
 * Card label type, which stays readable rather than scaling with the shelf:
 * divider 12.5px / 600 (11.5px on scaled shelves), continuation 10.5px / 500
 * (10px). `char` is the average advance per character; `line` the width each
 * line of text adds to the card; `base` the card's width with one line.
 */
export const LABEL_TYPE = {
  divider: { full: { size: 12.5, char: 7.0, line: 15, base: 22 }, scaled: { size: 11.5, char: 6.45, line: 14, base: 20 } },
  // Continuation cards are lettered exactly like the divider they repeat.
  continuation: { full: { size: 12.5, char: 7.0, line: 15, base: 22 }, scaled: { size: 11.5, char: 6.45, line: 14, base: 20 } },
} as const

/**
 * A label in as many lines as it needs to fit `room` pixels along the card.
 * Lines break between words, as evenly as possible.
 */
export function labelLines(label: string, room: number, charWidth: number): string[] {
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

/**
 * Room along a card for its label: the card's height less the tab and the
 * bottom inset. Divider and continuation cards share both.
 */
export function labelRoom(height: number, continued: boolean, k: number): number {
  return height - 24 * k
}

export interface CategoryCard {
  lines: string[]
  width: number
  height: number
}

/** The divider card that opens a category, beside a first book `bookHeight` tall. */
export function dividerCard(category: string, bookHeight: number, k: number): CategoryCard {
  const t = LABEL_TYPE.divider[k < 1 ? 'scaled' : 'full']
  const height = Math.round(bookHeight + 6 * k)
  const lines = labelLines(category, labelRoom(height, false, k), t.char)
  return { lines, height, width: t.base + (lines.length - 1) * t.line }
}

/** The smaller card that marks a category carried over from the shelf above. */
export function continuationCard(category: string, bookHeight: number, k: number): CategoryCard {
  const t = LABEL_TYPE.continuation[k < 1 ? 'scaled' : 'full']
  const height = Math.round(bookHeight * 0.8)
  const lines = labelLines(category, labelRoom(height, true, k), t.char)
  return { lines, height, width: t.base + (lines.length - 1) * t.line }
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
  /** Whether the author and the publisher mark have room to be printed. */
  showAuthor: boolean
  showMark: boolean
}

/** Approximate advance width of one character, as a fraction of the font size. */
const CHAR_WIDTH = { sans: 0.56, serif: 0.5, condensed: 0.44 } as const
/** Below this a title is not worth squeezing; the smaller lines give way first. */
const READABLE = 8

/**
 * Size of a spine and the type on it. 1mm of the real book is 1px at full
 * scale, and the spine is never widened for its text. The title is set as
 * large as the spine allows, across and along; when the title would fall
 * below a readable size, the publisher mark gives way first and then the
 * author, as on real narrow spines. On the client the shelf only ever
 * shrinks a title further if a font measures wider.
 */
export function spineGeometry(book: Book, k: number): SpineGeometry {
  const s = book.spine
  const width = Math.max(9, Math.round(book.dimensions.thickness * k))
  const height = Math.round(book.dimensions.height * k)
  const band = height * 0.11
  const paddingTop = s.accent && s.accentPosition === 'top' ? band + width * 0.3 : width * 0.5
  const paddingBottom = s.accent && s.accentPosition === 'bottom' ? band + width * 0.3 : width * 0.42
  const markInBand = Boolean(s.accent && s.accentPosition === 'bottom')

  // Across the spine: every line of the title, plus a subtitle line, must fit.
  const across = (width * 0.8) / ((s.title.length + (s.subtitle ? 0.62 : 0)) * 1.04)
  const longest = Math.max(...s.title.map((line) => line.length))
  const cw = CHAR_WIDTH[s.font]

  const sizeWith = (author: boolean, mark: boolean) => {
    const authorShare = author ? s.author.length * 0.7 : 0
    const markShare = mark && !markInBand && s.mark ? s.mark.length * 0.48 : 0
    const parts = 1 + (author ? 1 : 0) + (markShare ? 1 : 0)
    const available = height - paddingTop - paddingBottom - width * 0.22 * (parts - 1)
    return Math.min(across, 15, available / ((longest + authorShare + markShare) * cw))
  }

  let showAuthor = true
  let showMark = Boolean(s.mark)
  let fontSize = sizeWith(showAuthor, showMark)
  if (fontSize < READABLE && showMark && !markInBand) {
    showMark = false
    fontSize = sizeWith(showAuthor, showMark)
  }
  if (fontSize < READABLE - 1 && sizeWith(false, showMark) > fontSize + 1) {
    showAuthor = false
    fontSize = sizeWith(showAuthor, showMark)
  }

  return {
    width,
    height,
    fontSize: round1(Math.max(5.5, fontSize)),
    paddingTop: round1(paddingTop),
    paddingBottom: round1(paddingBottom),
    showAuthor,
    showMark,
  }
}

export type ShelfItem =
  | { kind: 'divider'; category: BookCategory; card: CategoryCard; width: number; gap: number; keepWithNext: true }
  | { kind: 'book'; book: Book; width: number; gap: number; lead: number }

type Packable = { width: number; gap: number; lead?: number; keepWithNext?: boolean }

/**
 * Greedy packing into rows no wider than `width`. An item's `lead` is extra
 * room it needs when it opens a row (a book opening a shelf mid-category is
 * preceded by a continuation card).
 */
export function pack<T extends Packable>(items: T[], width: number): T[][] {
  const rows: T[][] = []
  let row: T[] = []
  let used = 0
  items.forEach((item, i) => {
    let add = (row.length ? item.gap : 0) + item.width
    // A divider only starts where its first book fits beside it.
    const next = items[i + 1]
    if (item.keepWithNext && next) add += next.gap + next.width
    if (row.length && used + add > width) {
      rows.push(row)
      row = []
      used = 0
    }
    used += row.length ? item.gap + item.width : (item.lead ?? 0) + item.width
    row.push(item)
  })
  if (row.length) rows.push(row)
  return rows
}

/**
 * The fewest shelves the width allows, each filled to a similar length, so no
 * shelf ends in a long empty run while the next one is crowded.
 */
export function packBalanced<T extends Packable>(items: T[], width: number): T[][] {
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

export function rowWidth(row: Packable[]): number {
  return row.reduce((sum, it, i) => sum + it.width + (i ? it.gap : (it.lead ?? 0)), 0)
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
  /** The label, broken into lines when it is longer than the card. */
  lines: string[]
  width: number
  /** The card stands a little taller than the book after it. */
  height: number
  first: boolean
  /** A continuation card: the category carries over from the shelf above. */
  continued: boolean
  /** Space before and after the card, in pixels. */
  before: number
  after: number
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
  const continuation = new Map<string, CategoryCard>()
  for (const category of categories) {
    const inCategory = books.filter((b) => b.category === category)
    if (!inCategory.length) continue
    const card = dividerCard(category, geometry.get(inCategory[0].slug)!.height, k)
    items.push({ kind: 'divider', category, card, width: card.width, gap: Math.round(DIVIDER.gap * k), keepWithNext: true })
    inCategory.forEach((book, i) => {
      const g = geometry.get(book.slug)!
      const cont = continuationCard(category, g.height, k)
      continuation.set(book.slug, cont)
      items.push({
        kind: 'book',
        book,
        width: g.width,
        gap: i ? 0 : Math.round(FIRST_BOOK_GAP * k),
        lead: i ? cont.width + Math.round(CONTINUATION.after * k) : 0,
      })
    })
  }

  const rows = packBalanced(items, inner)
  const fits = (row: ShelfItem[]) => rowWidth(row) <= inner
  for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i]
    const next = rows[i + 1]
    // No single book stranded before the next category's divider.
    if (next.length > 1 && next[0].kind === 'book' && next[1].kind === 'divider' && row.length > 2) {
      const moved = row.pop()!
      if (fits([moved, ...next])) next.unshift(moved)
      else row.push(moved)
    }
  }

  const shelves: Shelf[] = rows.map((row, ri) => {
    const heights = row.flatMap((it) => (it.kind === 'book' ? [geometry.get(it.book.slug)!.height] : []))
    const cards = row.flatMap((it) => (it.kind === 'divider' ? [it.card.height] : []))
    const tallest = Math.max(...heights, ...cards, Math.round(200 * k))
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
      const { lines, width, height } = it.card
      return {
        kind: 'divider',
        category: it.category,
        lines,
        width,
        height,
        first: i === 0,
        continued: false,
        before: i === 0 ? 0 : it.gap,
        after: Math.round(FIRST_BOOK_GAP * k),
      }
    })
    // A shelf that opens mid-category starts with a continuation card.
    const opener = row[0]
    if (opener.kind === 'book' && opener.lead) {
      const { lines, width, height } = continuation.get(opener.book.slug)!
      items.unshift({
        kind: 'divider',
        category: opener.book.category,
        lines,
        width,
        height,
        first: true,
        continued: true,
        before: 0,
        after: Math.round(CONTINUATION.after * k),
      })
    }

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
