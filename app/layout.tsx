import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import ThemeToggle from "@/components/ThemeToggle";
import { SITE } from "@/lib/site";
import "./globals.css";

// Cloudflare Web Analytics: cookieless and privacy-friendly. Only loads when the
// token env var is set (add NEXT_PUBLIC_CF_BEACON_TOKEN in Vercel), so dev and
// preview builds don't send data.
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

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
  return (
    <html lang="en">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('wc-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`}
        </Script>
        <header className="site-header">
          <Link href="/" className="brand" aria-label={`${SITE.name} — home`}>
            <svg className="brand-mark" viewBox="2.8 7.0 14.6 9.2" width="24" height="24" aria-hidden="true" focusable="false" fill="none">
              {/* Wide coffee cup with a bold lightning bolt inside */}
              <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M3.0 7.2H13.8C13.6 12 12.6 16.0 8.4 16.0C4.2 16.0 3.2 12 3.0 7.2ZM9.6 8.0 5.9 13.0H8.3L7.2 15.4 11.1 10.5H8.6L9.6 8.0Z" />
              <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M13.7 8.9C16.4 8.7 16.4 12.6 13.7 12.5" />
            </svg>
            <span className="brand-text">Working<span className="brand-accent">Cafes</span></span>
          </Link>
          <nav>
            <Link href="/map">Map</Link>
            <Link href="/tokyo">Areas</Link>
            <Link href="/tokyo/free-wifi-cafes">Free Wi-Fi</Link>
            <Link href="/tokyo/cafes-with-power-outlets">Power outlets</Link>
            <ThemeToggle />
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
            <Link href="/guides">Guides</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </footer>
        {CF_BEACON_TOKEN && (
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
