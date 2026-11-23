/* Landing pages for search (2026-11-17): one page per function (/invitations/<slug>) and per state
   (/wedding-invitations/<state>), each with its own address, title, a few paragraphs of real text, the matching
   designs and a short FAQ. They replace /templates?category= and /templates?state= as the pages search engines and AI
   assistants should list (those query pages still work, with their canonical pointing here).

   Every sentence must stay true to what the product does today: no invented numbers, reviews or claims. Prices come
   from lib/pricing.ts, rituals from lib/templates/languages.tsx. Dependency-free apart from those, like lib/regions.ts. */

import type { CategoryId } from "./types";
import { CATEGORIES } from "./catalog";
import { REGIONS, type Region } from "./regions";

/** Function pages: the address word for each category ("multi-event" reads badly in a link). */
const FUNCTION_SLUG: Record<CategoryId, string> = {
  wedding: "wedding",
  "multi-event": "all-functions",
  engagement: "engagement",
  haldi: "haldi",
  mehendi: "mehendi",
  sangeet: "sangeet",
  reception: "reception",
  "save-the-date": "save-the-date",
};

// SEO rollback (2026-11-18, lib/seo.ts): the site links to the /templates views again, as before 17 Nov. The pages
// /invitations/<slug> and /wedding-invitations/<state> still exist (noindex) for anyone who has their address.
export const functionPath = (c: CategoryId) => "/templates?category=" + c;
export const statePath = (regionId: string) => "/templates?state=" + regionId;
export const functionPagePath = (c: CategoryId) => "/invitations/" + FUNCTION_SLUG[c];
export const categoryForSlug = (slug: string) => CATEGORIES.find((c) => FUNCTION_SLUG[c.id] === slug) ?? null;
export const FUNCTION_SLUGS = CATEGORIES.map((c) => FUNCTION_SLUG[c.id]);

export type LandingFaq = { q: string; a: string };
export type FunctionCopy = { title: string; h: string; intro: string[]; faqs: LandingFaq[] };

/** What every function page can say about versions in other languages (lib/variants.ts LOCALIZED). */
const IN_LANGUAGES = "It also comes in Hindi, Punjabi, Marathi, Bengali, Tamil, Telugu, Kannada and Malayalam, named for each state's own ritual.";

const FUNCTION_COPY: Record<CategoryId, Omit<FunctionCopy, "faqs"> & { faqs?: LandingFaq[] }> = {
  wedding: {
    title: "Wedding invitation video templates for WhatsApp",
    h: "An animated wedding invitation, on a page of its own",
    intro: [
      "Each design is a short film made for the wedding day: the couple's names, both families, the muhurat or ceremony time and the venue, with your photos and a song if you want one. Guests open it from one WhatsApp link, in their phone's browser, with no app to install.",
      "There are designs for Hindu, South Indian, Marathi, Bengali, Muslim (Nikah), Sikh (Anand Karaj) and Christian (church) weddings, and designs written entirely in Hindi, Tamil, Telugu, Malayalam, Kannada and Punjabi. When the invite ends, guests can add the wedding to their calendar, open directions to the venue and, if you add a number, RSVP on WhatsApp.",
    ],
  },
  "multi-event": {
    title: "All-functions wedding invitation: haldi to reception in one link",
    h: "Every function in one invitation",
    intro: [
      "Shaadi Utsav puts the whole wedding in one invitation: you list the functions (Haldi, Mehendi, Sangeet, the wedding, the reception or any other), each with its own date, time and venue, and each gets its own scene, followed by an overview of the programme.",
      "Guests can add every function to their calendar from the end of the invite and open directions to each venue. If you would rather send each function on its own link, every function also has its own designs.",
    ],
  },
  engagement: {
    title: "Engagement, Roka & Sagai invitation video templates",
    h: "Engagement, Roka and Sagai invitations",
    intro: [
      "Two rings spin in and lock together, then the couple's names, the date, the time and the venue. It is short, so it also works as a WhatsApp Status. Rename the ceremony to Sagai, Roka, Ring Ceremony, Mangni or Nischayathartham: every line is yours to change.",
      IN_LANGUAGES,
    ],
  },
  haldi: {
    title: "Haldi ceremony invitation video templates",
    h: "Haldi invitations in turmeric yellow",
    intro: [
      "Marigold garlands sway across the top while the bride's or groom's name, the date, the time and the venue come in, with a dress-code line if you want one (shades of yellow, usually).",
      IN_LANGUAGES + " In Bengal it is the Gaye Holud, in Punjab the Maiyan, in Tamil Nadu the Nalangu and in Andhra the Pasupu.",
    ],
  },
  mehendi: {
    title: "Mehendi invitation video templates",
    h: "Mehendi invitations with henna that draws itself",
    intro: [
      "Henna paisleys draw themselves inside a scalloped frame, with the names, the date, the time and the venue in henna green, rust, mint or fuchsia.",
      IN_LANGUAGES + " In Kerala it is the Mylanchi, in Andhra the Gorintaku and in Karnataka the Madarangi.",
    ],
  },
  sangeet: {
    title: "Sangeet night invitation video templates",
    h: "Sangeet invitations with a party feel",
    intro: [
      "Spotlights sweep, neon titles light up and confetti falls, with the couple's names, the date, the venue and a line-up of who is performing.",
      IN_LANGUAGES + " In Punjab it becomes the Jaago night.",
    ],
  },
  reception: {
    title: "Wedding reception invitation video templates",
    h: "Reception invitations for the evening",
    intro: [
      "Fairy lights, gold art-deco fans and a programme of the night, on navy, black, wine or ivory. Nikah Mubarak also has an optional Walima scene, and Shubho Bibaho a Bou Bhat scene.",
      IN_LANGUAGES + " In Bengal it is the Bou Bhat, in Tamil Nadu the Varaverppu and in Karnataka the Aratakshate.",
    ],
  },
  "save-the-date": {
    title: "Save the date video templates",
    h: "Save the date, months ahead",
    intro: [
      "Short, modern designs to send before the invitations: drifting colour with large moving type, floral sprigs and script names, a scrapbook of your photos, or a film-trailer cut around your own video clip.",
      "They suit any community, and every line can be changed, so the same design works for an anniversary or a relaxed wedding invitation too.",
    ],
  },
};

/** Questions every function page answers; `priceFrom` null = payments off (no price is named since 2026-11-23). */
export function functionCopy(c: CategoryId, priceFrom: number | null, label: string): FunctionCopy {
  const base = FUNCTION_COPY[c];
  const lower = label.toLowerCase();
  const faqs: LandingFaq[] = [
    {
      q: "How do I make a " + lower + " invitation video?",
      a: "Choose a design, type the names, date, time and venue, and add photos or a song if you like. The preview plays as you type. Press Get link and you have a page to send on WhatsApp; it takes about two minutes.",
    },
    {
      q: "How much does it cost?",
      a:
        priceFrom === null
          ? "Making the invitation and its link is free."
          : "Making the invitation and its link is free. You watch your invite without the watermark first; removing the watermark from that link is a one-time payment, and the same link turns clean for every guest.",
    },
    {
      q: "Do guests need an app?",
      a: "No. The invitation opens in the phone's browser from WhatsApp, SMS or email, upright on phones and widescreen on laptops and TVs.",
    },
    ...(base.faqs ?? []),
  ];
  return { title: base.title, h: base.h, intro: base.intro, faqs };
}

/** A state page's text, from its region (language, rituals) and the price of its wedding designs. */
export function stateCopy(r: Region, rituals: string, weddingFrom: number | null): FunctionCopy {
  return {
    title: r.language + " wedding invitation video templates · " + r.label,
    h: r.language + " wedding invitations, written in " + r.language,
    intro: [
      "Designs for families in " + r.label + ", written in " + r.language + ": the title, the honorifics before the names, the muhurat and venue headings and the invitation line are in " + r.language + ", and you can change every one of them. The names, parents, date and venue are whatever you type, in " + r.language + " or English.",
      "Alongside the wedding there are " + r.language + " versions for " + rituals + ", so each function can go out on its own link. Guests open them from WhatsApp in the phone's browser, and when the invite ends they can add the date to their calendar and open directions to the venue.",
    ],
    faqs: [
      {
        q: "Can I write the invitation in " + r.language + "?",
        a: "Yes. These designs already have their headings and invitation lines in " + r.language + ", and every line is an editable field, so you can write all of it in " + r.language + ", in English, or mix both.",
      },
      {
        q: "How much does a " + r.language + " wedding invitation cost?",
        a:
          weddingFrom === null
            ? "Making the invitation and its link is free."
            : "Making the invitation and its link is free. You watch your invite without the watermark first; removing the watermark from that link is a one-time payment, and the same link turns clean for every guest.",
      },
      {
        q: "Is there " + r.language + " wording I can copy?",
        a: "Yes: our " + r.language + " wording guide has sample lines for the wedding, the functions and the reception, with their meaning in English.",
      },
    ],
  };
}

export const ALL_STATES = REGIONS;
