import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/* Shared frame for /privacy, /terms, /refunds and /contact: static pages that ad and
   payment reviewers (Meta, Razorpay) open from the site footer and the editor. */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site legal">
      <SiteHeader />
      <main className="legal-body">{children}</main>
      <SiteFooter />
    </div>
  );
}
