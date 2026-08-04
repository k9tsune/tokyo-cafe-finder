// Free street-level cafe photos via the Mapillary API v4 (graph.mapillary.com).
// Mapillary is crowdsourced street imagery. Unlike Google Places it is FREE and
// not metered for read use. There is no per-business tagging, so we match purely
// by LOCATION: for each venue we ask for imagery in a small box around its
// lat/lng, pick the physically CLOSEST image, and only accept it when it is near
// enough to plausibly show that storefront. Results are cached in
// data/mapillary.json keyed by slug and committed, so this is a run-once job — it
// is NOT part of the build, so no deploy ever calls it.
//
// WATERFALL: Mapillary is the THIRD real-photo tier, below Google Places and
// HotPepper (see CLAUDE.md image priority). We only spend a lookup on a venue
// when it has NO Google Places photo (`data/places.json` -> ref) and NO HotPepper
// photo (`data/hotpepper.json` -> photo). Venues already covered by a higher tier
// are skipped without an API call, so this stays correct as those tiers fill in.
//
// Usage:  MAPILLARY_TOKEN='MLY|xxxx|xxxx' node scripts/fetch-mapillary.mjs
// Get a free client token at https://www.mapillary.com/dashboard/developers
//
// LICENSE: Mapillary imagery is CC-BY-SA. Wherever a photo is displayed you MUST
// show attribution: the contributor username, a link to the image, and the
// license. Each cache entry stores `creator`, `mapillaryUrl`, and `license` for
// exactly this purpose.

import { readFile, writeFile } from "node:fs/promises";

const TOKEN = process.env.MAPILLARY_TOKEN;
const ENDPOINT = "https://graph.mapillary.com/images";

// Accept an image only if the closest one is within this many meters of the
// venue — beyond this it is unlikely to actually show the storefront. Tunable.
const MAX_DISTANCE_M = 30;
// Half-size of the search box in degrees (~0.00045 deg lat ≈ 50m). Mapillary
// requires the bbox to be smaller than 0.01 deg square, so this is well within.
const HALF = 0.00045;
// How many venues to look up at once. Mapillary tolerates modest concurrency;
// this is what turns a ~10-minute sequential crawl into ~1-2 minutes.
const CONCURRENCY = 8;
// Persist the cache to disk every this-many completed venues, so a crash or
// timeout never loses more than a few lookups (the run is fully resumable).
const SAVE_EVERY = 25;

const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
function haversine(aLat, aLng, bLat, bLng) {
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function fetchNear(lat, lng) {
  const bbox = [lng - HALF, lat - HALF, lng + HALF, lat + HALF].join(",");
  const params = new URLSearchParams({
    access_token: TOKEN,
    fields: "id,thumb_1024_url,thumb_2048_url,captured_at,is_pano,creator,geometry",
    bbox,
    limit: "50",
  });
  const res = await fetch(`${ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.data || [];
}

// From candidate images, return the closest one to (lat,lng) and its distance,
// preferring flat (non-360) images when one is within range. Returns null if the
// nearest acceptable image is farther than MAX_DISTANCE_M.
function pickClosest(images, lat, lng) {
  let best = null, bestD = Infinity;
  for (const im of images) {
    const c = im?.geometry?.coordinates; // [lng, lat]
    if (!c || c.length < 2) continue;
    const d = haversine(lat, lng, c[1], c[0]);
    // small penalty for panoramas so a nearby flat shot wins ties
    const score = d + (im.is_pano ? 5 : 0);
    if (score < bestD) { bestD = score; best = im; best._distance = d; }
  }
  if (!best || best._distance > MAX_DISTANCE_M) return null;
  return best;
}

// A venue is already covered by a higher tier if it has a Google Places photo
// (places entry with a `ref`) or a HotPepper photo (hotpepper entry with a
// `photo`). Those win in the render, so Mapillary should not spend a lookup.
function higherTierPhoto(slug, places, hotpepper) {
  const p = places[slug];
  if (p && p.ref) return "places";
  const h = hotpepper[slug];
  if (h && h.photo) return "hotpepper";
  return null;
}

async function main() {
  const venues = JSON.parse(await readFile("data/seed/venues.json", "utf8"));
  let cache = {};
  try { cache = JSON.parse(await readFile("data/mapillary.json", "utf8")); } catch {}
  let places = {};
  try { places = JSON.parse(await readFile("data/places.json", "utf8")); } catch {}
  let hotpepper = {};
  try { hotpepper = JSON.parse(await readFile("data/hotpepper.json", "utf8")); } catch {}

  if (!TOKEN) {
    console.log("fetch-mapillary: no MAPILLARY_TOKEN — skipping. Get a free token at https://www.mapillary.com/dashboard/developers");
    return;
  }

  const save = () => writeFile("data/mapillary.json", JSON.stringify(cache, null, 2));

  let matched = 0, none = 0, failed = 0, cached = 0, higher = 0, nocoord = 0;
  let sinceSave = 0;

  // Build the work list: only venues that are not already cached and not covered
  // by a higher tier. No-coord venues are recorded as null right away.
  const todo = [];
  for (const v of venues) {
    if (v.slug in cache) { cached++; continue; }
    const tier = higherTierPhoto(v.slug, places, hotpepper);
    if (tier) { higher++; continue; } // covered by Places/HotPepper — skip, no API call, don't store
    if (typeof v.lat !== "number" || typeof v.lng !== "number") {
      cache[v.slug] = null; none++; nocoord++; continue;
    }
    todo.push(v);
  }

  // Simple fixed-size worker pool over the todo list.
  let idx = 0;
  async function worker() {
    while (idx < todo.length) {
      const v = todo[idx++];
      try {
        const images = await fetchNear(v.lat, v.lng);
        const im = pickClosest(images, v.lat, v.lng);
        if (!im) {
          cache[v.slug] = null; none++;
        } else {
          cache[v.slug] = {
            imageId: im.id,
            photo: im.thumb_2048_url || im.thumb_1024_url,   // display image
            thumb: im.thumb_1024_url || null,
            capturedAt: im.captured_at ?? null,
            isPano: !!im.is_pano,
            distanceM: Math.round(im._distance),              // eyeball match quality
            creator: im.creator?.username ?? null,            // REQUIRED for attribution
            mapillaryUrl: `https://www.mapillary.com/app/?pKey=${im.id}&focus=photo`,
            license: "CC-BY-SA-4.0",
          };
          matched++;
        }
      } catch {
        failed++;
      }
      if (++sinceSave >= SAVE_EVERY) { sinceSave = 0; await save(); }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  await save();

  console.log(
    `fetch-mapillary: matched ${matched}, no-match ${none} (of which ${nocoord} had no coords), ` +
    `failed ${failed}, higher-tier-skipped ${higher}, already-cached ${cached}, ` +
    `total-in-cache ${Object.keys(cache).length}`
  );
}

main().catch((e) => { console.error("fetch-mapillary (non-fatal):", e.message); process.exit(0); });
