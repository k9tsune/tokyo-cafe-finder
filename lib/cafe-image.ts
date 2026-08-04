// Category/chain detection + representative fallback images. Used when a cafe has
// no real (Google Places) photo of its own: chains show a photo of that chain's
// storefront/sign where we have a free-licensed one; everything else falls back to
// a generic kissaten / bakery / independent-coffee-shop photo. Images and licenses
// live in data/category-images.json (Unsplash License or CC, verified at sourcing).

import categoryImages from "@/data/category-images.json";
import chainMatchers from "@/data/chain-matchers.json";

export type CategoryImage = {
  kind: "unsplash" | "wikimedia" | "local";
  url?: string;   // unsplash: base photo URL (sizing added at render time); local: /cafe-images/* served from public/
  file?: string;  // wikimedia: Commons filename, served via Special:FilePath
  author: string;
  license: string;
  page: string;
};

// A category maps to either one image (chains) or a POOL of images (broad
// categories like "independent"), from which one is chosen deterministically
// per cafe so a large category shows variety instead of one repeated photo.
type CategoryEntry = CategoryImage | CategoryImage[];

const IMAGES = categoryImages as Record<string, CategoryEntry>;

// Stable string hash → non-negative int (matches CafeCover's hash).
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Pick one image from a single entry or a pool. `seed` (the cafe slug) keeps the
// choice stable across renders so each cafe always gets the same variety photo.
function pickImage(entry: CategoryEntry | undefined, seed?: string): CategoryImage | null {
  if (!entry) return null;
  if (!Array.isArray(entry)) return entry;
  if (entry.length === 0) return null;
  const i = seed ? hash(seed) % entry.length : 0;
  return entry[i];
}

// Chain / category detection from the cafe name (data has no chain field). Order
// matters: specific chains first, then broad category keywords, else independent.
// Chain patterns are DATA, not code: they live in data/chain-matchers.json so the
// weekly auto-update can add a new chain (pattern + storefront image) without any
// code change. Order matters (most specific first) and is preserved from the file.
// Each pattern is a case-insensitive JS regex source; we compile it with the "i" flag.
const CHAIN_MATCHERS: Array<[string, RegExp]> = (
  chainMatchers.matchers as Array<{ key: string; pattern: string }>
).map(({ key, pattern }) => [key, new RegExp(pattern, "i")] as [string, RegExp]);
const CHAIN_KEYS = new Set(CHAIN_MATCHERS.map(([k]) => k));

/** The chain/category key for a cafe name (e.g. "starbucks", "kissaten", "independent"). */
export function categoryKey(name: string, nameJa?: string): string {
  const s = `${name || ""} ${nameJa || ""}`;
  for (const [key, re] of CHAIN_MATCHERS) if (re.test(s)) return key;
  if (/kissa|喫茶|純喫茶/i.test(s)) return "kissaten";
  if (/bakery|boulanger|b(ä|a)ckerei|パン|ベーカリー/i.test(s)) return "bakery";
  return "independent";
}

/** True if the name matches a known chain (used to steer paid Places budget away from chains). */
export function isChain(name: string, nameJa?: string): boolean {
  return CHAIN_KEYS.has(categoryKey(name, nameJa));
}

/** Resolve the fallback image for a cafe: its chain image if we have one, else the
 *  generic category image, else the independent default. Returns null if none.
 *  Pass the cafe `slug` so broad categories (pools) show variety yet stay stable. */
export function categoryImageFor(name: string, nameJa?: string, slug?: string): (CategoryImage & { key: string }) | null {
  const key = categoryKey(name, nameJa);
  const img = pickImage(IMAGES[key], slug) || pickImage(IMAGES["independent"], slug);
  return img ? { ...img, key } : null;
}

/** Build a ready <img src> for a category image at the given width. */
export function categoryImageSrc(e: CategoryImage, w = 800): string {
  if (e.kind === "wikimedia" && e.file) {
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(e.file)}?width=${w}`;
  }
  if (e.kind === "local" && e.url) {
    return e.url; // self-hosted from public/; already sized at sourcing
  }
  return `${e.url}?auto=format&fit=crop&w=${w}&q=75`;
}

/** All distinct category images actually in use, for the credits page. Pools are
 *  flattened so every sourced image is credited. */
export function allCategoryImages(): Array<{ key: string } & CategoryImage> {
  return Object.entries(IMAGES).flatMap(([key, e]) =>
    (Array.isArray(e) ? e : [e]).map((img) => ({ key, ...img }))
  );
}
