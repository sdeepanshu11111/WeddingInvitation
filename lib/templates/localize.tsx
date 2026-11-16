import type { CommunityId, TemplateDef } from "../types";
import type { TemplateCopy } from "../templateCopy";
import { variantId, type Language, type LocalizedId } from "../variants";

/* Makes a language version of a design (lib/variants.ts): the same scenes, ornaments, palettes and price, with the
   words in the state's language and named for the state's own ritual. Everything changed is a field default, so the
   couple can reword any of it; their names, date and venue carry over when they switch language in the studio.

   Fonts: the language's font is added AFTER the design's own (the Indic fonts also contain Latin letters), so names,
   dates and English lines keep the design's look and only the script falls through to the script font. theme.lang
   (set from `lang`) lets the shared blocks give that script room for its vowel signs (components/blocks.tsx). */

/** One language: its script font, who it is filed under, and a local couple and places for the previews. */
export type Kit = {
  language: Language;
  label: string; // "Tamil"
  code: string; // BCP-47: "ta"
  font: string; // CSS font variable of the script
  communities: CommunityId[];
  bride: string;
  groom: string;
  home: [name: string, address: string]; // Haldi and Mehendi are often at home
  hall: [name: string, address: string]; // Sangeet, Reception and Engagement at a hall
};

/** What a design is, for the version's name, tagline and page copy. */
export type Look = { noun: string; ritual: string; what: string; event: string; words: string };

/** One design in one language. ritual: the state's name for the function, in English letters ("Gaye Holud");
    thumb: that name in the script, for the swatch; words: field defaults in the language. */
export type Version = { ritual: string; thumb: string; words: Record<string, string> };

export function localize(base: TemplateDef, look: Look, kit: Kit, v: Version, sample: Record<string, string>): { def: TemplateDef; copy: TemplateCopy } {
  const id = variantId(base.id as LocalizedId, kit.language);
  const own = v.ritual !== look.ritual; // named for a ritual of its own (Gaye Holud), not just the function in Tamil
  const name = own ? v.ritual + " " + look.noun : base.name + " · " + kit.label;
  const defaults: Record<string, any> = { ...base.defaults, ...sample, ...v.words };
  if ("hashtag" in base.defaults) defaults.hashtag = "#" + kit.bride + kit.groom + v.ritual.replace(/\s+/g, "");
  const stack = (f: string) => f + ", " + kit.font;

  const def: TemplateDef = {
    ...base,
    id,
    name,
    tagline: v.ritual + " invitation in " + kit.label + ": " + look.what,
    tags: [kit.label, v.ritual, ...base.tags.filter((t) => t !== v.ritual)],
    communities: [...new Set([...kit.communities, ...base.communities])],
    isNew: true,
    variantOf: base.id,
    lang: kit.code,
    fonts: { display: stack(base.fonts.display), script: stack(base.fonts.script), body: stack(base.fonts.body) },
    thumb: (p) => base.thumb(p, { text: v.thumb, font: kit.font }),
    // The form shows the new words as its examples; the second title holds the English name now.
    groups: base.groups.map((g) => ({
      ...g,
      fields: g.fields.map((f) => {
        const d = defaults[f.key];
        const placeholder = (f.type === "text" || f.type === "textarea") && typeof d === "string" && d && d !== base.defaults[f.key] ? { placeholder: d } : null;
        return { ...f, ...placeholder, ...(f.key === "localTitle" ? { label: "Second title", hint: "Any language works. Leave blank to hide." } : null) } as typeof f;
      }),
    })),
    defaults,
  };

  const copy: TemplateCopy = {
    for: cap(look.what) + (own ? ", named for the " + kit.label + " " + v.ritual + " and" : ",") + " written in " + kit.label + " (" + v.thumb + ").",
    has: look.words + " are in " + kit.label + ", and each can be reworded. It shows the couple's names, the date and time, and the venue with its address.",
    ask: [v.ritual + " invitation video for WhatsApp", kit.label + " " + look.event.toLowerCase() + " invitation online", v.thumb + " invitation with names"],
  };
  return { def, copy };
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
