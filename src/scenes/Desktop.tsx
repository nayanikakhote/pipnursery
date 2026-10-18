import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useDream, type AppId } from '../store/dreamStore';
import { APPS, appById, type AppDef } from '../os/apps';
import Window from '../os/Window';
import PixelIcon from '../components/PixelIcon';
import Pip from '../components/Pip';
import { MuteToggle, ThemeToggle, SpeechBubble } from '../components/Controls';
import { sfx, unlockAudio } from '../audio/audio';
import { appHello, lines } from '../content/copy';
import { lookTarget } from '../lib/pointer';
import { handlePipClick } from './Nursery';
import type { Mode } from '../hooks/useMode';
import Odometer from '../components/Odometer';
import { ART } from '../content/assets';
import ErrorCascade from '../os/ErrorCascade';
import LanternLayer from '../os/LanternLayer';
import './desktop.css';

export function launch(id: AppId) {
  const st = useDream.getState();
  unlockAudio();

  // do_not_wake_pip.txt doesn't open a window. The desktop folds sideways for
  // 700ms — offset colours, titles scrambling to stars, no strobing — and
  // then you're somewhere else entirely.
  if (id === 'secretfile') {
    sfx.static();
    st.say('…you really did open it.');
    document.documentElement.classList.add('is-shifting');
    const veil = document.createElement('div');
    veil.className = 'dream-shift';
    document.body.appendChild(veil);
    const ms = st.reducedMotion ? 200 : 700;
    window.setTimeout(() => {
      document.documentElement.classList.remove('is-shifting');
      veil.remove();
      useDream.getState().setScene('secret');
    }, ms);
    return;
  }

  sfx.open();
  st.openApp(id);
  const hello = appHello[id];
  if (hello) st.say(hello);
}

function DesktopIcon({ app, selected, onSelect }: { app: AppDef; selected: boolean; onSelect: (id: AppId) => void }) {
  return (
    <button
      type="button"
      className={`dicon ${selected ? 'is-selected' : ''}`}
      onClick={(e) => {
        onSelect(app.id);
        // touch & pen: one tap opens. mouse: double-click opens.
        const pt = (e.nativeEvent as PointerEvent).pointerType;
        if (pt === 'touch' || pt === 'pen' || e.detail === 0) launch(app.id);
      }}
      onDoubleClick={() => launch(app.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          launch(app.id);
        }
      }}
      onPointerEnter={(e) => (lookTarget.el = e.currentTarget)}
      onPointerLeave={() => (lookTarget.el = null)}
      onFocus={(e) => (lookTarget.el = e.currentTarget)}
      onBlur={() => (lookTarget.el = null)}
      aria-label={`${app.label}. Double-click or press Enter to open.`}
    >
      <PixelIcon name={app.icon} size={44} />
      <span className="dicon__label">{app.label}</span>
    </button>
  );
}

function StartMenu({ onClose }: { onClose: () => void }) {
  const setScene = useDream((s) => s.setScene);
  const closeAll = useDream((s) => s.closeAll);
  const reducedMotion = useDream((s) => s.reducedMotion);
  const setReducedMotion = useDream((s) => s.setReducedMotion);
  const sparkleOn = useDream((s) => s.sparkleOn);
  const setSparkle = useDream((s) => s.setSparkle);
  const forgetMe = useDream((s) => s.forgetMe);
  const secretUnlocked = useDream((s) => s.secretUnlocked);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
        const i = items.indexOf(document.activeElement as HTMLButtonElement);
        const n = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[n]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const item = (label: string, icon: string, fn: () => void, extra?: string) => (
    <button type="button" role="menuitem" className="start-item" onClick={fn}>
      <PixelIcon name={icon} size={22} />
      <span>{label}</span>
      {extra && <em>{extra}</em>}
    </button>
  );

  return (
    <div className="start-menu bevel" role="menu" aria-label="Start menu" ref={ref}>
      <div className="start-menu__side" aria-hidden="true">
        <span>
          Dream<b>OS</b> 98
        </span>
      </div>
      <div className="start-menu__items">
        <div className="start-sep-label">my work</div>
        {APPS.filter((a) => a.group === 'work').map((a) => item(a.label, a.icon, () => launch(a.id)))}
        <div className="start-sep" />
        {item('My Pip', 'idcard', () => launch('mypip'))}
        {item('My_Story.doc', 'diary', () => launch('story'))}
        {item('Ask Pip (PipChat)', 'chat', () => launch('chat'))}
        {item('Sign the guestbook', 'guestbook', () => launch('wishes'))}
        {secretUnlocked && item('do_not_wake_pip.txt', 'sleepfile', () => launch('secretfile'))}
        <div className="start-sep" />
        {item('Reduce motion', 'moon', () => setReducedMotion(!reducedMotion), reducedMotion ? 'on' : 'off')}
        {item('Sparkle trail', 'star', () => setSparkle(!sparkleOn), sparkleOn ? 'on' : 'off')}
        {item('Forget me', 'basket', () => {
          forgetMe();
          useDream.getState().say("okay… i forgot everything. hi, new friend!");
          onClose();
        })}
        <div className="start-sep" />
        {item('Go to bed (back to my room)', 'moon', () => {
          sfx.whoosh();
          closeAll();
          setScene('nursery');
        })}
        {item('Shut Down…', 'sleepfile', () => {
          sfx.yawn();
          setScene('shutdown');
        })}
      </div>
    </div>
  );
}

function Clock({ onSecretTap }: { onSecretTap: () => void }) {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const i = window.setInterval(() => setT(new Date()), 15000);
    return () => window.clearInterval(i);
  }, []);
  return (
    <button type="button" className="tray-clock" onClick={onSecretTap} aria-label={`Clock, ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
      {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </button>
  );
}

export default function Desktop({ mode }: { mode: Mode }) {
  const windows = useDream((s) => s.windows);
  const zTop = useDream((s) => s.zTop);
  const startOpen = useDream((s) => s.startOpen);
  const setStartOpen = useDream((s) => s.setStartOpen);
  const focusApp = useDream((s) => s.focusApp);
  const minimizeApp = useDream((s) => s.minimizeApp);
  const closeApp = useDream((s) => s.closeApp);
  const secretUnlocked = useDream((s) => s.secretUnlocked);
  const badges = useDream((s) => s.badges);
  const say = useDream((s) => s.say);
  const theme = useDream((s) => s.theme);
  const paper = theme === 'night' ? ART.wallpaperNight : ART.wallpaperSunrise;
  const gravity = useDream((s) => !!s.flags['fx:gravity']);
  const lantern = useDream((s) => !!s.flags['fx:lantern']);
  const tileWindows = useDream((s) => s.tileWindows);
  const [selected, setSelected] = useState<AppId | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ w: 1024, h: 700 });
  const clockTaps = useRef<number[]>([]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBounds({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBounds({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => say(window.matchMedia('(pointer: coarse)').matches ? lines.desktopHelloTouch : lines.desktopHello), 500);
    return () => window.clearTimeout(t);
  }, [say]);

  // Esc closes the focused window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || useDream.getState().startOpen) return;
      const ws = useDream.getState().windows.filter((w) => !w.min);
      if (!ws.length) return;
      const top = ws.reduce((a, b) => (a.z > b.z ? a : b));
      sfx.close();
      closeApp(top.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeApp]);

  const visible = windows.filter((w) => !w.min);
  const focusedId = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null;
  const byGroup = (g: AppDef['group']) => APPS.filter((a) => a.group === g && (a.id !== 'secretfile' || secretUnlocked));

  const onClockTap = () => {
    const now = Date.now();
    clockTaps.current = [...clockTaps.current.filter((t) => now - t < 3000), now];
    if (clockTaps.current.length >= 7) {
      clockTaps.current = [];
      window.dispatchEvent(new CustomEvent('pip:giggle-storm'));
    }
  };

  return (
    <div className={`desktop ${gravity ? "is-gravity" : ""} ${lantern ? "is-lantern" : ""}`} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
      <div className="wallpaper" aria-hidden="true">
        {paper && <img className="wallpaper__art" src={paper} alt="" />}
        <div className="wallpaper__stars" />
        {!paper && <div className="wallpaper__moon" />}
        <div className="wallpaper__clouds" />
      </div>

      <div className="desk-area" ref={areaRef} onPointerDown={(e) => { if (e.target === e.currentTarget) { setSelected(null); setStartOpen(false); } }}>
        <div className="icons">
          <div className="icon-col">
            {byGroup('me').map((a) => (
              <DesktopIcon key={a.id} app={a} selected={selected === a.id} onSelect={setSelected} />
            ))}
          </div>
          <fieldset className="work-group">
            <legend>my work ✨</legend>
            {byGroup('work').map((a) => (
              <DesktopIcon key={a.id} app={a} selected={selected === a.id} onSelect={setSelected} />
            ))}
          </fieldset>
          <div className="icon-col">
            {[...byGroup('fun'), ...byGroup('files')].map((a) => (
              <DesktopIcon key={a.id} app={a} selected={selected === a.id} onSelect={setSelected} />
            ))}
          </div>
        </div>

        <div className="desk-pip">
          <SpeechBubble className="desk-bubble" />
          <Pip width="100%" onClick={handlePipClick} badge={secretUnlocked} />
        </div>

        <AnimatePresence>
          {windows.map((w) => (
            <Window key={w.id} win={w} maximizedOnly={mode !== 'desktop'} bounds={bounds} focused={w.id === focusedId && w.z === zTop} />
          ))}
        </AnimatePresence>
      </div>

      <ErrorCascade onTidy={() => tileWindows(bounds)} />
      {lantern && <LanternLayer />}

      {startOpen && <StartMenu onClose={() => setStartOpen(false)} />}

      <div className="taskbar bevel" role="toolbar" aria-label="Taskbar">
        <button
          type="button"
          className="btn98 start-btn"
          aria-expanded={startOpen}
          aria-haspopup="menu"
          onClick={() => {
            unlockAudio();
            sfx.click();
            setStartOpen(!startOpen);
          }}
        >
          <PixelIcon name="moon" size={20} />
          <b>Start</b>
        </button>
        <div className="task-tabs">
          {windows.map((w) => (
            <button
              key={w.id}
              type="button"
              className="btn98 task-tab"
              aria-pressed={w.id === focusedId}
              onClick={() => {
                sfx.click();
                if (w.id === focusedId && !w.min) minimizeApp(w.id);
                else focusApp(w.id);
              }}
            >
              <PixelIcon name={appById[w.id].icon} size={18} />
              <span>{appById[w.id].label}</span>
            </button>
          ))}
        </div>
        <div className="tray bevel-in">
          <Odometer />
          <button type="button" className="tray-btn" aria-label={`Sticker album, ${badges.length} collected`} onClick={() => launch('stickers')}>
            ★ {badges.length}
          </button>
          <ThemeToggle className="tray-btn" />
          <MuteToggle className="tray-btn" />
          <Clock onSecretTap={onClockTap} />
        </div>
      </div>
    </div>
  );
}

