"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, stripLocale, localePath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

// Locale-aware footer. Guides link to the current locale; the About/Contact/
// Privacy/Credits pages are shared (English) for now, so they stay at the root.
export default function SiteFooter() {
  const pathname = usePathname() || "/";
  const { locale } = stripLocale(pathname);
  const f = t(locale).footer;
  return (
    <footer className="site-footer">
      <p>{SITE.name} — {f.tagline}</p>
      <p className="attrib">{f.attrib}</p>
      <nav>
        <Link href={localePath("/guides", locale)}>{f.guides}</Link>
        <Link href="/about">{f.about}</Link>
        <Link href="/contact">{f.contact}</Link>
        <Link href="/credits">{f.credits}</Link>
        <Link href="/privacy">{f.privacy}</Link>
      </nav>
    </footer>
  );
}
