"use client";
import Link from "next/link";
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
import { sceneForField } from "@/lib/fieldScene";
import { VIDEO_EXPORT } from "@/lib/features";
import { LegalLinks } from "@/components/LegalLinks";
import { PalettePicker } from "@/components/PalettePicker";
import { Logo } from "@/components/site/SiteHeader";
import { startAnalytics, track } from "@/lib/analytics";
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

  useEffect(() => startAnalytics("editor"), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  /* ---------- load / autosave ---------- */
  useEffect(() => {
    // /create?template=<id>&palette=<id>&o=vertical|horizontal comes from "Customize" on a template page.
    const q = new URLSearchParams(window.location.search);
    const want = TEMPLATES.find((t) => t.id === q.get("template"));
    if (q.toString()) window.history.replaceState(null, "", window.location.pathname); // a reload keeps the user's later edits
    idbGet<Project>("project")
      .then((p) => {
        let proj = p && TEMPLATES.some((t) => t.id === p.templateId) ? p : defaultProject(want?.id ?? TEMPLATES[0].id);
        if (want) {
          if (want.id !== proj.templateId) {
            proj = defaultProject(want.id, proj);
            track("template_selected", { template_id: want.id, source: "template_page" });
          }
          const pal = want.palettes.find((x) => x.id === q.get("palette"));
          const o = q.get("o");
          proj = { ...proj, paletteId: pal?.id ?? proj.paletteId, orientation: o === "horizontal" || o === "vertical" ? o : proj.orientation };
          setTab("details"); // they just chose the design on its page: phones go straight to their names
        }
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

  /** Tapping a field shows the scene it appears in, held still, so they watch their own words go in as they type. */
  const showField = (target: EventTarget) => {
    const key = (target as HTMLElement).closest?.("[data-field]")?.getAttribute("data-field");
    const i = key && main ? sceneForField(key, main.scenes) : -1;
    if (!main || i < 0) return;
    setPlaying(false);
    seek(main.slots[i].start + main.scenes[i].duration * 0.55);
  };

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

  const chooseTemplate = (id: string, source: "sidebar" | "gallery") => {
    if (!project || id === project.templateId) return;
    track("template_selected", { template_id: id, source });
    setProject(defaultProject(id, project));
    setT(0);
    setPlaying(true);
  };

  const openShare = () => {
    if (project) track("share_dialog_opened", { template_id: project.templateId });
    setMenu(false);
    setPlaying(false);
    setSharing(true);
  };

  /** "Export MP4": the dialog where video export runs. The button only exists while VIDEO_EXPORT is on: the hosted
      site promotes the free invitation page and link, so it doesn't mention video at all. */
  const openExport = () => {
    track("video_export_clicked", { is_available: VIDEO_EXPORT });
    setMenu(false);
    setPlaying(false);
    setExporting(true);
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
    return <div className="studio-loading">Loading studio…</div>;
  }

  const tpl = main.template;
  // Colours sit right under the preview: on the canvas on desktop, at the top of the Design panel on phones.
  const palNow = tpl.palettes.find((p) => p.id === project.paletteId) ?? tpl.palettes[0];
  const colours = <PalettePicker palettes={tpl.palettes} value={palNow.id} onChange={(id) => update({ paletteId: id })} />;
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
          <Logo />
          <span className="crumb">
            <Link href="/templates">Templates</Link> / {tpl.name}
          </span>
        </div>
        <ol className="flow desk-only" aria-label="Steps">
          <li>
            <b>01</b> Design
          </li>
          <li>
            <b>02</b> Details
          </li>
          <li>
            <button onClick={openShare}>
              <b>03</b> Get link
            </button>
          </li>
        </ol>

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
            <button className="btn desk-only" onClick={openShare} title="A link that plays the invitation in your guests' browser">
              Get link
            </button>
            <button className="btn primary desk-only" onClick={openExport}>
              Export MP4
            </button>
          </>
        ) : (
          <button className="btn primary desk-only" onClick={openShare} title="A link that plays the invitation in your guests' browser">
            Get invite link
          </button>
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
                {VIDEO_EXPORT ? (
                  <button role="menuitem" onClick={openExport}>
                    ⬇ Export MP4
                  </button>
                ) : null}
                <LegalLinks className="menu-legal" />
              </div>
            </>
          ) : null}
        </div>
      </header>

      {/* ---------------- left: templates (phones: colours first, the Design panel sits right under the preview) ---------------- */}
      <aside className="left">
        <div className="looks-m mob-only">
          <div className="section-title">
            Colours
          </div>
          {colours}
        </div>
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
            <button key={t.id} className={"tpl-card" + (t.id === project.templateId ? " on" : "")} onClick={() => chooseTemplate(t.id, "sidebar")}>
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

        <LegalLinks />
        <div className="next-cta mob-only">
          <button className="btn primary" onClick={() => goTab("details")}>
            Next: add your names →
          </button>
        </div>
      </aside>

      {/* ---------------- centre: canvas + transport ---------------- */}
      <main className="center">
        <div className="canvas">
          <div className={"canvas-stage" + (showBoth ? " compare" : "")}>
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
          <div className="looks desk-only">
            <span className="looks-label">
              Colours
            </span>
            {colours}
          </div>
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
      <aside className="right" onFocus={(e) => showField(e.target)}>
        <p className="field-hint">Tap a field and the preview jumps to where it appears.</p>
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
            Next: get your invite link →
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
            <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
          </svg>
          Get link
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
            chooseTemplate(id, "gallery");
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
