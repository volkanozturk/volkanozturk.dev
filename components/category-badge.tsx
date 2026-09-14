import { CATEGORY_LABELS, type Category } from '@/lib/categories'
import { cn } from '@/lib/utils'

/**
 * The one category pill, used by the home cards, the Writing index and the
 * article header — so a category looks the same everywhere it is named.
 *
 * This is not the category *filter*: the controls on the Writing page keep
 * their own outline-and-brand styling, because they are buttons that toggle
 * state rather than labels that describe a post.
 *
 * Colour is an accent, never the message: the category name is always spelled
 * out, so nothing depends on telling three muted tints apart. Each pair clears
 * 4.5:1 in both themes (ratios recorded in docs/design-standards.md).
 */
const BADGE_COLOURS: Record<Category, string> = {
  notes: 'bg-category-notes text-category-notes-foreground',
  engineering: 'bg-category-engineering text-category-engineering-foreground',
  life: 'bg-category-life text-category-life-foreground',
}

/** For a value outside the known set — greys out rather than guessing a colour. */
const NEUTRAL = 'bg-category-neutral text-category-neutral-foreground'

export function CategoryBadge({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center rounded-full px-2 text-[13px] font-medium leading-none',
        BADGE_COLOURS[category] ?? NEUTRAL,
        className
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  )
}
