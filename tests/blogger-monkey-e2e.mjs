// Випадкові кліки по Instagram у симуляторі блогера: жодної помилки в консолі й жодного порожнього екрана.
//   node tests/blogger-monkey-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer();
const browser = await launch();
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 860 } });
const p = await newPage(ctx, errors);
p.on('pageerror', e => errors.push('PAGEERR ' + e.message));
await p.goto(server.url + '/blogger');
await p.waitForFunction(() => window.Blogger);
await p.click('[data-speed="0"]');

// Просте псевдовипадкове число з зерном, щоб прогін був відтворюваним
let seed = 20240607; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

await step('готуємо профіль, власні фото й допис, історію', async () => {
  await p.evaluate(async () => {
    const { importFile } = await import('/bloggeremu/js/media.js'); const sim = Blogger.sim, s = sim.s;
    s.me = { nick: 'kotyk', name: 'Кіт', niche: 'pets', bio: '', avatar: { color: '#c62828', sym: 'paw' }, created: 0, pass: 'x', email: 'k@poshta.ua' }; s.followers = 340;
    const mk = async (w, h, name) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#39c'; x.fillRect(0, 0, w, h); x.fillStyle = '#fc3'; x.fillRect(w / 4, h / 4, w / 2, h / 2); const b = await new Promise(r => c.toBlob(r, 'image/jpeg')); return sim.addOwn(await importFile(new File([b], name, { type: 'image/jpeg' })), 'pets'); };
    const wide = await mk(1600, 900, 'wide.jpg'), tall = await mk(900, 1600, 'tall.jpg');
    const sn = g => ({ own: true, type: 'photo', mid: g.mid, w: g.w, h: g.h, topic: g.topic });
    sim.publish({ kind: 'photo', caption: 'широке #мурчання', photo: { gid: wide.id, filter: 'none', text: '', textY: 'bottom', sticker: '', crop: 'orig', g: sn(wide) } });
    sim.publish({ kind: 'photo', caption: 'карусель', photo: { gid: tall.id, filter: 'none', text: '', textY: 'bottom', sticker: '', crop: 'orig', g: sn(tall) }, photos: [{ gid: tall.id, filter: 'none', text: '', textY: 'bottom', sticker: '', crop: 'orig', g: sn(tall) }, { gid: wide.id, filter: 'none', text: '', textY: 'bottom', sticker: '', crop: 'orig', g: sn(wide) }] });
    sim.story({ gid: tall.id }); sim.advance(300);
    Blogger.phone.open('likeer');
  });
});

await step('200 випадкових кліків без помилок і порожніх екранів', async () => {
  const SKIP = /reset|logout|signout|delete|del|clear|remove|wipe|quit|deact|file|download|openLink|ad\.|hack/i;
  let clicks = 0;
  for (let i = 0; i < 200; i++) {
    const app = await p.evaluate(() => Blogger.phone.app);
    const acts = app !== 'likeer' ? [] : await p.evaluate(() => [...document.querySelectorAll('.app [data-act]')].filter(e => e.offsetParent && !e.disabled).map(e => e.dataset.act + '|' + (e.dataset.id || e.dataset.v || e.dataset.k || '')));
    const ok = acts.filter(a => !SKIP.test(a));
    if (!ok.length) { await p.evaluate(() => Blogger.phone.open('likeer')); continue; }
    const [act, id] = ok[Math.floor(rnd() * ok.length)].split('|');
    const sel = `.app [data-act="${act}"]` + (id ? `[data-id="${id}"],.app [data-act="${act}"][data-v="${id}"],.app [data-act="${act}"][data-k="${id}"]` : '');
    try { await p.locator(sel).first().click({ timeout: 1500, force: true }); clicks++; } catch { /* елемент зник під час кліку */ }
    await p.evaluate(() => document.querySelectorAll('.sh-back').forEach(x => x.remove()));
    assert.ok(await p.evaluate(() => !!document.querySelector('.app')?.innerText.trim()), `порожній екран після ${act}|${id}`);
  }
  assert.ok(clicks > 120, 'клікнули достатньо разів: ' + clicks);
});

await step('жодної помилки в консолі сторінки', async () => { assert.deepEqual(errors, []); });

await browser.close();
server.close();
