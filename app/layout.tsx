import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SiteShell } from '@/components/site-shell'
import { Footer } from '@/components/footer'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, TWITTER_HANDLE } from '@/lib/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · Volkan Öztürk',
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Volkan Öztürk', url: SITE_URL }],
  creator: 'Volkan Öztürk',
  alternates: { canonical: '/' },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <SiteShell>
          <main className="mx-auto w-full max-w-[760px] flex-1 px-4 pb-16 pt-10 sm:px-5 lg:px-8 lg:pt-20">
            {children}
          </main>
          <Footer />
        </SiteShell>
      </body>
    </html>
  )
}
