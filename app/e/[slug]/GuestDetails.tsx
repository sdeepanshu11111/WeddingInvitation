"use client";
import React, { useEffect, useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { countdownText, daysUntil, googleCalendarUrl, inviteDetails, mapsUrl, type InviteEvent } from "@/lib/inviteDetails";
import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/* The card a guest sees when the invite ends: each function with "Add to calendar" and "Directions", an
   "RSVP on WhatsApp" button when the family put a number on the invite, a countdown, and "Watch again".
   Everything comes from the invite's own fields (lib/inviteDetails.ts). */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function when(ev: InviteEvent) {
  const [y, m, d] = ev.date.split("-").map(Number);
  const wd = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  let s = wd + ", " + d + " " + MONTHS[m - 1];
  if (ev.time) {
    const h = +ev.time.slice(0, 2);
    s += " · " + (((h + 11) % 12) + 1) + ":" + ev.time.slice(3) + " " + (h < 12 ? "AM" : "PM");
  }
  return s;
}

const CalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export function GuestDetails({ project, title, name, onReplay }: { project: Project; title: string; name?: string; onReplay: () => void }) {
  const { events, rsvp } = useMemo(() => inviteDetails(project.templateId, project.data), [project]);
  const [ios, setIos] = useState(false);
  const [link, setLink] = useState("");
  const [small, setSmall] = useState(false); // tucked away, so the last scene can be read
  useEffect(() => {
    // iPhones add an .ics straight into Apple Calendar; everyone else gets Google Calendar.
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1));
    setLink(window.location.origin + "/e/" + (name ?? ""));
  }, [name]);

  const next = events.find((e) => daysUntil(e.date) >= 0);
  const countdown = next ? countdownText(daysUntil(next.date)) : "";
  const calHref = (i: number) => (ios && name ? "/e/" + name + "/calendar.ics" : googleCalendarUrl(events[i], title, link));
  const rsvpHref = rsvp
    ? "https://wa.me/" + rsvp.phone + "?text=" + encodeURIComponent("Namaste! 🙏 Thank you for the invitation" + (next ? " for " + next.name + " on " + when(next).split(" · ")[0] : "") + ". We'll be there!")
    : "";

  if (small)
    return (
      <button className="gd-pill" onClick={() => setSmall(false)}>
        <CalIcon /> Event details{rsvp ? " & RSVP" : ""}
      </button>
    );
  return (
    <div className="gd" onClick={(e) => e.stopPropagation()}>
      <div className="gd-head">
        <b>{title}</b>
        {countdown ? <span className="gd-count">{countdown}</span> : null}
        <button className="gd-x" onClick={() => setSmall(true)} aria-label="Hide details">
          ✕
        </button>
      </div>
      {events.length ? (
        <div className="gd-list">
          {events.map((ev, i) => (
            <div className="gd-ev" key={i}>
              <div className="gd-when">
                <b>{ev.name}</b>
                <span>{when(ev)}</span>
                {ev.venue ? <span className="gd-venue">{ev.venue}</span> : null}
              </div>
              <div className="gd-acts">
                <a className="gd-btn" href={calHref(i)} target="_blank" rel="noopener" onClick={() => track("guest_action_clicked", { action: "calendar" })} aria-label={"Add " + ev.name + " to calendar"}>
                  <CalIcon />
                  <span>Calendar</span>
                </a>
                {ev.venue || ev.address ? (
                  <a className="gd-btn" href={mapsUrl(ev)} target="_blank" rel="noopener" onClick={() => track("guest_action_clicked", { action: "directions" })} aria-label={"Directions to " + (ev.venue ?? ev.name)}>
                    <PinIcon />
                    <span>Directions</span>
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="gd-foot">
        {rsvp ? (
          <a className="btn wa gd-rsvp" href={rsvpHref} target="_blank" rel="noopener" onClick={() => track("guest_action_clicked", { action: "rsvp" })}>
            <WhatsAppIcon size={18} /> RSVP{rsvp.who ? " to " + rsvp.who : " on WhatsApp"}
          </a>
        ) : null}
        <button className="btn gd-replay" onClick={onReplay}>
          ↻ Watch again
        </button>
      </div>
    </div>
  );
}
