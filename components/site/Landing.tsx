"use client";
import Link from "next/link";
import { functionPath, statePath } from "@/lib/landing";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline, useNearViewport } from "@/components/LivePreview";
import { CATEGORIES, countIn } from "@/lib/catalog";
import { PAYMENTS } from "@/lib/features";
import { PRICE_MIN } from "@/lib/pricing";
import { PayIcons } from "@/components/PayIcons";
import { momentGlyphs, momentKind } from "@/app/e/[slug]/Interactive";
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

/** The hero's wedding designs, one per tradition, in the order they play. When the visitor's state is known
    (lib/regions.ts: ?state= from an ad, their earlier pick, the phone's language or the connection), that state's own
    design leads. The other functions list their own designs, the state's first (forRegion). */
const HERO_IDS = ["royal-mandala", "south-kalyanam", "nikah-mubarak", "anand-karaj", "rajwada-palace", "holy-matrimony"];
const HERO_FNS: CategoryId[] = ["wedding", "haldi", "mehendi", "sangeet", "engagement", "reception"];
const HOLD_MS = 2600; // after a keystroke the preview stays on the names scene this long, then plays on

/** Below this, "N invitations made" is not shown: a small number reads as a warning, not as proof. */
const SHOW_MADE_FROM = 20;

/**
 * Home hero (redesigned 2026-11-17 for conversion). Phones see, on the first screen: the promise ("Wedding invites
 * your guests can play with"), "What are you inviting for?" chips, a real playing invite next to two name boxes,
 * and the button. Search visitors usually come for one function (a haldi invite, a sangeet invite), so the chips
 * switch the playing phone and the design row to that function. Typing names puts them into the playing design and
 * carries them to the studio; tapping the phone showers flowers over it (the guest page's tap moment, in miniature).
 * Every step is measured: hero_function_picked, hero_names_typed, hero_design_picked, hero_phone_tapped and
 * home_cta_clicked {section: "hero"}.
 */
export function Hero({ reviews, made = 0 }: { reviews?: ReviewSummary; made?: number }) {
  const { region, picked } = useRegion();
  const fns = useMemo(() => HERO_FNS.filter((c) => countIn(DESIGNS, c) > 0), []);
  const [fn, setFn] = useState<CategoryId>("wedding");
  const [fnPicked, setFnPicked] = useState(false);
  const list = useMemo(() => {
    if (fn === "wedding") {
      const first = region?.designs[0];
      const ids = first ? [first, ...HERO_IDS.filter((id) => id !== first)].slice(0, HERO_IDS.length) : HERO_IDS;
      return ids.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as TemplateDef[];
    }
    const { own, rest } = forRegion(
      TEMPLATES.filter((t) => t.categories.includes(fn)),
      region,
      picked,
    );
    return [...own, ...rest].slice(0, 6);
  }, [region, picked, fn]);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(false); // picked a design or typed: stop cycling through designs
  // The live invite starts once the page has loaded and the phone is idle, or at once on any interaction. Until then
  // the design's poster (public/posters, the same names scene it opens on) is the picture: the page's largest image
  // arrives in ~10 KB instead of after the script, the template and its fonts (owner, 2026-11-18: home was slow).
  const [live, setLive] = useState(false);
  const [posterBroken, setPosterBroken] = useState(false);
  const { names, set, edited } = useStartNames();
  const typedOnce = useRef(false);
  useEffect(() => {
    let done = false;
    const go = () => !done && ((done = true), setLive(true));
    const idle = () => {
      const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, o: { timeout: number }) => void);
      if (ric) ric(go, { timeout: 2500 });
      else setTimeout(go, 1200);
    };
    if (document.readyState === "complete") setTimeout(idle, 500);
    else window.addEventListener("load", () => setTimeout(idle, 500), { once: true });
    return () => {
      done = true;
    };
  }, []);
  // Typing names, a function chip or a design card: the visitor wants to see it move now.
  useEffect(() => {
    if (edited || chosen || fnPicked) setLive(true);
  }, [edited, chosen, fnPicked]);
  const t = list[i % list.length];
  const p = t.palettes[0];
  const typed = !!(names.bride.trim() || names.groom.trim());
  // The design travels to the studio only once the visitor chose it (picked a card, a function, or typed their names
  // over it). While the hero is still cycling through weddings by itself, the button must not turn "whatever was
  // playing" into a choice: that opened the studio on a design nobody picked and switched a returning visitor's saved
  // draft to it. A function chip is a choice: the visitor said what they are inviting for.
  const create = chosen || fnPicked ? "/create?template=" + t.id : "/create";
  const fnLabel = (c: CategoryId) => CATEGORIES.find((x) => x.id === c)!.label;
  const kicker = PAYMENTS ? "Free preview · from ₹" + PRICE_MIN + " · Send on WhatsApp" : "Free preview · Send on WhatsApp";

  // Grid areas, so phones and desktop can order the same parts differently (site.css, .hero):
  // desktop = copy, function chips, names, button, designs on the left and the playing phone on the right;
  // phones  = headline, chips, then the phone and the name boxes SIDE BY SIDE (both stay visible above the keyboard
  //           while typing), then the button (pinned to the bottom once it scrolls away) and the design cards.
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker">{kicker}</span>
        <h1>
          Wedding invites your guests can <em>play with.</em>
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
          Animated with your names, photos and music. Guests open one link, tap through it and RSVP on WhatsApp<span className="desk-txt">. No app, no printing</span>.
        </p>
      </div>

      <div className="hero-fns" role="tablist" aria-label="What are you inviting for?">
        <span className="hero-fns-q">What are you inviting for?</span>
        <div className="hero-fns-row">
          {fns.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={fn === c}
              className={"fn-chip" + (fn === c ? " on" : "")}
              onClick={() => {
                if (c === fn) return;
                setFn(c);
                setI(0);
                setFnPicked(true);
                track("hero_function_picked", { function: c });
              }}
            >
              {fnLabel(c)}
            </button>
          ))}
        </div>
      </div>

      <div className="hero-stage">
        <div className="phone-frame hero-phone">
          <div className="phone-screen" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
            {/* The poster first (server-rendered, high priority), the live invite over it once it starts; the design's own
                art if a poster is missing. */}
            {posterBroken ? (
              <div className="hero-still">{t.thumb(p)}</div>
            ) : (
              <img className="hero-poster" src={"/posters/" + t.id + ".webp"} alt="" decoding="async" draggable={false} onError={() => setPosterBroken(true)} {...{ fetchpriority: "high" }} />
            )}
            {live ? <HeroPlayer key={t.id} t={t} names={names} edited={edited} onEnd={chosen ? undefined : () => setI((n) => n + 1)} /> : null}
            {live ? <PhoneTap t={t} fn={fn} /> : null}
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
            if (!typedOnce.current) {
              typedOnce.current = true;
              track("hero_names_typed");
            }
          }}
          id="hero"
        />
      </div>

      <div className="hero-go">
        <Link href={create} className="cta-btn lg block hero-cta" onClick={() => track("home_cta_clicked", { section: "hero" })}>
          {typed ? "Continue with my invite" : "Make my invitation"} <Arrow />
        </Link>
        <ul className="ticks-row">
          <li>Free preview</li>
          <li>No sign-up</li>
          <li>Ready in 2 minutes</li>
        </ul>
        {PAYMENTS ? (
          <div className="hero-trust">
            <p className="hero-price">
              Free to make. Like it? Remove the watermark from <b>₹{PRICE_MIN}</b>, one time.
            </p>
            <PayIcons size={15} />
          </div>
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

      {/* The function's designs as real cards (each template's own thumbnail art), the playing one marked. */}
      <div className="hero-picks">
        <div className="picks-head">
          <b>{fn === "wedding" ? "Pick a design" : fnLabel(fn) + " designs"}</b>
          <Link href={fn === "wedding" ? "/templates" : functionPath(fn)}>
            See all {fn === "wedding" ? DESIGNS.length : countIn(DESIGNS, fn)} <Arrow />
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
                  track("hero_design_picked", { template_id: x.id, function: fn });
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
          <Link href={fn === "wedding" ? "/templates" : functionPath(fn)} className="pick more">
            <span className="pick-thumb">+</span>
            <span className="pick-name">More designs</span>
          </Link>
        </div>
      </div>

      {/* Phones: "Make my invitation" stays in thumb reach once the hero's own button scrolls away. */}
      <MobileCta
        href={create}
        label={typed ? "Continue with my invite →" : "Make my invitation →"}
        note="Free preview"
        watch=".hero-cta, .final .cta-btn, .price-card .cta-btn, .price-card .ghost-btn, .sec-cta .cta-btn"
        spacer={false}
        onClick={() => track("home_cta_clicked", { section: "hero" })}
      />
    </section>
  );
}

/** Tap the hero's playing invite: flowers (haldi, confetti… by function) burst where the finger lands, over the
    invite, which keeps playing. A hint shows until the first tap. CSS from the guest page's tap moment (.tm-burst). */
function PhoneTap({ t, fn }: { t: TemplateDef; fn: CategoryId }) {
  type Burst = { id: number; x: number; y: number; bits: { dx: number; dy: number; rot: number; size: number; glyph: string; delay: number }[] };
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [tapped, setTapped] = useState(false);
  const [hint, setHint] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setHint(true), 2600);
    return () => clearTimeout(id);
  }, []);
  const glyphs = momentGlyphs(momentKind(fn === "wedding" ? "" : fn, fn === "wedding" ? t.categories : [fn], t.communities));
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const bits = Array.from({ length: 10 }, (_, k) => {
      const a = (k / 10) * Math.PI * 2 + Math.random() * 0.5;
      const d = 40 + Math.random() * 60;
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d + 30, rot: (Math.random() - 0.5) * 540, size: 14 + Math.random() * 12, glyph: glyphs[k % glyphs.length], delay: Math.random() * 0.08 };
    });
    setBursts((b) => [...b.slice(-5), { id: Date.now() + Math.random(), x: e.clientX - r.left, y: e.clientY - r.top, bits }]);
    if (!tapped) {
      setTapped(true);
      track("hero_phone_tapped", { template_id: t.id });
    }
  };
  return (
    <div className="phone-tap" onPointerDown={tap} aria-label="Tap to shower flowers on the invite">
      {bursts.map((b) => (
        <div key={b.id} className="tm-burst" style={{ left: b.x, top: b.y }} aria-hidden>
          {b.bits.map((x, k) => (
            <span key={k} style={{ fontSize: x.size, animationDelay: x.delay + "s", ["--dx" as any]: x.dx + "px", ["--dy" as any]: x.dy + "px", ["--rot" as any]: x.rot + "deg" }}>
              {x.glyph}
            </span>
          ))}
        </div>
      ))}
      {hint && !tapped ? (
        <span className="phone-tap-hint" aria-hidden>
          <span className="tm-hand">👆</span> Tap it
        </span>
      ) : null}
    </div>
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
