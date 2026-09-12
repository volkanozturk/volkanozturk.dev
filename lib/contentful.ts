import { createClient, type ContentfulClientApi } from 'contentful'
import { BlogPost, JourneyEntry, Bookmark } from '@/types'

let client: ContentfulClientApi<undefined> | null = null

/**
 * Created lazily: the site builds and renders (with empty states) before
 * Contentful is configured. Callers catch the error and fall back.
 */
function getClient(): ContentfulClientApi<undefined> {
  if (client) return client

  const space = process.env.CONTENTFUL_SPACE_ID
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN

  if (!space || !accessToken) {
    throw new Error(
      'Contentful is not configured: set CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN.'
    )
  }

  client = createClient({ space, accessToken })
  return client
}

// ─── Blog Posts ────────────────────────────────────────────────────────────────

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const entries = await getClient().getEntries<any>({
    content_type: 'blogPost',
    order: ['-fields.publishedDate'],
  })

  return entries.items as unknown as BlogPost[]
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const entries = await getClient().getEntries<any>({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  })

  if (!entries.items.length) return null
  return entries.items[0] as unknown as BlogPost
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const entries = await getClient().getEntries<any>({
    content_type: 'blogPost',
    select: ['fields.slug'],
  })

  return entries.items.map((item: any) => item.fields.slug)
}

// ─── Journey ──────────────────────────────────────────────────────────────────

export async function getAllJourneyEntries(): Promise<JourneyEntry[]> {
  const entries = await getClient().getEntries<any>({
    content_type: 'journeyEntry',
    order: ['-fields.startDate'],
  })

  return entries.items as unknown as JourneyEntry[]
}

// ─── Bookmarks ────────────────────────────────────────────────────────────────

export async function getAllBookmarks(): Promise<Bookmark[]> {
  const entries = await getClient().getEntries<any>({
    content_type: 'bookmark',
    order: ['fields.collection', 'fields.title'],
  })

  return entries.items as unknown as Bookmark[]
}

export async function getBookmarkCollections(): Promise<Record<string, Bookmark[]>> {
  const bookmarks = await getAllBookmarks()

  return bookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    const collection = bookmark.fields.collection
    if (!acc[collection]) {
      acc[collection] = []
    }
    acc[collection].push(bookmark)
    return acc
  }, {})
}
