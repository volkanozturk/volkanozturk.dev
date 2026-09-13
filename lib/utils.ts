import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { enGB } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, pattern = 'd MMMM yyyy'): string {
  try {
    return format(parseISO(dateString), pattern, { locale: enGB })
  } catch {
    return dateString
  }
}

const WORDS_PER_MINUTE = 200

/** Strips the Markdown syntax that would otherwise inflate the word count. */
function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/\[figure:[a-z0-9-]+\]/gi, ' ') // figure markers
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> label
    .replace(/[#>*_`~-]/g, ' ')
}

/** Rough reading time in whole minutes; always at least 1. */
export function readingTime(body?: string, fallback?: string): number {
  const text = plainText(body || fallback || '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
