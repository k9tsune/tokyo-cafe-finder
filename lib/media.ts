import areaPhotos from "@/data/area-photos.json";

// Real-photo overrides for area covers, sourced from Wikimedia Commons (free
// licenses). Images are hotlinked via Commons' stable Special:FilePath endpoint
// (resized), so no files are stored locally. Attribution is shown on /credits.
// Wards without an entry fall back to the generated skyline tile.

export type AreaPhoto = {
  file: string;
  title: string;
  author: string;
  license: string;
  source: string;
};

const AREA_PHOTOS = areaPhotos as Record<string, AreaPhoto>;

export function areaPhotoSrc(slug: string): string | undefined {
  const p = AREA_PHOTOS[slug];
  if (!p) return undefined;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p.file)}?width=640`;
}

export function areaPhotoMeta(slug: string): AreaPhoto | undefined {
  return AREA_PHOTOS[slug];
}

export function allAreaPhotos(): Array<{ slug: string } & AreaPhoto> {
  return Object.entries(AREA_PHOTOS).map(([slug, p]) => ({ slug, ...p }));
}
