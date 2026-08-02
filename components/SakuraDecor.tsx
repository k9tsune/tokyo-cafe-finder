// Decorative sakura (cherry-blossom) + faint Mt Fuji scene for the Japan pages.
// Purely decorative (aria-hidden). "full" adds the faint Fuji band; the light
// version is just the corner branch and a few drifting petals.

const BLOSSOM = (x: number, y: number, r: number, rot: number) =>
  `<g transform="translate(${x},${y}) rotate(${rot}) scale(${r})"><circle cx="0" cy="-4" r="3.1"/><circle cx="3.8" cy="-1.2" r="3.1"/><circle cx="2.3" cy="3.4" r="3.1"/><circle cx="-2.3" cy="3.4" r="3.1"/><circle cx="-3.8" cy="-1.2" r="3.1"/><circle cx="0" cy="0" r="1.4" fill="#e98bad"/></g>`;

const PETAL = (x: number, y: number, rot: number, s: number) =>
  `<path transform="translate(${x},${y}) rotate(${rot}) scale(${s})" d="M0 0 C -3 -5 -3 -11 0 -15 C 3 -11 3 -5 0 0 Z"/>`;

const BRANCH =
  `<svg class="sk-branch" viewBox="0 0 170 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
  `<path d="M170 6 C140 12 120 26 104 44 M132 22 C126 30 124 36 126 44 M112 36 C108 44 108 50 112 58" stroke="#b98a6a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
  `<g fill="#f2aecb">${BLOSSOM(150, 14, 1.05, 10)}${BLOSSOM(126, 26, 0.95, -20)}${BLOSSOM(104, 46, 1.1, 26)}${BLOSSOM(120, 60, 0.7, 40)}</g></svg>`;

const PETALS =
  `<svg class="sk-petals" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="#f3b3ce">` +
  PETAL(120, 70, 20, 1.2) + PETAL(300, 40, -30, 1) + PETAL(470, 120, 50, 1.1) +
  PETAL(250, 180, 15, 0.9) + PETAL(560, 60, -15, 1) + PETAL(60, 180, 35, 0.9) +
  BLOSSOM(400, 90, 0.8, 10) + BLOSSOM(650, 150, 0.7, -24) + `</svg>`;

const FUJI =
  `<svg class="sk-fuji" viewBox="0 0 400 46" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
  `<path d="M150 46 L232 20 Q243 15 254 20 L330 46 Z" fill="#aebdd2"/>` +
  `<path d="M220 27 Q232 18 246 27 Q240 25 235 28 Q230 23 225 28 Z" fill="#fbfdff"/></svg>`;

export default function SakuraDecor({ full = false }: { full?: boolean }) {
  const html = full ? PETALS + BRANCH + FUJI : BRANCH;
  return <div className="sakura" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}
