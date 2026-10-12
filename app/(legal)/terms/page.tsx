import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LINK_PRICE_INR } from "@/lib/features";
import { LEGAL, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Terms of Service · " + BRAND, description: `The terms for using ${BRAND} invitation links and the Premium plan.` };

export default function Terms() {
  const mail = <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>;
  return (
    <article>
      <h1>Terms of Service</h1>
      <p className="legal-meta">Last updated: {LEGAL.updated}</p>

      <p>
        These terms are an agreement between you and {OPERATOR} (&ldquo;{BRAND}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) for using our website
        and services. By using {BRAND} or creating an invitation link you accept these terms and our <Link href="/privacy">Privacy Policy</Link>. If you
        do not agree, please do not use the service.
      </p>

      <h2>1. The service</h2>
      <p>
        {BRAND} lets you choose an animated invitation template, add your details, photos, video and music, and share it with guests as a web link that
        plays in their browser. Creating and sharing a link is free; free links show a &ldquo;{BRAND} · Preview&rdquo; watermark. The Premium plan removes
        the watermark from one invitation link. You do not need an account.
      </p>

      <h2>2. Who can use it</h2>
      <p>
        You must be at least 18 years old and able to enter into a binding contract under Indian law. If you use {BRAND} for someone else, such as a
        family member or a client, you confirm you have their permission.
      </p>

      <h2>3. Your content</h2>
      <ul>
        <li>You keep ownership of everything you add: text, photos, videos and music (&ldquo;your content&rdquo;).</li>
        <li>
          You give us a non-exclusive, royalty-free licence to store, process, display and deliver your content only as needed to run the service, for
          example to show your invitation to people who open your link. This ends when the invitation is deleted, except for copies we must keep by law.
        </li>
        <li>
          You are responsible for your content and confirm that you have the right to use it, including permission from people who appear in photos and
          the rights to any music you upload. We do not check content before it is published.
        </li>
        <li>
          Templates may include religious or cultural text (for example blessings in Devanagari, Gurmukhi, Arabic or Tamil). We take care with it, but
          please review your invitation before you share it.
        </li>
      </ul>

      <h2>4. What you must not do</h2>
      <p>You agree not to use {BRAND} to create or share anything that:</p>
      <ul>
        <li>is unlawful, defamatory, obscene, hateful, harassing, or promotes violence;</li>
        <li>infringes someone else&rsquo;s copyright, trademark, privacy or other rights;</li>
        <li>impersonates a person or misleads guests, for example a fake event used to collect money or personal details;</li>
        <li>contains malware, or tries to break, overload, scrape or get unauthorised access to the service.</li>
      </ul>
      <p>
        We may remove any invitation that breaks these rules or that we are lawfully asked to remove, without refund. To report an invitation, email{" "}
        {mail} with its link.
      </p>

      <h2>5. Share links are public to anyone with the link</h2>
      <p>
        Anyone who has your invitation link can open it and forward it. Links are not listed publicly, but link names can be guessed. Do not include
        information you want to keep private. Each link name is first come, first served; once created, a link&rsquo;s content cannot be edited, so
        create a new link if something needs to change.
      </p>

      <h2>6. Premium plan and payment</h2>
      <ul>
        <li>
          Premium costs ₹{LINK_PRICE_INR} per invitation link, paid once. That is the full price: we are not registered for GST, so no GST is
          added. There is no subscription and nothing renews automatically. The price is shown before you pay and may change for future purchases.
        </li>
        <li>
          Payments are processed by Razorpay, using cards, UPI, net banking or wallets. Razorpay&rsquo;s terms also apply to the payment. We never see your
          card or bank details.
        </li>
        <li>
          The watermark is removed from that link as soon as the payment is confirmed, usually within seconds. One payment applies to one link only.
        </li>
        <li>
          Cancellations and refunds are covered by our <Link href="/refunds">Refund &amp; Cancellation Policy</Link>.
        </li>
      </ul>

      <h2>7. Availability</h2>
      <p>
        We work to keep invitation links online, but the service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. It may sometimes be
        unavailable for maintenance or reasons outside our control, and features may change. How an invitation looks can vary slightly between
        devices and browsers. Please keep your own copies of your photos and videos.
      </p>

      <h2>8. Our intellectual property</h2>
      <p>
        The {BRAND} name, website, templates, animations, artwork and software belong to us or our licensors. You may use them only to make and share
        your own invitations through the service, not to copy, resell or build a competing product from them.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, such as loss of data, a missed event or a guest not seeing
        an invitation. Our total liability for any claim about the service is limited to the amount you paid us for the invitation concerned, or ₹
        {LINK_PRICE_INR} if you paid nothing. Nothing in these terms limits rights you have under the Consumer Protection Act, 2019.
      </p>

      <h2>10. Indemnity</h2>
      <p>
        You agree to compensate us for claims, losses and costs (including reasonable legal fees) arising from your content or from your breach of these
        terms.
      </p>

      <h2>11. Ending use</h2>
      <p>
        You can stop using {BRAND} at any time and ask us to delete your invitations (see the <Link href="/privacy#delete">Privacy Policy</Link>). We
        may suspend or remove invitations that break these terms.
      </p>

      <h2>12. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Please contact us first so we can try to resolve any problem. Any dispute that cannot be resolved
        will be handled by the courts {LEGAL.city ? <>at {LEGAL.city}</> : "of India"}, subject to your rights to approach a consumer commission.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these terms. The date at the top shows the latest version, and continuing to use {BRAND} after a change means you accept it. A
        payment you have already made stays under the terms in force when you made it.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these terms: {mail}. More ways to reach us are on the <Link href="/contact">Contact</Link> page.
      </p>
    </article>
  );
}
