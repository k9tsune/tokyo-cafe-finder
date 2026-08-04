import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CafeMap from "@/components/CafeMap";
import CafeCover from "@/components/CafeCover";
import { WifiBadge, PowerBadge, FreshnessBadge } from "@/components/badges";
import { getAllVenues, getVenue, getArea } from "@/lib/db";
import { categoryImageFor } from "@/lib/cafe-image";
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
    alternates: { canonical: `/cafe/${v.slug}` },
  };
}

export default function CafePage({ params }: { params: { slug: string } }) {
  const v = getVenue(params.slug);
  if (!v) notFound();
  const area = getArea(v.areaSlug);

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
        const c = categoryImageFor(v.name, v.nameJa);
        if (!c) return null;
        return (
          <p className="photo-credit">
            Representative photo: <a href={c.page} target="_blank" rel="noopener noreferrer">{c.author}</a>
            {c.license !== "Unsplash License" ? ` · ${c.license}` : " · Unsplash"}
          </p>
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

      <FreshnessBadge date={v.lastChecked} confidence={v.confidence} />

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
