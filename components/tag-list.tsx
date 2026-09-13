/**
 * One neutral pill style for every tag on the site. Tags are not links — there
 * are no tag archive pages — so this stays purely presentational.
 */
export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-x-1.5 gap-y-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  )
}
