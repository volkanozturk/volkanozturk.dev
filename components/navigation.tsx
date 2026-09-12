'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'

const navItems = [
  { segment: '', key: 'home' },
  { segment: '/blog', key: 'writing' },
  { segment: '/journey', key: 'journey' },
  { segment: '/bookmarks', key: 'bookmarks' },
] as const

export function Navigation() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')

  // Path without the locale prefix, e.g. "/en/blog/foo" -> "/blog/foo".
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 md:px-6">
        <Link
          href={`/${locale}`}
          className="gradient-text text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          volkanozturk.dev
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Main" className="flex items-center gap-0.5">
            {navItems.map(({ segment, key }) => {
              const isActive =
                segment === ''
                  ? pathWithoutLocale === '/'
                  : pathWithoutLocale.startsWith(segment)

              return (
                <Link
                  key={key}
                  href={`/${locale}${segment}`}
                  data-active={isActive}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'nav-underline relative rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(key)}
                </Link>
              )
            })}
          </nav>

          <LanguageSwitcher pathWithoutLocale={pathWithoutLocale} />
        </div>
      </div>
    </header>
  )
}
