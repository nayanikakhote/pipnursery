import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Scene = 'nursery' | 'zooming' | 'booting' | 'desktop' | 'finale' | 'secret' | 'shutdown';

export type AppId =
  | 'mypip'
  | 'lullaby'
  | 'nightlights'
  | 'routes'
  | 'toys'
  | 'bedtime'
  | 'growth'
  | 'story'
  | 'wishes'
  | 'chat'
  | 'stickers'
  | 'lantern'
  | 'gravity'
  | 'socks'
  | 'devnotes'
  | 'credits'
  | 'secretfile';

export type PipMood =
  | 'idle'
  | 'giggle'
  | 'cheer'
  | 'yawn'
  | 'asleep'
  | 'pout'
  | 'sneeze'
  | 'whoa';

export type ProjectKey =
  | 'lullaby'
  | 'nightlights'
  | 'routes'
  | 'toys'
  | 'bedtime'
  | 'growth'
  | 'story';

export interface Win {
  id: AppId;
  z: number;
  x: number;
  y: number;
  min: boolean;
  max: boolean;
}

interface Bubble {
  text: string;
  key: number;
}

interface DreamState {
  // session
  scene: Scene;
  windows: Win[];
  zTop: number;
  mood: PipMood;
  bubble: Bubble | null;
  pipClicks: number;
  startOpen: boolean;
  toast: Bubble | null;

  // persisted
  soundOn: boolean;
  theme: 'night' | 'sunrise';
  reducedMotion: boolean;
  sparkleOn: boolean;
  progress: Record<ProjectKey, boolean>;
  badges: string[];
  secretUnlocked: boolean;
  /** Small named facts the apps set and read: "lullaby:played", "light:order", … */
  flags: Record<string, string | number | boolean>;
  visitor: { visits: number; lastVisit?: string; name?: string };

  // actions
  setScene: (s: Scene) => void;
  openApp: (id: AppId) => void;
  closeApp: (id: AppId) => void;
  focusApp: (id: AppId) => void;
  minimizeApp: (id: AppId) => void;
  toggleMax: (id: AppId) => void;
  moveApp: (id: AppId, x: number, y: number) => void;
  closeAll: () => void;
  setStartOpen: (v: boolean) => void;
  setSound: (v: boolean) => void;
  toggleTheme: () => void;
  setReducedMotion: (v: boolean) => void;
  setSparkle: (v: boolean) => void;
  setMood: (m: PipMood) => void;
  say: (text: string) => void;
  clearBubble: (key: number) => void;
  showToast: (text: string) => void;
  clearToast: (key: number) => void;
  setFlag: (key: string, value?: string | number | boolean) => void;
  award: (badge: string) => boolean;
  complete: (p: ProjectKey) => boolean;
  clickPip: () => number;
  unlockSecret: () => void;
  registerVisit: () => void;
  setVisitorName: (name: string) => void;
  forgetMe: () => void;
}

const emptyProgress: Record<ProjectKey, boolean> = {
  lullaby: false,
  nightlights: false,
  routes: false,
  toys: false,
  bedtime: false,
  growth: false,
  story: false,
};

let keyCounter = 1;

export const useDream = create<DreamState>()(
  persist(
    (set, get) => ({
      scene: 'nursery',
      windows: [],
      zTop: 10,
      mood: 'idle',
      bubble: null,
      pipClicks: 0,
      startOpen: false,
      toast: null,

      soundOn: true,
      theme: 'night',
      reducedMotion: false,
      sparkleOn: true,
      progress: { ...emptyProgress },
      badges: [],
      secretUnlocked: false,
      flags: {},
      visitor: { visits: 0 },

      setScene: (scene) => set({ scene, startOpen: false }),

      openApp: (id) => {
        const { windows, zTop } = get();
        const existing = windows.find((w) => w.id === id);
        const z = zTop + 1;
        if (existing) {
          set({
            windows: windows.map((w) => (w.id === id ? { ...w, z, min: false } : w)),
            zTop: z,
            startOpen: false,
          });
          return;
        }
        const n = windows.length;
        set({
          windows: [...windows, { id, z, x: 140 + n * 28, y: 40 + n * 28, min: false, max: false }],
          zTop: z,
          startOpen: false,
        });
      },
      closeApp: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),
      focusApp: (id) => {
        const { windows, zTop } = get();
        const w = windows.find((x) => x.id === id);
        if (!w || w.z === zTop) return;
        const z = zTop + 1;
        set({ windows: windows.map((x) => (x.id === id ? { ...x, z, min: false } : x)), zTop: z });
      },
      minimizeApp: (id) =>
        set({ windows: get().windows.map((w) => (w.id === id ? { ...w, min: true } : w)) }),
      toggleMax: (id) =>
        set({ windows: get().windows.map((w) => (w.id === id ? { ...w, max: !w.max } : w)) }),
      moveApp: (id, x, y) =>
        set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) }),
      closeAll: () => set({ windows: [] }),
      setStartOpen: (startOpen) => set({ startOpen }),

      setSound: (soundOn) => set({ soundOn }),
      toggleTheme: () => set({ theme: get().theme === 'night' ? 'sunrise' : 'night' }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSparkle: (sparkleOn) => set({ sparkleOn }),

      setMood: (mood) => set({ mood }),
      say: (text) => set({ bubble: { text, key: keyCounter++ } }),
      clearBubble: (key) => {
        if (get().bubble?.key === key) set({ bubble: null });
      },
      showToast: (text) => set({ toast: { text, key: keyCounter++ } }),
      clearToast: (key) => {
        if (get().toast?.key === key) set({ toast: null });
      },

      setFlag: (key, value = true) => set({ flags: { ...get().flags, [key]: value } }),

      award: (badge) => {
        const { badges } = get();
        if (badges.includes(badge)) return false;
        set({ badges: [...badges, badge] });
        return true;
      },
      complete: (p) => {
        const { progress } = get();
        if (progress[p]) return false;
        set({ progress: { ...progress, [p]: true } });
        get().award(`project-${p}`);
        return true;
      },
      clickPip: () => {
        const n = get().pipClicks + 1;
        set({ pipClicks: n });
        return n;
      },
      unlockSecret: () => set({ secretUnlocked: true }),
      registerVisit: () => {
        const v = get().visitor;
        set({ visitor: { ...v, visits: v.visits + 1, lastVisit: new Date().toISOString() } });
      },
      setVisitorName: (name) => set({ visitor: { ...get().visitor, name } }),
      forgetMe: () =>
        set({
          progress: { ...emptyProgress },
          badges: [],
          secretUnlocked: false,
          flags: {},
          visitor: { visits: 1 },
        }),
    }),
    {
      name: 'pip-midnight-nursery',
      storage: createJSONStorage(() => {
        try {
          const k = '__pip_test__';
          window.localStorage.setItem(k, '1');
          window.localStorage.removeItem(k);
          return window.localStorage;
        } catch {
          const mem = new Map<string, string>();
          return {
            getItem: (n: string) => mem.get(n) ?? null,
            setItem: (n: string, v: string) => void mem.set(n, v),
            removeItem: (n: string) => void mem.delete(n),
          };
        }
      }),
      partialize: (s) => ({
        soundOn: s.soundOn,
        theme: s.theme,
        reducedMotion: s.reducedMotion,
        sparkleOn: s.sparkleOn,
        progress: s.progress,
        badges: s.badges,
        secretUnlocked: s.secretUnlocked,
        flags: s.flags,
        visitor: s.visitor,
      }),
    },
  ),
);
