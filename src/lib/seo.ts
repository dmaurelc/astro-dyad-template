import { SITE } from "./site";

/**
 * Pure JSON-LD builders. No Astro deps — easy to unit test if needed.
 * Each function returns a plain object that JsonLd.astro stringifies.
 */

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { "@type": "Organization", name: SITE.organization.name },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.organization.name,
    url: SITE.organization.url,
    logo: new URL(SITE.organization.logo, SITE.url).toString(),
    sameAs: [] as string[],
  };
}

export interface ArticleLike {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: Date;
  tags: string[];
}

export function buildArticleJsonLd(article: ArticleLike, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url,
    datePublished: article.publishedAt.toISOString(),
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: SITE.organization.name,
      logo: {
        "@type": "ImageObject",
        url: new URL(SITE.organization.logo, SITE.url).toString(),
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    keywords: article.tags.join(", "),
  };
}

export interface Breadcrumb {
  name: string;
  href: string;
}

export function buildBreadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.href, SITE.url).toString(),
    })),
  };
}