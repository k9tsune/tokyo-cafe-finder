import Link from "next/link";
import type { ReactNode } from "react";

// Guides are stored as structured data (strings, not JSX text) so the prose can
// use apostrophes, kaomojis and quotes freely. A "part" is either plain text or
// an internal link. Voice: first person, casual, plain English, no em dashes.

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
      "Where I actually go to open my laptop in Tokyo: the neighbourhoods with the most work-friendly cafes, from reliable chains in Shibuya to specialty roasters in Nakameguro.",
    date: "2026-08-02",
    blurb: "Tokyo is huge, so where do I actually go to open my laptop? Here are the areas I keep coming back to ^^",
    body: [
      {
        p: [
          "Tokyo is massive, and figuring out where to sit down and work can be weirdly stressful. Over time I've tried a lot of cafes in a lot of neighbourhoods, so here are the ones I keep going back to, and what each is good for.",
        ],
      },
      { h2: "Shibuya and Shinjuku: busy, but always a seat" },
      {
        p: [
          "When I just need to work right now, I head to ",
          { to: "/tokyo/shibuya", text: "Shibuya" },
          " or ",
          { to: "/tokyo/shinjuku", text: "Shinjuku" },
          ". There are so many cafes that I can almost always grab a free table if I walk a block or two. It gets loud and crowded at lunch though, so my trick is to go up: the cafes on the higher floors of department stores are usually way calmer, and sometimes you get a nice view too (・∀・)",
        ],
      },
      { h2: "Nakameguro and Daikanyama: pretty and calm" },
      {
        p: [
          "When I want the work session to feel like a little treat, I go to ",
          { to: "/tokyo/meguro", text: "Nakameguro" },
          ". It runs along a canal that's gorgeous in any season and it's full of specialty roasters (cafes that roast their own beans). Heads up though, some of the tiniest, prettiest spots don't have outlets, so I always charge up first and double check the listing if I really need a plug.",
        ],
      },
      { h2: "Koenji, Kichijoji and the west side: cheaper and slower" },
      {
        p: [
          "Out west the vibe changes completely. Places like Koenji and Kichijoji feel more like where people actually live, and the cafes are usually independent, a bit cheaper, and way less crowded on a weekday. I give up a little polish and the guaranteed outlets, but I get a lot more character, and that's often the trade I want.",
        ],
      },
      { h2: "When I just need to charge and go" },
      {
        p: [
          "Sometimes I'm not after a vibe, I just need a plug before my phone dies. For that, a reliable chain near any big station is the safe bet, and I filter for exactly that on the ",
          { to: "/tokyo/cafes-with-power-outlets", text: "power outlets" },
          " page. And if it's late, Tokyo has my back, see the ",
          { to: "/tokyo/open-late-cafes", text: "open late and 24-hour" },
          " list for places that will take you in at 2am (￣▽￣)",
        ],
      },
      {
        p: [
          "Wherever you end up, my one tip is always the same: check the listing before you go, because Wi-Fi and outlets can be totally different between two branches of the same chain. That's the whole reason I made this, so you don't have to find out the hard way.",
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
        a: "Many remote workers favour specialty independent cafes in areas like Nakameguro, Kiyosumi and the west side for a calmer atmosphere, and fall back on reliable chains near major stations when they need guaranteed Wi-Fi and outlets.",
      },
    ],
  },
  {
    slug: "how-to-find-power-outlets-in-tokyo-cafes",
    title: "How to find a power outlet in a Tokyo cafe",
    description:
      "A practical guide from experience: which Tokyo cafes actually have power outlets, why so many do not, and how to find a plug when your phone is dying.",
    date: "2026-08-02",
    blurb: "My phone's at four percent and I'm lost in Shinjuku. Here's how I find a plug, fast (>_<)",
    body: [
      {
        p: [
          "Something that really surprised me when I first got here: a lot of Tokyo cafes just don't have outlets for customers, and the ones that do often keep them at only a few seats. It's not that anyone is being unfriendly. Space is tight, rent is high, and a lot of cafes would rather you enjoy your coffee and head off. So if your phone never quite survives the day like mine, it helps to know where to look.",
        ],
      },
      { h2: "Chains are the safe bet" },
      {
        p: [
          "When I need a plug fast, a big chain near a station is my best shot. But even then it varies, and this is the part people get wrong: most Starbucks in Japan have Wi-Fi but no outlets, and only a few do. Same story with the other chains. That's exactly why every cafe on the ",
          { to: "/tokyo/cafes-with-power-outlets", text: "power outlets" },
          " page is checked branch by branch, not just by brand.",
        ],
      },
      { h2: "Look for the counter seats" },
      {
        p: [
          "First thing I do walking in is glance at the long counter seats along a wall or window. In Japan that's usually where the outlets hide, often one per seat, sometimes with a little sign. If I can't spot them I just ask, it's totally normal. The word is konsento (Japanese for a power outlet), so a quick \"konsento wa arimasu ka?\" (do you have an outlet?) gets you a clear yes or no ^^",
        ],
      },
      { h2: "My backups: family restaurants and manga cafes" },
      {
        p: [
          "When the cafes let me down, Japan has two lifesavers. Family restaurants like Gusto, Jonathan's and Denny's almost always have outlets and Wi-Fi, they're cheap, and lots of them stay open really late. And the real secret weapon is the manga kissa (a manga and internet cafe with private booths), which has outlets, Wi-Fi, free drinks and a door that actually shuts. Both show up on the ",
          { to: "/tokyo/open-late-cafes", text: "open late and 24-hour" },
          " list, which is worth a look before you're actually stuck (・∀・)b",
        ],
      },
      { h2: "One little courtesy" },
      {
        p: [
          "When I do grab a plug, I try not to camp there all day, especially when it's busy. I order something, keep an eye on the room, and free up the seat when I'm done. It keeps the outlets free for the next traveller, and it keeps cafes willing to offer them at all.",
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
      "How long can you really stay, is it rude to work on a laptop, and the other unwritten rules of working from a cafe in Japan, from my own experience.",
    date: "2026-08-02",
    blurb: "Is it rude to sit for three hours with a laptop and one coffee? Here's what I've figured out (・_・;)",
    body: [
      {
        p: [
          "Cafes here can feel wonderfully relaxed, but there's an unspoken layer of etiquette running underneath, and most of it never gets written down. The good news is it's all pretty common sense once someone tells you, and getting it right means you'll feel welcome everywhere. So here's the stuff I wish someone had told me earlier.",
        ],
      },
      { h2: "How long can I stay?" },
      {
        p: [
          "This is the big one, and it depends on the place and how busy it is. My rough rule: one drink buys me an hour or two, and I order something else if I'm settling in for longer. Nobody is timing you at a big chain on a slow afternoon. But when a small cafe fills up and people are waiting for a seat, that's my cue to wrap up, even if I was hoping for one more hour. Read the room and you'll be fine ^^",
        ],
      },
      { h2: "Is working on a laptop even okay?" },
      {
        p: [
          "In most modern chains and work-friendly cafes, totally, you'll see loads of people doing the same thing. But not everywhere. Some traditional kissaten (old-style Japanese coffee houses) and tiny owner-run cafes would rather you drink, chat and relax than set up an office, and a few have polite signs asking you not to use a laptop at busy times. If a place feels like someone's living room, I treat it that way, and save the spreadsheet for a chain.",
        ],
      },
      { h2: "The little things" },
      {
        ul: [
          ["I keep phone calls and video calls out of the cafe. I step outside, or use a manga kissa booth. Low voices are the norm indoors."],
          ["I don't spread out across a big table at peak times. One person, one seat."],
          ["There's no tipping in Japan, so don't leave coins on the table. A quick \"gochisousama\" (thanks for the meal) on the way out is a nice touch though."],
          ["Lots of cafes want you to bring your own tray or cup back to the counter, so I just copy what the locals are doing."],
        ],
      },
      {
        p: [
          "None of this is about being stiff or nervous. It's the same instinct you already have as a good guest: notice the room, take a fair share of space, and leave it as nice as you found it. Do that, and a Tokyo cafe is one of my favorite places in the world to spend an afternoon (＾▽＾) If you need to find one with the right seats and a plug, that's what the rest of ",
          { to: "/", text: "WorkingCafes" },
          " is for.",
        ],
      },
    ],
    faq: [
      {
        q: "How long can you stay at a cafe in Japan?",
        a: "As a rough guide, one drink is worth an hour or two, and it is polite to order again if you stay longer. When a small cafe gets busy and people are waiting, it is time to wrap up. Big chains on a slow afternoon are much more relaxed about it.",
      },
      {
        q: "Is it rude to work on a laptop in a Japanese cafe?",
        a: "In most chains and work-friendly cafes it is completely normal. But some traditional kissaten and small independent cafes prefer you not treat the place as an office, and a few post polite signs at busy times. When in doubt, follow what other customers are doing.",
      },
    ],
  },
  {
    slug: "which-tokyo-cafe-chains-have-power-outlets",
    title: "Which Tokyo cafe chains have power outlets?",
    description:
      "Doutor, Komeda, Excelsior, Tully's, Veloce, Renoir and Starbucks compared for power outlets and Wi-Fi, using the hit rate across our own Tokyo listings.",
    date: "2026-08-05",
    blurb: "When you just need an outlet fast, some chains are a much safer bet than others. Here's the hit rate across our Tokyo listings ^^",
    body: [
      { p: ["Chains are the reliable fallback when you just need to sit down and plug in. But outlet availability varies a lot from chain to chain, so here is what our own Tokyo listings show, chain by chain."] },
      { h2: "The short version" },
      { p: ["The safest bets for an outlet are Excelsior, Komeda, Renoir, St. Marc and Cafe de Crie, where nearly every branch we list has one. Veloce, Tully's and Doutor are close behind. Starbucks is the wildcard: brilliant Wi-Fi, but an outlet only about two branches in three."] },
      { h2: "Chain by chain (outlet hit rate)" },
      { ul: [
        ["Excelsior Caffe: outlets at about 100% of our listings, Wi-Fi about 92%."],
        ["Komeda's Coffee: about 100% outlets, 96% Wi-Fi. Comfy sofas and a good morning set."],
        ["Renoir: about 100% outlets and Wi-Fi. Roomy seats, built for long sits."],
        ["St. Marc Cafe and Cafe de Crie: about 100% outlets in our data."],
        ["Cafe Veloce: about 94% outlets, and cheap."],
        ["Tully's Coffee: about 89% outlets, 100% Wi-Fi."],
        ["Doutor: about 83% outlets, 95% Wi-Fi. Everywhere, and cheap."],
        ["Starbucks: about 69% outlets but 99% Wi-Fi. Newer and larger branches are your best bet."],
      ] },
      { h2: "How to read this" },
      { p: ["The hit rate is the share of the branches we currently list for that chain that have an outlet. Individual branches still vary, and older or tiny locations often have none, so check the ", { to: "/tokyo/cafes-with-power-outlets", text: "outlet listings" }, " and each cafe's last-updated date before you rely on it."] },
    ],
    faq: [
      { q: "Do Japanese Starbucks have power outlets?", a: "About two in three of the Tokyo Starbucks we list have outlets, usually the newer or larger branches, and Wi-Fi is near-universal. Check the individual branch's page since it varies." },
      { q: "Which cafe chain is most reliable for power outlets?", a: "In our data, Excelsior, Komeda, Renoir, St. Marc and Cafe de Crie have an outlet at nearly every branch we list." },
    ],
  },
  {
    slug: "working-from-family-restaurants-tokyo",
    title: "The famiresu strategy: cheap all-day work at Tokyo family restaurants",
    description:
      "Gusto, Jonathan's, Saizeriya, Denny's and Bamiyan are the cheapest all-day desks in Tokyo, with a drink bar, Wi-Fi, outlets and long hours. How to use them.",
    date: "2026-08-05",
    blurb: "The cheapest all-day desk in Tokyo isn't a cafe, it's a famiresu (family restaurant). Here's how to work from one ><",
    body: [
      { p: ["The most underrated work spot in Tokyo isn't a cafe at all. Famiresu (family restaurants) like Gusto, Jonathan's, Saizeriya, Denny's and Bamiyan give you a bottomless drink bar, free Wi-Fi, an outlet at many seats and a big booth, often for a few hundred yen and often around the clock."] },
      { h2: "Why famiresu work so well" },
      { ul: [
        ["A bottomless drink bar (usually around 300 yen) means you can stay for hours guilt-free."],
        ["Free Wi-Fi across the big groups, the Skylark chains especially."],
        ["Outlets at a lot of seats, and roomy booths you can spread out in."],
        ["Long hours: many are open late, and some run 24 hours."],
      ] },
      { h2: "The main chains" },
      { ul: [
        ["Gusto: Skylark group, the cheapest, with free Wi-Fi, a drink bar and outlets at many seats. The default choice."],
        ["Jonathan's: also Skylark, a little calmer and nicer, same Wi-Fi and outlets, and often open very late."],
        ["Denny's: free Wi-Fi and drink bar, outlets at some seats, open past midnight at many branches."],
        ["Saizeriya: dirt-cheap Italian with a drink bar; Wi-Fi and outlets vary by branch."],
        ["Bamiyan: Skylark's Chinese famiresu, with some branches open until 5am."],
      ] },
      { h2: "How to do it right" },
      { ul: [
        ["Order something and add the drink bar, and take a booth away from the entrance."],
        ["Check the branch's hours, since not every location is 24 hours."],
        ["Be considerate at peak meal times, when tables are needed for diners."],
      ] },
    ],
    faq: [
      { q: "Can you work in a Japanese family restaurant?", a: "Yes. Famiresu like Gusto and Jonathan's are popular for laptop work thanks to a bottomless drink bar, free Wi-Fi, outlets at many seats and long hours. Order something and be considerate at busy meal times." },
      { q: "Which famiresu is best for working?", a: "Gusto and Jonathan's, both Skylark group, are the most reliable for free Wi-Fi and outlets. For very late nights, look for a 24-hour Gusto or a Bamiyan branch open until 5am." },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
