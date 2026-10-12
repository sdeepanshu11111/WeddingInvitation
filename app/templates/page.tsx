import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import type { CategoryId, CommunityId } from "@/lib/types";
import { TemplateBrowser } from "./TemplateBrowser";

type Search = { category?: string; community?: string };

const pickCategory = (v?: string) => (CATEGORIES.some((c) => c.id === v) ? (v as CategoryId) : "all");
const pickCommunity = (v?: string) => (COMMUNITIES.some((c) => c.id === v) ? (v as CommunityId) : "all");

export function generateMetadata({ searchParams }: { searchParams: Search }): Metadata {
  const c = CATEGORIES.find((x) => x.id === searchParams.category);
  return {
    title: (c ? c.label + " invitation templates" : "Invitation templates") + " · " + BRAND,
    description: c
      ? c.blurb + ". Animated " + c.label.toLowerCase() + " invitations with their own page: preview free with your names, share on WhatsApp."
      : "Animated invitations for weddings, engagement, haldi, mehendi, sangeet and reception, each with its own page. Preview free with your names.",
  };
}

export default function Templates({ searchParams }: { searchParams: Search }) {
  return (
    <div className="site">
      <SiteHeader />
      <TemplateBrowser initial={{ category: pickCategory(searchParams.category), community: pickCommunity(searchParams.community) }} />
      <SiteFooter />
    </div>
  );
}
