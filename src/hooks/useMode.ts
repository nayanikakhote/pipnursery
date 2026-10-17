import { useEffect, useState } from 'react';

export type Mode = 'desktop' | 'tablet' | 'phone';

function compute(): Mode {
  const w = window.innerWidth;
  if (w >= 1024) return 'desktop';
  if (w >= 640) return 'tablet';
  return 'phone';
}

export function useMode(): Mode {
  const [mode, setMode] = useState<Mode>(() => (typeof window === 'undefined' ? 'desktop' : compute()));
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setMode(compute()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return mode;
}

export function usePrefersReducedMotion() {
  const [r, setR] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setR(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return r;
}
