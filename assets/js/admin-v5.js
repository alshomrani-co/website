// لوحة التحكم v5: المُلّاك، الصفحات (ترتيب/إخفاء/خط/أيقونات لكل صفحة)، قص الصور
import { PAGE_BLOCKS } from './data.js';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- المُلّاك ---------- */
export async function vOwners(mp, c) {
  const F = c.F, db = c.db, esc = c.esc, me = c.me();
  if (!c.isOwner()) { mp.innerHTML = '<p class="empty">الصفحة دي للمالك بس.</p>'; return; }
  mp.innerHTML = `<h2>المُلّاك</h2><p class="desc">المالك بيشوف ويعدّل كل حاجة: الموقع، الموظفين، الإشراف، البصمة. تقدر تضيف مالك جديد أو تشيل مالك — من غير ما تدي حد إيميلك أو كلمة السر بتاعتك.</p>
  <div class="card" style="display:grid;gap:8px;margin-bottom:14px"><b>الـ UID بتاعك</b><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><code dir="ltr" style="background:var(--paper2);padding:8px 12px;border-radius:10px;font-weight:700">${esc(me.uid)}</code><button class="btn btn-ghost sm" id="cpU">نسخ</button></div></div>
  <div class="card" style="display:grid;gap:10px;border:2px solid var(--red)"><h3 style="font-size:18px">➕ إضافة مالك</h3>
    <p class="hint" style="color:var(--mut);font-size:13px">١) الشخص يعمل حساب الأول (موظف من البوابة، أو أي حساب في Firebase ← Authentication ← Add user).<br>٢) اختاره من القايمة، أو الزق الـ UID بتاعه (من Firebase ← Authentication).</p>
    <div class="row2"><select id="oEmp" class="in"><option value="">— اختار من الموظفين —</option></select><input id="oUid" class="in" dir="ltr" placeholder="أو الزق UID هنا"></div>
    <input id="oName" class="in" placeholder="اسم المالك (للعرض)"><button class="btn btn-red sm" id="oAdd" style="justify-self:start">إضافة كمالك</button></div>
  <h3 style="margin:20px 0 10px;font-size:18px">المُلّاك الحاليين</h3><div class="list" id="oL"><p class="empty">جارٍ التحميل…</p></div>
  <p class="hint" style="color:var(--mut);font-size:12.5px;margin-top:10px">⚠️ لازم يفضل مالك واحد على الأقل. لو بتنقل الملكية: ضيف المالك الجديد الأول، وهو يدخل ويتأكد، وبعدين شيل نفسك.</p>`;
  $$('.in', mp).forEach(i => i.style.cssText += ';padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--paper);width:100%');
  $('#cpU').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(me.uid); c.toast('اتنسخ ✓'); };
  let emps = []; try { emps = (await F.getDocs(F.collection(db, 'employees'))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { }
  $('#oEmp').innerHTML += emps.map(e => `<option value="${esc(e.id)}">${esc(e.name)} · ${esc(e.num || '')}</option>`).join('');
  $('#oEmp').onchange = e => { const x = emps.find(y => y.id === e.target.value); if (x) { $('#oUid').value = x.id; $('#oName').value = x.name || ''; } };
  const load = async () => {
    const L = [];
    F.OWNER_UIDS.forEach(u => L.push({ uid: u, name: 'المالك الأساسي', base: true }));
    let off = new Set(); try { (await F.getDocs(F.collection(db, 'ownersOff'))).docs.forEach(d => off.add(d.id)); } catch (e) { }
    try { (await F.getDocs(F.collection(db, 'owners'))).docs.forEach(d => { const x = L.find(y => y.uid === d.id); if (x) { x.added = true; x.name = d.data().name || x.name; } else L.push({ uid: d.id, name: d.data().name || '', added: true }); }); } catch (e) { $('#oL').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
    L.forEach(x => { x.active = x.added || (x.base && !off.has(x.uid)); const em = emps.find(e => e.id === x.uid); if (em && (!x.name || x.base)) x.name = em.name + (x.base ? ' (الأساسي)' : ''); });
    const act = L.filter(x => x.active);
    $('#oL').innerHTML = L.map(x => `<div class="li" style="cursor:default"><div class="main"><b>${esc(x.name || 'بدون اسم')} ${x.uid === me.uid ? '<span class="chip">أنت</span>' : ''}</b><span dir="ltr" style="font-size:12px">${esc(x.uid)}</span></div>${x.active ? '<span class="chip ok">مالك</span>' : '<span class="chip red">موقوف</span>'}
      ${x.active ? `<button class="btn btn-ghost sm" data-rm="${esc(x.uid)}" ${act.length < 2 ? 'disabled title="لازم يفضل مالك واحد"' : ''} style="color:var(--red)">إلغاء الملكية</button>` : `<button class="btn btn-ghost sm" data-on="${esc(x.uid)}">إرجاع</button>`}</div>`).join('');
    $$('[data-rm]', mp).forEach(b => b.onclick = async () => {
      const u = b.dataset.rm, x = L.find(y => y.uid === u);
      if (!confirm(`إلغاء ملكية «${x.name || u}»؟${u === me.uid ? '\n\n⚠️ ده إنت — هتخرج من صلاحيات المالك فوراً.' : ''}`)) return;
      try { if (x.added) await F.deleteDoc(F.doc(db, 'owners', u)); if (x.base) await F.setDoc(F.doc(db, 'ownersOff', u), { at: F.serverTimestamp(), by: me.uid }); c.toast('اتلغت ✓'); if (u === me.uid) location.href = 'portal.html'; else load(); } catch (e) { c.toast(F.authMsg(e), 1); }
    });
    $$('[data-on]', mp).forEach(b => b.onclick = async () => { try { await F.deleteDoc(F.doc(db, 'ownersOff', b.dataset.on)); c.toast('رجع مالك ✓'); load(); } catch (e) { c.toast(F.authMsg(e), 1); } });
  };
  $('#oAdd').onclick = async () => {
    const u = $('#oUid').value.trim(), n = $('#oName').value.trim();
    if (!/^[A-Za-z0-9]{20,40}$/.test(u)) return c.toast('الـ UID مش صحيح', 1);
    if (!confirm(`تدي «${n || u}» صلاحيات المالك الكاملة؟`)) return;
    try { await F.setDoc(F.doc(db, 'owners', u), { name: n.slice(0, 60), at: F.serverTimestamp(), by: me.uid }); try { await F.deleteDoc(F.doc(db, 'ownersOff', u)); } catch (e) { } c.toast('اتضاف مالك ✓'); $('#oUid').value = ''; $('#oName').value = ''; load(); } catch (e) { c.toast(F.authMsg(e), 1); }
  };
  load();
}

/* ---------- الصفحات ---------- */
const EDIT = { hero: 'hero', offer: 'offer', strip: 'services', gallery: 'projects', stats: 'hero', services: 'services', steps: 'about', packages: 'packages', social: 'social', why: 'about', partners: 'about', faq: 'faq', cta: 'cta', head: '', grid: 'services', body: 'services', list: 'projects', story: 'about', licenses: 'about', branches: 'branches', isic: 'about', quote: 'about', cards: 'brand', form: '' };
let curPg = 'home';
export function vPages(mp, c) {
  const D = c.D(); D.design.pages = D.design.pages || {}; const esc = c.esc;
  const HOME = Object.keys(PAGE_BLOCKS.home.blocks).filter(k => k !== 'hero');
  const paint = () => {
    const pg = PAGE_BLOCKS[curPg], cfg = D.design.pages[curPg] = D.design.pages[curPg] || {};
    cfg.fs = cfg.fs || {}; cfg.ic = cfg.ic || {}; cfg.hidden = cfg.hidden || [];
    let order, hidden;
    if (curPg === 'home') {
      let on = (D.design.sections || c.DEFAULT.design.sections).filter(k => HOME.includes(k));
      if (!on.includes('stats') && !(D.design.hidden || []).includes('stats')) { const gi = on.indexOf('gallery'); on.splice(gi >= 0 ? gi + 1 : 0, 0, 'stats'); }
      order = ['hero', ...on, ...HOME.filter(k => !on.includes(k))]; hidden = new Set([...HOME.filter(k => !on.includes(k)), ...cfg.hidden.filter(k => k === 'hero')]);
    } else {
      const all = Object.keys(pg.blocks); order = (cfg.order && cfg.order.length ? cfg.order.filter(k => all.includes(k)) : []); all.forEach(k => { if (!order.includes(k)) order.push(k); }); hidden = new Set(cfg.hidden);
    }
    mp.innerHTML = `<h2>الصفحات</h2><p class="desc">اختار الصفحة، وبعدين لكل جزء: 👁 إظهار/إخفاء، ↑↓ ترتيب، حجم الخط، حجم الأيقونات، و✎ تعديل المحتوى بتاعه.</p>
    <div class="pg-tabs">${Object.keys(PAGE_BLOCKS).map(k => `<button data-pg="${k}" class="${k === curPg ? 'on' : ''}">${esc(PAGE_BLOCKS[k].t)}</button>`).join('')}</div>
    <div style="display:flex;gap:8px;margin:10px 0 14px;flex-wrap:wrap"><a class="btn btn-ghost sm" href="index.html?preview=1#/${pg.hash}" target="_blank" rel="noopener">👁 فتح الصفحة (معاينة)</a><button class="btn btn-ghost sm" id="pgReset">↺ رجّع الصفحة دي للأصل</button></div>
    <div class="list pg-list">${order.map((k, i) => { const off = hidden.has(k), fixed = k === 'hero' || (curPg !== 'home' && k === 'head' && i === 0 && false), fs = cfg.fs[k] || 100, ic = cfg.ic[k] || 100; const canMove = !(curPg === 'home' && k === 'hero');
      return `<div class="pg-row card ${off ? 'off' : ''}" data-k="${k}"><div class="pg-top"><button class="eye ${off ? 'off' : ''}" data-eye="${k}" title="${off ? 'إظهار' : 'إخفاء'}">${off ? '🙈' : '👁'}</button><b>${i + 1}. ${esc(pg.blocks[k] || k)}</b>${off ? '<small class="chip red">مخفي</small>' : ''}
        <span class="ops">${canMove ? `<button class="btn btn-ghost sm" data-mv="-1" data-i="${i}" ${i > (curPg === 'home' ? 1 : 0) ? '' : 'disabled'}>↑</button><button class="btn btn-ghost sm" data-mv="1" data-i="${i}" ${i < order.length - 1 ? '' : 'disabled'}>↓</button>` : ''}${EDIT[k] ? `<a class="btn btn-ghost sm" href="#${EDIT[k]}">✎ تعديل</a>` : ''}</span></div>
        <div class="pg-sl"><label>حجم الخط <b>${fs}%</b><input type="range" min="70" max="160" step="5" value="${fs}" data-fs="${k}"></label><label>حجم الأيقونات <b>${ic}%</b><input type="range" min="50" max="200" step="10" value="${ic}" data-ic="${k}"></label></div></div>`; }).join('')}</div>`;
    $$('[data-pg]', mp).forEach(b => b.onclick = () => { curPg = b.dataset.pg; paint(); });
    $('#pgReset').onclick = () => { if (!confirm('ترجّع ترتيب وأحجام الصفحة دي للأصل؟')) return; delete D.design.pages[curPg]; if (curPg === 'home') { D.design.sections = c.clone(c.DEFAULT.design.sections); D.design.hidden = []; } c.dirty(); paint(); };
    $$('[data-eye]', mp).forEach(b => b.onclick = () => {
      const k = b.dataset.eye;
      if (curPg === 'home' && k !== 'hero') { let on = order.filter(x => x !== 'hero' && !hidden.has(x)); const hd = new Set(D.design.hidden || []); if (on.includes(k)) { on = on.filter(x => x !== k); hd.add(k); } else { on = order.filter(x => x !== 'hero' && (!hidden.has(x) || x === k)); hd.delete(k); } D.design.sections = on; D.design.hidden = [...hd]; }
      else { const s = new Set(cfg.hidden); s.has(k) ? s.delete(k) : s.add(k); cfg.hidden = [...s]; }
      c.dirty(); paint();
    });
    $$('[data-mv]', mp).forEach(b => b.onclick = () => { const i = +b.dataset.i, j = i + (+b.dataset.mv); [order[i], order[j]] = [order[j], order[i]]; if (curPg === 'home') D.design.sections = order.filter(x => x !== 'hero' && !hidden.has(x)); else cfg.order = [...order]; c.dirty(); paint(); });
    $$('[data-fs],[data-ic]', mp).forEach(r => r.oninput = () => { const k = r.dataset.fs || r.dataset.ic, m = r.dataset.fs ? cfg.fs : cfg.ic; m[k] = +r.value; if (m[k] === 100) delete m[k]; r.previousElementSibling ? 0 : 0; r.parentElement.querySelector('b').textContent = r.value + '%'; c.dirty(); });
  };
  paint();
}

/* ---------- قص الصورة وتحريكها (قبل الرفع أو بعده) ---------- */
// نسبة الإطار حسب مكان الصورة في الموقع
export function aspectFor(p) {
  const k = p[0], last = p[p.length - 1];
  if (k === 'gallery') return [3, 4, 'صورة المعرض (طولية 3:4)'];
  if (k === 'services') return [4, 3, 'صورة الخدمة (4:3)'];
  if (k === 'projects') return [16, 9, 'صورة المشروع (16:9)'];
  if (k === 'hero' && last === 'poster') return [16, 9, 'غلاف الفيديو (16:9)'];
  if (k === 'offer' || k === 'popup') return [16, 9, 'صورة العرض (16:9)'];
  if (k === 'design') return [0, 0, 'اللوجو (حر)'];
  return [0, 0, 'حر'];
}
export function cropper(srcUrl, aspect) {
  return new Promise(resolve => {
    const [aw, ah, label] = aspect; let ratio = aw && ah ? aw / ah : 0;
    const sh = document.createElement('div'); sh.className = 'crop-sheet';
    sh.innerHTML = `<div class="crop-box"><div class="crop-h"><b>✂ قص وتحريك الصورة</b><small>${label}</small><button class="x" type="button">×</button></div>
      <div class="crop-ratios">${[['حر', 0], ['المقاس المناسب', ratio || 0], ['1:1', 1], ['4:3', 4 / 3], ['3:4', 3 / 4], ['16:9', 16 / 9]].filter((x, i, a) => i < 2 || x[1] !== a[1][1]).map((x, i) => `<button type="button" data-r="${x[1]}" class="${(i === 1 && ratio) || (i === 0 && !ratio) ? 'on' : ''}">${x[0]}</button>`).join('')}</div>
      <div class="crop-stage"><div class="crop-frame"><img alt="" draggable="false"></div></div>
      <div class="crop-ctl"><span>🔍</span><input type="range" min="100" max="400" value="100" id="cz"><button type="button" class="btn btn-ghost sm" id="cRot">⟳ لف</button></div>
      <p class="hint">اسحب الصورة بصباعك أو بالماوس علشان تظبط مكانها جوه الإطار، وكبّر أو صغّر من الشريط.</p>
      <div class="crop-act"><button type="button" class="btn btn-ghost" id="cCancel">إلغاء</button><button type="button" class="btn btn-red" id="cOk">✓ تمام</button></div></div>`;
    document.body.appendChild(sh);
    const frame = $('.crop-frame', sh), im = $('img', sh), stage = $('.crop-stage', sh);
    let nw = 1, nh = 1, z = 1, ox = 0, oy = 0, rot = 0, base = 1;
    const fw = () => frame.clientWidth, fh = () => frame.clientHeight;
    const dims = () => rot % 180 ? [nh, nw] : [nw, nh];
    const fit = () => {
      const sw = stage.clientWidth - 20, shh = Math.min(innerHeight * .55, 520);
      let r = ratio || dims()[0] / dims()[1]; let w = sw, h = w / r; if (h > shh) { h = shh; w = h * r; }
      frame.style.width = w + 'px'; frame.style.height = h + 'px';
      const [dw, dh] = dims(); base = Math.max(w / dw, h / dh); clamp(); draw();
    };
    const clamp = () => { const [dw, dh] = dims(); const s = base * z, mx = Math.max(0, (dw * s - fw()) / 2), my = Math.max(0, (dh * s - fh()) / 2); ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)); };
    const draw = () => { const s = base * z; im.style.width = nw * s + 'px'; im.style.height = nh * s + 'px'; im.style.transform = `translate(-50%,-50%) translate(${ox}px,${oy}px) rotate(${rot}deg)`; };
    im.onload = () => { nw = im.naturalWidth; nh = im.naturalHeight; fit(); };
    im.onerror = () => { alert('الصورة دي مش هينفع تتقص هنا'); done(null); };
    im.crossOrigin = 'anonymous'; im.src = srcUrl;
    let drag = null;
    frame.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; frame.setPointerCapture(e.pointerId); });
    frame.addEventListener('pointermove', e => { if (!drag) return; ox = drag.ox + e.clientX - drag.x; oy = drag.oy + e.clientY - drag.y; clamp(); draw(); });
    frame.addEventListener('pointerup', () => drag = null);
    frame.addEventListener('wheel', e => { e.preventDefault(); z = Math.max(1, Math.min(4, z * (e.deltaY < 0 ? 1.06 : .94))); $('#cz', sh).value = z * 100; clamp(); draw(); }, { passive: false });
    $('#cz', sh).oninput = e => { z = e.target.value / 100; clamp(); draw(); };
    $('#cRot', sh).onclick = () => { rot = (rot + 90) % 360; fit(); };
    $$('[data-r]', sh).forEach(b => b.onclick = () => { ratio = +b.dataset.r; $$('[data-r]', sh).forEach(x => x.classList.toggle('on', x === b)); fit(); });
    const done = v => { sh.remove(); removeEventListener('resize', fit); resolve(v); };
    addEventListener('resize', fit);
    $('.x', sh).onclick = $('#cCancel', sh).onclick = () => done(null);
    $('#cOk', sh).onclick = () => {
      const s = base * z, W = fw(), H = fh(); const out = Math.min(1800, Math.round(W / s * 1)) ; // بكسلات أصلية جوه الإطار
      const k = Math.min(1, 1800 / (W / s), 1800 / (H / s)); const cw = Math.round(W / s * k), ch = Math.round(H / s * k);
      const cv = document.createElement('canvas'); cv.width = Math.max(1, cw); cv.height = Math.max(1, ch); const g = cv.getContext('2d');
      g.fillStyle = '#fff'; if (!/png|webp/i.test(srcUrl.slice(0, 30))) g.fillRect(0, 0, cv.width, cv.height);
      const sc = cv.width / W; g.translate(cv.width / 2 + ox * sc, cv.height / 2 + oy * sc); g.rotate(rot * Math.PI / 180); const d = s * sc; g.drawImage(im, -nw * d / 2, -nh * d / 2, nw * d, nh * d);
      cv.toBlob(b => done(b ? new File([b], 'crop.webp', { type: b.type }) : null), 'image/webp', .86); void out;
    };
  });
}
