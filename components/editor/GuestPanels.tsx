"use client";
import React from "react";
import { guestOn, type Project, type QuizOptions, type RsvpOptions } from "@/lib/types";
import { rsvpContacts, rsvpSetup } from "@/lib/rsvp";
import { normalizePhone, typingPhone } from "@/lib/contact";
import { LETTERS } from "@/lib/quiz";

/* The studio's invite-level settings for the guest page, under the design's own fields: the interactive extras,
   how guests RSVP, and the couple's quiz. They follow the couple across a design switch (defaultProject). */

type Props = { project: Project; update: (patch: Partial<Project>) => void };

const EXTRAS = [
  ["envelope", "Sealed envelope", "Guests tap a wax seal to open the invite"],
  ["scratch", "Scratch to reveal the date", "Guests scratch gold foil off the date"],
  ["moment", "Tap to shower the couple", "On your names, guests tap to shower flowers (haldi, confetti… by function)"],
  ["actions", "Buttons on the scenes", "Add to calendar on the date, Directions on the venue, RSVP at the end"],
  ["blessings", "Send blessings", "A button at the end that showers petals and counts blessings"],
] as const;

export function GuestExperience({ project, update }: Props) {
  return (
    <details className="group">
      <summary>Guest experience</summary>
      <div className="guest-opts">
        {EXTRAS.map(([k, label, hint]) => (
          <label key={k} className="guest-opt">
            <input type="checkbox" checked={guestOn(project, k)} onChange={(e) => update({ guest: { ...project.guest, [k]: e.target.checked } })} />
            <span>
              <b>{label}</b>
              <small>{hint}</small>
            </span>
          </label>
        ))}
      </div>
    </details>
  );
}

const MODES = [
  ["whatsapp", "WhatsApp button", "One tap opens WhatsApp with “We'll be there!”"],
  ["form", "RSVP form", "Attending / Maybe / Can't come, how many, which functions. You see the counts on your invite."],
  ["off", "No RSVP", "No reply button for guests"],
] as const;

export function RsvpPanel({ project, update }: Props) {
  const o: RsvpOptions = project.rsvp ?? {};
  const set = (patch: Partial<RsvpOptions>) => update({ rsvp: { ...o, ...patch } });
  const mode = o.mode ?? "whatsapp";
  const contacts = [0, 1].map((i) => o.contacts?.[i] ?? { name: "", phone: "" });
  const setContact = (i: number, patch: Partial<{ name: string; phone: string }>) => {
    const next = contacts.map((c, k) => (k === i ? { ...c, ...patch } : c));
    set({ contacts: next });
  };
  const own = rsvpContacts(o).length;
  const found = mode !== "off" && !own ? rsvpSetup({ ...project, rsvp: { mode: "whatsapp" } })?.contacts.length ?? 0 : 0;
  return (
    <details className="group" open={!!project.rsvp}>
      <summary>RSVP</summary>
      <div className="group-body rsvp-panel">
        <div className="rsvp-modes" role="radiogroup" aria-label="How guests reply">
          {MODES.map(([k, label, hint]) => (
            <label key={k} className={"guest-opt" + (mode === k ? " on" : "")}>
              <input type="radio" name="rsvp-mode" checked={mode === k} onChange={() => set({ mode: k })} />
              <span>
                <b>{label}</b>
                <small>{hint}</small>
              </span>
            </label>
          ))}
        </div>

        {mode !== "off" ? (
          <>
            <div className="field">
              <div className="lbl">
                <span>Who guests reply to</span>
                <em>up to 2</em>
              </div>
              {contacts.map((c, i) => {
                const bad = c.phone.trim() && !normalizePhone(c.phone);
                return (
                  <div key={i} className="rsvp-contact">
                    <input className="input" maxLength={30} placeholder={i ? "e.g. Groom's side · Vikram" : "e.g. Bride's side · Rajesh"} value={c.name} onChange={(e) => setContact(i, { name: e.target.value })} aria-label={"Contact " + (i + 1) + " name"} />
                    <input className={"input" + (bad ? " bad" : "")} inputMode="tel" placeholder="Mobile number" value={c.phone} onChange={(e) => setContact(i, { phone: typingPhone(e.target.value) })} aria-label={"Contact " + (i + 1) + " mobile"} />
                  </div>
                );
              })}
              <div className="hint">
                {own
                  ? "Guests see these numbers. Replies come to WhatsApp."
                  : found
                    ? "Empty: guests reply to the number written on your invite."
                    : "Add a mobile number here (or in the RSVP line of your invite) so guests can reply."}
              </div>
            </div>

            <div className="field">
              <div className="lbl">
                <span>Reply by</span>
                <em>optional</em>
              </div>
              <input className="input" type="date" value={o.by ?? ""} onChange={(e) => set({ by: e.target.value || undefined })} />
            </div>

            {mode === "form" ? (
              <div className="guest-opts">
                {(
                  [
                    ["askCount", "How many people", true],
                    ["askEvents", "Which functions (when there are several)", true],
                    ["askFood", "Food: Veg / Jain / Non-veg", false],
                    ["askNote", "A message for you", true],
                  ] as const
                ).map(([k, label, def]) => (
                  <label key={k} className="guest-opt">
                    <input type="checkbox" checked={(o[k] ?? def) !== false} onChange={(e) => set({ [k]: e.target.checked })} />
                    <span>
                      <b>Ask: {label}</b>
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
            <label className="guest-opt">
              <input type="checkbox" checked={o.call === true} onChange={(e) => set({ call: e.target.checked })} />
              <span>
                <b>Also show a Call button</b>
              </span>
            </label>
          </>
        ) : null}
      </div>
    </details>
  );
}

export function QuizPanel({ project, update }: Props) {
  const q: QuizOptions = project.quiz ?? {};
  const set = (patch: Partial<QuizOptions>) => update({ quiz: { ...q, ...patch } });
  const options = [0, 1, 2].map((i) => q.options?.[i] ?? "");
  const answer = q.answer ?? 0;
  return (
    <details className="group" open={!!q.on}>
      <summary>Couple quiz</summary>
      <div className="group-body" data-field="quiz">
        <label className="guest-opt">
          <input type="checkbox" checked={!!q.on} onChange={(e) => set({ on: e.target.checked })} />
          <span>
            <b>Ask guests a question about you</b>
            <small>“How well do you know us?” A scene before the end: guests tap an answer, then see if they were right.</small>
          </span>
        </label>
        {q.on ? (
          <>
            <div className="field">
              <div className="lbl">
                <span>Question</span>
                <em>{(q.question ?? "").length}/90</em>
              </div>
              <input className="input" maxLength={90} placeholder="Where did we first meet?" value={q.question ?? ""} onChange={(e) => set({ question: e.target.value })} />
            </div>
            <div className="field">
              <div className="lbl">
                <span>Answers</span>
                <em>tick the right one</em>
              </div>
              {options.map((v, i) => (
                <div key={i} className="quiz-row">
                  <label className={"quiz-right" + (answer === i ? " on" : "")} title="The right answer">
                    <input type="radio" name="quiz-answer" checked={answer === i} onChange={() => set({ answer: i })} aria-label={"Answer " + LETTERS[i] + " is right"} />
                    {answer === i ? "✓" : LETTERS[i]}
                  </label>
                  <input
                    className="input"
                    maxLength={40}
                    placeholder={["At college", "At a friend's wedding", "On an app"][i]}
                    value={v}
                    onChange={(e) => set({ options: options.map((x, k) => (k === i ? e.target.value : x)) })}
                  />
                </div>
              ))}
              <div className="hint">Two answers are enough; the third is optional.</div>
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
