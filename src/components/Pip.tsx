import type React from 'react';
import { useEffect, useRef } from 'react';
import { pointer, lookTarget } from '../lib/pointer';
import { useDream, type PipMood } from '../store/dreamStore';
import { asset } from '../lib/asset';
import { art } from '../content/assets';
import './pip.css';

// Some moods were drawn as whole poses. Where one exists Pip wears the pose
// instead of the base face plus CSS overlays, and the live eyes stand down —
// the drawing already has the expression in it.
const POSES: Partial<Record<PipMood, string | undefined>> = {
  asleep: art('pip-asleep'),
  yawn: art('pip-yawn'),
  cheer: art('pip-cheer'),
  pout: art('pip-pout'),
  sneeze: art('pip-sneeze'),
  whoa: art('pip-whoa'),
};

const POSE_ALT: Partial<Record<PipMood, string>> = {
  asleep: 'Pip fast asleep on a cloud',
  yawn: 'Pip having a big yawn',
  cheer: 'Pip cheering with both arms up',
  pout: 'Pip sulking in earmuffs',
  sneeze: 'Pip sneezing into a tissue',
  whoa: 'Pip looking very surprised',
};

// Eye socket geometry measured on /assets/pip-base.webp (585 × 778).
const W = 585;
const H = 778;
const SOCKETS = [
  { cx: 226.3, cy: 286.7, r: 46 },
  { cx: 396.9, cy: 239.8, r: 46 },
];

interface Props {
  width: string; // any CSS width
  onClick?: () => void;
  label?: string;
  mood?: PipMood; // override global mood
  className?: string;
  badge?: boolean;
}

export default function Pip({ width, onClick, label = 'Pip', mood: moodProp, className = '', badge }: Props) {
  const globalMood = useDream((s) => s.mood);
  const theme = useDream((s) => s.theme);
  const mood = moodProp ?? globalMood;
  const rootRef = useRef<HTMLElement>(null) as React.RefObject<HTMLDivElement>;
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lidRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // eye tracking loop
  useEffect(() => {
    let raf = 0;
    const cur = SOCKETS.map(() => ({ x: 0, y: 0 }));
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const root = rootRef.current;
      if (!root || document.hidden) return;
      const rect = root.getBoundingClientRect();
      if (rect.width === 0) return;
      const scale = rect.width / W;
      let tx: number | null = null;
      let ty: number | null = null;
      if (lookTarget.el && lookTarget.el.isConnected) {
        const r = lookTarget.el.getBoundingClientRect();
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
      } else if (pointer.active && performance.now() - pointer.lastMove < 5000) {
        tx = pointer.x;
        ty = pointer.y;
      }
      SOCKETS.forEach((s, i) => {
        const sx = rect.left + s.cx * scale;
        const sy = rect.top + s.cy * scale;
        const max = s.r * scale * 0.34;
        let gx = 0;
        let gy = 0;
        if (tx !== null && ty !== null) {
          const dx = tx - sx;
          const dy = ty - sy;
          const dist = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, dist / (rect.width * 0.9));
          gx = (dx / dist) * max * k;
          gy = (dy / dist) * max * k;
        }
        cur[i].x += (gx - cur[i].x) * 0.16;
        cur[i].y += (gy - cur[i].y) * 0.16;
        const el = dotRefs.current[i];
        if (el) el.style.transform = `translate(calc(-50% + ${cur[i].x}px), calc(-50% + ${cur[i].y}px))`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // blinking
  useEffect(() => {
    let t = 0;
    const blink = () => {
      lidRefs.current.forEach((l) => l?.classList.add('blink'));
      window.setTimeout(() => lidRefs.current.forEach((l) => l?.classList.remove('blink')), 150);
      t = window.setTimeout(blink, 3200 + Math.random() * 3000);
    };
    t = window.setTimeout(blink, 2000);
    return () => window.clearTimeout(t);
  }, []);

  const soundOn = useDream((s) => s.soundOn);
  const pose = POSES[mood];
  const sleepy = theme === 'night' && mood === 'idle';
  const cls = `pip pip--${mood} ${pose ? 'pip--posed' : ''} ${sleepy ? 'pip--sleepy' : ''} ${soundOn ? '' : 'muted'} ${className}`;
  const style = { width, aspectRatio: `${W} / ${H}` };

  const inner = pose ? (
    <span className="pip__body">
      <img className="pip__pose" src={pose} alt={onClick ? '' : (POSE_ALT[mood] ?? 'Pip')} draggable={false} />
      {badge && (
        <span className="pip__badge" aria-hidden="true">
          ★
        </span>
      )}
    </span>
  ) : (
      <span className="pip__body">
        <img src={asset('assets/pip-base.webp')} alt={onClick ? '' : 'Pip, a cute baby with a round skull face and a starry nightcap'} draggable={false} />
        {SOCKETS.map((s, i) => (
          <span
            key={i}
            className="pip__eye"
            style={{
              left: `${(s.cx / W) * 100}%`,
              top: `${(s.cy / H) * 100}%`,
              width: `${((s.r * 2) / W) * 100}%`,
            }}
          >
            <span className="pip__dot" ref={(el) => void (dotRefs.current[i] = el)} />
            <span className="pip__lid" ref={(el) => void (lidRefs.current[i] = el)} />
            <span className="pip__lid-low" />
          </span>
        ))}
        <span className="pip__muffs" aria-hidden="true">
          <span className="muff muff--l" />
          <span className="muff muff--r" />
        </span>
        {badge && <span className="pip__badge" aria-hidden="true">★</span>}
        <span className="pip__zzz" aria-hidden="true">
          <i>z</i>
          <i>z</i>
          <i>Z</i>
        </span>
      </span>
  );

  if (onClick) {
    return (
      <button
        ref={rootRef as unknown as React.RefObject<HTMLButtonElement>}
        type="button"
        className={cls}
        style={style}
        onClick={onClick}
        aria-label={`${label}, click to say hi`}
      >
        {inner}
      </button>
    );
  }
  return (
    <div ref={rootRef} className={cls} style={style}>
      {inner}
    </div>
  );
}
