"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import { buildTimeline, defaultProject } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { withDemoMedia } from "@/lib/demo";
import { clientSupport, exportInBrowser } from "@/lib/clientExport";
import { createContext, destroyContext, domToCanvas } from "modern-screenshot";
import type { Project } from "@/lib/types";

/**
 * SPIKE: export an MP4 entirely in the browser.
 *   /client-render?template=royal-mandala&orientation=vertical&demo=1
 *   window.__clientExport({ outShort, fps }) → { ms, frames, msPerFrame, bytes, audio }
 *   window.__clientFrame(t, outShort)       → PNG data URL of one rasterised frame (for diffing against /render)
 */
export default function ClientRenderPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [frame, setFrame] = useState({ T: 0, n: 0 });
  const [status, setStatus] = useState("Loading...");
  const [url, setUrl] = useState<string | null>(null);
  const node = useRef<HTMLDivElement | null>(null);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const tplId = q.get("template") || "royal-mandala";
    const base = defaultProject(tplId);
    setProject({
      ...base,
      orientation: q.get("orientation") === "horizontal" ? "horizontal" : "vertical",
      paletteId: q.get("palette") || base.paletteId,
      data: q.get("demo") ? withDemoMedia(getTemplate(tplId), base.data) : base.data,
    });
    (window as any).__setProject = (p: Project) => setProject(p);
  }, []);

  const tl = useMemo(() => (project ? buildTimeline(project) : null), [project]);

  // Same frame-settle rule as /render: two rAFs, then wait for seeking <video>s.
  useEffect(() => {
    const res = pending.current;
    if (!res) return;
    pending.current = null;
    const w = window as any;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const started = performance.now();
        const poll = () => (!(w.__mediaPending > 0) || performance.now() - started > 5000 ? res() : setTimeout(poll, 4));
        poll();
      })
    );
  }, [frame]);

  useEffect(() => {
    if (!tl || !project) return;
    const w = window as any;
    const seek = (t: number) =>
      new Promise<void>((res) => {
        pending.current = res;
        setFrame((f) => ({ T: t, n: f.n + 1 }));
      });
    const fonts: Promise<unknown>[] = [];
    (document as any).fonts?.forEach((ff: FontFace) => fonts.push(ff.load().catch(() => null)));
    Promise.all(fonts).then(async () => {
      const sup = await clientSupport();
      const { W, H } = { W: node.current!.offsetWidth, H: node.current!.offsetHeight };
      w.__clientExport = async ({ outShort = 720, fps = 30 } = {}) => {
        setStatus("Rendering...");
        const r = await exportInBrowser({
          node: node.current!, seek, W, H, outShort, fps, total: tl.total, speed: project.speed || 1, music: project.music,
          onProgress: (p) => setStatus("Rendering " + Math.round(p * 100) + "%"),
        });
        setUrl((old) => (old && URL.revokeObjectURL(old), URL.createObjectURL(r.blob)));
        setStatus("Done in " + (r.ms / 1000).toFixed(1) + "s (" + r.msPerFrame.toFixed(0) + " ms/frame, " + (r.blob.size / 1e6).toFixed(2) + " MB)");
        w.__clientBlob = r.blob;
        return { ms: r.ms, frames: r.frames, msPerFrame: r.msPerFrame, bytes: r.blob.size, audio: r.audio };
      };
      // One context per output size, so fonts and images are embedded once, not per frame.
      const ctxs = new Map<number, Awaited<ReturnType<typeof createContext>>>();
      w.__clientFrame = async (t: number, outShort = 1080) => {
        await seek(t);
        let ctx = ctxs.get(outShort);
        if (!ctx) ctxs.set(outShort, (ctx = await createContext(node.current!, { width: W, height: H, scale: outShort / Math.min(W, H), autoDestruct: false })));
        const t0 = performance.now();
        const c = await domToCanvas(ctx);
        w.__lastFrameMs = performance.now() - t0;
        return c.toDataURL("image/png");
      };
      w.__clientDispose = () => ctxs.forEach((c) => destroyContext(c));
      w.__clientReady = true;
      setStatus(sup.ok ? "Ready" + (sup.aac ? "" : " (no AAC: video will be silent)") : "Unsupported: " + sup.reason);
    });
  }, [tl, project]);

  if (!tl || !project) return null;
  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "#eee", fontFamily: "system-ui" }}>
      <div style={{ position: "fixed", right: 12, top: 12, zIndex: 10, background: "#000c", padding: 12, borderRadius: 8, fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>{status}</div>
        <button onClick={() => (window as any).__clientExport?.({ outShort: 720, fps: 30 })}>Render 720p in browser</button>{" "}
        {url ? <a href={url} download={project.templateId + "-browser.mp4"} style={{ color: "#9cf" }}>Download</a> : null}
      </div>
      <div ref={node} style={{ position: "absolute", left: 0, top: 0, width: "fit-content" }}>
        <Frame project={project} template={tl.template} theme={tl.theme} scenes={tl.scenes} slots={tl.slots} total={tl.total} T={frame.T} deterministic />
      </div>
    </div>
  );
}
