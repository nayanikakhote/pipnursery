import { useEffect, useRef } from 'react';
import { useDream } from '../store/dreamStore';

// A pooled set of DOM particles. Twenty elements are created once and reused
// forever, so trailing the cursor never allocates and never garbage-collects
// mid-animation.
const POOL = 20;
const SHAPES = ['★', '✦', '•', '❀'];

export default function SparkleTrail() {
  const on = useDream((s) => s.sparkleOn);
  const reduced = useDream((s) => s.reducedMotion);
  const gold = useDream((s) => !!s.flags['cursor:gold']);
  const root = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLSpanElement[]>([]);
  const next = useRef(0);
  const last = useRef({ x: 0, y: 0, t: 0 });

  useEffect(() => {
    if (!on || reduced) return;
    const host = root.current;
    if (!host) return;

    // (re)build the pool
    host.textContent = '';
    pool.current = Array.from({ length: POOL }, () => {
      const el = document.createElement('span');
      el.className = 'spark';
      host.appendChild(el);
      return el;
    });

    const emit = (x: number, y: number, burst = false) => {
      const n = burst ? 6 : 1;
      for (let i = 0; i < n; i++) {
        const el = pool.current[next.current];
        next.current = (next.current + 1) % POOL;
        el.textContent = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        el.style.left = `${x + (burst ? (Math.random() - 0.5) * 26 : 0)}px`;
        el.style.top = `${y + (burst ? (Math.random() - 0.5) * 26 : 0)}px`;
        el.style.setProperty('--dx', `${(Math.random() - 0.5) * 44}px`);
        el.style.setProperty('--r', `${(Math.random() - 0.5) * 180}deg`);
        el.style.setProperty('--s', `${0.7 + Math.random() * 0.6}`);
        // restart the animation on a reused element
        el.classList.remove('is-on');
        void el.offsetWidth;
        el.classList.add('is-on');
      }
    };

    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const onMove = (e: PointerEvent) => {
      if (coarse || e.pointerType === 'touch') return;
      const t = performance.now();
      const d = Math.hypot(e.clientX - last.current.x, e.clientY - last.current.y);
      // one sparkle per 22px travelled, at most every 40ms
      if (d < 22 || t - last.current.t < 40) return;
      last.current = { x: e.clientX, y: e.clientY, t };
      emit(e.clientX, e.clientY);
    };
    // touch devices get a small burst where they tap instead of a trail
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || coarse) emit(e.clientX, e.clientY, true);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [on, reduced]);

  if (!on || reduced) return null;
  return <div className={`sparkles ${gold ? 'is-gold' : ''}`} ref={root} aria-hidden="true" />;
}
