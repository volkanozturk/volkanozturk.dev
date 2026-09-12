import Link from 'next/link'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight, Github, Linkedin, Twitter } from 'lucide-react'
import { getAllPosts } from '@/lib/posts'
import { BlogCard } from '@/components/blog-card'
import { SectionHeading } from '@/components/section-heading'
import { locales, type Locale } from '@/i18n'
import { toWritingPost, type WritingPost } from '@/lib/writing'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const socialLinks = [
  { icon: Github, href: 'https://github.com/volkanozturk', key: 'github' },
  { icon: Twitter, href: 'https://twitter.com/volkanozturk', key: 'twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/in/volkanozturk', key: 'linkedin' },
] as const

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  setRequestLocale(locale)

  const t = await getTranslations('home')
  const tSocial = await getTranslations('social')

  const recentPosts: WritingPost[] = getAllPosts().slice(0, 3).map(toWritingPost)

  const sections = [
    { href: `/${locale}/blog`, key: 'writing' },
    { href: `/${locale}/journey`, key: 'journey' },
    { href: `/${locale}/bookmarks`, key: 'bookmarks' },
  ] as const

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="hero-aurora relative isolate space-y-5">
        <span className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          {t('status')}
        </span>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('greeting')}
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('bio')}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {socialLinks.map(({ icon: Icon, href, key }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tSocial(key)}
              title={tSocial(key)}
              className="rounded-xl border border-border/60 bg-background/60 p-3 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:text-foreground hover:shadow-md hover:shadow-foreground/5"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <SectionHeading>{t('recentPosts')}</SectionHeading>
            <Link
              href={`/${locale}/blog`}
              className="group flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t('viewAll')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentPosts.map((post) => (
              <BlogCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Section links */}
      <section className="space-y-6">
        <SectionHeading>{t('sections.title')}</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-border bg-background/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent/50 hover:shadow-md hover:shadow-foreground/5"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-foreground">
                  {t(`sections.${key}.title`)}
                </h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`sections.${key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
