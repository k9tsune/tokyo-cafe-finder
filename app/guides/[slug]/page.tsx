import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuide, renderBlock } from "@/lib/guides";
import { JsonLd, articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { title: g.title, description: g.description, type: "article" },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();

  return (
    <article className="guide">
      <JsonLd data={articleJsonLd({ title: g.title, description: g.description, url: `/guides/${g.slug}`, date: g.date })} />
      <JsonLd data={faqJsonLd(g.faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: g.title, url: `/guides/${g.slug}` },
        ])}
      />

      <p className="breadcrumb">
        <Link href="/">Home</Link> / <Link href="/guides">Guides</Link> / {g.title}
      </p>
      <h1>{g.title}</h1>
      <p className="lede">{g.blurb}</p>

      {g.body.map(renderBlock)}

      <section className="faq">
        <h2>Frequently asked questions</h2>
        {g.faq.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <p className="guide-more">
        More guides: <Link href="/guides">all guides</Link> · Find a spot now on{" "}
        <Link href="/">WorkingCafes</Link>.
      </p>
    </article>
  );
}
