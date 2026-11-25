import { EB_Garamond, Oswald } from 'next/font/google'
import './books.css'

/*
 * Spine lettering. Many spines are set in a serif or a condensed face, and a
 * sans-only shelf reads as a list of labels. Both fonts are self-hosted by
 * next/font and only requested on the /books routes. latin-ext covers Turkish.
 */
const serif = EB_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-spine-serif',
  display: 'swap',
})
const condensed = Oswald({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-spine-condensed',
  display: 'swap',
})

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return <div className={`bk ${serif.variable} ${condensed.variable}`}>{children}</div>
}
