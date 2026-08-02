// Core domain types. These mirror db/schema.sql so moving from seed JSON to
// Postgres/PostGIS later is a swap of the data source, not a rewrite.

export type WifiType = "free" | "paid" | "none";
export type PowerDensity = "many" | "some" | "counter" | "none";
export type Confidence = "high" | "medium" | "low";

export interface Venue {
  id: string;
  slug: string;
  name: string;
  nameJa?: string;
  address: string;
  areaSlug: string;      // -> Area.slug
  stationSlugs: string[]; // nearest stations -> Station.slug
  lat?: number;          // optional: station-level approx; map uses text query
  lng?: number;
  nearestStation: string;
  walkMinutes: number;
  businessHours?: string;
  chainName?: string;
  priceBand?: "¥" | "¥¥" | "¥¥¥";
  googlePlaceId?: string; // the ONLY Google-derived field we store long-term

  // Utility layer — the stuff people actually search for.
  hasWifi: boolean;
  wifiType: WifiType;
  hasPower: boolean;
  powerDensity: PowerDensity;
  laptopFriendly: boolean;
  typicalBusyness?: "low" | "medium" | "high";

  description: string;    // original prose — never copied from a source
  photoUrl?: string;      // optional: real photo (e.g. Google Places) — falls back to a generated cover
  lastChecked: string;    // ISO date -> freshness badge
  confidence: Confidence;
  sourceUrl?: string;
}

export interface Area {
  slug: string;
  name: string;
  city: "tokyo";
  introText: string;
  lat: number;
  lng: number;
}

export interface Station {
  slug: string;
  name: string;
  lineNames: string[];
  lat?: number;
  lng?: number;
  areaSlug: string;
}

// AND/OR filter model (plan §2.2)
export type MatchMode = "all" | "any";
export interface UtilityFilter {
  wifi: boolean;   // require Wi-Fi
  power: boolean;  // require outlets
  match: MatchMode; // how the two combine when both are on
}
