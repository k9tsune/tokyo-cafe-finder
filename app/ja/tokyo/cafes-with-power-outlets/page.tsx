import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "電源のある東京のカフェ",
  description: "ノートパソコンやスマホを充電できる、電源のある東京のカフェ。確認日つきで掲載しています。電源の有無は店舗によって異なります。",
  alternates: {
    canonical: "/ja/tokyo/cafes-with-power-outlets",
    languages: {
      en: "/tokyo/cafes-with-power-outlets",
      ja: "/ja/tokyo/cafes-with-power-outlets",
      "x-default": "/tokyo/cafes-with-power-outlets",
    },
  },
  openGraph: { locale: "ja_JP", url: "/ja/tokyo/cafes-with-power-outlets" },
};

export default function Page() {
  const venues = getAllVenues().filter((v) => v.hasPower);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      locale="ja"
      slug="cafes-with-power-outlets"
      h1="電源のある東京のカフェ"
      intro="お客様が使える電源のある、東京のカフェをまとめました。東京では電源がいちばん見つけにくい設備で、たとえばスターバックスの多くの店舗にはありません。そのため、掲載店はすべて店舗ごとに確認しています。"
      venues={venues}
      faq={[
        { q: "電源が使える東京のカフェはどこですか？", a: names.length ? `${names.join("、")}で電源が使えます。` : "現在、掲載中のカフェはありません。" },
        { q: "日本のスターバックスに電源はありますか？", a: "日本の多くのスターバックスは無料Wi-Fiはありますが電源はなく、一部の新しい店舗や大型店にのみあります。店舗によって異なるので、各カフェのページでご確認ください。" },
      ]}
    />
  );
}
