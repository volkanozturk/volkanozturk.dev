/**
 * The "Cut V" mark, used verbatim from the logo kit: the two supplied polygon
 * paths on their original 96×96 viewBox, untouched.
 *
 * `currentColor` means the mark simply takes the colour of the text beside it,
 * so it is charcoal on the light theme and off-white on the dark one without a
 * second asset or a theme-aware swap. It is decorative wherever the name is
 * already spelled out in real text next to it.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M8 16H28L46 56L36 78Z" />
      <path d="M66 16H88L56 84H38Z" />
    </svg>
  )
}
