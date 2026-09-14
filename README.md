# volkanozturk.dev

Personal site — blog, career journey and bookmarks.

**Live:** [volkanozturk.dev](https://volkanozturk.dev)

## Overview

A personal portfolio site with three content sections: **Writing** (blog posts),
**Journey** (work history and education) and **Bookmarks** (saved links). Content
lives in this repository as Markdown and typed data; the site is statically
exported and served from Cloudflare Pages.

| | |
|---|---|
| Framework | Next.js 14 (App Router, `output: 'export'`) |
| Styling | Tailwind CSS |
| Language | English only |
| Content | Markdown files in `content/` |
| Hosting | Cloudflare Pages (free plan) |

Every page is pre-rendered at build time, so the site works without JavaScript.

## Design standards

How the site looks, how article visuals are made, and the category and tag
tokens all live in one place: **[docs/design-standards.md](docs/design-standards.md)**.
That document is the source of truth — read it before changing anything visual,
and update it in the same commit when you do.

## Prerequisites

- Node.js 18 or newer
- npm
- A Cloudflare account (free plan is enough)

## Local Development

```bash
git clone https://github.com/volkanozturk/volkanozturk.dev.git
cd volkanozturk.dev
npm install
npm run dev
```

Open http://localhost:3000/en — in development `/` returns 404, because
`output: 'export'` disables middleware and the `public/index.html` redirect is
only served as a directory index by the static host. On the deployed site `/`
works normally.

No credentials are required: all content lives in this repository.

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static export into `out/` |
| `npm run lint` | ESLint |

## Content

All content lives in the repository. There is no CMS and no network call at build time.

| Path | Holds |
|---|---|
| `content/posts/<slug>.md` | Blog articles — YAML frontmatter + Markdown body |
| `content/bookmarks.ts` | Bookmarks, grouped by `collection` |
| `content/journey.ts` | Journey timeline entries |
| `content/projects.ts` | Projects shown on the home page and `/projects` |
| `lib/posts.ts` | Loading and validation for posts |

### Post frontmatter

```yaml
---
title: "Kafka Consumer Lag: When Should You Worry?"
slug: kafka-consumer-lag-when-should-you-worry
category: engineering          # engineering | notes | life
excerpt: "One sentence shown in the listing and used as the meta description."
publishedDate: 2026-09-12T20:27:00.000Z
tags:
  - Kafka
  - Consumers
thumbnail: /images/covers/kafka-consumer-lag-when-should-you-worry.webp
draft: false
---
```

The filename must match the `slug`, which is what keeps slugs unique and stable.
A published post must have `title`, `slug`, `category`, `excerpt` and a valid
`publishedDate`; anything missing or an unknown category **fails the build** with
a message naming the file. Drafts (`draft: true`) may be incomplete and are
excluded from every public page.

### Adding, previewing and publishing a post

1. **Add** — create `content/posts/<slug>.md` with the frontmatter above and
   `draft: true`.
2. **Preview** — `INCLUDE_DRAFTS=1 npm run dev`, then open
   http://localhost:3000/blog/<slug>.
3. **Publish** — set `draft: false`, set `publishedDate`, commit, then build and
   deploy as below.

`INCLUDE_DRAFTS=1` works **only under `npm run dev`**. `npm run build` always
excludes drafts — if the flag is set it is ignored and the build logs a warning,
so a stray environment variable in CI or a shell profile cannot publish a draft.
Drafts are filtered in one place (`getAllPosts` in `lib/posts.ts`), which every
route, listing and metadata lookup goes through.

### Article covers

Every published article should carry two images, both named in its frontmatter.
The full rule — style, palette, sizes and approval — is in
[docs/design-standards.md](docs/design-standards.md); the short version:

| Field | Shape | Where it is used |
|---|---|---|
| `thumbnail` | square, 768×768 WebP | the home page and the Writing index |
| `cover` | wide 16:9, 1280×720 WebP | the top of the article page |

They are two crops of one idea, not two ideas: the same subject, concept,
palette and visual language, so a reader who clicks a card recognises the
article they land on. Neither is pasted into the Markdown — setting the two
frontmatter values is the whole job.

`thumbnail` is a path under `public/` or the key of a drawn tile registered in
`components/post-thumbnails.tsx`; `cover` is always a path. Both stay
technically optional. The article page uses `cover` and falls back to
`thumbnail` **only** when `cover` is absent, so an older post still opens with
its own picture; a post with neither renders no cover and no gap where one would
sit. The listings only ever use `thumbnail` — a `cover` never appears there.

On the article page the cover is rendered by `app/blog/[slug]/page.tsx`, centred
above the opening paragraph and capped at 640px — narrower than the text column
on purpose, so it opens the piece without becoming a banner. A square fallback
is held to 384px instead, since the two shapes do not carry the same width.

**Every cover must be about its own article.** The visual should carry the
subject, the argument or the central idea — a browser window for a piece about
a website's layout, a queue draining or backing up for one about consumer lag,
two places and a route for one about moving country. Simple, concrete metaphors
are welcome; they do not have to be abstract. What they must not be is
interchangeable: if a cover could sit on any other post without anyone
noticing, it is the wrong cover.

Keep the established style so the listings read as one set:

- Square `thumbnail` at 768×768 and wide `cover` at 1280×720, both WebP,
  exported to `public/images/covers/`.
- Warm off-white ground, charcoal and muted grey forms, restrained burnt-orange
  accent.
- Minimal flat or lightly textured illustration.
- The `thumbnail` must still read at 64px (mobile) and 80px (desktop), which is
  the only size it is ever shown at, so fine detail is wasted there. The `cover`
  is shown at up to 640px and can carry more.
- The same `thumbnail` on the home page and on Writing.
- One cover per article — no house style applied as a formula to all of them.

Covers are not theme-aware: the file is served as-is in light and dark mode, so
do not design one that depends on being inverted or recoloured.

Avoid unrelated geometric shapes, decorative objects, stock or photorealistic
imagery, glossy 3D, neon, heavy gradients, logos, branded screenshots and
filler text. Any text inside a cover must be short and mean something to that
article.

### Markdown supported

Headings, ordered and unordered lists, links, emphasis, inline code, fenced code
blocks, blockquotes and horizontal rules. Raw HTML in a post is ignored rather
than rendered.

A paragraph containing only a figure marker is replaced by a diagram component:

```
[figure:kafka-lag]
```

Figures are registered in `components/post-figures.tsx`. They are real inline
SVG, so they follow the theme and their labels are translated.

## Cloudflare Pages Deployment

Deployment uses Cloudflare Pages' **native Git integration** — Cloudflare builds
and deploys on every push. No GitHub Actions workflow is involved.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the repository **`volkanozturk/volkanozturk.dev`**.
3. Build settings:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | Next.js (Static HTML Export) |
   | Build command | `npm run build` |
   | Build output directory | `out` |

4. No environment variables are required — content ships with the repository.

5. Click **Save and Deploy**. Every push to `main` now builds and deploys
   automatically; pull requests get preview deployments.

> **Note:** Cloudflare cannot convert an existing Direct Upload project to Git
> integration — you have to create a new project with Git connected, then move the
> custom domain over to it.

## Custom Domain

In the Pages project → **Custom domains → Set up a domain**, add
`volkanozturk.dev`.

The domain is already on Cloudflare nameservers and its DNS records are in place:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` | `<project>.pages.dev` | Proxied |
| CNAME | `www` | `<project>.pages.dev` | Proxied |

If you attach the domain to a **new** Pages project, first remove it from the old
one — a hostname can only be bound to one project at a time. Update the CNAME
targets to the new project's `pages.dev` hostname afterwards.

## URLs and SEO

The site is English-only and its routes carry no language prefix: `/`, `/blog/`,
`/blog/<slug>/`, `/journey/`, `/bookmarks/`.

`app/sitemap.ts` and `app/robots.ts` generate `sitemap.xml` and `robots.txt` at
build time from the same post loader the pages use, so the sitemap can never
drift from what is published. Canonical and Open Graph URLs are set per page.

### Redirects for the old multilingual URLs

The site previously served `/en/`, `/tr/` and `/nl/` prefixes. `public/_redirects`
maps them to their unprefixed equivalents with permanent (301) redirects;
Cloudflare Pages reads that file from the deployed output. The bare-prefix rules
are listed before the wildcards so `/en/` reaches `/` in a single hop.

## Customization

| What | Where |
|---|---|
| Site URL, title, description, Twitter handle | `lib/site.ts` |
| Author name, Open Graph and Twitter card metadata | `app/layout.tsx` |
| Hero heading and bio | `app/page.tsx` |
| Navigation items | `lib/nav.ts` — `navItems` |
| Social links | `lib/nav.ts` — `socialLinks` |
| Projects (home page and `/projects`) | `content/projects.ts` |
| Project card icons | `components/project-icons.tsx` |
| Location line and contact address | `lib/nav.ts` — `LOCATION`, `EMAIL` |
| Site name in the navigation | `components/site-shell.tsx` |
| All other UI text | inlined in the component that renders it |

Social links are defined once, in `lib/nav.ts`. The sidebar and mobile menu render
them through `components/social-icons.tsx`, and the About page reads the same list
by label — so updating a URL there updates it everywhere.
