import { useEffect, useState } from 'react';
import { getVisitorCount, type CounterResult } from '../lib/counter';

const DIGITS = 7;

export default function Odometer({ compact = false }: { compact?: boolean }) {
  const [res, setRes] = useState<CounterResult | null>(null);
  useEffect(() => {
    let alive = true;
    void getVisitorCount().then((r) => alive && setRes(r));
    return () => {
      alive = false;
    };
  }, []);
  const value = res?.value ?? 0;
  const str = String(value).padStart(DIGITS, '0').slice(-DIGITS);
  const label = res?.shared ? 'VISITORS' : 'YOUR VISITS';
  return (
    <div className={`odometer ${compact ? 'compact' : ''}`} role="img" aria-label={`${label.toLowerCase()}: ${value}`} title={res?.shared ? 'everyone who visited pip' : 'how many times you visited pip'}>
      {!compact && <span className="odometer__label">{label}</span>}
      <span className="odometer__digits">
        {str.split('').map((d, i) => (
          <span key={i} className="odo-digit">
            <span className="odo-strip" style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${(DIGITS - i) * 90}ms` }}>
              {'0123456789'.split('').map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}
