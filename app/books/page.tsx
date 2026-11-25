import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { Bookshelf } from '@/components/books/bookshelf'

const TITLE = 'Books'
const DESCRIPTION = 'A personal library.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/books' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/books', type: 'website' },
}

export default function BooksPage() {
  return (
    <div className="bk-library space-y-12">
      <PageHeader title={TITLE} description={DESCRIPTION} />
      <Bookshelf />
    </div>
  )
}
