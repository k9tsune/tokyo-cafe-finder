"use client";

import { useState } from "react";
import { t, localePath, type Locale } from "@/lib/i18n";

// Geolocation entry point. In `charge` mode it routes to the outlet-first,
// short-radius "nearest places to charge" view for the dying-phone tourist.
// The 🔋 / 📍 emojis are replaced by hand-drawn icons (public/icons) for a more
// personal feel; labels come from the locale dictionary.
export default function NearMeButton({
  charge = false,
  locale = "en",
}: {
  charge?: boolean;
  locale?: Locale;
}) {
  const n = t(locale).near;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // When location is blocked, a re-request can't re-prompt — show how to enable it.
  const [denied, setDenied] = useState(false);

  function locate() {
    setErr("");
    setDenied(false);
    if (!("geolocation" in navigator)) {
      setErr(n.noGeo);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const q = `lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}${charge ? "&charge=1" : ""}`;
        window.location.href = `${localePath("/near", locale)}?${q}`;
      },
      (geoErr) => {
        setBusy(false);
        if (geoErr && geoErr.code === 1) {
          setDenied(true);
          setErr(n.denied);
        } else {
          setErr(n.failed);
        }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  }

  const base = denied ? n.retry : charge ? n.charge : n.normal;
  const icon = charge ? "/icons/battery.png" : "/icons/pin.png";

  return (
    <span className="near-me">
      <button type="button" className={charge ? "charge-cta" : ""} onClick={locate} disabled={busy}>
        <img className="wc-icon" src={icon} alt="" aria-hidden="true" />
        {busy ? n.locating : base}
      </button>
      {err && <span className="err">{err}</span>}
    </span>
  );
}
