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
              <path d="M11 2 L7.9 8.4 H9.9 L9.1 10.4 L13 4.6 H11 L12 2 Z" fill="currentColor" />
              <path d="M4.5 11.3 H15 V16.5 A4 4 0 0 1 11 20.5 H8.5 A4 4 0 0 1 4.5 16.5 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M15 12.4 H17 A2.4 2.4 0 0 1 17 17.2 H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.8 22 H16.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
