import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import ComparisonTable from "@/components/ComparisonTable";
import AreaCover from "@/components/AreaCover";
import { stationPhotoSrc, stationPhotoMeta } from "@/lib/media";
import { getAllStations, getStation, getVenuesByStation } from "@/lib/db";
import { stationListJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/schema-org";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllStations().map((s) => ({ station: s.slug }));
}

export function generateMetadata({ params }: { params: { station: string } }): Metadata {
  const s = getStation(params.station);
  if (!s) return {};
  return {
    title: `Laptop-friendly cafes near ${s.name}`,
    description: `Cafes near ${s.name} with Wi-Fi and power outlets, sorted by walking distance. Filter for Wi-Fi, outlets, or both.`,
    alternates: { canonical: `/tokyo/station/${s.slug}` },
  };
}

export default function StationPage({ params }: { params: { station: string } }) {
  const s = getStation(params.station);
  if (!s) notFound();
  const venues = getVenuesByStation(s.slug);

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Tokyo", url: "/tokyo" },
        { name: s.name, url: `/tokyo/station/${s.slug}` },
      ])} />
      <JsonLd data={stationListJsonLd(s, venues)} />

      <p className="breadcrumb"><Link href="/">Home</Link> / <Link href="/tokyo">Tokyo</Link> / {s.name}</p>
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
