import Link from "next/link";
import type { Metadata } from "next";
import HomeSearch from "@/components/HomeSearch";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAllAreas, getAllStations, getAllDestinations } from "@/lib/db";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tokyo cafes with Wi-Fi & power outlets",
  description:
    "Browse Tokyo areas and stations to find cafes with Wi-Fi, power outlets, or both — laptop-friendly spots, checked and dated.",
  alternates: { canonical: "/tokyo", languages: { en: "/tokyo", ja: "/ja/tokyo", "x-default": "/tokyo" } },
};

export default function TokyoHub() {
  const areas = getAllAreas();
  const stations = getAllStations();
  const destinations = getAllDestinations();
  return (
    <div>
      <p className="breadcrumb"><Link href="/">Home</Link> / Tokyo</p>
      <h1>Cafes with Wi-Fi &amp; power outlets in Tokyo</h1>

      <HomeSearch destinations={destinations} />

      <h2>Areas</h2>
      <div className="card-grid">
        {areas.map((a) => (
          <Link key={a.slug} href={`/tokyo/${a.slug}`} className="has-cover">
            <AreaCover slug={a.slug} name={a.name} photo={areaPhotoSrc(a.slug)} photoRef={a.photoRef} />
            <div className="cover-text">
              <strong>{a.name}</strong>
              <div className="muted" style={{ fontSize: ".82rem" }}>Cafes with Wi-Fi &amp; outlets</div>
            </div>
          </Link>
        ))}
      </div>

      <h2>By station</h2>
      <div className="card-grid">
        {stations.map((s) => (
          <Link key={s.slug} href={`/tokyo/station/${s.slug}`}><strong>{s.name}</strong></Link>
        ))}
      </div>

      <h2>By feature</h2>
      <div className="card-grid">
        <Link href="/tokyo/free-wifi-cafes"><strong>Free Wi-Fi cafes</strong></Link>
        <Link href="/tokyo/cafes-with-power-outlets"><strong>Cafes with outlets</strong></Link>
        <Link href="/tokyo/cafes-with-wifi-and-power"><strong>Wi-Fi + outlets</strong></Link>
      </div>
    </div>
  );
}
