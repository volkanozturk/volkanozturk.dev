import { FileText, Home, Map, User, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

/** One definition, used by both the desktop sidebar and the mobile menu. */
export const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/blog', label: 'Writing', icon: FileText },
  { href: '/journey', label: 'Journey', icon: Map },
  { href: '/about', label: 'About', icon: User },
]

export const socialLinks = [
  { href: 'https://github.com/volkanozturk', label: 'GitHub' },
  { href: 'https://twitter.com/volkanozturk', label: 'X (Twitter)' },
  { href: 'https://linkedin.com/in/volkanozturk', label: 'LinkedIn' },
] as const

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export const LOCATION = 'Based in the Netherlands'

/** The one address published anywhere on the site. */
export const EMAIL = 'hello@volkanozturk.dev'
