import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'tr', 'nl'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Metadata used by the language switcher and by <html lang>. */
export const localeDetails: Record<Locale, { label: string; flag: string; htmlLang: string }> = {
  en: { label: 'EN', flag: '🇬🇧', htmlLang: 'en' },
  tr: { label: 'TR', flag: '🇹🇷', htmlLang: 'tr' },
  nl: { label: 'NL', flag: '🇳🇱', htmlLang: 'nl' },
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value)
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = isLocale(requested) ? requested : defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
