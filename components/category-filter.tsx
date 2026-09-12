'use client'

import { useTranslations } from 'next-intl'
import { CATEGORIES, type CategoryFilter } from '@/lib/categories'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  active: CategoryFilter
  onChange: (next: CategoryFilter) => void
}

/**
 * Three plain text controls — one per real category. Clicking the active one
 * clears the filter, so there is a single way back to all posts and "All" never
 * masquerades as a fourth category.
 */
export function CategoryFilterBar({ active, onChange }: CategoryFilterProps) {
  const t = useTranslations('blog')

  return (
    <div
      role="group"
      aria-label={t('filterLabel')}
      className="flex flex-wrap items-center gap-1"
    >
      {CATEGORIES.map((category) => {
        const isActive = active === category

        return (
          <button
            key={category}
            type="button"
            aria-pressed={isActive}
            title={isActive ? t('showAll') : undefined}
            onClick={() => onChange(isActive ? 'all' : category)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            {t(`categories.${category}`)}
          </button>
        )
      })}
    </div>
  )
}
