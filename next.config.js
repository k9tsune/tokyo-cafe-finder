/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Locale-ready: English is the only active locale for v1, but the routing
  // and metadata are structured so /zh-tw and /ko slot in later (see plan §5.1).
  // When you add locales, switch to next-intl or the App Router i18n config here.
};

module.exports = nextConfig;
