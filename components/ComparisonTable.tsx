import Link from "next/link";
import type { Venue } from "@/lib/types";

// A plain, server-rendered comparison table. Tables of clear facts are one of
// the most "extractable" formats for Gemini / AI Overviews — this is a GEO play
// as much as a UX one. It renders in the initial HTML so crawlers and AI models
// see every cafe's Wi-Fi / outlet status without running JavaScript.
export default function ComparisonTable({ venues, caption }: { venues: Venue[]; caption: string }) {
  return (
    <table className="compare">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th>Cafe</th>
          <th>Wi-Fi</th>
          <th>Outlets</th>
          <th>Laptop-friendly</th>
          <th>Nearest station</th>
          <th>Last checked</th>
        </tr>
      </thead>
      <tbody>
        {venues.map((v) => (
          <tr key={v.id}>
            <td><Link href={`/cafe/${v.slug}`}>{v.name}</Link></td>
            <td>{v.hasWifi ? (v.wifiType === "free" ? "Free" : "Paid") : "No"}</td>
            <td>{v.hasPower ? (v.powerDensity === "many" ? "Many" : v.powerDensity === "some" ? "Some" : "Counter") : "No"}</td>
            <td>{v.laptopFriendly ? "Yes" : "No"}</td>
            <td>{v.nearestStation}</td>
            <td>{v.lastChecked}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
