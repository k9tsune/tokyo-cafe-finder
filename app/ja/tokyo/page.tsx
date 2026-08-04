import Link from "next/link";
import type { Metadata } from "next";
import HomeSearch from "@/components/HomeSearch";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAllAreas, getAllStations, getAllDestinations } from "@/lib/db";
import { t } from "@/lib/i18n";
import { wardNameJa } from "@/lib/ward-ja";
import { stationNameJa } from "@/lib/station-ja";

const d = t("ja");

export const metadata: Metadata = {
  title: d.page.hub.metaTitle,
  description: d.page.hub.metaDescription,
  alternates: {
    canonical: "/ja/tokyo",
    languages: { en: "/tokyo", ja: "/ja/tokyo", "x-default": "/tokyo" },
  },
  openGraph: { title: d.page.hub.metaTitle, description: d.page.hub.metaDescription, locale: "ja_JP", url: "/ja/tokyo" },
};

export default function TokyoHubJa() {
  const areas = getAllAreas();
  const stations = getAllStations();
  const destinations = getAllDestinations();
  return (
    <div>
      <p className="breadcrumb"><Link href="/ja">{d.page.common.home}</Link> / {d.page.common.tokyo}</p>
      <h1>{d.page.hub.h1}</h1>

      <HomeSearch destinations={destinations} locale="ja" />

      <h2>{d.page.hub.areas}</h2>
      <div className="card-grid">
        {areas.map((a) => (
          <Link key={a.slug} href={`/ja/tokyo/${a.slug}`} className="has-cover">
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
          <Link key={s.slug} href={`/ja/tokyo/station/${s.slug}`}><strong>{stationNameJa(s.name)}</strong></Link>
        ))}
      </div>
    </div>
  );
}
