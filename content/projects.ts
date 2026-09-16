/**
 * Independent products and experiments, newest first.
 *
 * The one definition behind both the `Selected projects` section on the home
 * page and the `/projects` page, so a title, description or URL is never
 * written down twice.
 *
 * `icon` names a tile in `components/project-icons.tsx`. Every project has its
 * own drawing — there is deliberately no shared fallback, so a new entry has to
 * bring a visual that explains what it is.
 */
export interface Project {
  /** Stable key. Not a route: these projects live on their own domains. */
  slug: string
  title: string
  description: string
  /** Absolute URL. The card links out to it in a new tab. */
  url: string
  /** Key into `projectIcons`. */
  icon: string
}

export const projects: Project[] = [
  {
    slug: 'huurcheck',
    title: 'HuurCheck',
    description: 'A rent-screening tool for renters in the Netherlands.',
    url: 'https://www.huurcheck.net/',
    icon: 'huurcheck',
  },
  {
    slug: 'owntown',
    title: 'owntown.lol',
    description:
      'A playful map-based ranking game where people vote for their place in the Netherlands.',
    url: 'https://www.owntown.lol/',
    icon: 'owntown',
  },
  {
    slug: 'oldbyte',
    title: 'OldByte',
    description:
      'A small vintage-computing project where I restore classic Macintosh computers and help them find new homes.',
    url: 'https://www.etsy.com/shop/OldByte',
    icon: 'oldbyte',
  },
]

/**
 * The card's one line of metadata. Derived from `url` rather than written by
 * hand so it cannot drift from the link, and deliberately nothing more: no
 * stack, no status, no counts. A project that lives under a path on a shared
 * host (a shop page, say) keeps that path, so the line names the project and
 * not just the platform.
 */
export function projectHost(url: string): string {
  try {
    const { host, pathname } = new URL(url)
    return host.replace(/^www\./, '') + pathname.replace(/\/+$/, '')
  } catch {
    return url
  }
}
