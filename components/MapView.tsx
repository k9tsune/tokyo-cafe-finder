"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  wifi: boolean;
  power: boolean;
};

// Interactive map (MapLibre + free OpenFreeMap tiles — no API key, no cost).
// Pins are colored by amenity: green = Wi-Fi + outlets, amber = outlets only,
// blue = Wi-Fi only.
export default function MapView({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !ref.current) return;
      map = new maplibregl.Map({
        container: ref.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [139.7671, 35.68],
        zoom: 10.4,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }), "top-right");

      for (const p of points) {
        const el = document.createElement("div");
        const kind = p.wifi && p.power ? "both" : p.power ? "power" : p.wifi ? "wifi" : "none";
        el.className = `map-pin ${kind}`;
        const safeName = p.name.replace(/[<>&]/g, "");
        const popup = new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
          `<strong>${safeName}</strong><br><a href="/cafe/${p.slug}">View cafe →</a>`
        );
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      }
    });
    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points]);

  return <div ref={ref} className="mapview" aria-label="Map of Tokyo cafes with Wi-Fi and power outlets" />;
}
