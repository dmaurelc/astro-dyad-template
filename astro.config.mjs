import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Keep `site` in sync with SITE.url in src/lib/site.ts — Astro config
// cannot import TS, so the URL is duplicated here. Comment at SITE.url
// references this file.
export default defineConfig({
  site: "https://astro-dyad-template.netlify.app/",
  vite: {
    plugins: [tailwindcss()],
  },
});