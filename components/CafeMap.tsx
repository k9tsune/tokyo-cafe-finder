"use client";

import { useEffect, useState } from "react";
import type { Venue } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

const KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";

// Map + on-page directions. Clicking "Get directions" gets the user's location
// and swaps the embed into walking-directions mode *inside this box* — so people
// stay on the site. An "Open in Google Maps" link is kept for live turn-by-turn.
export default function CafeMap({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const m = t(locale).map;
  const [origin, setOrigin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // When location is blocked, a re-request can't re-prompt — show how to enable it.
  const [denied, setDenied] = useState(false);

  const dest = encodeURIComponent(
    [v.name, v.address || v.nearestStation, "Tokyo, Japan"].filter(Boolean).join(", ")
  );
  const externalDir = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;

  const placeSrc = KEY ? `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${dest}&zoom=16` : "";
  const dirSrc =
    KEY && origin
      ? `https://www.google.com/maps/embed/v1/directions?key=${KEY}&origin=${origin}&destination=${dest}&mode=walking`
      : "";
  const src = origin ? dirSrc : placeSrc;

  function getDirections() {
    setErr("");
    setDenied(false);
    if (!("geolocation" in navigator)) {
      window.open(externalDir, "_blank", "noopener");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin(`${pos.coords.latitude},${pos.coords.longitude}`);
        setBusy(false);
      },
      (geoErr) => {
        setBusy(false);
        if (geoErr && geoErr.code === 1) {
          // PERMISSION_DENIED — the browser won't re-prompt; show enable steps.
          setDenied(true);
          setErr(m.denied);
        } else if (geoErr && geoErr.code === 3) {
          setErr(m.timeout);
        } else {
          setErr(m.failed);
        }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  }

  // If arrived via a "Directions" link (?dir=1), start directions automatically.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("dir") === "1") getDirections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cafe-map" id="map">
      {src ? (
        <iframe
          title={origin ? m.titleDir(v.name) : m.titleMap(v.name)}
          src={src}
          width="100%"
          height="320"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="map-fallback">
          <p>{m.needKey} (<code>NEXT_PUBLIC_GMAPS_EMBED_KEY</code>).</p>
        </div>
      )}

      <div className="map-actions">
        <button type="button" className="directions-btn" onClick={getDirections} disabled={busy}>
          {busy ? m.locating : origin ? m.updateDirections : denied ? m.retry : m.getDirections}
        </button>
        <a className="map-open" href={externalDir} target="_blank" rel="noopener noreferrer">
          {m.openInMaps}
        </a>
      </div>

      {err && <p className="map-err">{err}</p>}
    </div>
  );
}
