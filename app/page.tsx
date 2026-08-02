import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";
import NearMeButton from "@/components/NearMeButton";
import { getAllDestinations, getAllAreas } from "@/lib/db";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const destinations = getAllDestinations();
  const areas = getAllAreas();

  return (
    <div>
      <section className="hero">
        <h1>Charge up or get work done — Tokyo cafes with Wi-Fi &amp; power outlets</h1>
        <p className="lede">
          Every cafe checked and dated, across all 23 wards. Search a station, or find what&apos;s
          nearest right now.
        </p>

        <HomeSearch destinations={destinations} />
        <div className="hero-actions">
          <NearMeButton charge label="🔋 Phone dying? Nearest outlet →" />
          <NearMeButton />
        </div>
      </section>

      <h2>Browse areas</h2>
      <div className="card-grid">
        {areas.map((a) => (
          <Link key={a.slug} href={`/tokyo/${a.slug}`}>
            <strong>{a.name}</strong>
            <div className="muted" style={{ fontSize: ".82rem" }}>Cafes with Wi-Fi &amp; outlets</div>
          </Link>
        ))}
      </div>

      <h2>Popular searches</h2>
      <div className="card-grid">
        <Link href="/tokyo/free-wifi-cafes"><strong>Free Wi-Fi cafes</strong></Link>
        <Link href="/tokyo/cafes-with-power-outlets"><strong>Cafes with power outlets</strong></Link>
        <Link href="/tokyo/cafes-with-wifi-and-power"><strong>Wi-Fi + outlets (work cafes)</strong></Link>
      </div>

      <h2>About {SITE.name}</h2>
      <p className="muted">
        An independent, English-first guide to working from cafes in Tokyo. We focus on the
        details travelers and remote workers actually need — is there Wi-Fi, are there outlets,
        and can you comfortably open a laptop — and we re-check listings regularly so the answer
        stays right.
      </p>
    </div>
  );
}
