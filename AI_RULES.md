# AI Development Rules

This document outlines the technology stack and specific library usage guidelines for this Astro application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

* **Framework**: Astro - A content-driven web framework for building fast, modern websites with minimal JavaScript.
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4 - A utility-first CSS framework for rapid UI development.
* **Icons**: Astro supports any icon library; prefer inline SVGs or `astro-icon` for optimized icons.
* **Routing**: Astro file-based routing via `src/pages/` directory.
* **Content**: Astro Content Collections for type-safe Markdown, MDX, or JSON content management.

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

1. **Components**:
   * **Primary Choice**: Create `.astro` components in `src/components/` for reusable UI.
   * **Islands**: When client-side interactivity is needed, use Astro's client directives (`client:load`, `client:idle`, `client:visible`, `client:media`, `client:only`) with framework components (React, Vue, Svelte, etc.) placed in `src/components/`.
   * **Avoid**: Introducing server-side rendering frameworks (Next.js, Nuxt) as the primary rendering layer.

2. **Styling**:
   * **Primary Choice**: Exclusively use Tailwind CSS v4 utility classes for all styling.
   * **Global Styles**: Reserve `src/styles/global.css` for `@import "tailwindcss"`, `@theme` customizations, and minimal base styling. Avoid adding component-specific styles here.
   * **Component Styles**: Use `<style>` tags within `.astro` components for scoped CSS when Tailwind utilities are insufficient. Astro automatically scopes these styles.
   * **CSS-in-JS**: Do not use CSS-in-JS libraries.

3. **Icons**:
   * **Primary Choice**: Use inline SVGs or the `astro-icon` package for optimized icon rendering.
   * **Avoid**: Large icon libraries that ship unnecessary JavaScript.

4. **Routing**:
   * Utilize Astro's file-based routing in the `src/pages/` directory.
   * Each `.astro` or `.md` file in `src/pages/` becomes a route.
   * Dynamic routes use `[param].astro` syntax.
   * Layouts in `src/layouts/` wrap page content.

5. **Content Management**:
   * **Content Collections**: Define schemas in `src/content.config.ts` for type-safe content.
   * **Markdown/MDX**: Place content files in `src/content/` with proper collection structure.

6. **Data Fetching**:
   * **Build-time**: Use top-level `await` or `Astro.fetch()` in `.astro` components for data fetched at build time.
   * **Server-side**: Use Astro server endpoints (`src/pages/api/*.ts`) for API routes.
   * **Client-side**: Use the native `fetch` API in framework components with client directives.

7. **Performance**:
   * **Zero JS by default**: Leverage Astro's island architecture to ship zero JavaScript unless interactivity is needed.
   * **Partial Hydration**: Use client directives sparingly and prefer `client:load` only for above-the-fold interactive components.
   * **Images**: Use the Astro `<Image />` component from `astro:assets` for optimized images.

8. **View Transitions**:
   * Add `<ViewTransitions />` from `astro:transitions` to layouts for smooth page transitions.

9. **TypeScript**:
   * Write all new code in TypeScript.
   * Strive for strong typing and leverage TypeScript's features to improve code quality and maintainability. Avoid using `any` where possible.

10. **Utility Functions**:
    * General-purpose helper functions should be placed in `src/lib/utils.ts`.
    * Ensure functions are well-typed and serve a clear, reusable purpose.

By following these guidelines, we can build a more robust, maintainable, and consistent application.
