import type { Venue } from "@/lib/types";
import { categoryImageFor, categoryImageSrc } from "@/lib/cafe-image";

// Photo-ready cover. Priority: a direct photoUrl, then a real Google Places photo
// (photoRef), then a free HotPepper photo, then a Mapillary street-level photo
// (served fresh via /api/mapillary-photo so its signed URL never expires), then a
// representative category/chain image (Unsplash/Wikimedia — a chain's storefront
// where we have one, else a generic cafe photo), then a deterministic generated
// tile so every cafe always has a visual at zero cost.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function CafeCover({ v, tall = false }: { v: Venue; tall?: boolean }) {
  const hasReal = v.photoUrl || v.photoRef || v.hotpepperPhoto || v.mapillaryImageId;
  const cat = !hasReal ? categoryImageFor(v.name, v.nameJa, v.slug) : null;
  // The Mapillary tier is only reached when no higher-tier photo exists.
  const usingMapillary = !v.photoUrl && !v.photoRef && !v.hotpepperPhoto && !!v.mapillaryImageId;
  const src =
    v.photoUrl ||
    (v.photoRef ? `/api/place-photo?ref=${encodeURIComponent(v.photoRef)}&w=${tall ? 1000 : 700}` : "") ||
    v.hotpepperPhoto ||
    (usingMapillary ? `/api/mapillary-photo?id=${encodeURIComponent(v.mapillaryImageId!)}&w=${tall ? 1000 : 800}` : "") ||
    (cat ? categoryImageSrc(cat, tall ? 1000 : 800) : "");

  if (src) {
    return (
      <div className={`cover${tall ? " cover-tall" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`${v.name} — cafe near ${v.nearestStation}`} loading="lazy" />
        {usingMapillary && (
          // CC-BY-SA requires attribution wherever the image is shown, including
          // list thumbnails — this small overlay travels with the photo. The cafe
          // page additionally shows a full credit line below the cover.
          <a
            className="cover-attrib"
            href={v.mapillaryUrl || "https://www.mapillary.com"}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={`Street photo © ${v.mapillaryCreator || "Mapillary contributor"} · Mapillary · CC BY-SA`}
          >
            © {v.mapillaryCreator || "Mapillary"} · Mapillary
          </a>
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
