// Every app has its own CSS file, which makes it easy to pick a class name a
// different file already uses — and because it all ends up in one global
// stylesheet, the loser is silently restyled. (.book in the storybook vs .book
// on the nursery shelf cost an hour.) Anything shared on purpose goes in
// ALLOWED below.
//
//   node tools/css-collisions.mjs
import { readFileSync, globSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// shared on purpose: the Win98 kit, and components used inside other scenes
const ALLOWED = new Set([
  'btn98',
  'bevel',
  'bevel-in',
  'tabs98',
  'tab98',
  'mono',
  'sr-only',
  'pip',
  'pixel-icon',
  'dp-icon',
  'bubble',
  'toast',
  'blink-cursor',
]);

const files = globSync('src/**/*.css', { cwd: ROOT }).map((f) => path.join(ROOT, f));
const owners = new Map();
for (const f of files) {
  const css = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/(?<![\w-])\.([A-Za-z][\w-]*)/g)) {
    const name = m[1];
    if (!owners.has(name)) owners.set(name, new Set());
    owners.get(name).add(path.relative(ROOT, f).split(path.sep).join('/'));
  }
}

const clashes = [...owners].filter(([n, fs]) => fs.size > 1 && !ALLOWED.has(n));
if (clashes.length) {
  console.error(`\n${clashes.length} class name(s) styled from more than one file:`);
  for (const [n, fs] of clashes) console.error(`  .${n}  <- ${[...fs].join(', ')}`);
  console.error('\nRename one, or add it to ALLOWED if it is shared on purpose.');
  process.exit(1);
}
console.log(`css: ${owners.size} class names across ${files.length} files, no accidental collisions.`);
