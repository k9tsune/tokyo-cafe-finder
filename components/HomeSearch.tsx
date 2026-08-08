"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import type { Destination } from "@/lib/db";
import { t, type Locale } from "@/lib/i18n";

// Home search with an amenity selector. Users pick what they actually need —
// Wi-Fi + outlets (default), outlets only, or Wi-Fi only — and the choice is
// carried into the results page as ?need=, which pre-applies the filter.
export default function HomeSearch({ destinations, locale = "en" }: { destinations: Destination[]; locale?: Locale }) {
  const s = t(locale).search;
  const [need, setNeed] = useState("both");
  const [late, setLate] = useState(false);
  const options = [
    { key: "both", label: s.needBoth },
    { key: "power", label: s.needOutlets },
    { key: "wifi", label: s.needWifi },
  ];
  return (
    <div className="home-search">
      <div className="need-selector" role="group" aria-label="What do you need?">
        <span className="need-label">{s.needLabel}</span>
        {options.map((o) => (
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
        <button
          type="button"
          className={`need-chip late${late ? " on" : ""}`}
          aria-pressed={late}
          onClick={() => setLate((x) => !x)}
        >
          {s.openLate}
        </button>
      </div>
      <p className="need-hint">{s.hint}</p>
      <SearchBar destinations={destinations} need={need} late={late} locale={locale} />
    </div>
  );
}
