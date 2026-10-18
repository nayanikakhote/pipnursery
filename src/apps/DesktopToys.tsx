import { useEffect } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import './desktoptoys.css';

// Gravity.exe and Lantern.exe are desktop-wide effects, so their windows are
// just the control panel. The effect itself is a flag the Desktop scene reads.

export function Gravity() {
  const setFlag = useDream((s) => s.setFlag);
  const on = useDream((s) => !!s.flags['fx:gravity']);
  const award = useDream((s) => s.award);
  const say = useDream((s) => s.say);
  const setMood = useDream((s) => s.setMood);

  // leaving the window on turns the effect off, so nothing is left stuck
  useEffect(() => () => useDream.getState().setFlag('fx:gravity', false), []);

  const toggle = () => {
    unlockAudio();
    const next = !on;
    setFlag('fx:gravity', next);
    if (next) {
      sfx.bonk();
      setMood('whoa');
      say('uh oh. who turned on gravity?!');
      award('egg-gravity');
    } else {
      sfx.sparkle();
      say('phew. everything back on the wall.');
    }
  };

  return (
    <div className="dtoy">
      <h3>Gravity.exe</h3>
      <p>
        my icons are stuck to the wallpaper. i have never understood how.
        <br />
        want to find out what happens if they aren't?
      </p>
      <button type="button" className={`btn98 dtoy__big ${on ? 'is-on' : ''}`} onClick={toggle} aria-pressed={on}>
        Gravity: {on ? 'ON' : 'OFF'}
      </button>
      <p className="dtoy__small">{on ? 'press it again to put everything back.' : '(granny owl says i am not allowed to leave it on.)'}</p>
    </div>
  );
}

/** The five star doodles hidden on the wallpaper, and three things Pip wrote. */
export const LANTERN_SPOTS = [
  { id: 'l1', x: 9, y: 22, kind: 'star' as const, text: '' },
  { id: 'l2', x: 72, y: 14, kind: 'star' as const, text: '' },
  { id: 'l3', x: 44, y: 61, kind: 'star' as const, text: '' },
  { id: 'l4', x: 88, y: 74, kind: 'star' as const, text: '' },
  { id: 'l5', x: 24, y: 83, kind: 'star' as const, text: '' },
  { id: 'm1', x: 60, y: 36, kind: 'note' as const, text: 'i drew these when i could not sleep.' },
  { id: 'm2', x: 16, y: 52, kind: 'note' as const, text: 'granny owl says the dark is just the room resting.' },
  { id: 'm3', x: 80, y: 47, kind: 'note' as const, text: 'if you are reading this, you are up very late too.' },
];

export function Lantern() {
  const setFlag = useDream((s) => s.setFlag);
  const on = useDream((s) => !!s.flags['fx:lantern']);
  const found = useDream((s) => (s.flags['fx:lantern-found'] as string) ?? '');
  const say = useDream((s) => s.say);

  useEffect(() => () => useDream.getState().setFlag('fx:lantern', false), []);

  const stars = LANTERN_SPOTS.filter((s) => s.kind === 'star').length;
  const got = found ? found.split(',').filter(Boolean).length : 0;

  const toggle = () => {
    unlockAudio();
    const next = !on;
    setFlag('fx:lantern', next);
    if (next) {
      sfx.whoosh();
      say('lights out! hold my lantern. there are five stars out there.');
    } else {
      sfx.chime();
    }
  };

  return (
    <div className="dtoy">
      <h3>Lantern.exe</h3>
      <p>
        i hid five little stars on my wallpaper. you can only see them with my lantern.
        <br />
        (there are some notes out there too. those are private. …okay, read them.)
      </p>
      <button type="button" className={`btn98 dtoy__big ${on ? 'is-on' : ''}`} onClick={toggle} aria-pressed={on}>
        {on ? '☀ lights on' : '☾ lights out'}
      </button>
      <p className="dtoy__small" role="status">
        stars found: {got}/{stars}
        {got >= stars ? ' — every one! you have very good eyes.' : on ? ' — move your lantern around.' : ''}
      </p>
    </div>
  );
}
