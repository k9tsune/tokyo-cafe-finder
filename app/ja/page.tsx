import Link from "next/link";
import type { Metadata } from "next";
import HomeSearch from "@/components/HomeSearch";
import NearMeButton from "@/components/NearMeButton";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAllDestinations, getAllAreas } from "@/lib/db";
import { t } from "@/lib/i18n";
import { wardNameJa } from "@/lib/ward-ja";

const d = t("ja");

export const metadata: Metadata = {
  title: d.page.home.metaTitle,
  description: d.page.home.metaDescription,
  alternates: {
    canonical: "/ja",
    languages: { en: "/", ja: "/ja", "x-default": "/" },
  },
  openGraph: { title: d.page.home.metaTitle, description: d.page.home.metaDescription, locale: "ja_JP", url: "/ja" },
};

export default function HomePageJa() {
  const destinations = getAllDestinations();
  const areas = getAllAreas();

  return (
    <div>
      <section className="hero">
        <h1>{d.page.home.h1}</h1>
        <p className="lede">{d.page.home.lede}</p>

        <HomeSearch destinations={destinations} locale="ja" />
        <div className="hero-actions">
          <NearMeButton charge label={d.near.charge} />
          <NearMeButton label={d.near.normal} />
        </div>
      </section>

      <h2>{d.page.home.browseAreas}</h2>
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

      <p style={{ marginTop: "8px" }}>
        <Link href="/ja/tokyo">{d.page.hub.h1} — {d.page.hub.areas}・{d.page.hub.byStation} →</Link>
      </p>
    </div>
  );
}
