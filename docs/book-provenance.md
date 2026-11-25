# Book image provenance

Where every image on the Books shelf came from, and the terms it is used under.
Keep this file in step with `content/books.ts`: the test suite fails when a
book is missing from it.

## Summary

| | Count |
|---|---|
| Books | 35 |
| Covers: publisher artwork for the edition on the shelf | 34 |
| Covers: publisher artwork of the same edition's US printing | 1 (Modern Operating Systems) |
| Spines: photographs of the owner's copies | 0 |
| Spines: reconstructed in CSS | 35 |
| Unverified or unavailable | 0 |
| Total size of the cover files | 1397 KB |

## Usage rights

Covers are the publishers' artwork, shown at modest size to identify a book in
a personal collection, with the book's title, authors and publisher named
beside it. They are not altered: no recolouring, no inversion in dark mode, no
stretching. They were resized only (longest side at most 600px for 2× screens)
and re-encoded as WebP. Rights remain with the publishers; remove a cover on
request.

## Spines

No usable photograph of a spine was available when the shelf was built, so
every spine is **reconstructed**: drawn in CSS (`components/books/book-spine.tsx`)
from the edition's cover colours, type and the publisher's spine conventions
(series marks, accent bands, title direction). The design of each spine is in
the `spine` field of its entry in `content/books.ts`. When a photograph of a
spine becomes available, record it here as `spine-photograph` and use it in
place of the reconstruction.

## Covers

| Book | ISBN | Edition | Source | File |
|---|---|---|---|---|
| `clean-code` | 9780132350884 | First edition | Open Library cover scan of this ISBN | 563×751, 26 KB |
| `the-clean-coder` | 9780137081073 | First edition | Open Library cover scan of this ISBN | 600×784, 49 KB |
| `the-pragmatic-programmer` | 9780135957059 | 20th Anniversary Edition (second edition) | O’Reilly Learning catalogue cover for this edition | 600×782, 117 KB |
| `refactoring` | 9780134757599 | Second edition | O’Reilly Learning catalogue cover for this edition | 600×744, 35 KB |
| `head-first-design-patterns` | 9781492078005 | Second edition | O’Reilly Learning catalogue cover for this edition | 600×694, 44 KB |
| `building-maintainable-software` | 9781491953525 | Java edition | O’Reilly Learning catalogue cover for this edition | 600×788, 50 KB |
| `grokking-algorithms` | 9781633438538 | Second edition | O’Reilly Learning catalogue cover for this edition | 600×752, 98 KB |
| `root-cause` | 9798295873560 | First edition | Author’s cover artwork as reproduced by a third-party book listing (system-design.space) | 600×954, 26 KB |
| `head-first-java` | 9781491910771 | Third edition | O’Reilly Learning catalogue cover for this edition | 600×694, 35 KB |
| `ocp-java-se-21-developer-study-guide` | 9781394286614 | First edition | O’Reilly Learning catalogue cover for this edition | 600×752, 34 KB |
| `java-coding-problems` | 9781837633944 | Second edition | Packt Publishing catalogue cover for this edition (the published cover, without the earlier “Early Access” badge). | 600×741, 43 KB |
| `functional-programming-in-java` | 9781680509793 | Second edition | O’Reilly Learning catalogue cover for this edition | 600×720, 31 KB |
| `100-java-mistakes` | 9781633437968 | First edition | O’Reilly Learning catalogue cover for this edition | 600×752, 28 KB |
| `kotlin-in-action` | 9781617299605 | Second edition | O’Reilly Learning catalogue cover for this edition | 600×752, 42 KB |
| `spring-boot-in-action` | 9781617292545 | First edition | O’Reilly Learning catalogue cover for this edition | 600×752, 33 KB |
| `javascript-the-good-parts` | 9780596517748 | First edition | O’Reilly Learning catalogue cover for this edition | 600×788, 48 KB |
| `designing-data-intensive-applications` | 9781098119065 | Second edition | O’Reilly Learning catalogue cover for this edition (listed under the ebook ISBN 9781098119058) | 600×788, 55 KB |
| `patterns-of-distributed-systems` | 9780138221980 | First edition | O’Reilly Learning catalogue cover for this edition (listed under the ebook ISBN 9780138222246) | 600×745, 27 KB |
| `patterns-of-enterprise-application-architecture` | 9780321127426 | First edition | Open Library cover scan of this ISBN | 550×689, 34 KB |
| `software-architecture-in-practice` | 9780321815736 | Third edition | O’Reilly Learning catalogue cover for this edition (listed under the ebook ISBN 9780132942799) | 600×781, 36 KB |
| `microservices-patterns` | 9781617294549 | First edition | O’Reilly Learning catalogue cover for this edition | 600×752, 27 KB |
| `mastering-kubernetes` | 9781804611395 | Fourth edition | O’Reilly Learning catalogue cover for this edition | 600×740, 32 KB |
| `modern-operating-systems` | 9780138134594 | Third edition, Pearson International Edition | Open Library cover scan of the US third edition (ISBN 9780136006633), the same edition's US printing. No clean image of the Pearson International Edition cover was available: Google Books and AbeBooks list its ISBN with the wrong book, and Open Library holds only a title-page scan. | 382×500, 46 KB |
| `computer-organization-and-design` | 9780124077263 | Fifth edition (MIPS) | Open Library cover scan of this ISBN | 423×500, 27 KB |
| `thinking-in-systems` | 9781603580557 | First edition, edited by Diana Wright | Open Library cover scan of this ISBN | 332×499, 21 KB |
| `the-culture-map` | 9781610392501 | First edition | Open Library cover scan of this ISBN | 600×953, 54 KB |
| `no-rules-rules` | 9780241553442 | Penguin Readers Level 4, abridged | Penguin Books UK product image | 325×500, 18 KB |
| `talk-like-ted` | 9781250041128 | First edition | Open Library cover scan of this ISBN | 600×928, 26 KB |
| `steve-jobs` | 9781451648539 | First edition | Simon & Schuster catalogue cover for this ISBN: the clean jacket, without a later printing’s sticker. | 600×914, 56 KB |
| `make-something-wonderful` | — | Limited printed edition, edited by Leslie Berlin | Steve Jobs Archive photograph of the printed book, cropped to the cover | 485×784, 62 KB |
| `why-we-sleep` | 9781501144318 | First edition | Open Library cover scan of this ISBN | 596×900, 67 KB |
| `the-subtle-art-of-not-giving-a-fck` | 9780062457714 | First edition | Open Library cover scan of this ISBN | 400×601, 18 KB |
| `sick-societies` | 9780029089255 | First edition | Open Library cover scan of this ISBN | 324×500, 16 KB |
| `they-laughed-at-galileo` | 9781629147581 | First US edition | Open Library cover scan of this ISBN | 600×984, 26 KB |
| `nutuk` | 9789751634993 | Bugünkü Dille (in modern Turkish) | Atatürk Araştırma Merkezi (atam.gov.tr) publication page | 581×913, 11 KB |

## Sources

- **O'Reilly Learning** (`learning.oreilly.com/library/cover/<ISBN>/`): the
  publisher-supplied cover for titles distributed through O'Reilly (O'Reilly,
  Manning, Addison-Wesley, Prentice Hall, Pearson, Packt, Pragmatic Bookshelf,
  Wiley). Where the print ISBN is not listed, the cover was taken from the same
  edition's ebook ISBN, noted in the row.
- **Open Library** (`covers.openlibrary.org`): cover scans catalogued against
  the ISBN. Each was compared with the edition's details before use.
- **Packt Publishing** (`static.packt-cdn.com`): Packt's own catalogue cover.
- **Simon & Schuster** (`d28hgpri8am2if.cloudfront.net`): the publisher's
  catalogue jacket image.
- **Penguin Books UK**: product image of the Penguin Readers edition.
- **Atatürk Araştırma Merkezi** (`atam.gov.tr`): the publisher's own page for
  *Nutuk (1919–1927) Bugünkü Dille*.
- **Steve Jobs Archive** (`stevejobsarchive.com/book`): the Archive's
  photograph of the printed book, cropped to the front cover.
- **Root Cause**: the self-published cover as reproduced on a third-party book
  page (system-design.space); the major retailers could not be used.
