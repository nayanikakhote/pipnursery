import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { ART } from '../content/assets';
import Pip from '../components/Pip';
import './growth.css';

interface Mark {
  id: string;
  when: string;
  skill: string;
  stars: number;
  note: string;
  /** How far up the wall, in % from the bottom. */
  at: number;
  badge?: boolean;
}

// bottom of the wall → top, which is also how you scroll through them
const MARKS: Mark[] = [
  { id: 'quiet', when: 'before everything', skill: 'Being quiet', stars: 0, note: 'still down here. sorry.', at: 3 },
  { id: 'hum', when: '1 moon old', skill: 'Lullaby composing', stars: 4, note: "learned to hum. haven't stopped.", at: 15 },
  { id: 'lamp', when: '2 moons', skill: 'Nightlight design', stars: 3, note: 'first lamp glowed! (one exploded into glitter)', at: 28 },
  { id: 'fly', when: '3 moons', skill: 'Dream delivery', stars: 3, note: 'flew in a mostly straight line', at: 41 },
  { id: 'toy', when: '4 moons', skill: 'Toy making', stars: 4, note: 'invented the bone rattle', at: 54 },
  { id: 'story', when: '5 moons', skill: 'Storytelling', stars: 4, note: 'wrote my first book (about boo)', at: 67 },
  { id: 'badge', when: '6 moons', skill: 'Junior Dream Engineer', stars: 5, note: 'granny owl gave me a badge!!', at: 80, badge: true },
  { id: 'nap', when: 'always', skill: 'Napping', stars: 5, note: 'expert. since birth.', at: 93 },
];

// The painted wall's ruler runs from about 20% to 90% up the strip; below
// that is floor and above it is the cloud on top. Marks are mapped into that
// band so each one actually lands on the ruler.
const BAND = { from: 20, to: 90 };
const placeOn = (at: number, hasArt: boolean) => (hasArt ? BAND.from + (at / 100) * (BAND.to - BAND.from) : at);

export default function GrowthChart() {
  const complete = useDream((s) => s.complete);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const reducedMotion = useDream((s) => s.reducedMotion);

  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [tiptoe, setTiptoe] = useState(0);
  const [ruler, setRuler] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Marks draw themselves in as they scroll into view.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const fresh: string[] = [];
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = (e.target as HTMLElement).dataset.mark;
          if (id) fresh.push(id);
        });
        if (fresh.length) setSeen((s) => [...new Set([...s, ...fresh])]);
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll<HTMLElement>('[data-mark]').forEach((m) => io.observe(m));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (seen.length === MARKS.length && complete('growth')) {
      setMood('cheer');
      say('you read every single one! i am 1 whole pip tall.');
      sfx.sparkle();
    }
  }, [seen, complete, setMood, say]);

  // The window scrolls UP the wall, so start at the bottom.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    root.scrollTop = root.scrollHeight;
  }, []);

  const nextUnseen = MARKS.find((m) => !seen.includes(m.id));

  const measure = () => {
    unlockAudio();
    sfx.chime();
    setRuler(true);
    say('pip is exactly 1 pip tall.');
    window.setTimeout(() => setRuler(false), 3200);
  };

  const climb = () => {
    unlockAudio();
    sfx.giggle();
    setMood('giggle');
    setTiptoe((n) => n + 1);
    const target = nextUnseen ?? MARKS[MARKS.length - 1];
    const root = scroller.current;
    const el = root?.querySelector<HTMLElement>(`[data-mark="${target.id}"]`);
    el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  };

  const detail = MARKS.find((m) => m.id === open);

  return (
    <div className="gc">
      <p className="gc__intro">this is my growth chart! granny owl measures me every full moon.</p>

      <div className="gc__wallwrap">
        <div className="gc__scroll" ref={scroller} tabIndex={0} aria-label="Pip's growth chart. Scroll up the wall.">
          <div className={`gc__wall ${ART.growthWall ? "has-art" : ""}`}>
            {ART.growthWall ? (
              <img className="gc__wall-art" src={ART.growthWall} alt="" draggable={false}  decoding="async"/>
            ) : (
              <div className="gc__wall-art gc__wall-art--css" aria-hidden="true" />
            )}

            {/* a drawn ruler only when the painted wall doesn't already have one */}
            {!ART.growthWall && (
            <svg className="gc__ruler" viewBox="0 0 10 100" preserveAspectRatio="none" aria-hidden="true">
              <line x1="5" y1="0" x2="5" y2="100" />
              {Array.from({ length: 21 }, (_, i) => (
                <line key={i} x1={i % 5 === 0 ? 1 : 3} y1={i * 5} x2="9" y2={i * 5} />
              ))}
            </svg>
            )}

            {MARKS.map((m) => {
              const on = seen.includes(m.id);
              return (
                <div key={m.id} className={`gmark ${on ? 'is-drawn' : ''} ${m.badge ? 'is-badge' : ''} ${m.id === 'quiet' ? 'is-scribble' : ''}`} style={{ bottom: `${placeOn(m.at, !!ART.growthWall)}%` }} data-mark={m.id}>
                  <svg className="gmark__line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
                    <path d={m.id === 'quiet' ? 'M2 6 q12 -5 24 1 t24 -1 t24 2 t24 -2' : 'M2 5 q20 -3 46 0 t50 1'} pathLength={1} />
                  </svg>
                  <button
                    type="button"
                    className="gmark__btn"
                    onClick={() => {
                      unlockAudio();
                      sfx.click();
                      setOpen(open === m.id ? null : m.id);
                    }}
                    aria-expanded={open === m.id}
                    aria-label={`${m.when}: ${m.skill}, ${m.stars} out of 5 stars. ${m.note}`}
                  >
                    <span className="gmark__when">{m.when}</span>
                    <span className="gmark__skill">
                      {m.skill} {m.badge && <i className="gmark__medal">🏅</i>}
                    </span>
                    <span className="gmark__stars" aria-hidden="true">
                      {'★'.repeat(m.stars)}
                      {'☆'.repeat(5 - m.stars)}
                    </span>
                  </button>
                </div>
              );
            })}

            {/* little Pip stands at the bottom of the wall */}
            <div className={`gc__pip ${tiptoe ? 'is-tiptoe' : ''}`} key={tiptoe}>
              <Pip width="100%" onClick={climb} label="Pip" />
            </div>

            <div className={`gc__tape ${ruler ? 'is-on' : ''}`} aria-hidden="true">
              <span>1 pip</span>
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <div className="gc__card" role="status">
          <b>{detail.skill}</b> <span className="mono">· {detail.when}</span>
          <p>“{detail.note}”</p>
        </div>
      )}

      <div className="gc__controls">
        <button type="button" className="btn98" onClick={measure}>
          measure me!
        </button>
        <button type="button" className="btn98" onClick={climb} disabled={!nextUnseen}>
          {nextUnseen ? 'tiptoe higher ↑' : 'all measured ★'}
        </button>
        <span className="mono gc__count">
          {seen.length}/{MARKS.length} marks read
        </span>
      </div>
    </div>
  );
}
