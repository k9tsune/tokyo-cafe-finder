"use client";

import { useEffect, useState } from "react";
import type { Venue } from "@/lib/types";

const KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

// Map + on-page directions. Clicking "Get directions" gets the user's location
// and swaps the embed into walking-directions mode *inside this box* — so people
// stay on the site. An "Open in Google Maps" link is kept for live turn-by-turn.
export default function CafeMap({ v }: { v: Venue }) {
  const [origin, setOrigin] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // When location is blocked, a re-request can't re-prompt — show how to enable it.
  const [denied, setDenied] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => setPlatform(detectPlatform()), []);

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
          setErr("Location is blocked for this site, so we can’t route from where you are.");
        } else if (geoErr && geoErr.code === 3) {
          setErr("That took too long. Tap the button to try again, or use “Open in Google Maps” below.");
        } else {
          setErr("We couldn’t get your location. Tap the button to try again, or use “Open in Google Maps” below.");
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
          title={origin ? `Walking directions to ${v.name}` : `Map showing ${v.name}`}
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
          <p>Map preview needs a Google Maps Embed API key (<code>NEXT_PUBLIC_GMAPS_EMBED_KEY</code>).</p>
        </div>
      )}

      <div className="map-actions">
        <button type="button" className="directions-btn" onClick={getDirections} disabled={busy}>
          {busy
            ? "Locating…"
            : origin
            ? "↻ Update directions"
            : denied
            ? "I turned it on — try again →"
            : "Get directions from your location →"}
        </button>
        <a className="map-open" href={externalDir} target="_blank" rel="noopener noreferrer">
          Open in Google Maps ↗
        </a>
      </div>

      {err && <p className="map-err">{err}</p>}

      {denied && (
        <div className="loc-help">
          <p className="loc-help-title">How to turn on location</p>

          {platform === "ios" && (
            <ol>
              <li>Open the iPhone <strong>Settings</strong> app.</li>
              <li>Tap <strong>Privacy &amp; Security</strong> → <strong>Location Services</strong> and make sure it&rsquo;s on.</li>
              <li>In that list, tap your browser (e.g. <strong>Safari</strong> or <strong>Chrome</strong>) and choose <strong>While Using the App</strong>.</li>
              <li>Come back here, <strong>reload the page</strong>, then tap the button above.</li>
            </ol>
          )}

          {platform === "android" && (
            <ol>
              <li>Tap the <strong>lock icon</strong> next to the web address at the top of your browser.</li>
              <li>Tap <strong>Permissions</strong> → <strong>Location</strong> → <strong>Allow</strong>.</li>
              <li>Make sure your phone&rsquo;s <strong>Location</strong> is on (swipe down from the top and check the Location toggle).</li>
              <li><strong>Reload the page</strong>, then tap the button above.</li>
            </ol>
          )}

          {platform === "other" && (
            <ol>
              <li>Click the <strong>lock icon</strong> next to the web address in your browser.</li>
              <li>Set <strong>Location</strong> to <strong>Allow</strong> for this site.</li>
              <li><strong>Reload the page</strong>, then click the button above.</li>
            </ol>
          )}

          <p className="loc-help-alt">
            Don&rsquo;t want to change settings? <a href={externalDir} target="_blank" rel="noopener noreferrer">Open in Google Maps</a> instead — it will use your location there.
          </p>
        </div>
      )}
    </div>
  );
}
