"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import { buildTimeline, defaultProject } from "@/lib/project";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import { withDemoMedia } from "@/lib/demo";
import type { Project } from "@/lib/types";

/**
 * Bare page driven by the headless renderer.
 *   window.__ready  – true once project, fonts and images are decoded
 *   window.__info   – { total, speed }
 *   window.__seek(t) – draw frame at internal time t; resolves when pixels are final
 */
export default function RenderPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [frame, setFrame] = useState({ T: 0, n: 0 });
  const T = frame.T;
  const pending = useRef<{ res: () => void; rej: (e: Error) => void } | null>(null);

  // Load the project: from a job id (server export) or window.__PROJECT (scripts/tests)
  useEffect(() => {
    const w = window as any;
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.style.background = "#000";
    const q = new URLSearchParams(location.search);
    const id = q.get("job");
    const tplId = q.get("template");
    w.__templates = TEMPLATES.map((t) => ({ id: t.id, palettes: t.palettes.map((p) => p.id) }));
    if (id) {
      fetch("/api/job/" + id)
        .then((r) => r.json())
        .then(setProject);
    } else if (tplId) {
      // Preview mode: /render?template=royal-mandala&orientation=horizontal&palette=emerald&demo=1
      const base = defaultProject(tplId);
      const tpl = getTemplate(tplId);
      setProject({
        ...base,
        orientation: q.get("orientation") === "horizontal" ? "horizontal" : "vertical",
        paletteId: q.get("palette") || base.paletteId,
        data: q.get("demo") ? withDemoMedia(tpl, base.data) : base.data,
      });
    } else if (w.__PROJECT) setProject(w.__PROJECT);
    w.__setProject = (p: Project) => setProject(p);
  }, []);

  const tl = useMemo(() => (project ? buildTimeline(project) : null), [project]);
  useEffect(() => {
    (window as any).__project = project; // lets scripts turn a template preview into an export job
  }, [project]);

  // Preload: fonts + every image data URL, so frame 0 is never blank.
  useEffect(() => {
    if (!tl || !project) return;
    const w = window as any;
    const urls: string[] = [];
    const walk = (v: any) => {
      if (!v) return;
      if (Array.isArray(v)) return v.forEach(walk);
      if (typeof v === "object" && v.kind === "image" && v.src) urls.push(v.src);
    };
    Object.values(project.data).forEach(walk);
    // Scripts like Gurmukhi/Tamil/Arabic load lazily (unicode-range) the first time a glyph
    // appears. Load every face up front so no exported frame shows a fallback font.
    const fontFaces: Promise<unknown>[] = [];
    (document as any).fonts?.forEach((ff: FontFace) => fontFaces.push(ff.load().catch(() => null)));
    Promise.all([
      ...fontFaces,
      (document as any).fonts?.ready,
      ...urls.map((u) => {
        const im = new Image();
        im.src = u;
        return im.decode().catch(() => {});
      }),
    ]).then(() => {
      w.__info = {
        total: tl.total,
        speed: project.speed || 1,
        scenes: tl.scenes.map((s, i) => ({ id: s.id, label: s.label, start: tl.slots[i].start, duration: s.duration })),
      };
      w.__seek = (t: number) =>
        new Promise<void>((res, rej) => {
          pending.current = { res, rej };
          setFrame((f) => ({ T: t, n: f.n + 1 }));
        });
      w.__ready = true;
    });
    // If this page is torn down mid-export (e.g. a dev hot-reload), fail the
    // in-flight seek so the renderer reports an error instead of waiting forever.
    return () => {
      w.__ready = false;
      w.__seek = () => Promise.reject(new Error("Render page reloaded during export"));
      pending.current?.rej(new Error("Render page reloaded during export"));
      pending.current = null;
    };
  }, [tl, project]);

  // After each commit: two rAFs for layout/paint, then wait for any seeking <video>.
  useEffect(() => {
    const res = pending.current?.res;
    if (!res) return;
    pending.current = null;
    const w = window as any;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const started = performance.now();
        const poll = () => {
          if (!(w.__mediaPending > 0) || performance.now() - started > 5000) res();
          else setTimeout(poll, 4);
        };
        poll();
      })
    );
  }, [frame]);

  if (!tl || !project) return null;
  return (
    <div style={{ position: "fixed", left: 0, top: 0 }}>
      <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={T} deterministic />
    </div>
  );
}
