// أجزاء لوحة التحكم المتقدمة: التصميم، الفيديو، ترتيب الصفحة، الإنجليزي، الإحصائيات، العملاء المحتملين
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function emptyWarnings(D) {
  const w = [];
  if (D.announce && D.announce.on && !String(D.announce.text || '').trim()) w.push('• شريط الإعلان مفعّل بس مفيش نص مكتوب، فمش هيظهر.');
  if (D.popup && D.popup.on && !String(D.popup.title || '').trim()) w.push('• نافذة العروض مفعّلة بس مفيش عنوان، فمش هتظهر.');
  if (D.offer && D.offer.on && !String(D.offer.title || '').trim()) w.push('• العرض مفعّل بس مفيش عنوان، فمش هيظهر.');
  if (D.offer && D.offer.on && D.offer.until && new Date(D.offer.until).getTime() < Date.now()) w.push('• تاريخ انتهاء العرض فات، فالعرض مش هيظهر.');
  return w.length ? 'تنبيه:\n' + w.join('\n') : '';
}

const SEC_NAMES = { offer: 'العرض الحالي', gallery: 'معرض صور الأعمال', strip: 'شريط الخدمات المتحرك', stats: 'الأرقام (العدّاد)', services: 'كروت الخدمات', steps: 'آلية العمل', packages: 'الباقات', social: 'السوشيال ميديا', why: 'ليش الشمراني + كلمة المدير', partners: 'الشركاء', faq: 'الأسئلة الشائعة', cta: 'صندوق دعوة التواصل' };
const CUR_ST = [['glow', 'توهّج', 'هالة ناعمة بلون الشركة'], ['ring', 'حلقة', 'دايرة بتلحق الماوس وتكبر على الأزرار'], ['magnet', 'مغناطيس', 'الحلقة بتلزق حوالين الزرار'], ['cross', 'مسطرة هندسية', 'خطوط إحداثيات X/Y زي الأوتوكاد'], ['blueprint', 'بلو برينت', 'شبكة مخطط بتظهر حوالين الماوس'], ['trail', 'شرار', 'نقط أحمر ودهبي ورا الماوس'], ['ripple', 'موجة', 'توهّج + موجة مع كل ضغطة'], ['none', 'بدون', 'من غير أي تأثير']];
const CUR_IC = [['default', 'العادي', '<svg viewBox="0 0 24 24"><path d="M5 3l14 7-6 2-2 6z" fill="#fff" stroke="#111" stroke-width="1.6"/></svg>'], ['pen', 'قلم هندسي', '<svg viewBox="0 0 32 32"><path d="M3 29l3-9L22 4l6 6-16 16z" fill="#fff" stroke="#16171A" stroke-width="2"/><path d="M19 7l6 6" stroke="#E1262B" stroke-width="3"/><path d="M3 29l3-9 3 6z" fill="#E1262B"/></svg>'], ['cross', 'نيشان', '<svg viewBox="0 0 32 32"><g stroke="#E1262B" stroke-width="2"><path d="M16 2v10M16 20v10M2 16h10M20 16h10"/></g><circle cx="16" cy="16" r="3" fill="none" stroke="#16171A" stroke-width="2"/></svg>'], ['arrow', 'سهم أحمر', '<svg viewBox="0 0 28 28"><path d="M3 2l20 9-8.5 2.5L11 22z" fill="#E1262B" stroke="#fff" stroke-width="2"/></svg>'], ['compass', 'برجل', '<svg viewBox="0 0 32 32"><circle cx="16" cy="6" r="3" fill="#16171A"/><path d="M15 8L6 29M17 8l9 21" stroke="#16171A" stroke-width="2.4" stroke-linecap="round"/><path d="M9 22h14" stroke="#E1262B" stroke-width="2"/></svg>'], ['dot', 'نقطة', '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" fill="#E1262B" stroke="#fff" stroke-width="2"/></svg>']];
const FONTS = { kufi: 'نوتو كوفي + بلكس (الحالي)', cairo: 'Cairo', tajawal: 'Tajawal', almarai: 'Almarai', readex: 'Readex Pro', rubik: 'Rubik' };
const PRESETS = [['#E1262B', '#C9A24B', 'أحمر الشركة'], ['#B91D22', '#D4AF37', 'أحمر غامق'], ['#0F766E', '#C9A24B', 'أخضر'], ['#1D4ED8', '#E0B04B', 'أزرق'], ['#111827', '#C9A24B', 'أسود ودهبي']];

/* ---------- التصميم ---------- */
import { PAGE_BLOCKS } from './data.js';
import { SOUNDS, play, setCfg as sndCfg } from './click.js';
let dsPg = 'all';
const dsTabs = D => `<div class="ds-tabs">${[['all', 'كل الموقع (عام)'], ...Object.keys(PAGE_BLOCKS).map(k => [k, PAGE_BLOCKS[k].t])].map(([k, t]) => `<button data-ds="${k}" class="${k === dsPg ? 'on' : ''} ${k !== 'all' && D.design.pageStyle && D.design.pageStyle[k] ? 'mod' : ''}">${t}</button>`).join('')}</div>`;
function vDesignPage(mp, c) {
  const D = c.D(), g = D.design; g.pageStyle = g.pageStyle || {}; const pg = PAGE_BLOCKS[dsPg];
  const has = !!g.pageStyle[dsPg]; const d = g.pageStyle[dsPg] || { red: g.red || '#E1262B', gold: g.gold || '#C9A24B', font: g.font || 'kufi', fontScale: g.fontScale || 100 };
  const commit = () => { g.pageStyle[dsPg] = d; c.dirty(); };
  mp.innerHTML = `<h2>اللوجو والألوان والخطوط</h2><p class="desc">اختار صفحة علشان تديها ألوان أو خط مختلف عن باقي الموقع. أي صفحة متتعدلش بتاخد الإعدادات العامة. (الصفحات المعدّلة عليها •)</p>${dsTabs(D)}
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><a class="btn btn-ghost sm" href="index.html?preview=1#/${pg.hash}" target="_blank" rel="noopener">👁 معاينة «${pg.t}»</a>${has ? '<button class="btn btn-ghost sm" id="dsReset" style="color:var(--red)">↺ رجّع الصفحة دي للإعدادات العامة</button>' : '<span class="chip">بتاخد الإعدادات العامة دلوقتي</span>'}</div>
  <div class="grid2"><section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px">ألوان «${pg.t}»</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${PRESETS.map(p => `<button class="btn btn-ghost sm" data-pre="${p[0]}|${p[1]}"><i style="width:14px;height:14px;border-radius:50%;background:${p[0]};display:inline-block"></i><i style="width:14px;height:14px;border-radius:50%;background:${p[1]};display:inline-block"></i> ${p[2]}</button>`).join('')}</div>
    <div class="row2"><div class="fld"><label>اللون الأساسي</label><input type="color" id="pRed" value="${c.esc(d.red)}" style="width:56px;height:42px"></div><div class="fld"><label>اللون الدهبي</label><input type="color" id="pGold" value="${c.esc(d.gold)}" style="width:56px;height:42px"></div></div></section>
  <section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px">خط «${pg.t}»</h3><div class="fld"><label>نوع الخط</label><select id="pFont">${Object.keys(FONTS).map(k => `<option value="${k}" ${d.font === k ? 'selected' : ''}>${FONTS[k]}</option>`).join('')}</select></div>
    <div class="fld"><label>حجم الكلام: <b id="pFsV">${d.fontScale}%</b></label><input type="range" min="85" max="125" step="5" value="${d.fontScale}" id="pFs"></div></section></div>`;
  $$('[data-ds]', mp).forEach(b => b.onclick = () => { dsPg = b.dataset.ds; vDesign(mp, c); });
  const rs = $('#dsReset'); if (rs) rs.onclick = () => { delete g.pageStyle[dsPg]; c.dirty(); vDesign(mp, c); };
  $$('[data-pre]', mp).forEach(b => b.onclick = () => { const [r, gg] = b.dataset.pre.split('|'); d.red = r; d.gold = gg; commit(); vDesign(mp, c); });
  $('#pRed').oninput = e => { d.red = e.target.value; commit(); }; $('#pGold').oninput = e => { d.gold = e.target.value; commit(); };
  $('#pFont').onchange = e => { d.font = e.target.value; commit(); };
  $('#pFs').oninput = e => { d.fontScale = +e.target.value; $('#pFsV').textContent = e.target.value + '%'; commit(); };
}
function vDesign(mp, c) {
  if (dsPg !== 'all') return vDesignPage(mp, c);
  const D = c.D(); D.design = Object.assign({ scaleD: 100, scaleM: 100, logo: '', font: 'kufi', logoSize: 100, heroLogo: true, heroLogoSize: 100, fontScale: 100, red: '#E1262B', gold: '#C9A24B', glass: true, cursorGlow: true }, D.design || {});
  const d = D.design; const rng = (k, l, a, b) => `<div class="fld"><label>${l}: <b id="rv-${k}">${d[k]}%</b></label><input type="range" min="${a}" max="${b}" step="5" value="${d[k]}" data-rng="${k}"></div>`;
  const sw = (k, l) => `<label class="switch"><input type="checkbox" data-sw="${k}" ${d[k] !== false ? 'checked' : ''}><span></span> ${l}</label>`;
  mp.innerHTML = `<h2>اللوجو والألوان والخطوط</h2><p class="desc">أي تغيير بيبان على طول في «👁 معاينة». اضغط «حفظ ونشر» علشان يوصل للناس.</p>${dsTabs(D)}
  <div class="grid2"><section class="card" style="display:grid;gap:14px" id="lg"><h3 style="font-size:17px">اللوجو</h3>${c.field('logo', d.logo || '', ['design', 'logo'])}
    <p class="hint" style="color:var(--mut);font-size:12.5px">يفضّل PNG بخلفية شفافة. لو سبته فاضي بيظهر لوجو الشركة الأصلي (المكعب المتحرك).</p>
    ${rng('logoSize', 'حجم اللوجو في الشريط اللي فوق', 60, 160)}${sw('heroLogo', 'إظهار اللوجو الكبير في أول الصفحة')}${rng('heroLogoSize', 'حجم اللوجو الكبير', 50, 180)}</section>
  <section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px">الألوان</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${PRESETS.map(p => `<button class="btn btn-ghost sm" data-pre="${p[0]}|${p[1]}"><i style="width:14px;height:14px;border-radius:50%;background:${p[0]};display:inline-block"></i><i style="width:14px;height:14px;border-radius:50%;background:${p[1]};display:inline-block"></i> ${p[2]}</button>`).join('')}</div>
    <div class="row2">${c.field('red', d.red, ['design', 'red'])}${c.field('gold', d.gold, ['design', 'gold'])}</div>
    <p class="hint" style="color:var(--mut);font-size:12.5px">الأول = اللون الأساسي للأزرار والعناوين. التاني = اللون الدهبي للباقة المميزة والعروض.</p></section>
  <section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px">الخط</h3><div class="fld"><label>نوع الخط</label><select id="fontSel">${Object.keys(FONTS).map(k => `<option value="${k}" ${d.font === k ? 'selected' : ''}>${FONTS[k]}</option>`).join('')}</select></div>
    ${rng('fontScale', 'حجم الكلام في الموقع', 85, 125)}</section>
  <section class="card" style="display:grid;gap:14px"><h3 style="font-size:17px">حجم الموقع للزوار</h3>${sw('glass', 'الكروت الزجاجية')}
    ${rng('scaleD', '🖥 حجم الموقع على الكمبيوتر', 70, 130)}${rng('scaleM', '📱 حجم الموقع على الفون', 80, 120)}
    <p class="hint" style="color:var(--mut);font-size:12.5px">100% = الحجم الطبيعي. اسحب واضغط «👁 معاينة» تشوف الشكل قبل «حفظ ونشر».</p></section></div>`;
  c.bindEditor(mp);
  $$('[data-ds]', mp).forEach(b => b.onclick = () => { dsPg = b.dataset.ds; vDesign(mp, c); });
  $$('[data-rng]', mp).forEach(r => r.oninput = () => { d[r.dataset.rng] = +r.value; $('#rv-' + r.dataset.rng).textContent = r.value + '%'; c.dirty(); });
  $$('[data-sw]', mp).forEach(r => r.onchange = () => { d[r.dataset.sw] = r.checked; c.dirty(); });
  $('#fontSel').onchange = e => { d.font = e.target.value; c.dirty(); };
  $$('[data-cur]', mp).forEach(b => b.onclick = () => { d.cursor = b.dataset.cur; $$('[data-cur]', mp).forEach(x => x.classList.toggle('on', x === b)); c.dirty(); });
  $$('[data-ic]', mp).forEach(b => b.onclick = () => { d.cursorIcon = b.dataset.ic; $$('[data-ic]', mp).forEach(x => x.classList.toggle('on', x === b)); c.dirty(); });
  $$('[data-pre]', mp).forEach(b => b.onclick = () => { const [r, g] = b.dataset.pre.split('|'); d.red = r; d.gold = g; c.dirty(); c.rerender(); });
}

/* ---------- الفيديو ---------- */
try { localStorage.removeItem('sh.gh'); } catch (e) { } // v16: مفتاح GitHub القديم بيتمسح من الجهاز
// v16: الرفع من الكمبيوتر على طول (من غير GitHub) — الفيديو بيتقسم أجزاء في siteMedia، والصور بتتضغط
const SPEC = {
  videoSrc: { t: 'video', w: 1280, h: 720, maxMB: 3, dur: [6, 15], lbl: '1280×720 (عرضي 16:9)' },
  videoMobile: { t: 'video', w: 720, h: 1280, maxMB: 2, dur: [6, 15], lbl: '720×1280 (طولي 9:16)' },
  poster: { t: 'img', w: 1280, h: 720, maxKB: 300, lbl: '1280×720' },
  posterMobile: { t: 'img', w: 720, h: 1280, maxKB: 200, lbl: '720×1280' }
};
const vMeta = f => new Promise((res, rej) => { const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.onloadedmetadata = () => res({ w: v.videoWidth, h: v.videoHeight, dur: v.duration, url: v.src }); v.onerror = () => rej(new Error('الفيديو مش مقروء — جرّب MP4 (H.264)')); v.src = URL.createObjectURL(f); });
const iMeta = f => new Promise((res, rej) => { const im = new Image(); im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight, im }); im.onerror = () => rej(new Error('الصورة مش مقروءة')); im.src = URL.createObjectURL(f); });
// تصغير الفيديو جوه المتصفح: 720p، من غير صوت، أقصى 15 ثانية (MP4 لو المتصفح بيدعم، زي كروم وإيدج)
async function shrinkVideo(f, sp, onp) {
  const mime = ['video/mp4;codecs=avc1.42E01E', 'video/mp4;codecs=avc1', 'video/mp4'].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t));
  if (!mime) throw new Error('المتصفح ده مش بيصغّر الفيديو — افتح لوحة التحكم من كروم أو إيدج، أو صغّره ببريمير (H.264، ' + sp.lbl + '، 2 ميجابت)');
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.src = URL.createObjectURL(f); await new Promise(r => v.onloadeddata = r);
  const dur = Math.min(sp.dur[1], v.duration || sp.dur[1]), cv = document.createElement('canvas'); cv.width = sp.w; cv.height = sp.h; const g = cv.getContext('2d');
  const sc = Math.max(sp.w / v.videoWidth, sp.h / v.videoHeight), dw = v.videoWidth * sc, dh = v.videoHeight * sc;
  const st = cv.captureStream(30), rec = new MediaRecorder(st, { mimeType: mime, videoBitsPerSecond: Math.round(sp.maxMB * 8e6 * .85 / dur) }), ch = [];
  rec.ondataavailable = e => e.data.size && ch.push(e.data);
  const done = new Promise(r => rec.onstop = r); rec.start(500); v.currentTime = 0; await v.play();
  await new Promise(r => { const tick = () => { g.drawImage(v, (sp.w - dw) / 2, (sp.h - dh) / 2, dw, dh); onp(`جارٍ التصغير… ${Math.min(100, Math.round(v.currentTime / dur * 100))}%`); if (v.currentTime >= dur || v.ended) return r(); requestAnimationFrame(tick); }; tick(); });
  v.pause(); rec.stop(); await done; return new File([new Blob(ch, { type: 'video/mp4' })], 'hero.mp4', { type: 'video/mp4' });
}
const imgFit = (im, w, h, maxKB) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); const sc = Math.max(w / im.naturalWidth, h / im.naturalHeight); g.drawImage(im, (w - im.naturalWidth * sc) / 2, (h - im.naturalHeight * sc) / 2, im.naturalWidth * sc, im.naturalHeight * sc);
  let q = .85, d = cv.toDataURL('image/jpeg', q); while (d.length * .75 > maxKB * 1024 && q > .4) { q -= .07; d = cv.toDataURL('image/jpeg', q); } return d; };
const b64 = buf => { let s = '', u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
async function putVideo(c, file, meta, onp) {
  const F = c.F, db = c.db, buf = await file.arrayBuffer(), CH = 700000, n = Math.ceil(buf.byteLength / CH);
  const ref = F.doc(F.collection(db, 'siteMedia'));
  for (let i = 0; i < n; i++) { onp(`جارٍ الرفع… ${Math.round(i / n * 100)}%`); await F.setDoc(F.doc(db, 'siteMedia', ref.id + '_' + i), { data: b64(buf.slice(i * CH, (i + 1) * CH)), at: F.serverTimestamp(), part: i }); }
  await F.setDoc(ref, { data: '', kind: 'video', type: file.type || 'video/mp4', n, size: buf.byteLength, w: meta.w, h: meta.h, dur: Math.round(meta.dur * 10) / 10, at: F.serverTimestamp(), by: c.me().uid });
  return 'v:' + ref.id;
}
async function dropVideo(c, val) { if (!/^v:/.test(val || '')) return; const F = c.F, id = val.slice(2); try { const m = await F.getDoc(F.doc(c.db, 'siteMedia', id)); const n = m.exists() ? m.data().n || 0 : 0; for (let i = 0; i < n; i++) await F.deleteDoc(F.doc(c.db, 'siteMedia', id + '_' + i)); await F.deleteDoc(F.doc(c.db, 'siteMedia', id)); } catch (e) { } }
function vVideo(mp, c) {
  const D = c.D(), h = D.hero; if (h.videoMobile === undefined) h.videoMobile = ''; if (h.posterMobile === undefined) h.posterMobile = '';
  const ok = (b, t) => `<span class="${b ? 'ok' : 'no'}">${b ? '✓' : '✗'} ${t}</span>`;
  const slot = (k, label, note) => { const sp = SPEC[k]; return `<section class="card up-slot" style="display:grid;gap:12px"><h3 style="font-size:17px">${label}</h3>
    ${sp.t === 'video' ? `<video muted loop playsinline controls style="width:100%;max-height:280px;border-radius:14px;background:#000;display:none" id="pv-${k}"></video>` : `<img id="pv-${k}" alt="" style="width:100%;max-height:220px;object-fit:contain;border-radius:14px;background:#111;display:none">`}
    <div class="spec"><b>المسموح:</b> ${sp.lbl}${sp.t === 'video' ? ` · ${sp.dur[0]}–${sp.dur[1]} ثانية · أقصى ${sp.maxMB} ميجا · MP4 من غير صوت` : ` · JPG أقصى ${sp.maxKB} كيلو`}</div>
    <p class="hint" style="color:var(--mut);font-size:12.5px">${note}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn-red sm" style="cursor:pointer">⬆ اختار من الكمبيوتر<input type="file" accept="${sp.t === 'video' ? 'video/*' : 'image/*'}" hidden data-up="${k}"></label>${h[k] ? `<button type="button" class="btn btn-ghost sm" data-rm="${k}" style="color:var(--red)">إزالة</button>` : ''}</div>
    <div class="chk" id="ck-${k}"></div><p class="hint" id="st-${k}" style="font-weight:700"></p></section>`; };
  mp.innerHTML = `<h2>فيديو الواجهة</h2><p class="desc">اختار الفيديو أو الصورة من الكمبيوتر وبيترفعوا على طول. لو الملف أكبر من المسموح بيتظبط لوحده. بعدها اضغط «حفظ ونشر».</p>
  <div class="grid2">${slot('videoSrc', '🖥 فيديو الكمبيوتر', 'ده اللي بيظهر على الكمبيوتر، وعلى الفون لو مفيش فيديو طولي.')}${slot('videoMobile', '📱 فيديو الفون (اختياري)', 'لو موجود بيظهر على الفون بدل العرضي.')}${slot('poster', '🖼 صورة الغلاف', 'بتظهر لحد ما الفيديو يحمّل.')}${slot('posterMobile', '🖼 غلاف الفون (اختياري)', 'لو مش موجود بيظهر غلاف الكمبيوتر.')}</div>
  <label class="switch" style="margin-top:14px"><input type="checkbox" id="vOn" ${h.video ? 'checked' : ''}><span></span> تشغيل الفيديو في الواجهة (لو مقفول بتظهر صورة الغلاف بس)</label>
  <p class="hint" style="margin-top:8px;color:var(--mut)">الفيديو بيتحفظ على جهاز الزائر بعد أول مرة، فالمرات اللي بعدها بيفتح على طول.</p>`;
  $('#vOn').onchange = e => { h.video = e.target.checked; c.dirty(); };
  // المعاينة الحالية
  Object.keys(SPEC).forEach(async k => { const el = $('#pv-' + k), val = h[k]; if (!el || !val) return;
    try { if (/^v:/.test(val)) { const F = c.F, id = val.slice(2), m = await F.getDoc(F.doc(c.db, 'siteMedia', id)); const { n, type } = m.data(); const parts = await Promise.all(Array.from({ length: n }, (_, i) => F.getDoc(F.doc(c.db, 'siteMedia', id + '_' + i)).then(d => d.data().data))); el.src = URL.createObjectURL(new Blob(parts.map(b => Uint8Array.from(atob(b), x => x.charCodeAt(0))), { type })); }
      else el.src = /^m:/.test(val) ? await c.mediaURL(val) : val.split('?')[0]; el.style.display = ''; } catch (e) { } });
  $$('[data-rm]', mp).forEach(b => b.onclick = async () => { const k = b.dataset.rm; if (!confirm('تشيل الملف ده؟')) return; await dropVideo(c, h[k]); h[k] = ''; c.dirty(); vVideo(mp, c); });
  $$('[data-up]', mp).forEach(inp => inp.onchange = async () => {
    let f = inp.files[0]; inp.value = ''; if (!f) return; const k = inp.dataset.up, sp = SPEC[k], st = $('#st-' + k), ck = $('#ck-' + k), pv = $('#pv-' + k); const onp = x => st.textContent = x;
    try {
      if (sp.t === 'img') {
        const m = await iMeta(f); ck.innerHTML = ok(m.w >= sp.w * .9 && m.h >= sp.h * .9, `المقاس ${m.w}×${m.h}`) + ok(f.size <= sp.maxKB * 1024, `الحجم ${Math.round(f.size / 1024)} كيلو`);
        onp('جارٍ الضغط والرفع…'); const data = imgFit(m.im, sp.w, sp.h, sp.maxKB);
        const r = await c.F.addDoc(c.F.collection(c.db, 'siteMedia'), { data, at: c.F.serverTimestamp(), by: c.me().uid, name: f.name.slice(0, 80) });
        h[k] = 'm:' + r.id; pv.src = data; pv.style.display = ''; c.dirty(); onp(`✓ اترفعت (${Math.round(data.length * .75 / 1024)} كيلو) — اضغط «حفظ ونشر»`); return;
      }
      let m = await vMeta(f); const land = sp.w > sp.h, okRes = Math.min(m.w, m.h) >= 480 && (m.w > m.h) === land, okSize = f.size <= sp.maxMB * 1e6, okDur = m.dur <= sp.dur[1] + .5;
      ck.innerHTML = ok(okRes, `المقاس ${m.w}×${m.h}${(m.w > m.h) !== land ? (land ? ' (لازم عرضي)' : ' (لازم طولي)') : ''}`) + ok(okDur, `المدة ${m.dur.toFixed(1)} ث`) + ok(okSize, `الحجم ${(f.size / 1e6).toFixed(1)} ميجا`);
      if ((m.w > m.h) !== land && !confirm(land ? 'الفيديو ده طولي، والمكان ده للفيديو العرضي. هيتقص من النص. تكمل؟' : 'الفيديو ده عرضي، والمكان ده للفيديو الطولي. هيتقص من النص. تكمل؟')) return;
      if (!okSize || !okDur || Math.max(m.w, m.h) > Math.max(sp.w, sp.h) * 1.6) { f = await shrinkVideo(f, sp, onp); m = await vMeta(f); ck.innerHTML += ok(f.size <= sp.maxMB * 1e6 * 1.1, `بعد التصغير ${(f.size / 1e6).toFixed(1)} ميجا · ${m.w}×${m.h}`); }
      if (f.size > 8e6) throw new Error('الفيديو لسه كبير — قصّره أو صغّره الأول');
      const old = h[k]; h[k] = await putVideo(c, f, m, onp); await dropVideo(c, old); h.video = true; c.dirty();
      pv.src = URL.createObjectURL(f); pv.style.display = ''; pv.play().catch(() => { }); onp('✓ اترفع — اضغط «حفظ ونشر»'); c.toast('اترفع ✓');
    } catch (e) { onp('✗ ' + (e.message || e)); }
  });
}
/* ---------- ترتيب الصفحة الرئيسية ---------- */
function vLayout(mp, c) {
  const D = c.D(); const all = Object.keys(SEC_NAMES); let on = (D.design.sections || c.DEFAULT.design.sections).filter(k => SEC_NAMES[k]);
  if (!on.includes('stats') && !(D.design.hidden || []).includes('stats')) { const gi = on.indexOf('gallery'); on.splice(gi >= 0 ? gi + 1 : 0, 0, 'stats'); }
  const paint = () => {
    const off = all.filter(k => !on.includes(k));
    mp.innerHTML = `<h2>ترتيب الصفحة الرئيسية</h2><p class="desc">رتّب الأقسام بالأسهم، وشيل علامة أي قسم علشان يختفي. الفيديو دايماً أول حاجة.</p>
    <div class="list" id="lay">${on.map((k, i) => `<div class="li" style="cursor:default"><label class="switch" style="flex:1"><input type="checkbox" checked data-k="${k}"><span></span> <b>${i + 1}.</b> ${SEC_NAMES[k]}</label><span class="ops" style="display:flex;gap:4px"><button class="btn btn-ghost sm" data-mv="-1" data-i="${i}" ${i ? '' : 'disabled'}>↑</button><button class="btn btn-ghost sm" data-mv="1" data-i="${i}" ${i < on.length - 1 ? '' : 'disabled'}>↓</button></span></div>`).join('')}
    ${off.map(k => `<div class="li" style="opacity:.55;cursor:default"><label class="switch" style="flex:1"><input type="checkbox" data-k="${k}"><span></span> ${SEC_NAMES[k]} <small>(مخفي)</small></label></div>`).join('')}</div>`;
    $$('[data-mv]', mp).forEach(b => b.onclick = () => { const i = +b.dataset.i, j = i + (+b.dataset.mv); [on[i], on[j]] = [on[j], on[i]]; D.design.sections = [...on]; c.dirty(); paint(); });
    $$('input[data-k]', mp).forEach(x => x.onchange = () => { const k = x.dataset.k; on = x.checked ? [...on, k] : on.filter(y => y !== k); D.design.sections = [...on]; const hd = new Set(D.design.hidden || []); x.checked ? hd.delete(k) : hd.add(k); D.design.hidden = [...hd]; c.dirty(); paint(); });
  };
  paint();
}


/* ---------- الإنجليزي ---------- */
function vEn(mp, c) {
  const D = c.D(); const keys = ['brand', 'hero', 'stats', 'offer', 'services', 'gallery', 'cats', 'projects', 'packages', 'about', 'branches', 'faq', 'prepare', 'cta', 'media', 'contact', 'confidential', 'partners', 'seo'];
  mp.innerHTML = `<h2>النسخة الإنجليزية</h2><p class="desc">النصوص اللي بتظهر لما الزائر يضغط «EN». أي خانة فاضية بتظهر بالعربي.</p><div class="form-grid" id="ed">${keys.filter(k => D.en[k] !== undefined).map(k => { const v = D.en[k]; const inner = (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).map(kk => c.field(kk, v[kk], ['en', k, kk])).join('') : c.field(k, v, ['en', k]); return `<details class="card" style="display:block"><summary style="font-weight:800;cursor:pointer">${k}</summary><div style="display:grid;gap:12px;margin-top:12px">${inner}</div></details>`; }).join('')}</div>`;
  c.bindEditor($('#ed', mp));
}

/* ---------- الإحصائيات ---------- */
const CC = { SA: 'السعودية', AE: 'الإمارات', EG: 'مصر', KW: 'الكويت', QA: 'قطر', BH: 'البحرين', OM: 'عُمان', JO: 'الأردن', IQ: 'العراق', YE: 'اليمن', SD: 'السودان', SY: 'سوريا', LB: 'لبنان', PS: 'فلسطين', MA: 'المغرب', DZ: 'الجزائر', TN: 'تونس', LY: 'ليبيا', TR: 'تركيا', PK: 'باكستان', IN: 'الهند', BD: 'بنجلاديش', PH: 'الفلبين', ID: 'إندونيسيا', US: 'أمريكا', GB: 'بريطانيا', DE: 'ألمانيا', FR: 'فرنسا', NL: 'هولندا', CA: 'كندا', XX: 'غير معروف' };
const AR_RG = (() => { try { return new Intl.DisplayNames(['ar'], { type: 'region' }); } catch (e) { return null; } })();
const ccName = k => CC[k] || (k && k.length === 2 && k !== 'XX' && AR_RG ? (AR_RG.of(k.toUpperCase()) || k) : 'غير معروف');
const flag = cc => cc && cc.length === 2 && cc !== 'XX' ? String.fromCodePoint(...[...cc.toUpperCase()].map(ch => 127397 + ch.charCodeAt(0))) : '🌐';
const SRC = { direct: 'دخول مباشر / رابط', google: 'جوجل', instagram: 'إنستجرام', tiktok: 'تيك توك', snapchat: 'سناب شات', whatsapp: 'واتساب', x: 'إكس', facebook: 'فيسبوك', youtube: 'يوتيوب', search: 'محركات بحث أخرى', other: 'مواقع أخرى' };
const DEV = { iphone: '📱 آيفون', android: '🤖 أندرويد', ipad: '📲 آيباد', desktop: '💻 كمبيوتر' };
const PAGES = { home: 'الرئيسية', services: 'الخدمات', service: 'صفحة خدمة', projects: 'أعمالنا', packages: 'الباقات', about: 'من نحن', contact: 'تواصل معنا', support: 'الدعم الفني', request: 'اطلب خدمة', track: 'تتبع طلب', media: 'السوشيال' };
const EVS = { wa: '💬 ضغط واتساب', call: '📞 ضغط اتصال', bot: '🤖 فتح المساعد', chat: '🧑‍💼 بدأ محادثة مع موظف', 'soc:youtube': 'يوتيوب', 'soc:tiktok': 'تيك توك', 'soc:instagram': 'إنستجرام', 'soc:snapchat': 'سناب شات', 'soc:x': 'إكس' };
const dk = d => new Date(d.getTime() + 3 * 3600e3).toISOString().slice(0, 10);
/* تصفير كل الإحصائيات: بيتطلب باسورد حساب المالك، وبينزّل نسخة احتياطية قبل المسح */
function resetStats(c, done) {
  const F = c.F, u = F.auth.currentUser; if (!u) return;
  if (!c.isOwner()) return c.toast('التصفير للمالك بس', 1);
  const pw = (u.providerData || []).some(p => p.providerId === 'password');
  const box = document.createElement('div'); box.className = 'modal-back'; box.innerHTML = `<div class="card rs-card"><h3>🔒 تصفير كل الإحصائيات</h3><p class="desc" style="margin:6px 0 12px">هيتمسح كل اللي في الصفحة: الزيارات والدول والمدن والأجهزة والمصادر والصفحات والتفاعل، وتبدأ العدّ من الصفر. قبل المسح هتنزل عندك نسخة احتياطية (ملف JSON).</p>${pw ? `<div class="fld"><label>اكتب باسورد حسابك للتأكيد</label><input type="password" id="rsPw" autocomplete="current-password"></div>` : '<p class="hint">هيطلب منك تأكيد الدخول بحساب جوجل.</p>'}<p class="err" id="rsErr" style="color:#c0262b;min-height:18px"></p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost sm" id="rsNo">إلغاء</button><button class="btn btn-red sm" id="rsGo">تصفير الكل</button></div></div>`;
  document.body.appendChild(box); const close = () => box.remove(); $('#rsNo', box).onclick = close; box.onclick = e => { if (e.target === box) close(); };
  const pi = $('#rsPw', box); if (pi) { pi.focus(); pi.onkeydown = e => { if (e.key === 'Enter') $('#rsGo', box).click(); }; }
  $('#rsGo', box).onclick = async () => {
    const b = $('#rsGo', box), er = $('#rsErr', box); er.textContent = ''; b.disabled = true; b.textContent = 'جارٍ التأكد…';
    try {
      if (pw) { const v = pi.value; if (!v) throw { code: 'empty' }; await F.reauthenticateWithCredential(u, F.EmailAuthProvider.credential(u.email, v)); pi.value = ''; }
      else await F.reauthenticateWithPopup(u, new F.GoogleAuthProvider());
    } catch (e) { b.disabled = false; b.textContent = 'تصفير الكل'; er.textContent = e && e.code === 'empty' ? 'اكتب الباسورد' : (/wrong-password|invalid-credential|invalid-login/.test((e && e.code) || '') ? 'الباسورد غلط' : F.authMsg(e)); return; }
    b.textContent = 'جارٍ المسح…';
    try {
      const st = await F.getDocs(F.collection(c.db, 'stats')), pr = await F.getDocs(F.collection(c.db, 'presence'));
      const backup = {}; st.docs.forEach(d => { const x = { ...d.data() }; delete x.upd; backup[d.id] = x; });
      try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' })); a.download = 'shamrani-stats-backup-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); } catch (x) { }
      await Promise.all([...st.docs.map(d => F.deleteDoc(F.doc(c.db, 'stats', d.id))), ...pr.docs.map(d => F.deleteDoc(F.doc(c.db, 'presence', d.id)).catch(() => { }))]);
      await F.setDoc(F.doc(c.db, 'site', 'stats'), { from: '', resetAt: F.serverTimestamp(), at: F.serverTimestamp() });
      close(); c.toast('اتصفّر كل حاجة ✓ — الأرقام هتبدأ من جديد'); done();
    } catch (e) { b.disabled = false; b.textContent = 'تصفير الكل'; er.textContent = F.authMsg(e); }
  };
}
async function vStats(mp, c, days = 30) {
  const F = c.F;
  mp.innerHTML = `<h2>الإحصائيات والزوار</h2><p class="desc">الزوار مجهولين الهوية: بنعرف الدولة والمدينة والجهاز والمصدر بس. زيارات الموظفين مش بتتحسب.</p>
  <div class="seg" id="per" style="margin-bottom:16px">${[[1, 'النهارده'], [7, '٧ أيام'], [30, '٣٠ يوم'], [90, '٣ شهور']].map(([n, l]) => `<button data-n="${n}" class="${n === days ? 'on' : ''}">${l}</button>`).join('')}</div><div id="sv"><p class="empty">جارٍ التحميل…</p></div>`;
  $('#per').onclick = e => { const b = e.target.closest('button'); if (b) vStats(mp, c, +b.dataset.n); };
  // تصفير العدّاد: الأرقام بتبدأ من تاريخ معيّن، والقديمة بتستخبى من غير ما تتمسح
  let from = ''; try { const s = await F.getDoc(F.doc(c.db, 'site', 'stats')); from = s.exists() ? (s.data().from || '') : ''; } catch (e) { }
  $('#per').insertAdjacentHTML('afterend', `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:-6px 0 14px;align-items:center">${from ? `<span class="chip warn">العدّاد متصفّر من ${c.esc(from)}</span><button class="btn btn-ghost sm" id="stUndo">↩ إظهار الأرقام القديمة</button>` : ''}<button class="btn btn-ghost sm" id="stReset" style="color:var(--red)">🔒 تصفير كل الإحصائيات</button></div>`);
  $('#stReset').onclick = () => resetStats(c, () => vStats(mp, c, days));
  const su = $('#stUndo'); if (su) su.onclick = async () => { try { await F.setDoc(F.doc(c.db, 'site', 'stats'), { from: '', at: F.serverTimestamp() }); c.toast('رجعت ✓'); vStats(mp, c, days); } catch (e) { c.toast(F.authMsg(e), 1); } };
  const now = new Date(), keys = []; for (let i = days - 1; i >= 0; i--) { const k = dk(new Date(now.getTime() - i * 864e5)); if (!from || k >= from) keys.push(k); }
  let docs;
  try { docs = await Promise.all(keys.map(k => F.getDoc(F.doc(c.db, 'stats', k)).then(s => s.exists() ? s.data() : {}).catch(() => ({})))); } catch (e) { $('#sv').innerHTML = `<p class="empty">${c.esc(F.authMsg(e))}</p>`; return; }
  let live = '—'; try { const s = await F.getDocs(F.query(F.collection(c.db, 'presence'), F.where('at', '>', F.Timestamp.fromMillis(Date.now() - 150000)))); live = s.size; } catch (e) { }
  const sum = (field) => { const o = {}; docs.forEach(d => { const m = d[field] || {}; for (const k in m) o[k] = (o[k] || 0) + (+m[k] || 0); }); return o; };
  const tot = f => docs.reduce((a, d) => a + (+d[f] || 0), 0);
  const today = docs[docs.length - 1] || {};
  const svcName = id => { const v = c.D().services.find(x => x.id === id); return v ? v.title : id; };
  const bars = (o, name, max = 12) => { const arr = Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, max); const m = arr.length ? arr[0][1] : 1; return arr.length ? arr.map(([k, v]) => `<div class="bar"><span>${name(k)}</span><i style="width:${Math.max(4, v / m * 100)}%"></i><b>${v}</b></div>`).join('') : '<p class="empty" style="padding:14px">لسه مفيش بيانات</p>'; };
  const vis = docs.map(d => +d.visits || 0), mx = Math.max(1, ...vis);
  const ev = sum('ev');
  $('#sv').innerHTML = `<div class="stats4"><div class="card"><b style="color:#1f9d55">${live}</b><span>🟢 موجودين على الموقع دلوقتي</span></div><div class="card"><b>${+today.visits || 0}</b><span>زيارات النهارده</span></div><div class="card"><b>${+today.uniq || 0}</b><span>زوار جدد النهارده</span></div><div class="card"><b>${tot('visits')}</b><span>زيارات الفترة</span></div><div class="card"><b>${tot('views')}</b><span>صفحات اتشافت</span></div><div class="card"><b>${(ev.wa || 0) + (ev.call || 0)}</b><span>ضغطوا واتساب أو اتصال</span></div></div>
  <div class="card" style="margin:16px 0"><h3 style="font-size:16px;margin-bottom:12px">الزيارات باليوم</h3><div class="chart">${vis.map((v, i) => `<div class="col" title="${keys[i]}: ${v}"><i style="height:${v / mx * 100}%"></i>${days <= 31 ? `<small>${keys[i].slice(8)}</small>` : ''}</div>`).join('')}</div></div>
  <div class="grid2"><div class="card"><h3>🌍 الدول</h3>${bars(sum('cc'), k => `${flag(k)} ${ccName(k)}`)}</div><div class="card"><h3>🏙 المدن</h3>${bars(sum('city'), k => k)}</div>
  <div class="card"><h3>🔗 جايين منين</h3>${bars(sum('src'), k => SRC[k] || k)}</div><div class="card"><h3>📱 الأجهزة</h3>${bars(sum('dev'), k => DEV[k] || k)}</div>
  <div class="card"><h3>📄 أكتر الصفحات</h3>${bars(sum('page'), k => PAGES[k] || k)}</div><div class="card"><h3>🛠 أكتر الخدمات اهتماماً</h3>${bars(sum('svc'), svcName)}</div>
  <div class="card"><h3>👆 التفاعل</h3>${bars(ev, k => EVS[k] || k)}</div><div class="card"><h3>🌐 اللغة</h3>${bars(sum('lang'), k => k === 'en' ? 'English' : 'عربي')}</div></div>`;
}

/* ---------- العملاء المحتملين (طلبات + محادثات) ---------- */
async function vLeads(mp, c) {
  const F = c.F, esc = c.esc;
  mp.innerHTML = `<h2>العملاء المحتملين</h2><p class="desc">كل حد ساب اسمه ورقمه: من «اطلب خدمة» أو من المحادثة المباشرة.</p><div class="toolbar"><input id="lq" placeholder="بحث بالاسم أو الجوال" class="in" style="flex:1"><button class="btn btn-ghost sm" id="lx">⬇ تنزيل Excel (CSV)</button></div><div class="list" id="ll"><p class="empty">جارٍ التحميل…</p></div>`;
  $$('.in', mp).forEach(i => i.style.cssText += ';padding:10px 12px;border-radius:12px;border:1.5px solid var(--line)');
  const rows = [];
  try { (await F.getDocs(F.query(F.collection(c.db, 'tickets'), F.orderBy('at', 'desc'), F.limit(300)))).forEach(d => { const x = d.data(); rows.push({ kind: 'طلب خدمة', id: x.code, name: x.name, phone: x.phone, what: x.dept + (x.msg ? ' — ' + x.msg : ''), at: x.at, href: 'portal.html#support' }); }); } catch (e) { }
  try { (await F.getDocs(F.query(F.collection(c.db, 'chats'), F.orderBy('upd', 'desc'), F.limit(300)))).forEach(d => { const x = d.data(); const last = (x.msgs || []).filter(m => m.from === 'c').slice(-1)[0]; rows.push({ kind: 'محادثة', id: x.id, name: x.name, phone: x.phone, what: last ? last.text : '', at: x.upd || x.at, href: 'portal.html#chats' }); }); } catch (e) { }
  rows.sort((a, b) => ((b.at && b.at.seconds) || 0) - ((a.at && a.at.seconds) || 0));
  const waL = p => 'https://wa.me/966' + String(p || '').replace(/^0/, '').replace(/^966/, '');
  const paint = () => { const q = $('#lq').value.trim(); const L = rows.filter(r => !q || (r.name + r.phone).includes(q));
    $('#ll').innerHTML = L.length ? L.map(r => `<div class="li"><div class="main"><b>${esc(r.name)} <span class="chip" style="display:inline-flex">${r.kind}</span></b><span>${esc((r.what || '').slice(0, 90))} — ${r.at && r.at.toDate ? r.at.toDate().toLocaleString('ar-SA') : ''}</span></div><a class="btn btn-ghost sm" href="tel:${esc(r.phone)}" dir="ltr">${esc(r.phone)}</a><a class="btn btn-ok sm" target="_blank" rel="noopener" href="${waL(r.phone)}">واتساب</a><a class="btn btn-ghost sm" href="${r.href}">فتح</a></div>`).join('') : '<p class="empty">لسه مفيش عملاء محتملين</p>'; };
  $('#lq').oninput = paint; paint();
  $('#lx').onclick = () => { const csv = '﻿' + [['النوع', 'الاسم', 'الجوال', 'الطلب', 'التاريخ']].concat(rows.map(r => [r.kind, r.name, r.phone, (r.what || '').replace(/\n/g, ' '), r.at && r.at.toDate ? r.at.toDate().toLocaleString('en-GB') : ''])).map(a => a.map(x => '"' + String(x || '').replace(/"/g, '""') + '"').join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'leads-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); };
}

function vSound(mp, c) {
  const D = c.D(); D.sound = Object.assign({ s: 'mouse', v: 0.7, site: true, app: true }, D.sound || {}); const o = D.sound;
  const upd = () => { c.dirty(); sndCfg(o); };
  mp.innerHTML = `<h2>الأصوات</h2><p class="desc">صوت الضغط على الأزرار في الموقع والبوابة والتطبيق. اضغط ▶ تسمع، واختار الصوت، وبعدين «حفظ ونشر» — بيتطبق على كل الزوار والموظفين.</p>
  <div class="card" style="display:grid;gap:14px">
    <label class="switch"><input type="checkbox" id="sdSite" ${o.site !== false ? 'checked' : ''}><span></span> صوت الضغط في <b>الموقع</b></label>
    <label class="switch"><input type="checkbox" id="sdApp" ${o.app !== false ? 'checked' : ''}><span></span> صوت الضغط في <b>البوابة والتطبيق ولوحة التحكم</b></label>
    <div class="fld"><label>علو الصوت: <b id="sdVv">${Math.round(o.v * 100)}%</b></label><input type="range" id="sdV" min="0.1" max="1.5" step="0.05" value="${o.v}" data-nosnd></div>
  </div>
  <div class="snd-grid" data-nosnd>${Object.entries(SOUNDS).map(([k, x]) => `<div class="snd-card ${o.s === k ? 'on' : ''}" data-k="${k}"><button type="button" class="snd-play" data-p="${k}" aria-label="اسمع">▶</button><b>${x.ar}</b><button type="button" class="btn sm ${o.s === k ? 'btn-red' : 'btn-ghost'}" data-pick="${k}">${o.s === k ? '✓ المختار' : 'اختار'}</button></div>`).join('')}</div>
  <p class="hint">أي زائر يقدر يكتم الصوت عنده من زرار الكتم، ده مش بيأثر على الباقيين.</p>`;
  mp.onclick = e => { const p = e.target.closest('[data-p]'); if (p) { play(p.dataset.p, o.v); return; } const k = e.target.closest('[data-pick]'); if (k) { o.s = k.dataset.pick; upd(); play(o.s, o.v); vSound(mp, c); c.toast('اتختار — اضغط حفظ ونشر'); } };
  $('#sdSite').onchange = e => { o.site = e.target.checked; upd(); };
  $('#sdApp').onchange = e => { o.app = e.target.checked; upd(); };
  $('#sdV').oninput = e => { o.v = +e.target.value; $('#sdVv').textContent = Math.round(o.v * 100) + '%'; };
  $('#sdV').onchange = () => { upd(); play(o.s, o.v); };
}
export const VIEWS = { sound: vSound, design: vDesign, video: vVideo, layout: vLayout, en: vEn, stats: (mp, c) => vStats(mp, c), leads: vLeads };
