import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { books } from '../content/books.ts'
import { BOOK_CATEGORIES } from '../lib/book-types.ts'
import { isValidIsbn13, validateBooks } from '../lib/book-validation.ts'
import { LABEL_TYPE, SHELF_BUCKETS, labelRoom, layoutShelves, pack, packBalanced, rowWidth, spineGeometry } from '../lib/bookshelf.ts'

const root = path.resolve(import.meta.dirname, '..')
const postSlugs = new Set(fs.readdirSync(path.join(root, 'content/posts')).map((f) => f.replace(/\.md$/, '')))

test('the collection is the 35 books on the shelf', () => {
  assert.equal(books.length, 35)
})

test('categories hold the agreed books', () => {
  const count = (c) => books.filter((b) => b.category === c).length
  assert.deepEqual(
    BOOK_CATEGORIES.map((c) => [c, count(c)]),
    [
      ['Software Engineering', 8],
      ['Java & Programming', 8],
      ['Architecture & Systems', 9],
      ['Business, Culture & Communication', 5],
      ['History, Psychology & Science', 5],
    ]
  )
})

test('excluded books are not on the shelf', () => {
  const titles = books.map((b) => b.title.toLowerCase())
  assert.ok(!titles.some((t) => t.includes('ezbere')), 'Ezbere Yaşayanlar is excluded')
})

test('Nutuk is the Turkish Atatürk Araştırma Merkezi edition', () => {
  const nutuk = books.find((b) => b.slug === 'nutuk')
  assert.ok(nutuk)
  assert.equal(nutuk.language, 'tr')
  assert.match(nutuk.publisher, /Atatürk Araştırma Merkezi/)
  assert.match(nutuk.edition, /Bugünkü Dille/)
  assert.equal(nutuk.spine.direction, 'bottom-to-top')
})

test('every other book is an English edition', () => {
  for (const b of books.filter((b) => b.slug !== 'nutuk')) assert.equal(b.language, 'en', b.slug)
})

test('the content passes validation', () => {
  assert.deepEqual(validateBooks(books, postSlugs), [])
})

test('every cover exists, is WebP, and has a recorded source', () => {
  for (const b of books) {
    const file = path.join(root, 'public', b.cover.src)
    assert.ok(fs.existsSync(file), `${b.slug}: ${b.cover.src} is missing`)
    const head = fs.readFileSync(file).subarray(0, 12)
    assert.equal(head.toString('ascii', 0, 4), 'RIFF', b.slug)
    assert.equal(head.toString('ascii', 8, 12), 'WEBP', b.slug)
    assert.ok(b.cover.source.length > 10, b.slug)
  }
})

test('no unused files sit in the covers folder', () => {
  const used = new Set(books.map((b) => path.basename(b.cover.src)))
  const files = fs.readdirSync(path.join(root, 'public/images/books/covers'))
  assert.deepEqual(files.filter((f) => !used.has(f)), [])
})

test('every book is in the provenance record', () => {
  const record = fs.readFileSync(path.join(root, 'docs/book-provenance.md'), 'utf8')
  for (const b of books) assert.ok(record.includes(`\`${b.slug}\``), `${b.slug} missing from docs/book-provenance.md`)
})

test('ISBN-13 check digits', () => {
  assert.ok(isValidIsbn13('9780132350884'))
  assert.ok(isValidIsbn13('9798295873560'))
  assert.ok(!isValidIsbn13('9780132350885'))
  assert.ok(!isValidIsbn13('0132350882'))
})

test('validation reports problems by book', () => {
  const bad = { ...books[0], slug: 'Bad Slug', isbn: '9780000000000', relatedPosts: ['no-such-post'] }
  const problems = validateBooks([bad, books[0], books[0]], postSlugs)
  assert.ok(problems.some((p) => p.includes('slug must be')))
  assert.ok(problems.some((p) => p.includes('not a valid ISBN-13')))
  assert.ok(problems.some((p) => p.includes('related post "no-such-post"')))
  assert.ok(problems.some((p) => p.includes('duplicate slug')))
})

test('pack never exceeds the width unless a single item is wider', () => {
  const items = Array.from({ length: 40 }, (_, i) => ({ width: 10 + (i % 7) * 4, gap: i % 5 ? 0 : 6 }))
  for (const w of [80, 150, 333]) {
    for (const row of pack(items, w)) assert.ok(row.length === 1 || rowWidth(row) <= w)
    assert.equal(pack(items, w).flat().length, items.length)
  }
})

test('balanced packing uses no more rows than greedy packing', () => {
  const items = Array.from({ length: 35 }, (_, i) => ({ width: 12 + (i * 13) % 30, gap: 0 }))
  for (const w of [200, 300, 500]) assert.ok(packBalanced(items, w).length <= pack(items, w).length)
})

for (const width of SHELF_BUCKETS) {
  test(`layout at ${width}px keeps every book once, in order, inside the column`, () => {
    const layout = layoutShelves(books, BOOK_CATEGORIES, width)
    const shelved = layout.shelves.flatMap((s) => s.items.filter((i) => i.kind === 'book').map((i) => i.book.slug))
    const expected = BOOK_CATEGORIES.flatMap((c) => books.filter((b) => b.category === c).map((b) => b.slug))
    assert.deepEqual(shelved, expected)

    const dividers = layout.shelves.flatMap((s) => s.items.filter((i) => i.kind === 'divider').map((i) => i.category))
    assert.deepEqual(dividers, [...BOOK_CATEGORIES])

    const inner = width - 2 * layout.padding
    for (const [i, shelf] of layout.shelves.entries()) {
      const last = shelf.items[shelf.items.length - 1]
      assert.notEqual(last.kind, 'divider', `shelf ${i} ends in a divider`)
      for (const it of shelf.items) if (it.kind === 'divider') assert.ok(it.height <= shelf.height, `card taller than shelf ${i}`)
      const used = shelf.items.reduce((sum, it) => {
        if (it.kind === 'divider') return sum + it.before + it.width + it.after
        return sum + it.geometry.width + (it.lean ? it.lean.offset : 0)
      }, 0)
      assert.ok(used <= inner + 1, `shelf ${i} is ${used}px in a ${inner}px column`)
      const leaning = shelf.items.filter((it) => it.kind === 'book' && it.lean)
      assert.ok(leaning.length <= 1)
      for (const it of leaning) {
        assert.ok(Math.abs(it.lean.degrees) >= 3 && Math.abs(it.lean.degrees) <= 5)
        assert.equal(it, last, 'only the last book on a shelf leans')
      }
      assert.ok(leaning.length === 1 || shelf.bookend !== undefined, `shelf ${i} has neither a leaning book nor a bookend`)
    }
  })
}

test('category labels fit their cards without clipping', () => {
  for (const width of SHELF_BUCKETS) {
    const layout = layoutShelves(books, BOOK_CATEGORIES, width)
    const k = layout.scale
    for (const shelf of layout.shelves)
      for (const it of shelf.items)
        if (it.kind === 'divider') {
          assert.ok(it.lines.length <= 2, `${width}: "${it.category}" needs ${it.lines.length} lines`)
          const perChar = LABEL_TYPE[k < 1 ? 'scaled' : 'full'].char
          const room = labelRoom(it.height, k)
          for (const line of it.lines) assert.ok(line.length * perChar <= room, `${width}: "${line}" in ${Math.round(room)}px`)
        }
  }
})

test('spine size follows the book: taller books stand taller, thicker books are wider', () => {
  const tall = books.find((b) => b.slug === 'modern-operating-systems')
  const short = books.find((b) => b.slug === 'no-rules-rules')
  assert.ok(spineGeometry(tall, 1).height > spineGeometry(short, 1).height)
  assert.ok(spineGeometry(tall, 1).width > spineGeometry(short, 1).width)
  assert.ok(spineGeometry(short, 0.74).width >= 9, 'a spine is never too thin to hit')
})
