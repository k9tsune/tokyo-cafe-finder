"use client";

import { useMemo, useState } from "react";
import type { Venue, MatchMode } from "@/lib/types";
import CafeCard from "./CafeCard";

// Client-side AND/OR filter (plan §2.2). The full list is rendered server-side
// first (good for SEO/GEO crawling); this just narrows what's visible.
export default function FilterableCafeList({ venues }: { venues: Venue[] }) {
  const [wifi, setWifi] = useState(false);
  const [power, setPower] = useState(false);
  const [match, setMatch] = useState<MatchMode>("all");

  const filtered = useMemo(() => {
    if (!wifi && !power) return venues;
    return venues.filter((v) => {
      if (wifi && !power) return v.hasWifi;
      if (power && !wifi) return v.hasPower;
      return match === "any" ? v.hasWifi || v.hasPower : v.hasWifi && v.hasPower;
    });
  }, [venues, wifi, power, match]);

  const bothOn = wifi && power;

  return (
    <div>
      <div className="filters" role="group" aria-label="Filter by amenities">
        <button
          type="button"
          className={`chip ${wifi ? "on" : ""}`}
          aria-pressed={wifi}
          onClick={() => setWifi((x) => !x)}
        >
          Wi-Fi
        </button>
        <button
          type="button"
          className={`chip ${power ? "on" : ""}`}
          aria-pressed={power}
          onClick={() => setPower((x) => !x)}
        >
          Power outlets
        </button>

        {bothOn && (
          <span className="match">
            Match:
            <button
              type="button"
              className={`seg ${match === "all" ? "on" : ""}`}
              onClick={() => setMatch("all")}
            >
              All (both)
            </button>
            <button
              type="button"
              className={`seg ${match === "any" ? "on" : ""}`}
              onClick={() => setMatch("any")}
            >
              Any (either)
            </button>
          </span>
        )}
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
