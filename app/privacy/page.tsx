import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Privacy policy for ${SITE.name}.`,
  alternates: { canonical: "/privacy" },
};

// NOTE: This is a starter policy placeholder. Before enabling ads or shipping
// to production, replace with a reviewed policy covering: analytics, Google
// AdSense cookies/consent, geolocation use, and (for EU/JP visitors) GDPR/APPI.
export default function Privacy() {
  return (
    <div>
      <h1>Privacy policy</h1>
      <p className="muted">Last updated: replace before launch.</p>
      <p>
        {SITE.name} respects your privacy. This starter policy is a placeholder and must be
        replaced with a reviewed version before enabling advertising or collecting any data.
      </p>
      <h2>Location</h2>
      <p>
        The &ldquo;Find cafes near me&rdquo; feature uses your device location only in your browser to
        sort nearby cafes. We do not store it.
      </p>
      <h2>Analytics &amp; advertising</h2>
      <p>
        When enabled, we may use privacy-friendly analytics and Google AdSense. Ad providers may
        set cookies; a consent banner will be shown where required (GDPR / Japan APPI).
      </p>
    </div>
  );
}
