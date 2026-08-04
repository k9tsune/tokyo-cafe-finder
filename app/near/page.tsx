import Link from "next/link";
import type { Metadata } from "next";
import CafeCard from "@/components/CafeCard";
import SearchBar from "@/components/SearchBar";
import { formatDistance } from "@/lib/geo";
import { assignCovers } from "@/lib/cafe-image";
import { nearestVenues, getAllDestinations } from "@/lib/db";

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
  const destinations = getAllDestinations();

  let results = valid ? nearestVenues(lat, lng, 60) : [];
  results = charge
    ? results.filter((v) => v.hasPower && v.distanceMeters <= 2000).slice(0, 20)
    : results.slice(0, 20);

  const empty = !valid || results.length === 0;

  return (
    <div>
      <p className="breadcrumb">
        <Link href="/">Home</Link> / {charge ? "Nearest outlets" : "Near me"}
      </p>
      <h1>{charge ? "Nearest places to charge" : "Cafes near you"}</h1>

      {!valid ? (
        <p className="lede">We lost your location — search a station or area below instead.</p>
      ) : results.length === 0 ? (
        <p className="lede">
          {charge
            ? "No cafes with outlets within about 2 km. Search a nearby station below."
            : "Nothing found nearby. Search a station or area below."}
        </p>
      ) : (
        <p className="lede">
          {charge
            ? "Closest first — every one of these has a power outlet. Tap Directions and go."
            : "Closest first. Tap Directions to go, or a cafe for full details."}
        </p>
      )}

      {empty && (
        <div className="near-search">
          <p className="near-search-label">Search a station or area</p>
          <SearchBar destinations={destinations} need={charge ? "power" : undefined} />
        </div>
      )}

      {results.length > 0 && (
        <div className="cafe-list">
          {(() => {
            const covers = assignCovers(results);
            return results.map((v, i) => (
              <div key={v.id}>
                <p className="near-dist">{formatDistance(v.distanceMeters)} away</p>
                <CafeCard v={v} cover={covers[i]} />
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
