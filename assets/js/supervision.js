import './click.js';
// الإشراف: البحث عن العملاء (من الإكسل)، صفحة العميل، تقارير مرقّمة، عميل جديد، تصدير Excel
import * as F from './fb.js';
import { xlsx } from './xlsx-lite.js';
const { auth, db } = F;
import * as SX from './sup-x.js';
import * as DECO from './deco.js';
import './uizoom.js';
try { DECO.applyLite(); } catch (e) { }
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 2800); }
const norm = s => F.toEn(String(s ?? '')).replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim().toLowerCase();
const pad2 = n => String(n).padStart(2, '0');
const irNo = (no, seq) => `${no}-${pad2(seq)}`;
const waL = p => { const d = F.toEn(String(p || '')).replace(/\D/g, ''); return 'https://wa.me/966' + d.replace(/^966/, '').replace(/^0/, ''); };
const DEC = { approved: ['معتمد', 'ok'], conditional: ['معتمد بشروط', 'warn'], rejected: ['مرفوض', 'red'] };
const fmt = ts => ts && ts.toDate ? ts.toDate().toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }) : '';

let me = null, emp = null, isOwner = false, clients = null, unsubs = [];
const can = m => isOwner || (emp && emp.active !== false && Array.isArray(emp.mods) && emp.mods.includes(m));
const seeAll = () => can('reports');

const top = () => `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" data-brand="logo" alt="">الإشراف</a><div class="who"><span class="av">${esc(((isOwner ? 'المالك' : (emp && emp.name)) || '').slice(0, 1))}</span><button class="btn btn-ghost sm" id="lo">خروج</button></div></div></header>`;
const back = (href, label = 'رجوع') => `<a class="glass-back" href="${href}" data-back>→ ${label}</a>`;
function frame(html) { root.innerHTML = top() + `<main class="shell sup">${html}</main>`; $('#lo').onclick = () => F.signOut(auth); }

/* ---------- العملاء ---------- */
// العملاء بيتحفظوا على الجهاز: الصفحة بتفتح فوراً بالنسخة المحفوظة، وفي الخلفية بتتحدّث
const CKEY = 'sh.clients2';
async function fetchClients() {
  const s = await F.getDocs(F.collection(db, 'clients'));
  const list = s.docs.map(d => d.data()).sort((a, b) => a.no - b.no);
  try { localStorage.setItem(CKEY, JSON.stringify({ t: Date.now(), list })); } catch (e) { }
  return list;
}
async function loadClients(force) {
  if (clients && !force) return clients;
  if (!force) { try { const c = JSON.parse(localStorage.getItem(CKEY) || 'null'); if (c && c.list && c.list.length) { clients = c.list; if (Date.now() - c.t > 60e3) fetchClients().then(L => { clients = L; const q = document.getElementById('qName'); if (q) q.dispatchEvent(new Event('input')); }).catch(() => { }); return clients; } } catch (e) { } }
  clients = await fetchClients(); return clients;
}
const LOADING = (txt = 'جارٍ تحميل بيانات العملاء…') => `<div class="ld-box"><img class="ld-mark" src="assets/img/mark.png" alt=""><b>${txt}</b><div class="ld-sk"><i></i><i></i><i></i></div><small class="ld-slow" hidden>أول مرة على الجهاز ده بتاخد وقت أطول شوية…</small></div>`;
setInterval(() => { document.querySelectorAll('.ld-box:not([data-t])').forEach(b => { b.dataset.t = Date.now(); setTimeout(() => { const sl = b.querySelector('.ld-slow'); if (sl && document.body.contains(b)) sl.hidden = false; }, 4000); }); }, 300);
const dropCache = () => { clients = null; try { sessionStorage.removeItem('sh.clients'); localStorage.removeItem(CKEY); } catch (e) { } };
function match(c, qNo, qName, qDoc) {
  if (qNo && !(String(c.no) === qNo || String(c.no).startsWith(qNo) || (c.refs || []).some(r => r.split('#')[1] === qNo))) return false;
  if (qName) { const n = norm(c.name); if (!qName.split(' ').every(w => n.includes(w))) return false; }
  if (qDoc) { const all = [...(c.licenses || []).map(l => l.no), c.service, c.superReq, ...Object.values(c.stages || {})].map(x => F.toEn(String(x || ''))); if (!all.some(x => x.includes(qDoc))) return false; }
  return true;
}
const cRow = c => `<a class="li cl" href="#c/${c.no}"><span class="cno">${c.no}</span><div class="main"><b>${esc(c.name)}</b><span>${esc([c.type, c.district, (c.licenses || []).length ? 'رخصة ' + c.licenses.map(l => l.no).join('، ') : ''].filter(Boolean).join(' · '))}</span></div>${c.reportsCount ? `<span class="chip">${c.reportsCount} تقرير</span>` : ''}</a>`;

/* ---------- الصفحة الأولى ---------- */
async function vHome() {
  frame(`${back('portal.html', 'البوابة')}<div class="hello"><div><h1>الإشراف الميداني</h1><p>ابدأ تقرير جديد، أو ابحث عن العميل وشوف كل تقاريره.</p></div></div>
  <div class="big2"><a class="bigbtn red" href="#new"><span>➕</span><b>تقرير جديد</b><small>اختار العميل وابدأ على طول</small></a><a class="bigbtn" href="#search"><span>🔍</span><b>ابحث عن عميل</b><small>بالرقم أو الاسم أو الرخصة</small></a></div>
  <div class="row-acts"><a class="btn btn-ghost" href="#add">➕ عميل جديد</a>${seeAll() ? '<button class="btn btn-ghost" id="xl">⬇ تنزيل Excel بآخر وضع</button>' : ''}${isOwner ? '<button class="btn btn-ghost" id="seed" hidden>⬆ تحميل عملاء الإكسل</button>' : ''}</div>
  <h3 class="sec-t">آخر التقارير</h3><div class="list" id="rl">${LOADING('جارٍ تحميل البيانات…')}</div>`);
  const xl = $('#xl'); if (xl) xl.onclick = exportExcel;
  SX.homeExtras($('main.shell'), toast);
  try {
    const cl = await loadClients();
    if (isOwner && !cl.length) { const b = $('#seed'); b.hidden = false; b.onclick = seedClients; toast('قاعدة العملاء فاضية — اضغط «تحميل عملاء الإكسل»'); }
  } catch (e) { toast(F.authMsg(e), 1); }
  try {
    const q = seeAll() ? F.query(F.collection(db, 'reports'), F.orderBy('at', 'desc'), F.limit(15)) : F.query(F.collection(db, 'reports'), F.where('by', '==', me.uid));
    const s = await F.getDocs(q); const L = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0)).slice(0, 15);
    $('#rl').innerHTML = L.length ? L.map(repRow).join('') : '<p class="empty">لسه مفيش تقارير</p>';
  } catch (e) { $('#rl').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; }
}
const repRow = r => `<a class="li" href="report/?id=${encodeURIComponent(r.id)}"><span class="cno ir">${esc(r.irNo || '—')}</span><div class="main"><b>${esc(r.clientName || r.project || 'بدون اسم')}</b><span>${esc(r.type || '')} — ${esc(r.byName || '')} — ${fmt(r.at)}</span></div>${r.decision && DEC[r.decision] ? `<span class="chip ${DEC[r.decision][1]}">${DEC[r.decision][0]}</span>` : ''}</a>`;

/* ---------- البحث (٣ خانات مستقلة) ---------- */
async function vSearch(forNew) {
  frame(`${back('#')}<div class="hello"><div><h1>${forNew ? 'تقرير جديد — لأي عميل؟' : 'ابحث عن عميل'}</h1><p>اكتب في أي خانة — مش لازم تملا التلاتة.</p></div><a class="btn btn-red" href="#add">➕ عميل جديد</a></div>
  <div class="s3 card"><div class="fld"><label>١. رقم العميل / المشروع</label><input id="qNo" inputmode="numeric" dir="ltr" placeholder="مثلاً 245" autocomplete="off"></div>
  <div class="fld"><label>٢. الاسم (أو جزء منه)</label><input id="qName" placeholder="مثلاً الصانع" autocomplete="off"></div>
  <div class="fld"><label>٣. رقم الرخصة أو الوثيقة</label><input id="qDoc" inputmode="numeric" dir="ltr" placeholder="رقم الرخصة / الخدمة / الطلب" autocomplete="off"></div></div>
  <p class="count" id="cnt"></p><div class="list" id="res">${LOADING()}</div>`);
  let cl; try { cl = await loadClients(); } catch (e) { $('#res').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
  const run = () => {
    const qNo = F.toEn($('#qNo').value).replace(/\D/g, ''), qName = norm($('#qName').value), qDoc = F.toEn($('#qDoc').value).replace(/\s/g, '');
    const any = qNo || qName || qDoc; const L = any ? cl.filter(c => match(c, qNo, qName, qDoc)).sort((a, b) => (qNo ? (String(b.no) === qNo) - (String(a.no) === qNo) || String(a.no).length - String(b.no).length : 0) || a.no - b.no) : cl.slice(-30).reverse();
    $('#cnt').textContent = any ? `${L.length} نتيجة` : `${cl.length} عميل — دول آخر المضافين`;
    $('#res').innerHTML = L.length ? L.slice(0, 80).map(c => forNew ? cRow(c).replace(`href="#c/${c.no}"`, `href="report/?client=${c.no}"`) : cRow(c)).join('') : `<p class="empty">مفيش عميل بالبيانات دي. <a href="#add" style="color:var(--red);font-weight:800">أضف عميل جديد</a></p>`;
  };
  ['qNo', 'qName', 'qDoc'].forEach(id => $('#' + id).oninput = run); run(); $('#qNo').focus();
}

/* ---------- صفحة العميل ---------- */
async function vClient(no) {
  frame(`${back('#search', 'رجوع للبحث')}${LOADING('جارٍ تحميل بيانات العميل…')}`);
  let c; try { const s = await F.getDoc(F.doc(db, 'clients', String(no))); if (!s.exists()) { frame(`${back('#search')}<p class="empty">العميل ده مش موجود.</p>`); return; } c = s.data(); } catch (e) { frame(`${back('#search')}<p class="empty">${esc(F.authMsg(e))}</p>`); return; }
  const phones = String(c.phones || '').split(/\s*\/\s*|\s+/).filter(x => x.replace(/\D/g, '').length >= 9);
  const st = Object.entries(c.stages || {});
  frame(`${back('#search', 'رجوع للبحث')}
  <div class="client-hero card"><span class="cno big">${c.no}</span><div style="flex:1;min-width:0"><h1>${esc(c.name)}</h1><p>${esc([c.type, c.district].filter(Boolean).join(' · ') || '—')}</p></div><a class="btn btn-red lg" href="report/?client=${c.no}">➕ تقرير جديد <small>${irNo(c.no, (c.reportsCount || 0) + 1)}</small></a></div>
  <div class="grid2"><div class="card"><h3>📋 البيانات</h3><dl class="kv">
    <dt>رقم العميل</dt><dd>${c.no}</dd>${(c.licenses || []).map(l => `<dt>رقم الرخصة</dt><dd>${esc(l.no)}${l.date ? ` <small>(${esc(l.date)})</small>` : ''}${l.note ? ` <small>${esc(l.note)}</small>` : ''}</dd>`).join('')}
    ${c.service ? `<dt>رقم الخدمة</dt><dd>${esc(c.service)} ${c.serviceYear ? `<small>(${esc(c.serviceYear)})</small>` : ''}</dd>` : ''}${c.occupancy ? `<dt>شهادة الإشغال</dt><dd>${esc(c.occupancy)}</dd>` : ''}
    ${c.notes ? `<dt>ملاحظات</dt><dd>${esc(c.notes)}</dd>` : ''}<dt>المرجع في الإكسل</dt><dd>${esc((c.refs || []).join('، ') || 'عميل جديد')}</dd>
    ${c.createdAt ? `<dt>اتضاف</dt><dd>${fmt(c.createdAt)} ${c.createdByName ? '— ' + esc(c.createdByName) : ''}</dd>` : ''}</dl>
    ${phones.length ? `<div class="ph">${phones.map(p => `<a class="btn btn-ghost sm" href="tel:${esc(p)}" dir="ltr">📞 ${esc(p)}</a><a class="btn btn-ok sm" target="_blank" rel="noopener" href="${waL(p)}">واتساب</a>`).join('')}</div>` : ''}</div>
  <div class="card"><h3>🏗 مراحل التنفيذ (أرقام الطلبات)</h3>${st.length ? `<table class="stg">${st.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>` : '<p class="empty" style="padding:10px">لسه مفيش مراحل مسجلة</p>'}</div></div>
  <h3 class="sec-t">التقارير <span class="chip" id="rc">…</span></h3><div class="list" id="rl">${LOADING('جارٍ تحميل البيانات…')}</div>`);
  try {
    const q = seeAll() ? F.query(F.collection(db, 'reports'), F.where('clientNo', '==', c.no)) : F.query(F.collection(db, 'reports'), F.where('clientNo', '==', c.no), F.where('by', '==', me.uid));
    const s = await F.getDocs(q); const L = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.seq || 0) - (a.seq || 0) || ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0));
    $('#rc').textContent = L.length; $('#rl').innerHTML = L.length ? L.map(repRow).join('') : '<p class="empty">مفيش تقارير للعميل ده لسه — اضغط «تقرير جديد» فوق.</p>';
  } catch (e) { $('#rl').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; }
  SX.clientExtras($('main.shell'), c, { me, isOwner, emp, toast });
}

/* ---------- عميل جديد (رقم مسلسل) ---------- */
function vAdd() {
  frame(`${back('#search')}<div class="hello"><div><h1>➕ عميل جديد</h1><p>بياخد رقم مسلسل بعد آخر عميل على طول.</p></div></div>
  <form class="card form" id="af" style="display:grid;gap:14px;max-width:720px">
    <div class="fld"><label>اسم العميل / المشروع *</label><input id="aName" maxlength="120" required></div>
    <div class="row2"><div class="fld"><label>رقم الجوال</label><input id="aPhone" inputmode="tel" dir="ltr" placeholder="05xxxxxxxx"></div><div class="fld"><label>الحي</label><input id="aDist"></div></div>
    <div class="row2"><div class="fld"><label>نوع المشروع</label><select id="aType"><option>فيلا سكنية</option><option>دوبلكس</option><option>فلل متلاصقة</option><option>عمارة سكنية</option><option>مجمع تجاري سكني</option><option>مبنى تجاري</option><option>استراحة</option><option>أخرى</option></select></div><div class="fld"><label>رقم الرخصة</label><input id="aLic" inputmode="numeric" dir="ltr"></div></div>
    <div class="fld"><label>ملاحظات</label><textarea id="aNotes" rows="3"></textarea></div>
    <button class="btn btn-red" id="aGo">حفظ العميل</button><p class="err" id="aErr"></p></form>`);
  $('#af').onsubmit = async e => {
    e.preventDefault(); const name = $('#aName').value.trim(); if (name.length < 2) return $('#aErr').textContent = 'اكتب اسم العميل';
    const ph = F.toEn($('#aPhone').value).replace(/\D/g, ''), lic = F.toEn($('#aLic').value).replace(/\s/g, '');
    try { const cl = await loadClients(true); const dup = cl.find(c => (lic && (c.licenses || []).some(l => l.no === lic)) || norm(c.name) === norm(name)); if (dup && !confirm(`في عميل مسجّل بنفس ${lic && (dup.licenses || []).some(l => l.no === lic) ? 'رقم الرخصة' : 'الاسم'}: رقم ${dup.no} — ${dup.name}\nتضيف عميل جديد برضه؟`)) { location.hash = '#c/' + dup.no; return; } } catch (x) { }
    $('#aGo').disabled = true; $('#aGo').textContent = 'جارٍ الحفظ…';
    try {
      const no = await F.runTransaction(db, async tx => {
        const mref = F.doc(db, 'meta', 'counters'); const m = await tx.get(mref); const n = ((m.exists() && m.data().clientNo) || 0) + 1;
        const c = { no: n, name, type: $('#aType').value, district: $('#aDist').value.trim(), licenses: lic ? [{ no: lic, date: '' }] : [], service: '', serviceYear: '', phones: ph, notes: $('#aNotes').value.trim(), occupancy: '', stages: {}, refs: [], reportsCount: 0, createdAt: F.serverTimestamp(), createdBy: me.uid, createdByName: isOwner ? 'المالك' : (emp && emp.name) || '' };
        c.search = [n, norm(name), lic].join(' ');
        tx.set(mref, { clientNo: n }, { merge: true }); tx.set(F.doc(db, 'clients', String(n)), c); return n;
      });
      dropCache(); toast('اتضاف العميل رقم ' + no + ' ✓'); location.hash = '#c/' + no;
    } catch (x) { $('#aErr').textContent = F.authMsg(x); $('#aGo').disabled = false; $('#aGo').textContent = 'حفظ العميل'; }
  };
}

/* ---------- تحميل عملاء الإكسل (مرة واحدة — المالك) ---------- */
async function seedClients() {
  const b = $('#seed'); b.disabled = true; b.textContent = 'جارٍ التحميل…';
  try {
    const j = await (await fetch('assets/data/clients-seed.json', { cache: 'no-store' })).json(); const L = j.clients;
    for (let i = 0; i < L.length; i += 400) {
      const wb = F.writeBatch(db); L.slice(i, i + 400).forEach(c => wb.set(F.doc(db, 'clients', String(c.no)), { ...c, reportsCount: 0, imported: j.generated }));
      if (i + 400 >= L.length) wb.set(F.doc(db, 'meta', 'counters'), { clientNo: Math.max(...L.map(c => c.no)) }, { merge: true });
      await wb.commit(); b.textContent = `جارٍ التحميل… ${Math.min(L.length, i + 400)}/${L.length}`;
    }
    dropCache(); toast(`اتحمّل ${L.length} عميل ✓`); vHome();
  } catch (e) { toast(F.authMsg(e), 1); b.disabled = false; b.textContent = '⬆ تحميل عملاء الإكسل'; }
}

/* ---------- تصدير Excel ---------- */
async function exportExcel() {
  const b = $('#xl'); b.disabled = true; b.textContent = 'جارٍ التجهيز…';
  try {
    const cl = await loadClients(true); const rs = (await F.getDocs(F.collection(db, 'reports'))).docs.map(d => ({ id: d.id, ...d.data() }));
    const stageKeys = [...new Set(cl.flatMap(c => Object.keys(c.stages || {})).filter(k => !k.includes('(رخصة')))];
    const rows1 = [['رقم العميل', 'الاسم', 'نوع المشروع', 'الحي', 'أرقام الرخص', 'تاريخ الرخصة', 'رقم الخدمة', 'سنة الخدمة', ...stageKeys, 'ملاحظات', 'شهادة الإشغال', 'أرقام التواصل', 'عدد التقارير', 'آخر تقرير', 'المرجع في الإكسل القديم']];
    cl.forEach(c => { const mine = rs.filter(r => r.clientNo === c.no).sort((a, b) => (b.seq || 0) - (a.seq || 0)); rows1.push([c.no, c.name, c.type, c.district, (c.licenses || []).map(l => l.no).join(' / '), (c.licenses || []).map(l => l.date).filter(Boolean).join(' / '), c.service, c.serviceYear, ...stageKeys.map(k => (c.stages || {})[k] || ''), c.notes, c.occupancy, c.phones, mine.length, mine[0] ? mine[0].irNo + ' — ' + fmt(mine[0].at) : '', (c.refs || []).join(' ، ')]); });
    const rows2 = [['رقم التقرير', 'رقم العميل', 'العميل', 'نوع الاستلام', 'القرار', 'المهندس', 'تاريخ الإنشاء', 'آخر تعديل']];
    rs.sort((a, b) => (a.clientNo || 0) - (b.clientNo || 0) || (a.seq || 0) - (b.seq || 0)).forEach(r => rows2.push([r.irNo || '', r.clientNo || '', r.clientName || r.project || '', r.type || '', r.decision && DEC[r.decision] ? DEC[r.decision][0] : '', r.byName || '', fmt(r.at), fmt(r.upd)]));
    const blob = xlsx([{ name: 'العملاء', rows: rows1 }, { name: 'التقارير', rows: rows2 }]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `عملاء-الشمراني-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click();
    toast('اتنزّل الملف ✓');
  } catch (e) { toast(F.authMsg(e), 1); }
  b.disabled = false; b.textContent = '⬇ تنزيل Excel بآخر وضع';
}

/* ---------- router ---------- */
function route() {
  if (!me) return; const h = location.hash.slice(1);
  if (h === 'search') return vSearch(false);
  if (h === 'new') return vSearch(true);
  if (h === 'add') return vAdd();
  if (h.startsWith('c/')) return vClient(+h.slice(2));
  vHome();
}
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
F.onAuthStateChanged(auth, async u => {
  unsubs.forEach(x => x()); unsubs = [];
  if (!u) { location.replace('portal.html'); return; }
  me = u; isOwner = await F.ownerOf(u.uid);
  if (isOwner) { try { localStorage.setItem('sh.staff', '1'); } catch (e) { } }
  if (!isOwner) { try { const s = await F.getDoc(F.doc(db, 'employees', u.uid)); emp = s.exists() ? s.data() : null; } catch (e) { emp = null; } if (emp) { try { localStorage.setItem('sh.staff', '1'); } catch (e) { } } }
  if (!can('report') && !can('reports')) { frame(`${back('portal.html', 'البوابة')}<div class="card" style="text-align:center;padding:40px"><h2>مفيش صلاحية</h2><p style="color:var(--mut);margin-top:8px">الإشراف محتاج صلاحية من المالك.</p></div>`); return; }
  route();
});
