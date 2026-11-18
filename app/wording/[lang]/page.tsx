import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSense } from "@/components/AdSense";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { statePath } from "@/lib/landing";
import { regionById } from "@/lib/regions";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";
import { WORDING, wordingById } from "@/lib/wording";

/* /wording/<language>: sample invitation lines with their meaning (lib/wording.ts), and the designs in that
   language. Static, one page per language. */

export const dynamicParams = false;
export const generateStaticParams = () => WORDING.map((w) => ({ lang: w.id }));

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const w = wordingById(params.lang);
  if (!w) return {};
  return pageMeta(
    "Wedding invitation wording in " + w.language + " · " + BRAND,
    "Sample " + w.language + " lines for a wedding invitation, the haldi and the reception, with their meaning in English, ready to copy into an animated invitation.",
    "/wording/" + w.id,
    { noindex: true }, // SEO rollback 2026-11-18 (lib/seo.ts)
  );
}

export default function WordingPage({ params }: { params: { lang: string } }) {
  const w = wordingById(params.lang);
  if (!w) notFound();
  const region = regionById(w.regionId);
  const design = TEMPLATES.find((t) => t.id === w.design);
  const font = w.font ? { fontFamily: w.font } : undefined;
  return (
    <div className="site">
      <JsonLd data={breadcrumbLd(SITE_URL, [["Home", "/"], ["Wording", "/wording"], [w.language, "/wording/" + w.id]])} />
      <AdSense />
      <SiteHeader />
      <main className="sec wording">
        <nav className="crumbs mono-label" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/wording">Wording</Link> / {w.language}
        </nav>
        <h1>
          Wedding invitation wording in <em>{w.language}</em>
        </h1>
        <p className="lead">
          Sample lines you can copy into your invitation, with what each one means. Change the names and the details to your own.
        </p>
        <ol className="wording-list">
          {w.lines.map((l) => (
            <li key={l.label}>
              <span className="mono-label">{l.label}</span>
              <p className="wording-text" lang={w.lang} style={font}>
                {l.text}
              </p>
              <p className="wording-meaning">{l.meaning}</p>
            </li>
          ))}
        </ol>
        <div className="wording-go">
          {design ? (
            <Link href={"/templates/" + design.id} className="cta-btn">
              See it in the {design.name} design →
            </Link>
          ) : null}
          {region ? (
            <Link href={statePath(region.id)} className="ghost-btn">
              All {region.language} designs
            </Link>
          ) : null}
        </div>
        <nav className="land-links" aria-label="Other languages">
          <h3>Other languages</h3>
          <div className="lang-row">
            {WORDING.filter((x) => x.id !== w.id).map((x) => (
              <Link key={x.id} href={"/wording/" + x.id} prefetch={false} className="chip-o">
                {x.language}
              </Link>
            ))}
          </div>
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
