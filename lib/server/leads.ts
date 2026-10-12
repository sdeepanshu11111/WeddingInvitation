import { promises as fs } from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { LEADS } from "../features";
import { normalizeEmail, normalizePhone } from "../contact";
import { EXPORT_DIR } from "./paths";

/* =====================================================================
 * Leads: the people behind invite links, so the owner can follow up on
 * WhatsApp or email from /admin/leads. One row per link:
 *   - the WhatsApp number and/or email typed in the Share step (with the notice they saw),
 *   - the phone and email a payer typed into Razorpay Checkout.
 * Private data: never written to Vercel Blob (that store is public), Mixpanel
 * or the Meta Pixel, never logged, never sold or shared.
 *
 * LEADS = "db"   Postgres (Neon from Vercel's Storage tab sets DATABASE_URL)
 *         "disk" exports/leads.json, when running locally
 *         ""     off (on Vercel without a database: the Share step asks for nothing)
 * ===================================================================== */

export type Lead = {
  link: string; // the share name: /e/<link>
  title: string; // "Aarav & Ananya"
  phone: string | null; // E.164, from the Share step
  email: string | null; // from the Share step
  consent: string | null; // CONTACT_NOTICE version they agreed to
  pay_phone: string | null; // from Razorpay Checkout
  pay_email: string | null; // from Razorpay Checkout
  paid_inr: number | null;
  paid_at: string | null; // ISO dates
  contacted_at: string | null;
  opted_out: boolean;
  created_at: string;
};

/** The owner's actions on /admin/leads. "optout" applies to every link with the same number or email. */
export type LeadAction = "contacted" | "optout" | "delete";

/* ---- Postgres ---- */

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  link text PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  phone text,
  email text,
  consent text,
  pay_phone text,
  pay_email text,
  paid_inr integer,
  paid_at timestamptz,
  contacted_at timestamptz,
  opted_out boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
)`;

/** Statements as text + $n parameters (not tagged templates), so scripts can run the same SQL elsewhere. */
export const SQL = {
  schema: SCHEMA,
  share: `INSERT INTO leads (link, title, phone, email, consent) VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (link) DO UPDATE SET title = EXCLUDED.title, phone = EXCLUDED.phone, email = EXCLUDED.email, consent = EXCLUDED.consent`,
  payment: `INSERT INTO leads (link, pay_phone, pay_email, paid_inr, paid_at) VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (link) DO UPDATE SET pay_phone = COALESCE(EXCLUDED.pay_phone, leads.pay_phone),
      pay_email = COALESCE(EXCLUDED.pay_email, leads.pay_email), paid_inr = EXCLUDED.paid_inr, paid_at = COALESCE(leads.paid_at, EXCLUDED.paid_at)`,
  list: `SELECT * FROM leads ORDER BY created_at DESC LIMIT 2000`,
  contacted: `UPDATE leads SET contacted_at = now() WHERE link = $1`,
  // STOP means this person, so every link with their number or email (the subqueries run before the update).
  optout: `UPDATE leads SET opted_out = true WHERE link = $1
    OR phone = (SELECT phone FROM leads WHERE link = $1) OR email = (SELECT email FROM leads WHERE link = $1)`,
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
  email: r.email ?? null,
  consent: r.consent ?? null,
  pay_phone: r.pay_phone ?? null,
  pay_email: r.pay_email ?? null,
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
const EMPTY = { title: "", phone: null, email: null, consent: null, pay_phone: null, pay_email: null, paid_inr: null, paid_at: null, contacted_at: null, opted_out: false };
const blank = (link: string, created_at: string): Lead => ({ link, created_at, ...EMPTY });

/* ---- API ---- */

/** The number and/or email from the Share step, saved once the link exists. */
export async function saveShareLead(link: string, title: string, c: { phone: string | null; email: string | null }, consent: string) {
  if (LEADS === "db") await q(SQL.share, [link, title, c.phone, c.email, consent]);
  else if (LEADS === "disk") await edit((all, now) => void (all[link] = { ...(all[link] ?? blank(link, now)), title, ...c, consent }));
}

/** What a payer typed into Razorpay Checkout (any link, also ones made before lead capture existed). */
export async function savePaymentLead(link: string, p: { contact?: string | null; email?: string | null; amount: number }) {
  const payPhone = p.contact ? normalizePhone(p.contact) : null;
  // Razorpay fills in void@razorpay.com when Checkout did not ask for an email.
  const payEmail = p.email && p.email !== "void@razorpay.com" ? normalizeEmail(p.email) : null;
  const inr = Math.round(p.amount / 100); // paise
  if (LEADS === "db") await q(SQL.payment, [link, payPhone, payEmail, inr]);
  else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link] ?? blank(link, now);
      all[link] = { ...l, pay_phone: payPhone ?? l.pay_phone, pay_email: payEmail ?? l.pay_email, paid_inr: inr, paid_at: l.paid_at ?? now };
    });
}

/** Newest first. */
export async function listLeads(): Promise<Lead[]> {
  if (LEADS === "db") return (await q(SQL.list)).map(row);
  if (LEADS === "disk") return Object.values(await readFile()).map((l) => ({ ...EMPTY, ...l })).sort((a, b) => b.created_at.localeCompare(a.created_at));
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
      else for (const x of Object.values(all)) if (x.link === link || (l.phone && x.phone === l.phone) || (l.email && x.email === l.email)) x.opted_out = true;
    });
}
