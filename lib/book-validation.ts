import { BOOK_CATEGORIES, type Book } from './book-types'

/** True when `isbn` is a 13-digit ISBN with a valid check digit. */
export function isValidIsbn13(isbn: string): boolean {
  if (!/^97[89]\d{10}$/.test(isbn)) return false
  const digits = [...isbn].map(Number)
  const sum = digits.slice(0, 12).reduce((acc, d, i) => acc + d * (i % 2 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === digits[12]
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const CURRENT_YEAR = new Date().getFullYear()

/**
 * Every problem with the collection, as readable messages. An empty list means
 * the content is valid. File existence is checked separately by the caller,
 * which has access to the file system.
 */
export function validateBooks(books: Book[], knownPostSlugs?: ReadonlySet<string>): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const seenIsbn = new Set<string>()

  for (const b of books) {
    const at = `book "${b.slug}"`
    if (!SLUG.test(b.slug)) problems.push(`${at}: slug must be lowercase words joined by hyphens`)
    if (seen.has(b.slug)) problems.push(`${at}: duplicate slug`)
    seen.add(b.slug)

    if (!b.title.trim()) problems.push(`${at}: title is empty`)
    if (!b.authors.length || b.authors.some((a) => !a.trim())) problems.push(`${at}: needs at least one author`)
    if (!(BOOK_CATEGORIES as readonly string[]).includes(b.category)) problems.push(`${at}: unknown category "${b.category}"`)
    if (b.isbn !== undefined) {
      if (!isValidIsbn13(b.isbn)) problems.push(`${at}: "${b.isbn}" is not a valid ISBN-13`)
      if (seenIsbn.has(b.isbn)) problems.push(`${at}: duplicate ISBN ${b.isbn}`)
      seenIsbn.add(b.isbn)
    }
    if (!Number.isInteger(b.year) || b.year < 1450 || b.year > CURRENT_YEAR + 1) problems.push(`${at}: implausible year ${b.year}`)
    if (b.pages !== undefined && (!Number.isInteger(b.pages) || b.pages <= 0)) problems.push(`${at}: pages must be a positive whole number`)

    const d = b.dimensions
    if (!(d.height >= 120 && d.height <= 320)) problems.push(`${at}: height ${d.height}mm is outside 120–320mm`)
    if (!(d.width >= 90 && d.width <= 260)) problems.push(`${at}: width ${d.width}mm is outside 90–260mm`)
    if (!(d.thickness >= 3 && d.thickness <= 90)) problems.push(`${at}: thickness ${d.thickness}mm is outside 3–90mm`)

    if (!b.cover.src.startsWith('/images/books/covers/') || !b.cover.src.endsWith('.webp')) {
      problems.push(`${at}: cover must be a .webp under /images/books/covers/`)
    }
    if (!b.cover.source.trim()) problems.push(`${at}: cover needs a source`)
    if (!b.spine.title.length || b.spine.title.some((t) => !t.trim())) problems.push(`${at}: spine title is empty`)
    if (!b.spine.source.trim()) problems.push(`${at}: spine needs a source`)
    for (const [name, value] of Object.entries({
      background: b.spine.background,
      color: b.spine.color,
      accent: b.spine.accent,
      authorColor: b.spine.authorColor,
      subtitleColor: b.spine.subtitleColor,
      markColor: b.spine.markColor,
    })) {
      if (value !== undefined && !/^#[0-9a-f]{6}$/i.test(value)) problems.push(`${at}: spine ${name} must be a #rrggbb colour`)
    }

    if (!b.description.trim()) problems.push(`${at}: description is empty`)
    if (b.notes !== undefined && !b.notes.trim()) problems.push(`${at}: notes is set but empty; leave it out instead`)
    for (const post of b.relatedPosts ?? []) {
      if (knownPostSlugs && !knownPostSlugs.has(post)) problems.push(`${at}: related post "${post}" does not exist`)
    }
  }
  return problems
}
