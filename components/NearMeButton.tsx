"use client";

import { useState } from "react";

// Geolocation entry point. In `charge` mode it routes to the outlet-first,
// short-radius "nearest places to charge" view for the dying-phone tourist.
export default function NearMeButton({
  charge = false,
  label,
}: {
  charge?: boolean;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function locate() {
    setErr("");
    if (!("geolocation" in navigator)) {
      setErr("This browser won't share your location — search by station instead.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const q = `lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}${charge ? "&charge=1" : ""}`;
        window.location.href = `/near?${q}`;
      },
      () => {
        setBusy(false);
        setErr("Can't find you — no worries. Type your station and we'll show the closest.");
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  }

  const text = label || (charge ? "🔋 Nearest outlet now" : "📍 Cafes near me");

  return (
    <span className="near-me">
      <button type="button" className={charge ? "charge-cta" : ""} onClick={locate} disabled={busy}>
        {busy ? "Locating…" : text}
      </button>
      {err && <span className="err">{err}</span>}
    </span>
  );
}
