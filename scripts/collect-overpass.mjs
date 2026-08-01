// Overpass (OpenStreetMap) collector.
// Pulls amenity=cafe within a bounding box and writes DRAFT venue rows.
// OSM data is ODbL-licensed — you may store and build a database from it with
// attribution (which the site footer provides). This is your legal base layer;
// the Wi-Fi/outlet quality data is added and verified separately (enrich.mjs).
//
// Usage:  node scripts/collect-overpass.mjs shibuya
// Output: data/collected/<area>-draft.json  (review, enrich, then promote to seed/db)

import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Rough bounding boxes [south, west, north, east]. Refine per ward as you expand.
const BBOX = {
  shibuya: [35.648, 139.686, 35.671, 139.712],
  shinjuku: [35.683, 139.690, 35.701, 139.715],
};

const area = process.argv[2] || "shibuya";
const box = BBOX[area];
if (!box) {
  console.error(`No bounding box for "${area}". Add one to BBOX in this script.`);
  process.exit(1);
}

const query = `
[out:json][timeout:60];
(
  node["amenity"="cafe"](${box.join(",")});
  way["amenity"="cafe"](${box.join(",")});
);
out center tags;
`;

function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
}

async function main() {
  console.log(`Querying Overpass for cafes in ${area}…`);
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const data = await res.json();

  const drafts = (data.elements || [])
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const osmWifi = el.tags["internet_access"]; // sometimes present in OSM
      return {
        id: `osm-${el.type}-${el.id}`,
        slug: slugify(el.tags["name:en"] || el.tags.name) + "-" + area,
        name: el.tags["name:en"] || el.tags.name,
        nameJa: el.tags["name:ja"] || el.tags.name,
        address: el.tags["addr:full"] || "",
        areaSlug: area,
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
    });

  const out = `data/collected/${area}-draft.json`;
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(drafts, null, 2));
  console.log(`Wrote ${drafts.length} draft cafes -> ${out}`);
  console.log("Next: run enrich.mjs to research Wi-Fi/outlet data, then review before publishing.");
}

main().catch((e) => { console.error(e); process.exit(1); });
