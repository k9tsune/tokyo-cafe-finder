"use client";

import { t, localePath, type Locale } from "@/lib/i18n";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

export type MapPoint = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  wifi: boolean;
  power: boolean;
  hours?: string;
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
export default function MapView({
  points,
  center,
  zoom,
  locale = "en",
}: {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  locale?: Locale;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoRef = useRef<any>(null);
  const centerKey = center ? `${center[0]},${center[1]}` : "";
  const tr = t(locale).search;
  const cd = t(locale).card;
  const mm = t(locale).map;

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
        center: center || [139.7671, 35.68],
        zoom: zoom ?? 10.4,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      const geolocate = new maplibregl.GeolocateControl({
        trackUserLocation: false,
        positionOptions: { enableHighAccuracy: true },
      });
      map.addControl(geolocate, "top-right");
      geoRef.current = geolocate;

      for (const p of points) {
        const el = document.createElement("div");
        const kind = p.wifi && p.power ? "both" : p.power ? "power" : p.wifi ? "wifi" : "none";
        el.className = `map-marker ${kind}`;
        const safeName = p.name.replace(/[<>&]/g, "");
        const status = p.wifi && p.power ? tr.needBoth : p.power ? tr.needOutlets : p.wifi ? tr.needWifi : "—";
        const hoursLine = p.hours ? `<span class="pop-hours">🕒 ${p.hours.replace(/[<>&]/g, "")}</span><br>` : "";
        const cafeHref = localePath(`/cafe/${p.slug}`, locale);
        const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
          `<strong>${safeName}</strong><br><span class="pop-status">${status}</span><br>${hoursLine}` +
            `<a href="${cafeHref}">${cd.details}</a> · <a href="${cafeHref}?dir=1#map">${cd.directions}</a>`
        );
        // On touch, opening the popup can leave a link focused, showing a focus
        // ring around "Details". Drop that focus so nothing looks pre-selected.
        popup.on("open", () => {
          window.setTimeout(() => {
            const a = document.activeElement as HTMLElement | null;
            if (a && a.closest(".maplibregl-popup-content") && typeof a.blur === "function") a.blur();
          }, 0);
        });
        new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
      }
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, centerKey, zoom]);

  return (
    <div className="mapview-wrap">
      <button
        type="button"
        className="map-nearme"
        onClick={() => geoRef.current && geoRef.current.trigger()}
      >
        <img className="wc-icon" src="/icons/pin.png" alt="" aria-hidden="true" /> {mm.nearMe}
      </button>
      <div ref={ref} className="mapview" aria-label={locale === "ja" ? "東京のWi-Fi・電源のあるカフェの地図" : "Map of Tokyo cafes with Wi-Fi and power outlets"} />
    </div>
  );
}
