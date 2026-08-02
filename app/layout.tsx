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
              {/* Rounded coffee cup (emoji-style) with a bold lightning bolt inside */}
              <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M4.4 7.2C4.4 6.7 4.8 6.5 5.2 6.5H13.8C14.2 6.5 14.6 6.7 14.6 7.2V11.5C14.6 15.3 12.3 17.8 9.5 17.8C6.7 17.8 4.4 15.3 4.4 11.5V7.2ZM11.3 7.9 6.9 13.2H9.6L8.4 16.6 12.7 10.9H10L11.3 7.9Z" />
              <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M14.9 8.7H16.4A2.9 2.9 0 0 1 16.4 14.5H14.9" />
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
