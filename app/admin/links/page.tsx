import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { LEADS, PAYMENTS } from "@/lib/features";
import { listLeads } from "@/lib/server/leads";
import { type LinkRecord, listLinks } from "@/lib/server/links";
import { ImportLinks } from "./ImportLinks";

/* Every invite link ever made (lib/server/links.ts), newest first: its address, design and price, where its maker
   came from, how far it travelled (guest opens), every checkout attempt and every payment. The id in grey is the
   invite_id Mixpanel knows the link by: paste one from a Mixpanel event into the search box to find its link.
   Behind ADMIN_PASSWORD (middleware.ts). Contact details live on /admin/leads. */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Links · " + BRAND, robots: { index: false, follow: false } };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

type Show = "all" | "paid" | "tried" | "saw" | "unpaid";
/** Paid = something was paid; tried = Checkout was opened and nothing was paid (an abandoned or failed payment); saw = the
    couple saw the pay sheet (or their 30 s preview ended) and did not open Checkout; unpaid = not even that. */
const state = (l: LinkRecord): "paid" | "tried" | "saw" | "free" | "unpaid" =>
  l.paid_inr > 0 ? "paid" : l.checkout_count > 0 ? "tried" : l.price_inr === 0 ? "free" : l.paysheet_opens > 0 || l.preview_ended_at ? "saw" : "unpaid";
const CHIP = { paid: "Paid", tried: "Tried to pay", saw: "Saw price", free: "Free design", unpaid: "Not paid" } as const;

export default async function Links({ searchParams }: { searchParams: { show?: string; q?: string; tests?: string } }) {
  if (!LEADS)
    return (
      <main className="admin">
        <h1>Links</h1>
        <p className="admin-empty">Link records are off. Set MONGODB_URI in Vercel, then redeploy.</p>
      </main>
    );
  const [every, leads] = await Promise.all([listLinks(), listLeads()]);
  const withContact = new Set(leads.filter((l) => l.phone || l.email || l.pay_phone || l.pay_email).map((l) => l.link));
  const tests = searchParams.tests === "1";
  const all = every.filter((l) => tests || !l.internal);
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const show: Show = searchParams.show === "paid" || searchParams.show === "tried" || searchParams.show === "saw" || searchParams.show === "unpaid" ? searchParams.show : "all";
  const found = q ? all.filter((l) => [l.link, l.title, l.invite_id, l.template_id, l.source, l.visit_source].some((v) => (v ?? "").toLowerCase().includes(q))) : all;
  const links = found.filter((l) => show === "all" || (show === "unpaid" ? state(l) === "unpaid" || state(l) === "free" : state(l) === show));
  const n = (s: Show) => (s === "all" ? found.length : found.filter((l) => (s === "unpaid" ? state(l) === "unpaid" || state(l) === "free" : state(l) === s)).length);
  const keep = (extra: Record<string, string>) => "?" + new URLSearchParams({ ...(q ? { q } : {}), ...(tests ? { tests: "1" } : {}), ...extra }).toString();
  const tab = (id: Show, label: string) => (
    <a href={keep(id === "all" ? {} : { show: id })} className={show === id ? "on" : ""}>
      {label} <span>{n(id)}</span>
    </a>
  );
  const rupees = all.reduce((sum, l) => sum + l.paid_inr, 0);
  const flat = all.filter((l) => l.flat);
  const opens = all.reduce((sum, l) => sum + l.opens, 0);
  const hidden = every.length - every.filter((l) => !l.internal).length;
  // The same view with test links (made on the owner's devices) shown or hidden.
  const testsHref = "?" + new URLSearchParams({ ...(q ? { q } : {}), ...(show !== "all" ? { show } : {}), ...(tests ? {} : { tests: "1" }) }).toString();

  return (
    <main className="admin">
      <header className="admin-head">
        <h1>Links</h1>
        <nav className="admin-tabs">
          {tab("all", "All")}
          {PAYMENTS ? tab("paid", "Paid") : null}
          {PAYMENTS ? tab("tried", "Tried to pay") : null}
          {PAYMENTS ? tab("saw", "Saw price") : null}
          {PAYMENTS ? tab("unpaid", "Not paid") : null}
        </nav>
      </header>
      <p className="admin-sum">
        <b>{all.length}</b> links · <b>{all.filter((l) => l.paid_inr > 0).length}</b> paid · <b>₹{rupees}</b> · <b>{opens}</b> guest opens
        {PAYMENTS ? (
          <>
            <br />
            {/* The couple's funnel since the flat-price release (flat links): link → number → preview ended → pay sheet → checkout → paid. */}
            Since ₹99 flat: <b>{flat.length}</b> links · <b>{flat.filter((l) => l.has_phone).length}</b> gave a number · <b>{flat.filter((l) => l.preview_ended_at).length}</b>{" "}
            finished the preview · <b>{flat.filter((l) => l.paysheet_opens > 0).length}</b> saw the pay sheet · <b>{flat.filter((l) => l.checkout_count > 0).length}</b> opened
            checkout · <b>{flat.filter((l) => l.paid_inr > 0).length}</b> paid
          </>
        ) : null}
        {hidden ? (
          <>
            {" "}
            · <a href={testsHref}>{tests ? "hide" : "show"} {hidden} test links</a>
          </>
        ) : null}
      </p>
      <form className="admin-search" method="get">
        <input name="q" defaultValue={q} placeholder="Search: names, link, design, source, or an invite_id from Mixpanel" />
        {show !== "all" ? <input type="hidden" name="show" value={show} /> : null}
        {tests ? <input type="hidden" name="tests" value="1" /> : null}
        <button className="btn sm">Search</button>
        <ImportLinks />
      </form>
      {links.length === 0 ? (
        <p className="admin-empty">
          {every.length ? "Nothing matches." : "No links recorded yet. New links appear here as they are made; press “Import existing links” to bring in the ones made before."}
        </p>
      ) : (
        <ul className="admin-list">
          {links.map((l) => {
            const s = state(l);
            const came = l.visit_source ?? l.source;
            return (
              <li key={l.link} className={"lead" + (l.internal ? " out" : "")}>
                <div className="lead-top">
                  <b>{l.title || l.link}</b>
                  <span className={"lead-chip" + (s === "paid" ? " paid" : s === "tried" || s === "saw" ? " tried" : "")}>
                    {s === "paid" ? "Paid ₹" + l.paid_inr : s === "tried" ? "Tried to pay ×" + l.checkout_count : CHIP[s]}
                  </span>
                </div>
                <a className="lead-link" href={l.url} target="_blank" rel="noopener">
                  {l.url}
                </a>
                <div className="lead-meta">
                  <span>
                    {l.template_id || "unknown design"}
                    {l.price_inr ? " · ₹" + l.price_inr + (l.flat ? " flat" : " (old price)") : " · free"}
                  </span>
                  <span className="dim">Created {when(l.created_at)}</span>
                  {l.updated_at ? (
                    <span className="dim">
                      Edited ×{l.update_count || 1}, last {when(l.updated_at)}
                    </span>
                  ) : null}
                  {came ? (
                    <span>
                      From {came}
                      {l.source && l.source !== came ? " (first visit: " + l.source + ")" : ""}
                    </span>
                  ) : null}
                  {l.os ? <span className="dim">{l.os}</span> : null}
                  <span>
                    {l.opens} guest opens{l.opens ? " · " + l.watched + " watched to the end" : ""}
                    {l.blessings ? " · " + l.blessings + " blessings" : ""}
                    {l.rsvp.yes + l.rsvp.maybe + l.rsvp.no ? " · RSVP " + l.rsvp.yes + " yes (" + l.rsvp.people + " people) / " + l.rsvp.maybe + " maybe / " + l.rsvp.no + " no" : ""}
                    {l.quiz_total ? " · quiz " + l.quiz_right + "/" + l.quiz_total : ""}
                  </span>
                  {l.last_opened_at ? <span className="dim">Last opened {when(l.last_opened_at)}</span> : null}
                  {l.photo_count || l.has_music || l.has_video ? (
                    <span className="dim">
                      {[l.photo_count ? l.photo_count + " photos" : "", l.has_music ? "music" : "", l.has_video ? "video" : ""].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                  {l.sample_fields ? <span className="stop">Sample date or venue left in</span> : null}
                  {l.has_phone ? (
                    <span>
                      <a href="/admin/leads">Number given at Get link</a>
                    </span>
                  ) : null}
                  {l.owner_visits ? (
                    <span className="dim">
                      Couple opened it ×{l.owner_visits}
                      {l.last_owner_visit_at ? ", last " + when(l.last_owner_visit_at) : ""}
                    </span>
                  ) : null}
                  {l.preview_ended_at ? (
                    <span>
                      Preview {l.preview_end_reason === "end" ? "watched to the end" : "ran its 30 s"} {when(l.preview_ended_at)}
                    </span>
                  ) : null}
                  {l.paysheet_opens ? (
                    <span className={s === "saw" ? "stop" : undefined}>
                      Pay sheet ×{l.paysheet_opens}
                      {l.last_paysheet_at ? ", last " + when(l.last_paysheet_at) : ""}
                      {l.pay_later ? " · “Not now” ×" + l.pay_later : ""}
                    </span>
                  ) : null}
                  {l.payments.map((p) => (
                    <span key={p.payment_id}>
                      ₹{p.amount_inr} on {when(p.at)} ({p.via}) <span className="mono">{p.payment_id}</span>
                    </span>
                  ))}
                  {s === "tried" && l.last_checkout_at ? <span className="stop">Checkout opened {when(l.last_checkout_at)}, no payment recorded</span> : null}
                  {withContact.has(l.link) && !l.has_phone ? (
                    <span>
                      <a href="/admin/leads">Contact saved</a>
                    </span>
                  ) : null}
                  {l.imported ? <span className="dim">Imported</span> : null}
                  {l.internal ? <span className="dim">Test (your device)</span> : null}
                  <span className="mono dim">invite_id {l.invite_id}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
