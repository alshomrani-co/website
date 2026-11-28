import './click.js';
// بوابة الموظفين: دخول، تسجيل بكود دعوة، انتظار موافقة، الأقسام، الدعم الفني، أرشيف التقارير
import * as F from './fb.js';
import { micButton, voiceHTML, wireVoices } from './voice.js';
import * as DECO from './deco.js';
import * as PERM from './perms.js';
// تذكّرني + الخروج + الخلفية (نجدي افتراضي للبوابة)
const logout = () => { try { localStorage.removeItem('sh.staff'); localStorage.setItem('sh.rem', '0'); } catch (e) { } return F.signOut(auth); };
const decoNow = () => { const c = DECO.cached(); const t = Object.assign({}, c.theme || {}); if (!t.bg) t.bg = 'najdi'; DECO.apply({ ...c, theme: t }); };
try { decoNow(); } catch (e) { }
F.getDoc(F.doc(F.db, 'site', 'content')).then(d => { if (!d.exists()) return; const x = d.data(); const D = x.json ? JSON.parse(x.json) : x.data; if (D) { DECO.save(D); decoNow(); } }).catch(() => { });
PERM.splash();
const { auth, db, MODULES } = F;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const root = $('#root');
const DEPTS = ['المساحة', 'المعماري', 'الإنشائي', 'الإشراف', 'السلامة / الدفاع المدني', 'الإلكتروميكانيك', 'المحاسبة', 'الإدارة'];
const IC = {
  finger: '<svg viewBox="0 0 24 24"><path d="M12 11v3a8 8 0 0 1-1.5 4.6M8 9.5a4 4 0 0 1 8 0V14a12 12 0 0 1-.7 4M5.5 8A7 7 0 0 1 18.4 7M4.2 13a7 7 0 0 0 .3-2M19.6 11v2.5"/></svg>',
  clip: '<svg viewBox="0 0 24 24"><path d="M9 4h6v3H9z"/><path d="M9 5H6v16h12V5h-3M9 12h6M9 16h4"/></svg>',
  compass: '<svg viewBox="0 0 24 24"><path d="M12 3v3M8.5 21 12 6l3.5 15M9.7 15.5h4.6"/><circle cx="12" cy="4.5" r="1.5"/></svg>',
  build: '<svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M9 11h.01M15 11h.01"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 6h6l2 2h10v11H3z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>',
  globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/></svg>',
  out: '<svg viewBox="0 0 24 24"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6z"/></svg>'
};
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 2600); }
let me = null, emp = null, isOwner = false, unsubs = [];
const clearSubs = () => { unsubs.forEach(u => { try { u(); } catch (e) { } }); unsubs = []; };
const mods = () => isOwner ? Object.keys(MODULES) : (emp && Array.isArray(emp.mods) ? emp.mods : (emp ? ['basma'] : []));
const can = m => mods().includes(m);

/* ---------- auth screens ---------- */
const shell = inner => `<div class="auth"><div class="auth-art"><img src="assets/img/mark.png" alt="" style="width:64px;margin-bottom:18px;filter:brightness(0) invert(1)"><h2>بوابة موظفي<br>شركة سعد الشمراني</h2><p>البصمة، تقارير الإشراف، الدعم الفني، ولوحة التحكم — في مكان واحد.</p></div><div class="auth-box"><div class="auth-in">${inner}</div></div></div>`;
const logo = `<div class="logo-anim"><img src="assets/img/mark.png" alt=""></div>`;
function viewLogin(msg) {
  root.innerHTML = shell(`${logo}<h1>تسجيل دخول الموظفين</h1><p class="sub">ادخل باسم المستخدم وكلمة السر</p>
    <form id="f"><div class="fld"><label>اسم المستخدم</label><input id="u" autocomplete="username" value="${esc(localStorage.getItem('sh-user') || '')}"></div>
    <div class="fld"><label>كلمة السر</label><input id="p" type="password" autocomplete="current-password"></div>
    <label class="switch" style="font-weight:600"><input type="checkbox" id="rm" checked> تذكّرني على الجهاز ده</label>
    <button class="btn btn-red" id="b">دخول</button><p class="err" id="er">${esc(msg || '')}</p></form>
    <p style="text-align:center">موظف جديد؟ <a class="link" href="#register" id="toReg">سجّل حسابك</a></p><a class="glass-back" href="index.html" style="margin:14px auto 0;display:flex;width:max-content">← رجوع للموقع</a>`);
  $('#toReg').onclick = e => { e.preventDefault(); viewRegister(); };
  $('#f').onsubmit = async e => {
    e.preventDefault(); const u = $('#u').value.trim(), p = $('#p').value, er = $('#er');
    if (!u || !p) return er.textContent = 'اكتب اسم المستخدم وكلمة السر';
    $('#b').disabled = true; $('#b').textContent = 'جارٍ الدخول…';
    try { await F.setPersistence(auth, $('#rm').checked ? F.indexedDBLocalPersistence : F.browserSessionPersistence); } catch (x) { }
    try { await F.signInWithEmailAndPassword(auth, u.includes('@') ? u : F.toEmail(u), p); try { localStorage.setItem('sh-user', u); localStorage.setItem('sh.staff', '1'); localStorage.setItem('sh.rem', $('#rm').checked ? '1' : '0'); } catch (x) { } }
    catch (x) { er.textContent = F.authMsg(x); $('#b').disabled = false; $('#b').textContent = 'دخول'; }
  };
}
function viewRegister() {
  root.innerHTML = shell(`${logo}<h1>تسجيل حساب موظف</h1><p class="sub">محتاج <b>كود الدعوة</b> من الإدارة. بعد التسجيل حسابك هيستنى موافقة المالك.</p>
    <form id="f"><div class="fld"><label>الاسم الكامل</label><input id="n" maxlength="60" autocomplete="name"></div>
    <div class="row2"><div class="fld"><label>اسم المستخدم</label><input id="u" maxlength="24" autocomplete="username"><span class="hint">حروف وأرقام بدون مسافات</span></div>
    <div class="fld"><label>القسم</label><select id="d"><option value="">اختر…</option>${DEPTS.map(d => `<option>${d}</option>`).join('')}</select></div></div>
    <div class="row2"><div class="fld"><label>كلمة السر</label><input id="p" type="password" autocomplete="new-password"></div><div class="fld"><label>تأكيد كلمة السر</label><input id="p2" type="password" autocomplete="new-password"></div></div>
    <div class="row2"><div class="fld"><label>رقم الجوال</label><input id="ph" dir="ltr" inputmode="tel" maxlength="15"></div><div class="fld"><label>كود الدعوة</label><input id="c" dir="ltr" autocomplete="off" style="text-transform:uppercase"></div></div>
    <button class="btn btn-red" id="b">إنشاء الحساب</button><p class="err" id="er"></p></form>
    <p style="text-align:center">عندك حساب؟ <a class="link" href="#" id="toLog">ادخل</a></p>`);
  $('#toLog').onclick = e => { e.preventDefault(); viewLogin(); };
  $('#f').onsubmit = async e => {
    e.preventDefault(); const er = $('#er'), n = $('#n').value.trim(), u = F.toEn($('#u').value.trim()), d = $('#d').value, p = $('#p').value, c = $('#c').value.trim().toUpperCase(), ph = F.toEn($('#ph').value).replace(/\D/g, '');
    if (n.length < 3) return er.textContent = 'اكتب اسمك الكامل';
    if (!F.USER_OK.test(F.normUser(u))) return er.textContent = 'اسم المستخدم من ٢ لـ ٢٤ حرف: حروف عربي أو إنجليزي وأرقام فقط';
    if (!d) return er.textContent = 'اختر القسم';
    if (p.length < 6) return er.textContent = 'كلمة السر ٦ حروف أو أرقام على الأقل';
    if (p !== $('#p2').value) return er.textContent = 'كلمتين السر مش زي بعض';
    if (!c) return er.textContent = 'اكتب كود الدعوة';
    $('#b').disabled = true; $('#b').textContent = 'جارٍ التسجيل…';
    let cred = null;
    try {
      cred = await F.createUserWithEmailAndPassword(auth, F.toEmail(u), p);
      await F.setDoc(F.doc(db, 'requests', cred.user.uid), { name: n, num: u, dept: d, phone: ph, code: c, at: F.serverTimestamp() });
      try { localStorage.setItem('sh-user', u); localStorage.setItem('sh.staff', '1'); } catch (x) { }
    } catch (x) {
      if (cred) { try { await cred.user.delete(); } catch (y) { } er.textContent = 'كود الدعوة غلط — اطلبه من الإدارة'; }
      else er.textContent = F.authMsg(x);
      $('#b').disabled = false; $('#b').textContent = 'إنشاء الحساب';
    }
  };
}
function viewPending(req) {
  root.innerHTML = shell(`<div class="pending"><div class="spinner"></div><h1>طلبك عند الإدارة</h1><p class="sub" style="margin:0">أهلاً ${esc(req && req.name || '')} 👋 — أول ما المالك يوافق على حسابك ويحدد صلاحياتك، الصفحة هتفتح لوحدها.</p>
    <span class="chip warn">في انتظار الموافقة</span><button class="btn btn-ghost" id="lo">تسجيل خروج</button></div>`);
  $('#lo').onclick = logout;
}
function viewBlocked() {
  root.innerHTML = shell(`<div class="pending">${logo}<h1>الحساب غير مفعّل</h1><p class="sub" style="margin:0">حسابك موقوف أو ملوش طلب تسجيل. كلّم الإدارة.</p><button class="btn btn-ghost" id="lo">تسجيل خروج</button></div>`);
  $('#lo').onclick = logout;
}

/* ---------- app ---------- */
function top() {
  const name = isOwner ? 'المالك' : (emp && emp.name) || '';
  return `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" data-brand="logo" alt="">بوابة الشمراني</a><div class="who"><span class="av">${esc(name.slice(0, 1))}</span><span>${esc(name)}</span><button class="btn btn-ghost sm" id="lo" title="خروج">${IC.out}</button></div></div></header>`;
}
let counts = { tickets: 0, chats: 0, reviews: 0 };
function viewHome() {
  if (!can('report') && can('reports') && !mods().includes('report')) { /* يشوف تقارير الكل */ }
  const h = new Date().getHours(), gr = h < 12 ? 'صباح الخير' : 'مساء الخير';
  const tiles = mods().map((k, i) => { const m = MODULES[k]; if (!m || m.tile === false || (k === 'report' && false)) return ''; const b = k === 'support' && (counts.tickets + counts.chats) ? `<span class="badge">${counts.tickets + counts.chats}</span>` : ''; return `<a class="tile t-${esc(m.ic)}" style="animation-delay:${i * 60}ms;--ti:${i}" href="${m.href}" data-k="${k}">${b}<span class="ic">${IC[m.ic]}</span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></a>`; }).join('');
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><p>${gr} 👋</p><h1>${esc(isOwner ? 'أهلاً بالمالك' : 'أهلاً ' + ((emp && emp.name) || '').split(' ')[0])}</h1></div><div style="display:flex;gap:8px"><a class="btn btn-ghost" href="#perms">🔐 الصلاحيات</a><a class="btn btn-ghost" href="index.html">${IC.globe} الموقع</a></div></div>
    <div class="tiles">${tiles || '<p class="empty">لسه مفيش أقسام متحددة لحسابك — كلّم الإدارة.</p>'}</div></main>`;
  $('#lo').onclick = logout;
  $$('.tile[data-k=support],.tile[data-k=reports]').forEach(t => t.onclick = e => { e.preventDefault(); location.hash = t.dataset.k; });
}

/* support inbox */
const STS = { new: ['جديد', 'red'], open: ['قيد المتابعة', 'warn'], wait: ['بانتظار العميل', ''], done: ['تم الحل', 'ok'] };
let tickets = [], tFilter = 'active';
function viewSupport() {
  if (!can('support')) return viewHome();
  const tabsHtml = supTabs('support');
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>الدعم والمحادثات</h1><p>كل الطلبات اللي جاية من الموقع والتطبيق</p></div></div>
    ${tabsHtml}<div class="toolbar"><div class="seg" id="seg"><button data-f="active" class="on">المفتوحة</button><button data-f="new">جديد</button><button data-f="done">تم الحل</button><button data-f="all">الكل</button></div><input id="q" placeholder="بحث بالاسم أو الجوال أو الرقم" style="flex:1;min-width:180px;padding:9px 12px;border-radius:12px;border:1.5px solid var(--line)"></div>
    <div class="list" id="tl"><p class="empty">جارٍ التحميل…</p></div></main>`;
  $('#lo').onclick = logout;
  $('#seg').onclick = e => { const b = e.target.closest('button'); if (!b) return; tFilter = b.dataset.f; $$('#seg button').forEach(x => x.classList.toggle('on', x === b)); paintTickets(); };
  $('#q').oninput = paintTickets;
  paintTickets();
}
function paintTickets() {
  const el = $('#tl'); if (!el) return; const q = ($('#q') || {}).value || '';
  const L = tickets.filter(t => (tFilter === 'all' || (tFilter === 'active' ? t.status !== 'done' : t.status === tFilter)) && (!q || (t.name + t.phone + t.code + t.msg).includes(q)));
  el.innerHTML = L.length ? L.map(t => `<div class="li ${!t.seen && t.status === 'new' ? 'unseen' : ''}" data-id="${esc(t.id)}"><div class="main"><b>${esc(t.name)} · <span style="display:inline;color:var(--red)">${esc(t.code)}</span></b><span>${esc(t.dept)} — ${esc(t.msg || '')}</span></div><span class="chip ${STS[t.status] ? STS[t.status][1] : ''}">${STS[t.status] ? STS[t.status][0] : t.status}</span></div>`).join('') : '<p class="empty">مفيش طلبات هنا 🎉</p>';
  $$('.li', el).forEach(li => li.onclick = () => openTicket(li.dataset.id));
}
function openTicket(id) {
  const t = tickets.find(x => x.id === id); if (!t) return;
  if (!t.seen) { t.seen = true; counts.tickets = tickets.filter(x => x.status === 'new' && !x.seen).length; const tb = document.querySelector('.seg a[href="#support"] .chip'); if (tb) { if (counts.tickets) tb.textContent = counts.tickets; else tb.remove(); } F.updateDoc(F.doc(db, 'tickets', t.id), { seen: true, seenBy: isOwner ? 'المالك' : ((emp && emp.name) || ''), seenAt: F.serverTimestamp() }).catch(() => { }); paintTickets(); }
  const sh = document.createElement('div'); sh.className = 'sheet';
  const wa = `https://wa.me/966${String(t.phone).replace(/^0/, '').replace(/^966/, '')}?text=${encodeURIComponent('السلام عليكم ' + t.name + '، بخصوص طلبك رقم ' + t.code + ' لدى شركة سعد الشمراني')}`;
  sh.innerHTML = `<div class="sheet-in"><div class="sheet-h"><h3>طلب ${esc(t.code)}</h3><button class="x">×</button></div>
    <div class="card" style="display:grid;gap:6px"><b>${esc(t.name)}</b><a href="tel:${esc(t.phone)}" dir="ltr" style="text-align:right">${esc(t.phone)}</a><span>${esc(t.dept)} · ${esc(t.ptype || '')} · ${esc(t.city || '')}</span><span style="color:var(--mut);font-size:13px">${t.at && t.at.toDate ? t.at.toDate().toLocaleString('ar-SA') : ''}</span>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><a class="btn btn-ok sm" target="_blank" rel="noopener" href="${wa}">${IC.wa} واتساب العميل</a><a class="btn btn-ghost sm" href="tel:${esc(t.phone)}">اتصال</a></div></div>
    <div class="thread"><div class="msg">${nl(t.msg)}${t.img ? `<a href="${t.img}" target="_blank"><img src="${t.img}" style="margin-top:8px;border-radius:10px;max-height:220px"></a>` : ''}</div>${(t.msgs || []).map(m => `<div class="msg ${m.staff ? 'staff' : ''}"><b>${esc(m.by || (m.staff ? 'الفريق' : 'العميل'))}</b><br>${nl(m.text)}<small>${m.at ? new Date(m.at).toLocaleString('ar-SA') : ''}</small></div>`).join('')}</div>
    <div class="fld"><label>الحالة</label><select id="st">${Object.keys(STS).map(k => `<option value="${k}" ${t.status === k ? 'selected' : ''}>${STS[k][0]}</option>`).join('')}</select></div>
    <div class="fld" style="margin-top:12px"><label>رد يظهر للعميل في «تتبع طلبك»</label><textarea id="rp" rows="3" maxlength="1500"></textarea></div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-red" id="sv">حفظ</button>${isOwner ? '<button class="btn btn-ghost" id="dl">حذف الطلب</button>' : ''}</div></div>`;
  document.body.appendChild(sh);
  const close = () => sh.remove(); sh.onclick = e => { if (e.target === sh) close(); }; $('.x', sh).onclick = close;
  $('#sv', sh).onclick = async () => {
    const st = $('#st', sh).value, rp = $('#rp', sh).value.trim(), upd = { status: st };
    if (rp) upd.msgs = F.arrayUnion({ text: rp, staff: true, by: isOwner ? 'الإدارة' : (emp.name || 'الفريق'), at: Date.now() });
    try { await F.updateDoc(F.doc(db, 'tickets', t.id), upd); toast('اتحفظ ✓'); close(); } catch (e) { toast(F.authMsg(e), 1); }
  };
  const dl = $('#dl', sh); if (dl) dl.onclick = async () => { if (!confirm('حذف الطلب نهائياً؟')) return; try { await F.deleteDoc(F.doc(db, 'tickets', t.id)); toast('اتحذف'); close(); } catch (e) { toast(F.authMsg(e), 1); } };
}

/* المحادثات المباشرة من الموقع */
let chats = [], openChat = null;
const supTabs = cur => `<div class="seg" style="margin-bottom:14px"><a href="#support" class="${cur === 'support' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">طلبات الخدمة ${counts.tickets ? `<span class="chip red">${counts.tickets}</span>` : ''}</a><a href="#chats" class="${cur === 'chats' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">المحادثات المباشرة ${counts.chats ? `<span class="chip red">${counts.chats}</span>` : ''}</a><a href="#botlogs" class="${cur === 'botlogs' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">أسئلة المساعد</a>${isOwner ? `<a href="#reviews" class="${cur === 'reviews' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">آراء العملاء ${counts.reviews ? `<span class="chip red">${counts.reviews}</span>` : ''}</a>` : ''}</div>${notifBtn()}`;
/* أسئلة الزوار للمساعد الآلي (من غير أسماء) */
async function viewBotlogs() {
  if (!can('support')) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>أسئلة المساعد</h1><p>اللي الزوار سألوه للمساعد الآلي — من غير أسماء. لو حد عايز يكلّم موظف بيظهر في «المحادثات المباشرة».</p></div></div>${supTabs('botlogs')}<div class="list" id="bl"><p class="empty">جارٍ التحميل…</p></div></main>`;
  $('#lo').onclick = logout;
  try {
    const s = await F.getDocs(F.query(F.collection(db, 'botlogs'), F.orderBy('upd', 'desc'), F.limit(120)));
    const DV = { iphone: '📱', android: '🤖', ipad: '📲', desktop: '💻' };
    $('#bl').innerHTML = s.size ? s.docs.map(d => { const x = d.data(); return `<details class="li" style="display:block"><summary style="cursor:pointer;display:flex;gap:10px;align-items:center"><span>${DV[x.dev] || '🌐'}</span><b style="flex:1">${esc(((x.qs || [])[0] || {}).q || '')}</b><span class="chip">${(x.qs || []).length} سؤال</span><small style="color:var(--mut)">${x.upd && x.upd.toDate ? x.upd.toDate().toLocaleString('ar-SA') : ''}</small></summary><div class="thread" style="margin-top:10px">${(x.qs || []).map(m => `<div class="msg"><b>الزائر</b><br>${esc(m.q)}</div><div class="msg staff"><b>المساعد</b><br>${esc(m.a)}</div>`).join('')}</div></details>`; }).join('') : '<p class="empty">لسه محدش سأل المساعد</p>';
  } catch (e) { $('#bl').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; }
}
/* آراء العملاء: بتتنشر بعد موافقة المالك */
let reviews = [];
const RST = { pending: ['قيد المراجعة', 'warn'], approved: ['منشور', 'ok'], rejected: ['مرفوض', 'red'], hidden: ['مخفي', ''] };
function viewReviews() {
  if (!isOwner) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>آراء العملاء</h1><p>كل رأي جديد بيستنى موافقتك قبل ما يظهر على الموقع. الرفض أو الحذف بيخليه ميظهرش خالص.</p></div></div>${supTabs('reviews')}
  <div class="seg" id="rvF" style="margin-bottom:12px">${[['pending', 'قيد المراجعة'], ['approved', 'المنشورة'], ['rejected', 'المرفوضة'], ['all', 'الكل']].map(([k, l], i) => `<a href="#" data-f="${k}" class="${i ? '' : 'on'}" style="padding:6px 12px;border-radius:999px;font-weight:700">${l}</a>`).join('')}</div><div class="list" id="rvl"><p class="empty">جارٍ التحميل…</p></div></main>`;
  $('#lo').onclick = logout;
  $('#rvF').onclick = e => { const a = e.target.closest('a[data-f]'); if (!a) return; e.preventDefault(); $$('#rvF a').forEach(x => x.classList.toggle('on', x === a)); paintReviews(); };
  paintReviews();
}
function paintReviews() {
  const el = $('#rvl'); if (!el) return; const f = ($('#rvF a.on') || {}).dataset ? $('#rvF a.on').dataset.f : 'pending';
  const L = reviews.filter(r => f === 'all' || (r.status || 'pending') === f);
  el.innerHTML = L.length ? L.map(r => { const st = RST[r.status] || RST.pending; return `<div class="li rv-li ${r.status === 'pending' ? 'unseen' : ''}" style="display:block"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b style="font-size:16px">${esc(r.name || '')}</b>${r.uid ? '<span class="chip ok">✓ عميل موثّق</span>' : ''}<span style="color:#f5a623;letter-spacing:2px">${'★'.repeat(r.stars || 0)}<span style="opacity:.25">${'★'.repeat(5 - (r.stars || 0))}</span></span><span class="chip ${st[1]}">${st[0]}</span><small style="color:var(--mut);margin-inline-start:auto">${r.at && r.at.toDate ? r.at.toDate().toLocaleString('ar-SA') : ''}</small></div>
    ${r.svc ? `<small style="color:var(--mut)">${esc(r.svc)}</small>` : ''}<p style="margin:8px 0;white-space:pre-wrap;line-height:1.8">${esc(r.text || '')}</p>${r.phone ? `<small dir="ltr" style="color:var(--mut)">${esc(r.phone)}</small>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${r.status !== 'approved' ? `<button class="btn btn-red sm" data-rv="approved" data-id="${r.id}" style="background:#1f9d55">✓ نشر</button>` : `<button class="btn btn-ghost sm" data-rv="hidden" data-id="${r.id}">🙈 إخفاء من الموقع</button>`}${r.status !== 'rejected' && r.status !== 'approved' ? `<button class="btn btn-ghost sm" data-rv="rejected" data-id="${r.id}">✕ رفض</button>` : ''}<button class="btn btn-ghost sm" data-rvdel="${r.id}" style="color:#c0262b">🗑 حذف</button></div></div>`; }).join('') : '<p class="empty">مفيش آراء هنا.</p>';
  $$('[data-rv]', el).forEach(b => b.onclick = async () => { b.disabled = true; try { await F.updateDoc(F.doc(db, 'reviews', b.dataset.id), { status: b.dataset.rv, by: me.uid, dec: F.serverTimestamp() }); toast(b.dataset.rv === 'approved' ? 'اتنشر على الموقع ✓' : 'اتحفظ ✓'); } catch (e) { toast(F.authMsg(e), 1); b.disabled = false; } });
  $$('[data-rvdel]', el).forEach(b => b.onclick = async () => { if (!confirm('حذف الرأي نهائياً؟')) return; try { await F.deleteDoc(F.doc(db, 'reviews', b.dataset.rvdel)); toast('اتحذف'); } catch (e) { toast(F.authMsg(e), 1); } });
}
/* التنبيهات: صوت + اهتزاز + رقم في عنوان الصفحة + إشعار المتصفح */
const baseTitle = document.title; let lastN = -1, blink = null;
function notifBtn() { return ('Notification' in window) && Notification.permission === 'default' ? `<button class="btn btn-ghost sm" id="nfOn" style="margin-bottom:12px">🔔 فعّل التنبيهات على الجهاز ده</button>` : ''; }
document.addEventListener('click', e => { if (e.target.id === 'nfOn') Notification.requestPermission().then(() => e.target.remove()); });
function snd(kind) { if (localStorage.getItem('sh.pmute') === '1') return; try { window._ac = window._ac || new (window.AudioContext || window.webkitAudioContext)(); const a = window._ac; if (a.state === 'suspended') a.resume(); const N = kind === 'send' ? [[660, 0, .07], [990, .06, .09]] : [[784, 0, .12], [1175, .12, .2]]; N.forEach(([f, t0, d]) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; const t = a.currentTime + t0; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'send' ? .12 : .22, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .02); }); } catch (e) { } }
function beep() { if (localStorage.getItem('sh.pmute') === '1') return; try { const a = new (window.AudioContext || window.webkitAudioContext)(); [[880, 0], [1320, .16]].forEach(([f, t]) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.0001, a.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, a.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t + .22); o.connect(g).connect(a.destination); o.start(a.currentTime + t); o.stop(a.currentTime + t + .25); }); } catch (e) { } }
function notify(what) {
  const n = tickets.filter(t => !t.seen && t.status === 'new').length + counts.chats;
  if (lastN >= 0 && n > lastN) {
    beep(); try { navigator.vibrate && navigator.vibrate([60, 40, 60]); } catch (e) { }
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) { try { new Notification('شركة سعد الشمراني', { body: what, icon: 'assets/img/icon-192.png', tag: 'sh-support' }); } catch (e) { } }
  }
  lastN = n; clearInterval(blink);
  if (n) { let on = false; document.title = `(${n}) ${baseTitle}`; blink = setInterval(() => { on = !on; document.title = on ? `🔴 ${n} جديد` : `(${n}) ${baseTitle}`; }, 1500); } else document.title = baseTitle;
}
function viewChats() {
  if (!can('support')) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>المحادثات المباشرة</h1><p>العملاء اللي طلبوا يكلّموا موظف من المساعد في الموقع</p></div></div>${supTabs('chats')}<div class="list" id="cl"></div></main>`;
  $('#lo').onclick = logout; paintChats();
}
function paintChats() {
  const el = $('#cl'); if (!el) return;
  el.innerHTML = chats.length ? chats.map(c => { const last = (c.msgs || []).slice(-1)[0] || {}; return `<div class="li ${c.unread ? 'unseen' : ''}" data-id="${esc(c.id)}"><div class="main"><b>${esc(c.name)}${c.phone ? ` · <span style="display:inline;color:var(--mut)" dir="ltr">${esc(c.phone)}</span>` : ''}${c.uid ? ' <span class="chip ok" style="display:inline-flex">عميل مسجّل</span>' : ''}</b><span>${last.from === 'c' ? '' : '↩ '}${esc((last.text || '').slice(0, 80))}</span></div>${c.unread ? `<span class="chip red">${c.unread}</span>` : '<span class="chip ok">مقروءة</span>'}</div>`; }).join('') : '<p class="empty">مفيش محادثات لسه</p>';
  $$('.li', el).forEach(li => li.onclick = () => openChatSheet(li.dataset.id));
  if (openChat) renderChatSheet();
}
function openChatSheet(id) {
  openChat = id; const sh = document.createElement('div'); sh.className = 'sheet wa-sheet'; sh.id = 'chatSheet'; document.body.appendChild(sh);
  sh.onclick = e => { if (e.target === sh) closeChat(); }; renderChatSheet();
  const c0 = chats.find(x => x.id === id); if (c0) c0.unread = 0; counts.chats = chats.filter(c => c.unread > 0).length; const cb = document.querySelector('.seg a[href="#chats"] .chip'); if (cb) { if (counts.chats) cb.textContent = counts.chats; else cb.remove(); } paintChats();
  F.updateDoc(F.doc(db, 'chats', id), { unread: 0 }).catch(() => { });
}
function closeChat() { openChat = null; const s = $('#chatSheet'); if (s) s.remove(); }
const QUICK = ['أهلاً بك 🌷 كيف أقدر أخدمك؟', 'ممكن رقم جوالك علشان نتواصل معاك؟', 'ممكن صورة الصك وموقع الأرض؟', 'تمام، هنرجعلك خلال ساعات الدوام.', 'تقدر تزورنا في المكتب: الرياض، حي العارض.', 'شكراً لتواصلك مع شركة سعد الشمراني 🌷'];
const tm = ms => new Date(ms).toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit' });
const dayL = ms => { const d = new Date(ms), n = new Date(); const k = x => x.toDateString(); if (k(d) === k(n)) return 'النهارده'; const y = new Date(n.getTime() - 864e5); if (k(d) === k(y)) return 'امبارح'; return d.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' }); };
function renderChatSheet() {
  const c = chats.find(x => x.id === openChat), sh = $('#chatSheet'); if (!c || !sh) return;
  const keep = sh.querySelector('textarea') ? sh.querySelector('textarea').value : '';
  const ph = String(c.phone || '').replace(/\D/g, ''); const waL = ph ? 'https://wa.me/966' + ph.replace(/^0/, '').replace(/^966/, '') : '';
  const last = (c.msgs || []).filter(m => m.from === 'c').slice(-1)[0]; const online = last && Date.now() - last.at < 5 * 60e3;
  let lastDay = '';
  const rows = (c.msgs || []).map(m => { if (m.sys) { const dl0 = dayL(m.at || Date.now()); const sep0 = dl0 !== lastDay ? `<div class="wa-day"><span>${dl0}</span></div>` : ''; lastDay = dl0; return sep0 + `<div class="wa-day"><span>💬 ${esc(m.text)} · ${m.at ? tm(m.at) : ''}</span></div>`; } const dl = dayL(m.at || Date.now()); const sep = dl !== lastDay ? `<div class="wa-day"><span>${dl}</span></div>` : ''; lastDay = dl;
    const mine = m.from !== 'c'; const seen = mine && (c.seenAt || 0) >= (m.at || 0);
    if (m.del) return sep + `<div class="wa-m ${mine ? 'out' : 'in'} wa-deleted"><i>🚫 تم حذف هذه الرسالة</i><span class="wa-meta">${m.at ? tm(m.at) : ''}</span></div>`;
    return sep + `<div class="wa-m ${mine ? 'out' : 'in'}" data-at="${m.at}" data-from="${m.from}"><button type="button" class="wa-mx" title="خيارات">⌄</button>${m.ed ? '<small class="wa-ed">معدّلة</small>' : ''}${mine ? `<b class="wa-by">${esc(m.by || 'الفريق')}</b>` : ''}${m.file ? (/^audio\//.test(m.file.type || '') ? voiceHTML(esc(m.file.id), m.file.dur, 'cm-voice wa-voice' + (mine && (c.heard || {})[m.file.id] ? ' heard' : '')) : /^image\//.test(m.file.type || '') ? `<img class="wa-img" data-mid="${esc(m.file.id)}" alt="">` : `<button type="button" class="wa-pdf" data-mid="${esc(m.file.id)}"><span>PDF</span><b>${esc(m.file.name || 'file.pdf')}</b></button>`) : ''}${m.text ? `<div class="wa-t">${nl(m.text)}</div>` : ''}<span class="wa-meta">${m.at ? tm(m.at) : ''}${mine ? `<i class="wa-tick ${seen ? 'seen' : ''}">✓✓</i>` : ''}</span></div>`; }).join('');
  sh.innerHTML = `<div class="wa-win"><header class="wa-h"><button class="x wa-back" aria-label="رجوع">→</button><span class="wa-av">${esc((c.name || '؟').trim().slice(0, 1))}</span><div class="wa-who"><b>${esc(c.name)}</b><small>${online ? '<i class="wa-on"></i> متصل الآن' : (last ? 'آخر رسالة ' + tm(last.at) : '')}${c.page ? ' · من صفحة ' + esc(c.page.replace(/^#\/?/, '') || 'الرئيسية') : ''}</small></div>
    <div class="wa-acts"><button type="button" class="wa-ic" id="waMute" title="الصوت">${localStorage.getItem('sh.pmute') === '1' ? '🔕' : '🔔'}</button>${ph ? `<a href="tel:${esc(c.phone)}" title="اتصال" class="wa-ic">📞</a><a href="${waL}" target="_blank" rel="noopener" title="واتساب" class="wa-ic wa-g">${IC.wa}</a>` : '<span class="chip" title="العميل مدخلش رقم">بدون رقم</span>'}</div></header>
    <div class="wa-info" id="waInfo"><button type="button" class="btn btn-ghost sm" id="waDelChat" style="color:#c0262b;grid-column:1/-1;justify-self:start">🗑 حذف المحادثة كلها</button>${[['الاسم', c.name], ['الجوال', c.phone ? `<a href="tel:${esc(c.phone)}" dir="ltr">${esc(c.phone)}</a>` : '—', 1], ['الحساب', c.uid ? 'عميل مسجّل على الموقع' : 'زائر'], ['الجهاز', ({ iphone: 'آيفون', android: 'أندرويد', ipad: 'آيباد', desktop: 'كمبيوتر' })[c.dev] || '—'], ['من صفحة', c.page ? c.page.replace(/^#\/?/, '') || 'الرئيسية' : 'الرئيسية'], ['بدأت', c.at && c.at.toDate ? c.at.toDate().toLocaleString('ar-SA') : '']].map(([k, v, raw]) => `<div><small>${k}</small><b>${raw ? v : esc(v || '—')}</b></div>`).join('')}<div id="waCust" style="display:contents"></div></div>
    ${c.botLog && c.botLog.length ? `<div class="wa-note">🤖 سأل المساعد قبل كده: ${esc(c.botLog.join(' · ').slice(0, 160))}</div>` : ''}
    <div class="wa-body" id="thr">${rows}</div>
    <div class="wa-quick">${QUICK.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form id="cf" class="wa-in"><label class="wa-att" title="إرفاق صورة أو PDF"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L15 7.5"/></svg><input type="file" accept="image/*,application/pdf" hidden id="waF"></label><span id="waMicH"></span><textarea rows="1" placeholder="اكتب رسالة…" title="Enter للإرسال، Shift+Enter لسطر جديد">${esc(keep)}</textarea><button class="wa-send" aria-label="إرسال"><svg viewBox="0 0 24 24"><path d="M3 20l18-8L3 4l3 8-3 8zm3-8h8"/></svg></button></form></div>`;
  $('.wa-back', sh).onclick = closeChat; const thr = $('#thr', sh); thr.scrollTop = 1e6;
  // تعديل/حذف الرسايل: المهندس يعدّل ويحذف رسايله، ويقدر يحذف رسايل العميل
  const editMsgs = async (fn) => { const ref = F.doc(db, 'chats', c.id); let mids = []; await F.runTransaction(db, async tx => { const d = await tx.get(ref); if (!d.exists()) return; const msgs = (d.data().msgs || []).map(m => { const r = fn(m); if (r && r.del && m.file) mids.push(m.file.id); return r || m; }); tx.update(ref, { msgs, upd: F.serverTimestamp() }); }); mids.forEach(id => F.deleteDoc(F.doc(db, 'chatmedia', id)).catch(() => { })); };
  $$('.wa-mx', sh).forEach(b => b.onclick = e => { e.stopPropagation(); const el = b.closest('.wa-m'), at = +el.dataset.at, from = el.dataset.from, mine = from !== 'c';
    $$('.wa-menu', sh).forEach(x => x.remove()); const mn = document.createElement('div'); mn.className = 'wa-menu';
    mn.innerHTML = (mine ? '<button data-a="ed">✏️ تعديل</button>' : '') + `<button data-a="del" class="red">🗑 حذف${mine ? '' : ' رسالة العميل'}</button>`; el.appendChild(mn);
    mn.onclick = async ev => { const a = ev.target.closest('button'); if (!a) return; mn.remove();
      const m0 = (c.msgs || []).find(m => m.at === at && m.from === from); if (!m0) return;
      try {
        if (a.dataset.a === 'ed') { const v = prompt('تعديل الرسالة:', m0.text || ''); if (v == null || !v.trim() || v === m0.text) return; await editMsgs(m => m.at === at && m.from === from ? { ...m, text: v.trim().slice(0, 1500), ed: Date.now() } : null); toast('اتعدّلت ✓'); }
        else { if (!confirm('تحذف الرسالة دي عند الكل؟')) return; await editMsgs(m => m.at === at && m.from === from ? { from: m.from, at: m.at, by: m.by || '', del: true, text: '' } : null); toast('اتحذفت'); }
      } catch (x) { toast(F.authMsg(x), 1); } };
    setTimeout(() => document.addEventListener('click', () => mn.remove(), { once: true }), 0); });
  const dc = $('#waDelChat', sh); if (dc) dc.onclick = async () => { if (!confirm(`حذف المحادثة كلها مع «${c.name}» نهائياً؟`)) return; try { await F.deleteDoc(F.doc(db, 'chats', c.id)); toast('اتحذفت المحادثة'); closeChat(); } catch (x) { toast(F.authMsg(x), 1); } };
  $('.wa-who', sh).onclick = () => $('#waInfo', sh).classList.toggle('on');
  const mu = $('#waMute', sh); if (mu) mu.onclick = () => { localStorage.setItem('sh.pmute', localStorage.getItem('sh.pmute') === '1' ? '0' : '1'); renderChatSheet(); };
  if (c.uid) F.getDoc(F.doc(db, 'customers', c.uid)).then(d => { if (!d.exists()) return; const x = d.data(); const w = $('#waCust', sh); if (w) w.innerHTML = [['الإيميل', x.email], ['المدينة', x.city], ['رقم الملف', x.clientNo != null ? `<a href="supervision.html#c/${esc(x.clientNo)}">${esc(x.clientNo)}</a>` : 'مش مربوط', 1]].filter(r => r[1]).map(([k, v, raw]) => `<div><small>${k}</small><b>${raw ? v : esc(v)}</b></div>`).join(''); }).catch(() => { });
  $$('.wa-img[data-mid]', sh).forEach(async im => { try { const d = await F.getDoc(F.doc(db, 'chatmedia', im.dataset.mid)); if (d.exists()) { im.src = d.data().data; im.onclick = () => window.open(URL.createObjectURL(dataBlob(im.src)), '_blank'); } } catch (e) { } });
  $$('.wa-pdf[data-mid]', sh).forEach(b => b.onclick = async () => { try { const d = await F.getDoc(F.doc(db, 'chatmedia', b.dataset.mid)); if (d.exists()) window.open(URL.createObjectURL(dataBlob(d.data().data)), '_blank'); } catch (e) { toast(F.authMsg(e), 1); } });
  $('#waF', sh).onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try {
      let data, type = f.type, name = f.name.slice(0, 80);
      if (/^image\//.test(f.type)) { data = await shrinkTo(f); type = 'image/jpeg'; } else if (/pdf/.test(f.type) || /\.pdf$/i.test(f.name)) { if (f.size > 700 * 1024) return toast('ملف الـ PDF لازم يكون أقل من ٧٠٠ كيلو', 1); data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); }); type = 'application/pdf'; } else return toast('صور أو PDF بس', 1);
      const ref = F.doc(F.collection(db, 'chatmedia')); await F.setDoc(ref, { chat: c.id, by: 's', name, type, data, at: Date.now() });
      await F.updateDoc(F.doc(db, 'chats', c.id), { msgs: F.arrayUnion({ from: 's', text: '', file: { id: ref.id, name, type }, by: isOwner ? 'الإدارة' : ((emp && emp.name) || 'الفريق').split(' ')[0], at: Date.now() }), upd: F.serverTimestamp(), unread: 0 }); snd('send');
    } catch (x) { toast(F.authMsg(x), 1); } };
  // الفويس نوت من الموظف
  { const vb = document.createElement('div'); vb.className = 'vn-bar'; vb.hidden = true; $('#cf', sh).before(vb);
    const mb = micButton({ bar: vb, toast: x => toast(x, 1), onSend: async (data, type, dur) => { try { const ref = F.doc(F.collection(db, 'chatmedia')); await F.setDoc(ref, { chat: c.id, by: 's', name: 'voice', type, data, at: Date.now() });
      await F.updateDoc(F.doc(db, 'chats', c.id), { msgs: F.arrayUnion({ from: 's', text: '', file: { id: ref.id, name: 'voice', type, dur: Math.round(dur) }, by: isOwner ? 'الإدارة' : ((emp && emp.name) || 'الفريق').split(' ')[0], at: Date.now() }), upd: F.serverTimestamp(), unread: 0 }); snd('send'); } catch (x) { toast(F.authMsg(x), 1); } } });
    $('#waMicH', sh).replaceWith(mb); }
  wireVoices(sh, async id => { try { const d = await F.getDoc(F.doc(db, 'chatmedia', id)); return d.exists() ? d.data().data : null; } catch (e) { return null; } }, id => { const m = (c.msgs || []).find(x => x.file && x.file.id === id); if (m && m.from === 'c' && !(c.heard || {})[id]) F.updateDoc(F.doc(db, 'chats', c.id), { ['heard.' + id]: Date.now() }).catch(() => { }); });
  // ربط حساب العميل بملف مشروعه من الشات
  if (c.uid) F.getDoc(F.doc(db, 'customers', c.uid)).then(d => { if (!d.exists() || d.data().clientNo != null) return; const w = $('#waInfo', sh); if (!w || $('#waLink', sh)) return;
    const bx = document.createElement('div'); bx.id = 'waLink'; bx.className = 'wa-link'; bx.innerHTML = `<small>🔗 ربط حساب عميل · كود <b dir="ltr">SH-${esc(c.uid.slice(0, 6).toUpperCase())}</b></small><div><input id="waLinkNo" inputmode="numeric" placeholder="رقم ملف العميل في الإشراف"><button type="button" class="btn btn-ink sm" id="waLinkGo">ربط</button></div>`; w.after(bx);
    $('#waLinkGo', sh).onclick = async () => { const no = F.toEn($('#waLinkNo', sh).value).replace(/\D/g, ''); if (!no) return toast('اكتب رقم الملف', 1);
      try { let cl = null; try { const q = await F.getDoc(F.doc(db, 'clients', no)); cl = q.exists() ? q.data() : null; } catch (e) { }
        if (!confirm(`تربط حساب «${c.name}» بملف ${no}${cl ? ' — ' + cl.name : ''}؟`)) return;
        await F.updateDoc(F.doc(db, 'customers', c.uid), { clientNo: +no, clientName: (cl && cl.name) || '', linkedBy: auth.currentUser.uid, linkedAt: F.serverTimestamp() });
        await F.updateDoc(F.doc(db, 'chats', c.id), { msgs: F.arrayUnion({ from: 's', text: `تم ربط حسابك بملف مشروعك رقم ${no} ✓ تقدر تتابعه من «مشروعي»`, by: 'الدعم الفني', at: Date.now() }), upd: F.serverTimestamp() });
        toast('اتربط ✓'); bx.remove(); } catch (x) { toast(F.authMsg(x), 1); } }; }).catch(() => { });
  const ta = $('textarea', sh); const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; }; ta.oninput = fit; fit();
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); $('#cf', sh).requestSubmit(); } };
  $$('[data-q]', sh).forEach(b => b.onclick = () => { ta.value = b.dataset.q; fit(); ta.focus(); });
  if (!matchMedia('(hover:none)').matches) ta.focus();
  $('#cf', sh).onsubmit = async e => { e.preventDefault(); const v = ta.value.trim(); if (!v) return; ta.value = ''; fit();
    try { await F.updateDoc(F.doc(db, 'chats', c.id), { msgs: F.arrayUnion({ from: 's', text: v, by: isOwner ? 'الإدارة' : ((emp && emp.name) || 'الفريق').split(' ')[0], at: Date.now() }), upd: F.serverTimestamp(), unread: 0 }); snd('send'); } catch (x) { toast(F.authMsg(x), 1); ta.value = v; } };
}

/* reports archive */
let reports = [];
function viewReports() {
  if (!can('reports') && !can('report')) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>أرشيف تقارير الإشراف</h1><p>${can('reports') ? 'كل التقارير المحفوظة' : 'تقاريرك المحفوظة'}</p></div>${can('report') ? '<a class="btn btn-red" href="report/">+ تقرير جديد</a>' : ''}</div>
    <div class="toolbar"><input id="q" placeholder="بحث باسم المشروع أو رقم الطلب أو المهندس" style="flex:1;padding:9px 12px;border-radius:12px;border:1.5px solid var(--line)"></div><div class="list" id="rl"><p class="empty">جارٍ التحميل…</p></div></main>`;
  $('#lo').onclick = logout;
  $('#q').oninput = paintReports; loadReports();
}
async function loadReports() {
  try {
    const qy = can('reports') ? F.query(F.collection(db, 'reports'), F.orderBy('at', 'desc'), F.limit(300)) : F.query(F.collection(db, 'reports'), F.where('by', '==', me.uid));
    const s = await F.getDocs(qy); reports = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0)); paintReports();
  } catch (e) { const el = $('#rl'); if (el) el.innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; }
}
const DEC = { approved: ['معتمد', 'ok'], conditional: ['معتمد بشروط', 'warn'], rejected: ['مرفوض', 'red'] };
function paintReports() {
  const el = $('#rl'); if (!el) return; const q = $('#q').value.trim();
  const L = reports.filter(r => !q || ((r.project || '') + (r.irNo || '') + (r.byName || '') + (r.type || '')).includes(q));
  el.innerHTML = L.length ? L.map(r => `<a class="li" href="report/?id=${encodeURIComponent(r.id)}"><div class="main"><b>${esc(r.project || 'بدون اسم')} <span style="display:inline;color:var(--mut);font-weight:600">· ${esc(r.irNo || '')}</span></b><span>${esc(r.type || '')} — ${esc(r.byName || '')} — ${r.at && r.at.toDate ? r.at.toDate().toLocaleDateString('ar-SA') : ''}</span></div>${r.decision && DEC[r.decision] ? `<span class="chip ${DEC[r.decision][1]}">${DEC[r.decision][0]}</span>` : ''}</a>`).join('') : '<p class="empty">مفيش تقارير لسه</p>';
}

/* ---------- routing ---------- */
function route() {
  if (!me) return;
  const h = location.hash.slice(1);
  if (h === 'support') return viewSupport();
  if (h === 'chats') return viewChats();
  if (h === 'botlogs') return viewBotlogs();
  if (h === 'reviews') return viewReviews();
  if (h === 'reports') return viewReports();
  if (h === 'perms') { root.innerHTML = top() + `<main class="shell"><a class="glass-back" href="#">← رجوع</a><div id="permBox" style="margin-top:14px"></div></main>`; $('#lo').onclick = logout; return PERM.statusPage($('#permBox')); }
  viewHome();
}
addEventListener('hashchange', () => { navDepth++; route(); });
// زرار الرجوع: خطوة واحدة لورا (مش للبوابة علطول)
let navDepth = 0;
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a.glass-back[href="#"]'); if (!a) return; e.preventDefault();
  if (navDepth > 0) { navDepth -= 2; history.back(); return; }
  const r = document.referrer; if (r && r.startsWith(location.origin) && !/portal\.html(#|$)/.test(r.replace(location.origin, ''))) { location.href = r; return; }
  location.hash = '';
});

F.onAuthStateChanged(auth, async u => {
  clearSubs(); me = u; emp = null; isOwner = false;
  if (!u) { if (location.hash === '#register') viewRegister(); else viewLogin(); return; }
  isOwner = await F.ownerOf(u.uid);
  try { localStorage.setItem('sh.staff', '1'); } catch (e) { }
  setTimeout(() => { PERM.onboard(); PERM.registerPush(); }, 1200);
  if (isOwner) { startLive(); return route(); }
  unsubs.push(F.onSnapshot(F.doc(db, 'employees', u.uid), async s => {
    if (s.exists()) {
      emp = { id: s.id, ...s.data() };
      if (emp.active === false) return viewBlocked();
      startLive(); route();
    } else {
      try { const r = await F.getDoc(F.doc(db, 'requests', u.uid)); if (r.exists()) viewPending(r.data()); else viewBlocked(); } catch (e) { viewBlocked(); }
    }
  }, () => viewBlocked()));
});
let live = false;
function startLive() {
  if (live) return; live = true;
  if (can('support')) unsubs.push(F.onSnapshot(F.query(F.collection(db, 'chats'), F.orderBy('upd', 'desc'), F.limit(200)), s => {
    const before = counts.chats; chats = s.docs.map(d => ({ id: d.id, ...d.data() })); counts.chats = chats.filter(c => c.unread > 0).length;
    if (counts.chats > before && document.hidden === false) { try { navigator.vibrate && navigator.vibrate(60); } catch (e) { } }
    if (openChat) { const oc = chats.find(x => x.id === openChat); const n = oc ? (oc.msgs || []).filter(m => m.from === 'c').length : 0; if (window._ocN != null && window._ocKey === openChat && n > window._ocN) snd('recv'); window._ocN = n; window._ocKey = openChat; }
    if (location.hash === '#chats') paintChats(); else if (openChat) renderChatSheet();
    notify('رسالة جديدة في المحادثات المباشرة');
    PERM.badge(counts.tickets + counts.chats); const b = $('.tile[data-k=support]'); if (b) { let bd = b.querySelector('.badge'); const n = counts.tickets + counts.chats; if (n) { if (!bd) { bd = document.createElement('span'); bd.className = 'badge'; b.prepend(bd); } bd.textContent = n; } else if (bd) bd.remove(); }
  }, () => { }));
  if (isOwner) unsubs.push(F.onSnapshot(F.query(F.collection(db, 'reviews'), F.orderBy('at', 'desc'), F.limit(300)), s => {
    const before = counts.reviews; reviews = s.docs.map(d => ({ id: d.id, ...d.data() })); counts.reviews = reviews.filter(r => (r.status || 'pending') === 'pending').length;
    if (before !== undefined && counts.reviews > before && lastN >= 0) { beep(); if ('Notification' in window && Notification.permission === 'granted' && document.hidden) { try { new Notification('رأي عميل جديد', { body: 'مستني موافقتك قبل النشر', icon: 'assets/img/icon-192.png', tag: 'sh-review' }); } catch (e) { } } }
    if (location.hash === '#reviews') paintReviews();
    const tb = document.querySelector('.seg a[href="#reviews"]'); if (tb) { let c = tb.querySelector('.chip'); if (counts.reviews) { if (!c) { c = document.createElement('span'); c.className = 'chip red'; tb.appendChild(c); } c.textContent = counts.reviews; } else if (c) c.remove(); }
    const b = $('.tile[data-k=support]'); if (b && counts.reviews) { let bd = b.querySelector('.badge'); if (!bd) { bd = document.createElement('span'); bd.className = 'badge'; b.prepend(bd); } bd.textContent = counts.tickets + counts.chats + counts.reviews; }
  }, () => { }));
  if (can('support')) unsubs.push(F.onSnapshot(F.query(F.collection(db, 'tickets'), F.orderBy('at', 'desc'), F.limit(300)), s => {
    tickets = s.docs.map(d => ({ id: d.id, ...d.data() })); counts.tickets = tickets.filter(t => t.status === 'new' && !t.seen).length; if (location.hash === '#support' || location.hash === '#chats' || location.hash === '#botlogs') { const tb = document.querySelector('.seg a[href="#support"] .chip'); if (tb) { if (counts.tickets) tb.textContent = counts.tickets; else tb.remove(); } }
    notify('طلب خدمة جديد من الموقع');
    if (location.hash === '#support') paintTickets(); else if (!location.hash || location.hash === '#') { const b = $('.tile[data-k=support]'); if (b) { let bd = b.querySelector('.badge'); if (counts.tickets) { if (!bd) { bd = document.createElement('span'); bd.className = 'badge'; b.prepend(bd); } bd.textContent = counts.tickets; } else if (bd) bd.remove(); } }
  }, () => { }));
}

function dataBlob(u) { const [h, b] = u.split(','); const bin = atob(b), a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: (h.match(/data:([^;]+)/) || [])[1] || 'application/octet-stream' }); }
function softResize(im, max) {
  let w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, src = im; const k = Math.min(1, max / Math.max(w, h)), tw = Math.round(w * k), th = Math.round(h * k);
  while (w / 2 >= tw * 1.15) { const c = document.createElement('canvas'); w = Math.round(w / 2); h = Math.round(h / 2); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h); src = c; }
  const c = document.createElement('canvas'); c.width = tw; c.height = th; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; try { x.filter = 'brightness(1.03) saturate(1.06) contrast(1.02) blur(0.25px)'; } catch (e) { } x.drawImage(src, 0, 0, tw, th); return c;
}
function shrinkTo(f) { return new Promise((res, rej) => { const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const c = softResize(im, 1280); URL.revokeObjectURL(u); let o = c.toDataURL('image/webp', .86); if (!o.startsWith('data:image/webp')) o = c.toDataURL('image/jpeg', .86); if (o.length > 900000) o = c.toDataURL('image/jpeg', .6); res(o); }; im.onerror = rej; im.src = u; }); }
