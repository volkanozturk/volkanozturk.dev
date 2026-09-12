import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { WritingPost } from '@/lib/writing'
import type { Locale } from '@/i18n'
import { formatDate } from '@/lib/utils'

interface PostListItemProps {
  post: WritingPost
  locale: Locale
}

/**
 * Editorial row for the Writing index — title, excerpt, one metadata line.
 * Tags are deliberately left to the individual post page.
 * (The card-style `BlogCard` is still used for the short list on the home page.)
 */
export function PostListItem({ post, locale }: PostListItemProps) {
  const t = useTranslations('blog')
  const { slug, title, excerpt, publishedDate, category, minutes } = post

  return (
    <article className="group -mx-3">
      <Link
        href={`/${locale}/blog/${slug}`}
        className="block rounded-lg px-3 py-6 transition-colors hover:bg-accent/40"
      >
        <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>

        {excerpt && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
        )}

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={publishedDate} className="tabular-nums">
            {formatDate(publishedDate, locale, 'd MMM yyyy')}
          </time>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>{t(`categories.${category}`)}</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>{t('readingTime', { minutes })}</span>
        </p>
      </Link>
    </article>
  )
}
