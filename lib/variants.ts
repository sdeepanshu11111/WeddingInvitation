/* Language versions: the designs that suit every state (Haldi, Mehendi, Sangeet, Reception, Engagement) each have a
   version per state language, named for that state's own ritual where it has one (Gaye Holud, Maiyan, Sakharpuda,
   Nalangu, Gorintaku, Aratakshate, Mylanchi…). The words live in lib/templates/languages.tsx; this file only knows the
   ids, so pricing (server), regions and invite details can map a version back to its design without loading templates.

   Id = <design>-<language>, e.g. haldi-marigold-tamil. A version costs what its design costs and shares its scenes. */

export const LANGUAGES = ["hindi", "punjabi", "marathi", "bengali", "tamil", "telugu", "kannada", "malayalam"] as const;
export type Language = (typeof LANGUAGES)[number];

/** The designs that have a version in every language. */
export const LOCALIZED = ["haldi-marigold", "mehendi-paisley", "sangeet-night", "reception-gala", "sagai-rings"] as const;
export type LocalizedId = (typeof LOCALIZED)[number];

const SUFFIX = new RegExp("^(" + LOCALIZED.join("|") + ")-(" + LANGUAGES.join("|") + ")$");

export const variantId = (base: LocalizedId, lang: Language) => base + "-" + lang;

/** The design a language version was made from (haldi-marigold-tamil → haldi-marigold); any other id as it is. */
export const baseOf = (id: string): string => SUFFIX.exec(id)?.[1] ?? id;

/** The language of a version (haldi-marigold-tamil → "tamil"); null for every other design. */
export const languageOf = (id: string): Language | null => (SUFFIX.exec(id)?.[2] as Language | undefined) ?? null;

/** Every version of a design, in LANGUAGES order (none for a design that is not in LOCALIZED). */
export const versionsOf = (base: string): string[] => ((LOCALIZED as readonly string[]).includes(base) ? LANGUAGES.map((l) => base + "-" + l) : []);
