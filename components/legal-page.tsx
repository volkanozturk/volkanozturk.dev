import type { ReactNode } from 'react'

/** Inline link styling, matching the one used inside article prose and on About. */
export const legalLinkClass =
  'text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-150 hover:decoration-brand'

/**
 * Plain informational pages (the Home Health pages): the About page's heading
 * and muted body text, with quiet section headings for longer documents.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  /** Shown as "Last updated …"; omit on pages that are not policies. */
  updated?: string
  children: ReactNode
}) {
  return (
    <article className="animate-enter">
      <h1 className="text-[32px] font-bold leading-[1.12] tracking-[-0.035em] text-foreground sm:text-[40px]">
        {title}
      </h1>
      {updated && <p className="mt-3 text-[12.5px] text-muted-foreground">Last updated {updated}</p>}
      <div className="mt-6 max-w-[65ch] space-y-5 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </article>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 pt-3">
      <h2 className="text-[21px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground/60">{children}</ul>
}

/** Emphasis inside muted body text. */
export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>
}
