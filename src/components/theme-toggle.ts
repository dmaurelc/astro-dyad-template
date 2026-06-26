/**
 * Theme toggle island — pure TypeScript, no framework dependency.
 * Hydrated by Astro on the client (client:load). Persists to localStorage
 * and reacts to OS-level preference changes. Toggles the `.dark` class on
 * <html> which is consumed by the `@custom-variant dark` rule in global.css.
 */

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function currentTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function updateToggleUI(theme: Theme) {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn) return;
  const isDark = theme === "dark";
  btn.setAttribute("aria-pressed", String(isDark));
  btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  btn.setAttribute("title", isDark ? "Light mode" : "Dark mode");
  const sun = btn.querySelector<HTMLElement>("[data-icon-sun]");
  const moon = btn.querySelector<HTMLElement>("[data-icon-moon]");
  if (sun && moon) {
    sun.classList.toggle("hidden", isDark);
    moon.classList.toggle("hidden", !isDark);
  }
}

function toggleTheme() {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* storage may be blocked; non-fatal */
  }
  updateToggleUI(next);
}

function attach() {
  const btn = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!btn || btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";
  btn.addEventListener("click", toggleTheme);
  updateToggleUI(currentTheme());

  // React to OS preference changes only when the user hasn't explicitly chosen.
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener?.("change", (e) => {
    if (getStoredTheme() !== null) return;
    applyTheme(e.matches ? "dark" : "light");
    updateToggleUI(e.matches ? "dark" : "light");
  });
}

// Defer to next idle frame so the inline pre-paint script always wins the race.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => queueMicrotask(attach));
} else {
  queueMicrotask(attach);
}

// Astro view transitions — re-bind after each navigation
document.addEventListener("astro:after-swap", () => {
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")
    .forEach((b) => delete b.dataset.bound);
  attach();
});

export {};