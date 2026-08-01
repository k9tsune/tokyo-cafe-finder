import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Free Wi-Fi cafes in Tokyo",
  description: "Tokyo cafes with free Wi-Fi, checked and dated. Filter by area or station and see which also have power outlets.",
  alternates: { canonical: "/tokyo/free-wifi-cafes" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasWifi);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      slug="free-wifi-cafes"
      h1="Free Wi-Fi cafes in Tokyo"
      intro="Cafes across Tokyo with free Wi-Fi for customers. Many have outlets too — check each listing, since outlet availability varies branch by branch even within the same chain."
      venues={venues}
      faq={[
        { q: "Which Tokyo cafes have free Wi-Fi?", a: names.length ? `${names.join(", ")} offer free Wi-Fi.` : "No listings yet." },
        { q: "Do Tokyo cafes usually have free Wi-Fi?", a: "Many chains (Starbucks, Tully's, Doutor) and specialty cafes offer free Wi-Fi, though some independents and traditional kissaten do not." },
      ]}
    />
  );
}
