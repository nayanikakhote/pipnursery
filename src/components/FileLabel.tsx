import { Fragment } from 'react';

/**
 * A filename that wraps only where a filename should.
 *
 * Icon captions are narrow, and `word-break: break-word` was snapping these
 * mid-word — "My_Story.do / c", "Lantern.ex / e", "PIP_DEV_NOT / ES.txt".
 * Inserting <wbr> after each "_" and "." gives the browser legal break points
 * at the separators, so it can use those instead of guillotining a word.
 *
 * The text itself is unchanged, so `aria-label` and copy-paste still read
 * normally — <wbr> is a zero-width opportunity, not a character.
 */
export default function FileLabel({ name }: { name: string }) {
  // keep the separators attached to the part before them
  const parts = name.split(/(?<=[._])/);
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <wbr />}
        </Fragment>
      ))}
    </>
  );
}
