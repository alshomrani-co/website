/**
 * سكربت جوجل للشمراني — الأرشفة لجوجل درايف + الإشعارات وهو مقفول (FCM)
 * بيشتغل على إيميل الأرشيف (اللي انت هتدخل بيه)، من غير Blaze ومن غير مفاتيح سرية:
 * بيستخدم صلاحية الإيميل نفسه على مشروع Firebase (لازم تضيفه في Users and permissions).
 * الخطوات كاملة في ملف «الأرشفة والإشعارات — خطوات التركيب.md».
 */
const PROJECT = 'alshmorani-1a1a2';
const SITE = 'https://alshomrani-co.github.io/website/';
const ROOT_NAME = 'أرشيف الشمراني';
const FS = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
const MONTHS = ['01 يناير', '02 فبراير', '03 مارس', '04 أبريل', '05 مايو', '06 يونيو', '07 يوليو', '08 أغسطس', '09 سبتمبر', '10 أكتوبر', '11 نوفمبر', '12 ديسمبر'];
// [المجموعة، حقل التاريخ، نوعه، مرفقات تابعة]
const DEPTS = {
  supervision: { ar: 'الإشراف', cols: [['reports', 'at', 'ts', 'rmedia']] },
  survey: { ar: 'المساحة', cols: [['surveys', 'at', 'ts']] },
  arch: { ar: 'المعماري', cols: [['archProjects', 'at', 'ts'], ['archMedia', 'at', 'ts']] },
  basma: { ar: 'البصمة', cols: [['days', 'day', 'day']] },
  chats: { ar: 'مرفقات المحادثات', cols: [['chatmedia', 'at', 'ms']] }
};
const BATCH = 120; // عدد المستندات في كل دورة (السكربت ليه حد ٦ دقايق)

/* ---------- التشغيل ---------- */
function setup() { // شغّله مرة واحدة من القائمة فوق ← Run
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(1).create();
  tick(); Logger.log('تمام ✓ — السكربت شغال كل دقيقة');
}
function tick() {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) return;
  try {
    const t0 = Date.now();
    try { pushTick(); } catch (e) { Logger.log('push: ' + e); }
    const A = get('settingsPriv/archive') || {};
    patch('settingsPriv/archive', { script: { seen: Date.now(), email: Session.getActiveUser().getEmail() } });
    if (A.restore && !A.restore.done) return restoreRun(A);
    if (A.req && !A.req.done) return archiveRun(A, A.req, t0);
    if (A.sched && A.sched !== 'off') { const next = +A.nextRun || 0; if (Date.now() >= next) { const keep = +A.keep || 6, b = new Date(); b.setMonth(b.getMonth() - keep);
      patch('settingsPriv/archive', { req: { at: Date.now(), by: 'auto', before: Utilities.formatDate(b, 'Asia/Riyadh', 'yyyy-MM-dd'), depts: A.depts || Object.keys(DEPTS), dry: !A.trialDone, done: false, auto: true }, nextRun: addMonths(Date.now(), +A.sched) }); } }
    if (!A.stats || Date.now() - (+A.stats.at || 0) > 864e5) stats();
  } finally { lock.releaseLock(); }
}
const addMonths = (ms, n) => { const d = new Date(ms); d.setMonth(d.getMonth() + n); return d.getTime(); };

/* ---------- الأرشفة ---------- */
function archiveRun(A, req, t0) {
  const before = new Date(req.before + 'T00:00:00+03:00'), dry = !!req.dry, depts = (req.depts || []).filter(d => DEPTS[d]);
  const prog = Object.assign({ count: 0, bytes: 0, done: {}, man: '' }, req.prog || {}); prog.done = prog.done || {};
  const root = folder(ROOT_NAME), man = prog.man ? JSON.parse(DriveApp.getFileById(prog.man).getBlob().getDataAsString()) : { items: [] };
  let more = false;
  outer: for (const d of depts) for (const [col, f, ty, child] of DEPTS[d].cols) {
    const key = d + ':' + col; if (prog.done[key]) continue;
    const cut = ty === 'ts' ? { timestampValue: before.toISOString() } : ty === 'ms' ? { integerValue: String(before.getTime()) } : { integerValue: String(Math.floor((before.getTime() + 108e5) / 864e5)) };
    // في التجربة (نسخ بس) بنكمّل بعد آخر مستند اتنسخ، لأن المستندات مش بتتمسح
    const q = { structuredQuery: { from: [{ collectionId: col }], where: { fieldFilter: { field: { fieldPath: f }, op: 'LESS_THAN', value: cut } }, orderBy: [{ field: { fieldPath: f } }, { field: { fieldPath: '__name__' } }], limit: BATCH } };
    if (dry && prog['c_' + key]) q.structuredQuery.startAt = { values: JSON.parse(prog['c_' + key]), before: false };
    const docs = runQuery(q);
    for (const doc of docs) {
      if (Date.now() - t0 > 4.5 * 60e3) { more = true; break outer; }
      const id = doc.name.split('/').pop(), raw = { name: doc.name, fields: doc.fields || {} }, data = plain(doc.fields || {});
      const when = dateOf(data[f], ty), dir = sub(sub(sub(root, String(when.getFullYear())), MONTHS[when.getMonth()]), DEPTS[d].ar);
      const kids = [];
      if (child && col === 'reports') { const n = +data.mediaCount || 0; for (let i = 0; i < n; i++) { const k = get(child + '/' + id + '_' + i, true); if (k) kids.push(k); } }
      const json = JSON.stringify({ v: 1, col, id, doc: raw, kids }), jf = dir.createFile(Utilities.newBlob(json, 'application/json', col + '_' + id + '.json'));
      try { const pdf = HtmlService.createHtmlOutput(simpleHTML(DEPTS[d].ar, col, id, data, kids.map(k => plain(k.fields || {})))).getBlob().getAs('application/pdf').setName(col + '_' + id + '.pdf'); dir.createFile(pdf); } catch (e) { }
      man.items.push({ col, id, file: jf.getId(), kids: kids.map(k => k.name.split('/').pop()), childCol: child || '' });
      prog.count++; prog.bytes += json.length;
      if (!dry) { kids.forEach(k => del(k.name)); del(doc.name); }
      if (dry) prog['c_' + key] = JSON.stringify([doc.fields[f], { referenceValue: doc.name }]);
    }
    if (docs.length < BATCH) prog.done[key] = true; else { more = true; break; }
  }
  const mf = prog.man ? DriveApp.getFileById(prog.man) : root.createFile(Utilities.newBlob('{}', 'application/json', 'manifest_' + Date.now() + '.json'));
  mf.setContent(JSON.stringify(man)); prog.man = mf.getId();
  if (more) { patch('settingsPriv/archive', { req: Object.assign({}, req, { prog }) }); return; }
  // خلصت
  const log = { at: { timestampValue: new Date().toISOString() } };
  create('archiveLog', Object.assign(toFields({ kind: 'archive', dry, depts, before: req.before, count: prog.count, bytes: prog.bytes, folder: root.getUrl(), manifest: prog.man, by: req.by || '' }), log));
  patch('settingsPriv/archive', Object.assign({ req: Object.assign({}, req, { done: true, prog: { count: prog.count } }) }, dry ? { trialDone: true } : {}));
  if (A.email) MailApp.sendEmail(A.email, (dry ? 'نسخ تجريبي' : 'أرشفة') + ' الشمراني — ' + prog.count + ' عنصر', '', { htmlBody: `<div dir="rtl" style="font-family:Tahoma"><h2>${dry ? 'تم النسخ التجريبي ✓ (من غير مسح)' : 'تمت الأرشفة ✓'}</h2><p>الأقسام: ${depts.map(x => DEPTS[x].ar).join('، ')}</p><p>أقدم من: ${req.before}</p><p>العدد: <b>${prog.count}</b> — الحجم: ${(prog.bytes / 1e6).toFixed(1)} MB</p><p><a href="${root.getUrl()}">افتح الأرشيف على درايف</a></p>${dry ? '<p>التشغيل الجاي هيبقى نقل فعلي (بيمسح من الموقع بعد الحفظ).</p>' : ''}</div>` });
  stats();
}
function restoreRun(A) {
  const L = get('archiveLog/' + A.restore.log); if (!L || !L.manifest) { patch('settingsPriv/archive', { restore: Object.assign({}, A.restore, { done: true, err: 'السجل مش موجود' }) }); return; }
  const man = JSON.parse(DriveApp.getFileById(L.manifest).getBlob().getDataAsString()); let n = +A.restore.n || 0; const t0 = Date.now();
  for (; n < man.items.length; n++) { if (Date.now() - t0 > 4.5 * 60e3) { patch('settingsPriv/archive', { restore: Object.assign({}, A.restore, { n }) }); return; }
    const it = man.items[n], j = JSON.parse(DriveApp.getFileById(it.file).getBlob().getDataAsString());
    put(j.col + '/' + j.id, j.doc.fields); (j.kids || []).forEach(k => put(k.name.split('/documents/')[1], k.fields || {})); }
  create('archiveLog', Object.assign(toFields({ kind: 'restore', count: man.items.length, depts: L.depts || [], folder: L.folder || '' }), { at: { timestampValue: new Date().toISOString() } }));
  patch('settingsPriv/archive', { restore: Object.assign({}, A.restore, { done: true, n }) });
}
function stats() {
  let fsB = 0; ['reports', 'rmedia', 'surveys', 'archProjects', 'archMedia', 'chatmedia', 'chats', 'days', 'tickets'].forEach(c => { try { runQuery({ structuredQuery: { from: [{ collectionId: c }], limit: 1500 } }).forEach(d => { fsB += JSON.stringify(d.fields || {}).length; }); } catch (e) { } });
  patch('settingsPriv/archive', { stats: { at: Date.now(), driveUsed: DriveApp.getStorageUsed(), driveQuota: DriveApp.getStorageLimit(), fsMB: Math.round(fsB / 1e5) / 10 } });
}
const dateOf = (v, ty) => ty === 'day' ? new Date(+v * 864e5) : new Date(typeof v === 'number' ? v : Date.parse(v) || Date.now());
function simpleHTML(dept, col, id, d, kids) {
  const esc = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const rows = Object.keys(d).filter(k => typeof d[k] !== 'object' && !/^data:/.test(String(d[k])) && String(d[k]).length < 600).map(k => `<tr><th>${esc(k)}</th><td>${esc(d[k])}</td></tr>`).join('');
  const imgs = [d.img, d.src, d.data].concat(kids.map(k => k.src || k.img)).filter(x => /^data:image\/(jpeg|png|webp)/.test(String(x || ''))).slice(0, 12).map(x => `<img src="${x}" style="max-width:48%;margin:4px">`).join('');
  return `<html dir="rtl"><body style="font-family:Tahoma;font-size:11px"><h2>${esc(dept)} — ${esc(col)} / ${esc(id)}</h2><table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;width:100%">${rows}</table>${imgs}</body></html>`;
}

/* ---------- الإشعارات ---------- */
function pushTick() {
  const st = get('settingsPriv/pushState') || {}, last = +st.last || (Date.now() - 120e3), now = Date.now();
  const staff = runQuery({ structuredQuery: { from: [{ collectionId: 'pushTokens' }], where: { fieldFilter: { field: { fieldPath: 'role' }, op: 'EQUAL', value: { stringValue: 'staff' } } }, limit: 200 } }).map(d => ({ name: d.name, t: (d.fields.token || {}).stringValue })).filter(x => x.t);
  // محادثات اتحدثت
  const chats = runQuery({ structuredQuery: { from: [{ collectionId: 'chats' }], where: { fieldFilter: { field: { fieldPath: 'upd' }, op: 'GREATER_THAN', value: { timestampValue: new Date(last).toISOString() } } }, limit: 50 } });
  chats.forEach(c => { const x = plain(c.fields || {}), msgs = (x.msgs || []).filter(m => +m.at > last && !m.sys); if (!msgs.length) return; const m = msgs[msgs.length - 1], body = m.text || (m.file ? (/audio/.test(m.file.type || '') ? '🎙 فويس نوت' : '📎 مرفق') : '');
    if (m.from === 'c') staff.forEach(s => send(s, 'رسالة من ' + (x.name || 'عميل'), body, SITE + 'portal.html#chats', 'chat-' + x.id));
    else if (x.push) send({ t: x.push }, 'رد من فريق الشمراني', body, SITE + '#/', 'chat-' + x.id); });
  // طلبات خدمة جديدة
  runQuery({ structuredQuery: { from: [{ collectionId: 'tickets' }], where: { fieldFilter: { field: { fieldPath: 'at' }, op: 'GREATER_THAN', value: { timestampValue: new Date(last).toISOString() } } }, limit: 20 } })
    .forEach(t => { const x = plain(t.fields || {}); staff.forEach(s => send(s, 'طلب خدمة جديد ' + (x.code || ''), (x.name || '') + ' — ' + (x.dept || ''), SITE + 'portal.html#support', 'tk-' + x.code)); });
  patch('settingsPriv/pushState', { last: now });
}
function send(to, title, body, url, tag) {
  const r = UrlFetchApp.fetch('https://fcm.googleapis.com/v1/projects/' + PROJECT + '/messages:send', { method: 'post', contentType: 'application/json', headers: H(), muteHttpExceptions: true,
    payload: JSON.stringify({ message: { token: to.t, data: { title, body: String(body).slice(0, 180), url, tag: tag || '' }, webpush: { headers: { Urgency: 'high', TTL: '86400' }, notification: { title, body: String(body).slice(0, 180), icon: SITE + 'assets/img/icon-192.png', tag: tag || undefined, dir: 'rtl', lang: 'ar' }, fcm_options: { link: url } } } }) });
  if (r.getResponseCode() === 404 || /UNREGISTERED|INVALID_ARGUMENT/.test(r.getContentText())) { if (to.name) del(to.name); }
}

/* ---------- Firestore REST ---------- */
const H = () => ({ Authorization: 'Bearer ' + ScriptApp.getOAuthToken(), 'X-Goog-User-Project': PROJECT });
function call(method, url, body) { const r = UrlFetchApp.fetch(url, { method, contentType: 'application/json', headers: H(), muteHttpExceptions: true, payload: body ? JSON.stringify(body) : undefined }); const c = r.getResponseCode(); if (c === 404) return null; if (c >= 300) throw new Error(c + ' ' + r.getContentText().slice(0, 300)); return JSON.parse(r.getContentText() || '{}'); }
function get(path, raw) { const d = call('get', FS + '/' + path); return d ? (raw ? d : plain(d.fields || {})) : null; }
function put(path, fields) { return call('patch', FS + '/' + path, { fields }); }
function patch(path, obj) { const f = toFields(obj), mask = Object.keys(f).map(k => 'updateMask.fieldPaths=' + encodeURIComponent('`' + k + '`')).join('&'); return call('patch', FS + '/' + path + '?' + mask, { fields: f }); }
function create(col, fields) { return call('post', FS + '/' + col, { fields }); }
function del(name) { return call('delete', 'https://firestore.googleapis.com/v1/' + name); }
function runQuery(q) { return (call('post', FS + ':runQuery', q) || []).filter(x => x.document).map(x => x.document); }
function plain(f) { const o = {}; for (const k in f) o[k] = val(f[k]); return o; }
function val(v) { if ('stringValue' in v) return v.stringValue; if ('integerValue' in v) return +v.integerValue; if ('doubleValue' in v) return v.doubleValue; if ('booleanValue' in v) return v.booleanValue; if ('timestampValue' in v) return v.timestampValue; if ('nullValue' in v) return null; if ('mapValue' in v) return plain(v.mapValue.fields || {}); if ('arrayValue' in v) return (v.arrayValue.values || []).map(val); if ('referenceValue' in v) return v.referenceValue; return null; }
function toVal(x) { if (x === null || x === undefined) return { nullValue: null }; if (typeof x === 'boolean') return { booleanValue: x }; if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x }; if (typeof x === 'string') return { stringValue: x }; if (Array.isArray(x)) return { arrayValue: { values: x.map(toVal) } }; if (x.timestampValue || x.integerValue || x.stringValue || x.referenceValue) return x; return { mapValue: { fields: toFields(x) } }; }
function toFields(o) { const f = {}; for (const k in o) if (o[k] !== undefined) f[k] = toVal(o[k]); return f; }

/* ---------- درايف ---------- */
function folder(name) { const it = DriveApp.getFoldersByName(name); return it.hasNext() ? it.next() : DriveApp.createFolder(name); }
function sub(parent, name) { const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
