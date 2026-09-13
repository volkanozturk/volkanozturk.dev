'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { LOCATION, isActivePath, navItems } from '@/lib/nav'
import { EmailLink } from '@/components/email-link'
import { LogoMark } from '@/components/logo-mark'
import { SocialIcons } from '@/components/social-icons'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <ul className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href)

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                active
                  ? 'bg-brand/[0.06] font-medium text-brand'
                  : 'text-foreground/75 hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function Identity() {
  return (
    <div>
      <Link
        href="/"
        className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-foreground"
      >
        <LogoMark className="h-7 w-7 shrink-0" />
        <span className="inline-flex items-center gap-1.5">
          volkan öztürk
          <span aria-hidden className="h-[2px] w-2.5 rounded-full bg-brand-bright" />
        </span>
      </Link>
      <p className="mt-1.5 text-sm text-muted-foreground">Senior Java Developer</p>
      <p className="text-sm text-muted-foreground">volkanozturk.dev</p>
    </div>
  )
}

/**
 * The site shell: a fixed sidebar from 1024px up, and a compact header with a
 * disclosure menu below that. Both render the same navigation and the same
 * social links, so there is only one definition of either.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Move focus into the panel when it opens, so the keyboard lands somewhere useful.
  useEffect(() => {
    if (open) panelRef.current?.querySelector('a')?.focus()
  }, [open])

  // A navigation always leaves the menu closed.
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      {/*
        Without JavaScript the toggle cannot work, so the panel is revealed
        instead and the button removed — the same links, always reachable.
      */}
      <noscript>
        <style>{`.js-menu-toggle{display:none!important}.js-menu-panel{display:block!important}`}</style>
      </noscript>

      {/* Desktop sidebar. Scrolls internally so a short screen never overlaps. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col overflow-y-auto border-r border-border bg-sidebar px-5 py-7 lg:flex">
        <Identity />

        <nav aria-label="Main" className="mt-8">
          <NavLinks />
        </nav>

        <div className="mt-auto pt-8">
          <p className="text-xs text-muted-foreground">{LOCATION}</p>
          <EmailLink className="mt-2" />
          <div className="-ml-2 mt-2 flex items-center justify-between gap-2">
            <SocialIcons />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-60">
        {/* Mobile / tablet header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link
              href="/"
              className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground"
            >
              <LogoMark className="h-6 w-6 shrink-0" />
              volkan öztürk
            </Link>

            <div className="flex items-center gap-1">
              <ThemeToggle />

              <button
                ref={toggleRef}
                type="button"
                className="js-menu-toggle inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors duration-150 hover:border-brand/40 hover:text-brand"
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div
            id="site-menu"
            ref={panelRef}
            className={cn('js-menu-panel border-t border-border px-4 py-4 sm:px-5', !open && 'hidden')}
          >
            <nav aria-label="Main">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">{LOCATION}</p>
              <EmailLink className="mt-2" />
              <SocialIcons className="-ml-2 mt-2" />
            </div>
          </div>
        </header>

        {children}
      </div>
    </>
  )
}
