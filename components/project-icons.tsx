import type { ComponentType } from 'react'
import { Computer, House, MapPin, SearchCheck, Trophy, Wrench, type LucideIcon } from 'lucide-react'

/**
 * Square project tiles, drawn from the same Lucide set the navigation uses so
 * the weight and corner language match the rest of the site.
 *
 * Each tile pairs a subject glyph with a smaller accent badge, because one
 * glyph alone does not say what these projects do: a house is any housing site
 * until the magnifier-and-check is next to it. The badge sits in an opaque
 * `bg-muted` disc, which punches a clean hole in the subject glyph behind it
 * rather than letting the two sets of strokes collide.
 *
 * Everything is sized in percentages of the tile and coloured from theme
 * tokens, so one definition serves the 64px mobile tile and the 80px desktop
 * one and follows light and dark mode without a second asset.
 */
function IconTile({ subject: Subject, badge: Badge }: { subject: LucideIcon; badge: LucideIcon }) {
  return (
    // Decorative: the card's title and description already name the project,
    // exactly as the post cards treat their thumbnails.
    <div aria-hidden className="relative flex h-full w-full items-center justify-center bg-muted">
      <Subject
        className="h-1/2 w-1/2 -translate-x-[7%] -translate-y-[7%] text-foreground/80"
        strokeWidth={1.75}
      />
      <span className="absolute bottom-[12%] right-[12%] flex h-[42%] w-[42%] items-center justify-center rounded-full bg-muted">
        <Badge className="h-[78%] w-[78%] text-brand" strokeWidth={2} />
      </span>
    </div>
  )
}

/** Housing, screened: a house with a magnifier that carries a check. */
function HuurCheckIcon() {
  return <IconTile subject={House} badge={SearchCheck} />
}

/** Places, ranked: a map pin with a trophy. */
function OwntownIcon() {
  return <IconTile subject={MapPin} badge={Trophy} />
}

/** Old computers, restored: a computer with a wrench. */
function OldByteIcon() {
  return <IconTile subject={Computer} badge={Wrench} />
}

export const projectIcons: Record<string, ComponentType> = {
  huurcheck: HuurCheckIcon,
  owntown: OwntownIcon,
  oldbyte: OldByteIcon,
}

export function resolveProjectIcon(key: string): ComponentType | null {
  return projectIcons[key] ?? null
}
