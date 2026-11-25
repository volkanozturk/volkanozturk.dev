import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllBooks, getBookBySlug, getBookNeighbours, toBookView } from '@/lib/books'
import { BookCover, BookInfo, formatAuthors } from '@/components/books/book-info'

/**
 * Every book has its own static page, so a link to a book works on its own:
 * no shelf, no animation, just the book. On the shelf the same URL opens the
 * book in a dialog instead.
 */
export function generateStaticParams() {
  return getAllBooks().map((book) => ({ slug: book.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) return { title: 'Book not found' }
  const title = `${book.title} by ${formatAuthors(book.authors)}`
  return {
    title,
    description: book.description,
    alternates: { canonical: `/books/${slug}` },
    openGraph: {
      title,
      description: book.description,
      url: `/books/${slug}`,
      type: 'book',
      images: [{ url: book.cover.src, alt: `Front cover of ${book.title}` }],
    },
    twitter: { card: 'summary' },
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()
  const view = toBookView(book)
  const { previous, next } = getBookNeighbours(slug)

  return (
    <article className="space-y-10">
      <Link
        href="/books"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Books
      </Link>

      <div className="bk-page">
        <div>
          <BookCover book={view} priority />
        </div>
        <div>
          <BookInfo book={view} titleAs="h1" />
        </div>
      </div>

      {(previous || next) && (
        <nav aria-label="Neighbouring books" className="flex justify-between gap-4 border-t border-border pt-4 text-sm">
          {previous ? (
            <Link href={`/books/${previous.slug}`} className="bk-btn" rel="prev">
              <ChevronLeft className="h-4 w-4 flex-none" aria-hidden="true" />
              <span>{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/books/${next.slug}`} className="bk-btn text-right" rel="next">
              <span>{next.title}</span>
              <ChevronRight className="h-4 w-4 flex-none" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  )
}
