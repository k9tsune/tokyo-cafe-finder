# Tokyo Cafe Finder

English-first finder for Tokyo cafes with **Wi-Fi** and **power outlets** — a
Dengen-Cafe-style search flow (search by station/area → nearby list → cafe page
with map + directions) built SEO- and GEO-first so it can rank in Google and be
cited by AI search.

This is the **Phase A scaffold**. It runs out of the box on seed Shibuya/Shinjuku
data — no database or API keys required — so you can see the full flow, then wire
up real data (Phase B).

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: add a Google Maps Embed key for the cafe map
npm run dev                  # http://localhost:3000
```

Then build the static site (what Google crawls):

```bash
npm run build && npm start
```

## What's included

- **Search flow** — `/` and `/tokyo` have a station/area search bar that navigates
  to real, indexable landing pages (not a JS-only filter). Plus "Find cafes near me"
  (browser geolocation → `/near`).
- **AND/OR filter** — Wi-Fi and Power chips with an All/Any match switch
  (`components/FilterableCafeList.tsx`, logic in `lib/db.ts#applyUtilityFilter`).
- **Pages** — area (`/tokyo/[area]`), station (`/tokyo/station/[station]`),
  cafe detail (`/cafe/[slug]`) with a **free Google Maps embed + directions**, and
  feature hubs (`/tokyo/free-wifi-cafes`, `/cafes-with-power-outlets`,
  `/cafes-with-wifi-and-power`).
- **SEO** — SSG, per-page canonical + metadata, `sitemap.ts`, `robots.ts`,
  JSON-LD (CafeOrCoffeeShop, ItemList, BreadcrumbList).
- **GEO (AI-search)** — FAQPage schema, extractable comparison tables, `dateModified`
  freshness, and an `llms.txt` route. All aimed at getting cited by Gemini / AI Overviews.
- **Data pipeline** — `scripts/collect-overpass.mjs` (OSM base layer) and
  `scripts/enrich.mjs` (Claude research + **fully-automated auto-approval gate**
  with exception-only escalation). See `CLAUDE.md`.
- **DB** — `db/schema.sql` (Postgres + PostGIS) for Phase B.

## Locale-ready (future multi-language)

English only for now, but routing, metadata, the `localization` table, and the
SEO helpers are structured so `zh-tw` / `ko` slot in later without a rewrite
(see the plan, §5.1). Facts stay language-neutral; only copy gets translated.

## Important notes

- **Data is real, web-researched, and dated.** `data/seed/*.json` now holds ~80
  cafes across Shibuya, Shinjuku, Minato, Meguro and Chiyoda, compiled from
  Japanese + English sources (raw records with source URLs and confidence levels
  in `data/collected/raw/`, rebuildable via `node scripts/build-seed.mjs`). It is
  a first research pass, not gospel — run it through the enrichment/verification
  cycle (`CLAUDE.md`) and confirm the "low"/"medium" confidence entries before
  treating any single field as final. Coordinates are station-level approximations
  (the on-page map uses a precise name+address query); a geocoding pass can refine
  per-cafe coordinates to enable exact "near me" distances.
- **Ads** are represented by reserved `.ad-slot` placeholders (zero layout shift).
  Enable them only after the site is indexed (see plan §9).
- **Before production:** add a real privacy policy + consent banner, set
  `NEXT_PUBLIC_SITE_URL`, and add a Google Maps Embed API key.

## Data source & licensing

Base location data © OpenStreetMap contributors (ODbL). Maps & directions via
Google Maps (only `place_id` is stored long-term). Wi-Fi/outlet assessments are
original data.
