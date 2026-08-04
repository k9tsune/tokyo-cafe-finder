import Link from "next/link";
import type { Metadata } from "next";
import CafeCard from "@/components/CafeCard";
import SearchBar from "@/components/SearchBar";
import { formatDistance } from "@/lib/geo";
import { assignCovers } from "@/lib/cafe-image";
import { nearestVenues, getAllDestinations } from "@/lib/db";

// Personalized results — not an SEO target, so noindex.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NearPageJa({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string; charge?: string };
}) {
  const lat = parseFloat(searchParams.lat ?? "");
  const lng = parseFloat(searchParams.lng ?? "");
  const charge = searchParams.charge === "1";
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  const destinations = getAllDestinations();

  let results = valid ? nearestVenues(lat, lng, 60) : [];
  results = charge
    ? results.filter((v) => v.hasPower && v.distanceMeters <= 2000).slice(0, 20)
    : results.slice(0, 20);

  const empty = !valid || results.length === 0;

  return (
    <div>
      <p className="breadcrumb">
        <Link href="/ja">ホーム</Link> / {charge ? "近くの電源" : "現在地から探す"}
      </p>
      <h1>{charge ? "近くで充電できるカフェ" : "現在地の近くのカフェ"}</h1>

      {!valid ? (
        <p className="lede">現在地を取得できませんでした。下の検索から駅名やエリア名で探してみてください。</p>
      ) : results.length === 0 ? (
        <p className="lede">
          {charge
            ? "半径約2km以内に電源のあるカフェが見つかりませんでした。下から近くの駅を検索してみてください。"
            : "近くにお店が見つかりませんでした。下から駅名やエリア名で検索してみてください。"}
        </p>
      ) : (
        <p className="lede">
          {charge
            ? "近い順に並んでいます。すべて電源があります。「経路を見る」からそのまま向かえます。"
            : "近い順に並んでいます。「経路を見る」から向かうか、カフェ名から詳細を確認できます。"}
        </p>
      )}

      {empty && (
        <div className="near-search">
          <p className="near-search-label">駅名・エリア名で検索</p>
          <SearchBar destinations={destinations} need={charge ? "power" : undefined} locale="ja" />
        </div>
      )}

      {results.length > 0 && (
        <div className="cafe-list">
          {(() => {
            const covers = assignCovers(results);
            return results.map((v, i) => (
              <div key={v.id}>
                <p className="near-dist">{formatDistance(v.distanceMeters)}先</p>
                <CafeCard v={v} locale="ja" cover={covers[i]} />
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
