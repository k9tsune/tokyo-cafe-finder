export const SITE = {
  name: "JapanWiFiCafe",
  tagline: "Find a cafe in Japan with Wi-Fi and power outlets where you can sit, work, and charge.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://japanwificafe.com",
  // Active locales. English only for v1; add "zh-tw", "ko" later (plan §5.1).
  defaultLocale: "en",
  locales: ["en"],
};

export const GMAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";
