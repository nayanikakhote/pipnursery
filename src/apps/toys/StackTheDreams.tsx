import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDream } from '../../store/dreamStore';
import { sfx, unlockAudio } from '../../audio/audio';

const WORDS = ['DREAM', 'REST', 'WONDER', 'GLOW'];
const TINTS = ['pink', 'lilac', 'gold', 'cream'];
const FLOOR = 100; // the play area is 100 units wide

interface Laid {
  word: string;
  tint: string;
  left: number;
  width: number;
}

export default function StackTheDreams({ onWin }: { onWin: () => void }) {
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [laid, setLaid] = useState<Laid[]>([]);
  const [x, setX] = useState(10);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState<'won' | 'lost' | null>(null);
  const [tumbling, setTumbling] = useState(false);
  const raf = useRef(0);
  const dir = useRef(1);
  const pos = useRef(10);

  const level = laid.length;
  const width = level === 0 ? 46 : laid[laid.length - 1].width;
  const speed = 26 + level * 7;

  const start = useCallback(() => {
    unlockAudio();
    setLaid([]);
    setOver(null);
    setTumbling(false);
    pos.current = 10;
    dir.current = 1;
    setX(10);
    setRunning(true);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // the slab slides back and forth until you drop it
  useEffect(() => {
    if (!running || over) return;
    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      pos.current += dir.current * speed * dt;
      if (pos.current + width >= FLOOR) {
        pos.current = FLOOR - width;
        dir.current = -1;
      } else if (pos.current <= 0) {
        pos.current = 0;
        dir.current = 1;
      }
      setX(pos.current);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [running, over, speed, width]);

  const drop = useCallback(() => {
    if (!running || over) return;
    unlockAudio();
    const below = laid[laid.length - 1];
    const left = pos.current;

    if (!below) {
      sfx.clack();
      setLaid([{ word: WORDS[0], tint: TINTS[0], left, width }]);
      return;
    }

    // the overhang is trimmed off, exactly like the arcade original
    const overlapL = Math.max(left, below.left);
    const overlapR = Math.min(left + width, below.left + below.width);
    const overlap = overlapR - overlapL;

    if (overlap <= 6) {
      sfx.bonk();
      setTumbling(true);
      setOver('lost');
      setRunning(false);
      return;
    }

    sfx.clack();
    const next = [...laid, { word: WORDS[laid.length], tint: TINTS[laid.length], left: overlapL, width: overlap }];
    setLaid(next);
    pos.current = 0;
    dir.current = 1;

    if (next.length === WORDS.length) {
      setRunning(false);
      setOver('won');
      sfx.jingle();
      window.setTimeout(() => sfx.giggle(), 260);
      if (!reducedMotion) {
        confetti({ particleCount: 70, spread: 70, scalar: 0.8, origin: { y: 0.6 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8', '#FFF8F1'] });
      }
      onWin();
    }
  }, [running, over, laid, width, reducedMotion, onWin]);

  // Space / Enter drops, same as tapping
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const el = document.activeElement;
      if (el instanceof HTMLElement && el.closest('.stack__area')) {
        e.preventDefault();
        drop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drop]);

  return (
    <div className="game">
      <p className="game__how">stack four dreams on top of each other. tap (or press space) to drop one.</p>

      <button
        type="button"
        className={`stack__area ${tumbling ? 'is-tumbling' : ''}`}
        onClick={drop}
        disabled={!running || !!over}
        aria-label={running ? `Drop the ${WORDS[level] ?? ''} block. ${level} of 4 stacked.` : 'Press start to play'}
      >
        <span className="stack__inner" aria-hidden="true">
          {laid.map((b, i) => (
            <span key={i} className={`stack__slab t-${b.tint}`} style={{ left: `${b.left}%`, width: `${b.width}%`, bottom: `${i * 22}%` }}>
              {b.word}
            </span>
          ))}
          {running && !over && (
            <span className={`stack__slab stack__slab--live t-${TINTS[level]}`} style={{ left: `${x}%`, width: `${width}%`, bottom: `${level * 22}%` }}>
              {WORDS[level]}
            </span>
          )}
        </span>
      </button>

      <div className="game__bar">
        <button type="button" className="btn98" onClick={start}>
          {over || !running ? 'start' : 'restart'}
        </button>
        <span className="mono">stacked: {laid.length}/4</span>
        {over === 'won' && <b className="game__win">a whole tower of dreams!! ✨</b>}
        {over === 'lost' && <b className="game__lose">oops. it went soft and fell over. try again?</b>}
      </div>
    </div>
  );
}
