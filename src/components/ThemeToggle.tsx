"use client";

import { useEffect, useState } from "react";

// The class on <html> is the source of truth (set by the inline script in
// layout.tsx before hydration, and toggled here); this just mirrors it into
// state so the button label reflects the current theme.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark === null ? 'Toggle light/dark theme' : isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label="Toggle light/dark theme"
      className="rounded px-2 py-1 text-xl font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10 cursor-pointer"
    >
      {isDark === null ? " " : isDark ? "☼" : "⏾"}
    </button>
  );
}
