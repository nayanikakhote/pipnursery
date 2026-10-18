# Pip's Midnight Nursery — demo walkthrough

A shot-by-shot script for recording the submission video.

Everything here was read off the code in `src/`, not off the plan, because
several details changed during the build. Where the code and `CLAUDE.md`
disagree, this file follows the code.

**Live site:** <https://pipnursery.vercel.app/>

---

## 0. Before you press record

| | |
|---|---|
| **Window size** | 1440 × 900. Record the browser window, not the whole screen. |
| **Browser zoom** | 100% (`Ctrl/Cmd + 0`). The layout is aspect-ratio driven; zoom changes which layout you get. |
| **Sound** | On. Nothing plays until your first click — that's deliberate, so click something early. |
| **Chrome** | Hide the bookmarks bar (`Ctrl/Cmd + Shift + B`), disable extensions, close other tabs. Use a clean profile or a guest window if you can. |
| **Where** | The live Vercel URL, so the address bar reads `pipnursery.vercel.app`. |

### Reset to a true first visit

Pip remembers you. For the first-visit greeting and the full boot sequence you
need a genuinely fresh browser state. In DevTools Console on the site:

```js
localStorage.clear(); sessionStorage.clear(); location.reload();
```

Or: DevTools → Application → Storage → **Clear site data**.

> ### ⚠️ Do NOT use Start → "Forget me" to reset
>
> `forgetMe()` in `src/store/dreamStore.ts` wipes `badges`, `progress`,
> `flags` and `secretUnlocked` — **it deletes every sticker you have earned.**
> It is a feature for visitors, not a recording tool. Film it if you like
> (it's a nice touch), but only *after* the final sticker-book shot.

### What a reset costs you

A reset is only safe **before step 1**. After that it would wipe stickers.
Everything in the Full route is reachable in one unbroken session, so you
should never need a second reset.

---

## 1. Recording order, and why

Three kinds of thing constrain the order:

**Once-only.** The first-visit greeting (`lines.firstHello`) and the slow boot
only happen on a fresh profile — on a return visit Pip says
`lines.returning(n)` instead and the boot runs at roughly 2.5× speed
(`Boot.tsx` uses `fast = visits > 1`). Film both in the first 90 seconds.

**Once per desktop.** The error cascade fires the first time four windows are
open at once (`ErrorCascade.tsx`). Its `fired` flag is component state, so it
re-arms if you go to the nursery and come back — but film it the first time
anyway.

**Permanent changes.** Finishing **My_Story.doc** runs the finale, which sets
`progress.story`. After that Pip is **asleep in his room for the rest of the
session** and the nursery gets its starry ceiling. So film every nursery
interaction that needs an awake Pip *before* the story. The story is step 23
for exactly this reason.

**Unlock chains.** Two are order-dependent and must be done in this sequence:

1. Play a full lullaby (sets `lullaby:played`) …
2. … then light the lamps **Moonbeam → Cloudberry → Starling** → Dream Lantern
3. … then light them **Moonbeam → Starling → Cloudberry** → Pip's Secret Song

The two lamp orders are different and both are checked against the *last three*
lamps switched on, so you can do them one after the other in the same window —
just switch all three off in between.

---

## 2. The shots

Durations are suggestions; total for the Full route is at the bottom.

### Act I — the nursery (fresh profile)

**1 · Landing — 8s** · *core, Tier 1*
Load the site. Don't move the mouse for a beat. At 0.9s Pip says
**"oh! hi!! you found my room. 🌙"**. Then move the cursor in a slow arc across
the room — **Pip's eyes follow it**, and so does the gold sparkle trail.
→ *shows: painted room, living eyes, sparkle trail side-quest*

**2 · The computer hint — 4s** · *core*
Wait. At 7s Pip says **"psst… click my computer! ✨"** and the CRT screen starts
pulsing. Don't click yet.

**3 · Boop Pip ×5 → first egg — 12s** · 🏅 `egg-secret`
Click Pip five times. He giggles each time; on the 3rd and 4th he teases
(**"you keep booping me…"**, **"one more and something happens!"**), and on the
5th: confetti, a sparkle, **"oh no. you found my secret file. promise not to
wake me?"** A gold ★ badge appears on his cap, and
**`do_not_wake_pip.txt` now exists on the desktop.**
→ *Tier 1 easter egg*

**4 · The teddy — 6s** · 🏅 `egg-teddy`
Click the teddy on the rug **three times**. Third click: sparkle +
**"Pip is actually very good at naps."**

**5 · The five hidden stars — 20s** · 🏅 `egg-constellation`
Five of the little gold stars painted on the wall are real buttons. At
1440×900 they are at roughly:

| | across | down |
|---|---|---|
| 1 | 24.5% | 39% (left wall, below the shelves) |
| 2 | 26.3% | 5.5% (top left, beside the curtain) |
| 3 | 75.6% | 7.8% (top right) |
| 4 | 79% | 44.5% (right wall, below the curtain) |
| 5 | 94% | 33% (the big star beside the door) |

Each plays a rising note. On the fifth: **"you found all my hidden stars!! look
up!"** and a PIP constellation draws itself.
*Filming tip: sweep slowly — the cursor turns into a pointer over each one.*

**6 · The other props — 12s** · *core*
Click, in order: the **music box** on the chest of drawers (plays a tune and
bounces), the **lantern** on the rug (glows), the **toy blocks** (clatter), the
**hanging mobile** (chimes and sways), and the **round window** (a shooting
star crosses it).

**7 · Idle → yawn → sleep → wake — 30s** · *Tier 1*
Stop touching anything. At **20s** Pip yawns and says
**"*yawn*… still there? it's very quiet… i don't like quiet."** At **45s** he
falls asleep with Zzz. Move the mouse: he startles awake with
**"oh! i was just resting my eye sockets."**
*This is the longest dead-air shot in the video — consider speeding it up 4× in
the edit, or cutting from the yawn straight to the wake.*

**8 · Day/night toggle — 8s** · *Tier 1, core*
Top right, click the sun icon. The whole room washes peach, **the sky inside
the window turns light blue-and-gold**, and **Pip's eyes open wide** (at night
they're half-lidded). He says **"good morning! the sun is visiting."** Toggle
back: **"time for dreams…"**
→ *Tier 1: palette **and** expression change*

**9 · Mute toggle — 6s** · *side quest*
Click the speaker. Pip puts on **earmuffs**, pouts, and says
**"…okay. i'll be quiet. *puts on earmuffs*"**. Unmute: he giggles,
**"yay, noises!"**
→ *side quest: click sounds + mute*

**10 · Into the computer — 8s** · *core, Tier 2*
Click the CRT. The camera **zooms into the screen itself** (the transform
origin is the glass, measured at runtime), then **DreamOS 98 boots**: ten moons
fill, lines print, a four-note chime. Let it run — this is the full-speed boot
you only get once.

### Act II — the desktop

**11 · The desktop — 10s** · *30% early-web soul*
Pan across: the painted wallpaper, three columns of drawn icons, the dashed
**"my work ✨"** group, the taskbar with the **odometer** ("YOUR VISITS"), the
★ sticker count, theme and mute, and a live clock.

**12 · Window chrome — 15s** · *core*
Double-click **My Pip**. Drag it by the title bar. Minimise, restore from the
taskbar, maximise, restore, close with ✕. Open it again and press **Esc**.

**13 · Error cascade — 10s** · 🏅 `egg-cascade`
Open **four** windows at once (My Pip, Stickers, Credits.txt, Lost Socks).
`⚠ TOO MANY DREAMS DETECTED` cascades in six times with **[ok] [ok!!] [also
ok]**, Pip **sneezes** — **"uh oh—"** — and the windows re-tile themselves.
Press Esc or click any button to dismiss early. Close everything after.

**14 · Start menu — 8s** · *early-web soul*
Click **Start**. Walk down it with the **arrow keys** to show keyboard nav:
the work apps, My Pip, My_Story.doc, PipChat, the guestbook, then Settings
(Reduce motion / Sparkle trail / Forget me), then Go to bed and Shut Down.
Press **Esc** to close. **Don't click Forget me.**

### Act III — the six projects

**15 · Lullaby.exe — 40s** · 🏅 `project-lullaby` · *Tier 2*
Open it. Click the gold **winding key three times** — it turns a third each
time. The box bounces open and the melody rises into two **orbiting star
rings**. Click a few step buttons to change notes, then **▶ play**. The playing
step glows in the grid *and* on the ring. Let it finish one full loop:
confetti + **"a lullaby!! the frogs will love it."**
Then click **Twinkle** and **Random Dream 🎲** to show the presets.
**Leave this app's unlock in place — you need it for step 17.**
→ *Tier 2: Web Audio lullaby synth*

**16 · Nightlights — 35s** · 🏅 `project-nightlights` 🏅 `egg-lantern`
Open it. Tap each lamp **in this exact order: Moonbeam → Cloudberry →
Starling.** Narrate as you go:
- Moonbeam, for Boo — *"a ghost scared of the dark! so i gave him his own little moon."*
- Cloudberry, for Fern — watch it **breathe on a slow 6-second loop**
- Starling, for Nibbles — it **throws stars on the wall** behind the shelf

All three on → **"every one of them has a light now. look how warm my room
got!"**. Because the order was right, a **fourth lamp appears: the Dream
Lantern** — *"this one isn't for being scared. it's for finding your way
back."*
Now click **☀ lights out** — the panel goes dark and only the lit lamps glow.
Click a colour swatch or two.

**17 · The secret song — 20s** · 🏅 `egg-secretsong`
Still in Nightlights: switch **all three lamps off**, then light them
**Moonbeam → Starling → Cloudberry**. Go back to **Lullaby.exe**: a new preset
**"Pip's Secret Song"** has appeared, and Pip says
**"…how did you know the order? that one is MY song."** Play it.
→ *the deepest unlock chain in the site*

**18 · Dream_Routes.map — 35s** · 🏅 `project-routes` · *Tier 2*
Open it. Click **The Crooked Chimney** → Boo's card and his dream ("a sky full
of friendly moons") → **Deliver**. A **dotted route draws itself** across the
painted rooftops and **Pip flies along it** with his lantern; the roof lights
gold and a stamp lands in the Delivery Log. Repeat for **The Willow Treehouse**
(Nibbles) and **The Lilypad Pond** (Fern). On the third the routes join into a
**constellation** — **"all delivered! look — the routes made a constellation."**
→ *Tier 2: SVG route drawn on scroll/action*

**19 · Rattle & Blocks — 60s** · 🏅 `project-toys` 🏅 `toy-pip` 🏅 `game-stack` 🏅 `game-match` 🏅 `game-catch`
Five tabs.

- **Rattles** — tap each one (star jingles, moon clacks, bone shuffles), then
  **drag one side to side** to rattle it continuously. Then tap **all three
  within three seconds**: **"a band!! we're a band!!"** 🏅 `project-toys`
- **Blocks** — tap a block, tap a column. Spell **P-I-P** along one row:
  **"that's ME!! you spelled me!"** 🏅 `toy-pip`. Then spell **Z-Z-Z**: Pip
  falls asleep for five seconds. Press **wobble it** to knock the top block off.
- **Stack the Dreams** — Start, then tap to drop each slab. The overhang is
  trimmed each time. Land all four: confetti 🏅 `game-stack`
- **Match the Dream** — flip the 4×3 grid until all six pairs are found. A
  bedtime line appears 🏅 `game-match`
- **Dream Catch** — Start, then drag the basket (or use ← →). Catch **15+** in
  20 seconds 🏅 `game-catch`. Grey socks are a giggle, never a penalty.

**20 · Bedtime_Story.book — 40s** · 🏅 `project-bedtime`
Open it. **"open it →"**, then turn through all six pages — show the **3D page
turn from the spine**. On each page tap the thing that reacts: Boo shivers, the
moon gets hugged, the owls **bonk twice**, the lamp flickers, the little moon
warms the whole page, the sky twinkles on. Reach **"the end"**:
**"did you like it?? i'm going to write a sequel."**
→ *Tier 2: page-flip storybook*

**21 · Growth_Chart.png — 30s** · 🏅 `project-growth`
Open it. It starts at the floor with little Pip standing there. **Scroll up**
slowly — each pencil mark **draws itself in** as it arrives and its card fades
up. Read all eight, bottom to top, ending on *Napping ★★★★★ "expert. since
birth."* → **"you read every single one! i am 1 whole pip tall."**
Click **measure me!** (a tape drops: *"pip is exactly 1 pip tall."*) and tap
Pip to make him **tiptoe** to the next mark.

**22 · My Pip — 12s** · *core: what Pip is*
Open **My Pip**. Show the laminated **employee ID card** with the official
portrait, the About me tab, and the "my work ✨" links with ★ on everything
you've finished.

### Act IV — the story and the finale

> From here on Pip will be asleep in the nursery. Everything in Act I that
> needed him awake is already filmed.

**23 · My_Story.doc — 60s** · 🏅 `project-story` 🏅 `egg-constellation-pip` · *core, Tier 1 + 2*
Open it. **Scroll** (don't use the buttons — the point is that it's
scroll-driven). Five chapters, each snapping into place, text rising in:

1. **A Cloud That Hummed** — tap the cloud, stars trail from it
2. **The Silence Problem** — wind the box, four notes play
3. **The Little Inventor** — tap the inventions, each **poofs into glitter**
4. **The First Delivery** — ⭐ **scroll slowly here.** The flight path across
   the rooftops is **drawn by your scrolling**, and the windows light one by
   one as it passes. This is the single best Tier 2 shot in the site.
5. **Goodnight, Little World** — tap the **pulsing star** top-right

**24 · The finale — 30s** · *core*
The screen dims to deep navy. Pip fades out as **twelve gold stars drift up and
link themselves into his shape**. Because you delivered the dreams in step 18,
**your delivery constellation joins the sky beside him** in lavender, with
*"(your delivery routes are up there too.)"* Then
**"goodnight, little world."**, one star comes loose —
*"one star came loose. you can keep it. ✨"* — and **the sparkle trail turns
gold for the rest of the session.** Click **walk me home →**.

**25 · The sleeping nursery — 15s** · *core: the worlds leak*
You land back in the room and it has changed: **Pip is asleep on his cloud**,
**stars are spread across the upper wall**, a **small glowing book** (the one he
wrote) stands on the painted shelf, and a **pencil mark** is on the door frame
from the growth chart. Move the cursor — the trail is **gold** now. Tap Pip:
*"mmh… five more minutes…"*

### Act V — the rest of DreamOS

Go back in through the CRT (the boot is fast now — that's correct, it's
`visits > 1`).

**26 · Dream Wishes — 25s** · 🏅 `egg-wished` · *side quest*
Open the guestbook. Point out the honest label: **"your wishes are saved on
this device ✨ (nobody else can see them)"** — it only claims to be shared if a
backend is configured. The wall is seeded with notes from **Boo, Nibbles, Fern
and Granny Owl**, each signed. Type a name and a wish, pick a sticker, **pin it
to the wall**. Pip: **"a wish! for me?! *giggles* thank you \<name\>."**
> **One post per 60 seconds per browser.** If you need a second take, wait a
> minute or the form will say *"one wish at a time! try again in Ns."*

**27 · PipChat.exe — 40s** · 🏅 `egg-chatted` · *Tier 3*
Open it. Buddy list shows **Pip (online 🌙)**, Granny Owl, Boo. Type these, in
order, waiting for the "Pip is typing…" each time:

| Type | What you get |
|---|---|
| `hi pip!` | a greeting |
| `my name is Nayu` | **"Nayu! okay. i wrote it on my hand so i don't forget."** — and he uses it from now on, everywhere |
| `what do you do?` | the Junior Dream Engineer answer |
| `sing something` | **he actually plays four bars** through the audio engine |
| `what do you eat?` | *"i am mostly bones and enthusiasm."* |
| `any secrets?` | **a cryptic hint for a random egg you have not found yet** — read live from the sticker list |
| `goodnight` | he goes **away** with the away message |

**28 · Gravity.exe — 12s** · 🏅 `egg-gravity`
Open it, click **Gravity: OFF**. Every desktop icon **falls, bounces and settles
at an angle**. Pip: **"uh oh. who turned on gravity?!"** Click again to put
everything back. *(Closing the window also turns it off.)*

**29 · Lantern.exe — 25s** · 🏅 `egg-lantern-stars`
Open it, click **☾ lights out**. The desktop goes dark and **the cursor becomes
Pip's lantern**. Sweep around: find the **five hidden stars** and tap each, and
tap one of the **three pencil notes** (*"granny owl says the dark is just the
room resting."*). All five stars → **"all five!! i thought those were very well
hidden."** Click **☀ lights on**.
→ *Tier 2: flashlight cursor*

**30 · PIP_DEV_NOTES.txt — 8s** · 🏅 `egg-devnotes`
Open it. The sticker is awarded the moment it opens. Read a line or two aloud —
*"TODO: stop adding stars."*

**31 · do_not_wake_pip.txt → the Secret Dream Room — 25s** · 🏅 `egg-secretfile`
This icon only exists because of step 3. Open it. **It does not open a window.**
The desktop **folds sideways for 700ms** — colours offset into pink and
lavender, window titles scramble to ★, nothing strobes — and you arrive in the
**Secret Dream Room**: a tiny bedroom floating in a bubble, with confetti, a
gold badge, and Pip's first dream told four lines at a time. Click
**← tiptoe back out**.

**32 · Konami code — 8s** · 🏅 `egg-giggle`
Anywhere, type **↑ ↑ ↓ ↓ ← → ← → B A**. Giggle storm: everything wobbles,
confetti, **"GIGGLE STORM!!! hehehehe"**.
*Alternative trigger for the same sticker: tap the taskbar clock **7 times** in
3 seconds.*

**33 · Console greeting — 6s** · *bonus egg*
Open DevTools Console (`F12`) and scroll to the top: an **ASCII Pip** says hi
and hints at the Konami code. Close DevTools.

**34 · Shut Down — 12s** · 🏅 `egg-shutdown`
**Start → Shut Down…** → *"It is now safe to fall asleep."* with Pip curled up.
Click to wake him.

### Act VI — responsive chaos, access, and the finish

**35 · Live resize — 20s** · *side quest: responsive chaos mode*
With the desktop open, **drag the window narrower** across the breakpoints.
Each crossing: a toast (**"squishing the windows…"**, **"packing DreamOS into
my DreamPad…"**) and Pip says **"whoa, the room is moving!"**
- **≥1024px** → full desktop, draggable windows
- **640–1023px** → tablet: **windows maximise** and get a ◀ back arrow
- **<640px** → **DreamPad**: the whole OS becomes a pastel handheld

*How to film it:* resize the real browser window for the toast and Pip's
reaction (DevTools device mode doesn't fire it the same way), then switch to
DevTools device mode (`Ctrl/Cmd + Shift + M`) for clean device frames.

**36 · DreamPad — 25s** · *core: mobile layout*
At 390×844: the handheld shell, the status bar with the odometer and ★ count,
**"about me 🌙"** at the top with My_Story.doc and My Pip, then "my work ✨",
then everything else. Open an app — it **slides in** with a ◀ back bar. Use the
**hardware buttons** along the bottom: back, home, ★ stickers, theme, mute.
Also show the **portrait nursery** — it's a different painting, with Pip big and
central on the rug.

**37 · Landscape phone — 10s** · *side quest*
Rotate to 844×390. **Pip lies down** on his cloud and says **"oh! lying down.
comfy."** At 620×380 the DreamPad home goes **two columns**.

**38 · Reduced motion — 10s** · *15% clean craft*
**Start → Reduce motion**. Re-open the storybook: the page **crossfades**
instead of turning in 3D. Open My_Story: it jumps between chapters instead of
smooth-scrolling. The sparkle trail is off. Turn it back on.

**39 · Keyboard only — 10s** · *15% clean craft*
Hands off the mouse. **Tab** through the desktop icons — every one takes a
**gold focus ring** — **Enter** to open one, **Esc** to close, **Tab** to the
Start button, **arrow keys** down the menu, **Esc** out.

**40 · FINAL SHOT — the sticker book — 20s** 🏁
Open **Stickers** from the taskbar tray (the ★ count). Scroll the album: every
one of the **26** stickers is filled in, **26/26 collected**. Then go to the
nursery (**Start → Go to bed**) and hold on the **"★ 100% DREAMY ★ you found
everything ★ pip is SO proud ★"** rainbow marquee scrolling across the top of
the sleeping room.

*Last line, if you want one:* **"goodnight, little world."**

---

## 3. Two routes

### SHORT CUT — about 3 minutes

For maximum rubric points per second. Skips the full sticker run.

| | Shot | s |
|---|---|---|
| 1 | Landing, greeting, eyes following, sparkle trail | 10 |
| 2 | Boop Pip ×5 → egg + gold badge | 10 |
| 3 | Day/night toggle (palette **and** expression) | 8 |
| 4 | CRT zoom + full boot | 10 |
| 5 | Desktop sweep: icons, taskbar, odometer | 8 |
| 6 | Lullaby.exe: wind, orbit rings, play a loop | 25 |
| 7 | Nightlights: all three + Dream Lantern + lights out | 20 |
| 8 | Dream Routes: one delivery, route drawing, Pip flying | 15 |
| 9 | Storybook: two 3D page turns | 10 |
| 10 | My_Story ch.4 **scroll-synced route**, then the finale | 25 |
| 11 | Sleeping nursery + gold trail | 8 |
| 12 | Error cascade | 8 |
| 13 | Lantern.exe flashlight cursor | 10 |
| 14 | Live resize → tablet → DreamPad | 15 |
| 15 | Sticker album (partial is fine) | 8 |
| | **≈ 3 min 10 s** | |

### FULL — about 11 minutes raw

All 40 shots above, in order, ending on the full sticker book.
Raw total is roughly **11 minutes**; cutting the idle wait in step 7 and
tightening the games in step 19 brings it to a comfortable **7–8 minutes**.

---

## 4. Cheat sheet — every easter egg

| # | Egg | Exact trigger | Sticker |
|---|---|---|---|
| 1 | Tickle champion | Click Pip **5 times** in the nursery | `egg-secret` |
| 2 | Star finder | Find all **5 hidden stars** painted on the nursery wall | `egg-constellation` |
| 3 | Teddy whisperer | Click the teddy **3 times** | `egg-teddy` |
| 4 | Giggle storm | **↑ ↑ ↓ ↓ ← → ← → B A**, or tap the taskbar clock **7×** in 3s | `egg-giggle` |
| 5 | Snoop | Open **PIP_DEV_NOTES.txt** | `egg-devnotes` |
| 6 | Night night | **Start → Shut Down…** | `egg-shutdown` |
| 7 | Dream Lantern | Light the lamps **Moonbeam → Cloudberry → Starling** | `egg-lantern` |
| 8 | Secret song | Play a full lullaby, **then** light them **Moonbeam → Starling → Cloudberry** | `egg-secretsong` |
| 9 | P-I-P | Spell **PIP** with the blocks (**ZZZ** naps Pip, no sticker) | `toy-pip` |
| 10 | Too many dreams | Have **4 windows** open at once | `egg-cascade` |
| 11 | Night vision | **Lantern.exe** → lights out → find all **5** wallpaper stars | `egg-lantern-stars` |
| 12 | Gravity tester | **Gravity.exe** → Gravity: OFF | `egg-gravity` |
| 13 | First dream | Open **do_not_wake_pip.txt** (needs egg 1 first) | `egg-secretfile` |
| 14 | A star of your own | Finish **My_Story.doc** → the finale | `egg-constellation-pip` |
| 15 | Pen pal | Send any message in **PipChat** | `egg-chatted` |
| 16 | Wish granter | Pin a wish in the **guestbook** | `egg-wished` |
| — | Console hello | Open DevTools Console | *(no sticker)* |

---

## 5. Sticker checklist — tick while recording

All **26**, in route order. The step number is where you earn it.

| ✓ | Step | Sticker | Earned by |
|---|---|---|---|
| ☐ | 3 | **Tickle champion** | 5 clicks on Pip |
| ☐ | 4 | **Teddy whisperer** | 3 squeezes of the teddy |
| ☐ | 5 | **Star finder** | all 5 hidden nursery stars |
| ☐ | 13 | **Too many dreams** | 4 windows open at once |
| ☐ | 15 | **Lullaby maker** | one full playthrough |
| ☐ | 16 | **Light bringer** | all three lamps on |
| ☐ | 16 | **Dream Lantern** | lamps in Moonbeam → Cloudberry → Starling |
| ☐ | 17 | **Secret song** | lullaby played, then M → S → C |
| ☐ | 18 | **Dream courier** | all three dreams delivered |
| ☐ | 19 | **Toy tester** | all three rattles within 3 seconds |
| ☐ | 19 | **P-I-P** | spell PIP with the blocks |
| ☐ | 19 | **Tower builder** | stack all four dreams |
| ☐ | 19 | **Good memory** | all six pairs matched |
| ☐ | 19 | **Butterfingers no more** | catch 15+ in 20 seconds |
| ☐ | 20 | **Story listener** | reach "the end" of the storybook |
| ☐ | 21 | **Measurer** | read all eight pencil marks |
| ☐ | 23 | **Pip historian** | finish My_Story.doc |
| ☐ | 24 | **A star of your own** | the finale |
| ☐ | 26 | **Wish granter** | pin a wish |
| ☐ | 27 | **Pen pal** | message Pip |
| ☐ | 28 | **Gravity tester** | Gravity.exe |
| ☐ | 29 | **Night vision** | 5 stars under the lantern |
| ☐ | 30 | **Snoop** | open the dev notes |
| ☐ | 31 | **First dream** | open do_not_wake_pip.txt |
| ☐ | 32 | **Giggle storm** | Konami, or 7 clock taps |
| ☐ | 34 | **Night night** | Shut Down |

**Total: 26 / 26** → the **100% DREAMY** banner appears in the nursery.

### The four that need care on camera

Everything is reachable on a laptop, but four deserve a plan:

1. **Butterfingers no more** (`game-catch`) — needs **15 catches in 20
   seconds**, and what falls is random. Expect two or three attempts. Use the
   **← →** arrow keys rather than dragging; it's noticeably easier. Film one
   clean win.
2. **Toy tester** (`project-toys`) — all **three rattles within 3 seconds**.
   Tap them left-to-right quickly, don't drag. If it doesn't fire, just tap all
   three again.
3. **Wish granter** (`egg-wished`) — the guestbook allows **one post per 60
   seconds**. If you re-take, wait a minute. (The shake-your-phone rattle
   control is the one feature that genuinely needs a real phone — it's
   DeviceMotion. It earns no sticker, so skip it on a laptop, or film it
   separately on a phone as a 5-second cutaway.)
4. **Too many dreams** (`egg-cascade`) — fires once per desktop. If you miss
   it, go to the nursery (**Start → Go to bed**) and back in through the CRT;
   it re-arms.

---

## 6. If something doesn't appear

| Symptom | Why | Fix |
|---|---|---|
| No "oh! hi!! you found my room" | You've visited before; Pip says *"you came back! visit #N"* instead | Clear site data and reload |
| Boot is very fast | Same — `visits > 1` runs it at ~2.5× | Clear site data |
| No sound at all | Nothing plays before your first click, by design; or you're muted | Click anything; check the speaker icon |
| Pip won't wake up in the nursery | You've finished the story — he's asleep on purpose now | Expected. Film awake-Pip shots before step 23 |
| `do_not_wake_pip.txt` isn't on the desktop | It only appears after the 5-click egg | Do step 3 first |
| "Pip's Secret Song" preset missing | Needs a full lullaby **and** the M → S → C order, in that sequence | Re-do steps 15 then 17 |
| The Dream Lantern didn't appear | Wrong order, or the lamps were already on | Switch all three off, then M → C → S |
| The error cascade didn't fire | Already fired for this desktop | Go to the nursery and back |
| An egg gives no sticker | Already collected — `award()` returns false the second time | Check the album; it's already yours |
| Guestbook refuses my wish | One post per 60 seconds | Wait, then post |
| **All my stickers vanished** | You clicked **Start → Forget me** | It wipes everything by design. Only ever click it after the final shot |
| Page turns don't animate | Reduce motion is on | Start → Reduce motion |
| Desktop icons sit at the bottom | Gravity.exe is on | Click Gravity: ON again, or close its window |
| Everything is dark | Lantern.exe is on | Click ☀ lights on |

---

*Checked against `src/` at the time of writing: `os/apps.tsx`,
`store/dreamStore.ts`, `content/copy.ts`, `content/stickers.tsx`,
`apps/pipchat/intents.ts`, and every `award()` / `complete()` call site.*
