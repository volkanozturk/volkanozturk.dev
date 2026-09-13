import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SITE_URL } from '@/lib/site'

/** Canonical English URLs only — the site has no other language. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/blog', '/journey', '/about'].map((path) => ({
    url: `${SITE_URL}${path}/`,
    lastModified: new Date(),
  }))

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}/`,
    lastModified: new Date(post.publishedDate),
  }))

  return [...staticPages, ...posts]
}
