import type { Metadata } from "next";
import { BRAND } from "./brand";

/**
 * Metadata for a public site page: title, description and the Open Graph / Twitter tags that make a pasted link show
 * a title, a description and the logo. Relative URLs resolve against metadataBase (app/layout.tsx, SITE_URL).
 * Not for /e/<name> invites: those are noindex and have their own preview card (app/e/[slug]/page.tsx).
 *
 * SEO ROLLBACK (owner, 2026-11-18: organic traffic fell after the 14-17 Nov SEO changes; "do our SEO same as it was
 * 1 week ago"): no canonical tag any more (it was built from SITE_URL, see lib/site.ts), no robots.txt, sitemap.xml,
 * llms.txt or JSON-LD, and the pages added on 16-17 Nov (/invitations, /wedding-invitations, /wording) are noindex
 * (`noindex`), with the site's links back on /templates?category= / ?state=. Bring them back one at a time.
 */
export function pageMeta(title: string, description: string, path: string, opts: { noindex?: boolean } = {}): Metadata {
  const images = [{ url: "/brand/mangalam-logo.png", width: 546, height: 290, alt: BRAND }];
  return {
    title,
    description,
    ...(opts.noindex ? { robots: { index: false, follow: true } } : null),
    openGraph: { title, description, url: path, siteName: BRAND, type: "website", locale: "en_IN", images },
    twitter: { card: "summary", title, description, images },
  };
}
