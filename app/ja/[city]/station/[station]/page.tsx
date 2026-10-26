import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import AreaCover from "@/components/AreaCover";
import { stationPhotoSrc, stationPhotoMeta } from "@/lib/media";
import { getAllStations, getStation, getVenuesByStation, cityOfArea } from "@/lib/db";
import { getCity } from "@/lib/cities";
import { breadcrumbJsonLd, JsonLd } from "@/lib/schema-org";
import { t } from "@/lib/i18n";
import { stationNameJa, lineNameJa } from "@/lib/station-ja";
import { counts, checkedLabel } from "@/lib/seo";

const d = t("ja");
export const dynamicParams = false;

export function generateStaticParams() {
  // A station belongs to the city of its ward.
  return getAllStations().map((s) => ({ city: cityOfArea(s.areaSlug), station: s.slug }));
}

export function generateMetadata({ params }: { params: { city: string; station: string } }): Metadata {
  const cty = getCity(params.city);
  const s = getStation(params.station);
  if (!cty || !s || cityOfArea(s.areaSlug) !== cty.slug) return {};
  const nm = stationNameJa(s.name);
  const venues = getVenuesByStation(s.slug);
  const c = counts(venues);
  const nearest = venues.length ? Math.min(...venues.map((v) => v.walkMinutes)) : 0;
  const checked = checkedLabel(venues, "ja");
  return {
    title: `${nm}周辺で作業できるカフェ${c.total}件`,
    description: `${nm}周辺のカフェ${c.total}件。Wi-Fiと電源の両方がそろうお店${c.both}件${nearest > 0 ? `、最短で徒歩${nearest}分` : ""}。近い順に並び、条件でしぼり込めます。${checked ? `${checked}確認。` : ""}`,
    alternates: {
      canonical: `/ja/${cty.slug}/station/${s.slug}`,
      languages: { en: `/${cty.slug}/station/${s.slug}`, ja: `/ja/${cty.slug}/station/${s.slug}`, "x-default": `/${cty.slug}/station/${s.slug}` },
    },
    openGraph: { title: `${nm}周辺で作業できるカフェ${c.total}件`, locale: "ja_JP", url: `/ja/${cty.slug}/station/${s.slug}` },
  };
}

export default function StationPageJa({ params }: { params: { city: string; station: string } }) {
  const cty = getCity(params.city);
  const s = getStation(params.station);
  if (!cty || !s || cityOfArea(s.areaSlug) !== cty.slug) notFound();
  const venues = getVenuesByStation(s.slug);
  const m = stationPhotoMeta(s.slug);
  const nm = stationNameJa(s.name);
  const lines = s.lineNames && s.lineNames.length ? `（${s.lineNames.map(lineNameJa).join("、")}）` : "";

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: "/ja" },
        { name: cty.nameJa, url: `/ja/${cty.slug}` },
        { name: nm, url: `/ja/${cty.slug}/station/${s.slug}` },
      ])} />

      <p className="breadcrumb">
        <Link href="/ja">{d.page.common.home}</Link> / <Link href={`/ja/${cty.slug}`}>{cty.nameJa}</Link> / {nm}
      </p>
      {(stationPhotoSrc(s.slug) || s.photoRef) && (
        <>
          <AreaCover slug={s.slug} name={nm} photo={stationPhotoSrc(s.slug)} photoRef={s.photoRef} banner />
          {m && <p className="page-photo-credit">写真：{m.title}</p>}
        </>
      )}
      <h1>{nm}周辺の電源・Wi-Fiのあるカフェ</h1>
      <p className="lede">
        {nm}{lines}から徒歩圏内で、Wi-Fi・電源のあるカフェをまとめました。距離が近い順に並んでいます。Wi-Fi・電源などの条件でしぼり込んでみてください。
      </p>

      <FilterableCafeList venues={venues} locale="ja" />
    </div>
  );
}
