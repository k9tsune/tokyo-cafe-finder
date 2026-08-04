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
    description: d.page.area.metaDescription(name),
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

  const withWifi = nm(venues.filter((v) => v.hasWifi));
  const withPower = nm(venues.filter((v) => v.hasPower));
  const withBoth = nm(venues.filter((v) => v.hasWifi && v.hasPower));

  const faq = [
    {
      q: `${name}でWi-Fiが使えるカフェはどこですか？`,
      a: withWifi.length ? `${withWifi.join("、")}でWi-Fiが利用できます。` : `現在、${name}で掲載中のWi-Fi対応カフェはありません。`,
    },
    {
      q: `${name}で電源（コンセント）が使えるカフェはどこですか？`,
      a: withPower.length ? `${withPower.join("、")}で電源が利用できます。` : `現在、${name}で掲載中の電源のあるカフェはありません。`,
    },
    {
      q: `${name}でWi-Fiと電源の両方が使えるカフェはどこですか？`,
      a: withBoth.length ? `${withBoth.join("、")}でWi-Fiと電源の両方が使えます。` : `現在、${name}で両方がそろうカフェはありません。`,
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
