/* Business details shown on the policy pages (/privacy, /terms, /refunds, /contact).
   Meta (ads) and Razorpay reviewers check these: keep them real and identical to what the
   Razorpay account and the Meta Business account list. Empty strings are left off the pages. */

import { BRAND } from "./brand";

export const LEGAL = {
  /** Registered business or proprietor name (as on Razorpay KYC / GST), e.g. "Deepanshu Sharma (proprietor)". */
  entity: "",
  /** Inbox people write to for support, refunds, privacy and deletion requests. */
  email: "support@futureproof.co.in",
  phone: "",
  /** Full postal address, one line. */
  address: "",
  /** City whose courts handle disputes (Terms, "Governing law"). */
  city: "",
  /** Grievance Officer (IT Rules 2021, DPDP Act 2023). Defaults to the support inbox when no name is set. */
  grievanceName: "",
  /** Date the current versions of the policies took effect. Change it whenever a policy changes. */
  updated: "11 October 2026",
};

/** "FutureProof" or "FutureProof (operated by X)". */
export const OPERATOR = LEGAL.entity ? `${BRAND} (operated by ${LEGAL.entity})` : BRAND;

export const LEGAL_PAGES = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
  { href: "/contact", label: "Contact" },
] as const;
