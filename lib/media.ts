import areaPhotos from "@/data/area-photos.json";

// Optional real-photo overrides for area (and later station) covers. Map a slug
// to a filename placed in public/areas/. When present, the photo replaces the
// generated skyline tile; otherwise the tile is used. This keeps the site fully
// covered for free while letting real photos be added one at a time.
const AREA_PHOTOS = areaPhotos as Record<string, string>;

export function areaPhoto(slug: string): string | undefined {
  const file = AREA_PHOTOS[slug];
  return file ? `/areas/${file}` : undefined;
}
