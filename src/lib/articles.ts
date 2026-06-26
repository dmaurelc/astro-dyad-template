/**
 * Demo articles data — in production this would be an Astro content collection
 * with Zod schemas and Markdown rendering. For this template we keep the data
 * in TypeScript so the blog index and dynamic route work without extra setup.
 */

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: Date;
  readingMinutes: number;
  tags: string[];
}

export const articles: Article[] = [
  {
    slug: "the-quiet-framework",
    title: "The quiet framework",
    excerpt:
      "Why zero-JavaScript-by-default is not a limitation but a design constraint worth keeping.",
    body:
      "Most frameworks treat HTML as the runtime target. Astro treats HTML as the build artifact. The difference is small in marketing copy and enormous in production. When HTML is the artifact, every other concern — interactivity, state, routing, data — has to justify its bytes against the cost of shipping them to a browser that already parses HTML natively.\n\nThis template leans into that constraint. The default page weight, on a slow 3G connection, is 14 KB of HTML plus 9 KB of compressed CSS. No framework runtime. No hydration mismatch. No progressive enhancement ladder to climb.",
    author: "Mira Castell",
    publishedAt: new Date("2026-06-21"),
    readingMinutes: 4,
    tags: ["philosophy", "performance"],
  },
  {
    slug: "islands-in-practice",
    title: "Islands in practice",
    excerpt:
      "A walkthrough of when to reach for client:load, client:idle, or client:visible.",
    body:
      "The island architecture lets you sprinkle interactivity where it earns its weight. The directives matter:\n\n- client:load — hydrate immediately. Use for above-the-fold interactive UI.\n- client:idle — hydrate during browser idle time. Good for non-critical widgets.\n- client:visible — hydrate when scrolled into view. Ideal for below-the-fold islands.\n- client:media — hydrate when a media query matches. Useful for mobile-only behavior.\n\nThe wrong choice adds latency. The right choice makes the page feel instant.",
    author: "Tomás Albright",
    publishedAt: new Date("2026-06-14"),
    readingMinutes: 6,
    tags: ["astro", "patterns"],
  },
  {
    slug: "tailwind-v4-and-css-variables",
    title: "Tailwind v4 and the return of CSS variables",
    excerpt:
      "How @theme, @custom-variant, and CSS custom properties replace the JavaScript config file.",
    body:
      "Tailwind v4 is the version the maintainers wanted to write all along: no PostCSS plugin chain, no JS config file, no opinionated reset bolted on at build time. The whole engine runs in the browser.\n\nThe @theme directive declares design tokens as CSS variables. The @custom-variant directive wires up dark mode to a class selector. The result is a single CSS file that reads like a design system spec and ships like one too.",
    author: "Hana Okafor",
    publishedAt: new Date("2026-06-07"),
    readingMinutes: 5,
    tags: ["css", "tailwind"],
  },
  {
    slug: "editorial-typography-on-the-web",
    title: "Editorial typography on the web",
    excerpt:
      "Variable fonts, optical sizing, and why the magazine grid still works in 2026.",
    body:
      "Print typography earned its conventions over four centuries of refinement. The web is barely 35 years old and we keep rediscovering the same ideas: hierarchy through scale, rhythm through leading, restraint through a single accent color.\n\nVariable fonts make this easier. A single Fraunces file ships six weights, two optical sizes, and a softness axis. The browser interpolates between them based on context. The result is type that breathes — tighter at display sizes, more open at body sizes — without shipping a dozen font files.",
    author: "Léa Tremblay",
    publishedAt: new Date("2026-05-29"),
    readingMinutes: 7,
    tags: ["typography", "design"],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}