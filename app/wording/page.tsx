import type { Metadata } from "next";
import Link from "next/link";
import { AdSense } from "@/components/AdSense";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { WORDING } from "@/lib/wording";

/* /wording: every wording guide (lib/wording.ts). */

export const metadata: Metadata = pageMeta(
  "Wedding invitation wording in Hindi, Tamil, Telugu, Marathi and more · " + BRAND,
  "Sample wedding, haldi and reception invitation lines in English, Hindi, Tamil, Telugu, Malayalam, Kannada, Marathi, Bengali and Punjabi, with their meaning in English.",
  "/wording",
  { noindex: true }, // SEO rollback 2026-11-18 (lib/seo.ts)
);

export default function WordingIndex() {
  return (
    <div className="site">
      <JsonLd data={breadcrumbLd(SITE_URL, [["Home", "/"], ["Wording", "/wording"]])} />
      <AdSense />
      <SiteHeader />
      <main className="sec wording">
        <nav className="crumbs mono-label" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / Wording
        </nav>
        <h1>
          Wedding invitation <em>wording</em>
        </h1>
        <p className="lead">Sample lines for the wedding, the functions and the reception, with their meaning in English. Copy any of them into your invitation.</p>
        <div className="wording-langs">
          {WORDING.map((w) => (
            <Link key={w.id} href={"/wording/" + w.id} className="wording-lang">
              <b>{w.language}</b>
              <span lang={w.lang} style={w.font ? { fontFamily: w.font } : undefined}>
                {w.native}
              </span>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
