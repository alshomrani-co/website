// الإشراف v5: ربط حساب العميل بملفه، ملفات المشروع (لينكات جوجل درايف)، وتعليقات العميل والرد عليها
import * as F from './fb.js';
const { db } = F;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const fmt = ts => { const d = ts && ts.toDate ? ts.toDate() : (ts ? new Date(ts) : null); return d ? d.toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' }) : ''; };
const ms = x => (x && x.toMillis ? x.toMillis() : (+x || 0));
export const CATS = { arch: '🏛 المخططات المعمارية', struct: '🧱 المخططات الإنشائية', mep: '⚡ الكهروميكانيك', survey: '📐 المساحة', safety: '🧯 السلامة والدفاع المدني', '3d': '🧊 تصاميم 3D', docs: '📄 الرخص والمستندات' };
const norm = s => F.toEn(String(s || '')).replace(/\D/g, '').replace(/^966/, '0');

/* الصفحة الرئيسية للإشراف: حسابات مستنية ربط + تعليقات جديدة */
export async function homeExtras(host, toast) {
  host.insertAdjacentHTML('beforeend', `<div class="grid2" style="margin-top:18px"><div class="card cx"><h3>👤 حسابات عملاء مستنية ربط <span class="chip" id="pc">…</span></h3><div id="pend"><p class="empty">جارٍ التحميل…</p></div></div><div class="card cx"><h3>💬 تعليقات العملاء الجديدة <span class="chip red" id="cc">…</span></h3><div id="ncm"><p class="empty">جارٍ التحميل…</p></div></div></div>`);
  try {
    const s = await F.getDocs(F.query(F.collection(db, 'customers'), F.where('clientNo', '==', null)));
    const L = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ms(b.at) - ms(a.at));
    $('#pc').textContent = L.length;
    $('#pend').innerHTML = L.length ? L.map(c => `<div class="li"><div class="main"><b>${esc(c.name || 'بدون اسم')} <small style="color:var(--mut)">· كود ${esc(c.id.slice(0, 6).toUpperCase())}</small></b><span dir="ltr" style="text-align:right">${esc(c.email || '')} ${c.phone ? '· ' + esc(c.phone) : ''}</span></div><a class="btn btn-ghost sm" href="#search" data-find="${esc(c.phone || c.name || '')}">ابحث عن ملفه</a></div>`).join('') : '<p class="empty" style="padding:10px">مفيش حسابات مستنية</p>';
    $$('[data-find]', host).forEach(a => a.onclick = () => { try { sessionStorage.setItem('sh.find', a.dataset.find); } catch (e) { } });
  } catch (e) { $('#pend').innerHTML = `<p class="empty" style="padding:10px">${esc(F.authMsg(e))}</p>`; $('#pc').textContent = '—'; }
  try {
    const s = await F.getDocs(F.query(F.collection(db, 'ccomments'), F.where('seen', '==', false)));
    const L = s.docs.map(d => ({ id: d.id, ...d.data() })).filter(x => x.from === 'c').sort((a, b) => ms(b.at) - ms(a.at));
    $('#cc').textContent = L.length;
    $('#ncm').innerHTML = L.length ? L.map(c => `<a class="li" href="#c/${c.clientNo}"><span class="dot-new"></span><div class="main"><b>${esc(c.byName || 'عميل')} · ملف ${esc(c.clientNo)}</b><span>${esc(c.refTitle || '')} — ${esc(c.text.slice(0, 70))}</span></div></a>`).join('') : '<p class="empty" style="padding:10px">مفيش تعليقات جديدة</p>';
  } catch (e) { $('#ncm').innerHTML = `<p class="empty" style="padding:10px">${esc(F.authMsg(e))}</p>`; $('#cc').textContent = '—'; }
}

/* صفحة العميل: الحسابات + الملفات + التعليقات */
export async function clientExtras(host, c, ctx) {
  const { me, isOwner, emp, toast } = ctx; const myName = isOwner ? 'الإدارة' : ((emp && emp.name) || 'المهندس');
  host.insertAdjacentHTML('beforeend', `
  <h3 class="sec-t">👤 حساب العميل على الموقع</h3><div class="card cx" id="accs"><p class="empty">جارٍ التحميل…</p></div>
  <h3 class="sec-t">📁 ملفات المشروع (تظهر للعميل في «تابع مشروعك»)</h3>
  <div class="card cx"><form id="fAdd" class="cx"><div class="row2"><select id="fCat" class="in">${Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><input id="fTitle" class="in" placeholder="اسم الملف — مثلاً: المخطط المعماري النهائي" maxlength="120"></div>
    <input id="fUrl" class="in" dir="ltr" placeholder="لينك جوجل درايف (Share ← Anyone with the link)"><textarea id="fNote" class="in" rows="2" placeholder="ملاحظة للعميل (اختياري)" maxlength="600"></textarea>
    <p class="hint" style="color:var(--mut);font-size:12.5px">ارفع الملف على Google Drive، واضغط Share ← خلّي الوصول «Anyone with the link» ← Copy link، والزقه هنا.</p><button class="btn btn-red sm" style="justify-self:start">➕ إضافة الملف</button></form></div>
  <div class="list" id="fl"></div>
  <h3 class="sec-t">💬 تعليقات العميل <span class="chip" id="cmc">…</span></h3><div class="cx" id="cms"><p class="empty">جارٍ التحميل…</p></div>`);
  $$('.in', host).forEach(i => i.style.cssText += ';padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--paper);width:100%;font:inherit');

  /* الحسابات */
  const paintAccs = async () => {
    let linked = [], cands = [];
    try { linked = (await F.getDocs(F.query(F.collection(db, 'customers'), F.where('clientNo', '==', c.no)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { $('#accs').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; }
    try { cands = (await F.getDocs(F.query(F.collection(db, 'customers'), F.where('clientNo', '==', null)))).docs.map(d => ({ id: d.id, ...d.data() })); } catch (e) { }
    const phones = String(c.phones || '').split(/[^\d٠-٩]+/).map(norm).filter(x => x.length >= 9);
    const nm = String(c.name || '').trim().split(/\s+/)[0] || '';
    cands.forEach(x => { x.score = (phones.includes(norm(x.phone)) ? 2 : 0) + (nm && (x.name || '').includes(nm) ? 1 : 0); });
    cands.sort((a, b) => b.score - a.score);
    $('#accs').innerHTML = `${linked.length ? linked.map(x => `<div class="li"><span class="cno" style="background:#1f9d55">✓</span><div class="main"><b>${esc(x.name || 'بدون اسم')}</b><span dir="ltr" style="text-align:right">${esc(x.email || '')} ${x.phone ? '· ' + esc(x.phone) : ''}</span></div><button class="btn btn-ghost sm" data-unlink="${esc(x.id)}" style="color:var(--red)">فك الربط</button></div>`).join('') : '<p class="empty" style="padding:6px">مفيش حساب مربوط بالملف ده لسه.</p>'}
      <div class="fld"><label>ربط حساب عميل (من الحسابات المسجلة ومستنية ربط)</label><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="aPick" class="in" style="flex:1;min-width:220px"><option value="">— اختار الحساب —</option>${cands.map(x => `<option value="${esc(x.id)}">${x.score ? '⭐ ' : ''}${esc(x.name || '؟')} · ${esc(x.email || '')} ${x.phone ? '· ' + esc(x.phone) : ''} · كود ${esc(x.id.slice(0, 6).toUpperCase())}</option>`).join('')}</select><button class="btn btn-ink sm" id="aLink">ربط</button></div><span class="hint" style="color:var(--mut);font-size:12px">⭐ = رقم الجوال أو الاسم شبه بيانات العميل ده. العميل بيلاقي «كود» في صفحته لو حب يبعته.</span></div>`;
    $$('.in', $('#accs')).forEach(i => i.style.cssText += ';padding:10px 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--paper)');
    $('#aLink').onclick = async () => { const id = $('#aPick').value; if (!id) return toast('اختار الحساب الأول', 1); const x = cands.find(y => y.id === id);
      if (!confirm(`تربط حساب «${x.name || x.email}» بملف ${c.no} — ${c.name}؟\nالعميل هيشوف تقارير وملفات المشروع ده.`)) return;
      try { await F.updateDoc(F.doc(db, 'customers', id), { clientNo: c.no, clientName: c.name, linkedBy: me.uid, linkedAt: F.serverTimestamp() }); toast('اتربط ✓'); paintAccs(); } catch (e) { toast(F.authMsg(e), 1); } };
    $$('[data-unlink]', host).forEach(b => b.onclick = async () => { if (!confirm('فك ربط الحساب ده من الملف؟')) return; try { await F.updateDoc(F.doc(db, 'customers', b.dataset.unlink), { clientNo: null }); toast('اتفك ✓'); paintAccs(); } catch (e) { toast(F.authMsg(e), 1); } });
  };
  paintAccs();

  /* الملفات */
  let files = [];
  const paintFiles = () => {
    $('#fl').innerHTML = files.length ? files.map(f => `<div class="li" style="cursor:default;${f.hidden ? 'opacity:.5' : ''}"><div class="main"><b>${esc(CATS[f.cat] || f.cat)} — ${esc(f.title)}</b><span>${f.note ? esc(f.note.slice(0, 80)) + ' · ' : ''}${fmt(f.at)} ${f.byName ? '· ' + esc(f.byName) : ''}${f.at && Date.now() - ms(f.at) > 365 * 864e5 ? ' · <b style="color:var(--red)">أكتر من سنة (مش ظاهر للعميل)</b>' : ''}</span></div><a class="btn btn-ghost sm" href="${esc(f.url)}" target="_blank" rel="noopener">فتح</a><button class="btn btn-ghost sm" data-hide="${esc(f.id)}" title="إخفاء/إظهار للعميل">${f.hidden ? '🙈' : '👁'}</button>${isOwner || f.by === me.uid ? `<button class="btn btn-ghost sm" data-del="${esc(f.id)}" style="color:var(--red)">حذف</button>` : ''}</div>`).join('') : '<p class="empty">مفيش ملفات لسه</p>';
    $$('[data-del]', $('#fl')).forEach(b => b.onclick = async () => { if (!confirm('حذف الملف من صفحة العميل؟ (الملف نفسه على درايف مش هيتمسح)')) return; try { await F.deleteDoc(F.doc(db, 'cfiles', b.dataset.del)); files = files.filter(f => f.id !== b.dataset.del); paintFiles(); } catch (e) { toast(F.authMsg(e), 1); } });
    $$('[data-hide]', $('#fl')).forEach(b => b.onclick = async () => { const f = files.find(x => x.id === b.dataset.hide); try { await F.updateDoc(F.doc(db, 'cfiles', f.id), { hidden: !f.hidden }); f.hidden = !f.hidden; paintFiles(); } catch (e) { toast(F.authMsg(e), 1); } });
  };
  try { files = (await F.getDocs(F.query(F.collection(db, 'cfiles'), F.where('clientNo', '==', c.no)))).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ms(b.at) - ms(a.at)); } catch (e) { $('#fl').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; }
  paintFiles();
  $('#fAdd').onsubmit = async e => {
    e.preventDefault(); const url = $('#fUrl').value.trim(), title = $('#fTitle').value.trim();
    if (!/^https:\/\//.test(url)) return toast('حط لينك يبدأ بـ https://', 1); if (title.length < 2) return toast('اكتب اسم الملف', 1);
    const d = { clientNo: c.no, cat: $('#fCat').value, title, url: url.slice(0, 600), note: $('#fNote').value.trim().slice(0, 600), by: me.uid, byName: myName.slice(0, 60), at: F.serverTimestamp(), hidden: false };
    try { const r = await F.addDoc(F.collection(db, 'cfiles'), d); files.unshift({ id: r.id, ...d, at: Date.now() }); e.target.reset(); paintFiles(); toast('اتضاف ✓ — العميل يشوفه دلوقتي'); } catch (x) { toast(F.authMsg(x), 1); }
  };

  /* التعليقات */
  let cms = [];
  const load = async () => { try { cms = (await F.getDocs(F.query(F.collection(db, 'ccomments'), F.where('clientNo', '==', c.no)))).docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => ms(a.at) - ms(b.at)); } catch (e) { $('#cms').innerHTML = `<p class="empty">${esc(F.authMsg(e))}</p>`; return; } paintCm(); };
  const paintCm = () => {
    const byRef = {}; cms.forEach(m => { (byRef[m.ref] = byRef[m.ref] || []).push(m); });
    const refs = Object.keys(byRef).sort((a, b) => ms(byRef[b].slice(-1)[0].at) - ms(byRef[a].slice(-1)[0].at));
    $('#cmc').textContent = cms.length;
    $('#cms').innerHTML = refs.length ? refs.map(r => { const L = byRef[r], t = (L.find(x => x.refTitle) || {}).refTitle || r, unseen = L.some(x => x.from === 'c' && !x.seen);
      return `<div class="cm-th" data-ref="${esc(r)}" data-title="${esc(t)}"><b>${unseen ? '<span class="dot-new"></span> ' : ''}${r.startsWith('report:') ? '📋 تقرير' : '📁 ملف'} ${esc(t)}</b>${L.map(m => `<div class="m ${m.from === 's' ? 's' : ''}"><b>${esc(m.from === 's' ? (m.byName || 'الفريق') : (m.byName || 'العميل'))}</b>${nl(m.text)}<small>${fmt(m.at)}${m.from === 's' ? (m.seenC ? ' · ✓✓ العميل شافه' : ' · ✓ اتبعت') : ''}</small></div>`).join('')}<form><textarea rows="2" maxlength="1500" placeholder="اكتب ردك… بيظهر للعميل في صفحته"></textarea><button class="btn btn-red sm">رد</button></form></div>`; }).join('') : '<p class="empty">العميل لسه مكتبش تعليقات.</p>';
    $$('.cm-th', $('#cms')).forEach(th => $('form', th).onsubmit = async e => {
      e.preventDefault(); const ta = $('textarea', th), v = ta.value.trim(); if (!v) return;
      const d = { clientNo: c.no, uid: me.uid, ref: th.dataset.ref, refTitle: th.dataset.title.slice(0, 120), from: 's', text: v.slice(0, 1500), byName: myName.slice(0, 60), at: F.serverTimestamp(), seen: true, seenC: false };
      try { await F.addDoc(F.collection(db, 'ccomments'), d); ta.value = ''; toast('اتبعت ✓'); load(); } catch (x) { toast(F.authMsg(x), 1); }
    });
    cms.filter(m => m.from === 'c' && !m.seen).forEach(m => { m.seen = true; F.updateDoc(F.doc(db, 'ccomments', m.id), { seen: true }).catch(() => { }); });
  };
  load();
}
