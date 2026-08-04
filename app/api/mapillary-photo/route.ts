// Image proxy for Mapillary street-level photos (real-photo tier 3, below Google
// Places and HotPepper). The browser requests /api/mapillary-photo?id=<imageId>
// and this route resolves that id to a FRESH thumbnail URL server-side using the
// MAPILLARY_TOKEN, then streams the bytes back.
//
// Why a resolver instead of storing the URL: Mapillary serves thumbnails as
// signed CDN links that EXPIRE (~30 days). Committing them into data/mapillary.json
// would make every street photo break within a month. The durable key is the
// imageId, so we store only that and resolve on demand here. The image bytes are
// CDN-cached (the underlying photo never changes), so Mapillary is hit at most
// about once per photo per cache window — and each cache-miss re-resolves a fresh
// signed URL, so nothing ever goes stale.
//
// Mapillary read imagery is FREE and unmetered, but we still keep the token
// server-side (never exposed to the browser) and apply the same SSRF + same-site
// hardening as /api/place-photo.
//
// ATTRIBUTION: Mapillary imagery is CC-BY-SA. Wherever this photo is shown the
// page MUST credit the contributor + link the image + name the license. That UI
// lives with the render (CafeCover overlay + the cafe page credit line); this
// route only serves pixels.

export const runtime = "nodejs";

// Mapillary offers fixed thumbnail sizes; we resolve the two useful ones and pick
// by requested width so we never mint unbounded distinct cache keys.
const FIELD_1024 = "thumb_1024_url";
const FIELD_2048 = "thumb_2048_url";
// A real User-Agent — some CDNs (incl. the Facebook CDN Mapillary serves from)
// reject server-side fetches that send a blank/library UA.
const UA = "Mozilla/5.0 (compatible; workingcafes/1.0; +https://www.workingcafes.com)";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";
  // Trim: a trailing space/newline pasted into the env var is a common cause of a
  // "valid-looking token that 401s in prod only".
  const token = process.env.MAPILLARY_TOKEN?.trim();

  if (!token) return new Response("Photos not configured", { status: 404 });
  // Mapillary image ids are numeric strings — strict allow-list (SSRF guard).
  if (!/^[0-9]{1,25}$/.test(id)) {
    return new Response("Bad id", { status: 400 });
  }

  // Same-site guard: if a Referer is present it must be our own host. Blocks
  // other websites from hotlinking through us.
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (referer && host) {
    try {
      if (new URL(referer).host !== host) return new Response("Forbidden", { status: 403 });
    } catch {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Pick a size bucket: anything >= 1200px wants the 2048 thumb, else 1024.
  const reqW = parseInt(searchParams.get("w") || "800", 10);
  const field = reqW >= 1200 ? FIELD_2048 : FIELD_1024;

  // 1) Resolve the imageId to a fresh, signed thumbnail URL. Mapillary accepts the
  //    token either as ?access_token= or as an "Authorization: OAuth <token>"
  //    header — we send both so a strict edge can't reject one form.
  let thumbUrl: string | null = null;
  try {
    const metaRes = await fetch(
      `https://graph.mapillary.com/${id}?fields=${field}&access_token=${encodeURIComponent(token)}`,
      {
        headers: { Authorization: `OAuth ${token}`, "User-Agent": UA },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!metaRes.ok) {
      // Surface the real upstream status so "bad token (401)" is distinguishable
      // from rate-limiting (429) etc. Body is truncated to stay diagnostic-only.
      const body = (await metaRes.text().catch(() => "")).slice(0, 120);
      return new Response(`Upstream error (meta ${metaRes.status})${body ? ": " + body : ""}`, { status: 502 });
    }
    const meta = await metaRes.json();
    thumbUrl = meta?.[field] || meta?.[FIELD_1024] || meta?.[FIELD_2048] || null;
  } catch {
    return new Response("Upstream fetch failed (meta)", { status: 502 });
  }
  if (!thumbUrl) return new Response("No image", { status: 404 });

  // 2) Fetch the actual image bytes (the signed URL is short-lived, so we serve the
  //    bytes rather than redirecting the browser to it). Some CDNs reject requests
  //    with no User-Agent, so send a real one.
  let upstream: Response;
  try {
    upstream = await fetch(thumbUrl, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return new Response("Upstream fetch failed (image)", { status: 502 });
  }
  if (!upstream.ok) return new Response(`Upstream error (image ${upstream.status})`, { status: 502 });

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      // Cache the BYTES hard — the photo is immutable. On revalidation we re-resolve
      // a fresh signed URL, so this never serves a dead link.
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
