'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Writing' },
  { href: '/journey', label: 'Journey' },
  { href: '/bookmarks', label: 'Bookmarks' },
] as const

export function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href="/"
          className="gradient-text text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          volkanozturk.dev
        </Link>

        <nav aria-label="Main" className="flex items-center gap-0.5">
          {navItems.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'nav-underline relative rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
