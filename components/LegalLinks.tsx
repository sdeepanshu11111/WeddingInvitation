import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";

/** Privacy · Terms · Refunds · Contact, for the editor sidebar and the policy pages' footer. */
export function LegalLinks({ className = "legal-links" }: { className?: string }) {
  return (
    <nav className={className} aria-label="Policies">
      {LEGAL_PAGES.map((p) => (
        <Link key={p.href} href={p.href}>
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
