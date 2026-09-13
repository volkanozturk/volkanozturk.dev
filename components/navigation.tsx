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
      {/*
        Below sm the four links plus the wordmark are wider than a phone screen,
        so the bar stacks rather than pushing "Bookmarks" past the viewport. The
        links also carry tighter padding there, which keeps the row inside a
        320px screen even once a visible scrollbar takes its 15px.
      */}
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-1 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 md:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-brand"
        >
          volkanozturk.dev
        </Link>

        {/* Pulled left by the links' own padding so "Home" aligns with the wordmark. */}
        <nav aria-label="Main" className="-ml-2 flex items-center gap-0.5 sm:ml-0">
          {navItems.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'nav-underline relative rounded-md px-2 py-2 text-sm transition-colors sm:px-3',
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
