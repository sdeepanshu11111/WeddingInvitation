"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { withDemoMedia } from "@/lib/demo";
import { SIZES, buildTimeline, defaultProject, withNames, type StartNames } from "@/lib/project";
import type { Orientation, Project, TemplateDef } from "@/lib/types";

/* Demo media is generated on a canvas once per template and reused (browser only: it needs document). */
const demoCache = new Map<string, Record<string, any>>();
export function demoProject(t: TemplateDef, orientation: Orientation, paletteId?: string): Project {
  if (!demoCache.has(t.id)) demoCache.set(t.id, withDemoMedia(t, t.defaults));
  return { ...defaultProject(t.id), orientation, paletteId: paletteId ?? t.palettes[0].id, data: demoCache.get(t.id)! };
}

/** The template's demo timeline plus the time of its poster frame (the scene named by `poster`, else the 2nd).
    `names`: what a visitor typed (home hero, template page), shown in place of the demo couple. */
export function useDemoTimeline(t: TemplateDef, orientation: Orientation, paletteId?: string, names?: Partial<StartNames>) {
  const bride = names?.bride ?? "";
  const groom = names?.groom ?? "";
  const project = useMemo(() => {
    const p = demoProject(t, orientation, paletteId);
    return bride.trim() || groom.trim() ? { ...p, data: withNames(t, p.data, { bride, groom }) } : p;
  }, [t, orientation, paletteId, bride, groom]);
  const tl = useMemo(() => buildTimeline(project), [project]);
  const poster = useMemo(() => {
    const i = Math.max(0, tl.scenes.findIndex((s) => s.id === t.poster));
    const idx = t.poster ? i : Math.min(1, tl.scenes.length - 1);
    return tl.slots[idx].start + tl.scenes[idx].duration * 0.72;
  }, [tl, t.poster]);
  return { project, tl, poster };
}

/** A looping rAF clock: runs while `active`, else rests on `rest`. */
export function useLoopClock(active: boolean, total: number, rest: number, from = 0) {
  const [T, setT] = useState(rest);
  useEffect(() => {
    if (!active) {
      setT(rest);
      return;
    }
    let raf = 0;
    const t0 = performance.now() - from;
    const loop = (now: number) => {
      setT((now - t0) % total);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, rest, total, from]);
  return T;
}

/** True once the element has scrolled near the viewport (and stays true), so off-screen cards cost nothing. */
export function useNearViewport<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setSeen(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

/** Live preview of a template with demo content: rests on the poster frame, plays while `active`. */
export function LivePreview({ t, orientation, active, paletteId }: { t: TemplateDef; orientation: Orientation; active: boolean; paletteId?: string }) {
  const { project, tl, poster } = useDemoTimeline(t, orientation, paletteId);
  const T = useLoopClock(active, tl.total, poster);
  const { W, H } = SIZES[orientation];
  return (
    <Stage W={W} H={H}>
      <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} />
    </Stage>
  );
}

/**
 * A design card's picture. Portrait in the design's own colours: its poster image (public/posters/<id>.webp, made by
 * scripts/posters.mjs: the names scene with the sample photo), and the live preview only once the card is played
 * (hovered, or centred on a phone), then kept. A grid of 26 designs used to render 26 live invitations and download
 * every design's fonts on arrival. Landscape or another palette (no poster for those): the live preview mounts near
 * the viewport, as before. Until anything loads, the design's colours stand in.
 */
export function LazyPreview({ t, orientation, active, paletteId }: { t: TemplateDef; orientation: Orientation; active: boolean; paletteId?: string }) {
  const [ref, seen] = useNearViewport<HTMLDivElement>();
  const p = t.palettes.find((x) => x.id === paletteId) ?? t.palettes[0];
  const poster = orientation === "vertical" && (!paletteId || paletteId === t.palettes[0].id);
  const [played, setPlayed] = useState(false);
  const [broken, setBroken] = useState(false); // no poster file (a design added since the posters were made)
  useEffect(() => {
    if (active) setPlayed(true);
  }, [active]);
  const live = poster && !broken ? played : seen;
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, " + p.bg + ", " + p.bg2 + ")" }}>
      {poster && !broken ? ( // stays under the live preview while it starts: no blank flash between them
        <img
          src={"/posters/" + t.id + ".webp"}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setBroken(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}
      {live ? <LivePreview t={t} orientation={orientation} active={active} paletteId={paletteId} /> : null}
    </div>
  );
}
