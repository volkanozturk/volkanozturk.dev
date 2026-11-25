import Image from 'next/image'
import { BOOK_CATEGORIES, getAllBooks, toBookView } from '@/lib/books'
import { SHELF_BUCKETS, layoutShelves, type ShelfBook, type ShelfLayout } from '@/lib/bookshelf'
import { formatAuthors } from '@/components/books/book-info'
import { BookSpine } from '@/components/books/book-spine'
import { ShelfController } from '@/components/books/shelf-controller'
import type { BookCategory } from '@/lib/book-types'

const DESKTOP_WIDTH = 696
const widths = SHELF_BUCKETS.filter((width) => width <= DESKTOP_WIDTH)

function bucketCss(): string {
  return widths.map((width, index) => {
    const wider = widths[index - 1]
    const conditions = [
      index === widths.length - 1 ? null : `(min-width: ${width}px)`,
      wider ? `(width < ${wider}px)` : null,
    ].filter(Boolean)
    return `@container ${conditions.join(' and ')} { .bk-layout[data-w="${width}"] { display: block } }`
  }).join('\n')
}

function Layout({ layout }: { layout: ShelfLayout }) {
  return (
    <div className="bk-layout" data-w={layout.width}>
      <div className="bk-tracks" aria-hidden="true"><span /><span /><span /></div>
      {layout.shelves.map((shelf, index) => {
        const groups: { label?: BookCategory; books: ShelfBook[] }[] = []
        for (const item of shelf.items) {
          if (item.kind === 'divider') groups.push({ label: item.category, books: [] })
          else {
            if (!groups.length) groups.push({ books: [] })
            groups[groups.length - 1].books.push(item)
          }
        }

        return (
          <div className="bk-row" key={index} style={layout.width === DESKTOP_WIDTH ? undefined : { minHeight: shelf.height + 44 }}>
            <div className="bk-deck" aria-hidden="true"><span /><span /></div>
            {groups.map(({ label, books }) => (
              <div className="bk-group" key={books[0].book.slug}>
                {label && <h2 className="bk-label">{label}</h2>}
                <div className="bk-stand">
                  {books.map((item) => <BookSpine item={item} key={item.book.slug} />)}
                  {!books.at(-1)?.lean && <span className="bk-end" aria-hidden="true" />}
                </div>
              </div>
            ))}
            <div className="bk-cap" aria-hidden="true"><span /></div>
          </div>
        )
      })}
    </div>
  )
}

export function Bookshelf() {
  const catalog = getAllBooks()
  const books = catalog.map(toBookView)
  return (
    <div className="bk-shelf">
      <style>{bucketCss()}</style>
      <ShelfController
        books={books}
        shelf={widths.map((width) => (
          <Layout key={width} layout={layoutShelves(catalog, BOOK_CATEGORIES, width)} />
        ))}
        list={(
          <div className="bk-list">
            {BOOK_CATEGORIES.map((category) => (
              <section className="bk-list-group" key={category}>
                <h2>{category}</h2>
                <ul>
                  {books.filter((book) => book.category === category).map((book) => (
                    <li key={book.slug}>
                      <a className="bk-entry" data-slug={book.slug} href={`/books/${book.slug}/`}>
                        <Image src={book.cover.src} alt="" width={book.cover.width} height={book.cover.height} />
                        <span>
                          <strong lang={book.language === 'en' ? undefined : book.language}>{book.title}</strong>
                          <small>{formatAuthors(book.authors)}</small>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      />
    </div>
  )
}
