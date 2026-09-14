import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { CATEGORIES, type Category } from '@/lib/categories'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

/**
 * Draft visibility.
 *
 * `INCLUDE_DRAFTS=1` shows drafts, but only under `next dev`. A production build
 * ignores the flag entirely, so a stray environment variable in CI or a shell
 * profile can never publish a draft. Next sets NODE_ENV to "production" for
 * `next build` and "development" for `next dev`.
 */
const IS_PRODUCTION_BUILD = process.env.NODE_ENV === 'production'
const DRAFTS_REQUESTED = process.env.INCLUDE_DRAFTS === '1'
const INCLUDE_DRAFTS = DRAFTS_REQUESTED && !IS_PRODUCTION_BUILD

if (DRAFTS_REQUESTED && IS_PRODUCTION_BUILD) {
  console.warn(
    '[content] INCLUDE_DRAFTS=1 was set for a production build and has been ignored — drafts stay unpublished.'
  )
}

export interface Post {
  slug: string
  title: string
  excerpt: string
  category: Category
  /** ISO 8601, exactly as authored in the frontmatter. */
  publishedDate: string
  tags: string[]
  draft: boolean
  /**
   * Optional short line for the home cards. The full `excerpt` stays the
   * canonical summary for the Writing index and for SEO metadata.
   */
  summary?: string
  /**
   * Optional card thumbnail: either a path under `public/` (starting with `/`)
   * or a key from the drawn-thumbnail registry. Absent is fine — the card then
   * renders without a media column.
   */
  thumbnail?: string
  /**
   * Optional wide (16:9) cover for the article page only. The listings always
   * use the square `thumbnail`; the article falls back to it when this is
   * absent, so a post never has to carry both.
   */
  cover?: string
  /** Markdown body, frontmatter stripped. */
  body: string
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function fail(file: string, message: string): never {
  throw new Error(`[content] ${file}: ${message}`)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function parseFile(file: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8')

  const match = FRONTMATTER.exec(raw)
  if (!match) fail(file, 'missing YAML frontmatter delimited by ---')

  const data = parseYaml(match[1]) as Record<string, unknown> | null
  if (!data || typeof data !== 'object') fail(file, 'frontmatter is not a YAML mapping')

  const body = raw.slice(match[0].length)
  const draft = data.draft === true

  const slug = typeof data.slug === 'string' ? data.slug.trim() : ''
  if (!slug) fail(file, 'missing required field: slug')

  const expected = file.replace(/\.md$/, '')
  if (slug !== expected) {
    fail(file, `slug "${slug}" does not match the filename; rename one so they agree`)
  }

  // Drafts are allowed to be incomplete — they are excluded from public pages.
  if (draft) {
    return {
      slug,
      title: typeof data.title === 'string' ? data.title : slug,
      excerpt: typeof data.excerpt === 'string' ? data.excerpt : '',
      category: (CATEGORIES as readonly string[]).includes(String(data.category))
        ? (data.category as Category)
        : 'notes',
      publishedDate: isIsoDate(data.publishedDate) ? data.publishedDate : '',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      draft: true,
      summary: typeof data.summary === 'string' ? data.summary : undefined,
      thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : undefined,
      cover: typeof data.cover === 'string' ? data.cover : undefined,
      body,
    }
  }

  // Published posts must carry everything the site renders.
  for (const field of ['title', 'excerpt', 'category', 'publishedDate'] as const) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      fail(file, `missing required field for a published post: ${field}`)
    }
  }

  if (!(CATEGORIES as readonly string[]).includes(String(data.category))) {
    fail(file, `category "${String(data.category)}" is not one of: ${CATEGORIES.join(', ')}`)
  }

  // `publishedDate` may be parsed by YAML into a Date; normalise to ISO either way.
  const published =
    data.publishedDate instanceof Date
      ? data.publishedDate.toISOString()
      : String(data.publishedDate)

  if (!isIsoDate(published)) {
    fail(file, `publishedDate "${published}" is not a valid date`)
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    fail(file, 'tags must be a list')
  }

  if (data.summary !== undefined && typeof data.summary !== 'string') {
    fail(file, 'summary must be a string')
  }

  if (data.thumbnail !== undefined && typeof data.thumbnail !== 'string') {
    fail(file, 'thumbnail must be a path under /public or a drawn-thumbnail key')
  }

  if (data.cover !== undefined && typeof data.cover !== 'string') {
    fail(file, 'cover must be a path under /public')
  }

  return {
    slug,
    title: String(data.title),
    excerpt: String(data.excerpt),
    category: data.category as Category,
    publishedDate: published,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: false,
    summary: typeof data.summary === 'string' ? data.summary : undefined,
    thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : undefined,
    cover: typeof data.cover === 'string' ? data.cover : undefined,
    body,
  }
}

function readAll(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map(parseFile)

  const seen = new Set<string>()
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`[content] duplicate slug: ${post.slug}`)
    }
    seen.add(post.slug)
  }

  return posts
}

/** Published posts, newest first. The single place drafts are filtered —
 * `getPostBySlug` and `getAllPostSlugs` both delegate here, so routes, listings
 * and metadata can never disagree about what is public. */
export function getAllPosts(): Post[] {
  return readAll()
    .filter((post) => INCLUDE_DRAFTS || !post.draft)
    .sort(
      (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )
}

export function getPostBySlug(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug)
}
