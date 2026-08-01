"use client";

import { useState } from "react";

// "Use my location" — browser geolocation -> /near?lat=..&lng=.. which runs the
// nearest-cafes query (PostGIS ST_DWithin in production).
export default function NearMeButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function locate() {
    setErr("");
    if (!("geolocation" in navigator)) {
      setErr("Geolocation isn't available in this browser.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        window.location.href = `/near?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}`;
      },
      () => {
        setBusy(false);
        setErr("Couldn't get your location. You can search by station instead.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <div className="near-me">
      <button type="button" onClick={locate} disabled={busy}>
        {busy ? "Locating…" : "📍 Find cafes near me"}
      </button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
