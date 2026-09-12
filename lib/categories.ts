/**
 * Canonical category values. These are the exact strings written in a post's
 * frontmatter — never translated there. The UI maps them to localized labels
 * via the `blog.categories.*` message keys.
 */
export const CATEGORIES = ['engineering', 'notes', 'life'] as const

export type Category = (typeof CATEGORIES)[number]

/** Filter state on the Writing page: a category, or everything. */
export type CategoryFilter = Category | 'all'

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
