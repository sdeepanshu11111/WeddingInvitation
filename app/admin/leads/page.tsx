import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { LEADS, LINK_PRICE_INR, PAYMENTS } from "@/lib/features";
import { formatPhone } from "@/lib/phone";
import { type Lead, listLeads } from "@/lib/server/leads";
import { SITE_URL } from "@/lib/site";
import { LeadActions } from "./LeadActions";

/* The owner's follow-up list (behind ADMIN_PASSWORD, see middleware.ts): who made a link, their WhatsApp
   number, whether they paid, and a button that opens WhatsApp with a ready message. Sent from the owner's
   own WhatsApp, so it costs nothing; the owner can edit the message before sending. */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads · " + BRAND, robots: { index: false, follow: false } };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** The message the WhatsApp button starts with. */
function message(l: Lead, url: string) {
  const invite = l.title ? `invitation "${l.title}"` : "invitation";
  if (l.paid_inr != null)
    return `Hi! This is ${BRAND} 🙏 Thank you for going Premium. Your ${invite} is live without the watermark: ${url}\n\nIf anything isn't working, just reply here.`;
  if (!PAYMENTS) return `Hi! This is ${BRAND} 🙏 Thanks for making your ${invite}: ${url}\n\nNeed any help with it? Just reply here.`;
  return (
    `Hi! This is ${BRAND} 🙏 Thanks for making your ${invite}: ${url}\n\n` +
    `Right now your guests will see a "Preview" watermark on it. To remove it, open your link and tap "Pay ₹${LINK_PRICE_INR}" at the bottom. ` +
    `Same link, nothing to resend.\n\nAny questions? Just reply. (Reply STOP and we won't message you again.)`
  );
}

export default async function Leads({ searchParams }: { searchParams: { show?: string } }) {
  if (!LEADS)
    return (
      <main className="admin">
        <h1>Leads</h1>
        <p className="admin-empty">Lead capture is off. Connect a Postgres database (Vercel → Storage → Neon), then redeploy.</p>
      </main>
    );
  const all = await listLeads();
  const show = searchParams.show === "paid" || searchParams.show === "unpaid" ? searchParams.show : "all";
  const leads = all.filter((l) => show === "all" || (show === "paid") === (l.paid_inr != null));
  const paid = all.filter((l) => l.paid_inr != null).length;
  const tab = (id: string, label: string, n: number) => (
    <a href={"?show=" + id} className={show === id ? "on" : ""}>
      {label} <span>{n}</span>
    </a>
  );
  return (
    <main className="admin">
      <header className="admin-head">
        <h1>Leads</h1>
        {PAYMENTS ? (
          <nav className="admin-tabs">
            {tab("all", "All", all.length)}
            {tab("unpaid", "Not paid", all.length - paid)}
            {tab("paid", "Paid", paid)}
          </nav>
        ) : null}
      </header>
      {leads.length === 0 ? (
        <p className="admin-empty">{all.length ? "Nobody here yet." : "No leads yet. Everyone who creates a link shows up here with their WhatsApp number."}</p>
      ) : (
        <ul className="admin-list">
          {leads.map((l) => {
            const url = SITE_URL + "/e/" + l.link;
            const num = l.phone ?? l.pay_phone;
            const wa = num && !l.opted_out ? "https://wa.me/" + num.replace(/\D/g, "") + "?text=" + encodeURIComponent(message(l, url)) : null;
            return (
              <li key={l.link} className={"lead" + (l.opted_out ? " out" : "")}>
                <div className="lead-top">
                  <b>{l.title || l.link}</b>
                  {PAYMENTS ? <span className={"lead-chip" + (l.paid_inr != null ? " paid" : "")}>{l.paid_inr != null ? "Paid ₹" + l.paid_inr : "Not paid"}</span> : null}
                </div>
                <a className="lead-link" href={url} target="_blank" rel="noopener">
                  /e/{l.link}
                </a>
                <div className="lead-meta">
                  {num ? <span>{formatPhone(num)}</span> : <span className="dim">No number</span>}
                  {l.phone && l.pay_phone && l.pay_phone !== l.phone ? <span>Paid from {formatPhone(l.pay_phone)}</span> : null}
                  {l.email ? <span>{l.email}</span> : null}
                  <span className="dim">Created {when(l.created_at)}</span>
                  {l.contacted_at ? <span className="dim">Messaged {when(l.contacted_at)}</span> : null}
                  {l.opted_out ? <span className="stop">Replied STOP</span> : null}
                </div>
                <LeadActions link={l.link} whatsapp={wa} optedOut={l.opted_out} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
