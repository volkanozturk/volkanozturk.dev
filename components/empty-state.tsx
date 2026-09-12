export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background/40 p-10 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}
