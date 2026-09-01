import type { MapPoint } from "@/components/MapView";
import { getAllVenues, getAllAreas, getAllStations } from "@/lib/db";

// The "keep exploring" map's pin data, served as ONE static file.
//
// This used to be passed as props to <ExploreMap> from the root layout. That
// meant React serialised all ~580 venues plus every area and station coordinate
// into the RSC payload of EVERY page — about 137 KB on all 1,797 pages, which
// was 85% of the site's total HTML weight. A crawler walking the site pulled
// the same map data 1,797 times over, which is what burned through Vercel's
// Fast Origin Transfer allowance in the first days of the month.
//
// Now it is fetched once, only when the map actually scrolls into view, and the
// CDN and the browser cache it across the whole site. Bots never request it.
export const dynamic = "force-static";

export function GET() {
  const points: MapPoint[] = getAllVenues()
    .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      lat: v.lat as number,
      lng: v.lng as number,
      wifi: v.hasWifi,
      power: v.hasPower,
      hours: v.businessHours,
    }));

  const areas = Object.fromEntries(getAllAreas().map((a) => [a.slug, { lat: a.lat, lng: a.lng }]));

  const stations = Object.fromEntries(
    getAllStations()
      .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
      .map((s) => [s.slug, { lat: s.lat as number, lng: s.lng as number }])
  );

  return Response.json(
    { points, areas, stations },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400" } }
  );
}
