import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllBlogPosts } from '@/lib/contentful'
import { BlogCard } from '@/components/blog-card'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { locales, type Locale } from '@/i18n'
import type { BlogPost } from '@/types'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })
  return { title: t('title'), description: t('description') }
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('blog')

  let posts: BlogPost[] = []
  try {
    posts = await getAllBlogPosts()
  } catch {
    // Contentful is not configured yet.
  }

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} description={t('description')} />

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <BlogCard key={post.sys.id} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <EmptyState>{t('empty')}</EmptyState>
      )}
    </div>
  )
}
