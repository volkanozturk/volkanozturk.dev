import type { Metadata } from 'next'
import { BookmarkCard } from '@/components/bookmark-card'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { SectionHeading } from '@/components/section-heading'
import { getBookmarkCollections } from '@/content/bookmarks'
import type { Bookmark } from '@/types'

const TITLE = 'Bookmarks'
const DESCRIPTION = 'Links I saved because I found them useful or interesting.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/bookmarks' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/bookmarks', type: 'website' },
}

export default function BookmarksPage() {
  const collections: Record<string, Bookmark[]> = getBookmarkCollections()
  const collectionNames = Object.keys(collections).sort()

  return (
    <div className="space-y-12">
      <PageHeader title={TITLE} description={DESCRIPTION} />

      {collectionNames.length === 0 ? (
        <EmptyState>
          No bookmarks yet. Once I add some, they will show up here.
        </EmptyState>
      ) : (
        <div className="space-y-12">
          {collectionNames.map((collection) => (
            <section key={collection} className="space-y-6">
              <div className="flex items-center gap-3">
                <SectionHeading>{collection}</SectionHeading>
                <span className="text-xs tabular-nums text-muted-foreground/60">
                  {collections[collection].length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {collections[collection].map((bookmark) => (
                  <BookmarkCard key={bookmark.url} bookmark={bookmark} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
