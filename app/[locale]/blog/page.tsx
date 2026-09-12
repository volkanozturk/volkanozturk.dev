import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllBlogPosts } from '@/lib/contentful'
import { PageHeader } from '@/components/page-header'
import { WritingList } from '@/components/writing-list'
import { toWritingPost, type WritingPost } from '@/lib/writing'
import { locales, type Locale } from '@/i18n'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: `/${locale}/blog` },
  }
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('blog')

  let posts: WritingPost[] = []
  try {
    // Reading time needs the rich-text document, so posts are reduced to a lean
    // serializable shape here rather than in the client component.
    posts = (await getAllBlogPosts()).map(toWritingPost)
  } catch {
    // Contentful is not configured yet.
  }

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} description={t('description')} />

      {/*
        With no posts there is nothing to filter and no year to head, so the
        category controls and the grouped list are not rendered at all — just a
        quiet line. Both reappear on their own once Contentful returns entries.
      */}
      {posts.length > 0 ? (
        <WritingList posts={posts} locale={locale} />
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">{t('empty')}</p>
      )}
    </div>
  )
}
