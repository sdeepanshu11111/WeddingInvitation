/* What a guest can act on, read straight from an invite's fields: the functions (name, date, time, venue) for
   "Add to calendar" and "Directions", and an RSVP number for "RSVP on WhatsApp". Templates share field names
   (weddingDate, venueName, receptionDate, walimaDate, events...), so this needs no template code and runs on the
   server too (app/e/[slug]/calendar.ics). Invites are in India: times are IST (UTC+5:30, no daylight saving). */

export type InviteEvent = { name: string; date: string; time?: string; endTime?: string; venue?: string; address?: string };
export type InviteDetails = { events: InviteEvent[]; rsvp: { phone: string; who?: string } | null };

/** The main function's name when it isn't a "Wedding". New templates add theirs here. */
const MAIN: Record<string, string> = {
  "nikah-mubarak": "Nikah",
  "anand-karaj": "Anand Karaj",
  "south-kalyanam": "Muhurtham",
  "sagai-rings": "Engagement",
  "haldi-marigold": "Haldi",
  "mehendi-paisley": "Mehendi",
  "sangeet-night": "Sangeet",
  "reception-gala": "Reception",
  "holy-matrimony": "Holy Matrimony",
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const oneLine = (v: unknown) => str(v)?.split("\n").map((x) => x.trim()).filter(Boolean).join(", ");

/** "10:00 AM" / "7:30 pm" / "19:30" → "HH:mm". */
export function parseClock(s?: string): string | undefined {
  const m = s && /(\d{1,2})[:.](\d{2})\s*(am|pm)?/i.exec(s);
  if (!m) return undefined;
  let h = +m[1];
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && +m[2] < 60 ? String(h).padStart(2, "0") + ":" + m[2] : undefined;
}

/** First Indian mobile number in the text (the families already put one in their RSVP line), as 91XXXXXXXXXX. */
function findPhone(text: string): { phone: string; who?: string } | null {
  for (const line of text.split("\n")) {
    const m = /(?:\+?\s?91[\s-]*)?([6-9]\d{4})[\s-]?(\d{5})(?!\d)/.exec(line);
    if (!m) continue;
    const who = line
      .slice(0, m.index)
      .replace(/\brsvp\b(\s+(by|before)\s+[^·|:,-]*)?/i, "")
      .replace(/[·|:,–—-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { phone: "91" + m[1] + m[2], who: who && who.length <= 40 ? who : undefined };
  }
  return null;
}

export function inviteDetails(templateId: string, d: Record<string, any>): InviteDetails {
  const events: InviteEvent[] = [];
  if (Array.isArray(d.events)) {
    for (const e of d.events) if (e && str(e.name) && isDate(e.date)) events.push({ name: str(e.name)!, date: e.date, time: parseClock(e.time), venue: str(e.venue) });
  } else if (isDate(d.weddingDate)) {
    // Anand Karaj keeps its times in a schedule ("Anand Karaj — 10:00 AM"); Kalyanam has a muhurtham window.
    const fromSchedule = str(d.schedule)
      ?.split("\n")
      .find((l) => /anand karaj|ceremony|laavan/i.test(l) && parseClock(l));
    events.push({
      name: MAIN[templateId] ?? "Wedding",
      date: d.weddingDate,
      time: parseClock(d.weddingTime) ?? parseClock(d.muhurthamStart) ?? parseClock(fromSchedule),
      endTime: parseClock(d.muhurthamEnd),
      venue: str(d.venueName) ?? str(d.venueCity),
      address: oneLine(d.venueAddress) ?? (str(d.venueName) ? str(d.venueCity) : undefined),
    });
  }
  if (d.showReception !== false && isDate(d.receptionDate) && templateId !== "reception-gala")
    events.push({ name: str(d.receptionLabel) ?? "Reception", date: d.receptionDate, time: parseClock(d.receptionTime), venue: str(d.receptionVenue) });
  if (d.showWalima !== false && isDate(d.walimaDate))
    events.push({ name: "Walima", date: d.walimaDate, time: parseClock(d.walimaTime), venue: str(d.walimaVenue), address: oneLine(d.walimaAddress) });

  // RSVP: the fields meant for it first, then any other text the family wrote.
  const keys = Object.keys(d).sort((a, b) => Number(!/rsvp/i.test(a)) - Number(!/rsvp/i.test(b)));
  let rsvp: InviteDetails["rsvp"] = null;
  for (const k of keys) {
    if (typeof d[k] !== "string") continue;
    rsvp = findPhone(d[k]);
    if (rsvp) break;
  }
  return { events, rsvp };
}

/* ---- calendar ---- */

const IST_MIN = 330;
const pad = (n: number) => String(n).padStart(2, "0");
const utcStamp = (ms: number) => {
  const x = new Date(ms);
  return x.getUTCFullYear() + pad(x.getUTCMonth() + 1) + pad(x.getUTCDate()) + "T" + pad(x.getUTCHours()) + pad(x.getUTCMinutes()) + "00Z";
};

/** Start and end as UTC stamps (a 3-hour slot when no end time is given), or all-day dates when there is no time. */
export function eventTimes(ev: InviteEvent): { allDay: boolean; start: string; end: string } {
  const [y, m, day] = ev.date.split("-").map(Number);
  if (!ev.time) {
    const next = new Date(Date.UTC(y, m - 1, day + 1));
    return { allDay: true, start: ev.date.replace(/-/g, ""), end: next.getUTCFullYear() + pad(next.getUTCMonth() + 1) + pad(next.getUTCDate()) };
  }
  const at = (hhmm: string) => Date.UTC(y, m - 1, day, +hhmm.slice(0, 2), +hhmm.slice(3, 5)) - IST_MIN * 60000;
  const start = at(ev.time);
  let end = ev.endTime ? at(ev.endTime) : start + 3 * 3600000;
  if (end <= start) end = start + 3 * 3600000;
  return { allDay: false, start: utcStamp(start), end: utcStamp(end) };
}

const place = (ev: InviteEvent) => [ev.venue, ev.address].filter(Boolean).join(", ");

export function googleCalendarUrl(ev: InviteEvent, title: string, link: string): string {
  const t = eventTimes(ev);
  const q = new URLSearchParams({ action: "TEMPLATE", text: title + " · " + ev.name, dates: t.start + "/" + t.end, details: "Your invitation: " + link, location: place(ev) });
  return "https://calendar.google.com/calendar/render?" + q.toString();
}

export const mapsUrl = (ev: InviteEvent) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place(ev));

/** An .ics file with every function (Apple Calendar offers "Add All"). */
export function icsFile(events: InviteEvent[], title: string, link: string, uidBase: string): string {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FutureProof//Invitation//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  events.forEach((ev, i) => {
    const t = eventTimes(ev);
    out.push(
      "BEGIN:VEVENT",
      "UID:" + uidBase + "-" + i + "@futureproof.co.in",
      "DTSTAMP:" + utcStamp(Date.now()),
      t.allDay ? "DTSTART;VALUE=DATE:" + t.start : "DTSTART:" + t.start,
      t.allDay ? "DTEND;VALUE=DATE:" + t.end : "DTEND:" + t.end,
      "SUMMARY:" + esc(title + " · " + ev.name),
      ...(place(ev) ? ["LOCATION:" + esc(place(ev))] : []),
      "DESCRIPTION:" + esc("Your invitation: " + link),
      "URL:" + link,
      "END:VEVENT",
    );
  });
  out.push("END:VCALENDAR");
  return out.join("\r\n") + "\r\n";
}

/** Whole days from today (local) to the date: 0 = today, 1 = tomorrow, negative = past. */
export function daysUntil(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const now = new Date();
  return Math.round((new Date(y, m - 1, d).getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
}

export const countdownText = (days: number) => (days === 0 ? "Today!" : days === 1 ? "Tomorrow" : days > 1 ? days + " days to go" : "");
