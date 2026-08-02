// Plain-English pass over cafe descriptions. Many users read English as a second
// language, so we swap corporate / "business-meeting" vocabulary for simple, common
// words. We KEEP topic-relevant coffee terms (roaster, roastery, espresso, etc.)
// and KEEP Japanese terms (kissaten) — glossing the first mention in parentheses.
// Applied to the `description` field only, in data/collected/raw/*.json.

import { readFile, writeFile, readdir } from "node:fs/promises";

// Corporate / formal / idiomatic phrases -> plain equivalents. Longer first.
const REPLACEMENTS = [
  ["well-suited to", "good for"],
  ["well suited to", "good for"],
  ["well-suited for", "good for"],
  ["suited to", "good for"],
  ["suited for", "good for"],
  ["lends itself to", "is good for"],
  ["geared towards", "good for"],
  ["geared toward", "good for"],
  ["geared to", "good for"],
  ["budget-friendly", "cheap"],
  ["settle in for", "stay for"],
  ["settle into", "stay a while at"],
  ["settle in", "stay a while"],
  ["stints", "visits"],
  ["stint", "visit"],
  ["amenities", "features"],
  ["amenity", "feature"],
  ["approximately", "about"],
  ["concourse", "walkway"],
  ["partitioned", "divided"],
  ["telework", "remote work"],
  ["corroborating", "matching"],
  ["corroborated", "confirmed"],
  ["dependable", "reliable"],
];

// Japanese terms to keep but gloss on first mention.
const GLOSSES = [
  [/kissaten/i, "a traditional Japanese coffee house"],
];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const RULES = REPLACEMENTS.map(([from, to]) => [new RegExp("\\b" + escapeRe(from) + "\\b", "g"), to]);

function simplify(text) {
  let out = text;
  for (const [re, to] of RULES) out = out.replace(re, to);
  // Gloss the first mention of each kept Japanese term (skip if already glossed).
  for (const [re, gloss] of GLOSSES) {
    if (re.test(out) && !new RegExp(re.source + "\\s*\\(", "i").test(out)) {
      out = out.replace(re, (m) => `${m} (${gloss})`);
    }
  }
  return out;
}

async function main() {
  const dir = "data/collected/raw";
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  let changed = 0, records = 0;
  for (const f of files) {
    const path = `${dir}/${f}`;
    const rows = JSON.parse(await readFile(path, "utf8"));
    for (const r of rows) {
      records++;
      if (typeof r.description === "string") {
        const next = simplify(r.description);
        if (next !== r.description) { r.description = next; changed++; }
      }
    }
    await writeFile(path, JSON.stringify(rows, null, 2));
  }
  console.log(`plain-english: ${changed} of ${records} descriptions simplified.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
