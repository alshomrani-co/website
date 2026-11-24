// مشترك بين قسم المساحة وقسم المعماري: ربط قارئ الـ AI، وشريط PDF الثابت
import * as F from './fb.js';
import { setAI } from './docread.js';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let aiUrl = '';
export async function initAI() {
  try { const s = await F.getDoc(F.doc(F.db, 'settings', 'ai')); aiUrl = s.exists() ? (s.data().url || '') : ''; } catch (e) { aiUrl = ''; }
  setAI({ url: aiUrl, getToken: () => F.auth.currentUser ? F.auth.currentUser.getIdToken() : '' });
  return aiUrl;
}
// خانة رابط قارئ الـ AI في غرفة التحكم (المالك بس يقدر يحفظها)
export function aiBox(isOwner) {
  return `<section class="card"><h3>قارئ المستندات بالذكاء الاصطناعي</h3><p class="hint">بيقرا الصكوك الورقية والصور والمخططات. الرابط بييجي من Cloudflare Worker (الخطوات في ملف «قارئ AI — خطوات التركيب»). مشترك بين قسم المساحة والمعماري.</p>
  <div class="sv-row"><input class="in" id="aiUrl" dir="ltr" placeholder="https://shamrani-ai.xxxx.workers.dev" value="${esc(aiUrl)}" ${isOwner ? '' : 'disabled'}>${isOwner ? '<button class="btn btn-ghost sm" id="aiSave">حفظ الرابط</button>' : ''}<span id="aiSt" class="hint">${aiUrl ? '✓ متوصّل' : 'مش متوصّل — القراءة هتبقى بالـ OCR العادي'}</span></div></section>`;
}
export function wireAiBox(toast) {
  const b = $('#aiSave'); if (!b) return;
  b.onclick = async () => { const u = $('#aiUrl').value.trim(); if (u && !/^https:\/\/[^\s]+$/.test(u)) return toast('الرابط لازم يبدأ بـ https://', 1);
    b.disabled = true; try { await F.setDoc(F.doc(F.db, 'settings', 'ai'), { url: u }, { merge: true }); await initAI(); $('#aiSt').textContent = u ? '✓ متوصّل' : 'مش متوصّل'; toast('اتحفظ ✓'); } catch (e) { toast(F.authMsg(e), 1); } b.disabled = false; };
}
// شريط ثابت تحت الشاشة فيه زرار PDF كبير
export const pdfBar = (label = '📄 مراجعة و PDF', extra = '') => `<div class="pdf-bar"><div class="pdf-bar-in">${extra}<button class="btn btn-red pdf-go" id="pdfGo">${label}</button></div></div>`;
// بعد ما الصفحة تجهز: لو جاي من زرار PDF يفتح نافذة الطباعة لوحده
export function autoPrint() { if (/[?&]print=1/.test(location.hash)) { history.replaceState(null, '', location.href.replace(/[?&]print=1/, '')); setTimeout(() => window.print(), 350); } }
