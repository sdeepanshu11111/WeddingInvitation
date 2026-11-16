import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { LEADS } from "@/lib/features";
import { type Review, listReviews, publicReviews } from "@/lib/server/reviews";
import { SITE_URL } from "@/lib/site";
import { AddReview, ReviewActions } from "./ReviewActions";

/* Reviews (behind ADMIN_PASSWORD, middleware.ts): what couples said about their invite, and feedback customers
   sent on WhatsApp. Approve puts the words on the home page's hero; only reviews the customer allowed can go up.
   Hiding takes the words down but the stars still count in the average, so the average stays honest. */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reviews · " + BRAND, robots: { index: false, follow: false } };

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const stars = (n: number | null) => (n ? "★".repeat(n) + "☆".repeat(5 - n) : "");

export default async function Reviews({ searchParams }: { searchParams: { show?: string } }) {
  if (!LEADS)
    return (
      <main className="admin">
        <h1>Reviews</h1>
        <p className="admin-empty">Reviews need the database. Set MONGODB_URI in Vercel, then redeploy.</p>
      </main>
    );
  const [all, live] = await Promise.all([listReviews(), publicReviews()]);
  const show = (["pending", "approved", "hidden"] as const).find((s) => s === searchParams.show) ?? "all";
  const list = all.filter((r) => show === "all" || r.status === show);
  const tab = (id: string, label: string, n: number) => (
    <a href={"?show=" + id} className={show === id ? "on" : ""}>
      {label} <span>{n}</span>
    </a>
  );
  const n = (s: Review["status"]) => all.filter((r) => r.status === s).length;
  return (
    <main className="admin">
      <header className="admin-head">
        <h1>Reviews</h1>
        <nav className="admin-tabs">
          {tab("all", "All", all.length)}
          {tab("pending", "To check", n("pending"))}
          {tab("approved", "On the site", n("approved"))}
          {tab("hidden", "Hidden", n("hidden"))}
        </nav>
      </header>
      <p className="admin-note">
        On the home page now: {live.reviews.length ? live.reviews.length + " review" + (live.reviews.length > 1 ? "s" : "") : "none (the block stays hidden)"}.
        {live.count ? " Average " + live.average + " ★ from " + live.count + " couple" + (live.count > 1 ? "s" : "") + (live.count < 5 ? " (shown from 5)." : ".") : ""} Couples
        are asked on their own invite once it has no watermark. Hiding removes the words, not the stars: delete only spam.
      </p>
      <AddReview />
      {list.length === 0 ? (
        <p className="admin-empty">{all.length ? "Nothing here." : "No reviews yet. They arrive from couples' invite pages, or add one a customer sent you."}</p>
      ) : (
        <ul className="admin-list">
          {list.map((r) => (
            <li key={r.id} className={"lead review " + r.status}>
              <div className="lead-top">
                <b>
                  {r.rating ? <span className="rv-stars">{stars(r.rating)}</span> : null} {r.name || "No name given"}
                  {r.city ? <span className="dim"> · {r.city}</span> : null}
                </b>
                <span className={"lead-chip" + (r.status === "approved" ? " paid" : "")}>{r.status === "approved" ? "On the site" : r.status === "hidden" ? "Hidden" : "To check"}</span>
              </div>
              {r.text ? <p className="rv-text">&ldquo;{r.text}&rdquo;</p> : <p className="rv-text dim">Stars only, no words.</p>}
              <div className="lead-meta">
                <span>{r.source === "owner" ? "Added by you (WhatsApp)" : r.paid ? "Paid customer" : "Made a free link"}</span>
                {r.template_id ? <span className="dim">{r.template_id}</span> : null}
                {r.link ? (
                  <a className="lead-link" href={SITE_URL + "/e/" + r.link} target="_blank" rel="noopener">
                    /e/{r.link}
                  </a>
                ) : null}
                <span className="dim">{when(r.updated_at ?? r.created_at)}</span>
                {!r.consent ? <span className="stop">Private: they did not allow it on the site</span> : null}
              </div>
              <ReviewActions id={r.id} status={r.status} canPublish={r.consent && !!r.text} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
