import type { Venue } from "@/lib/types";
import { categoryImageFor, categoryImageSrc, isChain, type CategoryImage } from "@/lib/cafe-image";

// Photo-ready cover. Priority: a direct photoUrl, then a real Google Places photo
// (photoRef), then a free HotPepper photo, then a representative category/chain
// image (Unsplash/Wikimedia — a chain's storefront where we have one, else a
// generic cafe photo), then a deterministic generated tile so every cafe always
// has a visual at zero cost.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function CafeCover({ v, tall = false, cover }: { v: Venue; tall?: boolean; cover?: (CategoryImage & { key?: string }) | null }) {
  const hasReal = v.photoUrl || v.photoRef || v.hotpepperPhoto;
  // Use the caller-resolved cover when provided (list threads it to avoid the same
  // pool image twice in a row); otherwise resolve independently (e.g. detail page).
  const cat = cover !== undefined ? cover : (!hasReal ? categoryImageFor(v.name, v.nameJa, v.slug) : null);
  // Chain covers are storefront/sign shots — anchor to the top so the brand logo
  // (usually along the top of the photo) isn't cropped out by object-fit: cover.
  const chainCover = !hasReal && !!cat && isChain(v.name, v.nameJa);
  const src =
    v.photoUrl ||
    (v.photoRef ? `/api/place-photo?ref=${encodeURIComponent(v.photoRef)}&w=${tall ? 1000 : 700}` : "") ||
    v.hotpepperPhoto ||
    (cat ? categoryImageSrc(cat, tall ? 1000 : 800) : "");

  if (src) {
    return (
      <div className={`cover${tall ? " cover-tall" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={chainCover ? "cover-chain" : undefined} src={src} alt={`${v.name} — cafe near ${v.nearestStation}`} loading={tall ? "eager" : "lazy"} decoding="async" width={tall ? 1000 : 800} height={tall ? 600 : 480} />
        {!hasReal && tall && (
          <span className="cover-rep" title="We're still sourcing this cafe's actual photo.">📷 Representative photo</span>
        )}
      </div>
    );
  }

  const h = hash(v.slug);
  const hue1 = 16 + (h % 28);            // warm browns / ambers
  const hue2 = 24 + ((h >> 4) % 22);
  const angle = 125 + (h % 12);
  const bg = `linear-gradient(${angle}deg, hsl(${hue1} 56% 44%), hsl(${hue2} 50% 29%))`;
  const initial = (v.name.match(/[A-Za-z0-9]/)?.[0] || "☕").toUpperCase();

  return (
    <div className={`cover${tall ? " cover-tall" : ""}`} style={{ background: bg }} aria-hidden="true">
      <span className="cover-glyph">{initial}</span>
      <span className="cover-cup">☕</span>
    </div>
  );
}
