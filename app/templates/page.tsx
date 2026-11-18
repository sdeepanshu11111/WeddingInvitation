import type { Metadata } from "next";
import { AdSense } from "@/components/AdSense";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { regionById } from "@/lib/regions";
import type { CategoryId, CommunityId } from "@/lib/types";
import { TemplateBrowser } from "./TemplateBrowser";

type Search = { category?: string; community?: string; state?: string };

const pickCategory = (v?: string) => (CATEGORIES.some((c) => c.id === v) ? (v as CategoryId) : "all");
const pickCommunity = (v?: string) => (COMMUNITIES.some((c) => c.id === v) ? (v as CommunityId) : "all");

export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  const c = CATEGORIES.find((x) => x.id === searchParams.category);
  // As on 11 Nov (SEO rollback 2026-11-18, lib/seo.ts): a title per function, no canonical, no state title.
  return pageMeta(
    (c ? c.label + " invitation templates" : "Invitation templates") + " · " + BRAND,
    c
      ? c.blurb + ". Animated " + c.label.toLowerCase() + " invitations with their own page: preview free with your names, share on WhatsApp."
      : "Animated invitations for weddings, engagement, haldi, mehendi, sangeet and reception, each with its own page. Preview free with your names.",
    "/templates",
  );
}

export default function Templates({ searchParams }: { searchParams: Search }) {
  return (
    <div className="site">
      <AdSense />
      <SiteHeader />
      <TemplateBrowser
        initial={{ category: pickCategory(searchParams.category), community: pickCommunity(searchParams.community) }}
        initialState={regionById(searchParams.state)?.id ?? null}
      />
      <SiteFooter />
    </div>
  );
}
