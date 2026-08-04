# Security & cost-safety notes — WorkingCafes

A running record of the site's security/cost safeguards and the follow-ups still
owed. Reviewed during the pre-growth audit (Aug 2026).

## In place (do not remove without a replacement)

**Google Places cost controls** (the API that caused the Aug 2026 overspend)
- `scripts/fetch-places.mjs` is **off by default** — it no-ops unless
  `PLACES_ENABLE=1` is set. It is NOT part of the site build's automatic path.
- When enabled, it is capped at `PLACES_MAX_NEW` (default 250) new lookups per
  run, **skips chains** (they use free category images), reuses the committed
  `data/places.json` cache, times out per request, and stops after 12
  consecutive failures.
- A **hard quota cap** is set in Google Cloud (SearchText = 1/day, etc.) as the
  final backstop. Raise it only for a deliberate one-off run, then lower it again.

**Photo proxy** `app/api/place-photo/route.ts`
- `ref` is strictly validated (`^places/…/photos/…$`) — no SSRF / open proxy.
- Width `w` is snapped to a small allow-list, so it can't be swept into many
  separately-billed Google fetches per photo.
- Same-site `Referer` guard blocks other sites hotlinking through it.
- 8s upstream timeout; long CDN cache so Google is hit ~once per photo.

**Secrets**
- No secrets committed. `GOOGLE_PLACES_KEY`, `HOTPEPPER_KEY`, `ANTHROPIC_API_KEY`
  are env vars / GitHub secrets. Only the Cloudflare **beacon token** is in code,
  which is public by design.
- The GitHub push token used for automation is repo-scoped; rotate on expiry.

**GitHub Actions**
- `claude.yml` (the `@claude` builder) only runs for repo
  owner/member/collaborator authors — not any public user.
- `hotpepper.yml` is incremental, free/unmetered, and can't self-loop.

**App hardening**
- Security headers in `next.config.js`: `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Strict-Transport-Security`; `X-Powered-By` removed.
- JSON-LD output (`lib/schema-org.tsx`) is escaped — auto-published cafe prose is
  treated as untrusted.
- Maps use free/keyless services (Maps Embed API + CARTO tiles) — no metered map cost.

## TODO — before turning Google Places back on

1. **Rate-limit `/api/place-photo`.** The code guards (width allow-list + referer)
   help, but a real per-IP rate limit needs a Vercel or Cloudflare WAF rule.
   Add it before publishing any Places photo refs at scale.
2. **Restrict the Maps Embed key.** In Google Cloud → Credentials, confirm
   `NEXT_PUBLIC_GMAPS_EMBED_KEY` is restricted to the **Maps Embed API** and to
   the site's domains (`workingcafes.com`, `*.vercel.app`). It's a public
   (client-side) key, so restriction is its only protection.

## Scale follow-ups (not urgent)
- `lib/db.ts` now uses O(1) index maps; keep new lookups off full scans.
- `ExploreMap` renders only nearby pins on context pages; if expanding beyond
  Tokyo, stop shipping the global point set on every page (scope it per route).
