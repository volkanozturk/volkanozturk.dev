import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts'
import { Markdown } from '@/components/markdown'
import { CATEGORY_LABELS } from '@/lib/categories'
import { TagList } from '@/components/tag-list'
import { isImageThumbnail, resolveThumbnail } from '@/components/post-thumbnails'
import { cn, formatDate, readingTime } from '@/lib/utils'

/**
 * `output: 'export'` rejects a dynamic route with zero params, so if every post
 * is a draft we emit a single placeholder. That page calls `notFound()` below
 * and is exported as a 404.
 */
const PLACEHOLDER_SLUG = 'not-found'

/** Intrinsic size of the cover files: square, re-exported at 768px for 2x screens. */
const COVER_SOURCE_SIZE = 768

/**
 * The article's own cover: the same `thumbnail` the home and Writing cards
 * render, shown once above the body. There is no second frontmatter field and
 * no image in the Markdown, so one value drives all three places.
 *
 * Deliberately smaller than the column — 320px on phones, 384px from 640px up —
 * so it reads as an opening mark rather than a banner. The square ratio is the
 * file's own: `w-full h-auto` scales it without cropping or stretching, and the
 * explicit width/height give the browser the ratio up front, so nothing shifts
 * while it loads.
 */
function PostCover({ thumbnail, title }: { thumbnail: string; title: string }) {
  const Drawn = resolveThumbnail(thumbnail)

  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[10px] border border-border sm:max-w-[384px]">
      {isImageThumbnail(thumbnail) ? (
        <Image
          src={thumbnail}
          alt={`Cover illustration for ${title}`}
          width={COVER_SOURCE_SIZE}
          height={COVER_SOURCE_SIZE}
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

  const { title, excerpt, publishedDate, tags, category, body, thumbnail } = post

  // A post without a thumbnail renders no cover and no gap where one would be:
  // the header keeps its original spacing above the body.
  const hasCover = Boolean(thumbnail && (isImageThumbnail(thumbnail) || resolveThumbnail(thumbnail)))

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
            <span>{CATEGORY_LABELS[category]}</span>
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
            <span>{readingTime(body, excerpt)} min read</span>
          </div>

          <TagList tags={tags} />
        </header>

        {hasCover && thumbnail && <PostCover thumbnail={thumbnail} title={title} />}

        <div className="article-body prose prose-neutral max-w-none text-foreground dark:prose-invert">
          <Markdown>{body}</Markdown>
        </div>
      </div>
    </article>
  )
}
