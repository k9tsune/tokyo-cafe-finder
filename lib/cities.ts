// The city registry.
//
// Until Oct 2026 the site was Tokyo-only and "tokyo" was hardcoded in 53 files,
// including as a literal type on Area. Adding Osaka meant either duplicating
// every route or making the city a real dimension — this is the latter.
//
// Routes live under /[city]/..., and because Tokyo's slug is "tokyo" every
// existing URL (/tokyo/shinjuku, /ja/tokyo/station/...) is byte-identical to
// before. Nothing indexed moves.
//
// Adding a third city = add an entry here + its areas/stations/venues data.

export type CitySlug = "tokyo" | "osaka";

export interface City {
  slug: CitySlug;
  /** English display name, e.g. "Tokyo". Used verbatim in titles and copy. */
  name: string;
  /** Japanese display name, e.g. "東京". */
  nameJa: string;
  /** What its top-level areas are called, for honest copy in each locale. */
  areaWord: string;
  areaWordJa: string;
  /** Map default centre + zoom for this city. */
  lat: number;
  lng: number;
  zoom: number;
}

export const CITIES: City[] = [
  {
    slug: "tokyo",
    name: "Tokyo",
    nameJa: "東京",
    areaWord: "ward",
    areaWordJa: "区",
    lat: 35.68,
    lng: 139.7671,
    zoom: 10.4,
  },
  {
    slug: "osaka",
    name: "Osaka",
    nameJa: "大阪",
    areaWord: "ward",
    areaWordJa: "区",
    lat: 34.6937,
    lng: 135.5023,
    zoom: 11.2,
  },
];

/** Tokyo remains the flagship: it owns the homepage and the site's brand copy. */
export const DEFAULT_CITY: CitySlug = "tokyo";

const bySlug = new Map(CITIES.map((c) => [c.slug, c]));

export function getCity(slug: string): City | undefined {
  return bySlug.get(slug as CitySlug);
}

export function isCitySlug(s: string): s is CitySlug {
  return bySlug.has(s as CitySlug);
}

/** City name in the given locale — so one call site serves both sites. */
export function cityName(c: City, locale: "en" | "ja"): string {
  return locale === "ja" ? c.nameJa : c.name;
}
