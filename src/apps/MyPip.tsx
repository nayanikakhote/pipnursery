import { asset } from '../lib/asset';
import { useState } from 'react';
import { useDream } from '../store/dreamStore';
import { WORK } from '../os/apps';
import PixelIcon from '../components/PixelIcon';
import { sfx } from '../audio/audio';
import './apps.css';

export default function MyPip() {
  const [tab, setTab] = useState<'id' | 'about'>('id');
  const openApp = useDream((s) => s.openApp);
  const progress = useDream((s) => s.progress);
  const done = Object.entries(progress).filter(([k, v]) => v && k !== 'story').length;

  return (
    <div className="mypip">
      <div className="tabs98" role="tablist" aria-label="Pip's employee file">
        <button type="button" role="tab" aria-selected={tab === 'id'} className="tab98" onClick={() => { sfx.click(); setTab('id'); }}>
          Employee ID
        </button>
        <button type="button" role="tab" aria-selected={tab === 'about'} className="tab98" onClick={() => { sfx.click(); setTab('about'); }}>
          About me
        </button>
      </div>

      <div className="tab-panel bevel-in" role="tabpanel">
        {tab === 'id' ? (
          <div className="id-card">
            <div className="id-card__band">MIDNIGHT NURSERY · STAFF</div>
            <div className="id-card__body">
              <div className="id-card__photo">
                <img src={asset('assets/pip-portrait.webp')} alt="Official portrait of Pip holding a lantern and a music box" />
              </div>
              <dl className="id-card__fields">
                <dt>Name</dt>
                <dd>Pip</dd>
                <dt>Title</dt>
                <dd>Junior Dream Engineer</dd>
                <dt>Department</dt>
                <dd>Midnight Nursery, night shift</dd>
                <dt>Employee no.</dt>
                <dd className="mono">000-ZZZ</dd>
                <dt>Signed</dt>
                <dd className="signature">Granny Owl, Night Supervisor</dd>
              </dl>
            </div>
            <p className="id-card__tagline">“I build the dreams you fall asleep inside.”</p>
          </div>
        ) : (
          <div className="about-me">
            <p>
              hi! i'm <b>pip</b>. i'm a baby, i have a skull face (it's very smooth, you can boop it), and i work the night shift at
              the <b>Midnight Nursery</b>.
            </p>
            <p>
              i make lullabies, nightlights, dream maps and bedtime stories for all the little ghosts and creatures in the
              neighbourhood.
            </p>
            <p>
              i'm curious, a bit clumsy, and i giggle a lot. my least favourite thing is <i>silence</i>. my favourite thing is you
              being here.
            </p>
            <ul className="facts">
              <li>
                <span>species</span> skull baby
              </li>
              <li>
                <span>likes</span> music boxes, glitter, naps
              </li>
              <li>
                <span>dislikes</span> quiet rooms
              </li>
              <li>
                <span>voice</span> sleepy, giggly, lowercase
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="my-work">
        <div className="my-work__label">
          my work ✨ <span className="mono">({done}/6 explored)</span>
        </div>
        <div className="my-work__row">
          {WORK.map((a) => (
            <button key={a.id} type="button" className="my-work__item" onClick={() => { sfx.open(); openApp(a.id); }} title={a.title}>
              <PixelIcon name={a.icon} size={36} />
              <span>{a.label}</span>
              {progress[a.id as keyof typeof progress] && <i className="tick" aria-label="explored">★</i>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
