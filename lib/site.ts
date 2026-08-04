export const SITE = {
  name: "WorkingCafes",
  tagline: "Tokyo cafes with Wi-Fi and power outlets — nearby, checked, and dated. Charge your phone or get work done.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.workingcafes.com",
  email: "contact@workingcafes.com",
  // Active locales. English at the root, Japanese under /ja.
  defaultLocale: "en",
  locales: ["en", "ja"],
};

export const GMAPS_EMBED_KEY = process.env.NEXT_PUBLIC_GMAPS_EMBED_KEY || "";
