// Where Pip hid things on his wallpaper.
//
// This sits apart from DesktopToys so the lantern overlay can read it without
// statically importing the lazily-loaded app — which would pull that app into
// the main bundle and defeat the code splitting.
/** The five star doodles hidden on the wallpaper, and three things Pip wrote. */
export const LANTERN_SPOTS = [
  { id: 'l1', x: 9, y: 22, kind: 'star' as const, text: '' },
  { id: 'l2', x: 72, y: 14, kind: 'star' as const, text: '' },
  { id: 'l3', x: 44, y: 61, kind: 'star' as const, text: '' },
  { id: 'l4', x: 88, y: 74, kind: 'star' as const, text: '' },
  { id: 'l5', x: 24, y: 83, kind: 'star' as const, text: '' },
  { id: 'm1', x: 60, y: 36, kind: 'note' as const, text: 'i drew these when i could not sleep.' },
  { id: 'm2', x: 16, y: 52, kind: 'note' as const, text: 'granny owl says the dark is just the room resting.' },
  { id: 'm3', x: 80, y: 47, kind: 'note' as const, text: 'if you are reading this, you are up very late too.' },
];
