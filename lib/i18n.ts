// Internationalization. English is the default (served at the root); Japanese is
// served under /ja. UI strings are written by hand (not machine-translated).
// Tone for Japanese: friendly and approachable, not stiff corporate.

export type Locale = "en" | "ja";

export const LOCALES: Locale[] = ["en", "ja"];

// Prefix an internal path with the locale (/ja/...). English stays at the root.
export function localePath(path: string, locale: Locale): string {
  if (locale === "en") return path;
  if (path === "/") return "/ja";
  return `/ja${path}`;
}

// Strip a leading /ja so we can map a Japanese path back to its English twin.
export function stripLocale(path: string): { locale: Locale; path: string } {
  if (path === "/ja") return { locale: "ja", path: "/" };
  if (path.startsWith("/ja/")) return { locale: "ja", path: path.slice(3) };
  return { locale: "en", path };
}

type Dict = {
  nav: { map: string; areas: string; freeWifi: string; powerOutlets: string };
  langName: string;
  otherLangName: string;
  search: {
    placeholder: string;
    button: string;
    needLabel: string;
    needBoth: string;
    needOutlets: string;
    needWifi: string;
    openLate: string;
    hint: string;
  };
  filters: { wifi: string; power: string; openLate: string; count: (n: number) => string };
  card: {
    freeWifi: string;
    wifiPaid: string;
    noWifi: string;
    outletsMany: string;
    outletsSome: string;
    outletsCounter: string;
    noOutlets: string;
    laptopFriendly: string;
    directions: string;
    details: string;
    checked: string;
    walk: (n: number) => string;
  };
  near: { charge: string; normal: string; locating: string; retry: string };
  footer: { tagline: string; guides: string; about: string; contact: string; privacy: string };
};

const en: Dict = {
  nav: { map: "Map", areas: "Areas", freeWifi: "Free Wi-Fi", powerOutlets: "Power outlets" },
  langName: "English",
  otherLangName: "日本語",
  search: {
    placeholder: "Search a station or area — e.g. Shibuya",
    button: "Search",
    needLabel: "1. I need:",
    needBoth: "Wi-Fi + outlets",
    needOutlets: "Outlets",
    needWifi: "Wi-Fi",
    openLate: "Open late / 24h",
    hint: "2. Then search a station or area below to see matching cafes:",
  },
  filters: {
    wifi: "Wi-Fi",
    power: "Power outlets",
    openLate: "Open late / 24h",
    count: (n) => `${n} cafe${n === 1 ? "" : "s"}`,
  },
  card: {
    freeWifi: "Free Wi-Fi",
    wifiPaid: "Wi-Fi (paid)",
    noWifi: "No Wi-Fi",
    outletsMany: "Outlets (many)",
    outletsSome: "Outlets (some)",
    outletsCounter: "Outlets (counter)",
    noOutlets: "No outlets",
    laptopFriendly: "Laptop-friendly",
    directions: "Directions →",
    details: "Details",
    checked: "✓ Checked",
    walk: (n) => `${n} min walk`,
  },
  near: {
    charge: "🔋 Phone dying? Nearest outlet →",
    normal: "📍 Cafes near me",
    locating: "Locating…",
    retry: "I turned it on — try again",
  },
  footer: { tagline: "An independent guide to working from Tokyo cafes.", guides: "Guides", about: "About", contact: "Contact", privacy: "Privacy" },
};

const ja: Dict = {
  nav: { map: "マップ", areas: "エリア", freeWifi: "無料Wi-Fi", powerOutlets: "電源" },
  langName: "日本語",
  otherLangName: "English",
  search: {
    placeholder: "駅名やエリアを入力（例：渋谷）",
    button: "検索",
    needLabel: "1. 欲しいもの:",
    needBoth: "Wi-Fi＋電源",
    needOutlets: "電源",
    needWifi: "Wi-Fi",
    openLate: "深夜・24時間",
    hint: "2. 下で駅かエリアを検索してみてください:",
  },
  filters: {
    wifi: "Wi-Fi",
    power: "電源",
    openLate: "深夜・24時間",
    count: (n) => `${n}件`,
  },
  card: {
    freeWifi: "無料Wi-Fi",
    wifiPaid: "Wi-Fi（有料）",
    noWifi: "Wi-Fiなし",
    outletsMany: "電源（多め）",
    outletsSome: "電源あり",
    outletsCounter: "電源（カウンター）",
    noOutlets: "電源なし",
    laptopFriendly: "PC作業OK",
    directions: "ルート →",
    details: "詳細",
    checked: "✓ 確認済み",
    walk: (n) => `徒歩${n}分`,
  },
  near: {
    charge: "🔋 充電したい？ 最寄りの電源へ →",
    normal: "📍 近くのカフェ",
    locating: "現在地を取得中…",
    retry: "オンにした → もう一度",
  },
  footer: { tagline: "東京で作業できるカフェを探せる、個人運営のガイドです。", guides: "ガイド", about: "概要", contact: "お問い合わせ", privacy: "プライバシー" },
};

const DICTS: Record<Locale, Dict> = { en, ja };

export function t(locale: Locale): Dict {
  return DICTS[locale] || en;
}
