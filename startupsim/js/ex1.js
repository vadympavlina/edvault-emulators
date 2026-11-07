// Симулятор стартапу · вправи етапу 1 «Ніша й продукт»: ніша, ринок і конкуренти, потреби клієнтів, модель заробітку, перша версія.
import { MODELS } from './data.js';
import { money } from './sim.js';
import { esc, term } from './ui.js';
import { icon } from './icons.js';
import { reg, xb, xp, xin, xsl, xnum, tip, box, checks, bar, radar, stars, hash, clamp, sumOf, pc, money0 } from './ex-core.js';

const len = s => String(s || '').trim().length;

/* ═════════ Вибір ніші ═════════ */
const CRIT = [
  ['need', 'Потреба', 'Наскільки сильно болить проблема, яку ви розв’язуєте'],
  ['size', 'Розмір ринку', 'Скільки людей чи організацій можуть стати клієнтами'],
  ['comp', 'Вільне місце', 'Чим менше сильних конкурентів, тим вище (5 — майже немає)'],
  ['skill', 'Ваші сили', 'Чи вмієте ви це робити: досвід, знайомства, команда'],
  ['money', 'Прибуток', 'Чи готові клієнти платити достатньо, щоб ви заробляли'],
];
const ALTS = [
  { id: 'shoes', t: 'Догляд за взуттям із доставкою', s: { need: 3, size: 3, comp: 3, skill: 2, money: 3 } },
  { id: 'code', t: 'Курси програмування для підлітків', s: { need: 4, size: 4, comp: 2, skill: 3, money: 4 } },
  { id: 'tours', t: 'Екскурсії від місцевих для туристів', s: { need: 3, size: 3, comp: 3, skill: 4, money: 3 } },
  { id: 'pets', t: 'Корисні смаколики для домашніх улюбленців', s: { need: 4, size: 4, comp: 2, skill: 2, money: 4 } },
];
const nicheRows = (S, d) => [{ id: 'me', t: S.I.t, s: d.me, mine: true }, ...ALTS.map(a => ({ ...a, s: d.alt[a.id] })), ...d.own.map((o, i) => ({ id: 'own' + i, i, t: o.t, s: o.s, own: true }))];
const nicheScore = (s, w) => { const ws = CRIT.map(([k]) => (w.includes(k) ? 2 : 1)); return sumOf(CRIT.map(([k], i) => s[k] * ws[i])) / (5 * sumOf(ws)); };
reg({
  id: 'niche', stage: 0, ord: 1, t: 'Оцініть нішу', d: 'Оцініть свою ідею за п’ятьма критеріями й порівняйте з іншими нішами.', icon: 'compass', min: 10,
  intro: `${term('Ніша', 'Ніша')} — вузька частина ринку, де ви можете стати найкращим. Оцініть свою ідею, порівняйте з іншими й додайте власну нішу. Немає «правильних» цифр: важливо, щоб ви могли пояснити свій вибір.`,
  data: () => ({ me: { need: 3, size: 3, comp: 3, skill: 3, money: 3 }, alt: Object.fromEntries(ALTS.map(a => [a.id, { ...a.s }])), own: [], w: [], touched: 0, pick: 'me', why: '' }),
  onSet: (S, d, p) => { if (/^(me|alt|own)\./.test(p)) d.touched = (d.touched || 0) + 1; },
  view(S, d) {
    const rows = nicheRows(S, d).map(r => ({ ...r, sc: nicheScore(r.s, d.w) })), best = rows.reduce((a, b) => (b.sc > a.sc ? b : a));
    const sliders = (base, s) => CRIT.map(([k, t, h]) => xsl('niche', `${base}.${k}`, d, { min: 1, max: 5, label: `${esc(t)}<small class="xh">${esc(h)}</small>`, v: s[k] })).join('');
    const me = rows[0];
    return `${box('Ваша ніша', `<p class="sub">«${esc(S.I.t)}»: ${esc(S.I.pitch)}</p><div class="xg side"><div>${sliders('me', d.me)}</div><div class="xc">${radar(CRIT.map(([k]) => d.me[k]), CRIT.map(c => c[1]))}<b class="big-n">${pc(me.sc)}</b><small>загальна оцінка</small></div></div>`, { ic: 'target' })}
    ${box('Що для вас найважливіше?', `<p class="sub">Оберіть до двох критеріїв: вони рахуватимуться вдвічі.</p><div class="xrow">${CRIT.map(([k, t]) => xp('niche', 'w', k, esc(t), d.w.includes(k), { set: 'tog', max: 2 })).join('')}</div>`, { ic: 'star' })}
    ${box('Порівняйте з іншими нішами', `<div class="xlist">${rows.map(r => `<div class="nrow ${r.id === best.id ? 'best' : ''}"><div class="nh"><b>${esc(r.t)}</b>${r.mine ? '<span class="xtag">ваша ідея</span>' : ''}${r.own ? '<span class="xtag">власна</span>' : ''}${r.id === best.id ? '<span class="xtag ok">найвища оцінка</span>' : ''}<span class="ns">${pc(r.sc)}</span></div>${bar(r.sc, { color: r.id === best.id ? 'var(--ok)' : 'var(--acc)', label: r.t })}
      <div class="nd">${CRIT.map(([k, t]) => `<span title="${esc(t)}">${esc(t)} <b>${r.s[k]}</b></span>`).join('')}</div>
      ${r.mine ? '' : `<details class="nadj"><summary>${icon('wrench', 14)} Змінити оцінки</summary>${sliders(r.own ? `own.${r.i}.s` : `alt.${r.id}`, r.s)}${r.own ? xb('niche', 'delOwn', 'Прибрати нішу', { i: r.i, cls: 'sm ghost danger', ic: 'trash' }) : ''}</details>`}</div>`).join('')}</div>
      ${d.own.length < 3 ? `<div class="xadd" style="margin-top:12px"><input class="inp" id="niche-new" maxlength="240" placeholder="Своя ніша, наприклад: «майстер-класи з кераміки»">${xb('niche', 'addOwn', 'Додати нішу', { ic: 'plus' })}</div>` : ''}`, { ic: 'chart', side: `оцінок змінено: ${d.touched || 0}` })}
    ${box('Ваш вибір', `<p class="sub">Яка ніша найкраща для вас? Вона може відрізнятися від найвищої оцінки: цифри лише допомагають.</p><div class="xrow">${rows.map(r => xp('niche', 'pick', r.id, esc(r.t), d.pick === r.id)).join('')}</div>
      ${xin('niche', 'why', d, { label: 'Чому саме ця ніша?', area: true, rows: 3, max: 300, ph: 'Я обираю її, тому що…', hint: 'Назвіть хоча б дві причини.', cls: 'mt' })}`, { ic: 'check' })}`;
  },
  acts: {
    addOwn(S, d) { const el = document.getElementById('niche-new'), v = (el?.value || '').trim(); if (!v) { el?.focus(); return false; } d.own.push({ t: v, s: { need: 3, size: 3, comp: 3, skill: 3, money: 3 } }); },
    delOwn(S, d, el) { const i = +el.dataset.i; d.own.splice(i, 1); if (d.pick === 'own' + i) d.pick = 'me'; },
  },
  ready(S, d) {
    const rows = nicheRows(S, d), pick = rows.find(r => r.id === d.pick);
    if ((d.touched || 0) < 3) return { ok: false, msg: 'Оцініть свою ідею: пересуньте хоча б три повзунки' };
    if (len(d.why) < 25) return { ok: false, msg: 'Поясніть свій вибір хоча б двома реченнями' };
    return { ok: true, stars: 1 + (d.own.length ? 1 : 0) + (len(d.why) >= 90 || d.w.length ? 1 : 0), pick: pick?.t };
  },
  finish(S, d) { d.pickName = nicheRows(S, d).find(r => r.id === d.pick)?.t || ''; },
});

/* ═════════ Що в першу версію (MVP) ═════════ */
const CLS = [['must', 'Обов’язково', 'без цього продукту немає'], ['should', 'Бажано', 'додамо, якщо вистачить сил'], ['could', 'Можна пізніше', 'приємний додаток'], ['wont', 'Не зараз', 'свідомо відкладаємо']];
reg({
  id: 'mvp', stage: 0, ord: 4, t: 'Що в першу версію', d: 'Розподіліть функції за важливістю й поставте обов’язкові в розробку.', icon: 'box', min: 12,
  intro: `${term('MVP', 'Перша версія (MVP)')} — найпростіше, що вже можна дати людям. Розкладіть функції за методом MoSCoW: що обов’язкове, що бажане, що можна відкласти. Обсяг першої версії має вміститися у ваш бюджет розробки.`,
  data: () => ({ cls: {}, budget: 30, applied: false }),
  view(S, d) {
    const feats = Object.entries(S.I.features), K = S.insight(S.s.target), asked = new Map(K.feats);
    const must = feats.filter(([id]) => d.cls[id] === 'must'), cost = sumOf(must.map(([, f]) => f.cost)), over = cost > d.budget;
    const hasPay = must.some(([, f]) => f.pay), hasCore = must.some(([, f]) => f.core);
    const card = ([id, f]) => `<article class="feat ${d.cls[id] || ''}"><div class="fh"><b>${esc(f.t)}</b><span class="xtag">${f.cost} очок</span>${f.core ? '<span class="xtag ok">ядро</span>' : ''}${f.pay ? '<span class="xtag warn">потрібна для оплат</span>' : ''}${asked.get(id) ? `<span class="xtag ok" title="Клієнти просили це в інтерв’ю">просили клієнти</span>` : ''}${S.has(id) ? '<span class="xtag">вже готово</span>' : ''}</div><p>${esc(f.desc)}</p>
      <div class="xrow">${CLS.map(([k, t]) => xp('mvp', `cls.${id}`, k, t, d.cls[id] === k)).join('')}</div></article>`;
    return `${box('Функції продукту', `<div class="xg c2">${feats.map(card).join('')}</div>`, { ic: 'cube', side: `розподілено ${feats.filter(([id]) => d.cls[id]).length} з ${feats.length}` })}
    ${box('Обсяг першої версії', `${xsl('mvp', 'budget', d, { min: 10, max: 80, step: 1, label: 'Скільки «очок розробки» готові вкласти?', u: ' оч.' })}
      <div class="mvpbar"><div class="x-bar"><i style="width:${clamp(cost / Math.max(d.budget, 1), 0, 1) * 100}%;background:${over ? '#d33' : 'var(--ok)'}"></i></div><b>${cost} з ${d.budget} оч.</b></div>
      ${checks([[must.length > 0, 'Є хоча б одна обов’язкова функція'], [hasCore, 'Є «ядро» продукту: те, заради чого його беруть', 'Позначте «Обов’язково» ядро'], [hasPay, 'Є оплата: інакше гроші не надходитимуть', 'Без функції оплати ніхто не заплатить'], [!over && must.length > 0, 'Обов’язкове вміщується у бюджет', 'Приберіть щось в «Бажано» або збільште бюджет']])}
      <div class="xrow" style="margin-top:12px">${xb('mvp', 'apply', d.applied ? 'Оновити чергу розробки' : 'Поставити обов’язкове в розробку', { cls: 'primary', ic: 'rocket', dis: !must.length })}<small class="muted">Функції з позначкою «Обов’язково» з’являться в «Продукт» → «У роботі».</small></div>`, { ic: 'flag' })}`;
  },
  acts: { apply(S, d, el, C) { const ids = Object.entries(d.cls).filter(([, v]) => v === 'must').map(([id]) => id); ids.forEach(id => S.queue(id)); d.applied = true; C.toast(`У розробку поставлено функцій: ${ids.length}`, 'good'); } },
  ready(S, d) {
    const feats = Object.keys(S.I.features), done = feats.filter(id => d.cls[id]).length, must = feats.filter(id => d.cls[id] === 'must');
    if (done < Math.min(5, feats.length)) return { ok: false, msg: `Розподіліть ще ${Math.min(5, feats.length) - done} функцій` };
    if (!must.length) return { ok: false, msg: 'Оберіть хоча б одну обов’язкову функцію' };
    if (!d.applied && !S.s.product.queue.length && !S.s.product.built.length) return { ok: false, msg: 'Поставте обов’язкові функції в розробку' };
    const cost = sumOf(must.map(id => S.I.features[id].cost));
    return { ok: true, stars: 1 + (cost <= d.budget ? 1 : 0) + (must.some(id => S.I.features[id].core) && must.some(id => S.I.features[id].pay) ? 1 : 0) };
  },
});

/* ═════════ Модель заробітку ═════════ */
const MODEL_X = { free: { su: .4, pay: 1, arpu: 3, hint: 'Заробіток із реклами: 3 ₴ на місяць з користувача.' }, freemium: { su: .12, pay: .05, hint: 'Платить 5 із 100 зареєстрованих.' }, trial: { su: .06, pay: .35, hint: 'Реєструється менше, а платить третина.' }, device: { su: .015, pay: 1, once: true, hint: 'Платять одразу, але є собівартість товару.' }, b2b: { su: .004, pay: .5, mult: 25, hint: 'Клієнтів мало, зате кожен — це організація.' } };
reg({
  id: 'bmodel', stage: 0, ord: 5, opt: true, t: 'Модель заробітку', d: 'Порівняйте способи заробляти й оберіть свій.', icon: 'coins', min: 10,
  intro: `${term('Бізнес-модель', 'Бізнес-модель')} відповідає на питання: хто платить, за що і як. Порівняйте умовні розрахунки для різних моделей на однакових відвідувачах і оберіть ту, що пасує вашій ідеї.`,
  data: S => ({ visitors: 2000, price: Math.round(S.seg().wtp * .8 / 10) * 10, pick: '', why: '', applied: false }),
  view(S, d) {
    const g = S.seg(), models = S.I.models, rows = models.map(m => { const x = MODEL_X[m] || { su: .05, pay: .1 }, price = m === 'b2b' ? d.price * (x.mult || 1) / 1 : d.price, users = d.visitors * x.su, payers = users * x.pay; const rev = m === 'free' ? users * x.arpu : payers * price; return { m, users, payers, rev, once: !!x.once, hint: x.hint }; });
    const max = Math.max(1, ...rows.map(r => r.rev));
    return `${box('Умови розрахунку', `<div class="xg c2">${xsl('bmodel', 'visitors', d, { min: 500, max: 20000, step: 500, label: 'Відвідувачів сайту за місяць', u: '' })}${xsl('bmodel', 'price', d, { min: 10, max: Math.max(500, Math.round(g.wtp * 2)), step: 10, label: 'Ціна, ₴', u: ' ₴' })}</div><p class="sm muted">Цифри умовні: вони лише показують різницю між моделями.</p>`, { ic: 'wrench' })}
    ${box('Що дає кожна модель', `<div class="xlist">${rows.map(r => `<div class="nrow"><div class="nh"><b>${esc(MODELS[r.m]?.t || r.m)}</b><span class="ns">${money0(r.rev)}${r.once ? '' : ' / міс'}</span></div>${bar(r.rev / max, { label: MODELS[r.m]?.t })}<p class="sm muted">${esc(MODELS[r.m]?.desc || '')} ${esc(r.hint)}</p><div class="nd"><span>Зареєструється <b>${Math.round(r.users)}</b></span><span>Платитимуть <b>${Math.round(r.payers)}</b></span></div>
      <div class="xrow">${xp('bmodel', 'pick', r.m, 'Обрати цю модель', d.pick === r.m, { cls: 'card' })}</div></div>`).join('')}</div>`, { ic: 'chart' })}
    ${box('Чому ця модель?', `${xin('bmodel', 'why', d, { area: true, max: 300, ph: 'Обираю цю модель, тому що наші клієнти…', hint: 'Подумайте: хто платитиме, коли й скільки готовий платити.' })}<div class="xrow" style="margin-top:10px">${xb('bmodel', 'apply', d.applied ? 'Модель застосовано в грі' : 'Застосувати в грі', { cls: 'primary', dis: !d.pick || d.pick === 'b2b' || S.s.model === d.pick })}${d.pick === 'b2b' ? '<small class="muted">Для організацій модель вмикається автоматично, коли ви обираєте їх цільовими клієнтами.</small>' : ''}</div>`, { ic: 'check' })}`;
  },
  acts: { apply(S, d, el, C) { S.setModel(d.pick); d.applied = true; C.toast('Модель застосовано в грі', 'good'); } },
  ready(S, d) { return !d.pick ? { ok: false, msg: 'Оберіть модель' } : len(d.why) < 20 ? { ok: false, msg: 'Поясніть свій вибір' } : { ok: true, stars: 2 + (len(d.why) >= 80 ? 1 : 0) }; },
});
