import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES_JA, getGuideJa } from "@/lib/guides-ja";
import { JsonLd, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";
import { t } from "@/lib/i18n";

const d = t("ja");
export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES_JA.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuideJa(params.slug);
  if (!g) return {};
  return {
    title: `${g.title}｜WorkingCafes`,
    description: g.description,
    alternates: { canonical: `/ja/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article", locale: "ja_JP", url: `/ja/guides/${g.slug}` },
  };
}

export default function GuidePageJa({ params }: { params: { slug: string } }) {
  const g = getGuideJa(params.slug);
  if (!g) notFound();

  return (
    <article className="guide">
      <JsonLd data={articleJsonLd({ title: g.title, description: g.description, url: `/ja/guides/${g.slug}`, date: g.date })} />
      <JsonLd data={faqJsonLd(g.faq)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: d.page.common.home, url: "/ja" },
        { name: d.page.common.guides, url: "/ja/guides" },
        { name: g.title, url: `/ja/guides/${g.slug}` },
      ])} />

      <p className="breadcrumb">
        <Link href="/ja">{d.page.common.home}</Link> / <Link href="/ja/guides">{d.page.common.guides}</Link> / {g.title}
      </p>
      <h1>{g.title}</h1>
      <p className="lede">{g.blurb}</p>

      {g.sections.map((s, i) => (
        <section key={i}>
          <h2>{s.h}</h2>
          {s.p.map((para, j) => <p key={j}>{para}</p>)}
        </section>
      ))}

      <section className="faq">
        <h2>{d.page.guides.faqHeading}</h2>
        {g.faq.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <p className="guide-more">
        {d.page.guides.allGuidesLead} <Link href="/ja/guides">{d.page.guides.allGuides}</Link> · {d.page.guides.findSpot}{" "}
        <Link href="/ja">WorkingCafes</Link>.
      </p>
    </article>
  );
}
