import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { RATTLE_ART, art } from '../content/assets';
import { lazy, Suspense } from 'react';
import './toys.css';

const StackTheDreams = lazy(() => import('./toys/StackTheDreams'));
const MatchTheDream = lazy(() => import('./toys/MatchTheDream'));
const DreamCatch = lazy(() => import('./toys/DreamCatch'));

type Tab = 'rattles' | 'blocks' | 'stack' | 'match' | 'catch';

/* ------------------------------------------------------------------ rattles */

interface Rattle {
  id: 'star' | 'moon' | 'bone';
  name: string;
  note: string;
  sound: () => void;
  art?: string;
}

const RATTLES: Rattle[] = [
  { id: 'star', name: 'Star Rattle', note: 'it goes *ting*. my first one.', sound: () => sfx.jingle(), art: RATTLE_ART.star },
  { id: 'moon', name: 'Moon Rattle', note: 'there is a real bell in there. granny owl helped.', sound: () => sfx.clack(), art: RATTLE_ART.moon },
  { id: 'bone', name: 'Bone Rattle', note: "it's for a dog. i have not met a dog yet.", sound: () => sfx.shuffle(), art: RATTLE_ART.bone },
];

function Rattles({ onBand }: { onBand: (id: string) => void }) {
  const [shaking, setShaking] = useState<Record<string, number>>({});
  const [bursts, setBursts] = useState<{ id: number; which: string; x: number }[]>([]);
  const burstId = useRef(0);
  const dragging = useRef<{ id: string; x: number; last: number } | null>(null);

  const shake = useCallback(
    (r: Rattle, x = 50) => {
      unlockAudio();
      r.sound();
      onBand(r.id);
      setShaking((s) => ({ ...s, [r.id]: (s[r.id] ?? 0) + 1 }));
      const b = burstId.current++;
      setBursts((p) => [...p.slice(-10), { id: b, which: r.id, x }]);
      window.setTimeout(() => setBursts((p) => p.filter((q) => q.id !== b)), 900);
    },
    [onBand],
  );

  // Dragging back and forth rattles continuously: each change of direction
  // past a small threshold is one shake, so faster waggling really is noisier.
  const onDown = (r: Rattle) => (e: React.PointerEvent) => {
    dragging.current = { id: r.id, x: e.clientX, last: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (r: Rattle) => (e: React.PointerEvent) => {
    const d = dragging.current;
    if (!d || d.id !== r.id) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) < 16) return;
    const dir = Math.sign(dx);
    if (dir !== d.last) {
      d.last = dir;
      d.x = e.clientX;
      const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
      shake(r, ((e.clientX - box.left) / box.width) * 100);
    }
  };
  const onUp = () => {
    dragging.current = null;
  };

  const canShakePhone = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
  const [motionOn, setMotionOn] = useState(false);
  useEffect(() => {
    if (!motionOn) return;
    let last = 0;
    const on = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const now = Date.now();
      if (mag > 22 && now - last > 320) {
        last = now;
        shake(RATTLES[Math.floor(Math.random() * RATTLES.length)]);
      }
    };
    window.addEventListener('devicemotion', on);
    return () => window.removeEventListener('devicemotion', on);
  }, [motionOn, shake]);

  const askMotion = async () => {
    unlockAudio();
    const DME = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (typeof DME?.requestPermission === 'function') {
        const res = await DME.requestPermission();
        if (res !== 'granted') return;
      }
      setMotionOn(true);
    } catch {
      /* no motion permission: tapping still works, which is the point */
    }
  };

  return (
    <div className="toys__panel">
      <p className="toys__intro">i invented toys! some of them even work. go on, shake one.</p>
      <div className="rattles">
        {RATTLES.map((r) => (
          <div className="rattle" key={r.id}>
            <button
              type="button"
              className={`rattle__btn ${shaking[r.id] ? 'is-shaking' : ''}`}
              key={`${r.id}-${shaking[r.id] ?? 0}`}
              onClick={() => shake(r)}
              onPointerDown={onDown(r)}
              onPointerMove={onMove(r)}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              aria-label={`${r.name}. Tap to shake it, or drag it back and forth.`}
            >
              {r.art ? <img src={r.art} alt="" draggable={false} loading="lazy" decoding="async" /> : <span className={`rattle__css rattle__css--${r.id}`} aria-hidden="true" />}
              <span className="rattle__burst" aria-hidden="true">
                {bursts
                  .filter((b) => b.which === r.id)
                  .map((b) => (
                    <i key={b.id} style={{ left: `${b.x}%`, ['--a' as string]: `${Math.random() * 360}deg` }} />
                  ))}
              </span>
            </button>
            <h3>{r.name}</h3>
            <p>“{r.note}”</p>
          </div>
        ))}
      </div>
      <p className="toys__hint">
        tap one, or drag it side to side to keep it going.
        {canShakePhone && !motionOn && (
          <>
            {' '}
            <button type="button" className="btn98 toys__motion" onClick={askMotion}>
              or shake your phone 📳
            </button>
          </>
        )}
        {motionOn && <b> shake away! i can feel it.</b>}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- blocks */

const COLS = 6;
const ROWS = 3;
const LETTERS = ['P', 'I', 'P', 'Z', 'Z', 'Z'];
const TINTS = ['pink', 'lilac', 'gold', 'cream', 'pink', 'lilac'] as const;

interface Placed {
  i: number; // block index
  col: number;
  row: number; // 0 = floor
}

function Blocks({ onSpell }: { onSpell: (word: 'PIP' | 'ZZZ') => void }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [held, setHeld] = useState<number | null>(null);
  const [tumble, setTumble] = useState(0);
  const spelled = useRef<Set<string>>(new Set());

  const onFloor = (col: number) => placed.filter((p) => p.col === col).length;

  const pick = (i: number) => {
    unlockAudio();
    sfx.click();
    setHeld(held === i ? null : i);
  };

  const drop = (col: number) => {
    unlockAudio();
    if (held === null) return;
    const row = onFloor(col);
    if (row >= ROWS) {
      sfx.bonk();
      return;
    }
    sfx.clack();
    setPlaced((p) => [...p.filter((q) => q.i !== held), { i: held, col, row }]);
    setHeld(null);
  };

  const takeBack = (i: number) => {
    unlockAudio();
    sfx.click();
    setPlaced((p) => p.filter((q) => q.i !== i));
    setHeld(i);
  };

  // look for PIP or ZZZ spelled left-to-right along any row
  useEffect(() => {
    const grid: (string | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    placed.forEach((p) => {
      grid[p.row][p.col] = LETTERS[p.i];
    });
    for (const row of grid) {
      const line = row.map((c) => c ?? '.').join('');
      for (const word of ['PIP', 'ZZZ'] as const) {
        if (line.includes(word) && !spelled.current.has(word)) {
          spelled.current.add(word);
          onSpell(word);
        }
      }
    }
  }, [placed, onSpell]);

  const wobble = () => {
    unlockAudio();
    sfx.shuffle();
    setTumble((n) => n + 1);
    window.setTimeout(() => {
      // a soft knock: the top block of the tallest column falls back to the tray
      setPlaced((p) => {
        if (!p.length) return p;
        const top = p.reduce((a, b) => (b.row > a.row ? b : a));
        sfx.clack();
        return p.filter((q) => q.i !== top.i);
      });
    }, 420);
  };

  const inTray = LETTERS.map((_, i) => i).filter((i) => !placed.some((p) => p.i === i));

  return (
    <div className="toys__panel">
      <p className="toys__intro">six blocks. i can only spell two things, but i am very proud of both.</p>

      <div className={`blocks-floor ${tumble ? 'is-wobbling' : ''}`} key={tumble}>
        {Array.from({ length: COLS }, (_, col) => (
          <button
            key={col}
            type="button"
            className={`bcol ${held !== null ? 'is-ready' : ''}`}
            onClick={() => drop(col)}
            disabled={held === null}
            aria-label={`Column ${col + 1}, ${onFloor(col)} blocks. ${held !== null ? 'Place the held block here.' : 'Pick up a block first.'}`}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const p = placed.find((q) => q.col === col && q.row === ROWS - 1 - r);
              if (!p) return <span key={r} className="bslot" aria-hidden="true" />;
              return (
                <span
                  key={r}
                  className={`bblock t-${TINTS[p.i]}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    takeBack(p.i);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      takeBack(p.i);
                    }
                  }}
                  aria-label={`Block ${LETTERS[p.i]} in column ${col + 1}. Press to pick it back up.`}
                >
                  {art(`block-${TINTS[p.i]}`) && <img src={art(`block-${TINTS[p.i]}`)} alt="" draggable={false} />}
                  <b>{LETTERS[p.i]}</b>
                </span>
              );
            })}
          </button>
        ))}
      </div>

      <div className="btray" role="group" aria-label="Blocks to place">
        {inTray.length === 0 && <span className="btray__empty">all stacked! tap a block to take it back.</span>}
        {inTray.map((i) => (
          <button
            key={i}
            type="button"
            className={`bblock bblock--tray t-${TINTS[i]} ${held === i ? 'is-held' : ''}`}
            onClick={() => pick(i)}
            aria-pressed={held === i}
            aria-label={`Block ${LETTERS[i]}${held === i ? ', held' : ''}`}
          >
            {art(`block-${TINTS[i]}`) && <img src={art(`block-${TINTS[i]}`)} alt="" draggable={false} />}
            <b>{LETTERS[i]}</b>
          </button>
        ))}
      </div>

      <div className="toys__controls">
        <button type="button" className="btn98" onClick={wobble} disabled={!placed.length}>
          wobble it
        </button>
        <button
          type="button"
          className="btn98"
          onClick={() => {
            sfx.shuffle();
            setPlaced([]);
            setHeld(null);
          }}
          disabled={!placed.length}
        >
          start over
        </button>
        <span className="toys__hint">
          {held !== null ? `holding “${LETTERS[held]}” — now tap a column` : 'tap a block, then tap a column'}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- app */

export default function RattleAndBlocks() {
  const complete = useDream((s) => s.complete);
  const award = useDream((s) => s.award);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const [tab, setTab] = useState<Tab>('rattles');
  const band = useRef<Record<string, number>>({});

  // All three rattles inside three seconds is a band.
  const onBand = useCallback(
    (id: string) => {
      const now = Date.now();
      band.current[id] = now;
      const fresh = Object.values(band.current).filter((t) => now - t < 3000);
      if (fresh.length >= RATTLES.length) {
        band.current = {};
        if (complete('toys')) {
          setMood('cheer');
          say("a band!! we're a band!!");
          sfx.giggle();
        }
      }
    },
    [complete, setMood, say],
  );

  const onSpell = useCallback(
    (word: 'PIP' | 'ZZZ') => {
      if (word === 'PIP') {
        sfx.giggle();
        setMood('cheer');
        say("that's ME!! you spelled me!");
        award('toy-pip');
      } else {
        sfx.yawn();
        setMood('asleep');
        say('zzz… you spelled a nap. very powerful.');
        window.setTimeout(() => useDream.getState().setMood('idle'), 5000);
      }
    },
    [award, setMood, say],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: 'rattles', label: 'Rattles' },
    { id: 'blocks', label: 'Blocks' },
    { id: 'stack', label: 'Stack the Dreams' },
    { id: 'match', label: 'Match the Dream' },
    { id: 'catch', label: 'Dream Catch' },
  ];

  const win = (badge: string, line: string) => () => {
    if (award(badge)) {
      setMood('cheer');
      say(line);
    }
  };

  return (
    <div className="toys">
      <div className="tabs98" role="tablist" aria-label="Pip's toys">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            className="tab98"
            aria-selected={tab === t.id}
            aria-controls={`toys-${t.id}`}
            id={`toystab-${t.id}`}
            onClick={() => {
              sfx.click();
              setTab(t.id);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="toys__body" role="tabpanel" id={`toys-${tab}`} aria-labelledby={`toystab-${tab}`}>
        <Suspense fallback={<p className="toys__loading mono">getting the toy out…</p>}>
          {tab === 'rattles' && <Rattles onBand={onBand} />}
          {tab === 'blocks' && <Blocks onSpell={onSpell} />}
          {tab === 'stack' && <StackTheDreams onWin={win('game-stack', 'four whole dreams, stacked. you have a knack.')} />}
          {tab === 'match' && <MatchTheDream onWin={win('game-match', 'every pair!! my memory is terrible, so that was all you.')} />}
          {tab === 'catch' && <DreamCatch onWin={win('game-catch', "that's a whole night's deliveries in twenty seconds.")} />}
        </Suspense>
      </div>
    </div>
  );
}
