// What the generated art registry means to the site.
//
// tools/process_art.py cuts every image out of the collage sheets in art-raw/
// and writes src/content/art.gen.ts. Anything that was never made simply isn't
// in there, and art() returns undefined, so each component falls back to its
// hand-built CSS/SVG version and the site always works.
import { art, SCREENS } from './art.gen';

export { art, SCREENS };

export const ART = {
  /** No empty-nursery painting was ever generated, so the CSS room stays. */
  nurseryWide: undefined as string | undefined,
  nurseryTall: undefined as string | undefined,

  crtDesk: art('crt-desk'),
  wallpaperNight: art('wallpaper-night'),
  wallpaperSunrise: art('wallpaper-sunrise'),

  mobile: art('nursery-mobile'),
  teddy: art('teddy'),
  diorama: art('nursery-diorama'),
  starCharm: art('star-charm'),

  routesMap: art('routes-map'),
  growthWall: art('growth-wall'),
  secretRoom: art('secret-room'),
};

/** The four pastel blocks, in the order they're stacked. */
export const BLOCKS = ['pink', 'cream', 'lilac', 'gold'] as const;

/** The nightlights, in Moonbeam / Cloudberry / Starling order. */
export const LIGHT_ART = {
  moonbeam: art('light-moonbeam'),
  cloudberry: art('light-cloudberry'),
  starling: art('light-starling'),
};

/** Boo, Nibbles, Fern and Granny Owl. */
export const CREATURE_ART = {
  boo: art('creature-boo'),
  nibbles: art('creature-nibbles'),
  fern: art('creature-fern'),
  owl: art('creature-owl'),
};

/** Star, moon and bone rattles. */
export const RATTLE_ART = {
  star: art('rattle-star'),
  moon: art('rattle-moon'),
  bone: art('rattle-bone'),
};

/** The five origin-story chapter illustrations. */
export const STORY_ART = [1, 2, 3, 4, 5].map((n) => art(`story-${n}`));

/** The storybook: cover, then six pages. */
export const BOOK_ART = {
  cover: art('book-cover'),
  pages: [1, 2, 3, 4, 5, 6].map((n) => art(`book-${n}`)),
};

/** Pixel Pip sprites, used small (status bars, chat avatar). */
export const PIXEL_PIP = [1, 2, 3, 4, 5].map((n) => art(`pixel-pip-${n}`));
