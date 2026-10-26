import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getVenuesByCity, getPopulatedCities } from "@/lib/db";
import { getCity } from "@/lib/cities";

export const dynamicParams = false;

export function generateStaticParams() {
  // Only cities that actually have cafes. A city page with no venues is a
  // thin page, so Osaka simply does not exist as a route until its data lands.
  return getPopulatedCities().map((city) => ({ city }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const c = getCity(params.city);
  if (!c) return {};
  return {
  title: `${c.name} cafes with Wi-Fi and power outlets (work cafes)`,
  description: `The best ${c.name} cafes for working on a laptop: both free Wi-Fi and power outlets, checked and dated. Filter by area or station.`,
  alternates: { canonical: `/${c.slug}/cafes-with-wifi-and-power` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasWifi && v.hasPower);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.name}
      slug="cafes-with-wifi-and-power"
      h1={`${c.name} cafes with Wi-Fi and power outlets`}
      intro={`The work-cafe shortlist: ${c.name} cafes that have both free Wi-Fi and power outlets, so you can stay connected and charged through a proper laptop session. This is the hardest combination to find, so each one is verified at the branch level and dated.`}
      venues={venues}
      faq={[
        { q: `Which ${c.name} cafes have both Wi-Fi and power outlets?`, a: names.length ? `${names.join(", ")} have both Wi-Fi and outlets.` : "No listings yet." },
        { q: `Where can I work on a laptop in ${c.name} for a few hours?`, a: "Look for cafes with both Wi-Fi and outlets and a laptop-friendly note — the listings on this page are chosen for exactly that." },
      ]}
    />
  );
}
