// Original cute line-doodle assets (Tokyo/Japan + coffee themed). Stroke-only and
// drawn with currentColor, so they recolor via CSS and adapt to light/dark. Each
// doodle lives in a 48x48 box. Decorative only.

const PATHS: Record<string, string> = {
  cup: `<path d="M13,13 L35,13 L34,18 L14,18 Z"/><path d="M14,18 L34,18 L31,41 L17,41 Z"/><path d="M20,9 q2.5,-3 0,-6"/><path d="M27,9 q2.5,-3 0,-6"/>`,
  fuji: `<path d="M6,37 L24,12 L42,37"/><path d="M4,37 L44,37"/><path d="M17,22 L20,26 L24,21 L28,26 L31,22"/><path d="M9,31 q3,-3 6,0"/><path d="M33,31 q3,-3 6,0"/>`,
  torii: `<path d="M6,13 Q24,8 42,13"/><path d="M11,19 L37,19"/><path d="M15,12 L16,42"/><path d="M32,12 L33,42"/><path d="M7,13 L7,10"/><path d="M41,13 L41,10"/>`,
  sakura: `<path d="M24,15 q4,3 0,8 q-4,-5 0,-8 Z"/><path d="M32.6,21.2 q1,4.8 -5.4,4.9 q3.4,-4.2 5.4,-4.9 Z"/><path d="M29.3,31.4 q-4.2,2.6 -7.1,-3.2 q5,1.2 7.1,3.2 Z"/><path d="M18.7,31.4 q-2.1,-4.6 5.6,-6.3 q-1.3,5.3 -5.6,6.3 Z"/><path d="M15.4,21.2 q4.6,-1.8 8,3.6 q-5.4,0.7 -8,-3.6 Z"/><circle cx="24" cy="24" r="1.6"/>`,
  lantern: `<path d="M24,13 C16,13 15,20 15,26 C15,32 16,39 24,39 C32,39 33,32 33,26 C33,20 32,13 24,13 Z"/><path d="M20,12 L28,12 L27,15 L21,15 Z"/><path d="M21,39 L27,39 L26,42 L22,42 Z"/><path d="M16,22 L32,22"/><path d="M15.2,26 L32.8,26"/><path d="M16,30 L32,30"/>`,
  dango: `<path d="M24,7 L24,43"/><circle cx="24" cy="15" r="6"/><circle cx="24" cy="26" r="6"/><circle cx="24" cy="37" r="6"/>`,
  cloud: `<path d="M15,33 C11,33 10,26 15,25 C15,18 26,17 27,23 C33,20 38,27 34,30 C37,33 33,33 33,33 Z"/>`,
  cat: `<path d="M14,17 L17,9 L22,15"/><path d="M34,17 L31,9 L26,15"/><path d="M24,13 C15,13 13,22 13,26 C13,34 18,39 24,39 C30,39 35,34 35,26 C35,22 33,13 24,13 Z"/><circle cx="20" cy="25" r="1.4"/><circle cx="28" cy="25" r="1.4"/><path d="M23,29 q1,1.4 2,0"/><path d="M8,25 L15,26"/><path d="M8,29 L15,29"/><path d="M40,25 L33,26"/><path d="M40,29 L33,29"/>`,
  onigiri: `<path d="M24,11 C20,11 12,31 12,34 C12,37 36,37 36,34 C36,31 28,11 24,11 Z"/><path d="M17,29 L17,36 L31,36 L31,29 Z"/>`,
  daruma: `<path d="M24,11 C15,11 11,20 11,28 C11,36 16,40 24,40 C32,40 37,36 37,28 C37,20 33,11 24,11 Z"/><path d="M17,22 q3,-3 6,0"/><path d="M25,22 q3,-3 6,0"/><circle cx="20" cy="26" r="2.2"/><circle cx="28" cy="26" r="2.2"/><path d="M19,33 q5,3 10,0"/>`,
};

export type DoodleName = keyof typeof PATHS;

export function Doodle({ name, size = 34, className }: { name: DoodleName; size?: number; className?: string }) {
  return (
    <svg
      className={`doodle${className ? " " + className : ""}`}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: PATHS[name] }}
    />
  );
}

const STRIP: DoodleName[] = ["cup", "torii", "fuji", "lantern", "cat", "sakura", "dango", "onigiri", "cloud", "daruma"];

// A thin decorative band of doodles, e.g. to sit above the hero.
export function DoodleStrip() {
  return (
    <div className="doodle-strip" aria-hidden="true">
      {STRIP.map((n, i) => (
        <Doodle key={i} name={n} />
      ))}
    </div>
  );
}
