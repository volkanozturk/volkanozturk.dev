import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SITE_URL } from '@/lib/site'

// `output: 'export'` requires this route to opt into static rendering
// explicitly, or the build fails (see vercel/next.js#68667).
export const dynamic = 'force-static'

/** Canonical English URLs only — the site has no other language. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/blog', '/journey', '/projects', '/about'].map((path) => ({
    url: `${SITE_URL}${path}/`,
    lastModified: new Date(),
  }))

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}/`,
    lastModified: new Date(post.publishedDate),
  }))

  return [...staticPages, ...posts]
}
