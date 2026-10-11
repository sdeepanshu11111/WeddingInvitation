# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics, plus the **Meta Pixel** for ad measurement only (see
"Meta Pixel" below; the owner asked for it on 2026-10-11). Do not add another analytics tool, SDK or tracking
library unless the owner asks for it. Project context and architecture are in `CLAUDE.md`.

---

## Before You Add or Modify Any Tracking

- [ ] All tracking goes through `lib/analytics.ts` (`track()` and `startAnalytics()`). Never import `mixpanel-browser` anywhere else.
- [ ] No CDP: the browser SDK sends straight to Mixpanel.
- [ ] No consent gate: the audience is India only (owner's call, 2026-10-11). If EU/UK or California users are added, gate
      `startAnalytics()` behind consent first (`opt_out_tracking_by_default: true`, then `opt_in_tracking()`).
- [ ] Read the tracking plan below and reuse an event or property before inventing a new one.

---

## Tech Stack

| Detail | Value |
|---|---|
| **Platform** | Next.js 14 (App Router), React 18, TypeScript strict, hosted on Vercel |
| **Mixpanel SDK** | `mixpanel-browser`, core build only (`mixpanel-browser/src/loaders/loader-module-core`, no session replay) |
| **SDK version** | 2.84.0 (pinned) |
| **Tracking method** | client-side only |
| **CDP (if any)** | none |
| **Consent required** | no (India only) |
| **Data residency** | US (project 4072400) via `MIXPANEL_API_HOST` (default `https://api-js.mixpanel.com`). To move to an India project set `MIXPANEL_TOKEN` + `MIXPANEL_API_HOST=https://api-in.mixpanel.com` in Vercel and redeploy. A host that does not match the residency returns status 1 but drops the events. |
| **Project token location** | `next.config.mjs` → `NEXT_PUBLIC_MIXPANEL_TOKEN` → `MIXPANEL_TOKEN` in `lib/features.ts`. The token is public by design. |
| **When it is on** | Production deployment only (`VERCEL_ENV=production`). Force with `MIXPANEL=1` / `MIXPANEL=0`; `MIXPANEL_TOKEN=<token>` points it at another project (e.g. a dev project). |

---

## Mixpanel Initialization

**File:** `lib/analytics.ts`, function `startAnalytics(surface, superProps)`. It is called by exactly two pages:

- `app/create/page.tsx` (the editor): `startAnalytics("editor")`. The public pages (`/`, `/templates`, `/templates/<id>`) don't start Mixpanel yet (the Meta Pixel PageView from the root layout does cover them).
- `app/e/[slug]/LiveInvite.tsx` (the guest page): `startAnalytics("guest_page", { invite_id, template_id, is_watermarked })`

It loads the SDK with a dynamic `import()` after the page loads, so it never slows the invite down. `track()` calls
made before the SDK arrives are queued in order. It registers the super properties, then calls `track_pageview()`.

**Do not:**
- Start analytics in `app/layout.tsx` or on `/render` and `/client-render`. Headless Chrome screenshots those pages
  for every exported frame, so tracking there would flood the project with fake page views.
- Turn on `autocapture`, `record_sessions_percent` or heatmaps. They would capture the couple's names, photos and
  venue text from the screen.
- Remove `property_blacklist` on guest pages. `$current_url`, `current_page_title` and `current_url_path` contain the
  couple's names (`/e/aarav-ananya`, page title "Aarav & Ananya").

---

## Mixpanel Identity

There are no accounts: couples and guests are both anonymous devices (the SDK's `$device_id`), so there are **no
`identify()` or `reset()` calls**. If accounts are added later, call `identify(<database user id>)` (never an email)
on sign-up, login and session restore, `reset()` on logout, and track a `sign_up_completed` after `identify()`.

Invites are joined across events by `invite_id` = `inviteId(<link name>)` (a cyrb53 hash, so the names don't show).
Use the helper; never send the link name, couple names, dates, venue, phone or email.

---

## Mixpanel Tracking Plan

The event map in `lib/analytics.ts` (`type Events`) is the source of truth. `tsc` rejects an unknown event or a
wrong property, so update that type first.

### Naming conventions

- Event names: `snake_case`, `object_verb` in the past tense (`invite_link_created`). Never build a name at runtime.
- Property names: `snake_case`, full words. Booleans start with `is_` or `has_`.
- Values: lowercase strings, numbers unquoted (`amount_inr: 99`). Leave a property out rather than sending `null` or `""` (`track()` drops them).

### Super properties (on every event)

| Property | Where | Values |
|---|---|---|
| `surface` | all | `editor`, `guest_page` |
| `invite_id`, `template_id`, `is_watermarked` | guest page | which invite the guest is looking at |

### Current Mixpanel events

| Event | Trigger | Key properties | File |
|---|---|---|---|
| `$mp_web_page_view` | Editor or guest page loaded | (super properties) | `lib/analytics.ts` |
| `template_selected` | Couple picks a template (in the editor, or arrives from "Customize" on a template page with a different one) | `template_id`, `source` (`sidebar`/`gallery`/`template_page`) | `app/create/page.tsx` |
| `share_dialog_opened` | Couple opens Share | `template_id` | `app/create/page.tsx` |
| `invite_link_created` ★ | Share link saved (value moment) | `invite_id`, `template_id`, `palette_id`, `orientation`, `plan` (`free`/`premium`, only with payments on), `is_custom_name`, `has_music`, `photo_count`, `has_video`, `duration_seconds` | `components/editor/ShareDialog.tsx` |
| `video_export_clicked` | "Export MP4" clicked (demand while it is "Soon") | `is_available` | `app/create/page.tsx` |
| `payment_started` | Pay ₹ clicked (editor or guest page) | `invite_id`, `amount_inr` | `lib/pay.ts` |
| `payment_completed` | Server verified the Razorpay payment | `invite_id`, `amount_inr` (from the order, paise / 100) | `lib/pay.ts` |
| `payment_cancelled` | Buyer closed Razorpay Checkout | `invite_id` | `lib/pay.ts` |
| `payment_failed` | Order, Checkout load or verification failed | `invite_id` | `lib/pay.ts` |
| `invite_opened` | Guest tapped "Open invitation" | `orientation` | `app/e/[slug]/LiveInvite.tsx` |
| `invite_watched` | Guest reached the end (once per visit) | (super properties) | `app/e/[slug]/LiveInvite.tsx` |
| `invite_shared` | Link sent on: WhatsApp, the phone's share sheet (after it succeeds), or copy | `channel` (`whatsapp`/`native_share`/`copy`), `invite_id` | `ShareDialog.tsx` (`SharePanel`), `LiveInvite.tsx` (`GuestBar`) |

---

## Meta Pixel (ad measurement)

Pixel "FutureProof Wedding Web", ID `1116330824214375`, in the Futureproof 2 business portfolio, linked to ad account
`27943393368611288`. The portfolio-wide Conversions API gateway is off.

| Detail | Value |
|---|---|
| **Code** | `lib/analytics.ts` (`pixelPageView`, `pixelAllowed`, the `META` map), `components/MetaPixel.tsx` in `app/layout.tsx` |
| **When it is on** | Production deployment only. Force with `META_PIXEL=1` / `0`; `META_PIXEL_ID` points it at another pixel (`next.config.mjs`). |
| **Pages** | Site pages only: `/`, `/templates…`, `/create`, the policy pages. **Never** `/e/…` or `/v/…` (the URL has the couple's names, and `/privacy` promises guests' pages are untracked) and never `/render`, `/client-render`. `/e/*` also sends `Referrer-Policy: origin` so a guest clicking through to the site doesn't hand Meta the invite URL. |
| **PageView** | Fired by `<MetaPixel>` on every route change; Meta's own history listener is off (`disablePushState`). |
| **Automatic events** | Off (`autoConfig false`): they read button text and page content, which in the editor holds the couple's names. |

Meta events are sent by `track()` from the Mixpanel events, so there is one call per action:

| Mixpanel event | Meta event | Parameters |
|---|---|---|
| `template_selected` | `ViewContent` | `content_ids: [template_id]`, `content_type: product` |
| `share_dialog_opened` | `AddToCart` | same, plus `value: LINK_PRICE_INR`, `currency: INR` while payments are on |
| `payment_started` | `InitiateCheckout` | `value`, `currency: INR` |
| `payment_completed` | `Purchase` | `value` (from the order), `currency: INR`, `eventID: purchase-<invite_id>` |
| `invite_link_created` (free plan, or payments off) | `Lead` | `content_ids: [template_id]` |

A premium link fires `Purchase`, not `Lead`. Payments made from a guest page ("Remove · ₹" in `GuestBar`) send no
Meta events, because the pixel never runs there. The `eventID` is computable on the server (`inviteId(name)`), so a
future Conversions API sender can deduplicate against the browser. Send only template ids and amounts to Meta; no
names, link names, `invite_id` as a parameter, phone or email. **Any change to what reaches Meta means updating `/privacy`.**

---

## How to Add a New Mixpanel Event

1. Check the table above. Extend an existing event with a property before adding a new one (one event = one meaning).
2. Add it to `type Events` in `lib/analytics.ts` with its properties.
3. Call `track("event_name", { ... })` where the action happens, after it succeeds when there is a result to wait for.
4. Add a row to the table above.
5. Verify: build with `MIXPANEL=1` (e.g. `NEXT_DIST_DIR=.next-build MIXPANEL=1 npx next build`, then
   `next start -p 4322` with the same env), trigger it, and check Mixpanel Live View. `next dev` with `MIXPANEL=1`
   also works, with SDK debug logging in the console, but never run a second `next dev` beside the one already running.

## What Not to Do

- No PII in properties: no names, emails, phone numbers, venue, link names or payment details.
- No events inside loops or the rAF clock (`Frame`/`T`): track user actions, not frames.
- Don't track from server code without first solving duplicates: the browser already sends the payment events.
- Hide an event in Lexicon before dropping it, and drop it only after a quarter of watching.
