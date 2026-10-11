"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline } from "@/components/LivePreview";
import { PayIcons } from "@/components/PayIcons";
import { TemplateCard } from "@/components/site/TemplateCard";
import { CATEGORIES, COMMUNITIES } from "@/lib/catalog";
import { fmt } from "@/lib/anim";
import { LINK_PRICE_INR, PAYMENTS, VIDEO_EXPORT } from "@/lib/features";
import { SIZES } from "@/lib/project";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import type { Orientation, TemplateDef } from "@/lib/types";

/** /templates/<id>: the design playing large on the left, what it is and "Customize" on the right. */
export function TemplateDetail({ id }: { id: string }) {
  const t = getTemplate(id);
  const [o, setO] = useState<Orientation>("vertical");
  const [pal, setPal] = useState(t.palettes[0].id);
  const [mounted, setMounted] = useState(false);
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
      <section className="page-head slim">
        <nav className="crumbs mono-label" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href="/templates">Templates</Link> /{" "}
          <Link href={"/templates?category=" + t.categories[0]}>{cats[0]}</Link> / {t.name}
        </nav>
      </section>

      <section className="detail">
        <div className={"player " + o}>
          <div className="player-box" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
            {mounted ? <Player key={t.id + o + pal} t={t} orientation={o} paletteId={pal} /> : null}
          </div>
          <div className="player-opts">
            <div className="seg-o">
              <button className={o === "vertical" ? "on" : ""} onClick={() => setO("vertical")}>
                9:16
              </button>
              <button className={o === "horizontal" ? "on" : ""} onClick={() => setO("horizontal")}>
                16:9
              </button>
            </div>
            <div className="swatches" role="radiogroup" aria-label="Colour palette">
              {t.palettes.map((x) => (
                <button
                  key={x.id}
                  role="radio"
                  aria-checked={x.id === pal}
                  title={x.name}
                  className={x.id === pal ? "on" : ""}
                  onClick={() => setPal(x.id)}
                  style={{ background: "linear-gradient(135deg, " + x.bg + " 0 50%, " + x.accent + " 50% 100%)" }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="detail-copy">
          <span className="mono-label accent">
            §01 — {cats.join(" · ")}
            {t.isNew ? " · New" : ""}
          </span>
          <h1>{t.name}</h1>
          <p className="lead">{t.tagline}</p>
          <div className="chips-o">
            {Array.from(new Set([...coms, ...t.tags] as string[])).map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>

          <div className="price-row">
            <div>
              <b>Free</b>
              <span>preview &amp; share link</span>
            </div>
            {PAYMENTS ? (
              <div>
                <b>₹{LINK_PRICE_INR}</b>
                <span>to remove the watermark</span>
              </div>
            ) : null}
          </div>

          <div className="detail-ctas">
            <Link href={create} className="cta-btn lg">
              Customize →
            </Link>
            <ShareRow name={t.name} />
          </div>
          <p className="fine">
            Opens the studio with this design in the {p.name} palette. Your names and photos carry over if you switch designs later.
          </p>

          <dl className="spec">
            <div>
              <dt>Format</dt>
              <dd>{VIDEO_EXPORT ? "Link · MP4" : "Share link"}</dd>
            </div>
            <div>
              <dt>Plays in</dt>
              <dd>9:16 + 16:9</dd>
            </div>
            <div>
              <dt>Palettes</dt>
              <dd>{t.palettes.length}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Instant</dd>
            </div>
          </dl>

          <div className="editable">
            <span className="mono-label">What you can change</span>
            <ul>
              {fields.slice(0, 14).map((f) => (
                <li key={f.key}>{f.label}</li>
              ))}
              <li>Music</li>
              {fields.length > 14 ? <li>+{fields.length - 14} more</li> : null}
            </ul>
          </div>

          {PAYMENTS ? (
            <div className="pay-strip">
              <span className="mono-label">Payment &amp; security</span>
              <PayIcons size={18} />
              <small>Secure checkout by Razorpay. UPI, cards, net banking and wallets.</small>
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec surface">
        <div className="sec-head">
          <span className="mono-label accent">§02 — How it works</span>
          <h2>
            Three steps. <em>One link.</em>
          </h2>
        </div>
        <div className="steps compact">
          <article className="step">
            <span className="step-n">01</span>
            <h3>Customize</h3>
            <p>Names, date, venue, photos and music in one short form. The preview plays as you type.</p>
          </article>
          <article className="step">
            <span className="step-n">02</span>
            <h3>Preview free</h3>
            <p>Watch it in 9:16 and 16:9, try the colour palettes, change anything until it feels right.</p>
          </article>
          <article className="step">
            <span className="step-n">03</span>
            <h3>Share</h3>
            <p>
              Send the link on WhatsApp.{PAYMENTS ? " Remove the watermark for ₹" + LINK_PRICE_INR + " whenever you're ready, on the same link." : ""}
            </p>
          </article>
        </div>
      </section>

      <section className="sec">
        <div className="sec-head">
          <span className="mono-label accent">§03 — Similar designs</span>
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
    </main>
  );
}

/** The large preview: plays on load, tap to pause, scrub to any scene. */
function Player({ t, orientation, paletteId }: { t: TemplateDef; orientation: Orientation; paletteId: string }) {
  const { project, tl } = useDemoTimeline(t, orientation, paletteId);
  const [T, setT] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setT((x) => (x + dt >= tl.total + 800 ? 0 : x + dt)); // loop, holding the end card a moment
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, tl.total]);

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

function ShareRow({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href.split("?")[0];
  return (
    <div className="share-row">
      <span className="mono-label">Share</span>
      <button onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent(name + " invitation video: " + url()), "_blank", "noopener")}>WhatsApp</button>
      <span aria-hidden>|</span>
      <button
        onClick={() =>
          navigator.clipboard?.writeText(url()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          })
        }
      >
        {copied ? "Copied ✓" : "Copy link"}
      </button>
    </div>
  );
}

