import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/posts'
import { PostCardList } from '@/components/post-card'
import { toWritingPost, type WritingPost } from '@/lib/writing'

export default function HomePage() {
  const recentPosts: WritingPost[] = getAllPosts().slice(0, 3).map(toWritingPost)

  return (
    <div>
      <section className="hero-glow animate-enter relative isolate">
        <h1 className="text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[40px]">
          Hi, I&rsquo;m Volkan.
        </h1>
        <p className="mt-2 text-[18px] font-medium leading-snug text-foreground">
          Senior Java Developer at LeoVegas.
        </p>
        <p className="mt-2 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
          I write about software, everyday life, and things I find worth sharing.
        </p>
      </section>

      {recentPosts.length > 0 && (
        <section className="animate-enter mt-11">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[21px] font-bold tracking-tight text-foreground">
              Latest writing
            </h2>
            <Link
              href="/blog"
              className="view-all inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 hover:text-foreground"
            >
              View all
              <ArrowRight aria-hidden className="view-all-arrow h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4">
            <PostCardList posts={recentPosts} preferSummary />
          </div>
        </section>
      )}
    </div>
  )
}
