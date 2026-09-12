'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { localeDetails, locales, type Locale } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  /** Current path with the locale prefix stripped, e.g. "/blog/foo". */
  pathWithoutLocale: string
}

/**
 * Pill buttons — plain links, so switching language works without JavaScript
 * and always lands on the same page in the new locale.
 */
export function LanguageSwitcher({ pathWithoutLocale }: LanguageSwitcherProps) {
  const current = useLocale() as Locale
  const t = useTranslations('nav')

  const suffix = pathWithoutLocale === '/' ? '' : pathWithoutLocale

  return (
    <nav
      aria-label={t('language')}
      className="ml-1 flex items-center gap-0.5 rounded-full border border-border/60 bg-background/60 p-0.5"
    >
      {locales.map((locale) => {
        const { flag, label } = localeDetails[locale]
        const isActive = locale === current

        return (
          <Link
            key={locale}
            href={`/${locale}${suffix}`}
            hrefLang={locale}
            lang={locale}
            aria-current={isActive ? 'true' : undefined}
            title={t('switchTo', { language: label })}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <span aria-hidden>{flag}</span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
