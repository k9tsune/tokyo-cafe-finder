import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FeatureHubPage from "@/components/FeatureHubPage";
import { getAllAreas, getArea, getVenuesByArea } from "@/lib/db";
import { wardNameJa } from "@/lib/ward-ja";
import {
  FEATURES,
  FEATURE_META,
  MIN_FEATURE_VENUES,
  checkedLabel,
  filterByFeature,
  isFeatureKey,
} from "@/lib/seo";

// 区 × 条件のページ（例：/ja/tokyo/shinjuku/wifi-and-power）。
// 「新宿 電源 カフェ 夜」のような検索は {エリア}＋{設備} の意図なのに、
// これまで区ページと東京全体の条件ページしかなく、ぴったり合うページが
// ありませんでした。該当店舗が MIN_FEATURE_VENUES 件以上のときだけ生成します。

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { area: string; feature: string }[] = [];
  for (const a of getAllAreas()) {
    const venues = getVenuesByArea(a.slug);
    for (const f of FEATURES) {
      if (filterByFeature(venues, f).length >= MIN_FEATURE_VENUES) {
        out.push({ area: a.slug, feature: f });
      }
    }
  }
  return out;
}

export function generateMetadata({ params }: { params: { area: string; feature: string } }): Metadata {
  const area = getArea(params.area);
  if (!area || !isFeatureKey(params.feature)) return {};
  const name = wardNameJa(area.slug, area.name);
  const venues = filterByFeature(getVenuesByArea(area.slug), params.feature);
  const m = FEATURE_META[params.feature].ja;
  const checked = checkedLabel(venues, "ja");
  const path = `/ja/tokyo/${area.slug}/${params.feature}`;
  const enPath = `/tokyo/${area.slug}/${params.feature}`;
  const title = m.title(name, venues.length);
  const description = `${m.intro(name, venues.length)}${checked ? `${checked}確認。` : ""}`;
  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: { en: enPath, ja: path, "x-default": enPath },
    },
    openGraph: { title, description, locale: "ja_JP", url: path },
  };
}

export default function AreaFeaturePageJa({ params }: { params: { area: string; feature: string } }) {
  const area = getArea(params.area);
  if (!area || !isFeatureKey(params.feature)) notFound();
  const venues = filterByFeature(getVenuesByArea(area.slug), params.feature);
  if (venues.length < MIN_FEATURE_VENUES) notFound();

  const name = wardNameJa(area.slug, area.name);
  const m = FEATURE_META[params.feature].ja;
  const names = venues.map((v) => v.nameJa || v.name);
  const withPower = venues.filter((v) => v.hasPower).length;

  return (
    <FeatureHubPage
      slug={`${area.slug}/${params.feature}`}
      h1={m.h1(name)}
      intro={m.intro(name, venues.length)}
      venues={venues}
      locale="ja"
      parent={{ name, url: `/ja/tokyo/${area.slug}` }}
      faq={[
        {
          q: `${name}で${m.label}が使えるカフェはどこですか？`,
          a: names.length ? `${names.slice(0, 12).join("、")}${names.length > 12 ? `ほか${names.length - 12}件` : ""}。` : "まだ掲載がありません。",
        },
        {
          q: `${name}で${m.label}のあるカフェは何件ありますか？`,
          a: `${venues.length}件を掲載しています${withPower ? `（うち${withPower}件は電源もあります）` : ""}。各ページに確認日を記載しています。`,
        },
      ]}
    />
  );
}
