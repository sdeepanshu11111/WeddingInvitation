import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";
import { PAYMENTS } from "@/lib/features";
import { functionPath, statePath } from "@/lib/landing";
import { PACK_PRICE_INR, PRICE_MIN, PRICE_RANGE } from "@/lib/pricing";
import { REGIONS } from "@/lib/regions";
import { SITE_URL } from "@/lib/site";
import { DESIGNS } from "@/lib/templates";
import { WORDING } from "@/lib/wording";

/* /llms.txt: what the site is, in plain words, for AI assistants (ChatGPT, Perplexity, Gemini…) that answer questions
   like "where can I make a Tamil wedding invitation video". The llms.txt convention: a title, a one-line summary,
   then sections of links. Built at deploy from the same data as the pages, so prices and lists stay true. */

export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# " + BRAND,
    "",
    "> Animated wedding and function invitations for Indian families, each on its own web page that guests open from one WhatsApp link (no app). Make it free in the browser in about two minutes" +
      (PAYMENTS ? "; removing the watermark is a one-time payment of " + PRICE_RANGE + " depending on the design, or ₹" + PACK_PRICE_INR + " for every invite of one wedding." : "."),
    "",
    "- " + DESIGNS.length + " designs: Hindu, South Indian, Marathi, Bengali, Muslim (Nikah, Walima), Sikh (Anand Karaj), Christian (church) and modern.",
    "- Designs written in Hindi, Tamil, Telugu, Malayalam, Kannada, Punjabi, Marathi and Bengali; function designs named for each state's ritual (Gaye Holud, Nalangu, Maiyan, Sakharpuda, Mylanchi...).",
    "- Every function: engagement, haldi, mehendi, sangeet, wedding, reception, save the date, or all of them in one invitation.",
    "- Guests can add the date to their calendar, open directions to the venue and RSVP on WhatsApp from the end of the invitation.",
    "- Plays upright on phones and widescreen on TVs; music and the couple's photos and video can be added.",
    ...(PAYMENTS ? ["- Prices start at ₹" + PRICE_MIN + ". Paid with UPI, cards or net banking through Razorpay. No subscription."] : []),
    "",
    "## Start",
    "- [Make an invitation](" + SITE_URL + "/create): the studio, free, no sign-up",
    "- [All designs](" + SITE_URL + "/templates)",
    "",
    "## By function",
    ...CATEGORIES.map((c) => "- [" + c.label + " invitations](" + SITE_URL + functionPath(c.id) + "): " + c.blurb),
    "",
    "## By state and language",
    ...REGIONS.map((r) => "- [" + r.language + " wedding invitations](" + SITE_URL + statePath(r.id) + "): for families in " + r.label),
    "",
    "## Wording guides",
    ...WORDING.map((w) => "- [Wedding invitation wording in " + w.language + "](" + SITE_URL + "/wording/" + w.id + ")"),
    "",
    "## Policies",
    "- [Terms](" + SITE_URL + "/terms)",
    "- [Refunds](" + SITE_URL + "/refunds)",
    "- [Privacy](" + SITE_URL + "/privacy)",
    "- [Contact](" + SITE_URL + "/contact)",
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
