import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useDream } from '../store/dreamStore';
import { PENTA, sfx, unlockAudio } from '../audio/audio';
import { ART } from '../content/assets';
import './secretroom.css';

// Easter egg 1, the long version: opening do_not_wake_pip.txt shifts the
// desktop sideways for 700ms and drops you into Pip's very first dream.
export default function SecretRoom() {
  const setScene = useDream((s) => s.setScene);
  const award = useDream((s) => s.award);
  const setMood = useDream((s) => s.setMood);
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    unlockAudio();
    setMood('asleep');
    if (award('egg-secretfile')) {
      sfx.sparkle();
      if (!reducedMotion) {
        confetti({ particleCount: 90, spread: 90, scalar: 0.9, origin: { y: 0.55 }, colors: ['#F4C96B', '#EFC6D2', '#C9B8E8', '#FFF8F1'] });
      }
    }
    PENTA.forEach((f, i) => sfx.note(f, 0.3 + i * 0.4, 0.05));
    const t = [0, 1, 2, 3].map((i) => window.setTimeout(() => setShown(i + 1), reducedMotion ? 60 * i : 700 + i * 1300));
    return () => t.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = [
    'this is the first dream i ever had. i was about an hour old.',
    'it was a room. a whole little room, inside a bubble, floating.',
    'everybody i had not met yet was already asleep in it.',
    'i think that is why i started building. i wanted to put them somewhere soft.',
  ];

  return (
    <div className="secret" role="region" aria-label="Pip's first dream">
      {ART.secretRoom ? (
        <img className="secret__art" src={ART.secretRoom} alt="A tiny bedroom floating inside a glass bubble among the clouds" draggable={false} />
      ) : (
        <div className="secret__art secret__art--css" role="img" aria-label="A tiny bedroom floating inside a bubble" />
      )}

      <div className="secret__glass" aria-hidden="true" />

      <div className="secret__words">
        <h2>do_not_wake_pip.txt</h2>
        {lines.map((l, i) => (
          <p key={l} className={shown > i ? 'is-in' : ''}>
            {l}
          </p>
        ))}
      </div>

      <div className="secret__out">
        <p className="secret__badge" aria-label="Gold badge earned">
          ★ gold badge: <b>first dream</b>
        </p>
        <button
          type="button"
          className="btn98 secret__back"
          onClick={() => {
            sfx.whoosh();
            setScene('desktop');
          }}
        >
          ← tiptoe back out
        </button>
      </div>
    </div>
  );
}
