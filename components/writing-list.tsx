'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CategoryFilterBar } from '@/components/category-filter'
import { PostListItem } from '@/components/post-list-item'
import type { CategoryFilter } from '@/lib/categories'
import { groupByYear, type WritingPost } from '@/lib/writing'
import type { Locale } from '@/i18n'

interface WritingListProps {
  posts: WritingPost[]
  locale: Locale
}

/**
 * Filtering is client-side on purpose: the site is statically exported, so the
 * server renders every post (good for crawlers and for JS-disabled readers) and
 * the category buttons narrow the list in the browser.
 */
export function WritingList({ posts, locale }: WritingListProps) {
  const t = useTranslations('blog')
  const [active, setActive] = useState<CategoryFilter>('all')

  const groups = useMemo(() => {
    const filtered =
      active === 'all' ? posts : posts.filter((post) => post.category === active)
    return groupByYear(filtered)
  }, [posts, active])

  return (
    <div className="space-y-10">
      <CategoryFilterBar active={active} onChange={setActive} />

      {groups.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">{t('emptyCategory')}</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.year} className="space-y-1">
              <h2 className="text-xs font-medium tabular-nums tracking-widest text-muted-foreground/70">
                {group.year}
              </h2>
              <div className="divide-y divide-border/60 border-t border-border/60">
                {group.posts.map((post) => (
                  <PostListItem key={post.slug} post={post} locale={locale} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
