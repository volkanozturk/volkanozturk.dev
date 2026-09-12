interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      {description && (
        <p className="max-w-xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </header>
  )
}
