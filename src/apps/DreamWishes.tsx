import type React from 'react';
import { useEffect, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { STICKER_IDS, isShared, listWishes, postWish, type StickerId, type Wish } from '../lib/storage';
import { StickerArt } from '../content/stickers';
import './wishes.css';

const PAGE = 50;

const STICKER_LABEL: Record<StickerId, string> = {
  moon: 'a moon',
  star: 'a star',
  ghost: 'Boo',
  teddy: 'a teddy',
  bow: 'a bow',
  lantern: 'a lantern',
};

export default function DreamWishes() {
  const say = useDream((s) => s.say);
  const setMood = useDream((s) => s.setMood);
  const award = useDream((s) => s.award);
  const setVisitorName = useDream((s) => s.setVisitorName);
  const knownName = useDream((s) => s.visitor.name);

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(knownName ?? '');
  const [message, setMessage] = useState('');
  const [sticker, setSticker] = useState<StickerId>('moon');
  const [honey, setHoney] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    let alive = true;
    void listWishes(0, PAGE).then((r) => {
      if (!alive) return;
      setWishes(r.wishes);
      setMore(r.more);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const loadMore = async () => {
    sfx.click();
    const r = await listWishes(wishes.length, PAGE);
    setWishes((w) => [...w, ...r.wishes]);
    setMore(r.more);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockAudio();
    setError('');
    const res = await postWish({ name, message, sticker, honey });
    if (!res.ok) {
      setError(res.why);
      sfx.bonk();
      return;
    }
    setWishes((w) => [res.wish, ...w]);
    setMessage('');
    setSent(true);
    setVisitorName(res.wish.name);
    award('egg-wished');
    sfx.sparkle();
    setMood('giggle');
    say(`a wish! for me?! *giggles* thank you ${res.wish.name}.`);
    window.setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="wish">
      <header className="wish__head">
        <h2>sign pip's guestbook! ✨</h2>
        <p className="wish__sub">
          {isShared
            ? 'everyone who visits can read these. be nice to pip.'
            : 'your wishes are saved on this device ✨ (nobody else can see them)'}
        </p>
      </header>

      <form className="wish__form bevel" onSubmit={submit}>
        <div className="wish__row">
          <label className="wish__field">
            <span>your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} placeholder="a friend" autoComplete="nickname" required />
          </label>
          <fieldset className="wish__stickers">
            <legend>pick a sticker</legend>
            {STICKER_IDS.map((s) => (
              <button
                key={s}
                type="button"
                className={`wish__sticker ${sticker === s ? 'is-on' : ''}`}
                onClick={() => {
                  sfx.pop();
                  setSticker(s);
                }}
                aria-pressed={sticker === s}
                aria-label={STICKER_LABEL[s]}
              >
                <StickerArt sticker={s} icon={s === 'ghost' ? 'chat' : s} size={30} />
              </button>
            ))}
          </fieldset>
        </div>

        <label className="wish__field">
          <span>
            your wish <i>({140 - message.length} left)</i>
          </span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={140} rows={2} placeholder="sweet dreams, pip!" required />
        </label>

        {/* for robots only; a real visitor never sees this */}
        <label className="wish__honey" aria-hidden="true">
          leave this empty
          <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
        </label>

        <div className="wish__send">
          <button type="submit" className="btn98 wish__btn">
            {sent ? 'thank you!! ✨' : 'pin it to the wall'}
          </button>
          {error && (
            <p className="wish__err" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>

      <h3 className="wish__wallhead">
        the wall <span className="mono">({wishes.length} pinned)</span>
      </h3>

      {loading ? (
        <p className="wish__loading mono">reading the wall…</p>
      ) : (
        <ul className="wish__wall">
          {wishes.map((w) => (
            <li key={w.id} className={`note note--${w.sticker} ${w.seeded ? 'is-seed' : ''}`}>
              <span className="note__pin" aria-hidden="true">
                <StickerArt sticker={w.sticker} icon="star" size={30} />
              </span>
              <p className="note__msg">{w.message}</p>
              <p className="note__by">
                — {w.name}
                <time dateTime={w.created_at}>{new Date(w.created_at).toLocaleDateString()}</time>
              </p>
            </li>
          ))}
        </ul>
      )}

      {more && (
        <button type="button" className="btn98 wish__more" onClick={loadMore}>
          load more wishes ↓
        </button>
      )}
    </div>
  );
}
