import type { Metadata } from "next";
import Link from "next/link";
import { allAreaPhotos } from "@/lib/media";
import { allCategoryImages } from "@/lib/cafe-image";
import { wardNameJa } from "@/lib/ward-ja";

export const metadata: Metadata = {
  title: "写真クレジット",
  description: "WorkingCafesで使用している画像の出典・クレジット。",
  alternates: { canonical: "/ja/credits", languages: { en: "/credits", ja: "/ja/credits", "x-default": "/credits" } },
};

export default function CreditsPageJa() {
  const photos = allAreaPhotos();
  return (
    <div>
      <p className="breadcrumb">
        <Link href="/ja">ホーム</Link> / 写真クレジット
      </p>
      <h1>写真クレジット</h1>
      <p className="lede">
        エリアの写真は、フリーライセンスのもとWikimedia Commonsなどから使用しています。撮影者のみなさまに感謝します。
      </p>

      <h2>エリアの写真</h2>
      <ul>
        {photos.map((p) => (
          <li key={p.slug} style={{ margin: "6px 0" }}>
            <strong>{wardNameJa(p.slug, p.slug)}</strong>：{p.title} — {p.author}（{p.license}、
            <a href={p.source} target="_blank" rel="noopener noreferrer">出典</a>）
          </li>
        ))}
      </ul>

      <h2>カフェのカテゴリー写真</h2>
      <p className="lede">
        お店独自の写真がない場合は、チェーンや種類を代表する画像を表示しています。これらはUnsplash（Unsplashライセンス）やWikimedia Commons（クリエイティブ・コモンズ）のものです。
      </p>
      <ul>
        {allCategoryImages().map((c, i) => (
          <li key={`${c.key}-${i}`} style={{ margin: "6px 0" }}>
            <strong style={{ textTransform: "capitalize" }}>{c.key.replace(/_/g, " ")}</strong>：{c.author}（{c.license}、
            <a href={c.page} target="_blank" rel="noopener noreferrer">出典</a>）
          </li>
        ))}
      </ul>

      <p className="muted">
        その他のエリアカードは、WorkingCafesが作成したオリジナルのイラストを使用しています。位置情報のベースデータは © OpenStreetMap contributors（ODbL）。地図・カフェ写真は Google を利用しています。
      </p>
    </div>
  );
}
