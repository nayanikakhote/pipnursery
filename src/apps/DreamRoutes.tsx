import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, unlockAudio } from '../audio/audio';
import { ART, CREATURE_ART, art } from '../content/assets';
import './routes.css';

type StopId = 'chimney' | 'treehouse' | 'pond';

interface Stop {
  id: StopId;
  name: string;
  who: string;
  creature: keyof typeof CREATURE_ART;
  dream: string;
  /** Position on the map, in % — matched to the painted rooftops. */
  x: number;
  y: number;
}

// The nursery is bottom-left on the painted map; every route starts there.
const HOME = { x: 17, y: 64 };

const STOPS: Stop[] = [
  { id: 'chimney', name: 'The Crooked Chimney', who: 'Boo', creature: 'boo', dream: 'a sky full of friendly moons', x: 21, y: 24 },
  { id: 'treehouse', name: 'The Willow Treehouse', who: 'Nibbles', creature: 'nibbles', dream: 'lying in a field, counting stars', x: 80, y: 26 },
  { id: 'pond', name: 'The Lilypad Pond', who: 'Fern', creature: 'fern', dream: 'a quiet pond where no thoughts are allowed, only frogs', x: 77, y: 79 },
];

/** A gentle arc from the nursery to a rooftop — Pip does not fly in straight lines. */
function routePath(s: Stop) {
  const mx = (HOME.x + s.x) / 2;
  const my = (HOME.y + s.y) / 2 - 18;
  return `M ${HOME.x} ${HOME.y} Q ${mx} ${my} ${s.x} ${s.y}`;
}

export default function DreamRoutes() {
  const complete = useDream((s) => s.complete);
  const setMood = useDream((s) => s.setMood);
  const say = useDream((s) => s.say);
  const reducedMotion = useDream((s) => s.reducedMotion);

  const [open, setOpen] = useState<StopId | null>(null);
  const [done, setDone] = useState<StopId[]>([]);
  const [flying, setFlying] = useState<StopId | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const pipRef = useRef<SVGGElement>(null);
  const flyImg = useRef<HTMLImageElement>(null);
  const raf = useRef(0);

  const all = done.length === STOPS.length;
  const mapArt = ART.routesMap;
  const pipFly = art('pip-fly');

  useEffect(() => {
    if (all && complete('routes')) {
      setMood('cheer');
      say('all delivered! look — the routes made a constellation.');
      sfx.sparkle();
    }
  }, [all, complete, setMood, say]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const deliver = (s: Stop) => {
    if (done.includes(s.id) || flying) return;
    unlockAudio();
    sfx.whoosh();
    setFlying(s.id);
    setOpen(null);

    const path = pathRefs.current[s.id];
    const total = path?.getTotalLength() ?? 0;
    const dur = reducedMotion ? 200 : 1700;
    const t0 = performance.now();

    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / dur);
      // ease-in-out so Pip lifts off and lands gently
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      if (path) {
        // the viewBox is 0-100 with preserveAspectRatio="none", so a point on
        // the path is already a percentage of the map
        const p = path.getPointAtLength(e * total);
        pipRef.current?.setAttribute('transform', `translate(${p.x} ${p.y})`);
        if (flyImg.current) {
          flyImg.current.style.left = `${p.x}%`;
          flyImg.current.style.top = `${p.y}%`;
        }
      }
      if (t < 1) {
        raf.current = requestAnimationFrame(step);
        return;
      }
      sfx.chime();
      setFlying(null);
      setDone((d) => (d.includes(s.id) ? d : [...d, s.id]));
      setLog((l) => [...l, `${s.who} — ${s.dream}`]);
      setMood('giggle');
      say(`delivered! ${s.who} is going to sleep so well.`);
    };
    raf.current = requestAnimationFrame(step);
  };

  const detail = STOPS.find((s) => s.id === open);

  return (
    <div className="dr">
      <p className="dr__intro">every night i fly dreams across the rooftops. this is my map. help me deliver tonight's batch?</p>

      <div className="dr__mapwrap" data-pannable="1">
        <div className="dr__map-inner">
        {mapArt ? (
          <img className="dr__map" src={mapArt} alt="Pip's rooftop map: the nursery, a crooked chimney, a willow treehouse and a lilypad pond" draggable={false}  decoding="async"/>
        ) : (
          <div className="dr__map dr__map--css" role="img" aria-label="Pip's rooftop map" />
        )}

        <svg className="dr__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {STOPS.map((s) => (
            <path
              key={s.id}
              ref={(el) => void (pathRefs.current[s.id] = el)}
              className={`route ${done.includes(s.id) ? 'is-done' : ''} ${flying === s.id ? 'is-flying' : ''}`}
              d={routePath(s)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {all && (
            <g className="constellation">
              <polyline points={`${HOME.x},${HOME.y} ${STOPS[0].x},${STOPS[0].y} ${STOPS[1].x},${STOPS[1].y} ${STOPS[2].x},${STOPS[2].y} ${HOME.x},${HOME.y}`} vectorEffect="non-scaling-stroke" />
              {[HOME, ...STOPS].map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.4" style={{ animationDelay: `${i * 0.14}s` }} />
              ))}
            </g>
          )}
          <g ref={pipRef} className={`flyer ${flying ? 'is-on' : ''}`} transform={`translate(${HOME.x} ${HOME.y})`}>
            <circle r="2.4" />
          </g>
        </svg>

        {pipFly && <img ref={flyImg} className={`dr__pip ${flying ? 'is-on' : ''}`} src={pipFly} alt="" aria-hidden="true" draggable={false} />}

        {STOPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`roof ${done.includes(s.id) ? 'is-done' : ''} ${open === s.id ? 'is-open' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => {
              unlockAudio();
              sfx.click();
              setOpen(open === s.id ? null : s.id);
            }}
            aria-expanded={open === s.id}
            aria-label={`${s.name}, ${s.who}. ${done.includes(s.id) ? 'Dream delivered.' : 'Tap to see tonight’s dream.'}`}
          >
            <span className="roof__pulse" aria-hidden="true" />
            <span className="roof__dot" aria-hidden="true">
              {done.includes(s.id) ? '★' : '◇'}
            </span>
          </button>
        ))}

        <span className="roof roof--home" style={{ left: `${HOME.x}%`, top: `${HOME.y}%` }} aria-hidden="true">
          <span className="roof__dot">☾</span>
        </span>
        </div>
      </div>

      <p className="dr__scrollhint">← slide the map to see every rooftop →</p>

      {detail && (
        <div className="dr__card" role="status">
          {CREATURE_ART[detail.creature] && <img className="dr__card-pal" src={CREATURE_ART[detail.creature]} alt="" draggable={false} loading="lazy" decoding="async" />}
          <div>
            <h3>{detail.name}</h3>
            <p className="dr__who">
              <b>{detail.who}</b> ordered:
            </p>
            <p className="dr__dream">“{detail.dream}”</p>
          </div>
          <button type="button" className="btn98 dr__deliver" onClick={() => deliver(detail)} disabled={done.includes(detail.id) || !!flying}>
            {done.includes(detail.id) ? 'delivered ★' : 'Deliver'}
          </button>
        </div>
      )}

      <div className="dr__bottom">
        <div className="dr__log bevel-in">
          <h4>Pip's Delivery Log</h4>
          <p className="mono dr__tally">dreams delivered tonight: {done.length}/3</p>
          <ul>
            {log.length === 0 && <li className="is-empty">nothing stamped yet…</li>}
            {log.map((l, i) => (
              <li key={i}>
                <span className="stamp" aria-hidden="true">
                  ✦
                </span>
                {l}
              </li>
            ))}
          </ul>
        </div>
        {!detail && !all && <p className="dr__hint">tap a glowing rooftop to see what they asked for.</p>}
        {all && <p className="dr__hint dr__hint--done">the whole neighbourhood is asleep. ✨</p>}
      </div>
    </div>
  );
}
