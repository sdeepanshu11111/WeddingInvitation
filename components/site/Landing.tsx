"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline, useNearViewport } from "@/components/LivePreview";
import { CATEGORIES, countIn } from "@/lib/catalog";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { sceneForField } from "@/lib/fieldScene";
import { SIZES, type StartNames } from "@/lib/project";
import { TEMPLATES } from "@/lib/templates";
import type { CategoryId, TemplateDef } from "@/lib/types";
import { MobileCta } from "./MobileCta";
import { NamesForm, useStartNames } from "./NamesForm";
import { TemplateCard } from "./TemplateCard";

/** The hero's designs, one per tradition, in the order they play. */
const HERO_IDS = ["royal-mandala", "south-kalyanam", "nikah-mubarak", "anand-karaj", "haldi-marigold", "sangeet-night"];
const HOLD_MS = 2600; // after a keystroke the preview stays on the names scene this long, then plays on

/**
 * Home hero: the visitor types their names and watches them appear in a real, playing invitation, then carries them
 * (and the design) into the studio. Until they pick a design or type, the designs play one after another.
 */
export function Hero() {
  const list = useMemo(() => HERO_IDS.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as TemplateDef[], []);
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(false); // picked a design or typed: stop cycling through designs
  const [mounted, setMounted] = useState(false);
  const { names, set, edited } = useStartNames();
  useEffect(() => setMounted(true), []);
  const t = list[i % list.length];
  const p = t.palettes[0];
  const typed = !!(names.bride.trim() || names.groom.trim());
  const create = "/create?template=" + t.id;

  // Grid areas, so phones and desktop can order the same parts differently (site.css, .hero):
  // desktop = copy, names, designs, button on the left and the playing phone on the right;
  // phones  = headline, then the phone and the name boxes SIDE BY SIDE (both stay visible above the keyboard while
  //           typing), then the design cards and the button (pinned to the bottom once it scrolls away).
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="kicker">Free preview · Share on WhatsApp</span>
        <h1>
          Your wedding invite as an <em>animated website.</em>
        </h1>
        <p className="lead">
          Your names, dates, photos and music on a page of its own that plays like a film. Send one link; it opens on any phone, no app needed.
        </p>
      </div>

      <div className="hero-stage">
        <div className="phone-frame hero-phone">
          <div className="phone-screen" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
            {mounted ? (
              <HeroPlayer key={t.id} t={t} names={names} edited={edited} onEnd={chosen ? undefined : () => setI((n) => n + 1)} />
            ) : null}
            <div className="phone-island" aria-hidden />
          </div>
        </div>
      </div>

      <div className="try-card">
        <div className="try-head">
          <b>{typed ? "That's your invite" : "Try it with your names"}</b>
          <span>{typed ? "Playing now, with your names" : "Free · they appear in the invite"}</span>
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
          <li>Ready in 2 minutes</li>
          <li>No app for guests</li>
        </ul>
        {PAYMENTS ? (
          <p className="hero-price">
            Like it? Remove the watermark for <b>₹{LINK_PRICE_INR}</b>, one time. No subscription.
          </p>
        ) : null}
      </div>

      {/* The designs as real cards (each template's own thumbnail art), the playing one marked, and a way to all of them. */}
      <div className="hero-picks">
        <div className="picks-head">
          <b>Pick a design</b>
          <Link href="/templates">
            See all {TEMPLATES.length} <Arrow />
          </Link>
        </div>
        <div className="picks-row" role="radiogroup" aria-label="Design">
          {list.map((x, n) => {
            const on = n === i % list.length;
            return (
              <button
                key={x.id}
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
            <span className="pick-thumb">+{TEMPLATES.length - list.length}</span>
            <span className="pick-name">More designs</span>
          </Link>
        </div>
      </div>

      {/* Phones: "Make my invitation" stays in thumb reach once the hero's own button scrolls away. */}
      <MobileCta href={create} label="Make my invitation →" note="Free preview" watch=".hero-cta, .final .cta-btn, .price-card .cta-btn, .price-card .ghost-btn, .sec-cta .cta-btn" spacer={false} />
    </section>
  );
}

/** The hero's invitation: plays through, holds on the names scene while they type, then moves on (or loops once a design is chosen). */
function HeroPlayer({ t, names, edited, onEnd }: { t: TemplateDef; names: StartNames; edited: number; onEnd?: () => void }) {
  const { project, tl } = useDemoTimeline(t, "vertical", undefined, names);
  const [T, setT] = useState(0);
  // Refs: typing changes the timeline every keystroke, and the clock must keep running through that.
  const live = useRef({ tl, edited, onEnd, namesAt: -1 });
  const at = sceneForField("brideName", tl.scenes);
  live.current = { tl, edited, onEnd, namesAt: at < 0 ? -1 : tl.slots[at].start + tl.scenes[at].duration * 0.6 };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let pos = 0;
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

/** "Which function is it for?": every function with its Hindi name and how many designs it has. */
export function FunctionTiles() {
  return (
    <div className="fn-grid">
      {CATEGORIES.filter((c) => countIn(TEMPLATES, c.id) > 0).map((c) => {
        const t = TEMPLATES.find((x) => x.categories[0] === c.id) ?? TEMPLATES.find((x) => x.categories.includes(c.id))!;
        const p = t.palettes[0];
        return (
          <Link key={c.id} href={"/templates?category=" + c.id} className="fn-tile">
            <span className="fn-swatch" style={{ background: "linear-gradient(140deg, " + p.bg + " 10%, " + p.bg2 + " 60%, " + p.accent + ")" }}>
              <span lang="hi" style={{ color: p.ink }}>
                {c.local}
              </span>
            </span>
            <span className="fn-text">
              <b>{c.label}</b>
              <small>
                {countIn(TEMPLATES, c.id)} {countIn(TEMPLATES, c.id) === 1 ? "design" : "designs"}
              </small>
            </span>
            <Arrow />
          </Link>
        );
      })}
    </div>
  );
}

/** Home "Designs" section: function tabs + the first eight matching cards. */
export function Showcase() {
  const tabs = (["all", ...CATEGORIES.map((c) => c.id)] as (CategoryId | "all")[]).filter((id) => countIn(TEMPLATES, id) > 0);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const list = TEMPLATES.filter((t) => cat === "all" || t.categories.includes(cat)).slice(0, 8);
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
        <Link href={cat === "all" ? "/templates" : "/templates?category=" + cat} className="ghost-btn">
          See all {countIn(TEMPLATES, cat)} {cat === "all" ? "designs" : CATEGORIES.find((c) => c.id === cat)!.label.toLowerCase() + " designs"} <Arrow />
        </Link>
      </div>
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
        <b>{TEMPLATES.length}</b>
      </div>
      {TEMPLATES.slice(0, 5).map((t, n) => (
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

