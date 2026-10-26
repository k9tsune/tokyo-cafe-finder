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
  title: `電源のある${c.nameJa}のカフェ`,
  description: `ノートパソコンやスマホを充電できる、電源のある${c.nameJa}のカフェ。確認日つきで掲載しています。電源の有無は店舗によって異なります。`,
  alternates: {
    canonical: `/ja/${c.slug}/cafes-with-power-outlets`,
    languages: {
      en: `/${c.slug}/cafes-with-power-outlets`,
      ja: `/ja/${c.slug}/cafes-with-power-outlets`,
      "x-default": `/${c.slug}/cafes-with-power-outlets`,
    },
  },
  openGraph: { locale: "ja_JP", url: `/ja/${c.slug}/cafes-with-power-outlets` },
  };
}

export default function Page({ params }: { params: { city: string } }) {
  const c = getCity(params.city);
  if (!c) notFound();
  const venues = getVenuesByCity(c.slug).filter((v) => v.hasPower);
  const names = venues.map((v) => v.nameJa || v.name);
  return (
    <FeatureHubPage
      city={c.slug}
      cityLabel={c.nameJa}
      locale="ja"
      slug="cafes-with-power-outlets"
      h1={`電源のある${c.nameJa}のカフェ`}
      intro={`お客様が使える電源のある、${c.nameJa}のカフェをまとめました。${c.nameJa}では電源がいちばん見つかりにくい設備で、たとえばスターバックスの多くの店舗にはありません。そのため、掲載店はすべて店舗ごとに確認しています。`}
      venues={venues}
      faq={[
        { q: `電源が使える${c.nameJa}のカフェはどこですか？`, a: names.length ? `${names.join("、")}で電源が使えます。` : "現在、掲載中のカフェはありません。" },
        { q: "日本のスターバックスに電源はありますか？", a: "日本の多くのスターバックスは無料Wi-Fiはありますが電源はなく、一部の新しい店舗や大型店にのみあります。店舗によって異なるので、各カフェのページでご確認ください。" },
      ]}
    />
  );
}
