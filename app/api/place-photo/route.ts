// Secure image proxy for Google Places photos. The browser requests
// /api/place-photo?ref=places/.../photos/... and this route fetches the image
// server-side using the SECRET GOOGLE_PLACES_KEY — so the key is never exposed.
// Responses are cached (CDN) so Google is hit at most about once per photo.
//
// Abuse hardening (each Google Photo fetch is BILLED once Places is enabled):
//  - `ref` is strictly validated (no SSRF — can't point at another host/path).
//  - width `w` is snapped to a small allow-list, so the endpoint can't be turned
//    into thousands of distinct (billed, cache-missing) fetches per photo by
//    sweeping the width.
//  - same-site Referer guard blocks other sites from hotlinking through us.
//  Keep a hard Google Cloud budget cap as the final backstop.

export const runtime = "nodejs";

const ALLOWED_WIDTHS = [320, 640, 700, 800, 1000, 1600];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref") || "";
  const key = process.env.GOOGLE_PLACES_KEY;

  if (!key) return new Response("Photos not configured", { status: 404 });
  // Only allow well-formed Places photo resource names (SSRF guard).
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(ref)) {
    return new Response("Bad reference", { status: 400 });
  }

  // Same-site guard: if a Referer is present it must be our own host. Blocks
  // other websites (and casual scrapers with a referer) from burning the quota.
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (referer && host) {
    try {
      if (new URL(referer).host !== host) return new Response("Forbidden", { status: 403 });
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Snap requested width to the nearest allowed value (bounds distinct cache keys).
  const reqW = parseInt(searchParams.get("w") || "800", 10);
  const w = ALLOWED_WIDTHS.reduce(
    (best, a) => (Math.abs(a - reqW) < Math.abs(best - reqW) ? a : best),
    800
  );

  const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${w}&key=${key}`;
  let upstream: Response;
  try {
    upstream = await fetch(url, { signal: AbortSignal.timeout(8000) });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok) return new Response("Upstream error", { status: 502 });

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
