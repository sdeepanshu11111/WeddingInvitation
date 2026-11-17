"use client";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useNearViewport } from "@/components/LivePreview";
import { makeTheme } from "@/lib/project";
import { getTemplate } from "@/lib/templates";
import { rsvpMessage, type RsvpResponse, RSVP_LABEL } from "@/lib/rsvp";
import { track } from "@/lib/analytics";
import { Envelope, ScratchCard, TapMoment } from "@/app/e/[slug]/Interactive";
import { Arrow } from "./Landing";

/* Home page, "What your guests will do" (owner, 2026-11-17: an interactive, conversion-focused home page). The visitor
   tries the guest page's moments themselves in a phone frame: open the envelope, scratch the date, shower the couple,
   answer a quiz, RSVP. The same components as the real guest page (app/e/[slug]/Interactive.tsx), in a demo that
   sends nothing anywhere: no counts, no WhatsApp, only the analytics event `home_demo_step`. Mounted only near the
   viewport, so the home page stays light. Sample couple, labelled as an example. */

type Step = "open" | "scratch" | "shower" | "quiz" | "rsvp";
const STEPS: { id: Step; label: string; title: string; text: string }[] = [
  { id: "open", label: "Open", title: "A sealed envelope", text: "Your invitation arrives sealed with your initials. Guests tap the wax seal and it opens." },
  { id: "scratch", label: "Scratch", title: "Scratch to reveal the date", text: "Gold foil hides the big day until your guests scratch it off. Try it with your finger." },
  { id: "shower", label: "Shower", title: "Shower the couple", text: "On your names, guests tap to shower flowers. Haldi gets turmeric, sangeet gets confetti." },
  { id: "quiz", label: "Quiz", title: "How well do they know you?", text: "Ask one question about the two of you. Guests guess, then see how everyone else did." },
  { id: "rsvp", label: "RSVP", title: "RSVP in one tap", text: "Guests say if they're coming and how many, and the reply lands on your WhatsApp. You see the count on your invite." },
];

const COUPLE = "Aarav & Ananya";
const QUIZ = { question: "Where did we first meet?", options: ["At college", "At a friend's wedding", "On an app"], answer: 1 };

export function GuestDemo() {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  const [step, setStep] = useState<Step>("open");
  const [run, setRun] = useState(0); // remounts the current moment ("Try again")
  const theme = useMemo(() => makeTheme(getTemplate("royal-mandala"), "maroon"), []);
  const i = STEPS.findIndex((s) => s.id === step);
  const go = (s: Step) => {
    setStep(s);
    setRun((r) => r + 1);
    track("home_demo_step", { step: s });
  };
  const next = STEPS[i + 1];

  return (
    <div ref={ref} className="gdemo">
      <div className="gdemo-steps" role="tablist" aria-label="Try what your guests can do">
        {STEPS.map((s, n) => (
          <button key={s.id} role="tab" aria-selected={s.id === step} className={"gdemo-step" + (s.id === step ? " on" : "")} onClick={() => go(s.id)}>
            <span className="gdemo-n">{n + 1}</span>
            <span className="gdemo-label">{s.label}</span>
            <span className="gdemo-title">{s.title}</span>
            <span className="gdemo-text">{s.text}</span>
          </button>
        ))}
      </div>

      <div className="gdemo-stage">
        <div
          className="gdemo-phone"
          style={{ background: "radial-gradient(ellipse at 50% 30%, " + theme.bg + " 0%, " + theme.bg2 + " 90%)", color: theme.ink }}
        >
          <span className="gdemo-eg">Example</span>
          {near ? <Moment key={step + run} step={step} theme={theme} onAgain={() => setRun((r) => r + 1)} /> : null}
        </div>
        <p className="gdemo-caption">
          <b>{STEPS[i].title}.</b> {STEPS[i].text}
        </p>
        <div className="gdemo-nav">
          {next ? (
            <button className="ghost-btn" onClick={() => go(next.id)}>
              Next: {next.label} <Arrow />
            </button>
          ) : (
            <Link href="/templates" className="cta-btn" onClick={() => track("home_cta_clicked", { section: "guest_demo" })}>
              Make yours <Arrow />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

type Theme = ReturnType<typeof makeTheme>;

function Moment({ step, theme, onAgain }: { step: Step; theme: Theme; onAgain: () => void }) {
  if (step === "open") return <OpenMoment theme={theme} />;
  if (step === "scratch") return <ScratchMoment theme={theme} onAgain={onAgain} />;
  if (step === "shower") return <ShowerMoment theme={theme} onAgain={onAgain} />;
  if (step === "quiz") return <QuizMoment theme={theme} onAgain={onAgain} />;
  return <RsvpMoment theme={theme} />;
}

/** The couple's names, as the invite shows them. */
function Names({ theme, small }: { theme: Theme; small?: boolean }) {
  return (
    <div className={"gdemo-names" + (small ? " sm" : "")}>
      <span style={{ color: theme.accent }}>The wedding of</span>
      <b style={{ color: theme.ink }}>{COUPLE}</b>
    </div>
  );
}

function OpenMoment({ theme }: { theme: Theme }) {
  const [opening, setOpening] = useState(false);
  return (
    <button className="gdemo-fill gdemo-open" onClick={() => setOpening(true)} aria-label="Tap the seal to open">
      <span className="gdemo-kicker" style={{ color: theme.accent }}>
        You&apos;re invited
      </span>
      <Envelope theme={theme} title={COUPLE} opening={opening} />
      <span className="gdemo-hint" style={{ color: theme.accent }}>
        {opening ? "Opened ✨" : "Tap the seal"}
      </span>
    </button>
  );
}

function ScratchMoment({ theme, onAgain }: { theme: Theme; onAgain: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="gdemo-fill">
      <Names theme={theme} small />
      <div className="gdemo-date" style={{ borderColor: theme.line }}>
        <span style={{ color: theme.soft }}>Tuesday</span>
        <b style={{ color: theme.accent }}>8</b>
        <span style={{ color: theme.ink }}>December 2026</span>
      </div>
      {done ? (
        <button className="gdemo-again" onClick={onAgain}>
          ↻ Scratch again
        </button>
      ) : (
        <ScratchCard theme={theme} onDone={() => setDone(true)} />
      )}
    </div>
  );
}

function ShowerMoment({ theme, onAgain }: { theme: Theme; onAgain: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div className="gdemo-fill">
      <Names theme={theme} />
      {done ? (
        <button className="gdemo-again" onClick={onAgain}>
          ↻ Shower again
        </button>
      ) : (
        <TapMoment kind="flowers" idleMs={9000} onDone={() => setDone(true)} />
      )}
    </div>
  );
}

function QuizMoment({ theme, onAgain }: { theme: Theme; onAgain: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="gdemo-fill gdemo-quiz">
      <span className="gdemo-kicker" style={{ color: theme.soft }}>
        How well do you know us?
      </span>
      <b className="gdemo-q" style={{ color: theme.ink }}>
        {QUIZ.question}
      </b>
      <div className="gdemo-opts">
        {QUIZ.options.map((o, n) => {
          const right = picked !== null && n === QUIZ.answer;
          const wrong = picked === n && n !== QUIZ.answer;
          return (
            <button
              key={n}
              className={"gdemo-opt" + (right ? " right" : "") + (wrong ? " wrong" : "")}
              style={{ borderColor: theme.line, ...(right ? { background: theme.accent, color: theme.bg2 } : null) }}
              onClick={() => picked === null && setPicked(n)}
            >
              <i style={{ background: theme.line, color: theme.bg2 }}>{right ? "✓" : "ABC"[n]}</i>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <div className="gdemo-result">
          <b>{picked === QUIZ.answer ? "🎉 You got it!" : "Not quite! 😄"}</b>
          <button className="gdemo-again inline" onClick={onAgain}>
            ↻ Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}

function RsvpMoment({ theme }: { theme: Theme }) {
  const [response, setResponse] = useState<RsvpResponse | null>(null);
  const [people, setPeople] = useState(3);
  const [sent, setSent] = useState(false);
  if (sent && response)
    return (
      <div className="gdemo-fill gdemo-wa">
        <span className="gdemo-kicker" style={{ color: theme.accent }}>
          What the family gets on WhatsApp
        </span>
        <div className="gdemo-bubble">{rsvpMessage(COUPLE, { response, guest: "Sharma family", people: response === "no" ? undefined : people })}</div>
        <div className="gdemo-counts">
          <span>Your invite shows</span>
          <div>
            <b>{response === "yes" ? 1 : 0}</b>
            <small>attending</small>
          </div>
          <div>
            <b>{response === "yes" ? people : 0}</b>
            <small>people</small>
          </div>
          <div>
            <b>{response === "maybe" ? 1 : 0}</b>
            <small>maybe</small>
          </div>
        </div>
        <button className="gdemo-again inline" onClick={() => setSent(false)}>
          ↻ Change answer
        </button>
      </div>
    );
  return (
    <div className="gdemo-fill gdemo-rsvp">
      <Names theme={theme} small />
      <b className="gdemo-q" style={{ color: theme.ink }}>
        Will you join us?
      </b>
      <div className="gdemo-choices">
        {(["yes", "maybe", "no"] as const).map((r) => (
          <button key={r} className={"gdemo-choice" + (response === r ? " on" : "")} onClick={() => setResponse(r)}>
            <span aria-hidden>{r === "yes" ? "🎉" : r === "maybe" ? "🤔" : "🙏"}</span>
            {RSVP_LABEL[r]}
          </button>
        ))}
      </div>
      {response && response !== "no" ? (
        <div className="gdemo-stepper">
          <span>How many of you?</span>
          <button aria-label="One fewer" onClick={() => setPeople((p) => Math.max(1, p - 1))}>
            −
          </button>
          <b>{people}</b>
          <button aria-label="One more" onClick={() => setPeople((p) => Math.min(20, p + 1))}>
            +
          </button>
        </div>
      ) : null}
      <button className="gdemo-send" disabled={!response} onClick={() => setSent(true)}>
        Send on WhatsApp
      </button>
    </div>
  );
}
