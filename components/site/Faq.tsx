import Link from "next/link";
import type { ReactNode } from "react";
import { LEADS, LINK_PRICE_INR, PAYMENTS, VIDEO_EXPORT } from "@/lib/features";

export type QA = { q: string; a: ReactNode };

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
      a: "Each link is a snapshot of your invitation. To change something, edit it in the studio and create a new link. Check the free preview first, so you only upgrade the final version.",
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
      a: (
        <>
          A one-time ₹{LINK_PRICE_INR} per invitation removes the watermark from that link, instantly, at the same address your guests already
          have. If you pay and the watermark stays, we fix it or refund you. Details in our <Link href="/refunds">refund policy</Link>.
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
