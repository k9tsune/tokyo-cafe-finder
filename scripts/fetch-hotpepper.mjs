// Free cafe photos + data via the HotPepper Gourmet Search API (Recruit Web
// Service). Unlike Google Places this API is FREE and not metered — a single
// search returns the shop's photo URL and its HotPepper page URL (which we must
// link back to). Results are cached in data/hotpepper.json keyed by slug and
// committed, so this is a run-once job — it is NOT part of the build, so no
// deploy ever calls it.
//
// Usage:  HOTPEPPER_KEY=xxxxxxxx node scripts/fetch-hotpepper.mjs
// Get a free key at https://webservice.recruit.co.jp/register
//
// Matching is strict (name overlap required) to avoid attaching a wrong photo:
// we query by the Japanese name where we have one, constrained to the cafe's
// location, and only accept a shop whose name overlaps ours.

import { readFile, writeFile } from "node:fs/promises";

const KEY = process.env.HOTPEPPER_KEY;
const ENDPOINT = "https://webservice.recruit.co.jp/hotpepper/gourmet/v1/";

const norm = (s) => (s || "").toLowerCase().replace(/[\s　()（）.,'’・\-–—　]/g, "");

async function search(params) {
  const url = ENDPOINT + "?" + new URLSearchParams({ key: KEY, format: "json", count: "5", ...params }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.results?.shop || [];
}

// Strict: only return a shop whose (normalized) name overlaps ours, to avoid
// mismatches. Returns null when nothing confidently matches.
function pickMatch(shops, queryName) {
  const n = norm(queryName);
  if (!n) return shops[0] || null;
  for (const s of shops) {
    const sn = norm(s.name);
    if (sn && (sn.includes(n) || n.includes(sn))) return s;
  }
  return null;
}

async function main() {
  const venues = JSON.parse(await readFile("data/seed/venues.json", "utf8"));
  let cache = {};
  try { cache = JSON.parse(await readFile("data/hotpepper.json", "utf8")); } catch {}

  if (!KEY) {
    console.log("fetch-hotpepper: no HOTPEPPER_KEY — skipping. Get a free key at https://webservice.recruit.co.jp/register");
    return;
  }

  let matched = 0, none = 0, failed = 0, skipped = 0;
  for (const v of venues) {
    if (v.slug in cache) { skipped++; continue; }
    const q = v.nameJa || v.name;
    try {
      let shops = [];
      if (typeof v.lat === "number" && typeof v.lng === "number") {
        shops = await search({ keyword: q, lat: String(v.lat), lng: String(v.lng), range: "4" });
      }
      if (!shops.length) shops = await search({ keyword: q });
      const s = pickMatch(shops, q);
      if (!s || !s.photo?.pc?.l) {
        cache[v.slug] = null; none++;
      } else {
        cache[v.slug] = {
          shopId: s.id ?? null,
          photo: s.photo.pc.l,               // large shop photo (hotlinked)
          url: s.urls?.pc ?? null,           // HotPepper page — REQUIRED link-back
          matchedName: s.name ?? null,       // for eyeballing match quality
          wifi: s.wifi ?? null,              // "あり" / "なし" (info only; not overriding our data)
        };
        matched++;
      }
    } catch {
      failed++;
    }
    await new Promise((r) => setTimeout(r, 220)); // polite pacing (free API)
  }

  await writeFile("data/hotpepper.json", JSON.stringify(cache, null, 2));
  console.log(`fetch-hotpepper: matched ${matched}, no-match ${none}, failed ${failed}, skipped ${skipped}, total ${Object.keys(cache).length}`);
}

main().catch((e) => { console.error("fetch-hotpepper (non-fatal):", e.message); process.exit(0); });
