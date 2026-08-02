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
  // When location is blocked, a re-request can't re-prompt — show how to enable it.
  const [denied, setDenied] = useState(false);

  function locate() {
    setErr("");
    setDenied(false);
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
      (geoErr) => {
        setBusy(false);
        if (geoErr && geoErr.code === 1) {
          // PERMISSION_DENIED — the browser won't re-prompt.
          setDenied(true);
          setErr("Location is blocked for this site, so we can’t find you. Type your station instead.");
        } else {
          setErr("Can't find you — no worries. Type your station and we'll show the closest.");
        }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  }

  const base = label || (charge ? "🔋 Nearest outlet now" : "📍 Cafes near me");
  const text = denied ? "I turned it on — try again" : base;

  return (
    <span className="near-me">
      <button type="button" className={charge ? "charge-cta" : ""} onClick={locate} disabled={busy}>
        {busy ? "Locating…" : text}
      </button>
      {err && <span className="err">{err}</span>}
    </span>
  );
}
