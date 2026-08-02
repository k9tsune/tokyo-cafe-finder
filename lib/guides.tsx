import Link from "next/link";
import type { ReactNode } from "react";

// Guides are stored as structured data (strings, not JSX text) so the prose can
// use apostrophes and quotes freely. A "part" is either plain text or an internal
// link. Voice: warm, first-person, plain English for ESL readers, no em dashes.

export type Part = string | { to: string; text: string };
export type Block =
  | { p: Part[] }
  | { h2: string }
  | { ul: Part[][] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  date: string;
  blurb: string;
  body: Block[];
  faq: { q: string; a: string }[];
};

function renderPart(part: Part, i: number): ReactNode {
  if (typeof part === "string") return part;
  return (
    <Link key={i} href={part.to}>
      {part.text}
    </Link>
  );
}

export function renderBlock(block: Block, i: number): ReactNode {
  if ("h2" in block) return <h2 key={i}>{block.h2}</h2>;
  if ("ul" in block)
    return (
      <ul key={i}>
        {block.ul.map((li, j) => (
          <li key={j}>{li.map(renderPart)}</li>
        ))}
      </ul>
    );
  return <p key={i}>{block.p.map(renderPart)}</p>;
}

export const GUIDES: Guide[] = [
  {
    slug: "best-tokyo-neighbourhoods-to-work-from-a-cafe",
    title: "The best Tokyo neighbourhoods to work from a cafe",
    description:
      "Where to actually open your laptop in Tokyo: the neighbourhoods with the most work-friendly cafes, from reliable chains in Shibuya to specialty roasters in Nakameguro.",
    date: "2026-08-02",
    blurb:
      "Tokyo is enormous, so where do you actually go to sit down and get work done? Here are the neighbourhoods we keep coming back to.",
    body: [
      {
        p: [
          "Tokyo is huge, and that is part of the fun, but it can also make one simple question surprisingly hard: where do you actually go to open your laptop for a few hours? The answer really depends on what kind of afternoon you want. Do you need a reliable chain with fast Wi-Fi near a big station, or a quiet specialty cafe where you can hear yourself think? Here are the areas we keep coming back to, and what each one is good for.",
        ],
      },
      { h2: "Shibuya and Shinjuku: busy, but you will always find a seat" },
      {
        p: [
          "If you just need somewhere to work right now, the big hubs are your friend. ",
          { to: "/tokyo/shibuya", text: "Shibuya" },
          " and ",
          { to: "/tokyo/shinjuku", text: "Shinjuku" },
          " are packed with cafes, and because there are so many of them, you can almost always find a free table if you are willing to walk a block or two. The trade-off is noise and crowds, especially at lunch. Our tip: go up. The cafes on the higher floors of department stores and office buildings are usually calmer than the ones at street level, and some have a surprisingly nice view.",
        ],
      },
      { h2: "Nakameguro and Daikanyama: pretty, calm, and full of good coffee" },
      {
        p: [
          "When we want the work session to feel like a treat, we head to ",
          { to: "/tokyo/meguro", text: "Nakameguro" },
          ". It is walkable, it runs along a canal that is lovely in any season, and it is full of specialty roasters (cafes that roast their own beans). The catch is that some of the smallest, most beautiful spots do not have power outlets, so charge your laptop before you go, and check the listing first if a plug is a must for you.",
        ],
      },
      { h2: "Koenji, Kichijoji and the west side: cheaper, slower, more local" },
      {
        p: [
          "Head west and the pace changes. Neighbourhoods like Koenji and Kichijoji feel more like a real Tokyo where people live, not just work. The cafes are often independent, a little cheaper, and less crowded on a weekday, which is exactly what you want for a long focused session. You give up some of the polish and the guaranteed outlets, but you gain a lot of character.",
        ],
      },
      { h2: "When you just need to charge and go" },
      {
        p: [
          "Sometimes you are not looking for a vibe, you are looking for a plug. If your phone is dying, a reliable chain near any major station is your safest bet, and you can filter for exactly that on our ",
          { to: "/tokyo/cafes-with-power-outlets", text: "power outlets" },
          " page. And if it is late, remember that Tokyo does not really sleep: see our ",
          { to: "/tokyo/open-late-cafes", text: "open late and 24-hour" },
          " list for places that will take you in at 2am.",
        ],
      },
      {
        p: [
          "Wherever you land, the honest advice is the same: check the listing before you go, because Wi-Fi and outlets vary a lot even between two branches of the same chain. That is the whole reason we built this, so you do not have to find out the hard way.",
        ],
      },
    ],
    faq: [
      {
        q: "Which area of Tokyo is best for working from a cafe?",
        a: "For reliability and lots of choice, Shibuya and Shinjuku are hard to beat. For a calmer, prettier session, Nakameguro and Daikanyama are full of specialty cafes, and the west side (Koenji, Kichijoji) is cheaper and more relaxed. Always check each listing, since Wi-Fi and outlets vary by branch.",
      },
      {
        q: "Where do digital nomads work in Tokyo?",
        a: "Many remote workers favour specialty independent cafes in areas like Nakameguro, Kiyosumi and the west side for a quieter atmosphere, and fall back on reliable chains near major stations when they need guaranteed Wi-Fi and outlets.",
      },
    ],
  },
  {
    slug: "how-to-find-power-outlets-in-tokyo-cafes",
    title: "How to find a power outlet in a Tokyo cafe",
    description:
      "A practical guide for visitors: which Tokyo cafes actually have power outlets, why so many do not, and how to find a plug when your phone is dying.",
    date: "2026-08-02",
    blurb:
      "Your phone is at four percent and you are lost in Shinjuku. Here is how to find a plug, fast.",
    body: [
      {
        p: [
          "Here is something that surprises a lot of first-time visitors: plenty of Tokyo cafes do not have power outlets for customers, and the ones that do often keep them at just a few seats. It is not that anyone is being unfriendly. Space is tight, rents are high, and many cafes would simply rather you enjoy your coffee and move on. So if you are travelling with a phone that never quite makes it to dinner, it helps to know where to look.",
        ],
      },
      { h2: "The chains are your safest bet" },
      {
        p: [
          "If you need a plug and you need it now, a big chain near a station is usually your best chance. But even here it varies, and this is the part people get wrong: most Starbucks in Japan have Wi-Fi but no outlets, while a few do. The same goes for other chains. That is exactly why every listing on our ",
          { to: "/tokyo/cafes-with-power-outlets", text: "power outlets" },
          " page is checked at the branch level, not just for the brand.",
        ],
      },
      { h2: "Look for the counter seats" },
      {
        p: [
          "When you walk in, glance at the long counter seats that run along a wall or a window. In Japan, that is where the outlets usually live, often one plug per seat, sometimes with a small sign. If you do not see them, it is completely fine to ask a staff member. The magic word is konsento (the Japanese word for a power outlet, borrowed from the English \"concent\"). A quick \"konsento wa arimasu ka?\" (do you have an outlet?) will get you a clear yes or no.",
        ],
      },
      { h2: "Your backups: family restaurants and manga cafes" },
      {
        p: [
          "When the cafes let you down, Japan has two reliable safety nets. Family restaurants like Gusto, Jonathan's and Denny's almost always have outlets and Wi-Fi, they are cheap, and many stay open very late. And the real secret weapon is the manga kissa (a manga and internet cafe with private booths), which has outlets, Wi-Fi, free drinks and a door that closes. Both show up on our ",
          { to: "/tokyo/open-late-cafes", text: "open late and 24-hour" },
          " list, which is worth a look before you find yourself stuck.",
        ],
      },
      { h2: "One small courtesy" },
      {
        p: [
          "When you do find a plug, try not to treat it like your personal office for the whole day, especially when the place is busy. Order something, keep an eye on the room, and free up the seat when you are done. It keeps these outlets available for the next traveller, and it keeps cafes willing to offer them at all.",
        ],
      },
    ],
    faq: [
      {
        q: "Do Tokyo cafes have power outlets?",
        a: "Some do, but many do not, and availability varies even between branches of the same chain. Most Starbucks in Japan, for example, have Wi-Fi but no outlets, while a few do. Look for counter seats along walls, or check a branch-level listing before you go.",
      },
      {
        q: "How do I ask for a power outlet in Japanese?",
        a: "The word for outlet is konsento. You can ask \"konsento wa arimasu ka?\", which means \"do you have an outlet?\" Staff will point you to the right seats or let you know there are none.",
      },
      {
        q: "Where can I charge my phone late at night in Tokyo?",
        a: "Manga kissa (manga and internet cafes) and late-night family restaurants like Gusto and Jonathan's are open very late or 24 hours and reliably have outlets and Wi-Fi. See our open late and 24-hour cafes list.",
      },
    ],
  },
  {
    slug: "cafe-work-etiquette-in-japan",
    title: "Cafe work etiquette in Japan: the unspoken rules",
    description:
      "How long can you really stay, is it rude to work on a laptop, and other quiet rules of working from a cafe in Japan, explained for visitors.",
    date: "2026-08-02",
    blurb:
      "Is it rude to sit for three hours with a laptop and one coffee? Here are the quiet rules, explained.",
    body: [
      {
        p: [
          "Cafes in Japan can feel wonderfully relaxed, but there is a soft layer of etiquette running underneath, and most of it is never written down. The good news is that it is all common sense once someone tells you, and getting it right means you will feel welcome everywhere. So here is what we wish someone had told us.",
        ],
      },
      { h2: "How long can you stay?" },
      {
        p: [
          "This is the big question, and the honest answer is: it depends on the place and how busy it is. As a rough rule, one drink buys you an hour or two, and it is polite to order something else if you settle in for longer. Nobody is timing you at a quiet chain on a slow afternoon. But when a small cafe fills up and people are waiting for a seat, that is your cue to wrap up, even if you were hoping for one more hour. Read the room and you will rarely go wrong.",
        ],
      },
      { h2: "Is working on a laptop even okay?" },
      {
        p: [
          "In most modern chains and work-friendly cafes, yes, absolutely, you will see plenty of people doing the same thing. But not everywhere. Some traditional kissaten (old-style Japanese coffee houses) and small owner-run cafes prefer that you drink, talk and relax, not set up an office. A few have polite signs asking you not to use a laptop at busy times. If a place feels like someone's living room, treat it that way, and save the spreadsheet for a chain.",
        ],
      },
      { h2: "The little things that matter" },
      {
        ul: [
          [
            "Keep phone calls and video calls out of the cafe. Step outside, or use a manga kissa booth. Speaking quietly is the default indoors.",
          ],
          [
            "Do not spread out across a big table at peak times. One person, one seat.",
          ],
          [
            "There is no tipping in Japan, so do not leave coins on the table. A quiet \"gochisousama\" (thank you for the meal) as you leave is lovely.",
          ],
          [
            "Many cafes ask you to return your own tray or cup to the counter. Follow what the locals do.",
          ],
        ],
      },
      {
        p: [
          "None of this is about being stiff or nervous. It is the same instinct you already have as a good guest: notice the room, take up a fair share of space, and leave it as nice as you found it. Do that, and a Tokyo cafe is one of the best places in the world to spend an afternoon. If you need to find one with the right seats and a plug, that is what the rest of ",
          { to: "/", text: "WorkingCafes" },
          " is for.",
        ],
      },
    ],
    faq: [
      {
        q: "How long can you stay at a cafe in Japan?",
        a: "As a rough guide, one drink is worth an hour or two, and it is polite to order again if you stay longer. When a small cafe gets busy and people are waiting, it is time to wrap up. Big chains on a quiet afternoon are much more relaxed about it.",
      },
      {
        q: "Is it rude to work on a laptop in a Japanese cafe?",
        a: "In most chains and work-friendly cafes it is completely normal. But some traditional kissaten and small independent cafes prefer you not treat the place as an office, and a few post polite signs at busy times. When in doubt, follow what other customers are doing.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
