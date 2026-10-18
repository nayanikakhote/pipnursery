import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useDream, type PipMood } from './store/dreamStore';
import { setMuted, sfx, unlockAudio } from './audio/audio';
import { installPointerTracking } from './lib/pointer';
import { useMode, usePrefersReducedMotion } from './hooks/useMode';
import { lines } from './content/copy';
import { Toast } from './components/Controls';
import SparkleTrail from './components/SparkleTrail';
import Nursery from './scenes/Nursery';
import Boot, { ShutDown } from './scenes/Boot';
import Desktop from './scenes/Desktop';
import DreamPad from './scenes/DreamPad';
import Finale from './scenes/Finale';
import SecretRoom from './scenes/SecretRoom';
import './scenes/desktop.css';

const TRANSIENT: Partial<Record<PipMood, number>> = {
  giggle: 1300,
  cheer: 1700,
  yawn: 1800,
  sneeze: 900,
  whoa: 1000,
};

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function App() {
  const scene = useDream((s) => s.scene);
  const theme = useDream((s) => s.theme);
  const mood = useDream((s) => s.mood);
  const soundOn = useDream((s) => s.soundOn);
  const reducedPref = useDream((s) => s.reducedMotion);
  const systemReduced = usePrefersReducedMotion();
  const mode = useMode();
  const lastInput = useRef(performance.now());
  const prevMode = useRef(mode);

  // once: visit, pointer tracking, audio unlock, console hello
  useEffect(() => {
    useDream.getState().registerVisit();
    installPointerTracking();
    setMuted(!useDream.getState().soundOn);
    if (!useDream.getState().soundOn) useDream.getState().setMood('pout');
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
  }, []);

  useEffect(() => setMuted(!soundOn), [soundOn]);

  // theme + motion flags on <html>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#30364E' : '#F7DBE6');
  }, [theme]);
  const reduced = reducedPref || systemReduced;
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
  }, [reduced]);

  // transient moods go back to idle (or pout while muted)
  useEffect(() => {
    const ms = TRANSIENT[mood];
    if (!ms) return;
    const t = window.setTimeout(() => {
      const st = useDream.getState();
      if (st.mood === mood) st.setMood(st.soundOn ? 'idle' : 'pout');
    }, ms);
    return () => window.clearTimeout(t);
  }, [mood]);

  // idle: yawn at 20s, asleep at 45s, wake on input
  useEffect(() => {
    const onInput = () => {
      lastInput.current = performance.now();
      const st = useDream.getState();
      // Only wake Pip when he nodded off by himself. Several scenes put him
      // to sleep deliberately — the finale, the secret room, the shutdown
      // screen, and his own room once the story has been read — and a mouse
      // move there used to make him announce he was "just resting my eye
      // sockets" in the middle of his own goodnight.
      const tuckedIn =
        st.scene === 'finale' ||
        st.scene === 'secret' ||
        st.scene === 'shutdown' ||
        (st.scene === 'nursery' && st.progress.story);
      if (st.mood === 'asleep' && !tuckedIn) {
        st.setMood('whoa');
        st.say(lines.wake);
      }
    };
    const evts = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    evts.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    const iv = window.setInterval(() => {
      const st = useDream.getState();
      const idle = performance.now() - lastInput.current;
      if (st.scene !== 'nursery' && st.scene !== 'desktop') return;
      if (st.scene === 'nursery' && st.progress.story) return;
      if (idle > 45000 && st.mood !== 'asleep') st.setMood('asleep');
      else if (idle > 20000 && idle < 21500 && (st.mood === 'idle' || st.mood === 'pout')) {
        st.setMood('yawn');
        st.say(lines.idle);
        sfx.yawn();
      }
    }, 1000);
    return () => {
      evts.forEach((e) => window.removeEventListener(e, onInput));
      window.clearInterval(iv);
    };
  }, []);

  // Konami code / 7 clock taps → giggle storm
  useEffect(() => {
    let seq: string[] = [];
    const storm = () => {
      const st = useDream.getState();
      unlockAudio();
      sfx.giggle();
      window.setTimeout(() => sfx.giggle(), 400);
      st.setMood('cheer');
      st.say('GIGGLE STORM!!! hehehehe');
      if (st.award('egg-giggle')) sfx.sparkle();
      document.documentElement.classList.add('giggle-storm');
      window.setTimeout(() => document.documentElement.classList.remove('giggle-storm'), 6000);
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8', '#FFF8F1', '#A34063'] });
    };
    const onKey = (e: KeyboardEvent) => {
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        storm();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pip:giggle-storm', storm);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pip:giggle-storm', storm);
    };
  }, []);

  // Responsive chaos: crossing a breakpoint is noticed by Pip
  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    const st = useDream.getState();
    st.setMood('whoa');
    st.say(lines.whoa);
    const short = window.innerHeight < 450 && window.innerWidth > window.innerHeight;
    st.showToast(
      short
        ? 'rearranging the furniture…'
        : mode === 'phone'
          ? 'packing DreamOS into my DreamPad…'
          : mode === 'tablet'
            ? 'squishing the windows…'
            : 'unpacking my big desk…',
    );
    if (short) window.setTimeout(() => useDream.getState().say('oh! lying down. comfy.'), 500);
    sfx.whoosh();
  }, [mode]);

  const osScene = mode === 'phone' ? <DreamPad /> : <Desktop mode={mode} />;

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.main
          key={scene === 'zooming' ? 'nursery' : scene}
          className="scene-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: scene === 'desktop' ? 0.35 : 0.25 }}
        >
          {(scene === 'nursery' || scene === 'zooming') && <Nursery />}
          {scene === 'booting' && <Boot />}
          {scene === 'desktop' && osScene}
          {scene === 'finale' && <Finale />}
          {scene === 'secret' && <SecretRoom />}
          {scene === 'shutdown' && <ShutDown />}
        </motion.main>
      </AnimatePresence>
      <Toast />
      <SparkleTrail />
    </>
  );
}
