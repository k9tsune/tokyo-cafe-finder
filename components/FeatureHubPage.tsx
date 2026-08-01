import Link from "next/link";
import type { Venue } from "@/lib/types";
import CafeCard from "./CafeCard";
import ComparisonTable from "./ComparisonTable";
import { JsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

// Shared renderer for the feature hub pages (free-wifi / outlets / both).
// These are the pages that map to what people actually type into Google and
// AI search, so each gets its own H1, intro, list, table and FAQ.
export default function FeatureHubPage({
  slug, h1, intro, venues, faq,
}: {
  slug: string;
  h1: string;
  intro: string;
  venues: Venue[];
  faq: { q: string; a: string }[];
}) {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Tokyo", url: "/tokyo" },
        { name: h1, url: `/tokyo/${slug}` },
      ])} />
      <JsonLd data={faqJsonLd(faq)} />

      <p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/tokyo">Tokyo</Link> / {h1}</p>
      <h1>{h1}</h1>
      <p className="lede">{intro}</p>

      <p className="count">{venues.length} cafe{venues.length === 1 ? "" : "s"}</p>
      <div className="cafe-list">
        {venues.map((v) => <CafeCard key={v.id} v={v} />)}
      </div>

      <div className="ad-slot">ad slot (enabled after indexing — see plan §9)</div>

      <h2>At a glance</h2>
      <ComparisonTable venues={venues} caption={h1} />

      <section className="faq">
        <h2>Frequently asked questions</h2>
        {faq.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </section>
    </div>
  );
}
