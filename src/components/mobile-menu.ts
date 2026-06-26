/**
 * MobileMenu island — vanilla TS, no framework.
 * Implements a11y-correct off-canvas navigation:
 *   - Open/close via [data-menu-toggle] buttons and [data-menu-close]
 *   - ESC key dismisses
 *   - Click on scrim dismisses
 *   - Body scroll locked while open
 *   - Focus trapped inside the panel; focus restored to trigger on close
 *   - Re-bound after Astro view transitions
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function lockScroll(lock: boolean) {
  document.documentElement.style.overflow = lock ? "hidden" : "";
  document.body.style.overflow = lock ? "hidden" : "";
}

function getOpenPanels(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-menu-panel][data-open='true']")
  );
}

function closePanel(panel: HTMLElement, returnFocus?: HTMLElement) {
  panel.dataset.open = "false";
  panel.setAttribute("aria-hidden", "true");
  panel.setAttribute("inert", "");

  // Sync trigger state
  document
    .querySelectorAll<HTMLButtonElement>(`[data-menu-toggle][aria-controls='${panel.id}']`)
    .forEach((b) => b.setAttribute("aria-expanded", "false"));

  if (getOpenPanels().length === 0) lockScroll(false);
  returnFocus?.focus();
}

function openPanel(panel: HTMLElement, trigger: HTMLElement) {
  panel.dataset.open = "true";
  panel.setAttribute("aria-hidden", "false");
  panel.removeAttribute("inert");
  trigger.setAttribute("aria-expanded", "true");
  lockScroll(true);

  // Move focus to first focusable element inside the panel
  const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
  const first = focusables[0] ?? panel;
  first.focus();
}

function trapFocus(e: KeyboardEvent, panel: HTMLElement) {
  if (e.key !== "Tab") return;
  const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (focusables.length === 0) {
    e.preventDefault();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function attach() {
  const panels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-menu-panel]")
  );
  if (panels.length === 0) return;

  // Initial closed state
  panels.forEach((panel) => {
    if (!panel.id) return;
    panel.dataset.open = "false";
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("inert", "");
  });

  // Wire toggle buttons
  document.querySelectorAll<HTMLButtonElement>("[data-menu-toggle]").forEach((trigger) => {
    if (trigger.dataset.bound === "1") return;
    trigger.dataset.bound = "1";
    const targetId = trigger.getAttribute("aria-controls");
    if (!targetId) return;
    const panel = document.getElementById(targetId);
    if (!panel) return;

    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", () => {
      const isOpen = panel.dataset.open === "true";
      if (isOpen) {
        closePanel(panel, trigger);
      } else {
        openPanel(panel, trigger);
      }
    });
  });

  // Wire close buttons inside the panel
  document.querySelectorAll<HTMLElement>("[data-menu-close]").forEach((btn) => {
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => {
      const panel = btn.closest<HTMLElement>("[data-menu-panel]");
      if (panel) closePanel(panel);
    });
  });

  // ESC key + focus trap (one listener per panel, but only when open)
  panels.forEach((panel) => {
    if (panel.dataset.keyBound === "1") return;
    panel.dataset.keyBound = "1";
    panel.addEventListener("keydown", (e) => {
      if (panel.dataset.open !== "true") return;
      if (e.key === "Escape") {
        e.preventDefault();
        // Find the trigger that opened this panel
        const trigger = document.querySelector<HTMLButtonElement>(
          `[data-menu-toggle][aria-controls='${panel.id}']`
        );
        closePanel(panel, trigger ?? undefined);
        return;
      }
      trapFocus(e, panel);
    });
  });

  // Click on scrim (data-menu-scrim inside panel, sibling of menu content)
  document.querySelectorAll<HTMLElement>("[data-menu-scrim]").forEach((scrim) => {
    if (scrim.dataset.bound === "1") return;
    scrim.dataset.bound = "1";
    scrim.addEventListener("click", () => {
      const panel = scrim.closest<HTMLElement>("[data-menu-panel]");
      if (panel) closePanel(panel);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => queueMicrotask(attach));
} else {
  queueMicrotask(attach);
}

// View transitions
document.addEventListener("astro:after-swap", () => {
  document
    .querySelectorAll<HTMLElement>("[data-menu-toggle], [data-menu-close], [data-menu-scrim], [data-menu-panel]")
    .forEach((el) => {
      delete el.dataset.bound;
      delete el.dataset.keyBound;
    });
  lockScroll(false);
  attach();
});

export {};