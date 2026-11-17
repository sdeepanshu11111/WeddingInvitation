import Link from "next/link";
import { Faq, SectionHead } from "@/components/site/Faq";
import type { LandingFaq } from "@/lib/landing";

/** Under the designs on a landing page (function, state, wording): its paragraphs, its questions, and links to the
    related pages, so readers and search engines can move between them. Server-rendered. */
export function LandingAbout({ h, intro, faqs, links }: { h: string; intro: string[]; faqs: LandingFaq[]; links: { label: string; items: { href: string; text: string }[] }[] }) {
  return (
    <>
      <section className="sec t-about">
        <SectionHead label="About">{h}</SectionHead>
        {intro.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
        {links.map((g) => (
          <div key={g.label} className="land-links">
            <h3>{g.label}</h3>
            <div className="lang-row">
              {g.items.map((x) => (
                <Link key={x.href} href={x.href} prefetch={false} className="chip-o">
                  {x.text}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
      <section className="sec surface">
        <SectionHead label="Questions" center>
          Frequently <em>asked.</em>
        </SectionHead>
        <Faq items={faqs.map((x) => ({ q: x.q, a: x.a }))} />
      </section>
    </>
  );
}
