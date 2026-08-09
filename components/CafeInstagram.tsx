"use client";

import { useEffect, useRef, useState } from "react";
import type { Venue } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cafeInstagramPosts, instagramHandle, instagramProfileUrl, type IgPost } from "@/lib/cafe-instagram";

// Official-account link-out + (when available) a gallery of the cafe's OWN posts,
// shown as Meta's official Instagram embeds. embed.js is loaded LAZILY — only when
// the gallery scrolls into view — so it never affects initial page load. We never
// extract or self-host the images (Meta's oEmbed terms only permit rendering the
// official embed). Renders nothing when a cafe has neither a handle nor posts.
const T = {
  en: {
    heading: (h: string) => `Posts from @${h} on Instagram`,
    caption: "The cafe's own recent Instagram posts.",
    link: (h: string) => `@${h} on Instagram`,
    view: "View on Instagram",
  },
  ja: {
    heading: (h: string) => `@${h} の Instagram 投稿`,
    caption: "カフェ公式 Instagram の最近の投稿です。",
    link: (h: string) => `@${h}（公式 Instagram）`,
    view: "Instagram で見る",
  },
};

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

// Renders the standard Instagram blockquotes and pulls in embed.js the first time
// the block nears the viewport, then asks it to render (and re-render) the embeds.
function InstagramEmbeds({ posts, viewLabel }: { posts: IgPost[]; viewLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Load only when close to the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Inject embed.js once (shared across all galleries) and process the blockquotes.
  useEffect(() => {
    if (!inView) return;
    const process = () => window.instgrm?.Embeds?.process();
    if (window.instgrm?.Embeds) {
      process();
      return;
    }
    const existing = document.getElementById("ig-embed-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", process);
      return () => existing.removeEventListener("load", process);
    }
    const s = document.createElement("script");
    s.id = "ig-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.addEventListener("load", process);
    document.body.appendChild(s);
  }, [inView]);

  return (
    <div className="ig-embeds" ref={ref} style={{ margin: "4px 0 0" }}>
      {/* Compact one-row layout: Instagram enforces a 326px min-width on each embed,
          so we scale the whole embed down with `zoom` rather than force a narrower
          width. Four across on desktop, stepping down to two, then one. */}
      <style>{`
        .ig-embeds { display: grid; grid-template-columns: repeat(4, max-content); gap: 10px; justify-content: center; align-items: start; }
        .ig-embeds .instagram-media { zoom: 0.66; margin: 0 !important; }
        @media (max-width: 1040px) { .ig-embeds { grid-template-columns: repeat(2, max-content); } .ig-embeds .instagram-media { zoom: 0.85; } }
        @media (max-width: 600px) { .ig-embeds { grid-template-columns: 1fr; justify-content: stretch; } .ig-embeds .instagram-media { zoom: 1; } }
      `}</style>
      {posts.map((p) => (
        <blockquote
          key={p.permalink}
          className="instagram-media"
          data-instgrm-permalink={`${p.permalink}${p.permalink.includes("?") ? "&" : "?"}utm_source=ig_embed`}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: 0,
            borderRadius: "3px",
            margin: 0,
          }}
        >
          <a href={p.permalink} target="_blank" rel="noopener noreferrer nofollow">
            {p.credit ? `${p.credit} · ${viewLabel}` : viewLabel}
          </a>
        </blockquote>
      ))}
    </div>
  );
}

export default function CafeInstagram({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const handle = instagramHandle(v.instagram);
  const url = instagramProfileUrl(v.instagram);
  const posts = cafeInstagramPosts(v.slug);
  if (!handle && posts.length === 0) return null;
  const t = T[locale] ?? T.en;

  return (
    <section className="cafe-ig">
      {posts.length > 0 && handle && (
        <>
          <h2>{t.heading(handle)}</h2>
          <InstagramEmbeds posts={posts} viewLabel={t.view} />
          <p className="ig-cap">{t.caption}</p>
        </>
      )}
      {handle && url && (
        <p className="ig-link">
          <a href={url} target="_blank" rel="noopener noreferrer nofollow">📷 {t.link(handle)} ↗</a>
        </p>
      )}
    </section>
  );
}
