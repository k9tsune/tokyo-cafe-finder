import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides — working from cafes in Tokyo",
  description:
    "Practical guides for working from Tokyo cafes: the best neighbourhoods, how to find power outlets, and cafe etiquette in Japan.",
  alternates: { canonical: "/guides", languages: { en: "/guides", ja: "/ja/guides", "x-default": "/guides" } },
};

export default function GuidesIndex() {
  return (
    <div>
      <p className="breadcrumb">
        <Link href="/">Home</Link> / Guides
      </p>
      <h1>Guides</h1>
      <p className="lede">
        Short, practical guides to working from cafes in Tokyo, written from experience for visitors.
      </p>

      <div className="guide-list">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="guide-card">
            <h2>{g.title}</h2>
            <p>{g.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
