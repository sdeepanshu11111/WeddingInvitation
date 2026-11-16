/* Designs by Indian state: a visitor says which state the wedding is in (or we guess it) and sees the designs written
   in that state's language first. Dependency-free (template ids only, like lib/pricing.ts), so server pages, the
   sitemap and metadata read it without loading the templates.

   PICKED (a tap on a state, or ?state=<id> in a link, e.g. an ad aimed at Tamil Nadu): the browser shows that state's
   designs, then every design not written in ANOTHER state's language (functions, modern, nikah, church…), and this
   device remembers the pick (localStorage `fp.state`; "all" = the visitor chose All India).
   GUESSED: only puts the state's designs first and hides nothing. From the phone's language (ta, te, ml…), else the
   approximate state of the connection: cookie `fp_geo`, set by middleware.ts from Vercel's IP lookup. Indian mobile
   networks often route through a hub city (a phone in Patna can look like Mumbai), so that guess is often wrong and
   must never hide designs.

   Every state lists at least 5: its weddings, then the ritual versions of Haldi, Mehendi, Sangeet, Reception and
   Engagement in its language (lib/variants.ts, words in lib/templates/languages.tsx).

   No design in the state's own language yet: Gujarat, Odisha, Assam and the North East. Add a region here when one
   exists (a wedding design in LOCAL below, plus a language block in languages.tsx and LANGUAGES). */

import { variantId, type Language, type LocalizedId } from "./variants";

export type Region = {
  id: string; // in links: /templates?state=<id>
  label: string; // the state(s), in English
  language: string; // "Tamil", for titles: "Tamil wedding invitations"
  native: string; // the language's name in its own script, drawn in the phone's own font (no font download)
  lang: string; // the phone language (navigator.languages) that points here
  states: string[]; // ISO 3166-2:IN codes, as Vercel's x-vercel-ip-country-region header gives them
  designs: string[]; // this state's designs, best first
};

/** A state's ritual versions (lib/variants.ts) of the five designs that suit every state, in the order given. */
const rituals = (lang: Language, order: LocalizedId[]) => order.map((b) => variantId(b, lang));
const HALDI = "haldi-marigold", MEHENDI = "mehendi-paisley", SANGEET = "sangeet-night", RECEPTION = "reception-gala", ENGAGEMENT = "sagai-rings";

// Each state: its weddings first, then its own functions in its own words, most important first (in Bengal the Gaye
// Holud and the Bou Bhat matter more than a sangeet; in Punjab the Jaago takes the sangeet design). At least 5 each.
export const REGIONS: Region[] = [
  { id: "north-india", label: "North India", language: "Hindi", native: "हिन्दी", lang: "hi", states: ["DL", "UP", "BR", "RJ", "MP", "HR", "UK", "UT", "HP", "JH", "CT", "CG"], designs: ["hindi-shubh-vivah", "royal-mandala", "shaadi-utsav", ...rituals("hindi", [HALDI, MEHENDI, SANGEET, RECEPTION, ENGAGEMENT]), "punjabi-viah"] },
  { id: "punjab", label: "Punjab", language: "Punjabi", native: "ਪੰਜਾਬੀ", lang: "pa", states: ["PB", "CH"], designs: ["punjabi-viah", "anand-karaj", ...rituals("punjabi", [SANGEET, HALDI, MEHENDI, ENGAGEMENT, RECEPTION])] },
  { id: "maharashtra", label: "Maharashtra", language: "Marathi", native: "मराठी", lang: "mr", states: ["MH"], designs: ["shubh-mangal", ...rituals("marathi", [HALDI, ENGAGEMENT, RECEPTION, MEHENDI, SANGEET])] },
  { id: "bengal", label: "West Bengal", language: "Bengali", native: "বাংলা", lang: "bn", states: ["WB", "TR"], designs: ["shubho-bibaho", ...rituals("bengali", [HALDI, RECEPTION, ENGAGEMENT, MEHENDI, SANGEET])] },
  { id: "tamil-nadu", label: "Tamil Nadu", language: "Tamil", native: "தமிழ்", lang: "ta", states: ["TN", "PY"], designs: ["tamil-thirumanam", "south-kalyanam", ...rituals("tamil", [ENGAGEMENT, RECEPTION, HALDI, MEHENDI, SANGEET])] },
  { id: "andhra-telangana", label: "Andhra & Telangana", language: "Telugu", native: "తెలుగు", lang: "te", states: ["AP", "TG", "TS"], designs: ["telugu-pelli", "south-kalyanam", ...rituals("telugu", [ENGAGEMENT, HALDI, MEHENDI, RECEPTION, SANGEET])] },
  { id: "karnataka", label: "Karnataka", language: "Kannada", native: "ಕನ್ನಡ", lang: "kn", states: ["KA"], designs: ["kannada-maduve", "south-kalyanam", ...rituals("kannada", [ENGAGEMENT, RECEPTION, HALDI, MEHENDI, SANGEET])] },
  { id: "kerala", label: "Kerala", language: "Malayalam", native: "മലയാളം", lang: "ml", states: ["KL", "LD"], designs: ["kerala-vivaham", "south-kalyanam", ...rituals("malayalam", [ENGAGEMENT, RECEPTION, MEHENDI, HALDI, SANGEET])] },
];

/** Designs whose words are in one state's language (or, for south-kalyanam, one of the four southern ones). A state's
    view leaves out the ones it does not list: a Tamil invitation is no use for a wedding in Pune. Designs that are
    not here (royal-mandala, nikah, anand karaj, every function and modern design) show for every state. */
const LOCAL = new Set(["hindi-shubh-vivah", "punjabi-viah", "shubh-mangal", "shubho-bibaho", "tamil-thirumanam", "telugu-pelli", "kannada-maduve", "kerala-vivaham", "south-kalyanam"]);

export const regionById = (id: string | null | undefined): Region | null => REGIONS.find((r) => r.id === id) ?? null;

/** The first non-English phone language that has a state: ["en-IN", "ta-IN"] → Tamil Nadu. */
export function regionForLanguages(langs: readonly string[]): Region | null {
  for (const l of langs) {
    const r = REGIONS.find((x) => x.lang === l.toLowerCase().split("-")[0]);
    if (r) return r;
  }
  return null;
}

export const regionForStateCode = (code: string | null | undefined): Region | null => (code ? REGIONS.find((r) => r.states.includes(code.toUpperCase())) ?? null : null);

/**
 * A state's view of a list of templates (already filtered by function, community or search; language versions
 * included): its own designs first, in its order, then the rest in list order.
 * hide = true for a state the visitor picked: its ritual versions are in, designs written in another state's language
 * are out, and so is the original of each version it shows (its Haldi appears once, as the Gaye Holud).
 * A guessed state passes false: only its own designs move up, no versions, nothing hidden.
 * Language versions never appear otherwise, except with `versions` (a search, so "gaye holud" finds its design).
 */
export function forRegion<T extends { id: string; variantOf?: string }>(list: T[], region: Region | null, hide: boolean, versions = false): { own: T[]; rest: T[] } {
  if (!region) return { own: [], rest: versions ? list : list.filter((t) => !t.variantOf) };
  const own = region.designs.map((id) => list.find((t) => t.id === id)).filter((t): t is T => !!t && (hide || !t.variantOf));
  const shown = new Set(own.map((t) => t.variantOf).filter(Boolean));
  const rest = list.filter((t) => {
    if (region.designs.includes(t.id) && own.includes(t)) return false;
    if (t.variantOf) return versions && !hide;
    return !(hide && (LOCAL.has(t.id) || shown.has(t.id)));
  });
  return { own, rest };
}

/* ----- In the browser only (pages call these after mounting) ----- */

const PICK_KEY = "fp.state";
export const GEO_COOKIE = "fp_geo";

export type RegionChoice = { region: Region | null; picked: boolean };

/** Which state to show: ?state= in the address, then this device's earlier pick, then the phone's language, then the
    connection's approximate state. Null when there is nothing to go on. */
export function guessRegion(): RegionChoice | null {
  const fromUrl = regionById(new URLSearchParams(window.location.search).get("state"));
  if (fromUrl) {
    rememberRegion(fromUrl);
    return { region: fromUrl, picked: true };
  }
  try {
    const saved = localStorage.getItem(PICK_KEY);
    if (saved === "all") return { region: null, picked: true };
    const r = regionById(saved);
    if (r) return { region: r, picked: true };
  } catch {} // storage blocked: fall through to the guesses
  const byLang = regionForLanguages(navigator.languages?.length ? navigator.languages : [navigator.language || ""]);
  if (byLang) return { region: byLang, picked: false };
  const geo = document.cookie.match(new RegExp("(?:^|;\\s*)" + GEO_COOKIE + "=([A-Za-z]{2,3})"));
  const byGeo = regionForStateCode(geo?.[1]);
  return byGeo ? { region: byGeo, picked: false } : null;
}

/** Remembers the visitor's pick on this device (null = All India). */
export function rememberRegion(region: Region | null) {
  try {
    localStorage.setItem(PICK_KEY, region ? region.id : "all");
  } catch {}
}
