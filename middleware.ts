import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from './i18n'

/**
 * Locale detection + redirect for server-rendered deployments.
 *
 * Note: the production build uses `output: 'export'` (Cloudflare Pages), where
 * Next.js does not run middleware. The static `/` entry point in `public/index.html`
 * performs the same detection on the client, with a no-JS meta-refresh fallback.
 */
export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: 'always',
})

export const config = {
  // Skip Next.js internals and any path that contains a file extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
