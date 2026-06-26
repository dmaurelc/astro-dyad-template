/**
 * Build-time OG image generator.
 *
 * Renders an SVG (1200x630) per article and one for the site-wide default,
 * then rasterizes to PNG via sharp. Output:
 *   - public/og/<slug>.png
 *   - public/og-default.png
 *
 * Usage:
 *   node scripts/generate-og.mjs
 *   pnpm og:generate
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { articles } from "./articles-meta.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "..", "public");

const SITE_NAME = "Astro Template";
const TAGLINE = "An editorial Astro starter · Tailwind v4 · Dark mode";

const W = 1200;
const H = 630;
const ACCENT = "#c8ff6b"; // matches @theme accent in src/styles/global.css
const BG = "#0b0b0f";
const FG = "#f4f4f5";
const MUTED = "#9b9ba3";

/**
 * Escape user-supplied text for safe inclusion in SVG.
 * Prevents accidental markup breakout from article titles or authors.
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
 * Word-wrap a title across up to `maxLines` lines, each up to `maxChars` chars.
 * Returns an array of { line, y } so the caller can position them.
 */
function wrapTitle(title, maxChars = 22, maxLines = 4) {
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

function buildSvg({ eyebrow, title, author, date, tags, accent = ACCENT }) {
  const lines = wrapTitle(title, 22, 4);
  const lineHeight = 78;
  const titleStartY = 250;
  const tagsEscaped = tags.map(escapeXml).join("  ·  ");
  const eyebrowEsc = escapeXml(eyebrow);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="grain" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG}" />
      <stop offset="100%" stop-color="#15151c" />
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#grain)" />

  <!-- Top hairline -->
  <rect x="64" y="64" width="80" height="2" fill="${accent}" />

  <!-- Eyebrow -->
  <text x="64" y="120" font-family="Geist, system-ui, sans-serif" font-size="20" font-weight="500" fill="${accent}" letter-spacing="2">
    ${eyebrowEsc}
  </text>

  <!-- Title -->
  ${lines
    .map(
      (line, i) =>
        `<text x="64" y="${titleStartY + i * lineHeight}" font-family="Fraunces, Georgia, serif" font-size="64" font-weight="500" fill="${FG}" letter-spacing="-2">${line}</text>`
    )
    .join("\n  ")}

  <!-- Author + date -->
  <text x="64" y="${H - 96}" font-family="Geist, system-ui, sans-serif" font-size="22" font-weight="500" fill="${FG}">
    ${escapeXml(author)}
  </text>
  <text x="64" y="${H - 64}" font-family="Geist, system-ui, sans-serif" font-size="18" font-weight="400" fill="${MUTED}">
    ${escapeXml(date)}
  </text>

  <!-- Tags (right side) -->
  <text x="${W - 64}" y="${H - 64}" text-anchor="end" font-family="Geist, system-ui, sans-serif" font-size="16" font-weight="400" fill="${MUTED}" letter-spacing="1.5">
    ${tagsEscaped}
  </text>

  <!-- Brand mark (bottom-right) -->
  <text x="${W - 64}" y="${H - 24}" text-anchor="end" font-family="Fraunces, Georgia, serif" font-size="18" font-style="italic" fill="${accent}">
    ${escapeXml(SITE_NAME)}
  </text>
</svg>`;
}

async function writePng(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function generate() {
  await mkdir(resolve(PUBLIC_DIR, "og"), { recursive: true });

  // Per-article OG images
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
    eyebrow: "TEMPLATE",
    title: SITE_NAME,
    author: TAGLINE,
    date: "astro-dyad-template.netlify.app",
    tags: ["Astro 7", "Tailwind v4", "Dark mode"],
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