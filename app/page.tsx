import Link from "next/link";
import type { Metadata } from "next";
import HomeSearch from "@/components/HomeSearch";
import NearMeButton from "@/components/NearMeButton";
import AreaCover from "@/components/AreaCover";
import { areaPhotoSrc } from "@/lib/media";
import { getAllDestinations, getAllAreas, getAllVenues } from "@/lib/db";
import { SITE } from "@/lib/site";

export function generateMetadata(): Metadata {
  const n = getAllVenues().length;
  return {
    title: "WorkingCafes — Tokyo cafes with Wi-Fi & power outlets",
    description: `${n} Tokyo cafes with Wi-Fi and power outlets across all 23 wards — dated so you know they're current. Search a station, or find what's nearest right now.`,
    alternates: { canonical: "/", languages: { en: "/", ja: "/ja", "x-default": "/" } },
  };
}

export default function HomePage() {
  const destinations = getAllDestinations();
  const areas = getAllAreas();

  return (
    <div>
      <section className="hero">
        <h1>Tokyo cafes with <span className="nowrap">Wi-Fi</span> &amp; power outlets</h1>
        <p className="lede">
          Cafes with Wi-Fi and power outlets across all 23 wards. Every listing dated so you
          know it&apos;s current. Search a station, or find what&apos;s nearest right now.
        </p>

        <HomeSearch destinations={destinations} />
        <div className="hero-actions">
          <NearMeButton charge />
          <NearMeButton />
        </div>
      </section>

      <h2>Browse areas</h2>
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

      <h2>Popular searches</h2>
      <div className="card-grid">
        <Link href="/tokyo/free-wifi-cafes">
          <strong>Free Wi-Fi cafes</strong>
          <div className="muted" style={{ fontSize: ".82rem" }}>Get online without spending much</div>
        </Link>
        <Link href="/tokyo/cafes-with-power-outlets">
          <strong>Cafes with power outlets</strong>
          <div className="muted" style={{ fontSize: ".82rem" }}>Keep your laptop and phone charged</div>
        </Link>
        <Link href="/tokyo/cafes-with-wifi-and-power">
          <strong>Wi-Fi + outlets (work cafes)</strong>
          <div className="muted" style={{ fontSize: ".82rem" }}>The full setup for a real work session</div>
        </Link>
      </div>

      <h2>About {SITE.name}</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          alignItems: "flex-start",
          marginTop: "4px",
        }}
      >
        <figure style={{ margin: 0, flex: "none", width: "min(220px, 46vw)" }}>
          <img
            src="/about.jpg"
            alt="The site's author working from a cafe"
            width={800}
            height={1200}
            loading="lazy"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow)",
            }}
          />
          <figcaption
            style={{
              marginTop: "8px",
              fontSize: ".8rem",
              color: "var(--muted)",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            at the infamous train-track cafe in Vietnam
          </figcaption>
        </figure>
        <div style={{ flex: 1, minWidth: "260px" }}>
          <p className="about-blurb" style={{ marginTop: 0 }}>
            An independent guide to working from cafes in Tokyo. As a freelance worker in Tokyo, I
            always found it frustrating to find places to work, so I made this site to help myself and
            anyone with the same problem. Each listing checks three things: is there Wi-Fi, are there
            outlets, and can you use a laptop there. The site also re-checks listings regularly to make
            sure the information stays right.
          </p>
          <p
            style={{
              margin: "16px 0 0",
              padding: "12px 16px",
              background: "var(--accent-soft)",
              border: "1px solid color-mix(in srgb, var(--accent) 32%, transparent)",
              borderRadius: "var(--radius-sm)",
              fontSize: ".9rem",
              lineHeight: 1.6,
              color: "var(--fg)",
              maxWidth: "66ch",
            }}
          >
            <strong style={{ color: "var(--accent-strong)" }}>A quick safety tip:</strong> public cafe
            Wi-Fi is convenient, but it&apos;s usually open and shared, so it&apos;s worth using a VPN to
            keep your browsing private — especially for logins, banking, or anything work-related.
          </p>
        </div>
      </div>
    </div>
  );
}
