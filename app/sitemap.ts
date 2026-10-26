import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllAreas, getAllStations, getAllVenues, cityOfArea, getPopulatedCities } from "@/lib/db";
import { GUIDES } from "@/lib/guides";
import { GUIDES_JA } from "@/lib/guides-ja";
import { FEATURES, MIN_FEATURE_VENUES, filterByFeature } from "@/lib/seo";
import { getVenuesByArea } from "@/lib/db";

// Auto-generated sitemap. Regenerates on each build/ISR pass, so new area,
// station and cafe pages are submitted to Google without manual work.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  // Only cities that actually have cafes get listed — a city page with no
  // venues would be a thin page advertising itself.
  const cities = getPopulatedCities();
  const cityPages = cities.flatMap((c) => [
    `/${c}`, `/${c}/free-wifi-cafes`, `/${c}/cafes-with-power-outlets`,
    `/${c}/cafes-with-wifi-and-power`, `/${c}/open-late-cafes`,
  ]);
  const staticPages = [
    "", ...cityPages,
    "/guides",
    "/about", "/contact", "/privacy",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const guides = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: g.date,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const areas = getAllAreas().map((a) => ({ url: `${base}/${a.city}/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }));
  const stations = getAllStations().map((s) => ({ url: `${base}/${cityOfArea(s.areaSlug)}/station/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }));
  const cafes = getAllVenues().map((v) => ({
    url: `${base}/cafe/${v.slug}`,
    lastModified: v.lastChecked,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Japanese (/ja) routes: home, hub, map, static pages, guides, areas, stations, cafes.
  const jaStatic = ["/ja", ...cities.map((c) => `/ja/${c}`), "/ja/map", "/ja/guides", "/ja/about", "/ja/contact", "/ja/privacy"].map((p) => ({
    url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "/ja" ? 0.9 : 0.7,
  }));
  const jaGuides = GUIDES_JA.map((g) => ({
    url: `${base}/ja/guides/${g.slug}`, lastModified: g.date, changeFrequency: "monthly" as const, priority: 0.7,
  }));
  const jaAreas = getAllAreas().map((a) => ({ url: `${base}/ja/${a.city}/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const jaStations = getAllStations().map((s) => ({ url: `${base}/ja/${cityOfArea(s.areaSlug)}/station/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 }));
  const jaCafes = getAllVenues().map((v) => ({
    url: `${base}/ja/cafe/${v.slug}`, lastModified: v.lastChecked, changeFrequency: "monthly" as const, priority: 0.6,
  }));

  // Ward x feature pages (both locales) — only the combinations that actually
  // generate, so the sitemap never advertises a 404.
  const featureEn: MetadataRoute.Sitemap = [];
  const featureJa: MetadataRoute.Sitemap = [];
  for (const a of getAllAreas()) {
    const vs = getVenuesByArea(a.slug);
    for (const f of FEATURES) {
      if (filterByFeature(vs, f).length < MIN_FEATURE_VENUES) continue;
      featureEn.push({ url: `${base}/${a.city}/${a.slug}/${f}`, changeFrequency: "monthly" as const, priority: 0.7 });
      featureJa.push({ url: `${base}/ja/${a.city}/${a.slug}/${f}`, changeFrequency: "monthly" as const, priority: 0.7 });
    }
  }

  return [
    ...staticPages, ...guides, ...areas, ...stations, ...cafes, ...featureEn,
    ...jaStatic, ...jaGuides, ...jaAreas, ...jaStations, ...jaCafes, ...featureJa,
  ];
}
