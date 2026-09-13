import Link from 'next/link'
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react'
import { getAllPosts } from '@/lib/posts'
import { PostListItem } from '@/components/post-list-item'
import { SectionHeading } from '@/components/section-heading'
import { toWritingPost, type WritingPost } from '@/lib/writing'

const socialLinks = [
  { icon: Github, href: 'https://github.com/volkanozturk', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/volkanozturk', label: 'X (Twitter)' },
  { icon: Linkedin, href: 'https://linkedin.com/in/volkanozturk', label: 'LinkedIn' },
] as const

export default function HomePage() {
  const recentPosts: WritingPost[] = getAllPosts().slice(0, 3).map(toWritingPost)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="hero-glow relative isolate">
        <h1 className="text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
          Hi, I&rsquo;m Volkan.
        </h1>

        {/* Roughly 58 characters per line — comfortable for a short intro. */}
        <div className="mt-6 max-w-[58ch] space-y-3">
          <p className="text-lg leading-relaxed text-foreground">
            Senior Java Developer at LeoVegas.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            I write about software, everyday life, and things I find worth sharing.
          </p>
        </div>

        {/*
          One row on a wide screen, wrapping on its own when it runs out of
          space. The icon strip is pulled left by its own padding so it lines up
          with the text above whenever it does wrap.
        */}
        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1">
          <p className="text-sm text-muted-foreground">Based in the Netherlands</p>

          <div className="-ml-2.5 flex items-center">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-brand"
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Latest writing */}
      {recentPosts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <SectionHeading>Latest writing</SectionHeading>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {recentPosts.map((post) => (
              <PostListItem key={post.slug} post={post} showCategory={false} showTags />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
