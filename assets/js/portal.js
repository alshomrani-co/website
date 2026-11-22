// بوابة الموظفين: دخول، تسجيل بكود دعوة، انتظار موافقة، الأقسام، الدعم الفني، أرشيف التقارير
import * as F from './fb.js';
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
    try { await F.signInWithEmailAndPassword(auth, u.includes('@') ? u : F.toEmail(u), p); try { localStorage.setItem('sh-user', u); localStorage.setItem('sh.staff', '1'); } catch (x) { } }
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
  $('#lo').onclick = () => F.signOut(auth);
}
function viewBlocked() {
  root.innerHTML = shell(`<div class="pending">${logo}<h1>الحساب غير مفعّل</h1><p class="sub" style="margin:0">حسابك موقوف أو ملوش طلب تسجيل. كلّم الإدارة.</p><button class="btn btn-ghost" id="lo">تسجيل خروج</button></div>`);
  $('#lo').onclick = () => F.signOut(auth);
}

/* ---------- app ---------- */
function top() {
  const name = isOwner ? 'المالك' : (emp && emp.name) || '';
  return `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" alt="">بوابة الشمراني</a><div class="who"><span class="av">${esc(name.slice(0, 1))}</span><span>${esc(name)}</span><button class="btn btn-ghost sm" id="lo" title="خروج">${IC.out}</button></div></div></header>`;
}
let counts = { tickets: 0, chats: 0 };
function viewHome() {
  if (!can('report') && can('reports') && !mods().includes('report')) { /* يشوف تقارير الكل */ }
  const h = new Date().getHours(), gr = h < 12 ? 'صباح الخير' : 'مساء الخير';
  const tiles = mods().map((k, i) => { const m = MODULES[k]; if (!m || m.tile === false || (k === 'report' && false)) return ''; const b = k === 'support' && (counts.tickets + counts.chats) ? `<span class="badge">${counts.tickets + counts.chats}</span>` : ''; return `<a class="tile" style="animation-delay:${i * 60}ms" href="${m.href}" data-k="${k}">${b}<span class="ic">${IC[m.ic]}</span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p></a>`; }).join('');
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><p>${gr} 👋</p><h1>${esc(isOwner ? 'أهلاً بالمالك' : 'أهلاً ' + ((emp && emp.name) || '').split(' ')[0])}</h1></div><a class="btn btn-ghost" href="index.html">${IC.globe} الموقع</a></div>
    <div class="tiles">${tiles || '<p class="empty">لسه مفيش أقسام متحددة لحسابك — كلّم الإدارة.</p>'}</div></main>`;
  $('#lo').onclick = () => F.signOut(auth);
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
  $('#lo').onclick = () => F.signOut(auth);
  $('#seg').onclick = e => { const b = e.target.closest('button'); if (!b) return; tFilter = b.dataset.f; $$('#seg button').forEach(x => x.classList.toggle('on', x === b)); paintTickets(); };
  $('#q').oninput = paintTickets;
  paintTickets();
}
function paintTickets() {
  const el = $('#tl'); if (!el) return; const q = ($('#q') || {}).value || '';
  const L = tickets.filter(t => (tFilter === 'all' || (tFilter === 'active' ? t.status !== 'done' : t.status === tFilter)) && (!q || (t.name + t.phone + t.code + t.msg).includes(q)));
  el.innerHTML = L.length ? L.map(t => `<div class="li" data-id="${esc(t.id)}"><div class="main"><b>${esc(t.name)} · <span style="display:inline;color:var(--red)">${esc(t.code)}</span></b><span>${esc(t.dept)} — ${esc(t.msg || '')}</span></div><span class="chip ${STS[t.status] ? STS[t.status][1] : ''}">${STS[t.status] ? STS[t.status][0] : t.status}</span></div>`).join('') : '<p class="empty">مفيش طلبات هنا 🎉</p>';
  $$('.li', el).forEach(li => li.onclick = () => openTicket(li.dataset.id));
}
function openTicket(id) {
  const t = tickets.find(x => x.id === id); if (!t) return;
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
const supTabs = cur => `<div class="seg" style="margin-bottom:14px"><a href="#support" class="${cur === 'support' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">طلبات الخدمة ${counts.tickets ? `<span class="chip red">${counts.tickets}</span>` : ''}</a><a href="#chats" class="${cur === 'chats' ? 'on' : ''}" style="padding:7px 14px;border-radius:999px;font-weight:700">المحادثات المباشرة ${counts.chats ? `<span class="chip red">${counts.chats}</span>` : ''}</a></div>`;
function viewChats() {
  if (!can('support')) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>المحادثات المباشرة</h1><p>العملاء اللي طلبوا يكلّموا موظف من المساعد في الموقع</p></div></div>${supTabs('chats')}<div class="list" id="cl"></div></main>`;
  $('#lo').onclick = () => F.signOut(auth); paintChats();
}
function paintChats() {
  const el = $('#cl'); if (!el) return;
  el.innerHTML = chats.length ? chats.map(c => { const last = (c.msgs || []).slice(-1)[0] || {}; return `<div class="li" data-id="${esc(c.id)}"><div class="main"><b>${esc(c.name)} · <span style="display:inline;color:var(--mut)" dir="ltr">${esc(c.phone)}</span></b><span>${last.from === 'c' ? '' : '↩ '}${esc((last.text || '').slice(0, 80))}</span></div>${c.unread ? `<span class="chip red">${c.unread}</span>` : '<span class="chip ok">مقروءة</span>'}</div>`; }).join('') : '<p class="empty">مفيش محادثات لسه</p>';
  $$('.li', el).forEach(li => li.onclick = () => openChatSheet(li.dataset.id));
  if (openChat) renderChatSheet();
}
function openChatSheet(id) {
  openChat = id; const sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'chatSheet'; document.body.appendChild(sh);
  sh.onclick = e => { if (e.target === sh) closeChat(); }; renderChatSheet();
  F.updateDoc(F.doc(db, 'chats', id), { unread: 0 }).catch(() => { });
}
function closeChat() { openChat = null; const s = $('#chatSheet'); if (s) s.remove(); }
function renderChatSheet() {
  const c = chats.find(x => x.id === openChat), sh = $('#chatSheet'); if (!c || !sh) return;
  const keep = sh.querySelector('textarea') ? sh.querySelector('textarea').value : '';
  const waL = 'https://wa.me/966' + String(c.phone).replace(/^0/, '').replace(/^966/, '');
  sh.innerHTML = `<div class="sheet-in"><div class="sheet-h"><h3>${esc(c.name)}</h3><button class="x">×</button></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><a class="btn btn-ghost sm" href="tel:${esc(c.phone)}" dir="ltr">${esc(c.phone)}</a><a class="btn btn-ok sm" target="_blank" rel="noopener" href="${waL}">${IC.wa} واتساب</a>${c.botLog && c.botLog.length ? `<span class="chip">سأل المساعد: ${esc(c.botLog.join(' · ').slice(0, 120))}</span>` : ''}</div>
    <div class="thread" id="thr">${(c.msgs || []).map(m => `<div class="msg ${m.from === 'c' ? '' : 'staff'}"><b>${esc(m.from === 'c' ? c.name : (m.by || 'الفريق'))}</b><br>${nl(m.text)}<small>${m.at ? new Date(m.at).toLocaleString('ar-SA') : ''}</small></div>`).join('')}</div>
    <form id="cf" style="display:flex;gap:8px;margin-top:12px"><textarea rows="2" style="flex:1;padding:10px;border-radius:12px;border:1.5px solid var(--line)" placeholder="اكتب ردك… بيوصل للعميل على الموقع فوراً">${esc(keep)}</textarea><button class="btn btn-red">إرسال</button></form></div>`;
  $('.x', sh).onclick = closeChat; const thr = $('#thr', sh); thr.scrollTop = 1e6;
  $('#cf', sh).onsubmit = async e => { e.preventDefault(); const ta = $('textarea', sh), v = ta.value.trim(); if (!v) return; ta.value = '';
    try { await F.updateDoc(F.doc(db, 'chats', c.id), { msgs: F.arrayUnion({ from: 's', text: v, by: isOwner ? 'الإدارة' : ((emp && emp.name) || 'الفريق').split(' ')[0], at: Date.now() }), upd: F.serverTimestamp(), unread: 0 }); } catch (x) { toast(F.authMsg(x), 1); ta.value = v; } };
}

/* reports archive */
let reports = [];
function viewReports() {
  if (!can('reports') && !can('report')) return viewHome();
  root.innerHTML = top() + `<main class="shell"><div class="hello"><div><a class="back glass-back" href="#">→ رجوع</a><h1>أرشيف تقارير الإشراف</h1><p>${can('reports') ? 'كل التقارير المحفوظة' : 'تقاريرك المحفوظة'}</p></div>${can('report') ? '<a class="btn btn-red" href="report/">+ تقرير جديد</a>' : ''}</div>
    <div class="toolbar"><input id="q" placeholder="بحث باسم المشروع أو رقم الطلب أو المهندس" style="flex:1;padding:9px 12px;border-radius:12px;border:1.5px solid var(--line)"></div><div class="list" id="rl"><p class="empty">جارٍ التحميل…</p></div></main>`;
  $('#lo').onclick = () => F.signOut(auth);
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
  if (h === 'reports') return viewReports();
  viewHome();
}
addEventListener('hashchange', route);

F.onAuthStateChanged(auth, async u => {
  clearSubs(); me = u; emp = null; isOwner = false;
  if (!u) { if (location.hash === '#register') viewRegister(); else viewLogin(); return; }
  isOwner = F.isOwnerUid(u.uid);
  try { localStorage.setItem('sh.staff', '1'); } catch (e) { }
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
    if (location.hash === '#chats') paintChats(); else if (openChat) renderChatSheet();
    const b = $('.tile[data-k=support]'); if (b) { let bd = b.querySelector('.badge'); const n = counts.tickets + counts.chats; if (n) { if (!bd) { bd = document.createElement('span'); bd.className = 'badge'; b.prepend(bd); } bd.textContent = n; } else if (bd) bd.remove(); }
  }, () => { }));
  if (can('support')) unsubs.push(F.onSnapshot(F.query(F.collection(db, 'tickets'), F.orderBy('at', 'desc'), F.limit(300)), s => {
    tickets = s.docs.map(d => ({ id: d.id, ...d.data() })); counts.tickets = tickets.filter(t => t.status === 'new').length;
    if (location.hash === '#support') paintTickets(); else if (!location.hash || location.hash === '#') { const b = $('.tile[data-k=support]'); if (b) { let bd = b.querySelector('.badge'); if (counts.tickets) { if (!bd) { bd = document.createElement('span'); bd.className = 'badge'; b.prepend(bd); } bd.textContent = counts.tickets; } else if (bd) bd.remove(); } }
  }, () => { }));
}
