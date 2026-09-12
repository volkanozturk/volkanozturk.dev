import type { BlogPost } from '@/types'
import { normalizeCategory, type Category } from '@/lib/categories'
import { readingTime } from '@/lib/utils'

/**
 * Serializable shape handed to the client-side list. Deliberately lean: the
 * Contentful rich-text document stays on the server, so reading time is computed
 * during the build rather than shipped to the browser.
 */
export interface WritingPost {
  id: string
  slug: string
  title: string
  excerpt: string
  publishedDate: string
  category: Category
  tags: string[]
  minutes: number
}

export function toWritingPost(post: BlogPost): WritingPost {
  const { title, slug, excerpt, content, publishedDate, tags, category } = post.fields

  return {
    id: post.sys.id,
    slug,
    title,
    excerpt: excerpt ?? '',
    publishedDate,
    category: normalizeCategory(category, slug),
    tags: tags ?? [],
    minutes: readingTime(content, excerpt),
  }
}

export interface YearGroup {
  year: string
  posts: WritingPost[]
}

/** Groups posts by published year — newest year first, newest post first. */
export function groupByYear(posts: WritingPost[]): YearGroup[] {
  // A plain record rather than a Map: the project compiles without
  // `downlevelIteration`, so iterating a Map would need a tsconfig change.
  const byYear: Record<string, WritingPost[]> = {}

  for (const post of posts) {
    const year = String(new Date(post.publishedDate).getFullYear())
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(post)
  }

  return Object.keys(byYear)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      year,
      posts: byYear[year].slice().sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      ),
    }))
}
