#!/usr/bin/env node
// Fetch static Instagram thumbnails for cafe galleries — BUILD/PIPELINE step.
//
// Why this exists: we want real photos on cafe pages WITHOUT shipping Instagram's
// embed.js (which loads per-visitor and slows the site) and WITHOUT re-hosting
// rights-unclear images. So we:
//   1) take a small list of the cafe's OWN post URLs (chosen during the weekly
//      research run) from data/collected/instagram-posts.json,
//   2) resolve each via Instagram's oEmbed to get a thumbnail + author,
//   3) download the thumbnail and SELF-HOST it under public/ig/,
//   4) write metadata to data/instagram-photos.json (committed cache),
//      flagged ownAccount:true so the UI is cleared to show it.
// The site then renders plain <img loading="lazy"> — zero third-party JS.
//
// Seeds file shape (data/collected/instagram-posts.json), keyed by cafe NAME:
//   { "Alpha Beta Coffee Club": {
//       "ownAccount": true,                 // cafe's own account (safe to show)
//       "permission": false,                // or true if permission is on file
//       "posts": ["https://www.instagram.com/p/XXXXXXXXX/", "..."]
//   } }
// Use `permission:true` for photos from accounts that aren't the cafe's own but
// have granted permission (e.g. via the DM workflow in CLAUDE.md). Anything
// without ownAccount/permission is skipped — we do not display it.
//
// Config (env):
//   IG_OEMBED       oEmbed endpoint (default Meta graph tokenless endpoint)
//   META_OEMBED_TOKEN  optional access token, appended if Meta requires one
//   IG_UA           User-Agent sent to Meta (default: a Chrome UA)
//   IG_MAX_PER_CAFE number of thumbnails to keep per cafe (default 4)
//
// Incremental: posts already downloaded are skipped. Safe to re-run.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dir, "..");
const P = (p) => resolve(root, p);

// Meta made oEmbed tokenless again on 2026-06-15, but only serves it on a
// currently-supported Graph API version. v20.0 (May 2024) is now past Meta's
// ~2-year support window and returns 403 for every call, so we target v25.0.
const OEMBED = process.env.IG_OEMBED || "https://graph.facebook.com/v25.0/instagram_oembed";
const TOKEN = process.env.META_OEMBED_TOKEN || "";
// Meta's tokenless oEmbed rejects non-browser User-Agents with a 403, so send a
// normal browser UA. Override with IG_UA if Meta ever changes what it accepts.
const UA =
  process.env.IG_UA ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const MAX = Number(process.env.IG_MAX_PER_CAFE || 4);

const readJson = (p, fb) => (existsSync(P(p)) ? JSON.parse(readFileSync(P(p), "utf8")) : fb);

const seedsFile = "data/collected/instagram-posts.json";
const seeds = readJson(seedsFile, null);
if (!seeds) {
  console.log(`No ${seedsFile} — nothing to fetch. (Add the cafe's own post URLs there.)`);
  process.exit(0);
}

const venues = (() => {
  const v = readJson("data/seed/venues.json", []);
  return Array.isArray(v) ? v : v.venues || [];
})();
const slugByName = new Map(venues.map((v) => [v.name, v.slug]));
const handleFromUrl = (u = "") => (u.match(/instagram\.com\/([^/?#]+)/i)?.[1] || "").replace(/^@/, "");
const igByName = new Map(venues.filter((v) => v.instagram).map((v) => [v.name, v.instagram]));

const out = readJson("data/instagram-photos.json", {});
mkdirSync(P("public/ig"), { recursive: true });

let fetched = 0,
  skipped = 0,
  missing = 0;

async function oembed(postUrl) {
  const u = new URL(OEMBED);
  u.searchParams.set("url", postUrl);
  u.searchParams.set("omitscript", "true");
  u.searchParams.set("fields", "thumbnail_url,author_name,author_url");
  if (TOKEN) u.searchParams.set("access_token", TOKEN);
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`oEmbed ${r.status} for ${postUrl}`);
  return r.json();
}

async function download(url, destAbs) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`thumb ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(destAbs, buf);
}

for (const [name, cfg] of Object.entries(seeds)) {
  const slug = slugByName.get(name);
  if (!slug) {
    console.warn(`! no slug for "${name}" — skipping`);
    missing++;
    continue;
  }
  const cleared = cfg.ownAccount || cfg.permission;
  if (!cleared) {
    console.warn(`! "${name}" has no ownAccount/permission flag — skipping (won't display)`);
    skipped++;
    continue;
  }
  const posts = (cfg.posts || []).slice(0, MAX);
  const entry = out[slug] || { handle: handleFromUrl(igByName.get(name) || ""), photos: [] };
  entry.photos = entry.photos || [];
  // The cafe's OWN official handle, used to verify each post really belongs to it.
  const wantHandle = handleFromUrl(igByName.get(name) || "").toLowerCase();

  for (let i = 0; i < posts.length; i++) {
    const permalink = posts[i];
    if (entry.photos.some((p) => p.permalink === permalink)) {
      skipped++;
      continue; // incremental: already have it
    }
    const rel = `/ig/${slug}-${i + 1}.jpg`;
    try {
      const meta = await oembed(permalink);
      // Rights guard: only display a post that genuinely belongs to the cafe's
      // OWN account. oEmbed reports the real author; if it doesn't match the
      // cafe's known handle, skip it — never re-host someone else's photo, even
      // if it was mistakenly listed as ownAccount.
      const gotHandle = handleFromUrl(meta.author_url || "").toLowerCase();
      if (wantHandle && gotHandle && gotHandle !== wantHandle) {
        console.warn(`! ${name} ${permalink}: author @${gotHandle} != official @${wantHandle} — skipping (not the cafe's own post)`);
        skipped++;
        continue;
      }
      if (!meta.thumbnail_url) throw new Error("no thumbnail_url");
      await download(meta.thumbnail_url, P(`public${rel}`));
      entry.photos.push({
        src: rel,
        permalink,
        credit: `@${(meta.author_name || handleFromUrl(igByName.get(name) || "")).replace(/^@/, "")}`,
        ownAccount: !!cfg.ownAccount,
        permission: !!cfg.permission,
      });
      fetched++;
      console.log(`✓ ${name} ${rel}`);
    } catch (e) {
      console.warn(`! ${name} ${permalink}: ${e.message}`);
    }
  }
  out[slug] = entry;
}

writeFileSync(P("data/instagram-photos.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`\nDone. fetched=${fetched} skipped=${skipped} missing-slug=${missing}. Commit data/instagram-photos.json + public/ig/.`);
