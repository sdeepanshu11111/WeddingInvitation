import { promises as fs } from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { LEADS } from "../features";
import { normalizePhone } from "../phone";
import { EXPORT_DIR } from "./paths";

/* =====================================================================
 * Leads: the people behind invite links, so the owner can follow up on
 * WhatsApp from /admin/leads. One row per link:
 *   - the WhatsApp number typed in the Share step (with the notice they saw),
 *   - the phone and email a payer typed into Razorpay Checkout.
 * Private data: never written to Vercel Blob (that store is public), Mixpanel
 * or the Meta Pixel, and never logged.
 *
 * LEADS = "db"   Postgres (Neon from Vercel's Storage tab sets DATABASE_URL)
 *         "disk" exports/leads.json, when running locally
 *         ""     off (on Vercel without a database: the Share step asks for no number)
 * ===================================================================== */

export type Lead = {
  link: string; // the share name: /e/<link>
  title: string; // "Aarav & Ananya"
  phone: string | null; // E.164, from the Share step
  consent: string | null; // PHONE_NOTICE version they agreed to
  pay_phone: string | null; // from Razorpay Checkout
  email: string | null; // from Razorpay Checkout
  paid_inr: number | null;
  paid_at: string | null; // ISO dates
  contacted_at: string | null;
  opted_out: boolean;
  created_at: string;
};

/** The owner's actions on /admin/leads. "optout" applies to every link with the same number. */
export type LeadAction = "contacted" | "optout" | "delete";

/* ---- Postgres ---- */

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  link text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  phone text,
  consent text,
  pay_phone text,
  email text,
  paid_inr integer,
  paid_at timestamptz,
  contacted_at timestamptz,
  opted_out boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
)`;

/** Statements as text + $n parameters (not tagged templates), so scripts can run the same SQL elsewhere. */
export const SQL = {
  schema: SCHEMA,
  share: `INSERT INTO leads (link, title, phone, consent) VALUES ($1, $2, $3, $4)
    ON CONFLICT (link) DO UPDATE SET title = EXCLUDED.title, phone = EXCLUDED.phone, consent = EXCLUDED.consent`,
  payment: `INSERT INTO leads (link, pay_phone, email, paid_inr, paid_at) VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (link) DO UPDATE SET pay_phone = COALESCE(EXCLUDED.pay_phone, leads.pay_phone),
      email = COALESCE(EXCLUDED.email, leads.email), paid_inr = EXCLUDED.paid_inr, paid_at = COALESCE(leads.paid_at, EXCLUDED.paid_at)`,
  list: `SELECT * FROM leads ORDER BY created_at DESC LIMIT 2000`,
  contacted: `UPDATE leads SET contacted_at = now() WHERE link = $1`,
  // STOP means this person, so every link they made (the subquery runs before the update).
  optout: `UPDATE leads SET opted_out = true WHERE link = $1 OR phone = (SELECT phone FROM leads WHERE link = $1)`,
  delete: `DELETE FROM leads WHERE link = $1`,
};

let sql: NeonQueryFunction<false, false> | null = null;
let ready: Promise<unknown> | null = null;

/** Runs one statement, creating the table on first use (once per server instance). */
async function q(text: string, params: unknown[] = []): Promise<Record<string, any>[]> {
  sql ??= neon((process.env.DATABASE_URL || process.env.POSTGRES_URL)!);
  ready ??= sql.query(SCHEMA).catch((e) => {
    ready = null; // try again on the next call
    throw e;
  });
  await ready;
  return (await sql.query(text, params)) as Record<string, any>[];
}

const iso = (v: unknown) => (v == null ? null : new Date(v as string).toISOString());
const row = (r: Record<string, any>): Lead => ({
  link: r.link,
  title: r.title ?? "",
  phone: r.phone ?? null,
  consent: r.consent ?? null,
  pay_phone: r.pay_phone ?? null,
  email: r.email ?? null,
  paid_inr: r.paid_inr ?? null,
  paid_at: iso(r.paid_at),
  contacted_at: iso(r.contacted_at),
  opted_out: !!r.opted_out,
  created_at: iso(r.created_at)!,
});

/* ---- Local file (development) ---- */

const FILE = path.join(EXPORT_DIR, "leads.json");
const readFile = async (): Promise<Record<string, Lead>> => JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "{}"));
async function edit(fn: (all: Record<string, Lead>, now: string) => void) {
  const all = await readFile();
  fn(all, new Date().toISOString());
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}
const EMPTY = { title: "", phone: null, consent: null, pay_phone: null, email: null, paid_inr: null, paid_at: null, contacted_at: null, opted_out: false };
const blank = (link: string, created_at: string): Lead => ({ link, created_at, ...EMPTY });

/* ---- API ---- */

/** The number from the Share step, saved once the link exists. */
export async function saveShareLead(link: string, title: string, phone: string, consent: string) {
  if (LEADS === "db") await q(SQL.share, [link, title, phone, consent]);
  else if (LEADS === "disk") await edit((all, now) => void (all[link] = { ...(all[link] ?? blank(link, now)), title, phone, consent }));
}

/** What a payer typed into Razorpay Checkout (any link, also ones made before lead capture existed). */
export async function savePaymentLead(link: string, p: { contact?: string | null; email?: string | null; amount: number }) {
  const payPhone = p.contact ? normalizePhone(p.contact) : null;
  // Razorpay fills in void@razorpay.com when Checkout did not ask for an email.
  const email = p.email && p.email !== "void@razorpay.com" ? p.email.trim().toLowerCase() : null;
  const inr = Math.round(p.amount / 100); // paise
  if (LEADS === "db") await q(SQL.payment, [link, payPhone, email, inr]);
  else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link] ?? blank(link, now);
      all[link] = { ...l, pay_phone: payPhone ?? l.pay_phone, email: email ?? l.email, paid_inr: inr, paid_at: l.paid_at ?? now };
    });
}

/** Newest first. */
export async function listLeads(): Promise<Lead[]> {
  if (LEADS === "db") return (await q(SQL.list)).map(row);
  if (LEADS === "disk") return Object.values(await readFile()).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [];
}

export async function updateLead(link: string, action: LeadAction) {
  if (LEADS === "db") await q(SQL[action], [link]);
  else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link];
      if (!l) return;
      if (action === "delete") delete all[link];
      else if (action === "contacted") l.contacted_at = now;
      else for (const x of Object.values(all)) if (x.link === link || (l.phone && x.phone === l.phone)) x.opted_out = true;
    });
}
