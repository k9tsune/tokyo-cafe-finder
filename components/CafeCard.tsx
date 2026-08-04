import Link from "next/link";
import type { Venue } from "@/lib/types";
import { WifiBadge, PowerBadge, FreshnessBadge } from "./badges";
import CafeCover from "./CafeCover";
import { t, type Locale } from "@/lib/i18n";

// Card ordered for scanning: name → amenity badges → where/how far → actions.
// "Directions" goes to the cafe page's on-page map (?dir=1) so users stay on-site.
// Cafe detail pages are English-only for now, so links stay at /cafe/… in both
// locales; the Japanese card localizes labels and prefers the Japanese name.
export default function CafeCard({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const c = t(locale).card;
  const name = locale === "ja" ? v.nameJa || v.name : v.name;
  return (
    <article className="cafe-card">
      <Link href={`/cafe/${v.slug}`} className="cafe-card-cover" aria-label={name}>
        <CafeCover v={v} />
      </Link>
      <div className="cafe-card-body">
        <h3>
          <Link href={`/cafe/${v.slug}`}>{name}</Link>
        </h3>
        <div className="badges">
          <WifiBadge v={v} locale={locale} />
          <PowerBadge v={v} locale={locale} />
          {v.laptopFriendly && <span className="badge alt">{c.laptopFriendly}</span>}
        </div>
        <p className="meta">
          {v.nearestStation} · {locale === "ja" ? c.walk(v.walkMinutes) : `${v.walkMinutes} min walk`}
          {v.priceBand ? ` · ${v.priceBand}` : ""}
          {locale === "en" && v.typicalBusyness ? ` · usually ${v.typicalBusyness}` : ""}
        </p>
        <div className="card-actions">
          <Link className="dir-link" href={`/cafe/${v.slug}?dir=1#map`}>{c.directions}</Link>
          <Link className="dir-link ghost" href={`/cafe/${v.slug}`}>{c.details}</Link>
        </div>
        {locale === "en" && <p className="desc">{v.description}</p>}
        <FreshnessBadge date={v.lastChecked} confidence={v.confidence} locale={locale} />
      </div>
    </article>
  );
}
