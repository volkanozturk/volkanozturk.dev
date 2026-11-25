import Link from 'next/link'
import type { BookView } from '@/lib/books'

const LANGUAGE = { en: 'English', tr: 'Turkish' } as const
const STATUS = { reading: 'Reading', read: 'Read', 'to-read': 'To read' } as const

/** Joins names as they read in prose: "A", "A and B", "A, B and C". */
export function formatAuthors(authors: string[]): string {
  if (authors.length < 3) return authors.join(' and ')
  return `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`
}

/**
 * The facts about one book. Shared by the dialog on the shelf and the book's
 * own page, so both say the same thing. Optional fields render nothing at all
 * when they are empty.
 */
export function BookInfo({
  book,
  titleId,
  titleAs: Title = 'h2',
}: {
  book: BookView
  titleId?: string
  titleAs?: 'h1' | 'h2'
}) {
  const format = [book.binding, book.pages ? `${book.pages} pages` : null].filter(Boolean).join(' · ')
  return (
    <>
      <p className="bk-d-cat">{book.category}</p>
      <Title className="bk-d-title" id={titleId} lang={book.language === 'en' ? undefined : book.language}>
        {book.title}
      </Title>
      {book.subtitle && (
        <p className="bk-d-sub" lang={book.language === 'en' ? undefined : book.language}>
          {book.subtitle}
        </p>
      )}
      <p className="bk-d-authors">{formatAuthors(book.authors)}</p>

      <p className="bk-d-desc">{book.description}</p>

      <dl className="bk-meta">
        <dt>Edition</dt>
        <dd>{book.edition}</dd>
        <dt>Publisher</dt>
        <dd>{book.publisher}</dd>
        <dt>Published</dt>
        <dd>{book.year}</dd>
        <dt>Format</dt>
        <dd>{format}</dd>
        {book.language !== 'en' && (
          <>
            <dt>Language</dt>
            <dd>{LANGUAGE[book.language]}</dd>
          </>
        )}
        {book.isbn && (
          <>
            <dt>ISBN</dt>
            <dd className="tabular-nums">{book.isbn}</dd>
          </>
        )}
        {book.readingStatus && (
          <>
            <dt>Status</dt>
            <dd>{STATUS[book.readingStatus]}</dd>
          </>
        )}
      </dl>

      {book.notes && (
        <section className="bk-d-section">
          <h3>Notes</h3>
          <p>{book.notes}</p>
        </section>
      )}

      {book.related.length > 0 && (
        <section className="bk-d-section">
          <h3>Related writing</h3>
          <ul className="bk-rel">
            {book.related.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

/** The front cover with the binding's hinge drawn over it. */
export function BookCover({
  book,
  priority = false,
  ref,
}: {
  book: BookView
  priority?: boolean
  ref?: React.Ref<HTMLSpanElement>
}) {
  return (
    <span className="bk-covw" ref={ref}>
      {/* A plain <img>: images are unoptimised in the static export, and the
          intrinsic size reserves the box so nothing shifts while it loads. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="bk-cov"
        src={book.cover.src}
        width={book.cover.width}
        height={book.cover.height}
        alt={`Front cover of ${book.title}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
      />
    </span>
  )
}
