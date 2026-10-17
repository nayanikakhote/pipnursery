import type React from 'react';
import { useEffect } from 'react';
import { useDream } from '../store/dreamStore';
import { sfx, setMuted, unlockAudio } from '../audio/audio';
import { lines } from '../content/copy';
import PixelIcon from './PixelIcon';

export function MuteToggle({ className = 'btn98 ctrl' }: { className?: string }) {
  const soundOn = useDream((s) => s.soundOn);
  const setSound = useDream((s) => s.setSound);
  const say = useDream((s) => s.say);
  const setMood = useDream((s) => s.setMood);
  return (
    <button
      type="button"
      className={className}
      aria-pressed={!soundOn}
      aria-label={soundOn ? 'Mute all sounds' : 'Unmute sounds'}
      title={soundOn ? 'Mute' : 'Unmute'}
      onClick={() => {
        unlockAudio();
        const next = !soundOn;
        setSound(next);
        setMuted(!next);
        if (next) {
          sfx.giggle();
          setMood('giggle');
          say(lines.unmute);
        } else {
          setMood('pout');
          say(lines.mute);
        }
      }}
    >
      <PixelIcon name={soundOn ? 'speaker' : 'muff'} size={26} />
      <span className="sr-only">{soundOn ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}

export function ThemeToggle({ className = 'btn98 ctrl' }: { className?: string }) {
  const theme = useDream((s) => s.theme);
  const toggle = useDream((s) => s.toggleTheme);
  const say = useDream((s) => s.say);
  const setMood = useDream((s) => s.setMood);
  return (
    <button
      type="button"
      className={className}
      aria-label={theme === 'night' ? 'Switch to sunrise mode' : 'Switch to night mode'}
      title={theme === 'night' ? 'Sunrise' : 'Night'}
      onClick={() => {
        sfx.chime();
        toggle();
        if (theme === 'night') {
          setMood('whoa');
          say(lines.morning);
        } else {
          setMood('idle');
          say(lines.night);
        }
      }}
    >
      <PixelIcon name={theme === 'night' ? 'sun' : 'moon'} size={26} />
    </button>
  );
}

export function SpeechBubble({ style, className = '' }: { style?: React.CSSProperties; className?: string }) {
  const bubble = useDream((s) => s.bubble);
  const clear = useDream((s) => s.clearBubble);
  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => clear(bubble.key), Math.max(3200, bubble.text.length * 70));
    return () => window.clearTimeout(t);
  }, [bubble, clear]);
  if (!bubble) return null;
  return (
    <div key={bubble.key} className={`bubble bubble-pop ${className}`} style={style} role="status" aria-live="polite">
      {bubble.text}
    </div>
  );
}

export function Toast() {
  const toast = useDream((s) => s.toast);
  const clear = useDream((s) => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => clear(toast.key), 2600);
    return () => window.clearTimeout(t);
  }, [toast, clear]);
  if (!toast) return null;
  return (
    <div key={toast.key} className="toast bevel" role="status">
      {toast.text}
    </div>
  );
}
