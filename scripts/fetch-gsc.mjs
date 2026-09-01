// Pulls Search Console performance data into the repo so the scheduled cafe
// update can report on SEO trends instead of guessing.
//
// Free: the Search Console API needs NO billing account, unlike Places.
// No npm dependency either — the service-account JWT is signed with node:crypto.
//
// Setup (one time):
//   1. Google Cloud console -> enable "Google Search Console API"
//   2. Create a service account, download its JSON key
//   3. Search Console -> Settings -> Users and permissions -> add the service
//      account's email as a Restricted user
//   4. Put the whole JSON key in the GSC_SA_KEY env var (a GitHub Actions secret)
//
// Run:  npm run gsc
// Out:  data/gsc/latest.json  +  data/gsc/<endDate>.json (committed, so trends
//       can be compared across months)

import { createSign } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const OUT_DIR = "data/gsc";
// Search Console data lags a couple of days; asking for yesterday returns holes.
const LAG_DAYS = 3;
const WINDOW_DAYS = 28;

const b64url = (s) => Buffer.from(s).toString("base64url");
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};

const readJson = async (res, what) => {
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${what}: HTTP ${res.status}, non-JSON reply — ${text.slice(0, 120).replace(/\s+/g, " ")}`);
  }
  return body;
};

async function loadKey() {
  const raw = process.env.GSC_SA_KEY;
  if (raw) return JSON.parse(raw);
  const file = process.env.GSC_KEY_FILE;
  if (file) return JSON.parse(await readFile(file, "utf8"));
  return null;
}

// Service-account JWT -> OAuth access token. No library needed.
async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const body = await readJson(res, "token exchange");
  if (!res.ok) throw new Error(`token exchange failed: ${body.error_description || body.error || res.status}`);
  return body.access_token;
}

const api = async (token, path, init = {}) => {
  const res = await fetch(`https://searchconsole.googleapis.com/webmasters/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const body = await readJson(res, path);
  if (!res.ok) throw new Error(`${path}: ${body.error?.message || res.status}`);
  return body;
};

// Work out which property to read. Explicit GSC_SITE_URL wins; otherwise pick
// the one the service account can actually see, preferring www over the apex
// (www is our canonical host) and a domain property over neither.
async function pickSite(token) {
  if (process.env.GSC_SITE_URL) return process.env.GSC_SITE_URL;
  const { siteEntry = [] } = await api(token, "/sites");
  const usable = siteEntry.filter((s) => s.permissionLevel !== "siteUnverifiedUser").map((s) => s.siteUrl);
  if (!usable.length) {
    throw new Error(
      "the service account can't see any properties yet — add its email as a user in Search Console (Settings -> Users and permissions)"
    );
  }
  const rank = (u) => (u.includes("//www.") ? 0 : u.startsWith("sc-domain:") ? 1 : 2);
  return usable.sort((a, b) => rank(a) - rank(b))[0];
}

const query = (token, site, body) =>
  api(token, `/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    body: JSON.stringify({ type: "web", ...body }),
  });

const totals = (rows) =>
  rows.length
    ? { clicks: rows[0].clicks, impressions: rows[0].impressions, ctr: rows[0].ctr, position: rows[0].position }
    : { clicks: 0, impressions: 0, ctr: 0, position: 0 };

// Which part of the site a URL belongs to, so we can see whether the cafe pages
// (the ones with the weakest CTR) are actually improving.
function pageType(url) {
  const p = url.replace(/^https?:\/\/[^/]+/, "");
  const s = p.replace(/^\/ja(?=\/|$)/, "") || "/";
  if (s === "/") return "home";
  if (s.startsWith("/cafe/")) return "cafe";
  if (s.startsWith("/tokyo/station/")) return "station";
  if (/^\/tokyo\/[^/]+\/[^/]+$/.test(s)) return "ward-feature";
  if (/^\/tokyo\/[^/]+$/.test(s)) return "ward-or-hub";
  if (s.startsWith("/guides/")) return "guide";
  return "other";
}

function byType(rows) {
  const out = {};
  for (const r of rows) {
    const t = pageType(r.keys[0]);
    const b = (out[t] ||= { pages: 0, clicks: 0, impressions: 0, position: 0 });
    b.pages++;
    b.clicks += r.clicks;
    b.impressions += r.impressions;
    b.position += r.position * r.impressions;
  }
  for (const b of Object.values(out)) {
    b.ctr = b.impressions ? b.clicks / b.impressions : 0;
    b.position = b.impressions ? b.position / b.impressions : 0;
  }
  return out;
}

const pct = (n) => `${(n * 100).toFixed(2)}%`;
const delta = (now, was) => {
  if (!was) return "";
  const d = ((now - was) / was) * 100;
  return ` (${d >= 0 ? "+" : ""}${d.toFixed(0)}% vs previous ${WINDOW_DAYS}d)`;
};

async function main() {
  const key = await loadKey();
  if (!key) {
    console.log(
      "fetch-gsc: SKIPPED — no GSC_SA_KEY (or GSC_KEY_FILE) set. See the setup notes at the top of this file."
    );
    return;
  }

  const endDate = daysAgo(LAG_DAYS);
  const startDate = daysAgo(LAG_DAYS + WINDOW_DAYS - 1);
  const prevEnd = daysAgo(LAG_DAYS + WINDOW_DAYS);
  const prevStart = daysAgo(LAG_DAYS + WINDOW_DAYS * 2 - 1);

  const token = await getAccessToken(key);
  const site = await pickSite(token);
  console.log(`fetch-gsc: ${site}  ${startDate} .. ${endDate}`);

  const [now, prev, pages, queries, dates] = await Promise.all([
    query(token, site, { startDate, endDate }),
    query(token, site, { startDate: prevStart, endDate: prevEnd }),
    query(token, site, { startDate, endDate, dimensions: ["page"], rowLimit: 500 }),
    query(token, site, { startDate, endDate, dimensions: ["query"], rowLimit: 500 }),
    query(token, site, { startDate, endDate, dimensions: ["date"], rowLimit: 100 }),
  ]);

  const t = totals(now.rows || []);
  const p = totals(prev.rows || []);
  const pageRows = pages.rows || [];

  const payload = {
    site,
    window: { startDate, endDate, days: WINDOW_DAYS },
    previous: { startDate: prevStart, endDate: prevEnd, ...p },
    totals: t,
    byPageType: byType(pageRows),
    topPages: pageRows.slice(0, 100).map((r) => ({
      url: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    topQueries: (queries.rows || []).slice(0, 100).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    daily: (dates.rows || []).map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    fetchedAt: new Date().toISOString(),
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(`${OUT_DIR}/latest.json`, JSON.stringify(payload, null, 2) + "\n");
  await writeFile(`${OUT_DIR}/${endDate}.json`, JSON.stringify(payload, null, 2) + "\n");

  console.log(
    `\n  clicks       ${t.clicks}${delta(t.clicks, p.clicks)}` +
      `\n  impressions  ${t.impressions}${delta(t.impressions, p.impressions)}` +
      `\n  CTR          ${pct(t.ctr)}  (was ${pct(p.ctr)})` +
      `\n  position     ${t.position.toFixed(1)}  (was ${p.position.toFixed(1)})\n`
  );
  for (const [type, b] of Object.entries(payload.byPageType).sort((a, b2) => b2[1].impressions - a[1].impressions)) {
    console.log(
      `  ${type.padEnd(13)} ${String(b.impressions).padStart(6)} impr  ${String(b.clicks).padStart(4)} clicks  ` +
        `CTR ${pct(b.ctr).padStart(6)}  pos ${b.position.toFixed(1)}`
    );
  }
  console.log(`\nwrote ${OUT_DIR}/latest.json and ${OUT_DIR}/${endDate}.json`);
}

// Never let this break a build or a scheduled run — the site does not depend on it.
main().catch((e) => {
  console.error("fetch-gsc (non-fatal):", e.message);
  process.exit(0);
});
