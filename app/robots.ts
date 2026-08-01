import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allow general crawlers and the major AI crawlers (GEO — we WANT to be
      // cited by Gemini / AI Overviews / ChatGPT). Only the personalized /near
      // results are disallowed.
      { userAgent: "*", allow: "/", disallow: "/near" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
