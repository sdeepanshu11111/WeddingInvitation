# Invite Studio

Animated wedding invitation **videos**, built with HTML/CSS transitions in React (Next.js 14), exported as real **MP4** in **9:16** (Reels, Stories, WhatsApp Status) and **16:9** (YouTube, TV, email).

```bash
npm install        # also downloads headless Chrome + ffmpeg (no system installs needed)
npm run dev        # http://localhost:4321
```

## What you get

| | |
|---|---|
| **14 templates** | Built for the Indian market, every function covered (see the table below) |
| **Categories** | Wedding · All Functions · Engagement · Haldi · Mehendi · Sangeet · Reception · Save the Date, plus community filters (Hindu / North Indian, South Indian, Muslim, Sikh, Christian, Modern). The gallery plays each template live on hover |
| **Scripts** | Devanagari, Gurmukhi (ੴ), Arabic (Bismillah, wedding dua), Tamil, Telugu, Malayalam, Kannada |
| **4 palettes each** | One click recolours the whole video |
| **Per-template fields** | Text, multi-line, date, time, select, toggle, **image**, **gallery** (reorderable), **video**. The form is generated from each template's schema |
| **Both orientations** | Every scene has a hand-tuned layout for 9:16 *and* 16:9. "Both" shows them side by side |
| **Music** | Upload a track, set the volume, skip the intro. It fades in and out automatically |
| **Pacing** | 0.7× – 1.4× speed slider (changes total length) |
| **MP4 export** | 720p / 1080p / 4K, 24/30/60 fps, either or both orientations, with progress bars. Every video is also saved to `exports/`, so a browser that blocks downloads can never lose it |
| **Autosave** | The project (including media) is stored in IndexedDB and restored on reload |
| **Project files** | Save / Open a `.json` project. Batch-render from the CLI |

### Templates

| Template | Category | Community | Signature |
|---|---|---|---|
| Royal Mandala | Wedding | Hindu | Gold mandala, filigree corners, Devanagari header |
| **Shaadi Utsav** | All Functions | Hindu | Toran + kalash; **one scene per function** (Haldi → Reception) plus an at-a-glance schedule |
| **Kalyanam** | Wedding | South Indian | Temple border, kuthuvilakku, bells, kolam, banana leaves; header in Tamil/Telugu/Malayalam/Kannada; Chi./Sow.; Muhurtham window |
| **Nikah Mubarak** | Wedding, Reception | Muslim | Bismillah, mehrab arch, 8-point star lattice, lanterns, optional Walima, wedding dua |
| **Anand Karaj** | Wedding | Sikh | Glowing ੴ, Gurmukhi titles, phulkari band, Milni/Laavan/Langar schedule, Fateh sign-off |
| **Sagai Rings** | Engagement | All | Interlocking rings with diamond flash; works for Roka, Sagai, Ring ceremony |
| **Haldi Marigold** | Haldi | Hindu | Swaying genda-phool garlands, Rozha One titles, yellow dress-code swatches |
| **Mehendi Paisley** | Mehendi | Hindu, Muslim | Self-drawing henna paisleys, scalloped henna photo ring |
| **Sangeet Night** | Sangeet | Hindu, Sikh | Spotlights, neon type, line-up, equaliser, confetti |
| **Reception Gala** | Reception | All | Fairy lights, art-deco fans, programme of the evening |
| Blush Botanical | Wedding, Save the Date | Christian, Modern | Drawn sprigs, petals |
| Cinematic Reel | Save the Date | Modern | Your video clip, montage, letterbox |
| Polaroid Memories | Save the Date, Engagement | Modern | Photo scrapbook |
| Aurora Modern | Save the Date | Modern | Kinetic type, colour light |

Keyboard: `Space` play/pause, `←` / `→` seek ±1s.

## How it works (and why the export matches the preview)

```
Template (schema + scenes) ──► buildTimeline() ──► <Frame T={ms}/> ──► editor preview (rAF clock)
                                                          └──────────► /render page ──► headless Chrome
                                                                         screenshot per frame ──► ffmpeg ──► MP4
```

- **Every animation is a pure function of time.** There are no CSS keyframes and no timers inside scenes. `lib/anim.ts` has easings plus helpers (`rise`, `maskUp`, `pop`, `kenBurns`, `drawPath`, `typed`...), and each one takes `t` and returns a style. So the renderer can jump to frame 417 and get exactly the pixels the preview showed.
- **Scenes overlap through transitions** (`fade`, `slide-*`, `zoom-*`, `wipe-*`, `iris`, `blur`, `curtain`). `layout()` computes the overlaps.
- **Video clips are seeked rather than played** during export (`<Clip>` in `components/primitives.tsx`). The renderer waits on `window.__mediaPending` before each screenshot.
- **Fonts are self-hosted** through `next/font`, and images are decoded up front, so frame 0 is never blank.
- **Design space** is a fixed 1080×1920 or 1920×1080. `<Stage>` scales it to the screen, and export sets `deviceScaleFactor` to 0.67, 1 or 2 for 720p, 1080p or 4K.

## Add a template

1. Create `lib/templates/my-template.tsx` that exports a `TemplateDef`:
   - `groups`: the form fields (the editor UI is generated from these)
   - `defaults`, `palettes`, `fonts`, `thumb`
   - `backdrop` (optional): the layer under every scene
   - `build(data, orientation, theme)`: returns `Scene[]`, each `{ id, label, duration, in, out, render(ctx) }`
2. Add it to `lib/templates/index.ts`.
3. `npm run snapshot -- snapshots --only=my-template` writes contact sheets of every scene in both orientations, filled with generated demo photos. Use them to QA layouts without clicking through.

Inside `render`, use `S(verticalValue, horizontalValue)` for anything orientation-specific.

## Scripts

| | |
|---|---|
| `npm run dev` | Editor at :4321 |
| `npm run render -- project.json [--both] [--720p\|--4k] [--60fps]` | CLI/batch export (dev server must be running) |
| `npm run snapshot -- outDir [--only=id] [--palette=id]` | Contact sheets for QA and thumbnails |
| `npm run typecheck` | `tsc --noEmit` |

Preview any template without the editor: `/render?template=aurora-modern&orientation=horizontal&palette=sunset&demo=1`.

## Deploy to Vercel

On Vercel you get the editor, **Share** links (the invitation plays in the guest's browser) and WhatsApp preview cards.
**Export MP4 shows "Soon"**: it needs Chrome + ffmpeg on a long-running server, which serverless functions are not. Locally, everything works.

1. Push the repo to GitHub and import it in Vercel (**Add New → Project**). Next.js is detected; no build settings needed.
2. **Storage → Create → Blob**: choose a **public** store in the region nearest India, then **Connect** it to the project (all environments). This adds `BLOB_READ_WRITE_TOKEN`.
3. Optional: **Settings → Environment Variables** → `SITE_URL` = your domain, e.g. `https://invitestudio.in` (defaults to the Vercel production domain).
4. **Redeploy** after connecting Blob or changing variables: the share mode is fixed at build time.
5. Check: open the editor → **Share** → **Create link** → open it on a phone, then paste it into WhatsApp to see the preview card.

| Variable | Set by | Purpose |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel, when Blob is connected | Share media + data go to Vercel Blob instead of `exports/` |
| `SITE_URL` | you (optional) | Absolute URLs in link previews |
| `VIDEO_EXPORT` | you (optional) | `1`/`0` forces MP4 export on/off (default: off on Vercel, on elsewhere) |

`vercel.json` pins functions to Mumbai (`bom1`); `.puppeteerrc.cjs` skips the Chrome download on Vercel builds.

## Notes / limits

- Rendering runs at roughly 5 frames/sec on a laptop (a 25s 1080p video takes about 2–3 min). Jobs are queued one at a time, on purpose.
- Media is stored as data URLs. That is simple and portable, but keep videos under about 80 MB.
- The job store is in memory. Restarting the server forgets finished jobs, and files are pruned after 6h.
- Every finished MP4 is copied to `exports/` (and the export dialog has **Open video** and **Show in folder** buttons) because some embedded browsers silently block file downloads.
- A render that stops making progress for 90s is cancelled automatically so it cannot block the queue.
- Music must be licensed for your use. Instagram/YouTube may mute copyrighted tracks.

## Roadmap: how to take this further

**Product**
1. **Personalised guest videos.** Upload a guest CSV and render one MP4 per guest ("Dear Sharma family..."). The CLI already batches, so this needs a `guestName` field plus a loop.
2. **RSVP landing page + QR code** on the end card. Each guest link tracks opens and RSVPs.
3. **WhatsApp-ready output.** 9:16 at 720p under 16 MB (WhatsApp Status limit), plus a 1:1 square preset for feeds.
4. ~~Multi-event cards~~ ✅ done (Shaadi Utsav). Next: give every template an optional functions list.
5. **More communities**: Bengali (alpona, shola), Marathi (paithani, mundavalya), Gujarati (bandhani), Kerala Christian, Parsi. Hindi/regional-language **editor UI**.
6. **Beat-sync**: detect the music tempo (Web Audio) and snap scene cuts to beats.
7. **Template marketplace**: free vs premium templates, watermark on free exports, pay per HD export.

**Editor**
8. **Photo cropping with face detection**, so faces never get cut by arches or circles (`face-api.js` or MediaPipe in the browser).
9. **Scene editor**: reorder, hide or duplicate scenes, and change a transition per cut. The data model already supports this.
10. **Custom colours / brand fonts** beyond the preset palettes. Adding an accent-colour picker is small.
11. **Undo/redo** (the project is one immutable object, so a history stack is trivial).
12. **AI copy**: generate the opening line, couple story and hashtag with the Claude API from a few prompts ("how you met").

**Infrastructure**
13. **Scale rendering**: move `lib/server/render.ts` into a queue worker (BullMQ + Redis) or a serverless function. Split long videos into chunks rendered in parallel and concat them with ffmpeg. Store media in S3/R2 instead of data URLs.
14. **Faster export**: Chrome's `HeadlessExperimental.beginFrame` or WebCodecs in-browser encoding can be 3–5× faster than screenshots.
15. **Accounts + share links** (Postgres + auth) so couples can come back, and so families can preview before export.
16. **Alternative engine**: [Remotion](https://remotion.dev) does the same React→MP4 idea with a mature renderer and Lambda scaling. It is worth evaluating if you scale, but check its company licence for commercial use.
