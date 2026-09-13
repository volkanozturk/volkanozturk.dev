/**
 * Shared by the pre-paint inline script (a server component) and the toggle (a
 * client component). It lives here rather than in either of them because a
 * value imported from a `'use client'` module reaches the server as a client
 * reference, not as the string itself.
 */
export const THEME_STORAGE_KEY = 'theme'

export type Theme = 'light' | 'dark'
