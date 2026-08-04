import type { Metadata } from "next";
import Link from "next/link";
import MapView, { type MapPoint } from "@/components/MapView";
import { getAllVenues } from "@/lib/db";

export const metadata: Metadata = {
  title: "電源・Wi-Fiのある東京のカフェの地図",
  description:
    "東京で電源やWi-Fiが使えるカフェを、地図から探せます。緑のピンはWi-Fiと電源の両方があるお店です。",
  alternates: {
    canonical: "/ja/map",
    languages: { en: "/map", ja: "/ja/map", "x-default": "/map" },
  },
  openGraph: { title: "電源・Wi-Fiのある東京のカフェの地図", locale: "ja_JP", url: "/ja/map" },
};

export default function MapPageJa() {
  const points: MapPoint[] = getAllVenues()
    .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
    .map((v) => ({
      slug: v.slug,
      name: v.nameJa || v.name,
      lat: v.lat as number,
      lng: v.lng as number,
      wifi: v.hasWifi,
      power: v.hasPower,
      hours: v.businessHours,
    }));

  return (
    <div>
      <p className="breadcrumb"><Link href="/ja">ホーム</Link> / 地図</p>
      <h1>作業できる東京のカフェの地図</h1>
      <p className="lede">
        すべてのカフェを一つの地図に。ピンをタップすると詳細が表示されます。<strong>緑</strong>＝Wi-Fi＋電源、
        <strong>オレンジ</strong>＝電源、<strong>青</strong>＝Wi-Fi。現在地ボタンで近くのお店を探せます。
      </p>

      <div className="map-legend">
        <span><i className="map-pin both" aria-hidden="true" /> Wi-Fi＋電源</span>
        <span><i className="map-pin power" aria-hidden="true" /> 電源</span>
        <span><i className="map-pin wifi" aria-hidden="true" /> Wi-Fi</span>
      </div>

      <MapView points={points} locale="ja" />

      <p className="muted" style={{ marginTop: 12 }}>
        位置情報のある{points.length}件のカフェを表示しています。正確な座標が追加されると、さらに増えていきます。
      </p>
    </div>
  );
}
