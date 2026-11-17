import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/catalog";
import { REGIONS } from "@/lib/regions";
import { functionPath, statePath } from "@/lib/landing";
import { WORDING } from "@/lib/wording";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

/** /sitemap.xml: every page a search engine should know: home, the design browser, a page per function (/invitations/haldi)
    and per state (/wedding-invitations/tamil-nadu), the wording guides, one page per design, the studio and the policy pages. Invites
    (/e/<name>) are private to their guests. */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: SITE_URL + path, changeFrequency: "weekly", priority });
  return [
    page("/", 1),
    page("/templates", 0.9),
    ...CATEGORIES.map((c) => page(functionPath(c.id), 0.8)),
    ...REGIONS.map((r) => page(statePath(r.id), 0.8)),
    page("/wording", 0.6),
    ...WORDING.map((w) => page("/wording/" + w.id, 0.6)),
    ...TEMPLATES.map((t) => page("/templates/" + t.id, 0.8)),
    page("/create", 0.6),
    ...["/privacy", "/terms", "/refunds", "/contact"].map((p) => page(p, 0.2)),
  ];
}
