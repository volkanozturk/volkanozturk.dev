import type { Post } from '@/lib/posts'
import type { Category } from '@/lib/categories'
import { readingTime } from '@/lib/utils'

/**
 * Serializable shape handed to the client-side list. Deliberately lean: the
 * Markdown body stays on the server, so reading time is computed during the
 * build rather than shipped to the browser.
 */
export interface WritingPost {
  slug: string
  title: string
  excerpt: string
  publishedDate: string
  category: Category
  tags: string[]
  minutes: number
}

export function toWritingPost(post: Post): WritingPost {
  const { title, slug, excerpt, publishedDate, tags, category, body } = post

  return {
    slug,
    title,
    excerpt,
    publishedDate,
    category,
    tags,
    minutes: readingTime(body, excerpt),
  }
}

export interface YearGroup {
  year: string
  posts: WritingPost[]
}

/**
 * Heading used for drafts that have no publication date yet. Only reachable in
 * the local preview, since drafts never enter a production build.
 */
const UNDATED_GROUP = 'Drafts'

function publishedTime(post: WritingPost): number {
  return new Date(post.publishedDate).getTime()
}

/**
 * Groups posts by published year — newest year first, newest post first.
 * Undated drafts group under "Drafts", listed ahead of the dated years.
 */
export function groupByYear(posts: WritingPost[]): YearGroup[] {
  // A plain record rather than a Map: the project compiles without
  // `downlevelIteration`, so iterating a Map would need a tsconfig change.
  const byYear: Record<string, WritingPost[]> = {}

  for (const post of posts) {
    const time = publishedTime(post)
    const year = Number.isNaN(time)
      ? UNDATED_GROUP
      : String(new Date(post.publishedDate).getFullYear())
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(post)
  }

  return Object.keys(byYear)
    .sort((a, b) => {
      if (a === UNDATED_GROUP) return -1
      if (b === UNDATED_GROUP) return 1
      return Number(b) - Number(a)
    })
    .map((year) => ({
      year,
      posts: byYear[year].slice().sort((a, b) => {
        const bt = publishedTime(b)
        const at = publishedTime(a)
        // Undated drafts keep their incoming order rather than sorting on NaN.
        if (Number.isNaN(at) || Number.isNaN(bt)) return 0
        return bt - at
      }),
    }))
}
