/* "How well do you know us?" (owner, 2026-11-17: more interactive templates). The couple writes one question with up to
   three answers in the studio (Project.quiz); buildTimeline adds this scene before the invite's closing scene, drawn
   in the design's own fonts and palette, so it works for every design and language version.

   Like every scene it is a pure function of time: the question and the answers come in, then at REVEAL the right
   answer lights up and the others fade. That is what the MP4 shows. On the guest page (app/e/[slug]/LiveInvite.tsx)
   the story stops just before REVEAL, guests tap A, B or C, and then it plays the reveal. */

import React from "react";
import type { QuizOptions, Scene, Theme } from "./types";
import { E, clamp, fade, mix, rise, tw } from "./anim";
import { Kicker } from "@/components/blocks";

export const QUIZ_ID = "quiz";
export const QUIZ_DURATION = 7600;
/** When the right answer lights up, ms into the scene. The guest page asks before this. */
export const QUIZ_REVEAL = 4600;
/** When all the answers are on screen: the guest page stops here to ask. */
export const QUIZ_ASK = 2600;
export const LETTERS = ["A", "B", "C"];

/** "#a01d38" at 0..1 opacity ("#a01d3880"); any other colour as it is. */
const withAlpha = (hex: string, a: number) => (/^#[0-9a-f]{6}$/i.test(hex) ? hex + Math.round(clamp(a) * 255).toString(16).padStart(2, "0") : hex);

export type Quiz = { question: string; options: string[]; answer: number };

/** The couple's quiz, cleaned, or null when it is off or not filled in (a question and at least two answers). */
export function quizOf(q?: QuizOptions): Quiz | null {
  if (!q?.on) return null;
  const question = (q.question ?? "").trim().slice(0, 90);
  const all = (q.options ?? []).map((o) => (typeof o === "string" ? o.trim().slice(0, 40) : ""));
  const answer = typeof q.answer === "number" ? q.answer : 0;
  if (!question || !all[answer]) return null;
  // Empty answers drop out; the right one keeps its place among the rest.
  const options = all.filter(Boolean).slice(0, 3);
  const at = options.indexOf(all[answer]);
  return options.length >= 2 && at >= 0 ? { question, options, answer: at } : null;
}

export function quizScene(quiz: Quiz, vertical: boolean, theme: Theme): Scene {
  const S = <T,>(v: T, h: T): T => (vertical ? v : h);
  return {
    id: QUIZ_ID,
    label: "Quiz",
    duration: QUIZ_DURATION,
    in: { kind: "fade", dur: 700 },
    out: { kind: "fade", dur: 700 },
    render: ({ t }) => {
      const reveal = tw(t, QUIZ_REVEAL, 700, E.outCubic);
      return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: S("0 90px", "0 200px"), textAlign: "center" }}>
          <Kicker t={t} theme={theme} v={vertical} start={200} size={36}>
            How well do you know us?
          </Kicker>
          <div
            style={{
              marginTop: S(40, 28),
              fontFamily: theme.fontDisplay,
              color: theme.ink,
              fontSize: S(80, 76),
              lineHeight: 1.2,
              maxWidth: S(900, 1400),
              ...rise(t, { start: 500, dur: 1000, dist: 30 }),
            }}
          >
            {quiz.question}
          </div>
          <div style={{ marginTop: S(64, 46), display: "grid", gridTemplateColumns: S("1fr", "repeat(" + quiz.options.length + ", minmax(0, 1fr))"), gap: S(28, 30), width: S(820, 1400) }}>
            {quiz.options.map((o, i) => {
              const right = i === quiz.answer;
              const fill = right ? reveal : 0;
              const p = tw(t, 1100 + i * 260, 900, E.outExpo);
              const grow = right ? mix(tw(t, QUIZ_REVEAL, 500, E.outBack), 1, 1.05) : 1;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    padding: S("26px 34px", "26px 30px"),
                    borderRadius: 999,
                    border: "3px solid " + theme.line,
                    background: right && fill > 0 ? withAlpha(theme.accent, fill) : "transparent",
                    color: right && fill > 0.5 ? theme.bg : theme.ink,
                    textAlign: "left",
                    opacity: clamp(p * 1.35) * (right ? 1 : mix(reveal, 1, 0.35)),
                    transform: "translate3d(0," + mix(p, 26, 0).toFixed(2) + "px,0) scale(" + grow.toFixed(4) + ")",
                  }}
                >
                  <span
                    style={{
                      flex: "none",
                      width: S(70, 64),
                      height: S(70, 64),
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: theme.line,
                      color: theme.bg,
                      fontFamily: theme.fontBody,
                      fontSize: S(38, 34),
                      fontWeight: 700,
                    }}
                  >
                    {right && fill > 0.5 ? "✓" : LETTERS[i]}
                  </span>
                  <span style={{ fontFamily: theme.fontBody, fontSize: S(50, 44), lineHeight: 1.2 }}>{o}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: S(50, 36), fontFamily: theme.fontBody, fontStyle: "italic", color: theme.soft, fontSize: S(42, 40), ...fade(t, { start: QUIZ_REVEAL + 400, dur: 800 }) }}>
            {quiz.options[quiz.answer]}, of course!
          </div>
        </div>
      );
    },
  };
}
