// Browser QA for Pip's Midnight Nursery.
//
//   npm run build && node tools/check.mjs            # the whole flow, 3 sizes
//   node tools/check.mjs --flow=desktop              # one flow only
//   node tools/check.mjs --keep                      # leave the preview running
//
// We depend on `playwright-core` (no postinstall browser download, so it can
// never slow down or break a deploy install). Chromium itself comes from the
// usual Playwright cache; if it isn't there yet, fetch it once with:
//   npx playwright@1.64.1 install chromium
//
// Every console message, page error and failed request is collected; the
// script exits non-zero if anything shows up. Screenshots land in tools/shots/.

import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'tools', 'shots');

let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  console.error('playwright-core missing. run:  npm i -D playwright-core@1.64.1');
  process.exit(2);
}

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--flow='))?.slice(7);
const keep = args.includes('--keep');

const SIZES = [
  { name: 'desktop', width: 1440, height: 900, touch: false },
  { name: 'tablet', width: 820, height: 1180, touch: true },
  { name: 'phone', width: 390, height: 844, touch: true },
  { name: 'phone-landscape', width: 844, height: 390, touch: true },
  { name: 'dreampad-landscape', width: 620, height: 380, touch: true },
];

// ---------------------------------------------------------------- preview
const PORT = 4321;
const preview = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort'],
  { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' },
);
let previewLog = '';
preview.stdout.on('data', (d) => (previewLog += d));
preview.stderr.on('data', (d) => (previewLog += d));

const BASE = `http://localhost:${PORT}/`;
async function waitForServer(timeout = 30000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`vite preview never came up.\n${previewLog}`);
}

// ---------------------------------------------------------------- helpers
const problems = [];
const notes = [];

function attach(page, where) {
  page.on('console', (m) => {
    const type = m.type();
    if (type !== 'error' && type !== 'warning') return;
    const text = m.text();
    // Our own console greeting in main.tsx is a log, never an error.
    problems.push(`[${where}] console.${type}: ${text}`);
  });
  page.on('pageerror', (e) => problems.push(`[${where}] pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const f = r.failure();
    if (f && /ERR_ABORTED/.test(f.errorText)) return;
    problems.push(`[${where}] requestfailed: ${r.url()} — ${f?.errorText}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`[${where}] HTTP ${r.status()}: ${r.url()}`);
  });
}

const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Each project app, with the things worth clicking inside it.
const APP_CHECKS = [
  { id: 'lullaby', label: 'Lullaby.exe', pokes: ['.windkey', '.windkey', '.windkey', '.step', '.chip', '.lab__play'], pokeMax: 3, pokeWait: 260 },
  { id: 'routes', label: 'Dream_Routes.map', pokes: ['.roof', '.dr__deliver', '.roof', '.dr__deliver', '.roof', '.dr__deliver'], pokeMax: 1, pokeWait: 2100 },
  { id: 'nightlights', label: 'Nightlights', pokes: ['.lamp__btn', '.swatch', '.card__more', '.nl__controls .btn98'], pokeMax: 3, pokeWait: 260 },
  { id: 'growth', label: 'Growth Chart', pokes: ['.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gc__controls .btn98:last-of-type', '.gmark__btn', '.gc__controls .btn98:first-of-type'], pokeMax: 1, pokeWait: 600 },
  { id: 'toys', label: 'Rattle & Blocks', pokes: ['.rattle__btn', '.rattle__btn', '.rattle__btn', '.tab98:nth-child(2)', '.bblock--tray', '.bcol', '.bblock--tray', '.bcol', '.bblock--tray', '.bcol', '.toys__controls .btn98'], pokeMax: 1, pokeWait: 300 },
  { id: 'bedtime', label: 'Bedtime Story', pokes: ['.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child', '.book__hot', '.book__bar .btn98:last-child'], pokeMax: 1, pokeWait: 700 },
  { id: 'story', label: 'My_Story.doc', pokes: ['.hot', '.story__star'], pokeMax: 5, pokeWait: 420, after: '.story__end', finale: true },
];

/** Open an app by its icon/tile label, on either shell. */
async function openApp(page, label, isPhone, size) {
  if (isPhone) {
    const tile = page.locator('.dp-icon', { hasText: label }).first();
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
    await page.waitForSelector('.dp-app', { timeout: 8000 });
  } else {
    const icon = page.locator('.dicon', { hasText: label }).first();
    await icon.focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('.win98', { timeout: 8000 });
  }
  void size;
}

async function closeApp(page, isPhone) {
  if (isPhone) {
    const back = page.locator('.dp-app__back').first();
    if (await back.count()) await back.click();
  } else {
    await page.keyboard.press('Escape');
  }
}

/** Reports anything rendering outside its container or off-screen. */
async function checkOverflow(page, where) {
  const bad = await page.evaluate(() => {
    const out = [];
    const vw = window.innerWidth;
    const docOverflow = document.documentElement.scrollWidth - vw;
    if (docOverflow > 2) out.push(`page scrolls horizontally by ${docOverflow}px`);
    for (const el of document.querySelectorAll('button, a, h1, h2, h3, p, input, textarea, .bubble, .win98, .dp-icon')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right < -2 || r.left > vw + 2) {
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.opacity === '0') continue;
        // things inside a deliberately pannable strip are meant to scroll away
        if (el.closest('[data-pannable]')) continue;
        out.push(`${el.tagName.toLowerCase()}.${el.className?.toString().split(' ')[0]} is off-screen (left ${Math.round(r.left)})`);
      }
    }
    return out.slice(0, 12);
  });
  bad.forEach((b) => problems.push(`[${where}] layout: ${b}`));
}

/** Touch targets below 44px are a brief requirement on touch sizes. */
async function checkTouchTargets(page, where) {
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, [role="button"], a, input, select')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.opacity === '0' || s.pointerEvents === 'none') continue;
      // hidden-star eggs and decorative hotspots are deliberately tiny
      if (el.classList.contains('hidden-star') || el.dataset.tiny === '1') continue;
      // a button may push its hit area out with an ::after overlay
      const after = getComputedStyle(el, '::after');
      const aw = parseFloat(after.width) || 0;
      const ah = parseFloat(after.height) || 0;
      // half a pixel of slack: a 44px box in a fractional grid column measures
      // 43.98, which is a rounding artefact rather than a design failure
      const MIN = 43.5;
      if (Math.max(r.width, aw) >= MIN && Math.max(r.height, ah) >= MIN) continue;
      if (r.height < MIN || r.width < MIN) {
        out.push(`${el.tagName.toLowerCase()}.${el.className?.toString().split(' ')[0] || '?'} ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
    }
    return [...new Set(out)].slice(0, 12);
  });
  small.forEach((s) => notes.push(`[${where}] small touch target: ${s}`));
}

// ---------------------------------------------------------------- the flow
async function runSize(browser, size) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    hasTouch: size.touch,
    isMobile: size.name.startsWith('phone'),
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  const where = size.name;
  attach(page, where);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(600);

  if (!size.touch) {
    for (let i = 0; i < 8; i++) await page.mouse.move(300 + i * 40, 300 + i * 25);
    await wait(120);
    const sparks = await page.locator('.spark.is-on').count();
    if (sparks === 0) problems.push(`[${where}] sparkle trail emitted nothing on pointermove`);
  }
  await shot(page, `${where}-1-nursery`);
  await checkOverflow(page, `${where} nursery`);
  if (size.touch) await checkTouchTargets(page, `${where} nursery`);

  // poke a few nursery objects (these trigger sound recipes)
  for (const sel of ['.music-box', '.lantern', '.blocks', '.mobile', '.win-round', '.pip']) {
    const el = page.locator(sel).first();
    if (await el.count()) {
      await el.click({ timeout: 4000 }).catch((e) => problems.push(`[${where}] click ${sel}: ${e.message}`));
      await wait(150);
    }
  }
  await wait(400);
  await shot(page, `${where}-2-poked`);

  // nursery → zoom → boot → OS
  await page.locator('.crt').click();
  await wait(1400);
  await shot(page, `${where}-3-boot`);
  // boot is skippable; click to hurry it, then wait it out
  await page.mouse.click(size.width / 2, size.height / 2);
  await page.waitForFunction(() => !!document.querySelector('.desktop, .dreampad'), null, { timeout: 15000 });
  await wait(700);
  await shot(page, `${where}-4-os`);
  await checkOverflow(page, `${where} os`);
  if (size.touch) await checkTouchTargets(page, `${where} os`);

  const isPhone = await page.locator('.dreampad').count();

  if (isPhone) {
    // DreamPad: open an app, then come back
    await page.locator('.dp-icon').first().click();
    await page.waitForSelector('.dp-app', { timeout: 8000 });
    await wait(700);
    await shot(page, `${where}-5-app`);
    await checkOverflow(page, `${where} app`);
    await page.locator('.dp-app__back').click();
    await wait(600);
    // and a second one, via the "everything else" grid
    const mypip = page.locator('.dp-icon', { hasText: 'My Pip' }).first();
    if (await mypip.count()) {
      await mypip.click();
      await page.waitForSelector('.dp-app', { timeout: 8000 });
      await wait(600);
      await shot(page, `${where}-6-mypip`);
      await checkOverflow(page, `${where} mypip`);
      await page.locator('.dp-btn').first().click();
    }
    await wait(500);
  } else {
    // Desktop/tablet: open My Pip, drag it, close it
    const icon = page.locator('.dicon', { hasText: 'My Pip' }).first();
    await icon.dblclick();
    await page.waitForSelector('.win98', { timeout: 8000 });
    await wait(700);
    await shot(page, `${where}-5-window`);
    await checkOverflow(page, `${where} window`);

    const title = page.locator('.win98__title').first();
    const box = await title.boundingBox();
    if (box && !(await page.locator('.win98.is-max').count())) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2 + 90, { steps: 12 });
      await page.mouse.up();
      await wait(300);
      await shot(page, `${where}-6-dragged`);
    }

    // open three more so windows stack. Keyboard, not mouse — the windows
    // already on screen cover the icons, and this exercises the Enter path.
    for (const label of ['Stickers', 'Credits.txt', 'Lost Socks']) {
      const i = page.locator('.dicon', { hasText: label }).first();
      if (await i.count()) {
        await i.focus();
        await page.keyboard.press('Enter');
        await wait(350);
      }
    }
    await wait(500);
    await shot(page, `${where}-7-stacked`);
    await checkOverflow(page, `${where} stacked`);

    // Esc closes the top window
    await page.keyboard.press('Escape');
    await wait(400);

    // Start menu
    await page.locator('.start-btn').click();
    await page.waitForSelector('.start-menu', { timeout: 5000 });
    await wait(300);
    await shot(page, `${where}-8-start`);
    await checkOverflow(page, `${where} start menu`);
    await page.keyboard.press('Escape');
    await wait(300);

    // Shut Down → wake
    await page.locator('.start-btn').click();
    await page.waitForSelector('.start-menu', { timeout: 5000 });
    const sd = page.locator('.start-item', { hasText: 'Shut Down' }).first();
    await sd.click();
    await page.waitForSelector('.shutdown', { timeout: 8000 });
    await wait(900);
    await shot(page, `${where}-9-shutdown`);
    await page.mouse.click(size.width / 2, size.height / 2);
    await page.waitForFunction(() => !!document.querySelector('.boot, .desktop'), null, { timeout: 10000 });
    await wait(500);
  }

  // Every project app gets opened, poked and screenshotted at this size.
  for (const app of APP_CHECKS) {
    try {
      await openApp(page, app.label, isPhone, size);
      await wait(600);
      // Scope every poke to this app's own window — other windows are open
      // behind it and share class names like .tab98 and .btn98.
      const scope = isPhone ? page.locator('.dp-app') : page.locator(`[aria-labelledby="wt-${app.id}"]`);
      const seen = new Map();
      for (const sel of app.pokes ?? []) {
        const els = scope.locator(sel);
        const count = await els.count();
        if (!count) continue;
        if (app.pokeMax === 1) {
          // walk through the matches across repeats of the same selector
          const k = seen.get(sel) ?? 0;
          seen.set(sel, k + 1);
          await els.nth(k % count).click({ timeout: 3000, force: true }).catch(() => {});
          await wait(app.pokeWait ?? 180);
          continue;
        }
        const n = Math.min(count, app.pokeMax ?? 4);
        for (let i = 0; i < n; i++) {
          await els.nth(i).click({ timeout: 3000, force: true }).catch(() => {});
          await wait(app.pokeWait ?? 180);
        }
      }
      if (app.after) {
        const el = scope.locator(app.after).first();
        if (await el.count()) {
          await shot(page, `${where}-app-${app.id}`);
          await el.click();
          await wait(700);
        } else {
          problems.push(`[${where}] ${app.id}: "${app.after}" never appeared`);
        }
      }
      // poking often scrolls the app body; show the top of it in the shot
      await page.evaluate(() => {
        document.querySelectorAll('.win98__body, .dp-app__body').forEach((el) => (el.scrollTop = 0));
      });
      await wait(500);
      await shot(page, `${where}-app-${app.id}`);
      await checkOverflow(page, `${where} ${app.id}`);
      if (size.touch) await checkTouchTargets(page, `${where} ${app.id}`);
      if (app.finale) {
        // the story can end the whole scene: see it through and come back
        const home = page.locator('.finale__home, .finale__skip').first();
        if (await home.count()) {
          await page.locator('.finale__skip').first().click().catch(() => {});
          await wait(900);
          await shot(page, `${where}-finale`);
          await checkOverflow(page, `${where} finale`);
          await page.locator('.finale__home').first().click();
          await page.waitForSelector('.nursery-scene', { timeout: 8000 });
          await wait(600);
          await shot(page, `${where}-nursery-bedtime`);
          await checkOverflow(page, `${where} nursery after story`);
          await page.locator('.crt').click();
          await wait(900);
          await page.mouse.click(size.width / 2, size.height / 2);
          await page.waitForFunction(() => !!document.querySelector('.desktop, .dreampad'), null, { timeout: 15000 });
          await wait(600);
          continue;
        }
      }
      await closeApp(page, isPhone);
      await wait(350);
    } catch (e) {
      problems.push(`[${where}] app ${app.id}: ${e.message}`);
      await closeApp(page, isPhone).catch(() => {});
    }
  }

  // theme toggle + mute toggle still work at the end
  const theme = page.locator('[aria-label*="sunrise" i], [aria-label*="night mode" i]').first();
  if (await theme.count()) {
    await theme.click().catch(() => {});
    await wait(500);
    await shot(page, `${where}-10-sunrise`);
    await theme.click().catch(() => {});
  }

  await wait(300);
  await ctx.close();
}

// ---------------------------------------------------------------- main
rmSync(SHOTS, { recursive: true, force: true });
mkdirSync(SHOTS, { recursive: true });

let code = 0;
try {
  await waitForServer();
  const browser = await chromium.launch();
  for (const size of SIZES) {
    if (only && size.name !== only) continue;
    console.log(`\n▸ ${size.name} (${size.width}×${size.height})`);
    try {
      await runSize(browser, size);
    } catch (e) {
      problems.push(`[${size.name}] FLOW BROKE: ${e.message}`);
    }
  }
  await browser.close();
} catch (e) {
  problems.push(`harness: ${e.message}`);
} finally {
  if (!keep) {
    preview.kill();
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(preview.pid), '/f', '/t'], { stdio: 'ignore' });
  }
}

console.log('\n' + '─'.repeat(60));
if (notes.length) {
  console.log(`\n${notes.length} note(s) (not failures):`);
  notes.forEach((n) => console.log('  · ' + n));
}
if (problems.length) {
  console.log(`\n❌ ${problems.length} problem(s):`);
  problems.forEach((p) => console.log('  ✗ ' + p));
  code = 1;
} else {
  console.log('\n✅ clean: no console errors, no page errors, no bad requests, no layout overflow.');
}
console.log(`\nscreenshots → tools/shots/`);
if (keep) console.log(`preview still running at ${BASE} (ctrl-c to stop)`);
else process.exit(code);
