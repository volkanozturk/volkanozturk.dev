import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts'
import { Markdown } from '@/components/markdown'
import { CATEGORY_LABELS } from '@/lib/categories'
import { TagList } from '@/components/tag-list'
import { formatDate, readingTime } from '@/lib/utils'

/**
 * `output: 'export'` rejects a dynamic route with zero params, so if every post
 * is a draft we emit a single placeholder. That page calls `notFound()` below
 * and is exported as a 404.
 */
const PLACEHOLDER_SLUG = 'not-found'

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

  const { title, excerpt, publishedDate, tags, category, body } = post

  return (
    <article className="space-y-10">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to writing
      </Link>

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

      <div className="article-body prose prose-neutral max-w-none text-foreground dark:prose-invert">
        <Markdown>{body}</Markdown>
      </div>
    </article>
  )
}
