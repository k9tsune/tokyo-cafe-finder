// Category/chain detection + representative fallback images. Used when a cafe has
// no real (Google Places) photo of its own: chains show a photo of that chain's
// storefront/sign where we have a free-licensed one; everything else falls back to
// a generic kissaten / bakery / independent-coffee-shop photo. Images and licenses
// live in data/category-images.json (Unsplash License or CC, verified at sourcing).

import categoryImages from "@/data/category-images.json";

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
const CHAIN_MATCHERS: Array<[string, RegExp]> = [
  ["starbucks", /starbucks|スターバックス/i],
  ["doutor", /doutor|ドトール/i],
  ["tullys", /tully|タリーズ/i],
  ["excelsior", /excelsior|エクセルシオール/i],
  ["pronto", /\bpronto\b|プロント/i],
  ["veloce", /veloce|ベローチェ/i],
  ["komeda", /komeda|コメダ/i],
  ["hoshino", /hoshino|星乃/i],
  ["st_marc", /st\.? ?marc|サンマルク/i],
  ["cafe_de_crie", /de crie|ド・?クリエ/i],
  ["ucc", /ueshima|\bucc\b|上島/i],
  ["renoir", /renoir|ルノアール/i],
  ["mcdonalds", /mcdonald|マクドナルド/i],
  ["kfc", /\bkfc\b|kentucky|ケンタッキー/i],
  // newly added chains (2+ Tokyo locations) with sourced Commons sign photos
  ["becks", /beck'?s\s*coffee|ベックス/i],
  ["share_lounge", /share\s*lounge|シェアラウンジ/i],
  ["mos_burger", /mos\s*burger|モスバーガー/i],
  ["gusto", /\bgusto\b|ガスト/i],
  ["dean_deluca", /dean\s*(&|and|\.)?\s*deluca|ディーン.?(アンド|&).?デルーカ/i],
  ["kaikatsu", /kaikatsu|快活/i],
];
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
