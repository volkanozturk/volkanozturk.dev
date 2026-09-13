interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="max-w-[58ch] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </header>
  )
}
