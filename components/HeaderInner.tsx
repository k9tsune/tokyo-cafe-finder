"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { t, stripLocale, localePath } from "@/lib/i18n";
import { SITE } from "@/lib/site";

// Header contents (brand + nav + theme toggle + language switch), made
// locale-aware from the pathname so /ja pages get Japanese labels and links to
// their Japanese equivalents. Also keeps <html lang> in sync for a11y/SEO.
export default function HeaderInner() {
  const pathname = usePathname() || "/";
  const { locale, path } = stripLocale(pathname);
  const d = t(locale);
  const other = locale === "ja" ? "en" : "ja";

  useEffect(() => {
    document.documentElement.lang = locale === "ja" ? "ja" : "en";
  }, [locale]);

  return (
    <div className="site-header-inner">
      <Link href={localePath("/", locale)} className="brand" aria-label={`${SITE.name} — home`}>
        <svg className="brand-mark" viewBox="2.8 7.0 14.6 9.2" width="24" height="24" aria-hidden="true" focusable="false" fill="none">
          <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M3.0 7.2H13.8C13.6 12 12.6 16.0 8.4 16.0C4.2 16.0 3.2 12 3.0 7.2ZM9.6 8.0 5.9 13.0H8.3L7.2 15.4 11.1 10.5H8.6L9.6 8.0Z" />
          <path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="M13.7 8.9C16.4 8.7 16.4 12.6 13.7 12.5" />
        </svg>
        <span className="brand-text"><span className="brand-w">Working</span><span className="brand-accent">Cafes</span></span>
      </Link>
      {/* The theme toggle sits with the brand (top-right on mobile; end of the
          row on desktop). The four link pills form two grouped pairs so they
          stay a consistent 2×2 grid on mobile and inline on desktop. */}
      <nav>
        <span className="nav-primary">
          <Link href={localePath("/map", locale)}>{d.nav.map}</Link>
          <Link href={localePath("/tokyo", locale)}>{d.nav.areas}</Link>
        </span>
        <span className="nav-secondary">
          <Link href={localePath("/guides", locale)}>{d.footer.guides}</Link>
          <Link className="lang-switch" href={localePath(path, other)} hrefLang={other} aria-label={d.otherLangName}>
            {d.otherLangName}
          </Link>
        </span>
      </nav>
      <ThemeToggle />
    </div>
  );
}
