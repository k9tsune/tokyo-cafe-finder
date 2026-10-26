import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeSearch from "@/components/HomeSearch";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAreasByCity, getStationsByCity, getAllDestinations, getPopulatedCities } from "@/lib/db";
import { t } from "@/lib/i18n";
import { wardNameJa } from "@/lib/ward-ja";
import { stationNameJa } from "@/lib/station-ja";
import { getCity, DEFAULT_CITY, type City } from "@/lib/cities";

const d = t("ja");

export const dynamicParams = false;

export function generateStaticParams() {
  // Only cities that actually have cafes. A city page with no venues is a
  // thin page, so Osaka simply does not exist as a route until its data lands.
  return getPopulatedCities().map((city) => ({ city }));
}

// Tokyo keeps its hand-written Japanese copy verbatim (it is the flagship and
// its wording is tuned for 東京23区); other cities get the same sentences with
// the city name swapped in, so nothing reads as machine-filled boilerplate.
function copy(c: City) {
  if (c.slug === DEFAULT_CITY) {
    return { metaTitle: d.page.hub.metaTitle, metaDescription: d.page.hub.metaDescription, h1: d.page.hub.h1 };
  }
  return {
    metaTitle: `電源・Wi-Fiのある${c.nameJa}のカフェ｜エリア・駅から探す`,
    metaDescription: `${c.nameJa}のエリアや駅から、Wi-Fi・電源のあるカフェを探せます。ノートパソコンでの作業にぴったりのお店を、確認日つきでご紹介します。`,
    h1: `電源・Wi‑Fiのある${c.nameJa}のカフェ`,
  };
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const c = getCity(params.city);
  if (!c) return {};
  const m = copy(c);
  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: `/ja/${c.slug}`,
      languages: { en: `/${c.slug}`, ja: `/ja/${c.slug}`, "x-default": `/${c.slug}` },
    },
    openGraph: { title: m.metaTitle, description: m.metaDescription, locale: "ja_JP", url: `/ja/${c.slug}` },
  };
}

export default function CityHubJa({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const m = copy(c);
  const areas = getAreasByCity(c.slug);
  const stations = getStationsByCity(c.slug);
  const destinations = getAllDestinations();
  return (
    <div>
      <p className="breadcrumb"><Link href="/ja">{d.page.common.home}</Link> / {c.nameJa}</p>
      <h1>{m.h1}</h1>

      <HomeSearch destinations={destinations} locale="ja" />

      <h2>{d.page.hub.areas}</h2>
      <div className="card-grid">
        {areas.map((a) => (
          <Link key={a.slug} href={`/ja/${c.slug}/${a.slug}`} className="has-cover" prefetch={false}>
            <AreaCover slug={a.slug} name={a.name} photo={areaPhotoSrc(a.slug)} photoRef={a.photoRef} />
            <div className="cover-text">
              <strong>{wardNameJa(a.slug, a.name)}</strong>
              <div className="muted" style={{ fontSize: ".82rem" }}>{d.page.hub.cardSub}</div>
            </div>
          </Link>
        ))}
      </div>

      <h2>{d.page.hub.byStation}</h2>
      <div className="card-grid">
        {stations.map((s) => (
          <Link key={s.slug} href={`/ja/${c.slug}/station/${s.slug}`} prefetch={false}><strong>{stationNameJa(s.name)}</strong></Link>
        ))}
      </div>
    </div>
  );
}
