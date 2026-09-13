import { Fragment } from 'react'
import Link from 'next/link'
import type { WritingPost } from '@/lib/writing'
import { CATEGORY_LABELS } from '@/lib/categories'
import { TagList } from '@/components/tag-list'
import { formatDate } from '@/lib/utils'

interface PostListItemProps {
  post: WritingPost
  /** The Writing index labels the category; the home list shows tags instead. */
  showCategory?: boolean
  showTags?: boolean
}

/**
 * The article row used by both the Writing index and the home page: a prominent
 * title, a supporting excerpt, one quiet metadata line. Rows are separated by a
 * hairline from their container, so the row itself carries no border or card.
 */
export function PostListItem({
  post,
  showCategory = true,
  showTags = false,
}: PostListItemProps) {
  const { slug, title, excerpt, publishedDate, category, tags, minutes } = post

  /*
   * Assembled as a list rather than inline markup so that whichever pieces a
   * given list shows, an undated draft can never leave an empty slot or a
   * leading separator behind.
   */
  const meta: Array<{ key: string; node: React.ReactNode }> = []

  if (publishedDate) {
    meta.push({
      key: 'date',
      node: (
        <time dateTime={publishedDate} className="tabular-nums">
          {formatDate(publishedDate, 'd MMM yyyy')}
        </time>
      ),
    })
  }

  if (showCategory) {
    meta.push({ key: 'category', node: <span>{CATEGORY_LABELS[category]}</span> })
  }

  meta.push({ key: 'minutes', node: <span>{minutes} min read</span> })

  return (
    <article className="group">
      <Link href={`/blog/${slug}`} className="block py-6">
        <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors group-hover:text-brand sm:text-xl">
          {title}
        </h3>

        {excerpt && (
          <p className="mt-2 leading-relaxed text-muted-foreground">{excerpt}</p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {meta.map(({ key, node }, i) => (
            <Fragment key={key}>
              {i > 0 && (
                <span aria-hidden className="text-muted-foreground/50">
                  ·
                </span>
              )}
              {node}
            </Fragment>
          ))}
        </p>

        {showTags && (
          <div className="mt-3">
            <TagList tags={tags} />
          </div>
        )}
      </Link>
    </article>
  )
}
