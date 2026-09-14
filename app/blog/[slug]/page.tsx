import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts'
import { Markdown } from '@/components/markdown'
import { CategoryBadge } from '@/components/category-badge'
import { TagList } from '@/components/tag-list'
import { isImageThumbnail, resolveThumbnail } from '@/components/post-thumbnails'
import { cn, formatDate, readingTime } from '@/lib/utils'

/**
 * `output: 'export'` rejects a dynamic route with zero params, so if every post
 * is a draft we emit a single placeholder. That page calls `notFound()` below
 * and is exported as a 404.
 */
const PLACEHOLDER_SLUG = 'not-found'

/** Intrinsic size of the wide `cover` files: 16:9, exported at 1280x720. */
const COVER_WIDTH = 1280
const COVER_HEIGHT = 720

/** Intrinsic size of the square `thumbnail` files, used only as the fallback. */
const THUMBNAIL_SIZE = 768

/**
 * The article's opening image.
 *
 * Prefers the wide `cover`, and falls back to the square `thumbnail` the cards
 * already use, so a post with no cover of its own still opens with its own
 * picture. Either way the frontmatter is the only source: nothing is added to
 * the Markdown, and the listings keep using `thumbnail` regardless.
 *
 * `wide` decides both the intrinsic dimensions and the cap, because the two
 * files have different shapes — a 16:9 cover would be distorted if it were
 * declared square, and a square fallback would be if it were declared 16:9.
 * Either is held below the text column so it opens the piece without becoming
 * a banner, and `w-full h-auto` scales it on its own ratio rather than cropping
 * or stretching it. The explicit width/height give the browser that ratio up
 * front, so nothing shifts while it loads.
 */
function PostCover({ src, title, wide }: { src: string; title: string; wide: boolean }) {
  const Drawn = resolveThumbnail(src)

  return (
    <div
      className={cn(
        'mx-auto w-full overflow-hidden rounded-[10px] border border-border',
        wide ? 'max-w-[640px]' : 'max-w-[320px] sm:max-w-[384px]'
      )}
    >
      {isImageThumbnail(src) ? (
        <Image
          src={src}
          alt={`Cover illustration for ${title}`}
          width={wide ? COVER_WIDTH : THUMBNAIL_SIZE}
          height={wide ? COVER_HEIGHT : THUMBNAIL_SIZE}
          className="h-auto w-full"
          // Above the fold on every article, so it is preloaded and eagerly
          // fetched rather than lazily. Only this one: the home and Writing
          // thumbnails sit further down their lists and stay lazy.
          priority
        />
      ) : Drawn ? (
        // A drawn tile fills its box, so the square has to come from the box.
        <div className="aspect-square">
          <Drawn />
        </div>
      ) : null}
    </div>
  )
}

export function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return (slugs.length > 0 ? slugs : [PLACEHOLDER_SLUG]).map((slug) => ({ slug }))
}

export function generateMetadata({
  params: { slug },
}: {
  params: { slug: string }
}): Metadata {
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishedDate,
      section: post.category,
      tags: post.tags,
    },
  }
}

export default function BlogPostPage({ params: { slug } }: { params: { slug: string } }) {
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { title, excerpt, publishedDate, tags, category, body, thumbnail, cover } = post

  // The wide cover wins; the square thumbnail is the fallback. A post with
  // neither renders no cover and no gap where one would be: the header keeps
  // its original spacing above the body.
  const coverSrc = cover ?? thumbnail
  const hasCover = Boolean(coverSrc && (isImageThumbnail(coverSrc) || resolveThumbnail(coverSrc)))

  return (
    <article className="space-y-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to writing
      </Link>

      {/*
        Title, cover and body are grouped so the cover sits 30px below the
        metadata and 30px above the opening paragraph. With no cover the group
        keeps the original 40px gap between the header and the body.
      */}
      <div className={cn('space-y-10', hasCover && 'space-y-[30px]')}>
        <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
            {/* An undated draft simply omits the date and its separator. */}
            {publishedDate && (
              <>
                <time dateTime={publishedDate} className="tabular-nums">
                  {formatDate(publishedDate, 'd MMM yyyy')}
                </time>
                <span aria-hidden className="text-muted-foreground/50">
                  ·
                </span>
              </>
            )}
            <CategoryBadge category={category} />
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
            <span>{readingTime(body, excerpt)} min read</span>
          </div>

          <TagList tags={tags} />
        </header>

        {hasCover && coverSrc && (
          <PostCover src={coverSrc} title={title} wide={Boolean(cover)} />
        )}

        <div className="article-body prose prose-neutral max-w-none text-foreground dark:prose-invert">
          <Markdown>{body}</Markdown>
        </div>
      </div>
    </article>
  )
}
