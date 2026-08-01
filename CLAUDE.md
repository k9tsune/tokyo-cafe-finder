# CLAUDE.md — operating instructions for Tokyo Cafe Finder

This file tells Claude Code how to run the data pipeline. The design principle
is **fully automated with exception-only escalation**: the weekly check runs
unattended and publishes high-confidence updates on its own, flagging only the
hardest/most-problematic cases for a human. This must scale from Tokyo to all of
Japan and, later, other countries — so human review is the exception, never the
default.

## Project shape
- `lib/db.ts` — data access. Seed JSON now; Postgres/PostGIS (`db/schema.sql`) in Phase B.
- `scripts/collect-overpass.mjs` — pulls cafes from OpenStreetMap (ODbL base layer).
- `scripts/enrich.mjs` — researches Wi-Fi/outlet data + runs the auto-approval gate.
- Pages are static (SSG) for SEO/GEO; the sitemap regenerates on build.

## Weekly automated run (target: unattended)
1. **Collect.** For each covered area, run `collect-overpass.mjs <area>` to find
   new/removed cafes. New cafes enter as `draft`, `confidence: low`.
2. **Research.** `enrich.mjs <area>` calls Claude to propose Wi-Fi / outlet /
   laptop-friendly values, each with a **confidence** level and **source URLs**.
   Rules for the research step:
   - Write ORIGINAL summaries. Never copy source text (guardrail).
   - Set confidence honestly; set `sourceConflict: true` when public sources disagree.
   - Prefer official pages and recent, corroborating sources.
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

## Freshness & trust rules
- Every utility record must carry `last_checked` + `confidence`; the UI shows the date.
- Store only `google_place_id` from Google; never store other Google fields.
- Base geodata is OSM (ODbL) — keep the attribution in the footer.
- Original prose only. No copied descriptions, no rights-unclear images.

## Scaling to more areas / countries
- Adding an area = add a bounding box in `collect-overpass.mjs` + an `area` row.
  No code changes. The gate and digest are area-agnostic by design.
- Keep per-area confidence honest so the human queue stays flat as coverage grows.
