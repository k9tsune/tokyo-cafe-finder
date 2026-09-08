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
      // cited by Gemini / AI Overviews / ChatGPT / Perplexity).
      //
      // Nothing is Disallow-ed here on purpose. We previously blocked /near and
      // /*?dir= and both were mistakes:
      //   - /near already sends `noindex`. Blocking it in robots.txt stops Google
      //     CRAWLING it, so it never SEES the noindex — and a blocked URL can still
      //     be indexed bare, from links, with no description. noindex alone is the
      //     correct tool for keeping a page out of the index.
      //   - ?dir=1 is only a query string on a statically prerendered cafe page. The
      //     same HTML is served, carrying a canonical to the clean URL, so Google
      //     already de-duplicates it. Blocking it stranded the internal links and
      //     knocked out a URL that was ranking on page one.
      // The Directions button now uses a #hash, so ?dir= URLs are no longer created.
      { userAgent: "*", allow: "/" },
      // Crawlers that honor crawl-delay: keep full access but pace them so a
      // single sweep of ~1,600 pages is spread out, not a burst.
      { userAgent: ["Bingbot", "Yandex"], allow: "/", crawlDelay: 5 },
      // Bulk no-value scrapers: block entirely.
      { userAgent: BLOCKED_BOTS, disallow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
