import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CafeMap from "@/components/CafeMap";
import CafeCover from "@/components/CafeCover";
import CafeInstagram from "@/components/CafeInstagram";
import { WifiBadge, PowerBadge, FreshnessBadge } from "@/components/badges";
import { getAllVenues, getVenue, getArea, getStation } from "@/lib/db";
import { categoryImageFor } from "@/lib/cafe-image";
import { cafeAccess, cafeMenu, cafeDetails } from "@/lib/cafe-details";
import { directionsUrl } from "@/lib/maps";
import { cafeJsonLd, breadcrumbJsonLd, faqJsonLd, JsonLd } from "@/lib/schema-org";
import { t } from "@/lib/i18n";
import { wardNameJa } from "@/lib/ward-ja";
import { stationNameJa, lineNameJa } from "@/lib/station-ja";
import { cafeDescJa } from "@/lib/cafe-desc-ja";

const d = t("ja");
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllVenues().map((v) => ({ slug: v.slug }));
}

// Japanese value helpers (built from the same verified fields as the English page).
const wifiWord = (v: { hasWifi: boolean; wifiType?: string }) =>
  !v.hasWifi ? "なし" : v.wifiType === "free" ? "無料" : "有料";
const powerWord = (v: { hasPower: boolean; powerDensity?: string }) =>
  !v.hasPower ? "なし" : v.powerDensity === "many" ? "多め" : v.powerDensity === "some" ? "あり" : "カウンターのみ";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const v = getVenue(params.slug);
  if (!v) return {};
  const name = v.nameJa || v.name;
  const wifi = v.hasWifi ? "Wi-Fiあり" : "Wi-Fiなし";
  const power = v.hasPower ? "電源あり" : "電源なし";
  return {
    title: `${name}｜${wifi}・${power}`,
    description: `${name}（${stationNameJa(v.nearestStation)}周辺）の作業向け情報。${wifi}・${power}。確認日つきでご紹介します。`,
    alternates: {
      canonical: `/ja/cafe/${v.slug}`,
      languages: { en: `/cafe/${v.slug}`, ja: `/ja/cafe/${v.slug}`, "x-default": `/cafe/${v.slug}` },
    },
    openGraph: { title: `${name}｜${wifi}・${power}`, locale: "ja_JP", url: `/ja/cafe/${v.slug}` },
  };
}

export default function CafePageJa({ params }: { params: { slug: string } }) {
  const v = getVenue(params.slug);
  if (!v) notFound();
  const area = getArea(v.areaSlug);
  const areaName = area ? wardNameJa(area.slug, area.name) : "";
  const name = v.nameJa || v.name;
  const station = stationNameJa(v.nearestStation);
  const access = cafeAccess(v.slug);
  const menu = cafeMenu(v.slug);

  const wifiTxt = !v.hasWifi ? "Wi-Fiなし" : v.wifiType === "free" ? "無料Wi-Fiあり" : "Wi-Fiあり（有料）";
  const powerTxt = !v.hasPower ? "電源なし" : v.powerDensity === "many" ? "電源多め" : v.powerDensity === "some" ? "電源あり" : "電源はカウンターのみ";

  const faq = [
    {
      q: `${name}にWi-Fiはありますか？`,
      a: v.hasWifi
        ? `はい。${name}では${v.wifiType === "free" ? "無料" : "有料"}のWi-Fiが使えます（${v.lastChecked}時点）。`
        : `いいえ。${name}にお客様用のWi-Fiはありません（${v.lastChecked}時点）。`,
    },
    {
      q: `${name}に電源（コンセント）はありますか？`,
      a: v.hasPower
        ? `はい。${name}には電源があります（${v.powerDensity === "many" ? "多くの席" : v.powerDensity === "some" ? "一部の席" : "カウンター"}）。${v.lastChecked}時点。`
        : `いいえ。お客様が使える電源はありません（${v.lastChecked}時点）。`,
    },
    {
      q: `${name}はノートパソコンでの作業に向いていますか？`,
      a: v.laptopFriendly
        ? `はい。${v.hasWifi ? "Wi-Fi" : "Wi-Fiなし"}・${v.hasPower ? "電源あり" : "電源なし"}で、${station}の近くで作業に使えます。`
        : `長時間の作業より、短い利用に向いています。${v.hasPower ? "" : "電源はなく、"}時間帯によっては混雑することもあります。`,
    },
  ];

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: "/ja" },
        { name: d.page.common.tokyo, url: "/ja/tokyo" },
        ...(area ? [{ name: areaName, url: `/ja/tokyo/${area.slug}` }] : []),
        { name, url: `/ja/cafe/${v.slug}` },
      ])} />
      <JsonLd data={cafeJsonLd(v)} />
      <JsonLd data={faqJsonLd(faq)} />

      <p className="breadcrumb">
        <Link href="/ja">{d.page.common.home}</Link> / <Link href="/ja/tokyo">{d.page.common.tokyo}</Link>
        {area && <> / <Link href={`/ja/tokyo/${area.slug}`}>{areaName}</Link></>} / {name}
      </p>

      <CafeCover v={v} tall />
      {v.photoAttr ? (
        <p className="photo-credit">写真：{v.photoAttr}（Google 提供）</p>
      ) : v.hotpepperPhoto && v.hotpepperUrl ? (
        <p className="photo-credit">
          写真・情報：
          <a href={v.hotpepperUrl} target="_blank" rel="noopener noreferrer">ホットペッパーグルメ</a>
        </p>
      ) : !v.photoUrl && !v.photoRef && !v.hotpepperPhoto ? (() => {
        const c = categoryImageFor(v.name, v.nameJa, v.slug);
        if (!c) return null;
        return (
          <>
            <p className="photo-note">
              これはイメージ写真です。この店舗の実際の写真は準備中で、入手でき次第すぐに追加します。
            </p>
            <p className="photo-credit">
              参考写真：<a href={c.page} target="_blank" rel="noopener noreferrer">{c.author}</a>
              {c.license !== "Unsplash License" ? ` · ${c.license}` : " · Unsplash"}
            </p>
          </>
        );
      })() : null}

      <h1>{name}</h1>
      {v.nameJa && v.nameJa !== v.name && <p className="name-ja">{v.name}</p>}
      <div className="badges">
        <WifiBadge v={v} locale="ja" />
        <PowerBadge v={v} locale="ja" />
        {v.laptopFriendly && <span className="badge alt">{d.card.laptopFriendly}</span>}
      </div>

      {(() => {
        const prose = cafeDetails(v.slug)?.descJa || cafeDescJa(v.slug, v.name, v.nameJa);
        return (
          <p className="lede" style={{ marginTop: 14 }}>
            {prose || `${station}から徒歩${v.walkMinutes}分。${wifiTxt}・${powerTxt}。`}
          </p>
        );
      })()}

      <div className="facts">
        <div><span className="k">最寄り駅： </span>{station}（徒歩{v.walkMinutes}分）</div>
        <div><span className="k">Wi-Fi： </span>{wifiWord(v)}</div>
        <div><span className="k">電源： </span>{powerWord(v)}</div>
        <div><span className="k">営業時間： </span>{v.businessHours || "—"}</div>
        <div><span className="k">住所： </span>{v.address}</div>
        <div><span className="k">価格帯： </span>{v.priceBand || "—"}</div>
      </div>

      {(() => {
        const stations = v.stationSlugs.map((s) => getStation(s)).filter(Boolean) as NonNullable<ReturnType<typeof getStation>>[];
        const primary = stations.find((s) => s.name === v.nearestStation) || stations[0];
        if (!primary) return null;
        const others = stations.filter((s) => s.slug !== primary.slug);
        const lines = primary.lineNames?.length ? `（${primary.lineNames.map(lineNameJa).join("、")}）` : "";
        return (
          <p className="access" style={{ marginTop: 12 }}>
            <strong>アクセス：</strong>{stationNameJa(primary.name)}{lines}から徒歩約{v.walkMinutes}分です。
            {others.length ? `${others.map((s) => stationNameJa(s.name)).join("・")}からも徒歩圏内です。` : ""}
          </p>
        );
      })()}

      {access && (
        <div className="access-detail" style={{ margin: "10px 0 0", maxWidth: "70ch" }}>
          <p style={{ margin: "8px 0 0" }}>{access.ja}</p>
          <p style={{ margin: "10px 0 0" }}>
            <a
              href={`${directionsUrl(v)}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600 }}
            >
              Googleマップで道順を見る →
            </a>
          </p>
          <p className="muted" style={{ fontSize: ".78rem", margin: "8px 0 0" }}>
            確認日 {access.checked} ・ 情報元：
            {access.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? "、" : ""}
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
              </span>
            ))}
          </p>
        </div>
      )}

      {menu && (
        <section className="cafe-menu-detail" style={{ margin: "24px 0 4px" }}>
          <h2>メニュー</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: "480px" }}>
            {menu.items.map((it) => (
              <li
                key={it.en}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span>
                  {it.ja || it.en}
                  {it.en && it.en !== it.ja ? (
                    <span className="muted" style={{ fontSize: ".82rem" }}> · {it.en}</span>
                  ) : null}
                </span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{it.price}</span>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ fontSize: ".78rem", margin: "10px 0 0" }}>
            {menu.note ? `${menu.note} ` : ""}メニュー出典：
            <a href={menu.sourceUrl} target="_blank" rel="noopener noreferrer">{menu.sourceName}</a>（確認日 {menu.checked}）
          </p>
        </section>
      )}

      <FreshnessBadge date={v.lastChecked} confidence={v.confidence} locale="ja" />

      <CafeInstagram v={v} locale="ja" />

      <CafeMap v={v} locale="ja" />

      <section className="faq">
        <h2>{d.page.guides.faqHeading}</h2>
        {faq.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      {area && (
        <p style={{ marginTop: 24 }}>
          ← <Link href={`/ja/tokyo/${area.slug}`}>{areaName}のカフェをもっと見る</Link>
        </p>
      )}
    </div>
  );
}
