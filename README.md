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
| Location line and contact address | `lib/nav.ts` — `LOCATION`, `EMAIL` |
| Site name in the navigation | `components/site-shell.tsx` |
| All other UI text | inlined in the component that renders it |

Social links are defined once, in `lib/nav.ts`. The sidebar and mobile menu render
them through `components/social-icons.tsx`, and the About page reads the same list
by label — so updating a URL there updates it everywhere.
