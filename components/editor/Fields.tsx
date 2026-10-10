"use client";
import React, { useRef, useState } from "react";
import type { Asset, EventItem, Field, FieldGroup } from "@/lib/types";
import { compressImage, mediaDuration, readAsDataURL } from "@/lib/project";

type Setter = (key: string, value: any) => void;

const MAX_VIDEO_MB = 80;

/** Renders a template's field groups. Adding a new field type = one case below. */
export function FieldGroups({
  groups,
  data,
  set,
  onError,
}: {
  groups: FieldGroup[];
  data: Record<string, any>;
  set: Setter;
  onError: (msg: string) => void;
}) {
  return (
    <>
      {groups.map((g, i) => (
        <details key={g.title} className="group" open={i < 2}>
          <summary>{g.title}</summary>
          <div className="group-body">
            {g.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={data[f.key]} set={set} onError={onError} />
            ))}
          </div>
        </details>
      ))}
    </>
  );
}

function Label({ field, value }: { field: Field; value: any }) {
  const max = "max" in field && field.type !== "gallery" ? field.max : undefined;
  return (
    <div className="lbl">
      <span>{field.label}</span>
      {max ? <em>{String(value ?? "").length}/{max}</em> : null}
    </div>
  );
}

function FieldInput({ field, value, set, onError }: { field: Field; value: any; set: Setter; onError: (m: string) => void }) {
  switch (field.type) {
    case "text":
      return (
        <div className="field">
          <Label field={field} value={value} />
          <input
            className="input"
            value={value ?? ""}
            maxLength={field.max}
            placeholder={field.placeholder}
            onChange={(e) => set(field.key, e.target.value)}
          />
          {field.hint ? <div className="hint">{field.hint}</div> : null}
        </div>
      );
    case "textarea":
      return (
        <div className="field">
          <Label field={field} value={value} />
          <textarea
            className="input"
            rows={3}
            value={value ?? ""}
            maxLength={field.max}
            placeholder={field.placeholder}
            onChange={(e) => set(field.key, e.target.value)}
          />
          {field.hint ? <div className="hint">{field.hint}</div> : null}
        </div>
      );
    case "date":
    case "time":
      return (
        <div className="field">
          <Label field={field} value={value} />
          <input className="input" type={field.type} value={value ?? ""} onChange={(e) => set(field.key, e.target.value)} />
        </div>
      );
    case "select":
      return (
        <div className="field">
          <Label field={field} value={value} />
          <select className="input" value={value ?? ""} onChange={(e) => set(field.key, e.target.value)}>
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case "toggle":
      return (
        <div className="field toggle">
          <span className="lbl" style={{ margin: 0 }}>{field.label}</span>
          <button
            type="button"
            aria-pressed={value !== false}
            aria-label={field.label}
            className={"switch" + (value !== false ? " on" : "")}
            onClick={() => set(field.key, value === false)}
          />
        </div>
      );
    case "image":
      return <ImageField field={field} value={value} set={set} onError={onError} />;
    case "gallery":
      return <GalleryField field={field} value={value} set={set} onError={onError} />;
    case "video":
      return <VideoField field={field} value={value} set={set} onError={onError} />;
    case "events":
      return <EventsField field={field} value={value} set={set} />;
  }
}

/* ---------------- media fields ---------------- */

function Drop({
  accept,
  multiple,
  onFiles,
  children,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  children: React.ReactNode;
}) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  return (
    <label
      className={"drop" + (over ? " over" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(Array.from(e.target.files || []));
          e.target.value = "";
        }}
      />
      {children}
    </label>
  );
}

function ImageField({ field, value, set, onError }: { field: Extract<Field, { type: "image" }>; value: Asset | null; set: Setter; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const take = async (files: File[]) => {
    const f = files.find((x) => x.type.startsWith("image/"));
    if (!f) return onError("That file is not an image.");
    setBusy(true);
    try {
      set(field.key, { src: await compressImage(f), name: f.name, kind: "image" } satisfies Asset);
    } catch {
      onError("Could not read that image.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="field">
      <Label field={field} value={value} />
      {value?.src ? (
        <div className="media-row">
          <img src={value.src} alt="" />
          <div className="meta">
            <div>{value.name}</div>
            <small>{field.ratio ? "Best crop " + field.ratio : "Image"}</small>
          </div>
          <button className="btn sm ghost" onClick={() => set(field.key, null)}>
            Remove
          </button>
        </div>
      ) : (
        <Drop accept="image/*" onFiles={take}>
          {busy ? "Processing..." : "Drop a photo or click to upload"}
        </Drop>
      )}
      {field.hint ? <div className="hint">{field.hint}</div> : null}
    </div>
  );
}

function GalleryField({ field, value, set, onError }: { field: Extract<Field, { type: "gallery" }>; value: Asset[] | null; set: Setter; onError: (m: string) => void }) {
  const items: Asset[] = Array.isArray(value) ? value : [];
  const [busy, setBusy] = useState(false);
  const add = async (files: File[]) => {
    const imgs = files.filter((x) => x.type.startsWith("image/")).slice(0, field.max - items.length);
    if (!imgs.length) return onError(items.length >= field.max ? "Gallery is full (" + field.max + " max)." : "No images in that selection.");
    setBusy(true);
    try {
      const out: Asset[] = [];
      for (const f of imgs) out.push({ src: await compressImage(f, 1800, 0.88), name: f.name, kind: "image" });
      set(field.key, [...items, ...out]);
    } finally {
      setBusy(false);
    }
  };
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    set(field.key, next);
  };
  return (
    <div className="field">
      <div className="lbl">
        <span>{field.label}</span>
        <em>
          {items.length}/{field.max}
        </em>
      </div>
      <div className="gallery">
        {items.map((a, i) => (
          <div className="g" key={i}>
            <img src={a.src} alt="" />
            <span className="n">{i + 1}</span>
            <div className="ctl">
              <button title="Move earlier" onClick={() => move(i, -1)}>
                ←
              </button>
              <button title="Remove" onClick={() => set(field.key, items.filter((_, k) => k !== i))}>
                ✕
              </button>
              <button title="Move later" onClick={() => move(i, 1)}>
                →
              </button>
            </div>
          </div>
        ))}
        {items.length < field.max ? (
          <label className="add">
            <input type="file" accept="image/*" multiple hidden onChange={(e) => { add(Array.from(e.target.files || [])); e.target.value = ""; }} />
            {busy ? "…" : "+"}
          </label>
        ) : null}
      </div>
      {field.hint ? <div className="hint">{field.hint}</div> : null}
    </div>
  );
}

function VideoField({ field, value, set, onError }: { field: Extract<Field, { type: "video" }>; value: Asset | null; set: Setter; onError: (m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const take = async (files: File[]) => {
    const f = files.find((x) => x.type.startsWith("video/"));
    if (!f) return onError("That file is not a video.");
    if (f.size > MAX_VIDEO_MB * 1024 * 1024) return onError("Video is over " + MAX_VIDEO_MB + " MB. Trim or compress it first.");
    setBusy(true);
    try {
      const src = await readAsDataURL(f);
      const duration = await mediaDuration(src, "video");
      set(field.key, { src, name: f.name, kind: "video", duration } satisfies Asset);
    } catch {
      onError("Could not read that video.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="field">
      <Label field={field} value={value} />
      {value?.src ? (
        <div className="media-row">
          <video src={value.src} muted />
          <div className="meta">
            <div>{value.name}</div>
            <small>{value.duration ? value.duration.toFixed(1) + "s" : "Video"}</small>
          </div>
          <button className="btn sm ghost" onClick={() => set(field.key, null)}>
            Remove
          </button>
        </div>
      ) : (
        <Drop accept="video/mp4,video/webm,video/quicktime" onFiles={take}>
          {busy ? "Loading video..." : "Drop an MP4 / MOV / WebM clip"}
        </Drop>
      )}
      {field.hint ? <div className="hint">{field.hint}</div> : null}
    </div>
  );
}

/* ---------------- multi-event list (Haldi, Mehendi, Sangeet, Pheras ...) ---------------- */

function EventsField({ field, value, set }: { field: Extract<Field, { type: "events" }>; value: EventItem[] | null; set: Setter }) {
  const items: EventItem[] = Array.isArray(value) ? value : [];
  const listId = "presets-" + field.key;
  const put = (next: EventItem[]) => set(field.key, next);
  const patch = (i: number, p: Partial<EventItem>) => put(items.map((e, k) => (k === i ? { ...e, ...p } : e)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    put(next);
  };
  const add = (name: string) => {
    if (items.length >= field.max) return;
    const last = items[items.length - 1];
    put([...items, { name, date: last?.date ?? "", time: "", venue: last?.venue ?? "" }]);
  };
  const unused = field.presets.filter((p) => !items.some((e) => e.name.toLowerCase() === p.toLowerCase()));
  return (
    <div className="field">
      <div className="lbl">
        <span>{field.label}</span>
        <em>
          {items.length}/{field.max}
        </em>
      </div>
      <datalist id={listId}>
        {field.presets.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
      <div className="events">
        {items.map((e, i) => (
          <div className="event" key={i}>
            <div className="event-head">
              <span className="event-n">{i + 1}</span>
              <input className="input" list={listId} value={e.name} placeholder="Function name" maxLength={30} onChange={(x) => patch(i, { name: x.target.value })} />
              <button className="mini" title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="mini" title="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
              <button className="mini" title="Remove" onClick={() => put(items.filter((_, k) => k !== i))}>✕</button>
            </div>
            <div className="row2">
              <input className="input" type="date" value={e.date} onChange={(x) => patch(i, { date: x.target.value })} />
              <input className="input" type="time" value={e.time} onChange={(x) => patch(i, { time: x.target.value })} />
            </div>
            <input className="input" value={e.venue} placeholder="Venue" maxLength={50} onChange={(x) => patch(i, { venue: x.target.value })} />
            <input className="input" value={e.note ?? ""} placeholder="Note (optional), e.g. Baraat at 6:30 PM" maxLength={50} onChange={(x) => patch(i, { note: x.target.value })} />
          </div>
        ))}
      </div>
      {items.length < field.max ? (
        <div className="chips" style={{ marginTop: 10 }}>
          {unused.slice(0, 6).map((p) => (
            <button key={p} className="chip add-chip" onClick={() => add(p)}>
              + {p}
            </button>
          ))}
          <button className="chip add-chip" onClick={() => add("")}>
            + Custom
          </button>
        </div>
      ) : null}
      {field.hint ? <div className="hint">{field.hint}</div> : null}
    </div>
  );
}

/* ---------------- music ---------------- */

export function MusicPanel({
  music,
  setMusic,
  onError,
}: {
  music: { src: string; name: string; volume: number; offset: number } | null;
  setMusic: (m: { src: string; name: string; volume: number; offset: number } | null) => void;
  onError: (m: string) => void;
}) {
  const take = async (files: File[]) => {
    const f = files.find((x) => x.type.startsWith("audio/"));
    if (!f) return onError("That file is not audio.");
    if (f.size > 25 * 1024 * 1024) return onError("Audio is over 25 MB.");
    setMusic({ src: await readAsDataURL(f), name: f.name, volume: 0.8, offset: 0 });
  };
  return (
    <div className="group-body">
      {music ? (
        <>
          <div className="media-row">
            <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--line)", display: "grid", placeItems: "center" }}>♪</div>
            <div className="meta">
              <div>{music.name}</div>
              <small>Fades out at the end automatically</small>
            </div>
            <button className="btn sm ghost" onClick={() => setMusic(null)}>
              Remove
            </button>
          </div>
          <div className="field">
            <div className="lbl">
              <span>Volume</span>
              <em>{Math.round(music.volume * 100)}%</em>
            </div>
            <input className="range" type="range" min={0} max={1} step={0.01} value={music.volume} onChange={(e) => setMusic({ ...music, volume: +e.target.value })} />
          </div>
          <div className="field">
            <div className="lbl">
              <span>Start song at</span>
              <em>{music.offset.toFixed(1)}s</em>
            </div>
            <input className="range" type="range" min={0} max={120} step={0.5} value={music.offset} onChange={(e) => setMusic({ ...music, offset: +e.target.value })} />
            <div className="hint">Skip a slow intro so the hook lands on the names.</div>
          </div>
        </>
      ) : (
        <Drop accept="audio/*" onFiles={take}>
          Drop an MP3 / M4A / WAV
        </Drop>
      )}
    </div>
  );
}
