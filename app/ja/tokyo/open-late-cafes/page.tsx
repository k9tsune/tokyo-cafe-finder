import type { Metadata } from "next";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "夜遅く・24時間営業の東京のカフェ（Wi-Fi・電源あり）",
  description: "終電を逃した夜も安心。Wi-Fiと電源があり、夜遅くや24時間営業しているお店（マンガ喫茶、ファミレス、24時間スポット）をまとめました。確認日つき。",
  alternates: {
    canonical: "/ja/tokyo/open-late-cafes",
    languages: {
      en: "/tokyo/open-late-cafes",
      ja: "/ja/tokyo/open-late-cafes",
      "x-default": "/tokyo/open-late-cafes",
    },
  },
  openGraph: { locale: "ja_JP", url: "/ja/tokyo/open-late-cafes" },
};

export default function Page() {
  const venues = getAllVenues()
    .filter((v) => v.openLate && v.hasPower)
    .sort((a, b) => Number(!!b.open24h) - Number(!!a.open24h) || a.name.localeCompare(b.name));

  const open24 = venues.filter((v) => v.open24h).length;

  return (
    <FeatureHubPage
      locale="ja"
      slug="open-late-cafes"
      h1="夜遅く・24時間営業の東京のカフェ"
      intro="終電を逃した、あるいは夜まで作業したいとき。Wi-Fiと電源の両方があり、夜遅くや24時間営業しているお店をまとめました。個室のあるマンガ喫茶（ネットカフェ）、ファミレス、24時間スポットなど、長い夜を安く快適に過ごせるお店が中心です。"
      venues={venues}
      faq={[
        { q: "東京で深夜にWi-Fiと電源が使える場所は？", a: "快活CLUB、自遊空間、バグースなどのマンガ喫茶（ネットカフェ）は24時間営業で、個室・無料Wi-Fi・電源があります。ジョナサン、ガスト、デニーズなどの深夜営業のファミレスや、一部の24時間マクドナルドも便利です。" },
        { q: "マンガ喫茶とは何ですか？", a: "マンガ喫茶（ネットカフェ）は、個室・フリードリンク・マンガ・インターネットが利用できるお店です。多くが24時間営業で、Wi-Fiと電源があり、数時間で1,500〜3,000円ほど。終電を逃したときに夜を明かす定番の場所です。" },
        { q: "これらのお店は24時間営業ですか？", a: `掲載${venues.length}店のうち${open24}店が24時間営業です。ほかは深夜（23時ごろ以降）まで営業しています。店舗や時期によって営業時間は変わるので、各ページとお店の情報を必ずご確認ください。` },
      ]}
    />
  );
}
