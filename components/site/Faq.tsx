import Link from "next/link";
import type { ReactNode } from "react";
import { LEADS, PAYMENTS, VIDEO_EXPORT } from "@/lib/features";

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
      a: "About two minutes. Choose a design, type the names, date and venue, and the preview updates as you type. Your link is ready the moment you press Get wedding link.",
    },
    {
      q: "Do guests need an app?",
      a: "No. The invitation opens in the phone's browser from WhatsApp, SMS or email, with your music if you add some. It plays upright on phones and widescreen on laptops and TVs.",
    },
    {
      q: "Can I change it after sharing?",
      a: "Yes. Edit it in the studio on the same phone or computer you made it on and press Get wedding link again: the same link updates for everyone who has it, and a paid invite stays paid. From another device, the change goes on a new link.",
    },
    {
      q: "What can guests do on the invitation?",
      a: "More than watch it. They tap to shower you with flowers, answer a question about the two of you and send blessings. When it ends they can add every function to their calendar and open directions to the venue. You can switch each of these off.",
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
  if (LEADS || PAYMENTS)
    items.push({
      q: "Why do you ask for my mobile number?",
      a: "Your wedding link is made with it, so we can help you with your invitation if something goes wrong and remind you about it. We never sell or share it, and we stop as soon as you reply STOP.",
    });
  if (PAYMENTS)
    items.push({
      q: "Is it free? And can I get a refund?",
      text:
        "Making your invitation and getting your wedding link is free. You watch it without the watermark first; after that the watermark comes on, and a one-time payment removes it from that link, instantly, at the same address your guests already have. If you pay and the watermark stays, we fix it or refund you.",
      a: (
        <>
          Making your invitation and getting your wedding link is free. You watch it without the watermark first; after that the watermark comes on,
          and a one-time payment removes it from that link, instantly, at the same address your guests already have. If you pay and the watermark
          stays, we fix it or refund you. Details in our <Link href="/refunds">refund policy</Link>.
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
