"use client";

import { useEffect, useMemo, useState } from "react";
import type { Venue } from "@/lib/types";
import CafeCard from "./CafeCard";
import { t, type Locale } from "@/lib/i18n";

// Amenity options, matching the homepage need-selector: "Wi-Fi + outlets" (both),
// "Outlets", or "Wi-Fi" — mutually exclusive. Open late is a separate toggle.
type Need = "" | "both" | "power" | "wifi";

// Client-side filter. The full list is rendered server-side first (good for
// SEO/GEO crawling); this just narrows what's visible. The amenity chips mirror
// the homepage's options; picking none shows every cafe in the area.
export default function FilterableCafeList({ venues, locale = "en" }: { venues: Venue[]; locale?: Locale }) {
  const [need, setNeed] = useState<Need>("");
  const [late, setLate] = useState(false);
  const s = t(locale).search;
  const options: { key: Exclude<Need, "">; label: string }[] = [
    { key: "both", label: s.needBoth },
    { key: "power", label: s.needOutlets },
    { key: "wifi", label: s.needWifi },
  ];

  // Pre-apply the choices made in the home search (?need=both|power|wifi, ?late=1).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("need");
    if (n === "both" || n === "power" || n === "wifi") setNeed(n);
    if (params.get("late") === "1") setLate(true);
  }, []);

  const filtered = useMemo(() => {
    let list = venues;
    if (late) list = list.filter((v) => v.openLate);
    if (need === "both") return list.filter((v) => v.hasWifi && v.hasPower);
    if (need === "power") return list.filter((v) => v.hasPower);
    if (need === "wifi") return list.filter((v) => v.hasWifi);
    return list;
  }, [venues, need, late]);

  return (
    <div>
      <div className="filters" role="group" aria-label="Filter by amenities">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`chip ${need === o.key ? "on" : ""}`}
            aria-pressed={need === o.key}
            onClick={() => setNeed((cur) => (cur === o.key ? "" : o.key))}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          className={`chip ${late ? "on" : ""}`}
          aria-pressed={late}
          onClick={() => setLate((x) => !x)}
        >
          {s.openLate}
        </button>
      </div>

      <p className="count">{t(locale).filters.count(filtered.length)}</p>

      <div className="cafe-list">
        {filtered.map((v) => (
          <CafeCard key={v.id} v={v} locale={locale} />
        ))}
      </div>
    </div>
  );
}
