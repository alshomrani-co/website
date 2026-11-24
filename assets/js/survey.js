// قسم المساحة: تقرير مساحي جديد (من الصك + الخريطة) ← مراجعة إجبارية ← PDF، وكل التقارير، وغرفة التحكم
import './click.js';
import * as F from './fb.js';
import { toUTM, fromUTM, areaUTM, sides, hijri, greg, mapImage } from './geo.js';
import { readDoc } from './docread.js';
const { auth, db } = F;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 3000); }
const N = s => F.toEn(String(s ?? '').normalize('NFKC')).replace(/[\u200e\u200f\u202a-\u202e]/g, '').replace(/\s+/g, ' ').trim();
const nk = s => N(s).replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
const num = v => { const x = parseFloat(F.toEn(String(v ?? '')).replace(/[^\d.\-]/g, '')); return isFinite(x) ? x : NaN; };
const f2 = v => isFinite(v) ? (+v).toFixed(2) : '';
const DIRS = { N: 'الشمال', S: 'الجنوب', E: 'الشرق', W: 'الغرب' };

let me = null, emp = null, isOwner = false, S = null; // S = إعدادات غرفة التحكم
const can = m => isOwner || (emp && emp.active !== false && Array.isArray(emp.mods) && emp.mods.includes(m));
const DEF_S = {
  hdr: { ar: 'شركة سعد مفرح مبارك الشمراني للإستشارات الهندسية', en: 'Saad AL SHomrani For Engineering Consultants', addr: 'حي العارض - الرياض - المملكة العربية السعودية', street: 'شارع ريحانه بنت زيد', lic: '5110104772', cr: '1010786222', email: 's3adalshomrani2022@gmail.com' },
  prefix: 'RYD-GN', next: 2160, pad: 7, mgr: 'م/ سعد مفرح الشمراني', mgrSig: '', stamp: '', logo: 'assets/img/mark.png',
  surveyors: [{ name: 'م/محمد جهاد محمود', phone: '0596884797', sig: '' }],
  sectors: ['قطاع جنوب مدينة الرياض', 'قطاع شمال مدينة الرياض', 'قطاع شرق مدينة الرياض', 'قطاع غرب مدينة الرياض', 'قطاع وسط مدينة الرياض'],
  dmap: { 'المناخ': 'قطاع جنوب مدينة الرياض' }, note: '',
  opts: { elev: true, nature: true, sat: true, sketch: true, tol: 0.5 }
};
async function loadS() { try { const s = await F.getDoc(F.doc(db, 'svSettings', 'main')); S = Object.assign(structuredClone(DEF_S), s.exists() ? s.data() : {}); S.hdr = Object.assign({}, DEF_S.hdr, S.hdr || {}); S.opts = Object.assign({}, DEF_S.opts, S.opts || {}); } catch (e) { S = structuredClone(DEF_S); toast('تعذّر تحميل إعدادات غرفة التحكم: ' + F.authMsg(e), 1); } return S; }
const noStr = n => `${S.prefix} : ${String(n || '').padStart(S.pad || 7, '0')}`;

const top = () => `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" alt="">قسم المساحة</a><div class="who"><span class="av">${esc(((isOwner ? 'المالك' : (emp && emp.name)) || '').slice(0, 1))}</span><button class="btn btn-ghost sm" id="lo">خروج</button></div></div></header>`;
const back = (href, label = 'رجوع') => `<a class="glass-back" href="${href}">→ ${label}</a>`;
function frame(html) { root.innerHTML = top() + `<main class="shell sv">${html}</main>`; $('#lo').onclick = () => F.signOut(auth); }

/* ---------- الرئيسية ---------- */
function vHome() {
  frame(`${back('portal.html', 'البوابة')}<h1 class="sv-h">قسم المساحة</h1><p class="desc">تقارير الرفع المساحي وكروكي القطعة — من الصك للـ PDF.</p>
  <div class="tiles">
    <a class="tile" href="#new"><span class="ic">＋</span><h3>تقرير مساحي جديد</h3><p>ارفع الصك وحدد الأركان على الخريطة</p></a>
    <a class="tile" href="#list"><span class="ic">▤</span><h3>كل التقارير</h3><p>بحث، طباعة، وتعديل</p></a>
    <a class="tile" href="#ctl"><span class="ic">⚙</span><h3>غرفة التحكم</h3><p>الترقيم، المساحين، التوقيع والختم، القطاعات</p></a>
  </div>`);
}

/* ---------- التقرير (إنشاء / تعديل) ---------- */
let R = null, map = null, layer = null, pts = []; // pts = [{lat,lng}]
const blank = () => ({ owner: '', plot: '', plan: '', deedNo: '', deedDate: '', district: '', city: 'الرياض', sector: '', deedArea: '', surveyor: 0, note: '', elev: Array(10).fill(''), dd: {}, dl: {}, nd: {}, st: {}, pts: [] });
async function vEdit(id, keep) {
  await loadS(); if (map) { try { map.remove(); } catch (e) { } map = null; }
  if (!keep) { R = blank(); pts = []; }
  if (id && !keep) { try { const s = await F.getDoc(F.doc(db, 'surveys', id)); if (!s.exists()) return toast('التقرير مش موجود', 1); R = Object.assign(blank(), s.data(), { id }); pts = (R.pts || []).map((p, i) => Object.assign({ lat: p.lat, lng: p.lng }, p.u ? { u: p.u } : {})); } catch (e) { return toast(F.authMsg(e), 1); } }
  const fld = (k, label, ph = '', wide) => `<div class="fld ${wide ? 'wide' : ''}"><label>${label}</label><input data-k="${k}" class="${R.st[k] ? 'st-' + R.st[k] : ''}" value="${esc(R[k] || '')}" placeholder="${esc(ph)}">${R.st[k] === 'check' ? '<small class="rv">⚠ راجعها</small>' : ''}</div>`;
  const secs = [...new Set([...(S.sectors || []), R.sector].filter(Boolean))];
  frame(`${back('#', 'قسم المساحة')}<h1 class="sv-h">${id ? 'تعديل تقرير ' + esc(noStr(R.no)) : 'تقرير مساحي جديد'}</h1>
  <section class="card sv-drop" id="drop"><div class="dz-ic">📄</div><b>اسحب الصك أو الرخصة هنا (PDF أو صورة)</b><small>الخانات اللي اتقرت بثقة بتظهر <span class="st-auto lg">خضرا</span>، واللي محتاجة مراجعة <span class="st-check lg">صفرا</span>.</small><input type="file" id="docIn" accept="application/pdf,image/*" hidden><button class="btn btn-ink sm" id="pick">اختار ملف</button><p id="dzMsg" class="hint"></p></section>
  <section class="card"><h3>بيانات القطعة والمالك</h3><div class="sv-grid">
    ${fld('owner', 'المالك / مقدم الطلب', '', 1)}${fld('plot', 'رقم القطعة')}${fld('plan', 'رقم المخطط')}${fld('deedNo', 'رقم الوثيقة / الصك')}${fld('deedDate', 'تاريخ الوثيقة', 'هجري أو ميلادي')}${fld('district', 'الحي')}${fld('city', 'المدينة')}${fld('deedArea', 'المساحة حسب الصك (م²)')}
    <div class="fld"><label>القطاع (سعادة رئيس…)</label><select data-k="sector" class="${R.st.sector ? 'st-' + R.st.sector : ''}"><option value="">— اختار —</option>${secs.map(s => `<option ${s === R.sector ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select><small class="hint" id="secHint"></small></div>
    <div class="fld"><label>المساح</label><select data-k="surveyor">${(S.surveyors || []).map((s, i) => `<option value="${i}" ${+R.surveyor === i ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
  </div></section>
  <section class="card"><h3>أركان القطعة على الخريطة</h3><p class="hint">اضغط على الخريطة عند كل ركن بالترتيب (مع عقارب الساعة أو عكسها). تقدر تسحب أي نقطة، أو تكتب الإحداثيات بإيدك في الجدول. UTM منطقة 38N.</p>
    <div class="sv-mapbar"><input id="q" class="in" placeholder="ابحث عن مكان أو الصق إحداثيات (24.6, 46.7)"><button class="btn btn-ghost sm" id="qb">بحث</button><button class="btn btn-ghost sm" id="undo">↶ تراجع</button><button class="btn btn-ghost sm" id="clr" style="color:var(--red)">مسح النقاط</button></div>
    <div id="map" class="sv-map"></div>
    <div class="sv-tw"><table class="sv-t" id="ptT"></table></div><button class="btn btn-ghost sm" id="addP">＋ إضافة ركن بالإحداثيات</button>
    <div class="sv-calc" id="calc"></div>
  </section>
  <section class="card"><h3>الحدود والأطوال</h3><div class="sv-tw"><table class="sv-t" id="bT"></table></div></section>
  ${S.opts.elev ? `<section class="card"><h3>مناسيب الأرض (اختياري)</h3><div class="sv-elev">${R.elev.map((e, i) => `<label>${i + 1}<input data-el="${i}" value="${esc(e)}" inputmode="decimal"></label>`).join('')}</div></section>` : ''}
  <section class="card"><div class="fld"><label>ملاحظة</label><textarea data-k="note" placeholder="${esc(S.note || '')}">${esc(R.note || '')}</textarea></div></section>
  <div class="sv-act"><button class="btn btn-red" id="rev">مراجعة البيانات ←</button></div>`);
  // الحقول
  $$('[data-k]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { const k = el.dataset.k; R[k] = k === 'surveyor' ? +el.value : el.value; if (R.st[k]) { delete R.st[k]; el.className = ''; const n = el.nextElementSibling; if (n && n.classList.contains('rv')) n.remove(); } if (k === 'district') autoSector(); }));
  $$('[data-el]').forEach(el => el.oninput = () => { R.elev[+el.dataset.el] = el.value; });
  // الملف
  const din = $('#docIn'); $('#pick').onclick = () => din.click(); din.onchange = () => din.files[0] && takeDoc(din.files[0]);
  const dz = $('#drop'); ['dragover', 'dragenter'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('ov'); })); ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, () => dz.classList.remove('ov'))); dz.addEventListener('drop', e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) takeDoc(f); });
  $('#addP').onclick = () => { const c = map ? map.getCenter() : (pts.length ? fromUTM(U()[pts.length - 1].e + 10, U()[pts.length - 1].n) : { lat: 24.7136, lng: 46.6753 }); pts.push({ lat: c.lat, lng: c.lng }); paintPts(); };
  initMap(); paintPts(); paintBounds(); autoSector(true);
  $('#rev').onclick = vReview;
}
function autoSector(quiet) {
  const d = nk(R.district || ''), h = $('#secHint'); if (!h) return; if (!d) { h.textContent = ''; return; }
  const hit = Object.entries(S.dmap || {}).find(([k]) => nk(k) === d || nk(k).replace(/^حي /, '') === d.replace(/^حي /, ''));
  if (hit && !R.sector) { R.sector = hit[1]; const s = $('select[data-k=sector]'); if (s) s.value = hit[1]; h.textContent = '✓ اتحدد من جدول الأحياء'; }
  else if (!hit) h.textContent = 'الحي مش في الجدول — اختار القطاع وهيتحفظ للمرة الجاية';
}
async function takeDoc(file) {
  const m = $('#dzMsg'); m.textContent = 'جارٍ القراءة…';
  try { const r = await readDoc(file, toast); Object.entries(r.v).forEach(([k, val]) => { if (k.startsWith('_') || k.startsWith('ds_')) return; if (k.startsWith('dd_')) R.dd[k.slice(3)] = val; else if (k.startsWith('dl_')) R.dl[k.slice(3)] = val; else R[k] = val; }); Object.assign(R.st, r.st);
    if (r.v._lat && !pts.length) R._center = [r.v._lat, r.v._lng];
    if (r.v.sector && !(S.sectors || []).includes(r.v.sector)) S.sectors = [...(S.sectors || []), r.v.sector];
    m.textContent = r.found ? `اتقرا ${r.found} خانة${r.ocr ? ' (بالـ OCR — راجعها كلها)' : ''}. راجع الصفرا قبل ما تكمّل.` : 'مقدرتش أقرا بيانات من الملف — اكتبها بإيدك.';
    const msg = m.textContent; await vEdit(R.id || null, true); $('#dzMsg').textContent = msg; } catch (e) { m.textContent = 'تعذّرت القراءة: ' + e.message; }
}
/* الخريطة */
function initMap() {
  if (!window.L) { $('#map').innerHTML = '<p class="empty">الخريطة محتاجة إنترنت</p>'; return; }
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 20, maxNativeZoom: 19, attribution: '© Esri, Maxar' });
  const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, maxNativeZoom: 19, attribution: '© OpenStreetMap' });
  map = L.map('map', { layers: [sat], zoomControl: true }).setView(pts[0] ? [pts[0].lat, pts[0].lng] : R._center || [24.7136, 46.6753], pts[0] || R._center ? 18 : 11);
  L.control.layers({ 'قمر صناعي': sat, 'شوارع': osm }).addTo(map); layer = L.layerGroup().addTo(map);
  if (pts.length > 1) map.fitBounds(pts.map(p => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 19 });
  map.on('click', e => { pts.push({ lat: e.latlng.lat, lng: e.latlng.lng }); paintPts(); });
  $('#undo').onclick = () => { pts.pop(); paintPts(); }; $('#clr').onclick = () => { if (confirm('تمسح كل النقاط؟')) { pts = []; paintPts(); } };
  const go = async () => { const q = F.toEn($('#q').value.trim()); const m = q.match(/(-?\d+\.\d+)\s*[, ]\s*(-?\d+\.\d+)/); if (m) { map.setView([+m[1], +m[2]], 18); return; }
    try { const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=sa&q=' + encodeURIComponent(q)).then(r => r.json()); if (r[0]) map.setView([+r[0].lat, +r[0].lon], 17); else toast('مش لاقي المكان', 1); } catch (e) { toast('البحث مش متاح', 1); } };
  $('#qb').onclick = go; $('#q').onkeydown = e => { if (e.key === 'Enter') go(); };
}
const U = () => pts.map(p => p.u ? { e: p.u.e, n: p.u.n } : toUTM(p.lat, p.lng)); // الإحداثيات المكتوبة باليد بتتحفظ زي ما هي بالظبط
function paintPts() {
  if (layer) { layer.clearLayers(); if (pts.length > 2) L.polygon(pts.map(p => [p.lat, p.lng]), { color: '#E1262B', weight: 2, fillOpacity: .18 }).addTo(layer); else if (pts.length === 2) L.polyline(pts.map(p => [p.lat, p.lng]), { color: '#E1262B' }).addTo(layer);
    pts.forEach((p, i) => { const mk = L.marker([p.lat, p.lng], { draggable: true, icon: L.divIcon({ className: 'sv-pin', html: `<b>${i + 1}</b>`, iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(layer); mk.on('dragend', e => { const l = e.target.getLatLng(); pts[i] = { lat: l.lat, lng: l.lng }; paintPts(); }); }); }
  const u = U(), t = $('#ptT'); if (t) { t.innerHTML = `<tr><th>P.NO</th><th>EASTING</th><th>NORTHING</th><th></th></tr>` + u.map((p, i) => `<tr><td>${i + 1}</td><td><input data-pe="${i}" value="${p.e.toFixed(4)}" dir="ltr" inputmode="decimal"></td><td><input data-pn="${i}" value="${p.n.toFixed(4)}" dir="ltr" inputmode="decimal"></td><td><button class="x" data-del="${i}" title="مسح">×</button></td></tr>`).join('');
    $$('[data-pe],[data-pn]', t).forEach(el => el.onchange = () => setTimeout(() => { const i = +(el.dataset.pe ?? el.dataset.pn), q = U()[i], e = num($(`[data-pe="${i}"]`, t).value), n = num($(`[data-pn="${i}"]`, t).value); if (!isFinite(e) || !isFinite(n)) return toast('رقم مش صحيح', 1); pts[i] = Object.assign(fromUTM(e, n), { u: { e, n } }); paintPts(); if (map && i === 0) map.setView([pts[0].lat, pts[0].lng], 18); }));
    $$('[data-del]', t).forEach(b => b.onclick = () => { pts.splice(+b.dataset.del, 1); paintPts(); }); }
  const c = $('#calc'); if (c) { const ar = u.length > 2 ? areaUTM(u) : 0, da = num(R.deedArea); c.innerHTML = u.length > 2 ? `<span>المساحة على الطبيعة: <b>${f2(ar)} م²</b></span>${isFinite(da) ? `<span>حسب الصك: <b>${f2(da)} م²</b></span><span class="${Math.abs(ar - da) / da > .01 ? 'bad' : 'ok'}">الفرق: ${f2(ar - da)} م² (${(Math.abs(ar - da) / da * 100).toFixed(2)}%)</span>` : ''}` : '<span>حدد 3 أركان على الأقل</span>'; }
  paintBounds();
}
function natSides() { const s = sides(U()), o = {}; s.forEach(x => { o[x.dir] = (o[x.dir] || 0) + x.len; }); return o; }
function paintBounds() {
  const t = $('#bT'); if (!t) return; const ns = natSides();
  t.innerHTML = `<tr><th>الاتجاه</th><th>حسب الصك</th><th>الطول (م)</th><th>حسب الطبيعة</th><th>الطول (م)</th></tr>` + Object.entries(DIRS).map(([k, l]) => `<tr><td><b>${l}</b></td><td><input data-dd="${k}" value="${esc(R.dd[k] || '')}" class="${R.st['dd_' + k] ? 'st-check' : ''}" placeholder="شارع عرض 20 م"></td><td><input data-dl="${k}" value="${esc(R.dl[k] || '')}" class="${R.st['dl_' + k] ? 'st-check' : ''}" dir="ltr" inputmode="decimal"></td><td><input data-nd="${k}" value="${esc(R.nd[k] ?? R.dd[k] ?? '')}" placeholder="نفس الصك لو مفيش اختلاف"></td><td class="nl" dir="ltr">${ns[k] ? f2(ns[k]) : '—'}</td></tr>`).join('');
  $$('[data-dd],[data-dl],[data-nd]', t).forEach(el => el.oninput = () => { const k = el.dataset.dd || el.dataset.dl || el.dataset.nd, w = el.dataset.dd ? 'dd' : el.dataset.dl ? 'dl' : 'nd'; R[w][k] = el.value; delete R.st[w + '_' + k]; el.classList.remove('st-check'); });
}

/* ---------- المراجعة الإجبارية ---------- */
function warnings() {
  const W = [], u = U(), tol = +S.opts.tol || .5;
  if (!R.owner) W.push(['bad', 'اسم المالك فاضي']); if (!R.plot) W.push(['bad', 'رقم القطعة فاضي']); if (!R.plan) W.push(['warn', 'رقم المخطط فاضي']); if (!R.district) W.push(['warn', 'الحي فاضي']); if (!R.sector) W.push(['bad', 'القطاع (سعادة رئيس…) مش محدد']);
  if (u.length < 3) W.push(['bad', 'لازم 3 أركان على الأقل']);
  const ar = u.length > 2 ? areaUTM(u) : 0, da = num(R.deedArea); if (u.length > 2 && isFinite(da) && Math.abs(ar - da) / da > .01) W.push(['warn', `المساحة على الطبيعة (${f2(ar)}) مختلفة عن الصك (${f2(da)}) بـ ${(Math.abs(ar - da) / da * 100).toFixed(2)}%`]);
  const ns = natSides(); Object.keys(DIRS).forEach(k => { const dl = num(R.dl[k]); if (isFinite(dl) && ns[k] && Math.abs(dl - ns[k]) > tol) W.push(['warn', `طول ${DIRS[k]}: الصك ${f2(dl)} م والطبيعة ${f2(ns[k])} م (فرق ${f2(ns[k] - dl)} م)`]); if (!R.dd[k]) W.push(['warn', `حد ${DIRS[k]} حسب الصك فاضي`]); });
  const yl = Object.keys(R.st).filter(k => R.st[k] === 'check'); if (yl.length) W.push(['warn', `فيه ${yl.length} خانة صفرا لسه ما اتراجعتش`]);
  return W;
}
function vReview() {
  const W = warnings(), u = U(), sv = (S.surveyors || [])[R.surveyor] || {}, bad = W.some(w => w[0] === 'bad');
  const row = (l, v) => `<tr><th>${l}</th><td>${esc(v || '—')}</td></tr>`;
  const ov = document.createElement('div'); ov.className = 'modal-back'; ov.innerHTML = `<div class="rs-card sv-rev"><h2>مراجعة قبل الحفظ والطباعة</h2>
    ${W.length ? `<ul class="sv-w">${W.map(([t, m]) => `<li class="${t}">${t === 'bad' ? '⛔' : '⚠'} ${esc(m)}</li>`).join('')}</ul>` : '<p class="sv-ok">✓ مفيش ملاحظات على البيانات</p>'}
    <table class="sv-rt">${row('المالك', R.owner)}${row('القطعة / المخطط', `${R.plot} / ${R.plan}`)}${row('الوثيقة', `${R.deedNo} — ${R.deedDate}`)}${row('الحي', R.district)}${row('القطاع', R.sector)}${row('المساح', sv.name)}${row('المساحة', u.length > 2 ? f2(areaUTM(u)) + ' م²' : '')}${row('عدد الأركان', u.length)}</table>
    <label class="sv-ack"><input type="checkbox" id="ack" ${bad ? 'disabled' : ''}> راجعت البيانات وأتحمل صحتها على مسؤوليتي</label>
    ${bad ? '<p class="hint" style="color:var(--red)">صلّح الأخطاء الحمرا الأول.</p>' : ''}
    <div class="sv-act"><button class="btn btn-ghost" id="rvX">رجوع للتعديل</button><button class="btn btn-red" id="rvOk" disabled>حفظ وطباعة PDF</button></div></div>`;
  document.body.appendChild(ov); $('#rvX', ov).onclick = () => ov.remove(); const ack = $('#ack', ov), ok = $('#rvOk', ov); ack.onchange = () => ok.disabled = !ack.checked;
  ok.onclick = async () => { ok.disabled = true; ok.textContent = 'جارٍ الحفظ…'; try { const id = await save(); ov.remove(); location.hash = 'p/' + id; } catch (e) { toast(F.authMsg(e), 1); ok.disabled = false; ok.textContent = 'حفظ وطباعة PDF'; } };
}
async function save() {
  const u = U(), ns = natSides(), data = { owner: R.owner, plot: R.plot, plan: R.plan, deedNo: R.deedNo, deedDate: R.deedDate, district: R.district, city: R.city, sector: R.sector, deedArea: R.deedArea, surveyor: +R.surveyor || 0, surveyorName: ((S.surveyors || [])[R.surveyor] || {}).name || '', note: R.note || '', elev: R.elev, dd: R.dd, dl: R.dl, nd: R.nd, st: {}, pts: pts.map(p => Object.assign({ lat: p.lat, lng: p.lng }, p.u ? { u: p.u } : {})), utm: u.map(p => ({ e: +p.e.toFixed(4), n: +p.n.toFixed(4) })), area: +areaUTM(u).toFixed(2), nl: ns, ack: { by: me.uid, name: isOwner ? 'المالك' : (emp && emp.name) || '', at: new Date().toISOString() }, upd: F.serverTimestamp() };
  // تذكّر الحي ← القطاع
  const dmapNew = R.district && R.sector && (S.dmap || {})[R.district] !== R.sector;
  if (R.id) { await F.updateDoc(F.doc(db, 'surveys', R.id), data); if (dmapNew) await F.setDoc(F.doc(db, 'svSettings', 'main'), { dmap: { [R.district]: R.sector }, sectors: S.sectors }, { merge: true }); return R.id; }
  const ref = F.doc(F.collection(db, 'surveys'));
  await F.runTransaction(db, async tx => { const sref = F.doc(db, 'svSettings', 'main'), s = await tx.get(sref), n = s.exists() && s.data().next ? s.data().next : S.next; const now = new Date();
    tx.set(sref, Object.assign({ next: n + 1 }, dmapNew ? { dmap: { [R.district]: R.sector }, sectors: S.sectors } : {}), { merge: true });
    tx.set(ref, Object.assign(data, { no: n, hDate: hijri(now), gDate: greg(now), by: me.uid, byName: data.ack.name, at: F.serverTimestamp() })); });
  return ref.id;
}

/* ---------- الطباعة (A4 بالعرض) ---------- */
async function vPrint(id) {
  await loadS(); let r; try { const s = await F.getDoc(F.doc(db, 'surveys', id)); if (!s.exists()) return toast('مش موجود', 1); r = s.data(); } catch (e) { return toast(F.authMsg(e), 1); }
  root.innerHTML = `<div class="sv-pbar">${back('#list', 'كل التقارير')}<span id="pst">جارٍ تجهيز الخرائط…</span><button class="btn btn-ghost sm" onclick="location.hash='e/${id}'">تعديل</button><button class="btn btn-red" id="prt" disabled>🖨 طباعة / حفظ PDF</button></div><div id="sheet"></div>`;
  const [sk, sat] = await Promise.all([S.opts.sketch ? mapImage(r.pts, { kind: 'map', w: 1100, h: 760, fill: 'rgba(255,255,255,0)', stroke: '#1d6b2a', dash: true, zoomOut: 1 }) : '', S.opts.sat ? mapImage(r.pts, { kind: 'sat', w: 1100, h: 700, fill: 'rgba(46,160,67,.45)', stroke: '#2ea043' }) : '']);
  const sv = (S.surveyors || [])[r.surveyor] || { name: r.surveyorName }, H = S.hdr, el = r.elev || [];
  const btab = (title, src, lenSrc) => `<table class="ps-t"><tr><th class="hd" style="width:16%">الاتجاه</th><th class="hd" colspan="4">${title}</th></tr>${Object.entries(DIRS).map(([k, l]) => `<tr><td>${l}</td><td class="dsc">${esc(src[k] ?? r.dd[k] ?? '')}</td><td class="bl">بطول</td><td class="ln">${f2(lenSrc[k] != null && lenSrc[k] !== '' ? num(lenSrc[k]) : NaN)}</td><td class="mt">متراً</td></tr>`).join('')}<tr><td>المساحة</td><td colspan="4" class="ar">${f2(title.includes('الصك') ? num(r.deedArea) : r.area)} m<sup>2</sup></td></tr></table>`;
  $('#sheet').innerHTML = `<div class="ps-page"><div class="ps-in">
   <div class="ps-r">
     <div class="ps-hd"><img src="${esc(S.logo || 'assets/img/mark.png')}" class="ps-logo" alt=""><div class="ps-co"><b>${esc(H.ar)}</b><span class="en">${esc(H.en)}</span><span>${esc(H.addr)}</span><span>${esc(H.street)}</span><span>الترخيص <b dir="ltr">${esc(H.lic)}</b> &nbsp; السجل التجاري <b dir="ltr">${esc(H.cr)}</b></span><span>البريد الالكتروني <b dir="ltr">${esc(H.email)}</b></span></div></div>
     <div class="ps-to"><b>سعادة رئيس ${esc(String(r.sector || '').replace(/^رئيس\s*/, ''))}</b><span>الحي / <b>${esc(r.district)}</b></span></div>
     <table class="ps-t ps-own"><tr><td class="lb">تقدم للمكتب</td><td colspan="3" class="v">${esc(r.owner)}</td><td class="lb">مالك القطعة رقم</td><td class="v">${esc(r.plot)}</td></tr><tr><td class="lb">مخطط رقم</td><td class="v">${esc(r.plan)}</td><td class="lb">بموجب الوثيقة رقم</td><td class="v" dir="ltr">${esc(r.deedNo)}</td><td class="lb">بتاريخ</td><td class="v" dir="ltr">${esc(r.deedDate)}</td></tr></table>
     <div class="ps-two">
       <div><h4>إحداثيات أركان العقار</h4><table class="ps-t ps-xy"><tr><th>P.NO</th><th>EASTING</th><th>NORTHING</th></tr>${(r.utm || []).map((p, i) => `<tr><td>${i + 1}</td><td class="red">${p.e.toFixed(4)}</td><td class="red">${p.n.toFixed(4)}</td></tr>`).join('')}${Array(Math.max(0, 5 - (r.utm || []).length)).fill(0).map((_, i) => `<tr><td>${(r.utm || []).length + i + 1}</td><td></td><td></td></tr>`).join('')}</table></div>
       ${S.opts.elev ? `<div><h4>مناسيب الأرض</h4><table class="ps-t ps-xy"><tr><th>P.NO</th><th>ELEVATION</th><th>P.NO</th><th>ELEVATION</th></tr>${[0, 1, 2, 3, 4].map(i => `<tr><td>${i + 1}</td><td>${esc(el[i] || '')}</td><td>${i + 6}</td><td>${esc(el[i + 5] || '')}</td></tr>`).join('')}</table></div>` : ''}
     </div>
     ${btab('الحدود والأطوال حسب الصك', r.dd || {}, r.dl || {})}
     ${S.opts.nature ? btab('الحدود والأطوال حسب الطبيعة', Object.fromEntries(Object.keys(DIRS).map(k => [k, (r.nd || {})[k] || (r.dd || {})[k] || ''])), r.nl || {}) : ''}
     <div class="ps-note"><b>ملاحظة :-</b> ${esc(r.note || S.note || '')}<i></i><i></i></div>
   </div>
   <div class="ps-l">
     ${sk ? `<h3>كروكي القطعة</h3><div class="ps-img"><img src="${sk}" alt=""></div>` : ''}
     ${sat ? `<h3>الموقع العام</h3><div class="ps-img"><img src="${sat}" alt=""></div>` : ''}
     <table class="ps-t ps-sig"><tr><th>المساح العام</th><th>التوقيع</th><th>رقم التواصل</th><th>مدير الشركة</th><th>التوقيع</th></tr><tr><td>${esc(sv.name || '')}</td><td>${sv.sig ? `<img src="${sv.sig}" alt="">` : ''}</td><td dir="ltr">${esc(sv.phone || '')}</td><td>${esc(S.mgr)}</td><td>${S.mgrSig ? `<img src="${S.mgrSig}" alt="">` : ''}</td></tr></table>
     <div class="ps-stamp"><span>الختـــم الرسمـــي</span>${S.stamp ? `<img src="${S.stamp}" alt="">` : ''}</div>
     <div class="ps-no"><span>الرقم: <b dir="ltr">${esc(noStr(r.no))}</b></span><span>وتاريخ <b dir="ltr">${esc(r.hDate || '')}</b></span><span>الموافق: <b dir="ltr">${esc(r.gDate || '')}</b></span></div>
   </div></div></div>`;
  document.title = `تقرير مساحي ${noStr(r.no)} — ${r.owner || ''}`;
  await Promise.all($$('#sheet img').map(i => i.decode ? i.decode().catch(() => { }) : 0));
  $('#pst').textContent = sk || sat ? 'جاهز ✓' : 'جاهز (الخرائط محتاجة إنترنت)'; const b = $('#prt'); b.disabled = false; b.onclick = () => window.print();
}

/* ---------- كل التقارير ---------- */
async function vList() {
  await loadS(); frame(`${back('#', 'قسم المساحة')}<h1 class="sv-h">كل التقارير</h1><div class="sv-mapbar"><input id="fq" class="in" placeholder="بحث بالرقم أو المالك أو القطعة أو الحي"><a class="btn btn-red sm" href="#new">＋ تقرير جديد</a></div><div id="lst"><div class="ld-box"><div class="spinner"></div><b>جاري تحميل التقارير…</b></div></div>`);
  let L = []; try { L = (await F.getDocs(F.query(F.collection(db, 'surveys'), F.orderBy('no', 'desc'), F.limit(500)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { $('#lst').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
  const paint = () => { const q = nk($('#fq').value); const X = L.filter(r => !q || nk([r.no, r.owner, r.plot, r.plan, r.district, r.deedNo, r.surveyorName].join(' ')).includes(q));
    $('#lst').innerHTML = X.length ? `<div class="sv-tw"><table class="sv-t sv-lt"><tr><th>الرقم</th><th>المالك</th><th>القطعة / المخطط</th><th>الحي</th><th>المساحة</th><th>التاريخ</th><th>المساح</th><th></th></tr>${X.map(r => `<tr><td dir="ltr"><b>${esc(noStr(r.no))}</b></td><td>${esc(r.owner)}</td><td>${esc(r.plot)} / ${esc(r.plan)}</td><td>${esc(r.district)}</td><td dir="ltr">${f2(r.area)}</td><td dir="ltr">${esc(r.hDate || '')}<br><small>${esc(r.gDate || '')}</small></td><td>${esc(r.surveyorName || '')}</td><td class="ac"><a class="btn btn-ghost sm" href="#p/${r.id}">PDF</a><a class="btn btn-ghost sm" href="#e/${r.id}">تعديل</a></td></tr>`).join('')}</table></div>` : '<p class="empty">مفيش تقارير</p>'; };
  $('#fq').oninput = paint; paint();
}

/* ---------- غرفة التحكم ---------- */
const imgToData = (file, max = 520) => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/png')); }; im.onerror = rej; im.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file); });
async function vCtl(keep) {
  if (!keep) await loadS(); const s = S;
  const inp = (k, l, v, ltr) => `<div class="fld"><label>${l}</label><input data-h="${k}" value="${esc(v)}" ${ltr ? 'dir="ltr"' : ''}></div>`;
  const imgBox = (k, l) => `<div class="sv-img"><b>${l}</b><div class="pv">${s[k] ? `<img src="${s[k]}" alt="">` : '<small>لسه ما اترفعش</small>'}</div><input type="file" accept="image/*" data-img="${k}" hidden><div style="display:flex;gap:6px"><button class="btn btn-ghost sm" data-up="${k}">رفع صورة</button>${s[k] ? `<button class="btn btn-ghost sm" data-rm="${k}" style="color:var(--red)">مسح</button>` : ''}</div><small class="hint">PNG بخلفية شفافة أفضل</small></div>`;
  frame(`${back('#', 'قسم المساحة')}<h1 class="sv-h">غرفة التحكم — المساحة</h1>
  <section class="card"><h3>الترقيم</h3><div class="sv-grid"><div class="fld"><label>البادئة</label><input id="pf" value="${esc(s.prefix)}" dir="ltr"></div><div class="fld"><label>الرقم الجاي</label><input id="nx" type="number" value="${esc(s.next)}" dir="ltr"></div><div class="fld"><label>عدد الخانات</label><input id="pd" type="number" value="${esc(s.pad)}" dir="ltr"></div><div class="fld"><label>شكل الرقم</label><input disabled value="${esc(noStr(s.next))}" dir="ltr"></div></div></section>
  <section class="card"><h3>رأس التقرير</h3><div class="sv-grid">${inp('ar', 'اسم الشركة', s.hdr.ar)}${inp('en', 'الاسم بالإنجليزي', s.hdr.en, 1)}${inp('addr', 'العنوان', s.hdr.addr)}${inp('street', 'الشارع', s.hdr.street)}${inp('lic', 'الترخيص', s.hdr.lic, 1)}${inp('cr', 'السجل التجاري', s.hdr.cr, 1)}${inp('email', 'البريد', s.hdr.email, 1)}<div class="fld"><label>اسم مدير الشركة</label><input id="mgr" value="${esc(s.mgr)}"></div></div></section>
  <section class="card"><h3>التوقيع والختم (ثابتين في كل تقرير)</h3><div class="sv-imgs">${imgBox('mgrSig', 'توقيع المدير')}${imgBox('stamp', 'الختم الرسمي')}</div></section>
  <section class="card"><h3>المساحين</h3><div id="svs"></div><button class="btn btn-ghost sm" id="addSv">＋ مساح جديد</button></section>
  <section class="card"><h3>القطاعات</h3><p class="hint">سطر لكل قطاع — بيظهر في «سعادة رئيس…».</p><textarea id="secs" rows="5" class="in">${esc((s.sectors || []).join('\n'))}</textarea></section>
  <section class="card"><h3>جدول الأحياء ← القطاع</h3><p class="hint">لما المهندس يختار قطاع لحي جديد بيتضاف هنا لوحده.</p><div id="dm"></div><button class="btn btn-ghost sm" id="addDm">＋ حي</button></section>
  <section class="card"><h3>خيارات التقرير</h3><div style="display:grid;gap:10px">
    <label class="switch"><input type="checkbox" data-o="elev" ${s.opts.elev ? 'checked' : ''}><span></span> جدول مناسيب الأرض</label>
    <label class="switch"><input type="checkbox" data-o="nature" ${s.opts.nature ? 'checked' : ''}><span></span> جدول الحدود حسب الطبيعة</label>
    <label class="switch"><input type="checkbox" data-o="sketch" ${s.opts.sketch ? 'checked' : ''}><span></span> كروكي القطعة (خريطة الشوارع)</label>
    <label class="switch"><input type="checkbox" data-o="sat" ${s.opts.sat ? 'checked' : ''}><span></span> الموقع العام (قمر صناعي)</label>
    <div class="fld" style="max-width:260px"><label>فرق الأطوال المسموح قبل التحذير (م)</label><input id="tol" type="number" step="0.05" value="${esc(s.opts.tol)}" dir="ltr"></div>
    <div class="fld"><label>ملاحظة افتراضية</label><input id="nt" value="${esc(s.note || '')}"></div></div></section>
  <div class="sv-act sticky"><button class="btn btn-red" id="sv">حفظ الإعدادات</button></div>`);
  const paintSv = () => { $('#svs').innerHTML = (s.surveyors || []).map((v, i) => `<div class="sv-row"><input class="in" data-sn="${i}" value="${esc(v.name)}" placeholder="الاسم"><input class="in" data-sp="${i}" value="${esc(v.phone)}" placeholder="الجوال" dir="ltr"><span class="sig">${v.sig ? `<img src="${v.sig}" alt="">` : '<small>بدون توقيع</small>'}</span><input type="file" accept="image/*" data-ss="${i}" hidden><button class="btn btn-ghost sm" data-su="${i}">توقيع</button><button class="btn btn-ghost sm" data-sd="${i}" style="color:var(--red)">×</button></div>`).join('') || '<p class="empty">مفيش مساحين</p>';
    $$('[data-sn]').forEach(e => e.oninput = () => s.surveyors[+e.dataset.sn].name = e.value); $$('[data-sp]').forEach(e => e.oninput = () => s.surveyors[+e.dataset.sp].phone = e.value);
    $$('[data-su]').forEach(b => b.onclick = () => $(`[data-ss="${b.dataset.su}"]`).click()); $$('[data-ss]').forEach(e => e.onchange = async () => { if (!e.files[0]) return; s.surveyors[+e.dataset.ss].sig = await imgToData(e.files[0], 420); paintSv(); });
    $$('[data-sd]').forEach(b => b.onclick = () => { if (confirm('تمسح المساح ده؟')) { s.surveyors.splice(+b.dataset.sd, 1); paintSv(); } }); };
  const paintDm = () => { $('#dm').innerHTML = Object.entries(s.dmap || {}).map(([d, q]) => `<div class="sv-row"><input class="in" data-dk value="${esc(d)}" placeholder="الحي"><select class="in" data-dv>${[...new Set([...(s.sectors || []), q])].map(x => `<option ${x === q ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select><button class="btn btn-ghost sm" data-dx style="color:var(--red)">×</button></div>`).join('') || '<p class="empty">الجدول فاضي</p>'; $$('[data-dx]').forEach(b => b.onclick = () => { b.parentElement.remove(); }); };
  const readDm = () => { const o = {}; $$('#dm .sv-row').forEach(r => { const k = $('[data-dk]', r).value.trim(); if (k) o[k] = $('[data-dv]', r).value; }); return o; };
  paintSv(); paintDm();
  $('#addSv').onclick = () => { s.surveyors = s.surveyors || []; s.surveyors.push({ name: '', phone: '', sig: '' }); paintSv(); };
  $('#addDm').onclick = () => { s.dmap = readDm(); s.dmap[''] = (s.sectors || [])[0] || ''; paintDm(); };
  $$('[data-up]').forEach(b => b.onclick = () => $(`[data-img="${b.dataset.up}"]`).click());
  $$('[data-img]').forEach(e => e.onchange = async () => { if (!e.files[0]) return; s[e.dataset.img] = await imgToData(e.files[0], e.dataset.img === 'stamp' ? 520 : 420); const y = scrollY; collect(); vCtl2(); scrollTo(0, y); });
  $$('[data-rm]').forEach(b => b.onclick = () => { s[b.dataset.rm] = ''; collect(); const y = scrollY; vCtl2(); scrollTo(0, y); });
  function collect() { s.prefix = $('#pf').value.trim(); s.next = Math.max(1, parseInt(F.toEn($('#nx').value)) || s.next); s.pad = Math.min(10, Math.max(1, parseInt($('#pd').value) || 7)); $$('[data-h]').forEach(e => s.hdr[e.dataset.h] = e.value); s.mgr = $('#mgr').value; s.sectors = $('#secs').value.split('\n').map(x => x.trim()).filter(Boolean); s.dmap = readDm(); $$('[data-o]').forEach(e => s.opts[e.dataset.o] = e.checked); s.opts.tol = num($('#tol').value) || .5; s.note = $('#nt').value; }
  const vCtl2 = () => vCtl(true);
  $('#sv').onclick = async () => { collect(); const b = $('#sv'); b.disabled = true; try { const o = JSON.parse(JSON.stringify(s)); delete o.dmap; await F.setDoc(F.doc(db, 'svSettings', 'main'), o, { merge: true }); await F.updateDoc(F.doc(db, 'svSettings', 'main'), { dmap: s.dmap }); toast('اتحفظ ✓'); } catch (e) { toast(F.authMsg(e), 1); } b.disabled = false; };
}

/* ---------- router ---------- */
function route() {
  if (!me) return; const h = location.hash.slice(1);
  if (h === 'new') return vEdit(null);
  if (h.startsWith('e/')) return vEdit(h.slice(2));
  if (h.startsWith('p/')) return vPrint(h.slice(2));
  if (h === 'list') return vList();
  if (h === 'ctl') return vCtl();
  vHome();
}
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
F.onAuthStateChanged(auth, async u => {
  if (!u) { location.replace('portal.html'); return; }
  me = u; isOwner = await F.ownerOf(u.uid);
  if (!isOwner) { try { const s = await F.getDoc(F.doc(db, 'employees', u.uid)); emp = s.exists() ? s.data() : null; } catch (e) { emp = null; } }
  if (!can('survey')) { frame(`${back('portal.html', 'البوابة')}<div class="card" style="text-align:center;padding:40px"><h2>مفيش صلاحية</h2><p style="color:var(--mut);margin-top:8px">قسم المساحة محتاج صلاحية «قسم المساحة» من المالك.</p></div>`); return; }
  route();
});
