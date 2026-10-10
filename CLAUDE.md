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
4. Fonts are CSS variables from `app/layout.tsx`: --f-cinzel, --f-cormorant, --f-vibes (script), --f-playfair, --f-marcellus,
   --f-inter, --f-devanagari, --f-caveat, --f-bodoni, --f-arabic (Amiri), --f-gurmukhi, --f-tamil, --f-telugu, --f-malayalam,
   --f-kannada, --f-rozha (bold Hindi display), --f-kalam (handwritten Hindi), --f-yatra.

## Gotchas already solved (don't reintroduce)
- Embedded browsers (e.g. the Claude desktop browser pane) **silently block downloads**, which is why exports are auto-copied to `exports/`.
- Dev hot-reload during a render could hang the queue. Hence the timeouts, the watchdog, and `__seek` rejecting when the render page unmounts.
- Indic/Arabic fonts load lazily (unicode-range); the render page calls `document.fonts.forEach(f => f.load())` before frame 0.
- `E.outBack(0)` must return exactly 0 (a tiny negative SVG radius throws errors).
- Mehrab clips with CSS `clip-path: path()`, not `foreignObject`.
- Gallery grid needs `grid-auto-rows: max-content`, or the cards get squashed.
- Seeded `rnd()` only. Particles, confetti and sparkles must be deterministic.
- Sanity-check religious/cultural text: Bismillah and the dua (Abu Dawud 2130) are in `nikah-mubarak.tsx`, ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖ਼ਾਲਸਾ in `anand-karaj.tsx`.
  No hand-drawn Khanda or Ganesha (too easy to get wrong); text glyphs like ੴ are used instead.

## Status & next ideas
Done: 14 templates, categories + gallery, events field, both orientations, music, pacing, autosave, MP4 export (720p/1080p/4K, 24/30/60fps),
exports folder, CLI render, snapshot QA script, production build passes.
Ideas (from README roadmap): Bengali / Marathi / Gujarati / Kerala-Christian / Parsi templates; optional functions list on every template;
personalised per-guest videos from a CSV; RSVP page + QR on the end card; WhatsApp preset (<16 MB, 1:1 square); face-aware photo crop;
scene reorder/hide; custom accent colour; undo/redo; AI-written lines via the Claude API; queue worker + S3 for scale; Remotion as an alternative engine.
