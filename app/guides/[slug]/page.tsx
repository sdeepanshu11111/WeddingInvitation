import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSense } from "@/components/AdSense";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { GuideCta } from "@/components/site/GuideCta";
import { Block } from "@/components/site/GuideText";
import { BRAND } from "@/lib/brand";
import { GUIDES, guideBySlug } from "@/lib/guides";
import { pageMeta } from "@/lib/seo";

/* /guides/<slug>: one wedding guide (lib/guides.ts). Static, built at deploy. */

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = guideBySlug(params.slug);
  if (!g) return {};
  return pageMeta(g.title + " · " + BRAND, g.description, "/guides/" + g.slug);
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = guideBySlug(params.slug);
  if (!g) notFound();
  const related = g.related.map(guideBySlug).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <div className="site legal">
      <AdSense />
      <SiteHeader />
      <main className="legal-body guide">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/guides">Guides</Link>
        </nav>
        <article>
          <h1>{g.title}</h1>
          <p className="legal-meta">
            By the {BRAND} team · Updated {g.updated} · {g.minutes} min read
          </p>
          {g.intro.map((p, i) => (
            <p key={i} className={i === 0 ? "guide-lead" : undefined}>
              {p}
            </p>
          ))}
          {g.sections.length > 3 ? (
            <nav className="guide-toc" aria-label="In this guide">
              <span>In this guide</span>
              <ol>
                {g.sections.map((s, i) => (
                  <li key={i}>
                    <a href={"#s" + (i + 1)}>{s.h}</a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {g.sections.map((s, i) => (
            <section key={i} id={"s" + (i + 1)}>
              <h2>{s.h}</h2>
              {s.blocks.map((b, j) => (
                <Block key={j} b={b} />
              ))}
            </section>
          ))}
        </article>

        <aside className="guide-cta">
          <b>Making your invitation?</b>
          <p>Type your names and details into a design and get an animated invitation page to send on WhatsApp, with directions, calendar and RSVP buttons for your guests.</p>
          <GuideCta slug={g.slug} />
        </aside>

        {related.length ? (
          <section className="guide-related">
            <h2>Related guides</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={"/guides/" + r.slug}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
