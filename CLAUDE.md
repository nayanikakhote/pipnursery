# CLAUDE.md — Pip's Midnight Nursery (overnight build brief)

You are continuing a hackathon build. Read this whole file before touching code. It is the single source of truth: the project, the rules, what exists, and the ordered task list.

The owner (Nayu) is asleep while you work. **Do not stop to ask questions.** Make the most reasonable choice, note it in the Progress Log at the bottom of this file, and keep going. Stop only for something irreversible (deleting the repo, force-pushing over history, paying for anything).

---

## 0. Hard rules (read first)

1. **Deadline:** code freeze **Mon 19 Oct 2026, 17:17 IST**. A live URL is needed by Sun 18 Oct, 17:17 IST, but **Nayu deploys it herself. You must NOT deploy anything**: no Vercel/Netlify/GitHub Pages, no `.github/workflows` deploy files, no changing repo settings. Your job is only to keep `master` always buildable and deploy-ready.
2. **Commit + push after every finished task** (small, descriptive commits). The hackathon requires a public GitHub commit history spread across 17–19 Oct. Never squash, rebase or force-push existing history. Branch: `master`.
3. **Zero console errors or warnings** in the browser. This is explicitly judged (35% "Functionality & Polish"). Check after every task.
4. **Never break what works.** Run `npm run build` before every commit. If a feature can't be finished cleanly, ship it hidden behind its placeholder rather than half-broken. A clean simple feature beats a broken ambitious one.
5. **Canon (Track 1):** Pip's name, smooth round skull face, baby, **Junior Dream Engineer at the Midnight Nursery**, cute and gentle, never scary, gory or creepy. **Pip is the narrator**: all site copy is first person, Pip's voice.
6. **Pip's voice:** lowercase-friendly, short sentences, sleepy, giggly, easily delighted, **hates silence**. Darkness is cosy. Mistakes turn into glitter. Example: "oh! hi!! you found my room. 🌙"
7. **Sound:** nothing plays before the first click/tap; every sound goes through the master gain; the mute toggle must always be visible and silence everything.
8. **Mobile-first quality:** every interaction works with touch, all touch targets ≥ 44px, no hover-only interactions.
9. **Credits:** every image source credited in `Credits.txt` (official Pip assets © haX.baby; AI-generated art: credit the tool as "AI-generated for this project"; fonts; libraries).
10. **No text baked into images.** All words are live text.

---

## 1. The hackathon (so you know what's judged)

haX.baby "Baby's First Website", 48h, Track 1: build a portfolio website for **Pip the skull baby**. The site must show **what Pip is**, **what Pip does** (3+ projects; we do all 6 canon ones), and **Pip's story** (scroll-driven scenes, each under 150 words), plus one interactive moment, a mobile layout and a hidden Easter egg.

**Rubric:** 35% functionality & polish (no errors, everything works) · 30% early-web soul (90s/00s whimsy) · 20% creativity & surprises (eggs, toys) · 15% clean craft (mobile, fast, accessible, tidy code).

**Tiers we're hitting:** Tier 1 (eyes follow cursor with touch fallback, scroll-driven story, day/night toggle that changes palette *and Pip's expression*, responsive, Easter egg). Tier 2 (Web Audio lullaby synth, flashlight cursor, SVG route drawn on scroll, page-flip storybook, mini-games). Tier 3 (live guestbook, visitor memory, rule-based chat, Lighthouse 90+).

**Side quests (bonus points):** live guestbook +2, sparkle cursor trail +2, hit counter odometer +1, click sounds + mute +3, responsive chaos mode +5.

---

## 2. Concept

You land in **Pip's cosy nursery at night**. Pip notices you (eyes follow the cursor). On the desk is a chunky pastel-pink CRT computer. Click it → the camera **zooms into the screen** → **DreamOS 98** boots → a retro desktop that is Pip's actual workspace. The 6 projects are apps on the desktop. Finishing things **changes the nursery** (the worlds leak into each other). The origin story ends with Pip becoming a constellation, then you're walked back to the now-sleeping nursery.

Phones get a different retro skin: **DreamPad**, a pastel handheld device. Tablets get maximized windows. Crossing a breakpoint makes Pip say "whoa, the room is moving!" (that's the Chaos Mode).

### Supporting cast (our invention, reuse everywhere)
- **Boo**: tiny ghost afraid of the dark → Moonbeam nightlight, delivery stop 1 (Crooked Chimney), star of the Bedtime Storybook.
- **Nibbles**: mouse who misses the stars → Starling nightlight, stop 2 (Willow Treehouse).
- **Fern**: frog who overthinks at bedtime → Cloudberry nightlight, stop 3 (Lilypad Pond).
- **Granny Owl**: Night Supervisor; signs Pip's employee ID, gives Pip the badge in the story.

### Palette and type (already in `src/styles/theme.css`)
cream `#FFF8F1` · berry `#A34063` · cocoa `#5C4033` · navy `#30364E` · pink `#EFC6D2` · gold `#F4C96B` · lavender `#C9B8E8` · ink `#1F2233`.
Fonts: Fraunces (story titles), Fredoka (UI and Pip's bubbles), Pixelify Sans (DreamOS chrome), VT323 (system text, odometer).
Official art style: **soft 3D clay / vinyl toy render** in cream/pink/lavender. Pip wears a cream nightcap with gold stars, a pink bow and a pom-pom, and a cream onesie with pink hearts.

---

## 3. What already exists (verified to build; NOT yet tested in a browser)

**Stack:** Vite 8, React 19, TypeScript 6 (strict, `verbatimModuleSyntax` → use `import type` for types), framer-motion, zustand (+persist), canvas-confetti. **No Tailwind**: plain CSS files with the tokens in `theme.css`.

```
src/
  main.tsx                 console ASCII greeting (bonus egg) + root
  App.tsx                  scene router; global: audio unlock, idle yawn(20s)/sleep(45s)/wake,
                           transient-mood reset, Konami code + 'pip:giggle-storm' event,
                           breakpoint-change toast ("chaos mode"), data-theme/data-motion on <html>
  store/dreamStore.ts      zustand store (see API below)
  audio/audio.ts           Web Audio engine: unlockAudio, setMuted, sfx.*, PENTA scale
  lib/pointer.ts           shared pointer position + lookTarget (Pip looks at hovered element)
  lib/counter.ts           pluggable visitor counter (currently local-only, labelled honestly)
  hooks/useMode.ts         'desktop' (>=1024) | 'tablet' (640–1023) | 'phone' (<640); reduced-motion hook
  content/copy.ts          ALL Pip lines (lines.*, appHello[id], pick())
  content/assets.ts        ART registry: generated images plug in here; undefined → CSS fallback
  components/
    Pip.tsx + pip.css      Living Pip (see below)
    PixelIcon.tsx          hand-made pixel art icons drawn as SVG (ICONS map)
    Controls.tsx           MuteToggle, ThemeToggle, SpeechBubble (reads store.bubble), Toast
    Odometer.tsx           rolling-digit hit counter
  scenes/
    Nursery.tsx + .css     room drawn in CSS (wall, floor, round window, shelf, rug, door frame),
                           SVG hanging mobile, CSS CRT + desk, official music box + lantern,
                           CSS toy blocks "PIP", Pip, 5 hidden stars → "PIP" constellation egg,
                           CRT click → zoom (transform-origin = CRT screen) → booting.
                           exports handlePipClick() (giggle + 5-click secret unlock + confetti)
    Boot.tsx               DreamOS boot text + 10-moon progress (skippable, fast on return);
                           also exports ShutDown ("It is now safe to fall asleep.", click to wake)
    Desktop.tsx + desktop.css  wallpaper (CSS), icon columns + "my work ✨" group, windows,
                           Pip widget bottom-right with bubble, taskbar (Start, tabs, tray:
                           odometer, ★ sticker count, theme, mute, clock — 7 taps = giggle storm),
                           Start menu (keyboard nav, settings toggles, Go to bed, Shut Down).
                           exports launch(id) → opens app + Pip says appHello[id]
    DreamPad.tsx + .css    phone shell: handheld frame, status bar, home grid, app slides in,
                           hardware buttons (back, home, stickers, theme, mute)
  os/
    apps.tsx               APPS registry {id,title,label,icon,group,w,h,component(lazy)}
    Window.tsx             Win98 window: drag by title bar (pointer events), min/max/close,
                           focus on click, Esc closes top window, tablet = maximized w/ back arrow
  apps/
    MyPip.tsx              Employee ID card (official portrait) + About me + "my work" links ✅
    TextFiles.tsx          DevNotes (egg), Credits, LostSocks, SecretFile ✅
    Stickers.tsx           Sticker Album; exports STICKERS list ✅
    Placeholder.tsx        "pip is still painting this room" — used by every unbuilt app
public/assets/             pip-base.webp (Pip, eye dots ERASED for live eyes), pip-avatar.webp
                           (original eyes), music-box.webp, dream-lantern.webp, pip-portrait.webp
                           — all background-removed
```

### Store API (`useDream`)
- `scene`: `'nursery' | 'zooming' | 'booting' | 'desktop' | 'finale' | 'secret' | 'shutdown'` (finale + secret not wired yet), `setScene()`
- windows: `openApp(id)`, `closeApp`, `focusApp`, `minimizeApp`, `toggleMax`, `moveApp`, `closeAll`
- Pip: `mood` (`idle|giggle|cheer|yawn|asleep|pout|sneeze|whoa`), `setMood()`, `say(text)`, `showToast(text)`
- progress: `progress` = `{ lullaby, nightlights, routes, toys, bedtime, growth, story }`; `complete(key)` → sets it + awards sticker `project-<key>`, returns true the first time
- `award(badgeId)` → returns true if new · `badges` · `secretUnlocked` / `unlockSecret()` · `visitor {visits, name}` / `setVisitorName()`
- prefs (persisted): `soundOn`, `theme` ('night'|'sunrise'), `reducedMotion`, `sparkleOn`

### Pip component
`<Pip width="120px" onClick={handlePipClick} mood="asleep" badge />`. It draws `pip-base.webp` with two live amber eye dots inside the measured sockets (base image 585×778; sockets at (226.3,286.7) and (396.9,239.8), r≈46px). Blinks, follows the pointer or `lookTarget.el`. Moods are CSS overlays (eyelids, happy lower lids, earmuffs when muted, Zzz, bounces). Night mode = half-lidded sleepy eyes.

### Sound (`sfx`)
`click, open, close, chime, giggle, bonk, sneeze, boot, note(freq, whenSec, gain), whoosh, pop, sparkle, jingle, clack, shuffle, yawn, static`. `PENTA` = C5 D5 E5 G5 A5 C6. Add new recipes in `audio.ts` the same way (`tone()` / `noise()` helpers).

---

## 4. Images

Nayu has generated all images (P0, P1, P2). They are in the repo in **`art-raw/`**. If the folder is missing or something can't be found, **build with the CSS/SVG fallbacks** and keep going; never block on art.

### ⚠️ The files are COLLAGE SHEETS, not one image per file
Each file contains several assets laid out together in one picture. They are **not** named by ID. The files are:

| File in `art-raw/` | Contains (manifest IDs) |
|---|---|
| `batch1.1` | Batch 1 items: PIP-02 sleeping, PIP-05 earmuffs pout, NUR-03 CRT on desk (green screen), OS-01 night wallpaper, and possibly NUR-01/NUR-02 nursery backgrounds and some props |
| `batch1.2` | OS-03 icon sheet (20 icons; they are soft 3D-style icons, not strict pixel art) |
| `batch2` | PRJ-01 three nightlights, PRJ-02 rooftop map, TOY-01 three rattles, GRW-01 tall growth-chart wall strip |
| `batch3` | STY-01..05 origin-story chapter scenes (cloud → reaching for music box → workbench → flying over rooftops with owl → asleep under mobile) |
| `BATCH4` | STB-00 cover + STB-01..06 storybook pages (ghost under blanket → ghost hugs moon → dark sky, owls bonk → meets Pip on roof → Pip gives little moon → ghost goes home) |
| `BATCH5` | REF-01..03 style references (nursery mockup, DreamOS desktop mockup, Lullaby window mockup). **Reference only, never ship** (Pip and UI are baked in) |
| `P1` | All P1 items in one big collage: NUR-04 mobile pieces, NUR-05 teddy, NUR-06 blank blocks, PIP-03 yawn, PIP-04 cheer, PIP-06 flying with lantern, PIP-07 curled on cloud, PIP-10 pixel Pip row, OS-02 sunrise wallpaper, OS-04 stickers, PRJ-03 creatures (ghost, mouse, frog, owl), STY-06 secret dream room, DEV-01 DreamPad frame (green screen), REF-04 storybook mockup, REF-05 DreamPad mockup |
| `p2` | PIP-08 sneeze, PIP-09 surprised (two Pips side by side) |

**What to do (task T1):**
1. Open each sheet and **look at it**. Identify every piece by content against the table above and the manifest below.
2. Crop each piece out (detect panel/object boundaries: background-colour gutters for the scene grids, connected components for objects on plain backgrounds). Write the crop boxes to `tools/crops.json` so they're reproducible, and save the crops to `art-raw/by-id/<ID>.png`.
3. Then process each crop per the rules below (cutout, keying, WebP).
4. **Resolution check:** crops from a collage can be small. If a crop is smaller than about 70% of its display size, upscale with Lanczos plus a light unsharp mask and see if it still looks good. If it looks blurry, use it smaller (for example a framed picture instead of a full-bleed background) or keep the CSS fallback. List every weak crop under "For Nayu in the morning" so she can regenerate just those as single images.
5. If NUR-01/NUR-02 (empty nursery backgrounds) aren't in any sheet, **keep the CSS-drawn room** and note it for Nayu. Don't crop the REF mockups as a substitute.
6. If a piece is off-model (wrong Pip design, scary, text baked in), skip it and log it.

### Processing rules
- Output to `public/assets/` as **WebP** (quality ~85), sized to at most 2× display size. Nursery background ≤ 300 KB.
- **Background removal** for single objects (white/cream backgrounds): `pip install --break-system-packages "rembg[cpu]"`, model `isnet-general-use`, then crop to bbox and keep only the largest connected component (removes stray sparkles). Check the result composited on navy before using it.
- **Green-screen assets** (`NUR-03` CRT, `DEV-01` DreamPad frame): key out `#00FF00` (± tolerance) to transparent, and record the green rectangle's bbox as percentages. That's where the live DOM screen sits.
- **Sprite sheets** (icons, stickers, nightlights, rattles, creatures, mobile, blocks, pixel Pip): slice by connected components (sort row-major), save each piece separately, and record the mapping in a JSON or TS file.
- **Pixel art** (OS-03, OS-04, PIP-10): downscale with nearest-neighbour to the true pixel grid if possible, and render with `image-rendering: pixelated`.
- Put every processing script in `tools/` (committed) so it's reproducible.
- If an image is clearly off-model (wrong Pip design, scary, text baked in), **don't use it**: keep the fallback and note it in the log.

### Asset manifest
| ID | Use | Notes |
|---|---|---|
| OFF-01..04 | already processed in `public/assets/` | — |
| PIP-02 sleeping | `asleep` mood, sleeping nursery after finale, shutdown screen | when a pose image exists, `Pip` renders it instead of base+overlays (hide live eyes) |
| PIP-03 yawn, PIP-04 cheer, PIP-05 earmuffs pout, PIP-08 sneeze, PIP-09 surprised | matching moods (`yawn`, `cheer`, `pout`, `sneeze`, `whoa`) | add a `POSES` map in Pip.tsx; poses must be aligned to roughly the same bounding box as the base (pad to same aspect) so swapping doesn't jump |
| PIP-06 flying with lantern | Dream Routes traveller, story ch.4 | |
| PIP-07 curled on cloud | finale, story ch.5 | |
| PIP-10 pixel sprite sheet | DreamPad status bar, PipChat avatar, favicon/OG | |
| NUR-01 nursery wide 16:9 | nursery background (desktop/tablet) | set `ART.nurseryWide`; then hide the CSS room and **re-place the clickable objects** to match the painting (the window, shelf etc. may become transparent hotspots over the art) |
| NUR-02 nursery tall 9:16 | nursery background in portrait (`max-aspect-ratio: 4/5`) | `ART.nurseryTall` |
| NUR-03 CRT on desk (green screen) | replaces CSS CRT; live screen div over the green area | keep zoom origin = screen centre |
| NUR-04 mobile pieces | replaces SVG mobile (keep per-piece sway) | |
| NUR-05 teddy | nursery teddy + Easter egg 3 | |
| NUR-06 blank blocks | nursery blocks + Rattle & Blocks builder (letters drawn in CSS on top) | |
| OS-01 / OS-02 wallpapers | desktop night / sunrise | `ART.wallpaperNight/Sunrise`; keep CSS stars layer on top if it looks good |
| OS-03 icon sheet (20) | desktop + DreamPad icons | order: 1 ID badge, 2 music box, 3 lamp folder, 4 map, 5 rattle+block, 6 moon picture book, 7 height ruler, 8 star diary, 9 guestbook, 10 nightcap speech bubble, 11 lantern, 12 falling star, 13 sock basket, 14 notepad, 15 scroll, 16 sleeping file, 17 moon logo, 18 gold star, 19 toy chest, 20 cloud. **Keep PixelIcon as fallback**; switch only if the sheet slices cleanly |
| OS-04 sticker sheet (12) | Sticker Album, guestbook sticker picker, Match cards | order: star, moon, ghost, teddy, bow, lantern, note, cloud, sock, frog, mouse, owl |
| PRJ-01 three nightlights (unlit) | Nightlights app | order: crescent moon (Moonbeam), cloud (Cloudberry), star (Starling) |
| PRJ-02 rooftop map | Dream Routes | crooked chimney top-left, treehouse top-right, lilypad pond bottom-right, nursery bottom-left |
| PRJ-03 creatures | Boo, Nibbles, Fern, Granny Owl (in that order) | |
| TOY-01 rattles | star, moon, bone (in that order) | |
| GRW-01 growth wall (tall) | Growth Chart background | |
| STY-01..05 | My_Story chapter illustrations | 16:9, left third calm for text |
| STY-06 | Secret Dream Room (egg 1) | |
| STB-00 cover, STB-01..06 pages | Bedtime Storybook (crayon style) | text overlays on bottom fifth |
| DEV-01 DreamPad frame (green screen) | phone shell frame | if it doesn't fit tall phone ratios cleanly, keep the CSS frame and just use its colours |
| REF-01..05 | style references only, never shipped | look at them to match the vibe |

---

## 5. Ordered task list

Work top to bottom. Each task: build → `npm run build` → browser check (see §6) → commit → push → tick it in the Progress Log. If a task blows past ~90 minutes, ship the simplest clean version, log what's missing, and move on.

### T0 · Run it and fix what's broken (do this first)
- `npm install`, `npm run build`, then run it in headless Chromium (Playwright) at **1440×900, 820×1180, 390×844**.
- Walk the flow: nursery → click CRT → zoom → boot → desktop → open My Pip → drag the window → close → Start menu → Shut Down → wake. Phone: nursery → CRT → DreamPad → open app → back.
- Fix every console error or warning and any layout bug. Things to suspect: the bubble position on small screens, CRT zoom origin, AnimatePresence warnings, StrictMode double effects (Nursery greeting timers), touch single-tap opening icons (`e.detail`/pointerType logic in `DesktopIcon`).
- Add a `asset()` helper (`import.meta.env.BASE_URL + path`) and use it for every `/assets/...` path, so the site works under any base path.
- **Done when:** the whole flow works at all 3 sizes with an empty console. Commit "Fix first-run issues".

### T1 · Process art and swap in the P0 images
Process everything in `art-raw/` per §4. Wire in: NUR-01/02 nursery backgrounds (re-place hotspots to match the art), NUR-03 CRT, OS-01/02 wallpapers, OS-03 icons (if clean), PIP poses via `POSES`. Re-check all 3 sizes.
**Done when:** the nursery and desktop use the real art, every hotspot sits on the right object, and nothing is misaligned on phone or desktop.

### T2 · Project 1 — Lullaby Lab (`apps/LullabyLab.tsx`, id `lullaby`)
Intro (Pip): "creatures can't sleep without a song. so i make them. you can make one too!"
- Official music box image, lid "closed" (static image + CSS). Click the **winding key** 3 times (key rotates each click, with a click sound); then the box "opens" (bounce) and gold stars rise into **SVG orbit rings** around it.
- **8-step sequencer:** 8 slots; each slot cycles through 6 pentatonic star-notes or a rest. Show as a grid of labelled buttons (`aria-label="Step 3, note E"`), arrow keys move, Space toggles.
- Presets: **Pip's Hum** (default), **Twinkle** (public-domain melody, pentatonic approximation), **Boo's Brave Song**, **Random Dream** (random but pleasant: no more than 2 rests, start and end on C).
- Play / Stop, tempo slider (slow ↔ sleepy-slow). The playing step and its orbit star glow in sync. Use `sfx.note()` scheduled ahead with the AudioContext clock (not setInterval drift).
- One full playthrough → `complete('lullaby')` → Pip `cheer` + "a lullaby!! the frogs will love it." + confetti (small).
- **Secret (egg 4):** after a playthrough, lighting the lamps in Nightlights in order Moonbeam → Starling → Cloudberry unlocks preset **Pip's Secret Song** + sticker `egg-secretsong` (add it to STICKERS). Store the "played" flag in the store.

### T3 · Project 2 — Nightlight Collection (`apps/Nightlights.tsx`, id `nightlights`)
Intro: "everyone is scared of something. so i design a light for each of them."
- A dark shelf with 3 lamps (PRJ-01, or CSS fallback) + a card under each:
  - **Moonbeam** — for Boo (afraid of the dark) — warm amber — "a ghost scared of the dark! so i gave him his own little moon."
  - **Cloudberry** — for Fern (overthinks) — soft pink — "it glows slower when you breathe slower. fern says it helps." (its glow pulses on a slow 6s breathing loop)
  - **Starling** — for Nibbles (misses the stars) — lavender — "it throws stars on her burrow ceiling. now she has her own sky." (projects little CSS stars onto the shelf wall when on)
- Tap a lamp: on/off (radial glow + light spill, chime). Colour swatches per lamp (amber/pink/lavender). A "lights out" button dims the window so glows pop.
- All three on → `complete('nightlights')` → the nursery room glows warmer (already wired via `progress.nightlights`).
- Lighting order Moonbeam → Cloudberry → Starling (any time) reveals a 4th: **Dream Lantern** (official lantern art), for "everyone". Also wire egg 4 (order check above).

### T4 · Project 3 — Dream Delivery Routes (`apps/DreamRoutes.tsx`, id `routes`)
Intro: "every night i fly dreams across the rooftops. this is my map. help me deliver tonight's batch?"
- Map (PRJ-02 or an SVG-drawn fallback map). Three glowing rooftops: **Crooked Chimney** (Boo: "a sky full of friendly moons"), **Willow Treehouse** (Nibbles: "lying in a field, counting stars"), **Lilypad Pond** (Fern: "a quiet pond where no thoughts are allowed, only frogs").
- Tap a rooftop → card with the creature (PRJ-03) and their dream → **Deliver** → a dotted SVG route draws itself from the nursery to that roof (`stroke-dashoffset`), Pip (PIP-06, or small avatar) travels along it (`offset-path` or manual sampling of `getPointAtLength`), the roof window glows gold, a stamp lands in **Pip's Delivery Log** with a whoosh/chime.
- In-world counter: "dreams delivered tonight: 2/3" (clearly in-world, not the visitor counter).
- All 3 → routes join into a **constellation** (lines + stars) → `complete('routes')` → stars appear on the nursery wallpaper (already wired).

### T5 · Origin story — `apps/MyStory.tsx` (id `story`) + Finale
- Book-styled window. 5 chapters, each = illustration (STY-01..05, or a CSS scene fallback) + short text + one small interaction. Chapters **advance with scroll** (CSS scroll-snap inside the window body, IntersectionObserver for the active chapter) + a 5-star progress bar at the top + Prev/Next buttons, arrow keys, swipe. Text fades/rises in as each chapter enters (respect reduced motion).
- Text (keep exactly, Pip's voice):
  1. **A Cloud That Hummed** — "I don't remember being born. I remember a cloud. It was humming. It drifted down the sky and bumped, very gently, into the window of the Midnight Nursery. Inside, one lamp was still on. I decided that was an invitation." *Tap the cloud → trail of stars.*
  2. **The Silence Problem** — "The nursery was quiet. Very quiet. I do not like quiet. Then I found a music box on the highest shelf. I wound it up, and every wriggly little creature in the room sighed… and slept. That's when I knew. Silence was a problem. And I was going to fix it." *Wind the box → 4 notes.*
  3. **The Little Inventor** — "So I started building. Lamps for the ones afraid of the dark. Maps for dreams that got lost. Stories for the ones who needed one more. Most of my first tries exploded into glitter. Some of them worked." *Tap inventions → each goes poof into glitter.*
  4. **The First Delivery** — "One night, I tucked a finished dream under my arm and flew across the rooftops. Every window I visited glowed gold. Granny Owl, the Night Supervisor, watched the whole thing. In the morning she pinned a tiny badge on my nightcap: Junior Dream Engineer." *An SVG route draws across the rooftops **synced to scroll progress** within this chapter (Tier 2 item), windows light up one by one.*
  5. **Goodnight, Little World** — "Now the whole neighbourhood sleeps. I save my work, turn the lamp down low, and curl up under the hanging stars. If you're still here… thank you for visiting my little world. Tap the last star, and I'll walk you home." *Tap the last star → Finale.*
- **Finale** (`scene: 'finale'`, new `scenes/Finale.tsx`): screen dims to deep navy; gold points drift from a curled-up Pip silhouette (PIP-07) into a constellation (SVG, staggered); text "goodnight, little world."; the delivery constellation joins if routes are done; one star flies down and becomes a special gold sparkle cursor (unlock flag). Button "walk me home" → back to the nursery, which now shows **Pip asleep** (PIP-02) with a starry ceiling and dim lamps. `complete('story')`.

### T6 · Project 5 — Bedtime Storybook (`apps/BedtimeStorybook.tsx`, id `bedtime`)
Intro: "i wrote a bedtime story. and i drew the pictures myself! (be nice.)"
*Boo and the Borrowed Moon* — written and illustrated by Pip (crayon art STB-00..06; fallback: CSS crayon-ish scenes).
- Hardcover opens from the cover into 6 pages then a back cover "the end". **Page-turn animation** (CSS 3D `rotateY` on page halves on desktop; single page with slide-curl on phones). Controls: click page corners, ← →, swipe, page dots. Text is live text overlaid on the bottom of each page, announced via `aria-live`. Reduced motion → crossfade. A soft music-box hum plays while open (respects mute).
- Pages (text · tap interaction):
  1. "Boo was a ghost. Boo was also afraid of the dark. Everyone said this was silly. Boo said it was very serious." · tap Boo → shivers
  2. "One night, Boo floated up, up, up, and borrowed the moon. Just for a little while. Just to hold." · tap the moon → hug wiggle
  3. "But without the moon, the whole sky went dark. The owls bumped into chimneys. The frogs forgot the way home." · tap owls → `sfx.bonk`
  4. "Boo felt terrible. He floated back to return it… and found Pip waiting on the roof, holding a tiny lamp." · tap the lamp → flicker on
  5. "\"I made you something,\" said Pip. It was a little moon. Just Boo-sized. It glowed warm, like a hug." · tap → warm glow fills the page
  6. "Boo hung the big moon back in the sky and took the little one home. The end. Goodnight, Boo. Goodnight, you." · tap the sky → stars twinkle on
- Reaching "the end" → `complete('bedtime')` → Pip: "did you like it?? i'm going to write a sequel." → a tiny glowing book appears on the nursery shelf (wired).

### T7 · Project 4 — Rattle & Block Toys (`apps/RattleAndBlocks.tsx`, id `toys`)
Intro: "i invented toys! some of them even work. go on, shake one."
Tabs: **Rattles · Blocks** now (games added in T13).
- **Rattles** (TOY-01): Star (`sfx.jingle`), Moon (`sfx.clack`), Bone (`sfx.shuffle`). Tap = one shake (wobble + star burst particles). Drag back and forth = continuous rattling (faster = more). Phones: optional "shake your phone" button (DeviceMotion; request permission on iOS; tapping always works). All three within 3 seconds → "a band!! we're a band!!" + giggle → `complete('toys')`.
- **Blocks**: 6 pastel blocks lettered P, I, P, Z, Z, Z on a floor grid. Drag to place (desktop) or tap-to-pick, tap-to-place (touch); snap to grid, stack in columns; "wobble" button knocks the tower softly. Spell **PIP** in a row → "that's ME!!" + sticker `toy-pip`. Spell **ZZZ** → Pip falls asleep for 5 s.

### T8 · Project 6 — Pip's Growth Chart (`apps/GrowthChart.tsx`, id `growth`)
Intro: "this is my growth chart! granny owl measures me every full moon."
- Tall wallpaper strip (GRW-01 or CSS) with a wooden ruler; little Pip stands at the bottom; the window scrolls **up** the wall; pencil marks **draw themselves in** (SVG stroke) as they enter view.
- Marks, bottom → top (skill · 5-star level · note):
  - 1 moon old · Lullaby composing ★★★★☆ · "learned to hum. haven't stopped."
  - 2 moons · Nightlight design ★★★☆☆ · "first lamp glowed! (one exploded into glitter)"
  - 3 moons · Dream delivery ★★★☆☆ · "flew in a mostly straight line"
  - 4 moons · Toy making ★★★★☆ · "invented the bone rattle"
  - 5 moons · Storytelling ★★★★☆ · "wrote my first book (about boo)"
  - 6 moons · **Junior Dream Engineer** 🏅 · "granny owl gave me a badge!!"
  - very top · Napping ★★★★★ · "expert. since birth."
  - scribbled at the very bottom · Being quiet ☆☆☆☆☆ · "still down here. sorry."
- Tap a mark → small card. Tap Pip → tiptoes toward the next mark + giggle. "Measure me!" → a ruler slides down: "pip is exactly 1 pip tall." All marks seen → `complete('growth')`.

### T9 · DEPLOY-READY CHECK (do NOT deploy)
- **Do not deploy and do not add any deploy workflow or hosting config.** Nayu will deploy herself on Vercel.
- Make sure a fresh clone works: `npm ci && npm run build` succeeds, and `npx vite preview` of `dist/` passes the full flow at all 3 sizes with an empty console.
- Make sure every asset path uses the `asset()` helper (so it works on any host).
- Under "For Nayu in the morning", write short Vercel steps: import the GitHub repo → framework preset **Vite** → build `npm run build` → output `dist` → Deploy (and where to add the optional Supabase env vars).

### T10 · Nursery reacts + Chaos polish + Sparkle trail
- Verify every progress reaction in the nursery works: lullaby → mobile sways faster and chimes; nightlights → room glows; routes → wall stars + window lights; secret → gold star badge on Pip; story → Pip asleep under starry ceiling; toys → blocks re-stack into PIP; bedtime → glowing book on shelf; growth → pencil mark on door frame; all stickers → rainbow "100% dreamy" banner.
- **Sparkle trail** (`components/SparkleTrail.tsx`, mounted in App): tiny gold stars/pink bows/dots; pooled DOM particles, max 20 alive, fade + fall 700 ms; off on touch devices (instead: small burst where you tap), off with reduced motion, toggle in Start → Settings (`sparkleOn` exists). Finale unlocks a special gold variant.
- **Chaos mode:** on breakpoint change, a 400 ms "rearranging furniture…" moment (already toasts) + Pip `whoa`. Landscape phone (height < 450px): Pip widget lies down ("comfy.") and DreamPad goes two-column.

### T11 · Guestbook + real hit counter
- `apps/DreamWishes.tsx` (id `wishes`): 2000s guestbook page: "sign pip's guestbook! ✨". Name ≤ 24, wish ≤ 140, pick a sticker (moon, star, boo, teddy, bow, lantern). Wall of pinned notes, newest first, 50 at a time + "load more". Honeypot field, simple word filter, 1 post / 60 s per browser. Pip: "a wish! for me?! *giggles*". Remember the name (`setVisitorName`).
- **Backend is OPTIONAL.** The site must be complete and great without one. Build the guestbook and counter on a small **storage adapter** (`lib/storage.ts`) with two modes:
  - **Local mode (default, no backend):** wishes and the counter are saved in localStorage. The wall is labelled honestly ("your wishes are saved on this device ✨"), and the odometer says "YOUR VISITS". Seed the wall with 3–4 messages from the cast (Boo, Nibbles, Fern, Granny Owl), clearly signed by them, so it never looks empty. **Never claim a local wall is live/shared.**
  - **Shared mode:** switches on automatically only if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist at build time. Then it uses Supabase (`@supabase/supabase-js`, lazy-imported so local mode doesn't pay for it). Nayu may or may not set this up; a live shared guestbook is worth +2 and a real counter +1 in the side quests, which is why the option exists.
  - Don't spend more than ~60 minutes on this task. Put the SQL below in `supabase/schema.sql` and add 5-step setup instructions under "For Nayu in the morning":
  ```sql
  create table guestbook_entries (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 24),
    message text not null check (char_length(message) between 1 and 140),
    sticker text not null check (sticker in ('moon','star','boo','teddy','bow','lantern')),
    created_at timestamptz default now()
  );
  alter table guestbook_entries enable row level security;
  create policy "read" on guestbook_entries for select using (true);
  create policy "write" on guestbook_entries for insert with check (true);

  create table site_stats (id int primary key, visits bigint not null default 0);
  insert into site_stats values (1, 1204) on conflict do nothing;
  create or replace function increment_visits() returns bigint
  language sql security definer as $$
    update site_stats set visits = visits + 1 where id = 1 returning visits;
  $$;
  grant execute on function increment_visits() to anon;
  ```
  (The 1204 starting value is a cute in-joke from the brief; mention it in the README so it isn't misleading, or start at 0. Your call; log it.)
- Counter: `lib/counter.ts` calls `increment_visits()` once per session (sessionStorage flag) when Supabase is configured → `shared: true` → odometer label "VISITORS". Otherwise it stays "YOUR VISITS".

### T12 · PipChat.exe (`apps/PipChat.tsx`, id `chat`)
- Early-2000s instant messenger look: buddy list with "Pip (online 🌙)", chat pane, "pip is typing…" (random 500–1200 ms), soft chime on message.
- Rule-based engine (`apps/pipchat/intents.ts`): keyword/regex intents → pool of Pip-voice replies → random pick; quick-reply chips. Intents: greeting, who are you, what's your job, favourite thing, scared, sing (plays 4 bars via `sfx.note`), tell a story (2–3 lines about Boo), goodnight (Pip goes "away" with an away message), joke, compliment, what can I do here (lists apps and offers to open them via `launch`), secrets (cryptic hint to a random un-found egg), name ("my name is X" → remember it), unknown fallback ("hmm i don't know that one. i'm only a baby. ask me about dreams?").
- Night mode + idle → away message "zzz… pip is napping. leave a message after the giggle."

### T13 · Toybox games (tabs inside Rattle & Blocks)
Each: one-line instructions, score, reset, keyboard + touch, sticker on success.
- **Stack the Dreams**: blocks DREAM · REST · WONDER · GLOW slide back and forth; tap/Space to drop; overhang trimmed; 4 stacked → clap + confetti; a misaligned tower wobbles and tumbles softly.
- **Match the Dream**: 4×3 face-down cards (stickers sheet: star, moon, music box/note, lantern, teddy, ghost) → flip to match pairs → a tiny bedtime message.
- **Dream Catch**: 20 s; stars and dream bubbles fall; move a basket (arrows / drag / tap sides); occasional grey sleepy sock = just a giggle, no penalty; 15+ → sticker.

### T14 · Desktop toys + remaining eggs
- **Error cascade:** the first time 4 windows are open at once → cute dialog `⚠ TOO MANY DREAMS DETECTED` [ok] [ok!!] [also ok] → 6 duplicates cascade with staggered springs (~2 s) → Pip "uh oh—" + `sneeze` + `sfx.sneeze` → dialogs snap away and windows re-tile neatly. Once per session, dismissible any time (Esc/click), never blocks.
- **Gravity.exe**: desktop icons drop, bounce, tilt and stack at the bottom (springs, no physics engine); floating "Gravity: OFF" restores. On DreamPad the grid items tumble.
- **Lantern.exe**: desktop goes dark; the cursor becomes Pip's lantern (CSS radial mask, ~120 px); 5 hidden glowing star doodles + 3 tiny secret messages; find all 5 → sticker; phones: drag a finger as the torch; a "lights on" button always visible.
- **Egg 1 full version:** opening `do_not_wake_pip.txt` triggers a 700 ms soft **dream-shift** (desktop layer duplicated with pink/lavender offsets, window titles scramble to ★ symbols, no strobing) → **Secret Dream Room** (`scene: 'secret'`, STY-06 art) with Pip's very first dream, confetti, gold badge, and a way back.
- **Egg 3:** teddy (NUR-05) in the nursery: tap 3× → note "Pip is actually very good at naps." + sticker.
- Make sure every egg awards a sticker and appears in `STICKERS`, with a hint.

### T15 · Polish, accessibility, performance, submission pack
- Keyboard-only run-through (Tab/Enter/Esc/arrows everywhere). Visible focus rings. Every image has alt text (decorative = `alt=""`). Contrast ≥ 4.5:1.
- Reduced motion (system setting + Start → Settings): every animation has a calm fallback.
- **Lighthouse ≥ 90** (performance, accessibility, best practices): WebP everywhere, lazy-load app windows and story/storybook images, preload nursery background + Pip, font `display=swap`, code-split heavy apps (already lazy), pause ambient loops when the tab is hidden.
- `public/og.png` (1200×630: Pip + "Pip's Midnight Nursery") and favicon (pixel Pip).
- Update `Credits.txt` with every real source (the image tool name: leave a TODO for Nayu if unknown).
- `README.md`: what it is, how to run, features list by rubric/tier/side-quest, Easter egg hint list (spoiler-tagged), credits, and a "Live URL: TODO (Nayu adds after deploying)" line.
- Draft the **"Story behind the build"** write-up (3–4 short paragraphs: the idea → proudest features → craft choices → Pip's sign-off) in `SUBMISSION.md`.
- Final full QA at 1440, 1024, 820, 390, landscape phone. Empty console on the local production build (`vite preview`).

---

## 6. How to test each task
- Use Playwright with the preinstalled Chromium if available (else `npx playwright install chromium`). Write the script in `tools/check.mjs` (committed): start `vite preview`, visit, run the flow for the task, collect `console` + `pageerror` events, save screenshots to `tools/shots/` (git-ignored).
- **Look at the screenshots** before committing. Fix overlaps, cut-off text, things off-screen on phones.
- Audio can't be heard headless; at least assert no errors are thrown when sounds are triggered.

---

## 7. Style guardrails (so it doesn't drift generic)
- It must feel like a cosy **90s/00s** web place: bevels, pixel fonts in the OS chrome, odometers, stickers, guestbook, start menu, playful error dialogs. Not a sleek modern landing page.
- Inside windows, content can be softer and illustrated, but window chrome stays DreamOS.
- Reuse `.btn98`, `.bevel`, `.bevel-in`, `.tabs98`/`.tab98`, the palette tokens and fonts. Don't introduce new fonts or a UI kit.
- Every new app: Pip intro line in `appHello` (exists), real content, a completion moment (`complete()` + Pip reaction + small sound), and it must work inside a desktop window, a tablet maximized window, and the DreamPad screen (test widths ~360–800px for app bodies).
- Keep each app in its own folder/file with its own CSS file. No giant files.

---

## 8. Progress Log (append as you go: newest at the bottom)

**Live URL:** _(Nayu deploys herself; Claude Code does not deploy)_

| Time (IST) | Task | Status | Notes / decisions |
|---|---|---|---|
| Sun 18 Oct 03:45 | Foundation | ✅ committed | Nursery, living Pip, CRT zoom, boot, DreamOS desktop, DreamPad, sound, My Pip, text files, stickers. Builds clean; **never opened in a browser yet** → T0. |
| Sun 18 Oct 06:45 | T0 run & fix | ✅ committed | Ran the whole flow headless at 1440×900, 820×1180, 390×844 **and 844×390** (landscape phone added — the brief's chaos-mode rule needs it). Console was already clean; real bugs found were a 404 favicon, touch targets under 44px (taskbar tray, nursery props) and the shelf overlapping the round window on phones. Added `src/lib/asset.ts` + `tools/check.mjs`. **Branch is `main`, not `master`** (that's what the repo actually has) — pushing to `main`. |
| Sun 18 Oct 07:10 | T1 art | ✅ committed | All 8 sheets identified and sliced: `tools/crops.json` (boxes) + `tools/process_art.py` (cut/green/grid/flat → WebP). **82 images, 2.17 MB total.** Decisions: (1) **NUR-01/NUR-02 do not exist** — no empty-nursery painting is in any sheet, so the CSS room stays (BATCH5's wide nursery is REF-01 with Pip and props baked in; not shipped). (2) Background removal is a **border flood-fill**, not rembg: Pip is cream and so are the sheets, so a plain colour threshold ate half of Pip. Two-stage key (tight flood, then a bounded fringe growth) gives clean edges with no extra dependencies. (3) **DreamPad frame: CSS kept.** DEV-01's green screen is only ~74%×41% of the frame — too squat for a tall phone — so we use the CSS shell, as the brief allows. (4) Wallpapers OS-01/OS-02 are low-res for a 1440px desktop (652px / 974px wide) but they're soft skies, so they upscale fine; a scrim was added so icon labels stay readable over them. (5) Icons: the drawn sheet slices cleanly and is now used; PixelIcon's hand-made SVGs stay as the fallback and still draw the UI toggles. |
| Sun 18 Oct 07:40 | T2 Lullaby Lab | ✅ committed | 8-step pentatonic sequencer, scheduled against the **audio clock** with a 150 ms lookahead so it never drifts (a new `clock()` in audio.ts falls back to the wall clock when audio is muted or not yet unlocked, so the visuals keep time either way). Wind the key 3× → box bounces open → the pattern appears as stars on two SVG orbit rings, and the playing step glows in both places. Presets: Pip's Hum, Twinkle, Boo's Brave Song, Random Dream (never more than 2 rests, always starts and ends on C). Keyboard: ←/→ move, ↑/↓ change the note. One full loop → `complete('lullaby')` + confetti. Added a generic `flags` map to the store (`lullaby:played`, `light:order`) — egg 4 watches those two and unlocks **Pip's Secret Song** + sticker. `tools/check.mjs` now opens, pokes and screenshots each project app at every viewport. |
| Sun 18 Oct 08:05 | T3 Nightlights | ✅ committed | Three drawn lamps on a dark shelf, each with a card naming the creature it was made for (portraits from PRJ-03). Cloudberry breathes on a 6 s loop; Starling throws twinkling stars onto the shelf wall; three swatches per lamp. **"Lights out" is a scrim, not a `filter`** — a filter on the panel composes with its children and would dim the lit lamps too, which is the one thing it must not do; the scrim sits above everything and a lit lamp rises above it. All three on → `complete('nightlights')`. Order Moonbeam→Cloudberry→Starling reveals the **Dream Lantern** (+sticker); the order is also written to `light:order` for the Lullaby Lab's egg 4 (which wants Moonbeam→Starling→Cloudberry). |
| Sun 18 Oct 08:35 | T4 Dream Routes | ✅ committed | The painted rooftop map (PRJ-02) with hotspots placed by measuring the art — the nursery is the pink house bottom-left, not the corner. Tap a rooftop → the creature's card and the dream they ordered → **Deliver** draws a dotted arc with `stroke-dashoffset` while Pip (PIP-06) flies along it, sampled from `getPointAtLength` each frame (the SVG is `viewBox="0 0 100 100"` with `preserveAspectRatio="none"`, so a point on the path is already a % of the map and the drawn Pip can ride the same coordinates). Stamps land in the Delivery Log; all three join into a constellation → `complete('routes')`. **On phones the map is a pannable strip** — 1179×438 squeezed into 330px is barely taller than one 44px marker — so it keeps a usable size and you slide it. `tools/check.mjs` skips `[data-pannable]` subtrees in its off-screen check. |
| Sun 18 Oct 09:20 | T5 Story + Finale | ✅ committed | Five scroll-snapped chapters (STY-01..05), IntersectionObserver for the active one, a 5-star progress bar that doubles as chapter nav, Prev/Next, arrow keys and swipe. Each chapter has its small interaction; **chapter 4's flight path is drawn by the scroll itself** (`pathLength={1}` + `strokeDashoffset = 1 - t`, windows lighting one by one as it passes). New `scenes/Finale.tsx`: Pip fades out as a 12-star constellation drifts up and links itself, the delivery constellation joins when routes are done, then a star comes loose and sets the `cursor:gold` flag for T10's sparkle trail. **Skip is instant** (`.is-skipped` zeroes the staggered delays) — a skip that still makes you wait isn't one. "Walk me home" → the nursery in its bedtime state: Pip asleep, starry ceiling, lamps low. Also stopped the global idle timer from startling the tucked-in Pip awake. Touch targets: window chrome keeps its Win98 size but pushes its hit area to 44px with an `::after`, and the checker now understands that. |

**For Nayu in the morning:** _(list anything that needs her: Vercel connect, Pages setting, Supabase keys + SQL, image tool name for credits, images that were rejected)_
