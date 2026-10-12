/* Business details shown on the policy pages (/privacy, /terms, /refunds, /contact).
   Meta (ads) and Razorpay reviewers check these: keep them real and identical to what the
   Razorpay account and the Meta Business account list. Empty strings are left off the pages. */

import { BRAND } from "./brand";

export const LEGAL = {
  /** Business or proprietor name, exactly as on the Razorpay KYC. Not GST-registered (see /terms, Premium price). */
  entity: "",
  /** Inbox people write to for support, refunds, privacy and deletion requests. */
  email: "neverhatespeople@gmail.com",
  phone: "+91 70117 09892",
  /** Full postal address, one line. */
  address: "AIHP Signature, Udyog Vihar Phase 4, Gurugram, Haryana, India",
  /** City whose courts handle disputes (Terms, "Governing law"). */
  city: "Gurugram, Haryana",
  /** Grievance Officer (IT Rules 2021, DPDP Act 2023). Defaults to the support inbox when no name is set. */
  grievanceName: "",
  /** Date the current versions of the policies took effect. Change it whenever a policy changes. */
  updated: "12 October 2026",
};

/** "FutureProof" or "FutureProof (operated by X)". */
export const OPERATOR = LEGAL.entity ? `${BRAND} (operated by ${LEGAL.entity})` : BRAND;

export const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
  { href: "/contact", label: "Contact" },
] as const;
