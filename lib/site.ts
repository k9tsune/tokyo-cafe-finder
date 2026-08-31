// The site is served on WWW: Vercel has www.workingcafes.com as the production
// domain and 308-redirects the apex (workingcafes.com) to it. So every URL we
// declare — canonical tags, sitemap <loc>, og:url, robots Host — MUST use www.
// If we advertise the apex, Google crawls ~1,600 sitemap URLs that each bounce
// through a redirect, which shows up in Search Console as "Page with redirect"
// and burns crawl budget (and Vercel ISR reads) for nothing.
// Normalising here means an apex value in NEXT_PUBLIC_SITE_URL can't reintroduce
// the bug. If the primary host ever changes to the apex, flip Vercel's domain
// settings AND this normalisation together.
const CANONICAL_HOST = "https://www.workingcafes.com";

function canonicalSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || CANONICAL_HOST).replace(/\/+$/, "");
  // Upgrade a bare-apex production URL to www; leave preview/localhost URLs alone.
  return raw.replace(/^https?:\/\/workingcafes\.com/i, CANONICAL_HOST);
}

export const SITE = {
  name: "WorkingCafes",
  tagline: "Tokyo cafes with Wi-Fi and power outlets — nearby, checked, and dated. Charge your phone or get work done.",
  url: canonicalSiteUrl(),
  email: "contact@workingcafes.com",
  // Active locales. English at the root, Japanese under /ja.
  defaultLocale: "en",
  locales: ["en", "ja"],
};

export const GMAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";
