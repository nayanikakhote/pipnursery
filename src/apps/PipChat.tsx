import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDream } from '../store/dreamStore';
import { PENTA, sfx, unlockAudio } from '../audio/audio';
import { PIXEL_PIP } from '../content/assets';
import { STICKERS } from '../content/stickers';
import { WORK } from '../os/apps';
import { QUICK_CHIPS, respond, type Ctx } from './pipchat/intents';
import './pipchat.css';

interface Msg {
  id: number;
  from: 'pip' | 'you';
  text: string;
}

let msgId = 1;

export default function PipChat() {
  const say = useDream((s) => s.say);
  const setMood = useDream((s) => s.setMood);
  const award = useDream((s) => s.award);
  const openApp = useDream((s) => s.openApp);
  const setVisitorName = useDream((s) => s.setVisitorName);
  const name = useDream((s) => s.visitor.name);
  const badges = useDream((s) => s.badges);
  const theme = useDream((s) => s.theme);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState<string[]>(QUICK_CHIPS);
  const [away, setAway] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const lastSeen = useRef(Date.now());

  // Pip opens the conversation.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setMsgs([{ id: msgId++, from: 'pip', text: name ? `${name}!! you're back. sit down, sit down.` : 'oh!! someone opened my chat window. hi!!' }]);
    }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  // keep the newest message in view
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  // night + idle: Pip wanders off
  useEffect(() => {
    const iv = window.setInterval(() => {
      if (theme === 'night' && !away && Date.now() - lastSeen.current > 75000) setAway(true);
    }, 5000);
    return () => window.clearInterval(iv);
  }, [theme, away]);

  const ctx = (): Ctx => ({
    name,
    unfound: STICKERS.filter((s) => !badges.includes(s.id)).map((s) => ({ id: s.id, hint: s.hint })),
    apps: WORK.map((a) => ({ id: a.id, label: a.label })),
    theme,
  });

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    unlockAudio();
    lastSeen.current = Date.now();
    setAway(false);
    setDraft('');
    setMsgs((m) => [...m, { id: msgId++, from: 'you', text: t.slice(0, 200) }]);
    sfx.click();
    award('egg-chatted');

    const r = respond(t, ctx());
    setTyping(true);
    let at = 500 + Math.random() * 700;

    r.lines.forEach((line, i) => {
      timers.current.push(
        window.setTimeout(() => {
          if (i === r.lines.length - 1) setTyping(false);
          setMsgs((m) => [...m, { id: msgId++, from: 'pip', text: line }]);
          sfx.pop();
        }, at),
      );
      at += 650 + line.length * 11 + Math.random() * 300;
      if (i < r.lines.length - 1) {
        timers.current.push(window.setTimeout(() => setTyping(true), at - 420));
      }
    });

    timers.current.push(
      window.setTimeout(() => {
        setChips(r.chips ?? QUICK_CHIPS);
        if (!r.act) return;
        if (r.act.kind === 'sing') {
          [0, 2, 4, 2, 3, 1, 0, 0].forEach((n, i) => sfx.note(PENTA[n], i * 0.34, 0.08));
          setMood('cheer');
        } else if (r.act.kind === 'open') {
          sfx.open();
          openApp(r.act.app as Parameters<typeof openApp>[0]);
        } else if (r.act.kind === 'remember') {
          setVisitorName(r.act.name);
          say(`${r.act.name}! i'll remember.`);
        } else if (r.act.kind === 'away') {
          setAway(true);
          sfx.yawn();
          setMood('asleep');
        }
      }, at),
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const avatar = PIXEL_PIP[0];

  return (
    <div className="pc">
      {/* buddy list */}
      <aside className="pc__buddies" aria-label="Buddy list">
        <h3>Buddies</h3>
        <ul>
          <li className={`pc__buddy ${away ? 'is-away' : 'is-on'}`}>
            {avatar ? <img src={avatar} alt="" aria-hidden="true" /> : <span className="pc__dot" aria-hidden="true" />}
            <span>
              <b>Pip</b>
              <em>{away ? 'away 💤' : 'online 🌙'}</em>
            </span>
          </li>
          <li className="pc__buddy is-off">
            <span className="pc__dot" aria-hidden="true" />
            <span>
              <b>Granny Owl</b>
              <em>on patrol</em>
            </span>
          </li>
          <li className="pc__buddy is-off">
            <span className="pc__dot" aria-hidden="true" />
            <span>
              <b>Boo</b>
              <em>asleep (finally)</em>
            </span>
          </li>
        </ul>
      </aside>

      {/* conversation */}
      <div className="pc__main">
        <header className="pc__bar">
          <b>Pip</b> <span className={away ? 'pc__status is-away' : 'pc__status'}>{away ? 'away' : 'online 🌙'}</span>
        </header>

        {away && (
          <p className="pc__awaymsg" role="status">
            zzz… pip is napping. leave a message after the giggle.
          </p>
        )}

        <div className="pc__log" ref={log} role="log" aria-live="polite" aria-label="Conversation with Pip">
          {msgs.map((m) => (
            <p key={m.id} className={`pc__msg pc__msg--${m.from}`}>
              <b>{m.from === 'pip' ? 'Pip' : (name ?? 'you')}:</b> {m.text}
            </p>
          ))}
          {typing && (
            <p className="pc__msg pc__msg--typing" aria-hidden="true">
              <b>Pip</b> is typing<i>.</i>
              <i>.</i>
              <i>.</i>
            </p>
          )}
        </div>

        <div className="pc__chips" role="group" aria-label="Things to say">
          {chips.map((c) => (
            <button key={c} type="button" className="btn98 pc__chip" onClick={() => send(c)}>
              {c}
            </button>
          ))}
        </div>

        <form className="pc__compose" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="pc-input">
            Say something to Pip
          </label>
          <input id="pc-input" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={200} placeholder="say something to pip…" autoComplete="off" />
          <button type="submit" className="btn98 pc__send" disabled={!draft.trim()}>
            send
          </button>
        </form>
      </div>
    </div>
  );
}
