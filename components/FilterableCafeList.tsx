"use client";

import { useEffect, useMemo, useState } from "react";
import type { Venue } from "@/lib/types";
import CafeCard from "./CafeCard";

// Amenity options, matching the homepage need-selector: "Wi-Fi + outlets" (both),
// "Outlets", or "Wi-Fi" — mutually exclusive. Open late is a separate toggle.
type Need = "" | "both" | "power" | "wifi";
const NEED_OPTIONS: { key: Exclude<Need, "">; label: string }[] = [
  { key: "both", label: "Wi-Fi + outlets" },
  { key: "power", label: "Outlets" },
  { key: "wifi", label: "Wi-Fi" },
];

// Client-side filter. The full list is rendered server-side first (good for
// SEO/GEO crawling); this just narrows what's visible. The amenity chips mirror
// the homepage's options; picking none shows every cafe in the area.
export default function FilterableCafeList({ venues }: { venues: Venue[] }) {
  const [need, setNeed] = useState<Need>("");
  const [late, setLate] = useState(false);

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
        {NEED_OPTIONS.map((o) => (
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
          Open late / 24h
        </button>
      </div>

      <p className="count">{filtered.length} cafe{filtered.length === 1 ? "" : "s"}</p>

      <div className="cafe-list">
        {filtered.map((v) => (
          <CafeCard key={v.id} v={v} />
        ))}
      </div>
    </div>
  );
}
