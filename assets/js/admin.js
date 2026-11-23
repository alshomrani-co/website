// لوحة التحكم الكاملة: كل محتوى الموقع + الصور + الموظفين + كود الدعوة + النسخ الاحتياطي
import * as F from './fb.js';
import { DEFAULT, migrate } from './data.js';
import * as V5 from './admin-v5.js';
import { EN } from './data-en.js';
import * as X from './admin-x.js';
const { auth, db, MODULES } = F;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const root = $('#root');
function toast(t, bad) { const e = $('#toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 2600); }
const deepMerge = (a, b) => { if (Array.isArray(a) || typeof a !== 'object' || !a) return b === undefined ? a : b; const o = { ...a }; for (const k in (b || {})) o[k] = (k in a) ? deepMerge(a[k], b[k]) : b[k]; return o; };

/* ---------- labels ---------- */
const L = {
  name: 'الاسم', short: 'الاسم المختصر', en: 'الاسم بالإنجليزي', tagline: 'الشعار', founded: 'سنة التأسيس',
  phone: 'الجوال', phone2: 'جوال/هاتف إضافي', whatsapp: 'رقم الواتساب (بالصيغة الدولية بدون +)', email: 'البريد', address: 'العنوان', map: 'رابط الخريطة', hours: 'أوقات العمل', waText: 'رسالة الواتساب الافتراضية', mapEmbed: 'رابط تضمين الخريطة',
  instagram: 'إنستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات', x: 'إكس (تويتر)', youtube: 'يوتيوب', linkedin: 'لينكدإن', facebook: 'فيسبوك',
  on: 'تفعيل', text: 'النص', link: 'الرابط', title: 'العنوان', sub: 'وصف مختصر', btn: 'نص الزر', img: 'الصورة', delay: 'يظهر بعد (ثواني)',
  eyebrow: 'السطر الصغير فوق العنوان', highlight: 'الجزء الملوّن من العنوان', lead: 'الفقرة التعريفية', cta1: 'الزر الأساسي', cta2: 'الزر الثاني', video: 'فيديو الخلفية', poster: 'صورة الغلاف (تظهر قبل الفيديو)',
  n: 'الرقم', pre: 'قبل الرقم', suf: 'بعد الرقم', l: 'الوصف', plain: 'رقم بدون عدّاد متحرك',
  id: 'المعرّف (بالإنجليزي، بدون مسافات)', no: 'الترتيب', desc: 'الوصف', items: 'البنود', fit: 'مناسبة لـ', long: 'الوصف التفصيلي', icon: 'الأيقونة',
  cat: 'التصنيف', tag: 'الوسم', loc: 'الموقع', year: 'السنة', client: 'العميل',
  price: 'السعر', unit: 'العملة/الوحدة', note: 'ملاحظة تحت السعر', featured: 'باقة مميزة (مُبرزة)', features: 'المميزات', list: 'القائمة', badge: 'الشارة',
  story: 'قصة الشركة (فقرات)', quotes: 'اقتباسات', ceo: 'المدير التنفيذي', role: 'المنصب', quote: 'الاقتباس', why: 'ليش نحن', steps: 'خطوات العمل', licenses: 'التراخيص', isic: 'الأنشطة (ISIC)', code: 'الرمز', num: 'الرقم', t: 'العنوان', d: 'الوصف',
  addr: 'العنوان', auth: 'الجهة', q: 'السؤال', a: 'الإجابة', depts: 'الأقسام في نموذج الدعم', label: 'التسمية', href: 'الرابط', url: 'الرابط',
  until: 'ينتهي العرض في (تاريخ)', youtubeKey: 'مفتاح YouTube API (اختياري — يجيب كل فيديوهات القناة لوحده)', videoMobile: 'فيديو الفون (طولي 9:16 — اختياري)',
  replyNote: 'ملاحظة وقت الرد', cap: 'تعليق على الصورة', gallery: 'صور المشروع (أكتر من صورة)', keywords: 'الكلمات المفتاحية — افصل بينها بفاصلة (،)', videoSrc: 'ملف الفيديو', video: 'تشغيل فيديو الخلفية', scope: 'نطاق العمل', quote2: 'اقتباس ثاني', ceoTitle: 'مسمى المدير', fields: 'المجالات',
  grp: 'المجموعة (المساحة، السلامة، المخططات، الواجهات، التصميم الداخلي — افصل بفاصلة)', key: 'المفتاح (لازم يطابق «المجموعة» في المشاريع)', subs: 'تفاصيل الخدمات الفرعية (صفحة لكل بند)', intro: 'مقدمة الخدمة', docs: 'المستندات المطلوبة', dur: 'المدة المتوقعة', chatLabel: 'كلمة زر الشات (مثلاً: تحدث معنا)', appLine: 'سطر تحميل التطبيق في الواجهة', playStore: 'رابط Google Play (لو فاضي: تثبيت التطبيق من المتصفح)', appStore: 'رابط App Store (لو فاضي: تعليمات الإضافة للشاشة الرئيسية)'
};
const lab = k => L[k] || KEYT[k] || k;
const IMGK = /^(img|poster|logo|image|photo|cover)$/i;
const LONGK = /^(intro|lead|desc|text|a|long|quote|story|note|confidential|sub|d)$/;

/* ---------- sections ---------- */
const SECTIONS = [
  { h: 'الإدارة' },
  { id: 'dash', t: 'نظرة عامة', ic: '◉' },
  { id: 'stats', t: 'الإحصائيات والزوار', ic: '📈' },
  { id: 'leads', t: 'العملاء المحتملين', ic: '☎' },
  { id: 'team', t: 'الموظفين والصلاحيات', ic: '☺', own: 1 },
  { id: 'owners', t: 'المُلّاك', ic: '♛', own: 1 },
  { id: 'tickets', t: 'الدعم والمحادثات', ic: '✉', href: 'portal.html#support' },
  { id: 'sup', t: 'الإشراف والعملاء', ic: '▤', href: 'supervision.html' },
  { h: 'الشكل' },
  { id: 'design', t: 'اللوجو والألوان والخطوط', ic: '🎨' },
  { id: 'video', t: 'فيديو الواجهة', ic: '▶' },
  { id: 'pages', t: 'الصفحات (ترتيب وأحجام)', ic: '☰' },
  { id: 'occasion', t: 'المناسبات والأعياد', ic: '🎉' },
  { h: 'المحتوى' },
  { id: 'hero', t: 'الواجهة والأرقام', keys: ['hero', 'stats'], ic: '◧', d: 'العنوان الكبير والأزرار والأرقام اللي تحت الفيديو.' },
  { id: 'offer', t: 'العروض', keys: ['offer', 'announce', 'popup'], ic: '🎁', d: 'عرض يظهر للناس بشكل واضح في الرئيسية بعدّاد تنازلي، وشريط أعلى الموقع، ونافذة منبثقة.' },
  { id: 'brand', t: 'الهوية والتواصل', keys: ['brand', 'contact'], ic: '◆', d: 'اسم الشركة، أرقام التواصل، العنوان، ومواعيد العمل.' },
  { id: 'social', t: 'السوشيال ميديا', keys: ['socials', 'media'], ic: '♥', d: 'روابط الحسابات (الضغط على الأيقونة يفتح الحساب مباشرة)، ولينكات فيديوهات تظهر في صفحة السوشيال.' },
  { id: 'services', t: 'الخدمات', keys: ['services'], ic: '▦', d: 'كل خدمة لها صفحة خاصة بالبنود والصورة.' },
  { id: 'projects', t: 'الأعمال والمعرض', keys: ['workGroups', 'gallery', 'cats', 'projects', 'confidential', 'reviews'], ic: '▣', d: 'صور المعرض (أول الصفحة الرئيسية)، والمشاريع وتصنيفاتها.' },
  { id: 'packages', t: 'الباقات', keys: ['packages'], ic: '★', d: 'باقات الإشراف وأسعارها ومميزاتها.' },
  { id: 'about', t: 'من نحن', keys: ['about', 'partners'], ic: 'ⓘ', d: 'القصة، الرسالة، التراخيص، والشركاء.' },
  { id: 'branches', t: 'الفروع', keys: ['branches'], ic: '⌂', d: 'الفروع وعناوينها والجهات.' },
  { id: 'faq', t: 'الأسئلة والمساعد', keys: ['faq', 'prepare', 'support'], ic: '?', d: 'الأسئلة الشائعة (يستخدمها المساعد الآلي) + أقسام الدعم.' },
  { id: 'cta', t: 'دعوة التواصل', keys: ['cta'], ic: '➜', d: 'الصندوق الأحمر آخر الصفحات.' },
  { id: 'en', t: 'النسخة الإنجليزية', ic: 'EN', d: 'نصوص الموقع لما الزائر يحوّل للإنجليزي. أي خانة فاضية بتظهر بالعربي.' },
  { id: 'seo', t: 'محركات البحث', keys: ['seo'], ic: '⌕', d: 'عنوان الموقع ووصفه في جوجل، والكلمات اللي الناس بتدوّر بيها عليكم. ✔ بعد النشر: سجّل الموقع في Google Search Console وابعت ملف sitemap.xml.' },
  { id: 'json', t: 'النسخ الاحتياطي', ic: '⇩', d: 'تصدير واستيراد واسترجاع المحتوى.' }
];
const KEYT = { offer: 'عرض الصفحة الرئيسية', media: 'فيديوهات السوشيال', design: 'التصميم', brand: 'الهوية', contact: 'التواصل', socials: 'السوشيال ميديا', hero: 'الواجهة', stats: 'الأرقام', announce: 'شريط الإعلان', popup: 'نافذة العروض المنبثقة', services: 'الخدمات', cats: 'تصنيفات الأعمال', projects: 'المشاريع', confidential: 'نص سرية الأعمال', gallery: 'معرض الصور', packages: 'الباقات', about: 'من نحن', partners: 'الشركاء والجهات', branches: 'الفروع', faq: 'الأسئلة الشائعة', prepare: 'جهّز قبل التواصل', support: 'إعدادات الدعم الفني', cta: 'دعوة التواصل', seo: 'SEO', workGroups: 'كروت «من أعمالنا» في الرئيسية', reviews: 'قسم آراء العملاء' };

/* ---------- state ---------- */
let me = null, isOwner = false, emp = null;
let D = clone(DEFAULT), saved = '', cur = 'dash', mediaCache = {};
const bc = (() => { try { return new BroadcastChannel('sh-preview'); } catch (e) { return null; } })();
const get = p => p.reduce((o, k) => o == null ? o : o[k], D);
function set(p, v) { let o = D; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; dirty(); }
function dirty() {
  const on = JSON.stringify(D) !== saved; const b = $('#savebar'); if (b) b.classList.toggle('on', on);
  try { localStorage.setItem('sh.preview', JSON.stringify(D)); } catch (e) { } if (bc) bc.postMessage(D);
}
addEventListener('beforeunload', e => { if (JSON.stringify(D) !== saved) { e.preventDefault(); e.returnValue = ''; } });

async function loadContent() {
  try { const s = await F.getDoc(F.doc(db, 'site', 'content')); const d = s.exists() ? s.data() : null; const r = d && d.json ? JSON.parse(d.json) : d && d.data; if (r) D = deepMerge(clone(DEFAULT), r); } catch (e) { toast('تعذّر تحميل المحتوى: ' + F.authMsg(e), 1); }
  D.en = deepMerge(clone(EN), D.en || {});
  migrate(D, EN);
  saved = JSON.stringify(D);
}
async function save() {
  const json = JSON.stringify(D);
  if (json.length > 950000) return toast('المحتوى كبير جداً — قلّل النصوص أو استخدم رفع الصور', 1);
  const b = $('#saveBtn'); b.disabled = true; b.textContent = 'جارٍ الحفظ…';
  try {
    const warn = X.emptyWarnings(D); if (warn && !confirm(warn + '\n\nتكمّل الحفظ؟')) { b.disabled = false; b.textContent = 'حفظ ونشر'; return; }
    // بيتحفظ كنص واحد: Firestore مش بيقبل جداول جوه جداول (زي أرقام التراخيص)
    await F.setDoc(F.doc(db, 'site', 'content'), { json, at: F.serverTimestamp(), by: me.uid, v: 2 });
    saved = json; try { localStorage.setItem('sh.site', json); } catch (e) { } dirty(); toast('اتنشر على الموقع ✓');
  } catch (e) { toast(F.authMsg(e), 1); }
  b.disabled = false; b.textContent = 'حفظ ونشر';
}

/* ---------- media ---------- */
async function mediaURL(v) {
  if (!v) return '';
  if (!v.startsWith('m:')) return v.startsWith('assets/') ? v : v;
  const id = v.slice(2); if (mediaCache[id]) return mediaCache[id];
  try { const s = await F.getDoc(F.doc(db, 'siteMedia', id)); if (s.exists()) return mediaCache[id] = s.data().data; } catch (e) { }
  return '';
}
async function upload(file) {
  const data = await F.compressImage(file, 1600, 0.8);
  const r = await F.addDoc(F.collection(db, 'siteMedia'), { data, at: F.serverTimestamp(), by: me.uid, name: file.name.slice(0, 80) });
  mediaCache[r.id] = data; return 'm:' + r.id;
}

/* ---------- generic editor ---------- */
let uid = 0;
const P = p => esc(JSON.stringify(p));
function isLong(k, v) { return LONGK.test(k) || (typeof v === 'string' && v.length > 70); }
// 👁 إخفاء أي خانة من الموقع من غير ما تتمسح
const offKey = p => p.join('.');
const isOff = p => !!(D._off && D._off[offKey(p)]);
const EYE_SKIP = /^(id|no|on|featured|plain|video|until|delay|youtubeKey|red|gold|font|logoSize|heroLogo|heroLogoSize|fontScale|glass|cursorGlow|cursor|cursorIcon|keywords|title|desc)$/;
function eyeBtn(k, p) { if (p[0] === 'en' || p[0] === 'design' || p[0] === 'seo' || EYE_SKIP.test(k) || typeof k !== 'string') return ''; const o = isOff(p); return `<button type="button" class="eye ${o ? 'off' : ''}" data-eye="${P(p)}" title="${o ? 'مخفية من الموقع — اضغط لإظهارها' : 'إخفاء من الموقع (من غير مسح)'}">${o ? '🙈' : '👁'}</button>`; }
function field(k, v, p) {
  if (typeof k === 'string' && k.startsWith('_')) return '';
  const html = field0(k, v, p), e = eyeBtn(k, p);
  return e ? `<div class="eyewrap ${isOff(p) ? 'is-off' : ''}">${e}${html}</div>` : html;
}
function field0(k, v, p) {
  const id = 'f' + (++uid);
  if (typeof v === 'boolean') return `<label class="switch"><input type="checkbox" data-p="${P(p)}" data-t="b" ${v ? 'checked' : ''}><span></span> ${esc(lab(k))}</label>`;
  if (typeof v === 'number') return `<div class="fld"><label for="${id}">${esc(lab(k))}</label><input id="${id}" type="number" data-p="${P(p)}" data-t="n" value="${v}"></div>`;
  if (typeof v === 'string' && IMGK.test(k)) return imgField(k, v, p);
  if (typeof v === 'string' && /^(red|gold|ink|color)$/.test(k)) return `<div class="fld"><label>${esc(lab(k))}</label><div style="display:flex;gap:10px;align-items:center"><input type="color" data-p="${P(p)}" value="${esc(v || '#E1262B')}" style="width:56px;height:42px;padding:2px;border-radius:10px"><code dir="ltr">${esc(v)}</code></div></div>`;
  if (typeof v === 'string' && k === 'until') return `<div class="fld"><label>${esc(lab(k))}</label><input type="datetime-local" data-p="${P(p)}" value="${esc(v)}"><span class="hint">اتركه فاضي لو العرض مفتوح من غير مدة. العرض بيختفي لوحده بعد التاريخ ده.</span></div>`;
  if (typeof v === 'string' && (k === 'video' || k === 'videoSrc')) return `<div class="fld"><label>${esc(lab(k))}</label><input data-p="${P(p)}" dir="ltr" value="${esc(v)}"><span class="hint">مسار ملف على GitHub (مثلاً assets/video/hero.mp4) أو رابط mp4 مباشر. يفضّل أقل من 3MB، 720p، 8–12 ثانية. اتركه فاضي لإظهار الصورة فقط.</span></div>`;
  if (typeof v === 'string') return isLong(k, v)
    ? `<div class="fld"><label for="${id}">${esc(lab(k))}</label><textarea id="${id}" rows="${Math.min(8, Math.max(2, Math.ceil(v.length / 70)))}" data-p="${P(p)}">${esc(v)}</textarea></div>`
    : `<div class="fld"><label for="${id}">${esc(lab(k))}</label><input id="${id}" data-p="${P(p)}" value="${esc(v)}" ${/phone|whatsapp|email|link|map|href|url|instagram|tiktok|snapchat|^x$|youtube/.test(k) ? 'dir="ltr"' : ''}></div>`;
  if (Array.isArray(v)) return arrField(k, v, p);
  if (v && typeof v === 'object') return `<fieldset class="card" style="display:grid;gap:12px;padding:16px"><legend style="font-weight:800;padding:0 6px">${esc(lab(k))}</legend>${Object.keys(v).filter(kk => !kk.startsWith('_')).map(kk => field(kk, v[kk], [...p, kk])).join('')}</fieldset>`;
  return '';
}
function imgField(k, v, p) {
  return `<div class="fld"><label>${esc(lab(k))} <small class="hint" style="font-weight:500">— ${esc(V5.aspectFor(p)[2])}</small></label><div class="imgf" data-img="${P(p)}"><div class="pv"></div><div class="acts"><input data-p="${P(p)}" dir="ltr" value="${esc(v)}" placeholder="مسار أو رابط صورة"><div style="display:flex;gap:6px;flex-wrap:wrap"><label class="btn btn-ghost sm" style="cursor:pointer">⬆ رفع صورة<input type="file" accept="image/*" hidden data-up="${P(p)}"></label><button type="button" class="btn btn-ghost sm" data-crop="${P(p)}">✂ قص / تحريك</button><button type="button" class="btn btn-ghost sm" data-clr="${P(p)}">إزالة</button></div></div></div></div>`;
}
function itemTitle(v, i) {
  if (typeof v === 'string') return v;
  return v.title || v.name || v.q || v.t || v.l || v.n || v.code || ('عنصر ' + (i + 1));
}
function blank(v) {
  if (typeof v === 'string') return ''; if (typeof v === 'number') return 0; if (typeof v === 'boolean') return false;
  if (Array.isArray(v)) return []; if (v && typeof v === 'object') { const o = {}; for (const k in v) o[k] = blank(v[k]); return o; } return '';
}
const TPL = {};
function arrField(k, v, p) {
  const key = p.join('.'); if (v.length) TPL[key] = blank(v[0]); else if (k === 'gallery' && p[0] === 'projects') TPL[key] = { img: '', cap: '' }; else if (k === 'faq' && p[0] === 'services') TPL[key] = { q: '', a: '' };
  const prim = v.every(x => typeof x !== 'object') && (!v.length || typeof v[0] === 'string') && !(TPL[key] && typeof TPL[key] === 'object');
  if (prim) {
    return `<div class="fld"><label>${esc(lab(k))} <span class="hint" style="font-weight:500">— كل سطر بند</span></label><textarea rows="${Math.min(12, Math.max(3, v.length + 1))}" data-p="${P(p)}" data-t="lines">${esc(v.join('\n'))}</textarea></div>`;
  }
  return `<div class="fld"><label>${esc(lab(k))} <span class="chip">${v.length}</span></label><div class="arr" data-arr="${P(p)}">${v.map((x, i) => `<details class="item ${x && x._off ? 'is-off' : ''}"><summary><span class="n">${i + 1}</span><span class="t">${esc(itemTitle(x, i))}</span><span class="ops">${typeof x === 'object' && p[0] !== 'en' ? `<button type="button" class="eye ${x._off ? 'off' : ''}" title="${x._off ? 'مخفي — اضغط لإظهاره' : 'إخفاء من الموقع'}" data-ioff="${i}">${x._off ? '🙈' : '👁'}</button>` : ''}<button type="button" title="لأعلى" data-mv="-1" data-i="${i}">↑</button><button type="button" title="لأسفل" data-mv="1" data-i="${i}">↓</button><button type="button" title="نسخ" data-dup="${i}">⧉</button><button type="button" class="del" title="حذف" data-del="${i}">✕</button></span></summary><div class="body">${typeof x === 'object' ? Object.keys(x).filter(kk => !kk.startsWith('_')).map(kk => field(kk, x[kk], [...p, i, kk])).join('') : field('text', x, [...p, i])}</div></details>`).join('')}</div><button type="button" class="btn btn-ghost sm" data-add="${P(p)}" style="justify-self:start">+ إضافة</button></div>`;
}
function bindEditor(box) {
  box.addEventListener('input', e => {
    const el = e.target; if (!el.dataset.p) return; const p = JSON.parse(el.dataset.p);
    const t = el.dataset.t; let v = el.value;
    if (t === 'b') v = el.checked; else if (t === 'n') v = el.value === '' ? 0 : Number(el.value); else if (t === 'lines') v = el.value.split('\n').map(s => s.trim()).filter(Boolean);
    set(p, v);
    if (el.closest('.imgf')) paintImg(el.closest('.imgf'));
    const sum = el.closest('details.item'); if (sum) { const ap = JSON.parse(sum.parentElement.dataset.arr), i = [...sum.parentElement.children].indexOf(sum); $('.t', sum).textContent = itemTitle(get([...ap, i]), i); }
  });
  box.addEventListener('change', async e => {
    const el = e.target; if (!el.dataset.up || !el.files[0]) return; const p = JSON.parse(el.dataset.up);
    const f = el.closest('.imgf'); const raw = el.files[0]; el.value = '';
    const url = URL.createObjectURL(raw); const cut = await V5.cropper(url, V5.aspectFor(p)); URL.revokeObjectURL(url); if (!cut) return;
    $('.pv', f).classList.add('ld'); toast('جارٍ ضغط ورفع الصورة…');
    try { const v = await upload(cut); set(p, v); $('input[data-p]', f).value = v; paintImg(f); toast('الصورة اترفعت ✓ — اضغط حفظ ونشر'); } catch (x) { toast('فشل الرفع: ' + F.authMsg(x), 1); }
    $('.pv', f).classList.remove('ld'); el.value = '';
  });
  box.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.crop) { (async () => { const p = JSON.parse(b.dataset.crop), f = b.closest('.imgf'); const cur = await mediaURL(get(p) || ''); if (!cur) return toast('ارفع صورة الأول', 1); const cut = await V5.cropper(cur, V5.aspectFor(p)); if (!cut) return; $('.pv', f).classList.add('ld'); try { const v = await upload(cut); set(p, v); $('input[data-p]', f).value = v; paintImg(f); toast('اتظبطت ✓ — اضغط حفظ ونشر'); } catch (x) { toast('فشل: ' + F.authMsg(x), 1); } $('.pv', f).classList.remove('ld'); })(); return; }
    if (b.dataset.eye) { const p = JSON.parse(b.dataset.eye), k = offKey(p); D._off = D._off || {}; if (D._off[k]) delete D._off[k]; else D._off[k] = true; dirty(); const w = b.closest('.eyewrap'); const o = !!D._off[k]; b.classList.toggle('off', o); b.textContent = o ? '🙈' : '👁'; if (w) w.classList.toggle('is-off', o); toast(o ? 'اتخفت من الموقع (لسه موجودة هنا)' : 'رجعت تظهر'); return; }
    if (b.dataset.clr) { const p = JSON.parse(b.dataset.clr); set(p, ''); const f = b.closest('.imgf'); $('input[data-p]', f).value = ''; paintImg(f); return; }
    if (b.dataset.add) { const p = JSON.parse(b.dataset.add); const a = get(p); a.push(clone(TPL[p.join('.')] ?? '')); dirty(); rerender(); setTimeout(() => { const last = $$(`[data-arr='${CSS.escape(b.dataset.add)}'] > details`).pop(); if (last) { last.open = true; last.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }, 30); return; }
    const host = b.closest('[data-arr]'); if (!host) return; e.preventDefault(); e.stopPropagation();
    const p = JSON.parse(host.dataset.arr), a = get(p);
    if (b.dataset.ioff != null) { const i = +b.dataset.ioff; if (a[i]._off) delete a[i]._off; else a[i]._off = true; toast(a[i]._off ? 'اتخفى من الموقع (لسه موجود هنا)' : 'رجع يظهر'); }
    else if (b.dataset.del != null) { const i = +b.dataset.del; if (!confirm(`حذف «${itemTitle(a[i], i)}»؟\n\n💡 لو عايز تخفيه بس من غير مسح، استخدم 👁`)) return; if (a[i] && a[i].id) { D._del = [...new Set([...(D._del || []), a[i].id])]; } a.splice(i, 1); }
    else if (b.dataset.dup != null) { const i = +b.dataset.dup; a.splice(i + 1, 0, clone(a[i])); }
    else if (b.dataset.mv) { const i = +b.dataset.i, j = i + (+b.dataset.mv); if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; }
    dirty(); rerender();
  });
  $$('.imgf', box).forEach(paintImg);
}
async function paintImg(f) {
  const v = $('input[data-p]', f).value.trim(); const pv = $('.pv', f);
  const u = await mediaURL(v); pv.style.backgroundImage = u ? `url("${u.replace(/"/g, '%22')}")` : 'none'; pv.textContent = u ? '' : 'بدون';
}

/* ---------- layout ---------- */
function shell() {
  const links = SECTIONS.map(s => s.h ? `<h6>${s.h}</h6>` : (s.own && !isOwner ? '' : `<a href="${s.href || '#' + s.id}" data-s="${s.id}" ${s.href ? '' : ''}><span style="width:20px;text-align:center">${s.ic}</span>${esc(s.t)}${s.id === 'team' ? '<span class="bdg" id="reqB" hidden></span>' : ''}</a>`)).join('');
  root.innerHTML = `<header class="top"><div class="top-in"><button class="burger2" id="bg" aria-label="القائمة">☰</button><a class="brand" href="portal.html"><img src="assets/img/mark.png" alt="">لوحة التحكم</a><div class="who"><a class="btn btn-ghost sm" href="index.html?preview=1" target="_blank" rel="noopener" title="معاينة مباشرة للتعديلات قبل النشر">👁 معاينة</a><a class="btn btn-ghost sm" href="portal.html">البوابة</a><button class="btn btn-ghost sm" id="lo">خروج</button></div></div></header>
  <div class="adm"><nav class="side" id="side">${links}</nav><main class="main-p"><div class="adm-back" id="admBack"></div><div id="mp"></div></main></div>
  <div class="savebar" id="savebar"><span>عندك تعديلات لسه متنشرتش</span><button class="btn btn-ghost sm" id="undoBtn" style="background:transparent;color:#fff;border-color:#555">تراجع عن الكل</button><button class="btn btn-red" id="saveBtn">حفظ ونشر</button></div>`;
  $('#lo').onclick = async () => { if (JSON.stringify(D) !== saved && !confirm('في تعديلات متنشرتش. تخرج؟')) return; await F.signOut(auth); location.href = 'portal.html'; };
  $('#bg').onclick = () => $('#side').classList.toggle('on');
  $('#saveBtn').onclick = save;
  $('#undoBtn').onclick = () => { if (!confirm('ترجع لآخر نسخة منشورة؟')) return; D = JSON.parse(saved); dirty(); rerender(); };
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if (JSON.stringify(D) !== saved) save(); } });
}
// زرار الرجوع: يرجع للقسم اللي قبله، أو لنظرة عامة، ومن نظرة عامة للبوابة
const hist = [];
function paintBack() {
  const el = $('#admBack'); if (!el) return;
  const tp = document.querySelector('header.top'); if (tp) el.style.top = tp.offsetHeight + 'px';
  const prev = hist.length > 1 ? hist[hist.length - 2] : (cur !== 'dash' ? 'dash' : null);
  const ps = prev && SECTIONS.find(x => x.id === prev);
  el.innerHTML = prev ? `<a class="glass-back" href="#${prev}" id="admBk">→ رجوع <small>${esc(ps ? ps.t : 'نظرة عامة')}</small></a>` : `<a class="glass-back" href="portal.html">→ البوابة</a>`;
  const a = $('#admBk'); if (a) a.onclick = e => { e.preventDefault(); hist.pop(); const to = hist.pop() || 'dash'; location.hash = to === 'dash' && !location.hash.slice(1) ? '#dash' : to; if (location.hash.slice(1) === cur) go(); };
}
function go() {
  let h = location.hash.slice(1) || 'dash'; if (h === 'layout') h = 'pages'; cur = SECTIONS.some(s => s.id === h && !s.href) ? h : 'dash';
  if (hist[hist.length - 1] !== cur) hist.push(cur); if (cur === 'dash') hist.splice(0, hist.length - 1);
  paintBack();
  $$('#side a').forEach(a => a.classList.toggle('on', a.dataset.s === cur)); $('#side').classList.remove('on');
  rerender(); scrollTo(0, 0);
}
addEventListener('hashchange', () => { if (me) go(); });
function rerender() {
  const mp = $('#mp'); if (!mp) return; uid = 0; const s = SECTIONS.find(x => x.id === cur);
  if (cur === 'dash') return viewDash(mp);
  if (cur === 'team') return viewTeam(mp);
  if (cur === 'json') return viewJson(mp);
  const ctx = { F, db, D: () => D, setD: v => { D = v; }, dirty, rerender, toast, esc, me: () => me, isOwner: () => isOwner, upload, mediaURL, bindEditor, field, EN, DEFAULT, clone, deepMerge };
  if (cur === 'owners') return V5.vOwners(mp, ctx);
  if (cur === 'pages' || cur === 'layout') return V5.vPages(mp, ctx);
  if (cur === 'occasion') return V5.vOccasion(mp, ctx);
  if (X.VIEWS[cur]) return X.VIEWS[cur](mp, ctx);
  const open = $$('details.item[open]', mp).map(d => [...d.parentElement.children].indexOf(d) + '|' + d.parentElement.dataset.arr);
  const y = scrollY;
  mp.innerHTML = `<h2>${esc(s.t)}</h2><p class="desc">${esc(s.d || '')}</p><div class="form-grid" id="ed">${s.keys.map(k => {
    const v = D[k]; const inner = (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).filter(kk => !kk.startsWith('_')).map(kk => field(kk, v[kk], [k, kk])).join('') : field(k, v, [k]);
    return `<section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px;display:flex;gap:8px;align-items:center">${esc(KEYT[k] || k)}<button type="button" class="btn btn-ghost sm" data-reset="${k}" style="margin-inline-start:auto">استرجاع الافتراضي</button></h3>${inner}</section>`;
  }).join('')}</div>`;
  const ed = $('#ed'); bindEditor(ed);
  $$('[data-reset]', ed).forEach(b => b.onclick = () => { if (!confirm('ترجّع القسم ده للمحتوى الافتراضي؟')) return; D[b.dataset.reset] = clone(DEFAULT[b.dataset.reset]); dirty(); rerender(); });
  open.forEach(o => { const [i, a] = o.split('|'); const host = $$('[data-arr]', mp).find(x => x.dataset.arr === a); if (host && host.children[+i]) host.children[+i].open = true; });
  scrollTo(0, y);
}

/* ---------- dashboard ---------- */
async function viewDash(mp) {
  mp.innerHTML = `<h2>نظرة عامة</h2><p class="desc">من هنا تتحكم في كل حاجة على الموقع والتطبيق.</p><div class="stats4" id="st">${['طلبات دعم جديدة', 'كل الطلبات', 'الموظفين', 'طلبات تسجيل', 'التقارير'].map(t => `<div class="card"><b>…</b><span>${t}</span></div>`).join('')}</div>
  <div class="grid2"><div class="card"><h3 style="font-size:16px;margin-bottom:10px">تعديل سريع</h3><div style="display:flex;flex-wrap:wrap;gap:8px">${SECTIONS.filter(s => s.keys).map(s => `<a class="btn btn-ghost sm" href="#${s.id}">${s.ic} ${esc(s.t)}</a>`).join('')}</div></div>
  <div class="card" style="display:grid;gap:10px"><h3 style="font-size:16px">مفاتيح سريعة</h3>
  <label class="switch"><input type="checkbox" id="qa" ${D.announce.on ? 'checked' : ''}><span></span> شريط الإعلان</label>
  <input id="qaT" value="${esc(D.announce.text || '')}" placeholder="اكتب نص الإعلان هنا…" style="padding:9px 12px;border-radius:12px;border:1.5px solid var(--line);margin-top:-4px">
  <label class="switch"><input type="checkbox" id="qp" ${D.popup.on ? 'checked' : ''}><span></span> نافذة العروض</label>
  <label class="switch"><input type="checkbox" id="qk" ${D.packages.on ? 'checked' : ''}><span></span> صفحة الباقات</label>
  <label class="switch"><input type="checkbox" id="qs" ${D.support.on ? 'checked' : ''}><span></span> استقبال طلبات الدعم</label>
  <p class="hint" style="color:var(--mut);font-size:12.5px">بعد أي تغيير اضغط «حفظ ونشر» تحت.</p></div></div>`;
  $('#qaT').oninput = e => { D.announce.text = e.target.value; if (e.target.value.trim()) { D.announce.on = true; $('#qa').checked = true; } dirty(); };
  [['qa', 'announce'], ['qp', 'popup'], ['qk', 'packages'], ['qs', 'support']].forEach(([i, k]) => $('#' + i).onchange = e => { D[k].on = e.target.checked; dirty(); });
  const cnt = async q => { try { return (await F.getDocs(q)).size; } catch (e) { return '—'; } };
  const v = await Promise.all([
    cnt(F.query(F.collection(db, 'tickets'), F.where('status', '==', 'new'))), cnt(F.query(F.collection(db, 'tickets'), F.limit(500))),
    isOwner ? cnt(F.collection(db, 'employees')) : '—', isOwner ? cnt(F.collection(db, 'requests')) : '—', cnt(F.query(F.collection(db, 'reports'), F.limit(500)))]);
  $$('#st b').forEach((b, i) => b.textContent = v[i]);
}

/* ---------- backup ---------- */
function viewJson(mp) {
  mp.innerHTML = `<h2>النسخ الاحتياطي</h2><p class="desc">نزّل نسخة من كل محتوى الموقع، أو ارفع نسخة قديمة، أو رجّع كل حاجة للافتراضي.</p>
  <div class="grid2"><div class="card" style="display:grid;gap:10px"><h3 style="font-size:16px">تصدير</h3><p style="color:var(--mut)">ملف JSON فيه كل النصوص والإعدادات (الصور المرفوعة بتفضل مكانها).</p><button class="btn btn-ink" id="ex">تنزيل نسخة</button></div>
  <div class="card" style="display:grid;gap:10px"><h3 style="font-size:16px">استيراد</h3><p style="color:var(--mut)">هيستبدل المحتوى الحالي — بعدها راجع واضغط حفظ ونشر.</p><label class="btn btn-ghost" style="cursor:pointer">اختيار ملف<input type="file" accept=".json,application/json" id="im" hidden></label></div>
  <div class="card" style="display:grid;gap:10px"><h3 style="font-size:16px">استرجاع الكل</h3><p style="color:var(--mut)">يرجّع كل الأقسام لمحتوى النسخة الأصلية.</p><button class="btn btn-ghost" id="rs" style="color:var(--red)">استرجاع الافتراضي</button></div></div>
  <details class="item" style="margin-top:18px"><summary><span class="t">تعديل متقدم (JSON كامل)</span></summary><div class="body"><textarea id="js" rows="18" dir="ltr" style="font-family:monospace;font-size:12px;width:100%;padding:12px;border-radius:12px;border:1.5px solid var(--line)">${esc(JSON.stringify(D, null, 2))}</textarea><button class="btn btn-ink sm" id="ap" style="justify-self:start">تطبيق</button></div></details>`;
  $('#ex').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' })); a.download = 'shamrani-site-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); };
  $('#im').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const o = JSON.parse(await f.text()); D = deepMerge(clone(DEFAULT), o.data || o); dirty(); toast('اتستورد — راجع واضغط حفظ ونشر'); viewJson(mp); } catch (x) { toast('الملف مش صالح', 1); } };
  $('#rs').onclick = () => { if (!confirm('ترجّع الموقع كله للافتراضي؟ (مش هيتنشر غير لما تضغط حفظ)')) return; D = clone(DEFAULT); dirty(); viewJson(mp); };
  $('#ap').onclick = () => { try { D = deepMerge(clone(DEFAULT), JSON.parse($('#js').value)); dirty(); toast('اتطبق ✓'); } catch (x) { toast('في خطأ في الـ JSON', 1); } };
}

/* ---------- team (owner only) ---------- */
const DEPTS = ['المساحة', 'المعماري', 'الإنشائي', 'الإشراف', 'السلامة / الدفاع المدني', 'الإلكتروميكانيك', 'المحاسبة', 'الإدارة'];
const pad = n => String(n).padStart(2, '0');
const todayKey = () => { const d = new Date(Date.now() + 10800000); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); };
const modsBox = (sel, name) => `<div class="mods">${Object.keys(MODULES).map(k => `<label><input type="checkbox" name="${name}" value="${k}" ${sel.includes(k) ? 'checked' : ''}>${esc(MODULES[k].t)}</label>`).join('')}</div>`;
const pickMods = (scope, name) => $$(`input[name="${name}"]:checked`, scope).map(i => i.value);
async function viewTeam(mp) {
  if (!isOwner) { mp.innerHTML = '<p class="empty">الصفحة دي للمالك بس.</p>'; return; }
  mp.innerHTML = `<h2>الموظفين والصلاحيات</h2><p class="desc">نفس حسابات البصمة — الموظف يدخل بنفس اسم المستخدم وكلمة السر في كل الأقسام.</p>
  <div class="grid2"><div class="card" style="display:grid;gap:10px"><h3 style="font-size:16px">كود الدعوة للتسجيل الذاتي</h3><p style="color:var(--mut);font-size:13.5px">ابعته للموظف الجديد. يسجّل من البوابة بالكود، وحسابه يستنى موافقتك هنا.</p>
  <div style="display:flex;gap:8px;align-items:center"><input id="inv" dir="ltr" style="flex:1;padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);font-weight:800;letter-spacing:2px;text-transform:uppercase" placeholder="بدون كود = التسجيل مقفول"><button class="btn btn-ghost sm" id="invG">توليد</button><button class="btn btn-ink sm" id="invS">حفظ</button></div></div>
  <div class="card" style="display:grid;gap:10px;border:2px solid var(--red);box-shadow:0 14px 34px -20px rgba(225,38,43,.6)"><h3 style="font-size:19px">➕ إضافة موظف جديد</h3><p style="color:var(--mut);font-size:13px;margin-top:-6px">بيدخل بيه البصمة والبوابة على طول، وأول دخول هيطلب منه يغيّر كلمة السر.</p><form id="addF" style="display:grid;gap:10px"><div class="row2"><input id="aN" placeholder="الاسم الكامل" class="in"><input id="aU" placeholder="اسم المستخدم" class="in"></div><div class="row2"><input id="aP" placeholder="كلمة سر مؤقتة (٦+)" class="in" dir="ltr"><select id="aD" class="in">${DEPTS.map(d => `<option>${d}</option>`).join('')}</select></div>${modsBox(['basma'], 'am')}<button class="btn btn-red sm" style="justify-self:start">إضافة</button></form></div></div>
  <h3 style="margin:22px 0 10px;font-size:18px">طلبات التسجيل <span class="chip red" id="rqC">…</span></h3><div class="list" id="rq"></div>
  <h3 style="margin:22px 0 10px;font-size:18px">الموظفين <span class="chip" id="emC">…</span></h3><input id="eq" placeholder="بحث…" class="in" style="margin-bottom:10px;width:100%"><div class="list" id="em"></div>`;
  $$('.in', mp).forEach(i => i.style.cssText += ';padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:#fff;width:100%');
  try { const s = await F.getDoc(F.doc(db, 'settingsPriv', 'invite')); $('#inv').value = s.exists() ? (s.data().code || '') : ''; } catch (e) { }
  $('#invG').onclick = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; $('#inv').value = 'SH' + [...crypto.getRandomValues(new Uint8Array(5))].map(x => A[x % A.length]).join(''); };
  $('#invS').onclick = async () => { try { await F.setDoc(F.doc(db, 'settingsPriv', 'invite'), { code: $('#inv').value.trim().toUpperCase(), at: F.serverTimestamp() }); toast('اتحفظ الكود ✓'); } catch (e) { toast(F.authMsg(e), 1); } };
  $('#addF').onsubmit = async e => {
    e.preventDefault(); const n = $('#aN').value.trim(), u = F.toEn($('#aU').value.trim()), pw = $('#aP').value, d = $('#aD').value, mods = pickMods(mp, 'am');
    if (n.length < 3 || !F.USER_OK.test(F.normUser(u)) || pw.length < 6) return toast('راجع الاسم واسم المستخدم وكلمة السر (٦+)', 1);
    const sa = F.secondaryAuth();
    try {
      const cr = await F.createUserWithEmailAndPassword(sa, F.toEmail(u), pw);
      await F.setDoc(F.doc(db, 'employees', cr.user.uid), { name: n, num: u, dept: d, active: true, mustChange: true, cred: null, createdAt: F.serverTimestamp(), start: todayKey(), geo: { mode: 'sites' }, mods });
      F.setDoc(F.doc(db, 'secrets', cr.user.uid), { pw, at: F.serverTimestamp() }).catch(() => { });
      await F.signOut(sa); toast('اتضاف ✓ — هيغيّر كلمة السر أول دخول'); e.target.reset(); loadTeam();
    } catch (x) { toast(F.authMsg(x), 1); try { await F.signOut(sa); } catch (y) { } }
  };
  $('#eq').oninput = paintEmps;
  loadTeam();
}
let emps = [], reqs = [];
async function loadTeam() {
  try { reqs = (await F.getDocs(F.collection(db, 'requests'))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { reqs = []; }
  try { emps = (await F.getDocs(F.collection(db, 'employees'))).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar')); } catch (e) { emps = []; toast(F.authMsg(e), 1); }
  const rb = $('#reqB'); if (rb) { rb.hidden = !reqs.length; rb.textContent = reqs.length; }
  paintReqs(); paintEmps();
}
function paintReqs() {
  const el = $('#rq'); if (!el) return; $('#rqC').textContent = reqs.length;
  el.innerHTML = reqs.length ? reqs.map(r => `<div class="card" data-id="${r.id}" style="display:grid;gap:10px"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><b>${esc(r.name)}</b><span class="chip">${esc(r.num)}</span><span class="chip">${esc(r.dept)}</span>${r.phone ? `<a dir="ltr" href="tel:${esc(r.phone)}" style="color:var(--mut)">${esc(r.phone)}</a>` : ''}</div>${modsBox(['basma'], 'rm' + r.id)}<div style="display:flex;gap:8px"><button class="btn btn-ok sm" data-ok>موافقة وتفعيل</button><button class="btn btn-ghost sm" data-no style="color:var(--red)">رفض</button></div></div>`).join('') : '<p class="empty">مفيش طلبات جديدة</p>';
  $$('[data-id]', el).forEach(c => {
    const r = reqs.find(x => x.id === c.dataset.id);
    $('[data-ok]', c).onclick = async () => {
      try { await F.setDoc(F.doc(db, 'employees', r.id), { name: r.name, num: r.num, dept: r.dept, phone: r.phone || '', active: true, mustChange: false, cred: null, createdAt: F.serverTimestamp(), start: todayKey(), geo: { mode: 'sites' }, mods: pickMods(c, 'rm' + r.id) }); await F.deleteDoc(F.doc(db, 'requests', r.id)); toast('اتفعّل ✓'); loadTeam(); } catch (e) { toast(F.authMsg(e), 1); }
    };
    $('[data-no]', c).onclick = async () => { if (!confirm('رفض الطلب؟ (الحساب هيفضل بدون صلاحيات — تقدر تحذفه من Firebase Authentication)')) return; try { await F.deleteDoc(F.doc(db, 'requests', r.id)); loadTeam(); } catch (e) { toast(F.authMsg(e), 1); } };
  });
}
function paintEmps() {
  const el = $('#em'); if (!el) return; const q = $('#eq').value.trim(); $('#emC').textContent = emps.length;
  const list = emps.filter(e => !q || ((e.name || '') + (e.num || '') + (e.dept || '')).includes(q));
  el.innerHTML = list.map(e => { const m = Array.isArray(e.mods) ? e.mods : ['basma']; return `<details class="item" data-id="${e.id}"><summary><span class="n">${esc((e.name || '?').slice(0, 1))}</span><span class="t">${esc(e.name)} <small style="color:var(--mut);font-weight:600">· ${esc(e.num)} · ${esc(e.dept || '')}</small></span>${e.active === false ? '<span class="chip red">موقوف</span>' : '<span class="chip ok">نشط</span>'}</summary><div class="body"><div class="fld"><label>الصلاحيات</label>${modsBox(m, 'em' + e.id)}</div><div class="row2"><div class="fld"><label>القسم</label><select data-dept>${[...new Set([...DEPTS, e.dept || ''])].filter(Boolean).map(d => `<option ${d === e.dept ? 'selected' : ''}>${d}</option>`).join('')}</select></div><label class="switch" style="align-self:end"><input type="checkbox" data-act ${e.active !== false ? 'checked' : ''}><span></span> الحساب نشط</label></div><button class="btn btn-ink sm" data-sv style="justify-self:start">حفظ</button><p class="hint" style="color:var(--mut);font-size:12.5px">تغيير كلمة السر والمواقع وورديات الحضور من داخل تطبيق البصمة نفسه.</p></div></details>`; }).join('') || '<p class="empty">مفيش موظفين</p>';
  $$('details[data-id]', el).forEach(d => $('[data-sv]', d).onclick = async () => {
    try { await F.updateDoc(F.doc(db, 'employees', d.dataset.id), { mods: pickMods(d, 'em' + d.dataset.id), dept: $('[data-dept]', d).value, active: $('[data-act]', d).checked }); toast('اتحفظ ✓'); loadTeam(); } catch (e) { toast(F.authMsg(e), 1); }
  });
}

/* ---------- boot ---------- */
F.onAuthStateChanged(auth, async u => {
  if (!u) { location.replace('portal.html'); return; }
  me = u; isOwner = await F.ownerOf(u.uid);
  if (isOwner) { try { localStorage.setItem('sh.staff', '1'); } catch (e) { } }
  if (!isOwner) {
    try { const s = await F.getDoc(F.doc(db, 'employees', u.uid)); emp = s.exists() ? s.data() : null; } catch (e) { emp = null; }
    if (!emp || emp.active === false || !(emp.mods || []).includes('cms')) { root.innerHTML = `<div style="min-height:100svh;display:grid;place-items:center;text-align:center;padding:20px"><div><h2>مفيش صلاحية</h2><p style="color:var(--mut);margin:8px 0 16px">لوحة التحكم محتاجة صلاحية «لوحة التحكم» من المالك.</p><a class="btn btn-red" href="portal.html">رجوع للبوابة</a></div></div>`; return; }
  }
  await loadContent(); shell(); go();
  if (isOwner) { try { const n = (await F.getDocs(F.collection(db, 'requests'))).size; const rb = $('#reqB'); if (rb && n) { rb.hidden = false; rb.textContent = n; } } catch (e) { } }
});
