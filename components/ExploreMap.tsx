"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import MapView, { type MapPoint } from "./MapView";

type Coord = { lat: number; lng: number };

// A "keep exploring" map shown at the bottom of pages, centered on whatever the
// visitor is looking at (an area, a station, or a specific cafe) so they can
// keep discovering nearby cafes. Hidden on the dedicated /map page.
export default function ExploreMap({
  points,
  areas,
  stations,
}: {
  points: MapPoint[];
  areas: Record<string, Coord>;
  stations: Record<string, Coord>;
}) {
  const pathname = usePathname() || "/";

  const view = useMemo<{ center?: [number, number]; zoom?: number }>(() => {
    const seg = pathname.split("?")[0].split("/").filter(Boolean);
    // /tokyo/station/[station]
    if (seg[0] === "tokyo" && seg[1] === "station" && seg[2]) {
      const s = stations[seg[2]];
      if (s) return { center: [s.lng, s.lat], zoom: 14.5 };
    }
    // /tokyo/[area]  (but not the feature hubs, which still just default)
    if (seg[0] === "tokyo" && seg[1] && seg.length === 2) {
      const a = areas[seg[1]];
      if (a) return { center: [a.lng, a.lat], zoom: 13 };
    }
    // /cafe/[slug]
    if (seg[0] === "cafe" && seg[1]) {
      const p = points.find((x) => x.slug === seg[1]);
      if (p) return { center: [p.lng, p.lat], zoom: 15 };
    }
    return {};
  }, [pathname, areas, stations, points]);

  if (pathname === "/map") return null;

  return (
    <section className="container explore-map">
      <h2>Keep exploring on the map</h2>
      <p className="muted" style={{ margin: "0 0 12px" }}>
        Every mapped cafe, so you can find another spot nearby. Tap a pin for details.
      </p>
      <MapView points={points} center={view.center} zoom={view.zoom} />
    </section>
  );
}
