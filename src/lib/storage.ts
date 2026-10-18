// Where the guestbook and the visitor counter live.
//
// The site is complete and honest without a backend: in local mode wishes are
// kept in this browser and labelled as such, and the odometer counts *your*
// visits. If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set at build
// time it switches to shared mode and the same two functions talk to Supabase
// instead — lazily imported, so local mode never pays for the client.
//
// The one rule: a local wall is never described as live or shared.

export interface Wish {
  id: string;
  name: string;
  message: string;
  sticker: StickerId;
  created_at: string;
  /** Written by Pip's friends, so the wall is never empty. */
  seeded?: boolean;
}

export const STICKER_IDS = ['moon', 'star', 'ghost', 'teddy', 'bow', 'lantern'] as const;
export type StickerId = (typeof STICKER_IDS)[number];

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True only when a real backend was configured at build time. */
export const isShared = Boolean(URL_ && KEY_);

const LS_WISHES = 'pip:wishes';
const LS_LAST_POST = 'pip:lastpost';
const SS_COUNTED = 'pip:counted';

/* ------------------------------------------------------------- supabase */

type SupabaseClient = {
  from: (t: string) => {
    select: (c: string) => { order: (c: string, o: { ascending: boolean }) => { range: (a: number, b: number) => Promise<{ data: Wish[] | null; error: unknown }> } };
    insert: (rows: unknown[]) => Promise<{ error: unknown }>;
  };
  rpc: (fn: string) => Promise<{ data: number | null; error: unknown }>;
};

let clientPromise: Promise<SupabaseClient | null> | null = null;
function getClient(): Promise<SupabaseClient | null> {
  // Written as a literal comparison rather than via `isShared` so the bundler
  // can fold it away: with no env vars set, the dynamic import below becomes
  // unreachable and the Supabase client is never emitted at all.
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return Promise.resolve(null);
  }
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then((m) => m.createClient(URL_!, KEY_!) as unknown as SupabaseClient)
      .catch(() => null);
  }
  return clientPromise;
}

/* --------------------------------------------------------------- seeds */

// Signed by the cast so nobody mistakes them for real visitors.
const SEEDS: Wish[] = [
  { id: 'seed-boo', name: 'Boo', message: 'thank you for the little moon. i sleep with it on. — a ghost', sticker: 'ghost', created_at: '2026-10-01T22:14:00Z', seeded: true },
  { id: 'seed-nibbles', name: 'Nibbles', message: 'my whole ceiling is stars now!!! — nibbles (mouse)', sticker: 'star', created_at: '2026-10-03T23:40:00Z', seeded: true },
  { id: 'seed-fern', name: 'Fern', message: 'i thought about nothing for a whole hour. a record. — fern', sticker: 'moon', created_at: '2026-10-07T21:02:00Z', seeded: true },
  { id: 'seed-owl', name: 'Granny Owl', message: 'pip did very well this moon. tell him i said so. — night supervisor', sticker: 'lantern', created_at: '2026-10-11T03:30:00Z', seeded: true },
];

/* ---------------------------------------------------------------- read */

function readLocal(): Wish[] {
  try {
    const raw = window.localStorage.getItem(LS_WISHES);
    return raw ? (JSON.parse(raw) as Wish[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(all: Wish[]) {
  try {
    window.localStorage.setItem(LS_WISHES, JSON.stringify(all.slice(0, 200)));
  } catch {
    /* private browsing: the wish still shows this session, just isn't kept */
  }
}

export async function listWishes(offset = 0, limit = 50): Promise<{ wishes: Wish[]; more: boolean }> {
  const client = await getClient();
  if (client) {
    const { data, error } = await client.from('guestbook_entries').select('*').order('created_at', { ascending: false }).range(offset, offset + limit);
    if (!error && data) {
      return { wishes: data.slice(0, limit), more: data.length > limit };
    }
    // a backend that is configured but unreachable falls back rather than
    // showing an empty wall
  }
  const all = [...readLocal(), ...SEEDS].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { wishes: all.slice(offset, offset + limit), more: all.length > offset + limit };
}

/* --------------------------------------------------------------- write */

const BLOCKED = /\b(fuck|shit|bitch|cunt|nigg|f4ck|sh1t|rape|kill yourself|kys)\b/i;
const POST_GAP = 60_000;

export type PostResult = { ok: true; wish: Wish } | { ok: false; why: string };

export async function postWish(input: { name: string; message: string; sticker: StickerId; honey: string }): Promise<PostResult> {
  const name = input.name.trim().slice(0, 24);
  const message = input.message.trim().slice(0, 140);

  if (input.honey) return { ok: false, why: 'hmm. that field was for the robots.' };
  if (!name) return { ok: false, why: 'what should i call you?' };
  if (!message) return { ok: false, why: 'you forgot the wish bit!' };
  if (BLOCKED.test(name) || BLOCKED.test(message)) return { ok: false, why: "oh! i can't write that one down. i'm a baby." };

  try {
    const last = Number(window.localStorage.getItem(LS_LAST_POST) ?? 0);
    if (Date.now() - last < POST_GAP) {
      const left = Math.ceil((POST_GAP - (Date.now() - last)) / 1000);
      return { ok: false, why: `one wish at a time! try again in ${left}s.` };
    }
  } catch {
    /* no storage, no rate limit — the honeypot and length caps still apply */
  }

  const wish: Wish = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    message,
    sticker: input.sticker,
    created_at: new Date().toISOString(),
  };

  const client = await getClient();
  if (client) {
    const { error } = await client.from('guestbook_entries').insert([{ name, message, sticker: input.sticker }]);
    if (error) return { ok: false, why: "my notebook is being slow. try once more?" };
  } else {
    writeLocal([wish, ...readLocal()]);
  }

  try {
    window.localStorage.setItem(LS_LAST_POST, String(Date.now()));
  } catch {
    /* fine */
  }
  return { ok: true, wish };
}

/* -------------------------------------------------------------- counter */

/** Counts this visit once per browser session. */
export async function countVisit(localVisits: number): Promise<{ value: number; shared: boolean }> {
  const client = await getClient();
  if (!client) return { value: localVisits, shared: false };
  try {
    let already = false;
    try {
      already = window.sessionStorage.getItem(SS_COUNTED) === '1';
    } catch {
      /* no session storage: counting twice is better than not at all */
    }
    if (already) {
      const { data } = await client.rpc('visits');
      if (typeof data === 'number') return { value: data, shared: true };
    }
    const { data, error } = await client.rpc('increment_visits');
    if (error || typeof data !== 'number') return { value: localVisits, shared: false };
    try {
      window.sessionStorage.setItem(SS_COUNTED, '1');
    } catch {
      /* fine */
    }
    return { value: data, shared: true };
  } catch {
    return { value: localVisits, shared: false };
  }
}
