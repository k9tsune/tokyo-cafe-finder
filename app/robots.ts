import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// High-volume, no-referral scrapers — bulk AI-training and SEO-audit crawlers
// that sweep every page (~1,600 here) repeatedly but send us no traffic or
// citations. Blocking them trims the bulk of our prerendered-page reads without
// hurting search or AI-answer visibility.
const BLOCKED_BOTS = [
  "Bytespider",      // ByteDance/TikTok — very aggressive, no referral value
  "CCBot",           // Common Crawl — bulk training corpus
  "Amazonbot",
  "Diffbot",
  "DataForSeoBot",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "PetalBot",
  "Timpibot",
  "ImagesiftBot",
  "Omgilibot",
  "Omgili",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everything else (incl. AI SEARCH/citation crawlers — GEO: we WANT to be
      // cited by Gemini / AI Overviews / ChatGPT / Perplexity). Only the
      // personalized /near results are disallowed.
      { userAgent: "*", allow: "/", disallow: ["/near", "/*?dir="] },
      // Crawlers that honor crawl-delay: keep full access but pace them so a
      // single sweep of ~1,600 pages is spread out, not a burst.
      { userAgent: ["Bingbot", "Yandex"], allow: "/", disallow: ["/near", "/*?dir="], crawlDelay: 5 },
      // Bulk no-value scrapers: block entirely.
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
