/** Rises during a burst, then returns to the baseline. */
const DRAINS = 'M2,46 L18,45 L30,41 L40,18 L52,10 L64,22 L78,38 L92,44 L118,45'

/** Rises and never returns. */
const GROWS = 'M2,46 L20,44 L34,39 L48,32 L62,27 L76,20 L90,15 L104,9 L118,4'

function Sketch({ d, label }: { d: string; label: string }) {
  return (
    <div className="flex-1">
      <svg
        viewBox="0 0 120 50"
        className="h-auto w-full text-foreground/70"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        {/* baseline */}
        <line
          x1="2"
          y1="46"
          x2="118"
          y2="46"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="0.75"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

/**
 * Two illustrative lag shapes. Deliberately unlabelled on both axes: these are
 * shapes, not measurements, so there are no numbers to mistake for real data.
 */
const ALT =
  'Two sketches of consumer lag over time. On the left, lag rises during a burst and then falls back to the baseline on its own. On the right, lag climbs and never returns to the baseline.'

export function KafkaLagFigure() {
  return (
    <figure className="article-wide not-prose" role="group" aria-label={ALT}>
      <div className="flex gap-6 rounded-lg border border-border bg-muted/30 p-5">
        <Sketch d={DRAINS} label="Burst that drains" />
        <Sketch d={GROWS} label="Lag that keeps growing" />
      </div>
      <figcaption>Illustrative shapes only — not measured data.</figcaption>
    </figure>
  )
}
