"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { CATEGORIES, COMMUNITIES, countIn, filterTemplates, type Filter } from "@/lib/catalog";
import { withDemoMedia } from "@/lib/demo";
import { SIZES, buildTimeline, defaultProject } from "@/lib/project";
import { TEMPLATES } from "@/lib/templates";
import type { Orientation, Project, TemplateDef } from "@/lib/types";

/* Demo media is generated on a canvas once per template and reused. */
const demoCache = new Map<string, Record<string, any>>();
function demoProject(t: TemplateDef, orientation: Orientation): Project {
  if (!demoCache.has(t.id)) demoCache.set(t.id, withDemoMedia(t, t.defaults));
  return { ...defaultProject(t.id), orientation, data: demoCache.get(t.id)! };
}

/** Live preview: rests on the poster frame, plays the whole video while hovered. */
function LivePreview({ t, orientation, active }: { t: TemplateDef; orientation: Orientation; active: boolean }) {
  const project = useMemo(() => demoProject(t, orientation), [t, orientation]);
  const tl = useMemo(() => buildTimeline(project), [project]);
  const poster = useMemo(() => {
    const i = Math.max(0, tl.scenes.findIndex((s) => s.id === t.poster));
    const idx = t.poster ? i : Math.min(1, tl.scenes.length - 1);
    return tl.slots[idx].start + tl.scenes[idx].duration * 0.72;
  }, [tl, t.poster]);
  const [T, setT] = useState(poster);

  useEffect(() => {
    if (!active) {
      setT(poster);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      setT((now - t0) % tl.total);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, poster, tl.total]);

  const { W, H } = SIZES[orientation];
  return (
    <Stage W={W} H={H}>
      <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} />
    </Stage>
  );
}

export function TemplateGallery({
  current,
  orientation,
  initial,
  onPick,
  onClose,
}: {
  current: string;
  orientation: Orientation;
  initial?: Partial<Filter>;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState<Filter>({ category: "all", community: "all", q: "", ...initial });
  const [hover, setHover] = useState<string | null>(null);
  const [o, setO] = useState<Orientation>(orientation);
  const list = filterTemplates(TEMPLATES, f);
  const search = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    search.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div className="gallery-m" role="dialog" aria-label="Template gallery">
      <div className="gallery-top">
        <div>
          <h2>Templates</h2>
          <p>
            {TEMPLATES.length} designs for every function. Hover a card to play it.
          </p>
        </div>
        <input ref={search} className="input" placeholder="Search: haldi, south indian, nikah, gold..." value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} style={{ maxWidth: 320 }} />
        <div className="seg">
          <button className={o === "vertical" ? "on" : ""} onClick={() => setO("vertical")}>
            9:16
          </button>
          <button className={o === "horizontal" ? "on" : ""} onClick={() => setO("horizontal")}>
            16:9
          </button>
        </div>
        <button className="btn ghost" onClick={onClose} aria-label="Close gallery">
          ✕
        </button>
      </div>

      <div className="cat-tabs" role="tablist">
        {(["all", ...CATEGORIES.map((c) => c.id)] as const).map((id) => {
          const c = CATEGORIES.find((x) => x.id === id);
          const n = countIn(TEMPLATES, id);
          return (
            <button key={id} role="tab" aria-selected={f.category === id} className={"cat-tab" + (f.category === id ? " on" : "")} onClick={() => setF({ ...f, category: id })} title={c?.blurb}>
              <span>{c ? c.label : "All"}</span>
              {c ? <small lang="hi">{c.local}</small> : null}
              <em>{n}</em>
            </button>
          );
        })}
      </div>

      <div className="comm-row">
        <span>Community</span>
        {([{ id: "all", label: "All" }, ...COMMUNITIES] as { id: Filter["community"]; label: string }[]).map((c) => (
          <button key={c.id} className={"chip comm" + (f.community === c.id ? " on" : "")} onClick={() => setF({ ...f, community: c.id })}>
            {c.label}
          </button>
        ))}
      </div>

      <div className={"gallery-grid " + o}>
        {list.map((t) => (
          <button
            key={t.id}
            className={"g-card" + (t.id === current ? " on" : "")}
            onMouseEnter={() => setHover(t.id)}
            onMouseLeave={() => setHover((h) => (h === t.id ? null : h))}
            onFocus={() => setHover(t.id)}
            onClick={() => onPick(t.id)}
          >
            <div className={"g-prev " + o}>
              <LivePreview t={t} orientation={o} active={hover === t.id} />
              {t.isNew ? <span className="badge-new">NEW</span> : null}
              {t.id === current ? <span className="badge-cur">In use</span> : null}
            </div>
            <div className="g-meta">
              <b>{t.name}</b>
              <span>{t.tagline}</span>
              <div className="chips">
                {t.categories.map((c) => (
                  <span key={c} className="chip">
                    {CATEGORIES.find((x) => x.id === c)?.label}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
        {!list.length ? <div className="g-empty">No templates match. Try another category or clear the search.</div> : null}
      </div>
    </div>
  );
}
