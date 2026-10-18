import { useDream } from '../store/dreamStore';
import PixelIcon from '../components/PixelIcon';
import { art } from '../content/assets';
import './apps.css';

/** A sticker you can actually peel off Pip's sheet, if one was drawn for it. */
export function StickerArt({ sticker, icon, size = 40 }: { sticker?: string; icon: string; size?: number }) {
  const drawn = sticker && art(`sticker-${sticker}`);
  if (drawn) return <img className="sticker__art" src={drawn} alt="" aria-hidden="true" width={size} height={size} draggable={false} loading="lazy" />;
  return <PixelIcon name={icon} size={size} />;
}

export const STICKERS: { id: string; icon: string; sticker?: string; name: string; hint: string }[] = [
  { id: 'project-lullaby', icon: 'musicbox', sticker: 'note', name: 'Lullaby maker', hint: 'play a whole lullaby' },
  { id: 'project-nightlights', icon: 'lampfolder', sticker: 'lantern', name: 'Light bringer', hint: 'switch on every nightlight' },
  { id: 'project-routes', icon: 'map', sticker: 'cloud', name: 'Dream courier', hint: 'deliver all the dreams' },
  { id: 'project-toys', icon: 'rattle', sticker: 'bow', name: 'Toy tester', hint: 'start a rattle band' },
  { id: 'project-bedtime', icon: 'book', sticker: 'ghost', name: 'Story listener', hint: 'read to the very end' },
  { id: 'project-growth', icon: 'ruler', sticker: 'teddy', name: 'Measurer', hint: 'see every pencil mark' },
  { id: 'project-story', icon: 'diary', sticker: 'moon', name: 'Pip historian', hint: 'read my story' },
  { id: 'egg-secret', icon: 'sleepfile', sticker: 'mouse', name: 'Tickle champion', hint: 'pip is very ticklish…' },
  { id: 'egg-constellation-pip', icon: 'star', sticker: 'star', name: 'A star of your own', hint: 'read my story all the way to the end' },
  { id: 'egg-lantern', icon: 'lantern', sticker: 'lantern', name: 'Dream Lantern', hint: 'light the lamps in the order pip built them' },
  { id: 'egg-secretsong', icon: 'musicbox', sticker: 'note', name: 'Secret song', hint: 'play a lullaby, then light the lamps in a certain order' },
  { id: 'egg-teddy', icon: 'star', sticker: 'teddy', name: 'Teddy whisperer', hint: 'the teddy likes being squeezed' },
  { id: 'egg-constellation', icon: 'star', sticker: 'star', name: 'Star finder', hint: 'tiny stars hide in my room' },
  { id: 'egg-devnotes', icon: 'notepad', sticker: 'sock', name: 'Snoop', hint: 'read my private notes' },
  { id: 'egg-shutdown', icon: 'moon', name: 'Night night', hint: 'tuck the computer in' },
  { id: 'egg-giggle', icon: 'chat', sticker: 'frog', name: 'Giggle storm', hint: 'an old secret code…' },
  { id: 'egg-secretfile', icon: 'sun', sticker: 'owl', name: 'First dream', hint: 'open a file you should not' },
];

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
