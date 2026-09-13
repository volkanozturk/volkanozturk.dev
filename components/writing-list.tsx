'use client'

import { useMemo, useState } from 'react'
import { CategoryFilterBar } from '@/components/category-filter'
import { PostCardList } from '@/components/post-card'
import type { CategoryFilter } from '@/lib/categories'
import type { WritingPost } from '@/lib/writing'

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

  const visible = useMemo(
    () => (active === 'all' ? posts : posts.filter((post) => post.category === active)),
    [posts, active]
  )

  return (
    <div className="space-y-8">
      <CategoryFilterBar active={active} onChange={setActive} />

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nothing in this category yet.
        </p>
      ) : (
        <PostCardList posts={visible} showTags />
      )}
    </div>
  )
}
