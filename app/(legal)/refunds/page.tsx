import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LINK_PRICE_INR } from "@/lib/features";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy · " + BRAND,
  description: `Refunds, cancellations and delivery for the ${BRAND} Premium plan.`,
};

export default function Refunds() {
  const mail = <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>;
  return (
    <article>
      <h1>Refund &amp; Cancellation Policy</h1>
      <p className="legal-meta">Last updated: {LEGAL.updated}</p>

      <p>
        {BRAND} is free to use. The only paid item is the <b>Premium plan</b>: a one-time payment of ₹{LINK_PRICE_INR} that removes the watermark
        from one invitation link. This page explains how cancellations, refunds and delivery work for it.
      </p>

      <h2>Delivery</h2>
      <p>
        Premium is a digital service; nothing is shipped. It is delivered online and instantly: once Razorpay confirms your payment, the watermark is
        removed from your invitation link, usually within a few seconds. Your guests see the clean version at the same link, so there is nothing to
        resend. If the watermark is still showing 30 minutes after a successful payment, email us and we will fix it or refund you.
      </p>

      <h2>Cancellation</h2>
      <p>
        There is no subscription to cancel and nothing is charged again. You can close the payment window at any time before paying and you will not be
        charged. Because Premium is applied the moment payment succeeds, an order cannot be cancelled after payment, but the refund cases below still
        apply.
      </p>

      <h2>When we refund</h2>
      <p>If you paid but did not get what you paid for, we refund the full ₹{LINK_PRICE_INR}. That is when:</p>
      <ul>
        <li>your invitation link was not created;</li>
        <li>the watermark was not removed from your link and we cannot fix it within 48 hours of your email;</li>
        <li>you were charged more than once for the same invitation link (we refund every extra payment).</li>
      </ul>
      <p>
        Once your link is live without the watermark, the service has been delivered in full, so we do not give refunds for a change of mind, a typo
        in your own invitation, or an event that is postponed or cancelled. You can create a free preview link and check it before you pay.
      </p>

      <h2>How to ask for a refund</h2>
      <p>
        Email {mail} within 7 days of the payment with the Razorpay payment ID (it starts with <i>pay_</i> and is on the receipt Razorpay sends
        you) and your invitation link, if one was created. We reply within 2 business days. Approved refunds go back to the original payment method (card, UPI, bank account
        or wallet) through Razorpay and usually reach you within 5 to 7 business days, depending on your bank.
      </p>
      <p>
        If money left your account but the payment failed, your bank or Razorpay usually reverses it automatically within 5 to 7 business days. If it
        has not, write to us and we will help.
      </p>

      <p>
        See also our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </article>
  );
}
