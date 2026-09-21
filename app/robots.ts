import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// `output: 'export'` requires this route to opt into static rendering
// explicitly, or the build fails (see vercel/next.js#68667).
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
