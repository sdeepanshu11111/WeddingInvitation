/** schema.org structured data for search engines and AI assistants. `<` is escaped so a value can never close the
    script tag. Server component: the data is in the page's HTML. */
export function JsonLd({ data }: { data: object | object[] }) {
  // Off since the SEO rollback (2026-11-18, see lib/seo.ts): the pages render no structured data, as before 14 Nov.
  const on = false;
  return on ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} /> : null;
}

/** A breadcrumb trail: [["Home", "/"], ["Designs", "/templates"], ...], absolute URLs from `site`. */
export const breadcrumbLd = (site: string, trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site + path })),
});
