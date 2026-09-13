import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { TimelineEntry } from '@/components/timeline-entry'
import { journeyTimeline } from '@/content/journey'

const TITLE = 'Journey'
const DESCRIPTION = 'My career and education so far.'
const STACK = ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'AWS']

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/journey' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/journey', type: 'website' },
}

export default function JourneyPage() {
  return (
    <div className="space-y-12">
      <PageHeader title={TITLE} description={DESCRIPTION} />

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
