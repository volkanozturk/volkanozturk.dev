# Books

`/books/` is a personal library: the books on Volkan's shelf, drawn as spines on
light oak shelves. Clicking a spine takes the book out, turns it to show its
cover and opens its details; closing puts it back. Every book also has its own
static page at `/books/<slug>/`, which works without the shelf or any script.

## Where things live

| Path | Holds |
|---|---|
| `content/books.ts` | The books: one entry each, grouped by category, in shelf order |
| `lib/book-types.ts` | The content model (`Book`, `SpineDesign`, …) and the category order |
| `lib/book-validation.ts` | Checks run at build time and in the tests |
| `lib/books.ts` | Loading, ordering and the view model for the detail |
| `lib/bookshelf.ts` | Shelf layout: spine sizes, packing, dividers, leaning books |
| `components/books/` | The shelf, a spine, the detail content and the interaction |
| `app/books/` | The `/books/` page, the `/books/<slug>/` pages and `books.css` |
| `public/images/books/covers/<slug>.webp` | Cover images |
| `docs/book-provenance.md` | Where every image came from |
| `tests/books.test.mjs` | Content and layout tests (`npm test`) |

Nothing on the page is typed by hand: shelves, dividers, the detail dialog,
the book pages and the sitemap entries are all generated from `content/books.ts`.

## Add a book

1. **Identify the exact edition on the shelf.** Title, edition, publisher,
   year, ISBN-13, binding and page count, from the publisher or a catalogue
   (Open Library, the publisher's page). If the copy is a translation, use the
   original-language edition unless the book should stay in its own language.
   Do not guess: leave `pages` out rather than invent it.
2. **Get the cover of that edition.** Publisher artwork only, never a
   generated or redrawn image. Save it as WebP at most 600px wide, quality
   about 82, as `public/images/books/covers/<slug>.webp`. Do not recolour,
   stretch or crop the artwork (cropping a product photograph to the cover's
   edges is fine).
3. **Add the entry** to `content/books.ts`, inside its category, where it
   should stand on the shelf. Required fields are checked at build time:
   - `slug`: lowercase words joined by hyphens; it becomes the URL.
   - `dimensions`: height and width in millimetres from the publisher's trim
     size; thickness from the listing, or estimated from the page count
     (about 0.055 mm per page for ordinary paper) with `source: 'trim'`.
   - `spine`: the spine as printed: background and text colours sampled from
     the cover, `font` (`sans`, `serif`, `condensed`), the spine title, author
     and publisher mark, an optional accent band, and `direction`
     (`top-to-bottom` for US/UK English publishers, `bottom-to-top` for most
     European ones). Use a photograph of the spine when there is one.
   - `description`: one or two factual sentences. No opinions or ratings.
   - Leave `readingStatus`, `notes` and `relatedPosts` out until there is
     something true to put there; empty fields show nothing.
4. **Record the images** in `docs/book-provenance.md`: a row for the cover
   (source, size) and, if the spine is a photograph, that too.
5. Run `npm test`, `npm run lint`, `npx tsc --noEmit` and `npm run build`, then
   look at `/books/` at desktop and phone widths in both themes. The tests
   check the count per category; update them when the collection changes.

## Update a book

Edit its entry in `content/books.ts`. If the edition changes, replace the cover
file (same name) and update its row in `docs/book-provenance.md`. Changing a
`slug` changes the book's URL; avoid it once published.

## Remove a book

Delete its entry from `content/books.ts`, its file from
`public/images/books/covers/`, and its row from `docs/book-provenance.md`. The
tests fail if a cover file is left behind with no book.

## Categories

The five categories and their order are `BOOK_CATEGORIES` in
`lib/book-types.ts`. A category with no books is skipped on the shelf. Adding a
category means adding it there; every book must use one of them.

## How the shelf is laid out

The shelf is packed at build time for a set of column widths
(`SHELF_BUCKETS` in `lib/bookshelf.ts`), and a container query shows the one
that fits. The HTML therefore arrives with every shelf already in place: there
is no measuring in the browser and nothing moves after load.

- 1 mm of a book is 1 px at full size; shelves scale to 86% below 640px and 74%
  below 420px, so a phone still shows several books per shelf.
- Rows are balanced: the fewest shelves the width allows, each filled evenly.
- A divider never ends a shelf, and no single book is left before the next
  category's divider.
- Where a shelf has room at its end, its last book leans 3–5° on its neighbour
  (always the same angle for the same book); otherwise the shelf ends with a
  bookend.
- Each category starts with a divider card: a paper guide card slightly
  taller than the first book, with a burnt-orange tab at the top and the
  category name reading bottom to top (12.5px / 600, 11.5px when scaled). The
  card is never narrower than its label: a long name breaks onto a second
  line rather than being cut, and the card widens by one line.
- A category that runs onto the next shelf repeats a shorter continuation
  card at the start of that shelf (thin tab, muted ink, 10.5px / 500). It is
  decorative (`aria-hidden`); the category heading is the first card only.
- Spine type is fitted to the real spine: the font may grow to 80% of the
  spine's thickness (capped at 15px), but the book is never widened. On spines
  thinner than about 8px the publisher mark is dropped, and the author too if
  that is what it takes to keep the title readable. Every book's full title
  and authors appear in the caption on hover and focus, so nothing is lost on
  a thin spine.

## Interaction

- Hover (mouse) lifts a spine slightly and shows its title and authors under
  the shelf. Focus does the same.
- Click, tap, Enter or Space takes the book out: it lifts, turns to show its
  cover and settles in a dialog, leaving its gap on the shelf. The URL becomes
  `/books/<slug>/`, so the browser's back button closes the dialog and a
  reload opens the book's page.
- In the dialog: arrow keys or the buttons move to the neighbouring books,
  Escape or the close button puts the book back and returns focus to it.
- On the shelf the arrow keys move between books (Up and Down move between
  shelves), and the shelf is a single tab stop.
- With reduced motion the book is not animated: the dialog simply appears.
