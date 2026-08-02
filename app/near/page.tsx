import Link from "next/link";
import type { Metadata } from "next";
import CafeCard from "@/components/CafeCard";
import { formatDistance } from "@/lib/geo";
import { nearestVenues } from "@/lib/db";

// Personalized results — not an SEO target, so noindex.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NearPage({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string; charge?: string };
}) {
  const lat = parseFloat(searchParams.lat ?? "");
  const lng = parseFloat(searchParams.lng ?? "");
  const charge = searchParams.charge === "1";
  const valid = Number.isFinite(lat) && Number.isFinite(lng);

  let results = valid ? nearestVenues(lat, lng, 60) : [];
  // Charge mode: only places that actually have outlets, and only genuinely
  // nearby ones (≤ 2 km) — never send a dying-phone user across the city.
  results = charge
    ? results.filter((v) => v.hasPower && v.distanceMeters <= 2000).slice(0, 20)
    : results.slice(0, 20);

  return (
    <div>
      <p className="breadcrumb">
        <Link href="/">Home</Link> / {charge ? "Nearest outlets" : "Near me"}
      </p>
      <h1>{charge ? "Nearest places to charge" : "Cafes near you"}</h1>

      {!valid ? (
        <p className="lede">
          We lost your location. <Link href="/">Go back</Link> and try again, or search your
          station — same result, no GPS needed.
        </p>
      ) : results.length === 0 ? (
        <p className="lede">
          {charge
            ? "No cafes with outlets within about 2 km. Try searching a nearby station."
            : "Nothing found nearby — try searching a station instead."}
        </p>
      ) : (
        <>
          <p className="lede">
            {charge
              ? "Closest first — every one of these has a power outlet. Tap Directions and go."
              : "Closest first. Tap Directions to go, or a cafe for full details."}
          </p>
          <div className="cafe-list">
            {results.map((v) => (
              <div key={v.id}>
                <p className="near-dist">{formatDistance(v.distanceMeters)} away</p>
                <CafeCard v={v} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
