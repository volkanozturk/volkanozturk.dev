import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Clock } from 'lucide-react'
import type { BlogPost } from '@/types'
import type { Locale } from '@/i18n'
import { cn, formatDate, readingTime, tagStyle } from '@/lib/utils'

interface BlogCardProps {
  post: BlogPost
  locale: Locale
}

export function BlogCard({ post, locale }: BlogCardProps) {
  const t = useTranslations('blog')
  const { title, slug, excerpt, content, publishedDate, tags } = post.fields

  return (
    <Link
      href={`/${locale}/blog/${slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent/40 hover:shadow-lg hover:shadow-foreground/5"
    >
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        <time dateTime={publishedDate} className="tabular-nums">
          {formatDate(publishedDate, locale, 'd MMM yyyy')}
        </time>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {t('readingTime', { minutes: readingTime(content, excerpt) })}
        </span>
      </div>

      <h2 className="text-base font-semibold leading-snug text-foreground">{title}</h2>

      {excerpt && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
      )}

      {tags && tags.length > 0 && (
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
