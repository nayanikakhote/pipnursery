import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDream } from '../../store/dreamStore';
import { sfx, unlockAudio } from '../../audio/audio';
import { StickerArt } from '../../content/stickers';

const FACES = [
  { id: 'star', icon: 'star', label: 'a star' },
  { id: 'moon', icon: 'moon', label: 'a moon' },
  { id: 'note', icon: 'musicbox', label: 'a music note' },
  { id: 'lantern', icon: 'lantern', label: 'a lantern' },
  { id: 'teddy', icon: 'album', label: 'a teddy' },
  { id: 'ghost', icon: 'chat', label: 'a ghost' },
];

const ENDINGS = [
  'and everybody slept right through till morning.',
  'and the moon stayed up a little longer, just for you.',
  'and nobody had a single bad dream. not one.',
  'and pip wrote it all down in his notebook.',
];

interface Card {
  key: number;
  face: (typeof FACES)[number];
}

function deal(): Card[] {
  const pairs = [...FACES, ...FACES].map((f, i) => ({ key: i, face: f }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs;
}

export default function MatchTheDream({ onWin }: { onWin: () => void }) {
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [cards, setCards] = useState<Card[]>(deal);
  const [up, setUp] = useState<number[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [ending, setEnding] = useState('');
  const lock = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const reset = () => {
    unlockAudio();
    sfx.shuffle();
    if (timer.current !== null) window.clearTimeout(timer.current);
    lock.current = false;
    setCards(deal());
    setUp([]);
    setDone([]);
    setTries(0);
    setEnding('');
  };

  const flip = (i: number) => {
    if (lock.current) return;
    const card = cards[i];
    if (up.includes(i) || done.includes(card.face.id)) return;
    unlockAudio();
    sfx.click();

    const next = [...up, i];
    setUp(next);
    if (next.length < 2) return;

    setTries((t) => t + 1);
    lock.current = true;
    const [a, b] = next;

    if (cards[a].face.id === cards[b].face.id) {
      timer.current = window.setTimeout(() => {
        sfx.chime();
        const matched = [...done, cards[a].face.id];
        setDone(matched);
        setUp([]);
        lock.current = false;
        if (matched.length === FACES.length) {
          setEnding(ENDINGS[Math.floor(Math.random() * ENDINGS.length)]);
          sfx.sparkle();
          if (!reducedMotion) {
            confetti({ particleCount: 60, spread: 65, scalar: 0.75, origin: { y: 0.6 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8'] });
          }
          onWin();
        }
      }, 420);
    } else {
      timer.current = window.setTimeout(() => {
        sfx.pop();
        setUp([]);
        lock.current = false;
      }, 900);
    }
  };

  return (
    <div className="game">
      <p className="game__how">find the matching pairs. there are six.</p>

      <div className="match" role="group" aria-label="Memory cards, four by three">
        {cards.map((c, i) => {
          const open = up.includes(i) || done.includes(c.face.id);
          return (
            <button
              key={c.key}
              type="button"
              className={`card3 ${open ? 'is-open' : ''} ${done.includes(c.face.id) ? 'is-done' : ''}`}
              onClick={() => flip(i)}
              aria-label={open ? c.face.label : `Face-down card ${i + 1}`}
              aria-pressed={open}
            >
              <span className="card3__inner" aria-hidden="true">
                <span className="card3__back">☾</span>
                <span className="card3__front">
                  <StickerArt sticker={c.face.id} icon={c.face.icon} size={40} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="game__bar">
        <button type="button" className="btn98" onClick={reset}>
          shuffle again
        </button>
        <span className="mono">
          {done.length}/6 pairs · {tries} tries
        </span>
      </div>

      {ending && (
        <p className="game__ending" role="status">
          ★ {ending}
        </p>
      )}
    </div>
  );
}
