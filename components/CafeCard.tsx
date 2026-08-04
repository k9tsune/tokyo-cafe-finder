import Link from "next/link";
import type { Venue } from "@/lib/types";
import { WifiBadge, PowerBadge, FreshnessBadge } from "./badges";
import CafeCover from "./CafeCover";
import { t, localePath, type Locale } from "@/lib/i18n";
import { stationNameJa } from "@/lib/station-ja";

// Card ordered for scanning: name → amenity badges → where/how far → actions.
// "Directions" goes to the cafe page's on-page map (?dir=1) so users stay on-site.
export default function CafeCard({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const c = t(locale).card;
  const name = locale === "ja" ? v.nameJa || v.name : v.name;
  const station = locale === "ja" ? stationNameJa(v.nearestStation) : v.nearestStation;
  const href = localePath(`/cafe/${v.slug}`, locale);
  return (
    <article className="cafe-card">
      <Link href={href} className="cafe-card-cover" aria-label={name}>
        <CafeCover v={v} />
      </Link>
      <div className="cafe-card-body">
        <h3>
          <Link href={href}>{name}</Link>
        </h3>
        <div className="badges">
          <WifiBadge v={v} locale={locale} />
          <PowerBadge v={v} locale={locale} />
          {v.laptopFriendly && <span className="badge alt">{c.laptopFriendly}</span>}
        </div>
        <p className="meta">
          {station} · {locale === "ja" ? c.walk(v.walkMinutes) : `${v.walkMinutes} min walk`}
          {v.priceBand ? ` · ${v.priceBand}` : ""}
          {locale === "en" && v.typicalBusyness ? ` · usually ${v.typicalBusyness}` : ""}
        </p>
        <div className="card-actions">
          <Link className="dir-link" href={`${href}?dir=1#map`}>{c.directions}</Link>
          <Link className="dir-link ghost" href={href}>{c.details}</Link>
        </div>
        {locale === "en" && <p className="desc">{v.description}</p>}
        <FreshnessBadge date={v.lastChecked} confidence={v.confidence} locale={locale} />
      </div>
    </article>
  );
}
