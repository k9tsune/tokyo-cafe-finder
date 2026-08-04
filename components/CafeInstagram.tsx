import type { Venue } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cafeInstagramPhotos, instagramHandle, instagramProfileUrl } from "@/lib/cafe-instagram";

// Official-account link-out + (when available) a static gallery of the cafe's own
// Instagram posts. Thumbnails are self-hosted and lazy — no Instagram script runs
// in the visitor's browser, so this never slows the page. Renders nothing when a
// cafe has neither a handle nor cleared photos.
const T = {
  en: {
    heading: (h: string) => `Photos from @${h} on Instagram`,
    caption: "Shared by the cafe on Instagram — tap a photo to view the post.",
    link: (h: string) => `@${h} on Instagram`,
    view: "View on Instagram",
  },
  ja: {
    heading: (h: string) => `@${h} の Instagram 写真`,
    caption: "カフェ公式 Instagram の投稿です。写真をタップすると投稿を見られます。",
    link: (h: string) => `@${h}（公式 Instagram）`,
    view: "Instagram で見る",
  },
};

export default function CafeInstagram({ v, locale = "en" }: { v: Venue; locale?: Locale }) {
  const handle = instagramHandle(v.instagram);
  const url = instagramProfileUrl(v.instagram);
  const photos = cafeInstagramPhotos(v.slug);
  if (!handle && photos.length === 0) return null;
  const t = T[locale] ?? T.en;

  return (
    <section className="cafe-ig">
      {photos.length > 0 && handle && (
        <>
          <h2>{t.heading(handle)}</h2>
          <div className="ig-gallery">
            {photos.map((p, i) => (
              <a
                key={i}
                className="ig-thumb"
                href={p.permalink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={p.credit ? `${p.credit} · ${t.view}` : t.view}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.src} alt="" loading="lazy" />
              </a>
            ))}
          </div>
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
