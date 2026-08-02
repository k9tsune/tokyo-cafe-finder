"use client";

import { useEffect, useMemo, useState } from "react";
import type { Venue, MatchMode } from "@/lib/types";
import CafeCard from "./CafeCard";

// Client-side AND/OR filter (plan §2.2). The full list is rendered server-side
// first (good for SEO/GEO crawling); this just narrows what's visible.
export default function FilterableCafeList({ venues }: { venues: Venue[] }) {
  const [wifi, setWifi] = useState(false);
  const [power, setPower] = useState(false);
  const [late, setLate] = useState(false);
  const [match, setMatch] = useState<MatchMode>("all");

  // Pre-apply the choices made in the home search (?need=both|power|wifi, ?late=1).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const need = params.get("need");
    if (need === "both") { setWifi(true); setPower(true); setMatch("all"); }
    else if (need === "power") { setPower(true); }
    else if (need === "wifi") { setWifi(true); }
    if (params.get("late") === "1") setLate(true);
  }, []);

  const filtered = useMemo(() => {
    let list = venues;
    if (late) list = list.filter((v) => v.openLate);
    if (!wifi && !power) return list;
    return list.filter((v) => {
      if (wifi && !power) return v.hasWifi;
      if (power && !wifi) return v.hasPower;
      return match === "any" ? v.hasWifi || v.hasPower : v.hasWifi && v.hasPower;
    });
  }, [venues, wifi, power, late, match]);

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
        <button
          type="button"
          className={`chip ${late ? "on" : ""}`}
          aria-pressed={late}
          onClick={() => setLate((x) => !x)}
        >
          Open late / 24h
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
