import type { Venue } from "@/lib/types";
import { GMAPS_EMBED_KEY } from "@/lib/site";

// Small embedded map + directions. The Maps Embed API is FREE with unlimited
// requests (plan §2 / §4). The "Get directions" link uses Google Maps' universal
// URL, which starts routing from the user's own location — no API key needed.
export default function CafeMap({ v }: { v: Venue }) {
  // Precise place query — name + address geocodes to the actual cafe (better
  // than our station-level coordinates). Works for both the embed and directions.
  const query = encodeURIComponent(
    [v.name, v.address || v.nearestStation, "Tokyo, Japan"].filter(Boolean).join(", ")
  );
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}${
    v.googlePlaceId ? `&destination_place_id=${v.googlePlaceId}` : ""
  }`;

  const embedSrc = GMAPS_EMBED_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GMAPS_EMBED_KEY}&q=${query}&zoom=16`
    : "";

  return (
    <div className="cafe-map">
      {embedSrc ? (
        <iframe
          title={`Map showing ${v.name}`}
          src={embedSrc}
          width="100%"
          height="260"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="map-fallback">
          <p>Map preview needs a Google Maps Embed API key (set <code>NEXT_PUBLIC_GMAPS_EMBED_KEY</code>).</p>
        </div>
      )}
      <a className="directions-btn" href={directionsUrl} target="_blank" rel="noopener noreferrer">
        Get directions from your location →
      </a>
    </div>
  );
}
