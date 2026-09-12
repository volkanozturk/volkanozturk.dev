import type { Bookmark } from '@/types'

/**
 * Bookmarks, grouped in the UI by `collection`.
 *
 * Empty because the Contentful `bookmark` model held zero entries at migration
 * time — nothing was dropped. Add entries here and they appear on /bookmarks.
 */
export const bookmarks: Bookmark[] = []

export function getBookmarkCollections(): Record<string, Bookmark[]> {
  return bookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    if (!acc[bookmark.collection]) acc[bookmark.collection] = []
    acc[bookmark.collection].push(bookmark)
    return acc
  }, {})
}
