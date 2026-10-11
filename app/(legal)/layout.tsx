import Link from "next/link";
import { LegalLinks } from "@/components/LegalLinks";
import { LEGAL, OPERATOR } from "@/lib/legal";

/* Shared frame for /privacy, /terms, /refunds and /contact: static pages that ad and
   payment reviewers (Meta, Razorpay) open from the editor footer. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <Link href="/" className="brand">
          <b>
            Future<i>Proof</i>
          </b>
        </Link>
        <Link href="/" className="btn primary">
          Make an invite
        </Link>
      </header>
      <main className="legal-body">{children}</main>
      <footer className="legal-foot">
        <LegalLinks />
        <p>
          © {new Date().getFullYear()} {OPERATOR}
          {LEGAL.address ? " · " + LEGAL.address : ""}
        </p>
        <p>
          <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>
          {LEGAL.phone ? " · " + LEGAL.phone : ""}
        </p>
      </footer>
    </div>
  );
}
