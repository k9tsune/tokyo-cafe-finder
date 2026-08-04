import type { Venue } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

export function WifiBadge({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const c = t(locale).card;
  if (!v.hasWifi) return <span className="badge no">{c.noWifi}</span>;
  return <span className="badge yes">{v.wifiType === "free" ? c.freeWifi : c.wifiPaid}</span>;
}

export function PowerBadge({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const c = t(locale).card;
  if (!v.hasPower) return <span className="badge no">{c.noOutlets}</span>;
  const label =
    v.powerDensity === "many" ? c.outletsMany :
    v.powerDensity === "some" ? c.outletsSome : c.outletsCounter;
  return <span className="badge yes">{label}</span>;
}

export function FreshnessBadge({ date, confidence, locale = "en" }: { date: string; confidence: Venue["confidence"]; locale?: Locale }) {
  // Consistent wording for every listing; the dot's tooltip still notes confidence.
  return (
    <span className="freshness" title={`Source confidence: ${confidence}`}>
      {t(locale).card.checked} · {date}
    </span>
  );
}
