import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllAreas, getAllStations, getAllVenues } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { GUIDES_JA } from "@/lib/guides-ja";

// Auto-generated sitemap. Regenerates on each build/ISR pass, so new area,
// station and cafe pages are submitted to Google without manual work.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticPages = [
    "", "/tokyo", "/tokyo/free-wifi-cafes",
    "/tokyo/cafes-with-power-outlets", "/tokyo/cafes-with-wifi-and-power",
    "/tokyo/open-late-cafes",
    "/guides",
    "/about", "/contact", "/privacy",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const guides = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: g.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const areas = getAllAreas().map((a) => ({ url: `${base}/tokyo/${a.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  const stations = getAllStations().map((s) => ({ url: `${base}/tokyo/station/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  const cafes = getAllVenues().map((v) => ({
    url: `${base}/cafe/${v.slug}`,
    lastModified: v.lastChecked,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Japanese (/ja) routes: home, hub, areas, stations, and JA guides.
  const jaStatic = ["/ja", "/ja/tokyo", "/ja/guides"].map((p) => ({
    url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "/ja" ? 0.9 : 0.7,
  }));
  const jaGuides = GUIDES_JA.map((g) => ({
    url: `${base}/ja/guides/${g.slug}`, lastModified: g.date, changeFrequency: "monthly" as const, priority: 0.7,
  }));
  const jaAreas = getAllAreas().map((a) => ({ url: `${base}/ja/tokyo/${a.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const jaStations = getAllStations().map((s) => ({ url: `${base}/ja/tokyo/station/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));

  return [
    ...staticPages, ...guides, ...areas, ...stations, ...cafes,
    ...jaStatic, ...jaGuides, ...jaAreas, ...jaStations,
  ];
}
