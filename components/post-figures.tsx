import type { ComponentType } from 'react'
import { KafkaLagFigure } from '@/components/figures/kafka-lag-figure'

/**
 * Diagrams that a post can pull into its body.
 *
 * Markdown carries no components, so a post references a figure by writing a
 * paragraph containing only `[figure:<key>]`. The Markdown renderer swaps that
 * paragraph for the component below, which keeps the diagram as real inline
 * SVG — themeable, responsive and translatable — instead of a flat image.
 */
export const postFigures: Record<string, ComponentType> = {
  'kafka-lag': KafkaLagFigure,
}

const FIGURE_PATTERN = /^\[figure:([a-z0-9-]+)\]$/i

/** Returns the figure component for a paragraph's text, if it is a reference. */
export function resolveFigure(text: string): ComponentType | null {
  const match = FIGURE_PATTERN.exec(text.trim())
  if (!match) return null
  return postFigures[match[1].toLowerCase()] ?? null
}
