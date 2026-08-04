import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES_JA } from "@/lib/guides-ja";
import { t } from "@/lib/i18n";

const d = t("ja");

export const metadata: Metadata = {
  title: d.page.guides.metaTitle,
  description: d.page.guides.metaDescription,
  alternates: {
    canonical: "/ja/guides",
    languages: { en: "/guides", ja: "/ja/guides", "x-default": "/guides" },
  },
  openGraph: { title: d.page.guides.metaTitle, description: d.page.guides.metaDescription, locale: "ja_JP", url: "/ja/guides" },
};

export default function GuidesIndexJa() {
  return (
    <div>
      <p className="breadcrumb"><Link href="/ja">{d.page.common.home}</Link> / {d.page.common.guides}</p>
      <h1>{d.page.guides.h1}</h1>
      <p className="lede">{d.page.guides.lede}</p>

      <div className="guide-list">
        {GUIDES_JA.map((g) => (
          <Link key={g.slug} href={`/ja/guides/${g.slug}`} className="guide-card">
            <h2>{g.title}</h2>
            <p>{g.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
