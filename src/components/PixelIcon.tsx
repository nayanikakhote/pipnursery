import type React from 'react';
import { memo } from 'react';
import { art } from '../content/assets';

// Hand-made pixel art. Each map is a grid of characters; each character is a
// palette colour ('.' = transparent). Rendered as crisp SVG rects.
const PAL: Record<string, string> = {
  k: '#5C4033', // cocoa outline
  c: '#FFF8F1', // cream
  p: '#EFC6D2', // pink
  b: '#A34063', // berry
  g: '#F4C96B', // gold
  o: '#D9A441', // dark gold
  l: '#C9B8E8', // lavender
  v: '#9C8BC9', // dark lavender
  n: '#30364E', // navy
  w: '#FFFFFF',
  y: '#B98157', // wood
  e: '#7FB77E', // leaf green
  s: '#9EC9E8', // sky
  r: '#E77A8F', // rose
  d: '#3B2A22', // dark
};

export const ICONS: Record<string, string[]> = {
  idcard: [
    '..............',
    '......kk......',
    '.....k..k.....',
    '.kkkkkkkkkkkk.',
    '.kbbbbbbbbbbk.',
    '.kccccccccccck',
    '.kcwwwwcckkck.',
    '.kcwdwdwcccck.',
    '.kcwwwwcckkck.',
    '.kcwwwwcccccck',
    '.kccccccgggck.',
    '.kccccccgggck.',
    '.kkkkkkkkkkkk.',
  ],
  musicbox: [
    '.......g......',
    '......gkg..g..',
    '.......k...kg.',
    '..kkkkkkkkkk..',
    '..kppppppppk..',
    '.kkkkkkkkkkkk.',
    '.kccccccccccck',
    '.kccgggggccckg',
    '.kcgccccgcckgg',
    '.kccccccccccck',
    '.kppppppppppk.',
    '.kkkkkkkkkkkk.',
    '..k........k..',
  ],
  lampfolder: [
    '..............',
    '.kkkkk........',
    '.kgggkkkkkkkk.',
    '.kggggggggggk.',
    '.kgggggggggggk',
    '.kggggwwgggggk',
    '.kgggwggwggggk',
    '.kggwggggwgggk',
    '.kgggggggggggk',
    '.kgggggggggggk',
    '.kkkkkkkkkkkkk',
  ],
  map: [
    '..............',
    '.kkkkkkkkkkkk.',
    '.kccckcccckcck',
    '.kcbcksccckcck',
    '.kccbkccscbcck',
    '.kccckbcccksck',
    '.kscckcbcckcck',
    '.kccckccbbkcbk',
    '.kccckcccckcck',
    '.kkkkkkkkkkkk.',
  ],
  rattle: [
    '..kkk.........',
    '.kgggk........',
    'kgwgggk.......',
    'kggggok.......',
    '.kgggk..kkkkk.',
    '..kpk...kllllk',
    '...kpk..kllllk',
    '....kpk.kllllk',
    '.....kpkkllllk',
    '......kkkkkkk.',
  ],
  book: [
    '..............',
    '.kkkkkkkkkkk..',
    '.knnnnnnnnnnk.',
    '.knnnngnnnnnk.',
    '.knnnggnnwnnk.',
    '.knnnggnnnnnk.',
    '.knnnnggnnwnk.',
    '.knnnnnnnnnnk.',
    '.kbbbbbbbbbbk.',
    '.kcccccccccck.',
    '.kkkkkkkkkkkk.',
  ],
  ruler: [
    '....kkkkk.....',
    '....kyyyk.....',
    '....kykkk.....',
    '....kyyyk.....',
    '....kykkk..g..',
    '....kyyyk.ggg.',
    '....kykkk..g..',
    '....kyyyk.....',
    '....kykkk.....',
    '....kyyyk.....',
    '....kkkkk.....',
  ],
  diary: [
    '..............',
    '.kkkkkkkkkkk..',
    '.kpppppppppkk.',
    '.kppppgpppkpk.',
    '.kpppgggppkpk.',
    '.kppppgpppkpk.',
    '.kpppgpgppkpk.',
    '.kpppppppppkk.',
    '.kpppppppppkk.',
    '.kkkkkkkkkkkk.',
  ],
  guestbook: [
    '..........kk..',
    '.........kgk..',
    '........kgk...',
    '.kkkkkkkgkkkk.',
    'kccccckcccccck',
    'kckkcckckkccck',
    'kccccckcccccck',
    'kckkkckckkkcck',
    'kccccckcccccck',
    '.kkkkkkkkkkkk.',
  ],
  chat: [
    '.....gg.......',
    '....kcck......',
    '...kcccck.....',
    '..kkkkkkkkk...',
    '.kccccccccck..',
    'kccnccccnccck.',
    'kccccccccccck.',
    'kcccckkkccccck',
    '.kccccccccck..',
    '..kkkkkkkk....',
    '..kk..........',
  ],
  lantern: [
    '.....kkk......',
    '....k...k.....',
    '....kkkkk.....',
    '...kllllk.....',
    '..kgggggggk...',
    '..kgwgggggk...',
    '..kggggggggk..',
    '..kgggggggk...',
    '...kllllllk...',
    '..kkkkkkkkk...',
  ],
  star: [
    '..........g...',
    '.........g....',
    '......kk......',
    '.....kggk.....',
    'kkkkkggggkkkkk',
    '.kggggwgggggk.',
    '..kggggggggk..',
    '...kggggggk...',
    '..kgggkkgggk..',
    '.kggk....kggk.',
    '.kk........kk.',
  ],
  basket: [
    '...kk...kk....',
    '..kpk..kllk...',
    '..kppk.kllk...',
    '.kkkkkkkkkkkk.',
    '.kyykyykyykyk.',
    '.kykyykyykyyk.',
    '.kyykyykyykyk.',
    '..kykyykyyky..',
    '..kkkkkkkkkk..',
  ],
  notepad: [
    '..k.k.k.k.k...',
    '.kkkkkkkkkkk..',
    '.kcccccccccck.',
    '.kcnnnnnnnck..',
    '.kcccccccccck.',
    '.kcnnnnnncck..',
    '.kcccccccccck.',
    '.kcnnnnnnnck..',
    '.kcccccccccck.',
    '.kkkkkkkkkkkk.',
  ],
  scroll: [
    '..kkkkkkkkkk..',
    '.kcccccccccck.',
    '.kkkkkkkkkkkk.',
    '..kcccccccck..',
    '..kcnnnnnnck..',
    '..kcccccccck..',
    '..kcnnnnccck..',
    '..kcccccccck..',
    '.kkkkkkkkkkkk.',
    '.kcccccccccck.',
    '..kkkkkkkkkk..',
  ],
  sleepfile: [
    '.kkkkkkkk.....',
    '.kllllllkk....',
    '.kllllllklk...',
    '.kllllllkkkk..',
    '.kllkkllkkllk.',
    '.klllllllllk..',
    '.kllllkkllllk.',
    '.klllllllllk..',
    '.kllllllllllk.',
    '.kkkkkkkkkkkk.',
  ],
  album: [
    '..............',
    '.kkkkkkkkkkkk.',
    '.kbbbbbbbbbbk.',
    '.kbcccccccckb.',
    '.kbcgcpcccckb.',
    '.kbcccclcgckb.',
    '.kbcpcccccckb.',
    '.kbccgcclcckb.',
    '.kbcccccccckb.',
    '.kbbbbbbbbbbk.',
    '.kkkkkkkkkkkk.',
  ],
  moon: [
    '....kkkk......',
    '..kkggggk.....',
    '.kgggggk......',
    '.kgggk........',
    'kgggk.........',
    'kgggk.........',
    'kggggk......k.',
    '.kggggkkkkkgk.',
    '.kgggggggggk..',
    '..kkgggggkk...',
    '....kkkkk.....',
  ],
  speaker: [
    '.....k........',
    '....kk........',
    'kkkkkk...k....',
    'kccckk....k...',
    'kccckk.k..k...',
    'kccckk.k..k...',
    'kkkkkk....k...',
    '....kk...k....',
    '.....k........',
  ],
  muff: [
    '...kkkkkk.....',
    '..k......k....',
    '.k........k...',
    'kpk......kpk..',
    'kppk....kppk..',
    'kppk....kppk..',
    'kpk......kpk..',
    '.k........k...',
  ],
  sun: [
    '......g.......',
    '..g...g...g...',
    '...g.kkk.g....',
    '....kgggk.....',
    'gg.kgggggk.gg.',
    '....kgggk.....',
    '...g.kkk.g....',
    '..g...g...g...',
    '......g.......',
  ],
};

interface Props {
  name: keyof typeof ICONS | string;
  size?: number;
  title?: string;
}

// Pip drew a matching icon sheet; where a drawn icon exists it wins, and the
// hand-made pixel maps below stay as the fallback (and still do the UI
// toggles, which have no drawn version).
const DRAWN_NAME: Record<string, string> = {
  diary: 'stardiary',
  book: 'moonbook',
  album: 'chest',
};

function PixelIconBase({ name, size = 48 }: Props) {
  const drawn = art(`icon-${DRAWN_NAME[name] ?? name}`);
  if (drawn) {
    return (
      <img
        className="pixel-icon pixel-icon--drawn"
        src={drawn}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
      />
    );
  }
  const map = ICONS[name] ?? ICONS.star;
  const w = Math.max(...map.map((r) => r.length));
  const h = map.length;
  const rects: React.ReactElement[] = [];
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = PAL[row[x]];
      if (col) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.04} height={1.04} fill={col} />);
    }
  });
  const box = Math.max(w, h);
  const ox = (box - w) / 2;
  const oy = (box - h) / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-ox} ${-oy} ${box} ${box}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="pixel-icon"
    >
      {rects}
    </svg>
  );
}

const PixelIcon = memo(PixelIconBase);
export default PixelIcon;
