/**
 * One neutral pill style for every tag on the site — a soft grey fill rather
 * than an outline, and no per-category colours. Tags are not links (there are
 * no tag archive pages), so this is presentational.
 */
export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}
