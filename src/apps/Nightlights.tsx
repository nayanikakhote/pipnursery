import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { LIGHT_ART, CREATURE_ART } from '../content/assets';
import { asset } from '../lib/asset';
import './nightlights.css';

type LightId = 'moonbeam' | 'cloudberry' | 'starling';
type Swatch = 'amber' | 'pink' | 'lavender';

interface Light {
  id: LightId;
  name: string;
  forWhom: string;
  creature: keyof typeof CREATURE_ART;
  fear: string;
  note: string;
  colour: Swatch;
  art?: string;
}

const LIGHTS: Light[] = [
  {
    id: 'moonbeam',
    name: 'Moonbeam',
    forWhom: 'Boo',
    creature: 'boo',
    fear: 'afraid of the dark',
    note: 'a ghost scared of the dark! so i gave him his own little moon.',
    colour: 'amber',
    art: LIGHT_ART.moonbeam,
  },
  {
    id: 'cloudberry',
    name: 'Cloudberry',
    forWhom: 'Fern',
    creature: 'fern',
    fear: 'overthinks at bedtime',
    note: 'it glows slower when you breathe slower. fern says it helps.',
    colour: 'pink',
    art: LIGHT_ART.cloudberry,
  },
  {
    id: 'starling',
    name: 'Starling',
    forWhom: 'Nibbles',
    creature: 'nibbles',
    fear: 'misses the stars',
    note: 'it throws stars on her burrow ceiling. now she has her own sky.',
    colour: 'lavender',
    art: LIGHT_ART.starling,
  },
];

const SWATCHES: { id: Swatch; label: string; hex: string }[] = [
  { id: 'amber', label: 'warm amber', hex: '#F4C96B' },
  { id: 'pink', label: 'soft pink', hex: '#EFC6D2' },
  { id: 'lavender', label: 'lavender', hex: '#C9B8E8' },
];

/** The fourth lamp, for everyone, once the order is right. */
const SECRET_ORDER: LightId[] = ['moonbeam', 'cloudberry', 'starling'];

export default function Nightlights() {
  const complete = useDream((s) => s.complete);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const award = useDream((s) => s.award);
  const setFlag = useDream((s) => s.setFlag);
  const flags = useDream((s) => s.flags);

  const [on, setOn] = useState<Record<LightId, boolean>>({ moonbeam: false, cloudberry: false, starling: false });
  const [colour, setColour] = useState<Record<LightId, Swatch>>({ moonbeam: 'amber', cloudberry: 'pink', starling: 'lavender' });
  const [lightsOut, setLightsOut] = useState(false);
  const [open, setOpen] = useState<LightId | null>(null);
  const order = useRef<LightId[]>([]);
  const lanternFound = !!flags['light:lantern'];

  const allOn = LIGHTS.every((l) => on[l.id]);

  useEffect(() => {
    if (allOn && complete('nightlights')) {
      setMood('cheer');
      say('every one of them has a light now. look how warm my room got!');
      sfx.sparkle();
    }
  }, [allOn, complete, setMood, say]);

  const toggle = (l: Light) => {
    unlockAudio();
    const next = !on[l.id];
    setOn((o) => ({ ...o, [l.id]: next }));
    if (!next) return sfx.click();
    sfx.chime();

    // Remember the order lamps were switched on in — two secrets watch it.
    const seq = [...order.current.filter((x) => x !== l.id), l.id].slice(-3);
    order.current = seq;
    setFlag('light:order', seq.join(','));

    if (!lanternFound && seq.length === 3 && seq.every((x, i) => x === SECRET_ORDER[i])) {
      setFlag('light:lantern');
      if (award('egg-lantern')) sfx.sparkle();
      setMood('giggle');
      say('moon, then cloud, then star. that is the order i built them in! here, have this one too.');
    }
  };

  const detail = LIGHTS.find((l) => l.id === open);

  return (
    <div className={`nl ${lightsOut ? 'is-dark' : ''}`}>
      <p className="nl__intro">everyone is scared of something. so i design a light for each of them.</p>

      <div className="nl__window" aria-hidden="true">
        <span className="nl__moon" />
      </div>

      <div className="nl__shelf">
        {LIGHTS.map((l) => {
          const lit = on[l.id];
          const c = SWATCHES.find((s) => s.id === colour[l.id])!;
          return (
            <div key={l.id} className={`lamp lamp--${l.id} ${lit ? 'is-on' : ''}`} style={{ ['--glow' as string]: c.hex }}>
              <span className="lamp__spill" aria-hidden="true" />
              {l.id === 'starling' && lit && (
                <span className="lamp__sky" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, i) => (
                    <i key={i} style={{ left: `${(i * 37) % 95}%`, top: `${(i * 53) % 80}%`, animationDelay: `${i * 0.21}s` }} />
                  ))}
                </span>
              )}
              <button
                type="button"
                className={`lamp__btn ${l.id === 'cloudberry' && lit ? 'is-breathing' : ''}`}
                onClick={() => toggle(l)}
                aria-pressed={lit}
                aria-label={`${l.name}, for ${l.forWhom}. ${lit ? 'On' : 'Off'}. Tap to turn ${lit ? 'off' : 'on'}.`}
              >
                {l.art ? (
                  <img src={l.art} alt="" draggable={false} loading="lazy" decoding="async" />
                ) : (
                  <span className={`lamp__css lamp__css--${l.id}`} aria-hidden="true" />
                )}
              </button>

              <div className="card">
                <h3>{l.name}</h3>
                <p className="card__for">
                  {CREATURE_ART[l.creature] && <img className="card__pal" src={CREATURE_ART[l.creature]} alt="" draggable={false} loading="lazy" decoding="async" />}
                  for <b>{l.forWhom}</b> — {l.fear}
                </p>
                <p className="card__note">“{l.note}”</p>
                <div className="card__swatches" role="group" aria-label={`${l.name} colour`}>
                  {SWATCHES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`swatch ${colour[l.id] === s.id ? 'is-on' : ''}`}
                      style={{ background: s.hex }}
                      aria-label={`${l.name} in ${s.label}`}
                      aria-pressed={colour[l.id] === s.id}
                      onClick={() => {
                        sfx.pop();
                        setColour((c2) => ({ ...c2, [l.id]: s.id }));
                        if (!on[l.id]) toggle(l);
                      }}
                    />
                  ))}
                </div>
                <button type="button" className="btn98 card__more" onClick={() => { sfx.click(); setOpen(open === l.id ? null : l.id); }} aria-expanded={open === l.id}>
                  {open === l.id ? 'thanks pip' : 'why this one?'}
                </button>
              </div>
            </div>
          );
        })}

        {lanternFound && (
          <div className="lamp lamp--lantern is-on" style={{ ['--glow' as string]: '#F4C96B' }}>
            <span className="lamp__spill" aria-hidden="true" />
            <div className="lamp__btn lamp__btn--static">
              <img src={asset('assets/dream-lantern.webp')} alt="The Dream Lantern" draggable={false} />
            </div>
            <div className="card">
              <h3>Dream Lantern</h3>
              <p className="card__for">
                for <b>everyone</b> — the one i carry
              </p>
              <p className="card__note">“this one isn't for being scared. it's for finding your way back.”</p>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <p className="nl__detail" role="status">
          <b>{detail.name}</b> — {detail.note} <span className="mono">({detail.forWhom}: {detail.fear})</span>
        </p>
      )}

      <div className="nl__controls">
        <button type="button" className="btn98" onClick={() => { sfx.whoosh(); setLightsOut(!lightsOut); }} aria-pressed={lightsOut}>
          {lightsOut ? '☾ lights back on' : '☀ lights out'}
        </button>
        <span className="nl__count mono">
          {LIGHTS.filter((l) => on[l.id]).length}/3 glowing
        </span>
      </div>
    </div>
  );
}
