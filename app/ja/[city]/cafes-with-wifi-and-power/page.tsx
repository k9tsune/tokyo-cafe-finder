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
  title: `電源・Wi-Fiのある${c.nameJa}のカフェ（作業向け）`,
  description: `無料Wi-Fiと電源の両方がそろう、${c.nameJa}の作業向けカフェ。確認日つきで掲載しています。エリアや駅からしぼり込めます。`,
  alternates: {
    canonical: `/ja/${c.slug}/cafes-with-wifi-and-power`,
    languages: {
      en: `/${c.slug}/cafes-with-wifi-and-power`,
      ja: `/ja/${c.slug}/cafes-with-wifi-and-power`,
      "x-default": `/${c.slug}/cafes-with-wifi-and-power`,
    },
  },
  openGraph: { locale: "ja_JP", url: `/ja/${c.slug}/cafes-with-wifi-and-power` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasWifi && v.hasPower);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.nameJa}
      locale="ja"
      slug="cafes-with-wifi-and-power"
      h1={`電源・Wi-Fiのある${c.nameJa}のカフェ`}
      intro={`無料Wi-Fiと電源の両方がそろう、作業にぴったりの${c.nameJa}のカフェをまとめました。この組み合わせはいちばん見つかりにくいので、店舗ごとに確認し、確認日を掲載しています。`}
      venues={venues}
      faq={[
        { q: `Wi-Fiと電源の両方が使える${c.nameJa}のカフェはどこですか？`, a: names.length ? `${names.join("、")}でWi-Fiと電源の両方が使えます。` : "現在、掲載中のカフェはありません。" },
        { q: `${c.nameJa}でノートパソコン作業に向いたカフェは？`, a: "Wi-Fiと電源の両方があり、ノートパソコン利用に向いたお店を選ぶのがおすすめです。このページの掲載店はまさにその条件で選んでいます。" },
      ]}
    />
  );
}
