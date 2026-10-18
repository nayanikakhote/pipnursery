import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { AppId } from '../store/dreamStore';

export type AppGroup = 'me' | 'work' | 'fun' | 'files';

export interface AppDef {
  id: AppId;
  title: string; // window title
  label: string; // desktop icon label
  icon: string; // PixelIcon name
  group: AppGroup;
  w: number;
  h: number;
  component: LazyExoticComponent<ComponentType>;
}

const MyPip = lazy(() => import('../apps/MyPip'));
const Placeholder = lazy(() => import('../apps/Placeholder'));
const DevNotes = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.DevNotes })));
const Credits = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.Credits })));
const LostSocks = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.LostSocks })));
const SecretFile = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.SecretFile })));
const Stickers = lazy(() => import('../apps/Stickers'));
const LullabyLab = lazy(() => import('../apps/LullabyLab'));
const Nightlights = lazy(() => import('../apps/Nightlights'));
const DreamRoutes = lazy(() => import('../apps/DreamRoutes'));

export const APPS: AppDef[] = [
  { id: 'mypip', title: 'My Pip — employee file', label: 'My Pip', icon: 'idcard', group: 'me', w: 580, h: 640, component: MyPip },
  { id: 'story', title: 'My_Story.doc', label: 'My_Story.doc', icon: 'diary', group: 'me', w: 720, h: 600, component: Placeholder },
  { id: 'wishes', title: 'Dream Wishes — guestbook', label: 'Dream Wishes', icon: 'guestbook', group: 'me', w: 560, h: 600, component: Placeholder },
  { id: 'chat', title: 'PipChat.exe', label: 'PipChat.exe', icon: 'chat', group: 'me', w: 460, h: 560, component: Placeholder },
  { id: 'stickers', title: 'Sticker Album', label: 'Stickers', icon: 'album', group: 'me', w: 520, h: 520, component: Stickers },

  { id: 'lullaby', title: 'Lullaby.exe — The Lullaby Lab', label: 'Lullaby.exe', icon: 'musicbox', group: 'work', w: 640, h: 700, component: LullabyLab },
  { id: 'nightlights', title: 'Nightlights/ — Nightlight Collection', label: 'Nightlights', icon: 'lampfolder', group: 'work', w: 760, h: 660, component: Nightlights },
  { id: 'routes', title: 'Dream_Routes.map', label: 'Dream_Routes.map', icon: 'map', group: 'work', w: 820, h: 680, component: DreamRoutes },
  { id: 'toys', title: 'Rattle_&_Blocks/', label: 'Rattle & Blocks', icon: 'rattle', group: 'work', w: 720, h: 600, component: Placeholder },
  { id: 'bedtime', title: 'Bedtime_Story.book', label: 'Bedtime Story', icon: 'book', group: 'work', w: 820, h: 600, component: Placeholder },
  { id: 'growth', title: 'Growth_Chart.png', label: 'Growth Chart', icon: 'ruler', group: 'work', w: 460, h: 640, component: Placeholder },

  { id: 'lantern', title: 'Lantern.exe', label: 'Lantern.exe', icon: 'lantern', group: 'fun', w: 400, h: 300, component: Placeholder },
  { id: 'gravity', title: 'Gravity.exe', label: 'Gravity.exe', icon: 'star', group: 'fun', w: 400, h: 300, component: Placeholder },
  { id: 'socks', title: 'Lost Socks', label: 'Lost Socks', icon: 'basket', group: 'files', w: 420, h: 380, component: LostSocks },
  { id: 'devnotes', title: 'PIP_DEV_NOTES.txt — Notepad', label: 'PIP_DEV_NOTES.txt', icon: 'notepad', group: 'files', w: 480, h: 480, component: DevNotes },
  { id: 'credits', title: 'Credits.txt — Notepad', label: 'Credits.txt', icon: 'scroll', group: 'files', w: 480, h: 520, component: Credits },
  { id: 'secretfile', title: 'do_not_wake_pip.txt', label: 'do_not_wake_pip.txt', icon: 'sleepfile', group: 'files', w: 520, h: 460, component: SecretFile },
];

export const appById = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<AppId, AppDef>;
export const WORK = APPS.filter((a) => a.group === 'work');
