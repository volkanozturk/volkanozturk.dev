import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  /*
   * `dark` is applied at runtime rather than written into any component, so
   * without this the whole `.dark` token block in globals.css gets purged and
   * the dark palette silently does nothing.
   */
  safelist: ['dark'],
  theme: {
    extend: {
      screens: {
        // Narrow phones stack the card; everything above keeps the desktop shape.
        xs: '400px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: 'hsl(var(--card))',
        sidebar: 'hsl(var(--sidebar))',
        /*
         * Muted semantic accents for the three categories, plus a neutral
         * fallback. Plain `var()` rather than `hsl(var())`: these tokens are
         * literal hex (see globals.css).
         */
        category: {
          notes: {
            DEFAULT: 'var(--category-notes)',
            foreground: 'var(--category-notes-foreground)',
          },
          engineering: {
            DEFAULT: 'var(--category-engineering)',
            foreground: 'var(--category-engineering-foreground)',
          },
          life: {
            DEFAULT: 'var(--category-life)',
            foreground: 'var(--category-life-foreground)',
          },
          neutral: {
            DEFAULT: 'var(--category-neutral)',
            foreground: 'var(--category-neutral-foreground)',
          },
        },
        // Topic tags: deliberately neutral, so they stay behind the categories.
        tag: {
          DEFAULT: 'var(--tag)',
          border: 'var(--tag-border)',
          foreground: 'var(--tag-foreground)',
        },
        // The one accent colour: links, focus rings, active nav and filters.
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          // Decorative only (the small dots) — never used for text.
          bright: 'hsl(var(--brand-bright))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--brand))',
              textUnderlineOffset: '4px',
              '&:hover': {
                color: 'hsl(var(--brand))',
              },
            },
            'h1, h2, h3, h4': {
              color: 'hsl(var(--foreground))',
            },
            code: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
              borderRadius: '4px',
              padding: '2px 6px',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
            },
            // Code inside a block must not inherit the inline-code chrome.
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              color: 'inherit',
              fontWeight: 'inherit',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
