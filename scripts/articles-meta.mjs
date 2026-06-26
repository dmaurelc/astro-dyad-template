/**
 * Plain-JS mirror of OG-relevant article fields.
 * The build-time OG generator (scripts/generate-og.mjs) reads this file
 * instead of articles.ts so it does not need a TypeScript loader.
 *
 * Keep fields in sync with src/lib/articles.ts.
 */
export const articles = [
  {
    slug: "the-quiet-framework",
    title: "The quiet framework",
    author: "Mira Castell",
    publishedAt: "2026-06-21",
    tags: ["philosophy", "performance"],
  },
  {
    slug: "islands-in-practice",
    title: "Islands in practice",
    author: "Tomás Albright",
    publishedAt: "2026-06-14",
    tags: ["astro", "patterns"],
  },
  {
    slug: "tailwind-v4-and-css-variables",
    title: "Tailwind v4 and the return of CSS variables",
    author: "Hana Okafor",
    publishedAt: "2026-06-07",
    tags: ["css", "tailwind"],
  },
  {
    slug: "editorial-typography-on-the-web",
    title: "Editorial typography on the web",
    author: "Léa Tremblay",
    publishedAt: "2026-05-29",
    tags: ["typography", "design"],
  },
];