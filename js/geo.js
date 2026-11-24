// أدوات جغرافية: تحويل UTM (WGS84) ↔ خط طول/عرض، المساحة والأطوال، التاريخ الهجري، ورسم صورة خريطة للطباعة
const a = 6378137, f = 1 / 298.257223563, k0 = 0.9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2);
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
export function toUTM(lat, lon, zone = 38) {
  const L0 = rad((zone - 1) * 6 - 180 + 3), p = rad(lat), l = rad(lon);
  const N = a / Math.sqrt(1 - e2 * Math.sin(p) ** 2), T = Math.tan(p) ** 2, C = ep2 * Math.cos(p) ** 2, A = Math.cos(p) * (l - L0);
  const M = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * p - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * p) + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * p) - (35 * e2 ** 3 / 3072) * Math.sin(6 * p));
  const E = k0 * N * (A + (1 - T + C) * A ** 3 / 6 + (5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5 / 120) + 500000;
  const No = k0 * (M + N * Math.tan(p) * (A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24 + (61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6 / 720));
  return { e: E, n: No };
}
export function fromUTM(E, Nn, zone = 38) {
  const L0 = rad((zone - 1) * 6 - 180 + 3), x = E - 500000, M = Nn / k0, mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu) + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const N1 = a / Math.sqrt(1 - e2 * Math.sin(p1) ** 2), T1 = Math.tan(p1) ** 2, C1 = ep2 * Math.cos(p1) ** 2, R1 = a * (1 - e2) / (1 - e2 * Math.sin(p1) ** 2) ** 1.5, D = x / (N1 * k0);
  const lat = p1 - (N1 * Math.tan(p1) / R1) * (D ** 2 / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * ep2) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * ep2 - 3 * C1 ** 2) * D ** 6 / 720);
  const lon = L0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * ep2 + 24 * T1 ** 2) * D ** 5 / 120) / Math.cos(p1);
  return { lat: deg(lat), lng: deg(lon) };
}
// المساحة بالـ UTM (Shoelace) والأطوال
export const areaUTM = P => { let s = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; s += p.e * q.n - q.e * p.n; } return Math.abs(s) / 2; };
export const dist = (p, q) => Math.hypot(p.e - q.e, p.n - q.n);
// اتجاه كل ضلع (شمال/جنوب/شرق/غرب) حسب العمودي الخارجي من مركز القطعة
export function sides(P) {
  if (P.length < 3) return [];
  const c = { e: P.reduce((s, p) => s + p.e, 0) / P.length, n: P.reduce((s, p) => s + p.n, 0) / P.length };
  return P.map((p, i) => { const q = P[(i + 1) % P.length], m = { e: (p.e + q.e) / 2, n: (p.n + q.n) / 2 }, dx = m.e - c.e, dy = m.n - c.n;
    const dir = Math.abs(dy) >= Math.abs(dx) ? (dy > 0 ? 'N' : 'S') : (dx > 0 ? 'E' : 'W'); return { i, from: i + 1, to: (i + 1) % P.length + 1, len: dist(p, q), dir }; });
}
// التاريخ
const parts = (d, cal) => { const f = new Intl.DateTimeFormat('en-u-ca-' + cal + '-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(d); const g = t => (f.find(x => x.type === t) || {}).value || ''; return [g('year').replace(/\D/g, ''), g('month'), g('day')]; };
export const hijri = (d = new Date()) => { try { const [y, m, dd] = parts(d, 'islamic-umalqura'); return `${y}/${m}/${dd}`; } catch (e) { return ''; } };
export const greg = (d = new Date()) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

// صورة خريطة للطباعة: بنجيب البلاطات ونرسم القطعة فوقها
const TILES = {
  sat: { url: (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`, max: 19, attr: '© Esri, Maxar' },
  map: { url: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`, max: 19, attr: '© OpenStreetMap' }
};
const px = (lat, lng, z) => { const s = 256 * 2 ** z, x = (lng + 180) / 360 * s, sl = Math.sin(rad(lat)); return { x, y: (0.5 - Math.log((1 + sl) / (1 - sl)) / (4 * Math.PI)) * s }; };
const loadImg = src => new Promise(r => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
export async function mapImage(LL, { kind = 'sat', w = 900, h = 600, fill = 'rgba(46,160,67,.35)', stroke = '#1f7a2e', dash = false, zoomOut = 0 } = {}) {
  if (!LL || LL.length < 1) return '';
  const T = TILES[kind], lats = LL.map(p => p.lat), lngs = LL.map(p => p.lng), cLat = (Math.min(...lats) + Math.max(...lats)) / 2, cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  let z = T.max; for (; z > 3; z--) { const a1 = px(Math.max(...lats), Math.min(...lngs), z), b1 = px(Math.min(...lats), Math.max(...lngs), z); if (b1.x - a1.x < w * .42 && b1.y - a1.y < h * .42) break; }
  z = Math.max(3, z - zoomOut);
  const c = px(cLat, cLng, z), x0 = c.x - w / 2, y0 = c.y - h / 2, cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = '#e9e6df'; g.fillRect(0, 0, w, h);
  const jobs = []; for (let tx = Math.floor(x0 / 256); tx <= Math.floor((x0 + w) / 256); tx++) for (let ty = Math.floor(y0 / 256); ty <= Math.floor((y0 + h) / 256); ty++) jobs.push(loadImg(T.url(z, tx, ty)).then(im => { if (im) g.drawImage(im, tx * 256 - x0, ty * 256 - y0); }));
  await Promise.all(jobs);
  g.beginPath(); LL.forEach((p, i) => { const q = px(p.lat, p.lng, z); i ? g.lineTo(q.x - x0, q.y - y0) : g.moveTo(q.x - x0, q.y - y0); }); g.closePath();
  g.fillStyle = fill; g.fill(); g.lineWidth = Math.max(2, w / 300); g.strokeStyle = stroke; if (dash) g.setLineDash([g.lineWidth * 2.5, g.lineWidth * 1.6]); g.stroke(); g.setLineDash([]);
  g.font = `${Math.round(w / 70)}px sans-serif`; g.fillStyle = 'rgba(255,255,255,.8)'; const tw = g.measureText(T.attr).width; g.fillRect(w - tw - 10, h - w / 55 - 6, tw + 10, w / 55 + 6); g.fillStyle = '#333'; g.fillText(T.attr, w - tw - 5, h - 6);
  try { return cv.toDataURL('image/jpeg', .9); } catch (e) { return ''; }
}
