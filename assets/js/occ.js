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
    if (m === 12 && day >= 9 && day <= 13) return 'adha';
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
export function fxHTML(k, mobile) {
  const x = OCC[k]; if (!x) return ''; const C = x.c; let h = '';
  const n = mobile ? 12 : 26;
  if (x.fx === 'confetti' || x.fx === 'eid') {
    for (let i = 0; i < n; i++) { const w = rnd(6, 11), c = C[i % C.length]; h += `<i class="cf" style="left:${rnd(0, 100).toFixed(1)}%;width:${w.toFixed(1)}px;height:${(w * rnd(1.4, 2.4)).toFixed(1)}px;background:${c};animation-duration:${rnd(7, 13).toFixed(1)}s,${rnd(1.6, 3).toFixed(1)}s;animation-delay:-${rnd(0, 12).toFixed(1)}s,0s;opacity:${rnd(.55, .9).toFixed(2)}"></i>`; }
  }
  if (x.fx === 'lanterns' || x.fx === 'eid') {
    const L = mobile ? [6, 88] : [4, 13, 84, 93];
    L.forEach((l, i) => { h += `<span class="ln" style="left:${l}%;--d:${(i * .6).toFixed(1)}s;--s:${(i % 2 ? .8 : 1)}">${LANTERN(x.gold)}</span>`; });
  }
  if (x.fx === 'stars' || x.fx === 'lanterns' || x.fx === 'eid') {
    for (let i = 0; i < (mobile ? 8 : 16); i++) h += `<b class="st" style="left:${rnd(2, 98).toFixed(1)}%;top:${rnd(8, 70).toFixed(1)}%;animation-delay:-${rnd(0, 4).toFixed(1)}s;font-size:${rnd(8, 15).toFixed(0)}px;color:${x.gold}">✦</b>`;
    h += `<span class="cr">${CRESCENT(x.gold)}</span>`;
  }
  if (x.fx === 'eid' && !mobile) for (let i = 0; i < 3; i++) h += `<span class="fw" style="left:${rnd(10, 90).toFixed(0)}%;top:${rnd(12, 40).toFixed(0)}%;animation-delay:${(i * 1.3).toFixed(1)}s;--c:${C[i % C.length]}"></span>`;
  if (x.fx === 'sadu') h += `<span class="sadu top"></span><span class="sadu sb"></span>`;
  return h;
}
