// المناسبات والأعياد: ألوان وزينة الموقع (بتتفعّل من لوحة التحكم ← المناسبات والأعياد)
export const OCC = {
  national: { ar: 'اليوم الوطني', en: 'Saudi National Day', ic: '🇸🇦', when: '23 سبتمبر', red: '#0B7A3B', gold: '#9FE0B6', fx: 'confetti', c: ['#0B7A3B', '#ffffff', '#1FA35A', '#E9F7EE'],
    g: n => [`كل عام والوطن بخير — اليوم الوطني السعودي ${n} 🇸🇦`, `Happy Saudi National Day ${n} 🇸🇦`] },
  founding: { ar: 'يوم التأسيس', en: 'Founding Day', ic: '🏛', when: '22 فبراير', red: '#7A4A1F', gold: '#D4A853', fx: 'sadu', c: ['#7A4A1F', '#D4A853', '#E9DCC3', '#3B2412'],
    g: () => ['يوم التأسيس — فخورين بتاريخنا منذ 1727', 'Founding Day — proud of our history since 1727'] },
  flag: { ar: 'يوم العلم', en: 'Flag Day', ic: '🏳️', when: '11 مارس', red: '#0F7B3F', gold: '#CDEBD8', fx: 'stars', c: ['#0F7B3F', '#ffffff'],
    g: () => ['يوم العلم — رايتنا عالية دايماً 🇸🇦', 'Flag Day — our flag always high 🇸🇦'] },
  ramadan: { ar: 'رمضان', en: 'Ramadan', ic: '🌙', when: 'شهر رمضان', red: '#5B2D8E', gold: '#E4B95B', fx: 'lanterns', c: ['#E4B95B', '#5B2D8E', '#F6E7C1'],
    g: () => ['رمضان كريم 🌙 وكل عام وأنتم بخير', 'Ramadan Kareem 🌙'] },
  fitr: { ar: 'عيد الفطر', en: 'Eid Al-Fitr', ic: '🎉', when: '1 شوال', red: '#0E8C8C', gold: '#E4B95B', fx: 'eid', c: ['#E4B95B', '#0E8C8C', '#ffffff', '#F28C8C'],
    g: () => ['عيد فطر مبارك 🎉 كل عام وأنتم بخير', 'Eid Mubarak 🎉'] },
  hajj: { ar: 'الحج ويوم عرفة', en: 'Hajj & Arafah Day', ic: '🕋', when: '8–9 ذو الحجة', red: '#8A5A1F', gold: '#E9C46A', fx: 'stars', c: ['#E9C46A', '#8A5A1F', '#ffffff'],
    g: () => ['حج مبرور وسعي مشكور — يوم عرفة 🤲', 'Hajj Mubarak — Day of Arafah 🤲'] },
  adha: { ar: 'عيد الأضحى', en: 'Eid Al-Adha', ic: '🐑', when: '10 ذو الحجة', red: '#1E7A4C', gold: '#D9B45A', fx: 'stars', c: ['#D9B45A', '#1E7A4C', '#ffffff'],
    g: () => ['عيد أضحى مبارك — تقبّل الله منا ومنكم', 'Eid Al-Adha Mubarak'] },
  hijri: { ar: 'رأس السنة الهجرية', en: 'Hijri New Year', ic: '📅', when: '1 محرم', red: '#1F3A68', gold: '#C8CED9', fx: 'stars', c: ['#C8CED9', '#ffffff', '#1F3A68'],
    g: () => ['كل عام وأنتم بخير — سنة هجرية سعيدة 🌙', 'Happy Hijri New Year 🌙'] }
};
export const nationalNo = (d = new Date()) => d.getFullYear() - 1930;

export function autoOcc(d = new Date()) {
  const g = (d.getMonth() + 1) * 100 + d.getDate();
  if (g >= 921 && g <= 925) return 'national';
  if (g >= 220 && g <= 223) return 'founding';
  if (g === 311) return 'flag';
  try {
    const p = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', day: 'numeric' }).formatToParts(d);
    const m = +(p.find(x => x.type === 'month') || {}).value, day = +(p.find(x => x.type === 'day') || {}).value;
    if (m === 9) return 'ramadan';
    if (m === 10 && day <= 4) return 'fitr';
    if (m === 12 && day >= 8 && day <= 9) return 'hajj';
    if (m === 12 && day >= 10 && day <= 13) return 'adha';
    if (m === 1 && day <= 2) return 'hijri';
  } catch (e) { }
  return null;
}
export function activeOcc(o) {
  if (!o) return null;
  if (o.active && o.active !== 'none' && OCC[o.active]) { if (!o.until || new Date(o.until).getTime() > Date.now()) return o.active; }
  if (o.auto) return autoOcc();
  return null;
}
export function greeting(k, lang, custom) {
  if (custom) return custom; const x = OCC[k]; if (!x) return ''; const [a, e] = x.g(nationalNo()); return lang === 'en' ? e : a;
}

const rnd = (a, b) => a + Math.random() * (b - a);
const LANTERN = c => `<svg viewBox="0 0 40 90" aria-hidden="true"><line x1="20" y1="0" x2="20" y2="22" stroke="${c}" stroke-width="1.4"/><path d="M14 22h12l3 6H11z" fill="${c}"/><path d="M11 28h18l4 10v22l-4 8H11l-4-8V38z" fill="${c}" opacity=".95"/><path d="M13 33h14l3 7v18l-3 6H13l-3-6V40z" fill="#fff3c4" class="glow"/><path d="M20 33v31M12 46h16" stroke="${c}" stroke-width="1.6"/><path d="M14 68h12l-2 6h-8z" fill="${c}"/><circle cx="20" cy="78" r="2.4" fill="${c}"/></svg>`;
const CRESCENT = c => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M38 6a24 24 0 1 0 16 42A20 20 0 1 1 38 6z" fill="${c}"/><path d="M47 18l1.6 4.4 4.6.2-3.6 2.9 1.2 4.5-3.8-2.6-3.9 2.6 1.3-4.5-3.6-2.9 4.6-.2z" fill="${c}"/></svg>`;

// الزينة: طبقة ثابتة فوق الصفحة ومش بتمنع الضغط على أي حاجة
const SHEEP = (flip) => `<svg viewBox="0 0 120 96" aria-hidden="true" style="${flip ? 'transform:scaleX(-1)' : ''}"><g class="sh-body"><g fill="#fff" stroke="#e6e1d6" stroke-width="2"><circle cx="40" cy="42" r="16"/><circle cx="58" cy="34" r="17"/><circle cx="76" cy="42" r="16"/><circle cx="50" cy="56" r="16"/><circle cx="70" cy="56" r="15"/><circle cx="34" cy="56" r="12"/><circle cx="86" cy="54" r="12"/></g><rect x="40" y="66" width="7" height="20" rx="3.5" fill="#3a3a3a"/><rect x="74" y="66" width="7" height="20" rx="3.5" fill="#3a3a3a"/><g class="sh-head"><ellipse cx="98" cy="40" rx="14" ry="16" fill="#3a3a3a"/><ellipse cx="88" cy="32" rx="8" ry="4.5" fill="#3a3a3a" transform="rotate(-25 88 32)"/><ellipse cx="110" cy="32" rx="8" ry="4.5" fill="#3a3a3a" transform="rotate(25 110 32)"/><circle cx="93" cy="38" r="3" fill="#fff"/><circle cx="103" cy="38" r="3" fill="#fff"/><circle class="sh-eye" cx="93.5" cy="38.5" r="1.6" fill="#111"/><circle class="sh-eye" cx="103.5" cy="38.5" r="1.6" fill="#111"/><circle cx="98" cy="22" r="7" fill="#fff" stroke="#e6e1d6" stroke-width="2"/><path d="M95 48q3 3 6 0" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/></g></g></svg>`;
const BUNTING = (cols, n) => { let t = ''; const w = 100 / n; for (let i = 0; i < n; i++) { const x = i * w; t += `<path d="M${x.toFixed(2)} 2 L${(x + w / 2).toFixed(2)} 14 L${(x + w).toFixed(2)} 2Z" fill="${cols[i % cols.length]}"/>`; } return `<svg class="bunt-svg" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path d="M0 2 Q50 6 100 2" stroke="rgba(0,0,0,.25)" stroke-width=".4" fill="none"/>${t}</svg>`; };
const BULBS = (cols, n) => { let t = ''; for (let i = 0; i < n; i++) t += `<i style="left:${((i + .5) * 100 / n).toFixed(2)}%;--c:${cols[i % cols.length]};animation-delay:${(i * .15).toFixed(2)}s"></i>`; return `<span class="bulbs">${t}</span>`; };
// الزينة: level = light | normal | heavy (الافتراضي heavy)
export function fxHTML(k, mobile, level = 'heavy') {
  const x = OCC[k]; if (!x) return ''; const C = x.c; let h = ''; const L3 = level === 'heavy' ? 2 : level === 'normal' ? 1 : 0;
  const n = (mobile ? 12 : 26) * (L3 === 2 ? 2 : L3 === 1 ? 1.4 : 1);
  const confetti = x.fx === 'confetti' || x.fx === 'eid' || (k === 'adha' && L3);
  if (confetti) for (let i = 0; i < n; i++) { const w = rnd(6, 11), c = C[i % C.length]; h += `<i class="cf" style="left:${rnd(0, 100).toFixed(1)}%;width:${w.toFixed(1)}px;height:${(w * rnd(1.4, 2.4)).toFixed(1)}px;background:${c};animation-duration:${rnd(7, 13).toFixed(1)}s,${rnd(1.6, 3).toFixed(1)}s;animation-delay:-${rnd(0, 12).toFixed(1)}s,0s;opacity:${rnd(.55, .9).toFixed(2)}"></i>`; }
  const lanterns = x.fx === 'lanterns' || x.fx === 'eid' || (k === 'adha' && L3);
  if (lanterns) { const L = mobile ? (L3 ? [5, 20, 80, 94] : [6, 88]) : (L3 === 2 ? [3, 9, 15, 21, 79, 85, 91, 97] : L3 ? [4, 11, 18, 82, 89, 96] : [4, 13, 84, 93]);
    L.forEach((l, i) => { h += `<span class="ln" style="left:${l}%;--d:${(i * .45).toFixed(2)}s;--s:${[1, .75, .9, .65][i % 4]};--len:${[0, 26, 12, 40][i % 4]}px">${LANTERN(x.gold)}</span>`; }); }
  if (L3 && ['fitr', 'adha', 'national', 'flag'].includes(k)) h += `<span class="bunt">${BUNTING(C, mobile ? 14 : 26)}</span>`;
  if (L3 && k === 'ramadan') h += BULBS([x.gold, '#fff1c2', '#f7c873'], mobile ? 16 : 34);
  if (x.fx === 'stars' || x.fx === 'lanterns' || x.fx === 'eid' || k === 'adha') {
    for (let i = 0; i < (mobile ? 8 : 16) * (L3 + 1); i++) h += `<b class="st" style="left:${rnd(2, 98).toFixed(1)}%;top:${rnd(8, 70).toFixed(1)}%;animation-delay:-${rnd(0, 4).toFixed(1)}s;font-size:${rnd(8, 15).toFixed(0)}px;color:${x.gold}">✦</b>`;
    h += `<span class="cr${L3 ? ' big' : ''}">${CRESCENT(x.gold)}</span>`;
  }
  if ((x.fx === 'eid' || k === 'adha') && (!mobile || L3)) for (let i = 0; i < (L3 === 2 ? 6 : 3); i++) h += `<span class="fw" style="left:${rnd(10, 90).toFixed(0)}%;top:${rnd(12, 40).toFixed(0)}%;animation-delay:${(i * .9).toFixed(1)}s;--c:${C[i % C.length]}"></span>`;
  if (k === 'adha') { h += `<span class="sheep s1">${SHEEP(0)}</span>`; if (!mobile) h += `<span class="sheep s2">${SHEEP(1)}</span>`; if (L3 === 2 && !mobile) h += `<span class="sheep s3">${SHEEP(0)}</span>`; }
  if (x.fx === 'sadu') h += `<span class="sadu top${L3 ? ' wide' : ''}"></span><span class="sadu sb${L3 ? ' wide' : ''}"></span>${L3 ? '<span class="sadu-c c1"></span><span class="sadu-c c2"></span>' : ''}`;
  return h;
}
