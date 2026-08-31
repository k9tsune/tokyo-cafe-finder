import type { Venue } from "./types";

// Shared snippet + faceting helpers for search results.
//
// Why: Search Console (Aug 2026) showed EN cafe pages sitting at average
// position 8.5 — page one — but converting at only 0.74% CTR, while station
// pages at a similar position pulled 9.24%. The pages ranked fine; the snippets
// just didn't answer the question being asked ("does it have Wi-Fi and
// outlets?"), and titles for cafes lacking amenities literally opened with
// "no Wi-Fi, no outlets", which reads as a reason NOT to click.
//
// So: lead with what IS true (amenities, walk time, counts, freshness) and
// never lead with a negative. Everything here is derived from data we already
// hold, so snippets stay honest and stay current automatically.

export type FeatureKey = "free-wifi" | "power-outlets" | "wifi-and-power" | "open-late";

export const FEATURES: FeatureKey[] = ["free-wifi", "power-outlets", "wifi-and-power", "open-late"];

/** Minimum matching cafes before we generate a ward x feature page. Below this
 *  the page would be thin (and Google treats thin faceted pages as doorways). */
export const MIN_FEATURE_VENUES = 5;

export function isFeatureKey(s: string): s is FeatureKey {
  return (FEATURES as string[]).includes(s);
}

export function filterByFeature(list: Venue[], f: FeatureKey): Venue[] {
  switch (f) {
    case "free-wifi":
      return list.filter((v) => v.hasWifi && v.wifiType === "free");
    case "power-outlets":
      return list.filter((v) => v.hasPower);
    case "wifi-and-power":
      return list.filter((v) => v.hasWifi && v.hasPower);
    case "open-late":
      return list.filter((v) => v.openLate || v.open24h);
  }
}

/** Most recent check date across a set, for a freshness cue in the snippet. */
export function checkedLabel(list: Venue[], locale: "en" | "ja"): string {
  const dates = list.map((v) => v.lastChecked).filter(Boolean).sort();
  const iso = dates[dates.length - 1];
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return locale === "ja"
    ? `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月`
    : `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${d.getUTCFullYear()}`;
}

/** Positive-only amenity phrase; null when the cafe has neither. */
export function amenityEn(v: Venue): string | null {
  const bits: string[] = [];
  if (v.hasWifi) bits.push(v.wifiType === "free" ? "Free Wi-Fi" : "Wi-Fi");
  if (v.hasPower) bits.push("power outlets");
  return bits.length ? bits.join(" & ") : null;
}

export function amenityJa(v: Venue): string | null {
  const bits: string[] = [];
  if (v.hasWifi) bits.push(v.wifiType === "free" ? "無料Wi-Fi" : "Wi-Fi");
  if (v.hasPower) bits.push("電源");
  return bits.length ? bits.join("・") : null;
}

export function walkEn(v: Venue): string {
  return v.walkMinutes > 0
    ? `${v.walkMinutes} min from ${v.nearestStation}`
    : `near ${v.nearestStation}`;
}

export function walkJa(v: Venue, stationJa: string): string {
  return v.walkMinutes > 0 ? `${stationJa}から徒歩${v.walkMinutes}分` : `${stationJa}すぐ`;
}

/** Counts used across ward/station snippets. */
export function counts(list: Venue[]) {
  return {
    total: list.length,
    wifi: list.filter((v) => v.hasWifi).length,
    power: list.filter((v) => v.hasPower).length,
    both: list.filter((v) => v.hasWifi && v.hasPower).length,
    late: list.filter((v) => v.openLate || v.open24h).length,
  };
}

// Copy for the ward x feature pages, in both locales. `place` is the ward name
// already localised by the caller.
export const FEATURE_META: Record<
  FeatureKey,
  {
    en: { label: string; h1: (p: string) => string; title: (p: string, n: number) => string; intro: (p: string, n: number) => string };
    ja: { label: string; h1: (p: string) => string; title: (p: string, n: number) => string; intro: (p: string, n: number) => string };
  }
> = {
  "free-wifi": {
    en: {
      label: "Free Wi-Fi",
      h1: (p) => `Cafes with free Wi-Fi in ${p}, Tokyo`,
      title: (p, n) => `${n} cafes with free Wi-Fi in ${p}, Tokyo`,
      intro: (p, n) =>
        `${n} cafes in ${p} offering free Wi-Fi to customers. Each listing shows whether there are power outlets too, plus the walk from the nearest station and the date we last checked.`,
    },
    ja: {
      label: "無料Wi-Fi",
      h1: (p) => `${p}の無料Wi-Fiがあるカフェ`,
      title: (p, n) => `${p}の無料Wi-Fiカフェ${n}件`,
      intro: (p, n) =>
        `${p}で無料Wi-Fiが使えるカフェ${n}件。電源の有無、最寄り駅からの徒歩時間、確認日もあわせて掲載しています。`,
    },
  },
  "power-outlets": {
    en: {
      label: "Power outlets",
      h1: (p) => `Cafes with power outlets in ${p}, Tokyo`,
      title: (p, n) => `${n} cafes with power outlets in ${p}, Tokyo`,
      intro: (p, n) =>
        `${n} cafes in ${p} where you can charge a laptop or phone. Outlet availability varies branch by branch, so each listing notes how many there usually are and when we last checked.`,
    },
    ja: {
      label: "電源",
      h1: (p) => `${p}の電源が使えるカフェ`,
      title: (p, n) => `${p}の電源があるカフェ${n}件`,
      intro: (p, n) =>
        `${p}でパソコンやスマホを充電できるカフェ${n}件。電源の数は店舗ごとに異なるため、各ページで目安と確認日を掲載しています。`,
    },
  },
  "wifi-and-power": {
    en: {
      label: "Wi-Fi + outlets",
      h1: (p) => `Cafes with Wi-Fi and power outlets in ${p}, Tokyo`,
      title: (p, n) => `${n} cafes with Wi-Fi & outlets in ${p}, Tokyo`,
      intro: (p, n) =>
        `${n} cafes in ${p} with both Wi-Fi and power outlets — the combination you want for real laptop work. Sorted so you can see the closest to each station.`,
    },
    ja: {
      label: "Wi-Fi＋電源",
      h1: (p) => `${p}のWi-Fi・電源があるカフェ`,
      title: (p, n) => `${p}のWi-Fi＋電源カフェ${n}件`,
      intro: (p, n) =>
        `${p}でWi-Fiと電源の両方が使えるカフェ${n}件。作業するならこの組み合わせがいちばん安心です。駅ごとに近い順で探せます。`,
    },
  },
  "open-late": {
    en: {
      label: "Open late",
      h1: (p) => `Cafes open late in ${p}, Tokyo`,
      title: (p, n) => `${n} cafes open late in ${p}, Tokyo`,
      intro: (p, n) =>
        `${n} cafes in ${p} open past about 11pm, including any open 24 hours. Useful for evening work sessions — check each listing for Wi-Fi and outlets.`,
    },
    ja: {
      label: "夜遅くまで",
      h1: (p) => `${p}の夜遅くまで開いているカフェ`,
      title: (p, n) => `${p}の夜遅くまで営業のカフェ${n}件`,
      intro: (p, n) =>
        `${p}で23時ごろ以降も開いているカフェ${n}件（24時間営業を含む）。夜の作業に便利です。Wi-Fi・電源の有無は各ページでご確認ください。`,
    },
  },
};
