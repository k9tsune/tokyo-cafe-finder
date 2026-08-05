import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FilterableCafeList from "@/components/FilterableCafeList";
import AreaCover from "@/components/AreaCover";
import { getAllAreas, getArea, getVenuesByArea } from "@/lib/db";
import { areaPhotoSrc, areaPhotoMeta } from "@/lib/media";
import { breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/schema-org";
import { t } from "@/lib/i18n";
import { wardNameJa, wardIntroJa } from "@/lib/ward-ja";

const d = t("ja");
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllAreas().map((a) => ({ area: a.slug }));
}

export function generateMetadata({ params }: { params: { area: string } }): Metadata {
  const area = getArea(params.area);
  if (!area) return {};
  const name = wardNameJa(area.slug, area.name);
  return {
    title: d.page.area.metaTitle(name),
    description: `${name}で作業できるカフェ${getVenuesByArea(area.slug).length}件。Wi-Fi・電源などの条件でしぼり込めます。確認日つきで、いつでも最新の情報を確認できます。`,
    alternates: {
      canonical: `/ja/tokyo/${area.slug}`,
      languages: { en: `/tokyo/${area.slug}`, ja: `/ja/tokyo/${area.slug}`, "x-default": `/tokyo/${area.slug}` },
    },
    openGraph: { title: d.page.area.metaTitle(name), description: d.page.area.metaDescription(name), locale: "ja_JP", url: `/ja/tokyo/${area.slug}` },
  };
}

export default function AreaPageJa({ params }: { params: { area: string } }) {
  const area = getArea(params.area);
  if (!area) notFound();
  const name = wardNameJa(area.slug, area.name);
  const venues = getVenuesByArea(area.slug);
  const nm = (list: typeof venues) => list.map((v) => v.nameJa || v.name);

  const freeWifi = nm(venues.filter((v) => v.hasWifi && v.wifiType === "free"));
  const withPower = nm(venues.filter((v) => v.hasPower));
  const withBoth = nm(venues.filter((v) => v.hasWifi && v.hasPower));
  const sample = (arr: string[]) => arr.slice(0, 5).join("、") + (arr.length > 5 ? `ほか${arr.length - 5}件` : "");

  const faq = [
    {
      q: `${name}で無料Wi-Fiが使えるカフェは何件ありますか？`,
      a: freeWifi.length ? `${name}では${freeWifi.length}件が無料Wi-Fiに対応しています（${sample(freeWifi)}など）。上の絞り込みからすべて確認できます。` : `現在、${name}で無料Wi-Fi対応のカフェはありません。`,
    },
    {
      q: `${name}で電源（コンセント）が使えるカフェは何件ありますか？`,
      a: withPower.length ? `${name}では${withPower.length}件で電源が使えます（${sample(withPower)}など）。上の「電源」で絞り込めます。` : `現在、${name}で掲載中の電源のあるカフェはありません。`,
    },
    {
      q: `${name}でWi-Fiと電源の両方が使えるカフェは？`,
      a: withBoth.length ? `${name}では${withBoth.length}件でWi-Fiと電源の両方が使えます（${sample(withBoth)}など）。` : `現在、${name}で両方がそろうカフェはありません。`,
    },
  ];

  const m = areaPhotoMeta(area.slug);

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: "/ja" },
        { name: d.page.common.tokyo, url: "/ja/tokyo" },
        { name, url: `/ja/tokyo/${area.slug}` },
      ])} />
      <JsonLd data={faqJsonLd(faq)} />

      <p className="breadcrumb">
        <Link href="/ja">{d.page.common.home}</Link> / <Link href="/ja/tokyo">{d.page.common.tokyo}</Link> / {name}
      </p>
      {(areaPhotoSrc(area.slug) || area.photoRef) && (
        <>
          <AreaCover slug={area.slug} name={name} photo={areaPhotoSrc(area.slug)} photoRef={area.photoRef} banner />
          {m && <p className="page-photo-credit">写真：{m.title}（{m.author}）</p>}
        </>
      )}
      <h1>{d.page.area.h1(name)}</h1>
      <p className="lede">{wardIntroJa(area.slug, name)}</p>

      <FilterableCafeList venues={venues} locale="ja" />
    </div>
  );
}
