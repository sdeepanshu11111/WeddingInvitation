import type { Metadata } from "next";
import Link from "next/link";
import { PayIcons } from "@/components/PayIcons";
import { Faq, SectionHead, faqItems } from "@/components/site/Faq";
import { Arrow, DesignStack, FunctionTiles, Hero, Showcase } from "@/components/site/Landing";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

const HOST = SITE_URL.replace(/^https?:\/\//, "");

export const metadata: Metadata = {
  title: BRAND + " · Animated wedding invitation website",
  description:
    "Turn your wedding invitation into an animated website with your names, dates, photos and music. Preview it free, then send one link on WhatsApp.",
};

export default function Home() {
  return (
    <div className="site">
      <SiteHeader />
      <Hero />

      {/* ---------- what you get, in numbers that are true today ---------- */}
      <section className="proof" aria-label="At a glance">
        <div>
          <b>{TEMPLATES.length}</b>
          <span>animated designs</span>
        </div>
        <div>
          <b>{CATEGORIES.length}</b>
          <span>functions, haldi to reception</span>
        </div>
        <div>
          <b>{COMMUNITIES.length}</b>
          <span>traditions and styles</span>
        </div>
        <div>
          <b>
            हिं · த · తె · ਪੰ · ع
          </b>
          <span>scripts where they belong</span>
        </div>
      </section>

      {/* ---------- start from the function ---------- */}
      <section className="sec" id="functions">
        <SectionHead label="Start here" center>
          Which function are you <em>inviting for?</em>
        </SectionHead>
        <FunctionTiles />
      </section>

      {/* ---------- how it works ---------- */}
      <section className="sec surface" id="how">
        <SectionHead label="How it works" center>
          Ready to send in <em>three steps.</em>
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
          <Link href="/templates" className="cta-btn lg">
            Choose your design <Arrow />
          </Link>
        </div>
      </section>

      {/* ---------- designs ---------- */}
      <section className="sec" id="templates">
        <SectionHead label="Designs" center>
          Find the one that <em>feels like you.</em>
        </SectionHead>
        <p className="sec-lead centered">Hover or tap any design to watch it play. Every one takes your names, dates, photos and music.</p>
        <Showcase />
      </section>

      {/* ---------- what guests get ---------- */}
      <section className="sec surface">
        <div className="guests">
          <div>
            <SectionHead label="Your invitation page">
              One link. <em>Every guest.</em>
            </SectionHead>
            <ul className="points">
              <li>
                <b>Your names in the address.</b> Every invitation gets a page like <u>{HOST}/e/aarav-ananya</u>, with a preview card in the chat.
              </li>
              <li>
                <b>Opens anywhere.</b> From WhatsApp, SMS, email or Instagram, in any browser. No app and no download for Dadi.
              </li>
              <li>
                <b>Fits every screen.</b> Upright on phones, widescreen on laptops and the living-room TV.
              </li>
              <li>
                <b>Every function in one.</b> Haldi, mehendi, sangeet, pheras and reception, each with its own date and venue.
              </li>
              <li>
                <b>Your music and photos.</b> Add a song and your favourite pictures; the timing is done for you.
              </li>
            </ul>
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
          </div>
        </div>
      </section>

      {/* ---------- why a link ---------- */}
      <section className="sec" id="compare">
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
          {(
            [
              ["Animation and music", false, false, true],
              ["Reaches guests the same minute", false, true, true],
              ["Every function, date and venue in one", true, true, true],
              ["Upright on phones, wide on the TV", false, false, true],
              ["Looks right without zooming", true, false, true],
              ["Nothing to print or post", false, true, true],
            ] as [string, boolean, boolean, boolean][]
          ).map(([label, ...v]) => (
            <div className="cmp-row" role="row" key={label}>
              <span role="rowheader">{label}</span>
              {v.map((ok, n) => (
                <span key={n} role="cell" className={(n === 2 ? "us " : "") + (ok ? "yes" : "no")} aria-label={ok ? "Yes" : "No"}>
                  {ok ? "✓" : "—"}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section className="sec surface" id="pricing">
        <SectionHead label="Pricing" center>
          {PAYMENTS ? (
            <>
              Free to make. <em>₹{LINK_PRICE_INR}</em> to make it yours.
            </>
          ) : (
            <>
              Free to make, <em>free</em> to share.
            </>
          )}
        </SectionHead>
        <p className="sec-lead centered">
          {PAYMENTS
            ? "Try every design with your own details for as long as you like. Pay once, only when you're happy with it."
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
              {PAYMENTS ? <li className="minus">Watermark on the invitation</li> : null}
            </ul>
            <Link href="/templates" className="ghost-btn block">
              Start free
            </Link>
          </div>
          {PAYMENTS ? (
            <div className="price-card best">
              <span className="best-tag">One-time · per invitation</span>
              <span className="kicker">Premium</span>
              <div className="price-num">₹{LINK_PRICE_INR}</div>
              <p>The watermark comes off the same link, instantly. Guests keep the link they already have.</p>
              <ul>
                <li>No watermark, for every guest</li>
                <li>Same link, nothing to resend</li>
                <li>UPI, cards and net banking</li>
                <li>No subscription, no hidden charges</li>
              </ul>
              <Link href="/templates" className="cta-btn block">
                Choose a design <Arrow />
              </Link>
              <div className="price-pay">
                <PayIcons size={18} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="sec" id="faq">
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
        <Link href="/templates" className="cta-btn lg">
          Make my invitation <Arrow />
        </Link>
      </section>

      <SiteFooter />
      {/* room for the hero's pinned "Make my invitation" bar on phones */}
      <div className="m-cta-space" aria-hidden />
    </div>
  );
}
