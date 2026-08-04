/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Locale-ready: English is the only active locale for v1, but the routing
  // and metadata are structured so /zh-tw and /ko slot in later (see plan §5.1).
  // When you add locales, switch to next-intl or the App Router i18n config here.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Clickjacking: only our own site may frame our pages. (This does NOT
          // affect our own pages embedding the Google Maps iframe.)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
