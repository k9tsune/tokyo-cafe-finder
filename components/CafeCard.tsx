import Link from "next/link";
import type { Venue } from "@/lib/types";
import { WifiBadge, PowerBadge, FreshnessBadge } from "./badges";
import CafeCover from "./CafeCover";
import { directionsUrl } from "@/lib/maps";

// Card ordered for scanning: name → amenity badges (the only thing either
// persona needs) → where/how far → a direct "Directions" action → short blurb.
export default function CafeCard({ v }: { v: Venue }) {
  return (
    <article className="cafe-card">
      <Link href={`/cafe/${v.slug}`} className="cafe-card-cover" aria-label={v.name}>
        <CafeCover v={v} />
      </Link>
      <div className="cafe-card-body">
        <h3>
          <Link href={`/cafe/${v.slug}`}>{v.name}</Link>
        </h3>
        <div className="badges">
          <WifiBadge v={v} />
          <PowerBadge v={v} />
          {v.laptopFriendly && <span className="badge alt">Laptop-friendly</span>}
        </div>
        <p className="meta">
          {v.nearestStation} · {v.walkMinutes} min walk{v.priceBand ? ` · ${v.priceBand}` : ""}
          {v.typicalBusyness ? ` · usually ${v.typicalBusyness}` : ""}
        </p>
        <div className="card-actions">
          <a className="dir-link" href={directionsUrl(v)} target="_blank" rel="noopener noreferrer">
            Directions →
          </a>
          <Link className="dir-link ghost" href={`/cafe/${v.slug}`}>Details</Link>
        </div>
        <p className="desc">{v.description}</p>
        <FreshnessBadge date={v.lastChecked} confidence={v.confidence} />
      </div>
    </article>
  );
}
