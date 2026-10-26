import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import ComparisonTable from "@/components/ComparisonTable";
import AreaCover from "@/components/AreaCover";
import { stationPhotoSrc, stationPhotoMeta } from "@/lib/media";
import { getAllStations, getStation, getVenuesByStation, cityOfArea } from "@/lib/db";
import { getCity } from "@/lib/cities";
import { stationListJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/schema-org";
import { counts, checkedLabel } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  // A station belongs to the city of its ward.
  return getAllStations().map((s) => ({ city: cityOfArea(s.areaSlug), station: s.slug }));
}

export function generateMetadata({ params }: { params: { city: string; station: string } }): Metadata {
  const cty = getCity(params.city);
  const s = getStation(params.station);
  if (!cty || !s || cityOfArea(s.areaSlug) !== cty.slug) return {};
  const venues = getVenuesByStation(s.slug);
  const c = counts(venues);
  const nearest = venues.length ? Math.min(...venues.map((v) => v.walkMinutes)) : 0;
  const checked = checkedLabel(venues, "en");
  return {
    title: `${c.total} laptop-friendly cafes near ${s.name}`,
    description: `${c.both} with both Wi-Fi and power outlets${nearest > 0 ? `, closest ${nearest} min walk` : ""}. Sorted by distance from ${s.name}.${checked ? ` Checked ${checked}.` : ""}`,
    alternates: {
      canonical: `/${cty.slug}/station/${s.slug}`,
      languages: { en: `/${cty.slug}/station/${s.slug}`, ja: `/ja/${cty.slug}/station/${s.slug}`, "x-default": `/${cty.slug}/station/${s.slug}` },
    },
  };
}

export default function StationPage({ params }: { params: { city: string; station: string } }) {
  const cty = getCity(params.city);
  const s = getStation(params.station);
  if (!cty || !s || cityOfArea(s.areaSlug) !== cty.slug) notFound();
  const venues = getVenuesByStation(s.slug);

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: cty.name, url: `/${cty.slug}` },
        { name: s.name, url: `/${cty.slug}/station/${s.slug}` },
      ])} />
      <JsonLd data={stationListJsonLd(s, venues)} />

      <p className="breadcrumb"><Link href="/">Home</Link> / <Link href={`/${cty.slug}`}>{cty.name}</Link> / {s.name}</p>
      {(stationPhotoSrc(s.slug) || s.photoRef) && (
        <>
          <AreaCover slug={s.slug} name={s.name} photo={stationPhotoSrc(s.slug)} photoRef={s.photoRef} banner />
          {(() => {
            const m = stationPhotoMeta(s.slug);
            if (m) return <p className="page-photo-credit">{m.title}</p>;
            if (s.photoAttr) return <p className="page-photo-credit">Photo: {s.photoAttr} · via Google</p>;
            return null;
          })()}
        </>
      )}
      <h1>Laptop-friendly cafes near {s.name}</h1>
      <p className="lede">
        Cafes within a short walk of {s.name} ({s.lineNames.join(", ")}), sorted by distance.
        Filter for Wi-Fi, power outlets, or both.
      </p>

      <FilterableCafeList venues={venues} />

      <h2>Cafes near {s.name} at a glance</h2>
      <ComparisonTable venues={venues} caption={`Wi-Fi and power outlets near ${s.name}`} />
    </div>
  );
}
