// Data-access layer. For the scaffold this reads the seed JSON files, so the
// site runs with `npm run dev` and no database. In Phase B, replace the bodies
// of these functions with Supabase/PostGIS queries — the signatures and the
// types (lib/types.ts) stay identical, so pages don't change. See db/schema.sql.

import type { Area, Station, Venue, UtilityFilter } from "./types";
import { haversineMeters } from "./geo";
import venuesData from "@/data/seed/venues.json";
import areasData from "@/data/seed/areas.json";
import stationsData from "@/data/seed/stations.json";
import placesData from "@/data/places.json";

// JSON is inferred with widened primitives (e.g. string instead of our unions),
// so cast through unknown. In Phase B these come from typed DB queries instead.
type PlaceInfo = { ref?: string | null; attr?: string | null; lat?: number | null; lng?: number | null };
const places = placesData as unknown as Record<string, PlaceInfo | null>;

// Merge Google Places enrichment (photo + precise coords) onto each venue.
// Precise lat/lng from Places overrides the station-level approximation.
const venues = (venuesData as unknown as Venue[]).map((v) => {
  const p = places[v.slug];
  if (!p) return v;
  return {
    ...v,
    ...(p.ref ? { photoRef: p.ref } : {}),
    ...(p.attr ? { photoAttr: p.attr } : {}),
    ...(typeof p.lat === "number" ? { lat: p.lat } : {}),
    ...(typeof p.lng === "number" ? { lng: p.lng } : {}),
  };
});
// Merge Google Places photos onto areas/stations (keyed "area:<slug>" /
// "station:<slug>" in places.json). Only the photo is taken — curated coords win.
const areas = (areasData as unknown as Area[]).map((a) => {
  const p = places[`area:${a.slug}`];
  if (!p?.ref) return a;
  return { ...a, photoRef: p.ref, ...(p.attr ? { photoAttr: p.attr } : {}) };
});
const stations = (stationsData as unknown as Station[]).map((s) => {
  const p = places[`station:${s.slug}`];
  if (!p?.ref) return s;
  return { ...s, photoRef: p.ref, ...(p.attr ? { photoAttr: p.attr } : {}) };
});

export function getAllAreas(): Area[] {
  return areas;
}

export function getArea(slug: string): Area | undefined {
  return areas.find((a) => a.slug === slug);
}

export function getAllStations(): Station[] {
  return stations;
}

export function getStation(slug: string): Station | undefined {
  return stations.find((s) => s.slug === slug);
}

export function getAllVenues(): Venue[] {
  return venues;
}

export function getVenue(slug: string): Venue | undefined {
  return venues.find((v) => v.slug === slug);
}

// "Best for working" score: both Wi-Fi + outlets rank highest, then outlets,
// then Wi-Fi; laptop-friendly, more outlets and higher-confidence data add to it.
function workScore(v: Venue): number {
  let s = 0;
  if (v.hasWifi && v.hasPower) s += 100;
  else if (v.hasPower) s += 60;
  else if (v.hasWifi) s += 40;
  if (v.laptopFriendly) s += 20;
  s += v.powerDensity === "many" ? 10 : v.powerDensity === "some" ? 6 : v.powerDensity === "counter" ? 3 : 0;
  s += v.confidence === "high" ? 5 : v.confidence === "medium" ? 2 : 0;
  return s;
}

export function getVenuesByArea(areaSlug: string): Venue[] {
  // Ward pages have no single "here", so order by how good each cafe is for
  // working, with walk-time as a tiebreak.
  return venues
    .filter((v) => v.areaSlug === areaSlug)
    .sort(
      (a, b) =>
        workScore(b) - workScore(a) ||
        (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99) ||
        a.name.localeCompare(b.name)
    );
}

export function getVenuesByStation(stationSlug: string): Venue[] {
  // Station pages: nearest first (cafe coords are station-level in the web
  // dataset, so walk-minutes is the real proximity signal), then best-for-work.
  return venues
    .filter((v) => v.stationSlugs.includes(stationSlug))
    .sort(
      (a, b) =>
        (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99) ||
        workScore(b) - workScore(a) ||
        a.name.localeCompare(b.name)
    );
}

/**
 * The AND/OR utility filter (plan §2.2).
 * - only wifi on            -> require wifi
 * - only power on           -> require power
 * - both on + match "all"   -> require wifi AND power
 * - both on + match "any"   -> require wifi OR power
 * - neither on              -> everything
 */
export function applyUtilityFilter(list: Venue[], f: UtilityFilter): Venue[] {
  if (!f.wifi && !f.power) return list;
  return list.filter((v) => {
    if (f.wifi && !f.power) return v.hasWifi;
    if (f.power && !f.wifi) return v.hasPower;
    // both requested
    return f.match === "any"
      ? v.hasWifi || v.hasPower
      : v.hasWifi && v.hasPower;
  });
}

export function nearestVenues(
  lat: number,
  lng: number,
  limit = 20
): (Venue & { distanceMeters: number })[] {
  return venues
    .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
    .map((v) => ({ ...v, distanceMeters: haversineMeters(lat, lng, v.lat as number, v.lng as number) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

export type Destination = { type: "station" | "area"; slug: string; name: string; href: string };

// Full lightweight index handed to the client SearchBar for instant autocomplete
// (no API round-trip, no cost). Stations first — people search Tokyo by station.
export function getAllDestinations(): Destination[] {
  const st: Destination[] = stations.map((s) => ({
    type: "station", slug: s.slug, name: s.name, href: `/tokyo/station/${s.slug}`,
  }));
  const ar: Destination[] = areas.map((a) => ({
    type: "area", slug: a.slug, name: a.name, href: `/tokyo/${a.slug}`,
  }));
  return [...st, ...ar];
}

// Simple search over stations + areas for the search bar autocomplete.
export function searchDestinations(q: string): Array<{
  type: "station" | "area";
  slug: string;
  name: string;
  href: string;
}> {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const results: Array<{ type: "station" | "area"; slug: string; name: string; href: string }> = [];
  for (const s of stations) {
    if (s.name.toLowerCase().includes(query)) {
      results.push({ type: "station", slug: s.slug, name: s.name, href: `/tokyo/station/${s.slug}` });
    }
  }
  for (const a of areas) {
    if (a.name.toLowerCase().includes(query)) {
      results.push({ type: "area", slug: a.slug, name: a.name, href: `/tokyo/${a.slug}` });
    }
  }
  return results.slice(0, 8);
}
