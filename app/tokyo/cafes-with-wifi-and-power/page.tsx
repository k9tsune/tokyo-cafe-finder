import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tokyo cafes with Wi-Fi and power outlets (work cafes)",
  description: "The best Tokyo cafes for working on a laptop: both free Wi-Fi and power outlets, checked and dated. Filter by area or station.",
  alternates: { canonical: "/tokyo/cafes-with-wifi-and-power" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasWifi && v.hasPower);
  const names = venues.map((v) => v.name);
  return (
    <FeatureHubPage
      slug="cafes-with-wifi-and-power"
      h1="Tokyo cafes with Wi-Fi and power outlets"
      intro="The work-cafe shortlist: Tokyo cafes that have both free Wi-Fi and power outlets, so you can stay connected and charged through a proper laptop session. This is the hardest combination to find, so each one is verified at the branch level and dated."
      venues={venues}
      faq={[
        { q: "Which Tokyo cafes have both Wi-Fi and power outlets?", a: names.length ? `${names.join(", ")} have both Wi-Fi and outlets.` : "No listings yet." },
        { q: "Where can I work on a laptop in Tokyo for a few hours?", a: "Look for cafes with both Wi-Fi and outlets and a laptop-friendly note — the listings on this page are chosen for exactly that." },
      ]}
    />
  );
}
