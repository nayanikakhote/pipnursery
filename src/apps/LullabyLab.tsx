import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDream } from '../store/dreamStore';
import { PENTA, clock, sfx, unlockAudio } from '../audio/audio';
import { asset } from '../lib/asset';
import './lullaby.css';

// A step is an index into the pentatonic scale, or REST.
const REST = -1;
const STEPS = 8;
const NOTE_NAMES = ['C', 'D', 'E', 'G', 'A', 'C↑'];

type Pattern = number[];

interface Preset {
  id: string;
  name: string;
  by: string;
  pattern: Pattern;
  secret?: boolean;
}

const PRESETS: Preset[] = [
  { id: 'hum', name: "Pip's Hum", by: 'the one i hum without noticing', pattern: [0, 2, 4, 2, 3, 1, 0, REST] },
  { id: 'twinkle', name: 'Twinkle', by: 'everyone knows this one', pattern: [0, 0, 3, 3, 4, 4, 3, REST] },
  { id: 'boo', name: "Boo's Brave Song", by: 'for when the dark feels big', pattern: [0, 2, 3, 4, 5, 4, 2, 0] },
  { id: 'secret', name: "Pip's Secret Song", by: 'the one i only hum when nobody is listening', pattern: [5, 4, 2, 0, 2, 4, 5, REST], secret: true },
];

/** Random, but still pleasant: starts and ends on C, never more than two rests. */
function randomDream(): Pattern {
  const out: Pattern = new Array(STEPS).fill(0);
  let rests = 0;
  for (let i = 1; i < STEPS - 1; i++) {
    const wantRest = Math.random() < 0.2 && rests < 2;
    if (wantRest) {
      out[i] = REST;
      rests++;
    } else {
      out[i] = Math.floor(Math.random() * PENTA.length);
    }
  }
  out[0] = 0;
  out[STEPS - 1] = Math.random() < 0.5 ? 0 : 5;
  return out;
}

export default function LullabyLab() {
  const complete = useDream((s) => s.complete);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const award = useDream((s) => s.award);
  const setFlag = useDream((s) => s.setFlag);
  const flags = useDream((s) => s.flags);
  const reducedMotion = useDream((s) => s.reducedMotion);

  const secretSong = !!flags['lullaby:secret'];

  const [winds, setWinds] = useState(0);
  const [pattern, setPattern] = useState<Pattern>(PRESETS[0].pattern);
  const [presetId, setPresetId] = useState('hum');
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [stepMs, setStepMs] = useState(520);
  const [cursor, setCursor] = useState(0);

  const open = winds >= 3;
  const gridRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const loop = useRef<number | null>(null);
  const live = useRef({ pattern, stepMs });
  live.current = { pattern, stepMs };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const stop = useCallback(() => {
    if (loop.current !== null) window.clearInterval(loop.current);
    loop.current = null;
    clearTimers();
    setPlaying(false);
    setActive(-1);
  }, []);

  useEffect(() => stop, [stop]);

  // Notes are scheduled against the audio clock with a short lookahead, so the
  // tune never drifts the way a bare setInterval would.
  const play = () => {
    unlockAudio();
    if (playing) return stop();
    setPlaying(true);
    const start = clock() + 0.12;
    let step = 0;
    let next = start;
    let loops = 0;

    const tick = () => {
      const t = clock();
      while (next < t + 0.15) {
        const { pattern: pat, stepMs: ms } = live.current;
        const dur = ms / 1000;
        const when = next - t;
        const i = step;
        const value = pat[i];
        if (value !== REST) sfx.note(PENTA[value], Math.max(0, when), 0.1);
        timers.current.push(window.setTimeout(() => setActive(i), Math.max(0, when * 1000)));
        next += dur;
        step++;
        if (step >= STEPS) {
          step = 0;
          loops++;
          if (loops === 1) {
            const delay = Math.max(0, when * 1000);
            timers.current.push(window.setTimeout(finishOnce, delay));
          }
        }
      }
    };
    tick();
    loop.current = window.setInterval(tick, 25);
  };

  const finishOnce = () => {
    setFlag('lullaby:played');
    if (complete('lullaby')) {
      setMood('cheer');
      say('a lullaby!! the frogs will love it.');
      sfx.sparkle();
      if (!reducedMotion) {
        confetti({
          particleCount: 55,
          spread: 60,
          scalar: 0.8,
          origin: { y: 0.6 },
          colors: ['#F4C96B', '#EFC6D2', '#C9B8E8', '#FFF8F1'],
        });
      }
    }
  };

  const wind = () => {
    unlockAudio();
    sfx.clack();
    const n = winds + 1;
    setWinds(n);
    if (n === 3) {
      sfx.chime();
      setMood('giggle');
      say('listen! the stars come out when it opens.');
    }
  };

  const cycle = (i: number, back = false) => {
    unlockAudio();
    setPattern((p) => {
      const next = [...p];
      const v = next[i];
      next[i] = back ? (v <= REST ? PENTA.length - 1 : v - 1) : v >= PENTA.length - 1 ? REST : v + 1;
      if (next[i] !== REST) sfx.note(PENTA[next[i]], 0, 0.07);
      else sfx.click();
      return next;
    });
    setPresetId('custom');
  };

  const choosePreset = (p: Preset | 'random') => {
    unlockAudio();
    sfx.open();
    if (p === 'random') {
      setPattern(randomDream());
      setPresetId('random');
      say('ooh. i have never heard that one before.');
      return;
    }
    setPattern(p.pattern);
    setPresetId(p.id);
  };

  const onGridKey = (e: React.KeyboardEvent) => {
    const move = (to: number) => {
      e.preventDefault();
      const n = (to + STEPS) % STEPS;
      setCursor(n);
      gridRef.current?.querySelectorAll<HTMLButtonElement>('.step')[n]?.focus();
    };
    if (e.key === 'ArrowRight') move(cursor + 1);
    else if (e.key === 'ArrowLeft') move(cursor - 1);
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      cycle(cursor);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      cycle(cursor, true);
    }
  };

  // Egg 4: a playthrough, then the nightlights lit in the right order.
  useEffect(() => {
    if (secretSong) return;
    if (!flags['lullaby:played']) return;
    if (flags['light:order'] !== 'moonbeam,starling,cloudberry') return;
    setFlag('lullaby:secret');
    if (award('egg-secretsong')) {
      sfx.sparkle();
      setMood('giggle');
      say('…how did you know the order? that one is MY song.');
    }
  }, [flags, secretSong, setFlag, award, setMood, say]);

  const presets = PRESETS.filter((p) => !p.secret || secretSong);

  return (
    <div className="lab">
      <p className="lab__intro">creatures can't sleep without a song. so i make them. you can make one too!</p>

      {/* --- the music box --- */}
      <div className={`boxstage ${open ? 'is-open' : ''}`}>
        <svg className="orbit" viewBox="0 0 300 300" aria-hidden="true">
          <circle className="orbit__ring" cx="150" cy="150" r="118" />
          <circle className="orbit__ring orbit__ring--2" cx="150" cy="150" r="92" />
          {open &&
            pattern.map((v, i) => {
              const a = (i / STEPS) * Math.PI * 2 - Math.PI / 2;
              const r = v === REST ? 92 : 118;
              return (
                <circle
                  key={i}
                  className={`orbit__star ${active === i ? 'is-on' : ''} ${v === REST ? 'is-rest' : ''}`}
                  cx={150 + Math.cos(a) * r}
                  cy={150 + Math.sin(a) * r}
                  r={active === i ? 11 : 7}
                />
              );
            })}
        </svg>

        <img className="boxstage__box" src={asset('assets/music-box.webp')} alt="Pip's music box" draggable={false} />

        <button type="button" className={`windkey wind-${Math.min(winds, 3)}`} onClick={wind} disabled={open} aria-label={open ? 'The music box is wound up' : `Wind the key. ${winds} of 3 turns`}>
          <span className="windkey__grip" aria-hidden="true" />
        </button>

        <p className="boxstage__hint" role="status">
          {open ? 'wound up and humming ✨' : `turn the key — ${3 - winds} more`}
        </p>
      </div>

      {/* --- the sequencer --- */}
      <div className="seq" ref={gridRef} onKeyDown={onGridKey}>
        <div className="seq__row" role="group" aria-label="Eight step lullaby. Arrow left and right to move, arrow up and down to change the note.">
          {pattern.map((v, i) => (
            <button
              key={i}
              type="button"
              className={`step ${v === REST ? 'is-rest' : `n${v}`} ${active === i ? 'is-active' : ''}`}
              style={{ ['--h' as string]: v === REST ? 0 : (v + 1) / PENTA.length }}
              tabIndex={i === cursor ? 0 : -1}
              onFocus={() => setCursor(i)}
              onClick={() => cycle(i)}
              aria-label={`Step ${i + 1}, ${v === REST ? 'rest' : `note ${NOTE_NAMES[v]}`}`}
            >
              <span className="step__bar" aria-hidden="true" />
              <span className="step__name" aria-hidden="true">
                {v === REST ? '·' : NOTE_NAMES[v]}
              </span>
              <span className="step__no" aria-hidden="true">
                {i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* --- transport --- */}
      <div className="lab__controls">
        <button type="button" className="btn98 lab__play" onClick={play} aria-pressed={playing}>
          {playing ? '■ stop' : '▶ play'}
        </button>
        <label className="lab__tempo">
          <span>slow</span>
          <input
            type="range"
            min={320}
            max={900}
            step={20}
            value={stepMs}
            onChange={(e) => setStepMs(Number(e.target.value))}
            aria-label="Tempo, slow to sleepy-slow"
          />
          <span>sleepy</span>
        </label>
      </div>

      <div className="lab__presets">
        <span className="lab__presets-label">tunes i know:</span>
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`btn98 chip ${presetId === p.id ? 'is-on' : ''} ${p.secret ? 'is-secret' : ''}`}
            onClick={() => choosePreset(p)}
            title={p.by}
          >
            {p.name}
          </button>
        ))}
        <button type="button" className={`btn98 chip ${presetId === 'random' ? 'is-on' : ''}`} onClick={() => choosePreset('random')} title="a brand new one, every time">
          Random Dream 🎲
        </button>
      </div>
    </div>
  );
}
