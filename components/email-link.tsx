import { Mail } from 'lucide-react'
import { EMAIL } from '@/lib/nav'
import { cn } from '@/lib/utils'

/**
 * The public address, on its own line in the sidebar and the mobile menu. It is
 * deliberately not part of `SocialIcons`: one visible line, not a fourth icon.
 * Keyboard focus is handled by the global `:focus-visible` ring.
 */
export function EmailLink({ className }: { className?: string }) {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className={cn(
        'flex w-fit max-w-full items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-150 hover:text-brand',
        className
      )}
    >
      <Mail className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="truncate">{EMAIL}</span>
    </a>
  )
}
