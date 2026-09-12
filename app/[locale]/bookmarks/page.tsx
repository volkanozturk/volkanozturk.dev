import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getBookmarkCollections } from '@/content/bookmarks'
import { BookmarkCard } from '@/components/bookmark-card'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { SectionHeading } from '@/components/section-heading'
import { locales, type Locale } from '@/i18n'
import type { Bookmark } from '@/types'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'bookmarks' })
  return { title: t('title'), description: t('description') }
}

export default async function BookmarksPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('bookmarks')

  const collections: Record<string, Bookmark[]> = getBookmarkCollections()

  const collectionNames = Object.keys(collections).sort()

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} description={t('description')} />

      {collectionNames.length === 0 ? (
        <EmptyState>{t('empty')}</EmptyState>
      ) : (
        <div className="space-y-12">
          {collectionNames.map((collection) => (
            <section key={collection} className="space-y-6">
              <div className="flex items-center gap-3">
                <SectionHeading>{collection}</SectionHeading>
                <span className="text-xs tabular-nums text-muted-foreground/60">
                  {collections[collection].length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {collections[collection].map((bookmark) => (
                  <BookmarkCard key={bookmark.url} bookmark={bookmark} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
