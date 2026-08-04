import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import AreaCover from "@/components/AreaCover";
import { stationPhotoSrc, stationPhotoMeta } from "@/lib/media";
import { getAllStations, getStation, getVenuesByStation } from "@/lib/db";
import { breadcrumbJsonLd, JsonLd } from "@/lib/schema-org";
import { t } from "@/lib/i18n";

const d = t("ja");
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllStations().map((s) => ({ station: s.slug }));
}

export function generateMetadata({ params }: { params: { station: string } }): Metadata {
  const s = getStation(params.station);
  if (!s) return {};
  return {
    title: `${s.name}周辺の電源・Wi-Fiのあるカフェ`,
    description: `${s.name}の近くで、Wi-Fi・電源のあるカフェを徒歩圏内でご紹介します。距離が近い順に並び、条件でしぼり込めます。`,
    alternates: {
      canonical: `/ja/tokyo/station/${s.slug}`,
      languages: { en: `/tokyo/station/${s.slug}`, ja: `/ja/tokyo/station/${s.slug}`, "x-default": `/tokyo/station/${s.slug}` },
    },
    openGraph: { title: `${s.name}周辺の電源・Wi-Fiのあるカフェ`, locale: "ja_JP", url: `/ja/tokyo/station/${s.slug}` },
  };
}

export default function StationPageJa({ params }: { params: { station: string } }) {
  const s = getStation(params.station);
  if (!s) notFound();
  const venues = getVenuesByStation(s.slug);
  const m = stationPhotoMeta(s.slug);
  const lines = s.lineNames && s.lineNames.length ? `（${s.lineNames.join("、")}）` : "";

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: "/ja" },
        { name: d.page.common.tokyo, url: "/ja/tokyo" },
        { name: s.name, url: `/ja/tokyo/station/${s.slug}` },
      ])} />

      <p className="breadcrumb">
        <Link href="/ja">{d.page.common.home}</Link> / <Link href="/ja/tokyo">{d.page.common.tokyo}</Link> / {s.name}
      </p>
      {(stationPhotoSrc(s.slug) || s.photoRef) && (
        <>
          <AreaCover slug={s.slug} name={s.name} photo={stationPhotoSrc(s.slug)} photoRef={s.photoRef} banner />
          {m && <p className="page-photo-credit">写真：{m.title}</p>}
        </>
      )}
      <h1>{s.name}周辺の電源・Wi-Fiのあるカフェ</h1>
      <p className="lede">
        {s.name}{lines}から徒歩圏内で、Wi-Fi・電源のあるカフェをまとめました。距離が近い順に並んでいます。Wi-Fi・電源などの条件でしぼり込んでみてください。
      </p>

      <FilterableCafeList venues={venues} locale="ja" />
    </div>
  );
}
