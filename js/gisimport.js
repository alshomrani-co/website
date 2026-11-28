// استيراد أركان القطعة من ملفات بوابة الأمانة (Shapefile مضغوط ZIP أو .shp، KML/KMZ، GeoJSON)
// بيرجع [{x, y}] — لو الأرقام كبيرة يبقى UTM (Easting/Northing) ولو صغيرة يبقى خط طول/عرض
async function inflateRaw(u8) {
  const ds = new DecompressionStream('deflate-raw'); const s = new Blob([u8]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(s).arrayBuffer());
}
// فك ZIP بسيط (من غير مكتبات)
export async function unzip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf), out = {};
  let eo = -1; for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
  if (eo < 0) throw new Error('ملف ZIP مش سليم');
  const n = dv.getUint16(eo + 10, true); let p = dv.getUint32(eo + 16, true);
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl));
    const lnl = dv.getUint16(lo + 26, true), lxl = dv.getUint16(lo + 28, true), ds = lo + 30 + lnl + lxl, raw = u8.subarray(ds, ds + csize);
    if (!name.endsWith('/')) out[name] = method === 0 ? raw.slice() : method === 8 ? await inflateRaw(raw) : null;
    p += 46 + nl + xl + cl;
  }
  return out;
}
// قراءة .shp: أول مضلع/خط/نقاط
export function readShp(buf) {
  const dv = new DataView(buf.buffer ? buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) : buf); const shapes = [];
  let p = 100; const len = dv.byteLength;
  while (p + 8 <= len) {
    const clen = dv.getInt32(p + 4, false) * 2, rs = p + 8; if (clen <= 0 || rs + clen > len) break;
    const t = dv.getInt32(rs, true);
    if (t === 5 || t === 3 || t === 15 || t === 13 || t === 25 || t === 23) {
      const np = dv.getInt32(rs + 36, true), npt = dv.getInt32(rs + 40, true), parts = []; for (let i = 0; i < np; i++) parts.push(dv.getInt32(rs + 44 + i * 4, true));
      const po = rs + 44 + np * 4, pts = []; for (let i = 0; i < npt; i++) pts.push({ x: dv.getFloat64(po + i * 16, true), y: dv.getFloat64(po + i * 16 + 8, true) });
      const end = parts.length > 1 ? parts[1] : npt; shapes.push(pts.slice(parts[0] || 0, end));
    } else if (t === 1 || t === 11 || t === 21) shapes.push([{ x: dv.getFloat64(rs + 4, true), y: dv.getFloat64(rs + 12, true) }]);
    else if (t === 8 || t === 18 || t === 28) { const npt = dv.getInt32(rs + 36, true), pts = []; for (let i = 0; i < npt; i++) pts.push({ x: dv.getFloat64(rs + 40 + i * 16, true), y: dv.getFloat64(rs + 48 + i * 16, true) }); shapes.push(pts); }
    p = rs + clen;
  }
  // لو كل شكل نقطة واحدة (ملف نقاط الأركان) بنجمعهم
  if (shapes.length > 1 && shapes.every(s => s.length === 1)) return shapes.map(s => s[0]);
  return shapes.sort((a, b) => b.length - a.length)[0] || [];
}
function kmlPts(txt) {
  const d = new DOMParser().parseFromString(txt, 'text/xml'); const cs = [...d.getElementsByTagName('coordinates')].map(c => c.textContent.trim()).sort((a, b) => b.length - a.length);
  if (!cs[0]) return []; return cs[0].split(/\s+/).map(t => t.split(',').map(Number)).filter(a => a.length >= 2 && isFinite(a[0])).map(a => ({ x: a[0], y: a[1] }));
}
function geoPts(j) {
  const geoms = []; const walk = o => { if (!o) return; if (o.type === 'FeatureCollection') o.features.forEach(walk); else if (o.type === 'Feature') walk(o.geometry); else if (o.type === 'GeometryCollection') o.geometries.forEach(walk); else if (o.coordinates) geoms.push(o); };
  walk(j); const ring = g => g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : g.type === 'LineString' ? g.coordinates : g.type === 'Point' ? [g.coordinates] : g.type === 'MultiPoint' ? g.coordinates : [];
  const pts = geoms.every(g => g.type === 'Point') && geoms.length > 1 ? geoms.map(g => g.coordinates) : ring(geoms.sort((a, b) => JSON.stringify(b).length - JSON.stringify(a).length)[0] || {});
  // esri JSON
  if (!pts.length && j && j.features && j.features[0] && j.features[0].geometry && j.features[0].geometry.rings) return j.features[0].geometry.rings[0].map(a => ({ x: a[0], y: a[1] }));
  return pts.map(a => ({ x: +a[0], y: +a[1] }));
}
// بيشيل النقطة الأخيرة لو نفس الأولى (المضلع المقفول)
const open = P => { if (P.length > 2) { const a = P[0], b = P[P.length - 1]; if (Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6) return P.slice(0, -1); } return P; };
export async function importGIS(file) {
  const name = (file.name || '').toLowerCase(); let pts = [], prj = '';
  if (/\.(zip|kmz)$/.test(name)) {
    const z = await unzip(await file.arrayBuffer()), keys = Object.keys(z);
    const shp = keys.find(k => /\.shp$/i.test(k)), kml = keys.find(k => /\.kml$/i.test(k)), gj = keys.find(k => /\.(geo)?json$/i.test(k)), pj = keys.find(k => /\.prj$/i.test(k));
    if (pj) prj = new TextDecoder().decode(z[pj]);
    if (shp) pts = readShp(z[shp]); else if (kml) pts = kmlPts(new TextDecoder().decode(z[kml])); else if (gj) pts = geoPts(JSON.parse(new TextDecoder().decode(z[gj])));
    else throw new Error('الـ ZIP مفيهوش .shp ولا .kml');
  } else if (/\.shp$/.test(name)) pts = readShp(new Uint8Array(await file.arrayBuffer()));
  else if (/\.kml$/.test(name)) pts = kmlPts(await file.text());
  else if (/\.(geo)?json$/.test(name)) pts = geoPts(JSON.parse(await file.text()));
  else throw new Error('الصيغ المدعومة: Shapefile (ZIP أو .shp)، KML/KMZ، GeoJSON');
  pts = open(pts); if (pts.length < 3) throw new Error('الملف مفيهوش مضلع قطعة (أقل من 3 نقاط)');
  const utm = Math.abs(pts[0].x) > 180 || Math.abs(pts[0].y) > 90 || /UTM|Transverse_Mercator/i.test(prj);
  const zone = (prj.match(/UTM[_ ]?zone[_ ]?(\d+)/i) || [])[1];
  return { pts, utm, zone: zone ? +zone : 38, prj };
}
