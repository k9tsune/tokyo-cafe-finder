import type { Metadata } from "next";
import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import NearMeButton from "@/components/NearMeButton";
import AreaCover from "@/components/AreaCover";
import { Doodle, DoodleStrip } from "@/components/Doodles";
import { areaPhotoSrc } from "@/lib/media";
import { getAllDestinations, getAllAreas } from "@/lib/db";
import { SITE } from "@/lib/site";

// TEST PAGE — a doodle-decorated variant of the homepage for the user to review.
// Not indexed and not linked from the site; safe to iterate on.
export const metadata: Metadata = {
  title: "Doodle homepage (test)",
  robots: { index: false, follow: false },
};

export default function TestHomePage() {
  const destinations = getAllDestinations();
  const areas = getAllAreas();

  return (
    <div>
      <DoodleStrip />

      <section className="hero">
        <h1>Tokyo cafes with Wi-Fi &amp; power outlets</h1>
        <p className="lede">
          Every cafe checked and dated, across all 23 wards. Search a station, or find what&apos;s
          nearest right now.
        </p>

        <HomeSearch destinations={destinations} />
        <div className="hero-actions">
          <NearMeButton charge />
          <NearMeButton />
        </div>
      </section>

      <h2><Doodle name="torii" size={24} className="h2-doodle" />Browse areas</h2>
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

      <h2><Doodle name="cup" size={24} className="h2-doodle" />Popular searches</h2>
      <div className="card-grid">
        <Link href="/tokyo/free-wifi-cafes"><strong>Free Wi-Fi cafes</strong></Link>
        <Link href="/tokyo/cafes-with-power-outlets"><strong>Cafes with power outlets</strong></Link>
        <Link href="/tokyo/cafes-with-wifi-and-power"><strong>Wi-Fi + outlets (work cafes)</strong></Link>
      </div>

      <h2><Doodle name="sakura" size={24} className="h2-doodle" />About {SITE.name}</h2>
      <p className="muted">
        An independent guide to working from cafes in Tokyo. As a freelance worker in Tokyo, I
        always found it frustrating to find places to work, so I made this site to help myself and
        anyone with the same problem. Each listing checks three things: is there Wi-Fi, are there
        outlets, and can you use a laptop there. The site also re-checks listings regularly to make
        sure the information stays right.
      </p>
    </div>
  );
}
