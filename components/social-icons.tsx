import { Github, Linkedin, Twitter } from 'lucide-react'
import { socialLinks } from '@/lib/nav'
import { cn } from '@/lib/utils'

const icons = { GitHub: Github, 'X (Twitter)': Twitter, LinkedIn: Linkedin } as const

/** The site's three social destinations — unchanged URLs, shown as plain icons. */
export function SocialIcons({ className }: { className?: string }) {
  return (
    <ul className={cn('flex items-center gap-1', className)}>
      {socialLinks.map(({ href, label }) => {
        const Icon = icons[label]
        return (
          <li key={href}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors duration-150 hover:text-brand"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
