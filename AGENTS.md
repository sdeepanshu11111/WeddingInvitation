# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics. Do not add another analytics tool, SDK or tracking
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
| **Data residency** | India: `api_host: "https://api-in.mixpanel.com"`. Any other host silently drops the events. |
| **Project token location** | `next.config.mjs` → `NEXT_PUBLIC_MIXPANEL_TOKEN` → `MIXPANEL_TOKEN` in `lib/features.ts`. The token is public by design. |
| **When it is on** | Production deployment only (`VERCEL_ENV=production`). Force with `MIXPANEL=1` / `MIXPANEL=0`; `MIXPANEL_TOKEN=<token>` points it at another project (e.g. a dev project). |

---

## Mixpanel Initialization

**File:** `lib/analytics.ts`, function `startAnalytics(surface, superProps)`. It is called by exactly two pages:

- `app/page.tsx` (the editor): `startAnalytics("editor")`
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
| `template_selected` | Couple picks a template | `template_id`, `source` (`sidebar`/`gallery`) | `app/page.tsx` |
| `share_dialog_opened` | Couple opens Share | `template_id` | `app/page.tsx` |
| `invite_link_created` ★ | Share link saved (value moment) | `invite_id`, `template_id`, `palette_id`, `orientation`, `plan` (`free`/`premium`, only with payments on), `is_custom_name`, `has_music`, `photo_count`, `has_video`, `duration_seconds` | `components/editor/ShareDialog.tsx` |
| `video_export_clicked` | "Export MP4" clicked (demand while it is "Soon") | `is_available` | `app/page.tsx` |
| `payment_started` | Pay ₹ clicked (editor or guest page) | `invite_id`, `amount_inr` | `lib/pay.ts` |
| `payment_completed` | Server verified the Razorpay payment | `invite_id`, `amount_inr` (from the order, paise / 100) | `lib/pay.ts` |
| `payment_cancelled` | Buyer closed Razorpay Checkout | `invite_id` | `lib/pay.ts` |
| `payment_failed` | Order, Checkout load or verification failed | `invite_id` | `lib/pay.ts` |
| `invite_opened` | Guest tapped "Open invitation" | `orientation` | `app/e/[slug]/LiveInvite.tsx` |
| `invite_watched` | Guest reached the end (once per visit) | (super properties) | `app/e/[slug]/LiveInvite.tsx` |
| `invite_shared` | Link sent on: WhatsApp, the phone's share sheet (after it succeeds), or copy | `channel` (`whatsapp`/`native_share`/`copy`), `invite_id` | `ShareDialog.tsx` (`SharePanel`), `LiveInvite.tsx` (`GuestBar`) |

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
