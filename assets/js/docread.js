// قراءة الصك (السجل العقاري / العدل) ورخصة البناء (بلدي) من PDF أو صورة
// كل خانة بترجع بحالتها: auto = اتقرت من جدول بثقة، check = تخمين لازم يتراجع (بتظهر صفرا)
const toEn = s => String(s ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
export const N = s => toEn(String(s ?? '').normalize('NFKC')).replace(/اال/g, 'الا').replace(/[\u200e\u200f\u202a-\u202e]/g, '').replace(/\s+/g, ' ').trim();
export const nk = s => N(s).replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
export const num = v => { const x = parseFloat(toEn(String(v ?? '')).replace(/[^\d.\-]/g, '')); return isFinite(x) ? x : NaN; };
let pdfjs = null;
const loadScript = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('تعذّر تحميل قارئ الـ PDF — اتأكد من الإنترنت')); document.head.appendChild(s); });
export async function getPdfjs() { if (pdfjs) return pdfjs; await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'); pdfjs = window.pdfjsLib; pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; return pdfjs; }
export async function pdfItems(file) {
  const lib = await getPdfjs(), doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise, out = [];
  for (let p = 1; p <= Math.min(doc.numPages, 4); p++) { const pg = await doc.getPage(p), tc = await pg.getTextContent(); tc.items.forEach(it => { const s = N(it.str); if (s) out.push({ p, s, x: it.transform[4] + (it.width || 0) / 2, y: it.transform[5] }); }); }
  return out;
}
// صفحات الـ PDF كصور (للمخططات قبل/بعد)
export async function pdfPages(file, scale = 1.6, max = 12) {
  const lib = await getPdfjs(), doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise, out = [];
  for (let p = 1; p <= Math.min(doc.numPages, max); p++) { const pg = await doc.getPage(p), vp = pg.getViewport({ scale }), c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height; await pg.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise; out.push(c.toDataURL('image/jpeg', .82)); }
  return out;
}
const rv = t => [...t].reverse().join(''), eq = (a, L) => nk(a) === nk(L) || rv(nk(a)) === nk(L);
const HD = ['المساحه', 'القطعه', 'البلك', 'المخطط', 'الحي', 'المدينه', 'استعمالاتها', 'رقم الهويه', 'نوع الهويه', 'نسبه التملك', 'الجنسيه', 'مالك العقار'];
function under(items, labels, maxDy = 70) {
  for (const L of labels) { const hs = items.filter(i => eq(i.s, L)).sort((a, b) => a.y - b.y);
    for (const h of hs) { const c = items.filter(i => i.p === h.p && i.y < h.y && h.y - i.y < maxDy && Math.abs(i.x - h.x) < 60 && !HD.some(x => eq(i.s, x))).sort((a, b) => (b.y - a.y) || Math.abs(a.x - h.x) - Math.abs(b.x - h.x));
      if (c[0]) { const row = c.filter(i => Math.abs(i.y - c[0].y) < 2.5 && Math.abs(i.x - h.x) < 60); return row.every(i => /^[\d./\-]+$/.test(i.s)) ? row.sort((a, b) => a.x - b.x).map(i => i.s).join('') : row.sort((a, b) => b.x - a.x).map(i => i.s).join(' '); } } }
  return '';
}
function after(text, labels) { for (const L of labels) { const m = text.match(new RegExp(L + '\\s*[:/\\-]?\\s*([^\\n:]{1,40})')); if (m) return N(m[1]).replace(/^[\s:/-]+/, ''); } return ''; }
const sameRow = (items, it, tol = 3) => items.filter(i => i.p === it.p && Math.abs(i.y - it.y) < tol).sort((a, b) => b.x - a.x); // من اليمين للشمال
const isNum = s => /^-?[\d.,]+$/.test(s);
// صفوف الحدود في الرخصة: [وصف | طول | ارتداد] — الترتيب شمال، جنوب، شرق، غرب
function licBounds(items) {
  const D = ['N', 'S', 'E', 'W'], rows = [];
  items.filter(i => /^(قطعه|قطعة|شارع|ممر|جار|حديقه|حديقة|مواقف|ارض|أرض|ساحه|ساحة|مسجد|مدرسه|مدرسة)/.test(i.s)).forEach(it => { const r = sameRow(items, it), nums = r.filter(i => i.x < it.x && isNum(i.s)); if (nums.length >= 1 && !rows.some(x => x.y === it.y && x.p === it.p)) rows.push({ p: it.p, y: it.y, desc: it.s, len: num(nums[0].s), set: nums[1] ? num(nums[1].s) : NaN }); });
  rows.sort((a, b) => a.p - b.p || b.y - a.y);
  return rows.slice(0, 4).map((r, i) => ({ dir: D[i], desc: r.desc, len: r.len, set: r.set }));
}
// مكونات البناء في الرخصة: [الدور | عدد | الاستخدام | عدد | المساحة]
const FLOORS = /^(قبو|بدروم|دور|الدور|ملحق|أسوار|اسوار|سور|ميزانين|سطح|مواقف)/;
function licComps(items) {
  const out = [];
  items.filter(i => FLOORS.test(i.s)).forEach(it => { const r = sameRow(items, it).filter(i => i.x < it.x); if (!r.length) return; const nums = r.filter(i => isNum(i.s)), use = r.find(i => !isNum(i.s));
    if (!nums.length || out.some(o => o.y === it.y && o.p === it.p)) return; out.push({ p: it.p, y: it.y, floor: it.s, units: nums[0] ? nums[0].s : '', use: use ? use.s : '', count: nums.length > 2 ? nums[1].s : '', area: num(nums[nums.length - 1].s) }); });
  out.sort((a, b) => a.p - b.p || b.y - a.y);
  return out.map(({ p, y, ...o }) => o);
}
export function boundsText(text) {
  const o = {}; const R = { N: 'شمال', S: 'جنوب', E: 'شرق', W: 'غرب' };
  Object.entries(R).forEach(([k, w]) => { const m = text.replace(/\s+/g, ' ').match(new RegExp(w + '[يىاًأا]*\\s*[:：]\\s*(.{2,60}?)\\s*بطول\\s*:?\\s*\\(?\\s*([\\d.,]+)')); if (m) o[k] = { desc: N(m[1]).replace(/[،,:]$/, ''), len: num(m[2]) }; });
  return o;
}
// صورة/صفحات → صور JPEG مضغوطة (أي حجم ملف بيدخل)
export const fileURL = f => new Promise((r, j) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = j; fr.readAsDataURL(f); });
export const shrink = (src, max = 1800, q = .85) => new Promise(r => { const im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.naturalWidth * k)); c.height = Math.max(1, Math.round(im.naturalHeight * k)); const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height); r(c.toDataURL('image/jpeg', q)); }; im.onerror = () => r(''); im.src = src; });
export const isPdf = f => /pdf/i.test(f.type) || /\.pdf$/i.test(f.name || '');
export async function fileToImages(f, max = 3) { if (isPdf(f)) return Promise.all((await pdfPages(f, 2, max)).map(d => shrink(d, 1800))); return [await shrink(await fileURL(f), 2000)]; }
// إعدادات قارئ الـ AI (بيتحط رابطه من غرفة التحكم)
let AI = { url: '', getToken: null };
export const setAI = o => { AI = Object.assign(AI, o || {}); };
export const aiReady = () => !!AI.url;
export async function aiRead(images, hint) {
  if (!AI.url) throw new Error('قارئ الـ AI مش متوصّل — حط رابطه من غرفة التحكم');
  const tok = AI.getToken ? await AI.getToken() : '';
  const r = await fetch(AI.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: JSON.stringify({ images: images.slice(0, 4), hint: hint || '' }) });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || ('AI ' + r.status)); return j;
}
// تحويل رد الـ AI لنفس شكل القراءة العادية — كله «راجعها»
export function fromAI(j) {
  const v = {}, st = {}, F = j.fields || {};
  Object.entries(F).forEach(([k, x]) => { x = N(x); if (!x) return; if (k === 'lat' || k === 'lng') { v['_' + k] = +x; return; } v[k] = x; st[k] = 'check'; });
  if (v.deedArea) v.deedArea = String(num(v.deedArea) || v.deedArea);
  Object.entries(j.bounds || {}).forEach(([d, b]) => { if (!b) return; if (N(b.desc)) { v['dd_' + d] = N(b.desc); st['dd_' + d] = 'check'; } if (N(b.len)) { v['dl_' + d] = String(num(b.len) || N(b.len)); st['dl_' + d] = 'check'; } if (N(b.set)) v['ds_' + d] = String(num(b.set)); });
  if (Array.isArray(j.comps) && j.comps.some(c => c && c.floor)) v._comps = j.comps.filter(c => c && c.floor).map(c => ({ floor: N(c.floor), units: N(c.units), use: N(c.use), area: num(c.area) }));
  return { v, st, ocr: true, ai: true, kind: j.kind || 'other', planTitle: N(j.planTitle), planStage: j.planStage || '', unsure: j.unsure || [], found: Object.keys(v).filter(k => !k.startsWith('_')).length };
}
let tess = null;
async function ocrImages(images, toast) {
  if (!tess) { await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js'); tess = window.Tesseract; }
  toast('بنقرأ بالـ OCR… أول مرة بتاخد دقيقة عشان ملف اللغة العربية');
  const w = await tess.createWorker('ara+eng'); let t = ''; try { for (const im of images) { const r = await w.recognize(im); t += '\n' + r.data.text; } } finally { await w.terminate(); }
  return N(t.replace(/\n/g, ' \n '));
}
// القراءة: PDF فيه كلام ← مباشر (أخضر). صورة أو PDF متصوّر ← الـ AI، ولو مش متاح ← OCR
export async function readDoc(file, toast = () => { }, hint) {
  let items = [], text = '';
  if (isPdf(file)) { items = await pdfItems(file); text = items.map(i => i.s).join('\n'); }
  if (text.replace(/\s/g, '').length > 40) { const r = parse(items, text, false); r.text = true; return r; }
  toast('الملف صورة — بنقراه…'); const images = await fileToImages(file);
  if (!images.filter(Boolean).length) throw new Error('الملف مش صورة ولا PDF مفهوم');
  if (AI.url) { try { toast('الـ AI بيقرا المستند…'); const r = fromAI(await aiRead(images, hint)); r.images = images; return r; } catch (e) { toast('الـ AI: ' + e.message + ' — هنجرّب OCR', 1); } }
  const t = await ocrImages(images, toast); const r = parse([], t, true); r.images = images; return r;
}
export function parse(items, text, ocr) {
  text = toEn(String(text || '').normalize('NFKC'));
  const v = {}, st = {}, put = (k, val, sure) => { val = N(val); if (!val || v[k]) return; v[k] = val; st[k] = sure && !ocr ? 'auto' : 'check'; };
  const isLic = /رخص[هة] بناء/.test(text), isDeed = /صك|السجل العقاري|رقم العقار/.test(text) && !isLic;
  // الصك: جداول بعناوين أعمدة
  const U = (k, L, md) => { const x = under(items, L, md); if (x) put(k, x, true); };
  U('plot', ['القطعة', 'رقم القطعة']); U('plan', ['المخطط', 'رقم المخطط']); U('district', ['الحي']); U('city', ['المدينة']); U('block', ['البلك']);
  const ar = under(items, ['المساحة', 'مساحة الأرض']); if (ar && isFinite(num(ar))) put('deedArea', String(num(ar)), true);
  U('owner', ['مالك العقار', 'اسم المالك'], 90); U('ownerId', ['رقم الهوية'], 90); U('landUse', ['استعمالاتها']);
  const dn = (text.match(/رقم العقار\s*[:/]?\s*(\d{6,})/) || text.match(/(\d{6,})\s*\/?\s*\n?رقم العقار/) || text.match(/رقم الصك\s*[:/]?\s*(\d{6,})/) || [])[1]; if (dn) put('deedNo', dn, true);
  // الرخصة: مفيش عناوين في طبقة النص — بنقرأ بالأنماط وكله بيبقى «راجعها»
  if (isLic) {
    const ln = (text.match(/\b(1\d{14})\b/) || [])[1]; put('licNo', ln, false);
    const lt = (text.match(/((?:تعديل|تجديد|إصدار|اصدار|هدم|ترميم)\s+رخص[هة] بناء)/) || [])[1]; put('licType', lt, false);
    const lines = text.split('\n'); const ow = lines.find(l => /^(مؤسس[هة]|شرك[هة]|مكتب)/.test(l) && !/الشمراني/.test(l)); if (ow) put('owner', ow, false);
    const idn = (text.match(/\b([127]\d{9})\b/) || [])[1]; put('ownerId', idn, false);
    const dst = (text.match(/حي\s+([^\n|]{2,25})/) || [])[1]; put('district', dst ? 'حي ' + dst.replace(/^حي\s*/, '') : '', false);
    const reg = items.find(i => /سجل عقاري|صك/.test(i.s)); if (reg) { const r = sameRow(items, reg, 4), right = r.filter(i => i.x > reg.x).sort((a, b) => a.x - b.x), left = r.filter(i => i.x < reg.x).sort((a, b) => b.x - a.x); if (right[0]) put('plan', right[0].s, false); if (right[1]) put('plot', right[1].s, false); const dno = left.find(i => /^\d{10,}$/.test(i.s)); if (dno) put('deedNo', dno.s, false); const dd = left.find(i => /\d{4}-\d{2}-\d{2}/.test(i.s)); if (dd) put('deedDate', dd.s, false); }
    const B = licBounds(items); B.forEach(b => { v['dd_' + b.dir] = b.desc; v['dl_' + b.dir] = isFinite(b.len) ? String(b.len) : ''; if (isFinite(b.set)) v['ds_' + b.dir] = String(b.set); st['dd_' + b.dir] = st['dl_' + b.dir] = 'check'; });
    v._comps = licComps(items);
    const area = items.find(i => /^\d{2,5}\.\d$/.test(i.s) && num(i.s) >= 100 && !v._comps.some(c => c.area === num(i.s)) && !B.some(b => b.len === num(i.s))); if (area) put('deedArea', String(num(area.s)), false);
    const ll = text.match(/\b(2\d\.\d{5,})\b[\s\S]{0,40}?\b(4\d\.\d{5,})\b/); if (ll) { v._lat = +ll[1]; v._lng = +ll[2]; }
    const dts = [...text.matchAll(/\b(\d{2}\/\d{2}\/14\d{2})\b/g)].map(m => m[1]); if (dts[0]) put('licDate', dts[0], false); if (dts[1]) put('licEnd', dts[1], false);
  }
  // صكوك العدل القديمة (OCR)
  const tx = text.replace(/\s+/g, ' ');
  const mo = (re, k) => { const m = tx.match(re); if (m) put(k, m[1], false); };
  mo(/الرقم\s*:?\s*(\d{8,14})/, 'deedNo'); mo(/التاريخ\s*:?\s*(\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*14\d{2})/, 'deedDate');
  mo(/قطع[ةه] الار[ضظ] رقم\s*:?\s*(بدون|[\d\/]+)/, 'plot'); mo(/المخطط رقم\s*:?\s*([\d\/]+)/, 'plan'); mo(/الواقع في حي\s+([^\s،,]+)/, 'district'); mo(/بمدينة\s+([^\s،,.]+)/, 'city');
  mo(/مساحتها\s*:?\s*\(?\s*([\d.,]+)/, 'deedArea'); mo(/انتقلت ملكيتها\s*(?:لـ|ل)?\s*:?\s*(.+?)\s+(?:سعودي|بموجب|الجنسية)/, 'owner'); mo(/سجل مدني رقم\s*:?\s*(\d{10})/, 'ownerId');
  if (v.deedDate) v.deedDate = v.deedDate.replace(/\s+/g, '').split('/').reverse().join('/');
  if (v.deedArea) v.deedArea = String(num(v.deedArea));
  // عام
  if (!v.plot) put('plot', after(text, ['رقم القطعة', 'القطعة رقم', 'قطعة رقم']), false);
  if (!v.plan) put('plan', after(text, ['رقم المخطط', 'المخطط رقم', 'مخطط رقم']), false);
  if (!v.district) put('district', after(text, ['الحي']), false);
  if (!v.deedDate) { const dd = (text.match(/(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/) || [])[1]; put('deedDate', dd, false); }
  const sec = (text.match(/(قطاع\s+[^\n]{3,30}?مدينة\s+الرياض)/) || [])[1]; put('sector', sec, !!sec);
  if (!isLic) { const b = boundsText(text); Object.entries(b).forEach(([k, x]) => { v['dd_' + k] = x.desc; v['dl_' + k] = String(x.len); st['dd_' + k] = st['dl_' + k] = 'check'; }); }
  ['owner', 'district'].forEach(k => { if (v[k] && /\Sال\S/.test(v[k].replace(/(^|\s)(و|ب|ف|ك|ل)?ال/g, ' '))) st[k] = 'check'; });
  return { v, st, ocr, kind: isLic ? 'license' : isDeed ? 'deed' : 'doc', found: Object.keys(v).filter(k => !k.startsWith('_')).length };
}
