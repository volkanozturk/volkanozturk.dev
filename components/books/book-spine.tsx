import type { CSSProperties } from 'react'
import type { ShelfBook } from '@/lib/bookshelf'
import { formatAuthors } from '@/components/books/book-info'

/**
 * One spine on the shelf. It is a real link to the book's page, so it works
 * before any script runs; the shelf script turns a click into the extraction.
 */
export function BookSpine({ item }: { item: ShelfBook }) {
  const { book, geometry: g, lean } = item
  const s = book.spine
  const bandMark = Boolean(s.accent && s.accentPosition === 'bottom' && s.mark)
  const style = {
    '--bw': `${g.width}px`,
    '--bh': `${g.height}px`,
    '--bg': s.background,
    '--fg': s.color,
    '--ac': s.accent ?? 'transparent',
    '--fs': `${g.fontSize}px`,
    '--pt': `${g.paddingTop}px`,
    '--pb': `${g.paddingBottom}px`,
    ...(lean ? { '--lean': `${lean.degrees}deg`, marginLeft: `${lean.offset}px` } : {}),
  } as CSSProperties

  return (
    <a
      className="bk-book"
      href={`/books/${book.slug}/`}
      data-slug={book.slug}
      data-binding={book.binding === 'Hardcover' ? 'hc' : 'pb'}
      data-lean={lean ? lean.degrees : undefined}
      style={style}
      aria-label={`${book.title} by ${formatAuthors(book.authors)}`}
    >
      <span
        className={`bk-spine bk-f-${s.font}`}
        data-dir={s.direction === 'bottom-to-top' ? 'btt' : undefined}
        aria-hidden="true"
      >
        {s.accent && (
          <span className="bk-acc" data-pos={s.accentPosition ?? 'top'}>
            {bandMark && (
              <span className="bk-pm" style={{ color: s.markColor }}>
                {s.mark}
              </span>
            )}
          </span>
        )}
        <span className="bk-tt" data-lines={s.title.length > 1 ? 2 : undefined} style={{ fontWeight: s.weight }}>
          {s.title.map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
          {s.subtitle && (
            <span className="bk-sub" style={{ color: s.subtitleColor }}>
              {s.subtitle}
            </span>
          )}
        </span>
        {g.showAuthor && (
          <span className="bk-sa" style={{ color: s.authorColor }}>
            {s.author}
          </span>
        )}
        {s.mark && !bandMark && g.showMark && (
          <span className="bk-pm" style={{ color: s.markColor }}>
            {s.mark}
          </span>
        )}
      </span>
    </a>
  )
}
