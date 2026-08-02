import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Open late & 24-hour cafes in Tokyo (Wi-Fi + power)",
  description:
    "Stranded in Tokyo at night? Places open late or 24 hours with Wi-Fi and power outlets, including manga/internet cafes, family restaurants and 24-hour spots. Checked and dated.",
  alternates: { canonical: "/tokyo/open-late-cafes" },
};

export default function Page() {
  const venues = getAllVenues()
    .filter((v) => v.openLate && v.hasPower)
    .sort((a, b) => Number(!!b.open24h) - Number(!!a.open24h) || a.name.localeCompare(b.name));

  const open24 = venues.filter((v) => v.open24h).length;

  return (
    <FeatureHubPage
      slug="open-late-cafes"
      h1="Open late & 24-hour cafes in Tokyo"
      intro="Missed the last train, or working late? These Tokyo places stay open late or around the clock and have both Wi-Fi and power outlets, so you can charge up and get online when everything else is shut. Many are manga kissa (manga and internet cafes with private booths), family restaurants, and 24-hour spots that are cheap and comfortable for a long night."
      venues={venues}
      faq={[
        {
          q: "Where can I go in Tokyo late at night with Wi-Fi and a power outlet?",
          a: "Manga kissa (manga/internet cafes) like Kaikatsu Club, Jiyu Kukan, and Bagus are open 24 hours with private booths, free Wi-Fi and outlets. Late-night family restaurants such as Jonathan's, Gusto and Denny's, plus some 24-hour McDonald's, also work.",
        },
        {
          q: "What is a manga kissa?",
          a: "A manga kissa (also called a net cafe) is a cafe with private booths, free drinks, manga and internet access. Most are open 24 hours, have Wi-Fi and power outlets, and cost roughly ¥1,500 to ¥3,000 for a few hours, so they are a common place to wait out the night if you miss the last train.",
        },
        {
          q: "Are these places open 24 hours?",
          a: `${open24} of the ${venues.length} listed here are open 24 hours. The rest close late (around or after 11pm). Always check the individual listing and the venue's own hours, since branches vary and hours can change.`,
        },
      ]}
    />
  );
}
