import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { PENTA, sfx, unlockAudio } from '../audio/audio';
import { STORY_ART } from '../content/assets';
import './story.css';

interface Chapter {
  n: number;
  title: string;
  text: string;
  /** What the little interaction in this chapter is called, for the button. */
  action: string;
  alt: string;
}

const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: 'A Cloud That Hummed',
    text: "I don't remember being born. I remember a cloud. It was humming. It drifted down the sky and bumped, very gently, into the window of the Midnight Nursery. Inside, one lamp was still on. I decided that was an invitation.",
    action: 'tap the cloud',
    alt: 'A humming cloud drifting down past the lit window of the Midnight Nursery',
  },
  {
    n: 2,
    title: 'The Silence Problem',
    text: 'The nursery was quiet. Very quiet. I do not like quiet. Then I found a music box on the highest shelf. I wound it up, and every wriggly little creature in the room sighed… and slept. That\'s when I knew. Silence was a problem. And I was going to fix it.',
    action: 'wind the box',
    alt: 'Pip reaching up to the music box on the highest shelf',
  },
  {
    n: 3,
    title: 'The Little Inventor',
    text: 'So I started building. Lamps for the ones afraid of the dark. Maps for dreams that got lost. Stories for the ones who needed one more. Most of my first tries exploded into glitter. Some of them worked.',
    action: 'tap an invention',
    alt: "Pip at a cluttered workbench, surrounded by half-finished inventions",
  },
  {
    n: 4,
    title: 'The First Delivery',
    text: 'One night, I tucked a finished dream under my arm and flew across the rooftops. Every window I visited glowed gold. Granny Owl, the Night Supervisor, watched the whole thing. In the morning she pinned a tiny badge on my nightcap: Junior Dream Engineer.',
    action: 'keep scrolling',
    alt: 'Pip flying over the rooftops with a lantern, watched by Granny Owl',
  },
  {
    n: 5,
    title: 'Goodnight, Little World',
    text: "Now the whole neighbourhood sleeps. I save my work, turn the lamp down low, and curl up under the hanging stars. If you're still here… thank you for visiting my little world.",
    action: 'tap the last star',
    alt: 'Pip asleep under the hanging mobile, the whole room quiet',
  },
];

const GLITTER = ['a lamp', 'a map', 'a rattle', 'a tiny book', 'a sock'];

export default function MyStory() {
  const setScene = useDream((s) => s.setScene);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const reducedMotion = useDream((s) => s.reducedMotion);

  const [current, setCurrent] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [poofed, setPoofed] = useState<number[]>([]);
  const [routeT, setRouteT] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const sparkId = useRef(0);

  const goTo = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(CHAPTERS.length - 1, i));
      const el = scroller.current?.querySelectorAll<HTMLElement>('.ch')[n];
      el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    },
    [reducedMotion],
  );

  // which chapter is on screen
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const chapters = Array.from(root.querySelectorAll<HTMLElement>('.ch'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const i = chapters.indexOf(e.target as HTMLElement);
          if (i < 0) return;
          setCurrent(i);
          setSeen((s) => (s.includes(i) ? s : [...s, i]));
        });
      },
      { root, threshold: 0.55 },
    );
    chapters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // chapter 4's flight path is drawn by the scroll itself
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const onScroll = () => {
      const ch4 = root.querySelectorAll<HTMLElement>('.ch')[3];
      if (!ch4) return;
      const top = ch4.offsetTop - root.scrollTop;
      const h = ch4.offsetHeight || 1;
      // 0 as chapter 4 arrives, 1 by the time it has been read through
      setRouteT(Math.max(0, Math.min(1, (h * 0.8 - top) / (h * 0.75))));
    };
    onScroll();
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    }
  };

  // swipe
  const touch = useRef<{ y: number; t: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { y: e.touches[0].clientY, t: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dy = e.changedTouches[0].clientY - t.y;
    if (Date.now() - t.t < 500 && Math.abs(dy) > 70) goTo(current + (dy < 0 ? 1 : -1));
  };

  const spark = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const id = sparkId.current++;
    setSparks((s) => [...s.slice(-14), { id, x, y }]);
    window.setTimeout(() => setSparks((s) => s.filter((p) => p.id !== id)), 1100);
  };

  const finish = () => {
    unlockAudio();
    sfx.sparkle();
    setMood('cheer');
    say('come on. i will walk you home. 🌙');
    setScene('finale');
  };

  const art = (i: number) => STORY_ART[i];

  return (
    <div className="story">
      <div className="story__bar">
        <h2 className="story__title">
          <span className="story__ch">chapter {current + 1}</span> {CHAPTERS[current].title}
        </h2>
        <ol className="story__stars" aria-label={`Chapter ${current + 1} of ${CHAPTERS.length}`}>
          {CHAPTERS.map((c, i) => (
            <li key={c.n}>
              <button
                type="button"
                className={`story__star ${i === current ? 'is-here' : ''} ${seen.includes(i) ? 'is-seen' : ''}`}
                onClick={() => {
                  sfx.click();
                  goTo(i);
                }}
                aria-current={i === current ? 'step' : undefined}
                aria-label={`Chapter ${c.n}: ${c.title}`}
              >
                ★
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="story__scroll" ref={scroller} tabIndex={0} onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {CHAPTERS.map((c, i) => (
          <section key={c.n} className={`ch ch--${c.n} ${current === i ? 'is-here' : ''}`} aria-label={`Chapter ${c.n}, ${c.title}`}>
            <div className="ch__art">
              {art(i) ? <img src={art(i)} alt={c.alt} draggable={false} loading={i < 2 ? 'eager' : 'lazy'} /> : <div className={`ch__css ch__css--${c.n}`} role="img" aria-label={c.alt} />}

              {/* ---- chapter 1: tap the cloud ---- */}
              {i === 0 && (
                <button
                  type="button"
                  className="hot hot--cloud"
                  aria-label="Tap the humming cloud"
                  onClick={(e) => {
                    unlockAudio();
                    sfx.sparkle();
                    spark(e);
                  }}
                />
              )}

              {/* ---- chapter 2: wind the box ---- */}
              {i === 1 && (
                <button
                  type="button"
                  className="hot hot--box"
                  aria-label="Wind the music box"
                  onClick={() => {
                    unlockAudio();
                    sfx.clack();
                    [0, 2, 4, 2].forEach((n, k) => sfx.note(PENTA[n], k * 0.3, 0.09));
                  }}
                />
              )}

              {/* ---- chapter 3: inventions go poof ---- */}
              {i === 2 &&
                GLITTER.map((label, k) => (
                  <button
                    key={label}
                    type="button"
                    className={`hot hot--inv inv-${k} ${poofed.includes(k) ? 'is-poof' : ''}`}
                    aria-label={`${label} — tap it`}
                    onClick={(e) => {
                      unlockAudio();
                      sfx.pop();
                      spark(e);
                      setPoofed((p) => (p.includes(k) ? p : [...p, k]));
                    }}
                  />
                ))}

              {/* ---- chapter 4: the route draws itself as you scroll ---- */}
              {i === 3 && (
                <svg className="ch__route" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    className="ch__route-line"
                    d="M 6 46 Q 26 18 44 34 T 78 22 T 96 32"
                    pathLength={1}
                    style={{ strokeDashoffset: 1 - routeT }}
                    vectorEffect="non-scaling-stroke"
                  />
                  {[
                    [22, 40],
                    [44, 34],
                    [64, 28],
                    [86, 27],
                  ].map(([x, y], k) => (
                    <circle key={k} cx={x} cy={y} r={2} className={`ch__window ${routeT > (k + 1) / 5 ? 'is-lit' : ''}`} />
                  ))}
                </svg>
              )}

              {/* ---- chapter 5: the last star ---- */}
              {i === 4 && (
                <button type="button" className="hot hot--laststar" onClick={finish} aria-label="Tap the last star, and Pip will walk you home">
                  <span aria-hidden="true">★</span>
                </button>
              )}

              {sparks.length > 0 && current === i && (
                <span className="sparks" aria-hidden="true">
                  {sparks.map((p) => (
                    <i key={p.id} style={{ left: `${p.x}%`, top: `${p.y}%`, ['--dx' as string]: `${(Math.random() - 0.5) * 90}px` }} />
                  ))}
                </span>
              )}
            </div>

            <div className="ch__text">
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <p className="ch__do">{c.action} ✨</p>
            </div>
          </section>
        ))}
      </div>

      <div className="story__nav">
        <button type="button" className="btn98" onClick={() => { sfx.click(); goTo(current - 1); }} disabled={current === 0}>
          ← back
        </button>
        <span className="mono">
          {current + 1} / {CHAPTERS.length}
        </span>
        {current < CHAPTERS.length - 1 ? (
          <button type="button" className="btn98" onClick={() => { sfx.click(); goTo(current + 1); }}>
            next →
          </button>
        ) : (
          <button type="button" className="btn98 story__end" onClick={finish}>
            walk me home ★
          </button>
        )}
      </div>
    </div>
  );
}
