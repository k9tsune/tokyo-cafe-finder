import type { Venue } from "@/lib/types";

export function WifiBadge({ v }: { v: Venue }) {
  if (!v.hasWifi) return <span className="badge no">No Wi-Fi</span>;
  return <span className="badge yes">{v.wifiType === "free" ? "Free Wi-Fi" : "Wi-Fi (paid)"}</span>;
}

export function PowerBadge({ v }: { v: Venue }) {
  if (!v.hasPower) return <span className="badge no">No outlets</span>;
  const label =
    v.powerDensity === "many" ? "Outlets (many)" :
    v.powerDensity === "some" ? "Outlets (some)" : "Outlets (counter)";
  return <span className="badge yes">{label}</span>;
}

export function FreshnessBadge({ date, confidence }: { date: string; confidence: Venue["confidence"] }) {
  // Consistent wording for every listing; the dot's tooltip still notes confidence.
  return (
    <span className="freshness" title={`Source confidence: ${confidence}`}>
      ✓ Checked · {date}
    </span>
  );
}
