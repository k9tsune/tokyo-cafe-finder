// Build-time enrichment via Google Places API (New): for each cafe, look it up
// once and capture (a) a photo resource name, (b) attribution, (c) precise
// lat/lng. Results are cached in data/places.json keyed by slug, so cafes already
// resolved are skipped on later runs.
//
// - Needs GOOGLE_PLACES_KEY (server secret) in the environment. Without it, this
//   no-ops so local builds still work (covers stay generated, map uses whatever
//   coords exist).
// - Uses field masking so you're billed only for id/location/photos.
// - Never fails the build: any error is logged and swallowed.

import { readFile, writeFile } from "node:fs/promises";

const KEY = process.env.GOOGLE_PLACES_KEY;

// Look up a single place by text query and return its first photo ref + attribution.
// Field-masked so billing covers only id/location/photos. Returns null on no match.
async function lookupPhoto(textQuery) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id,places.location,places.photos.name,places.photos.authorAttributions",
    },
    body: JSON.stringify({ textQuery, maxResultCount: 1, languageCode: "en" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pl = data?.places?.[0];
  if (!pl) return null;
  const photo = pl.photos?.[0];
  return {
    ref: photo?.name ?? null,
    attr: photo?.authorAttributions?.[0]?.displayName ?? null,
    lat: pl.location?.latitude ?? null,
    lng: pl.location?.longitude ?? null,
  };
}

async function main() {
  const venues = JSON.parse(await readFile("data/seed/venues.json", "utf8"));
  let places = {};
  try { places = JSON.parse(await readFile("data/places.json", "utf8")); } catch {}

  // SAFETY KILL-SWITCH: do nothing unless explicitly enabled. Google Places is
  // metered and billed once the monthly free credit is used up, so a build must
  // never call it by accident. Set PLACES_ENABLE=1 (and a Google Cloud budget cap)
  // only when you deliberately want to (re)populate the photo cache. Default OFF.
  if (process.env.PLACES_ENABLE !== "1") {
    console.log("fetch-places: DISABLED (set PLACES_ENABLE=1 to run). Existing cache + category/illustration fallbacks are used — no Google spend.");
    return;
  }

  if (!KEY) {
    console.log("fetch-places: no GOOGLE_PLACES_KEY — skipping (generated covers will be used).");
    return;
  }

  // --- Budget policy (keeps us inside Google's recurring monthly free credit) ---
  // 1. CAP: never make more than PLACES_MAX_NEW *new* photo lookups per run, so a
  //    single build can't drain the month's credit and runtime /api/place-photo
  //    still has headroom to serve images.
  // 2. PRIORITY: chains already show a representative storefront image
  //    (data/category-images.json), so we DON'T spend paid lookups on them — the
  //    budget goes to independent, non-chain cafes (the ones worth a real photo).
  const MAX_NEW = parseInt(process.env.PLACES_MAX_NEW || "250", 10);
  const isChainName = (name = "", nameJa = "") => {
    const s = `${name} ${nameJa}`;
    return /starbucks|スターバックス|doutor|ドトール|tully|タリーズ|excelsior|エクセルシオール|\bpronto\b|プロント|veloce|ベローチェ|komeda|コメダ|st\.? ?marc|サンマルク|de crie|ド・?クリエ|ueshima|\bucc\b|上島|renoir|ルノアール|mcdonald|マクドナルド|\bkfc\b|kentucky|ケンタッキー/i.test(s);
  };
  // Non-chain cafes first, so the capped budget is spent on them.
  const ordered = [...venues].sort((a, b) => Number(isChainName(a.name, a.nameJa)) - Number(isChainName(b.name, b.nameJa)));

  let matched = 0, none = 0, failed = 0, skipped = 0, chainSkipped = 0, capped = 0, consecutiveFail = 0;
  for (const v of ordered) {
    if (v.slug in places) { skipped++; continue; }
    if (isChainName(v.name, v.nameJa)) { chainSkipped++; continue; } // uses category image, not a paid lookup
    if (matched + none >= MAX_NEW) { capped++; continue; }            // hard budget cap
    const q = [v.name, v.address, "Tokyo, Japan"].filter(Boolean).join(", ");
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": KEY,
          "X-Goog-FieldMask": "places.id,places.location,places.photos.name,places.photos.authorAttributions",
        },
        body: JSON.stringify({ textQuery: q, maxResultCount: 1, languageCode: "en" }),
        signal: AbortSignal.timeout(8000), // don't let a hung socket stall the build
      });
      if (!res.ok) {
        failed++;
        if (++consecutiveFail >= 12) { console.log("fetch-places: 12 consecutive failures (quota/auth?) — stopping early."); break; }
        continue;
      }
      consecutiveFail = 0;
      const data = await res.json();
      const pl = data?.places?.[0];
      if (!pl) { places[v.slug] = null; none++; continue; }
      const photo = pl.photos?.[0];
      places[v.slug] = {
        ref: photo?.name ?? null,
        attr: photo?.authorAttributions?.[0]?.displayName ?? null,
        lat: pl.location?.latitude ?? null,
        lng: pl.location?.longitude ?? null,
      };
      matched++;
    } catch {
      failed++;
      if (++consecutiveFail >= 12) { console.log("fetch-places: 12 consecutive failures — stopping early."); break; }
    }
    await new Promise((r) => setTimeout(r, 120)); // polite pacing
  }

  console.log(`fetch-places (cafes): matched ${matched}, no-match ${none}, failed ${failed}, skipped ${skipped}, chains-skipped ${chainSkipped}, over-cap ${capped} (cap ${MAX_NEW})`);

  // --- Areas & stations -------------------------------------------------------
  // Same lookup, keyed by "area:<slug>" / "station:<slug>" so they never collide
  // with cafe slugs. Areas only fill in where there's no curated Wikimedia photo
  // (see lib/media.ts); stations have no other photo source, so all are resolved.
  let geoMatched = 0, geoNone = 0, geoFailed = 0, geoSkipped = 0;
  let curatedAreas = {};
  try { curatedAreas = JSON.parse(await readFile("data/area-photos.json", "utf8")); } catch {}

  const areas = JSON.parse(await readFile("data/seed/areas.json", "utf8"));
  for (const a of areas) {
    const key = `area:${a.slug}`;
    if (key in places) { geoSkipped++; continue; }
    if (curatedAreas[a.slug]) continue; // a hand-picked Wikimedia photo already exists
    try {
      const info = await lookupPhoto(`${a.name}, Tokyo, Japan`);
      places[key] = info; // may be null (cached as "no match")
      if (info?.ref) geoMatched++; else geoNone++;
    } catch { geoFailed++; }
    await new Promise((r) => setTimeout(r, 120));
  }

  const stations = JSON.parse(await readFile("data/seed/stations.json", "utf8"));
  for (const s of stations) {
    const key = `station:${s.slug}`;
    if (key in places) { geoSkipped++; continue; }
    const q = /station$/i.test(s.name) ? `${s.name}, Tokyo, Japan` : `${s.name} Station, Tokyo, Japan`;
    try {
      const info = await lookupPhoto(q);
      places[key] = info;
      if (info?.ref) geoMatched++; else geoNone++;
    } catch { geoFailed++; }
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`fetch-places (areas+stations): matched ${geoMatched}, no-match ${geoNone}, failed ${geoFailed}, skipped ${geoSkipped}`);

  await writeFile("data/places.json", JSON.stringify(places, null, 2));
  console.log(`fetch-places: total keys ${Object.keys(places).length}`);
}

main().catch((e) => { console.error("fetch-places (non-fatal):", e.message); process.exit(0); });
