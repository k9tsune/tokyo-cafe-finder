import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name} — corrections, suggestions, and questions.`,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div>
      <h1>Contact</h1>
      <p className="lede">
        {SITE.name} is a small, independent project. We read every message and we&rsquo;re glad to
        hear from you.
      </p>

      <p>
        Email us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>

      <h2>What to write about</h2>
      <p>
        <strong>Found something out of date?</strong> If a cafe&rsquo;s Wi-Fi or power-outlet
        information looks wrong, or a place has closed, tell us the cafe name and what you saw and
        we&rsquo;ll re-check it.
      </p>
      <p>
        <strong>Know a great work-friendly cafe we&rsquo;re missing?</strong> Send the name and
        nearest station — suggestions are very welcome.
      </p>
      <p>
        <strong>Business or press?</strong> Reach out at the same address and we&rsquo;ll get back to
        you.
      </p>

      <p className="muted">
        We aim to reply within a few days. Please include a link if you&rsquo;re reporting a specific
        cafe, so we can check the source quickly.
      </p>
    </div>
  );
}
