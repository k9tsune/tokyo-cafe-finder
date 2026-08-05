import Link from "next/link";
import type { Venue } from "@/lib/types";
import CafeCard from "./CafeCard";
import ComparisonTable from "./ComparisonTable";
import { assignCovers } from "@/lib/cafe-image";
import { JsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";
import { t, localePath, type Locale } from "@/lib/i18n";

// Shared renderer for the feature hub pages (free-wifi / outlets / both / late).
// These are the pages that map to what people actually type into Google and
// AI search, so each gets its own H1, intro, list, table and FAQ. Locale-aware
// so /ja gets Japanese chrome and links through to Japanese cafe pages.
const UI = {
  en: { count: (n: number) => `${n} cafe${n === 1 ? "" : "s"}`, glance: "At a glance" },
  ja: { count: (n: number) => `${n}件のカフェ`, glance: "一覧" },
};

export default function FeatureHubPage({
  slug, h1, intro, venues, faq, locale = "en",
}: {
  slug: string;
  h1: string;
  intro: string;
  venues: Venue[];
  faq: { q: string; a: string }[];
  locale?: Locale;
}) {
  const d = t(locale);
  const ui = UI[locale] ?? UI.en;
  const home = localePath("/", locale);
  const tokyo = localePath("/tokyo", locale);
  const here = `${tokyo}/${slug}`;

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: home },
        { name: d.page.common.tokyo, url: tokyo },
        { name: h1, url: here },
      ])} />
      <JsonLd data={faqJsonLd(faq)} />

      <p className="breadcrumb"><Link href={home}>{d.page.common.home}</Link> / <Link href={tokyo}>{d.page.common.tokyo}</Link> / {h1}</p>
      <h1>{h1}</h1>
      <p className="lede">{intro}</p>

      <p className="count">{ui.count(venues.length)}</p>
      <div className="cafe-list">
        {(() => {
          const covers = assignCovers(venues);
          return venues.map((v, i) => <CafeCard key={v.id} v={v} cover={covers[i]} locale={locale} />);
        })()}
      </div>

      <h2>{ui.glance}</h2>
      <ComparisonTable venues={venues} caption={h1} />

      <section className="faq">
        <h2>{d.page.guides.faqHeading}</h2>
        {faq.map((f) => (
          <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
        ))}
      </section>
    </div>
  );
}
