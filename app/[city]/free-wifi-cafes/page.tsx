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
  title: `Free Wi-Fi cafes in ${c.name}`,
  description: `${c.name} cafes with free Wi-Fi, checked and dated. Filter by area or station and see which also have power outlets.`,
  alternates: { canonical: `/${c.slug}/free-wifi-cafes` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasWifi);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.name}
      slug="free-wifi-cafes"
      h1={`Free Wi-Fi cafes in ${c.name}`}
      intro={`Cafes across ${c.name} with free Wi-Fi for customers. Many have outlets too — check each listing, since outlet availability varies branch by branch even within the same chain.`}
      venues={venues}
      faq={[
        { q: `Which ${c.name} cafes have free Wi-Fi?`, a: names.length ? `${names.join(", ")} offer free Wi-Fi.` : "No listings yet." },
        { q: `Do ${c.name} cafes usually have free Wi-Fi?`, a: "Many chains (Starbucks, Tully's, Doutor) and specialty cafes offer free Wi-Fi, though some independents and traditional kissaten do not." },
      ]}
    />
  );
}
