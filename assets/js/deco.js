// الخلفيات السعودية + وضع الحداد + هوية الشركة — بيتطبقوا على الموقع والبوابة والأقسام
// الإعدادات في site/content: theme {bg, auto, op}  ·  mourn {on, text, until}  ·  brand {ar, sub, en, logo}
// بنحفظ نسخة في localStorage (sh.deco) عشان تتطبق فوراً قبل ما Firestore يرد، وعشان البصمة تقراها
const enc = s => "url('data:image/svg+xml;utf8," + encodeURIComponent(s) + "')";
const C = 'currentColor';
// v16: الخلفيات صور حقيقية (من صاحب الشركة) — assets/img/bg/<key>.webp و <key>-m.webp للموبايل و <key>-t.webp للمعاينة
// dark = الصورة غامقة فوق (بنزوّد طبقة التفتيح علشان الكلام يتقري)
export const BGS = {
  najdi: { ar: 'القرية النجدية', ic: '🏰', img: 1 },
  kingdom: { ar: 'برج المملكة', ic: '🏙', img: 1 },
  founding: { ar: 'الدرعية (يوم التأسيس)', ic: '🧱', img: 1, dark: 1 },
  national: { ar: 'اليوم الوطني', ic: '🇸🇦', img: 1, dark: 1 },
  flag: { ar: 'يوم العلم', ic: '🏳️', img: 1 },
  ramadan: { ar: 'رمضان', ic: '🌙', img: 1, dark: 1 },
  fitr: { ar: 'عيد الفطر', ic: '🎉', img: 1 },
  hajj: { ar: 'الحج ويوم عرفة', ic: '🕋', img: 1 },
  adha: { ar: 'عيد الأضحى', ic: '🐑', img: 1 },
  hijri: { ar: 'رأس السنة الهجرية', ic: '📅', img: 1, dark: 1 },
  plain: { ar: 'سادة', ic: '⬜' }
};
// الأسماء القديمة (v15) بتتحول للجديدة
const LEGACY = { diriyah: 'founding', palms: 'najdi', sadu: 'najdi', hijazi: 'najdi', asiri: 'najdi' };
export const bgKey = k => BGS[k] ? k : (LEGACY[k] || 'plain');
// المناسبة ← الخلفية (لو الاختيار «تلقائي مع المناسبات»)
const OCC_BG = { national: 'national', founding: 'founding', flag: 'flag', ramadan: 'ramadan', fitr: 'fitr', hajj: 'hajj', adha: 'adha', hijri: 'hijri' };
// مسار الصور: الصفحات اللي جوه فولدر (البصمة/التقرير) بتحتاج ../
const BASE = () => /\/(basma|report)\//.test(location.pathname) ? '../' : '';
export const bgURL = (k, size) => new URL(BASE() + 'assets/img/bg/' + k + (size ? '-' + size : '') + '.webp', location.href).href;
const ls = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };

// قوة الخلفية: 20..100 (كل ما تزيد الصورة تبان أوضح)
export function bgCSS(key, strength) {
  const b = BGS[key]; if (!b || !b.img) return '';
  const k = Math.max(.2, Math.min(1, (strength == null ? 60 : strength) / 100)), d = b.dark ? 1.25 : 1;
  const o = v => Math.round(Math.min(96, v * d * (1.35 - k * .75))) + '%';
  return `--bgimg:url('${bgURL(key, innerWidth < 900 ? 'm' : '')}');--o1:${o(70)};--o2:${o(42)};--o3:${o(30)};--o4:${o(58)}`;
}
let styleEl = null;
function ensureStyle() {
  if (styleEl) return styleEl; styleEl = document.createElement('style'); styleEl.id = 'decoStyle';
  styleEl.textContent = `
  .deco-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background:var(--bgimg) center bottom/cover no-repeat}
  .deco-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--paper,#F4F2EE) var(--o1),transparent) 0%,color-mix(in srgb,var(--paper,#F4F2EE) var(--o2),transparent) 38%,color-mix(in srgb,var(--paper,#F4F2EE) var(--o3),transparent) 72%,color-mix(in srgb,var(--paper,#F4F2EE) var(--o4),transparent) 100%)}
  html.has-bg .sec.alt{background:color-mix(in srgb,var(--paper2,#EFECE5) 45%,transparent)}
  html.has-bg .bg-orbs{display:none}
  html.has-bg #app p,html.has-bg #app li,html.has-bg #app h1,html.has-bg #app h2,html.has-bg #app h3,html.has-bg .crumbs{text-shadow:0 0 14px var(--paper,#F4F2EE),0 0 4px var(--paper,#F4F2EE),0 0 1px var(--paper,#F4F2EE)}
  html.has-bg .h7-hero p,html.has-bg .h7-hero h1,html.has-bg .sec.dark p,html.has-bg .sec.dark h2{text-shadow:none}
  html.mourn{filter:grayscale(1) contrast(.95)}
  html.mourn .occ-fx,html.mourn .occ-bar{display:none!important}
  .mourn-ribbon{position:fixed;top:0;left:0;width:74px;height:74px;z-index:9998;pointer-events:none}
  .mourn-bar{position:relative;z-index:9997;background:#111;color:#eee;text-align:center;font-weight:700;font-size:14px;padding:9px 16px;line-height:1.6}
  `; document.head.appendChild(styleEl); return styleEl;
}
export function apply(cfg, occKey) {
  cfg = cfg || ls('sh.deco') || {}; const html = document.documentElement; ensureStyle();
  // الحداد
  const m = cfg.mourn || {}, mOn = !!m.on && (!m.until || new Date(m.until).getTime() > Date.now());
  html.classList.toggle('mourn', mOn);
  let rib = document.querySelector('.mourn-ribbon'), bar = document.querySelector('.mourn-bar');
  if (mOn) {
    if (!rib) { rib = document.createElement('div'); rib.className = 'mourn-ribbon'; rib.innerHTML = '<svg viewBox="0 0 74 74"><path d="M0 0h34L74 40v34z" fill="#111"/><path d="M8 0l66 66" stroke="#333" stroke-width="2"/></svg>'; document.body.appendChild(rib); }
    if (m.text) { if (!bar) { bar = document.createElement('div'); bar.className = 'mourn-bar'; document.body.prepend(bar); } bar.textContent = m.text; } else if (bar) bar.remove();
  } else { if (rib) rib.remove(); if (bar) bar.remove(); }
  // الخلفية
  const t = cfg.theme || {}; let key = bgKey(t.bg || 'plain');
  if (t.auto && occKey && OCC_BG[occKey]) key = OCC_BG[occKey];
  // الحداد: نفس الخلفية بالرمادي (الفلتر على الصفحة كلها)
  let el = document.querySelector('.deco-bg'); const css = bgCSS(key, t.str != null ? t.str : 60); html.classList.toggle('has-bg', !!css);
  if (!css) { if (el) el.remove(); }
  else { if (!el) { el = document.createElement('div'); el.className = 'deco-bg'; document.body.prepend(el); } el.setAttribute('style', css); el.dataset.k = key; }
  // هوية الشركة (الاسم واللوجو) على أي عنصر عليه data-brand — وبنراقب الصفحة علشان العناصر اللي بتترسم بعدين
  // ألوان الهوية (من «هوية الشركة» أو «اللوجو والألوان») على البوابة والأقسام
  const col = cfg.colors || {}; if (col.red && col.red.toUpperCase() !== '#E1262B') { html.style.setProperty('--red', col.red); html.style.setProperty('--red2', `color-mix(in srgb, ${col.red} 82%, #000)`); html.style.setProperty('--redsoft', `color-mix(in srgb, ${col.red} 12%, #fff)`); }
  const b = cfg.brand || {}; brandNow(b);
  if (!mo && window.MutationObserver && (b.ar || b.logo || b.en || b.name)) { let tq = 0; mo = new MutationObserver(() => { if (tq) return; tq = requestAnimationFrame(() => { tq = 0; brandNow((cached() || {}).brand || b); }); }); mo.observe(document.body, { childList: true, subtree: true }); }
  return { key, mourn: mOn };
}
let mo = null;
function brandNow(b) {
  document.querySelectorAll('[data-brand="ar"]').forEach(x => { if (b.ar) x.textContent = b.ar; });
  document.querySelectorAll('[data-brand="sub"]').forEach(x => { if (b.sub) x.textContent = b.sub; });
  document.querySelectorAll('[data-brand="en"]').forEach(x => { if (b.en) x.textContent = b.en; });
  document.querySelectorAll('[data-brand="name"]').forEach(x => { if (b.name) x.textContent = b.name; });
  document.querySelectorAll('img[data-brand="logo"]').forEach(x => { if (b.logo && /^(data:image|https?:|assets\/)/.test(b.logo) && x.getAttribute('src') !== b.logo) x.src = b.logo; });
}
// بنحفظ النسخة المحلية من محتوى الموقع
export function save(content) { const b = content.brand || {}; const c = { theme: content.theme || {}, mourn: content.mourn || {}, brand: { ar: b.short || '', sub: b.sub || '', en: b.en || '', name: b.name || '', logo: b.logo || '' }, colors: { red: (content.design || {}).red || '', gold: (content.design || {}).gold || '' } }; ls('sh.deco', c); return c; }
// للأقسام (المساحة/المعماري/الإشراف/البصمة/لوحة التحكم): الهوية والحداد بس من غير خلفية
export function applyLite() { const c = cached(); return apply({ ...c, theme: { bg: 'plain' } }); }
export const cached = () => ls('sh.deco') || {};
export const isMourning = () => document.documentElement.classList.contains('mourn');
