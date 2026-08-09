#!/usr/bin/env node
// Compile the cafe's OWN Instagram posts into a by-slug file for EMBEDDING.
//
// The gallery renders Meta's official Instagram embeds, lazy-loaded in the
// browser (embed.js runs only when the section scrolls into view — see
// components/CafeInstagram.tsx). Per Meta's oEmbed terms we do NOT extract or
// self-host images; we only need the post permalink. So this step downloads
// nothing — it just:
//   1) reads the cafe's OWN post URLs from data/collected/instagram-posts.json
//      (keyed by cafe NAME, flagged ownAccount/permission),
//   2) maps each cafe NAME -> slug,
//   3) BEST-EFFORT verifies each post via Instagram's tokenless oEmbed — dropping
//      only posts whose real author clearly isn't the cafe's own account,
//   4) writes data/instagram-photos.json (committed): { slug: { handle, posts:
//      [{ permalink, credit, ownAccount, permission }] } }.
// Verification is optional and never fatal: if oEmbed is unreachable (e.g. a
// datacenter IP, or Meta rate-limiting), posts are still compiled — embed.js only
// ever renders what Meta itself allows, so nothing rights-unclear can slip through.
//
// Config (env):
//   IG_VERIFY=0        skip the oEmbed author check entirely (pure compile)
//   IG_OEMBED          oEmbed endpoint (default v25.0, tokenless)
//   META_OEMBED_TOKEN  optional access token, appended if set
//   IG_UA              User-Agent sent to Meta (default: a Chrome UA)
//   IG_MAX_PER_CAFE    posts kept per cafe (default 4)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const P = (p) => resolve(root, p);

const OEMBED = process.env.IG_OEMBED || "https://graph.facebook.com/v25.0/instagram_oembed";
const TOKEN = process.env.META_OEMBED_TOKEN || "";
const UA =
  process.env.IG_UA ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const MAX = Number(process.env.IG_MAX_PER_CAFE || 4);
const VERIFY = process.env.IG_VERIFY !== "0";

const readJson = (p, fb) => (existsSync(P(p)) ? JSON.parse(readFileSync(P(p), "utf8")) : fb);

const seedsFile = "data/collected/instagram-posts.json";
const seeds = readJson(seedsFile, null);
if (!seeds) {
  console.log(`No ${seedsFile} — nothing to compile. (Add the cafe's own post URLs there.)`);
  process.exit(0);
}

const venues = (() => {
  const v = readJson("data/seed/venues.json", []);
  return Array.isArray(v) ? v : v.venues || [];
})();
const slugByName = new Map(venues.map((v) => [v.name, v.slug]));
const igByName = new Map(venues.filter((v) => v.instagram).map((v) => [v.name, v.instagram]));
const handleFromUrl = (u = "") => (u.match(/instagram\.com\/([^/?#]+)/i)?.[1] || "").replace(/^@/, "");

let cafes = 0,
  kept = 0,
  dropped = 0,
  missing = 0;

// Best-effort: return the post's real author handle (lowercased), or null if we
// couldn't determine it (network/oEmbed unavailable). Uses default fields only —
// requesting thumbnail_url is a restricted field that 403s tokenless.
async function authorHandle(permalink) {
  try {
    const u = new URL(OEMBED);
    u.searchParams.set("url", permalink);
    u.searchParams.set("omitscript", "true");
    if (TOKEN) u.searchParams.set("access_token", TOKEN);
    const r = await fetch(u, { headers: { "User-Agent": UA } });
    if (!r.ok) return null;
    const j = await r.json();
    return handleFromUrl(j.author_url || "").toLowerCase() || null;
  } catch {
    return null;
  }
}

const out = {};
for (const [name, cfg] of Object.entries(seeds)) {
  const slug = slugByName.get(name);
  if (!slug) {
    console.warn(`! no slug for "${name}" — skipping`);
    missing++;
    continue;
  }
  if (!(cfg.ownAccount || cfg.permission)) {
    console.warn(`! "${name}" has no ownAccount/permission flag — skipping (won't display)`);
    continue;
  }
  const handle = handleFromUrl(igByName.get(name) || "");
  const want = handle.toLowerCase();
  const posts = [];
  for (const permalink of (cfg.posts || []).slice(0, MAX)) {
    if (VERIFY && want) {
      const got = await authorHandle(permalink);
      if (got && got !== want) {
        console.warn(`! ${name} ${permalink}: author @${got} != official @${want} — dropping (not the cafe's own post)`);
        dropped++;
        continue;
      }
    }
    posts.push({
      permalink,
      credit: handle ? `@${handle}` : undefined,
      ownAccount: !!cfg.ownAccount,
      permission: !!cfg.permission,
    });
    kept++;
  }
  out[slug] = { handle: handle || undefined, posts };
  cafes++;
}

writeFileSync(P("data/instagram-photos.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\nDone. cafes=${cafes} posts=${kept} dropped=${dropped} missing-slug=${missing}. Commit data/instagram-photos.json.`);
