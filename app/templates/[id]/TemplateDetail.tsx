"use client";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline } from "@/components/LivePreview";
import { PalettePicker } from "@/components/PalettePicker";
import { PayIcons } from "@/components/PayIcons";
import { Arrow } from "@/components/site/Landing";
import { MobileCta } from "@/components/site/MobileCta";
import { NamesForm, useStartNames } from "@/components/site/NamesForm";
import { TemplateCard, templateKind } from "@/components/site/TemplateCard";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { fmt } from "@/lib/anim";
import { sceneForField } from "@/lib/fieldScene";
import { LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { SIZES, type StartNames } from "@/lib/project";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import type { Orientation, TemplateDef } from "@/lib/types";

const HOLD_MS = 2600; // after a keystroke the preview stays on the names scene this long

/** /templates/<id>: the design playing large, the visitor's names in it, colours, and "Customize" (sticky on phones). */
export function TemplateDetail({ id }: { id: string }) {
  const t = getTemplate(id);
  const [o, setO] = useState<Orientation>("vertical");
  const [pal, setPal] = useState(t.palettes[0].id);
  const [mounted, setMounted] = useState(false);
  const { names, set, edited } = useStartNames();
  useEffect(() => setMounted(true), []);

  const cats = t.categories.map((c) => CATEGORIES.find((x) => x.id === c)?.label).filter(Boolean);
  const coms = t.communities.map((c) => COMMUNITIES.find((x) => x.id === c)?.label).filter(Boolean);
  const fields = t.groups.flatMap((g) => g.fields);
  const similar = TEMPLATES.filter((x) => x.id !== t.id)
    .map((x) => ({ x, score: x.categories.filter((c) => t.categories.includes(c)).length * 2 + x.communities.filter((c) => t.communities.includes(c)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.x);
  const create = "/create?template=" + t.id + "&palette=" + pal + "&o=" + o;
  const p = t.palettes.find((x) => x.id === pal) ?? t.palettes[0];

  return (
    <main className="detail-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/templates">← All designs</Link>
        <span aria-hidden> / </span>
        <Link href={"/templates?category=" + t.categories[0]}>{cats[0]}</Link>
      </nav>

      <section className="detail">
        <header className="detail-title">
          <span className="kicker">
            {templateKind(t)}
            {t.isNew ? " · New" : ""}
          </span>
          <h1>{t.name}</h1>
          <p className="lead">{t.tagline}</p>
        </header>

        <div className={"player " + o}>
          <div className="player-box" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
            {mounted ? <Player key={t.id + o + pal} t={t} orientation={o} paletteId={pal} names={names} edited={edited} /> : null}
          </div>
          <div className="player-opts">
            <span className="opt-label">
              Colour: <b>{p.name}</b>
            </span>
            <div className="seg-o" role="radiogroup" aria-label="Screen">
              <button role="radio" aria-checked={o === "vertical"} className={o === "vertical" ? "on" : ""} onClick={() => setO("vertical")}>
                Phone
              </button>
              <button role="radio" aria-checked={o === "horizontal"} className={o === "horizontal" ? "on" : ""} onClick={() => setO("horizontal")}>
                TV
              </button>
            </div>
          </div>
          <PalettePicker palettes={t.palettes} value={pal} onChange={setPal} />
        </div>

        <div className="detail-copy">
          <div className="try-card">
            <div className="try-head">
              <b>See it with your names</b>
              <span>They appear in the preview as you type</span>
            </div>
            <NamesForm names={names} set={set} id="detail" />
          </div>

          <div className="detail-ctas">
            <Link href={create} className="cta-btn lg block">
              Customize this design <Arrow />
            </Link>
            <ul className="ticks-row">
              <li>Free preview</li>
              <li>Ready in 2 minutes</li>
              <li>Send on WhatsApp</li>
            </ul>
          </div>

          <div className="price-row">
            <div>
              <b>Free</b>
              <span>preview &amp; share link</span>
            </div>
            {PAYMENTS ? (
              <div>
                <b>₹{LINK_PRICE_INR}</b>
                <span>one time, removes the watermark</span>
              </div>
            ) : null}
          </div>

          <div className="editable">
            <span className="opt-label">What you can change</span>
            <ul>
              {fields.slice(0, 12).map((f) => (
                <li key={f.key}>{f.label}</li>
              ))}
              <li>Music</li>
              {fields.length > 12 ? <li>+{fields.length - 12} more</li> : null}
            </ul>
          </div>

          <div className="chips-o">
            {Array.from(new Set([...cats, ...coms, ...t.tags] as string[])).map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>

          {PAYMENTS ? (
            <div className="pay-strip">
              <PayIcons size={18} />
              <small>Secure checkout by Razorpay: UPI, cards, net banking and wallets. Pay only when you&apos;re happy.</small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec surface">
        <div className="sec-head centered">
          <span className="kicker">How it works</span>
          <h2>
            Three steps. <em>One link.</em>
          </h2>
        </div>
        <div className="steps compact">
          <article className="step">
            <span className="step-n">1</span>
            <h3>Customize</h3>
            <p>Names, date, venue, photos and music in one short form. The preview plays as you type.</p>
          </article>
          <article className="step">
            <span className="step-n">2</span>
            <h3>Preview free</h3>
            <p>Watch it on a phone and a TV, try the colours, change anything until it feels right.</p>
          </article>
          <article className="step">
            <span className="step-n">3</span>
            <h3>Send</h3>
            <p>
              Post the link on WhatsApp.{PAYMENTS ? " Remove the watermark for ₹" + LINK_PRICE_INR + " whenever you're ready, on the same link." : ""}
            </p>
          </article>
        </div>
      </section>

      <section className="sec">
        <div className="sec-head centered">
          <span className="kicker">Similar designs</span>
          <h2>
            More like <em>this.</em>
          </h2>
        </div>
        <div className="t-grid four">
          {similar.map((x) => (
            <TemplateCard key={x.id} t={x} />
          ))}
        </div>
      </section>
      {/* Phones: the preview fills the first screen, so "Customize" waits at the bottom until the real button shows. */}
      <MobileCta href={create} label="Customize this design →" note="Free preview" watch=".detail-ctas" />
    </main>
  );
}

/** The large preview: plays on load, holds on the names while they type, tap to pause, scrub to any scene. */
function Player({ t, orientation, paletteId, names, edited }: { t: TemplateDef; orientation: Orientation; paletteId: string; names: StartNames; edited: number }) {
  const { project, tl } = useDemoTimeline(t, orientation, paletteId, names);
  const [T, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const live = useRef({ total: tl.total, edited, namesAt: -1 });
  const at = sceneForField("brideName", tl.scenes);
  live.current = { total: tl.total, edited, namesAt: at < 0 ? -1 : tl.slots[at].start + tl.scenes[at].duration * 0.6 };

  // Typing plays again from the names scene, even if it was paused.
  useEffect(() => {
    if (edited) setPlaying(true);
  }, [edited]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;
      const { total, edited, namesAt } = live.current;
      if (edited && now - edited < HOLD_MS && namesAt >= 0) setT(namesAt);
      else setT((x) => (x + dt >= total + 800 ? 0 : x + dt)); // loop, holding the end card a moment
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const shown = Math.min(T, tl.total);
  const { W, H } = SIZES[orientation];
  return (
    <>
      <div className="player-hit" onClick={() => setPlaying((x) => !x)} aria-label={playing ? "Pause" : "Play"} role="button">
        <Stage W={W} H={H}>
          <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={shown} playing={playing} />
        </Stage>
        {!playing ? <span className="big-play">▶</span> : null}
      </div>
      <div className="player-bar">
        <button onClick={() => setPlaying((x) => !x)} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <input
          type="range"
          min={0}
          max={Math.round(tl.total)}
          value={Math.round(shown)}
          onChange={(e) => setT(+e.target.value)}
          aria-label="Timeline"
          style={{ ["--pct" as any]: (shown / tl.total) * 100 + "%" }}
        />
        <span>
          {fmt(shown)} / {fmt(tl.total)}
        </span>
      </div>
    </>
  );
}
