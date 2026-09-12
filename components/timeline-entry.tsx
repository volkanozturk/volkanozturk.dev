import { cn } from '@/lib/utils'

/** One timeline row, as stored in `journey.timeline` in the message files. */
export interface TimelineEntryData {
  year: string
  title: string
  description: string
  isCurrent?: boolean
}

interface TimelineEntryProps {
  entry: TimelineEntryData
  isLast?: boolean
}

export function TimelineEntry({ entry, isLast }: TimelineEntryProps) {
  const { year, title, description, isCurrent } = entry

  return (
    <article className="group relative flex flex-col gap-1 rounded-lg px-3 py-4 transition-colors hover:bg-accent/40 sm:flex-row sm:gap-6">
      {/*
        Year column. On sm+ the rail sits on the column's right edge and spans the
        full row height, so consecutive rows form one unbroken line; the year text
        is right-aligned with padding to keep it clear of the rail.
      */}
      <div className="relative shrink-0 sm:w-20">
        {!isLast && (
          <span
            aria-hidden
            className="absolute bottom-0 right-0 top-0 hidden w-px bg-border sm:block"
          />
        )}

        {isCurrent ? (
          <>
            {/* Mobile: a dot inline with the year slot. */}
            <span className="flex items-center gap-2 sm:hidden">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-status-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </span>
            {/* sm+: centred on the rail so the line runs into it. */}
            <span className="absolute right-0 top-1 hidden translate-x-1/2 sm:block">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-status-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </span>
          </>
        ) : (
          <time className="block pt-px font-mono text-xs tabular-nums text-muted-foreground sm:pr-5 sm:text-right">
            {year}
          </time>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            'font-semibold leading-snug',
            isCurrent ? 'text-foreground' : 'text-foreground/90'
          )}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  )
}
