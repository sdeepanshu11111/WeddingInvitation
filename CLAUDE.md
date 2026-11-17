# Invite Studio: project context for Claude

Wedding / Indian-function **video invitation** maker. The user picks a template, fills in fields
(names, dates, photos, video, music) and exports a real **MP4** in **9:16** (Reels / WhatsApp Status)
and/or **16:9** (YouTube / TV). Target market: **India** (Hindu, South Indian, Muslim, Sikh, Christian, modern).
The owner is building this as a product. Keep the UI in English; templates use Indian scripts.

## Run

```bash
npm install          # also downloads headless Chrome (puppeteer) + ffmpeg-static
npm run dev          # http://localhost:4321 (site), /create (studio)
npm run typecheck    # tsc --noEmit (keep it clean)
npm run snapshot -- <outDir> --only=<template-id>   # contact sheets of every scene, both orientations (dev server must run)
node scripts/frame.mjs out.png <template-id> vertical|horizontal <ms>   # one full-res frame
npm run render -- project.json [--both] [--720p|--4k]                   # CLI export of a saved project
```

Production build without stopping dev: `NEXT_DIST_DIR=.next-build npx next build` (then delete `.next-build`).
Platform: Windows. Next 14.2.35, React 18, TypeScript strict, plain CSS (no Tailwind).

## Architecture (the one idea that matters)

**Every animation is a pure function of time `t` (ms).** No CSS keyframes, no `setInterval`, no `Math.random`
inside scenes. That is why the preview and the exported MP4 are pixel-identical: the exporter seeks to
frame N and screenshots it.

```
TemplateDef (fields + palettes + build()) → buildTimeline() → <Frame T={ms}/>
   editor: rAF clock drives T              /render page: headless Chrome → screenshot/frame → ffmpeg → MP4
```

- `lib/anim.ts`: easings `E.*`, `tw(t,start,dur,ease)` → 0..1, style helpers `rise / drop / pop / fade / maskUp / kenBurns / drawPath`,
  `transitionStyle()` (fade, slide-*, zoom-*, wipe-*, iris, blur, curtain), `layout()` for scene overlap.
- `lib/types.ts`: `Field` union (text, textarea, date, time, image, gallery, video, select, toggle, **events**),
  `TemplateDef`, `Scene`, `SceneCtx`, `CategoryId`, `CommunityId`, `EventItem`.
- `lib/catalog.ts`: `CATEGORIES` (wedding, multi-event, engagement, haldi, mehendi, sangeet, reception, save-the-date,
  each with a Hindi label) and `COMMUNITIES`; `filterTemplates()`.
- `lib/project.ts`: `defaultProject()` (carries names/dates/venue/photos/events across template switches),
  `buildTimeline()`, image compression on upload, IndexedDB autosave.
- `lib/sizes.ts`: design space 1080×1920 / 1920×1080, kept dependency-free so server code can import it.
- `components/Frame.tsx`: `<Frame>` draws one frame; `<Stage>` scales the design space to fit.
- `components/primitives.tsx`: Layer, Reveal, WordsUp, Typewriter, DiamondRule, Photo (Ken Burns), **Clip** (video seeked
  frame-exact during export, reporting via `window.__mediaPending`), Mandala, Corner, Sprig, Particles, Petals, Grain, Tape, `dateParts()`, `prettyTime()`.
- `components/indian.tsx`: Garlands (marigold), Toran, Flame/Diya, Kalash, Paisley, HennaRing, Kolam, BananaLeaf,
  TempleBorder, Bell, StandingLamp, StarLattice, Mehrab, Lantern, Crescent, Sunburst, PhulkariBand, Sparkles, Rings,
  Confetti, FairyLights, Beams, Equalizer, Notes, DecoFan.
- `components/blocks.tsx`: Kicker, Headline, DateBlock, VenueBlock, Schedule ("Item — time" lines), PhotoCircle, Names,
  EventCard, EventsOverview, `lines()`.
- `components/editor/`: `Fields.tsx` (schema-driven form incl. EventsField + MusicPanel), `ExportDialog.tsx`, `TemplateGallery.tsx`
  (category tabs, community filter, search, live previews that play on hover).
- **Public site**, "Ivory & sindoor", redesigned for conversion and **built phone first** (most visitors are on phones; `app/site.css` base
  rules are the phone layout, `@media (min-width: 861px)` adds desktop): ivory (`--bg #fcf8f2`), plum ink (`--text #241316`), one maroon
  (`--accent #a01d38`) reserved for actions and the chosen state, gold `--gilt` only as ornament. Fraunces `--display` headlines with the
  accent words in `<em>`, Inter Tight `--ui`, `.kicker` labels, pill CTAs (`.cta-btn`, `.ghost-btn`, min 48px tall). Don't name a site class
  `.center` / `.lead`-style generic names without checking `globals.css` (the studio's `.center` and admin's `li.lead` collided once).
  `/` (`app/page.tsx`): the hero (`Hero` in `components/site/Landing.tsx`) lets visitors **type their names and watch them in a real playing
  template** (it opens on the names scene, `sceneForField("brideName")`, and holds there while typing; the design's `thumb()` art fills
  the phone until the script loads; phones show the phone and the name boxes side by side so both stay above the keyboard;
  "Pick a design" cards use each template's `thumb()` art, the playing one ringed, plus a "More designs" card), headline "Wedding invites
  your guests can play with." (2026-11-17 conversion redesign: kicker with "from ₹PRICE_MIN", a one-line lead on phones too, **"What are
  you inviting for?" function chips** that switch the playing phone and the design row to that function (`HERO_FNS`; picking one counts
  as a choice, so the button carries `?template=`), **tap the playing phone** to shower flowers over it (`PhoneTap`, glyphs by function via
  `momentKind`/`momentGlyphs`), payment icons under the button, and events `hero_function_picked`, `hero_names_typed`,
  `hero_design_picked`, `hero_phone_tapped`, `home_cta_clicked {section:"hero"}` (also from the pinned MobileCta)), then a one-row proof strip, the playing designs with function tabs ("Which function are you inviting for?",
  `Showcase`; cards open `/templates/<id>`), **"Try it yourself"** (`components/site/GuestDemo.tsx`, 2026-11-17: a phone the visitor plays
  with: envelope, scratch, shower, quiz, RSVP; the real `Interactive.tsx` components in a demo that sends nothing, mounted near the
  viewport, labelled "Example"), "One link. Know who's coming." (WhatsApp chat + an RSVP counts card marked example), how it works,
  "why a link" comparison (4 rows, the rest fold), pricing, FAQ, final CTA. Calls to action go through `CtaLink` (Landing.tsx), which sends
  `home_cta_clicked {section}`; demo steps send `home_demo_step`. The promo strip
  above the header is desktop only. Why this order (Mixpanel, 13 Oct 2026, a one-day Meta ad test; **no Meta ads have run since, owner 2026-11-14**): ~80% of visitors were Android phones from those ads, only ~19%
  of home visitors reached the studio, while ~66% of `/templates/<id>` visitors did, so real designs come right after the hero.
  Keep the home page light: every font a visible glyph needs downloads (a decorative row of five scripts once cost ~200 KB).
  **Names travel to the studio through sessionStorage (`lib/start.ts`), never the URL** (/create's URL reaches Mixpanel and the Pixel);
  `useStartNames`/`NamesForm` (components/site/NamesForm.tsx) save as they type, the studio's `takeStart()` applies them once via
  `withNames()` (lib/project.ts: bride → brideName/nameA, groom → groomName/nameB). Template cards play on hover, and on touch screens while
  in the middle band of the screen. `/templates` is the browser (`?category=`, Refine sidebar, sticky chips on phones); `/templates/<id>`
  has a big player with the visitor's names, palettes, and "Customize this design" = `/create?template=&palette=&o=`. Pinned bottom CTA on
  phones: `MobileCta` (`spacer={false}` when rendered mid-page). Free guest invites show "Make your own invitation" on the end screen
  (`/templates/<id>?utm_source=invite&utm_medium=guest_page`); paid ones show a small "Made with FutureProof · Make yours" line there instead (`end-credit`, `utm_medium=guest_credit`, owner 2026-11-17; never on the invite itself, Terms section 6 says so). Shared parts: `components/site/` (SiteHeader, SiteFooter, TemplateCard, Faq with
  `faqItems()` that follows the feature flags, Landing) and `components/LivePreview.tsx` (demo timeline, loop clock, `LazyPreview` mounts
  only near the viewport). Styles: `app/site.css`; the studio restyle is `app/studio.css`, loaded after `globals.css`. The guest page wraps
  itself in `.guest-ui`, which restores the old dark/gold tokens, because it frames the couple's invitation, not our brand. Public pages
  send Mixpanel page views with surface `site` (see Analytics). Copy is our own: no invented reviews, ratings or claims, and answers stay true to `PAYMENTS` / `VIDEO_EXPORT`.
- `app/create/page.tsx`: the editor (sidebar categories, canvas, transport, form). Colours sit right under the preview: a row on the
  canvas on desktop, the top of the Design panel on phones (`components/PalettePicker.tsx`, shared with `/templates/<id>`). Tapping a form field jumps the preview to the scene that shows it and pauses there (`lib/fieldScene.ts` maps field keys to scene ids/labels; fields carry `data-field`). Arriving with `?template` opens the Details tab on phones. It reads `?template&palette&o` once, then strips them
  from the URL. **Phones (≤ 860px)**: an app layout, not a stack:
  preview on top, one panel below chosen by bottom tabs (`.app[data-tab]` = design → `.left`, details → `.right`, preview =
  full-height canvas) plus Get link; sticky "Next" steps guide Design → Details → Get link; the ⋯ menu holds Browse/Open/Export.
  Use `desk-only` / `mob-only` classes for parts that differ; inputs are 16px on phones (iOS zooms below that); dialogs
  become bottom sheets. The editor autoplays on load. `app/render/page.tsx`: headless target exposing
  `window.__ready / __info / __seek(t) / __project`. Preview mode: `/render?template=<id>&orientation=horizontal&palette=<id>&demo=1`.
- `lib/server/render.ts`: export queue (one job at a time, **90s stall watchdog**, per-step timeouts), puppeteer screenshots
  piped as JPEG into ffmpeg (H.264 + AAC music with fade), and **auto-copy of every MP4 to `exports/`**.
- API: `POST /api/render`, `GET /api/render/[id]`, `GET /api/render/[id]/file[?inline=1]`, `POST /api/render/[id]/reveal`
  (opens Explorer, localhost only), `GET /api/job/[id]`, `POST /api/project` (saves the project JSON to `exports/`).
- Share links (`lib/server/share.ts`), page `/e/[slug]` with readable names (`/e/aarav-ananya`; old `/v/<token>` links
  308-redirect there via next.config). Server-rendered, so link previews work; on-demand ISR (`generateStaticParams` → `[]`,
  `revalidate = false`): rendered on first visit, then cached. Don't read headers/cookies there or it turns dynamic; absolute
  URLs come from `SITE_URL` (`lib/site.ts`). Caching only shows in a production build, not `next dev`.
  - Names are a per-couple number + first names (`autoBase` in ShareDialog + `nextNumberedName` in share.ts, e.g. 1-aarav-ananya,
    then 2-aarav-ananya; honorifics skipped). The studio posts `1-<first names>` with `auto: true` and the server takes the next
    free number itself on a clash (`GET /api/share/check?next=` also answers it). Nobody picks a name any more (no "Edit" since 2026-10-21).
    Payment logos (`components/PayIcons.tsx`) are Simple Icons 16.32.0 paths (CC0); UPI is a text badge.
  - Names (`lib/slug.ts`: 3–50 of a-z 0-9 single hyphens) are claimed by writing `project.json` with no-overwrite (Blob
    default, `wx` on disk). `GET /api/share/check?name=&year=` (unused by the UI now) → available / suggestion (name-year, -2..-9).
  - **Names are guessable, so a 404 may be cached before a name exists.** `POST /api/share` calls `revalidatePath("/e/"+name)`
    (works for pages). The preview card is `/e/[slug]/card?v=<createdAt>` (next/og route), linked from the page metadata:
    Next 14 does NOT invalidate cached route responses on revalidatePath (file-system-cache only checks `kind === "PAGE"`),
    so the card must live at a URL that only exists after creation. Same reason for Blob reads: the Blob CDN keeps a 404
    for up to a minute after the file is written, and `get(..., { useCache: false })` only bypasses it for **private** stores
    (ours is public). So `readJSON` adds a fresh `?fresh=<now>` query, and existence checks (`isPaid`, `nameTaken`) use
    `head()`, which asks the Blob API. The SDK's undici fetch stays outside Next's caching.
  - **Live** ("Get invite link" / "Get link", `GetLink` in `components/editor/ShareDialog.tsx`), **no form since 2026-10-21, for conversion**:
    the tap creates the link at once (`POST /api/share {project,title,card,name,auto}` stores a snapshot), shows a celebration
    (confetti + drawn tick, `components/Celebrate.tsx`, the link with Copy) and after **3 s** sends the studio tab to `/e/<name>`
    ("Stay in the studio" cancels). The response carries an **owner key**: the share stores only its sha256 (`ownerHash` in
    share.json, public Blob, fine for 144 random bits), the creating browser keeps the key in localStorage (`lib/owner.ts`,
    `fp.owned`). On `/e/<name>` that key turns the guest page into the couple's: a note on the cover ("This is exactly what your
    guests will see"), `<OwnerBar>` instead of `<GuestBar>`, and `<OwnerSheet>` (opens from the bar, and by itself when the invite
    ends): remove the watermark (Razorpay), share (WhatsApp / copy / share sheet), and an optional WhatsApp number or email saved via
    `POST /api/share/contact {name,key,phone|email}` (403 without the right key, so nobody can attach a number to someone else's
    link). All client-side, so the page stays static ISR HTML for everyone. Another browser = guest view (fine).
    `card` (palette colours + date) is computed in the editor so server code never imports the templates.
    `app/e/[slug]/LiveInvite.tsx` plays it with `<Frame>` + rAF clock: tap-to-open cover (audio unlock on iOS), 9:16 on
    portrait screens and 16:9 on landscape, mute/replay. **Interactive like stories** (since 2026-10-21): one progress segment per
    scene at the top, tap the right 70% = next scene, left 30% = back, hold = pause (`onDown/onUp`, music re-synced on seek), arrow keys,
    a one-time "Tap to skip · Hold to pause" hint, and "N days to go" on the cover (computed in the browser; the cover HTML is cached).
    When it ends, `GuestDetails.tsx` shows each function with **Add to calendar** (Google Calendar link; iPhones get
    `/e/<name>/calendar.ics`, every function in one file) and **Directions** (Google Maps search), **RSVP on WhatsApp** when any field holds an
    Indian mobile (the families' RSVP lines), a countdown and Watch again; ✕ tucks it into a pill. All read from the invite's fields by
    `lib/inviteDetails.ts` (shared field names: weddingDate/Time, venueName/Address/City, events, receptionDate/Time/Venue/`receptionLabel`,
    walima*, muhurthamStart/End, schedule; `MAIN` names a template's main function). Times are IST. Analytics: `guest_action_clicked`. Its `<Warmup>` lays out every scene hidden once, so only the
    fonts the invite uses download (~260 KB instead of 2.4 MB for all 174 faces).
  - **Video** ("Share link" on a finished export, only with `VIDEO_EXPORT`): `POST /api/share {file,title}` links an MP4.
  - Storage (`SHARE_STORE`): `disk` = `exports/shares/<token>/`, media served by `/api/share/[token]/media/[name]` via
    `lib/server/stream.ts` (Range support; iOS needs it). `blob` (when `BLOB_STORE_ID` or `BLOB_READ_WRITE_TOKEN` is set)
    = Vercel Blob `shares/<name>/`; the editor first uploads media straight to Blob (Vercel caps request bodies at 4.5 MB)
    with `uploadPresigned` to `shares/uploads/<uuid>.<ext>`; `/api/share/upload` answers with `handleUploadPresigned` +
    `issueSignedToken`. That flow works with **OIDC** (`BLOB_STORE_ID`, what Vercel sets for new stores, no secret) and
    with the old token; the older `handleUpload`/`upload` pair needs `BLOB_READ_WRITE_TOKEN` and fails on OIDC stores.
    Media types are whitelisted in `lib/media.ts` (no SVG: it could run script on our origin).
  - On localhost the dialog shows the Wi-Fi IP URL so phones on the same network can open it.
- **Paid links** (Razorpay, `lib/server/razorpay.ts`, `lib/pay.ts`, `app/api/pay/*`): with `PAYMENTS` on (keys set), free links
  show a watermark (`<Watermark>` in LiveInvite: diagonal BRAND · PREVIEW pattern + stripe + badge, always on). Every link is created
  free; the couple pays ₹`LINK_PRICE_INR` in the owner sheet on their invite (since 2026-10-21; the studio's Preview/Premium plan cards
  are gone). Brand name for guests/buyers: `lib/brand.ts`. `POST /api/pay/order {name}` creates an order and records
  `shares/<name>/order-<id>.json`; Checkout → `POST /api/pay/verify` checks the HMAC signature, that the order record belongs
  to that name (so one payment can't unlock other links), and with Razorpay's API that the payment is captured (captures
  if only authorized); then `markPaid` writes `paid.json` (no-overwrite, idempotent) and `revalidatePath("/e/"+name)`.
  `POST /api/pay/webhook` (event `order.paid`, `RAZORPAY_WEBHOOK_SECRET`) is the backup. The guest page has an always-on
  `<GuestBar>` (WhatsApp share; on free links also "Remove · ₹") from the cover on (the couple gets `<OwnerBar>` instead). Payments on
  `/e/` pages send no Meta InitiateCheckout/Purchase (no Pixel there); a server-side Conversions API in verify would fix that. The page computes
  `watermark = PAYMENTS && !isPaid(name)`. **`isPaid` must ask the Blob API (`head`), never the public URL**: `/api/pay/order`
  checks it just before Checkout opens, so the CDN still holds that 404 when the post-payment re-render happens, and that page
  would keep the watermark forever (this was the "sometimes not removed after payment" bug). `/api/pay/order` on a paid link
  revalidates the page, so pressing "Remove watermark" again fixes a stuck one without charging. With auto-capture, Razorpay may
  capture between our GET and capture call; `confirmPayment` then re-reads the payment. The browser retries verify (idempotent)
  and the guest page drops the watermark locally on success instead of reloading. `shareFile()` refuses `.json`, so order/paid records are not served as media.
- **Policy pages** (for Meta ads and Razorpay review): `/privacy` (has `#delete`), `/terms`, `/refunds` (incl. delivery), `/contact`
  in `app/(legal)/`, business details in `lib/legal.ts` (empty values are left off the pages). Linked from the editor sidebar
  bottom, the phone ⋯ menu, and an `<AgreeNote>` line (`components/PayTrust.tsx`) under the studio's Get-link button, in the
  creating overlay and under the owner sheet's pay button ("By paying you agree…"). They describe
  what the app really does: **adding a tracker (Meta Pixel, Google Analytics, AdSense), processor or stored field means updating `/privacy`**.
- **Leads** (`lib/server/leads.ts`, flag `LEADS`): the owner sheet on the couple's invite asks for a WhatsApp number or an email,
  **optional** (since 2026-10-21 there; before that the Get-link step asked; `saveShareLead` keeps the other field when one is missing) (`lib/contact.ts`:
  10-digit Indian mobile or `+`country code; remembered in localStorage, pre-fill Razorpay Checkout), with the promise that we never
  sell or share them. `POST /api/share {…, phone?, email?}` saves them with the link name and the notice version
  (`CONTACT_NOTICE`) after the link exists; payments save Razorpay's contact/email as `pay_phone`/`pay_email`
  (verify + webhook). A failed lead write is logged and never fails the share or payment. Stored in MongoDB (`LEADS=mongo`:
  `MONGODB_URI`, Atlas cluster in Mumbai, database `invite_studio` or `MONGODB_DB`, collection `leads` with `_id` = link name)
  or `exports/leads.json` locally (`disk`); on Vercel without `MONGODB_URI` it is off and nothing is asked. (Neon/Postgres was
  used briefly and removed on 2026-10-13.) The connection string lives only in env vars, never in git. **Never put numbers or emails in Blob (public), the project JSON,
  Mixpanel, the Pixel or logs.** `/admin/leads` (HTTP Basic auth via `middleware.ts`: user `ADMIN_USER`, default `admin`, + `ADMIN_PASSWORD`; **fails closed**: 404 without it everywhere
  except `next dev`, and every admin response is `no-store`, noindex, no-referrer, see the comment in `middleware.ts`) lists leads with WhatsApp / Email buttons (wa.me or mailto + ready message, marks "Messaged"), "Replied STOP" (same number/email)
  and Delete. `/privacy` shows its lead paragraphs only while `LEADS` is on.
- Feature flags (`lib/features.ts`, set in `next.config.mjs` at build time): `VIDEO_EXPORT` (off on Vercel: the Export MP4 button is hidden, since the site promotes the free invitation page and never mentions
  video, and every export API returns 501), `SHARE_STORE`, `PAYMENTS`, `LINK_PRICE_INR` and `LEADS`. Deploy steps: README "Deploy to Vercel". `lib/server/paths.ts`
  holds `EXPORT_DIR` so share code does not import render.ts (that would pull Chrome/ffmpeg into its function bundle).
- **Analytics** (Mixpanel, `lib/analytics.ts`; tracking plan and rules in `AGENTS.md`): typed `track()`, started on site pages
  (`<SiteAnalytics>`, surface `site`, keeps an ad's `utm_*` tags), the editor and the guest page (never `/render`, `/admin`), production deploy only (`MIXPANEL=1` to test locally), US residency
  (`api-js.mixpanel.com`; api-in silently drops this project's events), anonymous (no identify), no names: guest pages strip the URL/title and use a hashed `invite_id`.
- **Meta Pixel** (ads, pixel `1116330824214375`; details in `AGENTS.md`): **OFF since 2026-11-14** (no Meta ads run; `META_PIXEL=1` turns it
  back on, and `/privacy` shows its Meta paragraphs only while it is on). When on, `<MetaPixel>` in the root layout sends PageView on
  site pages only (never `/e/`, `/render`, `/client-render`, `/admin`). `track()` maps
  template_selected → ViewContent, share_dialog_opened → AddToCart, payment_started → InitiateCheckout, payment_completed →
  Purchase (eventID `purchase-<invite_id>`), free invite_link_created → Lead. Automatic events off. Headless Chrome only
  sends events when `navigator.webdriver` is hidden, so check by hand or with that override.
- **Google Analytics + AdSense** (since 2026-11-13; details in `AGENTS.md`): GA4 `G-7S5DBM9NN2` is `<GoogleAnalytics>` in the root
  layout (`gaPageView` in `lib/analytics.ts`: gtag's own page views, same pages as the pixel, production only, `GA=1` to test).
  AdSense `ca-pub-3765220388345390` is `<AdSense />` (`components/AdSense.tsx`, a server-rendered `<script>`), mounted by the site
  pages only (`/`, `/templates`, `/templates/<id>`, the `(legal)` layout), production only (`ADSENSE=1` to test), plus
  `public/ads.txt`. **Neither may reach `/e/`, `/render`, `/client-render` or `/admin`: don't move them to the root layout or
  link into `/e/` with `next/link`.**

## Templates (26), in `lib/templates/`, registered in `index.ts`

| id | Category | Community | Notes |
|---|---|---|---|
| royal-mandala | wedding | hindu | Devanagari header, mandala, filigree |
| shaadi-utsav | multi-event, wedding | hindu | `events` field → one scene per function + overview; icon picked from the event name |
| south-kalyanam | wedding | south-indian | language select (Tamil/Telugu/Malayalam/Kannada), Chi./Sow., Muhurtham range, compliments |
| tamil-thirumanam, telugu-pelli, kerala-vivaham, kannada-maduve, hindi-shubh-vivah (hindu), punjabi-viah (sikh, hindu) | wedding | south-indian | 2026-11-14. Written IN Tamil / Telugu / Malayalam / Kannada / Hindi / Punjabi (title, honorifics, muhurtham, venue, invitation line: all editable fields). One shared builder `native-wedding.tsx` (`makeNativeWedding`); each file supplies font, words, palettes and ornaments (`backdrop`, `centerpiece`, `emblem`, drawn smaller via `k`). The native wording was not reviewed by a native speaker. A further language = one small file |
| nikah-mubarak | wedding, reception | muslim | Bismillah + wedding dua in Amiri (RTL), mehrab arch photo, optional Walima |
| anand-karaj | wedding | sikh | ੴ + sunburst, Gurmukhi, phulkari band, Milni/Laavan/Langar schedule, Fateh close |
| sagai-rings | engagement | all | interlocking rings |
| haldi-marigold | haldi | hindu | marigold garlands; keep text below `top` padding so it clears the garlands |
| mehendi-paisley | mehendi | hindu, muslim | self-drawing paisleys, henna ring |
| sangeet-night | sangeet | hindu, sikh | beams, neon glow, line-up, confetti |
| reception-gala | reception | all | fairy lights, deco fans, programme |
| holy-matrimony | wedding | christian | church wedding: bells on a bow, rose window, lancet-arch photo (`clip-path: path()`), 1 Cor 13 verse (toggle), ceremony + reception; no cross drawn |
| shubh-mangal | wedding | hindu (Marathi) | Paithani zari border, `MorPankh` peacock feathers, kalash; चि. / चि. सौ. कां. toggle, शुभ मुहूर्त, स्वागत समारंभ, आपली उपस्थिती प्रार्थनीय, आग्रहाचे निमंत्रण |
| shubho-bibaho | wedding | hindu (Bengali) | `--f-bengali` (Tiro Bangla); lal-paar border, prajapati butterfly, alpana, shankha-pola ring; শ্রীমান / কল্যাণীয়া, বৌভাত (`receptionLabel`), উপস্থিতি একান্ত কাম্য, বিনীত |
| blush-botanical, cinematic-reel (video clip + montage), polaroid-memories (gallery), aurora-modern | save-the-date etc. | modern | the original 4 |
| rajwada-palace | wedding | hindu | 2026-11-17, ₹149. Palace skyline drawn on (`Palace`), every scene in a jharokha arch (`Jharokha`, photo clipped with `clip-path: path()`), lanterns |
| floral-rangoli | wedding, engagement, haldi, mehendi, reception | hindu, south-indian | 2026-11-17, ₹49. Petal rangoli drawn ring by ring (`Rangoli`); `title` names the function and `inviteDetails` uses it as the guest card's function name |
| lavender-garden | save-the-date, wedding, engagement | modern | 2026-11-17, ₹29. Climbing flowering vines (`Vine`), typewriter love note, oval photo |

### Adding a template
1. Create `lib/templates/<id>.tsx` exporting a `TemplateDef`: `categories`, `communities`, `isNew`, `poster` (scene id
   for the gallery thumbnail), `fonts`, 4 `palettes` (ink, soft, accent, bg, bg2, line), `groups` (fields), `defaults`,
   optional `backdrop`, and `build(data, orientation, theme) → Scene[]`.
2. Inside `build`, use `const S = function <T>(v: T, h: T): T { return vertical ? v : h; }` for every orientation-specific
   size/layout. **16:9 needs larger type than 9:16** (it is 1920 wide); stack in 9:16, put side by side in 16:9.
   **Phones show 9:16 at about 0.36x**: no information smaller than ~36 design px there (labels: `Kicker` enforces 34,
   `KICKER_MIN` in blocks.tsx; addresses, parents, RSVP lines 40+). Use the shared field names (weddingDate, weddingTime,
   venueName, venueAddress, receptionDate/Time/Venue, rsvp...) so the guest card's calendar/directions/RSVP work, and add the
   main function's name to `MAIN` in `lib/inviteDetails.ts` if it isn't "Wedding". Name scenes so `lib/fieldScene.ts` finds them
   ("date", "venue", "reception", "close" in the id or label).
3. Register it in `lib/templates/index.ts`, then run `npm run snapshot -- <dir> --only=<id>` and **look at both sheets**
   (and a dark palette with `--palette=<id>`: white or red details can vanish on a matching background).
4. Fonts are CSS variables from `app/fonts.css`: --f-cinzel, --f-cormorant, --f-vibes (script), --f-playfair, --f-marcellus,
   --f-inter, --f-devanagari, --f-caveat, --f-bodoni, --f-arabic (Amiri), --f-gurmukhi, --f-tamil, --f-telugu, --f-malayalam,
   --f-kannada, --f-bengali (Tiro Bangla), --f-rozha (bold Hindi display), --f-kalam (handwritten Hindi), --f-yatra.
   They are self-hosted in `public/fonts/` (unicode-range subsets, as Google serves them). To add or change one, edit the
   list in `scripts/fetch-fonts.mjs` and run `node scripts/fetch-fonts.mjs`; commit the generated files. **Don't go back to
   `next/font/google`**: it downloads during the build, and Google sometimes answers Vercel's build machines with font URLs
   it cannot parse (`TypeError: Cannot read properties of null (reading '1')` in nextFontGoogleFontLoader → build fails).

## Gotchas already solved (don't reintroduce)
- **Template `defaults` never hold a phone number** (2026-11-14): a mobile in any text field becomes a live "RSVP on WhatsApp" button
  for guests (`lib/inviteDetails.ts`), and nine templates used to ship made-up numbers that belong to strangers. Keep numbers in
  `placeholder` only. Old drafts still hold them: `SAMPLE_PHONES` is ignored and `withoutSamplePhones()` clears them at Get link.
- **Untouched sample date / venue**: Get link stores `project.sample` (`sampleKeys()`), and `inviteDetails(id, data, sample)` skips those
  fields, so guests get no calendar or directions button for a made-up wedding. Pass `project.sample` at every call.
- **Empty photo / clip slots** carry class `ph`; `.guest-ui .ph` (globals.css) hides the "ADD A PHOTO" hint on a guest's invite.
- **Link records** (2026-11-16, `lib/server/links.ts`): MongoDB collection `links`, one document for EVERY link (`_id` = link name,
  like `leads`, which keeps only contact details). Written by `POST /api/share` (`recordLinkCreated` / `recordLinkUpdated`),
  `/api/pay/order` (`recordCheckout`: an order with no payment after it = "Tried to pay"), verify + webhook (`recordPayment`,
  idempotent by payment id) and the guest page's counter `POST /api/share/<name>/seen` (`opens`, `watched`; counts only, never
  the couple's own views). Same store as leads (`LEADS` mode: mongo / `exports/links.json` on disk / off); the shared connection
  is `lib/server/db.ts`. **Every write is best effort**: callers `.catch` and log, a record never fails a link or a payment.
  Fields are only `$set` / `$inc` / `$push` / `$min`, never pre-filled with null or 0 (operators would conflict); `normalize()`
  supplies defaults. `/admin/links` lists them (search also takes a Mixpanel `invite_id`; "Import existing links" reads older
  links back from storage in batches, `importLinks`). `/admin` marks the browser internal (`components/AdminNav.tsx`):
  its events carry `is_internal` and its links are flagged as tests.
- **`payment_confirmed` is sent by the server**, once per payment (`markPaid()` returns true for whoever records it first →
  `lib/server/afterPayment.ts` → `lib/server/mixpanel.ts`). The browser's `payment_completed` stays but can be lost with the tab.
  Route files may only export handlers and config, which is why `afterPayment` is not in `verify/route.ts`.
- **Mixpanel stays name-free** (owner, 2026-11-16): the link's address is in the `links` record, matched by `invite_id`
  (`lib/inviteId.ts`, shared by browser and server). `source` / `first_source` on every event come from `trafficSource()`.
- **Designs by state** (2026-11-16, `lib/regions.ts`): 8 regions (North India/Hindi, Punjab, Maharashtra, West Bengal, Tamil Nadu,
  Andhra & Telangana, Karnataka, Kerala), each with its designs in its language. `/templates?state=<id>` is a page of its own (title,
  canonical, sitemap); the picker (`components/site/StatePicker.tsx`, "Wedding in which state?") is under the heading. A **picked** state
  (tap, or `?state=` in a link, e.g. an ad per state; remembered in `fp.state`) lists its designs first and hides designs written in
  another state's language (`LOCAL`). A **guessed** one (phone language, else cookie `fp_geo`) only reorders, never hides: Indian
  mobile IPs often resolve to a hub city. `middleware.ts` sets `fp_geo` from Vercel's `x-vercel-ip-country-region` on `/` and
  `/templates…`, and its matcher runs only while the cookie is missing (`-` = no Indian state); everything else it matches is still
  the admin gate. The home hero leads with the state's first design; the picks row is keyed by position (a scroll-snap row re-snaps when
  buttons move). Language names use the phone's own fonts (no `--f-*` family: no download). `/privacy` section 2 describes it.
  No region yet for Gujarat, Odisha, Assam or the North East: they need a design in their language first.
- **Reviews: real ones only** (2026-11-17, owner asked for reviews in the hero; `lib/server/reviews.ts`). **Never write, seed or
  "sample" a review** (invented reviews are an unfair trade practice under India's consumer protection rules, and the copy rule above).
  Sources: the couple rates their own invite in the owner sheet once it has no watermark (`OwnerReview` in LiveInvite.tsx →
  `POST /api/review`, owner key required, consent box never pre-ticked, asked once per link per device via `fp.reviewed`), or the owner
  adds feedback a customer sent with their permission (`/admin/reviews`, words only, no stars, not in the average). Collection
  `reviews` (LEADS store; `exports/reviews.json` locally). The site shows words only if `consent` AND approved on `/admin/reviews`
  (`/api/admin/reviews`, revalidates `/`). The average counts every allowed invite rating, hidden ones too (hiding removes words, not
  stars); it shows from 5 (`SHOW_AVERAGE_FROM`): a line under the hero headline. Quotes: `components/site/HeroReviews.tsx` under
  the hero button, rotating; nothing renders without an approved review. The home page is ISR (`revalidate = 3600`) and reads
  them with a 4 s cap so a slow database never blocks it. Public data carries no link name. `/privacy` section 1 describes it.
- **Ritual versions** (2026-11-16, owner: "at least 5 per state, according to the state's rituals"): Haldi, Mehendi, Sangeet,
  Reception and Engagement each have a version in all 8 state languages (40), named for the state's own ritual where it has one
  (Gaye Holud, Bou Bhat, Ashirbad; Maiyan, Jaago, Mangni; Halad, Sakharpuda, Swagat; Nalangu, Nichayathartham, Varaverppu; Pasupu,
  Gorintaku, Nischitartham, Vindu; Arishina Shastra, Madarangi, Aratakshate; Mylanchi, Vivaha Nischayam, Salkkaram). Ids
  `<design>-<language>` (`lib/variants.ts`: `baseOf`, `languageOf`, `versionsOf`; dependency-free). Words, sample couples and places:
  `lib/templates/languages.tsx`, one block per language, **not reviewed by native speakers yet**; built by `localize()`
  (`lib/templates/localize.tsx`): same scenes and palettes, field defaults in the language, the script font appended AFTER the design's
  fonts (Indic fonts also hold Latin), `variantOf` + `lang`. `theme.lang` (versions only) makes `Kicker` / `Headline` give Indic text
  room for vowel signs, no tracking or slant, and `fitSize()` (blocks.tsx) shrinks a title's widest word to a pixel budget; the
  originals render exactly as before. Registry: `DESIGNS` (the 23, for every list and count) and `TEMPLATES` (+ versions, for
  lookups, sitemap and static pages). Versions show only on their state's page (`forRegion`: own designs + versions first, the
  originals of shown versions hidden), in search, on `/templates/<id>` ("Language" links) and in the studio's Language row
  (`components/LanguagePicker.tsx`; `template_selected` source `language`). Price = the design's (`priceOf` falls back to `baseOf`);
  `inviteDetails` and `MAIN` use `baseOf`. A new version language = a block in `languages.tsx` + `LANGUAGES` + a region.
  `scripts/snapshot.mjs --only=` takes lists and `*` patterns (`--only=*-tamil`).
- **Wedding pack** (owner, 2026-11-17: ₹199 for all of a couple's functions; `PACK_PRICE_INR`, `PACK_COVERS` = 149 in `lib/pricing.ts`).
  Offered under "Remove watermark" in the owner sheet when the design is one it covers (`packCovers`). `POST /api/pay/order {pack: true}`
  charges the pack price and records `pack: true` on the order (Razorpay `notes.kind`); verify and webhook then `markPack()` →
  `shares/<name>/pack.json` (markPaid gets price MAX so no false REFUND NEEDED). The browser remembers which link holds the couple's pack
  (`fp.packs` by `coupleBase`, `lib/pack.ts`) and clears the couple's other links via `POST /api/pay/pack {from, fromKey, to[]}`: both
  owner keys required and the same `coupleBase` (link name minus number and function suffix, `lib/slug.ts`), so it never works for
  another couple or device. `coverByPack()` writes paid.json with `covers` 149 and `pack`; no money, `recordPayment(via "pack", ₹0)`.
  Cleared: at purchase (all owned links of the couple), at Get link for a new one, and on the owner's visit to a still-marked link.
  Terms section 6, Refunds, FAQ and the home pricing card describe it; change them together.
- **Guest page extras** (2026-11-17, owner: "more interactive and engaging"; `app/e/[slug]/Interactive.tsx`), each on unless the couple
  switches it off in the studio's "Guest experience" group (`Project.guest`, `guestOn()` in lib/types.ts): a sealed **envelope** on the
  cover (redesigned 2026-11-18: it floats with a sheen and a ripple round the seal; on tap the seal cracks, the flap swings open, the card
  rises, then the cover fades (`.cover-leaving`) once the invite is ready too; `OPEN_MS` 1.7 s. Keep `.env-float` free of `preserve-3d`, or the
  opened flap covers the card), **scratch to reveal the date** (gold foil canvas over the frame once per visit,
  a moment into the scene `sceneForField("weddingDate")` finds; the clock and music wait via `running`; dissolves by itself after 6 s
  untouched; skipped when the date is still the sample), and **Send blessings** at the end (petal shower, one per device via
  `fp.blessed`, counted on the link record: `POST/GET /api/share/<name>/seen` kind `blessing`, `blessingCount`; shown from 3). Plus a
  **personal greeting**: `/e/<name>?to=Sharma%20ji` puts "Dear Sharma ji" on the cover, read in the browser only (`useGreeting`), never
  stored or tracked; the owner sheet's `PersonalLink` builds these links. All of it is guest-page only, never inside a scene, so the
  pure-function-of-time rule and the MP4 export are untouched. Events: `date_scratched`, `invite_personalised`, `guest_action_clicked`
  action `blessing`.
- **RSVP options** (2026-11-17, owner chose "A + B": replies through WhatsApp only, plus counts). `Project.rsvp` (studio "RSVP" group,
  `components/editor/GuestPanels.tsx`): mode `whatsapp` (default, the old button) / `form` / `off`, up to 2 contacts (empty = the numbers
  written on the invite, `inviteDetails().contacts`), reply-by date, form questions (people, functions, food, message), Call button.
  `lib/rsvp.ts` (`rsvpSetup`, `rsvpMessage`) is dependency-free; the guest side is `app/e/[slug]/Rsvp.tsx` (`RsvpButtons` on the end card,
  `RsvpSheet` form, `RsvpSummary` in the owner sheet). **The reply goes only to the family's WhatsApp; we store no guest names or answers.**
  Form replies add counts to the link record (`rsvp_yes/maybe/no/people`, `POST /api/share/<name>/rsvp`, once per device via `fp.rsvp`, a
  changed answer moves the count); the counts are read with the owner key only (`GET` + header `x-owner-key`). Contacts' numbers sit in the
  project JSON on purpose: guests are meant to see them, like the RSVP line on the invite.
- **Interactive scenes** (2026-11-17, owner: "more interactive sections in templates"), all generic, so every design and language version
  gets them, and none is inside a scene's drawing except the quiz: **buttons on the scenes** (`SceneActions`: Add to calendar + a live
  countdown on the date scene, Directions on the venue, RSVP on the closing scene; one per function on Shaadi Utsav's `event-N` scenes;
  `guest.actions`), the **tap moment** (`TapMoment`, `guest.moment`: the story holds on the names scene and guests tap to shower flowers /
  haldi / henna / confetti / sparklers / rings, by function via `momentKind`; ONE tap is enough: the story goes on 1.4 s after the first
  tap and later taps never extend it (they used to restart a 2.5 s wait, so guests tapped many times to get past); 3.5 s without a tap), and the **couple quiz** (`Project.quiz`,
  `lib/quiz.tsx`): `buildTimeline` inserts a `quiz` scene before the closing scene, a pure function of time like any scene (question,
  A/B/C, the right answer lights up at `QUIZ_REVEAL`), so the MP4 shows it too; on the guest page the story holds at `QUIZ_ASK`,
  `QuizAsk` takes the answer, then seeks to the reveal. Counts `quiz_right/quiz_total` on the link record (`/api/share/<name>/quiz`, shown
  as "62% got it right" from 3 answers). Everything that holds the story goes through `held` in LiveInvite (clock + music wait).
  `guest`, `rsvp` and `quiz` follow the couple across a design switch (`defaultProject`).
- **₹9 entry designs** (2026-11-17, owner: "for the free template do the 9rs"): Blush Botanical, Aurora Modern and Sagai Rings (and
  Sagai's language versions) cost ₹9, `PRICE_FLOOR` 9, no design is free any more (`FREE_COUNT` 0, its copy hides itself). Links made
  while they were free stay free: `priceForLink(templateId, createdAt)` in `lib/pricing.ts` (`FREE_UNTIL` = 17 Nov 16:35 IST, the ₹9 release; it was first midnight, which left that evening's links free although the
  studio showed ₹9). Price a
  real link with `priceForLink` (invite page, `/api/pay/order`), never `priceOf`.
- **Search pages** (2026-11-17): `/invitations/<function>` and `/wedding-invitations/<state>` (static, `lib/landing.ts`: text + FAQ,
  `components/site/LandingAbout.tsx`, the design browser with `landing` so the page's state wins and the URL stays clean), wording
  guides `/wording` + `/wording/<language>` (`lib/wording.ts`, **not reviewed by native speakers**), `/llms.txt` for AI assistants,
  JSON-LD (`components/JsonLd.tsx`: Organization + WebSite + FAQPage on home, FAQPage + BreadcrumbList on landing pages, Product +
  BreadcrumbList on design pages; `faqJsonLd()` needs `text` on a FAQ whose answer is JSX). `/templates?category=` / `?state=` still
  work but their canonical is the new page; all site links go to the new pages (`functionPath`, `statePath`). New site pages go in
  `app/sitemap.ts` and, if they should read the visitor's state, BOTH `SITE_PAGE` and the matcher in `middleware.ts` (a path in the
  matcher but not in `SITE_PAGE` would ask for the admin password).
- **Reviews from every couple** (2026-11-17): the owner sheet's rating box shows for unpaid invites too (it was clean invites only),
  and the `/admin/leads` follow-ups ask for a rating. The hero shows "N invitations made here in the last 30 days" from the link records
  (`recentLinkCount`, test links left out) once N ≥ 20; never a made-up number.
- **Per-design prices** (2026-11-14, owner: some designs free, paid ones ₹29-600; the floor went from ₹30 to ₹29 on 2026-11-16 when
  Haldi, Mehendi and Polaroid dropped from ₹49 to ₹29): `lib/pricing.ts` is the one table (`priceOf(id)`,
  0 = free; unlisted = `LINK_PRICE_INR`). Dependency-free, so the server reads it without the templates. The amount charged is
  always the server's: `/api/pay/order` reads the link's `templateId` and charges `amountDue()` (price minus `Paid.covers`).
  `paid.json` now holds `covers` (rupees) and `payments`; one WITHOUT `covers` predates this and counts as paid in full. Moving a
  paid link to a dearer design brings the watermark back for the difference only. Free designs: no watermark, no pay UI, and
  their guests see "Make your own invitation". The invite page gets `price` (rupees due) and `free` as props. Never print
  `LINK_PRICE_INR` in UI: use `priceOf`, `PRICE_MIN`, `PRICE_RANGE`, `FREE_COUNT`. A new template needs a line in `pricing.ts`.
- **`Stage` measures before paint** (`components/Frame.tsx`, layout effect, hidden until measured). It used to draw at scale 0.3
  and jump a frame later: the flicker on every player mount.
- **Template pages carry real text**: `lib/templateCopy.ts` (who it is for, what is on it, search phrases) is rendered on the
  server on `/templates/<id>` with schema.org Product JSON-LD (name, price). A new template needs an entry; keep claims true.
- **One link per couple per function** (2026-11-17): Get link names a link with its function (`1-aarav-ananya-haldi`; the wedding,
  any wedding design or Shaadi Utsav, has none: `functionOf` in ShareDialog.tsx) and republishes only to this browser's link for the
  same names AND function (`ownedFor()` in `lib/owner.ts`, which also keeps `fn` per link). Before, the match was on names alone, so a
  couple's Haldi replaced their (paid) wedding invite and a second purchase was impossible. Links from before keep matching plain
  names for the wedding only; any other function gets a new link rather than risk an overwrite. Once an invite is clean, the owner
  sheet offers the other functions (`OwnerNext`, `lib/nextInvites.ts`: same language and state rituals; opens `/create?template=`
  with the names carried from the device's draft; event `next_invite_clicked`). This is the main organic revenue lever (owner,
  2026-11-17: sell organically, no ads).
- **A link can be edited by its owner** (2026-11-14, owner's decision): Get link in the studio republishes to the link this browser
  made for the same couple and function (`ownedFor()` in `lib/owner.ts`, see above; `POST /api/share {update, key}` →
  `updateLiveShare`, which overwrites project.json / share.json, sets `updatedAt` (versions the preview card) and keeps `paid.json`).
  Wrong or missing key = 403 and the studio falls back to a new link. Event `invite_link_updated`, not `invite_link_created`.
  Terms section 5 describes this. One paid link could be reused for a different invite by the same browser: accepted for now.
- The couple's owner sheet also opens on the cover when they come back to a link that still has the watermark (`LiveInvite.tsx`);
  straight after Get link they still watch first and get it at the end.
- Upload size caps follow the extension (`maxBytesFor` in `lib/media.ts`: images 12 MB, audio 60 MB, video 100 MB), and a signed
  upload only accepts the content types of that extension.
- Policy pages name the proprietor: `LEGAL.entity` and `grievanceName` = Deepanshu Sharma (owner's word, 2026-11-14).
- **Storage errors are not "not found"** (`lib/server/share.ts`, `missing()`): `readJSON` / `exists` return null / false only for a missing
  file and throw otherwise. A swallowed error once meant a cached 404 for a real invite, or "payment is for a different link" after paying.
  Payment routes keep storage calls inside their try so the answer is 502 (browser and Razorpay retry), never a final 4xx.
- A second, different payment for an already paid link is kept as `shares/<name>/extra-payment-<id>.json` and logged "REFUND NEEDED".
- Get link reuses media this browser already uploaded (`fp.uploads` in localStorage, by SHA-256), so polishing an invite over several
  links does not re-upload every photo. Uploads are still never deleted and the endpoint is still open (no rate limit yet: needs a store such as Vercel KV).
- **Vercel Web Analytics** goes through `components/VercelAnalytics.tsx` (`beforeSend` drops `/e/`, `/render`, `/client-render`, `/admin`).
  Never mount `<Analytics />` bare: it would send invite addresses with the couple's names.
- `app/robots.ts` must not disallow `/e/`: a blocked crawler never sees the page's noindex tag. Site pages get their canonical and
  preview tags from `pageMeta()` (`lib/seo.ts`); new site pages go into `app/sitemap.ts`.
- The home hero's button carries `?template=` only after the visitor chose a design or typed (`chosen` in `Landing.tsx`); otherwise it
  would switch a returning visitor's saved draft to whatever design was auto-playing.
- Embedded browsers (e.g. the Claude desktop browser pane) **silently block downloads**, which is why exports are auto-copied to `exports/`.
- Dev hot-reload during a render could hang the queue. Hence the timeouts, the watchdog, and `__seek` rejecting when the render page unmounts.
- Indic/Arabic fonts load lazily (unicode-range); the render page calls `document.fonts.forEach(f => f.load())` before frame 0.
- `E.outBack(0)` must return exactly 0 (a tiny negative SVG radius throws errors).
- Mehrab clips with CSS `clip-path: path()`, not `foreignObject`.
- Gallery grid needs `grid-auto-rows: max-content`, or the cards get squashed.
- Never run two `next dev` servers on the same `.next` folder (e.g. a second one on another port): they corrupt each other's
  manifests (`Unexpected end of JSON input`, then `reading 'run'` 500s) and `EPERM .next\trace`. Stopping a backgrounded
  `npx next dev` wrapper can leave the server alive; check `node.exe` processes. Fix: kill both, start one.
- **Product polish, 2026-11-18** (owner asked for a full review, then "do all"):
  - **Invites fill the phone**: the guest page draws a portrait invite on a canvas of the screen's own shape (`useFullHeight` in
    LiveInvite.tsx → `<Frame height>`, 1920-2400 tall); scenes are centred (`Layer`) and backdrops draw to `H`, so the extra height
    is background. Studio, MP4 and landscape stay 1080x1920. Don't position scene content from a hard-coded 1920.
  - **Empty photo frames** show the couple's monogram on a guest's invite (`Monogram` in primitives.tsx, initials from `MonogramContext`
    that `<Frame>` provides via `monogramOf(data)`); the studio keeps its "Add a photo" hint.
  - **Get link checks example details**: if a date / venue / address field still holds the design's sample (`sampleKeys`), `SampleCheck`
    (components/editor/SampleCheck.tsx) asks first: "Change them" opens that field, or "Get link anyway". Event `sample_warning`.
  - **Branded 404** (`app/not-found.tsx`, `NotFoundBody`): a wrong invite link gets advice for the guest.
  - **Design cards show posters**: `public/posters/<id>.webp` (360x640, the names scene, first palette, sample photo), made by
    `node scripts/posters.mjs` (dev server running); `LazyPreview` mounts the live preview only once a card is played. **Re-run the
    script after changing a design's look, first palette, sample text, a new template, or lib/demo.ts.** A missing poster falls back to
    the live preview.
  - **Sample photo** (lib/demo.ts): an illustrated couple (safa + sherwani, lehenga + dupatta) on a golden-hour sky with marigolds.
  - **Distinct first palettes**: designs open in different colours (emerald Royal Mandala, kesar Shubh Vivah, peacock Shaadi Utsav,
    kasavu Kalyanam, manjal Thirumanam, pattu Pelli, navilu Maduve, sarson Punjabi Viah, sage Holy Matrimony) so the gallery isn't all maroon.
  - Desktop hero phone is sticky at the top of its column; phone pricing cards swipe; the tap prompt is centred with margins (its
    pop-in animation overrides `transform`).
- **No blue flash on taps** (2026-11-18): `html { -webkit-tap-highlight-color: transparent }` and `.guest-ui` blocks long-press selection and
  the iOS callout (hold = pause selected text and painted the invite blue); inputs stay selectable. Keep both in globals.css.
- Seeded `rnd()` only. Particles, confetti and sparkles must be deterministic.
- Sanity-check religious/cultural text: Bismillah and the dua (Abu Dawud 2130) are in `nikah-mubarak.tsx`, ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ in `anand-karaj.tsx`.
  No hand-drawn Khanda or Ganesha (too easy to get wrong); text glyphs like ੴ are used instead.

## Status & next ideas
Done: 26 templates, categories + gallery, events field, both orientations, music, pacing, autosave, MP4 export (720p/1080p/4K, 24/30/60fps),
exports folder, CLI render, snapshot QA script, production build passes. Hosted on Vercel with live share links (`/e/<name>`),
Razorpay paid links (watermark removal), Mixpanel analytics, share success screen (iPhone mockups of the guest journey,
WhatsApp chat preview, Preview link / After payment toggle).

Policy pages for Meta ads + Razorpay review (`app/(legal)/`, `lib/legal.ts`) carry the owner's real details since 12 Oct 2026:
sole proprietor Deepanshu Sharma, Gurugram; **not GST-registered** (Terms say no GST is added; don't write "inclusive of taxes");
refunds only when a paid link was not delivered (link not created, watermark not removed, duplicate charge). Change those
details only on the owner's word. Still to do: give the live URLs to Razorpay (website details) and Meta (privacy policy URL).

Ideas (from README roadmap): Bengali / Marathi / Gujarati / Kerala-Christian / Parsi templates; optional functions list on every template;
personalised per-guest videos from a CSV; RSVP page + QR on the end card; WhatsApp preset (<16 MB, 1:1 square); face-aware photo crop;
scene reorder/hide; custom accent colour; undo/redo; AI-written lines via the Claude API; queue worker + S3 for scale; Remotion as an alternative engine.
