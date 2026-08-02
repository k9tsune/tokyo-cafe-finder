import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Cafes with Wi-Fi & Power Outlets`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  openGraph: { siteName: SITE.name, type: "website" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label={`${SITE.name} — home`}>
            <svg className="brand-mark" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false" fill="none">
              {/* Coffee cup whose handle becomes a power cord + plug — "cafe + charging" */}
              <path fill="currentColor" d="M3.6 6.8h8.8a.6.6 0 0 1 .6.6v2.4c0 3.9-2.2 6.9-4.9 6.9S3.2 13.7 3.2 9.8V7.4A.6.6 0 0 1 3.6 6.8Z" />
              <rect fill="currentColor" x="4.9" y="17" width="6" height="1.6" rx=".8" />
              <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M13.2 8c4.1-.7 5.7 2.7 3.8 4.9-1 1.1-2.1 1-2.2 2.4v1.3" />
              <rect fill="currentColor" x="15.9" y="16.9" width="3.6" height="2.4" rx=".7" />
              <path fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" d="M17 19.3v1.6M18.4 19.3v1.6" />
            </svg>
            <span className="brand-text">Working<span className="brand-accent">Cafes</span></span>
          </Link>
          <nav>
            <Link href="/map">Map</Link>
            <Link href="/tokyo">Areas</Link>
            <Link href="/tokyo/free-wifi-cafes">Free Wi-Fi</Link>
            <Link href="/tokyo/cafes-with-power-outlets">Power outlets</Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>
            {SITE.name} — an independent guide to working from Tokyo cafes.
            Cafe data is checked regularly; the “last checked” date shows when.
          </p>
          <p className="attrib">
            Base location data © OpenStreetMap contributors (ODbL). Maps, directions &amp; cafe photos via Google. Map tiles © OpenFreeMap / OpenMapTiles.
          </p>
          <nav>
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
