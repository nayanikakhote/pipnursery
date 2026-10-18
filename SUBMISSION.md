# The story behind the build

**Pip's Midnight Nursery** — haX.baby, Baby's First Website, Track 1.

---

### The idea

The brief asked for a portfolio for Pip. But a baby doesn't have a portfolio site —
a baby has a *room*. So we built the room first, and hid the portfolio inside it.

You land in Pip's nursery at night. He notices you, and his eyes follow you around.
On the desk there's a chunky pastel CRT, and when you click it the camera zooms
*into the screen* — transform-origin set to the middle of the glass, so the zoom
really does go where you clicked — and DreamOS 98 boots up. Pip's six projects are
apps on a Windows-98 desktop, because a baby who builds dreams for a living would
absolutely have a slightly janky operating system.

The part we like best is that the two worlds leak into each other. Finish the
lullaby and the hanging mobile in the nursery starts swaying faster. Light all three
nightlights and the room glows warmer. Deliver the dreams and stars appear on the
wallpaper and the little windows across the rooftops light up. Read Pip's story to
the end and you come back to find him asleep under a starry ceiling, with the lamps
turned down. Nothing says "here is your reward" — the room has just quietly changed.

### What we're proudest of

**The lullaby sequencer.** Eight steps of a pentatonic scale, scheduled against the
AudioContext clock with a lookahead rather than a `setInterval`, so a slow lullaby
never drifts. The melody orbits the music box as stars, and the playing step glows
in the ring and in the grid at the same time. Every sound on the site is synthesized
live — there isn't a single audio file in the repository.

**The finale.** Read Pip's origin story to the end and the screen dims, Pip fades out,
and twelve gold stars drift up and link themselves into his shape. If you've
delivered the dreams, your delivery routes join the sky next to him. Then one star
comes loose, and it's yours — it turns the cursor trail gold for the rest of your
visit.

**The storybook.** Pip wrote and illustrated a book about Boo, a ghost who is afraid
of the dark and borrows the moon. It's a hardcover that opens, the pages turn in 3D
from the spine on a desktop and slide-curl on a phone, and every page has something
to poke.

### Craft choices

We were strict about three things.

*Honesty.* The guestbook works with no backend. In that mode it saves to your own
browser and says so in as many words — "your wishes are saved on this device
✨ (nobody else can see them)" — and the counter is labelled "YOUR VISITS", not
"VISITORS". The brief suggested seeding the visitor count at 1204 as a joke; we
started it at 0 instead, because a made-up number shown as a visitor count isn't a
joke, it's just wrong. Everything is one adapter, so adding two environment
variables turns the same code into a genuinely shared wall.

*Everything works three ways.* Mouse, touch and keyboard, everywhere, not as an
afterthought. The blocks use tap-to-pick then tap-to-place rather than a drag,
because that single interaction serves all three. Every touch target is at least
44px — the Win98 window buttons keep their small, correct look but push their hit
area out to 44px with a pseudo-element.

*A test harness that actually looks.* `tools/check.mjs` drives the whole site at six
viewports, opens and pokes every app, and fails on any console error, bad request,
layout overflow, small touch target or contrast below WCAG AA. It earned its keep: it
found a CSS class collision that was laying an entire app out 640px above its own
window, a stack of error dialogs that never left the screen because a prop's
identity changed every render, and tab labels rendering cream-on-white at 1.08:1
because a stylesheet hadn't loaded. None of those would have been caught by reading
the code.

### Pip's sign-off

> "i made all of this. some of it exploded into glitter first, but most of it works
> now. if you found the hidden stars, you have very good eyes. if you signed my
> guestbook, i read it twice.
>
> goodnight, little world. 🌙"
>
> — Pip, Junior Dream Engineer, Midnight Nursery (night shift)
