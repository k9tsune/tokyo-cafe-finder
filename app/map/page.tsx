import type { Metadata } from "next";
import Link from "next/link";
import MapView, { type MapPoint } from "@/components/MapView";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Map of Tokyo cafes with Wi-Fi & power outlets",
  description:
    "An interactive map of Tokyo cafes where you can charge your phone or laptop and get online — green pins have both Wi-Fi and power outlets.",
  alternates: { canonical: "/map" },
};

export default function MapPage() {
  const points: MapPoint[] = getAllVenues()
    .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      lat: v.lat as number,
      lng: v.lng as number,
      wifi: v.hasWifi,
      power: v.hasPower,
    }));

  return (
    <div>
      <p className="breadcrumb"><Link href="/">Home</Link> / Map</p>
      <h1>Map of Tokyo work-friendly cafes</h1>
      <p className="lede">
        Every cafe on one map. Tap a pin for details — <strong>green</strong> = Wi-Fi and power
        outlets, <strong>amber</strong> = outlets, <strong>blue</strong> = Wi-Fi. Use the location
        button to find what&apos;s near you.
      </p>

      <div className="map-legend" aria-hidden="true">
        <span><i className="map-pin both" /> Wi-Fi + outlets</span>
        <span><i className="map-pin power" /> Outlets</span>
        <span><i className="map-pin wifi" /> Wi-Fi</span>
      </div>

      <MapView points={points} />

      <p className="muted" style={{ marginTop: 12 }}>
        Showing {points.length} cafes with mapped locations. More appear as listings are enriched
        with precise coordinates.
      </p>
    </div>
  );
}
