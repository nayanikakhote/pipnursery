import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Pip from '../components/Pip';
import { MuteToggle, ThemeToggle, SpeechBubble } from '../components/Controls';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio, PENTA } from '../audio/audio';
import { lines, pick } from '../content/copy';
import { STICKERS } from '../content/stickers';
import { ART, SCREENS, art } from '../content/assets';
import { prefetchPipPoses } from '../os/apps';
import { asset } from '../lib/asset';
import './nursery.css';

const HIDDEN_STARS = [
  { id: 's1', l: 13, t: 21 },
  { id: 's2', l: 90, t: 9 },
  { id: 's3', l: 57, t: 47 },
  { id: 's4', l: 30, t: 95 },
  { id: 's5', l: 96, t: 66 },
];

export function handlePipClick() {
  const st = useDream.getState();
  unlockAudio();
  sfx.giggle();
  st.setMood('giggle');
  const n = st.clickPip();
  if (!st.secretUnlocked) {
    if (n === 3) return st.say(lines.secretHint[0]);
    if (n === 4) return st.say(lines.secretHint[2]);
    if (n >= 5) {
      st.unlockSecret();
      st.award('egg-secret');
      sfx.sparkle();
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8', '#FFF8F1'] });
      return st.say(lines.secretFound);
    }
  }
  st.say(pick(lines.giggles));
}

export default function Nursery() {
  const scene = useDream((s) => s.scene);
  const setScene = useDream((s) => s.setScene);
  const say = useDream((s) => s.say);
  const visits = useDream((s) => s.visitor.visits);
  const progress = useDream((s) => s.progress);
  const secretUnlocked = useDream((s) => s.secretUnlocked);
  const reducedMotion = useDream((s) => s.reducedMotion);
  const award = useDream((s) => s.award);
  const badges = useDream((s) => s.badges);
  const [hint, setHint] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [shooting, setShooting] = useState(0);
  const [mobileWobble, setMobileWobble] = useState(0);
  const [lampWarm, setLampWarm] = useState(false);
  const [boxOpen, setBoxOpen] = useState(false);
  const [blocksTumble, setBlocksTumble] = useState(0);
  const [teddyPats, setTeddyPats] = useState(0);
  const [origin, setOrigin] = useState('70% 60%');
  const zooming = scene === 'zooming';

  // Runs once, on mount. It used to depend on `visits`, but App bumps the
  // visit count from 0 to 1 immediately after load: the effect re-ran, its
  // cleanup cancelled both timers, and a `greeted` ref stopped the second run
  // from setting new ones — so a first-time visitor was never greeted at all.
  // The count is read inside the timeout instead, by which time it is settled.
  useEffect(() => {
    prefetchPipPoses();
    const t1 = window.setTimeout(() => {
      const n = useDream.getState().visitor.visits;
      say(n > 1 ? lines.returning(n) : lines.firstHello);
    }, 900);
    const t2 = window.setTimeout(() => {
      setHint(true);
      say(lines.computerHint);
    }, 7000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [say]);

  const goComputer = () => {
    unlockAudio();
    const scr = document.querySelector('.crt__screen');
    if (scr) {
      const r = scr.getBoundingClientRect();
      setOrigin(`${r.left + r.width / 2}px ${r.top + r.height / 2}px`);
    }
    sfx.whoosh();
    setScene(reducedMotion ? 'booting' : 'zooming');
  };

  const findStar = (id: string) => {
    if (found.includes(id)) return;
    unlockAudio();
    const next = [...found, id];
    setFound(next);
    sfx.note(PENTA[Math.min(next.length - 1, 5)]);
    if (next.length === HIDDEN_STARS.length) {
      award('egg-constellation');
      sfx.sparkle();
      say('you found all my hidden stars!! look up!');
    }
  };

  const allStars = found.length === HIDDEN_STARS.length;
  const allStickers = STICKERS.every((st) => badges.includes(st.id));
  const room = ART.nurseryWide;
  const crtArt = ART.crtDesk;
  const scr = SCREENS['crt-desk'];
  const crtScreen = scr
    ? { left: `${scr.left}%`, top: `${scr.top}%`, width: `${scr.width}%`, height: `${scr.height}%` }
    : undefined;

  return (
    <div className={`nursery-scene ${progress.nightlights ? 'is-lit' : ''} ${progress.story ? 'is-bedtime' : ''}`}>
      <motion.div
        className="nursery-zoom"
        style={{ transformOrigin: origin }}
        animate={zooming ? { scale: 7, opacity: [1, 1, 0.2] } : { scale: 1, opacity: 1 }}
        transition={{ duration: zooming ? 1.05 : 0, ease: [0.6, 0, 0.3, 1] }}
        onAnimationComplete={() => {
          if (useDream.getState().scene === 'zooming') setScene('booting');
        }}
      >
        <div className="stage" aria-label="Pip's nursery">
          {room ? (
            <img className="room-img" src={room} alt="" />
          ) : (
            <div className="room" aria-hidden="true">
              <div className="room__wall" />
              <div className="room__floor" />
              <div className="room__skirting" />
              <div className="room__rug" />
              <div className="room__shelf">
                <span className="book b1" />
                <span className="book b2" />
                <span className="book b3" />
                <span className={`mini-book ${progress.bedtime ? 'on' : ''}`} />
              </div>
              <div className={`room__door ${progress.growth ? 'marked' : ''}`} />
            </div>
          )}

          {/* window */}
          <button type="button" className="win-round" aria-label="The window, look for a shooting star" onClick={() => { unlockAudio(); sfx.sparkle(); setShooting((n) => n + 1); }}>
            <span className="win-round__sky">
              <span className="win-round__moon" />
              <span className="win-round__roofs" />
              {progress.routes && <span className="win-round__lights" />}
              {shooting > 0 && <span key={shooting} className="shooting-star" />}
            </span>
          </button>

          {/* hanging mobile */}
          <button
            type="button"
            className={`mobile ${progress.lullaby ? 'mobile--fast' : ''}`}
            aria-label="Pip's hanging mobile, ring it"
            onClick={() => {
              unlockAudio();
              sfx.chime();
              setMobileWobble((n) => n + 1);
            }}
          >
            {ART.mobile ? (
              <img key={mobileWobble} className={`mobile__art ${mobileWobble ? 'wobble' : ''}`} src={ART.mobile} alt="" draggable={false} />
            ) : (
            <svg key={mobileWobble} viewBox="0 0 200 170" className={mobileWobble ? 'wobble' : ''} aria-hidden="true">
              <line x1="100" y1="0" x2="100" y2="34" stroke="#c9b8e8" strokeWidth="2" />
              <rect x="30" y="32" width="140" height="6" rx="3" fill="#b98157" />
              <g className="dangle d1">
                <line x1="40" y1="38" x2="40" y2="96" stroke="#c9b8e8" strokeWidth="1.5" />
                <path d="M40 92 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2z" fill="#F4C96B" stroke="#d9a441" strokeWidth="2" />
              </g>
              <g className="dangle d2">
                <line x1="78" y1="38" x2="78" y2="118" stroke="#c9b8e8" strokeWidth="1.5" />
                <path d="M86 116 a20 20 0 1 0 0 34 a16 16 0 1 1 0 -34z" fill="#F4C96B" stroke="#d9a441" strokeWidth="2" />
              </g>
              <g className="dangle d3">
                <line x1="122" y1="38" x2="122" y2="84" stroke="#c9b8e8" strokeWidth="1.5" />
                <ellipse cx="122" cy="94" rx="20" ry="11" fill="#fff8f1" />
                <ellipse cx="112" cy="90" rx="10" ry="9" fill="#fff8f1" />
                <ellipse cx="130" cy="88" rx="11" ry="10" fill="#fff8f1" />
              </g>
              <g className="dangle d4">
                <line x1="160" y1="38" x2="160" y2="108" stroke="#c9b8e8" strokeWidth="1.5" />
                <path d="M160 104 l5 10 11 2 -8 8 2 11 -10 -6 -10 6 2 -11 -8 -8 11 -2z" fill="#EFC6D2" stroke="#d99fb3" strokeWidth="2" />
              </g>
            </svg>
            )}
          </button>

          {/* warm lamp glow */}
          <div className={`lamp-glow ${lampWarm ? 'warm' : ''}`} aria-hidden="true" />

          {/* the CRT computer on its desk. Pip's drawn computer was rendered
              with a green screen; the live screen sits exactly where the green
              was, so the zoom origin still lands on the glass. */}
          <button type="button" className={`crt ${crtArt ? 'crt--art' : ''} ${hint ? 'crt--hint' : ''}`} onClick={goComputer} aria-label="Pip's computer, open DreamOS">
            {crtArt ? (
              <>
                <img className="crt__art" src={crtArt} alt="" draggable={false} />
                <span className="crt__screen" style={crtScreen} aria-hidden="true">
                  <span className="crt__text">
                    DreamOS
                    <br />
                    <small>
                      click me<i className="blink-cursor">_</i>
                    </small>
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="crt__desk" aria-hidden="true">
                  <span className="crt__leg l" />
                  <span className="crt__leg r" />
                </span>
                <span className="crt__monitor" aria-hidden="true">
                  <span className="crt__screen">
                    <span className="crt__text">
                      DreamOS
                      <br />
                      <small>
                        click me<i className="blink-cursor">_</i>
                      </small>
                    </span>
                  </span>
                  <span className="crt__led" />
                </span>
                <span className="crt__neck" aria-hidden="true" />
                <span className="crt__keyboard" aria-hidden="true" />
              </>
            )}
          </button>

          {/* music box */}
          <button
            type="button"
            className={`obj music-box ${boxOpen ? 'open' : ''}`}
            aria-label="Music box, play a little tune"
            onClick={() => {
              unlockAudio();
              setBoxOpen(true);
              [0, 2, 4, 2, 3, 1, 0].forEach((n, i) => sfx.note(PENTA[n], i * 0.32, 0.07));
              window.setTimeout(() => setBoxOpen(false), 2400);
            }}
          >
            <img src={asset('assets/music-box.webp')} alt="" draggable={false} />
          </button>

          {/* dream lantern */}
          <button
            type="button"
            className={`obj lantern ${lampWarm ? 'on' : ''}`}
            aria-label="Dream lantern, make it glow"
            onClick={() => {
              unlockAudio();
              sfx.chime();
              setLampWarm(true);
              window.setTimeout(() => setLampWarm(false), 3200);
            }}
          >
            <img src={asset('assets/dream-lantern.webp')} alt="" draggable={false} />
          </button>

          {/* toy blocks */}
          <button
            type="button"
            className={`obj blocks ${progress.toys ? 'spelled' : ''}`}
            aria-label="Toy blocks, knock them over"
            onClick={() => {
              unlockAudio();
              sfx.clack();
              setBlocksTumble((n) => n + 1);
            }}
          >
            <span key={blocksTumble} className={blocksTumble ? 'tumble' : ''}>
              {(['pink', 'lilac', 'gold'] as const).map((c, i) => {
                const face = art(`block-${c}`);
                return face ? (
                  <i key={c} className="blk blk--art">
                    <img src={face} alt="" draggable={false} />
                    <b>{'PIP'[i]}</b>
                  </i>
                ) : (
                  <i key={c} className={`blk b-${c === 'lilac' ? 'lav' : c}`}>
                    {'PIP'[i]}
                  </i>
                );
              })}
            </span>
          </button>

          {/* teddy — he is also hiding something (easter egg 3) */}
          {ART.teddy && (
            <button
              type="button"
              className="obj teddy"
              aria-label="Pip's teddy, give him a squeeze"
              onClick={() => {
                unlockAudio();
                sfx.pop();
                const next = teddyPats + 1;
                setTeddyPats(next);
                if (next >= 3) {
                  setTeddyPats(0);
                  if (award('egg-teddy')) sfx.sparkle();
                  say(lines.teddy);
                } else {
                  say(pick(lines.giggles));
                }
              }}
            >
              <img src={ART.teddy} alt="" draggable={false} />
            </button>
          )}

          {/* Pip. Once the story has been read he is asleep under the stars,
              and clicking only gets a sleepy wriggle. */}
          <div className="nursery-pip">
            <Pip width="100%" onClick={progress.story ? undefined : handlePipClick} mood={progress.story ? 'asleep' : undefined} badge={secretUnlocked} />
            {progress.story && (
              <button
                type="button"
                className="pip-tuck"
                aria-label="Pip is asleep. Tuck him in."
                onClick={() => {
                  sfx.pop();
                  say('mmh… five more minutes…');
                }}
              />
            )}
          </div>
          <SpeechBubble className="nursery-bubble" />

          {/* hidden stars easter egg */}
          {HIDDEN_STARS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`hidden-star ${found.includes(s.id) ? 'found' : ''}`}
              style={{ left: `${s.l}%`, top: `${s.t}%` }}
              aria-label="a tiny star"
              onClick={() => findStar(s.id)}
            >
              ★
            </button>
          ))}
          {allStars && (
            <svg className="pip-constellation" viewBox="0 0 300 100" aria-hidden="true">
              <polyline points="20,85 20,20 55,20 55,50 20,50" />
              <polyline points="120,20 120,85" />
              <polyline points="190,85 190,20 225,20 225,50 190,50" />
              {[
                [20, 85], [20, 20], [55, 20], [55, 50], [20, 50], [120, 20], [120, 85], [190, 85], [190, 20], [225, 20], [225, 50], [190, 50],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </svg>
          )}
          {progress.routes && <div className="wall-stars" aria-hidden="true" />}
          {progress.story && <div className="ceiling-stars" aria-hidden="true" />}
        </div>
      </motion.div>

      {allStickers && (
        <div className="dreamy-banner" role="status">
          <span>★ 100% DREAMY ★ you found everything ★ pip is SO proud ★</span>
          <span aria-hidden="true">★ 100% DREAMY ★ you found everything ★ pip is SO proud ★</span>
        </div>
      )}

      {zooming && <div className="zoom-flash" aria-hidden="true" />}

      {visits > 1 && !zooming && (
        <button type="button" className="btn98 skip-btn" onClick={goComputer} aria-label="Skip the room and go straight to Pip's computer">
          <span className="skip-btn__long">go straight to my computer →</span>
          <span className="skip-btn__short">skip →</span>
        </button>
      )}

      <div className="corner-controls">
        <ThemeToggle />
        <MuteToggle />
      </div>
    </div>
  );
}
