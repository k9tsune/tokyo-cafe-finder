import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.name}, an independent guide to working from cafes in Tokyo, with Wi-Fi, outlets and laptop-friendliness checked.`,
  alternates: { canonical: "/about", languages: { en: "/about", ja: "/ja/about", "x-default": "/about" } },
};

export default function About() {
  return (
    <div>
      <h1>About {SITE.name}</h1>
      <p className="lede">An independent guide to working from cafes in Tokyo.</p>
      <p>
        As a freelance worker in Tokyo, I always found it frustrating to find places to work, so I
        made this site to help myself and anyone with the same problem.
      </p>
      <p>
        I made sure each listing checks three things: is there Wi-Fi, are there outlets, and can you
        use a laptop there. The site also re-checks listings regularly to make sure the information
        stays right.
      </p>
      <h2>Sources &amp; credits</h2>
      <p className="muted">
        Base location data comes from OpenStreetMap contributors (ODbL). Maps and directions are
        provided by Google Maps. The Wi-Fi, outlet and laptop-friendliness notes are my own.
      </p>
      <h2>Get in touch</h2>
      <p>
        Spotted something out of date, or know a great cafe I&rsquo;m missing? Email{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or see the{" "}
        <a href="/contact">contact page</a>. I read every message.
      </p>
    </div>
  );
}
