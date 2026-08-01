export const SITE = {
  name: "WorkingCafes",
  tagline: "Find a cafe where you can sit, work, and charge — with Wi-Fi and power outlets, checked and mapped.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://workingcafes.com",
  // Active locales. English only for v1; add "zh-tw", "ko" later (plan §5.1).
  defaultLocale: "en",
  locales: ["en"],
};

export const GMAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";
