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
  /** Optional; see `Post.summary`. */
  summary?: string
  /** Optional; see `Post.thumbnail`. */
  thumbnail?: string
}

export function toWritingPost(post: Post): WritingPost {
  const { title, slug, excerpt, publishedDate, tags, category, summary, thumbnail, body } =
    post

  return {
    slug,
    title,
    excerpt,
    publishedDate,
    category,
    tags,
    summary,
    thumbnail,
    minutes: readingTime(body, excerpt),
  }
}
