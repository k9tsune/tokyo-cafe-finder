import detailsData from "@/data/cafe-details.json";

// Hand-curated, source-cited access directions + menu for a small set of cafes
// (data/cafe-details.json, keyed by slug). Every fact traces to a real source;
// cafes without an entry simply fall back to the default access line and show
// no menu section. See CLAUDE.md — never fabricate; each item carries a source.

export interface DetailSource {
  name: string;
  url: string;
}

export interface CafeAccess {
  en: string;
  ja: string;
  sources: DetailSource[];
  checked: string; // ISO date this was verified
}

export interface MenuItem {
  en: string;
  ja: string;
  price: string;
}

export interface CafeMenu {
  items: MenuItem[];
  sourceName: string;
  sourceUrl: string;
  checked: string; // ISO date
  note?: string;
}

export interface CafeDetails {
  // Optional description overrides — used where the seed description needs a
  // correction that shouldn't wait for a full seed rebuild.
  descEn?: string;
  descJa?: string;
  access?: CafeAccess;
  menu?: CafeMenu;
}

// The JSON carries a leading "_note" key for maintainers; ignore non-object /
// underscore-prefixed entries when looking a cafe up.
const details = detailsData as Record<string, unknown>;

export function cafeDetails(slug: string): CafeDetails | null {
  if (slug.startsWith("_")) return null;
  const d = details[slug];
  if (!d || typeof d !== "object") return null;
  return d as CafeDetails;
}

export function cafeAccess(slug: string): CafeAccess | null {
  return cafeDetails(slug)?.access ?? null;
}

export function cafeMenu(slug: string): CafeMenu | null {
  return cafeDetails(slug)?.menu ?? null;
}
