import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDream } from '../../store/dreamStore';
import { sfx, unlockAudio } from '../../audio/audio';

const SECONDS = 20;
const TARGET = 15;
type Kind = 'star' | 'bubble' | 'sock';

interface Falling {
  id: number;
  kind: Kind;
  x: number; // %
  y: number; // %
  vy: number;
}

const GLYPH: Record<Kind, string> = { star: '★', bubble: '✦', sock: '🧦' };

export default function DreamCatch({ onWin }: { onWin: () => void }) {
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [items, setItems] = useState<Falling[]>([]);
  const [basket, setBasket] = useState(50);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);

  const raf = useRef(0);
  const nextId = useRef(1);
  const basketRef = useRef(50);
  const itemsRef = useRef<Falling[]>([]);
  const keys = useRef({ l: false, r: false });
  const area = useRef<HTMLDivElement>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setRunning(false);
    setItems([]);
    itemsRef.current = [];
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const start = () => {
    unlockAudio();
    setScore(0);
    setLeft(SECONDS);
    setWon(false);
    setItems([]);
    itemsRef.current = [];
    basketRef.current = 50;
    setBasket(50);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;

    const t0 = performance.now();
    let last = t0;
    let spawnAt = 0;
    let caught = 0;

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const elapsed = (t - t0) / 1000;
      setLeft(Math.max(0, Math.ceil(SECONDS - elapsed)));

      if (elapsed >= SECONDS) {
        setScore(caught);
        setBest((b) => Math.max(b, caught));
        if (caught >= TARGET) {
          setWon(true);
          sfx.jingle();
          if (!reducedMotion) {
            confetti({ particleCount: 70, spread: 75, scalar: 0.8, origin: { y: 0.6 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8'] });
          }
          onWin();
        } else {
          sfx.pop();
        }
        stop();
        return;
      }

      // arrows nudge the basket; drag and taps set it directly
      if (keys.current.l) basketRef.current = Math.max(6, basketRef.current - 70 * dt);
      if (keys.current.r) basketRef.current = Math.min(94, basketRef.current + 70 * dt);
      setBasket(basketRef.current);

      spawnAt -= dt;
      if (spawnAt <= 0) {
        spawnAt = 0.42 + Math.random() * 0.3;
        const r = Math.random();
        const kind: Kind = r < 0.14 ? 'sock' : r < 0.62 ? 'star' : 'bubble';
        itemsRef.current = [
          ...itemsRef.current,
          { id: nextId.current++, kind, x: 6 + Math.random() * 88, y: -6, vy: 34 + Math.random() * 20 },
        ];
      }

      const keep: Falling[] = [];
      for (const it of itemsRef.current) {
        const y = it.y + it.vy * dt;
        // the basket mouth is the bottom 12% of the area, 16% wide
        if (y >= 86 && y <= 100 && Math.abs(it.x - basketRef.current) < 9) {
          if (it.kind === 'sock') {
            sfx.giggle();
          } else {
            caught++;
            setScore(caught);
            sfx.note(it.kind === 'star' ? 1046.5 : 783.99, 0, 0.05);
          }
          continue;
        }
        if (y > 104) continue;
        keep.push({ ...it, y });
      }
      itemsRef.current = keep;
      setItems(keep);

      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running, reducedMotion, onWin, stop]);

  // keyboard
  useEffect(() => {
    const set = (e: KeyboardEvent, down: boolean) => {
      if (e.key === 'ArrowLeft') keys.current.l = down;
      else if (e.key === 'ArrowRight') keys.current.r = down;
      else return;
      if (running) e.preventDefault();
    };
    const d = (e: KeyboardEvent) => set(e, true);
    const u = (e: KeyboardEvent) => set(e, false);
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => {
      window.removeEventListener('keydown', d);
      window.removeEventListener('keyup', u);
    };
  }, [running]);

  const aim = (clientX: number) => {
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    basketRef.current = Math.max(6, Math.min(94, ((clientX - box.left) / box.width) * 100));
    setBasket(basketRef.current);
  };

  return (
    <div className="game">
      <p className="game__how">catch the stars and dream bubbles. the grey socks are just socks — catch one for a giggle.</p>

      <div
        className="catch"
        ref={area}
        onPointerDown={(e) => aim(e.clientX)}
        onPointerMove={(e) => e.buttons && aim(e.clientX)}
        role="group"
        aria-label={`Dream Catch. ${score} caught, ${left} seconds left. Arrow keys move the basket.`}
      >
        {items.map((it) => (
          <span key={it.id} className={`fall fall--${it.kind}`} style={{ left: `${it.x}%`, top: `${it.y}%` }} aria-hidden="true">
            {GLYPH[it.kind]}
          </span>
        ))}
        <span className="catch__basket" style={{ left: `${basket}%` }} aria-hidden="true" />
        {!running && (
          <p className="catch__idle">
            {won ? `caught ${score}! that's a whole night's worth.` : score ? `you caught ${score}. ${score >= TARGET ? '' : `${TARGET} wins a sticker.`}` : 'ready when you are.'}
          </p>
        )}
      </div>

      <div className="game__bar">
        <button type="button" className="btn98" onClick={running ? stop : start}>
          {running ? 'stop' : score ? 'again' : 'start'}
        </button>
        <span className="mono">
          caught {score} · {left}s left{best ? ` · best ${best}` : ''}
        </span>
        <span className="game__keys">← → or drag</span>
      </div>
    </div>
  );
}
