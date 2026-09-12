import { useTranslations } from 'next-intl'

const socialLinks = [
  { href: 'https://github.com/volkanozturk', key: 'github' },
  { href: 'https://twitter.com/volkanozturk', key: 'twitter' },
  { href: 'https://linkedin.com/in/volkanozturk', key: 'linkedin' },
] as const

export function Footer() {
  const t = useTranslations('footer')
  const tSocial = useTranslations('social')

  return (
    <footer className="mt-24 border-t border-border/30 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          {/* Passed as a string so it is not formatted as "2,026". */}
          {t('rights', { year: String(new Date().getFullYear()) })}
        </p>
        <nav aria-label="Social" className="flex items-center gap-4">
          {socialLinks.map(({ href, key }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {tSocial(key)}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
