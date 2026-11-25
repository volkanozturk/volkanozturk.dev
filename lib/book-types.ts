/**
 * The Books content model.
 *
 * Content lives in `content/books.ts`; everything the shelf and the detail
 * pages draw is derived from it. Nothing here imports at runtime, so the data
 * and the pure layout code can also be loaded by the Node test runner.
 */

/** Shelf order. Categories appear on the shelf in this order, left to right. */
export const BOOK_CATEGORIES = [
  'Software Engineering',
  'Java & Programming',
  'Architecture & Systems',
  'Business, Culture & Communication',
  'History, Psychology & Science',
] as const

export type BookCategory = (typeof BOOK_CATEGORIES)[number]

export type Binding = 'Hardcover' | 'Paperback'

/**
 * Where an image came from.
 *
 * - `publisher-cover`: the publisher's own artwork for this edition (from the
 *   publisher, its distribution platform, or a catalogue that reproduces it).
 * - `spine-photograph`: a photograph of the owner's own copy.
 * - `reconstructed-spine`: drawn in CSS from the edition's cover and the
 *   publisher's spine design, because no usable spine image exists.
 * - `unverified`: an image whose edition could not be confirmed.
 */
export type AssetProvenance =
  | 'publisher-cover'
  | 'spine-photograph'
  | 'reconstructed-spine'
  | 'unverified'

export interface CoverAsset {
  /** Path under `public/`, e.g. `/images/books/covers/clean-code.webp`. */
  src: string
  provenance: AssetProvenance
  /** Where the file was obtained, in words a reviewer can follow up. */
  source: string
  /** Set when the image is known to differ from the printed copy in some way. */
  note?: string
}

/**
 * A spine drawn in CSS. Colours are taken from the edition's cover and the
 * publisher's spine conventions; nothing is filtered or recoloured per theme.
 */
export interface SpineDesign {
  background: string
  color: string
  font: 'sans' | 'serif' | 'condensed'
  weight: number
  /** The spine title. Each entry is one line across the spine. */
  title: string[]
  /** A smaller line under the title, such as an edition. */
  subtitle?: string
  subtitleColor?: string
  /** The author as the spine prints it, usually surnames. */
  author: string
  authorColor?: string
  /** Publisher or series mark, as plain text. */
  mark?: string
  markColor?: string
  /** A band of colour across the top or bottom of the spine. */
  accent?: string
  accentPosition?: 'top' | 'bottom'
  /**
   * `top-to-bottom` is the English-language convention; British and most
   * European publishers print `bottom-to-top`.
   */
  direction: 'top-to-bottom' | 'bottom-to-top'
  provenance: AssetProvenance
  /** What the reconstruction was based on. */
  source: string
}

/** Physical size in millimetres. */
export interface BookDimensions {
  height: number
  width: number
  thickness: number
  /**
   * `publisher`: height, width and thickness from the publisher or a retailer
   * listing of this edition. `trim`: height and width are the publisher's trim
   * size for this edition; thickness is approximated from the page count.
   */
  source: 'publisher' | 'trim'
}

export interface Book {
  slug: string
  title: string
  subtitle?: string
  authors: string[]
  category: BookCategory
  /** ISBN-13 of the edition on the shelf. Absent only when none exists. */
  isbn?: string
  edition: string
  /** ISO 639-1 code of the copy on the shelf. */
  language: 'en' | 'tr'
  publisher: string
  /** Year this edition was published. */
  year: number
  pages?: number
  binding: Binding
  dimensions: BookDimensions
  cover: CoverAsset
  spine: SpineDesign
  /** One or two factual sentences about the book. No opinions. */
  description: string
  /**
   * Optional fields. They stay empty until there is something true to say,
   * and empty fields render nothing.
   */
  readingStatus?: 'reading' | 'read' | 'to-read'
  notes?: string
  /** Slugs of posts under `content/posts` that are genuinely about this book. */
  relatedPosts?: string[]
}
