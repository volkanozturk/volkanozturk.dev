import { ExternalLink } from 'lucide-react'
import type { Bookmark } from '@/types'

interface BookmarkCardProps {
  bookmark: Bookmark
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const { title, url, description } = bookmark

  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  })()

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-xl border border-border bg-background/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent/40 hover:shadow-md hover:shadow-foreground/5"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-foreground">{title}</h3>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      {description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      <span className="text-xs text-muted-foreground/70">{domain}</span>
    </a>
  )
}
