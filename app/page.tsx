"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Frame, Stage } from "@/components/Frame";
import { ExportDialog } from "@/components/editor/ExportDialog";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { FieldGroups, MusicPanel } from "@/components/editor/Fields";
import { TemplateGallery } from "@/components/editor/TemplateGallery";
import { CATEGORIES, countIn } from "@/lib/catalog";
import { fmt } from "@/lib/anim";
import { SIZES, buildTimeline, defaultProject, idbGet, idbSet } from "@/lib/project";
import { TEMPLATES } from "@/lib/templates";
import { VIDEO_EXPORT } from "@/lib/features";
import type { CategoryId, Orientation, Project } from "@/lib/types";

type View = Orientation | "both";

export default function Editor() {
  const [project, setProject] = useState<Project | null>(null);
  const [view, setView] = useState<View>("vertical");
  const [T, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [gallery, setGallery] = useState(false);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  // Phones: one section at a time under the preview (bottom tabs), and a ⋯ menu for the rest of the top bar.
  const [tab, setTab] = useState<"design" | "details" | "preview">("design");
  const [menu, setMenu] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* ---------- load / autosave ---------- */
  useEffect(() => {
    idbGet<Project>("project")
      .then((p) => {
        const proj = p && TEMPLATES.some((t) => t.id === p.templateId) ? p : defaultProject(TEMPLATES[0].id);
        setProject(proj);
        setView(proj.orientation);
        setPlaying(true); // start on a moving invite, not a blank first frame
      })
      .catch(() => setProject(defaultProject(TEMPLATES[0].id)));
  }, []);

  useEffect(() => {
    if (!project) return;
    const id = setTimeout(() => idbSet("project", project).catch(() => {}), 400);
    return () => clearTimeout(id);
  }, [project]);

  const say = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3200);
  }, []);

  /* ---------- timelines (one per visible orientation) ---------- */
  const tlV = useMemo(() => (project ? buildTimeline({ ...project, orientation: "vertical" }) : null), [project]);
  const tlH = useMemo(() => (project ? buildTimeline({ ...project, orientation: "horizontal" }) : null), [project]);
  const main = project ? (project.orientation === "vertical" ? tlV : tlH) : null;
  const total = main?.total ?? 1;
  const speed = project?.speed ?? 1;

  /* ---------- playback clock ---------- */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setT((prev) => {
        const n = prev + dt * speed;
        if (n >= total) {
          setPlaying(false);
          return total;
        }
        return n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  /* ---------- music sync ---------- */
  const music = project?.music;
  useEffect(() => {
    const a = audio.current;
    if (!a || !music) return;
    if (playing) {
      a.currentTime = (music.offset || 0) + T / speed / 1000;
      a.play().catch(() => {});
    } else a.pause();
    // Only resync on play/pause, not every frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, music?.src, music?.offset]);

  useEffect(() => {
    const a = audio.current;
    if (!a || !music) return;
    const realLeft = (total - T) / speed;
    const fade = Math.min(1, realLeft / 2200, (T / speed) / 600 + 0.0001);
    a.volume = Math.max(0, Math.min(1, music.volume * fade));
  }, [T, total, speed, music]);

  /* ---------- actions ---------- */
  const togglePlay = useCallback(() => {
    if (!playing && T >= total - 1) setT(0);
    setPlaying((p) => !p);
  }, [playing, T, total]);

  const seek = (t: number) => {
    setT(Math.max(0, Math.min(total, t)));
    if (playing && audio.current && music) audio.current.currentTime = (music.offset || 0) + t / speed / 1000;
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") setT((t) => Math.min(total, t + 1000));
      if (e.code === "ArrowLeft") setT((t) => Math.max(0, t - 1000));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [togglePlay, total]);

  const update = (patch: Partial<Project>) => setProject((p) => (p ? { ...p, ...patch } : p));
  const setField = (key: string, value: any) => setProject((p) => (p ? { ...p, data: { ...p.data, [key]: value } } : p));

  const chooseView = (v: View) => {
    setView(v);
    if (v !== "both") update({ orientation: v });
  };

  const chooseTemplate = (id: string) => {
    if (!project || id === project.templateId) return;
    setProject(defaultProject(id, project));
    setT(0);
    setPlaying(true);
  };

  const openShare = () => {
    setMenu(false);
    setPlaying(false);
    setSharing(true);
  };

  /** Phone tabs. Preview fills the screen and starts playing. */
  const goTab = (t: "design" | "details" | "preview") => {
    setTab(t);
    if (t === "preview" && !playing) togglePlay();
  };

  const importJSON = async (f: File) => {
    try {
      const p = JSON.parse(await f.text()) as Project;
      if (!TEMPLATES.some((t) => t.id === p.templateId)) throw new Error();
      setProject(p);
      setView(p.orientation);
      setT(0);
      say("Project loaded");
    } catch {
      say("That is not a valid project file");
    }
  };

  if (!project || !main || !tlV || !tlH) {
    return <div style={{ display: "grid", placeItems: "center", height: "100vh", color: "var(--muted)" }}>Loading studio...</div>;
  }

  const tpl = main.template;
  const showBoth = view === "both" && !narrow; // side by side needs a wide screen
  const activeScene = [...main.slots].reverse().find((s) => T >= s.start) ?? main.slots[0];

  const renderStage = (o: Orientation) => {
    const tl = o === "vertical" ? tlV : tlH;
    const { W, H } = SIZES[o];
    return (
      <Stage W={W} H={H} pad={narrow ? 10 : view === "both" ? 18 : 28}>
        <Frame
          project={{ ...project, orientation: o }}
          template={tl.template}
          theme={tl.theme}
          scenes={tl.scenes}
          slots={tl.slots}
          total={tl.total}
          T={Math.min(T, tl.total)}
          playing={playing}
        />
      </Stage>
    );
  };

  return (
    <div className="app" data-tab={tab}>
      {/* ---------------- top bar ---------------- */}
      <header className="topbar">
        <div className="brand">
          <b>
            Future<i>Proof</i>
          </b>
          <span>wedding video invitations</span>
        </div>

        <div className="seg" role="tablist" aria-label="Format">
          <button className={view === "vertical" ? "on" : ""} onClick={() => chooseView("vertical")} title={SIZES.vertical.hint}>
            <span className="shape" style={{ width: 9, height: 15 }} /> 9:16
          </button>
          <button className={view === "horizontal" ? "on" : ""} onClick={() => chooseView("horizontal")} title={SIZES.horizontal.hint}>
            <span className="shape" style={{ width: 16, height: 9 }} /> 16:9
          </button>
          <button className={"both-btn" + (view === "both" ? " on" : "")} onClick={() => chooseView("both")} title="Preview both side by side">
            Both
          </button>
        </div>

        <label className="btn ghost desk-only" style={{ cursor: "pointer" }} title="Open a saved project file">
          <input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
          Open
        </label>
        {VIDEO_EXPORT ? (
          <>
            <button className="btn desk-only" onClick={openShare} title="Send guests a link that plays the invitation in their browser">
              Share
            </button>
            <button className="btn primary desk-only" onClick={() => { setPlaying(false); setExporting(true); }}>
              Export MP4
            </button>
          </>
        ) : (
          <>
            <button className="btn ghost desk-only" onClick={() => say("MP4 export is coming soon. Use Share to send guests a link for now.")} title="Coming soon">
              Export MP4 <span className="soon">Soon</span>
            </button>
            <button className="btn primary desk-only" onClick={openShare} title="Send guests a link that plays the invitation in their browser">
              Share
            </button>
          </>
        )}
        <div className="more mob-only">
          <button className="btn ghost more-btn" onClick={() => setMenu((m) => !m)} aria-label="More" aria-expanded={menu}>
            ⋯
          </button>
          {menu ? (
            <>
              <div className="menu-scrim" onClick={() => setMenu(false)} />
              <div className="menu" role="menu">
                <button role="menuitem" onClick={() => { setMenu(false); setPlaying(false); setGallery(true); }}>
                  ▦ Browse all templates
                </button>
                <label role="menuitem">
                  <input type="file" accept="application/json" hidden onChange={(e) => { setMenu(false); if (e.target.files?.[0]) importJSON(e.target.files[0]); }} />
                  ⇪ Open a saved project
                </label>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenu(false);
                    if (VIDEO_EXPORT) {
                      setPlaying(false);
                      setExporting(true);
                    } else say("MP4 export is coming soon. Use Share to send guests a link for now.");
                  }}
                >
                  ⬇ Export MP4 {VIDEO_EXPORT ? null : <span className="soon">Soon</span>}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </header>

      {/* ---------------- left: templates + palette ---------------- */}
      <aside className="left">
        <button className="btn browse" onClick={() => { setPlaying(false); setGallery(true); }}>
          ▦ Browse all {TEMPLATES.length} templates
        </button>
        <div className="section-title">Categories</div>
        <div className="side-cats">
          {(["all", ...CATEGORIES.map((c) => c.id)] as (CategoryId | "all")[]).map((id) => (
            <button key={id} className={"side-cat" + (cat === id ? " on" : "")} onClick={() => setCat(id)}>
              {id === "all" ? "All" : CATEGORIES.find((c) => c.id === id)!.label}
              <em>{countIn(TEMPLATES, id)}</em>
            </button>
          ))}
        </div>
        <div className="tpl">
          {TEMPLATES.filter((t) => cat === "all" || t.categories.includes(cat)).map((t) => (
            <button key={t.id} className={"tpl-card" + (t.id === project.templateId ? " on" : "")} onClick={() => chooseTemplate(t.id)}>
              <div className="tpl-thumb">{t.thumb(t.palettes[0])}</div>
              <div>
                <div className="tpl-name">
                  {t.name}
                  {t.isNew ? <span className="new">NEW</span> : null}
                </div>
                <div className="tpl-tag">{t.tagline}</div>
                <div className="chips">
                  {t.tags.map((x) => (
                    <span className="chip" key={x}>
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="section-title" style={{ marginTop: 24 }}>
          Colour palette
        </div>
        <div className="palettes">
          {tpl.palettes.map((p) => (
            <button key={p.id} className={"pal" + (p.id === project.paletteId ? " on" : "")} onClick={() => update({ paletteId: p.id })}>
              <div className="sw">
                <i style={{ background: p.bg }} />
                <i style={{ background: p.bg2 }} />
                <i style={{ background: p.accent }} />
                <i style={{ background: p.ink }} />
              </div>
              {p.name}
            </button>
          ))}
        </div>
        <div className="next-cta mob-only">
          <button className="btn primary" onClick={() => goTab("details")}>
            Next: add your details →
          </button>
        </div>
      </aside>

      {/* ---------------- centre: canvas + transport ---------------- */}
      <main className="center">
        <div className={"canvas" + (showBoth ? " compare" : "")}>
          {showBoth ? (
            <>
              <div>
                <span className="canvas-label">9:16 · 1080×1920</span>
                {renderStage("vertical")}
              </div>
              <div>
                <span className="canvas-label">16:9 · 1920×1080</span>
                {renderStage("horizontal")}
              </div>
            </>
          ) : (
            renderStage(project.orientation)
          )}
        </div>

        <div className="transport">
          <div className="transport-row">
            <button className="play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? (
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1" width="3.5" height="12" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1 L13 7 L3 13 Z" fill="currentColor" /></svg>
              )}
            </button>
            <span className="time">
              {fmt(T / speed)} / {fmt(total / speed)}
            </span>
            <Scrubber T={T} total={total} slots={main.slots} onSeek={seek} />
          </div>
          <div className="scenes">
            {main.scenes.map((s, i) => (
              <button
                key={s.id}
                className={"scene-chip" + (activeScene?.index === i ? " on" : "")}
                onClick={() => seek(main.slots[i].start + (s.in?.dur ?? 0) + 200)}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ---------------- right: content ---------------- */}
      <aside className="right">
        <FieldGroups groups={tpl.groups} data={project.data} set={setField} onError={say} />

        <details className="group" open={!!project.music}>
          <summary>Music</summary>
          <MusicPanel music={project.music} setMusic={(m) => update({ music: m })} onError={say} />
        </details>

        <details className="group">
          <summary>Pacing</summary>
          <div className="group-body">
            <div className="field">
              <div className="lbl">
                <span>Animation speed</span>
                <em>
                  {project.speed.toFixed(2)}× · {(total / project.speed / 1000).toFixed(1)}s
                </em>
              </div>
              <input
                className="range"
                type="range"
                min={0.7}
                max={1.4}
                step={0.05}
                value={project.speed}
                onChange={(e) => update({ speed: +e.target.value })}
              />
              <div className="hint">Lower = slower and more cinematic. Instagram favours under 30s.</div>
            </div>
            <button
              className="btn sm ghost"
              onClick={() => {
                if (confirm("Reset all fields for this template?")) setProject(defaultProject(project.templateId));
              }}
            >
              Reset template fields
            </button>
          </div>
        </details>
        <div className="next-cta mob-only">
          <button className="btn primary" onClick={openShare}>
            Next: share your invite →
          </button>
        </div>
      </aside>

      {/* ---------------- phones: bottom tabs ---------------- */}
      <nav className="mtabs" aria-label="Sections">
        {(
          [
            ["design", "Design", <path key="d" d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />],
            ["details", "Details", <path key="t" d="M4 6h16M4 12h16M4 18h10" />],
            ["preview", "Preview", <path key="p" d="M8 5v14l11-7z" />],
          ] as const
        ).map(([id, label, icon]) => (
          <button key={id} className={"mtab" + (tab === id ? " on" : "")} onClick={() => goTab(id)} aria-current={tab === id}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
            {label}
          </button>
        ))}
        <button className="mtab share" onClick={openShare}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M7 8l5-5 5 5M5 14v5h14v-5" />
          </svg>
          Share
        </button>
      </nav>

      {music ? <audio ref={audio} src={music.src} preload="auto" /> : null}
      {exporting ? <ExportDialog project={project} onClose={() => setExporting(false)} /> : null}
      {sharing ? <ShareDialog project={project} onClose={() => setSharing(false)} /> : null}
      {gallery ? (
        <TemplateGallery
          current={project.templateId}
          orientation={project.orientation}
          initial={{ category: cat }}
          onClose={() => setGallery(false)}
          onPick={(id) => {
            setGallery(false);
            chooseTemplate(id);
          }}
        />
      ) : null}
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function Scrubber({
  T,
  total,
  slots,
  onSeek,
}: {
  T: number;
  total: number;
  slots: { start: number }[];
  onSeek: (t: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const at = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    onSeek(((clientX - r.left) / r.width) * total);
  };
  const pct = (T / total) * 100;
  return (
    <div
      ref={ref}
      className="scrub"
      role="slider"
      aria-label="Timeline"
      aria-valuemin={0}
      aria-valuemax={Math.round(total)}
      aria-valuenow={Math.round(T)}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        at(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && at(e.clientX)}
    >
      <div className="track" />
      {slots.slice(1).map((s, i) => (
        <div key={i} className="mark" style={{ left: (s.start / total) * 100 + "%" }} />
      ))}
      <div className="fill" style={{ width: pct + "%" }} />
      <div className="head" style={{ left: pct + "%" }} />
    </div>
  );
}
