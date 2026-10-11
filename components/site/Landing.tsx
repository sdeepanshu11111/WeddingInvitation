"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { useDemoTimeline, useNearViewport } from "@/components/LivePreview";
import { CATEGORIES, countIn } from "@/lib/catalog";
import { fmt } from "@/lib/anim";
import { SIZES } from "@/lib/project";
import { TEMPLATES } from "@/lib/templates";
import type { CategoryId, TemplateDef } from "@/lib/types";
import { TemplateCard } from "./TemplateCard";

/** The hero's "live preview": real templates, playing one after another with demo content. */
const HERO_IDS = ["royal-mandala", "south-kalyanam", "nikah-mubarak", "anand-karaj", "haldi-marigold", "sangeet-night"];

export function HeroReel() {
  const list = useMemo(() => HERO_IDS.map((id) => TEMPLATES.find((t) => t.id === id)).filter(Boolean) as TemplateDef[], []);
  const [i, setI] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = list[i % list.length];
  const p = t.palettes[0];
  return (
    <div className="hero-reel">
      <div className="reel-stack">
        <div className="reel-card" style={{ background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
          {mounted ? <ReelPlayer key={t.id} t={t} onEnd={() => setI((n) => n + 1)} /> : null}
        </div>
      </div>
      <div className="reel-cap">
        <span>
          <i className="rec" /> Now playing · <b>{t.name}</b>
        </span>
        <Link href={"/templates/" + t.id}>Use this design →</Link>
      </div>
      <div className="reel-dots" role="tablist" aria-label="Designs">
        {list.map((x, n) => (
          <button key={x.id} role="tab" aria-selected={n === i % list.length} aria-label={x.name} className={n === i % list.length ? "on" : ""} onClick={() => setI(n)} />
        ))}
      </div>
    </div>
  );
}

function ReelPlayer({ t, onEnd }: { t: TemplateDef; onEnd: () => void }) {
  const { project, tl } = useDemoTimeline(t, "vertical");
  const [T, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const e = now - t0;
      if (e >= tl.total + 600) return onEnd(); // hold the last frame a moment, then the next design
      setT(Math.min(e, tl.total));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tl.total]);
  const { W, H } = SIZES.vertical;
  return (
    <>
      <Stage W={W} H={H}>
        <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} />
      </Stage>
      <span className="reel-tag">
        <i className="rec" /> Live preview
      </span>
      <span className="reel-time">{fmt(T)}</span>
      <div className="reel-bar">
        <i style={{ width: (T / tl.total) * 100 + "%" }} />
      </div>
    </>
  );
}

/** Home "Templates" section: function tabs + the first eight matching cards. */
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
        <Link href={cat === "all" ? "/templates" : "/templates?category=" + cat} className="text-link">
          Browse all {countIn(TEMPLATES, cat)} {cat === "all" ? "templates" : CATEGORIES.find((c) => c.id === cat)!.label.toLowerCase() + " templates"} →
        </Link>
      </div>
    </>
  );
}

/** Step 01's visual: the design list, scrolling slowly. */
export function DesignStack() {
  const [ref, seen] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} className={"mini-stack" + (seen ? " in" : "")}>
      <div className="mini-head">
        <span className="mono-label">Designs</span>
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
