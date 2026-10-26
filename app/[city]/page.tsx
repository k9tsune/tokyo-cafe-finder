import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeSearch from "@/components/HomeSearch";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAreasByCity, getStationsByCity, getAllDestinations, getPopulatedCities } from "@/lib/db";
import { getCity } from "@/lib/cities";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only cities that actually have cafes. A city page with no venues is a
  // thin page, so Osaka simply does not exist as a route until its data lands.
  return getPopulatedCities().map((city) => ({ city }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const c = getCity(params.city);
  if (!c) return {};
  return {
    title: `${c.name} cafes with Wi-Fi & power outlets`,
    description: `Browse ${c.name} areas and stations to find cafes with Wi-Fi, power outlets, or both — laptop-friendly spots, checked and dated.`,
    alternates: {
      canonical: `/${c.slug}`,
      languages: { en: `/${c.slug}`, ja: `/ja/${c.slug}`, "x-default": `/${c.slug}` },
    },
  };
}

export default function CityHub({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const areas = getAreasByCity(c.slug);
  const stations = getStationsByCity(c.slug);
  const destinations = getAllDestinations();
  return (
    <div>
      <p className="breadcrumb"><Link href="/">Home</Link> / {c.name}</p>
      <h1>Cafes with Wi-Fi &amp; power outlets in {c.name}</h1>

      <HomeSearch destinations={destinations} />

      <h2>Areas</h2>
      <div className="card-grid">
        {areas.map((a) => (
          <Link key={a.slug} href={`/${c.slug}/${a.slug}`} className="has-cover" prefetch={false}>
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
          <Link key={s.slug} href={`/${c.slug}/station/${s.slug}`} prefetch={false}><strong>{s.name}</strong></Link>
        ))}
      </div>

      <h2>By feature</h2>
      <div className="card-grid">
        <Link href={`/${c.slug}/free-wifi-cafes`}><strong>Free Wi-Fi cafes</strong></Link>
        <Link href={`/${c.slug}/cafes-with-power-outlets`}><strong>Cafes with outlets</strong></Link>
        <Link href={`/${c.slug}/cafes-with-wifi-and-power`}><strong>Wi-Fi + outlets</strong></Link>
      </div>
    </div>
  );
}
