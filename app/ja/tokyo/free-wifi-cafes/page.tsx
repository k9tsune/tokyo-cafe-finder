import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "無料Wi-Fiのある東京のカフェ",
  description: "無料Wi-Fiが使える東京のカフェ。確認日つきで掲載しています。エリアや駅からしぼり込め、電源の有無もわかります。",
  alternates: {
    canonical: "/ja/tokyo/free-wifi-cafes",
    languages: {
      en: "/tokyo/free-wifi-cafes",
      ja: "/ja/tokyo/free-wifi-cafes",
      "x-default": "/tokyo/free-wifi-cafes",
    },
  },
  openGraph: { locale: "ja_JP", url: "/ja/tokyo/free-wifi-cafes" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasWifi);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      locale="ja"
      slug="free-wifi-cafes"
      h1="無料Wi-Fiのある東京のカフェ"
      intro="お客様が無料Wi-Fiを使える、東京のカフェをまとめました。電源もあるお店が多いですが、電源の有無は同じチェーンでも店舗によって異なるので、各ページでご確認ください。"
      venues={venues}
      faq={[
        { q: "無料Wi-Fiが使える東京のカフェはどこですか？", a: names.length ? `${names.join("、")}で無料Wi-Fiが使えます。` : "現在、掲載中のカフェはありません。" },
        { q: "東京のカフェはたいてい無料Wi-Fiがありますか？", a: "スターバックス、タリーズ、ドトールなどの多くのチェーンやスペシャルティカフェで無料Wi-Fiが使えます。ただし一部の個人店や昔ながらの喫茶店では使えないこともあります。" },
      ]}
    />
  );
}
