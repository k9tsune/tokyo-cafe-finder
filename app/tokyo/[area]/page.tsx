import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import ComparisonTable from "@/components/ComparisonTable";
import AreaCover from "@/components/AreaCover";
import { getAllAreas, getArea, getVenuesByArea } from "@/lib/db";
import { areaPhotoSrc, areaPhotoMeta } from "@/lib/media";
import { areaListJsonLd, breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/schema-org";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAreas().map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = getArea(params.area);
  if (!area) return {};
  return {
    title: `Cafes with Wi-Fi & power outlets in ${area.name}, Tokyo`,
    description: `Laptop-friendly cafes in ${area.name}: filter for Wi-Fi, power outlets, or both. Checked and dated so the details stay current.`,
    alternates: { canonical: `/tokyo/${area.slug}` },
  };
}

export default function AreaPage({ params }: { params: { area: string } }) {
  const area = getArea(params.area);
  if (!area) notFound();
  const venues = getVenuesByArea(area.slug);

  const withWifi = venues.filter((v) => v.hasWifi).map((v) => v.name);
  const withPower = venues.filter((v) => v.hasPower).map((v) => v.name);
  const withBoth = venues.filter((v) => v.hasWifi && v.hasPower).map((v) => v.name);

  const faq = [
    {
      q: `Which cafes in ${area.name} have free Wi-Fi?`,
      a: withWifi.length ? `${withWifi.join(", ")} offer Wi-Fi in ${area.name}.` : `No listed cafes in ${area.name} currently offer Wi-Fi.`,
    },
    {
      q: `Which cafes in ${area.name} have power outlets?`,
      a: withPower.length ? `${withPower.join(", ")} have power outlets in ${area.name}.` : `No listed cafes in ${area.name} currently have outlets.`,
    },
    {
      q: `Where can I both get Wi-Fi and charge my laptop in ${area.name}?`,
      a: withBoth.length ? `${withBoth.join(", ")} have both Wi-Fi and power outlets.` : `No listed cafes in ${area.name} currently have both.`,
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
