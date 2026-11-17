"use client";
import React, { useEffect, useState } from "react";
import { FOODS, MAX_PEOPLE, RSVP_LABEL, quickMessage, replyByText, rsvpMessage, waLink, type RsvpResponse, type RsvpSetup, type RsvpTarget } from "@/lib/rsvp";
import type { InviteEvent } from "@/lib/inviteDetails";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/* The guest's RSVP (lib/rsvp.ts has the rules). Two ways, chosen by the couple in the studio:
   - "whatsapp": a button per family contact that opens WhatsApp with a ready "We'll be there!" (what every invite had),
   - "form": Attending / Maybe / Can't make it, then the few questions the couple switched on, then WhatsApp opens
     with the whole reply written out. The reply goes only to the family's number.
   After a form reply, the link's record gets counts only (POST /api/share/<name>/rsvp), once per device: changing the
   answer moves the count instead of adding one. The couple's own tests are not counted. */

const SENT = "fp.rsvp"; // { [link]: { response, people } } on this device
type Sent = { response: RsvpResponse; people: number };
const readSent = (name?: string): Sent | null => {
  if (!name) return null;
  try {
    return JSON.parse(localStorage.getItem(SENT) || "{}")[name] ?? null;
  } catch {
    return null;
  }
};
const writeSent = (name: string, s: Sent) => {
  try {
    const all = JSON.parse(localStorage.getItem(SENT) || "{}");
    all[name] = s;
    const keys = Object.keys(all);
    for (const k of keys.slice(0, Math.max(0, keys.length - 200))) delete all[k];
    localStorage.setItem(SENT, JSON.stringify(all));
  } catch {}
};

const PhoneIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const short = (s: string, n = 16) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** The RSVP buttons on the guest card (GuestDetails): WhatsApp per contact, or one "RSVP" that opens the form. */
export function RsvpButtons({ setup, name, next, when, onForm }: { setup: RsvpSetup; name?: string; next?: InviteEvent; when?: string; onForm: () => void }) {
  const [sent, setSent] = useState<Sent | null>(null);
  useEffect(() => setSent(readSent(name)), [name]);
  if (setup.mode === "form")
    return (
      <>
        <button className="btn wa gd-rsvp" onClick={onForm}>
          <WhatsAppIcon size={18} /> {sent ? "Your RSVP: " + RSVP_LABEL[sent.response] + " · change" : "RSVP"}
        </button>
        {setup.call ? <CallButtons contacts={setup.contacts} /> : null}
      </>
    );
  return (
    <>
      {setup.contacts.map((c) => (
        <a
          key={c.phone}
          className="btn wa gd-rsvp"
          href={waLink(c.phone, quickMessage(next, when))}
          target="_blank"
          rel="noopener"
          onClick={() => track("guest_action_clicked", { action: "rsvp" })}
        >
          <WhatsAppIcon size={18} /> RSVP{c.name ? " to " + short(c.name) : setup.contacts.length > 1 ? "" : " on WhatsApp"}
        </a>
      ))}
      {setup.call ? <CallButtons contacts={setup.contacts} /> : null}
    </>
  );
}

function CallButtons({ contacts }: { contacts: RsvpTarget[] }) {
  return (
    <>
      {contacts.map((c) => (
        <a key={"call" + c.phone} className="btn gd-call" href={"tel:+" + c.phone} onClick={() => track("guest_action_clicked", { action: "call" })}>
          <PhoneIcon /> Call{c.name ? " " + short(c.name, 14) : ""}
        </a>
      ))}
    </>
  );
}

/** The RSVP form, a bottom sheet over the invite. `counts`: false for the couple's own visits (not counted). */
export function RsvpSheet({ setup, title, name, greeting, counts, onClose }: { setup: RsvpSetup; title: string; name?: string; greeting?: string; counts: boolean; onClose: () => void }) {
  const before = readSent(name);
  const [response, setResponse] = useState<RsvpResponse | null>(before?.response ?? null);
  const [guest, setGuest] = useState(greeting ?? "");
  const [people, setPeople] = useState(before?.people ?? 2);
  const [events, setEvents] = useState<string[]>(setup.events.map((e) => e.name));
  const [food, setFood] = useState<string>("");
  const [note, setNote] = useState("");
  const [to, setTo] = useState(0);
  const [done, setDone] = useState(false);
  const [byText, setByText] = useState("");
  useEffect(() => setByText(replyByText(setup.by)), [setup.by]);

  const coming = response === "yes" || response === "maybe";
  const ready = !!response && (!coming || !setup.askEvents || events.length > 0);

  const send = () => {
    if (!response) return;
    const contact = setup.contacts[to] ?? setup.contacts[0];
    const text = rsvpMessage(title, {
      response,
      guest: guest.replace(/\s+/g, " ").trim().slice(0, 40) || undefined,
      people: coming && setup.askCount ? people : undefined,
      events: coming && setup.askEvents ? events : undefined,
      food: coming && setup.askFood ? food || undefined : undefined,
      note: setup.askNote ? note.trim().slice(0, 300) || undefined : undefined,
    });
    window.open(waLink(contact.phone, text), "_blank", "noopener");
    const n = response === "yes" ? (setup.askCount ? people : 1) : 0;
    track("rsvp_sent", { response, people: n, changed: !!before });
    if (name) {
      // Counts only, once per device: a changed answer takes the earlier one back.
      if (counts && (before?.response !== response || before?.people !== n))
        fetch("/api/share/" + name + "/rsvp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response, people: Math.max(1, n), prev: before ? { response: before.response, people: Math.max(1, before.people) } : undefined }),
          keepalive: true,
        }).catch(() => {});
      writeSent(name, { response, people: n });
    }
    setDone(true);
  };

  return (
    <div className="owner-back rsvp-back" onClick={(e) => e.target === e.currentTarget && onClose()} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()}>
      <div className="owner-sheet rsvp-sheet" role="dialog" aria-label="RSVP">
        <button className="os-x" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {done ? (
          <section className="rsvp-done">
            <div className="rsvp-big" aria-hidden>
              {response === "no" ? "🙏" : "🎉"}
            </div>
            <h3>Thank you!</h3>
            <p>WhatsApp has your reply ready. Tap send there so the family gets it.</p>
            <button className="btn rsvp-close" onClick={onClose}>
              Back to the invite
            </button>
          </section>
        ) : (
          <>
            <h3>Will you join us?</h3>
            <p>
              {title}
              {byText ? " · " + byText : ""}
            </p>
            <div className="rsvp-choices" role="radiogroup" aria-label="Your answer">
              {(["yes", "maybe", "no"] as const).map((r) => (
                <button key={r} role="radio" aria-checked={response === r} className={"rsvp-choice" + (response === r ? " on" : "")} onClick={() => setResponse(r)}>
                  <span aria-hidden>{r === "yes" ? "🎉" : r === "maybe" ? "🤔" : "🙏"}</span>
                  {RSVP_LABEL[r]}
                </button>
              ))}
            </div>

            {response ? (
              <div className="rsvp-form">
                <label className="rsvp-field">
                  <span className="os-label">
                    Your name <em>(so they know who replied)</em>
                  </span>
                  <input className="os-input" maxLength={40} value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Sharma family" autoComplete="name" />
                </label>

                {coming && setup.askCount ? (
                  <div className="rsvp-field">
                    <span className="os-label">How many of you?</span>
                    <div className="rsvp-stepper">
                      <button aria-label="One fewer" onClick={() => setPeople((p) => Math.max(1, p - 1))} disabled={people <= 1}>
                        −
                      </button>
                      <b>{people}</b>
                      <button aria-label="One more" onClick={() => setPeople((p) => Math.min(MAX_PEOPLE, p + 1))} disabled={people >= MAX_PEOPLE}>
                        +
                      </button>
                    </div>
                  </div>
                ) : null}

                {coming && setup.askEvents ? (
                  <div className="rsvp-field">
                    <span className="os-label">Which functions?</span>
                    <div className="rsvp-chips">
                      {setup.events.map((ev) => {
                        const on = events.includes(ev.name);
                        return (
                          <button key={ev.name} className={"rsvp-chip" + (on ? " on" : "")} aria-pressed={on} onClick={() => setEvents((l) => (on ? l.filter((x) => x !== ev.name) : [...l, ev.name]))}>
                            {on ? "✓ " : ""}
                            {ev.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {coming && setup.askFood ? (
                  <div className="rsvp-field">
                    <span className="os-label">
                      Food <em>(optional)</em>
                    </span>
                    <div className="rsvp-chips">
                      {FOODS.map((f) => (
                        <button key={f} className={"rsvp-chip" + (food === f ? " on" : "")} aria-pressed={food === f} onClick={() => setFood((x) => (x === f ? "" : f))}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {setup.askNote ? (
                  <label className="rsvp-field">
                    <span className="os-label">
                      A message for the couple <em>(optional)</em>
                    </span>
                    <textarea className="os-input rsvp-note" maxLength={300} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Congratulations! Can't wait 🎉" />
                  </label>
                ) : null}

                {setup.contacts.length > 1 ? (
                  <div className="rsvp-field">
                    <span className="os-label">Send to</span>
                    <div className="rsvp-chips">
                      {setup.contacts.map((c, i) => (
                        <button key={c.phone} className={"rsvp-chip" + (to === i ? " on" : "")} aria-pressed={to === i} onClick={() => setTo(i)}>
                          {c.name || "Contact " + (i + 1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button className="btn wa rsvp-send" onClick={send} disabled={!ready}>
                  <WhatsAppIcon size={20} /> Send on WhatsApp
                </button>
                <p className="rsvp-fine">Your reply goes straight to the family on WhatsApp. We don&apos;t keep it.</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** The couple's sheet: how the RSVP form is going (counts only; their owner key unlocks them). */
export function RsvpSummary({ name, ownerKey }: { name: string; ownerKey: string }) {
  const [c, setC] = useState<{ yes: number; maybe: number; no: number; people: number } | null>(null);
  useEffect(() => {
    fetch("/api/share/" + name + "/rsvp", { headers: { "x-owner-key": ownerKey }, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => r?.counts && setC(r.counts))
      .catch(() => {});
  }, [name, ownerKey]);
  if (!c) return null;
  const replies = c.yes + c.maybe + c.no;
  return (
    <section className="os-rsvp">
      <span className="os-label">RSVPs so far</span>
      {replies ? (
        <div className="os-rsvp-grid">
          <div>
            <b>{c.yes}</b>
            <span>attending</span>
          </div>
          <div>
            <b>{c.people}</b>
            <span>people coming</span>
          </div>
          <div>
            <b>{c.maybe}</b>
            <span>maybe</span>
          </div>
          <div>
            <b>{c.no}</b>
            <span>can&apos;t come</span>
          </div>
        </div>
      ) : (
        <p className="os-note">No replies yet. They show here as guests send them, and the details arrive on your WhatsApp.</p>
      )}
    </section>
  );
}
