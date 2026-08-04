import type { Metadata } from "next";
import Script from "next/script";
import HeaderInner from "@/components/HeaderInner";
import SiteFooter from "@/components/SiteFooter";
import ExploreMap from "@/components/ExploreMap";
import { getAllVenues, getAllAreas, getAllStations } from "@/lib/db";
import { SITE } from "@/lib/site";
import "./globals.css";
// Self-hosted (no external request): Fredoka for the wordmark, Rubik for the UI.
import "@fontsource-variable/fredoka";
import "@fontsource-variable/rubik";

// Cloudflare Web Analytics: cookieless, privacy-friendly, lightweight. The beacon
// token is public by design (it ships in the page HTML), so it's fine to keep here
// as the default; an env var can still override it. Only sent in production builds,
// so local `npm run dev` doesn't pollute the stats.
const CF_BEACON_TOKEN =
  process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || "5d2eb2ce22434e38b4275d86ee532ad6";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Cafes with Wi-Fi & Power Outlets`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  openGraph: {
    siteName: SITE.name,
    type: "website",
    title: `${SITE.name} — Cafes with Wi-Fi & Power Outlets`,
    description: SITE.tagline,
    url: SITE.url,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${SITE.name} — Tokyo cafes with Wi-Fi & power outlets` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Cafes with Wi-Fi & Power Outlets`,
    description: SITE.tagline,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const points = getAllVenues()
    .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
    .map((v) => ({
      slug: v.slug,
      name: v.name,
      lat: v.lat as number,
      lng: v.lng as number,
      wifi: v.hasWifi,
      power: v.hasPower,
      hours: v.businessHours,
    }));
  const areaCoords = Object.fromEntries(getAllAreas().map((a) => [a.slug, { lat: a.lat, lng: a.lng }]));
  const stationCoords = Object.fromEntries(
    getAllStations()
      .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
      .map((s) => [s.slug, { lat: s.lat as number, lng: s.lng as number }])
  );

  return (
    <html lang="en">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('wc-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}try{var p=location.pathname;if(p==='/ja'||p.indexOf('/ja/')===0)document.documentElement.lang='ja';}catch(e){}`}
        </Script>
        <header className="site-header">
          {/* Decorative Tokyo skyline behind the wordmark and nav. Scales to the
              header height so the tallest towers are never cut; recolours via a
              masked orange gradient. Purely decorative. */}
          <div className="header-skyline" aria-hidden="true" />
          <HeaderInner />
        </header>
        <main className="container">{children}</main>
        <ExploreMap points={points} areas={areaCoords} stations={stationCoords} />
        <SiteFooter />
        {CF_BEACON_TOKEN && process.env.NODE_ENV === "production" && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}
