import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CafeMap from "@/components/CafeMap";
import CafeCover from "@/components/CafeCover";
import CafeInstagram from "@/components/CafeInstagram";
import { WifiBadge, PowerBadge, FreshnessBadge } from "@/components/badges";
import { getAllVenues, getVenue, getArea, getStation } from "@/lib/db";
import { categoryImageFor } from "@/lib/cafe-image";
import { cafeAccess, cafeMenu } from "@/lib/cafe-details";
import { directionsUrl } from "@/lib/maps";
import { cafeJsonLd, cafeFaqJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/schema-org";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllVenues().map((v) => ({ slug: v.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const v = getVenue(params.slug);
  if (!v) return {};
  const wifi = v.hasWifi ? "Wi-Fi" : "no Wi-Fi";
  const power = v.hasPower ? "power outlets" : "no outlets";
  return {
    title: `${v.name} — ${wifi}, ${power}`,
    description: `${v.name} near ${v.nearestStation}: ${wifi}, ${power}. ${v.description}`,
    alternates: { canonical: `/cafe/${v.slug}`, languages: { en: `/cafe/${v.slug}`, ja: `/ja/cafe/${v.slug}`, "x-default": `/cafe/${v.slug}` } },
  };
}

export default function CafePage({ params }: { params: { slug: string } }) {
  const v = getVenue(params.slug);
  if (!v) notFound();
  const area = getArea(v.areaSlug);
  const access = cafeAccess(v.slug);
  const menu = cafeMenu(v.slug);

  const faq = cafeFaqJsonLd(v);

  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Tokyo", url: "/tokyo" },
        ...(area ? [{ name: area.name, url: `/tokyo/${area.slug}` }] : []),
        { name: v.name, url: `/cafe/${v.slug}` },
      ])} />
      <JsonLd data={cafeJsonLd(v)} />
      <JsonLd data={faq} />

      <p className="breadcrumb">
        <Link href="/">Home</Link> / <Link href="/tokyo">Tokyo</Link>
        {area && <> / <Link href={`/tokyo/${area.slug}`}>{area.name}</Link></>} / {v.name}
      </p>

      <CafeCover v={v} tall />
      {v.photoAttr ? (
        <p className="photo-credit">Photo: {v.photoAttr} · via Google</p>
      ) : v.hotpepperPhoto && v.hotpepperUrl ? (
        <p className="photo-credit">
          Photo &amp; details via{" "}
          <a href={v.hotpepperUrl} target="_blank" rel="noopener noreferrer">
            ホットペッパーグルメ
          </a>
        </p>
      ) : !v.photoUrl && !v.photoRef && !v.hotpepperPhoto ? (() => {
        const c = categoryImageFor(v.name, v.nameJa, v.slug);
        if (!c) return null;
        return (
          <>
            <p className="photo-note">
              Representative photo only: I&apos;m still sourcing this cafe&apos;s actual photo and will add it as soon as I can!
            </p>
            <p className="photo-credit">
              Representative photo: <a href={c.page} target="_blank" rel="noopener noreferrer">{c.author}</a>
              {c.license !== "Unsplash License" ? ` · ${c.license}` : " · Unsplash"}
            </p>
          </>
        );
      })() : null}

      <h1>{v.name}</h1>
      {v.nameJa && <p className="name-ja" lang="ja">{v.nameJa}</p>}
      <div className="badges">
        <WifiBadge v={v} />
        <PowerBadge v={v} />
        {v.laptopFriendly && <span className="badge alt">Laptop-friendly</span>}
      </div>

      <p className="lede" style={{ marginTop: 14 }}>{v.description}</p>

      <div className="facts">
        <div><span className="k">Nearest station: </span>{v.nearestStation} ({v.walkMinutes} min walk)</div>
        <div><span className="k">Wi-Fi: </span>{v.hasWifi ? (v.wifiType === "free" ? "Free" : "Paid") : "No"}</div>
        <div><span className="k">Power outlets: </span>{v.hasPower ? v.powerDensity : "No"}</div>
        <div><span className="k">Hours: </span>{v.businessHours || "—"}</div>
        <div><span className="k">Address: </span>{v.address}</div>
        <div><span className="k">Typical busyness: </span>{v.typicalBusyness || "—"}</div>
      </div>

      {(() => {
        const stations = v.stationSlugs.map((s) => getStation(s)).filter(Boolean) as NonNullable<ReturnType<typeof getStation>>[];
        const primary = stations.find((s) => s.name === v.nearestStation) || stations[0];
        if (!primary) return null;
        const others = stations.filter((s) => s.slug !== primary.slug);
        const lines = primary.lineNames?.length ? ` (${primary.lineNames.join(", ")})` : "";
        return (
          <p className="access" style={{ marginTop: 12 }}>
            <strong>Getting there:</strong> {primary.name}{lines} is about {v.walkMinutes} minute{v.walkMinutes === 1 ? "" : "s"} away on foot.
            {others.length ? ` It's also within walking distance of ${others.map((s) => s.name).join(" and ")}.` : ""}
          </p>
        );
      })()}

      {access && (
        <div className="access-detail" style={{ margin: "10px 0 0", maxWidth: "70ch" }}>
          <p style={{ margin: "8px 0 0" }}>{access.en}</p>
          <p style={{ margin: "10px 0 0" }}>
            <a
              href={`${directionsUrl(v)}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600 }}
            >
              Step-by-step walking directions on Google Maps →
            </a>
          </p>
          <p className="muted" style={{ fontSize: ".78rem", margin: "8px 0 0" }}>
            Checked {access.checked} · Sources:{" "}
            {access.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? ", " : ""}
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
              </span>
            ))}
          </p>
        </div>
      )}

      {menu && (
        <section className="cafe-menu-detail" style={{ margin: "24px 0 4px" }}>
          <h2>Menu</h2>
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
                  {it.en}
                  {it.ja && it.ja !== it.en ? (
                    <span className="muted" style={{ fontSize: ".82rem" }}> · {it.ja}</span>
                  ) : null}
                </span>
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{it.price}</span>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ fontSize: ".78rem", margin: "10px 0 0" }}>
            {menu.note ? `${menu.note} ` : ""}Menu from{" "}
            <a href={menu.sourceUrl} target="_blank" rel="noopener noreferrer">{menu.sourceName}</a>, checked {menu.checked}.
          </p>
        </section>
      )}

      <FreshnessBadge date={v.lastChecked} confidence={v.confidence} />

      <CafeInstagram v={v} />

      <CafeMap v={v} />

      <section className="faq">
        <h2>Frequently asked questions</h2>
        {faq.mainEntity.map((m: any) => (
          <details key={m.name}>
            <summary>{m.name}</summary>
            <p>{m.acceptedAnswer.text}</p>
          </details>
        ))}
      </section>

      {area && (
        <p style={{ marginTop: 24 }}>
          ← More <Link href={`/tokyo/${area.slug}`}>cafes in {area.name}</Link>
        </p>
      )}
    </div>
  );
}
