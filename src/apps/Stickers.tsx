import { useDream } from '../store/dreamStore';
import { STICKERS, StickerArt } from '../content/stickers';
import './apps.css';

export default function Stickers() {
  const badges = useDream((s) => s.badges);
  const got = STICKERS.filter((s) => badges.includes(s.id)).length;
  return (
    <div className="stickers">
      <p className="mono">
        {got}/{STICKERS.length} stickers collected
      </p>
      <ul className="stickers__grid">
        {STICKERS.map((s) => {
          const has = badges.includes(s.id);
          return (
            <li key={s.id} className={`sticker ${has ? 'has' : ''}`}>
              {has ? <StickerArt sticker={s.sticker} icon={s.icon} size={40} /> : <span className="sticker__q">?</span>}
              <b>{has ? s.name : '???'}</b>
              {!has && <small>{s.hint}</small>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
