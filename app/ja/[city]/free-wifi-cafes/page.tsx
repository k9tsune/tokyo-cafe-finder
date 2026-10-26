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
  title: `無料Wi-Fiのある${c.nameJa}のカフェ`,
  description: `無料Wi-Fiが使える${c.nameJa}のカフェ。確認日つきで掲載しています。エリアや駅からしぼり込め、電源の有無もわかります。`,
  alternates: {
    canonical: `/ja/${c.slug}/free-wifi-cafes`,
    languages: {
      en: `/${c.slug}/free-wifi-cafes`,
      ja: `/ja/${c.slug}/free-wifi-cafes`,
      "x-default": `/${c.slug}/free-wifi-cafes`,
    },
  },
  openGraph: { locale: "ja_JP", url: `/ja/${c.slug}/free-wifi-cafes` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasWifi);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.nameJa}
      locale="ja"
      slug="free-wifi-cafes"
      h1={`無料Wi-Fiのある${c.nameJa}のカフェ`}
      intro={`お客様が無料Wi-Fiを使える、${c.nameJa}のカフェをまとめました。電源もあるお店が多いですが、電源の有無は同じチェーンでも店舗によって異なるので、各ページでご確認ください。`}
      venues={venues}
      faq={[
        { q: `無料Wi-Fiが使える${c.nameJa}のカフェはどこですか？`, a: names.length ? `${names.join("、")}で無料Wi-Fiが使えます。` : "現在、掲載中のカフェはありません。" },
        { q: `${c.nameJa}のカフェはたいてい無料Wi-Fiがありますか？`, a: "スターバックス、タリーズ、ドトールなどの多くのチェーンやスペシャルティカフェで無料Wi-Fiが使えます。ただし一部の個人店や昔ながらの喫茶店では使えないこともあります。" },
      ]}
    />
  );
}
