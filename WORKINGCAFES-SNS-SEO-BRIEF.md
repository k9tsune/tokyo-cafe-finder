# WorkingCafes — Project Brief for SNS Promotion & SEO

**Purpose of this document:** hand off everything a new collaborator needs to promote **WorkingCafes** on social media and improve its search visibility. It covers what the site is, who it's for, its current state, the SEO already in place, and concrete opportunities and ideas to pursue. No prior context with the project is assumed.

**Live site:** https://www.workingcafes.com
**English:** at the root (`/…`) · **Japanese:** under `/ja/…`

---

## 1. Snapshot (as of August 2026)

- **585 cafes** listed across **all 23 Tokyo wards**, attached to **~199 stations**.
- Amenity coverage: **568** have Wi-Fi, **528** have power outlets, **511** have **both**.
- **Bilingual:** full English site + full Japanese (localized, not machine-translated) site. Every cafe has a Japanese description (211 individually written + the rest via per-brand templates = **100% coverage**).
- **Guides:** 3 in English, 3 in Japanese.
- **Tech:** Next.js (static-generated for SEO), deployed on Vercel, auto-deploy from the `main` branch on GitHub.

---

## 2. What the site is

WorkingCafes helps people find cafes that are actually good for working on a laptop — specifically **Wi-Fi and power outlets** — in Tokyo. Each listing states whether a cafe has Wi-Fi (free/paid), power (many/some/counter-only/none), the nearest station and walk time, hours, price band, and a **"last checked" date** so users can trust the information is current. Users can search by station or area, filter for Wi-Fi / outlets / both / late-night, or use "near me" geolocation (including a "phone dying? nearest outlet" mode).

The brand is intentionally global (`WorkingCafes`, not "Tokyo…") so it can expand to more cities and countries later; Tokyo is the launch market.

### Who it's for (two distinct audiences)
- **English side:** overseas remote workers / "digital nomads," expats living in Tokyo, and business/leisure travelers who need to get work done. Many read English as a second language, so copy is deliberately plain and simple.
- **Japanese side:** **domestic** users — ノマドワーカー (nomad workers), テレワーク (telework) employees, フリーランス (freelancers), and 学生 (students looking to study). This is NOT tourist-facing; the Japanese content was written for locals and their search habits.

---

## 3. Site structure & key URL patterns

| Page type | English | Japanese |
|---|---|---|
| Home | `/` | `/ja` |
| Tokyo hub (areas + stations) | `/tokyo` | `/ja/tokyo` |
| Area (ward) page | `/tokyo/{area}` | `/ja/tokyo/{area}` |
| Station page | `/tokyo/station/{station}` | `/ja/tokyo/station/{station}` |
| Cafe page | `/cafe/{slug}` | `/ja/cafe/{slug}` |
| Guides index | `/guides` | `/ja/guides` |
| Guide article | `/guides/{slug}` | `/ja/guides/{slug}` |
| Map | `/map` | `/ja/map` |

Roughly **1,600 static pages**. Every page has a JA/EN counterpart linked via hreflang.

---

## 4. SEO already in place (don't redo — build on it)

- **Static generation (SSG):** every page is prerendered HTML, fast and fully crawlable.
- **hreflang alternates:** EN⇄JA linked both ways with `x-default`, so Google serves the right language.
- **Structured data (JSON-LD):** Breadcrumb, FAQ, and Article schema on the relevant pages; cafe pages carry place/cafe schema. FAQ schema can win rich results.
- **XML sitemap:** auto-regenerated on every build, includes all EN + JA routes (`/sitemap.xml`).
- **Freshness signals:** every listing shows a "last checked" date and a confidence level — good for E-E-A-T and user trust.
- **Localized (not translated) Japanese:** original JA prose, polite です・ます tone, real kanji station/line names, Japanese guides written for Japanese search intent.
- **Plain-English rule** on the EN side for ESL readers (short sentences, no jargon).
- **Original content only:** descriptions are written in-house, never copied from sources — no duplicate-content risk.
- **Photo sourcing:** free HotPepper photos where available (with required attribution link); a representative/stock cover with a clear disclaimer when a real photo isn't available yet, in both languages.

---

## 5. Data & freshness pipeline (why the content stays current)

An automated weekly job re-researches cafes (Japanese + English sources), writes original one-line summaries + an original Japanese description per cafe, scores confidence, and opens a pull request; merging publishes and Vercel redeploys. High-confidence updates auto-publish; only conflicting/uncertain cases are flagged for a human. New cafes automatically get a free HotPepper photo. Practical implication for SEO: **content is regularly refreshed and growing**, which search engines reward — lean into "updated weekly / dated listings" as a trust message.

---

## 6. Google indexing — current status & timeline

The domain is new, so indexing builds up over time:

- **First pages indexed:** typically a few days to ~2 weeks after the sitemap is discovered.
- **Broad coverage of ~1,600 pages:** several weeks to a couple of months; Google crawls gradually and may not index every single page (thin/near-duplicate station pages are the most at risk).
- **What speeds it up (do these first):**
  1. Set up **Google Search Console** (and **Bing Webmaster Tools**) for the domain.
  2. Submit the sitemap: `https://www.workingcafes.com/sitemap.xml`.
  3. Use **URL Inspection → Request indexing** for the top pages: `/`, `/tokyo`, `/ja`, `/ja/tokyo`, the guides, and the biggest area pages (Shibuya, Shinjuku, Chiyoda/Marunouchi, Minato).
  4. Earn a few **inbound links** (see SNS section) — new domains crawl slowly until they gain trust.
  5. Keep internal linking strong (area→station→cafe already interlink well).
- **How to monitor:** Search Console "Pages" report (indexed vs not), Performance report (impressions/clicks/queries), and `site:workingcafes.com` in Google for a rough count.

> Set up Search Console before anything else — it's how you'll measure everything below.

---

## 7. SEO improvement opportunities (prioritized)

**Quick wins**
- Verify Search Console + submit sitemaps (EN and JA both covered by the one sitemap).
- Confirm each area/station page has ≥ a few unique sentences (avoid thin, templated-only pages). Consider a short unique intro per station.
- Add internal links from guides to relevant area/cafe pages (guides currently link back to the hub, not deep pages).
- Make sure Open Graph / Twitter Card images render nicely when links are shared (check a cafe and an area page in a card validator).

**Content / keyword expansion**
- Build more **area + intent landing pages** that match how people search (see keyword lists below). Japanese area-based search is strong ("渋谷 作業カフェ", "東京駅 電源カフェ").
- Expand guides: topic ideas that match search demand — "best late-night / 24h work cafes in Tokyo," "free vs paid work cafes," "cafes with outlets at every seat," and JA equivalents ("全席電源のカフェ", "24時間 作業カフェ 東京", "勉強できるカフェ 東京").
- Consider per-ward "best work cafes in {ward}" roundups (these rank well and are shareable).

**Technical / authority**
- Core Web Vitals check (should be strong given SSG, but verify LCP on image-heavy pages).
- Earn backlinks: nomad/expat directories, "Tokyo remote work" blog roundups, Japanese ノマド/コワーキング media, university/student resources.
- Add `BreadcrumbList` is present; consider `ItemList` schema on area pages listing the cafes.

---

## 8. Keyword targets

**English (nomad/expat/traveler intent)**
- tokyo cafes with wifi and power outlets; work-friendly cafe tokyo; laptop cafe tokyo; remote work cafe tokyo; cafes with outlets tokyo; {area} cafe wifi (e.g. shibuya, shinjuku, ginza); cafe near {station} to work; where to work in tokyo; digital nomad tokyo cafes; 24 hour cafe tokyo work.

**Japanese (domestic — high priority, strong volume)**
- 作業カフェ 東京 / {エリア} 作業カフェ (e.g. 渋谷・新宿・銀座・東京駅)
- ノマドカフェ 東京 · 電源カフェ 東京 · Wi-Fi カフェ 東京
- テレワーク カフェ · リモートワーク カフェ · 勉強できるカフェ 東京
- 全席電源 カフェ · 24時間 カフェ 作業 · {駅名} 電源 カフェ
- Common content formats that rank: "おすすめ○選", "選び方/コツ", area-specific roundups.

---

## 9. SNS / promotion strategy (starting points)

The site's superpower for social is that it's **useful, specific, and visual** — real places, real amenities, dated info. Lead with utility, not ads.

### Platforms & audience fit
- **X / Twitter (JP + EN):** best for quick "cafe of the day" posts, threads, and reaching the JP ノマド/エンジニア/フリーランス community (very active there). Two accounts or bilingual posts.
- **Instagram (JP + EN):** cafe photos, Reels of "work-friendly cafe tours," carousels ("5 全席電源カフェ in 渋谷"). Strong for the aesthetic Tokyo-cafe audience.
- **TikTok / Reels:** short "POV: you need a cafe with an outlet in Shinjuku" clips; POV/nomad content performs well.
- **Note (note.com) / Japanese blogs:** the JP work-cafe niche lives here; long-form roundups drive SEO backlinks too.
- **Reddit (EN):** r/Tokyo, r/japanlife, r/digitalnomad — share genuinely useful roundups (follow each sub's self-promo rules).
- **Threads / LINE / Facebook groups** (expat & nomad groups) as secondary.

### Content pillars (repeatable formats)
1. **"Cafe of the day"** — one cafe, photo, station, Wi-Fi/outlet facts, link. Daily/near-daily, cheap to produce (585 to draw from).
2. **Area roundups** — "5 best work cafes near {station}." Carousel or thread. Links to the area page.
3. **Problem/solution** — "Phone dying in Shibuya? Here's the nearest outlet" → shows the "nearest outlet" feature.
4. **Behind-the-data / trust** — "every listing is dated so you know it's current," weekly-updated angle.
5. **Guide teasers** — pull a tip from a guide (etiquette, how to find outlets, area guide) → link to the full guide.
6. **Seasonal / topical** — "late-night work cafes," "quiet cafes for deep work," exam season (勉強カフェ) for the JP student audience.

### Hashtags (starting set)
- JP: #作業カフェ #ノマドカフェ #電源カフェ #ノマドワーカー #テレワーク #フリーランス #東京カフェ #勉強垢 #カフェ勉強
- EN: #TokyoCafe #DigitalNomad #RemoteWork #WorkFromCafe #TokyoRemoteWork #NomadLife #Tokyo

### Cadence & measurement
- Start ~3–5 posts/week per platform; double down on whatever format gets saves/shares.
- Track: profile→site clicks (UTM tags on links), which posts drive Search Console impressions, saves/shares (best signal for utility content).
- Every social link is also a (nofollow) discovery path for Google — consistent posting helps crawl discovery and, over time, real backlinks.

---

## 10. Assets available to promote

- 585 cafe pages (photos where available), 23 area pages with cover photos, ~199 station pages.
- 6 guides (3 EN, 3 JA) — good link-bait and thread material.
- Distinctive brand look: rounded "WorkingCafes" wordmark with a coffee-cup mark, a Tokyo-skyline header band, hand-drawn pin/battery icons, day/night mode.
- The "nearest outlet / phone dying" feature and the dated-listings trust angle are both strong hooks.

---

## 11. Brand voice & rules to respect

- **English:** short, simple, friendly sentences for ESL readers. Keep coffee terms; gloss Japanese terms on first use.
- **Japanese:** warm, polite です・ます; domestic (not tourist) framing; light kaomoji are on-brand in the guides (e.g. `(・ω・)ﾉ`, `( ˘ω˘ )`).
- **Always original content** — never copy text or use rights-unclear images.
- **Accuracy > hype:** the whole value prop is trustworthy, dated info. Don't overstate (e.g. don't claim "checked by hand" — the pipeline is automated). Amenity claims must match the site's data.
- **Ad-free / not spammy:** promotion should feel genuinely helpful.

---

## 12. Access & handoff notes (what to ask the owner for)

- **Repo:** GitHub `k9tsune/tokyo-cafe-finder` (Next.js). `main` auto-deploys to Vercel.
- **To do SEO work you'll likely need:** Google Search Console access (or have the owner add the property + submit the sitemap), and a Google Analytics / analytics setup if not present.
- **For SNS:** decide handle(s) — a single bilingual account vs separate JP/EN — and get logo/wordmark + a few cafe photos exported for profile art.
- **Data facts to reuse:** 585 cafes · 23 wards · ~199 stations · Wi-Fi 568 / outlets 528 / both 511 · updated weekly · every listing dated.

---

## 13. First-week checklist

1. Set up Google Search Console + Bing Webmaster Tools; submit `/sitemap.xml`; request indexing on ~10 top pages.
2. Set up analytics + UTM link conventions for social.
3. Create the social profile(s); export brand art + a starter batch of cafe photos.
4. Post the first "cafe of the day" + one area roundup (JP and EN).
5. Draft one shareable roundup for note.com / Reddit to seed backlinks.
6. Baseline the numbers (indexed pages, impressions) so improvement is measurable.

---

*Prepared as a standalone handoff. Everything above reflects the site as of August 2026; the cafe count and coverage grow over time via the weekly pipeline, so re-check the live numbers before quoting them publicly.*
