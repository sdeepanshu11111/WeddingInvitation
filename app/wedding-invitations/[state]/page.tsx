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
import { functionPath, stateCopy, statePath } from "@/lib/landing";
import { priceOf } from "@/lib/pricing";
import { REGIONS, regionById } from "@/lib/regions";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { DESIGNS } from "@/lib/templates";
import { ritualList } from "@/lib/templates/languages";
import { wordingForRegion } from "@/lib/wording";
import { TemplateBrowser } from "../../templates/TemplateBrowser";

/* /wedding-invitations/<state>: "Tamil wedding invitation", "Marathi lagna patrika"… (lib/landing.ts, lib/regions.ts).
   Static: one page per state, built at deploy. */

export const dynamicParams = false;
export const generateStaticParams = () => REGIONS.map((r) => ({ state: r.id }));

/** The cheapest paid wedding design of the state, for "from ₹X". */
const weddingFrom = (designs: string[]) => {
  const prices = designs
    .map((id) => DESIGNS.find((t) => t.id === id))
    .filter((t) => t?.categories.includes("wedding"))
    .map((t) => priceOf(t!.id))
    .filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : null;
};

export function generateMetadata({ params }: { params: { state: string } }): Metadata {
  const r = regionById(params.state);
  if (!r) return {};
  const copy = stateCopy(r, ritualList(r.designs), weddingFrom(r.designs));
  return pageMeta(
    copy.title + " · " + BRAND,
    "Animated " + r.language + " invitations for " + ritualList(r.designs) + ", written in " + r.language + " for families in " + r.label + ". Preview free with your names, share one link on WhatsApp.",
    statePath(r.id),
  );
}

export default function StatePage({ params }: { params: { state: string } }) {
  const r = regionById(params.state);
  if (!r) notFound();
  const copy = stateCopy(r, ritualList(r.designs), weddingFrom(r.designs));
  const wording = wordingForRegion(r.id);
  return (
    <div className="site">
      <JsonLd data={[faqJsonLd(copy.faqs.map((x) => ({ q: x.q, a: x.a }))), breadcrumbLd(SITE_URL, [["Home", "/"], ["Designs", "/templates"], [r.label, statePath(r.id)]])]} />
      <AdSense />
      <SiteHeader />
      <TemplateBrowser initial={{}} initialState={r.id} landing />
      <LandingAbout
        h={copy.h}
        intro={copy.intro}
        faqs={copy.faqs}
        links={[
          ...(wording ? [{ label: "Wording", items: [{ href: "/wording/" + wording.id, text: r.language + " invitation wording" }] }] : []),
          { label: "Other languages", items: REGIONS.filter((x) => x.id !== r.id).map((x) => ({ href: statePath(x.id), text: x.language + " wedding invitations" })) },
          { label: "By function", items: CATEGORIES.map((c) => ({ href: functionPath(c.id), text: c.label })) },
        ]}
      />
      <SiteFooter />
    </div>
  );
}
