import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Cafes with power outlets in Tokyo",
  description: "Tokyo cafes with power outlets where you can charge a laptop or phone. Checked and dated — outlet availability varies by branch.",
  alternates: { canonical: "/tokyo/cafes-with-power-outlets" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasPower);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      slug="cafes-with-power-outlets"
      h1="Cafes with power outlets in Tokyo"
      intro="Cafes across Tokyo that have power outlets for customers. Outlets are the hardest amenity to find in Tokyo — most Starbucks branches, for example, have none — so every listing here is checked at the branch level."
      venues={venues}
      faq={[
        { q: "Which Tokyo cafes have power outlets?", a: names.length ? `${names.join(", ")} have outlets.` : "No listings yet." },
        { q: "Do Starbucks in Japan have power outlets?", a: "Most Starbucks branches in Japan have free Wi-Fi but no power outlets; a minority of newer or larger-format stores do. Because it varies by branch, check the individual cafe page." },
      ]}
    />
  );
}
