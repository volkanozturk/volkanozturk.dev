# Design standards

The single source of truth for how volkanozturk.dev looks and how its visual
assets are made. Where another document repeats something recorded here, this
file wins.

Every number below is read from the implementation, not chosen for the
document. If you change the code, change this file in the same commit.

---

## A. Overall design

An English-only, compact editorial personal website. There is no second
language, and no translation layer to keep in step.

**Writing is the primary content.** The home page runs introduction → Latest
writing → Selected projects, in that order. Projects are visible but secondary:
they sit below the writing, reuse the same card proportions, and take no extra
emphasis. Do not promote them above the writing.

The surfaces are neutral: white page, charcoal headings, muted grey secondary
text, with a warm off-white sidebar. One restrained burnt-orange accent carries
links, focus rings, the active navigation item and the category filter. The
three muted category colours (§E) are the only other colour in the interface,
and they are limited semantic accents — never decoration.

Not wanted: a general redesign, a large hero, glossy or 3D effects, decorative
gradients, neon, or a second accent colour. The one gradient on the site is the
single static `hero-glow` tint behind the home heading.

### Layout

| Thing | Value | Where |
|---|---|---|
| Content column | `max-w-[760px]`, centred | `app/layout.tsx` |
| Column gutters | 16px, 20px from 640px, 32px from 1024px | `px-4 sm:px-5 lg:px-8` |
| Sidebar | fixed, 240px (`w-60`), from 1024px up | `components/site-shell.tsx` |
| Below 1024px | sidebar hidden; compact sticky header with a disclosure menu | same |
| Card | `rounded-[10px]`, 1px border, `p-4`, `space-y-3` between cards | `components/post-card.tsx` |

### Breakpoints

`xs` 400px (custom — narrow phones restack the card), `sm` 640px, `md` 768px,
`lg` 1024px (the sidebar threshold). `xs` is defined in `tailwind.config.ts`;
the rest are Tailwind defaults.

### Typography

Inter, loaded through `next/font/google` as `--font-geist-sans`.

Code uses the platform's monospace face (`ui-monospace`, SF Mono, Menlo,
Consolas, … in `tailwind.config.ts`) — no web font is downloaded for it. Code
blocks are 14px; inline code is 0.84em at normal weight so it sits level with
Inter body text.

| Role | Size |
|---|---|
| Page / article h1 | 32px, 40px from 640px |
| Home section heading | 21px |
| Card title | 17px, 18px from 640px |
| Body and card blurb | 16px body, 14.5px blurb |
| Article body | 17px / 1.68 line-height, 18px / 1.72 from 640px |
| Article lead (first paragraph) | 18.5px, 20px from 640px; 1.6 line-height; foreground at 86% |
| Article h2 / h3 | 23px / 19px, 27px / 21px from 640px |
| Figure caption | 13.5px / 1.5, muted grey |
| Card metadata | 12.5px |
| Category badge | 13px, weight 500 |
| Topic tag | 12px, weight 500 |

### Article reading layout

Set once in `app/globals.css` (`.article-measure`, `.article-body`); the
Markdown renderer adds no spacing classes of its own, and no post needs any
special Markdown or frontmatter to get it.

| Thing | Value |
|---|---|
| Reading measure | **640px**, centred in the 696px column. The back link, header, cover and running text all share it, so they start on one edge |
| Wide content | figures, diagrams and code blocks (`.article-wide`) take the full column (696px beside the sidebar), centred on the same axis |
| Mobile | measure and column coincide: 358px at a 390px viewport |
| Paragraphs | 1.2em apart |
| Before h2 / after h2 | 2em / 0.55em of the heading size (54px / 15px desktop) |
| Before h3 / after h3 | 1.7em / 0.45em of the heading size |
| Figures | 2.4em above and below; images never upscaled past their own width and capped at `min(80vh, 720px)` tall, scaled on their own ratio (a portrait photo narrows rather than filling the column) |
| Image dimensions | read from each file's header at build time (`lib/image-size.ts`: PNG, JPEG, WebP), so every body image reserves its real ratio before it loads. Nothing is added to the Markdown. A missing or unreadable image fails the build with the path named |
| Lead | the first paragraph written directly in the body (`> p:first-of-type`). Image-only paragraphs render as `<figure>`, so a post that opens with photos still leads with its first real paragraph |
| Topics | tags sit at the end of the article under a small "Topics" label, not in the header |

Captions come only from a Markdown image title (`![alt](src "Caption")`). Alt
text is never shown as a caption.

Corner radius token `--radius` is `0.75rem`. Cards and the article cover use a
literal `10px` instead, which is the established card radius.

---

## B. Article visuals

Every published article should carry **two** images that show the same idea:

- a square `thumbnail`, used in the listings
- a horizontal `cover`, used at the top of the article

The thumbnail and cover are two compositions of the same concept, each designed
for its own aspect ratio. Keep their subject, palette, and visual language
consistent so readers recognise the same article. Do not create one format by
automatically cropping or stretching the other.

Style: modern minimal editorial illustration built from recognisable,
topic-specific objects — a browser window for a piece about layout, a queue
draining beside one that does not for consumer lag, two places and a route for
moving country. Warm off-white ground, charcoal and muted grey forms, restrained
burnt-orange accent. Subtle paper-like texture is fine.

Avoid: generic abstract imagery that could belong to any article, unrelated
geometric shapes, decorative objects, stock or photorealistic imagery, glossy
3D, neon, heavy gradients, logos and branded screenshots. **No readable title
text inside the illustration** — the page already has a heading. Any text at all
must be short and mean something to that article.

New visuals require approval before they replace an existing approved asset.
Do not regenerate or swap an approved image without being asked.

---

## C. Image sizes and usage

| | Square `thumbnail` | Horizontal `cover` |
|---|---|---|
| Export | 768×768 WebP | 1280×720 WebP (16:9) |
| Used on | home page, Writing index | article detail |
| Declared intrinsic | 768×768 | 1280×720 |
| Rendered at | 80px desktop / 64px mobile tile | up to 640px desktop |
| Loading | `loading="lazy"` | `priority` |

Both live in `public/images/covers/`.

- The listing tile is an **outer box** of 80px (desktop) / 64px (mobile); its
  1px border leaves the image itself 78px / 62px. The `width`/`height` on the
  `<Image>` declare the file's own 768×768 — they are the intrinsic size, not
  the display size, which the tile sets in CSS. Keep the two in step: if the
  export size changes, change these attributes with it.
- The article cover is capped at **640px** on desktop — the same reading
  measure as the header and body text, so all three share a left edge. On mobile it uses the
  **full available article-content width** — there is deliberately no fixed
  320px cap. At a 390px viewport with 16px gutters that width is **358px**.
- Aspect ratio is always the file's own. No stretching, no unintended cropping:
  `w-full h-auto` scales it, and the declared width/height give the browser the
  ratio up front so nothing shifts while it loads.
- The cover is centred with **30px** clear above and below, a subtle 1px border
  and a 10px radius. No shadow, gradient or extra background.
- Preload comes from Next.js 14's `priority` prop, which emits
  `<link rel="preload" as="image" fetchPriority="high">` and drops the lazy
  attribute. Listing thumbnails stay lazy.
- **No inversion, recolouring or filters in dark mode.** The file is served as
  drawn, so never design one that depends on being flipped.
- Export optimised WebP with EXIF/ICC/XMP stripped. Judge the result by how it
  looks, not against an arbitrary byte target.

---

## D. Content fields

Both fields are optional and live in a post's frontmatter
(`lib/posts.ts` parses and validates them).

| Field | Drives |
|---|---|
| `thumbnail` | the home and Writing images |
| `cover` | the article-detail cover |

- The article page uses `cover`. When `cover` is absent it falls back to
  `thumbnail`, keeping that image's **square proportions and compact sizing**
  (up to 384px) rather than stretching it into the wide slot.
- With neither field, the article renders **no image container and no empty
  gap** — the header keeps its normal spacing above the body.
- Never paste the header cover into the Markdown. Setting the frontmatter is
  the whole job; the template does the rest.
- In-body photographs and technical diagrams are independent of both fields and
  are unaffected by any of this.

---

## E. Category and tag styling

### Category badges

One shared component, `components/category-badge.tsx`, used by the home cards,
the Writing index and the article header — so a category looks identical
wherever it is named.

Small restrained pills: 24px high, 13px / weight 500, 8px horizontal padding,
fully rounded. No icons, shadows, gradients or decorative dots. The category
name is always spelled out, so **colour is never the only identifier**. Dates,
separators and reading times around them stay neutral grey, and the existing
metadata order and responsive wrapping are unchanged.

Tokens are declared in `app/globals.css` and exposed through
`tailwind.config.ts`. All pairs clear WCAG AA (4.5:1):

| Category | Light text / background | Ratio | Dark text / background | Ratio |
|---|---|---|---|---|
| Notes | `#9A471F` on `#FFF1E8` | 5.77:1 | `#F0B48A` on `#3A2418` | 8.03:1 |
| Engineering | `#365D7C` on `#EDF3F8` | 6.23:1 | `#A9C9E8` on `#1B2A38` | 8.51:1 |
| Life | `#526544` on `#EFF3EA` | 5.65:1 | `#BACFA7` on `#222C1C` | 8.70:1 |
| Unknown (fallback) | `#44484F` on `#F1F1F2` | 8.14:1 | `#C9CDD4` on `#23262C` | 9.51:1 |

A category outside the known set falls back to the neutral pair rather than
guessing a colour. (`normalizeCategory` in `lib/categories.ts` already coerces
unknown frontmatter values, so this is a second line of defence.)

### Topic tags

`components/tag-list.tsx`, used wherever tags already appear — the Writing cards
and the end of the article, below the body. Do **not** add tags to surfaces
that currently omit them; the home cards deliberately have none.

Tags stay visually secondary to categories: no individual colours, no icons, no
shadows, no hover effect and no pointer cursor of their own. Size, padding,
radius and order are shared by every surface.

| | Light | Ratio | Dark | Ratio |
|---|---|---|---|---|
| Text | `#4B5059` | 7.37:1 | `#B6BBC4` | 8.08:1 |
| Background | `#F4F4F5` | | `#212429` | |
| Border | `1px solid #DDDEE2` | | `1px solid #32363E` | |

Weight 500 in both themes.

> On the Writing cards the whole card is a link, so a tag inside it shows the
> card's pointer. That is the card's behaviour, not the tag's — on the article
> page, where tags sit outside any link, the cursor stays default.

### Category filters

The controls on the Writing page are **not** badges and keep their own styling:
an outlined pill that fills with the brand colour when active. Do not restyle
them to match the badges, and do not change their interaction — "All" clears the
filter, and so does clicking the active category.

---

## F. Projects

Project icons must say what the product actually is. They are composed from the
existing Lucide set in `components/project-icons.tsx`, pairing a subject glyph
with a smaller accent badge, because one glyph alone does not carry the meaning.

- **HuurCheck** — house + magnifier-with-check: housing, screened.
- **owntown.lol** — map pin + trophy: places, ranked.
- **OldByte** — computer + wrench: old computers, restored.

Keep those concepts. Do not substitute a generic software, code, layers,
sparkles or otherwise decorative icon, and do not give two projects the same
icon. Icons are sized in percentages and coloured from theme tokens, so one
definition serves the 64px and 80px tiles and follows light and dark mode
without a second asset. No emoji, no 3D, no project logos unless supplied and
approved.

---

## G. Change workflow

- **Inspect the current code before editing.** Do not trust a path or a
  component name from documentation without checking it still exists.
- **Reuse the shared components and tokens** in this document rather than
  introducing a parallel style.
- **Verify desktop, mobile, light and dark** before calling a change done, plus
  `npm run lint`, `npx tsc --noEmit` and `npm run build`.
- **Never silently replace an approved visual asset.** Report what you think is
  wrong with it and wait for a replacement.
- **Commit, push and deploy only when explicitly asked.**

### Deployment

The Cloudflare Pages project `volkanozturk-dev` is a **Direct Upload** project
(`Git Provider: No`). **Pushing to GitHub does not deploy anything.** A push
updates the repository only; production changes when someone uploads a build:

```bash
npm run build
npx wrangler pages deploy out --project-name=volkanozturk-dev --branch=main --commit-hash=$(git rev-parse HEAD)
```

Verify on the deployment hostname first (`<id>.volkanozturk-dev.pages.dev`),
then on `volkanozturk.dev`. Because asset URLs are stable, the apex can briefly
serve an edge-cached copy of a replaced image; its `must-revalidate` policy
clears that within 4 hours, or the exact paths can be purged.

### Canonical domain and redirects

The canonical origin is **`https://volkanozturk.dev`** (`lib/site.ts`), and it is
the only hostname the site should be indexed under. `www.volkanozturk.dev` must
redirect there permanently, preserving the path and the query string.

That redirect lives in **Cloudflare, not in Next.js**. A static export has no
server to run `redirects()` in, and `public/_redirects` cannot cover it either —
Pages applies that file only to requests which reach the Pages project, and `www`
is deliberately not attached to one. It is a zone-level Single Redirect (a
dynamic redirect rule in the `http_request_dynamic_redirect` phase):

| Field | Value |
|---|---|
| Rule name | `www to apex redirect` |
| Match | `(http.host eq "www.volkanozturk.dev")` |
| Target | `concat("https://volkanozturk.dev", http.request.uri.path)` |
| Status | `301` |
| `preserve_query_string` | `true` |

The target expression is **path-only on purpose**. `http.request.uri.query`
returns the query string without its `?`, so concatenating it would yield
`/blog/foo/utm_source=x`; `preserve_query_string` reattaches the real query
instead.

Two things must stay as they are:

- The `www` DNS record stays **proxied** through Cloudflare. The rule runs at the
  edge before any origin fetch, so an unproxied record would bypass it — and,
  with nothing else answering for `www`, return 522.
- **Do not add `www.volkanozturk.dev` as a Pages custom domain.** That serves a
  second indexable copy of the site at 200 instead of redirecting to the apex,
  which is the duplicate-content problem this rule exists to prevent.

Legacy locale URLs (`/en/`, `/tr/`, `/nl/`) are a separate concern and stay in
`public/_redirects`, where every historic URL resolves in a single hop. Do not
duplicate them as Cloudflare rules without a specific reason — two sources of
redirect truth is how chains and loops start.
