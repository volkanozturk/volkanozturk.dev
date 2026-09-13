export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[760px] px-4 pb-10 sm:px-5 lg:px-8">
      <div className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Volkan Öztürk
        </p>
      </div>
    </footer>
  )
}
