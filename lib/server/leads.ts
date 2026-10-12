import { promises as fs } from "node:fs";
import path from "node:path";
import { type Collection, MongoClient } from "mongodb";
import { LEADS } from "../features";
import { normalizeEmail, normalizePhone } from "../contact";
import { EXPORT_DIR } from "./paths";

/* =====================================================================
 * Leads: the people behind invite links, so the owner can follow up on
 * WhatsApp or email from /admin/leads. One document per link:
 *   - the WhatsApp number and/or email typed in the Get-link step (with the notice they saw),
 *   - the phone and email a payer typed into Razorpay Checkout.
 * Private data: never written to Vercel Blob (that store is public), Mixpanel
 * or the Meta Pixel, never logged, never sold or shared.
 *
 * LEADS = "mongo" MongoDB (MONGODB_URI, e.g. Atlas; database MONGODB_DB, default "invite_studio")
 *         "disk"  exports/leads.json, when running locally
 *         ""      off (on Vercel without MONGODB_URI: the Get-link step asks for nothing)
 * ===================================================================== */

export type Lead = {
  link: string; // the share name: /e/<link>
  title: string; // "Aarav & Ananya"
  phone: string | null; // E.164, from the Get-link step
  email: string | null; // from the Get-link step
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

/* ---- MongoDB ---- */

/** One document per link (_id = link), dates as BSON dates. */
type LeadDoc = Omit<Lead, "link" | "paid_at" | "contacted_at" | "created_at"> & { _id: string; paid_at: Date | null; contacted_at: Date | null; created_at: Date };

// On globalThis so dev hot-reloads reuse the connection instead of opening a new pool each time.
const g = globalThis as unknown as { __leadsMongo?: Promise<Collection<LeadDoc>> };

/** The leads collection, connected once per server instance. */
async function mongo() {
  g.__leadsMongo ??= (async () => {
    const client = await new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 }).connect();
    const col = client.db(process.env.MONGODB_DB || "invite_studio").collection<LeadDoc>("leads");
    await col.createIndex({ created_at: -1 });
    return col;
  })().catch((e) => {
    g.__leadsMongo = undefined; // try again on the next call
    throw e;
  });
  return g.__leadsMongo;
}

const iso = (v: Date | null | undefined) => (v ? new Date(v).toISOString() : null);
const fromDoc = (d: LeadDoc): Lead => ({
  link: d._id,
  title: d.title ?? "",
  phone: d.phone ?? null,
  email: d.email ?? null,
  consent: d.consent ?? null,
  pay_phone: d.pay_phone ?? null,
  pay_email: d.pay_email ?? null,
  paid_inr: d.paid_inr ?? null,
  paid_at: iso(d.paid_at),
  contacted_at: iso(d.contacted_at),
  opted_out: !!d.opted_out,
  created_at: iso(d.created_at)!,
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

/** The number and/or email from the Get-link step, saved once the link exists. */
export async function saveShareLead(link: string, title: string, c: { phone: string | null; email: string | null }, consent: string) {
  if (LEADS === "mongo") {
    const col = await mongo();
    const fresh = { pay_phone: null, pay_email: null, paid_inr: null, paid_at: null, contacted_at: null, opted_out: false, created_at: new Date() };
    await col.updateOne({ _id: link }, { $set: { title, phone: c.phone, email: c.email, consent }, $setOnInsert: fresh }, { upsert: true });
  } else if (LEADS === "disk") await edit((all, now) => void (all[link] = { ...(all[link] ?? blank(link, now)), title, ...c, consent }));
}

/** What a payer typed into Razorpay Checkout (any link, also ones made before lead capture existed). */
export async function savePaymentLead(link: string, p: { contact?: string | null; email?: string | null; amount: number }) {
  const payPhone = p.contact ? normalizePhone(p.contact) : null;
  // Razorpay fills in void@razorpay.com when Checkout did not ask for an email.
  const payEmail = p.email && p.email !== "void@razorpay.com" ? normalizeEmail(p.email) : null;
  const inr = Math.round(p.amount / 100); // paise
  if (LEADS === "mongo") {
    // An update pipeline, so it keeps earlier values (a repeat keeps the first paid_at) and fills a new document's fields.
    const keep = (f: string, empty: unknown) => ({ $ifNull: ["$" + f, empty] });
    const col = await mongo();
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
  } else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link] ?? blank(link, now);
      all[link] = { ...l, pay_phone: payPhone ?? l.pay_phone, pay_email: payEmail ?? l.pay_email, paid_inr: inr, paid_at: l.paid_at ?? now };
    });
}

/** Newest first. */
export async function listLeads(): Promise<Lead[]> {
  if (LEADS === "mongo") return (await (await mongo()).find().sort({ created_at: -1 }).limit(2000).toArray()).map(fromDoc);
  if (LEADS === "disk") return Object.values(await readFile()).map((l) => ({ ...EMPTY, ...l })).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return [];
}

export async function updateLead(link: string, action: LeadAction) {
  if (LEADS === "mongo") {
    const col = await mongo();
    if (action === "delete") await col.deleteOne({ _id: link });
    else if (action === "contacted") await col.updateOne({ _id: link }, { $set: { contacted_at: new Date() } });
    else {
      // STOP means this person, so every link with their number or email.
      const l = await col.findOne({ _id: link });
      if (!l) return;
      const same = [{ _id: link }, ...(l.phone ? [{ phone: l.phone }] : []), ...(l.email ? [{ email: l.email }] : [])];
      await col.updateMany({ $or: same }, { $set: { opted_out: true } });
    }
  } else if (LEADS === "disk")
    await edit((all, now) => {
      const l = all[link];
      if (!l) return;
      if (action === "delete") delete all[link];
      else if (action === "contacted") l.contacted_at = now;
      else for (const x of Object.values(all)) if (x.link === link || (l.phone && x.phone === l.phone) || (l.email && x.email === l.email)) x.opted_out = true;
    });
}
