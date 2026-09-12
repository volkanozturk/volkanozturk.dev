import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, type Locale as DateFnsLocale } from 'date-fns'
import { enGB, nl, tr } from 'date-fns/locale'
import type { Document } from '@contentful/rich-text-types'
import type { Locale } from '@/i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateLocales: Record<Locale, DateFnsLocale> = {
  en: enGB,
  tr,
  nl,
}

export function formatDate(
  dateString: string,
  locale: Locale = 'en',
  pattern = 'd MMMM yyyy'
): string {
  try {
    return format(parseISO(dateString), pattern, { locale: dateLocales[locale] })
  } catch {
    return dateString
  }
}

/**
 * "Mar 2021 – Present" — the trailing label is passed in already translated,
 * because this helper is also used outside of a React render.
 */
export function formatDateRange(
  startDate: string,
  endDate: string | undefined,
  locale: Locale,
  presentLabel: string
): string {
  const start = formatDate(startDate, locale, 'MMM yyyy')
  const end = endDate ? formatDate(endDate, locale, 'MMM yyyy') : presentLabel
  return `${start} – ${end}`
}

const WORDS_PER_MINUTE = 200

/** Flattens the text of a Contentful rich text document. */
function extractText(node: any): string {
  if (!node) return ''
  if (typeof node.value === 'string') return node.value
  if (Array.isArray(node.content)) return node.content.map(extractText).join(' ')
  return ''
}

/** Rough reading time in whole minutes; always at least 1. */
export function readingTime(content?: Document, fallback?: string): number {
  const text = content ? extractText(content) : (fallback ?? '')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

const TAG_STYLES = [
  'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
  'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
]

/** Stable pastel colour per tag, so a tag keeps the same colour across pages. */
export function tagStyle(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0
  }
  return TAG_STYLES[hash % TAG_STYLES.length]
}
