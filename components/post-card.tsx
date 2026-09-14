import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { WritingPost } from '@/lib/writing'
import { CategoryBadge } from '@/components/category-badge'
import { TagList } from '@/components/tag-list'
import { isImageThumbnail, resolveThumbnail } from '@/components/post-thumbnails'
import { cn, formatDate } from '@/lib/utils'

interface PostCardProps {
  post: WritingPost
  /** Writing keeps the tags; the home list stays compact without them. */
  showTags?: boolean
  /**
   * Home prefers the post's short summary and lets it wrap in full. The Writing
   * index always shows the canonical excerpt, clamped so one long summary
   * cannot stretch its card out of step with the others.
   */
  preferSummary?: boolean
}

/** Square media tile, or nothing at all when the post has no thumbnail. */
function Thumbnail({ post }: { post: WritingPost }) {
  const { thumbnail } = post
  if (!thumbnail) return null

  const Drawn = resolveThumbnail(thumbnail)

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border sm:h-20 sm:w-20">
      {isImageThumbnail(thumbnail) ? (
        <Image
          src={thumbnail}
          alt=""
          width={320}
          height={320}
          className="h-full w-full object-cover"
        />
      ) : Drawn ? (
        <Drawn />
      ) : (
        <div className="h-full w-full bg-muted" aria-hidden />
      )}
    </div>
  )
}

export function PostCard({ post, showTags = false, preferSummary = false }: PostCardProps) {
  const { slug, title, excerpt, summary, publishedDate, category, tags, minutes } = post

  const short = preferSummary && summary
  const blurb = short ? summary : excerpt

  /*
   * Assembled as a list so an undated draft can never leave an empty slot or a
   * stray separator behind.
   */
  const meta: Array<{ key: string; node: React.ReactNode }> = [
    { key: 'category', node: <CategoryBadge category={category} /> },
  ]
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
  meta.push({ key: 'minutes', node: <span>{minutes} min read</span> })

  return (
    <article className="group rounded-[10px] border border-border bg-card transition-colors duration-150 hover:border-foreground/25">
      {/*
        Below 400px the thumbnail and the title share the top row and everything
        else spans the full inner width beneath them; from 400px up the
        thumbnail spans both rows and the desktop shape is unchanged.
      */}
      <Link
        href={`/blog/${slug}`}
        className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1.5 p-4 sm:gap-x-5"
      >
        <div className="xs:row-span-2">
          <Thumbnail post={post} />
        </div>

        {/* Titles are never truncated — only the excerpt is clamped. */}
        <h3 className="self-center text-[17px] font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors duration-150 group-hover:text-brand xs:self-start sm:text-[18px]">
          {title}
        </h3>

        <div className="col-span-2 min-w-0 xs:col-span-1 xs:col-start-2">

          {blurb && (
            <p
              className={cn(
                'text-[14.5px] leading-[1.5] text-muted-foreground',
                // A purpose-written summary is short enough to show whole, and
                // wraps freely on narrow screens; a full excerpt is clamped.
                !short && 'line-clamp-2'
              )}
            >
              {blurb}
            </p>
          )}

          {/*
            Each item keeps its own leading separator inside one nowrap unit, so
            a dot can never be stranded at the end of a wrapped line. Under
            400px the dots are dropped and spacing alone separates the values.
          */}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground xs:gap-x-2">
            {meta.map(({ key, node }, i) => (
              <span key={key} className="inline-flex items-center whitespace-nowrap">
                {i > 0 && (
                  <span aria-hidden className="mr-2 hidden text-muted-foreground/50 xs:inline">
                    ·
                  </span>
                )}
                {node}
              </span>
            ))}
          </p>

          {showTags && tags.length > 0 && (
            <div className="mt-3">
              <TagList tags={tags} />
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

/** Cards share one vertical rhythm wherever they are listed. */
export function PostCardList({
  posts,
  showTags = false,
  preferSummary = false,
}: {
  posts: WritingPost[]
  showTags?: boolean
  preferSummary?: boolean
}) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Fragment key={post.slug}>
          <PostCard post={post} showTags={showTags} preferSummary={preferSummary} />
        </Fragment>
      ))}
    </div>
  )
}
