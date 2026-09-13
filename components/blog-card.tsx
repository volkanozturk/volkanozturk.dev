import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { WritingPost } from '@/lib/writing'
import { cn, formatDate, tagStyle } from '@/lib/utils'

interface BlogCardProps {
  post: WritingPost
}

export function BlogCard({ post }: BlogCardProps) {
  const { title, slug, excerpt, publishedDate, tags, minutes } = post

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent/40 hover:shadow-lg hover:shadow-foreground/5"
    >
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <time dateTime={publishedDate} className="tabular-nums">
          {formatDate(publishedDate, 'd MMM yyyy')}
        </time>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {minutes} min read
        </span>
      </div>

      <h2 className="text-base font-semibold leading-snug text-foreground">{title}</h2>

      {excerpt && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                tagStyle(tag)
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
