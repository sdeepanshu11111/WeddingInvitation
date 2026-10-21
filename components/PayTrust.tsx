import { PayIcons } from "@/components/PayIcons";

export const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

/** Who processes the payment and the ways to pay that Indian buyers look for. */
export function TrustRow() {
  return (
    <div className="trust-row">
      <span className="lock">
        <LockIcon /> Secured by Razorpay
      </span>
      <PayIcons />
    </div>
  );
}

/** Consent line under the create/pay buttons (DPDP Act; Meta and Razorpay reviewers look for it). New tab, so the page stays put. */
export function AgreeNote({ paying, creating }: { paying?: boolean; creating?: boolean }) {
  const a = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener">
      {label}
    </a>
  );
  return (
    <p className="agree-note">
      By {paying ? "paying" : creating ? "getting a link" : "continuing"} you agree to our {a("/terms", "Terms")}, {a("/privacy", "Privacy Policy")}
      {paying ? <> and {a("/refunds", "Refund Policy")}</> : null}.
    </p>
  );
}
