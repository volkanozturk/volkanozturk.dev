'use client'

import { CATEGORIES, CATEGORY_LABELS, type CategoryFilter } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  active: CategoryFilter
  onChange: (next: CategoryFilter) => void
}

/**
 * "All" plus one control per real category. "All" clears the filter, and so
 * does clicking the category that is already active — both routes lead to the
 * same state, so the bar never disagrees with itself.
 */
export function CategoryFilterBar({ active, onChange }: CategoryFilterProps) {
  const controls = [
    { key: 'all' as const, label: 'All' },
    ...CATEGORIES.map((category) => ({ key: category, label: CATEGORY_LABELS[category] })),
  ]

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="flex flex-wrap justify-center gap-2"
    >
      {controls.map(({ key, label }) => {
        const isActive = active === key

        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            title={isActive && key !== 'all' ? 'Show all posts' : undefined}
            onClick={() => onChange(isActive ? 'all' : key)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm transition-colors',
              // `text-background` inverts with the theme: white on a dark orange in
              // light mode, dark on a light orange in dark mode.
              isActive
                ? 'border-brand bg-brand text-background'
                : 'border-border text-muted-foreground hover:border-brand/40 hover:text-foreground'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
