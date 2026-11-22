// حساب العميل (جوجل أو إيميل) + «تابع مشروعك»: التقارير والمخططات والتعليقات — بيشوف آخر سنة بس
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
let FB = null; const fb = () => FB || (FB = import('./fb.js'));
const EN = () => document.documentElement.lang === 'en';
const T = (ar, en) => EN() ? en : ar;
const st = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
export const signedIn = () => !!st('sh.cust');
const YEAR = 365 * 864e5;

export const CATS = {
  supervision: ['📋', 'تقارير الإشراف', 'Supervision reports'],
  arch: ['🏛', 'المخططات المعمارية', 'Architectural drawings'],
  struct: ['🧱', 'المخططات الإنشائية', 'Structural drawings'],
  mep: ['⚡', 'الكهروميكانيك', 'MEP (electro-mechanical)'],
  survey: ['📐', 'المساحة', 'Surveying'],
  safety: ['🧯', 'السلامة والدفاع المدني', 'Safety & civil defence'],
  '3d': ['🧊', 'تصاميم 3D', '3D designs'],
  docs: ['📄', 'الرخص والمستندات', 'Permits & documents']
};

function toast(x) { const el = $('#toast'); if (!el) return; el.textContent = x; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2600); }
function errMsg(F, e) {
  const c = (e && e.code) || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-login')) return T('الإيميل أو كلمة السر غير صحيحة', 'Wrong email or password');
  if (c.includes('invalid-email')) return T('الإيميل مكتوب غلط', 'Invalid email');
  return F.authMsg(e);
}
const head = (ttl, lead) => `<section class="phead"><div class="wrap"><div class="crumbs"><a href="#/">${T('الرئيسية', 'Home')}</a><span>/</span><span>${esc(ttl)}</span></div><h1>${esc(ttl)}</h1><p class="lead">${esc(lead)}</p></div></section>`;
const G_IC = '<svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

/* ---------- الدخول والتسجيل ---------- */
let mode = 'in', gUser = null; // gUser = حساب جوجل لسه مش مسجل عندنا
export function pageAccount() {
  return head(T('حسابي', 'My account'), T('سجّل بحسابك علشان تتابع مشروعك: تقارير الإشراف والمخططات، وتكتب تعليقك للمهندس مباشرة.', 'Sign in to follow your project: supervision reports, drawings, and comments to your engineer.')) +
  `<section class="sec tight" style="padding-top:10px"><div class="wrap" style="max-width:520px"><div class="form-card glass acc" id="acc"></div></div></section>`;
}
function paintAcc() {
  const el = $('#acc'); if (!el) return;
  if (gUser) mode = 'up';
  el.innerHTML = (gUser ? `<div class="g-note">${G_IC} ${T('حساب جوجل ده مش مسجل عندنا لسه. كمّل البيانات دي مرة واحدة، وبعد كده تقدر تدخل بجوجل أو بالإيميل وكلمة السر.', 'This Google account is not registered yet. Complete these details once; then you can sign in with Google or email & password.')}<button type="button" class="link-btn" id="gCancel">${T('إلغاء', 'Cancel')}</button></div>` : '') + `<div class="seg acc-tabs"><button data-m="in" class="${mode === 'in' ? 'on' : ''}">${T('تسجيل الدخول', 'Sign in')}</button><button data-m="up" class="${mode === 'up' ? 'on' : ''}">${T('حساب جديد', 'Create account')}</button></div>
  <button class="btn g-btn" id="gIn" type="button">${G_IC} ${T('المتابعة بحساب جوجل', 'Continue with Google')}</button>
  <div class="or"><span>${T('أو بالإيميل', 'or with email')}</span></div>
  <form class="form" id="accF">
    ${mode === 'up' ? `<div class="fld"><label>${T('الاسم', 'Name')}</label><input id="aName" maxlength="60" autocomplete="name" required></div><div class="fld"><label>${T('رقم الجوال', 'Mobile')}</label><input id="aPhone" inputmode="tel" dir="ltr" maxlength="15" placeholder="05xxxxxxxx" autocomplete="tel"><span class="hint">${T('بيساعدنا نربط حسابك بمشروعك بسرعة', 'Helps us link your account to your project')}</span></div>` : ''}
    <div class="fld"><label>${T('الإيميل', 'Email')}</label><input id="aMail" type="email" dir="ltr" autocomplete="email" required value="${esc(gUser ? gUser.email : '')}" ${gUser ? 'readonly' : ''}></div>
    <div class="fld"><label>${T('كلمة السر', 'Password')}</label><input id="aPw" type="password" dir="ltr" minlength="6" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" required></div>
    ${mode === 'in' ? `<label class="remember"><input type="checkbox" id="aRem" ${st('sh.rem') === '0' ? '' : 'checked'}> ${T('تذكرني على الجهاز ده', 'Remember me on this device')}</label>` : ''}
    <button class="btn btn-red" id="aGo">${mode === 'up' ? T('إنشاء الحساب', 'Create account') : T('دخول', 'Sign in')}</button>
    ${mode === 'in' ? `<button type="button" class="link-btn" id="aForgot">${T('نسيت كلمة السر؟', 'Forgot password?')}</button>` : ''}
    <p class="err" id="aErr"></p>
  </form>
  <p class="acc-note">${T('🔒 بياناتك محفوظة ومش بتتشارك مع حد. المهندس هيربط حسابك بملف مشروعك بعد التسجيل.', '🔒 Your data is private. Our engineer will link your account to your project file after you sign up.')}</p>`;
  $$('[data-m]', el).forEach(b => b.onclick = () => { mode = b.dataset.m; paintAcc(); });
  $('#gIn').onclick = google; if (gUser) { $('#gIn').hidden = true; $('.or', el).hidden = true; $('.acc-tabs', el).hidden = true; const nm = $('#aName'); if (nm && !nm.value) nm.value = gUser.displayName || ''; }
  const gc = $('#gCancel'); if (gc) gc.onclick = async () => { const F = await fb(); gUser = null; mode = 'in'; await F.signOut(F.auth); paintAcc(); };
  $('#accF').onsubmit = submit;
  const fg = $('#aForgot'); if (fg) fg.onclick = forgot;
}
async function afterLogin(F, u, extra) {
  const ref = F.doc(F.db, 'customers', u.uid); let s = null; try { s = await F.getDoc(ref); } catch (e) { }
  const base = { email: u.email || '', name: (extra && extra.name) || u.displayName || '', upd: F.serverTimestamp() };
  if (!s || !s.exists()) await F.setDoc(ref, { ...base, phone: (extra && extra.phone) || '', clientNo: null, at: F.serverTimestamp(), via: (extra && extra.via) || 'email' });
  else await F.updateDoc(ref, { upd: F.serverTimestamp(), ...(extra && extra.phone ? { phone: extra.phone } : {}), ...(base.name && !s.data().name ? { name: base.name } : {}) });
  st('sh.cust', u.uid); st('sh.custName', base.name || ''); if (extra && extra.phone) st('sh.custPhone', extra.phone); gUser = null; location.hash = '#/my';
}
async function persist(F) { const rem = !$('#aRem') || $('#aRem').checked; st('sh.rem', rem ? '1' : '0'); try { await F.setPersistence(F.auth, rem ? F.indexedDBLocalPersistence : F.browserSessionPersistence); } catch (e) { } }
async function google() {
  const F = await fb(); const p = new F.GoogleAuthProvider(); $('#aErr').textContent = '';
  await persist(F);
  try { const r = await F.signInWithPopup(F.auth, p); await googleDone(F, r.user); }
  catch (e) {
    if ((e.code || '').includes('popup-blocked') || (e.code || '').includes('operation-not-supported')) { try { st('sh.gr', '1'); await F.signInWithRedirect(F.auth, p); return; } catch (x) { e = x; } }
    $('#aErr').textContent = errMsg(F, e);
  }
}
// جوجل: لو العميل مسجل يدخل، لو لأ يكمّل التسجيل الأول (الإيميل متملي)
async function googleDone(F, u) {
  let s = null; try { s = await F.getDoc(F.doc(F.db, 'customers', u.uid)); } catch (e) { }
  if (s && s.exists()) return afterLogin(F, u, { via: 'google' });
  gUser = u; mode = 'up'; paintAcc(); toast(T('كمّل بياناتك علشان نسجّل حسابك', 'Complete your details to register'));
}
async function submit(e) {
  e.preventDefault(); const F = await fb(); const er = $('#aErr'); er.textContent = '';
  const mail = $('#aMail').value.trim(), pw = $('#aPw').value, b = $('#aGo'); b.disabled = true;
  try {
    if (mode === 'up') {
      const name = $('#aName').value.trim(), phone = F.toEn($('#aPhone').value).replace(/\D/g, '');
      if (name.length < 2) throw { msg: T('اكتب اسمك', 'Enter your name') };
      if (pw.length < 6) throw { msg: T('كلمة السر لازم ٦ حروف أو أرقام على الأقل', 'Password must be at least 6 characters') };
      if (gUser) { // نربط كلمة السر بحساب جوجل علشان يقدر يدخل بالطريقتين
        try { await F.linkWithCredential(gUser, F.EmailAuthProvider.credential(gUser.email, pw)); } catch (x) { if (!String(x.code || '').includes('provider-already-linked')) throw x; }
        try { await F.updateProfile(gUser, { displayName: name }); } catch (x) { }
        return afterLogin(F, gUser, { name, phone, via: 'google' });
      }
      const r = await F.createUserWithEmailAndPassword(F.auth, mail, pw);
      try { await F.updateProfile(r.user, { displayName: name }); } catch (x) { }
      await afterLogin(F, r.user, { name, phone, via: 'email' });
    } else { await persist(F); const r = await F.signInWithEmailAndPassword(F.auth, mail, pw); await afterLogin(F, r.user); }
  } catch (x) { er.textContent = x.msg || errMsg(F, x); }
  b.disabled = false;
}
async function forgot() {
  const F = await fb(); const mail = $('#aMail').value.trim(); const er = $('#aErr');
  if (!/.+@.+\..+/.test(mail)) { er.textContent = T('اكتب إيميلك فوق الأول، وبعدين اضغط «نسيت كلمة السر»', 'Type your email above first'); $('#aMail').focus(); return; }
  try { F.auth.languageCode = EN() ? 'en' : 'ar'; await F.sendPasswordResetEmail(F.auth, mail); er.style.color = '#1f9d55'; er.textContent = T('بعتنالك إيميل فيه لينك تغيير كلمة السر ✓ (بص في الـ Spam لو ملقتهوش)', 'We sent you a reset link ✓ (check spam)'); }
  catch (x) { er.textContent = errMsg(F, x); }
}
export async function wireAccount() {
  paintAcc();
  const F = await fb();
  if (st('sh.gr')) { st('sh.gr', null); try { const r = await F.getRedirectResult(F.auth); if (r && r.user) return googleDone(F, r.user); } catch (e) { $('#aErr').textContent = errMsg(F, e); } }
  const un = F.onAuthStateChanged(F.auth, u => { un(); if (u && st('sh.cust') === u.uid) location.hash = '#/my'; });
}

/* ---------- تابع مشروعك ---------- */
export function pageMy() {
  return head(T('تابع مشروعك', 'Follow your project'), T('كل اللي يخص مشروعك في مكان واحد.', 'Everything about your project in one place.')) +
  `<section class="sec tight" style="padding-top:10px"><div class="wrap" id="my"><p class="empty">${T('جارٍ التحميل…', 'Loading…')}</p></div></section>`;
}
let ctx = null;
export async function wireMy() {
  const F = await fb(); const box = $('#my');
  const un = F.onAuthStateChanged(F.auth, async u => {
    un();
    if (!u) { st('sh.cust', null); location.hash = '#/account'; return; }
    let cu = null; try { const s = await F.getDoc(F.doc(F.db, 'customers', u.uid)); cu = s.exists() ? s.data() : null; } catch (e) { }
    if (!cu) { gUser = u; mode = 'up'; location.hash = '#/account'; return; }
    st('sh.custName', cu.name || ''); if (cu.phone) st('sh.custPhone', cu.phone);
    st('sh.cust', u.uid);
    const top = `<div class="my-top glass"><div><b>${esc((cu && cu.name) || u.displayName || u.email)}</b><small dir="ltr">${esc(u.email || '')}</small></div><button class="btn btn-ghost sm" id="myOut">${T('خروج', 'Sign out')}</button></div>`;
    if (!cu || cu.clientNo == null) {
      const code = u.uid.slice(0, 6).toUpperCase();
      box.innerHTML = top + `<div class="my-wait glass"><div class="ic">⏳</div><h3>${T('حسابك لسه مش مربوط بمشروع', 'Your account is not linked yet')}</h3><p>${T('المهندس المسؤول هيربط حسابك بملف مشروعك. لو عايز تسرّع، ابعتلنا رقم مشروعك أو اسم المالك مع الكود ده:', 'Our engineer will link your account to your project. To speed it up, send us your project number or owner name with this code:')}</p><div class="code">${code}</div><a class="btn btn-red" target="_blank" rel="noopener" href="https://wa.me/966570086833?text=${encodeURIComponent(T('السلام عليكم، سجلت حساب في الموقع وعايز أربطه بمشروعي. الكود: ', 'Hello, I created an account and want to link it to my project. Code: ') + code)}">${T('ابعت الكود واتساب', 'Send code on WhatsApp')}</a></div>`;
      $('#myOut').onclick = () => out(F); return;
    }
    ctx = { F, u, cu, no: cu.clientNo };
    box.innerHTML = top + `<div class="year-note">ⓘ ${T('البيانات متاحة هنا لمدة سنة واحدة فقط على الموقع والتطبيق، وتحتفظ الشركة بنسخة كاملة دائمة في أرشيفها.', 'Data is available here for one year only on the website and app; the company keeps a complete permanent copy in its archive.')}</div><div id="myBody"><p class="empty">${T('جارٍ التحميل…', 'Loading…')}</p></div>`;
    $('#myOut').onclick = () => out(F);
    loadMy();
  });
}
async function afterLoginQuiet(F, u) { await F.setDoc(F.doc(F.db, 'customers', u.uid), { email: u.email || '', name: u.displayName || '', phone: '', clientNo: null, at: F.serverTimestamp(), upd: F.serverTimestamp(), via: 'auto' }); }
async function out(F) { await F.signOut(F.auth); st('sh.cust', null); location.hash = '#/account'; }
let MY = { client: null, reports: [], files: [], comments: [] };
async function loadMy() {
  const { F, no } = ctx; const since = Date.now() - YEAR;
  const q = (c) => F.getDocs(F.query(F.collection(F.db, c), F.where('clientNo', '==', no))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))).catch(e => { console.warn(c, e); return []; });
  const ms = x => (x && x.toMillis ? x.toMillis() : (+x || 0));
  let client = null; try { const s = await F.getDoc(F.doc(F.db, 'clients', String(no))); client = s.exists() ? s.data() : null; } catch (e) { }
  const [reports, files, comments] = await Promise.all([q('reports'), q('cfiles'), q('ccomments')]);
  MY = { client, reports: reports.filter(r => ms(r.at) >= since || !r.at).sort((a, b) => ms(b.at) - ms(a.at)), files: files.filter(f => !f.hidden && ms(f.at) >= since).sort((a, b) => ms(b.at) - ms(a.at)), comments: comments.sort((a, b) => ms(a.at) - ms(b.at)) };
  paintMy();
}
const fmt = x => { const d = x && x.toDate ? x.toDate() : (x ? new Date(x) : null); return d ? d.toLocaleDateString(EN() ? 'en-GB' : 'ar-SA', { year: 'numeric', month: 'short', day: 'numeric' }) : ''; };
function thread(kind, id, title) {
  const L = MY.comments.filter(c => c.ref === kind + ':' + id);
  return `<details class="cm" data-ref="${kind}:${esc(id)}" data-title="${esc(title)}"><summary>💬 ${T('تعليقات', 'Comments')} ${L.length ? `<b>${L.length}</b>` : ''}${L.some(c => c.from === 's' && !c.seenC) ? `<i class="new">${T('رد جديد', 'new reply')}</i>` : ''}</summary>
    <div class="cm-list">${L.map(c => `<div class="cm-m ${c.from === 's' ? 'staff' : ''}"><b>${esc(c.from === 's' ? (c.byName || T('المهندس', 'Engineer')) : T('أنت', 'You'))}</b>${nl(c.text)}<small>${fmt(c.at)}</small></div>`).join('') || `<p class="empty" style="padding:8px">${T('اكتب ملاحظتك أو سؤالك والمهندس هيرد عليك هنا.', 'Write your note or question; the engineer will reply here.')}</p>`}</div>
    <form class="cm-f"><textarea rows="2" maxlength="1500" placeholder="${T('اكتب تعليقك…', 'Write a comment…')}"></textarea><button class="btn btn-red sm">${T('إرسال', 'Send')}</button></form></details>`;
}
function paintMy() {
  const el = $('#myBody'); if (!el) return; const { client, reports, files } = MY; const DEC = { approved: T('معتمد', 'Approved'), conditional: T('معتمد بشروط', 'Conditional'), rejected: T('مرفوض', 'Rejected') };
  const groups = {}; files.forEach(f => { (groups[f.cat] = groups[f.cat] || []).push(f); });
  const card = (k, inner, n) => { const c = CATS[k] || ['📁', k, k]; return `<section class="my-sec glass" id="cat-${k}"><h3><span class="ic">${c[0]}</span>${EN() ? c[2] : c[1]} <span class="chip">${n}</span></h3>${inner}</section>`; };
  const tabs = [['supervision', reports.length], ...Object.keys(CATS).filter(k => k !== 'supervision' && groups[k]).map(k => [k, groups[k].length]), ...Object.keys(groups).filter(k => !CATS[k]).map(k => [k, groups[k].length])];
  el.innerHTML = `<div class="my-hero"><div><small>${T('رقم ملفك', 'File no.')}</small><b>${esc(ctx.no)}</b></div><div><small>${T('المشروع', 'Project')}</small><b>${esc((client && client.name) || ctx.cu.name || '')}</b></div>${client && client.district ? `<div><small>${T('الحي', 'District')}</small><b>${esc(client.district)}</b></div>` : ''}${client && client.service ? `<div><small>${T('الخدمة', 'Service')}</small><b>${esc(client.service)}</b></div>` : ''}</div>
  <nav class="my-tabs">${tabs.map(([k, n]) => `<a href="#cat-${k}" data-jump="cat-${k}">${(CATS[k] || ['📁'])[0]} ${esc(EN() ? (CATS[k] || [0, 0, k])[2] : (CATS[k] || [0, k])[1])} <b>${n}</b></a>`).join('')}</nav>
  ${card('supervision', reports.length ? reports.map(r => `<div class="my-it"><div class="row"><a class="ttl" href="report/?id=${encodeURIComponent(r.id)}" target="_blank" rel="noopener">${T('تقرير', 'Report')} <b dir="ltr">${esc(r.irNo || '')}</b> — ${esc(r.type || T('زيارة إشراف', 'Site visit'))}</a>${r.decision && DEC[r.decision] ? `<span class="chip ${r.decision === 'approved' ? 'ok' : r.decision === 'rejected' ? 'red' : 'warn'}">${DEC[r.decision]}</span>` : ''}</div><small>${esc(r.date || fmt(r.at))} · ${esc(r.byName || '')}</small>${thread('report', r.id, (r.irNo || '') + ' ' + (r.type || ''))}</div>`).join('') : `<p class="empty">${T('لسه مفيش تقارير إشراف.', 'No supervision reports yet.')}</p>`, reports.length)}
  ${tabs.filter(([k]) => k !== 'supervision').map(([k]) => card(k, groups[k].map(f => `<div class="my-it"><div class="row"><a class="ttl" href="${esc(f.url)}" target="_blank" rel="noopener">${/drive\.google|docs\.google/.test(f.url) ? '🟢 ' : ''}${esc(f.title)}</a><a class="btn btn-ghost sm" href="${esc(f.url)}" target="_blank" rel="noopener">${T('فتح', 'Open')}</a></div>${f.note ? `<p>${nl(f.note)}</p>` : ''}<small>${fmt(f.at)}${f.byName ? ' · ' + esc(f.byName) : ''}</small>${thread('file', f.id, f.title)}</div>`).join(''), groups[k].length)).join('')}
  ${!files.length ? `<p class="empty glass" style="border-radius:18px;padding:22px">${T('المخططات والملفات هتظهر هنا أول ما المهندس يضيفها.', 'Drawings and files will appear here once added by your engineer.')}</p>` : ''}`;
  $$('[data-jump]', el).forEach(a => a.onclick = e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $$('details.cm', el).forEach(d => {
    d.addEventListener('toggle', () => { if (!d.open) return; const L = MY.comments.filter(c => c.ref === d.dataset.ref && c.from === 's' && !c.seenC); L.forEach(c => { c.seenC = true; ctx.F.updateDoc(ctx.F.doc(ctx.F.db, 'ccomments', c.id), { seenC: true }).catch(() => { }); }); const n = $('.new', d); if (n) n.remove(); });
    $('form', d).onsubmit = async e => {
      e.preventDefault(); const ta = $('textarea', d), v = ta.value.trim(); if (!v) return; const { F, u, cu, no } = ctx; ta.disabled = true;
      try {
        const doc = { clientNo: no, uid: u.uid, ref: d.dataset.ref, refTitle: d.dataset.title.slice(0, 120), from: 'c', text: v.slice(0, 1500), byName: (cu.name || u.displayName || '').slice(0, 60), at: F.serverTimestamp(), seen: false };
        const r = await F.addDoc(F.collection(F.db, 'ccomments'), doc); MY.comments.push({ id: r.id, ...doc, at: Date.now() }); ta.value = ''; toast(T('اتبعت ✓ المهندس هيرد عليك هنا', 'Sent ✓')); paintMy();
        const nd = $(`details.cm[data-ref="${CSS.escape(d.dataset.ref)}"]`); if (nd) nd.open = true;
      } catch (x) { toast(errMsg(F, x)); }
      ta.disabled = false;
    };
  });
}
