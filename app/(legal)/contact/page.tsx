import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LEGAL, OPERATOR } from "@/lib/legal";

export const metadata: Metadata = { title: "Contact · " + BRAND, description: `Get help with your ${BRAND} invitation, payment or data.` };

export default function Contact() {
  const rows: [string, React.ReactNode][] = [
    ["Business", OPERATOR],
    ["Email", <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>],
    ...(LEGAL.phone ? ([["Phone", <a href={"tel:" + LEGAL.phone.replace(/[^\d+]/g, "")}>{LEGAL.phone}</a>]] as [string, React.ReactNode][]) : []),
    ...(LEGAL.address ? ([["Address", LEGAL.address]] as [string, React.ReactNode][]) : []),
    ["Grievance Officer", LEGAL.grievanceName ? `${LEGAL.grievanceName} (${LEGAL.email})` : LEGAL.email],
  ];
  return (
    <article>
      <h1>Contact us</h1>
      <p>
        Questions about your invitation, a payment, a refund, or your data? Write to us and we will get back to you within one business day.
      </p>

      <dl className="legal-contact">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <h2>To help us answer faster</h2>
      <ul>
        <li>
          <b>Invitation or payment problem</b>: include your invitation link and, if you paid, the Razorpay payment ID (starts with <i>pay_</i>).
        </li>
        <li>
          <b>Refund</b>: see the <Link href="/refunds">Refund &amp; Cancellation Policy</Link>.
        </li>
        <li>
          <b>Delete an invitation or your data</b>: see <Link href="/privacy#delete">how to delete your data</Link>.
        </li>
        <li>
          <b>Report an invitation</b> that is abusive or uses your photos without permission: send its link and we will review it within 24 hours.
        </li>
      </ul>
    </article>
  );
}
