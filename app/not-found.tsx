import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="bg-gradient-to-b from-foreground/25 to-foreground/5 bg-clip-text text-7xl font-bold text-transparent">
        404
      </p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="text-sm text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
      >
        Back to home
      </Link>
    </div>
  )
}
