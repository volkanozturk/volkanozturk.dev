import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold tracking-[-0.035em] text-foreground/15">404</p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="text-sm text-brand underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Back to home
      </Link>
    </div>
  )
}
