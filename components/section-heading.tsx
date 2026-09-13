/** Quiet section label — plain sentence case, no rule, no wide tracking. */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold tracking-tight text-foreground">{children}</h2>
  )
}
