import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowLeft, Clock } from 'lucide-react'
import { getBlogPostBySlug, getAllBlogSlugs } from '@/lib/contentful'
import { cn, formatDate, readingTime, tagStyle } from '@/lib/utils'
import { locales, type Locale } from '@/i18n'


/**
 * `output: 'export'` rejects a dynamic route with zero params, so before
 * Contentful is configured we emit a single placeholder per locale. Those
 * pages call `notFound()` below and are exported as 404s.
 */
const PLACEHOLDER_SLUG = 'not-found'

export async function generateStaticParams() {
  let slugs: string[] = []
  try {
    slugs = await getAllBlogSlugs()
  } catch {
    // Contentful is not configured yet.
  }

  if (slugs.length === 0) slugs = [PLACEHOLDER_SLUG]

  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })

  try {
    const post = await getBlogPostBySlug(slug)
    if (!post) return { title: t('notFound') }

    return {
      title: post.fields.title,
      description: post.fields.excerpt,
      openGraph: {
        title: post.fields.title,
        description: post.fields.excerpt,
        type: 'article',
        publishedTime: post.fields.publishedDate,
      },
    }
  } catch {
    return { title: t('title') }
  }
}

const renderOptions = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node: any, children: any) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_node: any, children: any) => (
      <h1 className="mb-4 mt-8 text-3xl font-bold">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node: any, children: any) => (
      <h2 className="mb-3 mt-8 text-2xl font-semibold">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node: any, children: any) => (
      <h3 className="mb-2 mt-6 text-xl font-semibold">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_node: any, children: any) => (
      <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_node: any, children: any) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node: any, children: any) => (
      <li className="text-foreground">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node: any, children: any) => (
      <blockquote className="my-4 border-l-2 border-border pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-border" />,
    [INLINES.HYPERLINK]: (node: any, children: any) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
      >
        {children}
      </a>
    ),
  },
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: Locale; slug: string }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('blog')

  let post = null
  try {
    post = await getBlogPostBySlug(slug)
  } catch {
    // Contentful is unavailable — fall through to the 404.
  }

  if (!post) notFound()

  const { title, content, excerpt, publishedDate, tags } = post.fields

  return (
    <article className="space-y-10">
      <Link
        href={`/${locale}/blog`}
        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {t('back')}
      </Link>

      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <time dateTime={publishedDate}>{formatDate(publishedDate, locale)}</time>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {t('readingTime', { minutes: readingTime(content, excerpt) })}
          </span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  tagStyle(tag)
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-neutral max-w-none text-foreground dark:prose-invert">
        {content && documentToReactComponents(content, renderOptions)}
      </div>
    </article>
  )
}
