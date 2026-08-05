import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "電源・Wi-Fiのある東京のカフェ（作業向け）",
  description: "無料Wi-Fiと電源の両方がそろう、東京の作業向けカフェ。確認日つきで掲載しています。エリアや駅からしぼり込めます。",
  alternates: {
    canonical: "/ja/tokyo/cafes-with-wifi-and-power",
    languages: {
      en: "/tokyo/cafes-with-wifi-and-power",
      ja: "/ja/tokyo/cafes-with-wifi-and-power",
      "x-default": "/tokyo/cafes-with-wifi-and-power",
    },
  },
  openGraph: { locale: "ja_JP", url: "/ja/tokyo/cafes-with-wifi-and-power" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasWifi && v.hasPower);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      locale="ja"
      slug="cafes-with-wifi-and-power"
      h1="電源・Wi-Fiのある東京のカフェ"
      intro="無料Wi-Fiと電源の両方がそろう、作業にぴったりの東京のカフェをまとめました。この組み合わせはいちばん見つけにくいので、店舗ごとに確認し、確認日を掲載しています。"
      venues={venues}
      faq={[
        { q: "Wi-Fiと電源の両方が使える東京のカフェはどこですか？", a: names.length ? `${names.join("、")}でWi-Fiと電源の両方が使えます。` : "現在、掲載中のカフェはありません。" },
        { q: "東京でノートパソコン作業に向いたカフェは？", a: "Wi-Fiと電源の両方があり、ノートパソコン利用に向いたお店を選ぶのがおすすめです。このページの掲載店はまさにその条件で選んでいます。" },
      ]}
    />
  );
}
