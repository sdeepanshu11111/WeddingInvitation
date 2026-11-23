import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LEGAL } from "@/lib/legal";
import { pageMeta } from "@/lib/seo";

/* /about: who runs the site and what it does. Every sentence here must stay true (business details from lib/legal.ts;
   features as built). No invented history, team size, customer numbers or awards. */

export const metadata: Metadata = pageMeta(
  "About us · " + BRAND,
  `${BRAND} makes animated invitation pages for Indian weddings and functions, in English and Indian languages, to send on WhatsApp.`,
  "/about",
);

export default function About() {
  return (
    <article>
      <h1>About {BRAND}</h1>
      <p className="legal-meta">Mangalam by {BRAND}</p>

      <p>
        {BRAND} makes animated invitation pages for Indian weddings and the functions around them: engagement, haldi, mehendi, sangeet, the wedding
        and the reception. A family picks a design, types in the names, dates and venue, adds photos and music if they like, and gets one link to
        send to their guests on WhatsApp. Guests open it in their phone&rsquo;s browser, with no app to install.
      </p>

      <h2>Why we built it</h2>
      <p>
        Wedding invitations in India now travel mostly through WhatsApp, but what usually gets sent is a photo of a card or a heavy video that is hard
        to read on a phone, cannot be corrected, and leaves guests calling the family to ask where the venue is. We wanted an invitation that feels
        personal and festive, works on any phone, and also does the practical work: directions to the venue, adding each function to the calendar,
        and replying to the family.
      </p>

      <h2>What we make</h2>
      <ul>
        <li>Designs for Hindu, South Indian, Muslim, Sikh, Christian and modern weddings, with versions written in Hindi, Tamil, Telugu, Malayalam, Kannada, Marathi, Bengali and Punjabi.</li>
        <li>A design for each function, so the haldi or the reception can go out on its own link.</li>
        <li>Invitation pages guests can interact with: they can send blessings, answer a question about the couple, open directions, add the date to their calendar and RSVP on WhatsApp.</li>
        <li>
          Free to make and to watch. Removing the preview watermark is a one-time payment per invitation, described in our <Link href="/terms">Terms</Link>.
        </li>
      </ul>
      <p>
        We also publish <Link href="/guides">practical guides</Link> on invitation timing, wording, WhatsApp etiquette and RSVPs, and{" "}
        <Link href="/wording">sample invitation lines</Link> in several Indian languages.
      </p>

      <h2>What we promise</h2>
      <ul>
        <li>No made-up reviews, ratings or numbers on this site. Anything we show about other customers is real.</li>
        <li>Your guests&rsquo; RSVP answers go to your WhatsApp; we do not keep their names or answers.</li>
        <li>We never sell or share your phone number or email. Details are in our <Link href="/privacy">Privacy Policy</Link>.</li>
        <li>If you pay and the watermark does not come off, we fix it or refund you (<Link href="/refunds">Refund Policy</Link>).</li>
      </ul>

      <h2>Who runs {BRAND}</h2>
      <p>
        {BRAND} is run by {LEGAL.entity}, a sole proprietor based in {LEGAL.city}, India. Questions, suggestions and requests for help reach us at{" "}
        <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>
        {LEGAL.phone ? <> or {LEGAL.phone}</> : null}. You can find all our contact details on the <Link href="/contact">contact page</Link>.
      </p>
    </article>
  );
}
