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

async function main() {
  const venues = JSON.parse(await readFile("data/seed/venues.json", "utf8"));
  let places = {};
  try { places = JSON.parse(await readFile("data/places.json", "utf8")); } catch {}

  if (!KEY) {
    console.log("fetch-places: no GOOGLE_PLACES_KEY — skipping (generated covers will be used).");
    return;
  }

  let matched = 0, none = 0, failed = 0, skipped = 0;
  for (const v of venues) {
    if (v.slug in places) { skipped++; continue; }
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
      });
      if (!res.ok) { failed++; continue; }
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
    }
    await new Promise((r) => setTimeout(r, 120)); // polite pacing
  }

  await writeFile("data/places.json", JSON.stringify(places, null, 2));
  console.log(`fetch-places: matched ${matched}, no-match ${none}, failed ${failed}, skipped ${skipped}, total ${Object.keys(places).length}`);
}

main().catch((e) => { console.error("fetch-places (non-fatal):", e.message); process.exit(0); });
