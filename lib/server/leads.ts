import { promises as fs } from "node:fs";
import path from "node:path";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { type Collection, type Db, MongoClient } from "mongodb";
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
 * LEADS = "mongo" MongoDB (MONGODB_URI, e.g. Atlas; database MONGODB_DB, default "invite_studio")
 *         "db"    Postgres (Neon from Vercel's Storage tab sets DATABASE_URL)
 *         "disk"  exports/leads.json, when running locally
 *         ""      off (on Vercel without a database: the Share step asks for nothing)
 * Moving from Postgres to MongoDB: keep DATABASE_URL set for one deploy and the
 * leads are copied over once (see importFromPostgres).
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
  all: `SELECT * FROM leads`,
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

/* ---- MongoDB ---- */

/** One document per link (_id = link), dates as BSON dates. */
type LeadDoc = Omit<Lead, "link" | "paid_at" | "contacted_at" | "created_at"> & { _id: string; paid_at: Date | null; contacted_at: Date | null; created_at: Date };
type ImportDoc = { _id: string; at: Date; copied: number; total: number };

// On globalThis so dev hot-reloads reuse the connection instead of opening a new pool each time.
const g = globalThis as unknown as { __leadsMongo?: Promise<{ db: Db; col: Collection<LeadDoc> }> };

/** The leads collection, connected once per server instance; the first call also runs the Postgres import. */
async function mongo() {
  g.__leadsMongo ??= (async () => {
    const client = await new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 }).connect();
    const db = client.db(process.env.MONGODB_DB || "invite_studio");
    const col = db.collection<LeadDoc>("leads");
    await col.createIndex({ created_at: -1 });
    await importFromPostgres(db, col);
    return { db, col };
  })().catch((e) => {
    g.__leadsMongo = undefined; // try again on the next call
    throw e;
  });
  return g.__leadsMongo;
}

const toDoc = (l: Lead): Omit<LeadDoc, "_id"> => ({
  title: l.title,
  phone: l.phone,
  email: l.email,
  consent: l.consent,
  pay_phone: l.pay_phone,
  pay_email: l.pay_email,
  paid_inr: l.paid_inr,
  paid_at: l.paid_at ? new Date(l.paid_at) : null,
  contacted_at: l.contacted_at ? new Date(l.contacted_at) : null,
  opted_out: l.opted_out,
  created_at: new Date(l.created_at),
});

/** Copies leads in; a link that is already here is left as it is. Returns how many were added. */
async function copyLeads(col: Collection<LeadDoc>, leads: Lead[]) {
  if (!leads.length) return 0;
  const ops = leads.map((l) => ({ updateOne: { filter: { _id: l.link }, update: { $setOnInsert: toDoc(l) }, upsert: true } }));
  return (await col.bulkWrite(ops, { ordered: false })).upsertedCount;
}

/** While DATABASE_URL is still set, copies the Postgres leads over, once: the "meta" document marks it done, so a lead
    deleted here later never comes back. A failure is logged (counts only) and retried by the next server instance. */
async function importFromPostgres(db: Db, col: Collection<LeadDoc>) {
  if (!(process.env.DATABASE_URL || process.env.POSTGRES_URL)) return;
  const meta = db.collection<ImportDoc>("meta");
  if (await meta.findOne({ _id: "postgres-import" })) return;
  try {
    const leads = (await q(SQL.all)).map(row);
    const copied = await copyLeads(col, leads);
    await meta.updateOne({ _id: "postgres-import" }, { $set: { at: new Date(), copied, total: leads.length } }, { upsert: true });
    console.log(`Leads: copied ${copied} of ${leads.length} from Postgres to MongoDB`);
  } catch (e) {
    console.error("Leads: Postgres import failed, will retry:", (e as Error)?.message);
  }
}

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
  if (LEADS === "mongo") {
    const { col } = await mongo();
    const fresh = { pay_phone: null, pay_email: null, paid_inr: null, paid_at: null, contacted_at: null, opted_out: false, created_at: new Date() };
    await col.updateOne({ _id: link }, { $set: { title, phone: c.phone, email: c.email, consent }, $setOnInsert: fresh }, { upsert: true });
  } else if (LEADS === "db") await q(SQL.share, [link, title, c.phone, c.email, consent]);
  else if (LEADS === "disk") await edit((all, now) => void (all[link] = { ...(all[link] ?? blank(link, now)), title, ...c, consent }));
}

/** What a payer typed into Razorpay Checkout (any link, also ones made before lead capture existed). */
export async function savePaymentLead(link: string, p: { contact?: string | null; email?: string | null; amount: number }) {
  const payPhone = p.contact ? normalizePhone(p.contact) : null;
  // Razorpay fills in void@razorpay.com when Checkout did not ask for an email.
  const payEmail = p.email && p.email !== "void@razorpay.com" ? normalizeEmail(p.email) : null;
  const inr = Math.round(p.amount / 100); // paise
  if (LEADS === "mongo") {
    // An update pipeline, so it can keep earlier values like the Postgres COALESCEs (and fill a new document's fields).
    const keep = (f: string, empty: unknown) => ({ $ifNull: ["$" + f, empty] });
    const { col } = await mongo();
    await col.updateOne(
      { _id: link },
      [
        {
          $set: {
            title: keep("title", ""),
            phone: keep("phone", null),
            email: keep("email", null),
            consent: keep("consent", null),
            pay_phone: { $ifNull: [{ $literal: payPhone }, "$pay_phone", null] },
            pay_email: { $ifNull: [{ $literal: payEmail }, "$pay_email", null] },
            paid_inr: { $literal: inr },
            paid_at: keep("paid_at", "$$NOW"),
            contacted_at: keep("contacted_at", null),
            opted_out: keep("opted_out", false),
            created_at: keep("created_at", "$$NOW"),
          },
        },
      ],
      { upsert: true },
    );
  } else if (LEADS === "db") await q(SQL.payment, [link, payPhone, payEmail, inr]);
  else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link] ?? blank(link, now);
      all[link] = { ...l, pay_phone: payPhone ?? l.pay_phone, pay_email: payEmail ?? l.pay_email, paid_inr: inr, paid_at: l.paid_at ?? now };
    });
}

/** Newest first. */
export async function listLeads(): Promise<Lead[]> {
  if (LEADS === "mongo") {
    const { col } = await mongo();
    return (await col.find().sort({ created_at: -1 }).limit(2000).toArray()).map((d) => row({ ...d, link: d._id }));
  }
  if (LEADS === "db") return (await q(SQL.list)).map(row);
  if (LEADS === "disk") return Object.values(await readFile()).map((l) => ({ ...EMPTY, ...l })).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [];
}

export async function updateLead(link: string, action: LeadAction) {
  if (LEADS === "mongo") {
    const { col } = await mongo();
    if (action === "delete") await col.deleteOne({ _id: link });
    else if (action === "contacted") await col.updateOne({ _id: link }, { $set: { contacted_at: new Date() } });
    else {
      // STOP means this person, so every link with their number or email.
      const l = await col.findOne({ _id: link });
      if (!l) return;
      const same = [{ _id: link }, ...(l.phone ? [{ phone: l.phone }] : []), ...(l.email ? [{ email: l.email }] : [])];
      await col.updateMany({ $or: same }, { $set: { opted_out: true } });
    }
  } else if (LEADS === "db") await q(SQL[action], [link]);
  else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link];
      if (!l) return;
      if (action === "delete") delete all[link];
      else if (action === "contacted") l.contacted_at = now;
      else for (const x of Object.values(all)) if (x.link === link || (l.phone && x.phone === l.phone) || (l.email && x.email === l.email)) x.opted_out = true;
    });
}

/** When the Postgres leads were copied into MongoDB (shown on /admin/leads), or null. */
export async function postgresImport(): Promise<{ at: string; copied: number; total: number } | null> {
  if (LEADS !== "mongo") return null;
  const { db } = await mongo();
  const m = await db.collection<ImportDoc>("meta").findOne({ _id: "postgres-import" });
  return m ? { at: m.at.toISOString(), copied: m.copied, total: m.total } : null;
}
