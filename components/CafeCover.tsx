import type { Venue } from "@/lib/types";

// Photo-ready cover. If the venue has a photoUrl (e.g. a Google Places photo,
// added later), it shows the real photo. Otherwise it renders a deterministic,
// on-brand generated cover so every cafe has a distinct visual at zero cost and
// with no external dependency.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function CafeCover({ v, tall = false }: { v: Venue; tall?: boolean }) {
  if (v.photoUrl) {
    return (
      <div className={`cover${tall ? " cover-tall" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={v.photoUrl} alt={`${v.name} — cafe in ${v.nearestStation}`} loading="lazy" />
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
