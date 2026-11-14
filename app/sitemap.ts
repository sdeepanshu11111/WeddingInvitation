import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

/** /sitemap.xml: every page a search engine should know: home, the design browser and its function filters,
    one page per design, the studio and the policy pages. Invites (/e/<name>) are private to their guests. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: SITE_URL + path, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/templates", 0.9),
    ...CATEGORIES.map((c) => page("/templates?category=" + c.id, 0.7)),
    ...TEMPLATES.map((t) => page("/templates/" + t.id, 0.8)),
    page("/create", 0.6),
    ...["/privacy", "/terms", "/refunds", "/contact"].map((p) => page(p, 0.2)),
  ];
}
