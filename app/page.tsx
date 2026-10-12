import type { Metadata } from "next";
import Link from "next/link";
import { PayIcons } from "@/components/PayIcons";
import { Faq, SectionHead, faqItems } from "@/components/site/Faq";
import { DesignStack, HeroReel, Showcase } from "@/components/site/Landing";
import { MobileCta } from "@/components/site/MobileCta";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

const HOST = SITE_URL.replace(/^https?:\/\//, "");

export const metadata: Metadata = {
  title: BRAND + " · Create your wedding invitation and invitation page",
  description:
    "Create an animated wedding invitation with its own web page. Preview it free with your names, date and venue, then share one link on WhatsApp.",
};

export default function Home() {
  return (
    <div className="site">
      <SiteHeader />

      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="hero-copy">
          <span className="mono-label">Animated invitations · Invitation pages</span>
          <h1>
            Create your invitation.
            <br />
            <em>Share it in one link.</em>
          </h1>
          <p className="lead">
            Choose a design, add your names, date and venue, and preview your animated invitation free. It comes with its own invitation page
            that opens on any phone, ready to send to every guest on WhatsApp.
            {PAYMENTS ? " Remove the watermark for ₹" + LINK_PRICE_INR + " once you are happy with it." : ""}
          </p>
          <div className="hero-ctas">
            <Link href="/templates" className="cta-btn lg">
              Create your invitation →
            </Link>
            <Link href="#how" className="ghost-btn lg">
              How it works
            </Link>
          </div>
          <p className="hero-note">
            <span>✓ Free preview</span>
            <span>✓ Your own invitation page</span>
            <span>✓ No app for guests</span>
          </p>
          <dl className="hero-facts">
            <div>
              <dt>Preview</dt>
              <dd>Free</dd>
            </div>
            <div>
              <dt>Invitation page</dt>
              <dd>Included</dd>
            </div>
            <div>
              <dt>Ready in</dt>
              <dd>Minutes</dd>
            </div>
          </dl>
        </div>
        <HeroReel />
      </section>

      {/* ---------- ticker of functions ---------- */}
      <div className="ticker" aria-hidden>
        <div className="ticker-run">
          {[0, 1].map((k) => (
            <span key={k}>
              {CATEGORIES.map((c) => (
                <span key={c.id}>
                  {c.label} <b lang="hi">{c.local}</b> ✦{" "}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- how it works ---------- */}
      <section className="sec surface" id="how">
        <SectionHead n="02" label="How it works">
          Three steps. <em>One link.</em>
        </SectionHead>
        <div className="steps">
          <article className="step">
            <div className="step-vis">
              <DesignStack />
            </div>
            <span className="step-n">01</span>
            <h3>Choose a design</h3>
            <p>Handmade for Hindu, South Indian, Muslim, Sikh and modern weddings, and for every function around them.</p>
          </article>
          <article className="step">
            <div className="step-vis">
              <div className="mini-form">
                <label>
                  <span className="mono-label">Bride</span>
                  <b>Ananya</b>
                </label>
                <label>
                  <span className="mono-label">Groom</span>
                  <b>Aarav</b>
                </label>
                <label>
                  <span className="mono-label">Date</span>
                  <b>8 Dec 2026</b>
                </label>
                <label>
                  <span className="mono-label">Venue</span>
                  <b>Rambagh Palace, Jaipur</b>
                </label>
                <span className="mini-btn">Preview →</span>
              </div>
            </div>
            <span className="step-n">02</span>
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
                <div className="mini-chan">
                  <span className="mono-label">Share via</span>
                  <b>WhatsApp</b>
                  <b>Link</b>
                </div>
              </div>
            </div>
            <span className="step-n">03</span>
            <h3>Watch &amp; share</h3>
            <p>Send one link to the family group. Guests tap it and the invitation plays in their browser. No app needed.</p>
          </article>
        </div>
      </section>

      {/* ---------- templates ---------- */}
      <section className="sec" id="templates">
        <SectionHead n="03" label="Templates">
          Designs you&apos;d <em>actually</em> send.
        </SectionHead>
        <Showcase />
      </section>

      {/* ---------- what guests get ---------- */}
      <section className="sec surface">
        <div className="guests">
          <div>
            <SectionHead n="04" label="Your invitation page">
              A page of <em>your own.</em>
            </SectionHead>
            <ol className="points">
              <li>
                <b>Your names in the address.</b> Every invitation gets a page like <u>{HOST}/e/aarav-ananya</u>, with a preview card when it is
                shared.
              </li>
              <li>
                <b>Opens anywhere.</b> From WhatsApp, SMS, email or Instagram, in any browser. No app and no download.
              </li>
              <li>
                <b>Fits the screen.</b> Upright on phones, widescreen on laptops and the living-room TV.
              </li>
              <li>
                <b>Every function.</b> The All Functions design puts haldi, mehendi, sangeet, pheras and reception in one invitation, each with its date and venue.
              </li>
              <li>
                <b>Your music and photos.</b> Add a song and your favourite pictures; we handle the timing.
              </li>
            </ol>
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

      {/* ---------- pricing ---------- */}
      <section className="sec" id="pricing">
        <SectionHead n="05" label="Pricing">
          {PAYMENTS ? (
            <>
              Free to make. <em>Pay</em> only to keep it clean.
            </>
          ) : (
            <>
              Free to make, <em>free</em> to share.
            </>
          )}
        </SectionHead>
        <p className="sec-lead">
          {PAYMENTS
            ? "Try every design with your own details for as long as you like. Upgrade a link when you're happy with it."
            : "Every design, your own details, one link for all your guests."}
        </p>
        <div className={"price-grid" + (PAYMENTS ? "" : " one")}>
          <div className="price-card">
            <span className="mono-label">Preview</span>
            <div className="price-num">Free</div>
            <p>Your full invitation with your details, shared as a link.</p>
            <ul>
              <li>Every design and colour palette</li>
              <li>Names, dates, photos and music</li>
              <li>Share link for WhatsApp</li>
              {PAYMENTS ? <li className="minus">Watermark on the invitation</li> : null}
            </ul>
            <Link href="/templates" className="ghost-btn block">
              Browse designs
            </Link>
          </div>
          {PAYMENTS ? (
            <div className="price-card dark">
              <span className="mono-label">Premium · per invitation</span>
              <div className="price-num">₹{LINK_PRICE_INR}</div>
              <p>One payment. The watermark comes off the same link, instantly.</p>
              <ul>
                <li>No watermark</li>
                <li>Guests keep the link they already have</li>
                <li>UPI, cards and net banking</li>
                <li>No subscription</li>
              </ul>
              <Link href="/templates" className="cta-btn block">
                Choose a design →
              </Link>
              <div className="price-pay">
                <PayIcons size={18} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="sec surface" id="faq">
        <SectionHead n="06" label="Asked & answered">
          Questions, <em>answered.</em>
        </SectionHead>
        <Faq items={faqItems()} />
      </section>

      {/* ---------- final call ---------- */}
      <section className="final">
        <span className="mono-label">Free to preview · ready in minutes</span>
        <h2>
          Create your invitation <em>today.</em>
        </h2>
        <Link href="/templates" className="cta-btn lg">
          Create your invitation →
        </Link>
      </section>

      <SiteFooter />
      {/* Phones: "Create" stays in thumb reach while none of the page's own buttons are on screen. */}
      <MobileCta href="/templates" label="Create your invitation →" note="Free preview" watch=".hero-ctas, .price-card .ghost-btn, .final .cta-btn" />
    </div>
  );
}
