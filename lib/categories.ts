/**
 * Canonical category values — the exact strings written in a post's
 * frontmatter. `CATEGORY_LABELS` below maps them to what the UI shows.
 */
export const CATEGORIES = ['engineering', 'notes', 'life'] as const

export type Category = (typeof CATEGORIES)[number]

/** Filter state on the Writing page: a category, or everything. */
export type CategoryFilter = Category | 'all'

/** Display labels for the canonical values. */
export const CATEGORY_LABELS: Record<Category, string> = {
  engineering: 'Engineering',
  notes: 'Notes',
  life: 'Life',
}

const FALLBACK_CATEGORY: Category = 'notes'

function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

/**
 * Category is required in the application model, but a legacy entry (or a typo)
 * must not break the build. Such a post still falls back to `notes` — but never
 * silently: the fallback is reported in the build log, so a misconfigured post
 * surfaces in `npm run build` and in the Cloudflare build output instead of
 * quietly living in the wrong category forever.
 */
export function normalizeCategory(value: unknown, slug?: string): Category {
  const candidate = typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (isCategory(candidate)) return candidate

  console.warn(
    `[writing] Post ${slug ? `"${slug}"` : '(unknown slug)'} has an invalid category ` +
      `${JSON.stringify(value)} — falling back to "${FALLBACK_CATEGORY}". ` +
      `Set it to one of: ${CATEGORIES.join(', ')}.`
  )

  return FALLBACK_CATEGORY
}
