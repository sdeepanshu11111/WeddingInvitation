# Invite Studio: project context for Claude

Wedding / Indian-function **video invitation** maker. The user picks a template, fills in fields
(names, dates, photos, video, music) and exports a real **MP4** in **9:16** (Reels / WhatsApp Status)
and/or **16:9** (YouTube / TV). Target market: **India** (Hindu, South Indian, Muslim, Sikh, Christian, modern).
The owner is building this as a product. Keep the UI in English; templates use Indian scripts.

## Run

```bash
npm install          # also downloads headless Chrome (puppeteer) + ffmpeg-static
npm run dev          # http://localhost:4321
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
- `app/page.tsx`: the editor (sidebar categories, canvas, transport, form). `app/render/page.tsx`: headless target exposing
  `window.__ready / __info / __seek(t) / __project`. Preview mode: `/render?template=<id>&orientation=horizontal&palette=<id>&demo=1`.
- `lib/server/render.ts`: export queue (one job at a time, **90s stall watchdog**, per-step timeouts), puppeteer screenshots
  piped as JPEG into ffmpeg (H.264 + AAC music with fade), and **auto-copy of every MP4 to `exports/`**.
- API: `POST /api/render`, `GET /api/render/[id]`, `GET /api/render/[id]/file[?inline=1]`, `POST /api/render/[id]/reveal`
  (opens Explorer, localhost only), `GET /api/job/[id]`, `POST /api/project` (saves the project JSON to `exports/`).
- Share links (`lib/server/share.ts`), page `/e/[slug]` with readable names (`/e/aarav-ananya`; old `/v/<token>` links
  308-redirect there via next.config). Server-rendered, so link previews work; on-demand ISR (`generateStaticParams` → `[]`,
  `revalidate = false`): rendered on first visit, then cached. Don't read headers/cookies there or it turns dynamic; absolute
  URLs come from `SITE_URL` (`lib/site.ts`). Caching only shows in a production build, not `next dev`.
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
    `lib/server/stream.ts` (Range support; iOS needs it). `blob` (when `BLOB_READ_WRITE_TOKEN` is set) = Vercel Blob
    `shares/<token>/`; the editor first uploads media straight to Blob through `/api/share/upload` (Vercel caps request
    bodies at 4.5 MB). Media types are whitelisted in `lib/media.ts` (no SVG: it could run script on our origin).
  - On localhost the dialog shows the Wi-Fi IP URL so phones on the same network can open it.
- Feature flags (`lib/features.ts`, set in `next.config.mjs` at build time): `VIDEO_EXPORT` (off on Vercel: Export MP4 shows
  "Soon" and every export API returns 501) and `SHARE_STORE`. Deploy steps: README "Deploy to Vercel". `lib/server/paths.ts`
  holds `EXPORT_DIR` so share code does not import render.ts (that would pull Chrome/ffmpeg into its function bundle).

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
exports folder, CLI render, snapshot QA script, production build passes.
Ideas (from README roadmap): Bengali / Marathi / Gujarati / Kerala-Christian / Parsi templates; optional functions list on every template;
personalised per-guest videos from a CSV; RSVP page + QR on the end card; WhatsApp preset (<16 MB, 1:1 square); face-aware photo crop;
scene reorder/hide; custom accent colour; undo/redo; AI-written lines via the Claude API; queue worker + S3 for scale; Remotion as an alternative engine.
