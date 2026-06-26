/**
 * Site-wide constants. Single source of truth for URLs, brand, and OG defaults.
 *
 * NOTE: keep `url` in sync with `astro.config.mjs`'s `site` field.
 * Astro config cannot import TS, so the URL is duplicated there with a comment.
 */
export const SITE = {
  url: "https://astro-dyad-template.netlify.app/",
  name: "Astro Template",
  shortName: "Astro Dyad",
  description:
    "An editorial Astro template with Tailwind v4, dark mode, and content collections.",
  locale: "en",
  defaultImage: "/og-default.png",
  twitterHandle: "@astrodyad",
  organization: {
    name: "Astro Dyad",
    url: "https://astro-dyad-template.netlify.app/",
    logo: "/favicon.svg",
  },
} as const;