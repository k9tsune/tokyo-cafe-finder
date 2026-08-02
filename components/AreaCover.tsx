// A generated, on-theme skyline tile for each Tokyo ward. Deterministic from the
// ward slug (colour + building heights), so every area gets a distinct little
// illustration without any external images or licensing.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function blossom(x: number, y: number, r: number): string {
  return `<g transform="translate(${x},${y}) scale(${r})" fill="#f4b8cd"><circle cx="0" cy="-2.4" r="1.9"/><circle cx="2.3" cy="-0.7" r="1.9"/><circle cx="1.4" cy="2" r="1.9"/><circle cx="-1.4" cy="2" r="1.9"/><circle cx="-2.3" cy="-0.7" r="1.9"/><circle cx="0" cy="0" r="0.9" fill="#e98bad"/></g>`;
}

export default function AreaCover({ slug, photo, name }: { slug: string; photo?: string; name?: string }) {
  // A real photo (when provided) replaces the generated tile.
  if (photo) {
    return (
      <div className="area-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name ? `${name}, Tokyo` : ""} loading="lazy" className="area-cover-img" />
      </div>
    );
  }

  const h = hash(slug);
  const hue = h % 360;
  const sky1 = `hsl(${hue} 60% 82%)`;
  const sky2 = `hsl(${(hue + 32) % 360} 72% 92%)`;
  const bldA = `hsl(${hue} 32% 50%)`;
  const bldB = `hsl(${hue} 28% 41%)`;

  const rects: string[] = [];
  let x = 3;
  for (let i = 0; i < 11 && x < 116; i++) {
    const seed = (h >> (i * 3)) & 0xff;
    const w = 8 + (seed % 7);
    const ht = 13 + (seed % 28);
    rects.push(`<rect x="${x}" y="${56 - ht}" width="${w}" height="${ht}" rx="1.4" fill="${i % 2 ? bldB : bldA}"/>`);
    x += w + 2;
  }

  const sunX = 16 + (h % 80);
  const gid = `sky-${slug}`;
  const svg =
    `<svg viewBox="0 0 120 56" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky2}"/><stop offset="1" stop-color="${sky1}"/></linearGradient></defs>` +
    `<rect width="120" height="56" fill="url(#${gid})"/>` +
    `<circle cx="${sunX}" cy="13" r="6" fill="#ffffff" opacity="0.6"/>` +
    rects.join("") +
    blossom(11, 11, 1) + blossom(108, 16, 0.8) +
    `</svg>`;

  return <div className="area-cover" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
