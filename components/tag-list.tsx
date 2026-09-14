/**
 * One neutral pill style for every topic tag on the site.
 *
 * Deliberately quieter than a category badge: no colour of its own, a hairline
 * border instead of a tint, and no hover or pointer, because tags are not links
 * (there are no tag archive pages) — this is presentational only. Size, padding,
 * radius, order and placement are unchanged; only the fill, border, text colour
 * and weight move, to lift the label off the card.
 */
export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center rounded-md border border-tag-border bg-tag px-2.5 py-1 text-xs font-medium text-tag-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}
