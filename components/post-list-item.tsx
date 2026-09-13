import Link from 'next/link'
import type { WritingPost } from '@/lib/writing'
import { CATEGORY_LABELS } from '@/lib/categories'
import { formatDate } from '@/lib/utils'

interface PostListItemProps {
  post: WritingPost
}

/**
 * Editorial row for the Writing index — title, excerpt, one metadata line.
 * Tags are deliberately left to the individual post page.
 * (The card-style `BlogCard` is still used for the short list on the home page.)
 */
export function PostListItem({ post }: PostListItemProps) {
  const { slug, title, excerpt, publishedDate, category, minutes } = post

  return (
    <article className="group -mx-3">
      <Link
        href={`/blog/${slug}`}
        className="block rounded-lg px-3 py-6 transition-colors hover:bg-accent/40"
      >
        <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>

        {excerpt && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {/* An undated draft simply omits the date and its separator. */}
          {publishedDate && (
            <>
              <time dateTime={publishedDate} className="tabular-nums">
                {formatDate(publishedDate, 'd MMM yyyy')}
              </time>
              <span aria-hidden className="text-muted-foreground/40">·</span>
            </>
          )}
          <span>{CATEGORY_LABELS[category]}</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>{minutes} min read</span>
        </p>
      </Link>
    </article>
  )
}
