/** Bookmark shown on /bookmarks, grouped by `collection`. */
export interface Bookmark {
  title: string
  url: string
  description?: string
  collection: string
  tags?: string[]
}
