import type { Metadata } from "next";
import { BRAND } from "./brand";

/**
 * Metadata for a public site page: its canonical address plus the Open Graph / Twitter tags that make a pasted link
 * show a title, a description and the logo. Relative URLs resolve against metadataBase (app/layout.tsx, SITE_URL).
 * Not for /e/<name> invites: those are noindex and have their own preview card (app/e/[slug]/page.tsx).
 */
export function pageMeta(title: string, description: string, path: string): Metadata {
  const images = [{ url: "/brand/mangalam-logo.png", width: 546, height: 290, alt: BRAND }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: BRAND, type: "website", locale: "en_IN", images },
    twitter: { card: "summary", title, description, images },
  };
}
