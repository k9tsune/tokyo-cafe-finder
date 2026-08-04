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
  near: { charge: string; normal: string; locating: string; retry: string; noGeo: string; denied: string; failed: string };
  map: {
    getDirections: string; updateDirections: string; locating: string; retry: string; openInMaps: string;
    needKey: string; denied: string; timeout: string; failed: string;
    titleMap: (n: string) => string; titleDir: (n: string) => string; nearMe: string;
  };
  footer: { tagline: string; guides: string; about: string; contact: string; privacy: string; credits: string; attrib: string };
  page: {
    htmlLang: string;
    home: { metaTitle: string; metaDescription: string; h1: string; lede: string; browseAreas: string };
    hub: {
      metaTitle: string; metaDescription: string; h1: string; lede: (c: number) => string;
      areas: string; byStation: string; byFeature: string;
      freeWifi: string; withOutlets: string; wifiAndPower: string; cardSub: string;
    };
    area: {
      metaTitle: (n: string) => string; metaDescription: (n: string) => string; h1: (n: string) => string;
      atAGlance: (n: string) => string; tableCaption: (n: string) => string;
    };
    guides: { metaTitle: string; metaDescription: string; h1: string; lede: string; faqHeading: string; allGuidesLead: string; allGuides: string; findSpot: string };
    common: { home: string; tokyo: string; guides: string };
  };
};

const en: Dict = {
  nav: { map: "Tokyo Map", areas: "Tokyo Areas", freeWifi: "Free Wi-Fi", powerOutlets: "Power outlets" },
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
    charge: "Phone dying? Nearest outlet →",
    normal: "Cafes near me",
    locating: "Locating…",
    retry: "I turned it on — try again",
    noGeo: "This browser won't share your location — search by station instead.",
    denied: "Location is blocked for this site, so we can't find you. Type your station instead.",
    failed: "Can't find you — no worries. Type your station and we'll show the closest.",
  },
  map: {
    getDirections: "Get directions from your location →",
    updateDirections: "↻ Update directions",
    locating: "Locating…",
    retry: "I turned it on — try again →",
    openInMaps: "Open in Google Maps ↗",
    needKey: "Map preview needs a Google Maps Embed API key.",
    denied: "Location is blocked for this site, so we can't route from where you are.",
    timeout: "That took too long. Tap the button to try again, or use “Open in Google Maps” below.",
    failed: "We couldn't get your location. Tap the button to try again, or use “Open in Google Maps” below.",
    titleMap: (n) => `Map showing ${n}`,
    titleDir: (n) => `Walking directions to ${n}`,
    nearMe: "Near me",
  },
  footer: {
    tagline: "An independent guide to working from Tokyo cafes.", guides: "Guides", about: "About", contact: "Contact", privacy: "Privacy",
    credits: "Photo credits",
    attrib: "Base location data © OpenStreetMap contributors (ODbL). Maps, directions & cafe photos via Google. Map tiles © OpenFreeMap / OpenMapTiles.",
  },
  page: {
    htmlLang: "en",
    home: {
      metaTitle: "WorkingCafes — Cafes with Wi-Fi & Power Outlets",
      metaDescription: "Tokyo cafes with Wi-Fi and power outlets — nearby, dated, and current. Search a station or find what's nearest right now.",
      h1: "Tokyo cafes with Wi-Fi & power outlets",
      lede: "Cafes with Wi-Fi and power outlets across all 23 wards. Every listing dated so you know it's current. Search a station, or find what's nearest right now.",
      browseAreas: "Browse areas",
    },
    hub: {
      metaTitle: "Tokyo cafes with Wi-Fi & power outlets",
      metaDescription: "Browse Tokyo areas and stations to find cafes with Wi-Fi, power outlets, or both — laptop-friendly spots, dated and current.",
      h1: "Cafes with Wi-Fi & power outlets in Tokyo",
      lede: (c) => `${c} cafes and counting across Tokyo. Pick an area or station to see what's nearby, then filter for Wi-Fi, outlets, or both.`,
      areas: "Areas", byStation: "By station", byFeature: "By feature",
      freeWifi: "Free Wi-Fi cafes", withOutlets: "Cafes with outlets", wifiAndPower: "Wi-Fi + outlets", cardSub: "Cafes with Wi-Fi & outlets",
    },
    area: {
      metaTitle: (n) => `Cafes with Wi-Fi & power outlets in ${n}, Tokyo`,
      metaDescription: (n) => `Laptop-friendly cafes in ${n}: filter for Wi-Fi, power outlets, or both. Dated so the details stay current.`,
      h1: (n) => `Cafes with Wi-Fi & power outlets in ${n}`,
      atAGlance: (n) => `${n} cafes at a glance`,
      tableCaption: (n) => `Wi-Fi and power outlets at cafes in ${n}, Tokyo (last checked dates shown)`,
    },
    guides: {
      metaTitle: "Guides — working from cafes in Tokyo",
      metaDescription: "Practical guides for working from Tokyo cafes: the best neighbourhoods, how to find power outlets, and cafe etiquette in Japan.",
      h1: "Guides", lede: "Short, practical guides to working from cafes in Tokyo.",
      faqHeading: "Frequently asked questions", allGuidesLead: "More guides:", allGuides: "all guides", findSpot: "Find a spot now on",
    },
    common: { home: "Home", tokyo: "Tokyo", guides: "Guides" },
  },
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
    charge: "充電が切れそう？ 近くの電源カフェへ →",
    normal: "近くのカフェを探す",
    locating: "現在地を取得中…",
    retry: "オンにしました → もう一度",
    noGeo: "このブラウザでは位置情報を利用できません。駅名で検索してみてください。",
    denied: "このサイトでは位置情報がブロックされているため、現在地を取得できません。駅名で検索してみてください。",
    failed: "現在地を取得できませんでした。駅名を入力すると、近いお店を表示します。",
  },
  map: {
    getDirections: "現在地から経路を表示 →",
    updateDirections: "↻ 経路を更新",
    locating: "現在地を取得中…",
    retry: "オンにしました → もう一度",
    openInMaps: "Google マップで開く ↗",
    needKey: "地図のプレビューには Google Maps Embed API キーが必要です。",
    denied: "このサイトでは位置情報がブロックされているため、現在地からの経路を表示できません。",
    timeout: "時間がかかりすぎました。もう一度ボタンを押すか、下の「Google マップで開く」をご利用ください。",
    failed: "現在地を取得できませんでした。もう一度ボタンを押すか、下の「Google マップで開く」をご利用ください。",
    titleMap: (n) => `${n}の地図`,
    titleDir: (n) => `${n}への徒歩ルート`,
    nearMe: "現在地から探す",
  },
  footer: {
    tagline: "東京で作業できるカフェを探せる、個人運営のガイドです。", guides: "ガイド", about: "このサイトについて", contact: "お問い合わせ", privacy: "プライバシー",
    credits: "写真クレジット",
    attrib: "位置情報のベースデータ © OpenStreetMap contributors（ODbL）。地図・経路・カフェ写真は Google を利用しています。地図タイル © OpenFreeMap / OpenMapTiles。",
  },
  page: {
    htmlLang: "ja",
    home: {
      metaTitle: "WorkingCafes｜電源・Wi-Fiのある東京のカフェ",
      metaDescription: "東京23区で、Wi-Fiと電源が使えるカフェをまとめました。情報は日付つきで管理しているので最新の状態で確認できます。駅名やエリアで検索、または現在地から近いお店を探せます。",
      h1: "電源・Wi-Fiのある東京のカフェ",
      lede: "東京23区で、Wi-Fiと電源が使えるカフェをまとめました。各ページに確認日を表示しているので、いつでも最新の情報でご確認いただけます。駅名やエリアで検索するか、現在地から近いお店を探してみてください。",
      browseAreas: "エリアから探す",
    },
    hub: {
      metaTitle: "電源・Wi-Fiのある東京のカフェ｜エリア・駅から探す",
      metaDescription: "東京のエリアや駅から、Wi-Fi・電源のあるカフェを探せます。ノートパソコンでの作業にぴったりのお店を、確認日つきでご紹介します。",
      h1: "電源・Wi-Fiのある東京のカフェ",
      lede: (c) => `東京都内で${c}件以上のカフェを掲載中です。エリアや駅を選んで近くのお店を確認し、Wi-Fi・電源などの条件でしぼり込めます。`,
      areas: "エリアから探す", byStation: "駅から探す", byFeature: "条件から探す",
      freeWifi: "無料Wi-Fiのあるカフェ", withOutlets: "電源のあるカフェ", wifiAndPower: "Wi-Fi＋電源のあるカフェ", cardSub: "Wi-Fi・電源のあるカフェ",
    },
    area: {
      metaTitle: (n) => `${n}（東京）の電源・Wi-Fiのあるカフェ`,
      metaDescription: (n) => `${n}でノートパソコン作業ができるカフェ。Wi-Fi・電源などの条件でしぼり込めます。確認日つきなので、いつでも最新の情報でご確認いただけます。`,
      h1: (n) => `${n}の電源・Wi-Fiのあるカフェ`,
      atAGlance: (n) => `${n}のカフェ一覧`,
      tableCaption: (n) => `${n}（東京）のカフェのWi-Fi・電源まとめ（最終確認日つき）`,
    },
    guides: {
      metaTitle: "ガイド｜東京のカフェで作業するためのヒント",
      metaDescription: "東京のカフェで仕事・作業をするための実用ガイド。電源やWi-Fiの探し方、おすすめエリア、カフェでのマナーなどを紹介します。",
      h1: "ガイド", lede: "東京のカフェで気持ちよく作業するための、短くて実用的なガイドです。",
      faqHeading: "よくある質問", allGuidesLead: "他のガイド：", allGuides: "ガイド一覧", findSpot: "今すぐ探すなら",
    },
    common: { home: "ホーム", tokyo: "東京", guides: "ガイド" },
  },
};

const DICTS: Record<Locale, Dict> = { en, ja };

export function t(locale: Locale): Dict {
  return DICTS[locale] || en;
}
