"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import MapView, { type MapPoint } from "./MapView";

type Coord = { lat: number; lng: number };
type MapData = {
  points: MapPoint[];
  areas: Record<string, Coord>;
  stations: Record<string, Coord>;
};

// rough distance in meters (equirectangular is plenty for "is it nearby")
function distM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000, rad = Math.PI / 180;
  const x = (bLng - aLng) * rad * Math.cos(((aLat + bLat) / 2) * rad);
  const y = (bLat - aLat) * rad;
  return Math.sqrt(x * x + y * y) * R;
}

// A "keep exploring" map shown at the bottom of pages, centered on whatever the
// visitor is looking at (an area, a station, or a specific cafe) so they can
// keep discovering nearby cafes. Hidden on the dedicated /map pages.
//
// The pin data is deliberately NOT passed in as props. Doing that serialised
// all ~580 venues into the RSC payload of every single page (~137 KB x 1,797
// pages = ~240 MB per full crawl, 85% of the site's HTML). Instead we fetch the
// static /map-points.json, and only once the map scrolls into view — so
// crawlers never pay for it at all, and a real visitor downloads it one time
// for the whole site instead of on every page they open.
export default function ExploreMap() {
  const pathname = usePathname() || "/";
  const ref = useRef<HTMLElement>(null);
  const [data, setData] = useState<MapData | null>(null);

  const ja = pathname === "/ja" || pathname.startsWith("/ja/");
  // The dedicated map pages render their own full map.
  const hidden = pathname === "/map" || pathname === "/ja/map";

  useEffect(() => {
    if (hidden || data) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const load = () => {
      fetch("/map-points.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((d: MapData | null) => {
          if (!cancelled && d) setData(d);
        })
        .catch(() => {
          /* map simply stays as a placeholder; the rest of the page is unaffected */
        });
    };

    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }
    // Start fetching a little before the map is actually on screen so it feels instant.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [hidden, data]);

  const view = useMemo<{ center?: [number, number]; zoom?: number }>(() => {
    if (!data) return {};
    const seg = pathname.split("?")[0].split("/").filter(Boolean);
    // Treat /ja/... the same as the English routes.
    const p = seg[0] === "ja" ? seg.slice(1) : seg;
    // /tokyo/station/[station]
    if (p[0] === "tokyo" && p[1] === "station" && p[2]) {
      const s = data.stations[p[2]];
      if (s) return { center: [s.lng, s.lat], zoom: 14.5 };
    }
    // /tokyo/[area]  (but not the feature hubs, which still just default)
    if (p[0] === "tokyo" && p[1] && p.length === 2) {
      const a = data.areas[p[1]];
      if (a) return { center: [a.lng, a.lat], zoom: 13 };
    }
    // /cafe/[slug]
    if (p[0] === "cafe" && p[1]) {
      const pt = data.points.find((x) => x.slug === p[1]);
      if (pt) return { center: [pt.lng, pt.lat], zoom: 15 };
    }
    return {};
  }, [pathname, data]);

  // On a contextual page (area/station/cafe) only render pins near what the
  // visitor is looking at — keeps marker count bounded as coverage grows. On the
  // hub pages (no center) show everything.
  const shownPoints = useMemo(() => {
    if (!data) return [];
    if (!view.center) return data.points;
    const [clng, clat] = view.center;
    const ranked = data.points
      .map((p) => ({ p, d: distM(clat, clng, p.lat, p.lng) }))
      .sort((a, b) => a.d - b.d);
    const near = ranked.filter((x) => x.d < 4000).map((x) => x.p);
    return (near.length >= 60 ? near : ranked.slice(0, 60).map((x) => x.p)).slice(0, 250);
  }, [data, view.center]);

  if (hidden) return null;

  return (
    <section className="container explore-map" ref={ref}>
      <h2>{ja ? "地図でもっと探す" : "Keep exploring on the map"}</h2>
      <p className="muted" style={{ margin: "0 0 12px" }}>
        {ja
          ? "近くのカフェを地図で。ピンをタップすると詳細が見られます。"
          : "Cafes nearby, so you can find another spot. Tap a pin for details."}
      </p>
      {data ? (
        <MapView points={shownPoints} center={view.center} zoom={view.zoom} locale={ja ? "ja" : "en"} />
      ) : (
        // Holds the map's exact space so the lazy fetch never shifts the page.
        <div aria-hidden="true" style={{ height: "min(72vh, 640px)", minHeight: 380, width: "100%", borderRadius: "var(--radius)", border: "1px solid var(--line)", background: "var(--surface-2)" }} />
      )}
    </section>
  );
}
