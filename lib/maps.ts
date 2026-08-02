import type { Venue } from "./types";

// Google Maps "directions" deep link — routes from the user's own location to the
// cafe. Needs no API key. Uses a text query (name + address) so it pinpoints the
// real place rather than our station-level coordinates.
export function directionsUrl(v: Pick<Venue, "name" | "address" | "nearestStation" | "googlePlaceId">): string {
  const dest = encodeURIComponent(
    [v.name, v.address || v.nearestStation, "Tokyo, Japan"].filter(Boolean).join(", ")
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}${
    v.googlePlaceId ? `&destination_place_id=${v.googlePlaceId}` : ""
  }`;
}
