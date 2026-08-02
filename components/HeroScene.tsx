// Decorative hero illustration: the Tokyo skyline (Tokyo Tower + Skytree) framed
// in a browser window, with drifting sakura petals and a blossom branch. The
// skyline shape is traced from artwork; everything is themed via CSS variables
// (see .hs-* rules in globals.css) so it adapts to light and dark mode. Static
// markup, so it renders as inline SVG with no client JS.

const SVG = `
<svg viewBox="0 0 620 470" xmlns="http://www.w3.org/2000/svg" class="hero-scene" role="img" aria-label="Tokyo skyline with Tokyo Tower and Skytree, framed in a browser window with cherry blossoms">
<g class="hs-squiggle" fill="none">
  <circle cx="590" cy="40" r="46" />
  <circle cx="30" cy="434" r="52" />
  <circle cx="566" cy="450" r="40" />
  <circle cx="8" cy="70" r="34" />
</g>
<g>
  <rect x="44" y="70" width="532" height="352" rx="18" class="hs-window"/>
  <rect x="44" y="70" width="532" height="352" rx="18" class="hs-frame" fill="none"/>
  <line x1="44" y1="104" x2="576" y2="104" class="hs-frame"/>
  <circle cx="64" cy="87.0" r="4.5" class="hs-dot"/>
  <circle cx="80" cy="87.0" r="4.5" class="hs-dot"/>
  <circle cx="96" cy="87.0" r="4.5" class="hs-dot"/>
  <clipPath id="winclip"><rect x="52" y="108" width="516" height="304" rx="6"/></clipPath>
  <g clip-path="url(#winclip)">
    <g transform="translate(157.6,150) rotate(20) scale(1.0)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g><g transform="translate(269.36,132) rotate(-30) scale(0.8)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g><g transform="translate(360.8,165) rotate(40) scale(1.1)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g><g transform="translate(452.24,140) rotate(-15) scale(0.9)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g><g transform="translate(320.16,200) rotate(60) scale(0.7)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g><g transform="translate(492.88,190) rotate(25) scale(0.8)"><path class="hs-petal" d="M0,-6 C4,-4 4,3 0,6 C-4,3 -4,-4 0,-6 Z"/></g>
    <g transform="translate(61.1,72.2) scale(1.648)" class="hs-sky"><g transform="translate(0,194) scale(0.1,-0.1)"><path d="M2057 951 c-2 -11 0 -24 6 -30 15 -15 -2 -30 -35 -33 -17 -1 -29 -9 -32 -22 -5 -18 -7 -18 -28 -4 -13 9 -24 21 -24 27 -5 42 -9 8 -14 -114 l-5 -140 -33 -3 c-27 -3 -35 1 -39 17 -4 16 -13 21 -39 21 l-33 0 -3 -82 c-2 -66 -6 -83 -18 -83 -11 0 -16 15 -20 58 -3 31 -8 57 -12 57 -5 0 -12 0 -18 0 -5 0 -10 -13 -10 -28 0 -15 -4 -32 -9 -38 -5 -5 -11 -18 -13 -29 -2 -11 -14 -22 -28 -25 -18 -4 -26 -14 -30 -35 -8 -46 -25 -30 -28 26 l-3 50 -42 -3 -42 -3 -5 174 c-4 149 -7 172 -19 158 -12 -15 -15 -15 -41 3 -24 17 -29 18 -34 4 -3 -8 -10 -12 -16 -9 -5 3 -14 -5 -20 -19 -5 -14 -14 -26 -20 -26 -6 0 -10 -49 -10 -134 0 -78 -4 -137 -10 -141 -5 -3 -23 15 -40 41 -16 27 -30 42 -30 36 0 -18 -51 -92 -60 -87 -4 3 -11 25 -14 49 -14 88 -79 98 -90 13 -3 -23 -7 -64 -9 -92 -2 -47 -17 -69 -23 -35 -1 8 -12 60 -24 115 -11 55 -23 132 -27 172 -4 48 -10 70 -17 66 -21 -13 -67 -9 -76 6 -7 11 -10 -2 -10 -44 -2 -90 -8 -100 -63 -96 l-46 2 -5 -43 c-4 -24 -7 -65 -9 -93 -2 -46 -4 -50 -27 -50 l-25 0 -5 170 c-3 94 -7 145 -8 114 -2 -69 -1 -67 -63 -59 -29 4 -66 4 -82 1 l-29 -6 -2 -150 c-1 -116 -4 -149 -14 -147 -10 2 -12 -34 -11 -164 1 -139 4 -164 15 -160 25 9 28 -24 5 -48 -39 -41 -29 -46 95 -46 l116 0 29 31 c22 24 34 29 51 24 33 -11 50 -26 44 -42 -4 -11 176 -13 1064 -13 l1070 0 0 32 c0 25 -3 29 -12 20 -15 -15 -45 -16 -53 -2 -10 16 15 40 41 40 l24 0 0 280 0 280 -35 0 c-24 0 -39 6 -47 20 -7 11 -19 20 -26 20 -6 0 -20 -9 -29 -20 -10 -11 -23 -20 -30 -20 -8 0 -13 -21 -15 -62 -3 -63 -3 -63 -35 -66 -28 -3 -32 -7 -35 -35 -5 -49 -32 -42 -36 8 -3 57 -11 85 -22 85 -6 0 -10 -7 -10 -15 0 -8 -4 -23 -9 -33 -5 -9 -12 -25 -15 -34 -7 -23 -27 -23 -33 0 -2 10 -22 25 -43 35 -39 16 -39 17 -42 79 -3 56 -5 63 -27 68 -14 3 -32 20 -42 40 l-19 35 0 -53 c0 -51 -23 -107 -40 -97 -4 2 -10 42 -14 87 -14 178 -16 188 -39 184 -13 -2 -24 -14 -29 -32 -9 -32 -15 -290 -8 -313 4 -10 -3 -15 -20 -15 -24 -1 -25 1 -28 79 -2 44 -7 84 -12 89 -6 6 -10 31 -10 56 0 25 -7 55 -15 66 -8 10 -15 44 -16 74 -2 54 -3 54 -6 10 -5 -54 -17 -70 -53 -70 -22 0 -29 -6 -36 -31 -17 -58 -29 -36 -32 58 -2 78 -6 94 -21 103 -15 7 -20 6 -24 -9z"/></g></g>
    <g class="hs-sky"><path d="M 191.4,392 L 199.4,334 L 197.4,328 L 219.4,328 L 217.4,334 L 225.4,392 Z" />
    <path d="M 199.4,328 L 203.4,274 L 201.4,268 L 215.4,268 L 213.4,274 L 217.4,328 Z"/>
    <path d="M 203.4,268 L 206.0,227 L 210.8,227 L 213.4,268 Z"/>
    <rect x="207.2" y="192" width="2.4" height="36"/><path d="M 380.28,392 L 387.28,272 L 384.78,242 L 397.78,242 L 395.28,272 L 402.28,392 Z"/>
    <ellipse cx="391.28" cy="242" rx="7.5" ry="5"/>
    <path d="M 387.28,240 L 388.88,200 L 393.68,200 L 395.28,240 Z"/>
    <rect x="390.28" y="156" width="2" height="46"/></g>
    <g class="hs-branch-g">
  <path class="hs-branch" fill="none" d="M 54,394 Q 96,382 132,348 M 92,380 Q 102,386 114,382 M 114,358 Q 122,364 132,360"/>
  <circle cx="132.0" cy="339.0" r="4.3" class="hs-blossom"/><circle cx="138.7" cy="343.8" r="4.3" class="hs-blossom"/><circle cx="136.1" cy="351.7" r="4.3" class="hs-blossom"/><circle cx="127.9" cy="351.7" r="4.3" class="hs-blossom"/><circle cx="125.3" cy="343.8" r="4.3" class="hs-blossom"/><circle cx="132" cy="346" r="2.9" class="hs-blossom-c"/>
  <circle cx="116.0" cy="372.0" r="3.7" class="hs-blossom"/><circle cx="121.7" cy="376.1" r="3.7" class="hs-blossom"/><circle cx="119.5" cy="382.9" r="3.7" class="hs-blossom"/><circle cx="112.5" cy="382.9" r="3.7" class="hs-blossom"/><circle cx="110.3" cy="376.1" r="3.7" class="hs-blossom"/><circle cx="116" cy="378" r="2.5" class="hs-blossom-c"/>
  <circle cx="92.0" cy="376.6" r="3.3" class="hs-blossom"/><circle cx="97.1" cy="380.3" r="3.3" class="hs-blossom"/><circle cx="95.2" cy="386.4" r="3.3" class="hs-blossom"/><circle cx="88.8" cy="386.4" r="3.3" class="hs-blossom"/><circle cx="86.9" cy="380.3" r="3.3" class="hs-blossom"/><circle cx="92" cy="382" r="2.3" class="hs-blossom-c"/>
  <circle cx="134.0" cy="356.6" r="3.3" class="hs-blossom"/><circle cx="139.1" cy="360.3" r="3.3" class="hs-blossom"/><circle cx="137.2" cy="366.4" r="3.3" class="hs-blossom"/><circle cx="130.8" cy="366.4" r="3.3" class="hs-blossom"/><circle cx="128.9" cy="360.3" r="3.3" class="hs-blossom"/><circle cx="134" cy="362" r="2.3" class="hs-blossom-c"/>
</g>
  </g>
  <rect x="96" y="400" width="456" height="13" rx="6.5" class="hs-addr"/>
  <path d="M 78,406.5 l 8,-6 v12 z" class="hs-dot2"/>
</g>
</svg>`;

export default function HeroScene() {
  return <div className="hero-art-inner" dangerouslySetInnerHTML={{ __html: SVG }} />;
}
