import { BOOK_CATEGORIES, getAllBooks, toBookView } from '@/lib/books'
import { SHELF_BUCKETS, layoutShelves, type ShelfLayout } from '@/lib/bookshelf'
import { BookSpine } from '@/components/books/book-spine'
import { ShelfController } from '@/components/books/shelf-controller'

/**
 * Container queries that show exactly one packed layout: the widest whose
 * column fits. Generated from `SHELF_BUCKETS` so the two never disagree.
 */
function bucketCss(): string {
  return SHELF_BUCKETS.map((w, i) => {
    const wider = SHELF_BUCKETS[i - 1]
    const isLast = i === SHELF_BUCKETS.length - 1
    const conditions = [
      isLast ? null : `(min-width: ${w}px)`,
      wider ? `(max-width: ${wider - 0.02}px)` : null,
    ].filter(Boolean)
    return `@container ${conditions.join(' and ')} { .bk-layout[data-w="${w}"] { display: block } }`
  }).join('\n')
}

function Lines({ lines }: { lines: string[] }) {
  // The space keeps the heading's text whole ("Culture & Communication");
  // in the flex column it takes no room.
  return lines.map((line, i) => (
    <span key={i}>
      {i > 0 ? ' ' : ''}
      {line}
    </span>
  ))
}

function Layout({ layout }: { layout: ShelfLayout }) {
  return (
    <div className="bk-layout" data-w={layout.width}>
      {layout.shelves.map((shelf, ri) => (
        <div
          className="bk-row"
          data-row={ri}
          data-scaled={layout.scale < 1 || undefined}
          key={ri}
          style={{ '--plank': `${layout.plank}px`, '--k': layout.scale } as React.CSSProperties}
        >
          <div className="bk-stand" style={{ height: shelf.height, padding: `0 ${layout.padding}px` }}>
            {shelf.items.map((item) =>
              item.kind === 'book' ? (
                <BookSpine item={item} key={item.book.slug} />
              ) : (
                <div
                  className="bk-div"
                  style={{ height: item.height, width: item.width, marginLeft: item.before, marginRight: item.after }}
                  key={item.category}
                >
                  <h2 className="bk-div-label">
                    <Lines lines={item.lines} />
                  </h2>
                </div>
              )
            )}
            {shelf.bookend !== undefined && <span className="bk-end" aria-hidden="true" style={{ height: shelf.bookend }} />}
          </div>
          <div className="bk-plank" aria-hidden="true" />
          <div className="bk-cap" aria-hidden="true">
            <span />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The library. Every layout is packed at build time; CSS picks the one that
 * fits, and the controller adds the interaction on top.
 */
export function Bookshelf() {
  const books = getAllBooks()
  const layouts = SHELF_BUCKETS.map((w) => layoutShelves(books, BOOK_CATEGORIES, w))
  return (
    <div className="bk-shelf">
      <style>{bucketCss()}</style>
      <ShelfController books={books.map(toBookView)}>
        {layouts.map((layout) => (
          <Layout layout={layout} key={layout.width} />
        ))}
      </ShelfController>
    </div>
  )
}
