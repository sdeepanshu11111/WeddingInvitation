import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Collection } from "mongodb";
import { LEADS } from "../features";
import { mongoDb } from "./db";
import { EXPORT_DIR } from "./paths";

/* =====================================================================
 * Reviews: only real ones (owner, 2026-11-17: reviews in the hero for conversion). Never write or seed one: invented
 * reviews mislead buyers and are an unfair trade practice under India's consumer protection rules.
 *
 * Two sources:
 *  - "invite": the couple rates their invite in the owner sheet on /e/<name> (app/api/review). Only the browser that
 *    made the link holds its owner key, so every one of these is from someone who really made an invite here.
 *    One per link (_id "invite:<link>"); sending again replaces it and puts it back to "pending".
 *  - "owner": the owner adds feedback a customer sent them (e.g. on WhatsApp), with that customer's permission.
 *    Words only: no stars, and never counted in the average, because the owner typed them.
 *
 * The site shows a review's words only when the reviewer allowed it (`consent`) AND the owner approved it.
 * The average and count (shown from 5 reviews) take EVERY invite review with consent, approved, pending or hidden:
 * hiding takes the words off the site, not the stars, so low ratings cannot be buried. Delete is for spam only.
 *
 * Stored with the other private data (LEADS mode): MongoDB collection `reviews`, `exports/reviews.json` locally, or
 * off. The link name stays here and on /admin/reviews; the public list carries no link, only what the reviewer
 * chose to show (a name and a city they typed).
 * ===================================================================== */

export type ReviewStatus = "pending" | "approved" | "hidden";
export type Review = {
  id: string;
  source: "invite" | "owner";
  link: string | null; // the invite it is about (invite reviews)
  template_id: string;
  rating: number | null; // 1-5; null for the owner's WhatsApp ones
  text: string;
  name: string; // as the reviewer wants to be shown, e.g. "Priya & Rohan"
  city: string;
  consent: boolean; // may be shown on the website
  paid: boolean; // the link had paid when the review came in
  status: ReviewStatus;
  created_at: string;
  updated_at: string | null;
};
/** What a page may show: no link, no ids beyond the review's own. */
export type PublicReview = { id: string; rating: number | null; text: string; name: string; city: string; template_id: string; source: Review["source"]; paid: boolean };
export type ReviewSummary = { reviews: PublicReview[]; count: number; average: number | null };

export const TEXT_MAX = 300;
const clean = (v: unknown, max: number) =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
        .slice(0, max)
    : "";

type Doc = Omit<Review, "id"> & { _id: string };
const g = globalThis as unknown as { __reviewsCol?: Promise<Collection<Doc>> };
async function col() {
  g.__reviewsCol ??= (async () => {
    const c = (await mongoDb()).collection<Doc>("reviews");
    await c.createIndex({ status: 1, created_at: -1 });
    return c;
  })().catch((e) => {
    g.__reviewsCol = undefined;
    throw e;
  });
  return g.__reviewsCol;
}
const FILE = path.join(EXPORT_DIR, "reviews.json");
const readDisk = async (): Promise<Record<string, Omit<Review, "id">>> => JSON.parse(await fs.readFile(FILE, "utf8").catch(() => "{}"));
const writeDisk = async (all: Record<string, Omit<Review, "id">>) => {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
};
const toReview = ({ _id, ...d }: Doc): Review => ({ id: _id, ...d });

async function put(id: string, r: Omit<Review, "id">) {
  if (LEADS === "mongo") await (await col()).replaceOne({ _id: id }, r, { upsert: true }); // the upsert takes _id from the filter
  else if (LEADS === "disk") {
    const all = await readDisk();
    all[id] = r;
    await writeDisk(all);
  }
}

/** The couple's review of their own invite (the API route has checked the owner key). */
export async function saveInviteReview(link: string, input: { rating: unknown; text: unknown; name: unknown; city: unknown; consent: unknown }, facts: { template_id: string; paid: boolean }) {
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Pick 1 to 5 stars");
  const id = "invite:" + link;
  const before = (await listReviews()).find((r) => r.id === id);
  const now = new Date().toISOString();
  await put(id, {
    source: "invite",
    link,
    template_id: facts.template_id.slice(0, 60),
    rating,
    text: clean(input.text, TEXT_MAX),
    name: clean(input.name, 40),
    city: clean(input.city, 40),
    consent: input.consent === true,
    paid: facts.paid,
    status: "pending", // words they change are read again before they go up
    created_at: before?.created_at ?? now,
    updated_at: before ? now : null,
  });
}

/** Feedback a customer sent the owner, added on /admin/reviews with the customer's permission. Words only. */
export async function addOwnerReview(input: { text: unknown; name: unknown; city: unknown; template_id: unknown }) {
  const text = clean(input.text, TEXT_MAX);
  if (!text) throw new Error("Add what they said");
  await put("owner:" + randomBytes(6).toString("hex"), {
    source: "owner",
    link: null,
    template_id: clean(input.template_id, 60),
    rating: null,
    text,
    name: clean(input.name, 40),
    city: clean(input.city, 40),
    consent: true, // the owner confirms the customer's permission when adding it
    paid: false,
    status: "approved",
    created_at: new Date().toISOString(),
    updated_at: null,
  });
}

/** Every review, newest first (for /admin/reviews and the public list). */
export async function listReviews(): Promise<Review[]> {
  let all: Review[] = [];
  if (LEADS === "mongo") all = (await (await col()).find({}).toArray()).map(toReview);
  else if (LEADS === "disk") all = Object.entries(await readDisk()).map(([id, r]) => ({ id, ...r }));
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function setReviewStatus(id: string, status: ReviewStatus | "delete") {
  if (LEADS === "mongo") {
    const c = await col();
    if (status === "delete") await c.deleteOne({ _id: id });
    else await c.updateOne({ _id: id }, { $set: { status } });
  } else if (LEADS === "disk") {
    const all = await readDisk();
    if (!all[id]) return;
    if (status === "delete") delete all[id];
    else all[id].status = status;
    await writeDisk(all);
  }
}

/** For the home page: approved, allowed reviews with words (best and newest first), and the honest average. */
export async function publicReviews(limit = 8): Promise<ReviewSummary> {
  if (!LEADS) return { reviews: [], count: 0, average: null };
  const all = await listReviews();
  const rated = all.filter((r) => r.source === "invite" && r.consent && r.rating);
  const average = rated.length ? Math.round((rated.reduce((s, r) => s + r.rating!, 0) / rated.length) * 10) / 10 : null;
  const reviews = all
    .filter((r) => r.status === "approved" && r.consent && r.text)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map(({ id, rating, text, name, city, template_id, source, paid }) => ({ id, rating, text, name, city, template_id, source, paid }));
  return { reviews, count: rated.length, average };
}
