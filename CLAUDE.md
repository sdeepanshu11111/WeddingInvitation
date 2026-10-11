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
- **Public site**, an editorial look modelled on wishnwed.com: cream paper (`--bg #f5f0e6`), ink (`--text #1f1a14`), terracotta
  (`--accent #b7472a`), Fraunces `--display` headlines with the accent word in `<em>` (italic, terracotta), Inter Tight `--ui`, JetBrains Mono
  `--mono` for `.mono-label` kickers ("§02 — How it works"), square CTAs (`.cta-btn`, `.ghost-btn`).
  `/` is the landing page (`app/page.tsx`: hero `HeroReel` playing real templates, how it works, showcase, guests, pricing, FAQ, footer);
  `/templates` is the browser (`?category=`, Refine sidebar, chips on phones); `/templates/<id>` has a big player, palettes, and
  "Customize →" = `/create?template=&palette=&o=`. Shared parts: `components/site/` (SiteHeader, SiteFooter, TemplateCard, Faq with
  `faqItems()` that follows the feature flags, Landing) and `components/LivePreview.tsx` (demo timeline, loop clock, `LazyPreview` mounts
  only near the viewport). Styles: `app/site.css`; the studio restyle is `app/studio.css`, loaded after `globals.css`. The guest page wraps
  itself in `.guest-ui`, which restores the old dark/gold tokens, because it frames the couple's invitation, not our brand. Public pages
  don't track analytics yet. Copy is our own: no invented reviews, ratings or claims, and answers stay true to `PAYMENTS` / `VIDEO_EXPORT`.
- `app/create/page.tsx`: the editor (sidebar categories, canvas, transport, form). It reads `?template&palette&o` once, then strips them
  from the URL. **Phones (≤ 860px)**: an app layout, not a stack:
  preview on top, one panel below chosen by bottom tabs (`.app[data-tab]` = design → `.left`, details → `.right`, preview =
  full-height canvas) plus Share; sticky "Next" steps guide Design → Details → Share; the ⋯ menu holds Browse/Open/Export.
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
  - Names default to couple names + a base-36 seconds timestamp (`autoName` in ShareDialog, e.g. aarav-ananya-t3k2x9) so nobody
    has to pick again; "Edit" lets them type one, and an auto name that collides retries with the server suggestion.
    Payment logos (`components/PayIcons.tsx`) are Simple Icons 16.32.0 paths (CC0); UPI is a text badge.
  - Names (`lib/slug.ts`: 3–50 of a-z 0-9 single hyphens) are claimed by writing `project.json` with no-overwrite (Blob
    default, `wx` on disk). The dialog checks `GET /api/share/check?name=&year=`; taken → 409 + suggestion (name-year, -2..-9).
  - **Names are guessable, so a 404 may be cached before a name exists.** `POST /api/share` calls `revalidatePath("/e/"+name)`
    (works for pages). The preview card is `/e/[slug]/card?v=<createdAt>` (next/og route), linked from the page metadata:
    Next 14 does NOT invalidate cached route responses on revalidatePath (file-system-cache only checks `kind === "PAGE"`),
    so the card must live at a URL that only exists after creation. Blob reads use the SDK's `get(..., { useCache: false })`
    (bypasses the Blob CDN, and its undici fetch is outside Next's caching) for the same reason.
  - **Live** (topbar "Share", `components/editor/ShareDialog.tsx`): `POST /api/share {project,title,card,name}` stores a snapshot.
    `card` (palette colours + date) is computed in the editor so server code never imports the templates.
    `app/e/[slug]/LiveInvite.tsx` plays it with `<Frame>` + rAF clock: tap-to-open cover (audio unlock on iOS), 9:16 on
    portrait screens and 16:9 on landscape, pause/mute/replay. Its `<Warmup>` lays out every scene hidden once, so only the
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
  show a watermark (`<Watermark>` in LiveInvite: diagonal BRAND · PREVIEW pattern + stripe + badge, always on) and the Share dialog
  offers Preview (free) / Premium (₹`LINK_PRICE_INR`) plan cards. Brand name for guests/buyers: `lib/brand.ts`. `POST /api/pay/order {name}` creates an order and records
  `shares/<name>/order-<id>.json`; Checkout → `POST /api/pay/verify` checks the HMAC signature, that the order record belongs
  to that name (so one payment can't unlock other links), and with Razorpay's API that the payment is captured (captures
  if only authorized); then `markPaid` writes `paid.json` (no-overwrite, idempotent) and `revalidatePath("/e/"+name)`.
  `POST /api/pay/webhook` (event `order.paid`, `RAZORPAY_WEBHOOK_SECRET`) is the backup. The guest page has an always-on
  `<GuestBar>` (WhatsApp share; on free links also "Remove · ₹") from the cover on; the success screen shows the real
  WhatsApp card (`card` URL returned by POST /api/share). The page computes
  `watermark = PAYMENTS && !getPaid(name)`. `shareFile()` refuses `.json`, so order/paid records are not served as media.
- **Policy pages** (for Meta ads and Razorpay review): `/privacy` (has `#delete`), `/terms`, `/refunds` (incl. delivery), `/contact`
  in `app/(legal)/`, business details in `lib/legal.ts` (empty values are left off the pages). Linked from the editor sidebar
  bottom, the phone ⋯ menu, and an "By paying you agree…" line under every create/pay button in ShareDialog. They describe
  what the app really does: **adding a tracker (Meta Pixel), processor or stored field means updating `/privacy`**.
- Feature flags (`lib/features.ts`, set in `next.config.mjs` at build time): `VIDEO_EXPORT` (off on Vercel: Export MP4 shows
  "Soon" and every export API returns 501), `SHARE_STORE`, `PAYMENTS` and `LINK_PRICE_INR`. Deploy steps: README "Deploy to Vercel". `lib/server/paths.ts`
  holds `EXPORT_DIR` so share code does not import render.ts (that would pull Chrome/ffmpeg into its function bundle).
- **Analytics** (Mixpanel, `lib/analytics.ts`; tracking plan and rules in `AGENTS.md`): typed `track()`, started only by the
  editor and the guest page (never `/render`), production deploy only (`MIXPANEL=1` to test locally), US residency
  (`api-js.mixpanel.com`; api-in silently drops this project's events), anonymous (no identify), no names: guest pages strip the URL/title and use a hashed `invite_id`.
- **Meta Pixel** (ads, pixel `1116330824214375`; details in `AGENTS.md`): `<MetaPixel>` in the root layout sends PageView on
  site pages only (never `/e/`, `/render`, `/client-render`), production only (`META_PIXEL=1` to test). `track()` maps
  template_selected → ViewContent, share_dialog_opened → AddToCart, payment_started → InitiateCheckout, payment_completed →
  Purchase (eventID `purchase-<invite_id>`), free invite_link_created → Lead. Automatic events off. Headless Chrome only
  sends events when `navigator.webdriver` is hidden, so check by hand or with that override.

## Templates (14), in `lib/templates/`, registered in `index.ts`

| id | Category | Community | Notes |
|---|---|---|---|
| royal-mandala | wedding | hindu | Devanagari header, mandala, filigree |
| shaadi-utsav | multi-event, wedding | hindu | `events` field → one scene per function + overview; icon picked from the event name |
| south-kalyanam | wedding | south-indian | language select (Tamil/Telugu/Malayalam/Kannada), Chi./Sow., Muhurtham range, compliments |
| nikah-mubarak | wedding, reception | muslim | Bismillah + wedding dua in Amiri (RTL), mehrab arch photo, optional Walima |
| anand-karaj | wedding | sikh | ੴ + sunburst, Gurmukhi, phulkari band, Milni/Laavan/Langar schedule, Fateh close |
| sagai-rings | engagement | all | interlocking rings |
| haldi-marigold | haldi | hindu | marigold garlands; keep text below `top` padding so it clears the garlands |
| mehendi-paisley | mehendi | hindu, muslim | self-drawing paisleys, henna ring |
| sangeet-night | sangeet | hindu, sikh | beams, neon glow, line-up, confetti |
| reception-gala | reception | all | fairy lights, deco fans, programme |
| blush-botanical, cinematic-reel (video clip + montage), polaroid-memories (gallery), aurora-modern | save-the-date etc. | modern | the original 4 |

### Adding a template
1. Create `lib/templates/<id>.tsx` exporting a `TemplateDef`: `categories`, `communities`, `isNew`, `poster` (scene id
   for the gallery thumbnail), `fonts`, 4 `palettes` (ink, soft, accent, bg, bg2, line), `groups` (fields), `defaults`,
   optional `backdrop`, and `build(data, orientation, theme) → Scene[]`.
2. Inside `build`, use `const S = function <T>(v: T, h: T): T { return vertical ? v : h; }` for every orientation-specific
   size/layout. **16:9 needs larger type than 9:16** (it is 1920 wide); stack in 9:16, put side by side in 16:9.
3. Register it in `lib/templates/index.ts`, then run `npm run snapshot -- <dir> --only=<id>` and **look at both sheets**.
4. Fonts are CSS variables from `app/fonts.css`: --f-cinzel, --f-cormorant, --f-vibes (script), --f-playfair, --f-marcellus,
   --f-inter, --f-devanagari, --f-caveat, --f-bodoni, --f-arabic (Amiri), --f-gurmukhi, --f-tamil, --f-telugu, --f-malayalam,
   --f-kannada, --f-rozha (bold Hindi display), --f-kalam (handwritten Hindi), --f-yatra.
   They are self-hosted in `public/fonts/` (unicode-range subsets, as Google serves them). To add or change one, edit the
   list in `scripts/fetch-fonts.mjs` and run `node scripts/fetch-fonts.mjs`; commit the generated files. **Don't go back to
   `next/font/google`**: it downloads during the build, and Google sometimes answers Vercel's build machines with font URLs
   it cannot parse (`TypeError: Cannot read properties of null (reading '1')` in nextFontGoogleFontLoader → build fails).

## Gotchas already solved (don't reintroduce)
- Embedded browsers (e.g. the Claude desktop browser pane) **silently block downloads**, which is why exports are auto-copied to `exports/`.
- Dev hot-reload during a render could hang the queue. Hence the timeouts, the watchdog, and `__seek` rejecting when the render page unmounts.
- Indic/Arabic fonts load lazily (unicode-range); the render page calls `document.fonts.forEach(f => f.load())` before frame 0.
- `E.outBack(0)` must return exactly 0 (a tiny negative SVG radius throws errors).
- Mehrab clips with CSS `clip-path: path()`, not `foreignObject`.
- Gallery grid needs `grid-auto-rows: max-content`, or the cards get squashed.
- Never run two `next dev` servers on the same `.next` folder (e.g. a second one on another port): they corrupt each other's
  manifests (`Unexpected end of JSON input`, then `reading 'run'` 500s) and `EPERM .next\trace`. Stopping a backgrounded
  `npx next dev` wrapper can leave the server alive; check `node.exe` processes. Fix: kill both, start one.
- Seeded `rnd()` only. Particles, confetti and sparkles must be deterministic.
- Sanity-check religious/cultural text: Bismillah and the dua (Abu Dawud 2130) are in `nikah-mubarak.tsx`, ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ in `anand-karaj.tsx`.
  No hand-drawn Khanda or Ganesha (too easy to get wrong); text glyphs like ੴ are used instead.

## Status & next ideas
Done: 14 templates, categories + gallery, events field, both orientations, music, pacing, autosave, MP4 export (720p/1080p/4K, 24/30/60fps),
exports folder, CLI render, snapshot QA script, production build passes. Hosted on Vercel with live share links (`/e/<name>`),
Razorpay paid links (watermark removal), Mixpanel analytics, share success screen (iPhone mockups of the guest journey,
WhatsApp chat preview, Preview link / After payment toggle).

**Live since 11 Oct 2026 (6fa69bc), still to finish:** policy pages for Meta ads + Razorpay review: `app/(legal)/`
(privacy, terms, refunds, contact + layout), `lib/legal.ts`, `components/LegalLinks.tsx` (sidebar + phone ⋯ menu),
`AgreeNote` consent line in ShareDialog, styles in `app/globals.css`. Typecheck passes. Still to do:
1. Fill the empty `LEGAL` fields in `lib/legal.ts` (`entity`, `phone`, `address`, `city`, optionally `grievanceName`) with the
   owner's real details, identical to the Razorpay KYC / Meta Business account. Ask the owner; don't invent them.
2. Check the pages on desktop and phone width (/privacy, /terms, /refunds, /contact), then commit and push
   the filled-in details (push to `main` deploys to Vercel).
3. Give the live URLs to Razorpay (website details) and Meta (privacy policy URL). If a Meta Pixel is added later, update `/privacy` first.

Ideas (from README roadmap): Bengali / Marathi / Gujarati / Kerala-Christian / Parsi templates; optional functions list on every template;
personalised per-guest videos from a CSV; RSVP page + QR on the end card; WhatsApp preset (<16 MB, 1:1 square); face-aware photo crop;
scene reorder/hide; custom accent colour; undo/redo; AI-written lines via the Claude API; queue worker + S3 for scale; Remotion as an alternative engine.
