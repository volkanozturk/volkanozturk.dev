import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts'
import { Markdown } from '@/components/markdown'
import { CategoryBadge } from '@/components/category-badge'
import { TagList } from '@/components/tag-list'
import { isImageThumbnail } from '@/components/post-thumbnails'
import { getImageSize } from '@/lib/image-size'
import { cn, formatDate, readingTime } from '@/lib/utils'

/**
 * `output: 'export'` rejects a dynamic route with zero params, so if every post
 * is a draft we emit a single placeholder. That page calls `notFound()` below
 * and is exported as a 404.
 */
const PLACEHOLDER_SLUG = 'not-found'

/**
 * The article's opening image: the post's own `cover`, and nothing else.
 *
 * The square `thumbnail` belongs to the listings and is never reused here, so
 * a post without a cover opens straight into its text. The frontmatter is the
 * only source: nothing is added to the Markdown.
 *
 * The declared width/height are read from the file itself, so the browser
 * reserves the cover's real ratio before it loads and nothing shifts. A wide
 * (16:9) cover is held to the 640px text column; a square one keeps compact
 * sizing (up to 384px) instead of being blown up to the full column. Either
 * way `w-full h-auto` scales it on its own ratio, never cropping or stretching.
 */
function PostCover({ src, title }: { src: string; title: string }) {
  const { width, height } = getImageSize(src)
  const wide = width > height

  return (
    <div
      className={cn(
        'mx-auto w-full overflow-hidden rounded-[10px] border border-border',
        wide ? 'max-w-[640px]' : 'max-w-[320px] sm:max-w-[384px]'
      )}
    >
      <Image
        src={src}
        alt={`Cover illustration for ${title}`}
        width={width}
        height={height}
        className="h-auto w-full"
        // Above the fold on every article, so it is preloaded and eagerly
        // fetched rather than lazily. Only this one: the home and Writing
        // thumbnails sit further down their lists and stay lazy.
        priority
      />
    </div>
  )
}

export function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return (slugs.length > 0 ? slugs : [PLACEHOLDER_SLUG]).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { title, excerpt, publishedDate, tags, category, body, cover } = post

  // Only a dedicated cover opens the article; the square thumbnail is for the
  // listings. Without a cover there is no image and no gap where one would be:
  // the header keeps its original spacing above the body.
  const hasCover = Boolean(cover && isImageThumbnail(cover))

  return (
    <article className="space-y-10">
      <div className="article-measure">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to writing
        </Link>
      </div>

      {/*
        Title, cover and body are grouped so the cover sits 30px below the
        metadata and 30px above the opening paragraph. With no cover the group
        keeps the original 40px gap between the header and the body.

        The header shares the body's 640px measure (and the cover is capped at
        the same width), so title, image and text all start on one edge.
      */}
      <div className={cn('space-y-10', hasCover && 'space-y-[30px]')}>
        <header className="article-measure space-y-4">
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
        </header>

        {hasCover && cover && <PostCover src={cover} title={title} />}

        <div className="article-body prose prose-neutral max-w-none text-foreground dark:prose-invert">
          <Markdown>{body}</Markdown>
        </div>
      </div>

      {/*
        Topics close the article rather than crowding the header, so the reader
        reaches the opening paragraph sooner. Same shared pills as the Writing
        cards; a post without tags renders no footer at all.
      */}
      {tags.length > 0 && (
        <footer className="article-measure pt-4">
          <p className="mb-3 text-[13px] font-medium text-muted-foreground">Topics</p>
          <TagList tags={tags} />
        </footer>
      )}
    </article>
  )
}
