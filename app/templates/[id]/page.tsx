import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSense } from "@/components/AdSense";
import { Faq, SectionHead, faqItems } from "@/components/site/Faq";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { PAYMENTS } from "@/lib/features";
import { priceOf } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";
import { TEMPLATE_COPY } from "@/lib/templateCopy";
import { TEMPLATES } from "@/lib/templates";
import { TemplateDetail } from "./TemplateDetail";

export const dynamicParams = false;
export const generateStaticParams = () => TEMPLATES.map((t) => ({ id: t.id }));

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const t = TEMPLATES.find((x) => x.id === params.id);
  if (!t) return {};
  return pageMeta(t.name + " invitation · " + BRAND, t.tagline + ". Preview it free with your names, then share it on WhatsApp.", "/templates/" + t.id);
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  const t = TEMPLATES.find((x) => x.id === params.id);
  if (!t) notFound();
  const copy = TEMPLATE_COPY[t.id];
  const price = priceOf(t.id);
  // schema.org Product: lets search engines and assistants state what this page offers and what it costs.
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t.name + " invitation",
    description: copy ? copy.for + " " + copy.has : t.tagline,
    category: "Digital wedding invitation",
    brand: { "@type": "Brand", name: BRAND },
    url: SITE_URL + "/templates/" + t.id,
    offers: { "@type": "Offer", price: PAYMENTS ? String(price) : "0", priceCurrency: "INR", availability: "https://schema.org/InStock", url: SITE_URL + "/templates/" + t.id },
  };
  return (
    <div className="site">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <AdSense />
      <SiteHeader />
      <TemplateDetail id={params.id} />
      {copy ? (
        <section className="sec t-about">
          <SectionHead label="About this design">
            {t.name} <em>invitation</em>
          </SectionHead>
          <p>{copy.for}</p>
          <p>{copy.has}</p>
          <p>
            You fill in your own names, dates and photos, watch it play, and get one link to send on WhatsApp. It opens in any phone&rsquo;s
            browser, with no app to install.{" "}
            {PAYMENTS ? (price ? "Making and sharing it is free; removing the watermark costs ₹" + price + ", one time." : "This design is free and has no watermark.") : ""}
          </p>
          <h3>People use it for</h3>
          <ul>
            {copy.ask.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="sec surface">
        <SectionHead label="Questions" center>
          Frequently <em>asked.</em>
        </SectionHead>
        <Faq items={faqItems()} />
      </section>
      <SiteFooter />
    </div>
  );
}
