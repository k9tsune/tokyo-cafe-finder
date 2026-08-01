import Link from "next/link";
import type { Metadata } from "next";
import CafeCard from "@/components/CafeCard";
import { formatDistance } from "@/lib/geo";
import { nearestVenues } from "@/lib/db";

// User-location results page. Not an SEO target (it's personalized), so noindex.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NearPage({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string };
}) {
  const lat = parseFloat(searchParams.lat ?? "");
  const lng = parseFloat(searchParams.lng ?? "");
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  const results = valid ? nearestVenues(lat, lng, 20) : [];

  return (
    <div>
      <p className="breadcrumb"><Link href="/">Home</Link> / Near me</p>
      <h1>Cafes near you</h1>
      {!valid ? (
        <p className="lede">
          We couldn&apos;t read a location. <Link href="/">Go back</Link> and try &ldquo;Find cafes near me&rdquo;
          again, or search by station.
        </p>
      ) : (
        <>
          <p className="lede">Sorted by distance from your location.</p>
          <div className="cafe-list">
            {results.map((v) => (
              <div key={v.id}>
                <p className="muted" style={{ fontSize: ".8rem", margin: "0 0 4px" }}>
                  {formatDistance(v.distanceMeters)} away
                </p>
                <CafeCard v={v} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
