import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { isLocale, localeDetails, locales, type Locale } from '@/i18n'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const SITE_URL = 'https://volkanozturk.dev'
const TWITTER_HANDLE = '@volkanozturk'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const resolved: Locale = isLocale(locale) ? locale : 'en'
  const t = await getTranslations({ locale: resolved, namespace: 'meta' })

  const title = t('title')
  const description = t('description')

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: t('titleTemplate'),
    },
    description,
    authors: [{ name: t('author'), url: SITE_URL }],
    creator: t('author'),
    alternates: {
      canonical: `/${resolved}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${resolved}`,
      siteName: title,
      locale: resolved,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!isLocale(locale)) notFound()

  // Enables static rendering for every message lookup below this layout.
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html
      lang={localeDetails[locale].htmlLang}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <main className="mx-auto w-full max-w-3xl flex-1 animate-fade-in px-4 py-16 md:px-6">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
