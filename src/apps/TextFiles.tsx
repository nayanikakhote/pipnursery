import type React from 'react';
import { useEffect } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx } from '../audio/audio';
import Pip from '../components/Pip';
import './apps.css';

function Notepad({ children }: { children: React.ReactNode }) {
  return (
    <div className="notepad">
      <div className="notepad__menu" aria-hidden="true">
        <span>File</span>
        <span>Edit</span>
        <span>Search</span>
        <span>Help</span>
      </div>
      <div className="notepad__page bevel-in">{children}</div>
    </div>
  );
}

export function DevNotes() {
  const award = useDream((s) => s.award);
  useEffect(() => {
    if (award('egg-devnotes')) sfx.sparkle();
  }, [award]);
  return (
    <Notepad>
      <pre>{`PIP_DEV_NOTES.txt
last edited: way past bedtime

TODO: stop adding stars.
TODO: add more stars.
TODO: fix lamp #2 (it exploded. into glitter. again.)
TODO: learn to fly in a straight line.

DONE: lullaby that works on frogs
DONE: nightlight for boo (he is brave now)
DONE: book about boo (granny owl said "nice")

secret things i hid (shhh):
 - i am VERY ticklish. like 5 boops ticklish.
 - there are 5 tiny stars hiding in my room.
 - teddy knows a secret. ask him 3 times.
 - my computer has a "shut down" button. it's sleepy too.
 - up up down down left right left right b a  (?)

note to self: silence is a bug. fix it.`}</pre>
    </Notepad>
  );
}

export function Credits() {
  return (
    <Notepad>
      <pre>{`Credits.txt

PIP'S MIDNIGHT NURSERY
a portfolio for Pip, Junior Dream Engineer
made for haX.baby · Baby's First Website (Track 1)

CHARACTER
  Pip and the official art (Pip on cloud, portrait,
  lullaby music box, dream lantern)
  © haX.baby Track 1 creator asset pack

ILLUSTRATIONS
  extra scenes and props: AI-generated for this
  project (tool credited on release), cleaned and
  cut out by hand

PIXEL ICONS
  hand-made pixel art, drawn in code

SOUND
  every sound is synthesized live with the
  Web Audio API. no audio files.

FONTS (Google Fonts, SIL Open Font License)
  Fraunces · Fredoka · Pixelify Sans · VT323

CODE
  React · Vite · TypeScript · Framer Motion
  Zustand · canvas-confetti

BUILT BY
  Nayu (Nayanika Khote) & team, during the
  48-hour sprint, 17–19 October 2026

thank you for visiting my little world. — pip`}</pre>
    </Notepad>
  );
}

export function LostSocks() {
  return (
    <div className="socks">
      <p className="mono">Lost Socks (4 items)</p>
      <ul>
        <li>🧦 left sock, pink, very lonely</li>
        <li>🧦 boo's sock (ghosts wear socks?)</li>
        <li>🧦 a sock that is actually a tiny sleeping bag</li>
        <li>🌙 not a sock. it's a moon. how did that get here</li>
      </ul>
      <p className="socks__note">"empty the basket?" → no. socks need dreams too.</p>
    </div>
  );
}

export function SecretFile() {
  const award = useDream((s) => s.award);
  useEffect(() => {
    if (award('egg-secretfile')) sfx.sparkle();
  }, [award]);
  return (
    <div className="secret-file">
      <Pip width="140px" mood="asleep" />
      <p className="mono">do_not_wake_pip.txt</p>
      <p>
        shhh… this is where i keep my very first dream. it was a small one: a warm room, one lamp still on, and somebody
        nice coming to visit.
      </p>
      <p>
        <b>that somebody is you.</b> ✨
      </p>
    </div>
  );
}
