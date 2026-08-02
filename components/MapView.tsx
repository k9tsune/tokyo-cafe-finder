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

// Reliable keyless raster basemap (CARTO Voyager, OSM data). Vector-style
// endpoints were flaky; raster tiles from a CDN render consistently.
const BASEMAP_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};

// Interactive map. Pins colored by amenity: green = Wi-Fi + outlets,
// amber = outlets, blue = Wi-Fi.
export default function MapView({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;
    (async () => {
      const mod = await import("maplibre-gl");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maplibregl: any = (mod as any).default || mod;
      if (cancelled || !ref.current) return;

      map = new maplibregl.Map({
        container: ref.current,
        style: BASEMAP_STYLE,
        center: [139.7671, 35.68],
        zoom: 10.4,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: false }), "top-right");

      for (const p of points) {
        const el = document.createElement("div");
        const kind = p.wifi && p.power ? "both" : p.power ? "power" : p.wifi ? "wifi" : "none";
        el.className = `map-marker ${kind}`;
        const safeName = p.name.replace(/[<>&]/g, "");
        const status = p.wifi && p.power ? "Wi-Fi + outlets" : p.power ? "Outlets" : p.wifi ? "Wi-Fi" : "—";
        const dir = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
        const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
          `<strong>${safeName}</strong><br><span class="pop-status">${status}</span><br>` +
            `<a href="/cafe/${p.slug}">Details</a> · <a href="${dir}" target="_blank" rel="noopener">Directions →</a>`
        );
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [points]);

  return <div ref={ref} className="mapview" aria-label="Map of Tokyo cafes with Wi-Fi and power outlets" />;
}
