// v16: «حجم الصفحة» — شريط في هيدر لوحة التحكم والبوابة والأقسام. كل جهاز بيفتكر الحجم بتاعه.
const KEY = () => 'sh.ui.' + (matchMedia('(max-width:860px)').matches ? 'm' : 'd');
const def = () => innerWidth >= 2200 ? 135 : innerWidth >= 1800 ? 125 : innerWidth >= 1400 ? 112 : 100;
const get = () => { try { const v = +localStorage.getItem(KEY()); return v >= 70 && v <= 160 ? v : def(); } catch (e) { return def(); } };
export function applyZoom(v) {
  v = Math.max(70, Math.min(160, Math.round(v))); const d = document.documentElement;
  d.style.zoom = v === 100 ? '' : (v / 100).toFixed(2); d.style.setProperty('--uiz', (v / 100).toFixed(2)); return v;
}
applyZoom(get());
function css() {
  if (document.getElementById('uizCss')) return; const s = document.createElement('style'); s.id = 'uizCss';
  s.textContent = `.uiz{display:inline-flex;align-items:center;gap:6px;background:var(--card,#fff);border:1px solid var(--line,#e4e0d8);border-radius:12px;padding:4px 8px;font-size:12.5px;font-weight:700}
  .uiz button{width:26px;height:26px;border-radius:8px;background:var(--paper,#f4f2ee);font-weight:800;line-height:1}
  .uiz input{width:110px;accent-color:var(--red,#E1262B)}.uiz b{min-width:38px;text-align:center}.uiz .rs{width:auto;padding:0 8px;font-size:11.5px}
  @media (max-width:860px){.uiz input{width:70px}.uiz .lbl{display:none}}
  @media (max-width:600px){.uiz input,.uiz .rs{display:none}.uiz{padding:3px 5px;gap:3px}.uiz b{min-width:32px;font-size:11.5px}.top .who{gap:4px;min-width:0;flex-wrap:nowrap}.top .who .btn{padding:6px 8px;font-size:12px}.top .who .av{display:none}.top-in{overflow:hidden}}`;
  document.head.appendChild(s);
}
// بيحط الشريط جوه العنصر اللي يتبعت (أو أول .who في الهيدر)
export function mountZoom(host) {
  host = host || document.querySelector('header.top .who, header .who'); if (!host || host.querySelector('.uiz')) return; css();
  const w = document.createElement('div'); w.className = 'uiz'; w.title = 'حجم الصفحة';
  w.innerHTML = `<span class="lbl">🔍 الحجم</span><button type="button" data-z="-">−</button><input type="range" min="70" max="160" step="5"><button type="button" data-z="+">+</button><b></b><button type="button" class="rs">100%</button>`;
  const r = w.querySelector('input'), b = w.querySelector('b');
  const set = v => { v = applyZoom(v); r.value = v; b.textContent = v + '%'; try { localStorage.setItem(KEY(), v); } catch (e) { } };
  r.value = get(); b.textContent = r.value + '%';
  r.oninput = () => set(+r.value);
  w.querySelector('[data-z="-"]').onclick = () => set(+r.value - 5);
  w.querySelector('[data-z="+"]').onclick = () => set(+r.value + 5);
  w.querySelector('.rs').onclick = () => set(100);
  host.prepend(w);
  // زرار البوابة واضح في كل الأقسام
  if (!/portal\.html/.test(location.pathname) && !host.querySelector('a[href^="portal.html"]')) { const a = document.createElement('a'); a.className = 'btn btn-ghost sm go-out'; a.href = 'portal.html'; a.textContent = '🏠 البوابة'; w.after(a); }
}
// بيركّب نفسه أول ما الهيدر يظهر (الصفحات بترسم الهيدر بعد تسجيل الدخول)
if (window.MutationObserver) { const mo = new MutationObserver(() => { const h = document.querySelector('header.top .who'); if (h && !h.querySelector('.uiz')) mountZoom(h); }); addEventListener('DOMContentLoaded', () => mo.observe(document.body, { childList: true, subtree: true })); if (document.body) mo.observe(document.body, { childList: true, subtree: true }); }
