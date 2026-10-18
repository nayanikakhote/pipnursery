import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { LANTERN_SPOTS } from '../content/lantern';

// Lights out: the desktop goes dark and the cursor carries Pip's lantern.
// Everything is a CSS radial mask following a CSS variable, so there is no
// per-frame React work.
export default function LanternLayer() {
  const setFlag = useDream((s) => s.setFlag);
  const award = useDream((s) => s.award);
  const say = useDream((s) => s.say);
  const found = useDream((s) => (s.flags['fx:lantern-found'] as string) ?? '');
  const root = useRef<HTMLDivElement>(null);
  const [note, setNote] = useState('');

  const foundList = found ? found.split(',').filter(Boolean) : [];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const move = (x: number, y: number) => {
      el.style.setProperty('--lx', `${x}px`);
      el.style.setProperty('--ly', `${y}px`);
    };
    // start in the middle, so a keyboard-only visitor still sees something
    move(window.innerWidth / 2, window.innerHeight / 2);
    const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const touch = (s: (typeof LANTERN_SPOTS)[number]) => {
    unlockAudio();
    if (s.kind === 'note') {
      sfx.pop();
      setNote(s.text);
      window.setTimeout(() => setNote(''), 4200);
      return;
    }
    if (foundList.includes(s.id)) return;
    const next = [...foundList, s.id];
    setFlag('fx:lantern-found', next.join(','));
    sfx.sparkle();
    const stars = LANTERN_SPOTS.filter((x) => x.kind === 'star').length;
    if (next.length >= stars) {
      if (award('egg-lantern-stars')) {
        sfx.jingle();
        say('all five!! i thought those were very well hidden.');
      }
    }
  };

  return (
    <div className="lantern-layer" ref={root}>
      <div className="lantern-layer__dark" aria-hidden="true" />
      {LANTERN_SPOTS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`lspot lspot--${s.kind} ${foundList.includes(s.id) ? 'is-found' : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          onClick={() => touch(s)}
          aria-label={s.kind === 'star' ? `A hidden star${foundList.includes(s.id) ? ', found' : ''}` : 'A note Pip left'}
        >
          <span aria-hidden="true">{s.kind === 'star' ? '★' : '✎'}</span>
        </button>
      ))}
      {note && (
        <p className="lantern-layer__note" role="status">
          “{note}”
        </p>
      )}
      <button
        type="button"
        className="btn98 lantern-layer__out"
        onClick={() => {
          sfx.chime();
          setFlag('fx:lantern', false);
        }}
      >
        ☀ lights on
      </button>
    </div>
  );
}
