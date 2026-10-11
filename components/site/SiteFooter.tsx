import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { LEGAL, LEGAL_PAGES, OPERATOR } from "@/lib/legal";
import { Logo } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo />
          <p>Animated video invitations for every Indian function: wedding, engagement, haldi, mehendi, sangeet and reception.</p>
          <a href={"mailto:" + LEGAL.email}>{LEGAL.email}</a>
          {LEGAL.phone ? <a href={"tel:" + LEGAL.phone.replace(/\s/g, "")}>{LEGAL.phone}</a> : null}
        </div>
        <div>
          <span className="mono-label">Invitations</span>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={"/templates?category=" + c.id}>
              {c.label}
            </Link>
          ))}
        </div>
        <div>
          <span className="mono-label">Product</span>
          <Link href="/templates">All templates</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/create">Open studio</Link>
        </div>
        <div>
          <span className="mono-label">Support</span>
          {LEGAL_PAGES.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="foot-base">
        <span>
          © {new Date().getFullYear()} {OPERATOR}
          {LEGAL.address ? " · " + LEGAL.address : ""}
        </span>
        <span className="mono-label">Made in India · for the people you invite</span>
      </div>
    </footer>
  );
}
