import { promises as fs } from "node:fs";
import path from "node:path";
import type { Collection } from "mongodb";
import type { Project } from "../types";
import { LEADS } from "../features";
import { inviteId } from "../inviteId";
import { priceOf } from "../pricing";
import { SITE_URL } from "../site";
import { mongoDb } from "./db";
import { EXPORT_DIR } from "./paths";
import { getLiveProject, getShare, listShareNames, paidRecord } from "./share";

/* =====================================================================
 * Link records: one document for EVERY invite link, so the owner can see what was made (/admin/links): its
 * address, design, price, when it was created and updated, where the visitor came from, each checkout attempt and
 * each payment, and how often guests opened it. Before this (2026-11-16) a link reached the database only when
 * the couple left a number or paid (the `leads` collection); every other link existed only as files in Blob.
 *
 * Collection `links`, _id = the link name (same key as `leads`, which keeps the contact details: personal data
 * stays in its own collection so it can be deleted on its own). `invite_id` is the hash Mixpanel knows the link by
 * (lib/inviteId.ts), so an event there can be matched to a link here without link names ever going to Mixpanel.
 *
 * Stored where leads are (the LEADS mode): "mongo" with MONGODB_URI, "disk" = exports/links.json locally, "" = off.
 * Every write is best effort: callers catch and log, a failed record never costs a couple their link or payment.
 * Fields are only ever $set / $inc / $push, never pre-filled with null or 0, so the operators cannot conflict and
 * `$min: paid_at` keeps the first payment's time; normalize() supplies the defaults when reading.
 * ===================================================================== */

export type LinkPayment = { payment_id: string; order_id: string; amount_inr: number; at: string; via: "checkout" | "webhook" | "import" | "pack" }; // pack: cleared by the couple's wedding pack (no money of its own)
/** A checkout that was opened. device: the buyer's anonymous Mixpanel id, so the server can attribute `payment_confirmed`. */
export type LinkCheckout = { order_id: string; amount_inr: number; at: string; device: string | null };

export type LinkRecord = {
  link: string; // /e/<link>
  url: string;
  invite_id: string;
  title: string;
  template_id: string;
  palette_id: string;
  orientation: string;
  price_inr: number; // the design's price when last published; 0 = a free design
  has_music: boolean;
  photo_count: number;
  has_video: boolean;
  sample_fields: number; // date / venue fields still holding the template's sample
  source: string | null; // where this device first came from (google, chatgpt, whatsapp, invite, direct...)
  visit_source: string | null; // where the visit that made the link came from
  os: string | null;
  internal: boolean; // made on a device that has opened /admin (the owner's tests)
  imported: boolean; // existed before link records; read back from storage
  created_at: string;
  updated_at: string | null;
  update_count: number;
  checkouts: LinkCheckout[];
  checkout_count: number;
  last_checkout_at: string | null;
  payments: LinkPayment[];
  paid_inr: number;
  paid_at: string | null;
  opens: number; // guests who tapped "Open invitation" (the couple's own views are not counted)
  watched: number; // guests who reached the end
  last_opened_at: string | null;
};

/** The facts of a link that come from its project: what was published. The project is whatever the browser sent,
    so everything is coerced and cut to size. */
export function linkFacts(project: Project, title: string, url: string) {
  const media = Object.values(project?.data ?? {})
    .flat()
    .filter((v: any) => v && typeof v === "object" && typeof v.src === "string") as { kind?: string }[];
  const templateId = String(project?.templateId ?? "").slice(0, 60);
  return {
    url,
    title: String(title).slice(0, 120),
    template_id: templateId,
    palette_id: String(project?.paletteId ?? "").slice(0, 40),
    orientation: project?.orientation === "horizontal" ? "horizontal" : "vertical",
    price_inr: priceOf(templateId),
    has_music: !!project?.music,
    photo_count: media.filter((m) => m.kind === "image").length,
    has_video: media.some((m) => m.kind === "video"),
    sample_fields: Array.isArray(project?.sample) ? project.sample.length : 0,
  };
}
export type LinkFacts = ReturnType<typeof linkFacts>;

/** Where the link's maker came from, as the browser reports it (lib/analytics.ts, trafficSource) plus the OS. */
export type LinkOrigin = { source: string | null; visit_source: string | null; os: string | null; internal: boolean };

const label = (v: unknown) => (typeof v === "string" && /^[\w.:-]{1,40}$/.test(v) ? v.toLowerCase() : null);
/** The origin of a link from the request: `meta` of POST /api/share and the User-Agent header. */
export function linkOrigin(meta: any, userAgent: string | null): LinkOrigin {
  const ua = userAgent ?? "";
  const os = /android/i.test(ua) ? "android" : /iphone|ipad|ipod/i.test(ua) ? "ios" : /windows/i.test(ua) ? "windows" : /mac os x/i.test(ua) ? "mac" : /linux/i.test(ua) ? "linux" : ua ? "other" : null;
  return { source: label(meta?.source), visit_source: label(meta?.visit_source), os, internal: meta?.internal === true };
}

/* ---- storage ---- */

type Doc = { _id: string } & Record<string, any>;
const g = globalThis as unknown as { __linksCol?: Promise<Collection<Doc>> };

async function col() {
  g.__linksCol ??= (async () => {
    const c = (await mongoDb()).collection<Doc>("links");
    await c.createIndex({ created_at: -1 });
    await c.createIndex({ invite_id: 1 });
    return c;
  })().catch((e) => {
    g.__linksCol = undefined; // try again on the next call
    throw e;
  });
  return g.__linksCol;
}

const FILE = path.join(EXPORT_DIR, "links.json");
const readDisk = async (): Promise<Record<string, Record<string, any>>> => JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "{}"));
/** Local development: read, change one record, write back. `create: false` leaves an unknown link alone. */
async function editDisk(link: string, fn: (rec: Record<string, any>, now: string) => void, create = true) {
  const all = await readDisk();
  const now = new Date().toISOString();
  if (!all[link]) {
    if (!create) return;
    all[link] = { created_at: now, invite_id: inviteId(link) };
  }
  fn(all[link], now);
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

const iso = (v: unknown) => (v ? new Date(v as string | number | Date).toISOString() : null);
const normalize = (link: string, d: Record<string, any>): LinkRecord => ({
  link,
  url: d.url ?? SITE_URL + "/e/" + link,
  invite_id: d.invite_id ?? inviteId(link),
  title: d.title ?? "",
  template_id: d.template_id ?? "",
  palette_id: d.palette_id ?? "",
  orientation: d.orientation ?? "",
  price_inr: d.price_inr ?? 0,
  has_music: !!d.has_music,
  photo_count: d.photo_count ?? 0,
  has_video: !!d.has_video,
  sample_fields: d.sample_fields ?? 0,
  source: d.source ?? null,
  visit_source: d.visit_source ?? null,
  os: d.os ?? null,
  internal: !!d.internal,
  imported: !!d.imported,
  created_at: iso(d.created_at) ?? new Date(0).toISOString(),
  updated_at: iso(d.updated_at),
  update_count: d.update_count ?? 0,
  checkouts: (d.checkouts ?? []).map((c: any) => ({ ...c, at: iso(c.at)! })),
  checkout_count: d.checkout_count ?? 0,
  last_checkout_at: iso(d.last_checkout_at),
  payments: (d.payments ?? []).map((p: any) => ({ ...p, at: iso(p.at)! })),
  paid_inr: d.paid_inr ?? 0,
  paid_at: iso(d.paid_at),
  opens: d.opens ?? 0,
  watched: d.watched ?? 0,
  last_opened_at: iso(d.last_opened_at),
});

/* ---- writes (each one is called inside a .catch by its API route) ---- */

/** A new link exists. `origin` is kept from the first write only: where the maker came from does not change. */
export async function recordLinkCreated(link: string, facts: LinkFacts, origin: LinkOrigin, createdAt: number) {
  const invite_id = inviteId(link);
  if (LEADS === "mongo") {
    await (await col()).updateOne({ _id: link }, { $set: { ...facts, invite_id }, $setOnInsert: { ...origin, created_at: new Date(createdAt) } }, { upsert: true });
  } else if (LEADS === "disk") {
    await editDisk(link, (r) => Object.assign(r, origin, facts, { invite_id, created_at: new Date(createdAt).toISOString() }));
  }
}

/** The owner republished their invite to the same link (updateLiveShare): new facts, one more update. */
export async function recordLinkUpdated(link: string, facts: LinkFacts, createdAt: number) {
  const invite_id = inviteId(link);
  if (LEADS === "mongo") {
    await (await col()).updateOne(
      { _id: link },
      { $set: { ...facts, invite_id, updated_at: new Date() }, $inc: { update_count: 1 }, $setOnInsert: { created_at: new Date(createdAt) } },
      { upsert: true },
    );
  } else if (LEADS === "disk") {
    await editDisk(link, (r, now) => Object.assign(r, facts, { invite_id, updated_at: now, update_count: (r.update_count ?? 0) + 1 }));
  }
}

/** Checkout was opened for this link (a Razorpay order exists). The last 20 are kept; the count is of all. */
export async function recordCheckout(link: string, c: { orderId: string; amountInr: number; device: string | null }) {
  if (LEADS === "mongo") {
    const now = new Date();
    await (await col()).updateOne(
      { _id: link },
      {
        $inc: { checkout_count: 1 },
        $set: { last_checkout_at: now },
        // as any: the documents are loosely typed (Doc), and the driver's $push type wants a declared array field.
        $push: { checkouts: { $each: [{ order_id: c.orderId, amount_inr: c.amountInr, at: now, device: c.device }], $slice: -20 } } as any,
        $setOnInsert: { created_at: now, invite_id: inviteId(link) },
      },
      { upsert: true },
    );
  } else if (LEADS === "disk") {
    await editDisk(link, (r, now) => {
      r.checkout_count = (r.checkout_count ?? 0) + 1;
      r.last_checkout_at = now;
      r.checkouts = [...(r.checkouts ?? []), { order_id: c.orderId, amount_inr: c.amountInr, at: now, device: c.device }].slice(-20);
    });
  }
}

/** The anonymous Mixpanel id of the browser that opened this order's checkout, if it was recorded. */
export async function checkoutDevice(link: string, orderId: string): Promise<string | null> {
  let list: LinkCheckout[] = [];
  if (LEADS === "mongo") list = (await (await col()).findOne({ _id: link }, { projection: { checkouts: 1 } }))?.checkouts ?? [];
  else if (LEADS === "disk") list = (await readDisk())[link]?.checkouts ?? [];
  return list.find((c) => c.order_id === orderId)?.device ?? null;
}

/**
 * A confirmed payment (from the checkout callback or the webhook; both report every payment). Idempotent by
 * payment id. paid_inr is the total paid on the link and paid_at the first payment's time.
 */
export async function recordPayment(link: string, p: { paymentId: string; orderId: string; amountInr: number; via: "checkout" | "webhook" | "pack" }) {
  const payment_id = p.paymentId || p.orderId;
  if (LEADS === "mongo") {
    const c = await col();
    const now = new Date();
    // Two steps: an upsert whose filter excludes this payment would try to insert a second document with the same _id
    // when the payment is already recorded.
    await c.updateOne({ _id: link }, { $setOnInsert: { created_at: now, invite_id: inviteId(link) } }, { upsert: true });
    await c.updateOne(
      { _id: link, "payments.payment_id": { $ne: payment_id } },
      { $push: { payments: { payment_id, order_id: p.orderId, amount_inr: p.amountInr, at: now, via: p.via } } as any, $inc: { paid_inr: p.amountInr }, $min: { paid_at: now } },
    );
  } else if (LEADS === "disk") {
    await editDisk(link, (r, now) => {
      if ((r.payments ?? []).some((x: LinkPayment) => x.payment_id === payment_id)) return;
      r.payments = [...(r.payments ?? []), { payment_id, order_id: p.orderId, amount_inr: p.amountInr, at: now, via: p.via }];
      r.paid_inr = (r.paid_inr ?? 0) + p.amountInr;
      r.paid_at ??= now;
    });
  }
}

/** A guest opened the invite, or watched it to the end. Counts only, nothing about the visitor. Only links that
    already have a record are counted: this is called by an open endpoint, and must not create documents. */
export async function recordGuestEvent(link: string, kind: "open" | "watched") {
  if (!/^[\w-]{3,64}$/.test(link)) return;
  if (LEADS === "mongo") {
    await (await col()).updateOne({ _id: link }, kind === "open" ? { $inc: { opens: 1 }, $set: { last_opened_at: new Date() } } : { $inc: { watched: 1 } });
  } else if (LEADS === "disk") {
    await editDisk(
      link,
      (r, now) => {
        if (kind === "open") {
          r.opens = (r.opens ?? 0) + 1;
          r.last_opened_at = now;
        } else r.watched = (r.watched ?? 0) + 1;
      },
      false,
    );
  }
}

/* ---- reads ---- */

/** Newest first. Folders in storage that hold no readable invite (import found them `broken`) are left out. */
export async function listLinks(limit = 2000): Promise<LinkRecord[]> {
  if (LEADS === "mongo") {
    const docs = await (await col()).find({ broken: { $ne: true } }).sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map((d) => normalize(d._id, d));
  }
  if (LEADS === "disk")
    return Object.entries(await readDisk())
      .filter(([, d]) => !d.broken)
      .map(([link, d]) => normalize(link, d))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  return [];
}

/**
 * Links made before link records existed: read them back from storage, `batch` per call (three reads each, and a
 * serverless function has limited time), so /admin/links calls this until `remaining` is 0. Never overwrites a
 * record that exists. A folder without a readable invite is noted as `broken` so it is not tried again; a storage
 * error leaves the link for the next call (`failed`).
 */
export async function importLinks(batch = 24): Promise<{ imported: number; failed: number; remaining: number }> {
  if (!LEADS) return { imported: 0, failed: 0, remaining: 0 };
  const names = await listShareNames();
  const have = new Set(LEADS === "mongo" ? (await (await col()).find({}, { projection: { _id: 1 } }).toArray()).map((d) => d._id) : Object.keys(await readDisk()));
  const todo = names.filter((n) => !have.has(n));
  const now = todo.slice(0, batch);
  let imported = 0;
  let broken = 0;
  const put = async (link: string, doc: Record<string, any>) => {
    if (LEADS === "mongo") await (await col()).updateOne({ _id: link }, { $setOnInsert: doc }, { upsert: true });
    else await editDisk(link, (r) => Object.assign(r, doc, { created_at: iso(doc.created_at) ?? r.created_at, updated_at: iso(doc.updated_at), paid_at: iso(doc.paid_at) }));
  };
  const one = async (link: string) => {
    const share = await getShare(link); // throws on a storage error: counted as failed, tried again next time
    const project = share?.kind === "live" ? await getLiveProject(link) : null;
    if (!share || share.kind !== "live" || !project) {
      await put(link, { broken: true, invite_id: inviteId(link), created_at: new Date() });
      broken++;
      return;
    }
    const paid = await paidRecord(link);
    const rupees = paid ? paid.covers ?? Math.round(paid.amount / 100) : 0;
    const paidAt = paid ? new Date(paid.paidAt) : null;
    await put(link, {
      ...linkFacts(project, share.title, (share.origin ?? SITE_URL) + "/e/" + link),
      invite_id: inviteId(link),
      imported: true,
      created_at: new Date(share.createdAt),
      ...(share.updatedAt ? { updated_at: new Date(share.updatedAt) } : {}),
      ...(paid && paidAt ? { payments: [{ payment_id: paid.paymentId || paid.orderId, order_id: paid.orderId, amount_inr: rupees, at: paidAt, via: "import" }], paid_inr: rupees, paid_at: paidAt } : {}),
    });
    imported++;
  };
  let failed = 0;
  for (let i = 0; i < now.length; i += 6) {
    const results = await Promise.allSettled(now.slice(i, i + 6).map(one));
    for (const r of results)
      if (r.status === "rejected") {
        failed++;
        console.error("Link import failed:", r.reason?.message ?? r.reason);
      }
  }
  return { imported, failed, remaining: todo.length - imported - broken };
}
