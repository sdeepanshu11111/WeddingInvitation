import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSense } from "@/components/AdSense";
import { JsonLd, breadcrumbLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/components/site/Faq";
import { LandingAbout } from "@/components/site/LandingAbout";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";
import { FUNCTION_SLUGS, categoryForSlug, functionCopy, functionPagePath, functionPath, statePath } from "@/lib/landing";
import { priceOf } from "@/lib/pricing";
import { REGIONS } from "@/lib/regions";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { DESIGNS } from "@/lib/templates";
import { TemplateBrowser } from "../../templates/TemplateBrowser";

/* /invitations/<function>: the page search engines list for "haldi invitation video" and the like (lib/landing.ts).
   Static: one page per function, built at deploy. */

export const dynamicParams = false;
export const generateStaticParams = () => FUNCTION_SLUGS.map((slug) => ({ slug }));

/** The cheapest paid design of a function, for "from ₹X"; null when none costs anything (or payments are off). */
const priceFrom = (id: string) => {
  const prices = DESIGNS.filter((t) => t.categories.includes(id as never)).map((t) => priceOf(t.id)).filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : null;
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = categoryForSlug(params.slug);
  if (!c) return {};
  const copy = functionCopy(c.id, priceFrom(c.id), c.label);
  // noindex: SEO rollback 2026-11-18 (lib/seo.ts)
  return pageMeta(copy.title + " · " + BRAND, c.blurb + ". " + copy.intro[0].slice(0, 110).replace(/\s+\S*$/, "") + "…", functionPagePath(c.id), { noindex: true });
}

export default function FunctionPage({ params }: { params: { slug: string } }) {
  const c = categoryForSlug(params.slug);
  if (!c) notFound();
  const copy = functionCopy(c.id, priceFrom(c.id), c.label);
  return (
    <div className="site">
      <JsonLd data={[faqJsonLd(copy.faqs.map((x) => ({ q: x.q, a: x.a }))), breadcrumbLd(SITE_URL, [["Home", "/"], ["Designs", "/templates"], [c.label, functionPath(c.id)]])]} />
      <AdSense />
      <SiteHeader />
      <TemplateBrowser initial={{ category: c.id }} landing />
      <LandingAbout
        h={copy.h}
        intro={copy.intro}
        faqs={copy.faqs}
        links={[
          { label: "Other functions", items: CATEGORIES.filter((x) => x.id !== c.id).map((x) => ({ href: functionPath(x.id), text: x.label + " invitations" })) },
          { label: "Wedding invitations by language", items: REGIONS.map((r) => ({ href: statePath(r.id), text: r.language })) },
        ]}
      />
      <SiteFooter />
    </div>
  );
}
