import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHeader } from '@/components/page-header'
import { TimelineEntry } from '@/components/timeline-entry'
import { journeyTimeline } from '@/lib/journey-data'
import { locales, type Locale } from '@/i18n'

const STACK = ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'AWS']

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

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} description={t('description')} />

      <div className="-mx-3">
        {journeyTimeline.map((entry, i) => (
          <TimelineEntry
            key={entry.year + entry.title}
            entry={entry}
            isLast={i === journeyTimeline.length - 1}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border/40 pt-8">
        {STACK.map((item) => (
          <span
            key={item}
            className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
