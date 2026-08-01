// Tokyo-wide Overpass (OpenStreetMap) collector for the 23 special wards.
//
// OSM data is ODbL-licensed — you may store and build a database from it with
// attribution (the site footer provides it). This is the legal BASE layer only.
// Wi-Fi/outlet QUALITY data is enriched and verified separately (enrich.mjs).
// This script NEVER invents cafes, coordinates, or Wi-Fi/outlet status: it only
// maps what Overpass actually returns. Unknown fields keep honest low-confidence
// defaults; only OSM `internet_access` may set hasWifi/wifiType.
//
// Usage:
//   node scripts/collect-tokyo.mjs all         # loop every ward (polite 2s gap)
//   node scripts/collect-tokyo.mjs shibuya     # a single ward by slug
//   node scripts/collect-tokyo.mjs             # defaults to "all"
//
// Output:
//   data/collected/tokyo/<ward-slug>.json      # raw draft rows per ward
//   data/collected/tokyo-all.json              # combined + deduped dataset
//   data/collected/tokyo-summary.json          # counts + per-ward breakdown
//
// The single-bbox collect-overpass.mjs is left untouched and still works.

import { writeFile, mkdir } from "node:fs/promises";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const REQUEST_DELAY_MS = 2000; // polite gap between wards
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 5000;
const QUERY_TIMEOUT = 180; // Overpass server-side timeout (seconds)

// The 23 Tokyo special wards. `nameJa` drives the primary Overpass `area`
// query (admin_level 7). `bbox` [south, west, north, east] is a FALLBACK only,
// used when the area query returns nothing (e.g. boundary name mismatch).
const WARDS = [
  { slug: "chiyoda",   nameEn: "Chiyoda",   nameJa: "千代田区", bbox: [35.673, 139.735, 35.706, 139.775] },
  { slug: "chuo",      nameEn: "Chuo",      nameJa: "中央区",   bbox: [35.655, 139.760, 35.694, 139.800] },
  { slug: "minato",    nameEn: "Minato",    nameJa: "港区",     bbox: [35.617, 139.720, 35.678, 139.782] },
  { slug: "shinjuku",  nameEn: "Shinjuku",  nameJa: "新宿区",   bbox: [35.677, 139.680, 35.720, 139.740] },
  { slug: "bunkyo",    nameEn: "Bunkyo",    nameJa: "文京区",   bbox: [35.699, 139.727, 35.735, 139.766] },
  { slug: "taito",     nameEn: "Taito",     nameJa: "台東区",   bbox: [35.692, 139.769, 35.735, 139.808] },
  { slug: "sumida",    nameEn: "Sumida",    nameJa: "墨田区",   bbox: [35.690, 139.790, 35.740, 139.825] },
  { slug: "koto",      nameEn: "Koto",      nameJa: "江東区",   bbox: [35.620, 139.780, 35.700, 139.850] },
  { slug: "shinagawa", nameEn: "Shinagawa", nameJa: "品川区",   bbox: [35.578, 139.700, 35.630, 139.760] },
  { slug: "meguro",    nameEn: "Meguro",    nameJa: "目黒区",   bbox: [35.598, 139.668, 35.653, 139.720] },
  { slug: "ota",       nameEn: "Ota",       nameJa: "大田区",   bbox: [35.540, 139.680, 35.618, 139.790] },
  { slug: "setagaya",  nameEn: "Setagaya",  nameJa: "世田谷区", bbox: [35.598, 139.600, 35.665, 139.688] },
  { slug: "shibuya",   nameEn: "Shibuya",   nameJa: "渋谷区",   bbox: [35.640, 139.670, 35.685, 139.718] },
  { slug: "nakano",    nameEn: "Nakano",    nameJa: "中野区",   bbox: [35.685, 139.638, 35.727, 139.685] },
  { slug: "suginami",  nameEn: "Suginami",  nameJa: "杉並区",   bbox: [35.670, 139.585, 35.730, 139.660] },
  { slug: "toshima",   nameEn: "Toshima",   nameJa: "豊島区",   bbox: [35.715, 139.680, 35.748, 139.735] },
  { slug: "kita",      nameEn: "Kita",      nameJa: "北区",     bbox: [35.740, 139.700, 35.795, 139.760] },
  { slug: "arakawa",   nameEn: "Arakawa",   nameJa: "荒川区",   bbox: [35.725, 139.750, 35.755, 139.805] },
  { slug: "itabashi",  nameEn: "Itabashi",  nameJa: "板橋区",   bbox: [35.740, 139.640, 35.805, 139.725] },
  { slug: "nerima",    nameEn: "Nerima",    nameJa: "練馬区",   bbox: [35.720, 139.560, 35.790, 139.660] },
  { slug: "adachi",    nameEn: "Adachi",    nameJa: "足立区",   bbox: [35.755, 139.740, 35.820, 139.840] },
  { slug: "katsushika",nameEn: "Katsushika",nameJa: "葛飾区",   bbox: [35.720, 139.820, 35.790, 139.900] },
  { slug: "edogawa",   nameEn: "Edogawa",   nameJa: "江戸川区", bbox: [35.635, 139.830, 35.740, 139.920] },
];

const WARD_BY_SLUG = Object.fromEntries(WARDS.map((w) => [w.slug, w]));

// --- shared shape helpers (kept identical to collect-overpass.mjs) ----------

function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
}

// Map one raw Overpass element -> a draft Venue row (lib/types.ts shape).
// Returns null for elements without a name (unnamed cafes are skipped).
function toVenue(el, wardSlug) {
  if (!el.tags || !el.tags.name) return null;
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const osmWifi = el.tags["internet_access"]; // sometimes present in OSM
  return {
    id: `osm-${el.type}-${el.id}`,
    slug: slugify(el.tags["name:en"] || el.tags.name) + "-" + wardSlug,
    name: el.tags["name:en"] || el.tags.name,
    nameJa: el.tags["name:ja"] || el.tags.name,
    address: el.tags["addr:full"] || "",
    areaSlug: wardSlug,
    stationSlugs: [],
    lat, lng,
    nearestStation: "",
    walkMinutes: 0,
    chainName: el.tags.brand || undefined,
    // Unknowns default to low-confidence; enrich.mjs fills these in.
    hasWifi: osmWifi ? osmWifi !== "no" : false,
    wifiType: osmWifi === "wlan" ? "free" : "none",
    hasPower: false,
    powerDensity: "none",
    laptopFriendly: false,
    description: "",
    lastChecked: "",           // stamped when verified
    confidence: "low",
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    _status: "draft",
  };
}

// --- Overpass query builders -------------------------------------------------

function areaQuery(nameJa) {
  // Prefer admin boundary by name (admin_level 7 = Tokyo special wards).
  return `
[out:json][timeout:${QUERY_TIMEOUT}];
area["boundary"="administrative"]["admin_level"="7"]["name"="${nameJa}"]->.w;
(
  node["amenity"="cafe"](area.w);
  way["amenity"="cafe"](area.w);
);
out center tags;`;
}

function bboxQuery(bbox) {
  return `
[out:json][timeout:${QUERY_TIMEOUT}];
(
  node["amenity"="cafe"](${bbox.join(",")});
  way["amenity"="cafe"](${bbox.join(",")});
);
out center tags;`;
}

// --- networking with retry ---------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runQuery(query) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      // 429 (rate limit) and 504 (server timeout) are retryable.
      if (res.status === 429 || res.status === 504) {
        throw new Error(`Overpass HTTP ${res.status} (retryable)`);
      }
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      const data = await res.json();
      return data.elements || [];
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRIES) {
        const wait = RETRY_BACKOFF_MS * attempt;
        console.warn(`  attempt ${attempt} failed: ${e.message} — retrying in ${wait}ms`);
        await sleep(wait);
      }
    }
  }
  throw lastErr;
}

// Collect one ward: try the area query first, fall back to bbox if empty.
async function collectWard(ward) {
  console.log(`Querying Overpass for cafes in ${ward.nameEn} (${ward.nameJa})…`);
  let elements = await runQuery(areaQuery(ward.nameJa));
  let method = "area";
  if (elements.length === 0) {
    console.warn(`  area query returned 0 — falling back to bbox for ${ward.slug}`);
    elements = await runQuery(bboxQuery(ward.bbox));
    method = "bbox";
  }
  const venues = elements.map((el) => toVenue(el, ward.slug)).filter(Boolean);
  console.log(`  ${venues.length} named cafes (via ${method})`);
  return { venues, method, rawCount: elements.length };
}

// --- dedupe ------------------------------------------------------------------

// Dedupe by OSM id, then collapse obvious duplicate name+coordinate pairs
// (same lowercased name within ~11m — coords rounded to 4 decimals).
function dedupe(venues) {
  const byId = new Map();
  for (const v of venues) {
    if (!byId.has(v.id)) byId.set(v.id, v);
  }
  const seen = new Set();
  const out = [];
  for (const v of byId.values()) {
    const latKey = Number.isFinite(v.lat) ? v.lat.toFixed(4) : "na";
    const lngKey = Number.isFinite(v.lng) ? v.lng.toFixed(4) : "na";
    const key = `${String(v.name).toLowerCase()}|${latKey}|${lngKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

// --- main --------------------------------------------------------------------

async function main() {
  const arg = (process.argv[2] || "all").toLowerCase();

  let targets;
  if (arg === "all") {
    targets = WARDS;
  } else if (WARD_BY_SLUG[arg]) {
    targets = [WARD_BY_SLUG[arg]];
  } else {
    console.error(`Unknown ward "${arg}". Valid: all | ${WARDS.map((w) => w.slug).join(", ")}`);
    process.exit(1);
  }

  await mkdir("data/collected/tokyo", { recursive: true });

  const combined = [];
  const perWard = {};
  const failed = [];

  for (let i = 0; i < targets.length; i++) {
    const ward = targets[i];
    try {
      const { venues, method } = await collectWard(ward);
      const wardOut = `data/collected/tokyo/${ward.slug}.json`;
      await writeFile(wardOut, JSON.stringify(venues, null, 2));
      combined.push(...venues);
      perWard[ward.slug] = {
        name: ward.nameEn,
        count: venues.length,
        method,
        withWifiTag: venues.filter((v) => v.wifiType !== "none" || v.hasWifi).length,
        withChain: venues.filter((v) => v.chainName).length,
      };
    } catch (e) {
      console.error(`  FAILED ${ward.slug}: ${e.message}`);
      failed.push({ slug: ward.slug, error: e.message });
      perWard[ward.slug] = { name: ward.nameEn, count: 0, method: "failed", withWifiTag: 0, withChain: 0 };
    }
    if (i < targets.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  // Build combined + deduped dataset.
  const beforeDedupe = combined.length;
  const deduped = dedupe(combined);

  await writeFile("data/collected/tokyo-all.json", JSON.stringify(deduped, null, 2));

  // Summary. "withWifiTag" counts venues that carried an OSM internet_access
  // signal (hasWifi true or a non-"none" wifiType). "withChain" counts a
  // brand/chain tag.
  const withWifiTag = deduped.filter((v) => v.hasWifi || v.wifiType !== "none").length;
  const withChain = deduped.filter((v) => v.chainName).length;

  const summary = {
    generatedAt: new Date().toISOString(),
    source: "OpenStreetMap via Overpass API (ODbL)",
    scope: arg === "all" ? "tokyo-23-wards" : arg,
    totalCafes: deduped.length,
    duplicatesRemoved: beforeDedupe - deduped.length,
    withOsmWifiTag: withWifiTag,
    withChainBrand: withChain,
    wardsQueried: targets.length,
    wardsFailed: failed,
    perWard,
  };
  await writeFile("data/collected/tokyo-summary.json", JSON.stringify(summary, null, 2));

  // Print summary.
  console.log("\n==== Tokyo cafe collection summary ====");
  console.log(`Total cafes (deduped): ${deduped.length}  (removed ${beforeDedupe - deduped.length} duplicates)`);
  console.log(`With OSM Wi-Fi tag:    ${withWifiTag}`);
  console.log(`With chain/brand tag:  ${withChain}`);
  console.log("\nPer-ward counts:");
  for (const w of targets) {
    const p = perWard[w.slug];
    const flag = p.method === "failed" ? "  <-- FAILED" : (p.count === 0 ? "  <-- empty/incomplete?" : "");
    console.log(`  ${w.slug.padEnd(11)} ${String(p.count).padStart(4)}  (${p.method})${flag}`);
  }
  if (failed.length) {
    console.log(`\nWards needing re-run: ${failed.map((f) => f.slug).join(", ")}`);
  }
  console.log("\nWrote:");
  console.log("  data/collected/tokyo/<ward>.json (per ward)");
  console.log("  data/collected/tokyo-all.json");
  console.log("  data/collected/tokyo-summary.json");
  console.log("\nNext: run enrich.mjs to research Wi-Fi/outlet data, then review before publishing.");
}

main().catch((e) => { console.error(e); process.exit(1); });
