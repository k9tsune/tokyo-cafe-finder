// Secure image proxy for Google Places photos. The browser requests
// /api/place-photo?ref=places/.../photos/... and this route fetches the image
// server-side using the SECRET GOOGLE_PLACES_KEY — so the key is never exposed.
// Responses are cached (CDN) so Google is hit at most about once per photo.

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref") || "";
  const wReq = parseInt(searchParams.get("w") || "800", 10);
  const key = process.env.GOOGLE_PLACES_KEY;

  if (!key) return new Response("Photos not configured", { status: 404 });
  // Only allow well-formed Places photo resource names.
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(ref)) {
    return new Response("Bad reference", { status: 400 });
  }
  const w = Math.min(Math.max(Number.isFinite(wReq) ? wReq : 800, 80), 1600);

  const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${w}&key=${key}`;
  let upstream: Response;
  try {
    upstream = await fetch(url);
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
