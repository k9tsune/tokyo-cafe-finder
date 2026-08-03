import areaPhotos from "@/data/area-photos.json";
import stationPhotos from "@/data/station-photos.json";

// Real-photo overrides for area covers, sourced from Wikimedia Commons (free
// licenses). Images are hotlinked via Commons' stable Special:FilePath endpoint
// (resized), so no files are stored locally. Attribution is shown on /credits.
// Wards without an entry fall back to the generated skyline tile.

export type AreaPhoto = {
  file?: string;   // Wikimedia Commons filename (served via Special:FilePath)
  src?: string;    // OR a direct URL (e.g. a self-hosted own photo in /public)
  title: string;
  author: string;
  license: string;
  source: string;
};

const AREA_PHOTOS = areaPhotos as Record<string, AreaPhoto>;

export function areaPhotoSrc(slug: string): string | undefined {
  const p = AREA_PHOTOS[slug];
  if (!p) return undefined;
  if (p.src) return p.src; // self-hosted / own photo
  if (p.file) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.file)}?width=640`;
  return undefined;
}

export function areaPhotoMeta(slug: string): AreaPhoto | undefined {
  return AREA_PHOTOS[slug];
}

export function allAreaPhotos(): Array<{ slug: string } & AreaPhoto> {
  return Object.entries(AREA_PHOTOS).map(([slug, p]) => ({ slug, ...p }));
}

// Station photos (same shape) — e.g. self-hosted own photos for a station page.
const STATION_PHOTOS = stationPhotos as Record<string, AreaPhoto>;

export function stationPhotoSrc(slug: string): string | undefined {
  const p = STATION_PHOTOS[slug];
  if (!p) return undefined;
  if (p.src) return p.src;
  if (p.file) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.file)}?width=640`;
  return undefined;
}

export function stationPhotoMeta(slug: string): AreaPhoto | undefined {
  return STATION_PHOTOS[slug];
}

export function allStationPhotos(): Array<{ slug: string } & AreaPhoto> {
  return Object.entries(STATION_PHOTOS).map(([slug, p]) => ({ slug, ...p }));
}
