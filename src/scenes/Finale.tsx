import { useEffect, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { PENTA, sfx, unlockAudio } from '../audio/audio';
import { art } from '../content/assets';
import './finale.css';

// The constellation Pip becomes: a sitting shape with a pointed nightcap.
const PIP_STARS: [number, number][] = [
  [50, 12],
  [38, 24],
  [62, 24],
  [32, 38],
  [68, 38],
  [42, 34],
  [58, 34],
  [36, 54],
  [64, 54],
  [50, 62],
  [40, 74],
  [60, 74],
];
const PIP_LINES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 7],
  [4, 8],
  [7, 9],
  [8, 9],
  [9, 10],
  [9, 11],
];

// The delivery route constellation, if those dreams were ever delivered.
const ROUTE_STARS: [number, number][] = [
  [8, 92],
  [28, 84],
  [72, 84],
  [92, 92],
];

export default function Finale() {
  const setScene = useDream((s) => s.setScene);
  const complete = useDream((s) => s.complete);
  const award = useDream((s) => s.award);
  const setFlag = useDream((s) => s.setFlag);
  const setMood = useDream((s) => s.setMood);
  const routes = useDream((s) => s.progress.routes);
  const reducedMotion = useDream((s) => s.reducedMotion);
  const [phase, setPhase] = useState(0); // 0 dim · 1 stars rising · 2 named · 3 the gift
  const [skipped, setSkipped] = useState(false);
  const pipCloud = art('pip-cloud');

  useEffect(() => {
    unlockAudio();
    complete('story');
    award('project-story');
    setMood('asleep');
    const fast = reducedMotion;
    const t = [
      window.setTimeout(() => setPhase(1), fast ? 100 : 900),
      window.setTimeout(() => {
        setPhase(2);
        PENTA.forEach((f, i) => sfx.note(f, i * 0.34, 0.07));
      }, fast ? 300 : 2600),
      window.setTimeout(() => {
        setPhase(3);
        sfx.sparkle();
        setFlag('cursor:gold');
        award('egg-constellation-pip');
      }, fast ? 600 : 5200),
    ];
    return () => t.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const home = () => {
    sfx.whoosh();
    setScene('nursery');
  };

  return (
    <div className={`finale phase-${phase} ${skipped ? "is-skipped" : ""}`} role="region" aria-label="Goodnight">
      <div className="finale__sky" aria-hidden="true" />

      {pipCloud && <img className="finale__pip" src={pipCloud} alt="" aria-hidden="true" draggable={false} />}

      <svg className="finale__svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g className="con con--pip">
          {PIP_LINES.map(([a, b], i) => (
            <line
              key={i}
              x1={PIP_STARS[a][0]}
              y1={PIP_STARS[a][1]}
              x2={PIP_STARS[b][0]}
              y2={PIP_STARS[b][1]}
              style={{ animationDelay: `${1.6 + i * 0.09}s` }}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {PIP_STARS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.3} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </g>

        {routes && (
          <g className="con con--routes">
            <polyline
              points={ROUTE_STARS.map((p) => p.join(',')).join(' ')}
              vectorEffect="non-scaling-stroke"
              style={{ animationDelay: '2.4s' }}
            />
            {ROUTE_STARS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.1} style={{ animationDelay: `${2.2 + i * 0.1}s` }} />
            ))}
          </g>
        )}

        {phase >= 3 && <circle className="gift-star" cx={50} cy={12} r={1.8} />}
      </svg>

      <div className="finale__foot">
        <p className="finale__words">goodnight, little world.</p>
        {routes && phase >= 2 && <p className="finale__sub">(your delivery routes are up there too.)</p>}

        {phase >= 3 && (
          <div className="finale__gift" role="status">
            <p>one star came loose. you can keep it. ✨</p>
            <button type="button" className="btn98 finale__home" onClick={home}>
              walk me home →
            </button>
          </div>
        )}
      </div>

      {phase < 3 && (
        <button
          type="button"
          className="btn98 finale__skip"
          onClick={() => {
            setSkipped(true);
            setPhase(3);
            setFlag('cursor:gold');
            award('egg-constellation-pip');
          }}
        >
          skip →
        </button>
      )}
    </div>
  );
}
