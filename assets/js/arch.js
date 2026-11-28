// قسم المعماري: ملف المشروع ← 10 مستندات منفصلة، كل واحد بشكل ورقته الأصلية ← مراجعة إجبارية ← PDF
import './click.js';
import * as F from './fb.js';
import { readDoc, fileToImages, fileURL, shrink, isPdf, aiRead, aiReady, fromAI, nk, num, ownerKind } from './docread.js';
import { hijri, greg } from './geo.js';
import { initAI, aiBox, wireAiBox, pdfBar, autoPrint } from './deptcommon.js';
import * as D from './archdocs.js';
import * as DECO from './deco.js';
try { DECO.applyLite(); } catch (e) { }
const { auth, db } = F, { DOCS, NEEDS, LABELS, DIRS, TXT } = D;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 3200); }
const f2 = v => isFinite(num(v)) && v !== '' ? num(v).toFixed(2) : '';
let me = null, emp = null, isOwner = false, S = null;
const can = m => isOwner || (emp && emp.active !== false && Array.isArray(emp.mods) && emp.mods.includes(m));

const DEF_S = {
  office: { name: 'مكتب سعد مفرح الشمراني للاستشارات الهندسية', short: 'مكتب سعد مفرح الشمراني', sub: 'للاستشارات الهندسية', addr: '2837 – حي العارض – الرياض 13338 – 8161', nat: 'RRRB2837', phone: '0570086833', cr: '1010786222', lic: '5110104772', email: 's3adalshomrani2022@gmail.com' },
  mgr: 'م/ سعد مفرح الشمراني', mgrFull: 'سعد مفرح مبارك الشمراني', mgrTitle: 'المدير العام', mgrSig: '', stamp: '', amanahLogo: '',
  amanah: ['أمــــانة منطــــقة الريــــاض', 'الوكــالة المساعـدة للتعمـير', 'الإدارة العامة لرقابة المباني'],
  pledge: TXT.owner, officeTxt: TXT.office, declOwner: TXT.declOwner, declOffice: TXT.declOffice, insurance: TXT.insurance, waste: TXT.waste, fence: TXT.fence, letter: TXT.letter, philo: TXT.philo, techNotes: [],
  excDepth: 1.5, dmap: {}, projTypes: ['سكني', 'سكني تجاري', 'تجاري', 'عمارة سكنية', 'فيلا سكنية', 'دبلكس'], reqs: ['تعديل مكونات الرخصة', 'تجديد الرخصة', 'إصدار رخصة', 'إضافة أدوار', 'ترميم']
};
async function loadS() { try { const s = await F.getDoc(F.doc(db, 'archSettings', 'main')); S = Object.assign(structuredClone(DEF_S), s.exists() ? s.data() : {}); S.office = Object.assign({}, DEF_S.office, S.office || {}); } catch (e) { S = structuredClone(DEF_S); } const B = DECO.cached().brand || {}; if (B.name) S.office.name = B.name; return S; }

const top = () => `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" data-brand="logo" alt="">قسم المعماري</a><div class="who"><span class="av">${esc(((isOwner ? 'المالك' : (emp && emp.name)) || '').slice(0, 1))}</span><button class="btn btn-ghost sm" id="lo">خروج</button></div></div></header>`;
const back = (href, label = 'رجوع') => `<a class="glass-back" href="${href}">→ ${label}</a>`;
function frame(html) { root.innerHTML = top() + `<main class="shell sv">${html}</main>`; $('#lo').onclick = () => F.signOut(auth); }

/* ---------- الصور (archMedia — أي حجم بيدخل، بيتصغّر لوحده) ---------- */
const imgCache = {};
async function fit(d) { let q = .85, m = 1800, out = await shrink(d, m, q); while (out.length > 940000 && m > 600) { m -= 300; q -= .08; out = await shrink(d, m, Math.max(.5, q)); } return out; }
async function putImg(data) { const d = await fit(data); const ref = await F.addDoc(F.collection(db, 'archMedia'), { img: d, by: me.uid, at: F.serverTimestamp() }); imgCache[ref.id] = d; return ref.id; }
async function getImg(id) { if (!id) return ''; if (imgCache[id]) return imgCache[id]; try { const s = await F.getDoc(F.doc(db, 'archMedia', id)); return imgCache[id] = s.exists() ? s.data().img : ''; } catch (e) { return ''; } }
const I = async id => id ? `<img src="${await getImg(id)}" alt="">` : '';
function busy(on, t = 'جارٍ التجهيز…') { let b = $('#busy'); if (on) { if (!b) { b = document.createElement('div'); b.id = 'busy'; b.className = 'pdf-busy'; document.body.appendChild(b); } b.innerHTML = `<div><span class="spinner"></span><b>${t}</b></div>`; } else if (b) b.remove(); }

/* ---------- التعبئة التلقائية: صك واحد (+ الرخصة) بيملى الـ 9 مستندات ---------- */
let SVMAP = null;
async function sectorMap() { if (SVMAP) return SVMAP; SVMAP = Object.assign({}, S.dmap || {}); try { const s = await F.getDoc(F.doc(db, 'svSettings', 'main')); if (s.exists()) SVMAP = Object.assign({}, s.data().dmap || {}, SVMAP); } catch (e) { } return SVMAP; }
async function autoFill() {
  const set = (k, v, sure) => { if (v == null || v === '' || (P[k] && P.st[k] !== 'auto' && P.st[k] !== 'calc')) return; if (P[k] === v) return; P[k] = v; P.st[k] = sure ? 'auto' : 'check'; };
  // القطاع من جدول الأحياء
  if (P.district) { const m = await sectorMap(), d = nk(P.district).replace(/^حي /, ''); const hit = Object.entries(m).find(([k]) => nk(k).replace(/^حي /, '') === d); if (hit) set('sector', hit[1], true); }
  // سنة الطلب = السنة الهجرية الحالية
  if (!P.reqYear || P.st.reqYear === 'auto' || P.reqYear === '1447' && hijri().split('/')[0] !== '1447') { P.reqYear = hijri().split('/')[0] || P.reqYear; P.st.reqYear = 'auto'; }
  // نوع الخطاب والمطلوب من نوع الرخصة
  const lt = nk(P.licType || ''); if (lt) { if (/تجديد/.test(lt)) { set('letterType', 'تجديد', true); set('req', 'تجديد الرخصة', true); } else if (/تعديل/.test(lt)) { set('letterType', 'تعديل', true); set('req', 'تعديل مكونات الرخصة', true); } else if (/اصدار/.test(lt)) set('req', 'إصدار رخصة', true); else if (/ترميم/.test(lt)) set('req', 'ترميم', true); }
  // نوع المبنى من استعمال الأرض
  const lu = nk(P.landUse || ''); if (lu) set('projType', /سكني/.test(lu) && /تجاري/.test(lu) ? 'سكني تجاري' : /تجاري/.test(lu) ? 'تجاري' : /سكني/.test(lu) ? 'سكني' : '', true);
  // كمية المخلفات = المساحة × عمق الحفر (من غرفة التحكم) — صفرا للمراجعة
  const a = num(P.deedArea), dep = +S.excDepth || 1.5; if (isFinite(a) && a > 0 && (!P.wasteQty || P.st.wasteQty === 'calc')) { P.wasteQty = String(Math.round(a * dep)); P.st.wasteQty = 'calc'; }
  // فرد ولا منشأة
  P.ownerKind = ownerKind(P.owner, P.ownerId) || P.ownerKind || 'ind';
}
// جاهزية كل مستند: ✓ جاهز أو «ناقص N»
const missing = k => (NEEDS[k] || []).filter(f => !String(P[f] ?? '').trim());

/* ---------- المشروع ---------- */
let P = null;
const blankP = () => ({ landUse: '', ownerKind: '', owner: '', ownerId: '', nationality: 'سعودي', ownerPhone: '', plot: '', plan: '', district: '', city: 'الرياض', sector: '', streetWidth: '', licNo: '', licType: '', licDate: '', deedNo: '', deedDate: '', deedArea: '', projType: 'سكني', req: 'تعديل مكونات الرخصة', transNo: '', buildCoef: '', designGuide: '', wasteQty: '', buildingDesc: '', serviceNo: '', reqYear: '1447', letterType: 'تعديل', letterReq: '', st: {}, compsOld: [], compsNew: [], bounds: { N: {}, S: {}, E: {}, W: {} }, plans: [], facade: '', site: [], siteNote: 'ارض فضاء', system: '', notes: [], fz: {}, fenceImg: '', tray: [], docs: {} });
async function loadP(id) { const s = await F.getDoc(F.doc(db, 'archProjects', id)); if (!s.exists()) throw new Error('المشروع مش موجود'); P = Object.assign(blankP(), s.data(), { id }); P.bounds = Object.assign({ N: {}, S: {}, E: {}, W: {} }, P.bounds || {}); P.fz = P.fz || {}; return P; }
async function saveP(quiet) {
  const { id, ...data } = P; data.upd = F.serverTimestamp();
  if (id) await F.updateDoc(F.doc(db, 'archProjects', id), data);
  else { data.by = me.uid; data.byName = isOwner ? 'المالك' : (emp && emp.name) || ''; data.at = F.serverTimestamp(); const r = await F.addDoc(F.collection(db, 'archProjects'), data); P.id = r.id; }
  if (!quiet) toast('اتحفظ ✓');
}

function vHome() {
  frame(`${back('portal.html', 'البوابة')}<h1 class="sv-h">قسم المعماري</h1><p class="desc">افتح مشروع، ارفع الورق مرة واحدة، وكل مستند من الـ 10 يطلع بشكل ورقته.</p>
  <div class="tiles"><a class="tile" href="#new"><span class="ic">＋</span><h3>مشروع جديد</h3><p>ارفع الصك والرخصة والمخططات والصور</p></a><a class="tile" href="#list"><span class="ic">▤</span><h3>كل المشاريع</h3><p>افتح مشروع وطلّع أي مستند</p></a><a class="tile" href="#ctl"><span class="ic">⚙</span><h3>غرفة التحكم</h3><p>بيانات المكتب، التوقيع والختم، نصوص النماذج</p></a></div>`);
}
async function vNew() { await loadS(); P = blankP(); busy(1, 'بنفتح مشروع جديد…'); try { await saveP(true); location.replace('#p/' + P.id); } catch (e) { toast(F.authMsg(e), 1); } busy(0); }

/* صفحة المشروع: الرفع الموحّد + كروت المستندات العشرة */
const SLOTS = { before: 'مخطط قبل التعديل', after: 'مخطط بعد التعديل', facade: 'صورة الواجهة', site: 'صورة من الطبيعة', system: 'نظام البناء', fence: 'كروكي السور', aerial: 'صورة جوية (الواجهات)', skip: 'تجاهل' };
async function vProject(id) {
  await loadS(); try { await loadP(id); } catch (e) { return toast(e.message || F.authMsg(e), 1); }
  { const before = JSON.stringify(P); await autoFill(); if (JSON.stringify(P) !== before) saveP(true).catch(() => { }); }
  frame(`${back('#list', 'كل المشاريع')}<div class="ar-head"><div><h1 class="sv-h">${esc(P.owner || 'مشروع جديد')}</h1><p class="desc">${P.plot ? `قطعة ${esc(P.plot)} — مخطط ${esc(P.plan)} — ${esc(P.district)}` : 'ارفع الصك والرخصة عشان البيانات تتملى'}${P.licNo ? ` — رخصة <span dir="ltr">${esc(P.licNo)}</span>` : ''}</p></div><a class="btn btn-ghost sm" href="#e/${id}">✎ البيانات المشتركة</a></div>
  <section class="card sv-drop" id="drop"><div class="dz-ic">📥</div><b>ارفع كل الورق هنا مرة واحدة: الصك، الرخصة، المخططات، صور الواجهة والموقع</b><small>${aiReady() ? 'الـ AI بيعرف كل ورقة ويحطها في مكانها، وانت تقدر تغيّر.' : 'الـ PDF الإلكتروني بيتقرا لوحده. الصور اختار مكانها من القائمة (ولو وصّلت قارئ الـ AI هيختار لوحده).'}</small><input type="file" id="docIn" accept="application/pdf,image/*" multiple hidden><button class="btn btn-ink sm" id="pick">اختار ملفات</button><p id="dzMsg" class="hint"></p></section>
  <div id="tray"></div>
  <h3 style="margin:18px 0 10px">المستندات</h3><div class="ar-docs">${DOCS.map(d => `<a class="ar-doc ${d.soon ? 'off' : ''}" ${d.soon ? '' : `href="#f/${id}/${d.k}"`}><span class="i">${d.ic}</span><b>${d.t}</b><small>${d.soon ? 'ابعت نسخة منها عشان تتعمل' : (P.docs && P.docs[d.k] ? 'اتطبع ' + esc(P.docs[d.k].at || '') : '')}</small>${d.soon ? '' : (n => n.length ? `<em class="rd no" title="${esc(n.map(f => LABELS[f] || f).join('، '))}">ناقص ${n.length}</em>` : '<em class="rd ok">✓ جاهز</em>')(missing(d.k))}</a>`).join('')}</div>`);
  paintTray();
  const din = $('#docIn'); $('#pick').onclick = () => din.click(); din.onchange = () => takeAll([...din.files]);
  const dz = $('#drop'); ['dragover', 'dragenter'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('ov'); })); ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, () => dz.classList.remove('ov'))); dz.addEventListener('drop', e => { e.preventDefault(); takeAll([...e.dataTransfer.files]); });
}
// دمج بيانات مقروءة في المشروع (من غير ما يمسح حاجة اتكتبت باليد)
function merge(r) {
  Object.entries(r.v).forEach(([k, v]) => {
    if (k === '_comps') { if (v.length && !(P.compsOld || []).length) { P.compsOld = v.map(c => ({ floor: c.floor, units: c.units, use: c.use, area: c.area })); if (!(P.compsNew || []).length) P.compsNew = structuredClone(P.compsOld); } return; }
    if (k.startsWith('_')) return;
    const m = k.match(/^d([dls])_(\w)$/); if (m) { const f = { d: 'desc', l: 'len', s: 'set' }[m[1]]; if (!P.bounds[m[2]][f]) P.bounds[m[2]][f] = v; return; }
    if (!(k in P) && !LABELS[k]) return;
    if (!P[k] || (P.st[k] === 'check' && r.st[k] === 'auto')) { P[k] = v; P.st[k] = r.st[k] || 'check'; }
  });
  Object.keys(r.st).filter(k => /^d[dl]_/.test(k)).forEach(k => P.st[k] = 'check');
}
const kindToSlot = (k, stage) => k === 'plan' ? (stage === 'before' ? 'before' : 'after') : k === 'facade' ? 'facade' : k === 'site_photo' ? 'site' : k === 'building_system' ? 'system' : '';
function place(it) { // يحط الصورة في مكانها حسب الاختيار
  const id = it.img;
  P.plans.forEach(p => { if (p.before === id) p.before = ''; if (p.after === id) p.after = ''; }); P.plans = P.plans.filter(p => p.before || p.after || p.title);
  P.site = (P.site || []).filter(x => x !== id); if (P.facade === id) P.facade = ''; if (P.system === id) P.system = ''; if (P.fenceImg === id) P.fenceImg = ''; if (P.fz.aerial1 === id) P.fz.aerial1 = '';
  const s = it.slot;
  if (s === 'before' || s === 'after') { let pl = P.plans.find(p => (it.title && p.title === it.title) && !p[s]) || P.plans.find(p => !p[s]); if (!pl) { pl = { title: it.title || '', before: '', after: '' }; P.plans.push(pl); } pl[s] = id; if (it.title && !pl.title) pl.title = it.title; }
  else if (s === 'facade') { P.facade = id; if (!P.fz.persp0) P.fz.persp0 = id; } else if (s === 'site') P.site.push(id); else if (s === 'system') P.system = id; else if (s === 'fence') P.fenceImg = id; else if (s === 'aerial') P.fz.aerial1 = id;
}
async function takeAll(files) {
  const m = $('#dzMsg'); let n = 0, k = 0; busy(1, 'بنقرا الملفات…');
  for (const f of files) {
    k++; busy(1, `بنقرا ${k} من ${files.length}: ${esc(f.name)}`);
    try {
      let r = null;
      if (isPdf(f)) { r = await readDoc(f, x => busy(1, x)); if (r.text) { merge(r); n += r.found; continue; } }
      // صورة أو PDF متصوّر: لو الـ AI متوصّل يعرف نوعها، غير كده بيتحط في الصينية تختار مكانها
      const imgs = r && r.images ? r.images : await fileToImages(f);
      let kind = r ? r.kind : '', stage = r ? r.planStage : '', title = r ? r.planTitle : '';
      if (!r && aiReady()) { try { const a = fromAI(await aiRead(imgs.slice(0, 2), 'حدد نوع الصورة: صك/رخصة/مخطط/واجهة/صورة موقع/نظام بناء')); kind = a.kind; stage = a.planStage; title = a.planTitle; if (/deed|license|survey/.test(kind)) { merge(a); n += a.found; continue; } } catch (e) { toast('الـ AI: ' + e.message, 1); } }
      if (r && /deed|license|doc/.test(r.kind) && r.found > 2) { merge(r); n += r.found; continue; }
      for (const im of imgs) { const id = await putImg(im); const it = { img: id, name: f.name, slot: kindToSlot(kind, stage) || (imgs.length > 1 ? 'after' : 'site'), title: title || '', ai: !!kind }; P.tray.push(it); place(it); }
    } catch (e) { toast(f.name + ': ' + ((e && e.message) || e), 1); }
  }
  await autoFill(); try { await saveP(true); } catch (e) { toast(F.authMsg(e), 1); }
  busy(0); await vProject(P.id); $('#dzMsg').textContent = `اتقرا ${n} خانة${P.tray.length ? ' — والصور اتحطت تحت، راجع مكان كل واحدة' : ''}. راجع البيانات الصفرا في «البيانات المشتركة».`;
}
function paintTray() {
  const t = $('#tray'); if (!t) return; if (!(P.tray || []).length) { t.innerHTML = ''; return; }
  t.innerHTML = `<section class="card"><h3>الصور والمخططات المرفوعة — كل واحدة راحت فين</h3><div class="ar-tray">${P.tray.map((it, i) => `<figure data-im="${esc(it.img)}"><img alt=""><select data-ts="${i}">${Object.entries(SLOTS).map(([k, l]) => `<option value="${k}" ${it.slot === k ? 'selected' : ''}>${l}</option>`).join('')}</select>${/before|after/.test(it.slot) ? `<input class="in" data-tt="${i}" value="${esc(it.title || '')}" placeholder="اسم الدور">` : ''}${it.ai ? '<small>اختيار الـ AI</small>' : ''}</figure>`).join('')}</div></section>`;
  $$('[data-im] img', t).forEach(async im => { im.src = await getImg(im.parentElement.dataset.im); });
  $$('[data-ts]', t).forEach(s => s.onchange = async () => { const it = P.tray[+s.dataset.ts]; it.slot = s.value; it.ai = false; place(it); await saveP(true); paintTray(); });
  $$('[data-tt]', t).forEach(s => s.onchange = async () => { const it = P.tray[+s.dataset.tt]; it.title = s.value; const pl = P.plans.find(p => p.before === it.img || p.after === it.img); if (pl) pl.title = s.value; await saveP(true); });
}

/* ---------- فورم البيانات (المشتركة أو بتاعة مستند واحد) ---------- */
async function vForm(id, k) {
  await loadS(); if (!P || P.id !== id) { try { await loadP(id); } catch (e) { return toast(e.message || F.authMsg(e), 1); } }
  const d = DOCS.find(x => x.k === k), keys = k ? NEEDS[k] : Object.keys(LABELS);
  const fld = key => key === 'projType' || key === 'req' || key === 'letterType' ? `<div class="fld"><label>${LABELS[key]}</label><select data-k="${key}">${[...new Set([...(key === 'projType' ? S.projTypes : key === 'req' ? S.reqs : ['تعديل', 'تجديد']), P[key]].filter(Boolean))].map(x => `<option ${x === P[key] ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>`
    : `<div class="fld"><label>${LABELS[key]}</label><input data-k="${key}" class="${P.st[key] ? 'st-' + P.st[key] : ''}" value="${esc(P[key] || '')}">${P.st[key] === 'check' ? '<small class="rv">⚠ راجعها</small>' : ''}</div>`;
  let extra = '';
  if (!k || k === 'tech') extra += compsHTML('compsOld', 'مكونات رخصة البناء السابقة') + compsHTML('compsNew', 'مكونات رخصة البناء حسب المخطط المقترح', true);
  if (!k || k === 'tech' || k === 'fence') extra += boundsHTML();
  if (k === 'tech') extra += plansHTML() + imgsHTML() + `<section class="card"><h3>ملاحظات التقرير</h3><textarea class="in" id="notes" rows="3">${esc((P.notes || []).join('\n'))}</textarea></section>`;
  if (k === 'facade') extra += facadeHTML();
  if (k === 'fence') extra += `<section class="card"><h3>كروكي السور</h3><p class="hint">بيترسم لوحده من الأطوال والارتدادات. ولو عندك كروكي جاهز ارفعه.</p><div class="ar-slot ${P.fenceImg ? 'has' : ''}" data-im="${esc(P.fenceImg)}"><img alt=""><input type="file" accept="image/*,application/pdf" data-one="fenceImg" hidden><button class="btn btn-ghost sm" data-oneu="fenceImg">${P.fenceImg ? 'تغيير' : 'رفع كروكي'}</button>${P.fenceImg ? '<button class="btn btn-ghost sm" data-clr="fenceImg">الرسم الأوتوماتيك</button>' : ''}</div></section>`;
  if (k === 'letter') extra += `<section class="card"><div class="fld"><label>نص الطلب في الخطاب (اختياري)</label><input data-k="letterReq" value="${esc(P.letterReq || '')}" placeholder="${P.letterType === 'تجديد' ? 'تجديد رخصة بناء' : 'تعديل مكونات رخصة بناء'}"></div></section>`;
  frame(`${back('#p/' + id, 'ملف المشروع')}<h1 class="sv-h">${d ? d.t : 'البيانات المشتركة'}</h1><p class="desc">${d ? 'البيانات المشتركة بتتملى في كل المستندات. اللي تعدله هنا بيتعدل في الكل.' : 'دي البيانات اللي بتتملى في الـ 10 مستندات.'}</p>
  <section class="card"><div class="sv-grid">${keys.map(fld).join('')}</div></section>${extra}${pdfBar(d ? '📄 ' + d.t + ' PDF' : '📄 حفظ', `<button class="btn btn-ghost" id="svB">💾 حفظ</button>`)}`);
  wireForm(k);
  $('#svB').onclick = async () => { readForm(); try { await saveP(); } catch (e) { toast(F.authMsg(e), 1); } };
  $('#pdfGo').onclick = async () => { readForm(); try { await saveP(true); } catch (e) { return toast(F.authMsg(e), 1); } if (d) review(k); else location.hash = 'p/' + id; };
}
function compsHTML(w, t, cpy) { return `<section class="card"><h3>${t}</h3>${cpy ? '<button class="btn btn-ghost sm" id="cpy" style="margin-bottom:8px">نسخ من السابقة</button>' : ''}<div class="sv-tw"><table class="sv-t"><tr><th>المكوّن</th><th>عدد الوحدات</th><th>الاستخدام</th><th>المساحة م²</th><th>النسبة</th><th></th></tr>${(P[w] || []).map((c, i) => `<tr><td><input data-c="${w}|${i}|floor" value="${esc(c.floor)}"></td><td><input data-c="${w}|${i}|units" value="${esc(c.units)}" dir="ltr"></td><td><input data-c="${w}|${i}|use" value="${esc(c.use)}"></td><td><input data-c="${w}|${i}|area" value="${esc(c.area)}" dir="ltr"></td><td dir="ltr">${num(P.deedArea) && num(c.area) && !/سور|أسوار|اسوار/.test(c.floor) ? (num(c.area) / num(P.deedArea) * 100).toFixed(2) + '%' : ''}</td><td><button class="x" data-cx="${w}|${i}">×</button></td></tr>`).join('')}</table></div><button class="btn btn-ghost sm" data-ca="${w}">＋ صف</button></section>`; }
function boundsHTML() { return `<section class="card"><h3>الحدود والأطوال والارتدادات</h3><div class="sv-tw"><table class="sv-t"><tr><th>الجهة</th><th>حدود الأرض</th><th>الطول (م)</th><th>الارتداد (م)</th></tr>${Object.entries(DIRS).map(([k, l]) => `<tr><td><b>${l}</b></td><td><input data-b="${k}|desc" value="${esc(P.bounds[k].desc || '')}" class="${P.st['dd_' + k] ? 'st-check' : ''}"></td><td><input data-b="${k}|len" value="${esc(P.bounds[k].len ?? '')}" dir="ltr" class="${P.st['dl_' + k] ? 'st-check' : ''}"></td><td><input data-b="${k}|set" value="${esc(P.bounds[k].set ?? '')}" dir="ltr"></td></tr>`).join('')}</table></div></section>`; }
const slot = (key, label, val) => `<div><b>${label}</b><div class="ar-slot ${val ? 'has' : ''}" data-im="${esc(val || '')}"><img alt=""><input type="file" accept="image/*,application/pdf" data-one="${key}" hidden><button class="btn btn-ghost sm" data-oneu="${key}">${val ? 'تغيير' : 'رفع'}</button></div></div>`;
function plansHTML() { return `<section class="card"><h3>المخططات (قبل / بعد التعديل)</h3><p class="hint">الدور المضاف سيب «قبل» فاضي، وهيطلع «إضافة الدور…».</p><div id="plans">${(P.plans || []).map((pl, i) => `<div class="ar-pl"><input class="in" data-pt="${i}" value="${esc(pl.title)}" placeholder="الدور الأرضي"><div class="ar-ba">${['before', 'after'].map(w => `<div class="ar-slot ${pl[w] ? 'has' : ''}" data-im="${esc(pl[w] || '')}"><b>${w === 'before' ? 'قبل التعديل' : 'بعد التعديل'}</b><img alt=""><input type="file" accept="image/*,application/pdf" data-pf="${i}|${w}" hidden><button class="btn btn-ghost sm" data-pu="${i}|${w}">${pl[w] ? 'تغيير' : 'رفع'}</button></div>`).join('')}</div><button class="x" data-px="${i}">×</button></div>`).join('')}</div><button class="btn btn-ghost sm" id="addPl">＋ دور</button></section>`; }
function imgsHTML() { return `<section class="card"><h3>الصور</h3><div class="ar-imgs">${slot('facade', 'صورة الواجهة', P.facade)}${slot('system', 'نظام البناء', P.system)}<div class="wide"><b>صور من الطبيعة</b> <input class="in" data-k="siteNote" value="${esc(P.siteNote || '')}" style="max-width:220px" placeholder="ارض فضاء"><div class="ar-th">${(P.site || []).map((x, i) => `<figure data-im="${esc(x)}"><img alt=""><button class="x" data-rmimg="site|${i}">×</button></figure>`).join('')}</div><input type="file" accept="image/*" multiple id="siteIn" hidden><button class="btn btn-ghost sm" id="siteU">＋ صور</button></div></div></section>`; }
function facadeHTML() {
  const z = P.fz, zs = (k, l) => slot('fz.' + k, l, z[k]);
  return `<section class="card"><h3>صور نموذج الواجهات</h3><div class="ar-imgs three">${zs('site1', 'الموقع العام 1')}${zs('site2', 'الموقع العام 2')}${zs('aerial1', 'المصور الجوي 1')}${zs('aerial2', 'المصور الجوي 2 (المخطط)')}${zs('aerial3', 'المصور الجوي (تحديد الموقع)')}${zs('persp0', 'منظور التقديم الأولي')}${zs('swatch', 'لوحة الألوان والمواد')}${zs('mat1', 'صورة المواد 1')}${zs('mat2', 'صورة المواد 2')}${zs('identity', 'الهوية المحلية')}${zs('colorsImg', 'COLORS & MATERIALS')}${zs('solidImg', 'SOLID & VOIDS')}${zs('lightImg', 'ARTIFICAL LIGHT')}${zs('front', 'الواجهة الأمامية')}${zs('back', 'الواجهة الخلفية')}${zs('side1', 'الواجهة الجانبية 1')}${zs('side2', 'الواجهة الجانبية 2')}</div></section>
  <section class="card"><h3>الألوان والمواد (بتكتبها انت)</h3><div id="cols">${(z.colors || []).map((c, i) => `<div class="sv-row"><input type="color" data-cc="${i}|hex" value="${esc(c.hex || '#d9b48f')}"><input class="in" data-cc="${i}|name" value="${esc(c.name || '')}" placeholder="اسم اللون / المادة"><input class="in" data-cc="${i}|code" value="${esc(c.code || '')}" placeholder="الكود" dir="ltr"><button class="x" data-cx2="${i}">×</button></div>`).join('')}</div><button class="btn btn-ghost sm" id="addCol">＋ لون / مادة</button>
  <div class="sv-grid" style="margin-top:12px">${[['pPrimary', 'نسبة الألوان الأساسية %'], ['pSecondary', 'نسبة الألوان الثانوية %'], ['pSolid', 'نسبة المصمت %'], ['pOpen', 'نسبة الفتحات %']].map(([k, l]) => `<div class="fld"><label>${l}</label><input data-z="${k}" value="${esc(z[k] || '')}" dir="ltr"></div>`).join('')}</div>
  <div class="fld"><label>الفلسفة التصميمية (سطر لكل نقطة)</label><textarea class="in" id="philo" rows="5">${esc((z.philo && z.philo.length ? z.philo : S.philo || TXT.philo).join('\n'))}</textarea></div></section>
  <section class="card"><h3>التشجير</h3><div class="ar-imgs three">${[0, 1, 2].map(i => { const t = (z.trees || [])[i] || {}; return `<div>${slot('tree.' + i, ['الشجر', 'الشجيرات', 'مغطيات التربة'][i], t.img)}<input class="in" data-tr="${i}" value="${esc(t.name || ['Acacia ampliceps', 'Acalypha wilkesiana', 'Carissa grandiflora'][i])}" dir="ltr"></div>`; }).join('')}</div></section>`;
}
function readForm() {
  $$('[data-k]').forEach(el => { P[el.dataset.k] = el.value; });
  $$('[data-b]').forEach(el => { const [k, f] = el.dataset.b.split('|'); P.bounds[k][f] = el.value; });
  const n = $('#notes'); if (n) P.notes = n.value.split('\n').map(x => x.trim()).filter(Boolean);
  $$('[data-z]').forEach(el => P.fz[el.dataset.z] = el.value);
  const ph = $('#philo'); if (ph) P.fz.philo = ph.value.split('\n').map(x => x.trim()).filter(Boolean);
  $$('[data-tr]').forEach(el => { P.fz.trees = P.fz.trees || []; const i = +el.dataset.tr; P.fz.trees[i] = Object.assign({ t: ['الشجر', 'الشجيرات', 'نباتات مغطيات التربة'][i] }, P.fz.trees[i] || {}, { name: el.value }); });
  $$('[data-cc]').forEach(el => { const [i, f] = el.dataset.cc.split('|'); P.fz.colors[+i][f] = el.value; });
}
const setImg = (key, id) => { if (key.startsWith('fz.')) P.fz[key.slice(3)] = id; else if (key.startsWith('tree.')) { const i = +key.slice(5); P.fz.trees = P.fz.trees || []; P.fz.trees[i] = Object.assign({ t: ['الشجر', 'الشجيرات', 'نباتات مغطيات التربة'][i] }, P.fz.trees[i] || {}, { img: id }); } else P[key] = id; };
function wireForm(k) {
  const redraw = async () => { const y = scrollY; readForm(); await vForm(P.id, k); scrollTo(0, y); };
  $$('[data-im]').forEach(async el => { const id = el.dataset.im; if (!id) return; const im = $('img', el); if (im) { im.src = await getImg(id); el.classList.add('has'); } });
  $$('[data-k]').forEach(el => el.addEventListener('input', () => { const key = el.dataset.k; if (P.st[key]) { delete P.st[key]; el.className = ''; const n = el.nextElementSibling; if (n && n.classList.contains('rv')) n.remove(); } }));
  $$('[data-b]').forEach(el => el.addEventListener('input', () => { const [d, f] = el.dataset.b.split('|'); delete P.st[(f === 'desc' ? 'dd_' : 'dl_') + d]; el.classList.remove('st-check'); }));
  $$('[data-c]').forEach(el => el.onchange = () => { const [w, i, f] = el.dataset.c.split('|'); P[w][+i][f] = el.value; setTimeout(redraw); });
  $$('[data-cx]').forEach(b => b.onclick = () => { const [w, i] = b.dataset.cx.split('|'); P[w].splice(+i, 1); redraw(); });
  $$('[data-ca]').forEach(b => b.onclick = () => { P[b.dataset.ca].push({ floor: '', units: '', use: '', area: '' }); redraw(); });
  const cp = $('#cpy'); if (cp) cp.onclick = () => { P.compsNew = structuredClone(P.compsOld || []); redraw(); };
  const ap = $('#addPl'); if (ap) ap.onclick = () => { readForm(); P.plans.push({ title: '', before: '', after: '' }); redraw(); };
  $$('[data-pt]').forEach(el => el.oninput = () => P.plans[+el.dataset.pt].title = el.value);
  $$('[data-px]').forEach(b => b.onclick = () => { if (confirm('تمسح الدور ده؟')) { P.plans.splice(+b.dataset.px, 1); redraw(); } });
  $$('[data-pu]').forEach(b => b.onclick = () => $(`[data-pf="${b.dataset.pu}"]`).click());
  $$('[data-pf]').forEach(el => el.onchange = async () => { const f = el.files[0]; if (!f) return; const [i, w] = el.dataset.pf.split('|'); busy(1, 'جارٍ رفع المخطط…'); try { readForm(); const L = await fileToImages(f, 8); P.plans[+i][w] = await putImg(L[0]); for (let j = 1; j < L.length; j++) P.plans.push({ title: '', [w]: await putImg(L[j]) }); await saveP(true); } catch (e) { toast(F.authMsg(e), 1); } busy(0); redraw(); });
  $$('[data-oneu]').forEach(b => b.onclick = () => $(`[data-one="${b.dataset.oneu}"]`).click());
  $$('[data-one]').forEach(el => el.onchange = async () => { const f = el.files[0]; if (!f) return; busy(1, 'جارٍ رفع الصورة…'); try { readForm(); setImg(el.dataset.one, await putImg((await fileToImages(f, 1))[0])); await saveP(true); } catch (e) { toast(F.authMsg(e), 1); } busy(0); redraw(); });
  $$('[data-clr]').forEach(b => b.onclick = async () => { readForm(); P[b.dataset.clr] = ''; await saveP(true); redraw(); });
  const su = $('#siteU'); if (su) { su.onclick = () => $('#siteIn').click(); $('#siteIn').onchange = async e => { busy(1, 'جارٍ رفع الصور…'); try { readForm(); for (const f of e.target.files) P.site.push(await putImg(await fileURL(f))); await saveP(true); } catch (x) { toast(F.authMsg(x), 1); } busy(0); redraw(); }; }
  $$('[data-rmimg]').forEach(b => b.onclick = () => { const [kk, i] = b.dataset.rmimg.split('|'); P[kk].splice(+i, 1); redraw(); });
  const ac = $('#addCol'); if (ac) ac.onclick = () => { readForm(); P.fz.colors = P.fz.colors || []; P.fz.colors.push({ hex: '#d9b48f', name: '', code: '' }); redraw(); };
  $$('[data-cx2]').forEach(b => b.onclick = () => { readForm(); P.fz.colors.splice(+b.dataset.cx2, 1); redraw(); });
}

/* ---------- المراجعة الإجبارية ثم PDF ---------- */
function warnings(k) {
  const W = [], need = (f, lvl = 'bad') => { if (!String(P[f] || '').trim()) W.push([lvl, (LABELS[f] || f) + ' فاضي']); };
  (NEEDS[k] || []).forEach(f => need(f, ['owner', 'plot'].includes(f) ? 'bad' : 'warn'));
  if (k === 'tech') { if (!(P.compsOld || []).length) W.push(['warn', 'جدول المكونات السابقة فاضي']); if (!(P.plans || []).length) W.push(['warn', 'مفيش مخططات قبل/بعد']); if (!P.facade) W.push(['warn', 'مفيش صورة واجهة']); }
  if (k === 'tech' || k === 'fence') Object.entries(DIRS).forEach(([d, l]) => { if (!P.bounds[d].desc) W.push(['warn', `حد ${l} فاضي`]); if (k === 'fence' && !num(P.bounds[d].len)) W.push(['warn', `طول ${l} فاضي (الكروكي محتاجه)`]); });
  const yl = Object.keys(P.st || {}).filter(x => P.st[x] === 'check' && ((NEEDS[k] || []).includes(x) || ((k === 'tech' || k === 'fence') && /^d[dl]_/.test(x)))); if (yl.length) W.push(['warn', `فيه ${yl.length} خانة صفرا لسه ما اتراجعتش`]);
  return W;
}
function review(k) {
  const d = DOCS.find(x => x.k === k), W = warnings(k), bad = W.some(w => w[0] === 'bad');
  const ov = document.createElement('div'); ov.className = 'modal-back'; ov.innerHTML = `<div class="rs-card sv-rev"><h2>مراجعة قبل PDF — ${d.t}</h2>${W.length ? `<ul class="sv-w">${W.map(([t, m]) => `<li class="${t}">${t === 'bad' ? '⛔' : '⚠'} ${esc(m)}</li>`).join('')}</ul>` : '<p class="sv-ok">✓ مفيش ملاحظات</p>'}
    <table class="sv-rt">${(NEEDS[k] || []).slice(0, 8).map(f => `<tr><th>${LABELS[f]}</th><td>${esc(P[f] || '—')}</td></tr>`).join('')}</table>
    <label class="sv-ack"><input type="checkbox" id="ack" ${bad ? 'disabled' : ''}> راجعت البيانات وأتحمل صحتها على مسؤوليتي</label>${bad ? '<p class="hint" style="color:var(--red)">صلّح الأخطاء الحمرا الأول.</p>' : ''}
    <div class="sv-act"><button class="btn btn-ghost" id="rvX">رجوع</button><button class="btn btn-red" id="rvOk" disabled>📄 طباعة / حفظ PDF</button></div></div>`;
  document.body.appendChild(ov); $('#rvX', ov).onclick = () => ov.remove(); const ack = $('#ack', ov), ok = $('#rvOk', ov); ack.onchange = () => ok.disabled = !ack.checked;
  ok.onclick = async () => { ok.disabled = true; try { await F.updateDoc(F.doc(db, 'archProjects', P.id), { [`docs.${k}`]: { at: greg(), by: me.uid, name: isOwner ? 'المالك' : (emp && emp.name) || '' } }); } catch (e) { } ov.remove(); location.hash = `d/${P.id}/${k}?print=1`; };
}
async function vDoc(id, k) {
  await loadS(); try { await loadP(id); } catch (e) { return toast(F.authMsg(e), 1); }
  const d = DOCS.find(x => x.k === k), now = new Date();
  root.innerHTML = `<div class="sv-pbar">${back('#f/' + id + '/' + k, 'رجوع للبيانات')}<span id="pst">جارٍ تجهيز ملف الـ PDF… ⏳</span><button class="btn btn-red" id="prt" disabled>🖨 طباعة / حفظ PDF</button></div><div id="sheet" class="lh-doc doc-${k}"></div>`;
  const H = { tech: () => D.techReport(P, S, I, now), facade: () => D.facadeModel(P, S, I), letter: () => D.letter(P, S), insurance: () => D.insurance(P, S, hijri(now)), waste: () => D.waste(P, S, hijri(now)), office: () => D.officePledge(P, S, greg(now)), owner: () => D.ownerPledge(P, S, greg(now)), decl: () => D.declaration(P, S), fence: () => D.fence(P, S, I) }[k];
  $('#sheet').innerHTML = H ? await H() : '<p class="empty">المستند ده هيتعمل لما توصل نسخة منه</p>';
  document.body.classList.toggle('land', k === 'facade');
  document.title = `${d.t} — ${P.owner || ''}`; await Promise.all($$('#sheet img').map(i => i.decode ? i.decode().catch(() => { }) : 0));
  $('#pst').textContent = 'جاهز ✓'; const b = $('#prt'); b.disabled = false; b.onclick = () => window.print(); autoPrint();
}

/* ---------- كل المشاريع ---------- */
async function vList() {
  frame(`${back('#', 'قسم المعماري')}<h1 class="sv-h">كل المشاريع</h1><div class="sv-mapbar"><input id="fq" class="in" placeholder="بحث بالمالك أو القطعة أو الرخصة"><a class="btn btn-red sm" href="#new">＋ مشروع جديد</a></div><div id="lst"><div class="ld-box"><div class="spinner"></div><b>جاري التحميل…</b></div></div>`);
  let L = []; try { L = (await F.getDocs(F.query(F.collection(db, 'archProjects'), F.orderBy('at', 'desc'), F.limit(300)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { $('#lst').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
  const paint = () => { const q = nk($('#fq').value), X = L.filter(r => !q || nk([r.owner, r.plot, r.plan, r.district, r.licNo].join(' ')).includes(q));
    $('#lst').innerHTML = X.length ? `<div class="sv-tw"><table class="sv-t sv-lt"><tr><th>المالك</th><th>القطعة / المخطط</th><th>الحي</th><th>الرخصة</th><th>المستندات</th><th></th></tr>${X.map(r => `<tr><td><b>${esc(r.owner || 'بدون اسم')}</b></td><td>${esc(r.plot)} / ${esc(r.plan)}</td><td>${esc(r.district)}</td><td dir="ltr">${esc(r.licNo)}</td><td>${Object.keys(r.docs || {}).length} / 9</td><td class="ac"><a class="btn btn-ghost sm" href="#p/${r.id}">فتح</a></td></tr>`).join('')}</table></div>` : '<p class="empty">مفيش مشاريع</p>'; };
  $('#fq').oninput = paint; paint();
}

/* ---------- غرفة التحكم ---------- */
const imgData = (file, max = 520) => fileURL(file).then(src => new Promise(r => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); r(c.toDataURL('image/png')); }; im.src = src; }));
async function vCtl(keep) {
  if (!keep) await loadS(); const s = S;
  const inp = (k, l, ltr) => `<div class="fld"><label>${l}</label><input data-o="${k}" value="${esc(s.office[k] || '')}" ${ltr ? 'dir="ltr"' : ''}></div>`;
  const imgBox = (k, l, h) => `<div class="sv-img"><b>${l}</b><div class="pv">${s[k] ? `<img src="${s[k]}" alt="">` : (k === 'amanahLogo' ? '<img src="assets/img/docs/riyadh.png" alt="">' : '<small>لسه ما اترفعش</small>')}</div><input type="file" accept="image/*" data-img="${k}" hidden><div style="display:flex;gap:6px"><button class="btn btn-ghost sm" data-up="${k}">رفع صورة</button>${s[k] ? `<button class="btn btn-ghost sm" data-rm="${k}" style="color:var(--red)">مسح</button>` : ''}</div>${h ? `<small class="hint">${h}</small>` : ''}</div>`;
  const ta = (id, l, v, rows = 6, h = '') => `<section class="card"><h3>${l}</h3>${h ? `<p class="hint">${h}</p>` : ''}<textarea id="${id}" class="in" rows="${rows}">${esc(Array.isArray(v) ? v.join('\n') : v)}</textarea></section>`;
  frame(`${back('#', 'قسم المعماري')}<h1 class="sv-h">غرفة التحكم — المعماري</h1>
  <section class="card"><h3>بيانات المكتب</h3><div class="sv-grid">${inp('short', 'اسم المكتب')}${inp('sub', 'السطر التاني')}${inp('addr', 'العنوان')}${inp('nat', 'العنوان المختصر', 1)}${inp('phone', 'الجوال', 1)}${inp('cr', 'السجل التجاري', 1)}${inp('lic', 'رقم الترخيص', 1)}${inp('email', 'البريد', 1)}<div class="fld"><label>المدير (في التقرير)</label><input id="mgr" value="${esc(s.mgr)}"></div><div class="fld"><label>الاسم الكامل (في الخطاب)</label><input id="mgrFull" value="${esc(s.mgrFull)}"></div></div></section>
  <section class="card"><h3>التوقيع والختم والشعار</h3><div class="sv-imgs">${imgBox('mgrSig', 'توقيع المدير', 'PNG بخلفية شفافة')}${imgBox('stamp', 'الختم')}${imgBox('amanahLogo', 'شعار الأمانة', 'موجود افتراضياً — غيّره لو حابب')}</div></section>
  ${aiBox(isOwner)}
  ${ta('am', 'رأس نماذج الأمانة', s.amanah, 3)}${ta('pl', 'نص تعهد المالك', s.pledge, 10, 'فقرة في كل سطر')}${ta('ofT', 'نص تعهد المكتب الهندسي المشرف', s.officeTxt, 12, 'فقرة في كل سطر')}
  ${ta('dO', 'إقرار مالك العقار', s.declOwner, 4)}${ta('dF', 'إقرار المكتب المصمم', s.declOffice, 4)}${ta('ins', 'تعهد التأمين', s.insurance, 3)}${ta('ws', 'تعهد المخلفات ({qty} = الكمية)', s.waste, 3)}${ta('fn', 'تعهد السور', s.fence, 4)}${ta('lt', 'نص الخطاب ({office} و {req})', s.letter, 2)}${ta('ph', 'الفلسفة التصميمية الافتراضية', s.philo, 5)}${ta('tn', 'ملاحظات التقرير الفني الافتراضية', s.techNotes, 3)}
  <section class="card"><h3>القوائم</h3><div class="row2"><div class="fld"><label>أنواع المشاريع</label><textarea id="pt" class="in" rows="5">${esc(s.projTypes.join('\n'))}</textarea></div><div class="fld"><label>المطلوب</label><textarea id="rq" class="in" rows="5">${esc(s.reqs.join('\n'))}</textarea></div></div><div class="fld" style="max-width:300px;margin-top:10px"><label>عمق الحفر لحساب كمية المخلفات (م)</label><input id="exD" type="number" step="0.1" dir="ltr" value="${esc(s.excDepth || 1.5)}"><small class="hint">الكمية = مساحة الأرض × العمق — بتطلع صفرا للمراجعة</small></div><button class="btn btn-ghost sm" id="reset">رجّع كل النصوص الأصلية</button></section>
  <div class="sv-act sticky"><button class="btn btn-red" id="sv">حفظ الإعدادات</button></div>`);
  const lines = id => $(id).value.split('\n').map(x => x.trim()).filter(Boolean);
  const collect = () => { $$('[data-o]').forEach(e => s.office[e.dataset.o] = e.value); s.mgr = $('#mgr').value; s.mgrFull = $('#mgrFull').value; s.amanah = lines('#am'); s.pledge = lines('#pl'); s.officeTxt = lines('#ofT'); s.declOwner = $('#dO').value.trim(); s.declOffice = $('#dF').value.trim(); s.insurance = $('#ins').value.trim(); s.waste = $('#ws').value.trim(); s.fence = $('#fn').value.trim(); s.letter = $('#lt').value.trim(); s.philo = lines('#ph'); s.techNotes = lines('#tn'); s.projTypes = lines('#pt'); s.reqs = lines('#rq'); s.excDepth = +$('#exD').value || 1.5; };
  $('#reset').onclick = async () => { if (!confirm('ترجّع كل النصوص للصياغة الأصلية؟')) return; Object.assign(s, { pledge: TXT.owner, officeTxt: TXT.office, declOwner: TXT.declOwner, declOffice: TXT.declOffice, insurance: TXT.insurance, waste: TXT.waste, fence: TXT.fence, letter: TXT.letter, philo: TXT.philo }); await vCtl(true); };
  $$('[data-up]').forEach(b => b.onclick = () => $(`[data-img="${b.dataset.up}"]`).click());
  $$('[data-img]').forEach(e => e.onchange = async () => { if (!e.files[0]) return; collect(); s[e.dataset.img] = await imgData(e.files[0]); const y = scrollY; await vCtl(true); scrollTo(0, y); });
  $$('[data-rm]').forEach(b => b.onclick = async () => { collect(); s[b.dataset.rm] = ''; const y = scrollY; await vCtl(true); scrollTo(0, y); });
  wireAiBox(toast);
  $('#sv').onclick = async () => { collect(); const b = $('#sv'); b.disabled = true; try { await F.setDoc(F.doc(db, 'archSettings', 'main'), JSON.parse(JSON.stringify(s))); toast('اتحفظ ✓'); } catch (e) { toast(F.authMsg(e), 1); } b.disabled = false; };
}

function route() {
  if (!me) return; const h = location.hash.slice(1).split('?')[0];
  document.body.classList.remove('land');
  if (h === 'new') return vNew();
  if (h.startsWith('e/')) return vForm(h.slice(2), '');
  if (h.startsWith('f/')) { const [, id, k] = h.split('/'); return vForm(id, k); }
  if (h.startsWith('p/')) return vProject(h.slice(2));
  if (h.startsWith('d/')) { const [, id, k] = h.split('/'); return vDoc(id, k); }
  if (h === 'list') return vList();
  if (h === 'ctl') return vCtl();
  vHome();
}
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
F.onAuthStateChanged(auth, async u => {
  if (!u) { location.replace('portal.html'); return; }
  me = u; isOwner = await F.ownerOf(u.uid); await initAI();
  if (!isOwner) { try { const s = await F.getDoc(F.doc(db, 'employees', u.uid)); emp = s.exists() ? s.data() : null; } catch (e) { emp = null; } }
  if (!can('arch')) { frame(`${back('portal.html', 'البوابة')}<div class="card" style="text-align:center;padding:40px"><h2>مفيش صلاحية</h2><p style="color:var(--mut);margin-top:8px">قسم المعماري محتاج صلاحية «قسم المعماري» من المالك.</p></div>`); return; }
  route();
});
