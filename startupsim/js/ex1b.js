// Симулятор стартапу · вправи етапу 2 «Аудиторія й бренд»: сегментація 5W, маркетингова стратегія, SMART-ціль, логотип, характер бренду.
import { CHANNELS } from './data.js';
import { FONTS, TONES, SYMBOLS, PALETTE } from './mods.js';
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xcol, tip, box, checks, bar, hash, clamp, sumOf, money0, goalMetrics } from './ex-core.js';
import { logoMark } from './logo.js';

const len = s => String(s || '').trim().length;
const chips = (id, p, opts, cur, o = {}) => opts.map(v => xp(id, p, v, esc(v), cur === v, o)).join('');

/* ═════════ Сегментація 5W ═════════ */
const W5 = [
  ['what', 'Що', 'Що саме купують?', ['Готовий продукт', 'Послугу', 'Підписку', 'Окрему функцію']],
  ['who', 'Хто', 'Хто ухвалює рішення про покупку?', ['Сам користувач', 'Батьки', 'Керівник', 'Друзі й знайомі']],
  ['why', 'Навіщо', 'Яка головна мотивація?', ['Заощадити час', 'Заощадити гроші', 'Отримати результат', 'Виглядати добре', 'Почуватися спокійно']],
  ['when', 'Коли', 'Коли виникає потреба?', ['Щодня', 'Раз на тиждень', 'Сезонно', 'Коли щось пішло не так']],
  ['where', 'Де', 'Де шукають і купують?', ['В інтернеті', 'У соцмережах', 'У магазині', 'Через знайомих', 'На заходах']],
];
const segScore = s => Math.round((s.size * s.pay * s.reach) / 125 * 100);
const filled = s => W5.filter(([k]) => len(s.a[k]) >= 3).length;
reg({
  id: 'w5', stage: 1, t: 'Сегментація 5W', d: 'Опишіть кілька груп клієнтів і оберіть головну.', icon: 'target', min: 15,
  intro: `${term('Сегмент', 'Сегмент')} — група клієнтів зі схожою потребою. Метод 5W ставить п’ять питань: <b>що, хто, навіщо, коли, де</b>. Опишіть кілька сегментів, порівняйте їх і оберіть головний: саме для нього ви говоритимете в рекламі.`,
  data: S => ({ segs: S.segIds.map(k => ({ id: k, link: k, name: S.seg(k).short, a: {}, size: 3, pay: 3, reach: 3 })), main: '', next: 1 }),
  view(S, d) {
    const seg = (s, i) => `<article class="persona ${d.main === s.id ? 'main' : ''}" style="--h:${hash(s.name) % 360}"><header><span class="pav">${esc(s.name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase())}</span>${xin('w5', `segs.${i}.name`, d, { max: 40, cls: 'pn' })}${s.link ? '<span class="xtag">з гри</span>' : ''}${d.segs.length > 1 ? xb('w5', 'delSeg', '', { i, ic: 'trash', cls: 'ib', title: 'Прибрати сегмент' }) : ''}</header>
      ${W5.map(([k, t, q, opts]) => `<div class="w5q"><div class="w5h"><b>${t}?</b><small>${q}</small></div><div class="xrow">${chips('w5', `segs.${i}.a.${k}`, opts, s.a[k])}</div>${xin('w5', `segs.${i}.a.${k}`, d, { ph: 'або своя відповідь…', max: 60 })}</div>`).join('')}
      <div class="xg c3 w5s">${xsl('w5', `segs.${i}.size`, d, { min: 1, max: 5, label: 'Розмір' })}${xsl('w5', `segs.${i}.pay`, d, { min: 1, max: 5, label: 'Платить' })}${xsl('w5', `segs.${i}.reach`, d, { min: 1, max: 5, label: 'Досяжність' })}</div>
      <div class="xrow"><span class="xtag ${filled(s) === 5 ? 'ok' : ''}">5W: ${filled(s)} з 5</span><span class="xtag">привабливість ${segScore(s)}%</span>${xp('w5', 'main', s.id, d.main === s.id ? 'Головний сегмент' : 'Зробити головним', d.main === s.id, { cls: 'card' })}</div></article>`;
    const best = [...d.segs].sort((a, b) => segScore(b) - segScore(a))[0], main = d.segs.find(s => s.id === d.main);
    return `${tip('Не існує «клієнтів загалом». Чим точніше опис сегмента, тим простіше придумати для нього продукт, рекламу й ціну.')}
    <div class="xg c2 personas">${d.segs.map(seg).join('')}</div>
    ${d.segs.length < 4 ? `<div class="xadd"><input class="inp" id="w5-new" maxlength="160" placeholder="Ще один сегмент: наприклад, «студенти» чи «вчителі»">${xb('w5', 'addSeg', 'Додати сегмент', { ic: 'plus' })}</div>` : ''}
    ${box('Порівняння сегментів', `${d.segs.map(s => `<div class="cmp"><span>${esc(s.name)}</span>${bar(segScore(s) / 100, { color: s.id === best.id ? 'var(--ok)' : 'var(--acc)', label: s.name })}<b>${segScore(s)}%</b></div>`).join('')}<p class="sm muted">Привабливість = розмір × платоспроможність × досяжність. Це лише підказка: ви можете обрати й інший сегмент, якщо знаєте чому.</p>
      ${main?.link ? `<div class="xrow">${xb('w5', 'target', S.s.target === main.link ? 'Цей сегмент уже цільовий у грі' : `Зробити «${esc(main.name)}» цільовим у грі`, { cls: 'primary', dis: S.s.target === main.link })}</div>` : ''}`, { ic: 'chart' })}`;
  },
  acts: {
    addSeg(S, d) { const el = document.getElementById('w5-new'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } d.segs.push({ id: 'c' + (d.next++), link: null, name: v, a: {}, size: 3, pay: 3, reach: 3 }); },
    delSeg(S, d, el) { const i = +el.dataset.i, s = d.segs[i]; if (d.main === s.id) d.main = ''; d.segs.splice(i, 1); },
    target(S, d, el, C) { const m = d.segs.find(s => s.id === d.main); if (m?.link) { S.s.target = m.link; C.toast(`Цільовий сегмент: «${m.name}»`, 'good'); } },
  },
  ready(S, d) {
    const ok = d.segs.filter(s => filled(s) >= 4);
    if (ok.length < 2) return { ok: false, msg: 'Опишіть щонайменше два сегменти: хоча б чотири питання з п’яти' };
    const m = d.segs.find(s => s.id === d.main);
    if (!m) return { ok: false, msg: 'Оберіть головний сегмент' };
    return { ok: true, stars: 1 + (filled(m) === 5 ? 1 : 0) + (d.segs.length >= 3 ? 1 : 0) };
  },
});

/* ═════════ Маркетингова стратегія ═════════ */
const GOALS = ['Щоб про нас дізналися', 'Перші продажі', 'Більше зареєстрованих користувачів', 'Утримати тих, хто вже є', 'Запуск нової функції'];
const MET = ['Охоплення', 'Переходи на сайт', 'Реєстрації', 'Оплати', 'Відгуки й оцінки', 'Скільки коштує клієнт'];
const ONLINE = new Set(['ads', 'bloggers', 'social', 'seo', 'referral']);
const fitWord = f => f == null ? ['—', ''] : f >= 1.05 ? ['добре підходить', 'ok'] : f >= .6 ? ['так собі', 'warn'] : ['слабко', 'bad'];
reg({
  id: 'strategy', stage: 1, t: 'Маркетингова стратегія', d: 'Складіть аркуш стратегії: мета, повідомлення, канали й бюджет.', icon: 'megaphone', min: 15,
  intro: `${term('Маркетингова стратегія', 'Стратегія')} відповідає на п’ять питань: <b>навіщо</b> ми просуваємося, <b>кому</b> говоримо, <b>що</b> кажемо, <b>де</b> і <b>за які гроші</b>. Усе це має поміститися на одному аркуші, який можна показати команді.`,
  data: () => ({ goal: '', msg: '', ch: [], budget: 20000, w: {}, met: [] }),
  view(S, d) {
    const g = S.seg(), chs = Object.entries(CHANNELS), wt = sumOf(d.ch.map(k => d.w[k] ?? 50)) || 1;
    return `${box('1. Мета', `<div class="xrow">${chips('strategy', 'goal', GOALS, d.goal, { cls: 'card' })}</div>${xin('strategy', 'goal', d, { ph: 'або сформулюйте свою мету', max: 80, cls: 'mt' })}`, { ic: 'flag' })}
    ${box('2. Кому й що кажемо', `<p class="sub">Аудиторія з гри: <b>${esc(g.t)}</b> (щоб змінити, поверніться до вправи про 5W).</p>${xin('strategy', 'msg', d, { label: 'Головне повідомлення', area: true, rows: 2, max: 160, ph: 'Одне речення, яке ваш клієнт запам’ятає', hint: 'Говоріть про вигоду клієнта, а не про вашу технологію.' })}`, { ic: 'mic' })}
    ${box('3. Де: оберіть до трьох каналів', `<div class="xg c2">${chs.map(([k, c]) => { const [w, cl] = fitWord(g.fit?.[k]), on = d.ch.includes(k); return `<div class="chcard ${on ? 'on' : ''}">${xp('strategy', 'ch', k, `${icon(c.icon, 15)} ${esc(c.t)}`, on, { set: 'tog', max: 3, cls: 'card' })}<small>${ONLINE.has(k) ? 'онлайн' : 'офлайн'} · для вашої аудиторії: <span class="xtag ${cl}">${w}</span></small><p>${esc(c.desc)}</p></div>`; }).join('')}</div>`, { ic: 'compass', side: `обрано ${d.ch.length} з 3` })}
    ${box('4. Бюджет на місяць', `${xsl('strategy', 'budget', d, { min: 0, max: 100000, step: 1000, label: 'Скільки готові витрачати', u: ' ₴' })}
      ${d.ch.length ? `<div class="xlist" style="margin-top:8px">${d.ch.map(k => `<div class="xitem chw"><div class="xrow"><b>${esc(CHANNELS[k].t)}</b><b style="margin-left:auto">${money0(d.budget * (d.w[k] ?? 50) / wt)}</b></div>${xsl('strategy', `w.${k}`, d, { min: 0, max: 100, step: 5, label: 'Частка бюджету', u: '%', v: d.w[k] ?? 50 })}</div>`).join('')}</div>` : '<p class="sm muted">Спершу оберіть канали вище.</p>'}`, { ic: 'coins' })}
    ${box('5. Як зрозуміємо, що працює', `<div class="xrow">${MET.map(m => xp('strategy', 'met', m, m, d.met.includes(m), { set: 'tog' })).join('')}</div>`, { ic: 'chart' })}
    ${d.goal && d.msg && d.ch.length ? `<section class="sheet"><h4>Аркуш стратегії · ${esc(S.s.company.name)}</h4><dl><dt>Мета</dt><dd>${esc(d.goal)}</dd><dt>Аудиторія</dt><dd>${esc(g.t)}</dd><dt>Повідомлення</dt><dd>«${esc(d.msg)}»</dd><dt>Канали</dt><dd>${d.ch.map(k => esc(CHANNELS[k].t)).join(', ')}</dd><dt>Бюджет</dt><dd>${money0(d.budget)} на місяць</dd><dt>Метрики</dt><dd>${d.met.join(', ') || '—'}</dd></dl></section>` : ''}`;
  },
  ready(S, d) {
    if (len(d.goal) < 4) return { ok: false, msg: 'Оберіть або напишіть мету' };
    if (len(d.msg) < 15) return { ok: false, msg: 'Напишіть головне повідомлення' };
    if (d.ch.length < 2) return { ok: false, msg: 'Оберіть хоча б два канали' };
    if (!(d.budget > 0)) return { ok: false, msg: 'Задайте бюджет' };
    if (d.met.length < 2) return { ok: false, msg: 'Оберіть хоча б дві метрики' };
    const fit = d.ch.filter(k => (S.seg().fit?.[k] ?? 0) >= 1.05).length;
    return { ok: true, stars: 1 + (len(d.msg) >= 40 ? 1 : 0) + (fit >= 2 ? 1 : 0) };
  },
});

/* ═════════ SMART-ціль ═════════ */
const SM_BASE = { paid: 5, users: 30, mrr: 5000, cash: 0 };
reg({
  id: 'smart', stage: 1, t: 'SMART-ціль', d: 'Поставте ціль, яка проходить усі п’ять перевірок SMART.', icon: 'flag', min: 10,
  intro: `${term('SMART', 'SMART')}-ціль — <b>конкретна, вимірна, досяжна, важлива й обмежена в часі</b>. «Хочу більше клієнтів» — це побажання, а «30 платних клієнтів до тижня 20» — це ціль. Складіть її, а гра стежитиме за прогресом на головній.`,
  data: () => ({ metric: 'paid', target: 30, weeks: 12, why: '', steps: ['', '', ''] }),
  onSet: (S, d, p) => { if (p === 'metric') d.target = goalMetrics()[d.metric].def; },
  view(S, d) {
    const M = goalMetrics(), cur = M[d.metric].now(S), q = SM(S, d);
    return `${box('Що саме вимірюємо', `<div class="xrow">${Object.entries(M).map(([k, m]) => xp('smart', 'metric', k, m.t, d.metric === k, { sub: `зараз: ${m.fmt(m.now(S))}` })).join('')}</div>`, { ic: 'chart' })}
    ${box('Скільки й до коли', `<div class="xg c2">${xsl('smart', 'target', d, { min: M[d.metric].min, max: M[d.metric].max, step: M[d.metric].step, label: 'Цільове значення', u: M[d.metric].u })}${xsl('smart', 'weeks', d, { min: 4, max: 40, step: 1, label: 'Скільки тижнів на це', u: ' тиж.' })}</div>
      <p class="goalline">${esc(q.text)}</p>`, { ic: 'calendar' })}
    ${box('Навіщо вона вам і як досягнете', `${xin('smart', 'why', d, { label: 'Чому ця ціль важлива саме зараз?', area: true, rows: 2, max: 200, ph: 'Ця ціль важлива, бо…' })}<div class="xg c3 mt">${d.steps.map((_, i) => xin('smart', `steps.${i}`, d, { label: `Крок ${i + 1}`, ph: ['Поговорити з клієнтами', 'Запустити рекламу', 'Додати функцію оплати'][i], max: 70 })).join('')}</div>`, { ic: 'bulb' })}
    ${box('Перевірка SMART', `${checks(q.list)}<p class="sm muted" style="margin-top:8px">Для довідки: зараз у вас ${M[d.metric].fmt(cur)}. ${q.note}</p>`, { ic: 'check', cls: q.all ? 'ok' : '' })}`;
  },
  ready(S, d) { const q = SM(S, d); return q.all ? { ok: true, stars: 1 + (q.ratio >= 1.2 && q.ratio <= 3 ? 1 : 0) + (d.steps.filter(len).length >= 3 ? 1 : 0) } : { ok: false, msg: `Ціль ще не проходить перевірку: ${q.list.filter(x => !x[0]).length} з 5` }; },
  finish(S, d) { S.s.goal = { metric: d.metric, target: d.target, from: S.s.week, to: S.s.week + d.weeks, text: SM(S, d).text, done: false, left: false }; },
});
function SM(S, d) {
  const M = goalMetrics()[d.metric], now = M.now(S), real = Math.max(now, SM_BASE[d.metric] || 1) * Math.pow(1.07, d.weeks) + (d.metric === 'cash' ? 0 : d.weeks * 3);
  const ratio = d.metric === 'cash' ? d.target / Math.max(1, S.s.cash) : d.target / Math.max(real, 1);
  const text = `${M.goal} ${M.fmt(d.target)} до тижня ${S.s.week + 1 + d.weeks}`;
  const list = [
    [!!d.metric, 'Конкретна: зрозуміло, що саме потрібно досягти'], [d.target > 0 && d.target !== now, 'Вимірна: є число', 'Цільове значення має відрізнятися від поточного'],
    [d.metric === 'cash' ? d.target > S.s.cash * .9 && d.target < S.s.cash * 6 : ratio >= .6 && ratio <= 5, 'Досяжна: не надто легка й не нереальна', ratio < .6 ? 'Занадто легка — підніміть ціль' : 'Завелика для цього терміну — зменште ціль чи збільшіть термін'],
    [len(d.why) >= 20, 'Важлива: ви можете пояснити, навіщо вона', 'Напишіть хоча б одне речення про причину'], [d.weeks >= 4 && d.weeks <= 40, 'Обмежена в часі: є кінцева дата'],
  ];
  return { text, list, all: list.every(x => x[0]), ratio, note: ratio > 5 ? 'Ціль виглядає надто сміливою для цього терміну.' : ratio < .6 ? 'Ціль виглядає надто легкою.' : 'Ціль виглядає реалістично й трохи амбітно.' };
}

/* ═════════ Логотип і фірмовий стиль ═════════ */
const SHAPES = [['squircle', 'Квадрат'], ['circle', 'Коло'], ['hex', 'Шестикутник'], ['shield', 'Щит'], ['diamond', 'Ромб']];
const PAIRS = [['#6366f1', '#8b5cf6'], ['#0ea5e9', '#14b8a6'], ['#16a34a', '#84cc16'], ['#f97316', '#ef4444'], ['#ec4899', '#f59e0b'], ['#111827', '#374151'], ['#0f766e', '#0ea5e9'], ['#7c3aed', '#ec4899']];
const lum = h => { const n = parseInt(h.slice(1), 16), f = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
reg({
  id: 'logo', stage: 1, cols: true, t: 'Логотип і фірмовий стиль', d: 'Створіть логотип і побачте його на візитці, іконці й футболці.', icon: 'palette', min: 15,
  intro: `${term('Бренд', 'Бренд')} починається з упізнаваного знака. Оберіть форму, кольори, символ і шрифт, а нижче одразу побачите, як логотип виглядає в застосунку, на візитці, сайті й футболці. Готовий знак підставиться в шапку гри.`,
  data: S => ({ name: S.s.company.name, shape: 'squircle', c1: S.s.company.color, c2: '', fg: '#ffffff', sym: S.s.company.sym || 'spark', font: 'modern', layout: 'side', grad: false, tag: '', t: 0 }),
  onSet: (S, d) => { d.t = (d.t || 0) + 1; },
  ctx(S, d) {
    const g = { ...d, c2: d.grad ? (d.c2 || PAIRS.find(p => p[0] === d.c1)?.[1] || d.c1) : '' }, F = FONTS[d.font], ct = contrast(d.fg, d.c1);
    const lockup = (big, cls = '') => `<div class="lockup ${d.layout} ${cls}">${d.layout !== 'word' ? logoMark(g, big ? 84 : 44) : ''}${d.layout !== 'mark' ? `<span class="lw" style="font-family:${F.css};font-weight:${F.w};color:${d.layout === 'word' || true ? 'inherit' : d.c1}">${esc(d.name || 'Назва')}${d.tag ? `<small>${esc(d.tag)}</small>` : ''}</span>` : ''}</div>`;
    return { g, F, ct, lockup };
  },
  view(S, d) {
    const { g, F, ct } = this.ctx(S, d);
    return `
      ${box('Знак', `<div class="xrow">${SHAPES.map(([k, t]) => xp('logo', 'shape', k, t, d.shape === k)).join('')}</div><div class="syms" role="group" aria-label="Символ">${SYMBOLS.map(sy => `<button type="button" class="sym ${d.sym === sy ? 'on' : ''}" data-act="ex" data-ex="logo" data-do="set" data-p="sym" data-v="${sy}" data-t="s" aria-label="Символ ${sy}">${icon(sy, 22)}</button>`).join('')}</div>`, { ic: 'cube' })}
      ${box('Кольори', `<div class="swatches" role="group" aria-label="Готові пари кольорів">${PAIRS.map(([a, b]) => `<button type="button" class="sw2" style="background:linear-gradient(135deg,${a},${b})" data-act="ex" data-ex="logo" data-do="pair" data-a="${a}" data-b="${b}" aria-label="Пара ${a} і ${b}"></button>`).join('')}${xb('logo', 'rand', 'Випадковий', { ic: 'refresh', cls: 'sm' })}</div>
        <div class="xrow mt">${xcol('logo', 'c1', d, { label: 'Основний' })}${xcol('logo', 'fg', d, { label: 'Символ' })}<label class="switch"><input type="checkbox" data-exi="logo" data-p="grad" ${d.grad ? 'checked' : ''}><span></span>Градієнт</label>${d.grad ? xcol('logo', 'c2', d, { label: 'Другий' }) : ''}</div>
        <p class="sm ${ct >= 3 ? 'muted' : 'warnt'}">Контраст символу: ${ct.toFixed(1).replace('.', ',')} : 1 ${ct >= 3 ? '— добре видно.' : '— символ погано видно, спробуйте світліший чи темніший колір.'}</p>`, { ic: 'palette' })}
      ${box('Напис', `${xin('logo', 'name', d, { label: 'Назва', max: 28 })}${xin('logo', 'tag', d, { label: 'Підпис під назвою (необов’язково)', max: 30, ph: 'наприклад, «розумна домашка»', cls: 'mt' })}
        <div class="xrow mt">${Object.entries(FONTS).map(([k, f]) => `<button type="button" class="xp ${d.font === k ? 'on' : ''}" data-act="ex" data-ex="logo" data-do="set" data-p="font" data-v="${k}" data-t="s" style="font-family:${f.css};font-weight:${f.w}">${f.t}</button>`).join('')}</div>
        <div class="xrow mt">${[['side', 'Знак ліворуч'], ['stack', 'Знак зверху'], ['mark', 'Лише знак'], ['word', 'Лише напис']].map(([k, t]) => xp('logo', 'layout', k, t, d.layout === k)).join('')}</div>`, { ic: 'pen' })}`;
  },
  live(S, d) {
    const { g, lockup } = this.ctx(S, d);
    return `${box('Ваш логотип', `<div class="stage">${lockup(true)}</div>`, { ic: 'star' })}
      ${box('Де його видно', `<div class="mock">
        <div class="m-app"><small>Іконка застосунку</small>${logoMark({ ...g, shape: 'squircle' }, 64)}</div>
        <div class="m-card" style="--c:${d.c1}"><small>Візитка</small><div class="card2">${lockup(false)}<p>${esc(S.s.founder.name)}<br><span>засновник${S.s.founder.name.endsWith('а') ? 'ця' : ''}</span></p></div></div>
        <div class="m-site"><small>Сайт</small><div class="browser"><i></i><i></i><i></i><div class="bar2">${lockup(false)}</div></div></div>
        <div class="m-tee"><small>Футболка</small><div class="tee" style="--c:${d.c1}"><div class="tp">${logoMark({ ...g, c1: '#ffffff', c2: '', fg: d.c1 }, 46)}</div></div></div></div>`, { ic: 'eye' })}`;
  },
  acts: {
    pair(S, d, el) { d.c1 = el.dataset.a; d.c2 = el.dataset.b; d.grad = true; d.t++; },
    rand(S, d) { const p = PAIRS[Math.floor(Math.random() * PAIRS.length)]; d.c1 = p[0]; d.c2 = p[1]; d.grad = true; d.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)][0]; d.sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; d.t += 3; },
  },
  ready(S, d) {
    if (len(d.name) < 2) return { ok: false, msg: 'Впишіть назву' };
    if ((d.t || 0) < 3) return { ok: false, msg: 'Змініть щонайменше три налаштування знака' };
    const ct = contrast(d.fg, d.c1);
    return { ok: true, stars: 1 + (ct >= 3 ? 1 : 0) + (d.grad || len(d.tag) ? 1 : 0) };
  },
  finish(S, d) {
    const c = S.s.company; c.color = d.c1; c.sym = d.sym; c.mk = { shape: d.shape, c1: d.c1, c2: d.grad ? (d.c2 || d.c1) : '', fg: d.fg };
    if (!S.s.brand.logo) S.s.brand.logo = { q: clamp(.5 + .1 * (contrast(d.fg, d.c1) >= 3 ? 1 : 0) + (d.grad ? .05 : 0), .2, .9), by: 'self' };
  },
});

/* ═════════ Характер бренду (необов'язкова) ═════════ */
const VALUES = ['Чесність', 'Простота', 'Турбота', 'Швидкість', 'Якість', 'Сміливість', 'Гумор', 'Надійність', 'Креативність', 'Доступність', 'Експертність', 'Свобода'];
const AXES5 = [['serious', 'Серйозний', 'Грайливий'], ['classic', 'Класичний', 'Сучасний'], ['access', 'Доступний', 'Преміальний'], ['friend', 'Дружній', 'Експертний']];
const CLICHE = /найкращ|№\s*1|якісн|професійн|інноваційн|унікальн|лідер/i;
reg({
  id: 'brandvoice', stage: 1, opt: true, t: 'Характер бренду', d: 'Оберіть цінності, характер і придумайте слоган.', icon: 'heart', min: 10,
  intro: `Бренд — це ще й характер: як ви розмовляєте з людьми. Оберіть три цінності, налаштуйте особистість бренду й придумайте слоган. Потім перевірте, чи не звучить він шаблонно.`,
  data: () => ({ vals: [], ax: { serious: 50, classic: 50, access: 50, friend: 50 }, slogan: '', own: [], t: 0 }),
  onSet: (S, d, p) => { if (p.startsWith('ax.')) d.t = (d.t || 0) + 1; },
  view(S, d) {
    const wc = d.slogan.trim().split(/\s+/).filter(Boolean).length, F = FONTS[S.s.brand.font] || FONTS.modern, c = S.s.company;
    return `${box('Три цінності', `<div class="xrow">${[...VALUES, ...d.own].map(v => xp('brandvoice', 'vals', v, v, d.vals.includes(v), { set: 'tog', max: 3 })).join('')}</div><div class="xadd mt"><input class="inp" id="bv-own" maxlength="120" placeholder="Своя цінність">${xb('brandvoice', 'addOwn', 'Додати', { ic: 'plus' })}</div>`, { ic: 'heart', side: `обрано ${d.vals.length} з 3` })}
    ${box('Особистість', AXES5.map(([k, a, b]) => `<div class="ax5"><span>${a}</span>${xsl('brandvoice', `ax.${k}`, d, { min: 0, max: 100, step: 5, label: '', v: d.ax[k] })}<span>${b}</span></div>`).join(''), { ic: 'compass' })}
    ${box('Слоган', `${xin('brandvoice', 'slogan', d, { max: 70, ph: 'Коротко й запам’ятовується', label: 'Ваш слоган' })}${checks([[wc >= 2 && wc <= 7, 'Коротко: 2–7 слів', 'Слоган запам’ятовується, коли він короткий'], [!CLICHE.test(d.slogan) && wc > 0, 'Без шаблонних слів («найкращий», «якісний», «№1»)', 'Такі слова є в кожного конкурента'], [wc >= 3, 'Розповідає про вигоду чи дію, а не лише про назву']])}
      <div class="brandcard" style="--c:${c.color};font-family:${F.css}"><b>${esc(c.name)}</b><span>${esc(d.slogan || 'Ваш слоган з’явиться тут')}</span><i>${d.vals.map(esc).join(' · ')}</i></div>`, { ic: 'pen' })}`;
  },
  acts: { addOwn(S, d) { const el = document.getElementById('bv-own'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } if (!d.own.includes(v)) d.own.push(v); if (d.vals.length < 3) d.vals.push(v); } },
  ready(S, d) { const wc = d.slogan.trim().split(/\s+/).filter(Boolean).length; return d.vals.length < 3 ? { ok: false, msg: 'Оберіть три цінності' } : (d.t || 0) < 2 ? { ok: false, msg: 'Налаштуйте хоча б дві шкали особистості' } : wc < 2 ? { ok: false, msg: 'Придумайте слоган із двох слів і більше' } : { ok: true, stars: 1 + (wc <= 7 ? 1 : 0) + (!CLICHE.test(d.slogan) ? 1 : 0) }; },
});
