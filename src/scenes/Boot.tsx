import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx } from '../audio/audio';
import Pip from '../components/Pip';

const BOOT_LINES = [
  'DreamOS 98 · Midnight Nursery Edition',
  '(c) 1998 Pip, Junior Dream Engineer',
  '',
  'checking lullabies.......... ok',
  'warming nightlights......... ok',
  'folding dream maps.......... ok',
  'counting sheep.............. 1, 2, 3… ok',
  '',
  'welcome back, little dreamer.',
];

export default function Boot() {
  const setScene = useDream((s) => s.setScene);
  const visits = useDream((s) => s.visitor.visits);
  const fast = visits > 1;
  const [shown, setShown] = useState(0);
  const [moons, setMoons] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    sfx.boot();
    window.setTimeout(() => setScene('desktop'), 350);
  };

  useEffect(() => {
    const step = fast ? 90 : 230;
    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), step * (i + 1))));
    for (let m = 1; m <= 10; m++) timers.push(window.setTimeout(() => setMoons(m), (step * BOOT_LINES.length * m) / 10));
    timers.push(window.setTimeout(finish, step * BOOT_LINES.length + 500));
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="boot" role="status" aria-live="polite">
      <div className="boot__inner">
        <pre className="boot__text">
          {BOOT_LINES.slice(0, shown).join('\n')}
          <span className="blink-cursor">_</span>
        </pre>
        <div className="boot__moons" aria-label={`loading ${moons * 10}%`}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={i < moons ? 'on' : ''}>
              ☾
            </span>
          ))}
        </div>
        <p className="boot__skip">press any key or tap to skip</p>
      </div>
    </div>
  );
}

export function ShutDown() {
  const setScene = useDream((s) => s.setScene);
  const award = useDream((s) => s.award);
  useEffect(() => {
    award('egg-shutdown');
    const wake = () => {
      sfx.giggle();
      setScene('booting');
    };
    const t = window.setTimeout(() => {
      window.addEventListener('pointerdown', wake, { once: true });
      window.addEventListener('keydown', wake, { once: true });
    }, 600);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, [setScene, award]);
  return (
    <div className="shutdown" role="status">
      <Pip width="min(160px, 36vw)" mood="asleep" />
      <p className="shutdown__text">It is now safe to fall asleep.</p>
      <p className="shutdown__sub">zzz… (click to wake pip up)</p>
    </div>
  );
}
