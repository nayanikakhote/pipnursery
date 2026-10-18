import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { PENTA, sfx, unlockAudio } from '../audio/audio';
import { BOOK_ART } from '../content/assets';
import './storybook.css';

type Poke = 'shiver' | 'hug' | 'bonk' | 'flicker' | 'warm' | 'twinkle';

interface Page {
  text: string;
  /** The tappable thing on this page, and what it does. */
  hot: { label: string; poke: Poke; x: number; y: number; w: number; h: number };
  alt: string;
}

const PAGES: Page[] = [
  {
    text: 'Boo was a ghost. Boo was also afraid of the dark. Everyone said this was silly. Boo said it was very serious.',
    hot: { label: 'Boo, hiding under the blanket', poke: 'shiver', x: 30, y: 44, w: 32, h: 34 },
    alt: 'Boo peeking out from under a starry blanket, looking worried',
  },
  {
    text: 'One night, Boo floated up, up, up, and borrowed the moon. Just for a little while. Just to hold.',
    hot: { label: 'the moon', poke: 'hug', x: 52, y: 14, w: 34, h: 40 },
    alt: 'Boo floating in the night sky with both arms around the moon',
  },
  {
    text: 'But without the moon, the whole sky went dark. The owls bumped into chimneys. The frogs forgot the way home.',
    hot: { label: 'the owls', poke: 'bonk', x: 8, y: 10, w: 42, h: 38 },
    alt: 'Owls bumping into chimneys in a dark sky, a frog looking lost on a roof',
  },
  {
    text: 'Boo felt terrible. He floated back to return it… and found Pip waiting on the roof, holding a tiny lamp.',
    hot: { label: "Pip's little lamp", poke: 'flicker', x: 40, y: 48, w: 24, h: 30 },
    alt: 'Boo meeting Pip on a rooftop, Pip holding a small glowing lantern',
  },
  {
    text: '"I made you something," said Pip. It was a little moon. Just Boo-sized. It glowed warm, like a hug.',
    hot: { label: 'the little moon', poke: 'warm', x: 42, y: 40, w: 26, h: 30 },
    alt: 'Pip handing Boo a tiny glowing moon',
  },
  {
    text: 'Boo hung the big moon back in the sky and took the little one home. The end. Goodnight, Boo. Goodnight, you.',
    hot: { label: 'the sky', poke: 'twinkle', x: 4, y: 4, w: 92, h: 40 },
    alt: 'Boo flying home with a tiny moon, the big moon back in the sky',
  },
];

// -1 = cover, 0..5 = pages, 6 = back cover
const COVER = -1;
const END = PAGES.length;

export default function BedtimeStorybook() {
  const complete = useDream((s) => s.complete);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const soundOn = useDream((s) => s.soundOn);
  const reducedMotion = useDream((s) => s.reducedMotion);

  const [page, setPage] = useState(COVER);
  const [turning, setTurning] = useState<'fwd' | 'back' | null>(null);
  const [poke, setPoke] = useState<Poke | null>(null);
  const hum = useRef<number | null>(null);

  const go = useCallback(
    (to: number) => {
      const n = Math.max(COVER, Math.min(END, to));
      if (n === page) return;
      unlockAudio();
      sfx.shuffle();
      setTurning(n > page ? 'fwd' : 'back');
      setPoke(null);
      setPage(n);
      window.setTimeout(() => setTurning(null), reducedMotion ? 60 : 620);
    },
    [page, reducedMotion],
  );

  useEffect(() => {
    if (page === END && complete('bedtime')) {
      setMood('cheer');
      say("did you like it?? i'm going to write a sequel.");
      sfx.sparkle();
    }
  }, [page, complete, setMood, say]);

  // A soft music-box hum while the book is open. It goes through the master
  // gain like everything else, so the mute switch silences it too.
  useEffect(() => {
    if (page === COVER || !soundOn) return;
    const bar = () => {
      [0, 2, 4, 2].forEach((n, i) => sfx.note(PENTA[n], i * 1.1, 0.025));
    };
    bar();
    hum.current = window.setInterval(bar, 4400);
    return () => {
      if (hum.current !== null) window.clearInterval(hum.current);
      hum.current = null;
    };
  }, [page, soundOn]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      go(page + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      go(page - 1);
    }
  };

  const touch = useRef<{ x: number; t: number } | null>(null);

  const doPoke = (p: Poke) => {
    unlockAudio();
    setPoke(p);
    if (p === 'bonk') {
      sfx.bonk();
      window.setTimeout(() => sfx.bonk(), 230);
    } else if (p === 'twinkle') sfx.sparkle();
    else if (p === 'warm') sfx.chime();
    else sfx.pop();
    window.setTimeout(() => setPoke(null), 1300);
  };

  const art = page >= 0 && page < END ? BOOK_ART.pages[page] : BOOK_ART.cover;
  const current = page >= 0 && page < END ? PAGES[page] : null;

  return (
    <div
      className={`storybook ${turning ? `is-turning is-${turning}` : ''} ${page === COVER ? 'is-cover' : ''} ${page === END ? 'is-end' : ''}`}
      tabIndex={0}
      onKeyDown={onKey}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, t: Date.now() })}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        if (Date.now() - t.t < 500 && Math.abs(dx) > 60) go(page + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="book__spread">
        <div className={`book__page ${poke ? `poke-${poke}` : ''}`} key={page}>
          {art ? (
            <img className="book__art" src={art} alt={current?.alt ?? 'The cover of Boo and the Borrowed Moon'} draggable={false} loading={page < 1 ? 'eager' : 'lazy'} />
          ) : (
            <div className={`book__art book__art--css p${page}`} role="img" aria-label={current?.alt ?? 'Cover'} />
          )}

          {page === COVER && (
            <div className="book__cover-text">
              <h2>Boo and the Borrowed Moon</h2>
              <p>written and illustrated by Pip</p>
              <p className="book__cover-sub">(be nice. i am a baby.)</p>
            </div>
          )}

          {page === END && (
            <div className="book__cover-text book__cover-text--end">
              <h2>the end</h2>
              <p>goodnight, Boo. goodnight, you.</p>
            </div>
          )}

          {current && (
            <>
              <button
                type="button"
                className="book__hot"
                style={{ left: `${current.hot.x}%`, top: `${current.hot.y}%`, width: `${current.hot.w}%`, height: `${current.hot.h}%` }}
                aria-label={`Tap ${current.hot.label}`}
                onClick={() => doPoke(current.hot.poke)}
              />
              <p className="book__text" aria-live="polite">
                {current.text}
              </p>
            </>
          )}

          <span className={`book__fx ${poke === 'twinkle' ? 'is-on' : ''}`} aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} style={{ left: `${(i * 29) % 96}%`, top: `${(i * 17) % 44}%`, animationDelay: `${i * 0.06}s` }} />
            ))}
          </span>
        </div>

        {/* corner page-turn targets, as well as the buttons below */}
        <button type="button" className="book__corner book__corner--l" onClick={() => go(page - 1)} disabled={page === COVER} aria-label="Previous page" />
        <button type="button" className="book__corner book__corner--r" onClick={() => go(page + 1)} disabled={page === END} aria-label="Next page" />
      </div>

      <div className="book__bar">
        <button type="button" className="btn98" onClick={() => go(page - 1)} disabled={page === COVER}>
          ← back
        </button>
        <ol className="book__dots" aria-label={`Page ${page + 2} of ${END + 2}`}>
          {Array.from({ length: END + 2 }, (_, i) => i + COVER).map((n) => (
            <li key={n}>
              <button
                type="button"
                className={`book__dot ${n === page ? 'is-here' : ''}`}
                onClick={() => go(n)}
                aria-current={n === page ? 'true' : undefined}
                aria-label={n === COVER ? 'Cover' : n === END ? 'The end' : `Page ${n + 1}`}
              />
            </li>
          ))}
        </ol>
        <button type="button" className="btn98" onClick={() => go(page + 1)} disabled={page === END}>
          {page === COVER ? 'open it →' : 'next →'}
        </button>
      </div>
    </div>
  );
}
