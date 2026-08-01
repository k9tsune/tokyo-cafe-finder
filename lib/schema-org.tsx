// JSON-LD (schema.org) builders. Emitted in a <script type="application/ld+json">
// on each page so Google understands the cafe facts and the list structure.

import type { Venue, Area, Station } from "./types";
import { SITE } from "./site";

export function cafeJsonLd(v: Venue) {
  const amenities = [
    { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: v.hasWifi },
    { "@type": "LocationFeatureSpecification", name: "Power outlets", value: v.hasPower },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: v.name,
    description: v.description,
    address: { "@type": "PostalAddress", streetAddress: v.address, addressLocality: "Tokyo", addressCountry: "JP" },
    ...(typeof v.lat === "number" && typeof v.lng === "number"
      ? { geo: { "@type": "GeoCoordinates", latitude: v.lat, longitude: v.lng } }
      : {}),
    ...(v.businessHours ? { openingHours: v.businessHours } : {}),
    amenityFeature: amenities,
    // Freshness signal — AI engines (Gemini / AI Overviews) weight dateModified.
    dateModified: v.lastChecked,
    url: `${SITE.url}/cafe/${v.slug}`,
  };
}

// FAQPage schema — one of the highest-value formats for getting extracted and
// cited by Gemini / AI Overviews, because it maps a question directly to an
// answer the model can lift. Built from the venue's own verified facts.
export function cafeFaqJsonLd(v: Venue) {
  const qa: { q: string; a: string }[] = [
    {
      q: `Does ${v.name} have Wi-Fi?`,
      a: v.hasWifi
        ? `Yes — ${v.name} has ${v.wifiType === "free" ? "free" : v.wifiType} Wi-Fi (last checked ${v.lastChecked}).`
        : `No — ${v.name} does not offer customer Wi-Fi (last checked ${v.lastChecked}).`,
    },
    {
      q: `Does ${v.name} have power outlets?`,
      a: v.hasPower
        ? `Yes — ${v.name} has power outlets (${v.powerDensity === "many" ? "at many seats" : v.powerDensity === "some" ? "at some seats" : "at the counter"}), last checked ${v.lastChecked}.`
        : `No — ${v.name} does not have usable power outlets for customers (last checked ${v.lastChecked}).`,
    },
    {
      q: `Is ${v.name} a good place to work on a laptop?`,
      a: v.laptopFriendly
        ? `Yes — with ${v.hasWifi ? "Wi-Fi" : "no Wi-Fi"} and ${v.hasPower ? "power outlets" : "no outlets"}, it works for a laptop session near ${v.nearestStation}.`
        : `It's better for a short visit than a long work session — ${v.hasPower ? "" : "no outlets, "}and it can be busy.`,
    },
  ];
  return faqJsonLd(qa);
}

export function faqJsonLd(qa: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };
}

export function areaListJsonLd(area: Area, venues: Venue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Cafes with Wi-Fi & power outlets in ${area.name}, Tokyo`,
    itemListElement: venues.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/cafe/${v.slug}`,
      name: v.name,
    })),
  };
}

export function stationListJsonLd(station: Station, venues: Venue[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Laptop-friendly cafes near ${station.name}`,
    itemListElement: venues.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE.url}/cafe/${v.slug}`,
      name: v.name,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.url}`,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
