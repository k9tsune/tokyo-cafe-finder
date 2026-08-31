import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import ComparisonTable from "@/components/ComparisonTable";
import AreaCover from "@/components/AreaCover";
import { getAllAreas, getArea, getVenuesByArea } from "@/lib/db";
import { areaPhotoSrc, areaPhotoMeta } from "@/lib/media";
import { areaListJsonLd, breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/schema-org";
import { counts, checkedLabel, FEATURES, FEATURE_META, filterByFeature, MIN_FEATURE_VENUES } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAreas().map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = getArea(params.area);
  if (!area) return {};
  const venues = getVenuesByArea(area.slug);
  const c = counts(venues);
  const checked = checkedLabel(venues, "en");
  return {
    title: `${c.total} laptop-friendly cafes in ${area.name}, Tokyo`,
    description: `${c.total} laptop-friendly cafes in ${area.name} — ${c.wifi} with Wi-Fi, ${c.power} with outlets, ${c.both} with both${c.late ? `, ${c.late} open late` : ""}. Filter by station or amenity.${checked ? ` Checked ${checked}.` : ""}`,
    alternates: {
      canonical: `/tokyo/${area.slug}`,
      languages: { en: `/tokyo/${area.slug}`, ja: `/ja/tokyo/${area.slug}`, "x-default": `/tokyo/${area.slug}` },
    },
  };
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = getArea(params.area);
  if (!area) notFound();
  const venues = getVenuesByArea(area.slug);

  const freeWifi = venues.filter((v) => v.hasWifi && v.wifiType === "free").map((v) => v.name);
  const withPower = venues.filter((v) => v.hasPower).map((v) => v.name);
  const withBoth = venues.filter((v) => v.hasWifi && v.hasPower).map((v) => v.name);
  const sample = (arr: string[]) => arr.slice(0, 5).join(", ") + (arr.length > 5 ? `, and ${arr.length - 5} more` : "");

  const faq = [
    {
      q: `How many cafes in ${area.name} have free Wi-Fi?`,
      a: freeWifi.length ? `${freeWifi.length} listed cafes in ${area.name} have free Wi-Fi, including ${sample(freeWifi)}. Use the Wi-Fi filter above to see them all.` : `No listed cafes in ${area.name} currently have free Wi-Fi.`,
    },
    {
      q: `How many cafes in ${area.name} have power outlets?`,
      a: withPower.length ? `${withPower.length} listed cafes in ${area.name} have power outlets, including ${sample(withPower)}. Filter for outlets above for the full list.` : `No listed cafes in ${area.name} currently have outlets.`,
    },
    {
      q: `Where can I get both Wi-Fi and outlets in ${area.name}?`,
      a: withBoth.length ? `${withBoth.length} cafes in ${area.name} have both Wi-Fi and power outlets, including ${sample(withBoth)}.` : `No listed cafes in ${area.name} currently have both.`,
    },
  ];

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Tokyo", url: "/tokyo" },
        { name: area.name, url: `/tokyo/${area.slug}` },
      ])} />
      <JsonLd data={areaListJsonLd(area, venues)} />
      <JsonLd data={faqJsonLd(faq)} />

      <p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/tokyo">Tokyo</Link> / {area.name}</p>
      {(areaPhotoSrc(area.slug) || area.photoRef) && (
        <>
          <AreaCover slug={area.slug} name={area.name} photo={areaPhotoSrc(area.slug)} photoRef={area.photoRef} banner />
          {(() => {
            const m = areaPhotoMeta(area.slug);
            if (m) return <p className="page-photo-credit">Photo: {m.title} by {m.author}, {m.license}</p>;
            if (area.photoAttr) return <p className="page-photo-credit">Photo: {area.photoAttr} · via Google</p>;
            return null;
          })()}
        </>
      )}
      <h1>Cafes with Wi-Fi &amp; power outlets in {area.name}</h1>
      <p className="lede">{area.introText}</p>

      {(() => {
        // Links to the ward x feature pages that actually exist (>= MIN_FEATURE_VENUES).
        // Doubles as internal linking so Google can reach and prioritise them.
        const avail = FEATURES.map((f) => ({ f, n: filterByFeature(venues, f).length })).filter((x) => x.n >= MIN_FEATURE_VENUES);
        if (!avail.length) return null;
        return (
          <div className="card-grid" style={{ margin: "16px 0" }}>
            {avail.map(({ f, n }) => (
              <Link key={f} href={`/tokyo/${area.slug}/${f}`} prefetch={false}>
                <strong>{FEATURE_META[f].en.label} in {area.name}</strong>
                <div className="muted" style={{ fontSize: ".82rem" }}>{n} cafes</div>
              </Link>
            ))}
          </div>
        );
      })()}

      <FilterableCafeList venues={venues} />

      <h2>{area.name} cafes at a glance</h2>
      <ComparisonTable venues={venues} caption={`Wi-Fi and power outlets at cafes in ${area.name}, Tokyo (last checked dates shown)`} />

      <section className="faq">
        <h2>Frequently asked questions</h2>
        {faq.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
