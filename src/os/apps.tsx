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
const DevNotes = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.DevNotes })));
const Credits = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.Credits })));
const LostSocks = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.LostSocks })));
const SecretFile = lazy(() => import('../apps/TextFiles').then((m) => ({ default: m.SecretFile })));
const Stickers = lazy(() => import('../apps/Stickers'));
const LullabyLab = lazy(() => import('../apps/LullabyLab'));
const Nightlights = lazy(() => import('../apps/Nightlights'));
const DreamRoutes = lazy(() => import('../apps/DreamRoutes'));
const MyStory = lazy(() => import('../apps/MyStory'));
const BedtimeStorybook = lazy(() => import('../apps/BedtimeStorybook'));
const RattleAndBlocks = lazy(() => import('../apps/RattleAndBlocks'));
const GrowthChart = lazy(() => import('../apps/GrowthChart'));
const DreamWishes = lazy(() => import('../apps/DreamWishes'));
const PipChat = lazy(() => import('../apps/PipChat'));
const Gravity = lazy(() => import('../apps/DesktopToys').then((m) => ({ default: m.Gravity })));
const LanternApp = lazy(() => import('../apps/DesktopToys').then((m) => ({ default: m.Lantern })));

export const APPS: AppDef[] = [
  { id: 'mypip', title: 'My Pip — employee file', label: 'My Pip', icon: 'idcard', group: 'me', w: 580, h: 640, component: MyPip },
  { id: 'story', title: 'My_Story.doc', label: 'My_Story.doc', icon: 'diary', group: 'me', w: 820, h: 620, component: MyStory },
  { id: 'wishes', title: 'Dream Wishes — guestbook', label: 'Dream Wishes', icon: 'guestbook', group: 'me', w: 640, h: 660, component: DreamWishes },
  { id: 'chat', title: 'PipChat.exe', label: 'PipChat.exe', icon: 'chat', group: 'me', w: 620, h: 580, component: PipChat },
  { id: 'stickers', title: 'Sticker Album', label: 'Stickers', icon: 'album', group: 'me', w: 520, h: 520, component: Stickers },

  { id: 'lullaby', title: 'Lullaby.exe — The Lullaby Lab', label: 'Lullaby.exe', icon: 'musicbox', group: 'work', w: 640, h: 700, component: LullabyLab },
  { id: 'nightlights', title: 'Nightlights/ — Nightlight Collection', label: 'Nightlights', icon: 'lampfolder', group: 'work', w: 760, h: 660, component: Nightlights },
  { id: 'routes', title: 'Dream_Routes.map', label: 'Dream_Routes.map', icon: 'map', group: 'work', w: 820, h: 680, component: DreamRoutes },
  { id: 'toys', title: 'Rattle_&_Blocks/', label: 'Rattle & Blocks', icon: 'rattle', group: 'work', w: 720, h: 640, component: RattleAndBlocks },
  { id: 'bedtime', title: 'Bedtime_Story.book', label: 'Bedtime Story', icon: 'book', group: 'work', w: 700, h: 680, component: BedtimeStorybook },
  { id: 'growth', title: 'Growth_Chart.png', label: 'Growth Chart', icon: 'ruler', group: 'work', w: 520, h: 660, component: GrowthChart },

  { id: 'lantern', title: 'Lantern.exe', label: 'Lantern.exe', icon: 'lantern', group: 'fun', w: 420, h: 340, component: LanternApp },
  { id: 'gravity', title: 'Gravity.exe', label: 'Gravity.exe', icon: 'star', group: 'fun', w: 420, h: 330, component: Gravity },
  { id: 'socks', title: 'Lost Socks', label: 'Lost Socks', icon: 'basket', group: 'files', w: 420, h: 380, component: LostSocks },
  { id: 'devnotes', title: 'PIP_DEV_NOTES.txt — Notepad', label: 'PIP_DEV_NOTES.txt', icon: 'notepad', group: 'files', w: 480, h: 480, component: DevNotes },
  { id: 'credits', title: 'Credits.txt — Notepad', label: 'Credits.txt', icon: 'scroll', group: 'files', w: 480, h: 520, component: Credits },
  { id: 'secretfile', title: 'do_not_wake_pip.txt', label: 'do_not_wake_pip.txt', icon: 'sleepfile', group: 'files', w: 520, h: 460, component: SecretFile },
];

export const appById = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<AppId, AppDef>;
export const WORK = APPS.filter((a) => a.group === 'work');
