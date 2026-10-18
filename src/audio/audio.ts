// All sounds are synthesized with the Web Audio API. Nothing plays until the
// visitor's first click/tap/key (unlockAudio), and everything routes through
// one master gain so the mute switch silences the whole site.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let echo: DelayNode | null = null;
let echoIn: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.9;
      master.connect(ctx.destination);

      // soft echo used by the music box
      echoIn = ctx.createGain();
      echoIn.gain.value = 0.35;
      echo = ctx.createDelay(1);
      echo.delayTime.value = 0.25;
      const fb = ctx.createGain();
      fb.gain.value = 0.3;
      echoIn.connect(echo);
      echo.connect(fb);
      fb.connect(echo);
      echo.connect(master);

      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio unavailable: the site still works silently */
  }
}

export function setMuted(m: boolean) {
  muted = m;
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.03);
}

export function audioReady() {
  return !!ctx && ctx.state === 'running';
}

export function now() {
  return ctx ? ctx.currentTime : 0;
}

/** Seconds, from the audio clock when there is one and the wall clock when
    there isn't — so a sequencer keeps time even muted or before first tap. */
export function clock() {
  return ctx && ctx.state === 'running' ? ctx.currentTime : performance.now() / 1000;
}

interface ToneOpts {
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  when?: number; // seconds from now
  toFreq?: number;
  vibrato?: number;
  echo?: boolean;
}

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime + (o.when ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.toFreq) osc.frequency.exponentialRampToValueAtTime(o.toFreq, t0 + dur * 0.8);
  if (o.vibrato) {
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = o.vibrato;
    lg.gain.value = freq * 0.04;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + dur + 0.05);
  }
  const peak = o.gain ?? 0.1;
  const atk = o.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  if (o.echo && echoIn) g.connect(echoIn);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, o: { freq?: number; q?: number; type?: BiquadFilterType; gain?: number; when?: number } = {}) {
  if (!ctx || !master || !noiseBuf || muted) return;
  const t0 = ctx.currentTime + (o.when ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.frequency.value = o.freq ?? 1000;
  f.Q.value = o.q ?? 1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(o.gain ?? 0.15, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];

export const sfx = {
  click: () => tone(880, 0.05, { gain: 0.06 }),
  open: () => {
    tone(660, 0.09, { type: 'triangle', gain: 0.08 });
    tone(990, 0.12, { type: 'triangle', gain: 0.08, when: 0.06 });
  },
  close: () => {
    tone(990, 0.08, { type: 'triangle', gain: 0.07 });
    tone(660, 0.1, { type: 'triangle', gain: 0.07, when: 0.05 });
  },
  chime: () => {
    tone(1320, 0.7, { type: 'triangle', gain: 0.07, echo: true });
    tone(1760, 0.7, { type: 'triangle', gain: 0.05, when: 0.04, echo: true });
  },
  giggle: () => {
    [700, 850, 1000, 900].forEach((f, i) => tone(f, 0.12, { gain: 0.08, when: i * 0.09, vibrato: 9 }));
  },
  bonk: () => tone(220, 0.16, { type: 'triangle', gain: 0.12, toFreq: 160 }),
  sneeze: () => {
    tone(500, 0.12, { gain: 0.06, toFreq: 900 });
    noise(0.25, { freq: 2500, q: 0.7, gain: 0.18, when: 0.14 });
    tone(400, 0.08, { gain: 0.06, when: 0.18 });
  },
  boot: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, 0.6, { type: 'triangle', gain: 0.08, when: i * 0.13, echo: true }),
    );
  },
  note: (freq: number, when = 0, gain = 0.09) => {
    tone(freq, 1.2, { gain, when, echo: true });
    tone(freq * 2, 0.6, { type: 'triangle', gain: gain * 0.25, when, echo: true });
  },
  whoosh: () => noise(0.5, { freq: 600, q: 0.5, gain: 0.1, type: 'lowpass' }),
  pop: () => tone(600, 0.08, { gain: 0.08, toFreq: 1200 }),
  sparkle: () => {
    [1568, 2093, 2637].forEach((f, i) => tone(f, 0.25, { type: 'triangle', gain: 0.035, when: i * 0.05 }));
  },
  jingle: () => {
    const d = 1 + (Math.random() - 0.5) * 0.06;
    tone(2093 * d, 0.18, { type: 'triangle', gain: 0.05 });
    tone(2637 * d, 0.2, { type: 'triangle', gain: 0.04, when: 0.03 });
    tone(3136 * d, 0.15, { type: 'triangle', gain: 0.03, when: 0.07 });
  },
  clack: () => {
    tone(300, 0.06, { type: 'square', gain: 0.04 });
    noise(0.07, { freq: 800, q: 3, gain: 0.15 });
  },
  shuffle: () => {
    [0, 0.06, 0.12].forEach((w) => noise(0.05, { freq: 3000, q: 0.8, gain: 0.12, type: 'highpass', when: w }));
  },
  yawn: () => tone(500, 0.9, { gain: 0.05, toFreq: 260, vibrato: 4 }),
  static: () => noise(0.3, { freq: 1800, q: 0.4, gain: 0.05 }),
};
