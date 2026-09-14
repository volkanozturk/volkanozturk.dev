import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/posts'
import { PostCardList } from '@/components/post-card'
import { ProjectCardList } from '@/components/project-card'
import { projects } from '@/content/projects'
import { toWritingPost, type WritingPost } from '@/lib/writing'

/** How many of the newest posts the home page shows. */
const HOME_POST_LIMIT = 3

/** How many projects the home page shows. Writing stays the longer list. */
const HOME_PROJECT_LIMIT = 2

export default function HomePage() {
  // `getAllPosts()` is already the published collection, newest first, so the
  // count is taken from it before the limit is applied — never from the cards.
  const published = getAllPosts()
  const recentPosts: WritingPost[] = published.slice(0, HOME_POST_LIMIT).map(toWritingPost)

  const selectedProjects = projects.slice(0, HOME_PROJECT_LIMIT)

  return (
    <div>
      <section className="hero-glow animate-enter relative isolate">
        <h1 className="text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[40px]">
          Hi, I&rsquo;m Volkan.
        </h1>
        <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
          I&rsquo;m a software engineer based in the Netherlands. I write about building
          reliable software, the things I learn along the way, and everyday life&mdash;from
          engineering challenges to starting a new chapter in another country.
        </p>
      </section>

      {recentPosts.length > 0 && (
        <section className="animate-enter mt-11">
          <h2 className="text-[21px] font-bold tracking-tight text-foreground">
            Latest writing
          </h2>

          <div className="mt-4">
            <PostCardList posts={recentPosts} preferSummary />
          </div>

          {/* Only worth offering when the archive holds more than the cards above. */}
          {published.length > recentPosts.length && (
            <Link
              href="/blog/"
              className="view-all mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 hover:text-foreground"
            >
              View all {published.length} posts
              <ArrowRight aria-hidden className="view-all-arrow h-4 w-4" />
            </Link>
          )}
        </section>
      )}

      {/*
        Secondary to the writing above: it comes after it, uses the same card
        proportions and the same heading size, and adds no emphasis of its own.
      */}
      {selectedProjects.length > 0 && (
        <section className="animate-enter mt-11">
          <h2 className="text-[21px] font-bold tracking-tight text-foreground">
            Selected projects
          </h2>
          <p className="mt-1.5 max-w-[58ch] text-[14.5px] leading-relaxed text-muted-foreground">
            A few independent products and experiments I&rsquo;ve built.
          </p>

          <div className="mt-4">
            <ProjectCardList projects={selectedProjects} />
          </div>

          {/* Same rule as the writing link: only shown when there is more to see. */}
          {projects.length > selectedProjects.length && (
            <Link
              href="/projects/"
              className="view-all mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors duration-150 hover:text-foreground"
            >
              View all {projects.length} projects
              <ArrowRight aria-hidden className="view-all-arrow h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
