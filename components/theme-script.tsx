import { THEME_STORAGE_KEY } from '@/lib/theme'

/**
 * Runs before the first paint so the correct theme is already on <html> when
 * the page renders — no flash, and nothing for React to reconcile. A stored
 * choice wins; otherwise the system preference decides.
 */
const script = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
