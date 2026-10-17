import { useDream } from '../store/dreamStore';
import PixelIcon from '../components/PixelIcon';
import './apps.css';

export const STICKERS: { id: string; icon: string; name: string; hint: string }[] = [
  { id: 'project-lullaby', icon: 'musicbox', name: 'Lullaby maker', hint: 'play a whole lullaby' },
  { id: 'project-nightlights', icon: 'lampfolder', name: 'Light bringer', hint: 'switch on every nightlight' },
  { id: 'project-routes', icon: 'map', name: 'Dream courier', hint: 'deliver all the dreams' },
  { id: 'project-toys', icon: 'rattle', name: 'Toy tester', hint: 'start a rattle band' },
  { id: 'project-bedtime', icon: 'book', name: 'Story listener', hint: 'read to the very end' },
  { id: 'project-growth', icon: 'ruler', name: 'Measurer', hint: 'see every pencil mark' },
  { id: 'project-story', icon: 'diary', name: 'Pip historian', hint: 'read my story' },
  { id: 'egg-secret', icon: 'sleepfile', name: 'Tickle champion', hint: 'pip is very ticklish…' },
  { id: 'egg-constellation', icon: 'star', name: 'Star finder', hint: 'tiny stars hide in my room' },
  { id: 'egg-devnotes', icon: 'notepad', name: 'Snoop', hint: 'read my private notes' },
  { id: 'egg-shutdown', icon: 'moon', name: 'Night night', hint: 'tuck the computer in' },
  { id: 'egg-giggle', icon: 'chat', name: 'Giggle storm', hint: 'an old secret code…' },
  { id: 'egg-secretfile', icon: 'sun', name: 'First dream', hint: 'open a file you should not' },
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
              {has ? <PixelIcon name={s.icon} size={40} /> : <span className="sticker__q">?</span>}
              <b>{has ? s.name : '???'}</b>
              {!has && <small>{s.hint}</small>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
