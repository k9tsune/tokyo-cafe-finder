# CLAUDE.md — operating instructions for Tokyo Cafe Finder

This file tells Claude Code how to run the data pipeline. The design principle
is **fully automated with exception-only escalation**: the quarterly check runs
unattended and publishes high-confidence updates on its own, flagging only the
hardest/most-problematic cases for a human. This must scale from Tokyo to all of
Japan and, later, other countries — so human review is the exception, never the
default.

## Project shape
- `data/collected/raw/*.json` — the web-researched cafe records per ward (name, Wi-Fi/outlets, sources, confidence). This is the working dataset.
- `scripts/build-seed.mjs` — rebuilds `data/seed/*.json` (what the site reads) from the raw files. Run this after editing any raw file.
- `scripts/enrich.mjs` — the auto-approval **gate** logic (`decide()`): auto-publish vs. escalate.
- `scripts/collect-overpass.mjs` / `collect-tokyo.mjs` — optional OpenStreetMap collectors; currently we use web research instead.
- `lib/db.ts` — data access. Seed JSON now; Postgres/PostGIS (`db/schema.sql`) later.
- Pages are static (SSG) for SEO/GEO; the sitemap regenerates on build.

## How this runs (automation)
- `.github/workflows/quarterly-cafe-update.yml` — quarterly refresh (every 3 months); Claude researches + gates, then opens a PR. Merging publishes (Vercel auto-deploys). The cadence itself is driven by an external scheduled task, not by cron in this repo.
- `.github/workflows/claude.yml` — on-demand: mention `@claude` in a GitHub issue/PR to build a feature; it opens a PR. The build must pass before anything can publish.
- Global brand (`WorkingCafes`): the data model already carries `city`/area, so adding cities/countries is a data operation, not a code change.

## Quarterly automated run — every 3 months (target: unattended)
1. **Research (web).** For each covered area, use Japanese + English web research
   to find new work-friendly cafes and re-check existing ones. Add records to the
   ward file in `data/collected/raw/`. Rules:
   - Every cafe needs at least one real **source URL**. Never fabricate.
   - Write ORIGINAL one-sentence summaries. Never copy source text (guardrail).
   - Set **confidence** honestly (high = 2+ agreeing sources); flag conflicts.
   - Prefer official pages and recent, corroborating sources.
   - **Japanese description (for the /ja site).** For each cafe, also write an
     ORIGINAL 1–2 sentence Japanese description from Japanese-language research
     (雰囲気・作業のしやすさ・Wi-Fi/電源), and store it in
     `data/cafe-descriptions-ja.json` keyed by slug. Localized, not translated
     from the English; never copy source text. Independent cafes get their own;
     chains are covered by the per-chain templates in `lib/cafe-desc-ja.ts`
     (only add a per-branch entry when a branch genuinely differs). The Japanese
     cafe page (`app/ja/cafe/[slug]`) uses it, falling back to a factual line.
   - **Access directions, floor & menu (per-cafe SEO detail).** For independent,
     web-visible cafes, also capture — WITH a real source URL and the fact quoted
     from it — into `data/cafe-details.json` (keyed by slug), rendered as the framed
     "Getting there" / "Menu" cards on the EN + JA cafe pages via `lib/cafe-details.ts`:
     (a) `access` = station-exit walking directions (which exit, landmarks, turns) in
     `en` + `ja`, the floor it is on (mention stairs/lift ONLY if a source states it),
     `sources[]`, and a `checked` date; (b) `menu` = 4–8 real items with yen prices in
     `en`/`ja`, `sourceName`, `sourceUrl`, `checked` (for co-working/study venues use
     usage rates with `title`/`titleJa` = "Pricing"/"料金"). NEVER invent a floor, an
     item, a price, or a turn: omit the menu (directions-only) when no current prices
     are published, drop any single field that isn't sourced, and prefer the live
     Google-Maps directions the page already offers over guessing turn-by-turn. Chains
     and cafes with no web presence usually have neither — don't force an entry.
   - **Permanently-closed venues.** If research shows a cafe has closed, do NOT hand-edit
     it out of the 500KB seed — add `"<slug>": { "closed": true }` to
     `data/cafe-details.json`; `lib/db.ts` then drops it from every listing, page and count.
2. **Rebuild.** Run `node scripts/build-seed.mjs` to regenerate `data/seed/*.json`
   from the raw files, stamping `lastChecked` with today's date.
3. **Gate (auto-approval).** `decide(existing, proposed)` in `enrich.mjs`:
   - **Auto-publish** when confidence is high, sources agree, it isn't a closure,
     and it isn't a surprising flip. Stamp `last_checked = today` and publish.
   - **Escalate** (write to `review_queue`) ONLY when one of these is true:
     low confidence, conflicting sources, possible closure/removal, a
     branch-level "surprising flip" (e.g. an outlet-rare chain like Starbucks
     suddenly reading as having outlets), or a future trust-sensitive field
     below high confidence.
4. **Publish + regenerate.** Auto-approved changes update the DB; ISR/rebuild
   regenerates pages and the sitemap. New area/station pages go live once they
   have ≥5 real cafes.
5. **Digest.** Emit counts: auto-published, escalated (with reasons). Only the
   escalated list needs a human — keep it short by keeping confidence honest.

## What a human does (should trend toward near-zero)
- Clear the `review_queue` exceptions. That's it.
- If the queue grows, tighten the research prompt or the gate — do NOT lower the
  bar by auto-approving low-confidence changes.

## Listing / proximity rules
- A cafe is listed for a station only when it is within **~15 minutes' walk**
  (`walkMinutes` ≤ 15). Do not attach cafes that are further than that.
- A cafe may show for **multiple stations**: set `nearestStation` (primary) plus
  an optional `nearbyStations: [...]` array, listing only other stations that are
  ALSO within ~15 minutes. `stationSlugs` in the seed is built from both.
- Station coordinates: precise values live in `data/station-coords.json` (keyed by
  station slug) and take precedence over the curated `STATIONS` lookup in
  `build-seed.mjs`. Add new stations there (or to the lookup for lines/area).

## Cafe images / Google Places budget policy
- Every cafe always has a cover (`components/CafeCover.tsx`), in priority order:
  direct `photoUrl` → Google Places photo (`photoRef`) → free HotPepper photo
  (`hotpepperPhoto`) → representative chain/category image
  (`data/category-images.json`, via `lib/cafe-image.ts`) → generated tile. So the
  site is never image-less, even with zero Google spend.
- **HotPepper is the preferred real-photo source — it's FREE (no metering).**
  `npm run hotpepper` (needs `HOTPEPPER_KEY`, free key from Recruit Web Service)
  matches cafes and caches photo + shop URL in `data/hotpepper.json` (committed;
  NOT part of the build, so no deploy calls it). When a HotPepper photo is shown
  the cafe page MUST link back to the shop's HotPepper page (required by their
  terms) — handled in `app/cafe/[slug]/page.tsx`.
- **New cafes get HotPepper photos automatically.** The `.github/workflows/
  hotpepper.yml` Action re-runs on any push that changes `data/seed/venues.json`
  (e.g. the quarterly update adding cafes) and, because the fetch is incremental,
  only looks up the new cafes, then commits `data/hotpepper.json`. Needs the
  `HOTPEPPER_KEY` repo secret. No manual step required when adding cafes.
- **Places is OFF by default.** `scripts/fetch-places.mjs` no-ops unless
  `PLACES_ENABLE=1` is set — a kill-switch so no build ever spends by accident.
  Turn it on ONLY after setting a hard Google Cloud budget cap + API quota.
- **Google Places is metered against a recurring monthly free credit** — do NOT
  drain it. `scripts/fetch-places.mjs` enforces:
  - a hard **cap** of `PLACES_MAX_NEW` new photo lookups per run (default 250),
    leaving headroom so runtime `/api/place-photo` can still serve within credit;
  - **skip chains** (they already show a category storefront image) and spend the
    capped budget on independent, non-chain cafes — ideally the photogenic ones.
  - The cache (`data/places.json`) is committed and reused, so resolved cafes are
    never re-fetched. Commit it after a populated run.

### Instagram photos (official-account first; permission-gated)
Cafe pages can show the cafe's official Instagram link plus a small gallery
of the cafe's OWN posts. This must stay FAST and rights-clean:
- **Link-out is always safe.** `Venue.instagram` (an account URL, sourced from
  `data/collected/instagram.json` keyed by cafe name) renders as a "@handle on
  Instagram" link (`components/CafeInstagram.tsx`). Capture the OFFICIAL account
  only (cafe's own site / Google listing / confident name+area match). No photo is
  re-hosted, so there's no rights issue — grow this map freely during quarterly runs.
- **Galleries are Meta's OFFICIAL embeds, lazy-loaded.** We do NOT extract or
  self-host images: Meta's oEmbed terms only permit rendering the official embed
  (the tokenless oEmbed response returns `html`, not a usable thumbnail, and asking
  for `thumbnail_url` 403s). `components/CafeInstagram.tsx` renders the standard
  Instagram blockquotes and loads `embed.js` ONLY when the gallery scrolls into view
  (IntersectionObserver), so it never affects initial page load.
- **Only show cleared posts.** Add chosen post URLs to
  `data/collected/instagram-posts.json` (keyed by cafe name), flagged
  `ownAccount:true` (cafe's own posts) or `permission:true` (permission on file).
  `npm run instagram` (`scripts/fetch-instagram.mjs`) maps each to its slug,
  best-effort verifies the post's real author via tokenless oEmbed (dropping any
  that aren't the cafe's own), and writes `data/instagram-photos.json` (committed):
  `{ slug: { handle, posts: [{ permalink, credit, ... }] } }`. It downloads nothing
  and needs no token. Anything without ownAccount/permission is skipped.
- **Quarterly run:** when confirming a cafe, capture its official handle (if missing)
  and 2–4 of ITS OWN post URLs for the gallery.
- **Permission workflow** (for non-own-account photos, incl. the later
  location-tagged route): DM the account, ask to feature one photo with credit +
  link, set `permission:true` only after a yes. Suggested message:
  - JA: 「はじめまして。作業向けカフェ紹介サイト WorkingCafes と申します。御社の素敵なお写真を1枚、クレジット（@ユーザー名）とリンク付きで掲載してもよろしいでしょうか？無料で、集客のお手伝いになれば幸いです。」
  - EN: "Hi! We run WorkingCafes, a directory of laptop-friendly cafes. May we feature one of your photos on this cafe's page, with credit (@handle) and a link back? It's free and sends readers your way."
- **Location-tagged photos = LATER, permission only.** There is NO sanctioned API
  to discover photos by location (tokenless oEmbed is single-post; feeds/location
  need auth and are restricted). Do NOT scrape. If pursued, every photo goes
  through the permission workflow above before `permission:true` is set.

### Adding a NEW chain's stock image (DATA-ONLY — do this during the quarterly update)
Chain detection is data, not code: patterns live in `data/chain-matchers.json`, so a
new chain can be added with **no code change**. When a quarterly run adds cafes that
belong to a chain **not already** in `data/chain-matchers.json` and that chain has
**2+ locations**, add it so those cafes show a real storefront instead of the generic
independent pool:
  1. **Source ONE free-licensed storefront/sign photo** of that chain. Only these
     licenses are allowed (repo rule: no rights-unclear images): CC0 / CC BY / CC BY-SA
     / Public Domain (Wikimedia Commons, Openverse/Flickr), or the Pexels / Pixabay /
     Unsplash licenses. **Prefer Wikimedia Commons** — it's the easiest (no file to host).
     Vet it: it must clearly show the **correct brand sign/storefront**, be a professional
     shot, and not be a people-focused photo. Record the author, license, and source page.
  2. **Add the matcher** to `data/chain-matchers.json` → `matchers`: append
     `{ "key": "<snake_case_key>", "pattern": "<english|カタカナ>" }`. Keep specific chains
     before generic ones (order matters). Use a case-insensitive regex source (word
     boundaries `\\b` for short/ambiguous names like `gusto`).
  3. **Add the image** to `data/category-images.json` under the **same key**:
     - Wikimedia: `{ "kind": "wikimedia", "file": "<Commons filename.jpg>", "author": "...", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:..." }`
     - Openverse/Flickr, Pexels, or Pixabay: **download the file into
       `public/cafe-images/<key>-1.jpg`** and use
       `{ "kind": "local", "url": "/cafe-images/<key>-1.jpg", "author": "...", "license": "...", "page": "..." }`.
       (Self-host these — Pixabay/Pexels URLs expire or reject the resize params.)
     Multiple good storefronts? Make the value an **array** (a pool) — venues of that
     chain then get deterministic per-venue variety by slug.
  4. **Only add a matcher when you also have an image.** A matcher with no image makes
     the chain skip the Places budget AND show no chain photo. If no free image exists,
     do NOT add the matcher — leave those cafes to the independent pool and list the
     chain under FLAGGED in the PR so a human can source an image later.
  5. Credits update automatically (`allCategoryImages()` flattens pools), and the build
     (`npm run build`) must pass before opening the PR.

## Freshness & trust rules
- Every utility record must carry `last_checked` + `confidence`; the UI shows the date.
- Store only `google_place_id` from Google; never store other Google fields.
- Base geodata is OSM (ODbL) — keep the attribution in the footer.
- Original prose only. No copied descriptions, no rights-unclear images.
- **Plain English for ESL readers.** Many users read English as a second language.
  Write short, simple sentences; avoid corporate/formal words (no "stint",
  "amenities", "well-suited to", "geared toward", "purpose-built", "concourse").
  KEEP coffee terms (roaster, roastery, espresso) and Japanese terms — but gloss a
  Japanese term on first use, e.g. "kissaten (a traditional Japanese coffee house)".
  `scripts/plain-english.mjs` applies the common swaps automatically.

## Scaling to more areas / countries
- Adding an area = add a bounding box in `collect-overpass.mjs` + an `area` row.
  No code changes. The gate and digest are area-agnostic by design.
- Keep per-area confidence honest so the human queue stays flat as coverage grows.
