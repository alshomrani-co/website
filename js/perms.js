// صلاحيات التطبيق: شاشة ترحيب بتطلب الإشعارات والموقع والكاميرا والمايك والتثبيت + صفحة «الصلاحيات» + تسجيل الإشعارات (FCM)
const EN = () => document.documentElement.lang === 'en';
const T = (a, e) => EN() ? e : a;
const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } };
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let deferredInstall = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; });
addEventListener('appinstalled', () => { deferredInstall = null; ls('sh.installed', '1'); });

export const PERMS = [
  { k: 'notifications', ic: '🔔', ar: 'الإشعارات', en: 'Notifications', dAr: 'توصلك رسايل المهندس وتحديثات مشروعك حتى والتطبيق مقفول', dEn: 'Get engineer messages and project updates even when closed' },
  { k: 'geolocation', ic: '📍', ar: 'الموقع', en: 'Location', dAr: 'لتحديد موقع أرضك أو أقرب فرع', dEn: 'To pin your land or the nearest branch' },
  { k: 'camera', ic: '📷', ar: 'الكاميرا', en: 'Camera', dAr: 'لتصوير الصك أو الموقع وإرساله', dEn: 'To photograph your deed or site' },
  { k: 'microphone', ic: '🎙', ar: 'المايك', en: 'Microphone', dAr: 'لإرسال فويس نوت في المحادثة', dEn: 'To send voice notes in chat' },
  { k: 'install', ic: '📲', ar: 'تثبيت التطبيق', en: 'Install app', dAr: 'أيقونة على الشاشة الرئيسية تفتح زي التطبيق', dEn: 'A home-screen icon that opens like an app' }
];

export async function state(k) {
  try {
    if (k === 'install') return standalone() || ls('sh.installed') ? 'granted' : (deferredInstall || isIOS() ? 'prompt' : 'unsupported');
    if (k === 'notifications') { if (!('Notification' in window)) return isIOS() && !standalone() ? 'ios-home' : 'unsupported'; return Notification.permission === 'default' ? 'prompt' : Notification.permission; }
    if (navigator.permissions && navigator.permissions.query) { const r = await navigator.permissions.query({ name: k }); return r.state; }
  } catch (e) { }
  return ls('sh.perm.' + k) || 'prompt';
}

export async function request(k) {
  try {
    if (k === 'notifications') { if (!('Notification' in window)) return 'unsupported'; const r = await Notification.requestPermission(); if (r === 'granted') registerPush().catch(() => { }); return r; }
    if (k === 'geolocation') return await new Promise(res => navigator.geolocation ? navigator.geolocation.getCurrentPosition(() => { ls('sh.perm.geolocation', 'granted'); res('granted'); }, e => res(e.code === 1 ? 'denied' : 'prompt'), { timeout: 12000 }) : res('unsupported'));
    if (k === 'camera' || k === 'microphone') { const s = await navigator.mediaDevices.getUserMedia(k === 'camera' ? { video: true } : { audio: true }); s.getTracks().forEach(t => t.stop()); ls('sh.perm.' + k, 'granted'); return 'granted'; }
    if (k === 'install') { if (deferredInstall) { deferredInstall.prompt(); const r = await deferredInstall.userChoice; deferredInstall = null; return r.outcome === 'accepted' ? 'granted' : 'prompt'; } if (isIOS()) return 'ios-home'; return 'unsupported'; }
  } catch (e) { ls('sh.perm.' + k, 'denied'); return 'denied'; }
  return 'prompt';
}

const LBL = { granted: ['✓ مسموح', '✓ Allowed', 'ok'], denied: ['✕ مرفوض — فعّله من إعدادات المتصفح', '✕ Blocked — enable in settings', 'no'], prompt: ['سماح', 'Allow', 'ask'], unsupported: ['غير مدعوم هنا', 'Not supported', 'na'], 'ios-home': ['أضفه للشاشة الرئيسية الأول', 'Add to Home Screen first', 'na'] };
const IOS_TIP = () => T('على الآيفون (iOS 16.4 أو أحدث): اضغط زرار المشاركة ⬆️ ← «إضافة إلى الشاشة الرئيسية»، وافتح التطبيق من الأيقونة علشان الإشعارات تشتغل.', 'On iPhone (iOS 16.4+): tap Share ⬆️ → “Add to Home Screen”, then open from the icon so notifications work.');

function css() {
  if (document.getElementById('permCss')) return; const s = document.createElement('style'); s.id = 'permCss';
  s.textContent = `.pm-ov{position:fixed;inset:0;z-index:10050;background:rgba(10,10,12,.72);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px}
  .pm-card{width:min(440px,100%);max-height:92vh;overflow:auto;background:#fff;color:#16171A;border-radius:22px;padding:22px;box-shadow:0 30px 80px rgba(0,0,0,.4);font-family:inherit}
  [data-theme=dark] .pm-card{background:#1d1f24;color:#eee}
  .pm-card h3{margin:0 0 4px;font-size:20px}.pm-card>p{margin:0 0 14px;color:#777;font-size:14px;line-height:1.7}
  .pm-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-top:1px solid rgba(0,0,0,.08)}
  .pm-row .ic{font-size:24px;width:34px;text-align:center}.pm-row div{flex:1;min-width:0}.pm-row b{display:block;font-size:15px}.pm-row small{color:#888;font-size:12.5px;line-height:1.5}
  .pm-b{border:0;border-radius:12px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap;background:#E1262B;color:#fff}
  .pm-b.ok{background:#e7f6ec;color:#1f7a3a}.pm-b.no{background:#fdeaea;color:#b3141a;font-size:11.5px;white-space:normal;max-width:130px}.pm-b.na{background:#eee;color:#888;font-size:11.5px;white-space:normal;max-width:130px}
  .pm-acts{display:flex;gap:8px;margin-top:14px}.pm-acts .pm-b{flex:1;padding:12px}.pm-acts .skip{background:transparent;color:#888;flex:0 0 auto}
  .pm-tip{font-size:12.5px;background:#fff7e0;color:#7a5a00;border-radius:12px;padding:10px 12px;margin-top:10px;line-height:1.7}
  .pm-splash{position:fixed;inset:0;z-index:10060;background:#16171A;display:grid;place-items:center;transition:opacity .5s}
  .pm-splash img{width:92px;animation:pmS 1.2s ease-in-out infinite alternate}.pm-splash.out{opacity:0;pointer-events:none}
  @keyframes pmS{from{transform:scale(.92);filter:drop-shadow(0 0 0 #E1262B)}to{transform:scale(1.04);filter:drop-shadow(0 0 22px #E1262B)}}`;
  document.head.appendChild(s);
}
async function rowsHTML(keys) {
  const out = []; for (const p of PERMS.filter(x => !keys || keys.includes(x.k))) { const st = await state(p.k); const l = LBL[st] || LBL.prompt;
    out.push(`<div class="pm-row" data-k="${p.k}"><span class="ic">${p.ic}</span><div><b>${T(p.ar, p.en)}</b><small>${T(p.dAr, p.dEn)}</small></div><button type="button" class="pm-b ${l[2]}" ${st === 'prompt' ? '' : 'disabled'}>${T(l[0], l[1])}</button></div>`); }
  return out.join('');
}
async function wireRows(box, repaint) {
  box.querySelectorAll('.pm-row').forEach(r => { const b = r.querySelector('.pm-b'); if (b.disabled) return; b.onclick = async () => { b.textContent = '…'; await request(r.dataset.k); repaint(); }; });
}

// شاشة الترحيب (مرة واحدة) — keys اختياري
export async function onboard({ force = false, keys = null } = {}) {
  if (!force && ls('sh.onb') === '1') return; css();
  const ov = document.createElement('div'); ov.className = 'pm-ov';
  const paint = async () => { ov.innerHTML = `<div class="pm-card"><h3>👋 ${T('أهلاً بيك في تطبيق الشمراني', 'Welcome to Al-Shamrani app')}</h3><p>${T('علشان التطبيق يشتغل كامل، اسمح بالصلاحيات دي — كل واحدة بتتطلب مرة واحدة، وتقدر تغيّرها بعدين من «الصلاحيات».', 'Allow these so the app works fully. You can change them later from “Permissions”.')}</p>${await rowsHTML(keys)}${isIOS() && !standalone() ? `<div class="pm-tip">${IOS_TIP()}</div>` : ''}<div class="pm-acts"><button type="button" class="pm-b" id="pmAll">${T('سماح للكل', 'Allow all')}</button><button type="button" class="pm-b skip" id="pmSkip">${T('بعدين', 'Later')}</button></div></div>`;
    wireRows(ov, paint);
    ov.querySelector('#pmAll').onclick = async () => { for (const p of PERMS.filter(x => !keys || keys.includes(x.k))) { if (await state(p.k) === 'prompt') await request(p.k); } ls('sh.onb', '1'); paint(); setTimeout(() => ov.remove(), 900); };
    ov.querySelector('#pmSkip').onclick = () => { ls('sh.onb', '1'); ov.remove(); }; };
  document.body.appendChild(ov); paint();
}
// صفحة الصلاحيات (بتترسم جوه عنصر)
export async function statusPage(el) {
  css(); const paint = async () => { el.innerHTML = `<div class="pm-card" style="margin:auto;box-shadow:none;border:1px solid rgba(0,0,0,.08)"><h3>🔐 ${T('الصلاحيات', 'Permissions')}</h3><p>${T('حالة كل صلاحية على الجهاز ده.', 'Status of each permission on this device.')}</p>${await rowsHTML()}${isIOS() && !standalone() ? `<div class="pm-tip">${IOS_TIP()}</div>` : ''}<div class="pm-tip" style="background:#eef4ff;color:#244a8a">${T('لو صلاحية مرفوضة: افتح إعدادات المتصفح أو الجهاز ← الموقع/التطبيق ← اسمح بيها، وبعدين ارجع هنا.', 'If blocked: open browser/device settings → this site → allow it, then come back.')}</div></div>`; wireRows(el, paint); };
  paint();
}
// شاشة البداية (Splash) في وضع التطبيق
export function splash(logo = 'assets/img/mark.png') {
  if (!standalone() || sessionStorage.getItem('sh.spl')) return; sessionStorage.setItem('sh.spl', '1'); css();
  const s = document.createElement('div'); s.className = 'pm-splash'; s.innerHTML = `<img src="${logo}" alt="">`; document.body.appendChild(s);
  const go = () => { s.classList.add('out'); setTimeout(() => s.remove(), 600); }; if (document.readyState === 'complete') setTimeout(go, 700); else addEventListener('load', () => setTimeout(go, 500));
  setTimeout(go, 3000);
}
export function badge(n) { try { if (n > 0 && navigator.setAppBadge) navigator.setAppBadge(n); else if (navigator.clearAppBadge) navigator.clearAppBadge(); } catch (e) { } }

// تسجيل الإشعارات: بيرجع التوكن. vapid من لوحة التحكم (Cloud Messaging ← Web Push certificates)
let tokP = null;
export function registerPush(opts = {}) {
  if (tokP) return tokP.then(t => (save(t, opts), t));
  tokP = (async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator)) return null;
    const F = await import('./fb.js'); let vapid = '';
    try { const s = await F.getDoc(F.doc(F.db, 'site', 'push')); vapid = s.exists() ? (s.data().vapid || '') : ''; } catch (e) { }
    if (!vapid) return null;
    const M = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');
    if (!(await M.isSupported())) return null;
    const reg = await navigator.serviceWorker.ready;
    const t = await M.getToken(M.getMessaging(F.app), { vapidKey: vapid, serviceWorkerRegistration: reg });
    if (t) ls('sh.push', t); return t || null;
  })().catch(e => { console.warn('push', e); tokP = null; return null; });
  return tokP.then(t => (save(t, opts), t));
}
async function save(t, { chatId } = {}) {
  if (!t) return; const F = await import('./fb.js'); const u = F.auth.currentUser;
  try { if (u) await F.setDoc(F.doc(F.db, 'pushTokens', t.slice(-60)), { token: t, uid: u.uid, role: ls('sh.staff') === '1' ? 'staff' : 'cust', at: F.serverTimestamp(), ua: navigator.userAgent.slice(0, 80) }); } catch (e) { }
  try { if (chatId) await F.updateDoc(F.doc(F.db, 'chats', chatId), { push: t }); } catch (e) { }
}
