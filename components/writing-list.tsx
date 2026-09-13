'use client'

import { useMemo, useState } from 'react'
import { CategoryFilterBar } from '@/components/category-filter'
import { PostListItem } from '@/components/post-list-item'
import type { CategoryFilter } from '@/lib/categories'
import { groupByYear, type WritingPost } from '@/lib/writing'

interface WritingListProps {
  posts: WritingPost[]
}

/**
 * Filtering is client-side on purpose: the site is statically exported, so the
 * server renders every post (good for crawlers and for JS-disabled readers) and
 * the category buttons narrow the list in the browser.
 */
export function WritingList({ posts }: WritingListProps) {
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
        <p className="py-6 text-sm text-muted-foreground">Nothing in this category yet.</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.year} className="space-y-2">
              <h2 className="text-xs font-semibold tabular-nums text-muted-foreground">
                {group.year}
              </h2>
              <div className="divide-y divide-border border-t border-border">
                {group.posts.map((post) => (
                  <PostListItem key={post.slug} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
