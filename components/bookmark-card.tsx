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
      className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:border-foreground/25"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-brand">
          {title}
        </h3>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
      </div>

      {description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      <span className="text-xs text-muted-foreground/80">{domain}</span>
    </a>
  )
}
