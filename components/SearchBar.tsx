"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Destination } from "@/lib/db";

// Search bar: type a station or area, pick a suggestion, and NAVIGATE to that
// real landing page (never a JS-only in-page filter). This is what makes the
// Dengen-style search flow also SEO/GEO-friendly — every result is a URL.
export default function SearchBar({
  destinations,
  need,
  late,
}: {
  destinations: Destination[];
  need?: string;
  late?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return destinations.filter((d) => d.name.toLowerCase().includes(query)).slice(0, 8);
  }, [q, destinations]);

  function go(href: string) {
    // carry the search add-ons through to the results page's filter
    const params = new URLSearchParams();
    params.set("need", need || "both");
    if (late) params.set("late", "1");
    router.push(`${href}?${params.toString()}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) go(matches[0].href);
  }

  return (
    <form className="searchbar" onSubmit={onSubmit} role="search" autoComplete="off">
      <input
        type="text"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search a station or area — e.g. Shibuya"
        aria-label="Search a station or area in Tokyo"
      />
      <button type="submit">Search</button>
      {open && matches.length > 0 && (
        <ul className="suggestions">
          {matches.map((m) => (
            <li key={`${m.type}-${m.slug}`}>
              <button type="button" onClick={() => go(m.href)}>
                <span>{m.name}</span>
                <span className="tag">{m.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
