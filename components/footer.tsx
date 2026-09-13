export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Volkan Öztürk
        </p>
      </div>
    </footer>
  )
}
