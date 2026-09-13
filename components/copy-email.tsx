'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { EMAIL } from '@/lib/nav'

/**
 * Copies the address to the clipboard. Success is both shown and announced; a
 * refusal (no clipboard API, an insecure context, a denied permission) shows
 * nothing at all — the address stays selectable and the mailto link still works,
 * so the button is a convenience rather than the only way through.
 *
 * The confirmation has a fixed-width slot reserved beside the button whether it
 * is showing or not, so it can neither shift the paragraph nor overlap the line
 * above it. The slot sits at the end of the text, where the reserved space reads
 * as ordinary trailing whitespace.
 */
export function CopyEmailButton() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      return
    }

    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className="inline-flex items-center align-middle">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        title="Copy email address"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-brand"
      >
        {copied ? (
          <Check className="h-[15px] w-[15px] text-brand" strokeWidth={2} aria-hidden />
        ) : (
          <Copy className="h-[15px] w-[15px]" strokeWidth={1.75} aria-hidden />
        )}
      </button>

      <span
        role="status"
        className="ml-1 w-[42px] shrink-0 whitespace-nowrap text-[11px] font-medium text-brand"
      >
        {copied ? 'Copied' : ''}
      </span>
    </span>
  )
}
