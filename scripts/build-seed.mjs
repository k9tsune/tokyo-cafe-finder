// Transforms the web-researched raw cafe data (data/collected/raw/*.json) into
// the app's seed dataset: data/seed/{venues,areas,stations}.json.
//
// Notes:
// - Coordinates come from an approximate STATION lookup (station-level), used
//   only for "near me" distance sorting and JSON-LD geo. The on-page map uses a
//   precise text query (name + address), so exact cafe coordinates aren't needed
//   for the map or directions. A later geocoding pass can refine per-cafe coords.
// - lastChecked is stamped with the research date. Confidence is carried through
//   from the researchers (high = 2+ agreeing sources).

import { readFile, writeFile, readdir } from "node:fs/promises";

const RESEARCH_DATE = "2026-08-01";

// Approximate station coordinates + lines + home area (station-level accuracy).
const STATIONS = {
  "Shibuya Station":      { slug: "shibuya-station",      lat: 35.6580, lng: 139.7016, area: "shibuya",  lines: ["JR Yamanote", "Ginza", "Hanzomon", "Fukutoshin", "Tokyu Toyoko"] },
  "Shinjuku Station":     { slug: "shinjuku-station",     lat: 35.6896, lng: 139.7004, area: "shinjuku", lines: ["JR Yamanote", "JR Chuo", "Marunouchi", "Odakyu", "Keio"] },
  "Shinjuku-sanchome":    { slug: "shinjuku-sanchome",    lat: 35.6906, lng: 139.7053, area: "shinjuku", lines: ["Marunouchi", "Fukutoshin", "Toei Shinjuku"] },
  "Shinjuku-gyoenmae":    { slug: "shinjuku-gyoenmae",    lat: 35.6879, lng: 139.7101, area: "shinjuku", lines: ["Marunouchi"] },
  "Nishi-Shinjuku":       { slug: "nishi-shinjuku",       lat: 35.6939, lng: 139.6929, area: "shinjuku", lines: ["Marunouchi"] },
  "Iidabashi":            { slug: "iidabashi",            lat: 35.7020, lng: 139.7449, area: "shinjuku", lines: ["JR Chuo-Sobu", "Tozai", "Yurakucho", "Namboku", "Toei Oedo"] },
  "Roppongi":             { slug: "roppongi",             lat: 35.6628, lng: 139.7315, area: "minato",   lines: ["Hibiya", "Toei Oedo"] },
  "Azabu-Juban":          { slug: "azabu-juban",          lat: 35.6556, lng: 139.7365, area: "minato",   lines: ["Namboku", "Toei Oedo"] },
  "Shimbashi":            { slug: "shimbashi",            lat: 35.6664, lng: 139.7583, area: "minato",   lines: ["JR Yamanote", "Ginza", "Toei Asakusa", "Yurikamome"] },
  "Uchisaiwaicho":        { slug: "uchisaiwaicho",        lat: 35.6690, lng: 139.7530, area: "minato",   lines: ["Toei Mita"] },
  "Tamachi":              { slug: "tamachi",              lat: 35.6457, lng: 139.7476, area: "minato",   lines: ["JR Yamanote", "JR Keihin-Tohoku"] },
  "Omotesando":           { slug: "omotesando",           lat: 35.6652, lng: 139.7126, area: "minato",   lines: ["Ginza", "Chiyoda", "Hanzomon"] },
  "Nakameguro":           { slug: "nakameguro",           lat: 35.6440, lng: 139.6987, area: "meguro",   lines: ["Tokyu Toyoko", "Hibiya"] },
  "Jiyugaoka":            { slug: "jiyugaoka",            lat: 35.6076, lng: 139.6690, area: "meguro",   lines: ["Tokyu Toyoko", "Tokyu Oimachi"] },
  "Meguro":               { slug: "meguro",               lat: 35.6339, lng: 139.7160, area: "meguro",   lines: ["JR Yamanote", "Namboku", "Toei Mita", "Tokyu Meguro"] },
  "Tokyo Station":        { slug: "tokyo-station",        lat: 35.6812, lng: 139.7671, area: "chiyoda",  lines: ["JR Yamanote", "Marunouchi", "Tokaido Shinkansen"] },
  "Yurakucho":            { slug: "yurakucho",            lat: 35.6749, lng: 139.7630, area: "chiyoda",  lines: ["JR Yamanote", "Yurakucho"] },
  "Otemachi":             { slug: "otemachi",             lat: 35.6876, lng: 139.7665, area: "chiyoda",  lines: ["Marunouchi", "Tozai", "Chiyoda", "Hanzomon", "Toei Mita"] },
  "Kanda":                { slug: "kanda",                lat: 35.6918, lng: 139.7709, area: "chiyoda",  lines: ["JR Yamanote", "Ginza"] },
  "Akihabara":            { slug: "akihabara",            lat: 35.6984, lng: 139.7731, area: "chiyoda",  lines: ["JR Yamanote", "JR Sobu", "Hibiya", "Tsukuba Express"] },
  "Jimbocho":             { slug: "jimbocho",             lat: 35.6959, lng: 139.7576, area: "chiyoda",  lines: ["Toei Mita", "Toei Shinjuku", "Hanzomon"] },
};

const AREAS = {
  shibuya: {
    name: "Shibuya", lat: 35.6595, lng: 139.7005,
    intro: "Shibuya is one of the best places in Tokyo to work from a cafe: dense with coffee shops, open late, and walkable from the station. Wi-Fi is common here, but power outlets are the real variable — many chain branches have none, so the spots below are marked for both. Use the filters to narrow to cafes with Wi-Fi, outlets, or both.",
  },
  shinjuku: {
    name: "Shinjuku", lat: 35.6896, lng: 139.7006,
    intro: "Shinjuku's cafes cluster around the world's busiest station and stay open late — including several 24-hour kissaten and purpose-built work cafes around Shinjuku-sanchome. Outlet availability swings widely between the big chains and the quieter independents, so filter below for the combination you need.",
  },
  minato: {
    name: "Minato", lat: 35.6580, lng: 139.7516,
    intro: "Minato spans Roppongi, Azabu-Juban, Shimbashi and the Aoyama edge — a business-heavy set of neighborhoods with a strong crop of laptop-friendly cafes, from bookshop-cafes to pay-per-hour work spaces. Many have outlets at most seats; filter for Wi-Fi, outlets, or both.",
  },
  meguro: {
    name: "Meguro", lat: 35.6415, lng: 139.6980,
    intro: "Meguro ward — Nakameguro, Meguro and Jiyugaoka — is calmer and more design-led than the big hubs, with specialty roasters and stylish cafes that tend to be genuinely comfortable for a long session. Outlet placement is often at counters; filter below to find Wi-Fi, outlets, or both.",
  },
  chiyoda: {
    name: "Chiyoda", lat: 35.6940, lng: 139.7536,
    intro: "Chiyoda covers Marunouchi, Otemachi, Kanda, Akihabara and Jimbocho — a weekday business core where reliable chain cafes and a few work-focused independents make it easy to find Wi-Fi and outlets near Tokyo Station. Note some spots close on weekends; filter for what you need.",
  },
  chuo: {
    name: "Chuo", lat: 35.6707, lng: 139.7720,
    intro: "Chuo takes in Ginza, Nihonbashi and Kyobashi — a polished business-and-shopping district where department-store cafes and chain branches offer plenty of Wi-Fi, though outlets are the thing to check. Filter for Wi-Fi, outlets, or both.",
  },
  taito: {
    name: "Taito", lat: 35.7128, lng: 139.7800,
    intro: "Taito spans Ueno, Asakusa and the craft-coffee streets of Kuramae — a sightseeing-heavy area with a surprising number of traveller-friendly work cafes. Filter for Wi-Fi, outlets, or both.",
  },
  toshima: {
    name: "Toshima", lat: 35.7326, lng: 139.7150,
    intro: "Toshima centres on the huge Ikebukuro hub plus quieter Sugamo, Otsuka and Mejiro — well stocked with study cafes and chains. Outlet availability varies, so filter for Wi-Fi, outlets, or both.",
  },
  setagaya: {
    name: "Setagaya", lat: 35.6466, lng: 139.6530,
    intro: "Setagaya — Shimokitazawa, Sangenjaya, Futako-Tamagawa and Kyodo — is residential and independent-leaning, with genuinely comfortable neighbourhood cafes for a long session. Filter for Wi-Fi, outlets, or both.",
  },
  shinagawa: {
    name: "Shinagawa", lat: 35.6092, lng: 139.7302,
    intro: "Shinagawa ward covers Osaki, Gotanda, Oimachi and Musashi-Koyama — office towers and station complexes with a solid set of work cafes. Filter for Wi-Fi, outlets, or both.",
  },
  suginami: {
    name: "Suginami", lat: 35.6994, lng: 139.6365,
    intro: "Suginami — Ogikubo, Koenji, Asagaya and Nishi-Ogikubo — is a laid-back west-side set of neighbourhoods with dedicated work cafes and cheap chains. Filter for Wi-Fi, outlets, or both.",
  },
  nakano: {
    name: "Nakano", lat: 35.7074, lng: 139.6638,
    intro: "Nakano is a compact subculture hub around Nakano and Higashi-Nakano stations, with bookstore cafes and reliable chains good for laptop work. Filter for Wi-Fi, outlets, or both.",
  },
  sumida: {
    name: "Sumida", lat: 35.7107, lng: 139.8015,
    intro: "Sumida takes in Kinshicho, Ryogoku and the Skytree area of Oshiage — a mix of station malls, kissaten and a few 24-hour options. Filter for Wi-Fi, outlets, or both.",
  },
  bunkyo: {
    name: "Bunkyo", lat: 35.7181, lng: 139.7527,
    intro: "Bunkyo is a quiet academic ward around Hongo, Korakuen and Nezu, shaped by the University of Tokyo — plenty of Wi-Fi, though campus-area outlets can be scarce. Filter for Wi-Fi, outlets, or both.",
  },
  koto: {
    name: "Koto", lat: 35.6717, lng: 139.8172,
    intro: "Koto spans Toyosu, Kiba, Kameido and the Ariake waterfront — modern mall complexes and office towers with plenty of chain work cafes. Filter for Wi-Fi, outlets, or both.",
  },
  ota: {
    name: "Ota", lat: 35.5614, lng: 139.7160,
    intro: "Ota reaches from Kamata and Omori down to Haneda Airport — a workmanlike southern ward with dependable station cafes and a few independents. Filter for Wi-Fi, outlets, or both.",
  },
  kita: {
    name: "Kita", lat: 35.7528, lng: 139.7336,
    intro: "Kita centres on lively Akabane plus Oji and Tabata — commuter neighbourhoods with reliable station-building chains. Filter for Wi-Fi, outlets, or both.",
  },
  arakawa: {
    name: "Arakawa", lat: 35.7361, lng: 139.7833,
    intro: "Arakawa runs through Nippori, Nishi-Nippori and Machiya — down-to-earth streets with roomy Renoir tea rooms and budget chains good for long stays. Filter for Wi-Fi, outlets, or both.",
  },
  itabashi: {
    name: "Itabashi", lat: 35.7512, lng: 139.7090,
    intro: "Itabashi covers Narimasu, Shimura and Oyama — a residential north-west ward where cafes with outlets are more scattered, so filter carefully for Wi-Fi, outlets, or both.",
  },
  nerima: {
    name: "Nerima", lat: 35.7357, lng: 139.6517,
    intro: "Nerima — Oizumi-gakuen, Shakujii-koen and Hikarigaoka — is a leafy residential ward with dependable Doutor and Komeda branches near each station. Filter for Wi-Fi, outlets, or both.",
  },
  adachi: {
    name: "Adachi", lat: 35.7750, lng: 139.8046,
    intro: "Adachi centres on the surprisingly lively Kita-senju — a growing cafe and student hub — plus Ayase and Nishiarai. Filter for Wi-Fi, outlets, or both.",
  },
  katsushika: {
    name: "Katsushika", lat: 35.7434, lng: 139.8472,
    intro: "Katsushika takes in Kameari, Shin-Koiwa and Kanamachi — old-Tokyo neighbourhoods with steady station chains for a work stop. Filter for Wi-Fi, outlets, or both.",
  },
  edogawa: {
    name: "Edogawa", lat: 35.7067, lng: 139.8683,
    intro: "Edogawa spans Nishi-Kasai, Kasai, Koiwa and Hirai — an easygoing eastern ward where mall and station Doutor/Tully's branches are the main work options. Filter for Wi-Fi, outlets, or both.",
  },
};

function slugify(s) {
  return String(s).toLowerCase().normalize("NFKD")
    .replace(/&/g, "and").replace(/[^\w\s-]/g, "").trim()
    .replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70);
}

async function main() {
  const dir = "data/collected/raw";
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  let raw = [];
  for (const f of files) raw.push(...JSON.parse(await readFile(`${dir}/${f}`, "utf8")));

  const usedSlugs = new Set();
  const usedStations = new Map();
  const seenKeys = new Set();
  const venues = [];

  raw.forEach((r, i) => {
    // De-duplicate: same cafe name at the same station = same place, keep first.
    const dupKey = `${slugify(r.name)}|${slugify(r.nearestStation || "")}`;
    if (seenKeys.has(dupKey)) return;
    seenKeys.add(dupKey);

    let slug = slugify(r.name);
    while (usedSlugs.has(slug)) slug = `${slug}-2`;
    usedSlugs.add(slug);

    const st = STATIONS[r.nearestStation];
    const stationSlug = st ? st.slug : slugify(r.nearestStation);
    if (!usedStations.has(stationSlug)) {
      usedStations.set(stationSlug, {
        slug: stationSlug,
        name: r.nearestStation,
        lineNames: st ? st.lines : [],
        areaSlug: st ? st.area : r.areaSlug,
        ...(st ? { lat: st.lat, lng: st.lng } : {}),
      });
    }

    venues.push({
      id: `w-${String(i + 1).padStart(4, "0")}`,
      slug,
      name: r.name,
      nameJa: r.nameJa || undefined,
      address: r.address || "",
      areaSlug: r.areaSlug,
      stationSlugs: [stationSlug],
      ...(st ? { lat: st.lat, lng: st.lng } : {}),
      nearestStation: r.nearestStation,
      walkMinutes: typeof r.walkMinutes === "number" ? r.walkMinutes : 0,
      businessHours: r.businessHours || undefined,
      chainName: r.chainName || undefined,
      priceBand: r.priceBand || undefined,
      hasWifi: !!r.hasWifi,
      wifiType: r.wifiType || (r.hasWifi ? "free" : "none"),
      hasPower: !!r.hasPower,
      powerDensity: r.powerDensity || "none",
      laptopFriendly: !!r.laptopFriendly,
      description: r.description || "",
      lastChecked: RESEARCH_DATE,
      confidence: r.confidence || "low",
      sourceUrl: Array.isArray(r.sources) ? r.sources[0] : undefined,
    });
  });

  const areas = Object.entries(AREAS).map(([slug, a]) => ({
    slug, name: a.name, city: "tokyo", introText: a.intro, lat: a.lat, lng: a.lng,
  }));
  const stations = [...usedStations.values()];

  await writeFile("data/seed/venues.json", JSON.stringify(venues, null, 2));
  await writeFile("data/seed/areas.json", JSON.stringify(areas, null, 2));
  await writeFile("data/seed/stations.json", JSON.stringify(stations, null, 2));

  // Summary
  const perArea = {};
  for (const v of venues) perArea[v.areaSlug] = (perArea[v.areaSlug] || 0) + 1;
  const both = venues.filter((v) => v.hasWifi && v.hasPower).length;
  console.log(`Venues: ${venues.length}`);
  console.log(`Per area:`, perArea);
  console.log(`Stations: ${stations.length}`);
  console.log(`With Wi-Fi: ${venues.filter((v) => v.hasWifi).length}, with outlets: ${venues.filter((v) => v.hasPower).length}, with both: ${both}`);
  console.log(`Confidence: high=${venues.filter(v=>v.confidence==="high").length} medium=${venues.filter(v=>v.confidence==="medium").length} low=${venues.filter(v=>v.confidence==="low").length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
