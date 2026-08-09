import store from "@/data/instagram-photos.json";

// Instagram support has two independent parts:
//  1) The official-account LINK-OUT — just `Venue.instagram` (a URL). Linking to
//     a cafe's own account is always fine; no content is re-hosted.
//  2) The POST GALLERY — the cafe's OWN posts, rendered as Meta's official oEmbed
//     embeds and lazy-loaded (embed.js runs only when the gallery scrolls into
//     view — see components/CafeInstagram.tsx). We do NOT extract or self-host
//     images: Meta's oEmbed terms only allow rendering the official embed, so we
//     store just the post permalink. Only cleared posts (the cafe's own, or ones
//     with explicit permission) are shown.

export type IgPost = {
  permalink: string;    // the Instagram post URL — embedded via embed.js
  credit?: string;      // e.g. "@handle"
  ownAccount?: boolean; // the cafe's own account (safe to show)
  permission?: boolean; // explicit permission on file (safe to show)
};

type IgEntry = { handle?: string; posts?: IgPost[] };

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
 * Posts we are cleared to embed for this cafe: only the cafe's OWN posts or ones
 * with explicit permission on file. Everything else is withheld — this is the
 * gate that keeps rights-unclear content off the site.
 */
export function cafeInstagramPosts(slug: string): IgPost[] {
  const e = STORE[slug];
  if (!e || !Array.isArray(e.posts)) return [];
  return e.posts.filter((p) => p && p.permalink && (p.ownAccount || p.permission));
}
