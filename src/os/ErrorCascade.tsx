import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx } from '../audio/audio';

// Once per session, the fourth open window convinces DreamOS it has too many
// dreams. Six dialogs cascade in, Pip sneezes, and everything tidies itself
// up. It never blocks: Esc or any button dismisses it, and it leaves on its
// own after a couple of seconds.
const BUTTONS = ['ok', 'ok!!', 'also ok'];

export default function ErrorCascade({ onTidy }: { onTidy: () => void }) {
  const windows = useDream((s) => s.windows);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const award = useDream((s) => s.award);
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [fired, setFired] = useState(false);
  const [showing, setShowing] = useState(false);

  const open = windows.filter((w) => !w.min).length;

  // onTidy is a fresh closure on every parent render, so it is held in a ref
  // rather than listed as a dependency — otherwise the timer effect below
  // restarts on every render and the dialogs never leave.
  const tidy = useRef(onTidy);
  tidy.current = onTidy;

  // Two effects on purpose. The first only notices the fourth window; the
  // second owns the timers and depends on `showing` alone — when they were in
  // one effect, opening another window changed `open`, the cleanup cancelled
  // the timers, and the dialogs stayed on screen forever.
  useEffect(() => {
    if (fired || open < 4) return;
    setFired(true);
    setShowing(true);
    sfx.static();
    award('egg-cascade');
  }, [open, fired, award]);

  useEffect(() => {
    if (!showing) return;
    const timers = [
      window.setTimeout(
        () => {
          setMood('sneeze');
          sfx.sneeze();
          say('uh oh—');
        },
        reducedMotion ? 300 : 1700,
      ),
      window.setTimeout(
        () => {
          setShowing(false);
          tidy.current();
        },
        reducedMotion ? 700 : 2400,
      ),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [showing, setMood, say, reducedMotion]);

  useEffect(() => {
    if (!showing) return;
    const dismiss = () => {
      setShowing(false);
      tidy.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showing]);

  if (!showing) return null;

  return (
    <div className="cascade" role="alertdialog" aria-label="Too many dreams detected">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="cascade__dlg bevel" style={{ left: `${18 + i * 4}%`, top: `${16 + i * 5}%`, animationDelay: `${i * 0.1}s`, zIndex: 9100 + i }}>
          <div className="cascade__title">⚠ DreamOS</div>
          <p className="cascade__msg">
            <b>⚠ TOO MANY DREAMS DETECTED</b>
            <span>dream buffer at {104 + i * 7}%. this is probably fine.</span>
          </p>
          <div className="cascade__btns">
            {BUTTONS.map((b) => (
              <button
                key={b}
                type="button"
                className="btn98"
                onClick={() => {
                  sfx.click();
                  setShowing(false);
                  tidy.current();
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
