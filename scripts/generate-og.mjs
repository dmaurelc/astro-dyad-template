/**
 * Build-time OG image generator.
 *
 * Renders a 1200x630 SVG that matches the site's editorial design system
 * (Fraunces display serif, Geist body, terracotta accent, warm black bg)
 * and rasterizes to PNG via sharp.
 *
 * Output:
 *   - public/og/<slug>.png  (one per article)
 *   - public/og-default.png (site-wide fallback)
 *
 * Usage:
 *   node scripts/generate-og.mjs
 *   pnpm og:generate
 */

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { articles } from "./articles-meta.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");

const SITE_NAME = "Astro Template";
const TAGLINE = "An editorial Astro starter.";

// Design tokens — mirror src/styles/global.css @theme + .dark
const BG = "#1A1816";        // --color-background dark
const FG = "#F5F2EC";        // --color-foreground dark (warm off-white)
const MUTED = "#9C9690";     // --color-muted-foreground dark
const ACCENT = "#C47959";    // --color-accent dark (terracotta, oklch ~0.72 0.14 40)
const BORDER = "#3A3530";    // --color-border dark

const W = 1200;
const H = 630;

/**
 * Escape user-supplied text for safe inclusion in SVG.
 * Prevents markup breakout from article titles or authors.
 */
function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Word-wrap a title across up to maxLines lines, each up to maxChars chars.
 */
function wrapTitle(title, maxChars = 28, maxLines = 4) {
  const words = escapeXml(title).split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

/**
 * Split a phrase into spans for terracotta-highlighted words.
 * We highlight the second word if it exists (mirrors "loud" pattern
 * from the home hero), giving visual rhyme with the actual site.
 */
function highlightWords(title) {
  const words = title.split(/\s+/);
  if (words.length < 2) return [{ text: title, accent: false }];
  return [
    { text: words[0], accent: false },
    { text: words.slice(1).join(" "), accent: true },
  ];
}

/**
 * Render an article-styled OG card.
 * Layout mirrors the home hero: top hairline + eyebrow, large Fraunces
 * display, bottom hairline + meta row (author · date · tags).
 */
function buildSvg({ eyebrow, title, author, date, tags, kind = "article" }) {
  const lines = wrapTitle(title, 28, 4);
  const lineHeight = 78;
  const titleStartY = 280;
  const tagsEscaped = tags.map(escapeXml).join("  ·  ");

  // Title rendering: highlight second word in terracotta on first line,
  // plain foreground on subsequent lines.
  const titleLines = lines.map((line, idx) => {
    const isFirst = idx === 0;
    const parts = isFirst ? highlightWords(line) : [{ text: line, accent: false }];
    const tspan = parts
      .map(
        (p) =>
          `<tspan fill="${p.accent ? ACCENT : FG}">${escapeXml(p.text)}</tspan>`
      )
      .join(" ");
    return `<text x="80" y="${titleStartY + idx * lineHeight}" font-family="Fraunces, 'Iowan Old Style', Georgia, serif" font-size="68" font-weight="500" letter-spacing="-2">${tspan}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- Background: warm black, matches dark color-background -->
  <rect width="${W}" height="${H}" fill="${BG}" />

  <!-- Top hairline decoration (mirrors the small accent dash in the hero) -->
  <rect x="80" y="80" width="56" height="2" fill="${ACCENT}" />

  <!-- Eyebrow: uppercase, wide tracking, terracotta (matches .eyebrow class) -->
  <text x="80" y="120" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="500" fill="${ACCENT}" letter-spacing="3">
    ${escapeXml(eyebrow)}
  </text>

  <!-- Site brand, top right (mirrors Header.astro) -->
  <text x="${W - 80}" y="120" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="20" font-style="italic" fill="${FG}">
    ${escapeXml(SITE_NAME)}<tspan fill="${MUTED}">.</tspan>
  </text>

  <!-- Hairline above title -->
  <line x1="80" y1="180" x2="${W - 80}" y2="180" stroke="${BORDER}" stroke-width="1" />

  <!-- Title: Fraunces serif, terracotta highlight on second word -->
  ${titleLines.join("\n  ")}

  <!-- Bottom hairline (matches border-y utility in articles) -->
  <line x1="80" y1="${H - 110}" x2="${W - 80}" y2="${H - 110}" stroke="${BORDER}" stroke-width="1" />

  <!-- Meta row: author and date (left), tags (right) -->
  <text x="80" y="${H - 70}" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="500" fill="${FG}">
    ${escapeXml(author)}
  </text>
  <text x="80" y="${H - 40}" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="400" fill="${MUTED}" letter-spacing="1">
    ${escapeXml(date)}${kind === "default" ? "  ·  " + escapeXml(TAGLINE) : ""}
  </text>

  <text x="${W - 80}" y="${H - 40}" text-anchor="end" font-family="Geist, ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="400" fill="${MUTED}" letter-spacing="2">
    ${tagsEscaped}
  </text>
</svg>`;
}

async function writePng(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function generate() {
  await mkdir(resolve(PUBLIC_DIR, "og"), { recursive: true });

  for (const article of articles) {
    const svg = buildSvg({
      eyebrow: article.tags[0]?.toUpperCase() ?? "ARTICLE",
      title: article.title,
      author: article.author,
      date: article.publishedAt,
      tags: article.tags,
    });
    const outPath = resolve(PUBLIC_DIR, "og", `${article.slug}.png`);
    await writePng(svg, outPath);
    console.log(`✓ ${outPath.replace(PUBLIC_DIR + "/", "")}`);
  }

  // Site-wide default OG image
  const defaultSvg = buildSvg({
    eyebrow: "ISSUE 01",
    title: "A quiet framework for loud ideas.",
    author: SITE_NAME,
    date: "astro-dyad-template.netlify.app",
    tags: ["Astro 7", "Tailwind v4", "Dark mode"],
    kind: "default",
  });
  const defaultOut = resolve(PUBLIC_DIR, "og-default.png");
  await writePng(defaultSvg, defaultOut);
  console.log(`✓ ${defaultOut.replace(PUBLIC_DIR + "/", "")}`);

  console.log(`\nGenerated ${articles.length + 1} OG images.`);
}

generate().catch((err) => {
  console.error("OG generation failed:", err);
  process.exit(1);
});