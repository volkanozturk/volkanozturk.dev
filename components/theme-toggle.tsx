'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme'
import { cn } from '@/lib/utils'

/**
 * Applied before first paint by the inline script in the root layout, so this
 * component never decides the initial theme — it only reports and flips it.
 * Reading the class rather than storage keeps the two in step even when
 * storage is unavailable.
 */
function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeToggle({ className }: { className?: string }) {
  // Undefined until mounted: the server cannot know the visitor's theme, so the
  // button ships with a neutral label and names its action once it is hydrated.
  const [theme, setTheme] = useState<Theme | undefined>(undefined)

  useEffect(() => setTheme(currentTheme()), [])

  function toggle() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    root.classList.toggle('dark', next === 'dark')
    root.style.colorScheme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Private mode or blocked storage: the choice simply lasts this page.
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === undefined
          ? 'Switch theme'
          : theme === 'dark'
            ? 'Switch to light theme'
            : 'Switch to dark theme'
      }
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground/70 transition-colors duration-150 hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {/*
        Both icons are in the markup and CSS picks one, so the button renders
        correctly on the server and never mismatches during hydration.
      */}
      <Moon className="h-[18px] w-[18px] dark:hidden" strokeWidth={1.75} aria-hidden />
      <Sun className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.75} aria-hidden />
    </button>
  )
}
