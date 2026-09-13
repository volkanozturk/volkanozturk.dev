const socialLinks = [
  { href: 'https://github.com/volkanozturk', label: 'GitHub' },
  { href: 'https://twitter.com/volkanozturk', label: 'X (Twitter)' },
  { href: 'https://linkedin.com/in/volkanozturk', label: 'LinkedIn' },
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/30 py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Volkan Öztürk. All rights reserved.
        </p>
        <nav aria-label="Social" className="flex items-center gap-4">
          {socialLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
