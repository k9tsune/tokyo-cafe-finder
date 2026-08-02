"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import type { Destination } from "@/lib/db";

const OPTIONS = [
  { key: "both", label: "Wi-Fi + outlets" },
  { key: "power", label: "Outlets" },
  { key: "wifi", label: "Wi-Fi" },
];

// Home search with an amenity selector. Users pick what they actually need —
// Wi-Fi + outlets (default), outlets only, or Wi-Fi only — and the choice is
// carried into the results page as ?need=, which pre-applies the filter.
export default function HomeSearch({ destinations }: { destinations: Destination[] }) {
  const [need, setNeed] = useState("both");
  const [late, setLate] = useState(false);
  return (
    <div className="home-search">
      <div className="need-selector" role="group" aria-label="What do you need?">
        <span className="need-label">1. I need:</span>
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            className={`need-chip${need === o.key ? " on" : ""}`}
            aria-pressed={need === o.key}
            onClick={() => setNeed(o.key)}
          >
            {o.label}
          </button>
        ))}
        <label className={`late-toggle${late ? " on" : ""}`}>
          <input type="checkbox" checked={late} onChange={(e) => setLate(e.target.checked)} />
          Open late / 24h
        </label>
      </div>
      <p className="need-hint">2. Then search a station or area below to see matching cafes:</p>
      <SearchBar destinations={destinations} need={need} late={late} />
    </div>
  );
}
