// Симулятор стартапу · сторінка перевірки для викладача.
// Відкриває файл збереження учня й показує всю роботу лише для читання: нічого не редагується і нічого не записується
// ні у файл, ні в localStorage (власну гру викладача сторінка не чіпає).
import { Sim, money } from './sim.js';
import { unpackGame, summaryOf } from './file.js';
import { STAGES, stageInfo } from './stages.js';
import { EX, exAll, exOf, exDone, exStars, stars, STAGE_T } from './ex-core.js';
import { coreViews } from './v-core.js';
import { marketViews } from './v-market.js';
import { icon } from './icons.js';
import { esc, logo } from './ui.js';
import './ex1.js'; import './ex-need.js'; import './ex-start.js'; import './ex1b.js'; import './ex-aud.js'; import './ex-brand.js';
import './ex2.js'; import './ex3.js'; import './ex3b.js'; import './ex4.js'; import './ex5.js'; import './ex6.js'; import './ex7.js'; import './ex8.js'; import './ex9.js';

const $ = id => document.getElementById(id), main = $('main'), tools = $('tools');
let S = null, meta = null, tab = 'over', error = '';

const TABS = [['over', 'Огляд'], ['ex', 'Вправи'], ['plan', 'Бізнес-план'], ['iv', "Інтерв'ю"], ['rep', 'Журнал і звіт']];
const ui = { view: 'plan' };

function safe(fn, fallback = '') { try { return fn(); } catch (e) { return `<p class="muted">${esc(fallback || 'Цей розділ не вдалося показати.')}</p>`; } }

const dropZone = () => `<section class="ck-drop" id="dz"><h1>Відкрийте файл збереження учня</h1><p>Перетягніть сюди файл <b>.edvault</b> (підійде й старий <b>.json</b>) або оберіть його на комп’ютері. Усе буде показано лише для перегляду: змінити роботу тут не можна.</p><button class="btn primary" id="pick" type="button">${icon('open', 16)} Обрати файл</button>${error ? `<div class="ck-err" role="alert">${esc(error)}</div>` : ''}</section>`;

function overview() {
  const sum = summaryOf(S), info = stageInfo(S);
  const rows = info.list.map((st, i) => `<li class="${st.done ? 'ok' : ''}">${icon(st.done ? 'check' : 'minus', 14)}<span><b>Етап ${i + 1}. ${esc(st.t)}</b> <small>обов’язкових кроків: ${st.n} з ${st.m}${st.on ? `, додаткових: ${st.on}` : ''}</small></span></li>`).join('');
  return `<section class="card"><header class="card-h"><h3>Підсумок</h3></header><dl class="ck-sum">${Object.entries(sum).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></section>
    <section class="card" style="margin-top:14px"><header class="card-h"><h3>Проходження етапів</h3></header><ul class="x-checks">${rows}</ul></section>`;
}

function exBlock(def) {
  const done = S.s.ex?.done?.[def.id], started = !!S.s.ex?.d?.[def.id];
  const chip = done ? `<span class="chip ok">${icon('check', 14)} виконано · ${stars(done.s)} · тиждень ${done.w + 1}</span>` : started ? '<span class="chip warn">розпочато, не завершено</span>' : '<span class="chip">не розпочато</span>';
  return `<details class="ck-ex ${done || started ? '' : 'none'}" data-ex="${def.id}"><summary>${icon(def.icon, 20)}<b>${esc(def.t)}</b>${chip}</summary><div class="ck-body" data-body></div></details>`;
}
function exercises() {
  return STAGES.map((st, i) => {
    const list = exOf(i); if (!list.length) return '';
    return `<section class="ck-st"><h3>Етап ${i + 1}. ${esc(STAGE_T[i])} <span class="muted sm">${list.filter(e => exDone(S, e.id)).length} з ${list.length} виконано</span></h3>${list.map(exBlock).join('')}</section>`;
  }).join('') + `<p class="muted sm">Натисніть на вправу, щоб розгорнути відповіді учня.</p>`;
}
// вміст вправи малюється той самий, що бачить учень, але в «inert»-контейнері: на ньому нічого не натискається і не редагується
function fillEx(det) {
  const body = det.querySelector('[data-body]'); if (!body || body.dataset.ready) return;
  const def = EX[det.dataset.ex]; if (!def) return;
  body.dataset.ready = '1';
  try {
    const d = (S.s.ex.d[def.id] ||= def.data ? def.data(S) : {}), done = S.s.ex.done[def.id], ctx = { ui, done };
    body.innerHTML = `<div class="ck-ro" inert><div class="ex-body ${def.cols ? 'cols' : ''}">${def.cols ? `<div class="ex-main">${def.view(S, d, ctx)}</div>` : def.view(S, d, ctx)}${def.live ? `<div class="ex-live">${def.live(S, d, ctx)}</div>` : ''}</div></div>`;
    body.querySelectorAll('textarea,input,select,button').forEach(el => { el.disabled = true; el.setAttribute('tabindex', '-1'); });
  } catch (e) { body.innerHTML = '<p class="muted">Цю вправу не вдалося показати.</p>'; }
}

const ro = html => `<div class="ck-ro" inert>${html}</div>`;
function interviews() {
  const list = S.s.interviews || [];
  if (!list.length) return '<section class="card"><p class="muted">Учень не провів жодного інтерв’ю.</p></section>';
  return `<section class="card"><header class="card-h"><h3>${icon('mic')} Інтерв’ю з клієнтами</h3><span class="muted sm">усього: ${list.length}</span></header><div class="ivlist">${[...list].reverse().map(v => `<details class="ivh ck-iv"><summary><b>${esc(v.name)}</b> <span class="muted">${esc(v.who)} · ${esc(S.seg(v.seg)?.short || '')} · тиждень ${v.w + 1}</span>${v.bad ? `<span class="chip warn">підказувальні запитання: ${v.bad}</span>` : '<span class="chip ok">лише факти</span>'}</summary><div class="chat">${v.log.map(l => `<p class="q">${esc(l.q)}</p><p class="a">${esc(l.a)}</p>`).join('')}</div></details>`).join('')}</div></section>`;
}

function render() {
  if (!S) {
    tools.innerHTML = '';
    main.innerHTML = dropZone();
    return;
  }
  const s = S.s, c = s.company;
  tools.innerHTML = `<button class="btn" id="pick" type="button">${icon('open', 16)} Інший файл</button><button class="btn" id="prt" type="button">${icon('printer', 16)} Друк</button>`;
  const saved = meta.savedAt ? new Date(meta.savedAt).toLocaleString('uk-UA') : '';
  let body = '';
  if (tab === 'over') body = overview();
  else if (tab === 'ex') body = exercises();
  else if (tab === 'plan') body = ro(safe(() => marketViews.plan.render(S, ui)));
  else if (tab === 'iv') body = interviews();
  else body = ro(safe(() => coreViews.report.render(S, ui)));
  main.innerHTML = `${meta.edited ? '<div class="ck-warn" role="alert"><b>Увага.</b> Дані у файлі не збігаються з контрольною сумою: файл могли змінювати вручну після збереження.</div>' : ''}
    <div class="ck-who">${logo(c, 56)}<div><h1>${esc(s.founder.name)}${s.founder.group ? ` · ${esc(s.founder.group)}` : ''}</h1><p>${esc(c.name)} · ${esc(S.I.t)} · ${money(s.cash)} на рахунку${saved ? ` · збережено ${esc(saved)}` : ''}</p></div></div>
    <nav class="ck-tabs" role="tablist">${TABS.map(([k, t]) => `<button type="button" role="tab" aria-selected="${tab === k}" class="${tab === k ? 'on' : ''}" data-tab="${k}">${t}</button>`).join('')}</nav>
    <div class="ck-view" data-tab-view="${tab}">${body}</div>`;
  main.querySelectorAll('.ck-view textarea,.ck-view input:not([type=search]),.ck-view select').forEach(el => { el.disabled = true; });
}

async function openFile(file) {
  if (!file) return;
  let text = '';
  try { text = await file.text(); } catch { error = 'Файл не вдалося прочитати.'; S = null; render(); return; }
  const res = unpackGame(text);
  if (!res.ok) { error = res.error; S = null; render(); return; }
  error = ''; meta = res;
  try { S = new Sim(res.state); } catch { error = 'Файл пошкоджений: гру не вдалося відновити.'; S = null; render(); return; }
  tab = 'over'; render(); scrollTo(0, 0);
}

function pick() { const i = document.createElement('input'); i.type = 'file'; i.accept = '.edvault,.json,application/json,text/plain'; i.onchange = () => openFile(i.files[0]); i.click(); }

document.addEventListener('click', e => {
  if (e.target.closest('#pick')) return pick();
  if (e.target.closest('#prt')) {
    if (tab === 'ex') main.querySelectorAll('.ck-ex').forEach(d => { d.open = true; fillEx(d); });
    return print();
  }
  const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; render(); }
});
document.addEventListener('toggle', e => { if (e.target.matches?.('.ck-ex[open]')) fillEx(e.target); }, true);
addEventListener('dragover', e => { e.preventDefault(); $('dz')?.classList.add('over'); });
addEventListener('dragleave', e => { if (!e.relatedTarget) $('dz')?.classList.remove('over'); });
addEventListener('drop', e => { e.preventDefault(); $('dz')?.classList.remove('over'); openFile(e.dataTransfer?.files?.[0]); });
// ручні відкриття для тестів і закладок
window.Checker = { open: openFile, get S() { return S; } };
render();
