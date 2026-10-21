"use client";
import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { E, fade, maskUp, mix, pop, rise, tw } from "@/lib/anim";
import type { EventItem, Theme } from "@/lib/types";
import { DiamondRule, Photo, Reveal, dateParts, prettyTime } from "./primitives";

/* =====================================================================
 * Text blocks shared by templates. They read fonts/colours from the
 * theme, so each template still looks like itself.
 * `v` = vertical (9:16). Sizes are given for 9:16 and scaled for 16:9.
 * ===================================================================== */

type Base = { t: number; theme: Theme; v: boolean; start?: number };
/** 9:16 is seen on a phone at about 0.36x: 34 design px is about 12 px there, the least a label can be and still be read. */
const KICKER_MIN = 34;
const pick = <T,>(v: boolean, a: T, b: T) => (v ? a : b);

/** Small spaced caps label. */
export function Kicker({ t, theme, v, start = 200, size = 30, color, children, spacing = "0.34em", font, style, upper = true }: Base & { size?: number; color?: string; children: ReactNode; spacing?: string; font?: string; style?: CSSProperties; upper?: boolean }) {
  return (
    <div
      style={{
        fontFamily: font ?? theme.fontBody,
        color: color ?? theme.soft,
        fontSize: pick(v, Math.max(size, KICKER_MIN), size * 1.12),
        letterSpacing: spacing,
        textTransform: upper ? "uppercase" : "none",
        ...fade(t, { start, dur: 800 }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Masked headline. */
export function Headline({ t, theme, v, start = 400, size = 120, font, color, children, italic, spacing = "0", lineHeight = 1.15, dur = 1300, style }: Base & { size?: number; font?: string; color?: string; children: ReactNode; italic?: boolean; spacing?: string; lineHeight?: number; dur?: number; style?: CSSProperties }) {
  return (
    <Reveal>
      <span
        style={{
          fontFamily: font ?? theme.fontDisplay,
          color: color ?? theme.ink,
          fontSize: pick(v, size, size * 1.08),
          fontStyle: italic ? "italic" : "normal",
          letterSpacing: spacing,
          lineHeight,
          display: "block",
          ...maskUp(t, { start, dur }),
          ...style,
        }}
      >
        {children}
      </span>
    </Reveal>
  );
}

/** Weekday / big day / month year / time. */
export function DateBlock({ t, theme, v, start = 300, date, time, timeLabel = "", dayFont, accent, divider = true }: Base & { date?: string; time?: string; timeLabel?: string; dayFont?: string; accent?: string; divider?: boolean }) {
  const d = dateParts(date);
  const tm = prettyTime(time);
  return (
    <div style={{ textAlign: "center" }}>
      <Kicker t={t} theme={theme} v={v} start={start} size={36}>
        {d.weekday}
      </Kicker>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: pick(v, 34, 40), margin: pick(v, 22, 20) + "px 0" }}>
        <span style={{ height: 1.5, width: pick(v, 120, 170) * tw(t, start + 200, 900, E.inOutCubic), background: theme.line }} />
        <Headline t={t} theme={theme} v={v} start={start + 150} size={190} font={dayFont} color={accent ?? theme.accent} lineHeight={1}>
          {d.day}
        </Headline>
        <span style={{ height: 1.5, width: pick(v, 120, 170) * tw(t, start + 200, 900, E.inOutCubic), background: theme.line }} />
      </div>
      <Headline t={t} theme={theme} v={v} start={start + 600} size={60} spacing="0.16em" style={{ textTransform: "uppercase" }}>
        {d.month} {d.year}
      </Headline>
      {divider ? (
        <div style={{ display: "grid", placeItems: "center", marginTop: pick(v, 34, 28) }}>
          <DiamondRule t={t} start={start + 900} width={pick(v, 300, 340)} color={theme.line} />
        </div>
      ) : null}
      {tm ? (
        <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: pick(v, 46, 46), letterSpacing: "0.14em", marginTop: pick(v, 30, 24), ...rise(t, { start: start + 1200, dur: 900, dist: 18 }) }}>
          {timeLabel ? <span style={{ color: theme.soft }}>{timeLabel} </span> : null}
          {tm}
        </div>
      ) : null}
    </div>
  );
}

/** Label + venue name + address lines. */
export function VenueBlock({ t, theme, v, start = 300, label = "Venue", name, address, nameSize = 84, maxWidth }: Base & { label?: string; name?: string; address?: string; nameSize?: number; maxWidth?: number }) {
  const lines = String(address || "").split("\n").filter(Boolean);
  return (
    <div style={{ textAlign: "center", maxWidth: maxWidth ?? pick(v, 900, 1400) }}>
      {label ? (
        <Kicker t={t} theme={theme} v={v} start={start} size={30} style={{ marginBottom: pick(v, 26, 22) }}>
          {label}
        </Kicker>
      ) : null}
      <Headline t={t} theme={theme} v={v} start={start + 250} size={nameSize} lineHeight={1.2}>
        {name}
      </Headline>
      <div style={{ marginTop: pick(v, 26, 22) }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: pick(v, 46, 44), lineHeight: 1.45, ...rise(t, { start: start + 900 + i * 160, dur: 900, dist: 16 }) }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Label — value" schedule lines, e.g. "Milni — 9:00 AM". */
export function Schedule({ t, theme, v, start = 400, lines, width, size = 40 }: Base & { lines: string[]; width?: number; size?: number }) {
  return (
    <div style={{ width: width ?? pick(v, 820, 1100) }}>
      {lines.map((l, i) => {
        const [a, b] = l.split(/\s+[—–-]\s+/);
        const st = start + i * 220;
        return (
          <div key={i} style={{ display: "flex", justifyContent: b ? "space-between" : "center", alignItems: "baseline", gap: 30, padding: pick(v, "18px 0", "16px 0"), borderBottom: "1px solid " + theme.line + "55", ...rise(t, { start: st, dur: 900, dist: 18 }) }}>
            <span style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: pick(v, size, size * 1.12) }}>{a}</span>
            {b ? <span style={{ fontFamily: theme.fontBody, color: theme.accent, fontSize: pick(v, size * 0.85, size * 0.95), letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{b}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/** Circular photo with a metallic ring. */
export function PhotoCircle({ t, d, theme, src, size, start = 0, ring, ringWidth = 10 }: { t: number; d: number; theme: Theme; src?: string; size: number; start?: number; ring?: string; ringWidth?: number }) {
  const p = tw(t, start, 1300, E.outExpo);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: ringWidth,
        background: ring ?? "conic-gradient(from 200deg, " + theme.accent + ", " + theme.line + ", " + theme.accent + ", " + theme.line + ", " + theme.accent + ")",
        boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        transform: "scale(" + mix(p, 0.85, 1).toFixed(4) + ")",
        opacity: Math.min(1, p * 1.5),
      }}
    >
      <Photo src={src} t={t} d={d} theme={theme} from={1.1} to={1.2} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
    </div>
  );
}

/** Two names with a joiner, stacked in 9:16 and side by side in 16:9. */
export function Names({ t, theme, v, start = 400, a, b, joiner = "&", size = 150, font, joinerFont, color, joinerColor, stack }: Base & { a?: string; b?: string; joiner?: string; size?: number; font?: string; joinerFont?: string; color?: string; joinerColor?: string; stack?: boolean }) {
  const column = stack ?? v;
  return (
    <div style={{ display: "flex", flexDirection: column ? "column" : "row", alignItems: "center", justifyContent: "center", gap: column ? pick(v, 6, 4) : 50, textAlign: "center" }}>
      <Headline t={t} theme={theme} v={v} start={start} size={size} font={font ?? theme.fontScript} color={color}>
        {a}
      </Headline>
      <div style={{ fontFamily: joinerFont ?? theme.fontDisplay, color: joinerColor ?? theme.accent, fontSize: pick(v, size * 0.34, size * 0.36), letterSpacing: "0.2em", ...pop(t, { start: start + 600, dur: 900 }) }}>{joiner}</div>
      <Headline t={t} theme={theme} v={v} start={start + 900} size={size} font={font ?? theme.fontScript} color={color}>
        {b}
      </Headline>
    </div>
  );
}

/** One function in a multi-event invite. */
export function EventCard({ t, theme, v, start = 200, ev, index, total, icon, nameFont }: Base & { ev: EventItem; index: number; total: number; icon?: ReactNode; nameFont?: string }) {
  const d = dateParts(ev.date);
  const tm = prettyTime(ev.time);
  return (
    <div style={{ textAlign: "center", maxWidth: pick(v, 900, 1500) }}>
      <Kicker t={t} theme={theme} v={v} start={start} size={34}>
        Function {index + 1} of {total}
      </Kicker>
      {icon ? <div style={{ display: "grid", placeItems: "center", margin: pick(v, "26px 0 8px", "18px 0 4px"), ...pop(t, { start: start + 200, dur: 900 }) }}>{icon}</div> : null}
      <Headline t={t} theme={theme} v={v} start={start + 350} size={pick(v, 150, 140)} font={nameFont ?? theme.fontScript} color={theme.accent} lineHeight={1.25}>
        {ev.name}
      </Headline>
      <div style={{ display: "grid", placeItems: "center", margin: pick(v, "24px 0", "18px 0") }}>
        <DiamondRule t={t} start={start + 800} width={pick(v, 340, 420)} color={theme.line} />
      </div>
      <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: pick(v, 58, 58), letterSpacing: "0.06em", ...rise(t, { start: start + 1000, dur: 900, dist: 20 }) }}>
        {d.weekday}, {Number(d.day)} {d.month}
      </div>
      {tm ? (
        <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: pick(v, 46, 44), letterSpacing: "0.14em", marginTop: 12, ...rise(t, { start: start + 1200, dur: 900, dist: 16 }) }}>{tm}</div>
      ) : null}
      {ev.venue ? (
        <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: pick(v, 48, 46), marginTop: pick(v, 34, 26), ...rise(t, { start: start + 1400, dur: 900, dist: 16 }) }}>{ev.venue}</div>
      ) : null}
      {ev.note ? (
        <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: pick(v, 40, 34), fontStyle: "italic", marginTop: 12, ...fade(t, { start: start + 1700, dur: 900 }) }}>{ev.note}</div>
      ) : null}
    </div>
  );
}

/** Compact "all functions at a glance" table, good for a screenshot or Status. */
export function EventsOverview({ t, theme, v, start = 200, events }: Base & { events: EventItem[] }) {
  return (
    <div style={{ width: pick(v, 900, 1500) }}>
      {events.map((ev, i) => {
        const d = dateParts(ev.date);
        const st = start + i * 200;
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: pick(v, "150px 1fr", "180px 1fr 1fr"), alignItems: "center", gap: pick(v, 24, 40), padding: pick(v, "22px 0", "20px 0"), borderBottom: "1px solid " + theme.line + "55", ...rise(t, { start: st, dur: 900, dist: 20 }) }}>
            <div style={{ textAlign: "center", borderRight: "1px solid " + theme.line + "77", paddingRight: 20 }}>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.accent, fontSize: pick(v, 64, 70), lineHeight: 1 }}>{d.day}</div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: pick(v, 28, 24), letterSpacing: "0.2em" }}>{d.monthShort}</div>
            </div>
            <div>
              <div style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontSize: pick(v, 52, 50) }}>{ev.name}</div>
              <div style={{ fontFamily: theme.fontBody, color: theme.soft, fontSize: pick(v, 36, 30), marginTop: 4, lineHeight: 1.35 }}>
                {prettyTime(ev.time)}
                {v && ev.venue ? " · " + ev.venue : ""}
              </div>
            </div>
            {!v ? <div style={{ fontFamily: theme.fontBody, color: theme.ink, fontSize: 32, textAlign: "right" }}>{ev.venue}</div> : null}
          </div>
        );
      })}
    </div>
  );
}

export const lines = (s?: string) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
