import type { Metadata } from "next";
import { AdSense } from "@/components/AdSense";
import { PayIcons } from "@/components/PayIcons";
import { Faq, SectionHead, faqItems, faqJsonLd } from "@/components/site/Faq";
import { JsonLd } from "@/components/JsonLd";
import { LEGAL } from "@/lib/legal";
import { Arrow, CtaLink, DesignStack, Hero, Showcase } from "@/components/site/Landing";
import { GuestDemo } from "@/components/site/GuestDemo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { PAYMENTS } from "@/lib/features";
import { FREE_COUNT, PACK_PRICE_INR, PRICE_MIN, PRICE_RANGE } from "@/lib/pricing";
import { SITE_URL } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { DESIGNS } from "@/lib/templates";
import { type ReviewSummary, publicReviews } from "@/lib/server/reviews";
import { recentLinkCount } from "@/lib/server/links";

const HOST = SITE_URL.replace(/^https?:\/\//, "");

export const metadata: Metadata = pageMeta(
  BRAND + " · Animated wedding invitation website",
  "Turn your wedding invitation into an animated website with your names, dates, photos and music. Preview it free, then send one link on WhatsApp.",
  "/",
);

/* Re-rendered at most hourly, and at once when a review is approved, hidden or deleted (app/api/admin/reviews):
   the hero shows real, approved reviews (lib/server/reviews.ts). */
export const revalidate = 3600;

/** The approved reviews, or none if the database is slow or down: the home page never waits long or fails for them. */
async function heroReviews(): Promise<ReviewSummary> {
  const none: ReviewSummary = { reviews: [], count: 0, average: null };
  return Promise.race([publicReviews().catch(() => none), new Promise<ReviewSummary>((r) => setTimeout(() => r(none), 4000))]);
}

/** Invitations real visitors made in the last 30 days (test links left out), or 0 if the database is slow or down. */
async function madeThisMonth(): Promise<number> {
  return Promise.race([recentLinkCount(30).catch(() => 0), new Promise<number>((r) => setTimeout(() => r(0), 4000))]);
}

/** Invitation link vs a printed card vs an image or PDF: [what, card, image, link]. The first four show; the rest fold. */
const COMPARE: [string, boolean, boolean, boolean][] = [
  ["Animation and music", false, false, true],
  ["Guests RSVP and add it to their calendar", false, false, true],
  ["Reaches guests the same minute", false, true, true],
  ["Change it after sending", false, false, true],
  ["Every function, date and venue in one", true, true, true],
  ["Upright on phones, wide on the TV", false, false, true],
  ["Looks right without zooming", true, false, true],
  ["Nothing to print or post", false, true, true],
];
const cmpRow = ([label, ...v]: [string, boolean, boolean, boolean]) => (
  <div className="cmp-row" role="row" key={label}>
    <span role="rowheader">{label}</span>
    {v.map((ok, n) => (
      <span key={n} role="cell" className={(n === 2 ? "us " : "") + (ok ? "yes" : "no")} aria-label={ok ? "Yes" : "No"}>
        {ok ? "✓" : "—"}
      </span>
    ))}
  </div>
);

export default async function Home() {
  const [reviews, made] = await Promise.all([heroReviews(), madeThisMonth()]);
  // What search engines and AI assistants read about the site: who runs it, what it is, and the FAQ below.
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      url: SITE_URL,
      logo: SITE_URL + "/brand/mangalam-logo.png",
      ...(LEGAL.email ? { email: LEGAL.email } : {}),
      areaServed: "IN",
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: BRAND, url: SITE_URL, inLanguage: "en-IN" },
    faqJsonLd(faqItems()),
  ];
  return (
    <div className="site">
      <JsonLd data={ld} />
      <AdSense />
      <SiteHeader />
      <Hero reviews={reviews} made={made} />

      {/* ---------- what you get, in numbers that are true today (one row on phones) ---------- */}
      <section className="proof" aria-label="At a glance">
        <div>
          <b>{DESIGNS.length}</b>
          <span>animated designs</span>
        </div>
        <div>
          <b>{CATEGORIES.length}</b>
          <span>
            functions<span className="desk-txt">, haldi to reception</span>
          </span>
        </div>
        <div>
          <b>{COMMUNITIES.length}</b>
          <span>
            traditions<span className="desk-txt">&nbsp;and styles</span>
          </span>
        </div>
        <div>
          <b>1</b>
          <span>link for every guest</span>
        </div>
      </section>

      {/* ---------- the designs, playing, by function, right after the hero ---------- */}
      <section className="sec" id="templates">
        <SectionHead label="Designs" center>
          Which function are you <em>inviting for?</em>
        </SectionHead>
        <p className="sec-lead centered">Open a design to see it big, with your names. Every one takes your dates, venue, photos and music.</p>
        <Showcase />
      </section>

      {/* ---------- try it: the guest page's moments, playable (components/site/GuestDemo.tsx) ---------- */}
      <section className="sec surface" id="guests">
        <SectionHead label="Try it yourself" center>
          Not just a video. <em>An invite guests play with.</em>
        </SectionHead>
        <p className="sec-lead centered">Tap through what your guests will do when they open your link. Every moment can be switched off.</p>
        <GuestDemo />
      </section>

      {/* ---------- one link, and who's coming ---------- */}
      <section className="sec">
        <div className="guests">
          <div>
            <SectionHead label="Your invitation page">
              One link. <em>Know who&apos;s coming.</em>
            </SectionHead>
            <ul className="points">
              <li>
                <b>Your names in the address.</b> Every invitation gets a page like <u>{HOST}/e/aarav-ananya</u>, with a preview card in the chat.
              </li>
              <li>
                <b>Opens anywhere.</b> From WhatsApp, SMS or email, in any browser, upright on phones and wide on the TV. No app for Dadi.
              </li>
              <li>
                <b>RSVPs on your WhatsApp.</b> Guests say if they&apos;re coming, how many and for which functions. With the RSVP form, your invite keeps the count.
              </li>
              <li>
                <b>Calendar and directions.</b> One tap adds each function to their calendar and opens the way to the venue.
              </li>
            </ul>
            <CtaLink href="/templates" section="link" className="cta-btn">
              Choose your design <Arrow />
            </CtaLink>
          </div>
          <div className="wa-demo">
            <div className="wa-phone">
              <div className="wa-top">
                <span className="wa-av">👪</span>
                <div>
                  <b>Sharma Family 🏡</b>
                  <small>Mummy, Papa, Dadi, +38</small>
                </div>
              </div>
              <div className="wa-chat">
                <span className="wa-day">Today</span>
                <div className="wa-bubble">
                  <div className="wa-card">
                    <div className="wa-art">
                      <span>The wedding of</span>
                      <b>Aarav &amp; Ananya</b>
                      <small>Tuesday, 8 December 2026</small>
                    </div>
                    <div className="t">Aarav &amp; Ananya</div>
                    <div className="d">Tap to open the invitation</div>
                    <div className="h">{HOST}</div>
                  </div>
                  <div className="wa-msg">
                    Please join us 🙏 <span>{HOST}/e/aarav-ananya</span>
                  </div>
                  <div className="wa-time">21:14 ✓✓</div>
                </div>
              </div>
            </div>
            <div className="rsvp-eg" aria-label="Example of an invite's RSVP counts">
              <span className="rsvp-eg-head">
                Your RSVPs <em>example</em>
              </span>
              <div>
                <b>18</b>
                <small>attending</small>
              </div>
              <div>
                <b>46</b>
                <small>people</small>
              </div>
              <div>
                <b>3</b>
                <small>maybe</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="sec surface" id="how">
        <SectionHead label="How it works" center>
          Ready to send in <em>about two minutes.</em>
        </SectionHead>
        <div className="steps">
          <article className="step">
            <div className="step-vis">
              <DesignStack />
            </div>
            <span className="step-n">1</span>
            <h3>Choose a design</h3>
            <p>Made for Hindu, South Indian, Muslim, Sikh and modern weddings, and for every function around them.</p>
          </article>
          <article className="step">
            <div className="step-vis">
              <div className="mini-form">
                <label>
                  <span>Bride</span>
                  <b>Ananya</b>
                </label>
                <label>
                  <span>Groom</span>
                  <b>Aarav</b>
                </label>
                <label>
                  <span>Date</span>
                  <b>8 Dec 2026</b>
                </label>
                <label>
                  <span>Venue</span>
                  <b>Rambagh Palace, Jaipur</b>
                </label>
              </div>
            </div>
            <span className="step-n">2</span>
            <h3>Add your details</h3>
            <p>Names, dates, venue, photos and music in one short form. The preview plays as you type.</p>
          </article>
          <article className="step">
            <div className="step-vis">
              <div className="mini-share">
                <div className="mini-bubble">
                  <div className="mini-card">
                    <i />
                    <b>Aarav &amp; Ananya</b>
                    <small>Tap to open the invitation</small>
                  </div>
                  <span>
                    You&apos;re invited! 🌸 <u>{HOST}/e/aarav-ananya</u>
                  </span>
                  <em>21:14 ✓✓</em>
                </div>
              </div>
            </div>
            <span className="step-n">3</span>
            <h3>Send one link</h3>
            <p>Post it in the family group. Guests tap and the invitation plays in their browser, with your music.</p>
          </article>
        </div>
        <div className="sec-cta">
          <CtaLink href="/templates" section="how" className="cta-btn lg">
            Choose your design <Arrow />
          </CtaLink>
        </div>
      </section>

      {/* ---------- why a link ---------- */}
      <section className="sec surface" id="compare">
        <SectionHead label="Why a link" center>
          More than a card. <em>Less than a courier.</em>
        </SectionHead>
        <div className="compare" role="table" aria-label="Invitation link compared with a printed card and an image or PDF">
          <div className="cmp-row cmp-head" role="row">
            <span role="columnheader" />
            <span role="columnheader">Printed card</span>
            <span role="columnheader">Image or PDF</span>
            <span role="columnheader" className="us">
              {BRAND} link
            </span>
          </div>
          {COMPARE.slice(0, 4).map(cmpRow)}
          <details className="cmp-more">
            <summary>{COMPARE.length - 4} more differences</summary>
            {COMPARE.slice(4).map(cmpRow)}
          </details>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section className="sec" id="pricing">
        <SectionHead label="Pricing" center>
          {PAYMENTS ? (
            <>
              Free to make. <em>From ₹{PRICE_MIN}</em> to make it yours.
            </>
          ) : (
            <>
              Free to make, <em>free</em> to share.
            </>
          )}
        </SectionHead>
        <p className="sec-lead centered">
          {PAYMENTS
            ? "Try every design with your own details for as long as you like. Pay once, only when you're happy with it." + (FREE_COUNT ? " " + FREE_COUNT + " designs are free, with no watermark at all." : "")
            : "Every design, your own details, one link for all your guests."}
        </p>
        <div className={"price-grid" + (PAYMENTS ? "" : " one")}>
          <div className="price-card">
            <span className="kicker">Preview</span>
            <div className="price-num">Free</div>
            <p>Your full invitation with your details, shared as a link.</p>
            <ul>
              <li>Every design and colour palette</li>
              <li>Names, dates, photos and music</li>
              <li>Share link for WhatsApp</li>
              {PAYMENTS ? <li className="minus">Watermark on the invitation{FREE_COUNT ? " (none on the free designs)" : ""}</li> : null}
            </ul>
            <CtaLink href="/templates" section="pricing" className="ghost-btn block">
              Start free
            </CtaLink>
          </div>
          {PAYMENTS ? (
            <div className="price-card best">
              <span className="best-tag">One-time · per invitation</span>
              <span className="kicker">Premium</span>
              <div className="price-num">
                <small>from</small> ₹{PRICE_MIN}
              </div>
              <p>
                {PRICE_RANGE} by design; each design shows its price. The watermark comes off the same link, instantly. Guests keep the link they
                already have.
              </p>
              <ul>
                <li>No watermark, for every guest</li>
                <li>Same link, nothing to resend</li>
                <li>UPI, cards and net banking</li>
                <li>No subscription, no hidden charges</li>
              </ul>
              <CtaLink href="/templates" section="pricing" className="cta-btn block">
                Choose a design <Arrow />
              </CtaLink>
              <div className="price-pay">
                <PayIcons size={18} />
              </div>
            </div>
          ) : null}
          {PAYMENTS ? (
            <div className="price-card">
              <span className="kicker">Wedding pack</span>
              <div className="price-num">₹{PACK_PRICE_INR}</div>
              <p>One payment for every function&apos;s invite: engagement, haldi, mehendi, sangeet, wedding and reception.</p>
              <ul>
                <li>No watermark on any of them</li>
                <li>Each function on a link of its own</li>
                <li>Your names carry over to every invite</li>
                <li>Buy it from any of your invites</li>
              </ul>
              <CtaLink href="/invitations/wedding" section="pricing_pack" className="ghost-btn block">
                Start with your wedding invite
              </CtaLink>
            </div>
          ) : null}
        </div>
        {PAYMENTS ? (
          <p className="price-note">
            The pack covers the invites you make on the same phone for the same couple. Shaadi Utsav and Cinematic Reel need only the difference.
          </p>
        ) : null}
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="sec surface" id="faq">
        <SectionHead label="Questions" center>
          Good questions, <em>straight answers.</em>
        </SectionHead>
        <Faq items={faqItems()} />
      </section>

      {/* ---------- final call ---------- */}
      <section className="final">
        <span className="kicker">Free preview · ready in minutes</span>
        <h2>
          Your guests are waiting <em>for the invite.</em>
        </h2>
        <CtaLink href="/templates" section="final" className="cta-btn lg">
          Make my invitation <Arrow />
        </CtaLink>
      </section>

      <SiteFooter />
      {/* room for the hero's pinned "Make my invitation" bar on phones */}
      <div className="m-cta-space" aria-hidden />
    </div>
  );
}
