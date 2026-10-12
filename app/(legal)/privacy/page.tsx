import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LEADS } from "@/lib/features";
import { LEGAL, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy · " + BRAND, description: `How ${BRAND} collects, uses and protects your information.` };

/* Keep this in step with what the app really does: Blob storage for share links (lib/server/share.ts),
   Razorpay (lib/server/razorpay.ts), Mixpanel (lib/analytics.ts, AGENTS.md), local autosave (lib/project.ts).
   Meta Pixel (lib/analytics.ts, AGENTS.md). WhatsApp numbers and payers' contacts (lib/server/leads.ts) only
   while LEADS is on. Adding a tracker or a new processor means updating sections 2, 4 and 5. */
export default function Privacy() {
  const mail = <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>;
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p className="legal-meta">Last updated: {LEGAL.updated}</p>

      <p>
        {OPERATOR} (&ldquo;{BRAND}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) lets you design animated wedding and function invitations and share
        them with your guests as a link. This policy explains what information we collect when you use our website, why, who we share it with, and the
        choices you have. It is written to meet India&rsquo;s Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000 and its
        rules. By using {BRAND} you agree to this policy.
      </p>

      <h2>1. Information you give us</h2>
      <ul>
        <li>
          <b>Invitation content</b>: the names, dates, times, venues, event schedules, messages, photos, videos and music you add to an invitation. While
          you are editing, this stays in your own browser (saved automatically on your device) and is not sent to us.
        </li>
        <li>
          <b>Shared invitations</b>: when you tap &ldquo;Get link&rdquo; and create a link, we upload that invitation&rsquo;s content and media to our
          servers so your guests can open it. The link name you choose (for example <i>/e/aarav-ananya</i>) is part of the web address.
        </li>
        {LEADS ? (
          <li>
            <b>Your WhatsApp number or email</b>: when you create a link, we ask for a WhatsApp number or an email address (one is enough). We keep it
            privately with the name of that link (it is never part of the invitation your guests see) and use it only to contact you about that
            invitation, for example to help you or to remind you while it still has the watermark. We never sell it or share it for anyone else&rsquo;s
            use. Reply STOP at any time and we will not contact you again.
          </li>
        ) : null}
        <li>
          <b>Payments</b>: if you buy the Premium plan, payment is handled by Razorpay. You enter your card, UPI, net-banking or wallet details, phone
          number and email on Razorpay&rsquo;s secure checkout, not on our site.{" "}
          {LEADS
            ? "We receive and keep the order ID, payment ID, amount, time, the invitation the payment was for, and the phone number and email you gave Razorpay, so we can help you with your purchase."
            : "We receive and keep only the order ID, payment ID, amount, time and the invitation the payment was for."}{" "}
          We never see or store your full card or bank details.
        </li>
        <li>
          <b>Messages to us</b>: if you email us, we keep your email address and what you write so we can reply.
        </li>
      </ul>

      <h2>2. Information collected automatically</h2>
      <ul>
        <li>
          <b>Usage analytics</b>: we use Mixpanel to understand how the product is used, for example which templates are chosen and whether links are
          created. It records events with an anonymous device ID stored in your browser, your browser and device type, and an approximate location
          (city or region) derived from your IP address. We do not send names, photos, venues, link names or any other invitation content to Mixpanel,
          and we do not record your screen.
        </li>
        <li>
          <b>Advertising measurement</b>: we advertise on Meta platforms (Facebook and Instagram) and use the Meta Pixel on our website pages to
          measure how well our ads work, for example whether someone who saw an ad later viewed a template, created an invitation or bought the
          Premium plan. It receives the page address, the template chosen and the amount paid, never the names, photos or other content of your
          invitation. We may also send the same events from our servers through Meta&rsquo;s Conversions API.
          Meta and other third parties may use cookies, web beacons and similar technologies to collect or receive information from our website and
          elsewhere on the internet, and use it to provide measurement services and to show ads. These tools are never used on your guests&rsquo;
          invitation pages. See section 5 for how to opt out.
        </li>
        <li>
          <b>Server logs</b>: our hosting provider keeps standard technical logs (IP address, browser, pages requested, time) for security and to keep
          the service running.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <ul>
        <li>To build, save and show your invitation, and to publish it at the link you create.</li>
        <li>To process payments, remove the watermark from paid invitations, issue refunds and keep records required by law.</li>
        <li>To answer your questions, support requests and complaints.</li>
        {LEADS ? (
          <li>To contact you on WhatsApp or by email about your invitation, using what you gave us (help, and a reminder while it has the watermark).</li>
        ) : null}
        <li>To understand usage, fix problems, prevent fraud and abuse, and improve the product.</li>
        <li>To measure and improve our advertising.</li>
      </ul>
      <p>
        We process your information on the basis of your consent, which you give by using the service and creating a link, and where needed to provide
        the service you asked for or to comply with the law. You can withdraw consent at any time (see section 7); this does not affect what was done
        before.
      </p>

      <h2>4. Who we share it with</h2>
      <p>We do not sell your personal information. We share it only with:</p>
      <ul>
        <li>
          <b>Anyone who has your invitation link.</b> A shared invitation is visible to everyone who opens the link, and guests may forward it. Links
          are not listed anywhere and we ask search engines not to index them, but link names can be guessed, so please do not put information in an
          invitation that you would not want a stranger to see.
        </li>
        <li>
          <b>Service providers</b> who process data for us under their own privacy and security terms: Vercel Inc. (website hosting and file storage,
          servers in the United States), Razorpay Software Pvt. Ltd. (payments, India), Mixpanel Inc. (analytics, United States)
          {LEADS === "mongo" ? ", MongoDB, Inc. (the private database for contact details, servers in India)" : ""}{" "}
          and Meta Platforms, Inc. (advertising measurement).
          {LEADS ? " When we contact you, WhatsApp or our email provider (Google) carries the message." : ""}
        </li>
        <li>
          <b>Authorities</b>, when Indian law, a court order or a lawful government request requires it, or to protect the rights and safety of our
          users or the public.
        </li>
      </ul>
      <p>Some of these providers store data outside India. We use providers that protect data to a standard comparable to Indian law.</p>

      <h2>5. Cookies and your choices</h2>
      <p>
        We use your browser&rsquo;s storage to autosave the invitation you are editing and to keep the anonymous analytics ID
        {LEADS ? " and the WhatsApp number or email you last entered, so you don't have to type it again" : ""}. Advertising tools such as
        the Meta Pixel may set cookies. You can clear or block cookies and site data in your browser settings at any time; the editor still works, but
        an unsaved draft on that device will be lost. You can control how Meta uses information for ads in your{" "}
        <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer">
          Facebook ad preferences
        </a>
        , and opt out of interest-based advertising from participating companies at{" "}
        <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">
          aboutads.info
        </a>{" "}
        or{" "}
        <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">
          youronlinechoices.eu
        </a>
        .
      </p>

      <h2>6. How long we keep it</h2>
      <ul>
        <li>Drafts stay in your browser until you clear them; we never receive them.</li>
        <li>Shared invitations and their media are kept for as long as the link is live, so it keeps working for your guests, or until you ask us to delete them.</li>
        {LEADS ? (
          <li>
            Your WhatsApp number or email, and the phone and email from a payment, are kept with your invitation until you ask us to delete them. If
            you reply STOP, we stop contacting you.
          </li>
        ) : null}
        <li>Payment records are kept for 8 years, as Indian tax and accounting laws require, even if the invitation is deleted.</li>
        <li>Analytics events are kept for up to 2 years and emails for as long as needed to resolve your request.</li>
      </ul>

      <h2 id="delete">7. Your rights and deleting your data</h2>
      <p>
        You can ask us to access, correct or delete your personal information, to withdraw your consent, or to nominate someone to act for you. To delete
        a shared invitation and all its photos, videos and music{LEADS ? ", and the contact details we keep with it" : ""}, email {mail} from any
        address with the full link (the address ending in
        <i> /e/your-link-name</i>) and, if you paid, the Razorpay payment ID from your receipt so we can confirm it is yours. We delete
        it within 7 days and confirm by email. To delete a draft, clear this site&rsquo;s data in your browser.
      </p>

      <h2>8. Security</h2>
      <p>
        All traffic to {BRAND} is encrypted with HTTPS, payment details are handled only by Razorpay (PCI-DSS compliant), and access to our systems is
        limited to the people who run the service. No method of storing or sending data is completely secure, but we work to protect your information
        and will notify you and the authorities of a breach as the law requires.
      </p>

      <h2>9. Children</h2>
      <p>
        {BRAND} is meant for adults (18 and over) planning their own or their family&rsquo;s functions. We do not knowingly collect personal information
        from children. If you add photos of children to an invitation, please make sure you have their parent&rsquo;s or guardian&rsquo;s permission.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy as the product changes. We will change the date at the top and, for significant changes, show a notice on the website.
      </p>

      <h2>11. Grievance Officer and contact</h2>
      <p>
        For any question, request or complaint about your information, contact our Grievance Officer
        {LEGAL.grievanceName ? ", " + LEGAL.grievanceName + "," : ""} at {mail}
        {LEGAL.phone ? <> or {LEGAL.phone}</> : null}
        {LEGAL.address ? <>, {LEGAL.address}</> : null}. We acknowledge complaints within 24 hours and resolve them within 15 days. If you are not
        satisfied, you may complain to the Data Protection Board of India. See also our <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/refunds">Refund Policy</Link>.
      </p>
    </article>
  );
}
