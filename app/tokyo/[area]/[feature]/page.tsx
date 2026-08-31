import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllAreas, getArea, getVenuesByArea } from "@/lib/db";
import {
  FEATURES,
  FEATURE_META,
  MIN_FEATURE_VENUES,
  checkedLabel,
  filterByFeature,
  isFeatureKey,
} from "@/lib/seo";

// Ward x feature pages — e.g. /tokyo/shinjuku/wifi-and-power.
//
// These exist because Search Console showed we rank ~88th for queries like
// "新宿 電源 カフェ 夜": the intent is {area} + {amenity}, but we only had
// area pages and Tokyo-wide feature pages, so nothing matched precisely.
// Only generated where at least MIN_FEATURE_VENUES cafes qualify, so we never
// ship thin faceted pages.

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { area: string; feature: string }[] = [];
  for (const a of getAllAreas()) {
    const venues = getVenuesByArea(a.slug);
    for (const f of FEATURES) {
      if (filterByFeature(venues, f).length >= MIN_FEATURE_VENUES) {
        out.push({ area: a.slug, feature: f });
      }
    }
  }
  return out;
}

export function generateMetadata({ params }: { params: { area: string; feature: string } }): Metadata {
  const area = getArea(params.area);
  if (!area || !isFeatureKey(params.feature)) return {};
  const venues = filterByFeature(getVenuesByArea(area.slug), params.feature);
  const m = FEATURE_META[params.feature].en;
  const checked = checkedLabel(venues, "en");
  const path = `/tokyo/${area.slug}/${params.feature}`;
  return {
    title: m.title(area.name, venues.length),
    description: `${m.intro(area.name, venues.length)}${checked ? ` Checked ${checked}.` : ""}`,
    alternates: {
      canonical: path,
      languages: { en: path, ja: `/ja${path}`, "x-default": path },
    },
  };
}

export default function AreaFeaturePage({ params }: { params: { area: string; feature: string } }) {
  const area = getArea(params.area);
  if (!area || !isFeatureKey(params.feature)) notFound();
  const venues = filterByFeature(getVenuesByArea(area.slug), params.feature);
  if (venues.length < MIN_FEATURE_VENUES) notFound();

  const m = FEATURE_META[params.feature].en;
  const names = venues.map((v) => v.name);
  const withPower = venues.filter((v) => v.hasPower).length;

  return (
    <FeatureHubPage
      slug={`${area.slug}/${params.feature}`}
      h1={m.h1(area.name)}
      intro={m.intro(area.name, venues.length)}
      venues={venues}
      parent={{ name: area.name, url: `/tokyo/${area.slug}` }}
      faq={[
        {
          q: `Which cafes in ${area.name} have ${m.label.toLowerCase()}?`,
          a: names.length ? `${names.slice(0, 12).join(", ")}${names.length > 12 ? `, and ${names.length - 12} more` : ""}.` : "No listings yet.",
        },
        {
          q: `How many cafes in ${area.name} have ${m.label.toLowerCase()}?`,
          a: `${venues.length} in our listings${withPower ? `, of which ${withPower} also have power outlets` : ""}. Each entry shows the date it was last checked.`,
        },
      ]}
    />
  );
}
