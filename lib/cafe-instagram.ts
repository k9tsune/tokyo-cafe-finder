import store from "@/data/instagram-photos.json";

// Instagram support has two independent parts:
//  1) The official-account LINK-OUT — just `Venue.instagram` (a URL). Linking to
//     a cafe's own account is always fine; no photo is re-hosted.
//  2) The PHOTO GALLERY — static thumbnails we self-host (public/ig/…), fetched at
//     BUILD time via Instagram's oEmbed (scripts/fetch-instagram.mjs). No Instagram
//     JS is ever shipped to visitors, so it never slows the page. Only photos we
//     are cleared to show are displayed: the cafe's OWN posts, or ones with
//     explicit permission. See `cafeInstagramPhotos`.

export type IgPhoto = {
  src: string;         // self-hosted thumbnail path, e.g. /ig/<slug>-1.jpg
  permalink: string;   // the Instagram post URL (link-through)
  credit?: string;     // e.g. "@handle" — shown/attributed
  ownAccount?: boolean; // the cafe's own account (safe to show)
  permission?: boolean; // explicit permission on file (safe to show)
};

type IgEntry = { handle?: string; photos?: IgPhoto[] };

const STORE = store as Record<string, IgEntry>;

/** Extract a bare handle ("abc") from a full instagram URL or an "@abc" string. */
export function instagramHandle(urlOrHandle?: string): string | undefined {
  if (!urlOrHandle) return undefined;
  const m = urlOrHandle.match(/instagram\.com\/([^/?#]+)/i);
  const raw = (m ? m[1] : urlOrHandle).replace(/^@/, "").trim();
  return raw && raw !== "instagram.com" ? raw : undefined;
}

/** Normalise a handle or URL to a canonical profile URL. */
export function instagramProfileUrl(urlOrHandle?: string): string | undefined {
  const h = instagramHandle(urlOrHandle);
  return h ? `https://www.instagram.com/${h}/` : undefined;
}

/**
 * Photos we are cleared to display for this cafe: only the cafe's OWN posts or
 * ones with explicit permission on file. Everything else is withheld — this is
 * the gate that keeps rights-unclear images off the site.
 */
export function cafeInstagramPhotos(slug: string): IgPhoto[] {
  const e = STORE[slug];
  if (!e || !Array.isArray(e.photos)) return [];
  return e.photos.filter((p) => p && p.src && (p.ownAccount || p.permission));
}
