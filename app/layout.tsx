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
              {/* Coffee cup with a lightning bolt in the middle — "charge up + coffee" */}
              <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M4.6 6.4H14.4a.8.8 0 0 1 .8.8V14.8a4.2 4.2 0 0 1-4.2 4.2H8a4.2 4.2 0 0 1-4.2-4.2V7.2a.8.8 0 0 1 .8-.8ZM10.7 8.1 7.4 13H9.5l-.8 3.6L12.2 11.2H10l.7-3.1Z" />
              <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M15.4 9.2h1.4a2.7 2.7 0 0 1 0 5.4h-1.4" />
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
