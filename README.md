# volkanozturk.dev

Personal site — blog, career journey and bookmarks — in three languages.

**Live:** [volkanozturk.dev](https://volkanozturk.dev)

## Overview

A personal portfolio site with three content sections: **Writing** (blog posts),
**Journey** (work history and education) and **Bookmarks** (saved links). Content
comes from Contentful; the site is statically exported and served from Cloudflare
Pages.

| | |
|---|---|
| Framework | Next.js 14 (App Router, `output: 'export'`) |
| Styling | Tailwind CSS |
| i18n | next-intl — English (default), Turkish, Dutch |
| CMS | Contentful |
| Hosting | Cloudflare Pages (free plan) |

Every page is pre-rendered at build time, so the site works without JavaScript.

## Prerequisites

- Node.js 18 or newer
- npm
- A Contentful account (free tier is enough)
- A Cloudflare account (free plan is enough)

## Local Development

```bash
git clone https://github.com/volkanozturk/volkanozturk.dev.git
cd volkanozturk.dev
npm install
cp .env.example .env.local
```

Fill in your Contentful keys in `.env.local`:

```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
```

Then start the dev server:

```bash
npm run dev
```

Open http://localhost:3000/en — in development `/` returns 404, because
`output: 'export'` disables middleware and the `public/index.html` redirect is
only served as a directory index by the static host. On the deployed site `/`
works normally.

Without Contentful keys the site still builds and runs — each section renders its
empty state instead of content.

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static export into `out/` |
| `npm run lint` | ESLint |

## Contentful Setup

1. Create a space at [contentful.com](https://contentful.com) (Free plan).
2. Go to **Settings → API keys → Add API key** and copy the **Space ID** and the
   **Content Delivery API access token**.
3. Under **Content model**, create the three content types below. The **Field ID**
   column must match exactly — the code reads those IDs.

### `blogPost`

| Field name | Field ID | Type |
|---|---|---|
| Title | `title` | Short text |
| Slug | `slug` | Short text (unique) |
| Excerpt | `excerpt` | Short text |
| Content | `content` | Rich text |
| Published date | `publishedDate` | Date & time |
| Tags | `tags` | Short text, list (optional) |
| Cover image | `coverImage` | Media (optional) |

### `journeyEntry`

| Field name | Field ID | Type |
|---|---|---|
| Company / school | `company` | Short text |
| Role / degree | `role` | Short text |
| Start date | `startDate` | Date & time |
| End date | `endDate` | Date & time (optional — empty means "Present") |
| Description | `description` | Long text |
| Type | `type` | Short text — accepts `work` or `education` |
| Location | `location` | Short text (optional) |
| URL | `url` | Short text (optional — renders the company as a link) |

### `bookmark`

| Field name | Field ID | Type |
|---|---|---|
| Title | `title` | Short text |
| URL | `url` | Short text |
| Description | `description` | Short text (optional) |
| Collection | `collection` | Short text — groups bookmarks into sections |
| Tags | `tags` | Short text, list (optional) |

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

4. Add environment variables (Production **and** Preview):

   | Name | Value |
   |---|---|
   | `CONTENTFUL_SPACE_ID` | Your space ID |
   | `CONTENTFUL_ACCESS_TOKEN` | Your delivery token |

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

## Contentful Webhook (optional)

Rebuild the site automatically when content is published:

1. Pages project → **Settings → Builds & deployments → Deploy hooks** → create a
   hook for branch `main` and copy its URL.
2. Contentful → **Settings → Webhooks → Add webhook** → paste the URL, method
   `POST`.
3. Limit the triggers to **Entry → publish** and **Entry → unpublish** so drafts
   do not spend build minutes.

## Internationalization

Three locales: **`en`** (default), **`tr`**, **`nl`**. Every route is prefixed —
`/en`, `/tr`, `/nl` — and pre-rendered for all three at build time.

| Path | Purpose |
|---|---|
| `messages/en.json`, `tr.json`, `nl.json` | All UI strings |
| `i18n.ts` | Locale list, default locale, flags and labels |
| `app/[locale]/` | Every page lives under this segment |
| `components/language-switcher.tsx` | Locale pills in the navigation |
| `public/index.html` | Locale detection for `/` (see below) |

### Adding a string

Add the key to **all three** message files, then read it with `useTranslations()`
in a synchronous component or `getTranslations()` in an async Server Component.
Never hardcode user-facing text.

### Adding a language

1. Create `messages/<code>.json` with the same keys as `en.json`.
2. Add the code to `locales` and `localeDetails` in `i18n.ts`.
3. Add the code to the `supported` array in `public/index.html`.

### Why `public/index.html` exists

`output: 'export'` means Next.js middleware never runs, so `middleware.ts` only
takes effect on a server-rendered deployment. On the static site, `/` is served by
`public/index.html`, which reads the browser language and redirects to `/en/`,
`/tr/` or `/nl/` — falling back to `/en/` via meta refresh when JavaScript is off.

## Customization

| What | Where |
|---|---|
| Site URL and Twitter handle | `app/[locale]/layout.tsx` — `SITE_URL` (line 16), `TWITTER_HANDLE` (line 17) |
| Page titles, descriptions, author | `messages/*.json` → `meta` |
| Name, role, status badge, bio | `messages/*.json` → `home.greeting`, `home.role`, `home.status`, `home.bio` |
| All other UI text | `messages/*.json` |
| Social links (home page) | `app/[locale]/page.tsx` — `socialLinks` (line 14) |
| Social links (footer) | `components/footer.tsx` — `socialLinks` (line 3) |
| Site name in the navigation | `components/navigation.tsx` |

Social links are defined in two places; update both.
