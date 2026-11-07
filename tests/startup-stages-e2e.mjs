// Браузерна перевірка етапів симулятора стартапу: маршрут, аркуш етапу, вправи, перетягування, збереження, телефон.
//   node tests/startup-stages-e2e.mjs
import assert from 'node:assert/strict';
import { startServer, launch, newPage, step } from './_harness.mjs';

const server = await startServer();
const browser = await launch();
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const p = await newPage(ctx, errors);
p.setDefaultTimeout(10000);
const S = () => p.evaluate(() => JSON.parse(JSON.stringify(window.Startup.sim.s)));
const go = v => p.evaluate(v => window.Startup.C.go(v), v);
const range = (sel, v) => p.evaluate(([sel, v]) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);

async function start(page = p) {
  await page.goto(server.url + '/startup'); await page.evaluate(() => localStorage.clear()); await page.reload(); await page.waitForSelector('.wizard');
  await page.click('[data-w="next"]'); await page.click('[data-w="next"]'); await page.fill('[data-w="name"]', 'Марта'); await page.fill('[data-w="company"]', 'Записатись'); await page.click('[data-w="next"]');
  await page.waitForSelector('#main .ws');
}
await start();

await step('маршрут: дев’ять етапів, закриті не відкриваються, аркуш показує справи й прогрес', async () => {
  assert.equal(await p.locator('.rail .rs').count(), 9);
  assert.equal(await p.locator('.rail button, .rail [data-act]').count(), 0, 'етапи маршруту не клікаються: між етапами не переходять');
  assert.match(await p.locator('.ws .k').innerText(), /Етап 1 з 9/);
  assert.equal(await p.locator('.ws > .steps > .step').count(), 5);
  assert.match(await p.locator('.ws-prog small').innerText(), /0 з 5/);
  assert.match(await p.locator('.ws-next').innerText(), /етап 2 «Аудиторія й бренд»/);
  assert.equal(await p.locator('.ws .topics li').count(), 5);
  assert.equal(await p.locator('.ws-opt .step').count(), 3, 'додаткові справи згорнуто в окремий блок');
  assert.doesNotMatch(await p.locator('#main').innerText(), /[Уу]рок/, 'у тексті немає слова «урок»');
});

await step('вправа: відкривається зі справи, повертається до етапу, зберігає дані й завершується', async () => {
  await p.click('.ws .step:nth-child(1) .btn');
  await p.waitForSelector('.ex[data-ex-root="niche"]');
  assert.match(await p.locator('.pg-h').innerText(), /Оцініть нішу/);
  assert.match(await p.locator('.ex-foot').innerText(), /Можна завершити й так/, 'пункти вправи необов’язкові');
  assert.match(await p.locator('.ex-foot .btn.primary').innerText(), /Завершити як є/);
  await range('[data-p="me.need"]', '4'); await range('[data-p="me.size"]', '5'); await range('[data-p="me.skill"]', '2');
  assert.equal((await S()).ex.d.niche.me.size, 5);
  assert.ok(await p.locator('.nrow .ns').first().innerText());
  await p.fill('[data-exi="niche"][data-p="why"]', 'Проблема болить школярам, а конкурентів небагато.');
  assert.match(await p.locator('.ex-foot .btn.primary').innerText(), /Завершити вправу/);
  await p.click('.ex-foot .btn.primary');
  await p.waitForSelector('#main .ws');
  assert.equal(await p.locator('.ws > .steps > .step.ok').count(), 1);
  assert.match(await p.locator('.ws-prog small').innerText(), /1 з 5/);
  assert.match(await p.locator('.rail .rs.cur small').innerText(), /1 з 5/);
  const s = await S();
  assert.ok(s.ex.done.niche && s.ex.done.niche.s >= 1);
  assert.equal(s.ex.d.niche.pickName.length > 2, true, 'назву вибраної ніші збережено');
});

await step('збереження: текст, який щойно набрали, не губиться при перезавантаженні сторінки', async () => {
  await go('ex-market');
  await p.waitForSelector('.ex[data-ex-root="market"]');
  const field = p.locator('[data-exi="market"][data-p="why"]');
  await field.fill('Ми швидші за репетиторів і дешевші за великі платформи.');
  await p.reload();
  await p.waitForSelector('.ex[data-ex-root="market"]');
  assert.match(await p.locator('[data-exi="market"][data-p="why"]').inputValue(), /швидші за репетиторів/);
  assert.equal((await S()).ex.done.niche != null, true, 'виконані вправи теж на місці');
});

await step('перетягування: точку «Ми» можна перенести мишею й зсунути стрілками', async () => {
  await p.evaluate(() => window.scrollTo(0, 0));
  const dot = p.locator('.pdot.me'), map = p.locator('.pmap'), mb = await map.boundingBox(), db = await dot.boundingBox();
  const sx = db.x + db.width / 2, sy = db.y + db.height / 2;
  await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(mb.x + mb.width * .8, mb.y + mb.height * .2, { steps: 8 }); await p.mouse.up();
  const me = (await S()).ex.d.market.me;
  assert.equal(me.moved, true); assert.ok(me.x > .65 && me.y < .35, `координати ${me.x}/${me.y}`);
  await p.locator('.pdot.me').focus(); await p.keyboard.press('ArrowLeft');
  const me2 = (await S()).ex.d.market.me;
  assert.ok(Math.abs(me2.x - (me.x - .05)) < .001, 'стрілка зсуває на 5%');
  // пересування дрібної цілі не зламало «вільне місце»
  assert.ok(await p.locator('.pgap').count() >= 1);
});

await step('канали: клітинки календаря перемикаються, підсумок рахується', async () => {
  await p.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
  await go('ex-channels');
  await p.click('.xp[data-v="social"]'); await p.click('.xp[data-v="ads"]'); await p.click('.xp[data-v="flyers"]');
  assert.equal(await p.locator('.cal tbody tr').count(), 3);
  const before = await p.locator('.cel.on').count();
  await p.click('.cel:not(.on) >> nth=0');
  assert.equal(await p.locator('.cel.on').count(), before + 1);
  assert.match(await p.locator('.kpis3').first().innerText(), /₴/);
});

await step('SMART-ціль: після завершення з’являється картка прогресу на головній', async () => {
  await go('ex-smart');
  await p.click('.xp[data-p="metric"][data-v="users"]');
  await p.fill('[data-exi="smart"][data-p="why"]', 'Так ми побачимо, чи є попит на продукт.');
  await p.waitForSelector('.ex-foot .btn.primary:not([aria-disabled])');
  await p.click('.ex-foot .btn.primary');
  await p.waitForSelector('.goalcard');
  assert.match(await p.locator('.goalcard').innerText(), /користувачів/);
  assert.ok((await S()).goal.target > 0);
});

await step('логотип: знак потрапляє в шапку гри', async () => {
  await go('ex-logo');
  await p.click('.xp[data-p="shape"][data-v="hex"]'); await p.click('.sym[data-v="rocket"]'); await p.click('.sw2 >> nth=3');
  await p.click('.ex-foot .btn.primary'); await p.waitForSelector('#main .ws');
  assert.equal((await S()).company.mk.shape, 'hex');
  assert.match(await p.locator('.tp-brand .lgm').getAttribute('style'), /clip-path/);
});

await step('перший етап пройдено: відкривається другий, розділи наступного етапу доступні', async () => {
  await p.evaluate(() => { const S = window.Startup.sim; S.s.ex ||= { d: {}, done: {} }; for (const id of ['niche', 'market', 'needs', 'mvp']) S.s.ex.done[id] = { w: 0, s: 2 }; S.s.canvas = { problem: 'Учні не розуміють домашку', segment: S.s.target, uvp: 'Пояснення за п’ять хвилин', solution: [Object.keys(S.I.features)[0]], channels: ['ads'] }; window.Startup.C.render(); });
  await go('dash');
  assert.match(await p.locator('.rail .rs.cur').innerText(), /Аудиторія й бренд/);
  assert.equal(await p.locator('.rail .rs.done').count(), 1);
  assert.match(await p.locator('.ws .k').innerText(), /Етап 2 з 9/, 'аркуш завжди показує поточний етап');
  assert.match(await p.locator('.ws h1').innerText(), /Визначте, кому продаєте/);
  assert.equal(await p.locator('.ws > .steps > .step').count(), 4);
  await p.click('.tab[data-k="market"]');
  assert.equal(await p.locator('.st-it.locked[data-to="brand"]').count(), 0, 'бренд відкрито');
  // смужка етапу на інших сторінках
  assert.match(await p.locator('.stbar').innerText(), /Етап 2 з 9/);
  await p.click('.stbar'); await p.waitForSelector('#main .ws');
});

await step('підсумковий звіт показує виконані вправи', async () => {
  await go('report');
  assert.match(await p.locator('.report').innerText(), /Вправи етапів/);
  assert.match(await p.locator('.xrep').innerText(), /Ніша й продукт/);
});

await step('телефон: усі сторінки вправ без горизонтальної прокрутки, маршрут — смужка етапів', async () => {
  const m = await newPage(await browser.newContext({ viewport: { width: 390, height: 844 } }), errors);
  m.setDefaultTimeout(10000);
  await start(m);
  await m.evaluate(() => { window.Startup.sim.s.flags.st9 = 8; window.Startup.C.render(); });
  assert.equal(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'головна');
  const rail = await m.locator('.rail').boundingBox(), ws = await m.locator('.ws').boundingBox();
  assert.ok(rail.y < ws.y, 'маршрут над аркушем');
  assert.ok(rail.height < 120, 'маршрут стиснуто в рядок');
  const ids = await m.evaluate(async () => (await import('/startupsim/js/ex-core.js')).exAll().map(e => e.id));
  assert.ok(ids.length >= 36);
  const bad = [];
  for (const id of ids) {
    await m.evaluate(v => window.Startup.C.go(v), 'ex-' + id);
    const w = await m.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    if (w[0] > w[1] + 1) bad.push(`${id}: ${w[0]}`);
  }
  assert.deepEqual(bad, [], 'вправи не виходять за ширину екрана');
});

await step('жодної помилки в консолі', async () => { assert.deepEqual(errors, []); });
await browser.close(); server.close();
