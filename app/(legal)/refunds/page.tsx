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
      <p>We give a full refund of ₹{LINK_PRICE_INR} if:</p>
      <ul>
        <li>money was deducted but the payment failed or the watermark was not removed, and we cannot fix it;</li>
        <li>you were charged more than once for the same invitation link;</li>
        <li>the invitation link does not work because of a fault on our side that we cannot fix within 48 hours of your report.</li>
      </ul>
      <p>
        Because the service is delivered in full as soon as you pay, we do not otherwise give refunds for a change of mind, a typo in your own
        invitation, or an event that is postponed or cancelled. You can always create a new free link and check it before upgrading.
      </p>

      <h2>How to ask for a refund</h2>
      <p>
        Email {mail} within 7 days of the payment with your invitation link and the Razorpay payment ID (it starts with <i>pay_</i> and is on the
        receipt Razorpay sends you). We reply within 2 business days. Approved refunds go back to the original payment method (card, UPI, bank account
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
