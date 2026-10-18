import { Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDream } from '../store/dreamStore';
import { APPS, appById, prefetchApps } from '../os/apps';
import PixelIcon from '../components/PixelIcon';
import Pip from '../components/Pip';
import { SpeechBubble, MuteToggle, ThemeToggle } from '../components/Controls';
import Odometer from '../components/Odometer';
import { sfx } from '../audio/audio';
import { launch } from './Desktop';
import { handlePipClick } from './Nursery';
import './dreampad.css';

// Phone layout: DreamOS squeezed into a pastel handheld "DreamPad".
export default function DreamPad() {
  const windows = useDream((s) => s.windows);
  const closeApp = useDream((s) => s.closeApp);
  const closeAll = useDream((s) => s.closeAll);
  const setScene = useDream((s) => s.setScene);
  const secretUnlocked = useDream((s) => s.secretUnlocked);
  const badges = useDream((s) => s.badges);
  const say = useDream((s) => s.say);

  const visible = windows.filter((w) => !w.min);
  const top = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)) : null;
  const def = top ? appById[top.id] : null;
  const Comp = def?.component;

  useEffect(() => {
    prefetchApps();
    const t = window.setTimeout(() => say('welcome to my dreampad! tap anything.'), 500);
    return () => window.clearTimeout(t);
  }, [say]);

  const back = () => {
    sfx.close();
    if (top) closeApp(top.id);
    else {
      setScene('nursery');
    }
  };

  const apps = APPS.filter((a) => a.id !== 'secretfile' || secretUnlocked);
  const work = apps.filter((a) => a.group === 'work');
  const rest = apps.filter((a) => a.group !== 'work');

  return (
    <div className="dreampad">
      <div className="dp-device">
        <div className="dp-screen">
          <div className="dp-status">
            <span className="dp-brand">
              Dream<b>Pad</b>
            </span>
            <Odometer compact />
            <span className="dp-stars">★{badges.length}</span>
          </div>

          <div className="dp-content">
            <AnimatePresence mode="wait" initial={false}>
              {def && Comp ? (
                <motion.div
                  key={def.id}
                  className="dp-app"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                >
                  <div className="dp-app__bar">
                    <button type="button" className="dp-app__back" onClick={back} aria-label="Back">
                      ◀
                    </button>
                    <PixelIcon name={def.icon} size={20} />
                    <span>{def.title}</span>
                  </div>
                  <div className="dp-app__body">
                    <Suspense fallback={<div className="win98__loading">loading dreams…</div>}>
                      <Comp />
                    </Suspense>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="home" className="dp-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="dp-pip">
                    <Pip width="96px" onClick={handlePipClick} badge={secretUnlocked} />
                    <SpeechBubble className="dp-bubble" />
                  </div>
                  <h2 className="dp-h">my work ✨</h2>
                  <div className="dp-grid">
                    {work.map((a) => (
                      <button key={a.id} type="button" className="dp-icon" onClick={() => launch(a.id)}>
                        <PixelIcon name={a.icon} size={44} />
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                  <h2 className="dp-h">everything else</h2>
                  <div className="dp-grid">
                    {rest.map((a) => (
                      <button key={a.id} type="button" className="dp-icon" onClick={() => launch(a.id)}>
                        <PixelIcon name={a.icon} size={40} />
                        <span>{a.label}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="dp-icon"
                      onClick={() => {
                        sfx.yawn();
                        setScene('shutdown');
                      }}
                    >
                      <PixelIcon name="sleepfile" size={40} />
                      <span>Shut Down…</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="dp-buttons" role="toolbar" aria-label="DreamPad buttons">
          <button type="button" className="dp-btn" onClick={back} aria-label={top ? 'Back' : 'Back to my room'}>
            ◀
          </button>
          <button
            type="button"
            className="dp-btn dp-btn--home"
            onClick={() => {
              sfx.click();
              closeAll();
            }}
            aria-label="Home"
          >
            ●
          </button>
          <button type="button" className="dp-btn" onClick={() => launch('stickers')} aria-label="Sticker album">
            ★
          </button>
          <ThemeToggle className="dp-btn" />
          <MuteToggle className="dp-btn" />
        </div>
      </div>
    </div>
  );
}
