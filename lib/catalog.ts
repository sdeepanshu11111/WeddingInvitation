import type { CategoryId, CommunityId, TemplateDef } from "./types";

export const CATEGORIES: { id: CategoryId; label: string; local: string; blurb: string }[] = [
  { id: "wedding", label: "Wedding", local: "शादी", blurb: "The main ceremony: pheras, nikah, anand karaj, muhurtham" },
  { id: "multi-event", label: "All Functions", local: "सभी रस्में", blurb: "One invitation with every function and its date and venue" },
  { id: "engagement", label: "Engagement", local: "सगाई", blurb: "Sagai, roka, ring ceremony" },
  { id: "haldi", label: "Haldi", local: "हल्दी", blurb: "Turmeric ceremony" },
  { id: "mehendi", label: "Mehendi", local: "मेहंदी", blurb: "Henna night" },
  { id: "sangeet", label: "Sangeet", local: "संगीत", blurb: "Music, dance and performances" },
  { id: "reception", label: "Reception", local: "रिसेप्शन", blurb: "Reception, walima, dinner" },
  { id: "save-the-date", label: "Save the Date", local: "तारीख याद रखें", blurb: "Short teaser sent months ahead" },
];

export const COMMUNITIES: { id: CommunityId; label: string }[] = [
  { id: "hindu", label: "Hindu / North Indian" },
  { id: "south-indian", label: "South Indian" },
  { id: "muslim", label: "Muslim" },
  { id: "sikh", label: "Sikh" },
  { id: "christian", label: "Christian" },
  { id: "modern", label: "Modern / Any" },
];

export type Filter = { category: CategoryId | "all"; community: CommunityId | "all"; q: string };

export function filterTemplates(list: TemplateDef[], f: Filter) {
  const q = f.q.trim().toLowerCase();
  return list.filter(
    (t) =>
      (f.category === "all" || t.categories.includes(f.category)) &&
      (f.community === "all" || t.communities.includes(f.community) || t.communities.includes("modern")) &&
      (!q || [t.name, t.tagline, ...t.tags].join(" ").toLowerCase().includes(q))
  );
}

export const countIn = (list: TemplateDef[], c: CategoryId | "all") =>
  c === "all" ? list.length : list.filter((t) => t.categories.includes(c)).length;
