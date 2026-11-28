// لوحة التحكم v15: الخلفيات والحداد · هوية الشركة (بتأكيد باسورد المالك) · أسئلة المساعد · مركز الأرشفة · الإشعارات
import { BGS, bgCSS, bgURL, bgKey } from './deco.js';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* تأكيد هوية المالك (باسورد أو جوجل) — بيرجع true لو اتأكد */
export function reauth(c, title = 'تأكيد هوية المالك', note = '') {
  const F = c.F, u = F.auth.currentUser; if (!u) return Promise.resolve(false);
  if (!c.isOwner()) { c.toast('العملية دي للمالك بس', 1); return Promise.resolve(false); }
  const pw = (u.providerData || []).some(p => p.providerId === 'password');
  return new Promise(res => {
    const box = document.createElement('div'); box.className = 'modal-back';
    box.innerHTML = `<div class="card rs-card"><h3>🔒 ${c.esc(title)}</h3><p class="desc" style="margin:6px 0 12px">${c.esc(note || 'لازم تأكد إنك المالك قبل الحفظ.')}</p>${pw ? '<input type="password" id="raPw" placeholder="باسورد حساب المالك" autocomplete="current-password">' : '<p class="desc">هيفتح تسجيل دخول جوجل للتأكيد.</p>'}<p class="err" id="raErr" style="color:var(--red);min-height:18px"></p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost" id="raNo">إلغاء</button><button class="btn btn-red" id="raGo">تأكيد</button></div></div>`;
    document.body.appendChild(box); const done = v => { box.remove(); res(v); };
    $('#raNo', box).onclick = () => done(false); const pi = $('#raPw', box); if (pi) { pi.focus(); pi.onkeydown = e => { if (e.key === 'Enter') $('#raGo', box).click(); }; }
    $('#raGo', box).onclick = async () => { const b = $('#raGo', box), er = $('#raErr', box); er.textContent = ''; b.disabled = true;
      try { if (pw) { if (!pi.value) throw { code: 'empty' }; await F.reauthenticateWithCredential(u, F.EmailAuthProvider.credential(u.email, pi.value)); pi.value = ''; } else await F.reauthenticateWithPopup(u, new F.GoogleAuthProvider()); done(true); }
      catch (e) { b.disabled = false; er.textContent = e && e.code === 'empty' ? 'اكتب الباسورد' : (/wrong-password|invalid-credential|invalid-login/.test((e && e.code) || '') ? 'الباسورد غلط' : F.authMsg(e)); } };
  });
}

/* ---------- الخلفيات والحداد ---------- */
const OCCN = { national: 'اليوم الوطني', founding: 'يوم التأسيس', flag: 'يوم العلم', ramadan: 'رمضان', fitr: 'عيد الفطر', hajj: 'الحج ويوم عرفة', adha: 'عيد الأضحى', hijri: 'رأس السنة الهجرية' };
export function vLook(mp, c) {
  const D = c.D(); D.theme = D.theme || { bg: 'plain', auto: false }; D.mourn = D.mourn || { on: false, text: '', until: '' };
  const t = D.theme, m = D.mourn; t.bg = bgKey(t.bg || 'plain'); if (t.str == null) t.str = 60;
  const pv = () => { const b = $('#bgPv', mp); if (!b) return; b.setAttribute('style', bgCSS(t.bg, t.str) || ''); b.classList.toggle('none', !BGS[t.bg].img); $('#bgPvN', mp).textContent = BGS[t.bg].ar; };
  mp.innerHTML = `<h2>الخلفيات والحداد</h2><p class="desc">الخلفية بتظهر ورا صفحات الموقع والبوابة. اختار صورة، وظبط قوتها، واضغط «حفظ ونشر».</p>
  <div class="look-grid"><section class="card" style="display:grid;gap:14px">
    <div class="bg-grid">${Object.entries(BGS).map(([k, b]) => `<button type="button" class="bg-opt ${t.bg === k ? 'on' : ''}" data-bg="${k}"><span class="pv">${b.img ? `<img src="${bgURL(k, 't')}" alt="" loading="lazy">` : ''}</span><b>${b.ic} ${c.esc(b.ar)}</b></button>`).join('')}</div>
    <div class="fld"><label>قوة ظهور الصورة: <b id="stV">${t.str}%</b></label><input type="range" id="tStr" min="20" max="100" step="5" value="${t.str}"><small class="hint">قليل = الصفحة أهدى والكلام أوضح · كتير = الصورة أوضح</small></div>
    <label class="switch"><input type="checkbox" id="tAuto" ${t.auto ? 'checked' : ''}><span></span> تلقائي مع المناسبات — الخلفية بتتغير لوحدها في: ${Object.values(OCCN).join('، ')}، وبترجع للي اخترته بعدها</label>
  </section>
  <section class="card look-pv"><h3 style="font-size:16px;margin-bottom:10px">معاينة</h3><div class="bg-pv" id="bgPv"><div class="bg-pv-in"><span class="nav"><i></i><i></i><i></i><i></i></span><b>شركة هندسية سعودية، من فرع واحد إلى شبكة فروع</b><small>تأسست عام 2016 لتكون إحدى الشركات الرائدة في الاستشارات الهندسية.</small><span class="cards"><i></i><i></i><i></i></span></div></div><p class="desc" style="margin-top:8px">المختار: <b id="bgPvN"></b></p></section></div>
  <section class="card" style="display:grid;gap:14px;margin-top:14px;border:1.5px solid ${m.on ? '#111' : 'var(--line)'}"><h3 style="font-size:17px">🖤 وضع الحداد</h3>
    <p class="desc">الموقع والبوابة بيبقوا رمادي (بما فيهم الخلفية)، شريطة سودا في الركن، شريط تعزية فوق، والزينة والأصوات بتقف.</p>
    <label class="switch"><input type="checkbox" id="mOn" ${m.on ? 'checked' : ''}><span></span> تفعيل الحداد</label>
    <div class="fld"><label>نص التعزية (اختياري)</label><textarea id="mTx" rows="2" placeholder="إنا لله وإنا إليه راجعون — تتقدم شركة سعد الشمراني بخالص العزاء…">${c.esc(m.text || '')}</textarea></div>
    <div class="fld" style="max-width:280px"><label>ينتهي تلقائياً في (اختياري)</label><input type="datetime-local" id="mUn" value="${c.esc(m.until || '')}"></div></section>`;
  pv(); $('#bgPv', mp).classList.toggle('mourn-pv', !!m.on);
  $$('[data-bg]', mp).forEach(b => b.onclick = () => { t.bg = b.dataset.bg; c.dirty(); $$('[data-bg]', mp).forEach(x => x.classList.toggle('on', x === b)); pv(); });
  $('#tAuto').onchange = e => { t.auto = e.target.checked; c.dirty(); };
  $('#tStr').oninput = e => { t.str = +e.target.value; $('#stV').textContent = t.str + '%'; c.dirty(); pv(); };
  $('#mOn').onchange = e => { m.on = e.target.checked; c.dirty(); vLook(mp, c); };
  $('#mTx').oninput = e => { m.text = e.target.value.slice(0, 300); c.dirty(); };
  $('#mUn').onchange = e => { m.until = e.target.value; c.dirty(); };
}

/* ---------- هوية الشركة ---------- */
const smallLogo = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 320 / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); res(cv.toDataURL('image/png')); }; im.onerror = rej; im.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); });
// v16: ألوان الهوية من اللوجو — بنعدّ الألوان ونختار أقوى لون مشبّع (رئيسي)، ولون تاني مختلف، ولون داكن
const hex = (r, g, b) => '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
const rgbOf = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = h => { const [r, g, b] = rgbOf(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const darken = (h, f) => hex(...rgbOf(h).map(v => v * f));
const hsl = (r, g, b) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn; let hh = 0; if (d) { hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; } return [hh, d ? d / (1 - Math.abs(2 * l - 1)) : 0, l]; };
function logoColors(src) {
  return new Promise(res => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'), W = 96, H = Math.max(1, Math.round(96 * im.height / im.width)); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data, bins = {};
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 140) continue; const k = [d[i], d[i + 1], d[i + 2]].map(v => v >> 4).join(','); const b = bins[k] || (bins[k] = { n: 0, r: 0, g: 0, b: 0 }); b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; }
    const L = Object.values(bins).map(b => { const r = b.r / b.n, g = b.g / b.n, bb = b.b / b.n, [h, s2, l] = hsl(r, g, bb); return { n: b.n, c: hex(r, g, bb), h, s: s2, l }; }).filter(x => x.l > .08 && x.l < .93);
    const sat = L.filter(x => x.s > .35).sort((a, b) => b.n * b.s - a.n * a.s);
    let main = sat[0] ? sat[0].c : (L.sort((a, b) => b.n - a.n)[0] || { c: '#E1262B' }).c;
    const mid = L.filter(x => x.l > .18 && x.l < .8 && x.c !== main), hd = x => sat[0] ? Math.min(Math.abs(x.h - sat[0].h), 360 - Math.abs(x.h - sat[0].h)) : 180;
    const second = (mid.filter(x => x.s > .3 && hd(x) > 35).sort((a, b) => b.n - a.n)[0] || mid.filter(x => x.s <= .3).sort((a, b) => b.n - a.n)[0] || { c: '#C9A24B' }).c;
    const dark = (L.slice().sort((a, b) => a.l - b.l)[0] || { c: '#16171A' }).c;
    let fixed = main, k = 1; while (contrast(fixed, '#ffffff') < 3.2 && k > .4) { k -= .06; fixed = darken(main, k); }
    res({ red: fixed, gold: second, dark: contrast(dark, '#ffffff') > 7 ? dark : '#16171A', raw: main });
  }; im.onerror = () => res(null); im.src = src; });
}
export function vIdentity(mp, c) {
  const D = c.D(), B = D.brand; D.design = D.design || {}; const draft = { short: B.short || '', sub: B.sub || 'للاستشارات الهندسية', en: B.en || '', name: B.name || '', logo: B.logo || '' }; let pal = null, usePal = false; const DEFC = { red: '#E1262B', gold: '#C9A24B' };
  const paint = () => {
    mp.innerHTML = `<h2>هوية الشركة</h2><p class="desc">الاسم واللوجو بيتغيروا في كل حتة: الموقع، البوابة، البصمة، الإشراف، المساحة والمعماري (رأس التقارير)، والشات. الحفظ محتاج تأكيد باسورد المالك.</p>
    <div class="grid2"><section class="card" style="display:grid;gap:12px">
      <div class="fld"><label>الاسم بالعربي (السطر الأول)</label><input id="iA" value="${c.esc(draft.short)}"></div>
      <div class="fld"><label>السطر التاني</label><input id="iS" value="${c.esc(draft.sub)}"></div>
      <div class="fld"><label>الاسم بالإنجليزي</label><input id="iE" dir="ltr" value="${c.esc(draft.en)}"></div>
      <div class="fld"><label>الاسم الرسمي الكامل (للتقارير والفوتر)</label><input id="iN" value="${c.esc(draft.name)}"></div>
      <div class="fld"><label>اللوجو (PNG شفاف أفضل)</label><div style="display:flex;gap:10px;align-items:center"><span style="width:64px;height:64px;border:1px solid var(--line);border-radius:14px;display:grid;place-items:center;background:#fff">${draft.logo ? `<img src="${draft.logo}" style="max-width:56px;max-height:56px">` : '<img src="assets/img/mark.png" style="max-width:44px;opacity:.6">'}</span><label class="btn btn-ghost sm" style="cursor:pointer">رفع لوجو<input type="file" id="iL" accept="image/*" hidden></label>${draft.logo ? '<button class="btn btn-ghost sm" id="iLx" style="color:var(--red)">رجّع الأصلي</button>' : ''}</div></div>
      ${pal ? `<div class="pal"><b>🎨 ألوان من اللوجو الجديد</b><div class="sw">${[['red', 'اللون الرئيسي (الزراير والعناوين)'], ['gold', 'اللون التاني (لمسات)']].map(([k, l]) => `<label><input type="color" data-pc="${k}" value="${pal[k]}"><span>${l}</span></label>`).join('')}</div>
        <div class="pal-pv" style="--pr:${pal.red};--sc:${pal.gold}"><span class="b1">اطلب خدمة</span><span class="b2">تعرّف على خدماتنا</span><i></i></div>
        <label class="switch"><input type="radio" name="pk" value="1" ${usePal ? 'checked' : ''}><span></span> طبّق ألوان اللوجو على الموقع والبوابة والأقسام</label>
        <label class="switch"><input type="radio" name="pk" value="0" ${!usePal ? 'checked' : ''}><span></span> احتفظ بالألوان الحالية</label></div>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-red" id="iSave">🔒 تأكيد وحفظ الهوية</button><button class="btn btn-ghost" id="iRc" title="الأحمر والدهبي الأصليين">↺ رجّع الألوان الأصلية</button></div></section>
    <section class="card"><h3 style="font-size:16px;margin-bottom:10px">معاينة</h3><div class="id-pv"><img src="${draft.logo || 'assets/img/mark.png'}" alt=""><div><b>${c.esc(draft.short)}</b><small>${c.esc(draft.sub)}</small><i dir="ltr">${c.esc(draft.en)}</i></div></div>
      <p class="desc" style="margin-top:14px">⚠ أيقونة التطبيق على الشاشة الرئيسية وصورة المشاركة (واتساب/سوشيال) ثابتين في ملفات الموقع — بيتغيروا مع إصدار جديد. الورق الرسمي المطبوع (الخلفية الجاهزة في المعماري) صورة ثابتة برضه.</p></section></div>`;
    const rd = () => { draft.short = $('#iA').value.trim(); draft.sub = $('#iS').value.trim(); draft.en = $('#iE').value.trim(); draft.name = $('#iN').value.trim(); };
    ['iA', 'iS', 'iE', 'iN'].forEach(id => $('#' + id).oninput = rd);
    $('#iL').onchange = async e => { const f = e.target.files[0]; if (!f) return; rd(); draft.logo = await smallLogo(f); pal = await logoColors(draft.logo); usePal = !!pal; paint(); };
    $$('[data-pc]', mp).forEach(i => i.oninput = () => { pal[i.dataset.pc] = i.value; const pv = $('.pal-pv', mp); if (pv) { pv.style.setProperty('--pr', pal.red); pv.style.setProperty('--sc', pal.gold); } });
    $$('input[name=pk]', mp).forEach(i => i.onchange = () => { usePal = i.value === '1'; });
    $('#iRc').onclick = async () => { if (!confirm('ترجّع الأحمر والدهبي الأصليين للموقع كله؟')) return; if (!(await reauth(c, 'تأكيد تغيير ألوان الهوية'))) return; Object.assign(D.design, DEFC); c.brandOK(); c.dirty(); await c.save(); c.toast('رجعت الألوان الأصلية ✓'); };
    const lx = $('#iLx'); if (lx) lx.onclick = () => { rd(); draft.logo = ''; paint(); };
    $('#iSave').onclick = async () => { rd(); if (!draft.short) return c.toast('اكتب الاسم', 1); if (!(await reauth(c, 'تأكيد تغيير هوية الشركة', 'تغيير الاسم أو اللوجو بيظهر في كل التقارير والصفحات.'))) return;
      Object.assign(B, draft); if (pal && usePal) { D.design.red = pal.red; D.design.gold = pal.gold; } c.brandOK(); c.dirty(); await c.save(); pal = null; paint(); };
  };
  paint();
}

/* ---------- أسئلة وأجوبة المساعد ---------- */
export function vBotQA(mp, c) {
  const D = c.D(); D.botQA = Array.isArray(D.botQA) ? D.botQA : [];
  const L = D.botQA;
  const paint = () => {
    mp.innerHTML = `<h2>أسئلة المساعد</h2><p class="desc">المساعد الآلي (مجاني بالقواعد) بيدوّر هنا الأول. اكتب كلمات مفتاحية مفصولة بفاصلة — بيفهم الأخطاء الإملائية البسيطة والأرقام العربي والإنجليزي. لو مفهمش مرتين أو العميل طلب موظف/اشتكى، بيعرض تحويله للمهندس المختص.</p>
    <div id="qa" style="display:grid;gap:10px">${L.map((x, i) => `<section class="card" style="display:grid;gap:8px"><div class="fld"><label>الكلمات المفتاحية</label><input data-k="${i}" value="${c.esc(x.k || '')}" placeholder="سعر الكروكي، كم الكروكي، تكلفة الرفع"></div><div class="fld"><label>الرد</label><textarea data-a="${i}" rows="3">${c.esc(x.a || '')}</textarea></div><div class="row2"><div class="fld"><label>رابط زرار (اختياري)</label><input data-l="${i}" dir="ltr" value="${c.esc(x.link || '')}" placeholder="#/request"></div><div class="fld"><label>نص الزرار</label><input data-b="${i}" value="${c.esc(x.btn || '')}"></div></div><button class="btn btn-ghost sm" data-x="${i}" style="color:var(--red);justify-self:start">حذف</button></section>`).join('') || '<p class="empty">لسه مفيش أسئلة مضافة — المساعد شغال بالأسئلة الشائعة والخدمات.</p>'}</div>
    <button class="btn btn-ink" id="qaAdd" style="margin-top:12px">＋ سؤال جديد</button>
    <section class="card" style="margin-top:14px"><h3 style="font-size:16px">جرّب المساعد</h3><div class="row2"><input id="qaT" placeholder="اكتب سؤال زي العميل"><button class="btn btn-ghost" id="qaGo">جرّب</button></div><div id="qaR" class="desc" style="margin-top:10px"></div></section>`;
    $$('[data-k]', mp).forEach(e => e.oninput = () => { L[+e.dataset.k].k = e.value; c.dirty(); });
    $$('[data-a]', mp).forEach(e => e.oninput = () => { L[+e.dataset.a].a = e.value; c.dirty(); });
    $$('[data-l]', mp).forEach(e => e.oninput = () => { L[+e.dataset.l].link = e.value.trim(); c.dirty(); });
    $$('[data-b]', mp).forEach(e => e.oninput = () => { L[+e.dataset.b].btn = e.value; c.dirty(); });
    $$('[data-x]', mp).forEach(b => b.onclick = () => { if (!confirm('تحذف السؤال ده؟')) return; L.splice(+b.dataset.x, 1); c.dirty(); paint(); });
    $('#qaAdd').onclick = () => { L.push({ k: '', a: '', link: '', btn: '' }); c.dirty(); paint(); };
    $('#qaGo').onclick = async () => { const { makeBot } = await import('./bot.js'); const D2 = c.D(); const bot = makeBot({ V: () => D2, lang: () => 'ar', t: k => k, wa: () => '#', tel: '' }); try { const a = bot.answer($('#qaT').value); $('#qaR').innerHTML = (a.text || '') + (a.miss ? ' <b style="color:var(--red)">(مفهمش)</b>' : '') + (a.human ? ' <b>(هيعرض التحويل للمهندس)</b>' : ''); } catch (e) { $('#qaR').textContent = 'التجربة مش متاحة هنا — جرّب من الموقع'; } };
  };
  paint();
}

/* ---------- مركز الأرشفة ---------- */
// [المجموعة، حقل التاريخ، نوعه، المرفقات التابعة]
export const ARCH_DEPTS = { supervision: ['📋', 'الإشراف (التقارير والصور)', [['reports', 'at', 'ts', 'rmedia']]], survey: ['📐', 'المساحة', [['surveys', 'at', 'ts']]], arch: ['🏛', 'المعماري (المشاريع والمستندات والصور)', [['archProjects', 'at', 'ts'], ['archMedia', 'at', 'ts']]], basma: ['🖐', 'سجلات البصمة', [['days', 'day', 'day']]], chats: ['💬', 'مرفقات المحادثات القديمة', [['chatmedia', 'at', 'ms']]] };
const cutVal = (F, type, d) => type === 'ts' ? F.Timestamp.fromDate(d) : type === 'ms' ? d.getTime() : Math.floor((d.getTime() + 3 * 3600e3) / 864e5);
const SCHED = [['off', 'متوقف'], ['1', 'كل شهر'], ['3', 'كل ٣ شهور'], ['6', 'كل ٦ شهور'], ['12', 'كل سنة']];
export async function vArchive(mp, c) {
  const F = c.F, db = c.db; if (!c.isOwner()) { mp.innerHTML = '<h2>مركز الأرشفة</h2><p class="empty">للمالك بس.</p>'; return; }
  let A = {}; try { const s = await F.getDoc(F.doc(db, 'settingsPriv', 'archive')); A = s.exists() ? s.data() : {}; } catch (e) { }
  A = Object.assign({ sched: 'off', keep: 6, depts: Object.keys(ARCH_DEPTS), email: '', trialDone: false }, A);
  let logs = []; try { logs = (await F.getDocs(F.query(F.collection(db, 'archiveLog'), F.orderBy('at', 'desc'), F.limit(30)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { }
  const st = A.stats || {}, used = +st.driveUsed || 0, quota = +st.driveQuota || 15e9, fsMB = +st.fsMB || 0;
  const defBefore = new Date(Date.now() - (A.keep || 6) * 30 * 864e5).toISOString().slice(0, 10);
  const fmt = b => b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(1) + ' MB';
  const tsS = v => v && v.toDate ? v.toDate().toLocaleString('ar-SA') : (v ? new Date(v).toLocaleString('ar-SA') : '—');
  mp.innerHTML = `<h2>مركز الأرشفة</h2><p class="desc">بيـنقل (مش نسخ) كل ملفات الأقسام القديمة لجوجل درايف: <b>أرشيف الشمراني / السنة / الشهر / القسم</b> — PDF مبسّط للقراءة + JSON للاسترجاع بالظبط. بيانات العملاء والموظفين والإعدادات بتفضل على الموقع. أول تشغيل بيبقى <b>نسخ تجريبي بس</b> من غير مسح.</p>
  <div class="stats4"><div class="card"><b>${A.script ? '🟢' : '⚪'}</b><span>${A.script ? 'سكربت جوجل متوصّل · آخر ظهور ' + tsS(A.script.seen) : 'السكربت لسه متركّبش (الخطوات في ملف «الأرشفة والإشعارات»)'}</span></div><div class="card"><b>${fmt(used)}</b><span>مستخدم من درايف (${fmt(quota)})</span><i class="meter"><i style="width:${Math.min(100, used / quota * 100).toFixed(1)}%"></i></i></div><div class="card"><b>${fsMB ? fsMB.toFixed(0) + ' MB' : '—'}</b><span>حجم البيانات على الموقع (تقريبي)</span><i class="meter"><i style="width:${Math.min(100, fsMB / 1024 * 100).toFixed(1)}%"></i></i></div><div class="card"><b>${logs.length}</b><span>عمليات في السجل</span></div></div>
  <div class="grid2" style="margin-top:14px"><section class="card" style="display:grid;gap:12px"><h3 style="font-size:17px">الإعدادات</h3>
    <div class="fld"><label>الأقسام</label><div style="display:grid;gap:6px">${Object.entries(ARCH_DEPTS).map(([k, [ic, l]]) => `<label class="switch"><input type="checkbox" data-dp="${k}" ${A.depts.includes(k) ? 'checked' : ''}><span></span> ${ic} ${l}</label>`).join('')}</div></div>
    <div class="fld"><label>الأرشفة التلقائية</label><select id="aS">${SCHED.map(([k, l]) => `<option value="${k}" ${String(A.sched) === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="fld"><label>أرشف اللي أقدم من (شهور) في التلقائي</label><input id="aK" type="number" min="1" max="36" value="${A.keep}"></div>
    <div class="fld"><label>إيميل تقرير الأرشفة</label><input id="aE" dir="ltr" value="${c.esc(A.email || '')}" placeholder="owner@gmail.com"></div>
    <button class="btn btn-ink" id="aSave">حفظ الإعدادات</button></section>
  <section class="card" style="display:grid;gap:12px"><h3 style="font-size:17px">أرشفة مبكرة الآن</h3>
    <div class="fld"><label>أرشف كل اللي أقدم من تاريخ</label><input type="date" id="aB" value="${defBefore}"></div>
    <button class="btn btn-ghost" id="aPrev">🔍 معاينة العدد والحجم</button><div id="aPv" class="desc"></div>
    <label class="switch"><input type="checkbox" id="aDry" ${A.trialDone ? '' : 'checked disabled'}><span></span> نسخ تجريبي بس (من غير مسح من الموقع)${A.trialDone ? '' : ' — إجباري أول مرة'}</label>
    <button class="btn btn-red" id="aRun">🔒 أرشفة مبكرة الآن</button>${A.req && !A.req.done ? `<span class="chip warn">في طلب مستني السكربت من ${tsS(A.req.at)}</span>` : ''}</section></div>
  <section class="card" style="margin-top:14px"><h3 style="font-size:17px;margin-bottom:10px">سجل الأرشفة</h3>${logs.length ? `<div class="tbl-w"><table class="tbl"><tr><th>التاريخ</th><th>النوع</th><th>الأقسام</th><th>العدد</th><th>الحجم</th><th>المجلد</th><th></th></tr>${logs.map(l => `<tr><td>${tsS(l.at)}</td><td>${l.dry ? 'نسخ تجريبي' : l.kind === 'restore' ? 'استرجاع' : 'نقل'}</td><td>${(l.depts || []).map(d => (ARCH_DEPTS[d] || [d])[0]).join(' ')}</td><td>${l.count || 0}</td><td>${fmt(l.bytes || 0)}</td><td>${l.folder ? `<a href="${c.esc(l.folder)}" target="_blank" rel="noopener">فتح درايف</a>` : '—'}</td><td>${l.kind !== 'restore' && !l.dry && l.count ? `<button class="btn btn-ghost sm" data-rs="${c.esc(l.id)}">استرجاع</button>` : ''}${l.err ? `<small style="color:var(--red)">${c.esc(l.err)}</small>` : ''}</td></tr>`).join('')}</table></div>` : '<p class="empty">لسه مفيش عمليات.</p>'}</section>`;
  const rdDepts = () => $$('[data-dp]', mp).filter(e => e.checked).map(e => e.dataset.dp);
  $('#aSave').onclick = async () => { try { await F.setDoc(F.doc(db, 'settingsPriv', 'archive'), { sched: $('#aS').value, keep: Math.max(1, +$('#aK').value || 6), depts: rdDepts(), email: $('#aE').value.trim() }, { merge: true }); c.toast('اتحفظ ✓'); } catch (e) { c.toast(F.authMsg(e), 1); } };
  $('#aPrev').onclick = async () => { const before = new Date($('#aB').value + 'T00:00:00'), pv = $('#aPv'); if (isNaN(before)) return; pv.textContent = 'جارٍ العدّ…'; let n = 0, bytes = 0; const out = [];
    for (const d of rdDepts()) { let dn = 0; for (const [col, f, ty] of ARCH_DEPTS[d][2]) { try { const s = await F.getDocs(F.query(F.collection(db, col), F.where(f, '<', cutVal(F, ty, before)), F.limit(2000))); dn += s.size; s.docs.forEach(x => { bytes += JSON.stringify(x.data()).length; }); } catch (e) { } } n += dn; out.push(`${ARCH_DEPTS[d][0]} ${dn}`); }
    pv.innerHTML = `هيتأرشف تقريباً <b>${n}</b> عنصر (${fmt(bytes)}) — ${out.join(' · ')}`; };
  $('#aRun').onclick = async () => { const depts = rdDepts(); if (!depts.length) return c.toast('اختار قسم واحد على الأقل', 1); const dry = $('#aDry').checked; const before = $('#aB').value;
    if (!dry && !confirm(`هيتنقل كل اللي أقدم من ${before} لجوجل درايف ويتمسح من الموقع. متأكد؟`)) return;
    if (!(await reauth(c, 'تأكيد الأرشفة', dry ? 'نسخ تجريبي لجوجل درايف من غير مسح.' : 'النقل بيمسح الملفات من الموقع بعد ما تتحفظ في درايف.'))) return;
    try { await F.setDoc(F.doc(db, 'settingsPriv', 'archive'), { req: { at: Date.now(), by: c.me().uid, before, depts, dry, done: false } }, { merge: true }); c.toast('اتبعت الطلب ✓ — السكربت هينفّذه خلال دقايق ويبعت تقرير بالإيميل'); vArchive(mp, c); } catch (e) { c.toast(F.authMsg(e), 1); } };
  $$('[data-rs]', mp).forEach(b => b.onclick = async () => { if (!(await reauth(c, 'استرجاع من الأرشيف', 'هيرجّع الملفات دي من درايف للموقع زي ما كانت.'))) return; try { await F.setDoc(F.doc(db, 'settingsPriv', 'archive'), { restore: { at: Date.now(), log: b.dataset.rs, done: false } }, { merge: true }); c.toast('اتبعت طلب الاسترجاع ✓'); } catch (e) { c.toast(F.authMsg(e), 1); } });
}

/* ---------- الإشعارات ---------- */
export async function vPush(mp, c) {
  const F = c.F, db = c.db; let P = {}; try { const s = await F.getDoc(F.doc(db, 'site', 'push')); P = s.exists() ? s.data() : {}; } catch (e) { }
  let n = '—'; try { n = (await F.getDocs(F.collection(db, 'pushTokens'))).size; } catch (e) { }
  mp.innerHTML = `<h2>الإشعارات والصلاحيات</h2><p class="desc">الإشعارات وهو مقفول بتتبعت من سكربت جوجل (نفس سكربت الأرشفة) — من غير خطة Blaze. على الآيفون لازم iOS 16.4+ والتطبيق مضاف للشاشة الرئيسية.</p>
  <section class="card" style="display:grid;gap:12px"><div class="fld"><label>مفتاح Web Push (VAPID) — من Firebase ← Project settings ← Cloud Messaging ← Web Push certificates ← Key pair</label><input id="pV" dir="ltr" value="${c.esc(P.vapid || '')}" placeholder="BCx…"></div>
    <small class="hint">ده مفتاح «عام» ومش سري — مكانه الطبيعي في الموقع.</small>
    <div class="stats4"><div class="card"><b>${n}</b><span>جهاز مسجّل للإشعارات</span></div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-red" id="pSave">حفظ</button><a class="btn btn-ghost" href="portal.html#perms" target="_blank">🔐 صفحة الصلاحيات</a></div></section>`;
  $('#pSave').onclick = async () => { const v = $('#pV').value.trim(); if (v && !/^[A-Za-z0-9_-]{60,120}$/.test(v)) return c.toast('المفتاح شكله مش صح', 1); try { await F.setDoc(F.doc(db, 'site', 'push'), { vapid: v, at: F.serverTimestamp() }, { merge: true }); c.toast('اتحفظ ✓'); } catch (e) { c.toast(F.authMsg(e), 1); } };
}

export const VIEWS15 = { look: vLook, identity: vIdentity, botqa: vBotQA, archive: vArchive, push: vPush };
