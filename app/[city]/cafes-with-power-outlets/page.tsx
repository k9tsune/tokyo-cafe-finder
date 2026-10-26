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
  title: `Cafes with power outlets in ${c.name}`,
  description: `${c.name} cafes with power outlets where you can charge a laptop or phone. Checked and dated — outlet availability varies by branch.`,
  alternates: { canonical: `/${c.slug}/cafes-with-power-outlets` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasPower);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.name}
      slug="cafes-with-power-outlets"
      h1={`Cafes with power outlets in ${c.name}`}
      intro={`Cafes across ${c.name} that have power outlets for customers. Outlets are the hardest amenity to find in ${c.name} — most Starbucks branches, for example, have none — so every listing here is checked at the branch level.`}
      venues={venues}
      faq={[
        { q: `Which ${c.name} cafes have power outlets?`, a: names.length ? `${names.join(", ")} have outlets.` : "No listings yet." },
        { q: "Do Starbucks in Japan have power outlets?", a: "Most Starbucks branches in Japan have free Wi-Fi but no power outlets; a minority of newer or larger-format stores do. Because it varies by branch, check the individual cafe page." },
      ]}
    />
  );
}
