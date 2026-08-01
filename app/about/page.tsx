import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name} — how we check cafe Wi-Fi and power-outlet information in Tokyo.`,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div>
      <h1>About {SITE.name}</h1>
      <p className="lede">
        {SITE.name} is an independent, English-first guide to finding a Tokyo cafe where you can
        actually sit, work, and charge.
      </p>
      <p>
        For each cafe we track the things that decide whether it works for you: is there Wi-Fi,
        are there power outlets, and can you comfortably open a laptop. Outlet information is
        verified at the individual branch level, because it varies even within the same chain —
        most Starbucks in Japan have Wi-Fi but no outlets, while a few do.
      </p>
      <p>
        Every listing carries a &ldquo;last checked&rdquo; date so you can see how current it is.
        We re-check listings on a regular cycle and update them when things change.
      </p>
      <h2>Sources &amp; credits</h2>
      <p className="muted">
        Base location data comes from OpenStreetMap contributors (ODbL). Maps and directions are
        provided by Google Maps. Wi-Fi, outlet and laptop-friendliness assessments are our own.
      </p>
    </div>
  );
}
