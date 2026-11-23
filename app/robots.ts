import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** /robots.txt (back 2026-11-23 for the AdSense review; removed in the 18 Nov SEO rollback): the site pages are for
    crawlers; the export pages, the admin list and the API are not. Invites (/e/<name>) are deliberately NOT disallowed:
    they carry a noindex tag, and a crawler that is forbidden to fetch a page never sees that tag and may still list the
    bare address (which has the names). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/render", "/client-render"] }],
    sitemap: SITE_URL + "/sitemap.xml",
  };
}
