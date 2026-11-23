import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { DESIGNS } from "@/lib/templates";

/** /sitemap.xml (back 2026-11-23 for the AdSense review): only the pages that are indexable today: home, the design
    browser, one page per design (not the language versions), the guides, about and the policy pages. The noindex pages of the 18 Nov SEO rollback
    (/invitations, /wedding-invitations, /wording) stay out until they come back one at a time. Invites are private. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "weekly"): MetadataRoute.Sitemap[number] => ({
    url: SITE_URL + path,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1),
    page("/templates", 0.9),
    ...DESIGNS.map((t) => page("/templates/" + t.id, 0.7)), // the 26 designs; language versions stay reachable but unlisted (near-duplicates)
    page("/guides", 0.8),
    ...GUIDES.map((g) => ({ ...page("/guides/" + g.slug, 0.8, "monthly"), lastModified: new Date(g.updated) })),
    page("/about", 0.4, "monthly"),
    ...["/privacy", "/terms", "/refunds", "/contact"].map((p) => page(p, 0.2, "monthly")),
  ];
}
