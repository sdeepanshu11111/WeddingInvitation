"use client";
import React, { useEffect, useRef, useState } from "react";
import type { Orientation, Project } from "@/lib/types";
import { buildTimeline, coupleTitle } from "@/lib/project";
import { SharePanel, type ShareResult } from "./ShareDialog";

type JobView = { id: string; label: string; status: string; progress: number; error?: string; fileName: string; savedAs?: string | null; savedName?: string | null; queuePosition?: number; dlError?: string;
  share?: ShareResult | "loading" };

/** URL of the finished file: the ./exports copy (survives restarts) when there is one, else the job's temp file. */
const fileUrl = (j: JobView, inline = false) =>
  (j.savedName ? "/api/exports/" + encodeURIComponent(j.savedName) : "/api/render/" + j.id + "/file") + (inline ? "?inline=1" : "");

const QUALITIES = [
  { id: "144p", label: "144p", sub: "Very fast · draft" },
  { id: "720p", label: "720p", sub: "Fast · small file" },
  { id: "1080p", label: "1080p", sub: "Recommended" },
  { id: "4k", label: "4K", sub: "Slow · big screens" },
] as const;

export function ExportDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const [targets, setTargets] = useState<Orientation[]>([project.orientation]);
  const [quality, setQuality] = useState<"144p" | "720p" | "1080p" | "4k">("1080p");
  const [fps, setFps] = useState(30);
  const [jobs, setJobs] = useState<JobView[]>([]);
  const [busy, setBusy] = useState(false);
  const timer = useRef<any>(null);

  const tl = buildTimeline(project);
  const seconds = tl.realTotal / 1000;
  // Media slots left empty would export as placeholders — warn before rendering.
  const empty = tl.template.groups
    .flatMap((g) => g.fields)
    .filter((f) => {
      const v = project.data[f.key];
      if (f.type === "image" || f.type === "video") return !v?.src;
      if (f.type === "gallery") return f.min > 0 && !(Array.isArray(v) && v.length);
      return false;
    })
    .filter((f) => !(f.type === "video" && Array.isArray(project.data.montage) && project.data.montage.length))
    .map((f) => f.label);

  const toggle = (o: Orientation) =>
    setTargets((t) => (t.includes(o) ? (t.length > 1 ? t.filter((x) => x !== o) : t) : [...t, o]));

  const start = async () => {
    setBusy(true);
    const created: JobView[] = [];
    for (const o of targets) {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: { ...project, orientation: o }, quality, fps }),
      });
      const j = await res.json();
      if (!res.ok) {
        created.push({ id: "err-" + o, label: o, status: "error", progress: 0, error: j.error || "Failed to start", fileName: "" });
        continue;
      }
      created.push({ id: j.id, label: o === "vertical" ? "Vertical 9:16" : "Horizontal 16:9", status: "queued", progress: 0, fileName: j.fileName });
    }
    setJobs(created);
    setBusy(false);
  };

  // Poll progress
  useEffect(() => {
    if (!jobs.length) return;
    const active = jobs.some((j) => j.status !== "done" && j.status !== "error");
    if (!active) return;
    timer.current = setTimeout(async () => {
      const next = await Promise.all(
        jobs.map(async (j) => {
          if (j.status === "done" || j.status === "error") return j;
          const res = await fetch("/api/render/" + j.id).catch(() => null);
          if (!res) return j; // network blip, try again next tick
          const r = await res.json().catch(() => null);
          if (res.status === 404) return { ...j, status: "error", error: "The server restarted and lost this job. Click Render again." };
          return r ? { ...j, status: r.status, progress: r.progress, error: r.error, savedAs: r.savedAs, savedName: r.savedName, queuePosition: r.queuePosition } : j;
        })
      );
      setJobs(next);
    }, 600);
    return () => clearTimeout(timer.current);
  }, [jobs]);

  const statusText = (j: JobView) =>
    j.status === "queued" ? (j.queuePosition && j.queuePosition > 1 ? "Waiting: " + (j.queuePosition - 1) + " ahead" : "Starting...") :
    j.status === "rendering" ? "Rendering frames " + Math.round(j.progress * 100) + "%" :
    j.status === "encoding" ? "Encoding MP4..." :
    j.status === "done" ? "Ready" : "Failed";

  const active = jobs.some((j) => j.status === "rendering" || j.status === "queued" || j.status === "encoding");
  const cancelAll = async () => {
    await fetch("/api/render", { method: "DELETE" }).catch(() => {});
    setJobs((js) => js.map((j) => (j.status === "done" || j.status === "error" ? j : { ...j, status: "error", error: "Cancelled" })));
  };

  // Fetch first so a missing file shows an error instead of a silent failed download.
  const download = async (j: JobView) => {
    const setErr = (dlError?: string) => setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, dlError } : x)));
    setErr(undefined);
    try {
      const res = await fetch(fileUrl(j));
      if (!res.ok) return setErr("Download failed (" + res.status + "): " + (await res.text()));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(await res.blob());
      a.download = j.savedName || j.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    } catch (e: any) {
      setErr("Download failed: " + (e?.message || e));
    }
  };

  const shareTitle = coupleTitle(project.data);

  const share = async (j: JobView) => {
    const set = (share: JobView["share"]) => setJobs((js) => js.map((x) => (x.id === j.id ? { ...x, share } : x)));
    set("loading");
    try {
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: j.savedName, title: shareTitle }) });
      const r = await res.json();
      set(res.ok ? { url: r.url, lanUrl: r.lanUrl } : { error: r.error || "Could not create a link" });
    } catch (e: any) {
      set({ error: "Could not create a link: " + (e?.message || e) });
    }
  };

  const [projectSaved, setProjectSaved] = useState<string | null>(null);
  const downloadJSON = () => {
    // Server copy first: some embedded browsers silently block downloads.
    fetch("/api/project", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) })
      .then((r) => r.json())
      .then((r) => r.savedAs && setProjectSaved(r.savedAs))
      .catch(() => {});
    const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "invite-project.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div className="backdrop-m" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label="Export video">
        <h3>Export video</h3>
        <p className="sub">
          {seconds.toFixed(1)}s · H.264 MP4{project.music ? " with music" : ""} · rendered frame-by-frame, so it matches the preview exactly.
        </p>

        {empty.length ? (
          <div className="job" style={{ marginTop: 0, marginBottom: 16, borderColor: "rgba(160, 29, 56, 0.4)", background: "rgba(160, 29, 56, 0.06)" }}>
            <b style={{ fontWeight: 500 }}>Empty media: </b>
            <span style={{ color: "var(--muted)" }}>
              {empty.join(", ")} will show as placeholders in the video. Add them in the panel on the right first.
            </span>
          </div>
        ) : null}

        <div className="section-title">Formats</div>
        <div className="opt-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {(["vertical", "horizontal"] as Orientation[]).map((o) => (
            <button key={o} className={"opt" + (targets.includes(o) ? " on" : "")} onClick={() => toggle(o)}>
              <b>{o === "vertical" ? "Vertical 9:16" : "Horizontal 16:9"}</b>
              <small>{o === "vertical" ? "Instagram, WhatsApp Status" : "YouTube, TV, email"}</small>
            </button>
          ))}
        </div>

        <div className="section-title" style={{ marginTop: 16 }}>Quality</div>
        <div className="opt-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {QUALITIES.map((q) => (
            <button key={q.id} className={"opt" + (quality === q.id ? " on" : "")} onClick={() => setQuality(q.id)}>
              <b>{q.label}</b>
              <small>{q.sub}</small>
            </button>
          ))}
        </div>

        <div className="section-title" style={{ marginTop: 16 }}>Frame rate</div>
        <div className="seg">
          {[24, 30, 60].map((f) => (
            <button key={f} className={fps === f ? "on" : ""} onClick={() => setFps(f)}>
              {f} fps
            </button>
          ))}
        </div>

        {jobs.map((j) => (
          <div className="job" key={j.id}>
            <div className="st">
              <span style={{ color: "var(--text)" }}>{j.label}</span>
              <span className={j.status === "error" ? "err" : ""}>{statusText(j)}</span>
            </div>
            <div className="bar">
              <i style={{ width: (j.status === "done" ? 100 : j.progress * 100) + "%" }} />
            </div>
            {j.status === "done" ? (
              <>
                {j.savedAs ? (
                  <div style={{ fontSize: 12, color: "var(--ok)", marginBottom: 8 }}>
                    Saved to <code style={{ color: "var(--text)" }}>{j.savedAs}</code> in the project folder
                  </div>
                ) : null}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className="btn sm primary" onClick={() => download(j)}>
                    Download
                  </button>
                  <a className="btn sm" href={fileUrl(j, true)} target="_blank" rel="noreferrer">
                    Open video
                  </a>
                  <button className="btn sm" onClick={() => fetch("/api/render/" + j.id + "/reveal", { method: "POST" })}>
                    Show in folder
                  </button>
                  {j.savedName ? (
                    <button className="btn sm" onClick={() => share(j)} disabled={j.share === "loading"}>
                      {j.share === "loading" ? "Creating link..." : "Share link"}
                    </button>
                  ) : null}
                </div>
                {j.share && j.share !== "loading" ? <SharePanel share={j.share} title={shareTitle} /> : null}
              </>
            ) : null}
            {j.dlError ? <div className="err" style={{ fontSize: 12, marginTop: 6, wordBreak: "break-word" }}>{j.dlError}</div> : null}
            {j.error ? <div className="err" style={{ fontSize: 12, marginTop: 6, wordBreak: "break-word" }}>{j.error}</div> : null}
          </div>
        ))}

        {projectSaved ? (
          <div style={{ fontSize: 12, color: "var(--ok)", marginTop: 14 }}>
            Project saved to <code style={{ color: "var(--text)" }}>{projectSaved}</code>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 20, flexWrap: "wrap" }}>
          <button className="btn ghost" onClick={downloadJSON} title="Re-open later or batch-render from the command line">
            Save project file
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {active ? (
              <button className="btn ghost" onClick={cancelAll} title="Stop every render that is queued or running">
                Cancel all
              </button>
            ) : null}
            <button className="btn ghost" onClick={onClose}>
              Close
            </button>
            <button className="btn primary" onClick={start} disabled={busy || active}>
              {busy ? "Starting..." : jobs.length ? "Render again" : "Render " + targets.length + (targets.length > 1 ? " videos" : " video")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

