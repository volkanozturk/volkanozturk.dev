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

function Layout({ layout }: { layout: ShelfLayout }) {
  return (
    <div className="bk-layout" data-w={layout.width}>
      {layout.shelves.map((shelf, ri) => (
        <div
          className="bk-row"
          data-row={ri}
          key={ri}
          style={{ '--plank': `${layout.plank}px`, '--div-fs': layout.scale < 1 ? '11px' : '12px' } as React.CSSProperties}
        >
          <div className="bk-stand" style={{ height: shelf.height, padding: `0 ${layout.padding}px` }}>
            {shelf.items.map((item) =>
              item.kind === 'book' ? (
                <BookSpine item={item} key={item.book.slug} />
              ) : (
                <div
                  className="bk-div"
                  data-first={item.first}
                  style={{ height: item.height, width: item.width }}
                  key={item.category}
                >
                  <h2 className="bk-div-label">
                    {item.lines.map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
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
