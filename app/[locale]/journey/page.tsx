import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getAllJourneyEntries } from '@/lib/contentful'
import { JourneyItem } from '@/components/journey-item'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { SectionHeading } from '@/components/section-heading'
import { locales, type Locale } from '@/i18n'
import type { JourneyEntry } from '@/types'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'journey' })
  return { title: t('title'), description: t('description') }
}

export default async function JourneyPage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  setRequestLocale(locale)
  const t = await getTranslations('journey')

  let entries: JourneyEntry[] = []
  try {
    entries = await getAllJourneyEntries()
  } catch {
    // Contentful is not configured yet.
  }

  const groups = [
    { key: 'work', label: t('work'), items: entries.filter((e) => e.fields.type === 'work') },
    {
      key: 'education',
      label: t('education'),
      items: entries.filter((e) => e.fields.type === 'education'),
    },
  ].filter((group) => group.items.length > 0)

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} description={t('description')} />

      {groups.length === 0 ? (
        <EmptyState>{t('empty')}</EmptyState>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-6">
            <SectionHeading>{group.label}</SectionHeading>
            <div>
              {group.items.map((entry, i) => (
                <JourneyItem
                  key={entry.sys.id}
                  entry={entry}
                  locale={locale}
                  presentLabel={t('present')}
                  isLast={i === group.items.length - 1}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
