/** schema.org structured data for search engines and AI assistants. `<` is escaped so a value can never close the
    script tag. Server component: the data is in the page's HTML. */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** A breadcrumb trail: [["Home", "/"], ["Designs", "/templates"], ...], absolute URLs from `site`. */
export const breadcrumbLd = (site: string, trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: site + path })),
});
