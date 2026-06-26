/**
 * Counter island — minimal vanilla TS to demonstrate Astro's hydration model.
 * Hydrated with `client:load` on the playground page. The static markup around
 * it stays untouched; only this widget ships JavaScript.
 */

const STORAGE_KEY = "playground-counter";

function readPersisted(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw == null ? 0 : Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writePersisted(n: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(n));
  } catch {
    /* non-fatal */
  }
}

function attach() {
  document
    .querySelectorAll<HTMLElement>("[data-counter]")
    .forEach((root) => {
      if (root.dataset.bound === "1") return;
      root.dataset.bound = "1";

      const valueEl = root.querySelector<HTMLElement>("[data-counter-value]");
      const decBtn = root.querySelector<HTMLButtonElement>("[data-counter-dec]");
      const incBtn = root.querySelector<HTMLButtonElement>("[data-counter-inc]");
      const resetBtn = root.querySelector<HTMLButtonElement>("[data-counter-reset]");
      const historyEl = root.querySelector<HTMLElement>("[data-counter-history]");

      if (!valueEl || !decBtn || !incBtn || !resetBtn) return;

      let value = readPersisted();
      const history: number[] = [value];
      const MAX_HISTORY = 5;

      function render() {
        valueEl!.textContent = String(value);
        if (historyEl) {
          historyEl.textContent =
            history.length > 1
              ? history
                  .slice(-MAX_HISTORY)
                  .reverse()
                  .map((n) => String(n))
                  .join(" · ")
              : "—";
        }
      }

      function set(next: number) {
        value = next;
        history.push(value);
        if (history.length > MAX_HISTORY) history.shift();
        writePersisted(value);
        render();
      }

      decBtn.addEventListener("click", () => set(value - 1));
      incBtn.addEventListener("click", () => set(value + 1));
      resetBtn.addEventListener("click", () => {
        value = 0;
        history.length = 0;
        history.push(0);
        writePersisted(value);
        render();
      });

      render();
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => queueMicrotask(attach));
} else {
  queueMicrotask(attach);
}

document.addEventListener("astro:after-swap", () => {
  document
    .querySelectorAll<HTMLElement>("[data-counter]")
    .forEach((el) => delete el.dataset.bound);
  attach();
});

export {};