// شركة سعد الشمراني — الموقع العام (صفحة واحدة بروابط #) — عربي / English
import { DEFAULT, migrate, PAGE_BLOCKS } from './data.js';
import { EN } from './data-en.js';
import { UI } from './i18n.js';
import { makeBot } from './bot.js';
import * as ACC from './site-acc.js';
import { OCC, activeOcc, greeting, fxHTML, nationalNo } from './occ.js';

const $ = (s, r = document) => r.querySelector(s);
const store = (k, area = 'local') => { try { return (area === 'local' ? localStorage : sessionStorage).getItem(k); } catch (e) { return null; } };
const storeSet = (k, v, area = 'local') => { try { (area === 'local' ? localStorage : sessionStorage).setItem(k, v); } catch (e) { } };
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const deepMerge = (a, b) => { if (Array.isArray(a) || typeof a !== 'object' || !a) return b === undefined ? a : b; const o = { ...a }; for (const k in (b || {})) o[k] = (k in a) ? deepMerge(a[k], b[k]) : b[k]; return o; };
// يدمج الترجمة: النص الإنجليزي يحل محل العربي لو موجود، والمصفوفات تتدمج عنصر بعنصر
function overlay(a, b) {
  if (b == null || b === '') return a;
  if (Array.isArray(a)) return a.map((x, i) => overlay(x, Array.isArray(b) ? b[i] : undefined));
  if (a && typeof a === 'object') { const o = { ...a }; for (const k in a) o[k] = overlay(a[k], b[k]); return o; }
  if (typeof a === 'string' || a === undefined) return typeof b === 'string' || typeof b === 'number' ? b : a;
  return a;
}

/* ---------- state ---------- */
let C = DEFAULT;
const PREVIEW = /[?&]preview=1/.test(location.search);
try { const c = JSON.parse(localStorage.getItem(PREVIEW ? 'sh.preview' : 'sh.site') || 'null'); if (c) C = migrate(deepMerge(DEFAULT, c), EN); } catch (e) { }
let LANG = 'ar';
try { LANG = localStorage.getItem('sh.lang') || (/^en/.test(new URLSearchParams(location.search).get('lang') || '') ? 'en' : 'ar'); } catch (e) { }
let VV = null;
// الإخفاء بالعين 👁: أي عنصر عليه _off أو أي خانة في _off بتختفي من الموقع من غير ما تتمسح
function prune(o, off, path = '') {
  if (Array.isArray(o)) return o.map((x, i) => (x && typeof x === 'object' && x._off) ? undefined : prune(x, off, path + '.' + i)).filter(x => x !== undefined);
  if (o && typeof o === 'object') { const r = {}; for (const k in o) { const pp = path ? path + '.' + k : k; if (off[pp]) { const v = o[k]; r[k] = typeof v === 'string' ? '' : Array.isArray(v) ? [] : (typeof v === 'boolean' ? false : v); } else r[k] = prune(o[k], off, pp); } return r; }
  return o;
}
const V = () => VV || (VV = prune(LANG === 'en' ? overlay(C, deepMerge(EN, C.en || {})) : C, (C._off || {})));
const t = (k, rep) => { let s = (UI[LANG] && UI[LANG][k] !== undefined) ? UI[LANG][k] : UI.ar[k]; if (rep && typeof s === 'string') for (const r in rep) s = s.replace('{' + r + '}', rep[r]); return s; };
const em = s => String(s).replace(/<em>/g, '<span class="hl">').replace(/<\/em>/g, '</span>');
const setC = next => { C = migrate(next, EN); VV = null; };

if (PREVIEW) { try { const bc = new BroadcastChannel('sh-preview'); bc.onmessage = e => { setC(deepMerge(DEFAULT, e.data)); chrome(); render(true); initGlow(); }; } catch (e) { } addEventListener('DOMContentLoaded', () => { const b = document.createElement('div'); b.className = 'preview-flag'; b.textContent = t('preview'); document.body.appendChild(b); }); }

let FB = null;
const fb = () => FB || (FB = import('./fb.js'));
const MEDIA = {};
try { Object.assign(MEDIA, JSON.parse(sessionStorage.getItem('sh.media') || '{}')); } catch (e) { }
function src(s) {
  if (!s) return '';
  if (s.startsWith('m:')) { const id = s.slice(2); if (MEDIA[id]) return MEDIA[id]; loadMedia(id); return 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; }
  return s;
}
const pending = new Set();
async function loadMedia(id) {
  if (pending.has(id)) return; pending.add(id);
  try { const F = await fb(); const d = await F.getDoc(F.doc(F.db, 'siteMedia', id)); if (d.exists()) { MEDIA[id] = d.data().data; try { sessionStorage.setItem('sh.media', JSON.stringify(MEDIA)); } catch (e) { } $$(`img[data-m="${id}"]`).forEach(i => i.src = MEDIA[id]); } } catch (e) { }
}
const img = (s, alt = '', cls = '') => { const m = s && s.startsWith('m:') ? ` data-m="${s.slice(2)}"` : ''; return `<img src="${esc(src(s))}"${m} alt="${esc(alt)}" loading="lazy" class="${cls}">`; };

async function loadRemote() {
  if (PREVIEW) return;
  try {
    const F = await fb(); const d = await F.getDoc(F.doc(F.db, 'site', 'content'));
    const dd = d.exists() ? d.data() : null; let remote = null;
    if (dd && dd.json) { try { remote = JSON.parse(dd.json); } catch (e) { } } else if (dd && dd.data) remote = dd.data;
    if (remote) { storeSet('sh.site', JSON.stringify(remote));
      const next = migrate(deepMerge(DEFAULT, remote), EN);
      if (JSON.stringify(next) !== JSON.stringify(C)) { setC(next); chrome(); render(true); initGlow(); }
    }
  } catch (e) { }
}

/* ---------- icons ---------- */
const I = {
  arrow: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zM3 5l9 8 9-8"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M12 21.5s-7-6.7-7-11.9a7 7 0 0 1 14 0c0 5.2-7 11.9-7 11.9z"/><circle cx="12" cy="9.6" r="2.6"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  ticket: '<svg viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 0 0 4v5h18v-5a2 2 0 0 1 0-4V3H3z"/><path d="M9 3v14"/></svg>',
  track: '<svg viewBox="0 0 24 24"><path d="M4 12h4l3-8 4 16 3-8h2"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>', next: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  gift: '<svg viewBox="0 0 24 24"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21 8.1c0-1.7-.4-3.2-1.6-4.4S16.7 2 15 2H9C7.3 2 5.8 2.4 4.6 3.6S3 6.3 3 8v8c0 1.7.4 3.2 1.6 4.4S7.3 22 9 22h6c1.7 0 3.2-.4 4.4-1.6S21 17.7 21 16zm-2.3 9.8a2.9 2.9 0 0 1-1.6 1.6c-1.1.4-3.8.3-5.1.3s-4 .1-5.1-.3a2.9 2.9 0 0 1-1.6-1.6c-.4-1.1-.3-3.8-.3-5.1s-.1-4 .3-5.1A2.9 2.9 0 0 1 6.9 4.2C8 3.8 10.7 3.9 12 3.9s4-.1 5.1.3a2.9 2.9 0 0 1 1.6 1.6c.4 1.1.3 3.8.3 5.1s.1 4-.3 5.1z"/></svg>',
  tk: '<svg viewBox="0 0 24 24"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M17.8 3H21l-7 8 8.2 10H16l-5-6.3L5.3 21H2l7.5-8.6L1.6 3H8l4.6 5.8zM16.6 19.2h1.8L7.3 4.7H5.4z"/></svg>',
  sc: '<svg viewBox="0 0 24 24"><path d="M12 2.5c2.9 0 5 2.1 5.1 5v2.3l1.6-.5c.6 0 1 .5.8 1-.3.7-1.9.9-2.2 1.4.4 1.6 2.3 3.4 4 3.8.4.2.4.6.1.9-.7.6-2.2.6-2.5 1-.2.4-.1 1.1-.6 1.3-.6.2-1.7-.3-2.8 0-1.2.4-2 1.9-3.5 1.9s-2.3-1.5-3.5-1.9c-1.1-.3-2.2.2-2.8 0-.5-.2-.4-.9-.6-1.3-.3-.4-1.8-.4-2.5-1-.3-.3-.3-.7.1-.9 1.7-.4 3.6-2.2 4-3.8-.3-.5-1.9-.7-2.2-1.4-.2-.5.2-1 .8-1l1.6.5V7.5c.1-2.9 2.2-5 5.1-5z"/></svg>',
  yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.8 15.1V8.9l5.7 3.1z"/></svg>'
};
const SOC = [['youtube', 'yt', 'يوتيوب', 'YouTube'], ['tiktok', 'tk', 'تيك توك', 'TikTok'], ['instagram', 'ig', 'انستقرام', 'Instagram'], ['snapchat', 'sc', 'سناب شات', 'Snapchat'], ['x', 'x', 'إكس', 'X']];
const socName = s => LANG === 'en' ? s[3] : s[2];
const wa = (txt) => `https://wa.me/${V().contact.whatsapp}?text=${encodeURIComponent(txt || V().contact.waText)}`;
const tel = n => 'tel:' + String(n || V().contact.phone).replace(/\s/g, '');
const ext = href => /^https?:|^mailto:|^tel:/.test(href) ? 'target="_blank" rel="noopener"' : '';

/* ---------- design (من لوحة التحكم) ---------- */
function applyDesign() {
  const pgk = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || 'home';
  const d0 = C.design || {}, d = { ...d0, ...((d0.pageStyle || {})[pgk] || {}) }, r = document.documentElement.style;
  const ok = activeOcc(C.occasion), oc = ok && OCC[ok], red = (oc && oc.red) || d.red, gold = (oc && oc.gold) || d.gold;
  if (red) { r.setProperty('--red', red); r.setProperty('--red2', `color-mix(in srgb, ${red} 82%, #000)`); } else { r.removeProperty('--red'); r.removeProperty('--red2'); }
  if (gold) r.setProperty('--gold', gold); else r.removeProperty('--gold');
  if (ok) document.documentElement.dataset.occ = ok; else delete document.documentElement.dataset.occ;
  r.setProperty('--fs', ((+d.fontScale || 100) / 100).toFixed(2));
  r.setProperty('--logo', ((+d.logoSize || 100) / 100).toFixed(2));
  r.setProperty('--hlogo', ((+d.heroLogoSize || 100) / 100).toFixed(2));
  document.documentElement.classList.toggle('no-glass', d.glass === false);
  // الخط
  const FONTS = { cairo: 'Cairo', tajawal: 'Tajawal', almarai: 'Almarai', readex: 'Readex Pro', rubik: 'Rubik' };
  const fam = FONTS[d.font];
  if (fam) { if (!document.getElementById('fx-font')) { const l = document.createElement('link'); l.id = 'fx-font'; l.rel = 'stylesheet'; document.head.appendChild(l); } document.getElementById('fx-font').href = `https://fonts.googleapis.com/css2?family=${fam.replace(/ /g, '+')}:wght@400;500;700;800&display=swap`; r.setProperty('--hd', `'${fam}',system-ui,sans-serif`); r.setProperty('--bd', `'${fam}',system-ui,sans-serif`); }
  else { r.removeProperty('--hd'); r.removeProperty('--bd'); }
  // اللوجو
  const logo = d.logo ? src(d.logo) : 'assets/img/mark.png';
  $$('img[data-logo]').forEach(i => { i.src = logo; if (d.logo && d.logo.startsWith('m:')) i.dataset.m = d.logo.slice(2); });
}

/* ---------- chrome ---------- */
const NAV_MAIN = ['', 'services', 'projects', 'packages', 'contact'];
const NAV_ALL = ['', 'services', 'projects', 'packages', 'about', 'support', 'track', 'request', 'contact'];
function chrome() {
  const v = V();
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
  document.title = v.seo.title; applyDesign(); seoMeta(v);
  $('#bShort').textContent = v.brand.short; $('#bSub').textContent = t('company');
  $('#langBtn').textContent = t('langBtn'); $('#langBtn').title = t('langName');
  $('#reqBtn').textContent = t('request');
  paintAcc();
  $('#nav').innerHTML = NAV_MAIN.filter(r => r !== 'packages' || v.packages.on).map(r => `<a href="#/${r}" data-r="${r}" class="${r === 'packages' ? 'nav-pk' : ''}">${t(r || 'home')}</a>`).join('') + `<button class="more-btn" id="moreBtn" aria-label="${t('more')}" aria-expanded="false"><i></i><i></i><i></i></button>`;
  $('#moreList').innerHTML = NAV_ALL.filter(r => r !== 'packages' || v.packages.on).map((r, i) => `<a href="#/${r}" data-r="${r}" style="--i:${i}"><span>${t(r || 'home')}</span>${I.prev}</a>`).join('') + `<a href="#/${ACC.signedIn() ? 'my' : 'account'}" data-r="${ACC.signedIn() ? 'my' : 'account'}" class="acc-link" style="--i:10"><span>${ACC.signedIn() ? t('myProject') : t('myAccount')}</span>${I.prev}</a>` + (store('sh.staff') ? `<a href="portal.html" class="staff-link" style="--i:11"><span>${t('staff')}</span>${I.prev}</a>` : '') +
    `<div class="more-foot"><a class="btn btn-red" href="${wa()}" target="_blank" rel="noopener">${I.wa} ${t('waNow')}</a><a class="btn btn-ghost" href="${tel()}" dir="ltr">${I.phone} ${esc(v.contact.phone)}</a><button class="btn btn-ghost" data-lang>${t('switchLang')}</button></div>`;
  $('#moreBtn').onclick = () => toggleMore();
  $('#waFab').href = wa();
  const an = v.announce; $('#announce').classList.remove('occ'); if (paintOcc(v)) { } else if (an.on && an.text && store('sh.annX','session') !== an.text) { $('#announce').hidden = false; $('#announceText').innerHTML = an.link ? `<a href="${esc(an.link)}">${esc(an.text)}</a>` : esc(an.text); } else $('#announce').hidden = true;
  const s = v.socials, soc = SOC.filter(x => s[x[0]]).map(x => `<a href="${esc(s[x[0]])}" target="_blank" rel="noopener" aria-label="${socName(x)}">${I[x[1]]}</a>`).join('');
  $('#ftr').innerHTML = `<div class="wrap"><div class="ftr-grid">
    <div><div class="brand" style="color:#fff"><span class="mark"><img src="assets/img/mark.png" data-logo alt="" width="40"></span><span class="bname"><b>${esc(v.brand.short)}</b><small>${t('company')}</small></span></div>
      <p style="margin-top:14px;max-width:360px">${esc(v.hero.lead)}</p><div class="soc">${soc}</div></div>
    <div><h5>${t('fServices')}</h5>${v.services.map(x => `<a href="#/service/${esc(x.id)}">${esc(x.title)}</a>`).join('')}</div>
    <div><h5>${t('links')}</h5><a href="#/projects">${t('projects')}</a>${v.packages.on ? `<a href="#/packages">${t('packages')}</a>` : ''}<a href="#/about">${t('aboutLic')}</a><a href="#/support">${t('helpCenter')}</a><a href="#/track">${t('track')}</a><a href="#/contact">${t('contact')}</a></div>
    <div><h5>${t('fContact')}</h5><a href="${tel()}" dir="ltr" class="num">${esc(v.contact.phone)}</a>${v.contact.phone2 ? `<a href="${tel(v.contact.phone2)}" dir="ltr" class="num">${esc(v.contact.phone2)}</a>` : ''}<a href="mailto:${esc(v.contact.email)}">${esc(v.contact.email)}</a><p style="margin-top:8px">${esc(v.contact.address)}</p></div>
  </div><div class="ftr-bot"><span>© ${new Date().getFullYear()} ${esc(v.brand.name)}. ${t('rights')}</span><span>${store('sh.staff') ? `<a href="portal.html" style="display:inline;opacity:1;color:var(--red)">${t('staff')}</a>` : t('city')}</span></div></div>`;
  $('#botName').textContent = t('botName'); $('#botSubT').textContent = t('botSub'); $('#botIn').placeholder = t('botPh'); $('#botSend').textContent = t('sendB'); { const fl = (v.brand && v.brand.chatLabel) || t('ask'); $('#botFabT').textContent = fl; $('#botFab').setAttribute('aria-label', fl); }
  $('#holdHint').textContent = t('staffHint');
  $$('[data-lang]').forEach(b => b.onclick = switchLang);
  applyDesign();
}
/* المناسبة الحالية: شريط تهنئة + زينة متحركة (الزائر يقدر يقفلها) */
function paintOcc(v) {
  const k = activeOcc(C.occasion), o = C.occasion || {}, en = LANG === 'en'; let fx = $('#occFx');
  const off = store('sh.occFx', 'session') === '0' || o.fx === false || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!k || off) { if (fx) fx.remove(); } else if (!fx || fx.dataset.k !== k) { if (fx) fx.remove(); fx = document.createElement('div'); fx.id = 'occFx'; fx.className = 'occ-fx'; fx.dataset.k = k; fx.setAttribute('aria-hidden', 'true'); fx.innerHTML = fxHTML(k, matchMedia('(max-width:700px)').matches); document.body.appendChild(fx); }
  if (!k) return false;
  const txt = greeting(k, LANG, (v.occasion || {}).text), bar = $('#announce');
  if (store('sh.occBar', 'session') === k) return false;
  bar.hidden = false; bar.classList.add('occ'); $('#announceText').innerHTML = `<span class="occ-ic">${OCC[k].ic}</span>${esc(txt)}${off ? '' : ` <button class="occ-off" type="button">${en ? 'Hide decorations' : 'إخفاء الزينة'}</button>`}`;
  const b = $('.occ-off', bar); if (b) b.onclick = e => { e.stopPropagation(); storeSet('sh.occFx', '0', 'session'); const f = $('#occFx'); if (f) f.remove(); b.remove(); };
  bar.dataset.occ = k; return true;
}
function seoMeta(v) {
  let k = document.querySelector('meta[name=keywords]'); if (!k) { k = document.createElement('meta'); k.name = 'keywords'; document.head.appendChild(k); } k.content = v.seo.keywords || '';
  let j = document.getElementById('ld-org'); if (!j) { j = document.createElement('script'); j.type = 'application/ld+json'; j.id = 'ld-org'; document.head.appendChild(j); }
  const c = v.contact, url = location.origin + location.pathname;
  j.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', additionalType: 'https://schema.org/EngineeringService', name: v.brand.name, alternateName: v.brand.short, url, logo: url.replace(/[^/]*$/, '') + 'assets/img/icon-512.png', image: url.replace(/[^/]*$/, '') + 'assets/video/hero-poster.jpg', description: v.seo.desc, telephone: '+966' + String(c.phone || '').replace(/\D/g, '').replace(/^0/, ''), email: c.email, foundingDate: String(v.brand.founded || ''), address: { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: 'Riyadh', addressCountry: 'SA' }, areaServed: 'SA', keywords: v.seo.keywords, sameAs: Object.values(v.socials || {}).filter(x => /^https?:/.test(x)), makesOffer: v.services.map(x => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.title, description: x.short } })) });
}
function paintAcc() {
  { const ab = $('#accBtn'); if (ab) { ab.href = '#/' + (ACC.signedIn() ? 'my' : 'account'); ab.title = ACC.signedIn() ? t('myProject') : t('myAccount'); ab.classList.toggle('on', ACC.signedIn()); ab.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>${ACC.signedIn() ? (LANG === 'en' ? 'My project' : 'مشروعي') : (LANG === 'en' ? 'Sign in' : 'دخول')}</span>`; } }
}
function toggleMore(on) {
  const m = $('#more'), open = on === undefined ? m.hidden : on;
  m.hidden = !open; document.body.classList.toggle('more-open', open);
  const b = $('#moreBtn'); if (b) b.setAttribute('aria-expanded', open);
}
function switchLang() {
  LANG = LANG === 'en' ? 'ar' : 'en'; VV = null; try { localStorage.setItem('sh.lang', LANG); } catch (e) { }
  document.body.classList.add('lang-swap'); setTimeout(() => document.body.classList.remove('lang-swap'), 500);
  toggleMore(false); chrome(); render(true); resetBot();
}
function popup() {
  const p = V().popup; if (!p.on || !p.title) return;
  const key = 'sh.pop.' + (p.title + p.text).length + p.title.slice(0, 10);
  if (store(key,'session')) return;
  setTimeout(() => {
    storeSet(key, '1', 'session');
    $('#popBody').innerHTML = `${p.img ? img(p.img) : ''}<div class="in"><h3>${esc(p.title)}</h3><p>${nl(p.text)}</p>${p.btn ? `<a class="btn btn-red" href="${esc(p.link || wa())}" ${(p.link || '').startsWith('#') ? '' : 'target="_blank" rel="noopener"'} id="popGo">${esc(p.btn)}</a>` : ''}</div>`;
    $('#popup').hidden = false; const g = $('#popGo'); if (g) g.onclick = () => $('#popup').hidden = true;
  }, (p.delay || 6) * 1000);
}

/* ---------- blocks ---------- */
const head = (eyebrow, title, sub, extra = '') => `<div class="sec-h rv"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${em(title)}</h2></div>${sub ? `<p>${esc(sub)}</p>` : ''}${extra}</div>`;
const svcCard = (v, i) => `<a class="svc glass rv d${i % 4}" href="#/service/${esc(v.id)}"><div class="ph">${img(v.img, v.title)}<span class="no">${esc(v.no || String(i + 1).padStart(2, '0'))}</span></div><div class="bd"><h3>${esc(v.title)}</h3><p>${esc(v.short)}</p><span class="more">${t('more2')} ${I.arrow}</span></div></a>`;
const ctaBox = () => { const v = V(); return `<section class="sec tight"><div class="wrap"><div class="cta-box rv"><div><h2>${esc(v.cta.title)}</h2><p>${esc(v.cta.text)}</p></div><div class="acts"><a class="btn btn-ink" href="${wa()}" target="_blank" rel="noopener">${I.wa} ${t('waNow')}</a><a class="btn btn-ghost" href="#/request">${t('reqOnline')}</a><small>${t('call')} <a href="${tel()}" dir="ltr">${esc(v.contact.phone)}</a> · ${esc(v.contact.replyNote)}</small></div></div></div></section>`; };
const crumbs = (x) => `<div class="crumbs"><a href="#/">${t('home')}</a><span>/</span><span>${esc(x)}</span></div>`;
const stats = () => `<div class="stats rv">${V().stats.map((s, i) => `<div class="stat d${i}"><b>${s.pre ? `<em>${esc(s.pre)}</em>` : ''}<span data-count="${+s.n || 0}" data-from="${s.plain ? Math.max(0, (+s.n || 0) - 26) : 0}">${s.plain ? esc(s.n) : 0}</span>${s.suf ? `<em>${esc(s.suf)}</em>` : ''}</b><span>${esc(s.l)}</span></div>`).join('')}</div>`;
const pkCards = () => { const v = V(); return v.packages.list.map((p, i) => `<div class="pk glass rv d${i} ${p.featured ? 'feat' : ''}">${p.featured ? `<span class="badge">★ ${t('mostWanted')}</span>` : ''}<h3>${esc(p.name)}</h3><div class="price">${esc(p.price)}<small>${esc(p.unit)}</small></div><div class="note">${esc(p.note)}</div><ul>${(p.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul><a class="btn ${p.featured ? 'btn-gold' : 'btn-ghost'}" href="${wa(t('pkgWa') + p.name)}" target="_blank" rel="noopener">${t('orderPkg')}</a></div>`).join(''); };
const galleryBlock = () => { const it = V().gallery.map(g => `<figure data-lb="${esc(src(g.img))}" data-cap="${esc(g.title)}">${img(g.img, g.title)}<figcaption><b>${esc(g.title)}</b><span>${esc(g.sub)}</span></figcaption></figure>`).join('');
  return `<section class="sec dark gal-sec"><div class="grid-bg"></div><div class="wrap">${head(t('gallery'), t('galleryTitle'), '', `<div class="gal-nav"><button data-g="1" aria-label="${t('prev')}">${I.prev}</button><button data-g="-1" aria-label="${t('next')}">${I.next}</button></div>`)}</div>
  <div class="gal strip" id="gal" dir="ltr" data-dir="left"><div class="strip-tr">${it}${it}${it}</div></div></section>`; };
const strip = () => { const v = V(); const items = v.services.map(x => `<a class="st-item" href="#/service/${esc(x.id)}" draggable="false"><span class="st-ph">${img(x.img, '')}</span><span class="st-t"><b>${esc(x.title)}</b><small>${esc(x.short)}</small></span><span class="st-go">${I.arrow}</span></a>`).join('');
  return `<section class="strip-sec"><div class="wrap strip-h"><span class="eyebrow">${t('stripTitle')}</span><small class="swipe">${t('stripHint')} <i>⇆</i></small></div><div class="strip" id="strip" dir="ltr" data-dir="right"><div class="strip-tr">${items}${items}${items}</div></div></section>`; };
function offerBlock() {
  const o = V().offer; if (!o || !o.on || !o.title) return '';
  const end = o.until ? new Date(o.until).getTime() : 0; if (end && end < Date.now()) return '';
  return `<section class="sec tight offer-sec"><div class="wrap"><div class="offer glass rv">${o.img ? `<div class="offer-img">${img(o.img, o.title)}</div>` : `<div class="offer-ic">${I.gift}</div>`}
    <div class="offer-bd"><span class="offer-badge">${esc(o.badge || 'عرض')}</span><h3>${esc(o.title)}</h3><p>${nl(o.text)}</p>${end ? `<div class="cd" data-end="${end}"><small>${t('offerEnds')}</small><div>${['d', 'h', 'm', 's'].map(k => `<span><b data-k="${k}">0</b><i>${t(k)}</i></span>`).join('')}</div></div>` : ''}</div>
    <a class="btn btn-gold" href="${esc(o.link || '#/request')}" ${ext(o.link || '')}>${esc(o.btn || t('request'))} ${I.arrow}</a></div></div></section>`;
}
const socialBlock = () => { const s = V().socials, m = V().media; const list = SOC.filter(x => s[x[0]]); if (!list.length) return '';
  return `<section class="sec social-sec"><div class="wrap">${head(t('socialEy'), esc(m.title), m.sub)}<div class="soc-grid">${list.map((x, i) => `<a class="soc-tile s-${x[0]} rv d${i % 4}" href="${esc(s[x[0]])}" target="_blank" rel="noopener" data-ev="soc:${x[0]}"><span class="si">${I[x[1]]}</span><b>${socName(x)}</b><small>${esc(t('followOn', { p: socName(x) }))} ${I.arrow}</small></a>`).join('')}</div></div></section>`; };
const faqItem = (f) => `<details class="glass rv"><summary>${esc(f.q)}${f.cat ? `<span class="cat">${esc(f.cat)}</span>` : ''}</summary><div class="ans">${nl(f.a)}</div></details>`;

/* ---------- pages ---------- */
const P = {};
/* ===== الصفحة الرئيسية v7 (تصميم الشركة الكبيرة) ===== */
const ARW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
const subHref = (sid, n) => `#/service/${encodeURIComponent(sid)}/${n}`;
function svcPanel(x, i) {
  if (!x) return ''; const en = LANG === 'en';
  return `<div class="h7-x-img"><img src="${esc(src(x.img))}" alt="${esc(x.title)}"><span class="nn">${String(i + 1).padStart(2, '0')}</span></div>
    <div class="h7-x-b"><h3>${esc(x.title)}</h3><p>${esc(x.desc || x.short)}</p><h4>${en ? 'Included services' : 'الخدمات المشمولة'}</h4>
    <ul class="h7-x-ul">${(x.items || []).map((it, n) => `<li style="--gi:${n}"><a href="${subHref(x.id, n)}">${esc(it)}<span>${ARW}</span></a></li>`).join('')}</ul>
    <a class="h7-red sm" href="#/service/${esc(x.id)}">${en ? 'Department details' : 'تفاصيل القسم'} ${ARW}</a></div>`;
}
/* سطر «حمّل التطبيق»: روابط المتاجر لو موجودة، وإلا تثبيت التطبيق من المتصفح */
function appStrip(v) {
  const c = v.contact || {}, en = LANG === 'en', line = c.appLine || (en ? 'Get the app to follow your project' : 'حمّل التطبيق لمتابعة مشروعك');
  const gp = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 3.5v17l9-8.5z" fill="#34A853"/><path d="M4 3.5l9 8.5 3-2.8L5.6 3z" fill="#4285F4"/><path d="M4 20.5l9-8.5 3 2.8-10.4 6.2z" fill="#EA4335"/><path d="M16 9.2l3.6 2.1c.7.4.7 1 0 1.4L16 14.8 13 12z" fill="#FBBC04"/></svg>';
  const ap = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="18" r="1.1"/></svg>';
  const b = (href, ic, sm, big, k) => href ? `<a class="h7-store" href="${esc(href)}" target="_blank" rel="noopener" data-ev="app:${k}">${ic}<span><small>${sm}</small><b>${big}</b></span></a>` : `<button class="h7-store" data-inst="${k}">${ic}<span><small>${sm}</small><b>${big}</b></span></button>`;
  return `<div class="h7-app"><span class="h7-app-t"><i>📱</i>${esc(line)}</span><div class="h7-app-b">${b(c.playStore, gp, en ? 'Get it on' : 'حمّله من', 'Google Play', 'android')}${b(c.appStore, ap, en ? 'Download on the' : 'حمّله من', 'App Store', 'ios')}</div></div>`;
}
const grps = p => String(p.grp || '').split(/[,،]/).map(x => x.trim()).filter(Boolean);
function workCards() {
  const v = V(), Ga = C.workGroups || [], en = LANG === 'en';
  return (v.workGroups || []).map((g, i) => { const key = (Ga[i] || {}).key || g.key; if (!key) return ''; const P = v.projects.filter(p => grps(p).includes(key)); const n = P.reduce((a, p) => a + (p.img ? 1 : 0) + (p.gallery || []).filter(x => x.img).length, 0);
    const im = g.img || (P.find(p => p.img) || {}).img || '';
    return `<a class="h7-wk rv d${i % 5}" href="#/projects?g=${encodeURIComponent(key)}">${im ? img(im, g.title) : ''}<div class="ov"><span class="cnt">${n} ${en ? 'photos' : 'صورة'}</span><h3>${esc(g.title)}</h3><p>${esc(g.sub || '')}</p><span class="go">${ARW}</span></div></a>`; }).join('');
}
/* الأقسام بتقلّب لوحدها كل ٥ ثواني، وتقف لما العميل يلمسها */
let xTimer = null;
function wireX() {
  clearInterval(xTimer); const sec = $('#services'), p = $('#h7X'); if (!sec || !p || !$('.h7-xi')) return;
  const mob = () => matchMedia('(max-width:860px)').matches; let vis = false, hold = 0;
  const show = (el, user) => { const i = +el.dataset.xi, sv = V().services[i]; if (!sv) return; $$('.h7-xi').forEach(x => { x.classList.toggle('on', x === el); x.setAttribute('aria-selected', x === el); x.classList.remove('run'); });
    if (!user && !hold) { void el.offsetWidth; el.classList.add('run'); }
    p.classList.add('sw'); setTimeout(() => { p.innerHTML = svcPanel(sv, i); if (user && mob()) { el.after(p); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } p.classList.remove('sw'); }, mob() && user ? 0 : 180); };
  $$('.h7-xi').forEach(el => el.onclick = () => { hold = Date.now(); if (!el.classList.contains('on') || mob()) show(el, 1); });
  sec.addEventListener('mouseenter', () => { hold = hold || 1; $$('.h7-xi.run').forEach(x => x.classList.remove('run')); }); sec.addEventListener('mouseleave', () => { if (hold === 1) hold = 0; });
  { const on = $('.h7-xi.on'); if (on && mob()) on.after(p); }
  try { new IntersectionObserver(e => { const was = vis; vis = e[0].isIntersecting; sec.classList.toggle('xin', vis || sec.classList.contains('xin')); if (vis && !was && !hold) { const on = $('.h7-xi.on'); on && (on.classList.remove('run'), void on.offsetWidth, on.classList.add('run')); } }, { threshold: .25 }).observe(sec); } catch (e) { vis = true; sec.classList.add('xin'); }
  xTimer = setInterval(() => {
    if (!document.body.contains(sec)) return clearInterval(xTimer);
    if (hold > 1 && Date.now() - hold > 10000) hold = 0;
    if (!vis || hold || document.hidden) return;
    const all = $$('.h7-xi'), cur = all.findIndex(x => x.classList.contains('on')); show(all[(cur + 1) % all.length]);
  }, 5000);
}
let instEv = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); instEv = e; });
addEventListener('appinstalled', () => { instEv = null; toast(LANG === 'en' ? 'App installed ✓' : 'التطبيق اتثبت ✓'); });
async function doInstall(k) {
  const en = LANG === 'en', ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (matchMedia('(display-mode: standalone)').matches) return toast(en ? 'The app is already installed ✓' : 'التطبيق متثبت عندك بالفعل ✓');
  if (instEv && !ios) { instEv.prompt(); try { await instEv.userChoice; } catch (e) { } instEv = null; return; }
  const steps = ios ? (en ? ['Open this site in <b>Safari</b>', 'Tap the <b>Share</b> button ⬆︎', 'Choose <b>Add to Home Screen</b>'] : ['افتح الموقع من متصفح <b>Safari</b>', 'اضغط زر <b>المشاركة</b> ⬆︎', 'اختار <b>إضافة إلى الشاشة الرئيسية</b>'])
    : (en ? ['Open the browser menu <b>⋮</b>', 'Choose <b>Install app</b> or <b>Add to Home screen</b>'] : ['افتح قائمة المتصفح <b>⋮</b>', 'اختار <b>تثبيت التطبيق</b> أو <b>إضافة إلى الشاشة الرئيسية</b>']);
  $('#popBody').innerHTML = `<div class="inst"><img src="assets/img/icon-192.png" alt="" width="64" height="64"><h3>${en ? 'Install the app' : 'ثبّت التطبيق على جوالك'}</h3><p>${en ? 'Follow your project, reports and chat with your engineer from your home screen.' : 'تابع مشروعك وتقاريرك وكلّم المهندس من الشاشة الرئيسية لجوالك.'}</p><ol>${steps.map(x => `<li>${x}</li>`).join('')}</ol>${ios ? `<p class="inst-n">${en ? 'Coming soon on the App Store.' : 'قريباً على App Store.'}</p>` : `<p class="inst-n">${en ? 'Coming soon on Google Play.' : 'قريباً على Google Play.'}</p>`}</div>`;
  $('#popup').hidden = false;
}
function homeV7() {
  const v = V(), h = v.hero, d = C.design || {}, en = LANG === 'en';
  const tag = (x, gold) => `<div class="h7-tag ${gold ? 'g' : ''}"><i></i>${x}</div>`;
  const vsrc = (h.videoMobile && matchMedia('(max-width:700px) and (orientation:portrait)').matches) ? h.videoMobile : h.videoSrc;
  const S = {
    offer: offerBlock, packages: () => v.packages.on ? `<section class="sec"><div class="wrap">${head(t('pkgEy'), esc(v.packages.title), v.packages.sub)}<div class="pk-grid">${pkCards()}</div></div></section>` : '',
    social: socialBlock, strip, gallery: galleryBlock,
    stats: () => `<section class="stats-sec"><div class="wrap">${stats()}</div></section>`,
    faq: () => `<section class="sec tight"><div class="wrap">${head(t('faqEy'), t('faqTitle'), '', `<a class="btn btn-ghost sm" href="#/support">${t('faqAll')}</a>`)}<div class="faq">${v.faq.slice(0, 4).map(faqItem).join('')}</div></div></section>`,
    why: () => `<section class="sec alt"><div class="wrap">${head(t('whyEy'), t('whyTitle'), '')}<div class="why">${v.about.why.map((w, i) => `<div class="it glass rv d${i}"><span class="ic">0${i + 1}</span><div><h4>${esc(w.t)}</h4><p>${esc(w.d)}</p></div></div>`).join('')}</div></div></section>`,
    trust: () => `<section class="h7-trust"><div class="wrap h7-trust-in"><small>${en ? 'We work with' : 'نتعامل مع'}</small>${v.partners.slice(0, 6).map(p => `<span>${esc(p)}</span>`).join('')}</div></section>`,
    partners: () => S.trust(),
    services: () => `<section class="h7-sec" id="services"><div class="wrap"><div class="h7-sh"><div>${tag(en ? 'Our services' : 'خدماتنا')}<h2 class="h7-h2">${en ? 'Every engineering discipline under one roof' : 'كل الأقسام الهندسية تحت سقف واحد'}</h2></div><p>${esc(t('svcSub'))}</p></div>
      <div class="h7-x"><div class="h7-x-l" role="tablist">${v.services.map((x, i) => `<button class="h7-xi ${i ? '' : 'on'}" role="tab" aria-selected="${!i}" data-xi="${i}" style="--xi:${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="tt"><b>${esc(x.title)}</b><small>${esc(x.short)}</small></span><span class="ar">${ARW}</span></button>`).join('')}</div>
      <div class="h7-x-p" id="h7X">${svcPanel(v.services[0], 0)}</div></div></div></section>`,
    feature: () => `<section class="h7-sec h7-dark" id="work"><div class="wrap"><div class="h7-sh"><div>${tag(en ? 'Our work' : 'من أعمالنا', 1)}<h2 class="h7-h2">${en ? 'Documented work, not just photos' : 'أعمال موثّقة، مش مجرد صور'}</h2></div><p>${en ? 'Pick a field to see all its projects and photos.' : 'اختار المجال وشوف كل مشاريعه وصوره.'}</p></div>
      <div class="h7-wk-g">${workCards()}</div>
      <div class="h7-all on"><a class="h7-red glow" href="#/projects">${en ? 'See all our work' : 'شوف كل أعمالنا'} ${ARW}</a></div></div></section>`,
    reviews: () => v.reviews && v.reviews.on !== false ? `<section class="h7-sec h7-rev" id="reviews"><div class="wrap"><div class="h7-sh"><div>${tag(en ? 'Reviews' : 'آراء العملاء')}<h2 class="h7-h2">${esc(v.reviews.title)}</h2></div><div class="rev-hd"><p>${esc(v.reviews.sub)}</p><button class="h7-red sm" data-review>✍️ ${en ? 'Write your review' : 'اكتب رأيك'}</button></div></div><div class="rev-track" id="revTrack"><p class="rev-empty">${en ? 'Loading…' : 'جارٍ التحميل…'}</p></div></div></section>` : '',
    steps: () => `<section class="h7-sec" id="process"><div class="wrap"><div class="h7-sh"><div>${tag(t('how'))}<h2 class="h7-h2">${en ? 'Clear steps, no surprises' : 'خطوات واضحة، بدون مفاجآت'}</h2></div></div><div class="h7-steps">${v.about.steps.map((x, i) => `<div class="h7-step rv d${i}"><span class="dot"></span><span class="sn">${String(i + 1).padStart(2, '0')}</span><h4>${esc(x.t)}</h4><p>${esc(x.d)}</p></div>`).join('')}</div></div></section>`,
    portal: () => `<section class="h7-portal-w" id="portal"><div class="wrap"><div class="h7-portal"><div>${tag(en ? 'New' : 'جديد', 1)}<h2 class="h7-h2" style="font-size:clamp(26px,3.4vw,40px)">${en ? 'Follow your project from your phone' : 'تابع مشروعك من جوالك'}</h2><p>${en ? 'Sign in to see supervision reports and drawings as they come, and chat with your engineer right here.' : 'سجّل دخولك وشوف تقارير الإشراف والمخططات أول بأول، وكلّم المهندس المختص مباشرة على الموقع.'}</p><div class="h7-chips"><span>${en ? 'Supervision reports' : 'تقارير الإشراف'}</span><span>${en ? 'Drawings' : 'المخططات المعمارية والإنشائية'}</span><span>${en ? 'MEP' : 'الكهروميكانيك'}</span><span>${en ? 'Comments to your engineer' : 'تعليقك للمهندس'}</span></div></div><a class="h7-red big" href="#/${ACC.signedIn() ? 'my' : 'account'}">${ACC.signedIn() ? (en ? 'My project' : 'مشروعي') : (en ? 'Sign in / Create account' : 'دخول / إنشاء حساب')}</a></div></div></section>`,
    cta: () => { const c = v.contact, ic = (d) => `<span class="ct-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg></span>`;
      const adr = String(c.address || '').split(/\s+—\s+/); const a1 = adr.slice(0, 2).join(' — '), a2 = adr.slice(2).join(' — ');
      const cp = x => `<button class="ct-cp" data-copy="${esc(x)}" aria-label="${en ? 'Copy' : 'نسخ'}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>`;
      return `<section class="h7-sec h7-dark h7-end-w" id="contact"><div class="wrap"><div class="ct-g">
      <div class="ct-l">${tag(en ? 'Start your project' : 'ابدأ مشروعك', 1)}<h2 class="h7-big">${en ? 'Send us your title deed —<br><em>we reply with a clear path.</em>' : 'أرسل صكّ أرضك،<br><em>ونرجع لك بمسار واضح.</em>'}</h2>
        <p class="ct-note"><i></i>${esc(c.replyNote || '')}</p>
        <div class="h7-btns"><a class="h7-red" href="#/request">${esc(h.cta1)} ${ARW}</a><a class="ct-wa" href="${wa()}" target="_blank" rel="noopener">${I.wa} ${en ? 'WhatsApp us' : 'كلّمنا واتساب'}</a></div>
        <a class="ct-deed" href="#/request?deed=1"><span>📎</span><div><b>${en ? 'Upload your title deed' : 'ارفع صورة الصك'}</b><small>${en ? 'We review it and call you back' : 'نراجعه ونتواصل معك'}</small></div>${ARW}</a></div>
      <div class="ct-cards">
        <div class="ct-c"><a href="tel:${esc(c.phone)}" class="ct-a">${ic('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>')}<span><small>${en ? 'Call us' : 'اتصال'}</small><b dir="ltr" class="h7-num">${esc(c.phone)}</b></span></a>${cp(c.phone)}</div>
        <div class="ct-c wa"><a href="${wa()}" target="_blank" rel="noopener" class="ct-a"><span class="ct-ic">${I.wa}</span><span><small>${en ? 'WhatsApp' : 'واتساب'}</small><b dir="ltr" class="h7-num">${esc(c.phone)}</b></span></a></div>
        <div class="ct-c wide"><a href="mailto:${esc(c.email)}" class="ct-a">${ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>')}<span><small>${en ? 'Email' : 'البريد'}</small><b dir="ltr" class="ct-mail">${esc(c.email)}</b></span></a>${cp(c.email)}</div>
        <div class="ct-c wide"><div class="ct-a">${ic('<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>')}<span><small>${t('hq')}</small><b>${esc(a1)}</b>${a2 ? `<em>${esc(a2)}</em>` : ''}</span></div><a class="ct-map" href="${esc(c.map || '#/contact')}" target="_blank" rel="noopener">${en ? 'Open map' : 'افتح الخريطة'}</a></div>
        ${(c.hours || []).length ? `<div class="ct-c wide"><div class="ct-a">${ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>')}<span><small>${en ? 'Working hours' : 'مواعيد العمل'}</small><ul class="ct-h">${c.hours.map(x => { const [d, tm] = String(x).split(/:\s*/); return `<li><span>${esc(d)}</span><b>${esc(tm || '')}</b></li>`; }).join('')}</ul></span></div></div>` : ''}
      </div></div></div></section>`; }
  };
  let order = (d.sections && d.sections.length ? d.sections.slice() : DEFAULT.design.sections.slice());
  return `<section class="h7-hero" data-blk="hero">${h.video && vsrc ? `<video autoplay muted loop playsinline preload="auto" poster="${esc(src(h.poster))}"><source src="${esc(vsrc)}" type="video/mp4"></video>` : `<img class="poster" src="${esc(src(h.poster))}" alt="">`}<div class="shade"></div>
    <div class="wrap h7-hero-c">${d.heroLogo !== false ? `<div class="h7-logo" data-hold>${d.logo ? `<span class="hl-cube custom">${img(d.logo, '')}</span>` : `<span class="hl-cube"><img class="g" src="assets/img/cube-gray.png" alt=""><img class="r" src="assets/img/cube-red.png" alt=""></span>`}<span class="h7-lt"><b>${esc(v.brand.short)}</b><small>${t('company')}</small></span></div>` : ''}<div class="h7-eyb"><i></i>${esc(h.eyebrow)}</div><h1 class="h7-h1">${esc(h.title)} <em>${esc(h.highlight)}</em></h1><p class="h7-lead">${esc(h.lead)}</p>
    <div class="h7-btns"><a class="h7-red" href="#/request">${esc(h.cta1)} ${ARW}</a><a class="h7-ghost" href="#/projects">${esc(h.cta2)}</a></div>
    ${appStrip(v)}
    <div class="h7-stats">${v.stats.map(x => `<div><b class="h7-num">${x.pre ? `<em>${esc(x.pre)}</em>` : ''}<span data-count="${+x.n || 0}" data-from="${x.plain ? (+x.n || 0) - 12 : 0}">${x.plain ? (+x.n || 0) : 0}</span>${esc(x.suf || '')}</b><small>${esc(x.l)}</small></div>`).join('')}</div></div></section>
  ${order.map(k => S[k] ? S[k]().replace(/^\s*<section/, `<section data-blk="${k}"`) : '').join('')}`;
}
P[''] = () => {
  if ((C.design || {}).homeStyle !== 'classic') return homeV7();
  const v = V(), h = v.hero, d = C.design || {};
  const S = {
    offer: offerBlock,
    services: () => `<section class="sec"><div class="wrap">${head(t('ourServices'), t('svcTitle'), t('svcSub'))}<div class="svc-grid">${v.services.map(svcCard).join('')}</div></div></section>`,
    strip, gallery: galleryBlock, social: socialBlock,
    steps: () => `<section class="sec alt"><div class="grid-bg"></div><div class="wrap">${head(t('how'), t('howTitle', { n: v.about.steps.length }), '')}<div class="steps">${v.about.steps.map((s, i) => `<div class="step rv d${i}"><div class="n">${i + 1}</div><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p></div>`).join('')}</div></div></section>`,
    packages: () => v.packages.on ? `<section class="sec"><div class="wrap">${head(t('pkgEy'), esc(v.packages.title), v.packages.sub)}<div class="pk-grid">${pkCards()}</div></div></section>` : '',
    why: () => `<section class="sec alt"><div class="wrap">${head(t('whyEy'), t('whyTitle'), '')}<div class="why">${v.about.why.map((w, i) => `<div class="it glass rv d${i}"><span class="ic">0${i + 1}</span><div><h4>${esc(w.t)}</h4><p>${esc(w.d)}</p></div></div>`).join('')}</div>
      <div class="quote rv" style="margin-top:56px"><div class="avatar"><img src="assets/img/mark.png" alt=""></div><div><blockquote>${esc(v.about.quote)}</blockquote><div class="who"><b>${esc(v.about.ceo)}</b>${esc(v.about.ceoTitle)}</div></div></div></div></section>`,
    partners: () => `<section class="sec tight"><div class="wrap">${head(t('partners'), t('partnersTitle'), '')}</div><div class="marq"><div class="tr">${[...v.partners, ...v.partners].map(p => `<span class="glass">${esc(p)}</span>`).join('')}</div></div></section>`,
    faq: () => `<section class="sec tight"><div class="wrap">${head(t('faqEy'), t('faqTitle'), '', `<a class="btn btn-ghost sm" href="#/support">${t('faqAll')}</a>`)}<div class="faq">${v.faq.slice(0, 4).map(faqItem).join('')}</div></div></section>`,
    cta: ctaBox,
    stats: () => `<section class="stats-sec"><div class="wrap">${stats()}</div></section>`
  };
  const order = (d.sections && d.sections.length ? d.sections.slice() : DEFAULT.design.sections.slice());
  if (!order.includes('stats') && !(d.hidden || []).includes('stats')) { const gi = order.indexOf('gallery'); order.splice(gi >= 0 ? gi + 1 : 0, 0, 'stats'); }
  const vsrc = (h.videoMobile && matchMedia('(max-width:700px) and (orientation:portrait)').matches) ? h.videoMobile : h.videoSrc;
  return `<section class="hero" data-blk="hero">${h.video && vsrc ? `<video autoplay muted loop playsinline preload="auto" poster="${esc(src(h.poster))}"><source src="${esc(vsrc)}" type="video/mp4"></video>` : `<img class="poster" src="${esc(src(h.poster))}" alt="">`}
    <div class="hero-in"><div>
      ${d.heroLogo !== false ? `<div class="hero-logo">${d.logo ? `<span class="hl-cube custom">${img(d.logo, '')}</span>` : `<span class="hl-cube"><img class="g" src="assets/img/cube-gray.png" alt=""><img class="r" src="assets/img/cube-red.png" alt=""></span>`}<span class="hl-t"><b>${esc(v.brand.short)}</b><small>${t('company')}</small></span></div>` : ''}
      <span class="eyebrow">${esc(h.eyebrow)}</span><h1><span class="l"><span>${esc(h.title)}</span></span><span class="l"><span>${esc(h.highlight)}</span></span></h1><p class="lead">${esc(h.lead)}</p>
      <div class="ctas"><a class="btn btn-red" href="#/request">${esc(h.cta1)} ${I.arrow}</a><a class="btn btn-ghost" href="#/services">${esc(h.cta2)}</a></div>
</div>
      <div class="hero-card glass"><h4>${t('needToday')} <span class="live"><i></i> ${t('liveNow')}</span></h4><ul>${v.services.slice(0, 6).map(x => `<li><a href="#/service/${esc(x.id)}">${esc(x.title)} <span>${esc(x.no)}</span></a></li>`).join('')}</ul></div></div><span class="scroll-cue"></span></section>
  ${order.map(k => S[k] ? S[k]().replace(/^\s*<section/, `<section data-blk="${k}"`) : '').join('')}`;
};

P.services = () => { const v = V(); return `<section class="phead"><div class="grid-bg"></div><div class="wrap">${crumbs(t('services'))}<h1>${em(t('svcPageTitle'))}</h1><p class="lead">${t('svcPageLead')}</p></div></section>
  ${strip()}<section class="sec tight"><div class="wrap"><div class="svc-grid">${v.services.map(svcCard).join('')}</div></div></section>${ctaBox()}`; };

P.service = (id) => {
  const vv = V(), v = vv.services.find(x => x.id === id) || vv.services[0];
  return `<section class="phead"><div class="wrap"><div class="crumbs"><a href="#/">${t('home')}</a><span>/</span><a href="#/services">${t('services')}</a><span>/</span><span>${esc(v.title)}</span></div><h1>${esc(v.title)}</h1><p class="lead" style="max-width:760px">${esc(v.desc)}</p></div></section>
  <section class="sec tight" style="padding-top:20px"><div class="wrap svc-page"><div><div class="hero-img rv">${img(v.img, v.title)}</div>
    <h3 style="margin-top:34px;font-size:24px" class="rv">${t('included')}</h3><ul class="check sub-links">${v.items.map((x, i) => `<li class="glass rv d${i % 4}"><a href="${subHref(v.id, i)}">${esc(x)} <span>${ARW}</span></a></li>`).join('')}</ul>
    ${v.fit ? `<div class="fit rv"><b>${t('fitFor')}</b> ${esc(v.fit)}</div>` : ''}</div>
    <aside class="side-card glass rv"><span class="chip">${t('svcNo')} ${esc(v.no)}</span><h3>${esc(t('want', { s: v.title }))}</h3><p style="color:var(--mut)">${t('wantP')}</p>
      <a class="btn btn-red" href="#/request?s=${esc(v.id)}">${t('orderOnline')}</a><a class="btn btn-ghost" href="${wa(t('svcWa') + v.title)}" target="_blank" rel="noopener">${I.wa} ${t('askWa')}</a>
      <div class="svc-nav">${vv.services.map(x => `<a href="#/service/${esc(x.id)}" class="${x.id === v.id ? 'on' : ''}">${esc(x.title)}<span>${esc(x.no)}</span></a>`).join('')}</div></aside></div></section>${strip()}${ctaBox()}`;
};

/* ===== صفحة الخدمة الفرعية (#/service/<قسم>/<رقم البند>) ===== */
const SUBF = { name: '', phone: '', msg: '', img: '' };
P.sub = (sid, n) => {
  const vv = V(), en = LANG === 'en', sv = vv.services.find(x => x.id === sid) || vv.services[0]; if (!sv) return '';
  const items = sv.items || []; n = Math.max(0, Math.min(items.length - 1, n | 0)); const name = items[n] || sv.title;
  const ar = C.services.find(x => x.id === sv.id) || {}, arName = (ar.items || [])[n];
  const d = (sv.subs || []).find(x => x && (x.name === name || x.name === arName)) || {};
  const docs = (d.docs || []).filter(Boolean), steps = (d.steps || []).filter(Boolean), faq = (d.faq || []).filter(f => f && f.q && f.a);
  const defSteps = en ? ['Send your request with the title deed or the documents you have', 'Our engineer reviews it and calls you', 'We confirm the required documents, the cost and the timeline', 'We carry out the work and keep you updated', 'Handover and delivery of the final documents']
    : ['أرسل طلبك مع صورة الصك أو المستندات اللي عندك', 'المهندس المختص يراجع الطلب ويتواصل معك', 'نوضح لك المستندات المطلوبة والتكلفة والمدة', 'ننفّذ الخدمة ونبلغك أول بأول', 'التسليم واستلام المستندات النهائية'];
  const rel = items.map((x, i) => [x, i]).filter(([, i]) => i !== n);
  return `<section class="phead" data-blk="head"><div class="wrap"><div class="crumbs"><a href="#/">${t('home')}</a><span>/</span><a href="#/services">${t('services')}</a><span>/</span><a href="#/service/${esc(sv.id)}">${esc(sv.title)}</a><span>/</span><span>${esc(name)}</span></div><span class="chip">${esc(sv.title)}</span><h1 style="margin-top:12px">${esc(name)}</h1>
    <p class="lead" style="max-width:780px">${esc(d.intro || (en ? `“${name}” is one of our ${sv.title} services. Our team handles it end to end — from reviewing your documents to final delivery.` : `خدمة «${name}» ضمن ${sv.title}. فريقنا بيتولاها بالكامل من مراجعة مستنداتك لحد التسليم النهائي.`))}</p></div></section>
  <section class="sec tight" data-blk="body" style="padding-top:18px"><div class="wrap sub-g"><div class="sub-main">
    <div class="sub-cards"><div class="sub-c glass rv"><small>${en ? 'Department' : 'القسم'}</small><a href="#/service/${esc(sv.id)}"><b>${esc(sv.title)}</b></a></div><div class="sub-c glass rv d1"><small>${en ? 'Expected duration' : 'المدة المتوقعة'}</small><b>${esc(d.dur || (en ? 'Set after reviewing your request' : 'نحددها بعد مراجعة طلبك'))}</b></div></div>
    <div class="sub-blk glass rv"><h3>${en ? 'Required documents' : 'المستندات المطلوبة'}</h3>${docs.length ? `<ul class="check">${docs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="sub-ph">${en ? 'We confirm the exact documents you need after reviewing your title deed.' : 'نحدد لك المستندات المطلوبة بعد مراجعة الصك.'}</p>`}</div>
    <div class="sub-blk glass rv"><h3>${en ? 'How it works' : 'خطوات الخدمة'}</h3><ol class="sub-steps">${(steps.length ? steps : defSteps).map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
    ${faq.length ? `<div class="sub-blk rv"><h3>${en ? 'FAQ' : 'أسئلة شائعة'}</h3><div class="faq">${faq.map(f => `<details class="glass"><summary>${esc(f.q)}</summary><div class="ans">${nl(f.a)}</div></details>`).join('')}</div></div>` : ''}
    ${rel.length ? `<div class="sub-blk rv"><h3>${en ? 'Related services' : 'خدمات مرتبطة'}</h3><div class="sub-rel">${rel.map(([x, i]) => `<a href="${subHref(sv.id, i)}">${esc(x)} ${ARW}</a>`).join('')}</div></div>` : ''}
  </div>
  <aside class="sub-side"><form class="form-card glass sub-f" id="subF" novalidate><h3>${en ? 'Request this service' : 'اطلب الخدمة دي'}</h3><div class="sub-svc">${esc(name)}</div>
    <div class="fld"><label>${t('nameL')}</label><input id="sfName" maxlength="80" autocomplete="name" value="${esc(SUBF.name || store('sh.custName') || '')}"></div>
    <div class="fld"><label>${t('phoneL')}</label><input id="sfPhone" inputmode="tel" dir="ltr" maxlength="15" placeholder="05xxxxxxxx" autocomplete="tel" value="${esc(SUBF.phone || store('sh.custPhone') || '')}"></div>
    <div class="fld"><label>${en ? 'Details (optional)' : 'التفاصيل (اختياري)'}</label><textarea id="sfMsg" rows="3" maxlength="1500" placeholder="${en ? 'Location, area, anything that helps' : 'الموقع، المساحة، أي تفاصيل تساعدنا'}">${esc(SUBF.msg)}</textarea></div>
    <label class="drop sub-drop" id="sfDrop">${SUBF.img ? `<img src="${SUBF.img}" alt="">` : ''}<span>${SUBF.img ? t('changeImg') : (en ? '📎 Attach a photo of the title deed (optional)' : '📎 أرفق صورة الصك (اختياري)')}</span><input type="file" accept="image/*" id="sfFile" hidden></label>
    <p class="err" id="sfErr"></p><button class="btn btn-red" id="sfGo">${en ? 'Send request' : 'أرسل الطلب'}</button>
    <button type="button" class="btn btn-ghost" id="sfChat">💬 ${en ? 'Talk to the engineer' : 'كلّم المهندس'}</button></form></aside></div></section>${ctaBox().replace(/^\s*<section/, '<section data-blk="cta"')}`;
};
function wireSub() {
  const f = $('#subF'); if (!f) return; const en = LANG === 'en';
  const keep = () => { SUBF.name = $('#sfName').value; SUBF.phone = $('#sfPhone').value; SUBF.msg = $('#sfMsg').value; };
  $('#sfFile').onchange = async e => { const fl = e.target.files[0]; if (!fl) return; keep(); const F = await fb(); SUBF.img = await F.compressImage(fl, 1400, .72); const dz = $('#sfDrop'); dz.querySelector('span').textContent = t('changeImg'); let im = dz.querySelector('img'); if (!im) { im = document.createElement('img'); dz.prepend(im); } im.src = SUBF.img; };
  $('#sfChat').onclick = () => { keep(); const n = SUBF.name.trim(), ph = toEnDigits(SUBF.phone).replace(/\D/g, ''); if (n.length > 1 && !store('sh.custName')) storeSet('sh.custName', n); if (ph.length > 8 && !store('sh.custPhone')) storeSet('sh.custPhone', ph); openBot(); startEngineer(); };
  f.onsubmit = async e => {
    e.preventDefault(); keep(); const er = $('#sfErr'), b = $('#sfGo'), ph = toEnDigits(SUBF.phone).replace(/\D/g, '');
    if (SUBF.name.trim().length < 2) return er.textContent = t('writeName');
    if (ph.length < 9) return er.textContent = t('writePhone');
    er.textContent = ''; b.disabled = true; b.textContent = t('sending');
    const [, sid, n] = location.hash.split('?')[0].replace(/^#\/?/, '').split('/'); const sv = C.services.find(x => x.id === decodeURIComponent(sid)) || {}; const nm = (sv.items || [])[+n] || '';
    try {
      const code = await createTicket({ name: SUBF.name.trim(), phone: ph, dept: (sv.title || '') + (nm ? ' — ' + nm : ''), ptype: nm, city: '', msg: SUBF.msg.trim() || nm, img: SUBF.img });
      track('req'); SUBF.msg = ''; SUBF.img = '';
      f.innerHTML = `<div class="ticket-ok"><svg class="check-anim" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg><h3 style="margin:0">${t('gotIt')}</h3><p style="color:var(--mut)">${t('yourNo')}</p><div class="code">${esc(code)}</div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button type="button" class="btn btn-ghost sm" id="sfCp">${t('copyNo')}</button><a class="btn btn-ink sm" href="#/track?c=${esc(code)}">${t('trackIt')}</a></div></div>`;
      $('#sfCp').onclick = () => copy(code);
    } catch (z) { er.innerHTML = `${t('sendFail')} <a style="color:var(--red)" target="_blank" rel="noopener" href="${wa(`${sv.title} — ${nm}\n${SUBF.msg}\n${SUBF.name} ${ph}`)}">${t('sendFail2')}</a>`; b.disabled = false; b.textContent = en ? 'Send request' : 'أرسل الطلب'; }
  };
}

/* ===== آراء العملاء: بتتنشر بعد موافقة المدير ===== */
let REVS = null;
const stars = n => `<span class="stars" aria-label="${n}/5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('')}</span>`;
async function loadReviews() {
  const tr = $('#revTrack'); if (!tr) return; const en = LANG === 'en';
  if (!REVS) { try { const F = await fb(); const sn = await F.getDocs(F.query(F.collection(F.db, 'reviews'), F.where('status', '==', 'approved'), F.limit(30))); REVS = sn.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0)); } catch (e) { REVS = []; } }
  const el = $('#revTrack'); if (!el) return;
  if (!REVS.length) { el.innerHTML = `<div class="rev-first glass"><span>⭐</span><div><b>${en ? 'Worked with us? Be the first to review us' : 'اتعاملت معانا؟ كن أول واحد يكتب رأيه'}</b><small>${en ? 'Your review appears after management approval.' : 'رأيك بيظهر بعد موافقة الإدارة.'}</small></div><button class="btn btn-red sm" data-review>${en ? 'Write a review' : 'اكتب رأيك'}</button></div>`; $$('[data-review]', el).forEach(b => b.onclick = openReview); return; }
  el.innerHTML = `<div class="rev-row" id="revRow">${REVS.map(r => `<figure class="rev glass">${stars(r.stars || 5)}<blockquote>${esc(r.text)}</blockquote><figcaption><span class="rav">${esc((r.name || '?').trim().charAt(0))}</span><span><b>${esc(r.name)}${r.uid ? ` <em class="ver">✓ ${en ? 'Verified client' : 'عميل موثّق'}</em>` : ''}</b><small>${esc(r.svc || '')}</small></span></figcaption></figure>`).join('')}</div>`;
  const row = $('#revRow'); if (row && REVS.length > 1) { let hov = false; row.onmouseenter = () => hov = true; row.onmouseleave = () => hov = false; row.addEventListener('touchstart', () => { hov = true; setTimeout(() => hov = false, 8000); }, { passive: true });
    const it = setInterval(() => { if (!document.body.contains(row)) return clearInterval(it); if (hov || document.hidden) return; const w = row.firstElementChild.offsetWidth + 16, dir = LANG === 'en' ? 1 : -1, max = row.scrollWidth - row.clientWidth; if (Math.abs(row.scrollLeft) + w > max + 4) row.scrollTo({ left: 0, behavior: 'smooth' }); else row.scrollBy({ left: dir * w, behavior: 'smooth' }); }, 5000); }
}
function openReview() {
  const en = LANG === 'en', v = V(); let st = 5;
  try { const last = +localStorage.getItem('sh.revAt') || 0; if (Date.now() - last < 864e5) { toast(en ? 'You already sent a review today — thank you!' : 'بعت رأيك النهارده بالفعل — شكراً ليك!'); return; } } catch (e) { }
  $('#popBody').innerHTML = `<form class="rev-f" id="revF" novalidate><h3>${en ? 'Share your experience' : 'شاركنا رأيك'}</h3><p class="hint">${en ? 'Published after management review.' : 'بيتنشر بعد مراجعة الإدارة.'}</p>
    <div class="rev-st" id="revSt">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-s="${i}" class="on" aria-label="${i}">★</button>`).join('')}</div>
    <div class="fld"><label>${t('nameL')}</label><input id="rvName" maxlength="60" value="${esc(store('sh.custName') || '')}"></div>
    <div class="fld"><label>${en ? 'Service' : 'الخدمة'}</label><select id="rvSvc"><option value="">${en ? '— choose —' : '— اختار —'}</option>${v.services.map(x => `<option>${esc(x.title)}</option>`).join('')}<option>${en ? 'Other' : 'أخرى'}</option></select></div>
    <div class="fld"><label>${en ? 'Your review' : 'رأيك'}</label><textarea id="rvText" rows="4" maxlength="600" placeholder="${en ? 'How was working with us?' : 'إيه رأيك في التعامل معانا؟'}"></textarea></div>
    <div class="fld"><label>${en ? 'Mobile (optional — not shown)' : 'رقم الجوال (اختياري — مش بيظهر)'}</label><input id="rvPh" inputmode="tel" dir="ltr" maxlength="15" placeholder="05xxxxxxxx" value="${esc(store('sh.custPhone') || '')}"></div>
    <p class="err" id="rvErr"></p><button class="btn btn-red" id="rvGo">${en ? 'Send review' : 'أرسل رأيك'}</button></form>`;
  $('#popup').hidden = false;
  const paint = () => $$('#revSt button').forEach(b => b.classList.toggle('on', +b.dataset.s <= st)); $('#revSt').onclick = e => { const b = e.target.closest('button'); if (b) { st = +b.dataset.s; paint(); } };
  $('#revF').onsubmit = async e => {
    e.preventDefault(); const er = $('#rvErr'), name = $('#rvName').value.trim(), text = $('#rvText').value.trim(), b = $('#rvGo');
    if (name.length < 2) return er.textContent = t('writeName'); if (text.length < 5) return er.textContent = en ? 'Write a few words about your experience' : 'اكتب كلمتين عن تجربتك';
    b.disabled = true; b.textContent = t('sending');
    try { const F = await fb(); const u = F.auth.currentUser, cu = store('sh.cust');
      await F.addDoc(F.collection(F.db, 'reviews'), { name: name.slice(0, 60), stars: st, svc: $('#rvSvc').value.slice(0, 80), text: text.slice(0, 600), phone: toEnDigits($('#rvPh').value).replace(/\D/g, '').slice(0, 15), uid: u && cu && u.uid === cu ? u.uid : '', status: 'pending', at: F.serverTimestamp(), lang: LANG });
      try { localStorage.setItem('sh.revAt', String(Date.now())); } catch (x) { } track('review');
      $('#popBody').innerHTML = `<div class="ticket-ok"><svg class="check-anim" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg><h3 style="margin:0">${en ? 'Thank you!' : 'شكراً ليك!'}</h3><p style="color:var(--mut)">${en ? 'Your review was received and will appear after review.' : 'رأيك وصل وهيظهر بعد المراجعة.'}</p></div>`;
    } catch (x) { er.textContent = t('connErr'); b.disabled = false; b.textContent = en ? 'Send review' : 'أرسل رأيك'; }
  };
}
window.SH_review = openReview;
let prjChip = 0, prjTimer = null, prjStop = false;
function prjChips() {
  const v = V(), ar = C.cats || [], Ga = C.workGroups || [], G = v.workGroups || [], used = new Set(['تصميم 3D', 'خدمات مساحية']);
  const cat = n => { const i = ar.indexOf(n); used.add(n); return i < 0 ? null : { l: v.cats[i] || n, f: p => p.cat === n, k: 'c:' + n }; };
  const grp = k => { const i = Ga.findIndex(g => g.key === k); return i < 0 || (G[i] && G[i]._off) ? null : { l: (G[i] || {}).title || k, f: p => grps(p).includes(k), k: 'g:' + k }; };
  return [{ l: t('all'), f: () => true, k: 'all' }, cat('تجاري'), grp('الواجهات'), grp('المساحة'), grp('السلامة'), grp('المخططات'), grp('التصميم الداخلي'), ...ar.filter(n => !used.has(n)).map(cat)].filter(Boolean);
}
P.projects = (q) => { const v = V(), ch = prjChips(), g = new URLSearchParams(q || '').get('g'); prjStop = !!g; prjChip = g ? Math.max(0, ch.findIndex(c => c.k === 'g:' + g)) : 0;
  return `<section class="phead"><div class="wrap">${crumbs(t('projects'))}<h1>${em(t('prjTitle'))}</h1><p class="lead">${esc(t('prjLead', { y: v.brand.founded }))}</p></div></section>
  <div class="wrap">${stats()}</div>
  <section class="sec tight"><div class="wrap"><div class="filters ${prjStop ? '' : 'auto'}" id="filters">${ch.map((c, i) => `<button class="${i === prjChip ? 'on' : ''}" data-c="${i}">${esc(c.l)}</button>`).join('')}</div><div class="prj-grid" id="prjGrid">${prjCards()}</div>
  <div class="note-box glass rv" style="margin-top:34px"><div><h4>${t('whyNo')}</h4><p>${esc(v.confidential)}</p></div><a class="btn btn-ink" href="${wa(t('portfolioWa'))}" target="_blank" rel="noopener">${t('portfolio')}</a></div></div></section>
  ${galleryBlock()}${ctaBox()}`; };
const prjCards = () => { const v = V(), c = prjChips()[prjChip] || { f: () => true }; return v.projects.map((p, k) => [p, k]).filter(([p]) => c.f(p)).map(([p, k], i) => `<article class="prj glass ${p.img || (p.gallery || []).length ? 'has-img' : ''}" data-prj="${k}" style="animation-delay:${i * 40}ms">${(p.gallery || []).filter(g => g.img).length ? `<span class="prj-n">${I.play.replace('M8 5v14l11-7z', 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4')} ${(p.gallery || []).filter(g => g.img).length + (p.img ? 1 : 0)}</span>` : ''}<div class="ph">${p.img ? img(p.img, p.title) : `<img class="ph-ic" src="assets/img/mark.png" alt="">`}</div><div class="bd"><span class="chip" style="align-self:flex-start">${esc(p.tag || p.cat)}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><div class="meta"><span>${t('loc')} <b>${esc(p.loc)}</b></span><span>·</span><span>${t('scope')} <b>${esc(p.scope)}</b></span></div></div></article>`).join(''); };
function setChip(i, user) {
  const fl = $('#filters'); if (!fl) return; const bs = $$('button', fl); if (!bs.length) return; prjChip = (i + bs.length) % bs.length;
  bs.forEach((x, j) => x.classList.toggle('on', j === prjChip)); const g = $('#prjGrid'); g.classList.add('sw'); setTimeout(() => { g.innerHTML = prjCards(); g.classList.remove('sw'); $$('[data-prj]', g).forEach(bindPrj); }, user ? 0 : 200);
}
function bindPrj(a) { a.onclick = () => { const p = V().projects[+a.dataset.prj]; if (!p) return; const L = [p.img, ...(p.gallery || []).map(g => g.img)].filter(Boolean).map((x, i) => ({ src: src(x), cap: i ? ((p.gallery || []).filter(g => g.img)[i - (p.img ? 1 : 0)] || {}).cap || p.title : p.title })); if (L.length) lbOpen(L, 0); }; }
function prjAuto() {
  clearInterval(prjTimer); const fl = $('#filters'); if (!fl || prjStop) return; let vis = true;
  try { const o = new IntersectionObserver(e => { vis = e[0].isIntersecting; fl.classList.toggle('paused', !vis); }); o.observe(fl); } catch (e) { }
  prjTimer = setInterval(() => { if (!document.body.contains(fl)) return clearInterval(prjTimer); if (prjStop || !vis || document.hidden) return; setChip(prjChip + 1); }, 4000);
}

P.packages = P.packages = () => { const v = V(); return `<section class="phead"><div class="wrap">${crumbs(t('packages'))}<h1>${esc(v.packages.title)}</h1><p class="lead">${esc(v.packages.sub)}</p></div></section>
  <section class="sec tight"><div class="wrap"><div class="pk-grid">${pkCards()}</div></div></section>${ctaBox()}`; };

P.about = () => { const v = V(); return `<section class="phead"><div class="wrap">${crumbs(t('about'))}<h1>${esc(v.about.title)}</h1><p class="lead" style="max-width:780px">${esc(v.about.lead)}</p></div></section>
  <section class="sec tight"><div class="wrap about-grid"><div class="rv">${v.about.story.map(p => `<p style="margin-bottom:14px;font-size:17px">${esc(p)}</p>`).join('')}</div><div class="hero-img rv">${img(C.gallery[0] ? C.gallery[0].img : 'assets/img/story.webp', '')}</div></div>
  <div class="wrap" style="margin-top:40px">${stats()}</div></section>
  <section class="sec alt"><div class="wrap">${head(t('licEy'), t('licTitle'), t('licSub'))}<div class="lic-grid">${v.about.licenses.map((l, i) => `<div class="lic glass rv d${i % 4}"><div class="top"><h4>${esc(l.name)}</h4><span class="chip">${esc(l.badge)}</span></div><p>${esc(l.desc)}</p><dl>${l.fields.map(f => `<dt>${esc(f[0])}</dt><dd>${esc(f[1])} <button class="copy" data-copy="${esc(f[1])}">${t('copy')}</button></dd>`).join('')}</dl></div>`).join('')}</div></div></section>
  <section class="sec"><div class="wrap">${head(t('branchesEy'), t('branchesTitle'), '')}<div class="branches">${v.branches.map((b, i) => `<div class="branch glass rv d${i}"><h4>${I.pin} ${esc(b.name)}</h4><p>${esc(b.addr)}</p>${b.auth ? `<small>${esc(b.auth)}</small>` : ''}${b.map ? `<a class="btn btn-ghost sm" style="align-self:flex-start;margin-top:8px" href="${esc(b.map)}" target="_blank" rel="noopener">${t('onMap')}</a>` : ''}</div>`).join('')}</div></div></section>
  <section class="sec alt"><div class="wrap">${head(t('isicEy'), t('isicTitle'), t('isicSub'))}<table class="isic glass rv">${v.about.isic.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table></div></section>
  <section class="sec"><div class="wrap"><div class="quote rv"><div class="avatar"><img src="assets/img/mark.png" alt=""></div><div><blockquote>${esc(v.about.quote2 || v.about.quote)}</blockquote><div class="who"><b>${esc(v.about.ceo)}</b>${esc(v.about.ceoTitle)}</div></div></div></div></section>${ctaBox()}`; };

P.contact = () => { const v = V(), c = v.contact; return `<section class="phead"><div class="wrap">${crumbs(t('contact'))}<h1>${em(t('ctTitle'))}</h1><p class="lead">${t('ctLead')}</p></div></section>
  <section class="sec tight"><div class="wrap contact-grid"><div class="c-cards">
    <a class="c-card glass rv" href="${wa()}" target="_blank" rel="noopener"><span class="ic">${I.wa}</span><div><b>${t('waFast')}</b><span>${t('waFastP')}</span></div></a>
    <a class="c-card glass rv d1" href="${tel()}"><span class="ic">${I.phone}</span><div><b dir="ltr" class="num">${esc(c.phone)}</b><span>${t('directCall')}${c.phone2 ? ' · ' + esc(c.phone2) : ''}</span></div></a>
    <a class="c-card glass rv d2" href="mailto:${esc(c.email)}"><span class="ic">${I.mail}</span><div><b>${esc(c.email)}</b><span>${t('mailP')}</span></div></a>
    <a class="c-card glass rv d3" href="${esc(c.map)}" target="_blank" rel="noopener"><span class="ic">${I.pin}</span><div><b>${t('hq')}</b><span>${esc(c.address)}</span></div></a>
    <div class="c-card glass rv"><span class="ic">${I.clock}</span><div><b>${t('hours')}</b><span>${c.hours.map(esc).join('<br>')}</span></div></div></div>
    <div><h3 class="rv" style="font-size:24px;margin-bottom:14px">${t('prepTitle')}</h3><ol class="prep rv">${v.prepare.map(p => `<li class="glass"><div><b>${esc(p.t)}</b><br><span style="color:var(--mut)">${esc(p.d)}</span></div></li>`).join('')}</ol>
    <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn btn-red" href="${wa()}" target="_blank" rel="noopener">${I.wa} ${t('sendWa')}</a><a class="btn btn-ghost" href="#/request">${t('reqOnline')}</a></div>
    <div class="map rv" style="margin-top:24px"><iframe loading="lazy" title="${t('mapT')}" src="https://maps.google.com/maps?q=${encodeURIComponent(C.contact.address)}&z=14&output=embed"></iframe></div></div></div></section>
  <section class="sec alt"><div class="wrap">${head(t('branchesEy'), t('nearest'), '')}<div class="branches">${v.branches.map(b => `<div class="branch glass rv"><h4>${I.pin} ${esc(b.name)}</h4><p>${esc(b.addr)}</p>${b.auth ? `<small>${esc(b.auth)}</small>` : ''}</div>`).join('')}</div></div></section>`; };

P.support = () => { const v = V(); return `<section class="sec tight"><div class="wrap"><div class="help-hero rv"><div class="grid-bg" style="opacity:.6"></div><span class="eyebrow" style="color:#fff">${t('helpEy')}</span><h1 style="margin-top:10px">${t('helpTitle')}</h1><p>${t('helpP')}</p>
    <div class="search">${I.search}<input id="faqQ" placeholder="${t('helpQ')}" autocomplete="off"></div></div>
    <div class="help-cards"><a class="help-card glass rv" href="#/request"><span class="ic">${I.ticket}</span><h4>${t('openTicket')}</h4><p>${t('openTicketP')}</p></a>
    <a class="help-card glass rv d1" href="#/track"><span class="ic">${I.track}</span><h4>${t('track')}</h4><p>${t('trackP')}</p></a>
    <a class="help-card glass rv d2" href="${wa()}" target="_blank" rel="noopener"><span class="ic">${I.chat}</span><h4>${t('talkUs')}</h4><p>${t('talkUsP')} <span dir="ltr">${esc(v.contact.phone)}</span></p></a></div></div></section>
  <section class="sec tight"><div class="wrap"><div class="filters" id="faqCats">${[t('all'), ...new Set(v.faq.map(f => f.cat).filter(Boolean))].map((c, i) => `<button class="${i ? '' : 'on'}" data-c="${i ? esc(c) : ''}">${esc(c)}</button>`).join('')}</div><div class="faq" id="faqList">${v.faq.map(faqItem).join('')}</div><p id="faqNone" hidden style="color:var(--mut);text-align:center;padding:30px">${t('noAns')} <a href="#/request" style="color:var(--red);font-weight:700">${t('noAns2')}</a> ${t('noAns3')}</p></div></section>`; };

/* social media page */
P.media = (which) => {
  const v = V(), s = v.socials, list = SOC.filter(x => s[x[0]]); const cur = list.find(x => x[0] === which) || list[0];
  if (!cur) return `<section class="phead"><div class="wrap">${crumbs(t('media'))}<h1>${esc(v.media.title)}</h1></div></section>`;
  return `<section class="phead"><div class="wrap">${crumbs(t('media'))}<h1>${esc(v.media.title)}</h1><p class="lead">${esc(v.media.sub)}</p></div></section>
  <section class="sec tight" style="padding-top:10px"><div class="wrap"><div class="soc-tabs">${list.map(x => `<a href="#/media/${x[0]}" class="soc-tab s-${x[0]} ${x === cur ? 'on' : ''}"><span class="si">${I[x[1]]}</span>${socName(x)}</a>`).join('')}</div>
  <div class="feed" id="feed" data-p="${cur[0]}"><p class="empty">${t('loading')}</p></div>
  <div style="text-align:center;margin-top:26px"><a class="btn btn-ink" href="${esc(s[cur[0]])}" target="_blank" rel="noopener">${I[cur[1]]} ${esc(t('openOn', { p: socName(cur) }))}</a></div></div></section>`;
};
const ytId = u => { const m = String(u).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : ''; };
const loadScript = (id, url) => { const old = document.getElementById(id); if (old) old.remove(); const s = document.createElement('script'); s.id = id; s.async = true; s.src = url; document.body.appendChild(s); };
async function paintFeed() {
  const el = $('#feed'); if (!el) return; const p = el.dataset.p, v = V(), m = v.media || {}, links = (m[p] || []).filter(Boolean);
  const empty = `<p class="empty">${t('noVideos')}</p>`;
  if (p === 'youtube') {
    let ids = links.map(ytId).filter(Boolean).map(id => ({ id, title: '' }));
    if (m.youtubeKey && v.socials.youtube) {
      try {
        const handle = decodeURIComponent(v.socials.youtube.split('/@')[1] || '').split(/[/?]/)[0];
        const ch = await (await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=@${encodeURIComponent(handle)}&key=${m.youtubeKey}`)).json();
        const up = ch.items && ch.items[0].contentDetails.relatedPlaylists.uploads;
        if (up) { const pl = await (await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=${up}&key=${m.youtubeKey}`)).json(); ids = (pl.items || []).map(i => ({ id: i.snippet.resourceId.videoId, title: i.snippet.title })).concat(ids); }
      } catch (e) { }
    }
    el.innerHTML = ids.length ? `<div class="yt-grid">${ids.map(x => `<button class="yt glass" data-yt="${x.id}"><img src="https://i.ytimg.com/vi/${x.id}/hqdefault.jpg" alt="" loading="lazy"><span class="pl">${I.play}</span>${x.title ? `<b>${esc(x.title)}</b>` : ''}</button>`).join('')}</div>` : empty;
    $$('[data-yt]', el).forEach(b => b.onclick = () => { b.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; b.classList.add('on'); });
  } else if (p === 'tiktok') {
    const user = (v.socials.tiktok.split('@')[1] || '').split(/[/?]/)[0];
    el.innerHTML = `<div class="emb-grid">${user ? `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@${esc(user)}" data-unique-id="${esc(user)}" data-embed-type="creator" style="max-width:780px;min-width:288px"><section><a target="_blank" href="https://www.tiktok.com/@${esc(user)}">@${esc(user)}</a></section></blockquote>` : ''}${links.map(u => { const id = (u.match(/video\/(\d+)/) || [])[1]; return id ? `<blockquote class="tiktok-embed" cite="${esc(u)}" data-video-id="${id}" style="max-width:605px;min-width:288px"><section></section></blockquote>` : ''; }).join('')}</div>`;
    loadScript('tk-embed', 'https://www.tiktok.com/embed.js');
  } else if (p === 'instagram') {
    el.innerHTML = links.length ? `<div class="emb-grid">${links.map(u => `<blockquote class="instagram-media" data-instgrm-permalink="${esc(u)}" data-instgrm-version="14" style="max-width:420px;min-width:280px;width:100%"></blockquote>`).join('')}</div>` : empty;
    if (links.length) loadScript('ig-embed', 'https://www.instagram.com/embed.js');
  } else if (p === 'x') {
    el.innerHTML = links.length ? `<div class="emb-grid">${links.map(u => `<blockquote class="twitter-tweet" data-dnt="true"><a href="${esc(u.replace('x.com', 'twitter.com'))}"></a></blockquote>`).join('')}</div>` : empty;
    if (links.length) loadScript('x-embed', 'https://platform.twitter.com/widgets.js');
  } else if (p === 'snapchat') {
    el.innerHTML = links.length ? `<div class="emb-grid">${links.map(u => `<blockquote class="snapchat-embed" data-snapchat-embed-width="416" data-snapchat-embed-height="692" data-snapchat-embed-url="${esc(u.replace(/\/?(\?.*)?$/, '/embed'))}" style="background:#C4C4C4;border-radius:40px;width:416px;max-width:100%;height:692px"></blockquote>`).join('')}</div>` : empty;
    if (links.length) loadScript('sc-embed', 'https://www.snapchat.com/embed.js');
  }
}

/* حساب العميل + تابع مشروعك */
P.account = q => ACC.pageAccount(q); P.my = () => ACC.pageMy();
/* request wizard */
let wiz = { step: 0, s: '', type: '', city: '', name: '', phone: '', msg: '', img: '' };
P.request = (q) => {
  const sp = new URLSearchParams(q || ''); if (sp.get('deed')) { if (!wiz.s) wiz.s = t('general'); wiz.step = Math.max(wiz.step, 2); } if (sp.get('s')) { const v = V().services.find(x => x.id === sp.get('s')); if (v) { wiz.s = v.title; wiz.step = Math.max(wiz.step, 1); } }
  return `<section class="phead"><div class="wrap">${crumbs(t('request'))}<h1>${em(t('reqTitle'))}</h1><p class="lead">${t('reqLead')}</p></div></section>
  <section class="sec tight" style="padding-top:10px"><div class="wrap" style="max-width:760px"><div class="form-card glass wiz" id="wiz"></div></div></section>`;
};
function paintWiz() {
  const w = $('#wiz'); if (!w) return;
  const st = wiz.step, bar = `<div class="wiz-steps">${[0, 1, 2, 3].map(i => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>`;
  const depts = [...V().services.map(v => v.title), t('general')];
  let h = '';
  if (st === 0) h = `<h3>${t('q1')}</h3><div class="opts">${depts.map(d => `<button class="opt ${wiz.s === d ? 'on' : ''}" data-v="${esc(d)}" data-k="s">${esc(d)}</button>`).join('')}</div>`;
  if (st === 1) h = `<h3>${t('q2')}</h3><div class="opts">${t('types').map(d => `<button class="opt ${wiz.type === d ? 'on' : ''}" data-v="${esc(d)}" data-k="type">${esc(d)}</button>`).join('')}</div><div class="fld" style="margin-top:16px"><label>${t('cityL')}</label><input id="wCity" value="${esc(wiz.city)}" placeholder="${t('cityP')}"></div>`;
  if (st === 2) h = `<h3>${t('q3')}</h3><div class="form"><div class="fld"><label>${t('msgL')}</label><textarea id="wMsg" rows="4" maxlength="1500" placeholder="${t('msgP')}">${esc(wiz.msg)}</textarea></div>
    <div class="drop" id="wDrop">${wiz.img ? `<img src="${wiz.img}" alt="">${t('changeImg')}` : t('attach')}<input type="file" accept="image/*" id="wFile"></div></div>`;
  if (st === 3) h = `<h3>${t('q4')}</h3><div class="form"><div class="row"><div class="fld"><label>${t('nameL')}</label><input id="wName" value="${esc(wiz.name)}" maxlength="80" autocomplete="name"></div><div class="fld"><label>${t('phoneL')}</label><input id="wPhone" value="${esc(wiz.phone)}" inputmode="tel" dir="ltr" maxlength="15" placeholder="05xxxxxxxx" autocomplete="tel"><span class="hint">${t('phoneH')}</span></div></div>
    <div class="fld" style="background:var(--paper2);border-radius:14px;padding:14px;font-size:14px"><b>${t('summary')}</b> ${esc(wiz.s)} · ${esc(wiz.type || '—')} · ${esc(wiz.city || '—')}</div></div><p class="err" id="wErr"></p>`;
  if (st === 4) h = `<div class="ticket-ok"><svg class="check-anim" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38"/><path d="M26 43l11 11 21-23"/></svg><h3 style="margin:0">${t('gotIt')}</h3><p style="color:var(--mut)">${t('yourNo')}</p><div class="code">${esc(wiz.code)}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px"><button class="btn btn-ghost sm" id="cpCode">${t('copyNo')}</button><a class="btn btn-red sm" href="${wa(`${t('aboutReq')}${wiz.code}\n${wiz.s}\n${wiz.type} — ${wiz.city}\n${wiz.msg}`)}" target="_blank" rel="noopener">${I.wa} ${t('sendWaToo')}</a><a class="btn btn-ink sm" href="#/track?c=${esc(wiz.code)}">${t('trackIt')}</a></div></div>`;
  w.innerHTML = (st < 4 ? bar : '') + h + (st < 4 ? `<div class="wiz-acts">${st ? `<button class="btn btn-ghost sm" id="wBack">${t('back')}</button>` : '<span></span>'}<button class="btn btn-red" id="wNext">${st === 3 ? t('send') : t('nextB')}</button></div>` : '');
  $$('.opt', w).forEach(b => b.onclick = () => { wiz[b.dataset.k] = b.dataset.v; if (st === 0) wiz.step = 1; paintWiz(); });
  const f = $('#wFile'); if (f) f.onchange = async () => { if (!f.files[0]) return; const F = await fb(); wiz.img = await F.compressImage(f.files[0], 1400, .72); paintWiz(); };
  const back = $('#wBack'); if (back) back.onclick = () => { save(); wiz.step--; paintWiz(); };
  const nx = $('#wNext'); if (nx) nx.onclick = async () => {
    save();
    if (st === 0 && !wiz.s) return toast(t('pickSvc'));
    if (st === 1 && !wiz.type) return toast(t('pickType'));
    if (st === 2 && wiz.msg.trim().length < 3 && !wiz.img) return toast(t('writeDet'));
    if (st === 3) {
      const ph = toEnDigits(wiz.phone).replace(/\D/g, '');
      if (wiz.name.trim().length < 2) return $('#wErr').textContent = t('writeName');
      if (ph.length < 9) return $('#wErr').textContent = t('writePhone');
      nx.disabled = true; nx.textContent = t('sending');
      try { wiz.code = await createTicket({ name: wiz.name.trim(), phone: ph, dept: wiz.s, ptype: wiz.type, city: wiz.city, msg: wiz.msg.trim(), img: wiz.img }); wiz.step = 4; paintWiz(); }
      catch (e) { $('#wErr').innerHTML = `${t('sendFail')} <a style="color:var(--red)" target="_blank" href="${wa(`${wiz.s}\n${wiz.type} — ${wiz.city}\n${wiz.msg}\n${wiz.name} ${wiz.phone}`)}">${t('sendFail2')}</a>`; nx.disabled = false; nx.textContent = t('send'); }
      return;
    }
    wiz.step++; paintWiz(); $('#wiz').scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const cp = $('#cpCode'); if (cp) cp.onclick = () => copy(wiz.code);
  function save() { const g = id => $('#' + id); if (g('wCity')) wiz.city = g('wCity').value; if (g('wMsg')) wiz.msg = g('wMsg').value; if (g('wName')) wiz.name = g('wName').value; if (g('wPhone')) wiz.phone = g('wPhone').value; }
}
const toEnDigits = s => String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
async function createTicket(x) {
  const F = await fb();
  const code = 'SH-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => ALPH[b % ALPH.length]).join('');
  await F.setDoc(F.doc(F.db, 'tickets', code), { code, name: x.name, phone: x.phone, dept: x.dept, ptype: x.ptype || '', city: x.city || '', msg: x.msg || '', img: x.img || '', status: 'new', msgs: [], at: F.serverTimestamp(), src: 'web', lang: LANG });
  try { const l = JSON.parse(localStorage.getItem('sh.tickets') || '[]'); l.unshift({ code, phone: x.phone }); localStorage.setItem('sh.tickets', JSON.stringify(l.slice(0, 10))); } catch (e) { }
  return code;
}
P.track = (q) => {
  const sp = new URLSearchParams(q || ''); let mine = []; try { mine = JSON.parse(localStorage.getItem('sh.tickets') || '[]'); } catch (e) { }
  return `<section class="phead"><div class="wrap">${crumbs(t('track'))}<h1>${em(t('trTitle'))}</h1><p class="lead">${t('trLead')}</p></div></section>
  <section class="sec tight" style="padding-top:10px"><div class="wrap" style="max-width:760px"><div class="form-card glass"><form class="form" id="trForm"><div class="row"><div class="fld"><label>${t('trNo')}</label><input id="trCode" dir="ltr" placeholder="SH-XXXXXX" value="${esc(sp.get('c') || (mine[0] && mine[0].code) || '')}" autocomplete="off"></div><div class="fld"><label>${t('phoneL')}</label><input id="trPhone" dir="ltr" inputmode="tel" placeholder="05xxxxxxxx" value="${esc((mine.find(m => m.code === sp.get('c')) || mine[0] || {}).phone || '')}"></div></div><button class="btn btn-red">${t('showStatus')}</button><p class="err" id="trErr"></p></form><div id="trOut"></div></div></div></section>`;
};
async function doTrack(e) {
  e && e.preventDefault();
  const code = $('#trCode').value.trim().toUpperCase().replace(/\s/g, ''), ph = toEnDigits($('#trPhone').value).replace(/\D/g, '');
  const er = $('#trErr'); er.textContent = '';
  if (!code) return er.textContent = t('writeNo');
  $('#trOut').innerHTML = `<p style="color:var(--mut);margin-top:16px">${t('searching')}</p>`;
  try {
    const F = await fb(); const d = await F.getDoc(F.doc(F.db, 'tickets', code.startsWith('SH-') ? code : 'SH-' + code));
    if (!d.exists() || (ph && d.data().phone.slice(-4) !== ph.slice(-4))) { $('#trOut').innerHTML = ''; return er.textContent = t('notFound'); }
    const x = d.data(), order = ['new', 'open', 'wait', 'done'], k = order.indexOf(x.status), ST = t('st');
    $('#trOut').innerHTML = `<div class="tl"><div class="st">${order.map((s, i) => `<span class="pill ${i <= k ? 'on' : ''}">${ST[s]}</span>`).join('')}</div>
      <div class="msg"><b>${esc(x.dept)}</b><br>${nl(x.msg)}<small>${x.at && x.at.toDate ? x.at.toDate().toLocaleString(LANG === 'en' ? 'en-GB' : 'ar-SA') : ''}</small></div>
      ${(x.msgs || []).map(m => `<div class="msg ${m.staff ? 'staff' : ''}"><b>${m.staff ? t('team') : t('you')}</b><br>${nl(m.text)}<small>${m.at ? new Date(m.at).toLocaleString(LANG === 'en' ? 'en-GB' : 'ar-SA') : ''}</small></div>`).join('')}
      ${x.status !== 'done' ? `<a class="btn btn-ghost sm" style="justify-self:start" href="${wa(t('aboutReq') + x.code)}" target="_blank" rel="noopener">${I.wa} ${t('followWa')}</a>` : ''}</div>`;
  } catch (z) { $('#trOut').innerHTML = ''; er.textContent = t('connErr'); }
}

/* ---------- router ---------- */
let curPath = null;
function render(soft) {
  const h = location.hash.replace(/^#\/?/, ''); const [path, q] = h.split('?'); const [r, arg, arg2] = path.split('/');
  const fn = P[r] ? P[r] : P[''];
  if (soft && curPath === h && r === 'request') { paintWiz(); return; }
  curPath = h;
  const app = $('#app'); app.innerHTML = r === 'service' && arg2 != null ? P.sub(decodeURIComponent(arg || ''), +arg2) : fn(r === 'service' || r === 'media' ? arg : q); app.classList.remove('page-enter'); void app.offsetWidth; app.classList.add('page-enter');
  const cur = r === 'service' ? 'services' : (P[r] ? r : '');
  $$('#nav a[data-r], #moreList a[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === cur));
  $('#hdr').classList.toggle('on-hero', !P[r] || r === '');
  if (!soft) window.scrollTo({ top: 0, behavior: 'instant' });
  toggleMore(false);
  const desc = document.querySelector('meta[name=description]'); if (desc) desc.content = V().seo.desc;
  applyDesign(); paintAcc(); wire(r); pageView();
}
function wire(r) {
  wireX();
  $$('[data-inst]').forEach(b => b.onclick = () => { track('app:' + b.dataset.inst); doInstall(b.dataset.inst); });
  if ($('#subF')) wireSub();
  initHold(); applyBlocks($('#subF') ? 'sub' : r); reveal(); counters(); countdown(); initStrip();
  $$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
  $$('[data-lang]').forEach(b => b.onclick = switchLang);
  $$('[data-lb]').forEach(f => f.onclick = () => { if (f.closest('.strip') && f.closest('.strip')._dragged) return; lbOpen([{ src: f.querySelector('img').src, cap: f.dataset.cap }], 0); });
  const gal = $('#gal'); if (gal) $$('[data-g]').forEach(b => b.onclick = () => { gal._pause && gal._pause(2500); gal.scrollBy({ left: (LANG === 'en' ? 1 : -1) * (+b.dataset.g) * 260, behavior: 'smooth' }); });
  $$('[data-prj]').forEach(bindPrj);
  clearInterval(prjTimer); const fl = $('#filters'); if (fl) { fl.onclick = e => { const b = e.target.closest('button'); if (!b) return; prjStop = true; fl.classList.remove('auto'); clearInterval(prjTimer); setChip(+b.dataset.c, 1); }; prjAuto(); }
  if ($('#revTrack')) loadReviews();
  $$('[data-review]').forEach(b => b.onclick = openReview);
  if (r === 'support') { const q = $('#faqQ'), cats = $('#faqCats'); let cat = ''; const F = V().faq; const run = () => { const v = q.value.trim().toLowerCase(); let n = 0; $$('#faqList details').forEach((d, i) => { const f = F[i]; const ok = (!cat || f.cat === cat) && (!v || (f.q + f.a).toLowerCase().includes(v)); d.hidden = !ok; d.classList.add('in'); if (ok) n++; if (v && ok) d.open = f.a.toLowerCase().includes(v); }); $('#faqNone').hidden = n > 0; }; q.oninput = run; cats.onclick = e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; $$('button', cats).forEach(x => x.classList.toggle('on', x === b)); run(); }; }
  if (r === 'request') paintWiz();
  if (r === 'track') { $('#trForm').onsubmit = doTrack; if ($('#trCode').value && new URLSearchParams(location.hash.split('?')[1] || '').get('c')) doTrack(); }
  if (r === 'media') paintFeed();
  if (r === 'account') ACC.wireAccount(); if (r === 'my') ACC.wireMy();
  const v = $('.hero video'); if (v) { v.play().catch(() => { }); }
}
let io = null;
function reveal() {
  if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv:not(.in)').forEach(el => io.observe(el));
}
function counters() {
  const ob = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; ob.unobserve(e.target); const el = e.target, n = +el.dataset.count, from = +el.dataset.from || 0; const t0 = performance.now(); const step = x => { const p = Math.min(1, (x - t0) / 1800); const val = Math.round(from + (n - from) * (1 - Math.pow(1 - p, 3))); el.textContent = from ? String(val) : val.toLocaleString('en-US'); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }), { threshold: .4 });
  $$('[data-count]').forEach(e => ob.observe(e));
}
let cdTimer = null;
function countdown() {
  clearInterval(cdTimer); const el = $('.cd[data-end]'); if (!el) return; const end = +el.dataset.end;
  const tick = () => { let s = Math.max(0, Math.floor((end - Date.now()) / 1000)); const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 }; $$('b[data-k]', el).forEach(b => b.textContent = String(v[b.dataset.k]).padStart(2, '0')); if (!s) clearInterval(cdTimer); };
  tick(); cdTimer = setInterval(tick, 1000);
}
/* شريط الخدمات: يتحرك لوحده، ويتسحب بالصباع أو الماوس، ويرجع يتحرك بعد ما تسيبه */
let stripRaf = 0;
function initStrip() {
  cancelAnimationFrame(stripRaf);
  $$('.strip').forEach((el, idx) => {
    const tr = $('.strip-tr', el); const setW = () => tr.scrollWidth / 3;
    let w = setW(); el.scrollLeft = w; let pause = 0, held = false, moved = 0, sx = 0, sl = 0;
    const left = el.dataset.dir === 'left', base = left ? .32 : .45;
    // right = المحتوى يتحرك يمين (scrollLeft يقل) — left = يتحرك شمال (scrollLeft يزيد)
    const speed = () => (matchMedia('(max-width:700px)').matches ? base : base * 1.35) * (left ? 1 : -1);
    el._pause = ms => { pause = Date.now() + ms; };
    let pos = el.scrollLeft;
    // pos عدد عشري: المتصفح بيقرّب scrollLeft لأقرب بكسل، فالحركة البطيئة كانت بتقف
    const loop = () => { if (!document.body.contains(el)) return; w = setW();
      if (Math.abs(el.scrollLeft - pos) > 1.5) pos = el.scrollLeft; // المستخدم سحب
      if (!held && Date.now() > pause) pos += speed();
      if (pos >= w * 2) pos -= w; else if (pos <= 1) pos += w;
      if (Math.round(pos) !== el.scrollLeft) el.scrollLeft = pos; requestAnimationFrame(loop); };
    if (idx === 0) stripRaf = requestAnimationFrame(loop); else requestAnimationFrame(loop);
    const hold = () => { held = true; }; const release = () => { held = false; pause = Date.now() + 1400; };
    el.addEventListener('touchstart', hold, { passive: true }); el.addEventListener('touchend', release); el.addEventListener('touchcancel', release);
    el.addEventListener('wheel', () => { pause = Date.now() + 1400; }, { passive: true });
    el.addEventListener('mouseenter', () => { pause = Date.now() + 600000; }); el.addEventListener('mouseleave', () => { pause = Date.now() + 400; });
    el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; held = true; moved = 0; sx = e.clientX; sl = el.scrollLeft; el.classList.add('drag'); });
    addEventListener('pointermove', e => { if (!held || e.pointerType !== 'mouse') return; moved = Math.abs(e.clientX - sx); el.scrollLeft = sl - (e.clientX - sx); });
    addEventListener('pointerup', e => { if (e.pointerType !== 'mouse' || !el.classList.contains('drag')) return; el.classList.remove('drag'); release(); });
    el.addEventListener('touchmove', () => { el._dragged = true; }, { passive: true }); el.addEventListener('touchstart', () => { el._dragged = false; }, { passive: true });
    el.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; el._dragged = true; setTimeout(() => { el._dragged = false; }, 50); } }, true);
  });
}
function dragScroll(el) { let d = false, x = 0, s = 0; el.onpointerdown = e => { if (e.pointerType !== 'mouse') return; d = true; x = e.clientX; s = el.scrollLeft; el.style.scrollSnapType = 'none'; }; addEventListener('pointerup', () => { d = false; el.style.scrollSnapType = ''; }); el.onpointermove = e => { if (d) el.scrollLeft = s - (e.clientX - x); }; }
/* لايت بوكس بأكتر من صورة */
let lbL = [], lbI = 0;
function lbOpen(L, i) { lbL = L; lbI = i; lbShow(); $('#lb').hidden = false; $('#lb').classList.toggle('multi', L.length > 1); }
function lbShow() { const x = lbL[lbI]; if (!x) return; $('#lbImg').src = x.src; $('#lbCap').textContent = (x.cap || '') + (lbL.length > 1 ? `  (${lbI + 1}/${lbL.length})` : ''); }
function lbStep(d) { if (lbL.length < 2) return; lbI = (lbI + d + lbL.length) % lbL.length; lbShow(); }
/* بلوكات الصفحات: ترتيب وإخفاء وحجم خط وأيقونات من لوحة التحكم */
const POS = { sub: ['head', 'body', 'cta'], services: ['head', 'strip', 'grid', 'cta'], service: ['head', 'body', 'strip', 'cta'], projects: ['head', 'stats', 'list', 'gallery', 'cta'], packages: ['head', 'list', 'cta'], about: ['head', 'story', 'licenses', 'branches', 'isic', 'quote', 'cta'], contact: ['head', 'cards', 'branches'], support: ['hero', 'faq'], request: ['head', 'form'], track: ['head', 'form'], account: ['head', 'form'], my: ['head', 'body'] };
function applyBlocks(r) {
  const pg = r || 'home', app = $('#app'), kids = [...app.children], cfg = ((C.design || {}).pages || {})[pg] || {};
  if (pg !== 'home' && POS[pg]) kids.forEach((el, i) => { if (!el.dataset.blk && POS[pg][i]) el.dataset.blk = POS[pg][i]; });
  if (pg !== 'home' && Array.isArray(cfg.order) && cfg.order.length) { const m = {}; kids.forEach(el => { if (el.dataset.blk) m[el.dataset.blk] = el; }); cfg.order.forEach(k => { if (m[k]) app.appendChild(m[k]); }); }
  const hid = new Set(cfg.hidden || []);
  $$(':scope > [data-blk]', app).forEach(el => { const k = el.dataset.blk; if (pg !== 'home' && hid.has(k)) el.hidden = true; if (pg === 'home' && k === 'hero' && hid.has('hero')) el.hidden = true;
    const fs = (cfg.fs || {})[k], ic = (cfg.ic || {})[k];
    if (fs && fs !== 100) el.style.setProperty('--bfs', fs / 100); if (ic && ic !== 100) el.style.setProperty('--bic', ic / 100); });
}
function toast(x) { const el = $('#toast'); el.textContent = x; el.classList.add('on'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('on'), 2200); }
function copy(x) { navigator.clipboard ? navigator.clipboard.writeText(x).then(() => toast(t('copied'))) : toast(x); }

/* ---------- assistant ---------- */
const bot = makeBot({ V, lang: () => LANG, t, wa, tel: () => tel() });
function botSay(html, me, chips) {
  const m = document.createElement('div'); m.className = 'bm ' + (me ? 'me' : 'bt'); m.innerHTML = html;
  if (chips && chips.length) m.innerHTML += `<div class="bchips">${chips.map(c => `<a href="${esc(c.go)}" ${c.ext ? 'target="_blank" rel="noopener"' : ''} class="${c.ext ? '' : 'in'}">${esc(c.label)}</a>`).join('')}</div>`;
  $('#botMsgs').appendChild(m); $('#botMsgs').scrollTop = 1e6;
}
function botAsk(q) {
  botSay(esc(q), true); const ty = document.createElement('div'); ty.className = 'bm bt typing rb-ty'; ty.innerHTML = ROBOT('think') + '<span><i></i><i></i><i></i></span>'; $('#botMsgs').appendChild(ty); $('#botMsgs').scrollTop = 1e6;
  const a = bot.answer(q); setTimeout(() => { ty.remove(); botSay(a.text, false, a.chips); }, 500 + Math.min(900, a.text.length * 6));
  try { const h = JSON.parse(sessionStorage.getItem('sh.botlog') || '[]'); h.push({ q, at: Date.now() }); sessionStorage.setItem('sh.botlog', JSON.stringify(h.slice(-50))); } catch (e) { }
  logBot(q, a);
}
// أسئلة الزوار للمساعد بتتحفظ (من غير اسم) علشان الفريق يشوفها في «الدعم والمحادثات»
async function logBot(q, a) {
  if (PREVIEW || store('sh.staff')) return;
  try { const F = await fb(); const ref = F.doc(F.db, 'botlogs', SID); const n = +(store('sh.bln', 'session') || 0);
    if (n >= 60) return; storeSet('sh.bln', String(n + 1), 'session');
    const item = { q: String(q).slice(0, 300), a: String(a.text || '').replace(/<[^>]+>/g, '').slice(0, 300), at: Date.now() };
    if (!n) await F.setDoc(ref, { id: SID, at: F.serverTimestamp(), upd: F.serverTimestamp(), dev: DEV, lang: LANG, page: location.hash.slice(0, 60), qs: [item], n: 1 });
    else await F.updateDoc(ref, { qs: F.arrayUnion(item), upd: F.serverTimestamp(), n: F.increment(1) });
  } catch (e) { console.warn('botlog', e); }
}
/* روبوت المساعد (متحرك) */
const ROBOT = (c = '') => `<svg class="robot ${c}" viewBox="0 0 64 64" aria-hidden="true"><g class="rb-body"><line x1="32" y1="6" x2="32" y2="14" stroke="#8b93a1" stroke-width="2.5" stroke-linecap="round"/><circle class="rb-ant" cx="32" cy="6" r="3.6" fill="#E1262B"/><rect x="11" y="14" width="42" height="32" rx="12" fill="#f3f4f7" stroke="#c9ced8" stroke-width="2"/><rect x="17" y="20" width="30" height="19" rx="8" fill="#1d2230"/><g class="rb-eyes"><ellipse cx="26" cy="29.5" rx="3.6" ry="4.2" fill="#5ef0c4"/><ellipse cx="38" cy="29.5" rx="3.6" ry="4.2" fill="#5ef0c4"/></g><path class="rb-mouth" d="M28 35.5q4 2.6 8 0" stroke="#5ef0c4" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="6" y="25" width="5" height="11" rx="2.5" fill="#c9ced8"/><rect x="53" y="25" width="5" height="11" rx="2.5" fill="#c9ced8"/><rect x="22" y="48" width="20" height="10" rx="5" fill="#E1262B"/></g></svg>`;
const HELMET = `<svg class="helmet" viewBox="0 0 64 64" aria-hidden="true"><path d="M12 40a20 20 0 0 1 40 0z" fill="#F5B301"/><path d="M28 21h8v19h-8z" fill="#ffd34d"/><rect x="8" y="39" width="48" height="7" rx="3.5" fill="#d89a00"/><circle cx="32" cy="52" r="0" /></svg>`;
function botMini(on) {
  let m = $('#botMini'); if (!on) { if (m) m.remove(); return; }
  if (!m) { m = document.createElement('button'); m.id = 'botMini'; m.className = 'bot-mini'; document.body.appendChild(m); m.onclick = () => { botMini(false); $('#bot').hidden = false; $('#botFab').classList.add('hide'); hideTease(); if (chatMode) { unreadC = 0; fabBadge(); paintChat(); } }; }
  const live = $('#bot').classList.contains('live'), asst = $('#bot').classList.contains('asst');
  m.innerHTML = `<span class="bm-av">${asst ? ROBOT('sm') : '<img src="assets/img/mark.png" alt="">'}<i></i></span><span><b>${t('botName')}</b><small>${live ? ENG() : asst ? ASSIST() : (LANG === 'en' ? 'Tap to continue' : 'اضغط للمتابعة')}</small></span>${unreadC ? `<em>${unreadC}</em>` : ''}<span class="bm-up">⌃</span>`;
}
function resetBot() { $('#botMsgs').innerHTML = ''; $('#botQuick').innerHTML = ''; if (!$('#bot').hidden) openBot(); }
function openBot() {
  $('#bot').hidden = false; $('#botFab').classList.add('hide'); track('bot');
  botMini(false);
  if (!$('#botMsgs').children.length) { $('#bot').classList.remove('live', 'asst'); $('#botSubT').textContent = LANG === 'en' ? 'How can we help?' : 'نخدمك إزاي؟'; botSay(LANG === 'en' ? 'Hi 👋 Who would you like to talk to?' : 'أهلاً بيك 👋 تحب تتكلم مع مين؟'); showChoice(); }
  hideTease();
  if (matchMedia('(hover:hover)').matches) setTimeout(() => $('#botIn').focus(), 200);
}
/* اختيار: المساعد أو المهندس المختص */
const ENG = () => LANG === 'en' ? 'Our engineer' : 'المهندس المختص', ASSIST = () => LANG === 'en' ? 'Assistant' : 'المساعد';
function showChoice() {
  $('#botQuick').innerHTML = `<div class="bot-choice"><button data-mode="bot"><span class="ch-ic">${ROBOT()}</span><b>${LANG === 'en' ? 'Talk to the assistant' : 'التحدث إلى المساعد'}</b><small>${LANG === 'en' ? 'Instant answers, 24/7' : 'رد فوري على أسئلتك ٢٤ ساعة'}</small></button><button data-mode="eng"><span class="ch-ic eng"><img src="assets/img/mark.png" alt="">${HELMET}<i></i></span><b>${LANG === 'en' ? 'Talk to the engineer' : 'التحدث إلى المهندس'}</b><small>${LANG === 'en' ? 'Chat with a real engineer' : 'كلّم مهندس من الفريق'}</small></button></div>`;
  paintSwitch(true);
}
function setAssist() {
  chatMode = false; $('#bot').classList.remove('live'); $('#bot').classList.add('asst'); $('#botSubT').textContent = ASSIST(); $('#botMsgs').innerHTML = ''; botSay(t('botHi'));
  $('#botQuick').innerHTML = t('quick').map(q => `<button>${esc(q)}</button>`).join(''); paintSwitch();
}
function paintSwitch(hide) {
  const b = $('#botSwitch'); if (!b) return; b.hidden = !!hide;
  b.innerHTML = chatMode ? `<span class="sw-ic">${ROBOT('sm')}</span>${LANG === 'en' ? 'Switch to the assistant' : 'التحويل إلى المساعد'}` : `<span class="sw-ic eng"><img src="assets/img/mark.png" alt=""></span>${LANG === 'en' ? 'Talk to a real engineer' : 'كلّم المهندس المختص'}`;
}
// المهندس: محادثة مباشرة على الموقع، من غير اسم ولا رقم. لو الاتصال فشل الرسايل بتستنى وتتبعت لوحدها
function startEngineer() {
  if (!chatId && !(store('sh.custName') && store('sh.custPhone'))) return engForm();
  try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { }
  if (!chatId) {
    const id = 'C' + Date.now().toString(36).toUpperCase() + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => ALPH[b % ALPH.length]).join('');
    let log = []; try { log = JSON.parse(sessionStorage.getItem('sh.botlog') || '[]').slice(-8).map(x => x.q); } catch (e) { }
    const nm = (store('sh.custName') || '').slice(0, 60) || ((LANG === 'en' ? 'Visitor ' : 'زائر ') + id.slice(-4));
    chatId = id; storeSet('sh.chat', id);
    storeSet('sh.chatPend', JSON.stringify({ id, name: nm, phone: (store('sh.custPhone') || '').slice(0, 15), uid: store('sh.cust') || '', lang: LANG, page: location.hash.slice(0, 60), botLog: log, dev: DEV, at0: Date.now() }));
    track('chat');
  }
  $('#botMsgs').innerHTML = ''; startChat();
}
// قبل المهندس: الاسم ورقم الجوال (بيتملوا لوحدهم لو العميل مسجّل)
function engForm() {
  chatMode = false; $('#bot').classList.remove('asst'); $('#bot').classList.add('live'); $('#botSubT').textContent = ENG(); $('#botQuick').innerHTML = ''; paintSwitch();
  const en = LANG === 'en'; const box = $('#botMsgs'); box.innerHTML = '';
  const el = document.createElement('div'); el.className = 'bm bt eng-f';
  el.innerHTML = `<b>${en ? 'Before we connect you to the engineer:' : 'قبل ما نوصلك بالمهندس المختص:'}</b><form id="engF"><input id="eName" placeholder="${en ? 'Your name' : 'الاسم'}" maxlength="60" autocomplete="name" value="${esc(store('sh.custName') || '')}" required><input id="ePhone" placeholder="05xxxxxxxx" inputmode="tel" dir="ltr" maxlength="15" autocomplete="tel" value="${esc(store('sh.custPhone') || '')}" required><button class="btn btn-red sm">${en ? 'Start chat' : 'ابدأ المحادثة'}</button><small id="eErr"></small></form>`;
  box.appendChild(el); setTimeout(() => $('#eName').focus(), 50);
  $('#engF').onsubmit = e => { e.preventDefault(); const n = $('#eName').value.trim(), ph = toEnD($('#ePhone').value).replace(/\D/g, '');
    if (n.length < 2) { $('#eErr').textContent = en ? 'Enter your name' : 'اكتب اسمك'; return; } if (!/^0?5\d{8}$|^9665\d{8}$|^\d{9,14}$/.test(ph)) { $('#eErr').textContent = en ? 'Enter a valid mobile number' : 'اكتب رقم جوال صحيح'; return; }
    storeSet('sh.custName', n); storeSet('sh.custPhone', ph); startEngineer(); };
}
const toEnD = x => String(x || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
/* أصوات الشات (من غير ملفات) + كتم */
let AC = null;
function snd(kind) {
  if (store('sh.mute') === '1') return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    const notes = kind === 'send' ? [[660, 0, .07], [990, .06, .09]] : kind === 'recv' ? [[880, 0, .12], [1320, .13, .18]] : [[520, 0, .1]];
    notes.forEach(([f, t0, d]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f; const t = AC.currentTime + t0; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'send' ? .12 : .22, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); });
  } catch (e) { }
}
addEventListener('pointerdown', () => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { } }, { once: true });
/* فقاعة الترحيب جنب أيقونة الشات — مرة واحدة في الزيارة */
function initTease() {
  if (store('sh.tease', 'session') || PREVIEW) return;
  setTimeout(() => {
    if (!$('#bot').hidden || store('sh.tease', 'session')) return; storeSet('sh.tease', '1', 'session');
    const d = document.createElement('div'); d.className = 'bot-tease'; d.id = 'botTease';
    d.innerHTML = `<button class="bt-x" aria-label="×">×</button><b>${LANG === 'en' ? 'Hi 👋 How can I help?' : 'هلا 👋 كيف أقدر أخدمك؟'}</b>`;
    document.body.appendChild(d); $('#botFab').dataset.n = '1'; $('#botFab').classList.add('has-n'); snd('pop');
    d.onclick = e => { if (e.target.closest('.bt-x')) { hideTease(); return; } openBot(); };
  }, 5000);
}
function hideTease() { const d = $('#botTease'); if (d) d.remove(); if (!unreadC) $('#botFab').classList.remove('has-n'); }
function initBot() {
  $('#botFab').onclick = openBot;
  const at = document.createElement('label'); at.className = 'bot-att'; at.title = LANG === 'en' ? 'Attach image or PDF' : 'إرفاق صورة أو PDF'; at.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.6 8.6a2 2 0 0 1-2.8-2.8L15 7.5"/></svg><input type="file" accept="image/*,application/pdf" hidden>'; $('#botForm').prepend(at);
  $('input', at).onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (chatMode) pickFile(f); };
  const mu = document.createElement('button'); mu.type = 'button'; mu.className = 'bot-mute'; const pm = () => { const m = store('sh.mute') === '1'; mu.textContent = m ? '🔕' : '🔔'; mu.title = m ? (LANG === 'en' ? 'Sound off' : 'الصوت مقفول') : (LANG === 'en' ? 'Sound on' : 'الصوت شغال'); }; pm();
  mu.onclick = () => { storeSet('sh.mute', store('sh.mute') === '1' ? '0' : '1'); pm(); if (store('sh.mute') !== '1') snd('recv'); }; $('#bot header').insertBefore(mu, $('#botX'));
  if (chatId && !store('sh.chatPend')) setTimeout(listen, 2500);
  const sw = document.createElement('button'); sw.type = 'button'; sw.id = 'botSwitch'; sw.className = 'bot-switch'; sw.hidden = true; $('#botForm').after(sw);
  sw.onclick = () => { if (chatMode) setAssist(); else startEngineer(); };
  $('.bot-av', $('#bot')).insertAdjacentHTML('beforeend', ROBOT('hd'));
  const mn = document.createElement('button'); mn.type = 'button'; mn.className = 'bot-min'; mn.id = 'botMin'; mn.setAttribute('aria-label', LANG === 'en' ? 'Minimize' : 'تصغير'); mn.title = LANG === 'en' ? 'Minimize' : 'تصغير'; mn.innerHTML = '<i></i>'; $('#bot header').insertBefore(mn, $('#botX'));
  mn.onclick = () => { $('#bot').hidden = true; botMini(true); };
  $('#botX').onclick = () => { $('#bot').hidden = true; botMini(false); $('#botFab').classList.remove('hide'); chatMode = false; $('#botMsgs').innerHTML = ''; $('#botQuick').innerHTML = ''; paintSwitch(true); $('#bot').classList.remove('live', 'asst'); };
  $('#botQuick').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.mode === 'bot') return setAssist(); if (b.dataset.mode === 'eng') return startEngineer(); if (!b.dataset.botBack) botAsk(b.textContent); };
  $('#botForm').onsubmit = e => { e.preventDefault(); const v = $('#botIn').value.trim(); if (!v) return; $('#botIn').value = ''; if (chatMode) chatSend(v); else botAsk(v); };
  $('#bot').addEventListener('click', e => { const a = e.target.closest('a[href="#chat"]'); if (a) { e.preventDefault(); startEngineer(); } if (e.target.closest('[data-bot-back]')) setAssist(); });
  $('#botMsgs').onclick = e => { const a = e.target.closest('a.in:not([href="#chat"])'); if (a && matchMedia('(max-width:700px)').matches) { $('#bot').hidden = true; $('#botFab').classList.remove('hide'); } };
}

/* ---------- long-press logo → staff portal ---------- */
// ضغطة مطوّلة (ثانية) أو ٥ ضغطات سريعة على أي لوجو في الموقع → بوابة الموظفين
const HOLD_SEL = '#brand, img[data-logo], .ftr .brand, .ftr-logo, .bot-av, [data-hold]';
function initHold() { $$(HOLD_SEL).forEach(el => { if (el.dataset.holdOn || (el.id !== 'brand' && el.parentElement && el.parentElement.closest('#brand, .ftr .brand, [data-hold-on]'))) return; el.dataset.holdOn = '1'; el.style.webkitTouchCallout = 'none'; el.style.userSelect = 'none'; bindHold(el); }); }
function bindHold(b) {
  const HOLD = 1000, TOL = 12;
  let tm = null, raf = null, t0 = 0, fired = false, sx = 0, sy = 0, on = false, taps = [];
  const hint = $('#holdHint');
  const go = () => { fired = true; stop(); if (navigator.vibrate) navigator.vibrate([20, 40, 30]); location.href = 'portal.html'; };
  const stop = () => { on = false; clearTimeout(tm); cancelAnimationFrame(raf); b.classList.remove('holding'); b.style.setProperty('--p', '0%'); hint.classList.remove('on'); };
  const start = e => { if (e.button > 0) return; fired = false; on = true; sx = e.clientX; sy = e.clientY; t0 = performance.now(); b.classList.add('holding');
    const tick = () => { const p = Math.min(1, (performance.now() - t0) / HOLD); b.style.setProperty('--p', (p * 100) + '%'); if (p > .3) hint.classList.add('on'); if (p < 1 && on) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick);
    tm = setTimeout(go, HOLD); };
  b.addEventListener('pointerdown', start);
  b.addEventListener('pointermove', e => { if (on && Math.hypot(e.clientX - sx, e.clientY - sy) > TOL) stop(); });
  ['pointerup', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
  b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') stop(); });
  // احتياطي: ٥ ضغطات سريعة على اللوجو خلال ٢.٥ ثانية
  b.addEventListener('click', e => {
    if (fired) { e.preventDefault(); fired = false; return; }
    const n = Date.now(); taps = taps.filter(x => n - x < 2500); taps.push(n);
    if (taps.length >= 5) { e.preventDefault(); taps = []; go(); return; }
    if (taps.length >= 3) { hint.classList.add('on'); clearTimeout(b._ht); b._ht = setTimeout(() => hint.classList.remove('on'), 900); }
  });
  b.addEventListener('contextmenu', e => e.preventDefault());
  b.addEventListener('dragstart', e => e.preventDefault());
  b.addEventListener('selectstart', e => e.preventDefault());
}

/* ---------- توهّج الماوس (كمبيوتر فقط) ---------- */
/* روابط واتساب والسوشيال: روابط https عادية (universal links) عشان الفون يفتح التطبيق علطول من غير سؤال «Open in…» */
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const APP_HOSTS = /^https:\/\/(wa\.me|api\.whatsapp\.com|(www\.)?(instagram|tiktok|youtube|x|twitter|snapchat|facebook|linkedin)\.com|youtu\.be|t\.snapchat\.com)\//i;
function initWa() {
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    if (/^https:\/\/wa\.me\//.test(a.href)) track('wa');
    if (a.href.startsWith('tel:')) track('call');
    // على الموبايل: نفس التاب (من غير target) = iOS/Android يفتح التطبيق مباشرة
    if (IS_MOBILE && APP_HOSTS.test(a.href)) a.removeAttribute('target');
  }, true);
  document.addEventListener('click', e => { const s = e.target.closest && e.target.closest('[data-ev]'); if (s) track(s.dataset.ev); });
}
/* الماوس: شكل الدايرة اللي بتمشي ورا الماوس + أيقونة الماوس نفسها (بتتغير من لوحة التحكم) */
const CUR_ICONS = {
  pen: ['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M3 29l3-9L22 4l6 6-16 16z" fill="#fff" stroke="#16171A" stroke-width="2" stroke-linejoin="round"/><path d="M19 7l6 6" stroke="#E1262B" stroke-width="3"/><path d="M3 29l3-9 3 6z" fill="#E1262B"/></svg>', 3, 29],
  cross: ['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g stroke="#E1262B" stroke-width="2"><path d="M16 2v10M16 20v10M2 16h10M20 16h10"/></g><circle cx="16" cy="16" r="3" fill="none" stroke="#16171A" stroke-width="2"/></svg>', 16, 16],
  arrow: ['<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M3 2l20 9-8.5 2.5L11 22z" fill="#E1262B" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>', 3, 2],
  compass: ['<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="6" r="3" fill="#16171A"/><path d="M15 8L6 29M17 8l9 21" stroke="#16171A" stroke-width="2.4" stroke-linecap="round"/><path d="M9 22h14" stroke="#E1262B" stroke-width="2"/><circle cx="6" cy="29" r="1.8" fill="#E1262B"/></svg>', 6, 29],
  dot: ['<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" fill="#E1262B" stroke="#fff" stroke-width="2"/></svg>', 10, 10]
};
let CS = 'glow', curInit = false;
function initGlow() {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const d = C.design || {}; CS = d.cursorGlow === false ? 'none' : (d.cursor || 'glow'); const icon = d.cursorIcon || 'default';
  let st = document.getElementById('cur-ic'); if (!st) { st = document.createElement('style'); st.id = 'cur-ic'; document.head.appendChild(st); }
  if (CUR_ICONS[icon]) { const [svg, x, y] = CUR_ICONS[icon]; const u = `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${x} ${y}`; st.textContent = `html,body{cursor:${u},auto}a,button,summary,label,[data-lb],[data-prj],.st-item,.opt{cursor:${u},pointer}input,textarea{cursor:text}`; } else st.textContent = '';
  document.documentElement.dataset.cur = CS;
  if (curInit) { const ex = $('.cursor-x'); if (ex) ex.innerHTML = CS === 'cross' ? '<i class="h"></i><i class="v"></i><b></b>' : ''; return; }
  curInit = true;
  const g = document.createElement('div'); g.className = 'cursor-glow'; const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const extra = document.createElement('div'); extra.className = 'cursor-x'; if (CS === 'cross') extra.innerHTML = '<i class="h"></i><i class="v"></i><b></b>';
  document.body.append(g, dot, extra);
  let x = innerWidth / 2, y = innerHeight / 2, gx = x, gy = y, shown = false, hotEl = null, last = 0;
  addEventListener('pointermove', e => {
    if (CS === 'none') return;
    x = e.clientX; y = e.clientY; if (!shown) { shown = true; document.body.classList.add('glow-on'); }
    dot.style.transform = `translate(${x}px,${y}px)`;
    hotEl = e.target.closest && e.target.closest('a,button,summary,.opt,[data-lb],[data-prj],.st-item,input,textarea,select');
    dot.classList.toggle('hot', !!hotEl); g.classList.toggle('hot', !!hotEl);
    if (CS === 'cross') { extra.style.setProperty('--x', x + 'px'); extra.style.setProperty('--y', y + 'px'); const bb = $('b', extra); if (bb) bb.textContent = `X ${String(Math.round(x)).padStart(4, '0')}  Y ${String(Math.round(y + scrollY)).padStart(4, '0')}`; }
    if (CS === 'trail' && performance.now() - last > 28) { last = performance.now(); const p = document.createElement('i'); p.className = 'cur-p'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px'); document.body.appendChild(p); setTimeout(() => p.remove(), 700); }
  }, { passive: true });
  addEventListener('pointerdown', () => { dot.classList.add('press'); g.classList.add('press'); if (CS === 'ripple' || CS === 'ring') { const r = document.createElement('i'); r.className = 'cur-rip'; r.style.left = x + 'px'; r.style.top = y + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 650); } });
  addEventListener('pointerup', () => { dot.classList.remove('press'); g.classList.remove('press'); });
  document.addEventListener('mouseleave', () => { shown = false; document.body.classList.remove('glow-on'); });
  const loop = () => {
    const k = CS === 'ring' || CS === 'magnet' ? .2 : .14; let tx = x, ty = y;
    if (CS === 'magnet' && hotEl) { const r = hotEl.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2; g.style.width = (r.width + 18) + 'px'; g.style.height = (r.height + 14) + 'px'; const br = getComputedStyle(hotEl).borderRadius; g.style.borderRadius = br === '0px' ? '12px' : br; }
    else { g.style.width = g.style.height = g.style.borderRadius = ''; }
    gx += (tx - gx) * k; gy += (ty - gy) * k; g.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop);
  }; loop();
}

/* ---------- الإحصائيات (مجهولة الهوية: دولة، مدينة، جهاز، مصدر، صفحات) ---------- */
const dayKey = () => { const d = new Date(Date.now() + 3 * 3600e3); return d.toISOString().slice(0, 10); };
const SID = (() => { let x = store('sh.sid', 'session'); if (!x) { x = Math.random().toString(36).slice(2, 12); storeSet('sh.sid', x, 'session'); } return x; })();
const DEV = /iPad/.test(navigator.userAgent) ? 'ipad' : /iPhone|iPod/.test(navigator.userAgent) ? 'iphone' : /Android/.test(navigator.userAgent) ? 'android' : 'desktop';
function srcOf() {
  const q = new URLSearchParams(location.search).get('utm_source'); if (q) return q.toLowerCase().slice(0, 20);
  const ua = navigator.userAgent, r = document.referrer;
  if (/Instagram/i.test(ua) || /instagram/.test(r)) return 'instagram';
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua) || /tiktok/.test(r)) return 'tiktok';
  if (/Snapchat/i.test(ua) || /snapchat/.test(r)) return 'snapchat';
  if (/FBAN|FBAV/i.test(ua) || /facebook/.test(r)) return 'facebook';
  if (/WhatsApp/i.test(ua) || /whatsapp|wa\.me/.test(r)) return 'whatsapp';
  if (/google\./.test(r)) return 'google'; if (/bing\.|yahoo\./.test(r)) return 'search';
  if (/t\.co|twitter|x\.com/.test(r)) return 'x'; if (/youtube/.test(r)) return 'youtube';
  if (r && !r.includes(location.host)) return 'other'; return 'direct';
}
const TZ_CC = { 'Asia/Riyadh': 'SA', 'Asia/Dubai': 'AE', 'Africa/Cairo': 'EG', 'Asia/Kuwait': 'KW', 'Asia/Qatar': 'QA', 'Asia/Bahrain': 'BH', 'Asia/Muscat': 'OM', 'Asia/Amman': 'JO', 'Asia/Baghdad': 'IQ', 'Asia/Karachi': 'PK', 'Asia/Kolkata': 'IN', 'Europe/London': 'GB', 'America/New_York': 'US' };
async function geo() {
  try { const c = JSON.parse(store('sh.geo') || 'null'); if (c && Date.now() - c.t < 864e5) return c; } catch (e) { }
  let g = null;
  try { const r = await fetch('https://ipapi.co/json/', { cache: 'no-store' }); const j = await r.json(); if (j && j.country_code) g = { cc: j.country_code, city: (j.city || '').slice(0, 40), region: (j.region || '').slice(0, 40) }; } catch (e) { }
  if (!g) { let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { } g = { cc: TZ_CC[tz] || 'XX', city: '', region: '' }; }
  g.t = Date.now(); storeSet('sh.geo', JSON.stringify(g)); return g;
}
const safeKey = k => String(k || '—').replace(/[.~*/\[\]`]/g, ' ').trim().slice(0, 40) || '—';
let statQ = [], statT = null, statsReady = false;
function bump(obj) { statQ.push(obj); clearTimeout(statT); statT = setTimeout(flushStats, 1200); }
async function flushStats() {
  if (PREVIEW || !statsReady || !statQ.length) return; const items = statQ; statQ = [];
  try {
    const F = await fb(); const inc = F.increment(1), data = {};
    items.forEach(o => { for (const g in o) { if (typeof o[g] === 'string') { data[g] = data[g] || {}; data[g][safeKey(o[g])] = inc; } else data[g] = inc; } });
    data.upd = F.serverTimestamp();
    await F.setDoc(F.doc(F.db, 'stats', dayKey()), data, { merge: true });
  } catch (e) { }
}
function track(ev, extra) { if (ev) bump({ ev: ev.slice(0, 30), ...(extra || {}) }); }
async function initStats() {
  // الموظفين والمالك والبرامج الآلية (بوتات جوجل ومعاينات الروابط) مش بيتحسبوا
  const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|twitterbot|discord|bingpreview|yandex|baidu|semrush|ahrefs|python|curl|wget|phantom|puppeteer|playwright/i;
  if (PREVIEW || store('sh.staff') || navigator.webdriver || BOT.test(navigator.userAgent) || !navigator.languages) { statsReady = false; return; }
  const g = await geo(); statsReady = true;
  const first = !store('sh.v', 'session'); storeSet('sh.v', '1', 'session');
  if (first) { const seen = store('sh.seen') === dayKey(); storeSet('sh.seen', dayKey()); const o = { visits: 1, cc: g.cc, src: srcOf(), dev: DEV, lang: LANG }; if (g.city) o.city = g.city; if (!seen) o.uniq = 1; bump(o); }
  pageView(); presence(g); setInterval(() => presence(g), 60000);
}
function pageView() { if (!statsReady) return; const h = location.hash.replace(/^#\/?/, '').split('?')[0]; const [r, a] = h.split('/'); const o = { views: 1, page: r || 'home' }; if (r === 'service' && a) o.svc = a; bump(o); }
async function presence(g) { if (document.hidden || PREVIEW) return; try { const F = await fb(); await F.setDoc(F.doc(F.db, 'presence', SID), { at: F.serverTimestamp(), page: (location.hash.replace(/^#\/?/, '') || 'home').slice(0, 40), cc: g.cc, city: g.city || '', dev: DEV }); } catch (e) { } }

/* ---------- الشات المباشر مع الموظفين ---------- */
let chatId = store('sh.chat'), chatUnsub = null, chatMode = false;
function chatForm() {
  const f = document.createElement('div'); f.className = 'bm bt chat-form';
  f.innerHTML = `<b>${LANG === 'en' ? 'Talk to our team' : 'كلّم فريقنا مباشرة'}</b><p>${LANG === 'en' ? 'Leave your name and mobile and a team member will reply here.' : 'اكتب اسمك وجوالك، وموظف من الفريق يرد عليك هنا.'}</p><input id="cName" placeholder="${t('nameL')}" maxlength="60" autocomplete="name"><input id="cPhone" placeholder="05xxxxxxxx" inputmode="tel" dir="ltr" maxlength="15" autocomplete="tel"><button class="btn btn-red sm" id="cGo">${LANG === 'en' ? 'Start chat' : 'ابدأ المحادثة'}</button><p class="err" id="cErr"></p>`;
  $('#botMsgs').appendChild(f); $('#botMsgs').scrollTop = 1e6;
  $('#cGo').onclick = async () => {
    const n = $('#cName').value.trim(), ph = toEnDigits($('#cPhone').value).replace(/\D/g, '');
    if (n.length < 2) return $('#cErr').textContent = t('writeName'); if (ph.length < 9) return $('#cErr').textContent = t('writePhone');
    $('#cGo').disabled = true;
    try {
      const F = await fb(); const id = 'C' + Date.now().toString(36).toUpperCase() + Array.from(crypto.getRandomValues(new Uint8Array(5)), b => ALPH[b % ALPH.length]).join('');
      let log = []; try { log = JSON.parse(sessionStorage.getItem('sh.botlog') || '[]').slice(-8).map(x => x.q); } catch (e) { }
      await F.setDoc(F.doc(F.db, 'chats', id), { id, name: n.slice(0, 60), phone: ph.slice(0, 15), at: F.serverTimestamp(), upd: F.serverTimestamp(), open: true, unread: 1, lang: LANG, page: location.hash.slice(0, 60), botLog: log, msgs: [{ from: 'c', text: LANG === 'en' ? 'Started a chat' : 'بدأ محادثة جديدة', at: Date.now() }] });
      chatId = id; storeSet('sh.chat', id); f.remove(); track('chat'); startChat();
    } catch (e) { console.warn('chat', e); $('#cErr').innerHTML = `${t('connErr')} <a href="${wa()}" target="_blank" rel="noopener" style="color:var(--red);font-weight:700">${LANG === 'en' ? 'WhatsApp' : 'واتساب'}</a>`; $('#cGo').disabled = false; }
  };
}
const chatQ = () => { try { return JSON.parse(store('sh.chatQ') || '[]'); } catch (e) { return []; } };
const setQ = q => storeSet('sh.chatQ', JSON.stringify(q));
let serverMsgs = [], flushing = false, flushT = null, staffSeen = -1, unreadC = 0;
const ENG_HI = () => LANG === 'en' ? 'Hi 🌷 Write your question and our engineer will reply here shortly during working hours.' : 'أهلاً بك 🌷 اكتب سؤالك، والمهندس المختص هيرد عليك هنا خلال دقايق في وقت الدوام.';
const CMEDIA = {};
async function mediaGet(id) { if (CMEDIA[id]) return CMEDIA[id]; const F = await fb(); const d = await F.getDoc(F.doc(F.db, 'chatmedia', id)); return (CMEDIA[id] = d.exists() ? d.data() : null); }
const fileHtml = (f, local) => { if (!f) return ''; const isImg = /^image\//.test(f.type || ''); return isImg ? `<img class="cm-img" data-mid="${esc(f.id)}" ${local && f.data ? `src="${f.data}"` : ''} alt="${esc(f.name || '')}">` : `<button type="button" class="cm-pdf" data-mid="${esc(f.id)}"><span>PDF</span><b>${esc(f.name || 'file.pdf')}</b></button>`; };
function paintChat() {
  if (!chatMode) return; const box = $('#botMsgs'); box.innerHTML = '';
  const add = (cls, html) => { const el = document.createElement('div'); el.className = 'bm ' + cls; el.innerHTML = html; box.appendChild(el); };
  const tk = (c, ttl) => `<i class="tk" title="${ttl}">${c === '✓' ? '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>' : '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/></svg>'}</i>`;
  if (!serverMsgs.some(x => x.from === 's')) add('bt', esc(ENG_HI()));
  serverMsgs.filter(x => !x.sys).forEach(x => x.from === 'c' ? add('me', tk('✓', '') + fileHtml(x.file) + (x.text ? nl(x.text) : '')) : add('bt staff', `<b class="who">${esc(x.by || t('team'))}</b>` + fileHtml(x.file) + (x.text ? nl(x.text) : '')));
  chatQ().forEach(x => add('me pend', tk('⏳', LANG === 'en' ? 'Sending…' : 'جارٍ الإرسال') + fileHtml(x.file, 1) + (x.text ? nl(x.text) : '')));
  $$('.cm-img[data-mid]:not([src])', box).forEach(async im => { try { const m = await mediaGet(im.dataset.mid); if (m) im.src = m.data; } catch (e) { } });
  $$('.cm-img', box).forEach(im => im.onclick = () => im.src && lbOpen([{ src: im.src, cap: '' }], 0));
  $$('.cm-pdf', box).forEach(b => b.onclick = async () => { try { const m = await mediaGet(b.dataset.mid); if (!m) return; const bl = await (await fetch(m.data)).blob(); window.open(URL.createObjectURL(bl), '_blank'); } catch (e) { toast(t('connErr')); } });
  box.scrollTop = 1e6;
}
function fabBadge() { const f = $('#botFab'); if (!f) return; f.dataset.n = unreadC || ''; f.classList.toggle('has-n', !!unreadC); if ($('#botMini')) botMini(true); }
let snapOn = false;
async function listen() {
  if (snapOn || !chatId || store('sh.chatPend')) return; const F = await fb(); if (chatUnsub) chatUnsub(); snapOn = true;
  chatUnsub = F.onSnapshot(F.doc(F.db, 'chats', chatId), d => {
    if (!d.exists()) { if (!store('sh.chatPend')) { storeSet('sh.chat', ''); chatId = null; } return; }
    serverMsgs = d.data().msgs || [];
    const sc = serverMsgs.filter(x => x.from === 's').length;
    if (staffSeen >= 0 && sc > staffSeen) { // رد جديد من المهندس
      snd('recv'); try { navigator.vibrate && navigator.vibrate([40, 60, 40]); } catch (e) { }
      const last = serverMsgs.filter(x => x.from === 's').slice(-1)[0];
      if ($('#bot').hidden || !chatMode) { unreadC += sc - staffSeen; fabBadge(); }
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(LANG === 'en' ? 'Reply from our engineer' : 'رد من المهندس المختص', { body: (last.text || (LANG === 'en' ? 'Attachment' : 'مرفق')).slice(0, 120), icon: 'assets/img/icon-192.png', tag: 'sh-chat' }); } catch (e) { } }
    }
    staffSeen = sc;
    if (!$('#bot').hidden && chatMode && serverMsgs.some(x => x.from === 's' && x.at > (d.data().seenAt || 0))) F.updateDoc(F.doc(F.db, 'chats', chatId), { seenAt: Date.now() }).catch(() => { });
    paintChat();
  }, e => { console.warn('chat listen', e); snapOn = false; chatUnsub = null; retrySoon(); });
}
function retrySoon() { clearTimeout(flushT); flushT = setTimeout(flushChat, 5000); }
async function flushChat() {
  if (flushing || !chatId) return; flushing = true; clearTimeout(flushT);
  try {
    const F = await fb();
    const pend = store('sh.chatPend');
    if (pend) { const p = JSON.parse(pend); const { at0, ...rest } = p;
      rest.name = (store('sh.custName') || rest.name || '').slice(0, 60); rest.phone = (store('sh.custPhone') || rest.phone || '').slice(0, 15);
      await F.setDoc(F.doc(F.db, 'chats', chatId), { ...rest, at: F.serverTimestamp(), upd: F.serverTimestamp(), open: true, unread: 1, msgs: [{ from: 'c', sys: true, text: LANG === 'en' ? 'Started a chat' : 'بدأ محادثة مع المهندس', at: at0 || Date.now() }] });
      try { localStorage.removeItem('sh.chatPend'); } catch (e) { } }
    let q = chatQ();
    while (q.length) { const m = q[0]; const msg = { from: 'c', text: m.text || '', at: m.at };
      if (m.file) { if (m.file.data) await F.setDoc(F.doc(F.db, 'chatmedia', m.file.id), { chat: chatId, by: 'c', name: m.file.name, type: m.file.type, data: m.file.data, at: Date.now() }); msg.file = { id: m.file.id, name: m.file.name, type: m.file.type }; }
      await F.updateDoc(F.doc(F.db, 'chats', chatId), { msgs: F.arrayUnion(msg), upd: F.serverTimestamp(), unread: F.increment(1) });
      if (!serverMsgs.some(x => x.at === msg.at && x.from === 'c')) serverMsgs = [...serverMsgs, msg]; q = chatQ().slice(1); setQ(q); paintChat(); }
    listen();
  } catch (e) { console.warn('chat flush', e); retrySoon(); }
  flushing = false;
}
async function startChat() {
  chatMode = true; unreadC = 0; fabBadge(); $('#bot').classList.remove('asst'); $('#bot').classList.add('live'); $('#botSubT').textContent = ENG(); $('#botQuick').innerHTML = ''; paintSwitch();
  paintChat(); if (store('sh.chatPend') || chatQ().length) flushChat(); else listen();
}
function stopChat() { return setAssist(); }
function chatSend(text, file) {
  const q = chatQ(); q.push({ text: (text || '').slice(0, 1500), at: Date.now(), file: file || null }); setQ(q); snd('send'); paintChat(); flushChat();
}
// مرفقات: صورة (بتتضغط) أو PDF لحد ٧٠٠ كيلو
function readAsData(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }
async function pickFile(f) {
  const en = LANG === 'en'; if (!f) return;
  const id = 'M' + Date.now().toString(36) + Array.from(crypto.getRandomValues(new Uint8Array(6)), b => ALPH[b % ALPH.length]).join('');
  try {
    if (/^image\//.test(f.type)) { const data = await shrinkImg(f, 1280, .76); chatSend('', { id, name: f.name.slice(0, 80), type: 'image/jpeg', data }); }
    else if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) { if (f.size > 700 * 1024) return toast(en ? 'PDF must be under 700 KB' : 'ملف الـ PDF لازم يكون أقل من ٧٠٠ كيلو'); chatSend('', { id, name: f.name.slice(0, 80), type: 'application/pdf', data: await readAsData(f) }); }
    else toast(en ? 'Images or PDF only' : 'صور أو PDF بس');
  } catch (e) { toast(t('connErr')); }
}
function shrinkImg(f, max, q) { return new Promise((res, rej) => { const u = URL.createObjectURL(f), im = new Image(); im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); let out = c.toDataURL('image/jpeg', q); if (out.length > 900000) out = c.toDataURL('image/jpeg', .55); URL.revokeObjectURL(u); res(out); }; im.onerror = rej; im.src = u; }); }
addEventListener('online', () => { if (chatId && (store('sh.chatPend') || chatQ().length)) flushChat(); });

/* ---------- boot ---------- */
function boot() {
  try { const th = localStorage.getItem('sh.theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) { }
  $('#themeBtn').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; try { localStorage.setItem('sh.theme', d); } catch (e) { } };
  $('#langBtn').onclick = switchLang;
  $('#moreX').onclick = () => toggleMore(false); $('#more').onclick = e => { if (e.target.id === 'more' || e.target.closest('a')) toggleMore(false); };
  $('#announceX').onclick = () => { const a = $('#announce'); a.hidden = true; if (a.classList.contains('occ')) storeSet('sh.occBar', a.dataset.occ, 'session'); else storeSet('sh.annX', V().announce.text, 'session'); };
  $('#popX').onclick = () => $('#popup').hidden = true; $('#popup').onclick = e => { if (e.target.id === 'popup') $('#popup').hidden = true; };
  $('#lbX').onclick = () => $('#lb').hidden = true;
  $('#topBtn').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  addEventListener('scroll', () => { const y = scrollY, h = document.documentElement.scrollHeight - innerHeight; $('#hdr').classList.toggle('scrolled', y > 30); $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%'; $('#topBtn').classList.toggle('on', y > 900); }, { passive: true });
  addEventListener('hashchange', () => render());
  addEventListener('keydown', e => { if (e.key === 'Escape') { $('#popup').hidden = true; $('#lb').hidden = true; toggleMore(false); } if (!$('#lb').hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) lbStep((e.key === 'ArrowLeft') === (LANG === 'en') ? -1 : 1); });
  $('#lb').insertAdjacentHTML('beforeend', `<button class="lb-nav p" aria-label="prev">${I.prev}</button><button class="lb-nav n" aria-label="next">${I.next}</button>`); $('#lb .lb-nav.p').onclick = () => lbStep(LANG === 'en' ? -1 : 1); $('#lb .lb-nav.n').onclick = () => lbStep(LANG === 'en' ? 1 : -1);
  { let sx = 0; $('#lb').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true }); $('#lb').addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) lbStep(dx > 0 ? 1 : -1); }); }
  document.addEventListener('touchstart', () => { }, { passive: true }); // يفعّل تأثير الضغط :active على الآيفون
  chrome(); render(); initBot(); initTease(); initHold(); popup(); initGlow(); initWa(); initStats();
  loadRemote();
}
boot();
