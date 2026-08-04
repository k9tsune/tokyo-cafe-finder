import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} handles data, cookies, location, and advertising.`,
  alternates: { canonical: "/privacy", languages: { en: "/privacy", ja: "/ja/privacy", "x-default": "/privacy" } },
};

const UPDATED = "August 2, 2026";

export default function Privacy() {
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: {UPDATED}</p>

      <p>
        {SITE.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is an independent guide to cafes with Wi-Fi
        and power outlets. This page explains what information is collected when you use the site and
        how it is used. If you have any question, email us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>Information we collect</h2>
      <p>
        We do not ask you to create an account, and we do not directly collect names, email
        addresses, or payment details. Like most websites, our hosting provider may automatically log
        standard technical data such as your IP address, browser type, and the pages you visit, for
        security and to keep the service running.
      </p>

      <h2>Location</h2>
      <p>
        Features such as &ldquo;Find cafes near me&rdquo; and in-page directions use your device
        location <strong>only inside your browser</strong>, and only after you allow it, to sort or
        route to nearby cafes. Your location is not sent to us or stored on our servers. You can turn
        location access on or off at any time in your browser settings.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        We plan to show ads through <strong>Google AdSense</strong>. Third-party vendors, including
        Google, use cookies to serve ads based on your prior visits to this and other websites.
        Google&rsquo;s use of advertising cookies enables it and its partners to serve ads to you
        based on your visits to our site and/or other sites on the internet.
      </p>
      <p>
        You can opt out of personalized advertising by visiting{" "}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>
        . You can also opt out of some third-party vendors&rsquo; use of cookies for personalized
        advertising at{" "}
        <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>
        . For more detail, see{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          how Google uses information from sites that use its services
        </a>
        .
      </p>
      <p>
        Where required by law (for example for visitors in the EU, UK, or under Japan&rsquo;s APPI),
        a consent notice is shown before non-essential advertising cookies are set, and you can
        decline.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use privacy-friendly analytics to understand which pages are useful, in aggregate. We
        do not use analytics to identify you personally.
      </p>

      <h2>Third-party services</h2>
      <p>
        Some pages embed maps, directions, and photos from{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google
        </a>
        , and base map data from OpenStreetMap contributors. When you interact with these, the
        provider may receive data such as your IP address under its own privacy policy.
      </p>

      <h2>Children</h2>
      <p>This site is intended for a general audience and is not directed at children under 13.</p>

      <h2>Your choices</h2>
      <p>
        You can block or delete cookies in your browser, opt out of personalized ads at the links
        above, and turn off location sharing at any time. If you are in a region with data-access or
        deletion rights and want to make a request, email us and we will help.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the site grows (for example, when we turn on ads or add new
        features). Material changes will be reflected in the &ldquo;last updated&rdquo; date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </div>
  );
}
