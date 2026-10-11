import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Faq, SectionHead, faqItems } from "@/components/site/Faq";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";
import { TemplateDetail } from "./TemplateDetail";

export const dynamicParams = false;
export const generateStaticParams = () => TEMPLATES.map((t) => ({ id: t.id }));

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const t = TEMPLATES.find((x) => x.id === params.id);
  if (!t) return {};
  return { title: t.name + " invitation video · " + BRAND, description: t.tagline + ". Preview it free with your names, then share it on WhatsApp." };
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  if (!TEMPLATES.some((t) => t.id === params.id)) notFound();
  return (
    <div className="site">
      <SiteHeader />
      <TemplateDetail id={params.id} />
      <section className="sec surface">
        <SectionHead n="04" label="Questions">
          Frequently <em>asked.</em>
        </SectionHead>
        <Faq items={faqItems()} />
      </section>
      <SiteFooter />
    </div>
  );
}
