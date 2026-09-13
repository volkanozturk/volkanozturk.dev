import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { PageHeader } from '@/components/page-header'
import { WritingList } from '@/components/writing-list'
import { toWritingPost, type WritingPost } from '@/lib/writing'

const TITLE = 'Writing'
const DESCRIPTION =
  'Software engineering, everyday notes, and things I find worth writing about.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/blog', type: 'website' },
}

export default function BlogPage() {
  // Reduced to a lean serializable shape here so the Markdown body and the
  // reading-time calculation stay on the server.
  const posts: WritingPost[] = getAllPosts().map(toWritingPost)

  return (
    <div className="space-y-12">
      <PageHeader title={TITLE} description={DESCRIPTION} />

      {/*
        With no posts there is nothing to filter and no year to head, so the
        category controls and the grouped list are not rendered at all — just a
        quiet line. Both reappear on their own once a published post exists.
      */}
      {posts.length > 0 ? (
        <WritingList posts={posts} />
      ) : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nothing here yet. I&rsquo;m working on the first few pieces.
        </p>
      )}
    </div>
  )
}
