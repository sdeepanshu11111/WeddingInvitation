/* RSVP (owner, 2026-11-17: "more RSVP options, optional"). The couple picks how guests reply in the studio's RSVP group
   (Project.rsvp); the guest page (app/e/[slug]/Rsvp.tsx) turns it into buttons or a short form. Every reply travels
   through WhatsApp to the family's own number: we store no guest names or answers. Only counts go on the link's
   record (attending / maybe / can't come, people coming) for the couple's sheet. Dependency-free: browser and server. */

import type { Project, RsvpOptions } from "./types";
import { inviteDetails, type InviteEvent } from "./inviteDetails";
import { normalizePhone } from "./contact";

export type RsvpResponse = "yes" | "maybe" | "no";
export const RSVP_LABEL: Record<RsvpResponse, string> = { yes: "Attending", maybe: "Maybe", no: "Can't make it" };
export const FOODS = ["Veg", "Jain", "Non-veg"] as const;
export const MAX_PEOPLE = 20;

/** A contact guests can reply to: wa.me digits (no +) and the name shown on the button. */
export type RsvpTarget = { phone: string; name?: string };

export type RsvpSetup = {
  mode: "whatsapp" | "form";
  contacts: RsvpTarget[];
  by?: string;
  askCount: boolean;
  askEvents: boolean;
  askFood: boolean;
  askNote: boolean;
  call: boolean;
  events: InviteEvent[];
};

const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** The studio's contacts, cleaned: a real mobile number each (names are optional), at most two. */
export function rsvpContacts(o?: RsvpOptions): RsvpTarget[] {
  const out: RsvpTarget[] = [];
  for (const c of o?.contacts ?? []) {
    const p = typeof c?.phone === "string" ? normalizePhone(c.phone) : null;
    if (!p || out.some((x) => x.phone === p.slice(1))) continue;
    const name = typeof c.name === "string" ? c.name.replace(/\s+/g, " ").trim().slice(0, 30) : "";
    out.push({ phone: p.slice(1), name: name || undefined });
    if (out.length === 2) break;
  }
  return out;
}

/** What the guest page offers, or null for no RSVP at all (switched off, or nobody to reply to). */
export function rsvpSetup(project: Pick<Project, "templateId" | "data" | "sample" | "rsvp">): RsvpSetup | null {
  const o = project.rsvp ?? {};
  if (o.mode === "off") return null;
  const details = inviteDetails(project.templateId, project.data, project.sample);
  const own = rsvpContacts(o);
  const contacts: RsvpTarget[] = own.length ? own : details.contacts.map((c) => ({ phone: c.phone, name: c.who }));
  if (!contacts.length) return null;
  return {
    mode: o.mode === "form" ? "form" : "whatsapp",
    contacts,
    by: isDate(o.by) ? o.by : undefined,
    askCount: o.askCount !== false,
    askEvents: o.askEvents !== false && details.events.length > 1,
    askFood: o.askFood === true,
    askNote: o.askNote !== false,
    call: o.call === true,
    events: details.events,
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-12-01" → "1 Dec". */
export const shortDate = (d: string) => {
  const [, m, day] = d.split("-").map(Number);
  return day + " " + MONTHS[m - 1];
};

/** "Kindly reply by 1 Dec", or "" once that day has passed (worked out in the browser, the page HTML is cached). */
export function replyByText(by?: string, today = new Date()): string {
  if (!by) return "";
  const ist = new Date(today.getTime() + 330 * 60000).toISOString().slice(0, 10);
  return by >= ist ? "Kindly reply by " + shortDate(by) : "";
}

export type RsvpAnswer = { response: RsvpResponse; guest?: string; people?: number; events?: string[]; food?: string; note?: string };

/** The WhatsApp message a guest sends: short, readable in a family's chat, nothing invented. */
export function rsvpMessage(title: string, a: RsvpAnswer): string {
  const head = a.response === "yes" ? "🙏 Namaste! We'll be there" : a.response === "maybe" ? "🙏 Namaste! We'll try our best to come" : "🙏 Namaste! Sorry, we can't make it";
  const lines = [head + " – " + title + ".", ""];
  if (a.guest) lines.push("From: " + a.guest);
  lines.push("RSVP: " + RSVP_LABEL[a.response]);
  if (a.response !== "no" && a.people) lines.push("People: " + a.people);
  if (a.response !== "no" && a.events?.length) lines.push("Functions: " + a.events.join(", "));
  if (a.response !== "no" && a.food) lines.push("Food: " + a.food);
  if (a.note) lines.push("", a.note);
  return lines.join("\n").trim();
}

/** The quick reply of the plain WhatsApp button (what every invite had before the form). */
export function quickMessage(next?: InviteEvent, when?: string): string {
  return "Namaste! 🙏 Thank you for the invitation" + (next ? " for " + next.name + (when ? " on " + when : "") : "") + ". We'll be there!";
}

export const waLink = (phone: string, text: string) => "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
