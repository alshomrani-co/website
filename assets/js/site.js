// شركة سعد الشمراني — الموقع العام (صفحة واحدة بروابط #) — عربي / English
import { DEFAULT } from './data.js';
import { EN } from './data-en.js';
import { UI } from './i18n.js';
import { makeBot } from './bot.js';

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
try { const c = JSON.parse(localStorage.getItem(PREVIEW ? 'sh.preview' : 'sh.site') || 'null'); if (c) C = deepMerge(DEFAULT, c); } catch (e) { }
let LANG = 'ar';
try { LANG = localStorage.getItem('sh.lang') || (/^en/.test(new URLSearchParams(location.search).get('lang') || '') ? 'en' : 'ar'); } catch (e) { }
let VV = null;
const V = () => VV || (VV = LANG === 'en' ? overlay(C, deepMerge(EN, C.en || {})) : C);
const t = (k, rep) => { let s = (UI[LANG] && UI[LANG][k] !== undefined) ? UI[LANG][k] : UI.ar[k]; if (rep && typeof s === 'string') for (const r in rep) s = s.replace('{' + r + '}', rep[r]); return s; };
const em = s => String(s).replace(/<em>/g, '<span class="hl">').replace(/<\/em>/g, '</span>');
const setC = next => { C = next; VV = null; };

if (PREVIEW) { try { const bc = new BroadcastChannel('sh-preview'); bc.onmessage = e => { setC(deepMerge(DEFAULT, e.data)); chrome(); render(true); }; } catch (e) { } addEventListener('DOMContentLoaded', () => { const b = document.createElement('div'); b.className = 'preview-flag'; b.textContent = t('preview'); document.body.appendChild(b); }); }

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
      const next = deepMerge(DEFAULT, remote);
      if (JSON.stringify(next) !== JSON.stringify(C)) { setC(next); chrome(); render(true); }
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
  const d = C.design || {}, r = document.documentElement.style;
  if (d.red) { r.setProperty('--red', d.red); r.setProperty('--red2', `color-mix(in srgb, ${d.red} 82%, #000)`); }
  if (d.gold) r.setProperty('--gold', d.gold);
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
const NAV_MAIN = ['services', 'projects', 'packages', 'contact'];
const NAV_ALL = ['', 'services', 'projects', 'packages', 'about', 'support', 'track', 'request', 'contact'];
function chrome() {
  const v = V();
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
  document.title = v.seo.title; applyDesign();
  $('#bShort').textContent = v.brand.short; $('#bSub').textContent = t('company');
  $('#langBtn').textContent = t('langBtn'); $('#langBtn').title = t('langName');
  $('#reqBtn').textContent = t('request');
  $('#nav').innerHTML = NAV_MAIN.filter(r => r !== 'packages' || v.packages.on).map(r => `<a href="#/${r}" data-r="${r}">${t(r)}</a>`).join('') + `<button class="more-btn" id="moreBtn" aria-label="${t('more')}" aria-expanded="false"><i></i><i></i><i></i></button>`;
  $('#moreList').innerHTML = NAV_ALL.filter(r => r !== 'packages' || v.packages.on).map((r, i) => `<a href="#/${r}" data-r="${r}" style="--i:${i}"><span>${t(r || 'home')}</span>${I.prev}</a>`).join('') + (store('sh.staff') ? `<a href="portal.html" class="staff-link" style="--i:11"><span>${t('staff')}</span>${I.prev}</a>` : '') +
    `<div class="more-foot"><a class="btn btn-red" href="${wa()}" target="_blank" rel="noopener">${I.wa} ${t('waNow')}</a><a class="btn btn-ghost" href="${tel()}" dir="ltr">${I.phone} ${esc(v.contact.phone)}</a><button class="btn btn-ghost" data-lang>${t('switchLang')}</button></div>`;
  $('#moreBtn').onclick = () => toggleMore();
  $('#waFab').href = wa();
  const an = v.announce; if (an.on && an.text && store('sh.annX','session') !== an.text) { $('#announce').hidden = false; $('#announceText').innerHTML = an.link ? `<a href="${esc(an.link)}">${esc(an.text)}</a>` : esc(an.text); } else $('#announce').hidden = true;
  const s = v.socials, soc = SOC.filter(x => s[x[0]]).map(x => `<a href="${esc(s[x[0]])}" target="_blank" rel="noopener" aria-label="${socName(x)}">${I[x[1]]}</a>`).join('');
  $('#ftr').innerHTML = `<div class="wrap"><div class="ftr-grid">
    <div><div class="brand" style="color:#fff"><span class="mark"><img src="assets/img/mark.png" data-logo alt="" width="40"></span><span class="bname"><b>${esc(v.brand.short)}</b><small>${t('company')}</small></span></div>
      <p style="margin-top:14px;max-width:360px">${esc(v.hero.lead)}</p><div class="soc">${soc}</div></div>
    <div><h5>${t('fServices')}</h5>${v.services.map(x => `<a href="#/service/${esc(x.id)}">${esc(x.title)}</a>`).join('')}</div>
    <div><h5>${t('links')}</h5><a href="#/projects">${t('projects')}</a>${v.packages.on ? `<a href="#/packages">${t('packages')}</a>` : ''}<a href="#/about">${t('aboutLic')}</a><a href="#/support">${t('helpCenter')}</a><a href="#/track">${t('track')}</a><a href="#/contact">${t('contact')}</a></div>
    <div><h5>${t('fContact')}</h5><a href="${tel()}" dir="ltr" class="num">${esc(v.contact.phone)}</a>${v.contact.phone2 ? `<a href="${tel(v.contact.phone2)}" dir="ltr" class="num">${esc(v.contact.phone2)}</a>` : ''}<a href="mailto:${esc(v.contact.email)}">${esc(v.contact.email)}</a><p style="margin-top:8px">${esc(v.contact.address)}</p></div>
  </div><div class="ftr-bot"><span>© ${new Date().getFullYear()} ${esc(v.brand.name)}. ${t('rights')}</span><span>${store('sh.staff') ? `<a href="portal.html" style="display:inline;opacity:1;color:var(--red)">${t('staff')}</a>` : t('city')}</span></div></div>`;
  $('#botName').textContent = t('botName'); $('#botSubT').textContent = t('botSub'); $('#botIn').placeholder = t('botPh'); $('#botSend').textContent = t('sendB'); $('#botFabT').textContent = t('ask');
  $('#holdHint').textContent = t('staffHint');
  $$('[data-lang]').forEach(b => b.onclick = switchLang);
  applyDesign();
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
P[''] = () => {
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
  return `<section class="hero">${h.video && vsrc ? `<video autoplay muted loop playsinline preload="auto" poster="${esc(src(h.poster))}"><source src="${esc(vsrc)}" type="video/mp4"></video>` : `<img class="poster" src="${esc(src(h.poster))}" alt="">`}
    <div class="hero-in"><div>
      ${d.heroLogo !== false ? `<div class="hero-logo">${d.logo ? `<span class="hl-cube custom">${img(d.logo, '')}</span>` : `<span class="hl-cube"><img class="g" src="assets/img/cube-gray.png" alt=""><img class="r" src="assets/img/cube-red.png" alt=""></span>`}<span class="hl-t"><b>${esc(v.brand.short)}</b><small>${t('company')}</small></span></div>` : ''}
      <span class="eyebrow">${esc(h.eyebrow)}</span><h1><span class="l"><span>${esc(h.title)}</span></span><span class="l"><span>${esc(h.highlight)}</span></span></h1><p class="lead">${esc(h.lead)}</p>
      <div class="ctas"><a class="btn btn-red" href="#/request">${esc(h.cta1)} ${I.arrow}</a><a class="btn btn-ghost" href="#/services">${esc(h.cta2)}</a></div>
</div>
      <div class="hero-card glass"><h4>${t('needToday')} <span class="live"><i></i> ${t('liveNow')}</span></h4><ul>${v.services.slice(0, 5).map(x => `<li><a href="#/service/${esc(x.id)}">${esc(x.title)} <span>${esc(x.no)}</span></a></li>`).join('')}</ul></div></div><span class="scroll-cue"></span></section>
  ${order.map(k => S[k] ? S[k]() : '').join('')}`;
};

P.services = () => { const v = V(); return `<section class="phead"><div class="grid-bg"></div><div class="wrap">${crumbs(t('services'))}<h1>${em(t('svcPageTitle'))}</h1><p class="lead">${t('svcPageLead')}</p></div></section>
  ${strip()}<section class="sec tight"><div class="wrap"><div class="svc-grid">${v.services.map(svcCard).join('')}</div></div></section>${ctaBox()}`; };

P.service = (id) => {
  const vv = V(), v = vv.services.find(x => x.id === id) || vv.services[0];
  return `<section class="phead"><div class="wrap"><div class="crumbs"><a href="#/">${t('home')}</a><span>/</span><a href="#/services">${t('services')}</a><span>/</span><span>${esc(v.title)}</span></div><h1>${esc(v.title)}</h1><p class="lead" style="max-width:760px">${esc(v.desc)}</p></div></section>
  <section class="sec tight" style="padding-top:20px"><div class="wrap svc-page"><div><div class="hero-img rv">${img(v.img, v.title)}</div>
    <h3 style="margin-top:34px;font-size:24px" class="rv">${t('included')}</h3><ul class="check">${v.items.map((x, i) => `<li class="glass rv d${i % 4}">${esc(x)}</li>`).join('')}</ul>
    ${v.fit ? `<div class="fit rv"><b>${t('fitFor')}</b> ${esc(v.fit)}</div>` : ''}</div>
    <aside class="side-card glass rv"><span class="chip">${t('svcNo')} ${esc(v.no)}</span><h3>${esc(t('want', { s: v.title }))}</h3><p style="color:var(--mut)">${t('wantP')}</p>
      <a class="btn btn-red" href="#/request?s=${esc(v.id)}">${t('orderOnline')}</a><a class="btn btn-ghost" href="${wa(t('svcWa') + v.title)}" target="_blank" rel="noopener">${I.wa} ${t('askWa')}</a>
      <div class="svc-nav">${vv.services.map(x => `<a href="#/service/${esc(x.id)}" class="${x.id === v.id ? 'on' : ''}">${esc(x.title)}<span>${esc(x.no)}</span></a>`).join('')}</div></aside></div></section>${strip()}${ctaBox()}`;
};

let prjCat = -1;
P.projects = () => { const v = V(); return `<section class="phead"><div class="wrap">${crumbs(t('projects'))}<h1>${em(t('prjTitle'))}</h1><p class="lead">${esc(t('prjLead', { y: v.brand.founded }))}</p></div></section>
  <div class="wrap">${stats()}</div>
  <section class="sec tight"><div class="wrap"><div class="filters" id="filters">${[t('all'), ...v.cats].map((c, i) => `<button class="${i - 1 === prjCat ? 'on' : ''}" data-c="${i - 1}">${esc(c)}</button>`).join('')}</div><div class="prj-grid" id="prjGrid">${prjCards()}</div>
  <div class="note-box glass rv" style="margin-top:34px"><div><h4>${t('whyNo')}</h4><p>${esc(v.confidential)}</p></div><a class="btn btn-ink" href="${wa(t('portfolioWa'))}" target="_blank" rel="noopener">${t('portfolio')}</a></div></div></section>
  ${galleryBlock()}${ctaBox()}`; };
const prjCards = () => { const v = V(), cat = prjCat >= 0 ? C.cats[prjCat] : null; return v.projects.filter((p, i) => !cat || C.projects[i].cat === cat).map((p, i) => `<article class="prj glass" style="animation-delay:${i * 40}ms"><div class="ph">${p.img ? img(p.img, p.title) : `<img class="ph-ic" src="assets/img/mark.png" alt="">`}</div><div class="bd"><span class="chip" style="align-self:flex-start">${esc(p.tag || p.cat)}</span><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><div class="meta"><span>${t('loc')} <b>${esc(p.loc)}</b></span><span>·</span><span>${t('scope')} <b>${esc(p.scope)}</b></span></div></div></article>`).join(''); };

P.packages = () => { const v = V(); return `<section class="phead"><div class="wrap">${crumbs(t('packages'))}<h1>${esc(v.packages.title)}</h1><p class="lead">${esc(v.packages.sub)}</p></div></section>
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

/* request wizard */
let wiz = { step: 0, s: '', type: '', city: '', name: '', phone: '', msg: '', img: '' };
P.request = (q) => {
  const sp = new URLSearchParams(q || ''); if (sp.get('s')) { const v = V().services.find(x => x.id === sp.get('s')); if (v) { wiz.s = v.title; wiz.step = Math.max(wiz.step, 1); } }
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
  const h = location.hash.replace(/^#\/?/, ''); const [path, q] = h.split('?'); const [r, arg] = path.split('/');
  const fn = P[r] ? P[r] : P[''];
  if (soft && curPath === h && r === 'request') { paintWiz(); return; }
  curPath = h;
  const app = $('#app'); app.innerHTML = fn(r === 'service' || r === 'media' ? arg : q); app.classList.remove('page-enter'); void app.offsetWidth; app.classList.add('page-enter');
  const cur = r === 'service' ? 'services' : (P[r] ? r : '');
  $$('#nav a[data-r], #moreList a[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === cur));
  $('#hdr').classList.toggle('on-hero', !P[r] || r === '');
  if (!soft) window.scrollTo({ top: 0, behavior: 'instant' });
  toggleMore(false);
  const desc = document.querySelector('meta[name=description]'); if (desc) desc.content = V().seo.desc;
  wire(r); pageView();
}
function wire(r) {
  reveal(); counters(); countdown(); initStrip();
  $$('[data-copy]').forEach(b => b.onclick = () => copy(b.dataset.copy));
  $$('[data-lang]').forEach(b => b.onclick = switchLang);
  $$('[data-lb]').forEach(f => f.onclick = () => { if (f.closest('.strip') && f.closest('.strip')._dragged) return; $('#lbImg').src = f.querySelector('img').src; $('#lbCap').textContent = f.dataset.cap; $('#lb').hidden = false; });
  const gal = $('#gal'); if (gal) $$('[data-g]').forEach(b => b.onclick = () => { gal._pause && gal._pause(2500); gal.scrollBy({ left: (LANG === 'en' ? 1 : -1) * (+b.dataset.g) * 260, behavior: 'smooth' }); });
  const fl = $('#filters'); if (fl) fl.onclick = e => { const b = e.target.closest('button'); if (!b) return; prjCat = +b.dataset.c; $$('button', fl).forEach(x => x.classList.toggle('on', x === b)); $('#prjGrid').innerHTML = prjCards(); };
  if (r === 'support') { const q = $('#faqQ'), cats = $('#faqCats'); let cat = ''; const F = V().faq; const run = () => { const v = q.value.trim().toLowerCase(); let n = 0; $$('#faqList details').forEach((d, i) => { const f = F[i]; const ok = (!cat || f.cat === cat) && (!v || (f.q + f.a).toLowerCase().includes(v)); d.hidden = !ok; d.classList.add('in'); if (ok) n++; if (v && ok) d.open = f.a.toLowerCase().includes(v); }); $('#faqNone').hidden = n > 0; }; q.oninput = run; cats.onclick = e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; $$('button', cats).forEach(x => x.classList.toggle('on', x === b)); run(); }; }
  if (r === 'request') paintWiz();
  if (r === 'track') { $('#trForm').onsubmit = doTrack; if ($('#trCode').value && new URLSearchParams(location.hash.split('?')[1] || '').get('c')) doTrack(); }
  if (r === 'media') paintFeed();
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
  botSay(esc(q), true); const ty = document.createElement('div'); ty.className = 'bm bt typing'; ty.innerHTML = '<i></i><i></i><i></i>'; $('#botMsgs').appendChild(ty); $('#botMsgs').scrollTop = 1e6;
  const a = bot.answer(q); setTimeout(() => { ty.remove(); botSay(a.text, false, a.chips); }, 500 + Math.min(900, a.text.length * 6));
  try { const h = JSON.parse(sessionStorage.getItem('sh.botlog') || '[]'); h.push({ q, at: Date.now() }); sessionStorage.setItem('sh.botlog', JSON.stringify(h.slice(-50))); } catch (e) { }
}
function resetBot() { $('#botMsgs').innerHTML = ''; $('#botQuick').innerHTML = ''; if (!$('#bot').hidden) openBot(); }
function openBot() {
  $('#bot').hidden = false; $('#botFab').classList.add('hide'); track('bot');
  if (chatId && !chatMode && !$('#botMsgs').children.length) { startChat(); return; }
  if (!$('#botMsgs').children.length) { botSay(t('botHi')); $('#botQuick').innerHTML = t('quick').map(q => `<button>${esc(q)}</button>`).join(''); }
  if (matchMedia('(hover:hover)').matches) setTimeout(() => $('#botIn').focus(), 200);
}
function initBot() {
  $('#botFab').onclick = openBot;
  $('#botX').onclick = () => { $('#bot').hidden = true; $('#botFab').classList.remove('hide'); };
  $('#botQuick').onclick = e => { const b = e.target.closest('button'); if (b && !b.dataset.botBack) botAsk(b.textContent); };
  $('#botForm').onsubmit = e => { e.preventDefault(); const v = $('#botIn').value.trim(); if (!v) return; $('#botIn').value = ''; if (chatMode) chatSend(v); else botAsk(v); };
  $('#bot').addEventListener('click', e => { const a = e.target.closest('a[href="#chat"]'); if (a) { e.preventDefault(); if (chatId) startChat(); else chatForm(); } if (e.target.closest('[data-bot-back]')) stopChat(); });
  $('#botMsgs').onclick = e => { const a = e.target.closest('a.in:not([href="#chat"])'); if (a && matchMedia('(max-width:700px)').matches) { $('#bot').hidden = true; $('#botFab').classList.remove('hide'); } };
}

/* ---------- long-press logo → staff portal ---------- */
function initHold() {
  const b = $('#brand'); const HOLD = 1000, TOL = 12;
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
function initGlow() {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || (C.design && C.design.cursorGlow === false)) return;
  const g = document.createElement('div'); g.className = 'cursor-glow'; const dot = document.createElement('div'); dot.className = 'cursor-dot';
  document.body.append(g, dot);
  let x = innerWidth / 2, y = innerHeight / 2, gx = x, gy = y, shown = false;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!shown) { shown = true; document.body.classList.add('glow-on'); } dot.style.transform = `translate(${x}px,${y}px)`; const hot = e.target.closest && e.target.closest('a,button,summary,.opt,[data-lb],.st-item,input,textarea,select'); dot.classList.toggle('hot', !!hot); }, { passive: true });
  addEventListener('pointerdown', () => dot.classList.add('press')); addEventListener('pointerup', () => dot.classList.remove('press'));
  document.addEventListener('mouseleave', () => { shown = false; document.body.classList.remove('glow-on'); });
  const loop = () => { gx += (x - gx) * .14; gy += (y - gy) * .14; g.style.transform = `translate(${gx}px,${gy}px)`; requestAnimationFrame(loop); }; loop();
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
  if (PREVIEW || store('sh.staff')) { statsReady = false; return; } // الموظفين مش بيتحسبوا
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
    } catch (e) { $('#cErr').textContent = t('connErr'); $('#cGo').disabled = false; }
  };
}
async function startChat() {
  chatMode = true; $('#bot').classList.add('live'); $('#botSubT').textContent = LANG === 'en' ? 'Live chat with our team' : 'محادثة مباشرة مع الفريق';
  $('#botQuick').innerHTML = `<button data-bot-back>${LANG === 'en' ? '← Back to assistant' : '→ رجوع للمساعد'}</button>`;
  const F = await fb(); if (chatUnsub) chatUnsub();
  chatUnsub = F.onSnapshot(F.doc(F.db, 'chats', chatId), d => {
    if (!d.exists()) { storeSet('sh.chat', ''); chatId = null; return; }
    const m = d.data().msgs || []; const box = $('#botMsgs'); box.innerHTML = '';
    m.forEach(x => { const el = document.createElement('div'); el.className = 'bm ' + (x.from === 'c' ? 'me' : 'bt staff'); el.innerHTML = (x.from !== 'c' ? `<b class="who">${esc(x.by || t('team'))}</b>` : '') + nl(x.text); box.appendChild(el); });
    if (m.length < 2) { const el = document.createElement('div'); el.className = 'bm bt'; el.textContent = LANG === 'en' ? 'Thanks! A team member will reply here shortly. You can keep writing.' : 'شكراً لك 🌷 موظف من الفريق هيرد عليك هنا خلال دقايق في وقت الدوام. تقدر تكتب سؤالك.'; box.appendChild(el); }
    box.scrollTop = 1e6;
  }, () => { });
}
function stopChat() { chatMode = false; if (chatUnsub) { chatUnsub(); chatUnsub = null; } $('#bot').classList.remove('live'); $('#botSubT').textContent = t('botSub'); $('#botMsgs').innerHTML = ''; $('#botQuick').innerHTML = ''; openBot(); }
async function chatSend(text) {
  try { const F = await fb(); await F.updateDoc(F.doc(F.db, 'chats', chatId), { msgs: F.arrayUnion({ from: 'c', text: text.slice(0, 1500), at: Date.now() }), upd: F.serverTimestamp(), unread: F.increment(1) }); } catch (e) { toast(t('connErr')); }
}

/* ---------- boot ---------- */
function boot() {
  try { const th = localStorage.getItem('sh.theme'); if (th) document.documentElement.dataset.theme = th; } catch (e) { }
  $('#themeBtn').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; try { localStorage.setItem('sh.theme', d); } catch (e) { } };
  $('#langBtn').onclick = switchLang;
  $('#moreX').onclick = () => toggleMore(false); $('#more').onclick = e => { if (e.target.id === 'more' || e.target.closest('a')) toggleMore(false); };
  $('#announceX').onclick = () => { $('#announce').hidden = true; storeSet('sh.annX', V().announce.text, 'session'); };
  $('#popX').onclick = () => $('#popup').hidden = true; $('#popup').onclick = e => { if (e.target.id === 'popup') $('#popup').hidden = true; };
  $('#lbX').onclick = () => $('#lb').hidden = true;
  $('#topBtn').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  addEventListener('scroll', () => { const y = scrollY, h = document.documentElement.scrollHeight - innerHeight; $('#hdr').classList.toggle('scrolled', y > 30); $('#progress').style.width = (h > 0 ? y / h * 100 : 0) + '%'; $('#topBtn').classList.toggle('on', y > 900); }, { passive: true });
  addEventListener('hashchange', () => render());
  addEventListener('keydown', e => { if (e.key === 'Escape') { $('#popup').hidden = true; $('#lb').hidden = true; toggleMore(false); } });
  document.addEventListener('touchstart', () => { }, { passive: true }); // يفعّل تأثير الضغط :active على الآيفون
  chrome(); render(); initBot(); initHold(); popup(); initGlow(); initWa(); initStats();
  loadRemote();
}
boot();
