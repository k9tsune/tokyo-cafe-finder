"use client";

import { useEffect, useState } from "react";

// Light/dark toggle. Defaults to following the OS until the user picks one, then
// remembers the choice. A tiny inline script in the layout applies the saved
// choice before paint to avoid a flash.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("wc-theme");
    } catch {
      /* ignore */
    }
    if (stored === "light" || stored === "dark") setTheme(stored);
    else setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("wc-theme", next);
    } catch {
      /* ignore */
    }
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
