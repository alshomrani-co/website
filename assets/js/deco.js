// الخلفيات السعودية + وضع الحداد + هوية الشركة — بيتطبقوا على الموقع والبوابة والأقسام
// الإعدادات في site/content: theme {bg, auto, op}  ·  mourn {on, text, until}  ·  brand {ar, sub, en, logo}
// بنحفظ نسخة في localStorage (sh.deco) عشان تتطبق فوراً قبل ما Firestore يرد، وعشان البصمة تقراها
const enc = s => "url('data:image/svg+xml;utf8," + encodeURIComponent(s) + "')";
const C = 'currentColor';
export const BGS = {
  najdi: { ar: 'نجدي', ic: '🏰', svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="${c}" stroke-width="1.4"><path d="M0 18h96M0 24h96"/><path d="M4 18l6-10 6 10M22 18l6-10 6 10M40 18l6-10 6 10M58 18l6-10 6 10M76 18l6-10 6 10"/><path d="M12 48l6 8-6 8-6-8zM48 40l10 16-10 16-10-16zM84 48l6 8-6 8-6-8z"/><path d="M0 84h96M6 84v-8h8v8M26 84v-8h8v8M46 84v-8h8v8M66 84v-8h8v8M86 84v-8h8v8"/><circle cx="30" cy="56" r="1.6" fill="${c}"/><circle cx="66" cy="56" r="1.6" fill="${c}"/></svg>`, size: '96px' },
  kingdom: { ar: 'برج المملكة', ic: '🏙', fixed: 1, svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="420" viewBox="0 0 1600 420" fill="none" stroke="${c}" stroke-width="2"><path d="M0 420V360h60v-40h40v40h50V300h30v60h40v-80h50v80h40v-30h40v30"/><path d="M390 420V360h30v-60h40v60h40"/><path d="M500 420V140q40-80 80-140q40 60 80 140V420"/><path d="M540 140q40-40 80 0"/><path d="M548 120h64M500 420"/><path d="M660 420V320h50v-40h40v40h60V250h40v70h50v-60h40v60h40"/><path d="M980 420V220l40-120 40 120v200M1000 200h40M1020 100v-30"/><circle cx="1020" cy="150" r="14"/><path d="M1060 420V340h60v-40h50v40h60v-90h40v90h50v-50h40v50h60v-30h40v30h40"/><path d="M0 420h1600"/></svg>`, size: '100% auto', pos: 'center bottom' },
  diriyah: { ar: 'الدرعية / الطين', ic: '🧱', svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="120" viewBox="0 0 140 120" fill="none" stroke="${c}" stroke-width="1.3"><path d="M0 100h140M10 100V54l10-8 10 8v46M50 100V40h40v60M100 100V60h30v40"/><path d="M58 40l4-6 4 6 4-6 4 6 4-6 4 6 4-6 4 6"/><path d="M60 56l6-8 6 8zM74 56l6-8 6 8zM16 66h8M108 74h14"/><path d="M62 74h16v14H62zM14 80h12v10H14z"/><path d="M0 112q35-6 70 0t70 0" opacity=".6"/></svg>`, size: '140px 120px' },
  palms: { ar: 'نخيل وصحرا', ic: '🌴', svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="160" viewBox="0 0 220 160" fill="none" stroke="${c}" stroke-width="1.4" stroke-linecap="round"><path d="M60 150c2-30 4-60 0-92"/><path d="M60 58c-14-10-30-10-40-2M60 58c-8-14-22-20-34-18M60 58c4-16 16-24 30-22M60 58c14-8 30-6 40 4M60 58c2-14-2-26-10-34"/><path d="M0 150q55-24 110 0t110 0M0 156q40-12 80 0"/><path d="M170 150c1-18 2-36 0-56M170 94c-8-6-18-6-24 0M170 94c6-8 16-10 24-6M170 94c2-10 0-18-6-22"/></svg>`, size: '220px 160px' },
  sadu: { ar: 'السدو', ic: '🧶', svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="${c}" stroke-width="1.4"><path d="M0 6h80M0 14h80M0 66h80M0 74h80"/><path d="M0 40l10-14 10 14 10-14 10 14 10-14 10 14 10-14 10 14M0 40l10 14 10-14 10 14 10-14 10 14 10-14 10 14 10-14"/><path d="M40 30l4 10-4 10-4-10z" fill="${c}"/></svg>`, size: '80px' },
  hijazi: { ar: 'حجازي (رواشين)', ic: '🪟', svg: c => `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="96" viewBox="0 0 72 96" fill="none" stroke="${c}" stroke-width="1.2"><rect x="6" y="6" width="60" height="84" rx="2"/><path d="M6 30h60M6 66h60M36 6v84"/><path d="M6 30l30 36 30-36M6 66l30-36 30 36"/><path d="M12 12h48v12H12z"/><circle cx="36" cy="48" r="5"/></svg>`, size: '72px 96px' },
  asiri: { ar: 'عسيري (القط)', ic: '🎨', color: 1, svg: () => `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60"><path d="M0 0h120v8H0z" fill="#E1262B"/><path d="M0 8l10 14 10-14 10 14 10-14 10 14 10-14 10 14 10-14 10 14 10-14 10 14 10-14z" fill="#2E8B57"/><path d="M0 30h120v6H0z" fill="#F2B632"/><path d="M0 36l15 12 15-12 15 12 15-12 15 12 15-12 15 12 15-12z" fill="#1F5FA8"/><path d="M0 52h120v8H0z" fill="#7A3E9D"/></svg>`, size: '120px 60px' },
  plain: { ar: 'سادة', ic: '⬜', svg: null }
};
// المناسبة ← الخلفية (لو الاختيار «تلقائي مع الأعياد»)
const OCC_BG = { national: 'kingdom', founding: 'diriyah', flag: 'najdi', ramadan: 'najdi', fitr: 'sadu', adha: 'palms', hijri: 'najdi' };
const ls = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };

export function bgCSS(key, dark, op) {
  const b = BGS[key]; if (!b || !b.svg) return '';
  const col = b.color ? null : (dark ? '#ffffff' : '#8a2a1e');
  return `background-image:${enc(b.svg(col))};background-size:${b.size};background-position:${b.pos || '0 0'};background-repeat:${b.fixed ? 'no-repeat' : 'repeat'};opacity:${op};`;
}
let styleEl = null;
function ensureStyle() {
  if (styleEl) return styleEl; styleEl = document.createElement('style'); styleEl.id = 'decoStyle';
  styleEl.textContent = `
  .deco-bg{position:fixed;inset:0;z-index:-1;pointer-events:none}
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
  const t = cfg.theme || {}; let key = t.bg || 'plain';
  if (t.auto && occKey && OCC_BG[occKey]) key = OCC_BG[occKey];
  if (mOn) key = 'plain';
  let el = document.querySelector('.deco-bg'); const css = bgCSS(key, html.dataset.theme === 'dark', t.op != null ? t.op : (BGS[key] && BGS[key].color ? .06 : .07));
  if (!css) { if (el) el.remove(); }
  else { if (!el) { el = document.createElement('div'); el.className = 'deco-bg'; document.body.prepend(el); } el.setAttribute('style', css); el.dataset.k = key; }
  // هوية الشركة (الاسم واللوجو) على أي عنصر عليه data-brand — وبنراقب الصفحة علشان العناصر اللي بتترسم بعدين
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
export function save(content) { const b = content.brand || {}; const c = { theme: content.theme || {}, mourn: content.mourn || {}, brand: { ar: b.short || '', sub: b.sub || '', en: b.en || '', name: b.name || '', logo: b.logo || '' } }; ls('sh.deco', c); return c; }
// للأقسام (المساحة/المعماري/الإشراف/البصمة/لوحة التحكم): الهوية والحداد بس من غير خلفية
export function applyLite() { const c = cached(); return apply({ ...c, theme: { bg: 'plain' } }); }
export const cached = () => ls('sh.deco') || {};
export const isMourning = () => document.documentElement.classList.contains('mourn');
