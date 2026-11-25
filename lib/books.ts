import fs from 'node:fs'
import path from 'node:path'
import { books as content } from '@/content/books'
import { BOOK_CATEGORIES, type Book, type BookCategory } from '@/lib/book-types'
import { validateBooks } from '@/lib/book-validation'
import { getAllPosts } from '@/lib/posts'
import { getImageSize } from '@/lib/image-size'

export { BOOK_CATEGORIES }
export type { Book, BookCategory }

let checked = false

/**
 * Fails the build, naming the book, when the collection is invalid or a cover
 * file is missing — the same way `lib/posts.ts` rejects bad frontmatter.
 */
function check(): void {
  if (checked) return
  const posts = new Set(getAllPosts().map((p) => p.slug))
  const problems = validateBooks(content, posts)
  for (const b of content) {
    const file = path.join(process.cwd(), 'public', b.cover.src)
    if (!fs.existsSync(file)) problems.push(`book "${b.slug}": cover file ${b.cover.src} does not exist`)
  }
  if (problems.length) throw new Error(`[content] books:\n  ${problems.join('\n  ')}`)
  checked = true
}

/** Every book in shelf order: by category, then as listed in the content file. */
export function getAllBooks(): Book[] {
  check()
  return BOOK_CATEGORIES.flatMap((c) => content.filter((b) => b.category === c))
}

export function getBookBySlug(slug: string): Book | undefined {
  return getAllBooks().find((b) => b.slug === slug)
}

/** The books either side of `slug` on the shelf. */
export function getBookNeighbours(slug: string): { previous?: Book; next?: Book } {
  const all = getAllBooks()
  const i = all.findIndex((b) => b.slug === slug)
  if (i < 0) return {}
  return { previous: all[i - 1], next: all[i + 1] }
}

/** Titles of the posts a book links to, resolved for display. */
export function getRelatedPosts(book: Book): { slug: string; title: string }[] {
  if (!book.relatedPosts?.length) return []
  const posts = getAllPosts()
  return book.relatedPosts.flatMap((slug) => {
    const post = posts.find((p) => p.slug === slug)
    return post ? [{ slug, title: post.title }] : []
  })
}

/** Everything the detail view shows, flattened for the client and the book page. */
export interface BookView {
  slug: string
  title: string
  subtitle?: string
  authors: string[]
  category: BookCategory
  edition: string
  publisher: string
  year: number
  pages?: number
  binding: Book['binding']
  isbn?: string
  language: Book['language']
  description: string
  notes?: string
  readingStatus?: Book['readingStatus']
  cover: { src: string; width: number; height: number }
  related: { slug: string; title: string }[]
}

export function toBookView(book: Book): BookView {
  const size = getImageSize(book.cover.src)
  return {
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors,
    category: book.category,
    edition: book.edition,
    publisher: book.publisher,
    year: book.year,
    pages: book.pages,
    binding: book.binding,
    isbn: book.isbn,
    language: book.language,
    description: book.description,
    notes: book.notes,
    readingStatus: book.readingStatus,
    cover: { src: book.cover.src, width: size.width, height: size.height },
    related: getRelatedPosts(book),
  }
}
