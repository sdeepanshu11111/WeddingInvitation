import type { Metadata } from "next";
import Link from "next/link";
import { AdSense } from "@/components/AdSense";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { GUIDES } from "@/lib/guides";
import { pageMeta } from "@/lib/seo";

/* /guides: every wedding guide (lib/guides.ts). */

export const metadata: Metadata = pageMeta(
  "Wedding invitation guides · " + BRAND,
  "Practical guides for Indian wedding invitations: when to send them, what to write, wording samples, WhatsApp etiquette, RSVPs and a final checklist.",
  "/guides",
);

export default function GuidesIndex() {
  return (
    <div className="site legal">
      <AdSense />
      <SiteHeader />
      <main className="legal-body guide">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / Guides
        </nav>
        <h1>Wedding invitation guides</h1>
        <p className="guide-lead">
          Practical advice for families planning an Indian wedding&rsquo;s invitations: when to send them, what to write, how to invite on WhatsApp
          without seeming rude, and how to get guests to reply.
        </p>
        <div className="guide-list">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={"/guides/" + g.slug} className="guide-card">
              <b>{g.title}</b>
              <span>{g.description}</span>
              <small>{g.minutes} min read</small>
            </Link>
          ))}
        </div>
        <p className="guide-more">
          Looking for lines in Hindi, Tamil, Telugu, Marathi or Bengali? See our <Link href="/wording">invitation wording pages</Link>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
