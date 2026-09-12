import { Briefcase, GraduationCap } from 'lucide-react'
import type { JourneyEntry } from '@/types'
import type { Locale } from '@/i18n'
import { cn, formatDateRange } from '@/lib/utils'

interface JourneyItemProps {
  entry: JourneyEntry
  locale: Locale
  presentLabel: string
  isLast?: boolean
}

export function JourneyItem({ entry, locale, presentLabel, isLast }: JourneyItemProps) {
  const { company, role, startDate, endDate, description, type, location, url } =
    entry.fields

  const Icon = type === 'education' ? GraduationCap : Briefcase

  return (
    <div className="relative flex gap-4">
      {/* Timeline line — fades out towards the next entry. */}
      {!isLast && (
        <div
          className="absolute bottom-0 left-4 top-9 w-px bg-gradient-to-b from-border via-border to-transparent"
          aria-hidden
        />
      )}

      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border shadow-sm shadow-foreground/5',
          type === 'education'
            ? 'bg-blue-50 dark:bg-blue-950'
            : 'bg-background'
        )}
      >
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 pb-8">
        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{role}</h3>
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                {company}
                {location && ` · ${location}`}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                {company}
                {location && ` · ${location}`}
              </p>
            )}
          </div>
          <time className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {formatDateRange(startDate, endDate, locale, presentLabel)}
          </time>
        </div>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
