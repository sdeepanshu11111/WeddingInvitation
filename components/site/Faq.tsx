import Link from "next/link";
import type { ReactNode } from "react";
import { LEADS, PAYMENTS, VIDEO_EXPORT } from "@/lib/features";
import { FREE_COUNT, PACK_COVERS, PACK_PRICE_INR, PRICE_RANGE } from "@/lib/pricing";

/** text: the answer as plain words, for search engines (FAQ structured data, faqJsonLd). Needed when `a` is not a string. */
export type QA = { q: string; a: ReactNode; text?: string };

/** schema.org FAQPage for a list of questions: search engines and AI assistants read the answers from it. */
export function faqJsonLd(items: QA[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .map((x) => ({ q: x.q, text: x.text ?? (typeof x.a === "string" ? x.a : "") }))
      .filter((x) => x.text)
      .map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.text } })),
  };
}

/** Answers describe what the app really does today (flags included), so they stay true as features switch on. */
export function faqItems(): QA[] {
  const items: QA[] = [
    {
      q: "How long does it take?",
      a: "About two minutes. Choose a design, type the names, date and venue, and the preview updates as you type. Your link is ready the moment you press Get link.",
    },
    {
      q: "Do guests need an app?",
      a: "No. The invitation opens in the phone's browser from WhatsApp, SMS or email, with your music if you add some. It plays upright on phones and widescreen on laptops and TVs.",
    },
    {
      q: "Can I change it after sharing?",
      a: "Yes. Edit it in the studio on the same phone or computer you made it on and press Get link again: the same link updates for everyone who has it, and a paid invite stays paid. From another device, the change goes on a new link.",
    },
    {
      q: "What can guests do on the invitation?",
      a: "More than watch it. They open a sealed envelope, scratch gold foil off your date, tap to shower you with flowers, answer a question about the two of you and send blessings. When it ends they can add every function to their calendar and open directions to the venue. You can switch each of these off.",
    },
    {
      q: "Can guests RSVP?",
      a: "Yes. Choose a WhatsApp button, or a short RSVP form where guests say if they are coming, how many and for which functions (food preference too, if you ask). The reply goes straight to your WhatsApp or a family member's, and with the form your invite shows you how many have said yes. We don't keep their names or answers.",
    },
    {
      q: "Which communities and languages?",
      a: "Hindu, South Indian (Tamil, Telugu, Malayalam, Kannada), Muslim, Sikh and modern designs, with Devanagari, Gurmukhi, Arabic and South Indian scripts where they belong. Everything you type stays in your own words.",
    },
  ];
  if (VIDEO_EXPORT)
    items.push({ q: "Can I download an MP4?", a: "Yes. Export a real MP4 in 9:16 for Reels and WhatsApp Status or 16:9 for YouTube and TV, at 720p, 1080p or 4K." });
  if (LEADS)
    items.push({
      q: "Do I have to give my WhatsApp number or email?",
      a: "It is optional: your link works without it. If you add one, we use it only to help you with your invitation and remind you about it. We never sell or share your details, and we stop as soon as you reply STOP.",
    });
  if (PAYMENTS)
    items.push({
      q: "What does Premium include, and can I get a refund?",
      text:
        "A one-time payment per invitation (" + PRICE_RANGE + ", shown on each design) removes the watermark from that link, instantly, at the same address your guests already have. If you pay and the watermark stays, we fix it or refund you.",
      a: (
        <>
          A one-time payment per invitation ({PRICE_RANGE}, shown on each design{FREE_COUNT ? "; " + FREE_COUNT + " designs are free and have no watermark" : ""})
          removes the watermark from that link, instantly, at the same address your guests already have. If you pay and the watermark stays, we fix it or refund you. Details in our <Link href="/refunds">refund policy</Link>.
        </>
      ),
    });
  if (PAYMENTS)
    items.push({
      q: "We have several functions. Do we pay for each invite?",
      text:
        "You can, or take the Wedding pack: ₹" + PACK_PRICE_INR + " once, from any of your invites, and every invite you make for the same couple on that phone has no watermark, each on a link of its own. Each invite is covered up to ₹" + PACK_COVERS + ".",
      a: (
        <>
          You can, or take the Wedding pack: ₹{PACK_PRICE_INR} once, from any of your invites, and every invite you make for the same couple on that
          phone has no watermark: engagement, haldi, mehendi, sangeet, wedding and reception, each on a link of its own. Each invite is covered up to
          ₹{PACK_COVERS}, so Shaadi Utsav and Cinematic Reel need only the difference.
        </>
      ),
    });
  return items;
}

export function Faq({ items }: { items: QA[] }) {
  return (
    <div className="faq">
      {items.map((x) => (
        <details key={x.q} className="faq-item">
          <summary>
            <h3>{x.q}</h3>
            <i aria-hidden>+</i>
          </summary>
          <p>{x.a}</p>
        </details>
      ))}
    </div>
  );
}

/** A short kicker ("How it works") + a display headline (wrap the accent words in <em>). */
export function SectionHead({ label, children, center }: { label: string; children: ReactNode; center?: boolean }) {
  return (
    <div className={"sec-head" + (center ? " centered" : "")}>
      <span className="kicker">{label}</span>
      <h2>{children}</h2>
    </div>
  );
}
