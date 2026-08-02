export const SITE = {
  name: "WorkingCafes",
  tagline: "Tokyo cafes with Wi-Fi and power outlets — nearby, checked, and dated. Charge your phone or get work done.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.workingcafes.com",
  // Active locales. English only for v1; add "zh-tw", "ko" later (plan §5.1).
  defaultLocale: "en",
  locales: ["en"],
};

export const GMAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";
