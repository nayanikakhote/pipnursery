# Pip's Midnight Nursery 🌙

> "oh! hi!! you found my room." — Pip

A portfolio site for **Pip**, a skull baby who works the night shift as Junior Dream
Engineer at the Midnight Nursery. You land in Pip's room at night. Pip notices you.
On the desk is a chunky pastel CRT — click it, and the camera zooms into the screen,
**DreamOS 98** boots, and you're inside Pip's actual workspace, where his six
projects are apps on a Windows-98-shaped desktop.

Finishing things changes the nursery. The two worlds leak into each other.

**Live URL:** _TODO — Nayu adds this after deploying._

Built for **haX.baby · Baby's First Website**, Track 1, 17–19 October 2026.

---

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview   # the production build
npm run lint                        # oxlint + a CSS class-collision check
```

### The browser test harness

```bash
npx playwright@1.64.1 install chromium   # once
npm run build && node tools/check.mjs
```

It drives the whole flow at **six viewports** (1440×900, 820×1180, 390×844, plus
landscape phones and a landscape DreamPad), opens and pokes every app, and fails on
any console error, page error, failed request, layout overflow, sub-44px touch target
or text below WCAG AA contrast. Screenshots land in `tools/shots/` — look at them.

### The art pipeline

All the art arrived as eight collage sheets. The crops are committed, so it's
reproducible:

```bash
pip install Pillow numpy scipy
python tools/process_art.py --contact
```

`tools/crops.json` holds every piece's box and mode; `tools/process_art.py` crops,
keys out backgrounds, slices sprite sheets, and writes `src/content/art.gen.ts` —
which only ever lists files that really exist, so anything missing falls back to a
hand-built CSS version and the site still works.

---

## What's in it

### The six projects (Pip's "work")

| | |
|---|---|
| **Lullaby.exe** | An 8-step pentatonic sequencer scheduled against the AudioContext clock, with the melody orbiting the music box as stars. Four presets, including one you have to earn. |
| **Nightlights/** | Three lamps, one per creature's particular fear. Cloudberry breathes on a 6s loop; Starling throws stars on the wall. A fourth lamp is hidden in the order you light them. |
| **Dream_Routes.map** | Deliver tonight's dreams across a painted rooftop map. Routes draw themselves and Pip flies along them, sampled from the SVG path each frame. |
| **Rattle_&_Blocks/** | Three rattles you can shake, drag or (on a phone) actually shake the phone for. Six blocks that spell two things. Plus three small games. |
| **Bedtime_Story.book** | *Boo and the Borrowed Moon* — a hardcover that opens, with six crayon pages that turn in 3D. |
| **Growth_Chart.png** | A tall wall you scroll up, pencil marks drawing themselves in as they arrive. |

### And everywhere else

- **My_Story.doc** — five scroll-snapped chapters; chapter four's flight path is drawn by your scrolling. It ends in a finale where Pip becomes a constellation.
- **PipChat.exe** — a rule-based Pip who remembers your name, sings, tells Boo's story and gives you one clue at a time.
- **Dream Wishes** — a 2000s guestbook. Works with no backend at all (and says so honestly); becomes shared if Supabase is configured.
- **Gravity.exe**, **Lantern.exe**, a sticker album, lost socks, and Pip's private dev notes.

### Rubric notes

**Functionality & polish (35%)** — clean console at six viewports on the production
build, verified automatically. Every touch target ≥44px. Every interaction works with
mouse, touch and keyboard.

**Early-web soul (30%)** — a real Win98 window manager (drag, min/max, z-order,
taskbar, Start menu), a boot sequence, an odometer hit counter, a pinned-note
guestbook, playful error dialogs, pixel fonts in the chrome.

**Creativity & surprises (20%)** — thirteen easter eggs, three toybox games, a
lantern that turns the desktop dark, a gravity switch, and a dream-shift into a
hidden room.

**Clean craft (15%)** — every app in its own file with its own stylesheet, a typed
store, a reproducible art pipeline, and a test harness that has caught several real
bugs (a 1.08:1 contrast failure, a CSS class collision, a dialog that never left).

### Tiers & side quests

Tier 1: eyes follow the cursor (with a touch fallback), scroll-driven story, day/night
toggle that changes the palette *and* Pip's expression, responsive, easter eggs.
Tier 2: Web Audio lullaby synth, flashlight cursor, SVG route drawn on scroll,
page-flip storybook, mini-games. Tier 3: guestbook, visitor memory, rule-based chat.
Side quests: guestbook, sparkle cursor trail, hit counter odometer, click sounds +
mute, responsive chaos mode.

---

## Easter eggs

<details>
<summary><b>Spoilers — thirteen things to find</b></summary>

1. **Boop Pip five times** in his room.
2. **Five tiny stars** hidden around the nursery — find them all for a constellation.
3. **Squeeze the teddy** three times.
4. **↑ ↑ ↓ ↓ ← → ← → B A**, or tap the taskbar clock seven times.
5. **Read Pip's private dev notes.**
6. **Shut Down** from the Start menu, then wake him.
7. **Light the nightlights** Moonbeam → Cloudberry → Starling for a fourth lamp.
8. **Play a whole lullaby, then** light them Moonbeam → Starling → Cloudberry for Pip's Secret Song.
9. **Spell PIP** with the blocks. (ZZZ does something else.)
10. **Open four windows at once.**
11. **Lantern.exe** — five stars and three notes are hidden on the wallpaper in the dark.
12. **Gravity.exe.**
13. **do_not_wake_pip.txt**, which only appears once you've found egg 1.

Plus a sticker for each of the three games, the guestbook, PipChat, and reading the
story to the end — and a rainbow banner if you find *everything*.

</details>

---

## Optional: a shared guestbook and a real hit counter

The site is complete without this. In local mode the guestbook saves to your own
browser and says so in as many words, and the odometer counts *your* visits, labelled
"YOUR VISITS". **A local wall is never described as live or shared.**

To make it shared:

1. Create a project at [supabase.com](https://supabase.com) (the free tier is plenty).
2. Open **SQL Editor** and run the whole of [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy the *Project URL* and the *anon public* key.
4. Add them to your host as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   (on Vercel: Settings → Environment Variables).
5. Redeploy. The guestbook becomes shared and the odometer switches to "VISITORS"
   on its own — no code change.

The counter starts at **0**, not at a seeded number, so what it shows is true.

---

## Credits

Pip and the official renders are © haX.baby (Track 1 creator asset pack). Every other
illustration was AI-generated for this project and cut out by `tools/process_art.py`.
Every sound is synthesized live with the Web Audio API — there are no audio files in
this repo. Fonts are Fraunces, Fredoka, Pixelify Sans and VT323 from Google Fonts.

Full details, including the image tool, are in `Credits.txt` — readable in the site
itself, on Pip's desktop.
