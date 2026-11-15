// Захист від XSS у симуляторі блогера: розмітка в іменах, описах, підписах і назвах файлів показується текстом.
//   node tests/blogger-xss-e2e.mjs
import { startServer, launch, newPage, step } from './_harness.mjs';
import assert from 'node:assert/strict';
const server = await startServer(), b = await launch(), errors = [];
const ctx = await b.newContext({ viewport: { width: 1366, height: 860 } }); const p = await newPage(ctx, errors);
p.on('dialog', d => { errors.push('DIALOG ' + d.message()); d.dismiss(); });
await p.goto(server.url + '/blogger'); await p.waitForFunction(() => window.Blogger); await p.evaluate(() => { Blogger.ui.speed = 0; });
let res;
await step('шкідливий текст у всіх полях не виконується на жодному екрані', async () => {
res = await p.evaluate(async () => {
  const X = '"><img src=x onerror="window.__x=(window.__x||0)+1"><svg onload="window.__x=(window.__x||0)+1">';
  const m = await import('/bloggeremu/js/media.js'), ts = await import('/bloggeremu/js/tubesim.js'), tg = await import('/bloggeremu/js/tgsim.js'); const sim = Blogger.sim, s = sim.s;
  s.me = { nick: X, name: X, niche: 'pets', bio: X, avatar: { color: '#c62828', sym: 'paw' }, created: 0, pass: 'x', email: 'k@poshta.ua' }; s.student = { name: X, group: X }; s.followers = 100;
  const c = document.createElement('canvas'); c.width = 400; c.height = 300; c.getContext('2d').fillRect(0, 0, 400, 300);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg')); const it = await m.importFile(new File([blob], X + '.jpg', { type: 'image/jpeg' })); const g = sim.addOwn(it, 'pets');
  sim.publish({ kind: 'photo', caption: X + ' #t', place: X, photo: { gid: g.id, filter: 'none', text: X, textY: 'bottom', sticker: '', crop: 'orig', g: { own: true, type: 'photo', mid: g.mid, w: g.w, h: g.h } } });
  sim.addIdea?.(X);
  ts.createChannel(sim, { name: X, handle: 'h', topic: 'pets' }); ts.tubeUpload(sim, { src: { clip: Object.keys((await import('/bloggeremu/js/data.js')).CLIPS)[0] }, dur: 10, title: X, desc: X, thumb: { kind: 'frame', i: 0, text: X }, topic: 'pets' });
  tg.tgCreateChannel(sim, { title: X, desc: X, topic: 'pets' }); tg.tgPost(sim, { text: X, gid: g.id });
  sim.advance(300);
  const out = [];
  for (const app of ['home', 'likeer', 'tube', 'tg', 'gallery', 'ideas', 'settings', 'mail', 'camera']) {
    Blogger.phone.open(app); await new Promise(r => setTimeout(r, 120));
    const lk = Blogger.phone.apps.likeer;
    if (app === 'likeer') for (const v of ['feed', 'profile', 'editProfile', 'post', 'comments', 'insights', 'settings', 'dms', 'activity', 'stats']) { lk.stack = [{ v: 'feed' }, { v, id: s.posts[0]?.id }]; Blogger.phone.render(true); await new Promise(r => setTimeout(r, 80)); }
    if (app === 'tube') for (const v of ['channel', 'studio', 'notifs']) { const t = Blogger.phone.apps.tube; t.stack = [{ v: 'home' }, { v }]; Blogger.phone.render(true); await new Promise(r => setTimeout(r, 80)); }
    if (app === 'tg') { const t = Blogger.phone.apps.tg; for (const st of [[{ v: 'chats' }, { v: 'chat', id: 'mych' }], [{ v: 'chats' }, { v: 'info' }], [{ v: 'chats' }, { v: 'edit' }], [{ v: 'chats' }, { v: 'stats' }]]) { t.stack = st; Blogger.phone.render(true); await new Promise(r => setTimeout(r, 80)); } }
    out.push(app);
  }
  return { x: window.__x || 0, imgs: document.querySelectorAll('.app img[src="x"]').length };
});
assert.equal(res.x, 0, 'скрипти з користувацького тексту не виконуються'); assert.equal(res.imgs, 0, 'розмітка з тексту не стає елементами'); assert.deepEqual(errors, []);
});
await b.close(); server.close();
