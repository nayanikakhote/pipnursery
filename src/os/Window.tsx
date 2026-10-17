import type React from 'react';
import { Suspense, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDream, type Win } from '../store/dreamStore';
import { appById } from './apps';
import PixelIcon from '../components/PixelIcon';
import { sfx } from '../audio/audio';

interface Props {
  win: Win;
  maximizedOnly: boolean; // tablet mode: windows fill the screen
  bounds: { w: number; h: number };
  focused: boolean;
}

export default function Window({ win, maximizedOnly, bounds, focused }: Props) {
  const def = appById[win.id];
  const close = useDream((s) => s.closeApp);
  const focus = useDream((s) => s.focusApp);
  const minimize = useDream((s) => s.minimizeApp);
  const toggleMax = useDream((s) => s.toggleMax);
  const move = useDream((s) => s.moveApp);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);

  const max = maximizedOnly || win.max;
  const w = Math.min(def.w, bounds.w - 16);
  const h = Math.min(def.h, bounds.h - 16);
  const x = Math.max(8, Math.min(win.x, bounds.w - w - 8));
  const y = Math.max(8, Math.min(win.y, bounds.h - h - 8));

  useEffect(() => {
    if (focused) ref.current?.focus({ preventScroll: true });
  }, [focused]);

  const onTitleDown = (e: React.PointerEvent) => {
    if (max || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    focus(win.id);
    drag.current = { dx: e.clientX - x, dy: e.clientY - y, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onTitleMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const nx = Math.max(-w + 80, Math.min(e.clientX - d.dx, bounds.w - 80));
    const ny = Math.max(0, Math.min(e.clientY - d.dy, bounds.h - 30));
    move(win.id, nx, ny);
  };
  const onTitleUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const Comp = def.component;

  return (
    <motion.div
      ref={ref}
      className={`win98 ${focused ? 'is-focused' : ''} ${max ? 'is-max' : ''}`}
      role="dialog"
      aria-labelledby={`wt-${win.id}`}
      tabIndex={-1}
      style={
        max
          ? { zIndex: win.z, left: 0, top: 0, width: '100%', height: '100%', display: win.min ? 'none' : undefined }
          : { zIndex: win.z, left: x, top: y, width: w, height: h, display: win.min ? 'none' : undefined }
      }
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      onPointerDownCapture={() => focus(win.id)}
    >
      <div
        className="win98__title"
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={onTitleUp}
        onPointerCancel={onTitleUp}
        onDoubleClick={() => !maximizedOnly && toggleMax(win.id)}
      >
        {maximizedOnly && (
          <button
            type="button"
            className="win98__btn win98__back"
            aria-label="Back to desktop"
            onClick={() => {
              sfx.close();
              close(win.id);
            }}
          >
            ◀
          </button>
        )}
        <PixelIcon name={def.icon} size={20} />
        <span id={`wt-${win.id}`} className="win98__name">
          {def.title}
        </span>
        <span className="win98__btns">
          <button
            type="button"
            className="win98__btn"
            aria-label={`Minimize ${def.label}`}
            onClick={() => {
              sfx.click();
              minimize(win.id);
            }}
          >
            <span className="g-min" />
          </button>
          {!maximizedOnly && (
            <button
              type="button"
              className="win98__btn"
              aria-label={win.max ? `Restore ${def.label}` : `Maximize ${def.label}`}
              onClick={() => {
                sfx.click();
                toggleMax(win.id);
              }}
            >
              <span className={win.max ? 'g-restore' : 'g-max'} />
            </button>
          )}
          <button
            type="button"
            className="win98__btn win98__close"
            aria-label={`Close ${def.label}`}
            onClick={() => {
              sfx.close();
              close(win.id);
            }}
          >
            ✕
          </button>
        </span>
      </div>
      <div className="win98__body">
        <Suspense fallback={<div className="win98__loading">loading dreams…</div>}>
          <Comp />
        </Suspense>
      </div>
    </motion.div>
  );
}
