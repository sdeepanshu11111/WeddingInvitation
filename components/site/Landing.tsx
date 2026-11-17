"use client";
import Link from "next/link";
import { functionPath, statePath } from "@/lib/landing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline, useNearViewport } from "@/components/LivePreview";
import { CATEGORIES, countIn } from "@/lib/catalog";
import { PAYMENTS } from "@/lib/features";
import { priceOf } from "@/lib/pricing";
import { sceneForField } from "@/lib/fieldScene";
import { SIZES, type StartNames } from "@/lib/project";
import { REGIONS, forRegion } from "@/lib/regions";
import { DESIGNS, TEMPLATES } from "@/lib/templates";
import type { CategoryId, TemplateDef } from "@/lib/types";
import type { ReviewSummary } from "@/lib/server/reviews";
import { HeroReviews, SHOW_AVERAGE_FROM } from "./HeroReviews";
import { MobileCta } from "./MobileCta";
import { NamesForm, useStartNames } from "./NamesForm";
import { useRegion } from "./StatePicker";
import { TemplateCard } from "./TemplateCard";
import { track, type Events } from "@/lib/analytics";

/** The hero's designs, one per tradition, in the order they play. When the visitor's state is known (lib/regions.ts:
    ?state= from an ad, their earlier pick, the phone's language or the connection), that state's own design leads. */
const HERO_IDS = ["royal-mandala", "south-kalyanam", "nikah-mubarak", "anand-karaj", "haldi-marigold", "sangeet-night"];
const HOLD_MS = 2600; // after a keystroke the preview stays on the names scene this long, then plays on

/**
 * Home hero: the visitor types their names and watches them appear in a real, playing invitation, then carries them
 * (and the design) into the studio. Until they pick a design or type, the designs play one after another.
 */
/** Below this, "N invitations made" is not shown: a small number reads as a warning, not as proof. */
const SHOW_MADE_FROM = 20;

export function Hero({ reviews, made = 0 }: { reviews?: ReviewSummary; made?: number }) {
  const { region } = useRegion();
  const list = useMemo(() => {
    const first = region?.designs[0];
    const ids = first ? [first, ...HERO_IDS.filter((id) => id !== first)].slice(0, HERO_IDS.length) : HERO_IDS;
    return ids.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as TemplateDef[];
  }, [region]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(false); // picked a design or typed: stop cycling through designs
  const [mounted, setMounted] = useState(false);
  const { names, set, edited } = useStartNames();
  useEffect(() => setMounted(true), []);
  const t = list[i % list.length];
  const p = t.palettes[0];
  const typed = !!(names.bride.trim() || names.groom.trim());
  // The design travels to the studio only once the visitor chose it (picked a card or typed their names over it).
  // While the hero is still cycling by itself, the button must not turn "whatever was playing" into a choice: that
  // opened the studio on a design nobody picked and switched a returning visitor's saved draft to it.
  const create = chosen ? "/create?template=" + t.id : "/create";

  // Grid areas, so phones and desktop can order the same parts differently (site.css, .hero):
  // desktop = copy, names, designs, button on the left and the playing phone on the right;
  // phones  = headline, then the phone and the name boxes SIDE BY SIDE (both stay visible above the keyboard while
  //           typing), then the design cards and the button (pinned to the bottom once it scrolls away).
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker">Free preview · Send on WhatsApp</span>
        <h1>
          Your wedding invite, <em>beautifully animated.</em>
        </h1>
        {/* The real average (lib/server/reviews.ts), only from 5 rated reviews; the quotes are under the button. */}
        {reviews?.average && reviews.count >= SHOW_AVERAGE_FROM ? (
          <p className="hero-rating">
            <span className="hr-stars" aria-hidden>
              {"★".repeat(Math.round(reviews.average))}
              <i>{"★".repeat(5 - Math.round(reviews.average))}</i>
            </span>{" "}
            <b>{reviews.average.toFixed(1)}</b> from {reviews.count} couples who made their invite here
          </p>
        ) : null}
        <p className="lead">
          Your names, dates, photos and music on a page of its own that plays like a film. Send one link; it opens on any phone, no app needed.
        </p>
      </div>

      <div className="hero-stage">
        <div className="phone-frame hero-phone">
          <div className="phone-screen" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
            {/* Until the script arrives (seconds on a slow phone), the design's own art instead of an empty screen. */}
            {mounted ? (
              <HeroPlayer key={t.id} t={t} names={names} edited={edited} onEnd={chosen ? undefined : () => setI((n) => n + 1)} />
            ) : (
              <div className="hero-still">{t.thumb(p)}</div>
            )}
            <div className="phone-island" aria-hidden />
          </div>
        </div>
      </div>

      <div className="try-card">
        <div className="try-head">
          <b>{typed ? "That's your invite" : "Try it with your names"}</b>
          <span>{typed ? "Playing now, with your names" : "Free · watch them appear"}</span>
        </div>
        <NamesForm
          names={names}
          set={(x) => {
            set(x);
            setChosen(true);
          }}
          id="hero"
        />
      </div>

      <div className="hero-go">
        <Link href={create} className="cta-btn lg block hero-cta">
          {typed ? "Continue with my invite" : "Make my invitation"} <Arrow />
        </Link>
        <ul className="ticks-row">
          <li>Free preview</li>
          <li>No sign-up</li>
          <li>Ready in 2 minutes</li>
        </ul>
        {PAYMENTS ? (
          <p className="hero-price">
            {priceOf(t.id) ? (
              <>
                Like it? Remove the watermark for <b>₹{priceOf(t.id)}</b>, one time. No subscription.
              </>
            ) : (
              <>
                This design is <b>free</b>: no watermark, nothing to pay.
              </>
            )}
          </p>
        ) : null}
        {/* Real numbers only: invitations made in the last 30 days (link records, test links left out), from 20 up. */}
        {made >= SHOW_MADE_FROM ? (
          <p className="hero-made">
            <b>{made}</b> invitations made here in the last 30 days
          </p>
        ) : null}
        {/* Real reviews only (app/admin/reviews); renders nothing until one is approved. */}
        {reviews ? <HeroReviews data={reviews} /> : null}
      </div>

      {/* The designs as real cards (each template's own thumbnail art), the playing one marked, and a way to all of them. */}
      <div className="hero-picks">
        <div className="picks-head">
          <b>Pick a design</b>
          <Link href="/templates">
            See all {DESIGNS.length} <Arrow />
          </Link>
        </div>
        <div className="picks-row" role="radiogroup" aria-label="Design">
          {list.map((x, n) => {
            const on = n === i % list.length;
            // Keyed by position: when the visitor's state reorders the list after mounting, moving the buttons would
            // make the browser re-snap this scroll-snap row to the card it was on and hide the new first card.
            return (
              <button
                key={n}
                role="radio"
                aria-checked={on}
                className={"pick" + (on ? " on" : "")}
                onClick={() => {
                  setI(n);
                  setChosen(true);
                }}
              >
                <span className="pick-thumb">
                  {x.thumb(x.palettes[0])}
                  {on ? <span className="pick-live">▶ Playing</span> : null}
                </span>
                <span className="pick-name">{x.name}</span>
              </button>
            );
          })}
          <Link href="/templates" className="pick more">
            <span className="pick-thumb">+{DESIGNS.length - list.length}</span>
            <span className="pick-name">More designs</span>
          </Link>
        </div>
      </div>

      {/* Phones: "Make my invitation" stays in thumb reach once the hero's own button scrolls away. */}
      <MobileCta href={create} label={typed ? "Continue with my invite →" : "Make my invitation →"} note="Free preview" watch=".hero-cta, .final .cta-btn, .price-card .cta-btn, .price-card .ghost-btn, .sec-cta .cta-btn" spacer={false} />
    </section>
  );
}

/**
 * The hero's invitation. It opens on the names scene, so the first thing a visitor sees is a couple's names written
 * out in the design (their own once they type), not a slow intro; holds there while they type, plays on, then moves
 * to the next design (or loops from the very start once a design is chosen).
 */
function HeroPlayer({ t, names, edited, onEnd }: { t: TemplateDef; names: StartNames; edited: number; onEnd?: () => void }) {
  const { project, tl, poster } = useDemoTimeline(t, "vertical", undefined, names);
  const at = sceneForField("brideName", tl.scenes);
  const opening = at < 0 ? poster : tl.slots[at].start;
  const [T, setT] = useState(opening);
  // Refs: typing changes the timeline every keystroke, and the clock must keep running through that.
  const live = useRef({ tl, edited, onEnd, namesAt: -1 });
  live.current = { tl, edited, onEnd, namesAt: at < 0 ? -1 : tl.slots[at].start + tl.scenes[at].duration * 0.6 };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let pos = opening;
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const { tl, edited, onEnd, namesAt } = live.current;
      if (edited && now - edited < HOLD_MS && namesAt >= 0) pos = namesAt;
      else pos += dt;
      if (pos >= tl.total + 700) {
        if (onEnd) return onEnd(); // the next design
        pos = 0;
      }
      setT(Math.min(pos, tl.total));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { W, H } = SIZES.vertical;
  return (
    <>
      <Stage W={W} H={H}>
        <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} playing />
      </Stage>
      <span className="live-tag">
        <i className="rec" /> {t.name}
      </span>
      <div className="reel-bar">
        <i style={{ width: (T / tl.total) * 100 + "%" }} />
      </div>
    </>
  );
}

/** Home "Which function?" section: function tabs + the first eight matching cards (six on phones, see site.css),
    the visitor's state's designs first when it is known. Cards open the design's own page, with the visitor's names.
    Below: one link per state's language (/wedding-invitations/<state>), for visitors and for search engines. */
export function Showcase() {
  const tabs = (["all", ...CATEGORIES.map((c) => c.id)] as (CategoryId | "all")[]).filter((id) => countIn(DESIGNS, id) > 0);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const { region, picked } = useRegion();
  const { own, rest } = forRegion(
    TEMPLATES.filter((t) => cat === "all" || t.categories.includes(cat)),
    region,
    picked,
  );
  const list = [...own, ...rest].slice(0, 8);
  return (
    <>
      <div className="tabs" role="tablist">
        {tabs.map((id) => (
          <button key={id} role="tab" aria-selected={cat === id} className={"tab" + (cat === id ? " on" : "")} onClick={() => setCat(id)}>
            {id === "all" ? "All" : CATEGORIES.find((c) => c.id === id)!.label}
          </button>
        ))}
      </div>
      <div className="t-grid four">
        {list.map((t) => (
          <TemplateCard key={t.id} t={t} />
        ))}
      </div>
      <div className="showcase-foot">
        <Link href={cat === "all" ? "/templates" : functionPath(cat)} className="ghost-btn" onClick={() => track("home_cta_clicked", { section: "designs" })}>
          See all {countIn(DESIGNS, cat)} {cat === "all" ? "designs" : CATEGORIES.find((c) => c.id === cat)!.label.toLowerCase() + " designs"} <Arrow />
        </Link>
      </div>
      {/* prefetch off: eight dynamic pages would each cost a server call the moment this row scrolls into view. */}
      <nav className="lang-links" aria-label="Wedding invitations by language">
        <span className="mono-label">Wedding invitations in your language</span>
        <div className="lang-row">
          {(region ? [region, ...REGIONS.filter((r) => r.id !== region.id)] : REGIONS).map((r) => (
            <Link key={r.id} href={statePath(r.id)} prefetch={false} className="chip-o">
              {r.language}
              <small lang={r.lang}>{r.native}</small>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

/** Step 1's visual: the design list, sliding in. */
export function DesignStack() {
  const [ref, seen] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} className={"mini-stack" + (seen ? " in" : "")}>
      <div className="mini-head">
        <span>Designs</span>
        <b>{DESIGNS.length}</b>
      </div>
      {DESIGNS.slice(0, 5).map((t, n) => (
        <div key={t.id} className="mini-row" style={{ transitionDelay: n * 70 + "ms" }}>
          <i style={{ background: "linear-gradient(135deg, " + t.palettes[0].bg + ", " + t.palettes[0].accent + ")" }} />
          {t.name}
        </div>
      ))}
    </div>
  );
}

export function Arrow() {
  return (
    <svg className="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}


/** A home page call to action that reports which section it was in (`home_cta_clicked`), for the server-rendered page. */
export function CtaLink({ href, section, className, children }: { href: string; section: Events["home_cta_clicked"]["section"]; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => track("home_cta_clicked", { section })}>
      {children}
    </Link>
  );
}
