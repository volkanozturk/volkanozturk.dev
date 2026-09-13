import type { ComponentType } from 'react'

/**
 * Thumbnails that are drawn rather than photographed.
 *
 * A post's `thumbnail` frontmatter field is either a path (starting with `/`,
 * served from `public/`) or one of the keys below. Both are optional: a post
 * without one renders as a card with no media column, so nothing has to be
 * invented for a future post that has no suitable image.
 */

/**
 * The same two shapes as the article's own lag diagram, with the labels and
 * baseline dropped. The point the article makes is carried by the shapes — one
 * curve returns to where it started, the other does not — so it survives at
 * thumbnail size, which the full labelled diagram would not.
 */
function KafkaLagThumbnail() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full bg-muted"
      role="img"
      aria-label="Two lag curves: one rises and drains back, the other keeps climbing."
    >
      {/* Top: a burst that drains back to where it started. */}
      <line
        x1="6" y1="26" x2="58" y2="26"
        stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5"
        className="text-foreground"
      />
      <path
        d="M6,24 L16,21 L24,9 L32,6 L40,13 L50,22 L58,24"
        fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        stroke="currentColor" strokeOpacity="0.45" className="text-foreground"
      />

      {/* Bottom: lag that never comes back down. */}
      <line
        x1="6" y1="58" x2="58" y2="58"
        stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5"
        className="text-foreground"
      />
      <path
        d="M6,56 L18,52 L30,45 L42,38 L58,34"
        fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        stroke="currentColor" className="text-brand"
      />
    </svg>
  )
}

/**
 * A plain typographic cover for the Java article: the language name in the
 * site's own face, on the same neutral tile as the other drawn thumbnails,
 * with a single short orange rule as the only accent. No logo, no illustration,
 * no decorative code — it simply names the subject and stays legible at 64px.
 */
function JavaCoverThumbnail() {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-muted"
      role="img"
      aria-label="Java"
    >
      <span className="text-[19px] font-semibold leading-none tracking-[-0.02em] text-foreground">
        Java
      </span>
      <span aria-hidden className="h-[3px] w-5 rounded-full bg-brand-bright" />
    </div>
  )
}

export const postThumbnails: Record<string, ComponentType> = {
  'kafka-lag': KafkaLagThumbnail,
  'java-cover': JavaCoverThumbnail,
}

/** True when the frontmatter value points at a file rather than a drawn tile. */
export function isImageThumbnail(value: string): boolean {
  return value.startsWith('/')
}

export function resolveThumbnail(value: string | undefined): ComponentType | null {
  if (!value || isImageThumbnail(value)) return null
  return postThumbnails[value] ?? null
}
