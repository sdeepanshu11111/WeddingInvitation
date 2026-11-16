import { CATEGORIES } from "./catalog";
import { priceOf } from "./pricing";
import { REGIONS } from "./regions";
import { getTemplate } from "./templates";
import type { TemplateDef } from "./types";
import { LANGUAGES, languageOf, variantId, type Language, type LocalizedId } from "./variants";

/* A couple has 3 to 5 functions to invite for, and each invite is its own purchase: the cheapest sale there is (no
   ads, they already trust us). Once their invite is done, the owner sheet on /e/<name> offers the others, in the
   same language and named for their state's rituals when the invite is regional (a Bengali Biye → Gaye Holud,
   Ashirbad, Bou Bhat...). Each opens the studio on that design; their names, date and venue come along from the draft
   on this device, and Get link gives it a link of its own (components/editor/ShareDialog.tsx, functionOf). */

const ORDER = ["engagement", "haldi", "mehendi", "sangeet", "wedding", "reception"] as const;
const DESIGN: Record<Exclude<(typeof ORDER)[number], "wedding">, LocalizedId> = {
  engagement: "sagai-rings",
  haldi: "haldi-marigold",
  mehendi: "mehendi-paisley",
  sangeet: "sangeet-night",
  reception: "reception-gala",
};

/** The language of the couple's invite: a language version's own, south-kalyanam's header language, or the state
    whose wedding design it is (punjabi-viah → Punjabi). Null for designs that belong to no state (English versions). */
function languageFor(t: TemplateDef, data: Record<string, any>): Language | null {
  const own = languageOf(t.id);
  if (own) return own;
  if (t.id === "south-kalyanam") return (LANGUAGES as readonly string[]).includes(data?.language) ? (data.language as Language) : "tamil";
  const region = REGIONS.find((r) => r.designs[0] === t.id) ?? REGIONS.find((r) => r.designs.includes(t.id));
  return region ? (region.language.toLowerCase() as Language) : null;
}

export type NextInvite = { id: string; template: TemplateDef; label: string; price: number };

/** The couple's other functions, in the order they happen, without the one they just made. */
export function nextInvites(templateId: string, data: Record<string, any>): NextInvite[] {
  const t = getTemplate(templateId);
  const current = t.categories[0] === "multi-event" ? "wedding" : t.categories[0];
  const lang = languageFor(t, data);
  const region = lang ? REGIONS.find((r) => r.language.toLowerCase() === lang) : undefined;
  return ORDER.filter((fn) => fn !== current).map((fn) => {
    const id = fn === "wedding" ? region?.designs[0] ?? "royal-mandala" : lang ? variantId(DESIGN[fn], lang) : DESIGN[fn];
    const template = getTemplate(id);
    const label = template.ritual ?? CATEGORIES.find((c) => c.id === fn)?.label ?? fn;
    return { id, template, label, price: priceOf(id) };
  });
}
