// قسم المعماري: ملف المشروع (من الرخصة والصك) ← المستندات (تقرير فني، تعهد المالك، …) ← مراجعة إجبارية ← PDF
import './click.js';
import * as F from './fb.js';
import { readDoc, pdfPages, nk, num } from './docread.js';
import { hijri, greg } from './geo.js';
const { auth, db } = F;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const root = $('#root');
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 3000); }
const f2 = v => isFinite(v) && v !== '' ? (+v).toFixed(2) : '';
const DIRS = { N: 'شمال', S: 'جنوب', E: 'شرق', W: 'غرب' };
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

let me = null, emp = null, isOwner = false, S = null;
const can = m => isOwner || (emp && emp.active !== false && Array.isArray(emp.mods) && emp.mods.includes(m));

/* المستندات: الاتنين الأولين جاهزين للموافقة على التصميم، والباقي بعد الاعتماد */
export const DOCS = [
  { k: 'tech', t: 'التقرير الفني', ready: 1 },
  { k: 'owner', t: 'تعهد المالك', ready: 1 },
  { k: 'facade', t: 'نموذج الواجهات' }, { k: 'loads', t: 'شهادة الأحمال' }, { k: 'letter', t: 'خطاب تعديل / تجديد' },
  { k: 'insurance', t: 'تعهد التأمين' }, { k: 'waste', t: 'تعهد المخلفات' }, { k: 'office', t: 'تعهد المكتب المشرف' },
  { k: 'decl', t: 'إقرار المكتب' }, { k: 'fence', t: 'تعهد السور' }
];
const PLEDGE = [
  'التعاقد مع مكتب هندسي مصمم ومشرف معتمد ومقاول نظامي معتمد لدى الهيئة السعودية للمقاولين، وأتحمل المسؤولية الكاملة في حالة حدوث أي مخالفة أو عدم الالتزام بالشروط والأنظمة، وأتعهد بإيقاف العمل بالمشروع فوراً، وللأمانة اتخاذ الإجراءات التي تراها مناسبة ضدي وتطبيق ما تقتضي به الأنظمة المعمول بها ومنها لائحة تصنيف مخالفات كود البناء السعودي ولائحة الغرامات والجزاءات عن المخالفات البلدية الصادرة المحدثة بتاريخ 1444/11/26هـ، ونظام مكافحة التزوير والغرامات المالية.',
  'التعاقد فيما يخص أعمال تنفيذ المصاعد الكهربائية وأعمال الوقاية والحماية من الحريق مع مؤسسات وشركات معتمدة من المديرية العامة للدفاع المدني وهيئة الأمن الصناعي.',
  'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان مطابقة جميع الأعمال في المشروع لمتطلبات واشتراطات كود البناء السعودي ولائحته التنفيذية، وأتحمل المسؤولية النظامية في حال مخالفة ذلك.',
  'الالتزام بتوفير جميع المستندات والبيانات المطلوبة من الجهات المختصة لضمان تنفيذ المشروع وفقاً للأنظمة والاشتراطات المعتمدة.',
  'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان تنفيذ جميع متطلبات السلامة والصحة المهنية في موقع العمل طبقاً لكود البناء السعودي، وتسوير الموقع طبقاً لدليل اشتراطات تسوير المواقع الإنشائية، ودليل تغطية المباني تحت الإنشاء.',
  'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان تطبيق العزل الحراري في جميع المباني الجديدة وفقاً للأمر السامي الكريم رقم (م ب/6927) وتاريخ 1431/09/22هـ، وأتحمل المسؤولية النظامية في حالة مخالفة ذلك.',
  'توفير جميع التسهيلات والمعلومات اللازمة للمكتب الهندسي المشرف والمقاول لضمان تنفيذ المشروع بفعالية.',
  'إبلاغ المكتب الهندسي المشرف والمقاول بأي تغييرات أو تعديلات أرغب في تنفيذها في المشروع، والحصول على الموافقات اللازمة من الجهات ذات العلاقة قبل التنفيذ.',
  'عدم إشغال المبنى دون إصدار شهادة الإشغال، وذلك طبقاً لما ورد في نظام تطبيق الكود السعودي الصادر بالمرسوم الملكي رقم (م/43) وتاريخ 1438/4/26هـ والمعدل بالمرسوم الملكي رقم (م/15) وتاريخ 1441/1/19هـ والمرسوم الملكي رقم (م/88) وتاريخ 1446/4/10هـ، واللائحة التنفيذية لنظام تطبيق كود البناء السعودي الصادرة بالقرار الوزاري رقم (1213ق/أع/39) وتاريخ 1439/10/14هـ والمعدلة بالقرار الوزاري (304) وتاريخ 1444/7/8هـ، ونظام إجراءات التراخيص البلدية ولائحته التنفيذية. وفي حال ثبوت عدم إصدار شهادة الإشغال يتم تطبيق الإجراءات والغرامات الواردة في لائحة تصنيف مخالفات كود البناء السعودي.',
  'تبليغ الأمانة / البلدية والجهات ذات العلاقة في حال وجود أي مخالفة يرتكبها أحد الأطراف.'
];
const DEF_S = {
  office: { name: 'شركة سعد مفرح الشمراني للاستشارات الهندسية', short: 'مكتب سعد مفرح الشمراني', sub: 'للاستشارات الهندسية', addr: '2837 - حي العارض - الرياض 13338 - 8161', nat: 'RRRB2837', phone: '0570086833', cr: '1010786222', lic: '5110104772', email: 's3adalshomrani2022@gmail.com', web: 'alshomrani-co.github.io/website', handle: '@alshomrani.co' },
  mgr: 'م/ سعد مفرح الشمراني', mgrTitle: 'المدير العام', mgrSig: '', stamp: '', amanahLogo: '',
  amanah: ['أمانة منطقة الرياض', 'الوكالة المساعدة للتعمير', 'الإدارة العامة لرقابة المباني'],
  pledge: PLEDGE, techNotes: ['تم إعداد هذا التقرير بناءً على المخططات المقترحة والمعاينة الميدانية للموقع.'], projTypes: ['سكني', 'سكني تجاري', 'تجاري', 'دبلكس', 'فيلا', 'عمارة سكنية'], reqs: ['تعديل مكونات الرخصة', 'تجديد الرخصة', 'إصدار رخصة', 'إضافة أدوار', 'ترميم']
};
async function loadS() { try { const s = await F.getDoc(F.doc(db, 'archSettings', 'main')); S = Object.assign(structuredClone(DEF_S), s.exists() ? s.data() : {}); S.office = Object.assign({}, DEF_S.office, S.office || {}); } catch (e) { S = structuredClone(DEF_S); } return S; }

const top = () => `<header class="top"><div class="top-in"><a class="brand" href="portal.html"><img src="assets/img/mark.png" alt="">قسم المعماري</a><div class="who"><span class="av">${esc(((isOwner ? 'المالك' : (emp && emp.name)) || '').slice(0, 1))}</span><button class="btn btn-ghost sm" id="lo">خروج</button></div></div></header>`;
const back = (href, label = 'رجوع') => `<a class="glass-back" href="${href}">→ ${label}</a>`;
function frame(html) { root.innerHTML = top() + `<main class="shell sv">${html}</main>`; $('#lo').onclick = () => F.signOut(auth); }

function vHome() {
  frame(`${back('portal.html', 'البوابة')}<h1 class="sv-h">قسم المعماري</h1><p class="desc">ملف المشروع من الرخصة والصك، وكل المستندات منه بتنسيق موحّد.</p>
  <div class="tiles"><a class="tile" href="#new"><span class="ic">＋</span><h3>مشروع جديد</h3><p>ارفع الرخصة والصك والمخططات</p></a><a class="tile" href="#list"><span class="ic">▤</span><h3>كل المشاريع</h3><p>المستندات والطباعة</p></a><a class="tile" href="#ctl"><span class="ic">⚙</span><h3>غرفة التحكم</h3><p>بيانات المكتب، التوقيع والختم، النصوص</p></a></div>`);
}

/* ---------- الصور: بتتحفظ في archMedia (كل صورة مستند لوحدها) ---------- */
const imgCache = {};
const toWebp = (src, max = 1800, q = .82) => new Promise(r => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); let d = c.toDataURL('image/webp', q); if (d.length > 950000) d = c.toDataURL('image/webp', .6); r(d); }; im.onerror = () => r(''); im.src = src; });
const fileURL = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
async function fileImgs(f) { if (/pdf/i.test(f.type) || /\.pdf$/i.test(f.name)) return Promise.all((await pdfPages(f, 2)).map(d => toWebp(d))); return [await toWebp(await fileURL(f))]; }
async function putImg(data) { const ref = await F.addDoc(F.collection(db, 'archMedia'), { img: data, by: me.uid, at: F.serverTimestamp() }); imgCache[ref.id] = data; return ref.id; }
async function getImg(id) { if (!id) return ''; if (imgCache[id]) return imgCache[id]; try { const s = await F.getDoc(F.doc(db, 'archMedia', id)); return imgCache[id] = s.exists() ? s.data().img : ''; } catch (e) { return ''; } }

/* ---------- ملف المشروع ---------- */
let P = null;
const blankP = () => ({ owner: '', ownerId: '', plot: '', plan: '', district: '', city: 'الرياض', sector: '', licNo: '', licType: '', licDate: '', deedNo: '', deedDate: '', deedArea: '', projType: 'سكني', req: 'تعديل مكونات الرخصة', street: '', st: {}, compsOld: [], compsNew: [], bounds: { N: {}, S: {}, E: {}, W: {} }, plans: [], facade: '', site: [], system: '', notes: [], color: [], docs: {} });
async function vEdit(id, keep) {
  await loadS();
  if (!keep) { P = blankP(); if (id) { try { const s = await F.getDoc(F.doc(db, 'archProjects', id)); if (!s.exists()) return toast('المشروع مش موجود', 1); P = Object.assign(blankP(), s.data(), { id }); } catch (e) { return toast(F.authMsg(e), 1); } } }
  const fld = (k, l, ph = '', ltr) => `<div class="fld"><label>${l}</label><input data-k="${k}" class="${P.st[k] ? 'st-' + P.st[k] : ''}" value="${esc(P[k] || '')}" placeholder="${esc(ph)}" ${ltr ? 'dir="ltr"' : ''}>${P.st[k] === 'check' ? '<small class="rv">⚠ راجعها</small>' : ''}</div>`;
  const sel = (k, l, L) => `<div class="fld"><label>${l}</label><select data-k="${k}">${[...new Set([...L, P[k]].filter(Boolean))].map(x => `<option ${x === P[k] ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>`;
  const compT = w => `<div class="sv-tw"><table class="sv-t"><tr><th>المكوّن</th><th>عدد الوحدات</th><th>الاستخدام</th><th>المساحة م²</th><th>النسبة</th><th></th></tr>${(P[w] || []).map((c, i) => `<tr><td><input data-c="${w}|${i}|floor" value="${esc(c.floor)}"></td><td><input data-c="${w}|${i}|units" value="${esc(c.units)}" dir="ltr"></td><td><input data-c="${w}|${i}|use" value="${esc(c.use)}"></td><td><input data-c="${w}|${i}|area" value="${esc(c.area)}" dir="ltr"></td><td dir="ltr">${num(P.deedArea) && num(c.area) && !/سور|أسوار|اسوار/.test(c.floor) ? (num(c.area) / num(P.deedArea) * 100).toFixed(2) + '%' : ''}</td><td><button class="x" data-cx="${w}|${i}">×</button></td></tr>`).join('')}<tr class="tot"><td>الإجمالي</td><td></td><td></td><td dir="ltr">${f2((P[w] || []).filter(c => !/سور|أسوار|اسوار/.test(c.floor)).reduce((s, c) => s + (num(c.area) || 0), 0))}</td><td></td><td></td></tr></table></div><button class="btn btn-ghost sm" data-ca="${w}">＋ صف</button>`;
  const thumbs = (arr, key) => `<div class="ar-th">${arr.map((x, i) => `<figure data-im="${esc(typeof x === 'string' ? x : '')}"><img alt=""><button class="x" data-rmimg="${key}|${i}">×</button></figure>`).join('')}</div>`;
  frame(`${back(P.id ? '#p/' + P.id : '#', P.id ? 'ملف المشروع' : 'قسم المعماري')}<h1 class="sv-h">${P.id ? 'تعديل بيانات المشروع' : 'مشروع جديد'}</h1>
  <section class="card sv-drop" id="drop"><div class="dz-ic">📄</div><b>اسحب الرخصة والصك هنا (PDF أو صورة) — ممكن أكتر من ملف</b><small>اللي اتقرا بثقة <span class="st-auto lg">أخضر</span>، واللي محتاج مراجعة <span class="st-check lg">أصفر</span>.</small><input type="file" id="docIn" accept="application/pdf,image/*" multiple hidden><button class="btn btn-ink sm" id="pick">اختار ملفات</button><p id="dzMsg" class="hint"></p></section>
  <section class="card"><h3>بيانات المشروع</h3><div class="sv-grid">
    ${fld('owner', 'المالك')}${fld('ownerId', 'هوية / سجل رقم', '', 1)}${fld('plot', 'رقم القطعة', '', 1)}${fld('plan', 'رقم المخطط', '', 1)}${fld('district', 'الحي')}${fld('city', 'المدينة')}${fld('sector', 'القطاع', 'قطاع جنوب مدينة الرياض')}${fld('street', 'الشارع (اختياري)')}
    ${fld('licNo', 'رقم الرخصة', '', 1)}${fld('licType', 'نوع الطلب في الرخصة')}${fld('licDate', 'تاريخ الرخصة', '', 1)}${fld('deedNo', 'رقم الصك / العقار', '', 1)}${fld('deedDate', 'تاريخ الصك', '', 1)}${fld('deedArea', 'مساحة الأرض م²', '', 1)}
    ${sel('projType', 'نوع المشروع', S.projTypes)}${sel('req', 'المطلوب', S.reqs)}
  </div></section>
  <section class="card"><h3>مكونات رخصة البناء السابقة</h3>${compT('compsOld')}</section>
  <section class="card"><h3>مكونات رخصة البناء حسب المخطط المقترح</h3><button class="btn btn-ghost sm" id="cpy" style="margin-bottom:8px">نسخ من السابقة</button>${compT('compsNew')}</section>
  <section class="card"><h3>الحدود والأطوال والارتدادات</h3><div class="sv-tw"><table class="sv-t"><tr><th>الجهة</th><th>حدود الأرض</th><th>الطول (م)</th><th>الارتداد (م)</th></tr>${Object.entries(DIRS).map(([k, l]) => `<tr><td><b>${l}</b></td><td><input data-b="${k}|desc" value="${esc(P.bounds[k].desc || '')}" class="${P.st['dd_' + k] ? 'st-check' : ''}"></td><td><input data-b="${k}|len" value="${esc(P.bounds[k].len ?? '')}" dir="ltr" class="${P.st['dl_' + k] ? 'st-check' : ''}"></td><td><input data-b="${k}|set" value="${esc(P.bounds[k].set ?? '')}" dir="ltr"></td></tr>`).join('')}</table></div></section>
  <section class="card"><h3>المخططات (قبل / بعد التعديل)</h3><p class="hint">لكل دور: ارفع صورة أو PDF للمخطط قبل وبعد.</p><div id="plans">${(P.plans || []).map((pl, i) => `<div class="ar-pl"><input class="in" data-pt="${i}" value="${esc(pl.title)}" placeholder="الدور الأرضي"><div class="ar-ba">${['before', 'after'].map(w => `<div class="ar-slot" data-im="${esc(pl[w] || '')}"><b>${w === 'before' ? 'قبل التعديل' : 'بعد التعديل'}</b><img alt=""><input type="file" accept="image/*,application/pdf" data-pf="${i}|${w}" hidden><button class="btn btn-ghost sm" data-pu="${i}|${w}">${pl[w] ? 'تغيير' : 'رفع'}</button></div>`).join('')}</div><button class="x" data-px="${i}">×</button></div>`).join('')}</div><button class="btn btn-ghost sm" id="addPl">＋ دور</button></section>
  <section class="card"><h3>الصور</h3><div class="ar-imgs">
    <div><b>صورة الواجهة</b><div class="ar-slot" data-im="${esc(P.facade)}"><img alt=""><input type="file" accept="image/*,application/pdf" data-one="facade" hidden><button class="btn btn-ghost sm" data-oneu="facade">${P.facade ? 'تغيير' : 'رفع'}</button></div></div>
    <div><b>نظام البناء المعتمد</b><div class="ar-slot" data-im="${esc(P.system)}"><img alt=""><input type="file" accept="image/*,application/pdf" data-one="system" hidden><button class="btn btn-ghost sm" data-oneu="system">${P.system ? 'تغيير' : 'رفع'}</button></div></div>
    <div class="wide"><b>صور من الطبيعة</b>${thumbs(P.site || [], 'site')}<input type="file" accept="image/*" multiple id="siteIn" hidden><button class="btn btn-ghost sm" id="siteU">＋ صور</button></div>
  </div></section>
  <section class="card"><h3>ملاحظات التقرير الفني</h3><p class="hint">سطر لكل ملاحظة.</p><textarea class="in" id="notes" rows="4" placeholder="${esc((S.techNotes || []).join('\n'))}">${esc((P.notes || []).join('\n'))}</textarea></section>
  <div class="sv-act sticky"><button class="btn btn-red" id="save">حفظ المشروع</button></div>`);
  // تحميل الصور المحفوظة
  $$('[data-im]').forEach(async el => { const id = el.dataset.im; if (!id) return; const im = $('img', el); im.src = await getImg(id); el.classList.add('has'); });
  $$('[data-k]').forEach(el => el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { const k = el.dataset.k; P[k] = el.value; if (P.st[k]) { delete P.st[k]; el.className = ''; const n = el.nextElementSibling; if (n && n.classList.contains('rv')) n.remove(); } }));
  $$('[data-c]').forEach(el => el.onchange = () => { const [w, i, f] = el.dataset.c.split('|'); P[w][+i][f] = el.value; redraw(); });
  $$('[data-cx]').forEach(b => b.onclick = () => { const [w, i] = b.dataset.cx.split('|'); P[w].splice(+i, 1); redraw(); });
  $$('[data-ca]').forEach(b => b.onclick = () => { P[b.dataset.ca].push({ floor: '', units: '', use: '', area: '' }); redraw(); });
  $('#cpy').onclick = () => { P.compsNew = structuredClone(P.compsOld || []); redraw(); };
  $$('[data-b]').forEach(el => el.oninput = () => { const [k, f] = el.dataset.b.split('|'); P.bounds[k][f] = el.value; delete P.st[(f === 'desc' ? 'dd_' : 'dl_') + k]; el.classList.remove('st-check'); });
  $('#addPl').onclick = () => { P.plans.push({ title: '', before: '', after: '' }); redraw(); };
  $$('[data-pt]').forEach(el => el.oninput = () => P.plans[+el.dataset.pt].title = el.value);
  $$('[data-px]').forEach(b => b.onclick = () => { if (confirm('تمسح الدور ده؟')) { P.plans.splice(+b.dataset.px, 1); redraw(); } });
  $$('[data-pu]').forEach(b => b.onclick = () => $(`[data-pf="${b.dataset.pu}"]`).click());
  $$('[data-pf]').forEach(el => el.onchange = async () => { const f = el.files[0]; if (!f) return; const [i, w] = el.dataset.pf.split('|'); busy(1); try { const L = await fileImgs(f); P.plans[+i][w] = await putImg(L[0]); for (let j = 1; j < L.length; j++) P.plans.push({ title: '', [w]: await putImg(L[j]) }); } catch (e) { toast(F.authMsg(e), 1); } busy(0); redraw(); });
  $$('[data-oneu]').forEach(b => b.onclick = () => $(`[data-one="${b.dataset.oneu}"]`).click());
  $$('[data-one]').forEach(el => el.onchange = async () => { const f = el.files[0]; if (!f) return; busy(1); try { P[el.dataset.one] = await putImg((await fileImgs(f))[0]); } catch (e) { toast(F.authMsg(e), 1); } busy(0); redraw(); });
  $('#siteU').onclick = () => $('#siteIn').click();
  $('#siteIn').onchange = async e => { busy(1); try { for (const f of e.target.files) P.site.push(await putImg(await toWebp(await fileURL(f), 1600))); } catch (x) { toast(F.authMsg(x), 1); } busy(0); redraw(); };
  $$('[data-rmimg]').forEach(b => b.onclick = () => { const [k, i] = b.dataset.rmimg.split('|'); P[k].splice(+i, 1); redraw(); });
  $('#notes').oninput = e => P.notes = e.target.value.split('\n').map(x => x.trim()).filter(Boolean);
  const din = $('#docIn'); $('#pick').onclick = () => din.click(); din.onchange = () => takeDocs([...din.files]);
  const dz = $('#drop'); ['dragover', 'dragenter'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('ov'); })); ['dragleave', 'drop'].forEach(t => dz.addEventListener(t, () => dz.classList.remove('ov'))); dz.addEventListener('drop', e => { e.preventDefault(); takeDocs([...e.dataTransfer.files]); });
  $('#save').onclick = saveP;
}
const redraw = () => { const y = scrollY; vEdit(P.id, true).then(() => scrollTo(0, y)); };
function busy(on) { let b = $('#busy'); if (on && !b) { b = document.createElement('div'); b.id = 'busy'; b.className = 'pdf-busy'; b.innerHTML = '<div><span class="spinner"></span><b>جارٍ رفع الصور…</b></div>'; document.body.appendChild(b); } else if (!on && b) b.remove(); }
async function takeDocs(files) {
  const m = $('#dzMsg'); m.textContent = 'جارٍ القراءة…'; let n = 0, kinds = [];
  for (const f of files) { try { const r = await readDoc(f, toast); kinds.push(r.kind === 'license' ? 'رخصة' : r.kind === 'deed' ? 'صك' : 'مستند'); n += r.found;
    Object.entries(r.v).forEach(([k, v]) => { if (k === '_comps') { if (v.length && !(P.compsOld || []).length) P.compsOld = v.map(c => ({ floor: c.floor, units: c.units, use: c.use, area: c.area })); return; } if (k.startsWith('_')) return;
      const m2 = k.match(/^d([dls])_(\w)$/); if (m2) { const f2k = { d: 'desc', l: 'len', s: 'set' }[m2[1]]; if (!P.bounds[m2[2]][f2k]) P.bounds[m2[2]][f2k] = v; return; }
      if (!P[k] || P.st[k] === 'check' && r.st[k] === 'auto') { P[k] = v; P.st[k] = r.st[k]; } });
    Object.keys(r.st).filter(k => /^d[dl]_/.test(k)).forEach(k => P.st[k] = 'check');
  } catch (e) { toast(e.message, 1); } }
  await vEdit(P.id, true); $('#dzMsg').textContent = n ? `اتقرا ${n} خانة من (${kinds.join(' + ')}). راجع الصفرا.` : 'مقدرتش أقرا بيانات — اكتبها بإيدك.';
}
async function saveP() {
  const b = $('#save'); b.disabled = true; b.textContent = 'جارٍ الحفظ…';
  const { id, ...data } = P; data.upd = F.serverTimestamp();
  try { if (id) await F.updateDoc(F.doc(db, 'archProjects', id), data); else { data.by = me.uid; data.byName = isOwner ? 'المالك' : (emp && emp.name) || ''; data.at = F.serverTimestamp(); const r = await F.addDoc(F.collection(db, 'archProjects'), data); P.id = r.id; } toast('اتحفظ ✓'); location.hash = 'p/' + P.id; }
  catch (e) { toast(F.authMsg(e), 1); b.disabled = false; b.textContent = 'حفظ المشروع'; }
}

/* ---------- صفحة المشروع: المستندات ---------- */
async function vProject(id) {
  await loadS(); try { const s = await F.getDoc(F.doc(db, 'archProjects', id)); if (!s.exists()) return toast('مش موجود', 1); P = Object.assign(blankP(), s.data(), { id }); } catch (e) { return toast(F.authMsg(e), 1); }
  frame(`${back('#list', 'كل المشاريع')}<div class="ar-head"><div><h1 class="sv-h">${esc(P.owner || 'مشروع')}</h1><p class="desc">قطعة ${esc(P.plot)} — مخطط ${esc(P.plan)} — ${esc(P.district)}${P.licNo ? ` — رخصة <span dir="ltr">${esc(P.licNo)}</span>` : ''}</p></div><a class="btn btn-ghost sm" href="#e/${id}">✎ تعديل البيانات</a></div>
  <div class="ar-docs">${DOCS.map(d => `<button class="ar-doc ${d.ready ? '' : 'off'}" data-d="${d.k}" ${d.ready ? '' : 'disabled'}><span class="i">${d.ready ? '📄' : '⏳'}</span><b>${d.t}</b><small>${d.ready ? (P.docs && P.docs[d.k] ? 'اتطبع ' + esc(P.docs[d.k].at || '') : 'جاهز') : 'بعد اعتماد التصميم'}</small></button>`).join('')}</div>`);
  $$('[data-d]').forEach(b => b.onclick = () => review(b.dataset.d));
}
function warnings(k) {
  const W = [], need = (f, l, lvl = 'bad') => { if (!String(P[f] || '').trim()) W.push([lvl, l + ' فاضي']); };
  need('owner', 'اسم المالك'); need('plot', 'رقم القطعة'); need('district', 'الحي');
  if (k === 'owner') { need('ownerId', 'رقم الهوية / السجل'); need('plan', 'رقم المخطط', 'warn'); }
  if (k === 'tech') { need('deedArea', 'مساحة الأرض', 'warn'); if (!(P.compsOld || []).length) W.push(['warn', 'جدول المكونات السابقة فاضي']); if (!(P.compsNew || []).length) W.push(['warn', 'جدول المكونات المقترحة فاضي']); if (!(P.plans || []).length) W.push(['warn', 'مفيش مخططات قبل/بعد']); if (!P.facade) W.push(['warn', 'مفيش صورة واجهة']);
    const tot = (P.compsNew || []).filter(c => !/سور|أسوار|اسوار/.test(c.floor)).reduce((s, c) => s + (num(c.area) || 0), 0); if (!tot && (P.compsNew || []).length) W.push(['warn', 'مساحات المكونات المقترحة فاضية']);
    Object.entries(DIRS).forEach(([d, l]) => { if (!P.bounds[d].desc) W.push(['warn', `حد ${l} فاضي`]); }); }
  const yl = Object.keys(P.st || {}).filter(x => P.st[x] === 'check'); if (yl.length) W.push(['warn', `فيه ${yl.length} خانة صفرا لسه ما اتراجعتش`]);
  return W;
}
function review(k) {
  const d = DOCS.find(x => x.k === k), W = warnings(k), bad = W.some(w => w[0] === 'bad');
  const ov = document.createElement('div'); ov.className = 'modal-back'; ov.innerHTML = `<div class="rs-card sv-rev"><h2>مراجعة قبل PDF — ${d.t}</h2>${W.length ? `<ul class="sv-w">${W.map(([t, m]) => `<li class="${t}">${t === 'bad' ? '⛔' : '⚠'} ${esc(m)}</li>`).join('')}</ul>` : '<p class="sv-ok">✓ مفيش ملاحظات</p>'}
    <table class="sv-rt"><tr><th>المالك</th><td>${esc(P.owner)}</td></tr><tr><th>هوية / سجل</th><td dir="ltr">${esc(P.ownerId)}</td></tr><tr><th>القطعة / المخطط</th><td>${esc(P.plot)} / ${esc(P.plan)}</td></tr><tr><th>الحي</th><td>${esc(P.district)}</td></tr><tr><th>الرخصة</th><td dir="ltr">${esc(P.licNo)}</td></tr></table>
    <label class="sv-ack"><input type="checkbox" id="ack" ${bad ? 'disabled' : ''}> راجعت البيانات وأتحمل صحتها على مسؤوليتي</label>${bad ? '<p class="hint" style="color:var(--red)">صلّح الأخطاء الحمرا الأول.</p>' : ''}
    <div class="sv-act"><button class="btn btn-ghost" id="rvX">رجوع</button><button class="btn btn-red" id="rvOk" disabled>معاينة وطباعة</button></div></div>`;
  document.body.appendChild(ov); $('#rvX', ov).onclick = () => ov.remove(); const ack = $('#ack', ov), ok = $('#rvOk', ov); ack.onchange = () => ok.disabled = !ack.checked;
  ok.onclick = async () => { ok.disabled = true; try { await F.updateDoc(F.doc(db, 'archProjects', P.id), { [`docs.${k}`]: { at: greg(), by: me.uid, name: isOwner ? 'المالك' : (emp && emp.name) || '' } }); } catch (e) { } ov.remove(); location.hash = `d/${P.id}/${k}`; };
}

/* ---------- الطباعة: ورق الشركة الموحّد ---------- */
const O = () => S.office;
const lhHead = () => `<header class="lh-h"><div class="lh-co"><b>${esc(O().short)}</b><span>${esc(O().sub)}</span></div><img src="assets/img/mark.png" alt=""></header>`;
const lhFoot = n => `<footer class="lh-f"><div class="lh-fl"><span>المملكة العربية السعودية</span><span>العنوان المختصر: <b dir="ltr">${esc(O().nat)}</b></span><span>${esc(O().addr)}</span></div><div class="lh-pg">${n || ''}</div><div class="lh-fr"><span dir="ltr">${esc(O().phone)}</span><span dir="ltr">${esc(O().email)}</span><span>س.ت <b dir="ltr">${esc(O().cr)}</b></span></div></footer>`;
const page = (body, n, cls = '') => `<section class="lh ${cls}"><i class="lh-wm"></i><i class="lh-band"></i>${lhHead()}<div class="lh-b">${body}</div>${lhFoot(n)}</section>`;
const kv = rows => `<table class="dt kv">${rows.map(([k, v, ltr]) => `<tr><th>${k}</th><td ${ltr ? 'dir="ltr"' : ''}>${esc(v || '')}</td></tr>`).join('')}</table>`;
const compsTable = (L, area) => { const T = L.filter(c => !/سور|أسوار|اسوار/.test(c.floor)).reduce((s, c) => s + (num(c.area) || 0), 0); return `<table class="dt"><tr><th>المكوّن</th><th>عدد الوحدات</th><th>الاستخدام</th><th>المساحة</th><th>النسبة</th></tr>${L.map(c => `<tr><td>${esc(c.floor)}</td><td>${esc(c.units)}</td><td>${esc(c.use)}</td><td dir="ltr">${f2(num(c.area))} م²</td><td dir="ltr">${num(area) && !/سور|أسوار|اسوار/.test(c.floor) ? (num(c.area) / num(area) * 100).toFixed(2) + '%' : '—'}</td></tr>`).join('')}<tr class="tot"><td>الإجمالي</td><td colspan="2"></td><td dir="ltr">${f2(T)} م²</td><td></td></tr></table>`; };
async function techReport() {
  const now = new Date(), I = async id => id ? `<img src="${await getImg(id)}" alt="">` : '', pages = [];
  const contents = [['بيانات المكتب الهندسي', 3], ['بيانات المبنى', 3], ['مكونات الرخصة والحدود', 4], ['المخططات قبل وبعد التعديل', 5], ['جدول المقارنة', ''], ['الواجهة وصور الموقع', ''], ['الملاحظات والاعتماد', '']];
  pages.push(page(`<div class="cv"><span class="cv-d">${DAYS[now.getDay()]} ${esc(greg(now))} م — ${esc(hijri(now))} هـ</span><h1>تقرير فني</h1><p class="cv-t">نوع المشروع: <b>${esc(P.projType)}</b></p><div class="cv-r"><span>المطلوب</span><b>${esc(P.req)}</b></div><div class="cv-o"><span>المالك</span><b>${esc(P.owner)}</b><span>قطعة ${esc(P.plot)} — مخطط ${esc(P.plan)} — ${esc(P.district)}</span></div></div>`, 1, 'cover'));
  pages.push(page(`<h2 class="sh">محتويات التقرير</h2><table class="dt toc"><tr><th>م</th><th>البيان</th></tr>${contents.map((c, i) => `<tr><td>${i + 1}</td><td>${c[0]}</td></tr>`).join('')}</table>`, 2));
  pages.push(page(`<h2 class="sh">بيانات المكتب الاستشاري</h2>${kv([['اسم المكتب الهندسي', O().name], ['العنوان', O().addr], ['الجوال', O().phone, 1], ['رقم السجل التجاري', O().cr, 1], ['المدير العام', S.mgr]])}
    <h2 class="sh">بيانات المبنى</h2>${kv([['المالك', P.owner], ['الموقع', `${P.district} - مدينة ${P.city || 'الرياض'}`], ['رقم القطعة', P.plot], ['رقم المخطط', P.plan], ['نوع المبنى', P.projType], ['مساحة الأرض', P.deedArea ? f2(num(P.deedArea)) + ' م²' : ''], ['رقم الرخصة', P.licNo, 1], ['البند المطلوب فحصه', 'تقرير فني ' + P.req], ['التاريخ', greg(now) + ' م', 1]])}`, 3));
  pages.push(page(`<h2 class="sh">مكونات رخصة البناء السابقة</h2>${compsTable(P.compsOld || [], P.deedArea)}<h2 class="sh">مكونات رخصة البناء حسب المخطط المقترح</h2>${compsTable(P.compsNew || [], P.deedArea)}
    <h2 class="sh">الحدود والأطوال والارتدادات حسب المخطط المقترح</h2><table class="dt"><tr><th>الجهة</th><th>حدود الأرض</th><th>الطول</th><th>الارتداد</th></tr>${Object.entries(DIRS).map(([k, l]) => `<tr><td>${l}</td><td>${esc(P.bounds[k].desc || '')}</td><td dir="ltr">${f2(num(P.bounds[k].len))} م</td><td dir="ltr">${f2(num(P.bounds[k].set))} م</td></tr>`).join('')}</table>`, 4));
  let n = 5; for (const pl of P.plans || []) pages.push(page(`<h2 class="sh">التعديلات في المخطط${pl.title ? ' — ' + esc(pl.title) : ''}</h2><div class="ba"><figure><figcaption>قبل التعديل</figcaption>${await I(pl.before)}</figure><figure><figcaption class="aft">بعد التعديل</figcaption>${await I(pl.after)}</figure></div>`, n++));
  const old = P.compsOld || [], nw = P.compsNew || [];
  pages.push(page(`<h2 class="sh">جدول المقارنة بين المساحات واختلاف المساحات على الطبيعة عن المخططات المعتمدة</h2><table class="dt"><tr><th>المكوّن</th><th>حسب الرخصة</th><th>حسب المخطط المقترح</th><th>الاستخدام</th><th>مقدار الزيادة</th></tr>${nw.map((c, i) => { const o = old.find(x => nk(x.floor) === nk(c.floor)) || old[i] || {}; const d = (num(c.area) || 0) - (num(o.area) || 0); return `<tr><td>${esc(c.floor)}</td><td dir="ltr">${f2(num(o.area))}</td><td dir="ltr">${f2(num(c.area))}</td><td>${esc(c.use)}</td><td dir="ltr" class="${d > 0 ? 'up' : ''}">${f2(d)}</td></tr>`; }).join('')}</table>`, n++));
  if (P.facade) pages.push(page(`<h2 class="sh">صورة الواجهة</h2><div class="one">${await I(P.facade)}</div>`, n++));
  if ((P.site || []).length) pages.push(page(`<h2 class="sh">صور من الطبيعة</h2><div class="grid-ph">${(await Promise.all(P.site.slice(0, 4).map(I))).join('')}</div>`, n++));
  if (P.system) pages.push(page(`<h2 class="sh">نظام البناء المعتمد</h2><div class="one">${await I(P.system)}</div>`, n++));
  const notes = (P.notes && P.notes.length ? P.notes : S.techNotes) || [];
  pages.push(page(`<h2 class="sh">الملاحظات</h2><ol class="nt">${notes.map(x => `<li>${esc(x)}</li>`).join('')}</ol><div class="sig-blk"><div><span>${esc(S.mgrTitle)}</span><b>${esc(S.mgr)}</b>${S.mgrSig ? `<img class="sg" src="${S.mgrSig}" alt="">` : ''}</div>${S.stamp ? `<img class="stp" src="${S.stamp}" alt="">` : '<div class="stp ph">الختم</div>'}</div>`, n++));
  return pages.join('');
}
function ownerPledge() {
  const ln = v => `<b class="fv">${esc(v || '')}</b>`;
  return `<section class="lh am"><i class="lh-wm"></i><header class="am-h"><div class="am-t">${(S.amanah || []).map((x, i) => `<span class="${i ? '' : 'b'}">${esc(x)}</span>`).join('')}</div>${S.amanahLogo ? `<img src="${S.amanahLogo}" alt="">` : ''}<div class="am-ttl">نموذج تعهد المالك</div></header>
  <div class="lh-b"><p class="am-in">أتعهد أنا: ${ln(P.owner)} هوية / سجل رقم: ${ln(P.ownerId)} مالك المشروع لقطعة الأرض رقم: ${ln(P.plot)} ضمن المخطط التنظيمي رقم: ${ln(P.plan)} بحي: ${ln(String(P.district || '').replace(/^حي\s*/, ''))} بالالتزام بالتالي:</p>
  <ul class="am-l">${(S.pledge || PLEDGE).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  <div class="am-s"><div><span>الاسم:</span>${ln(P.owner)}</div><div><span>التوقيع:</span><i></i></div><div><span>التاريخ:</span>${ln(greg())}</div><div><span>رقم التواصل:</span><i></i></div></div></div>
  <footer class="am-f"><span>${esc(O().name)}</span><span dir="ltr">${esc(O().phone)}</span></footer></section>`;
}
async function vDoc(id, k) {
  await loadS(); try { const s = await F.getDoc(F.doc(db, 'archProjects', id)); P = Object.assign(blankP(), s.data(), { id }); } catch (e) { return toast(F.authMsg(e), 1); }
  const d = DOCS.find(x => x.k === k); root.innerHTML = `<div class="sv-pbar">${back('#p/' + id, 'ملف المشروع')}<span id="pst">جارٍ التجهيز…</span><button class="btn btn-red" id="prt" disabled>🖨 طباعة / حفظ PDF</button></div><div id="sheet" class="lh-doc"></div>`;
  $('#sheet').innerHTML = k === 'tech' ? await techReport() : k === 'owner' ? ownerPledge() : '<p class="empty">المستند ده هيتعمل بعد اعتماد التصميم</p>';
  document.title = `${d.t} — ${P.owner || ''}`; await Promise.all($$('#sheet img').map(i => i.decode ? i.decode().catch(() => { }) : 0));
  $('#pst').textContent = 'جاهز ✓'; const b = $('#prt'); b.disabled = false; b.onclick = () => window.print();
}

/* ---------- كل المشاريع ---------- */
async function vList() {
  frame(`${back('#', 'قسم المعماري')}<h1 class="sv-h">كل المشاريع</h1><div class="sv-mapbar"><input id="fq" class="in" placeholder="بحث بالمالك أو القطعة أو الرخصة"><a class="btn btn-red sm" href="#new">＋ مشروع جديد</a></div><div id="lst"><div class="ld-box"><div class="spinner"></div><b>جاري التحميل…</b></div></div>`);
  let L = []; try { L = (await F.getDocs(F.query(F.collection(db, 'archProjects'), F.orderBy('at', 'desc'), F.limit(300)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { $('#lst').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
  const paint = () => { const q = nk($('#fq').value), X = L.filter(r => !q || nk([r.owner, r.plot, r.plan, r.district, r.licNo].join(' ')).includes(q));
    $('#lst').innerHTML = X.length ? `<div class="sv-tw"><table class="sv-t sv-lt"><tr><th>المالك</th><th>القطعة / المخطط</th><th>الحي</th><th>الرخصة</th><th>المطلوب</th><th>المستندات</th><th></th></tr>${X.map(r => `<tr><td><b>${esc(r.owner)}</b></td><td>${esc(r.plot)} / ${esc(r.plan)}</td><td>${esc(r.district)}</td><td dir="ltr">${esc(r.licNo)}</td><td>${esc(r.req)}</td><td>${Object.keys(r.docs || {}).length}</td><td class="ac"><a class="btn btn-ghost sm" href="#p/${r.id}">فتح</a></td></tr>`).join('')}</table></div>` : '<p class="empty">مفيش مشاريع</p>'; };
  $('#fq').oninput = paint; paint();
}

/* ---------- غرفة التحكم ---------- */
const imgData = (file, max = 520) => fileURL(file).then(src => new Promise(r => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); r(c.toDataURL('image/png')); }; im.src = src; }));
async function vCtl(keep) {
  if (!keep) await loadS(); const s = S;
  const inp = (k, l, ltr) => `<div class="fld"><label>${l}</label><input data-o="${k}" value="${esc(s.office[k] || '')}" ${ltr ? 'dir="ltr"' : ''}></div>`;
  const imgBox = (k, l, h) => `<div class="sv-img"><b>${l}</b><div class="pv">${s[k] ? `<img src="${s[k]}" alt="">` : '<small>لسه ما اترفعش</small>'}</div><input type="file" accept="image/*" data-img="${k}" hidden><div style="display:flex;gap:6px"><button class="btn btn-ghost sm" data-up="${k}">رفع صورة</button>${s[k] ? `<button class="btn btn-ghost sm" data-rm="${k}" style="color:var(--red)">مسح</button>` : ''}</div>${h ? `<small class="hint">${h}</small>` : ''}</div>`;
  frame(`${back('#', 'قسم المعماري')}<h1 class="sv-h">غرفة التحكم — المعماري</h1>
  <section class="card"><h3>بيانات المكتب (رأس وتذييل الورق)</h3><div class="sv-grid">${inp('name', 'الاسم الكامل')}${inp('short', 'الاسم في الرأس')}${inp('sub', 'السطر التاني')}${inp('addr', 'العنوان')}${inp('nat', 'العنوان المختصر', 1)}${inp('phone', 'الجوال', 1)}${inp('cr', 'السجل التجاري', 1)}${inp('email', 'البريد', 1)}<div class="fld"><label>المدير العام</label><input id="mgr" value="${esc(s.mgr)}"></div></div></section>
  <section class="card"><h3>التوقيع والختم والشعارات</h3><div class="sv-imgs">${imgBox('mgrSig', 'توقيع المدير', 'PNG بخلفية شفافة')}${imgBox('stamp', 'الختم')}${imgBox('amanahLogo', 'شعار الأمانة (للنماذج)', 'ارفعه من النموذج الرسمي')}</div></section>
  <section class="card"><h3>رأس نماذج الأمانة</h3><textarea id="am" class="in" rows="3">${esc((s.amanah || []).join('\n'))}</textarea></section>
  <section class="card"><h3>نص تعهد المالك</h3><p class="hint">فقرة في كل سطر — نفس صياغة الأمانة، عدّل لو اتغيّرت.</p><textarea id="pl" class="in" rows="12">${esc((s.pledge || PLEDGE).join('\n'))}</textarea><button class="btn btn-ghost sm" id="plR">رجّع النص الأصلي</button></section>
  <section class="card"><h3>ملاحظات التقرير الفني الافتراضية</h3><textarea id="tn" class="in" rows="4">${esc((s.techNotes || []).join('\n'))}</textarea></section>
  <section class="card"><h3>القوائم</h3><div class="row2"><div class="fld"><label>أنواع المشاريع</label><textarea id="pt" class="in" rows="5">${esc(s.projTypes.join('\n'))}</textarea></div><div class="fld"><label>المطلوب</label><textarea id="rq" class="in" rows="5">${esc(s.reqs.join('\n'))}</textarea></div></div></section>
  <div class="sv-act sticky"><button class="btn btn-red" id="sv">حفظ الإعدادات</button></div>`);
  const lines = id => $(id).value.split('\n').map(x => x.trim()).filter(Boolean);
  const collect = () => { $$('[data-o]').forEach(e => s.office[e.dataset.o] = e.value); s.mgr = $('#mgr').value; s.amanah = lines('#am'); s.pledge = lines('#pl'); s.techNotes = lines('#tn'); s.projTypes = lines('#pt'); s.reqs = lines('#rq'); };
  $('#plR').onclick = () => { $('#pl').value = PLEDGE.join('\n'); };
  $$('[data-up]').forEach(b => b.onclick = () => $(`[data-img="${b.dataset.up}"]`).click());
  $$('[data-img]').forEach(e => e.onchange = async () => { if (!e.files[0]) return; collect(); s[e.dataset.img] = await imgData(e.files[0]); const y = scrollY; await vCtl(true); scrollTo(0, y); });
  $$('[data-rm]').forEach(b => b.onclick = async () => { collect(); s[b.dataset.rm] = ''; const y = scrollY; await vCtl(true); scrollTo(0, y); });
  $('#sv').onclick = async () => { collect(); const b = $('#sv'); b.disabled = true; try { await F.setDoc(F.doc(db, 'archSettings', 'main'), JSON.parse(JSON.stringify(s))); toast('اتحفظ ✓'); } catch (e) { toast(F.authMsg(e), 1); } b.disabled = false; };
}

function route() {
  if (!me) return; const h = location.hash.slice(1);
  if (h === 'new') return vEdit(null);
  if (h.startsWith('e/')) return vEdit(h.slice(2));
  if (h.startsWith('p/')) return vProject(h.slice(2));
  if (h.startsWith('d/')) { const [, id, k] = h.split('/'); return vDoc(id, k); }
  if (h === 'list') return vList();
  if (h === 'ctl') return vCtl();
  vHome();
}
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
F.onAuthStateChanged(auth, async u => {
  if (!u) { location.replace('portal.html'); return; }
  me = u; isOwner = await F.ownerOf(u.uid);
  if (!isOwner) { try { const s = await F.getDoc(F.doc(db, 'employees', u.uid)); emp = s.exists() ? s.data() : null; } catch (e) { emp = null; } }
  if (!can('arch')) { frame(`${back('portal.html', 'البوابة')}<div class="card" style="text-align:center;padding:40px"><h2>مفيش صلاحية</h2><p style="color:var(--mut);margin-top:8px">قسم المعماري محتاج صلاحية «قسم المعماري» من المالك.</p></div>`); return; }
  route();
});
