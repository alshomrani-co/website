// قارئ المستندات بالذكاء الاصطناعي — Cloudflare Worker
// بيستقبل صور الصك/الرخصة/المخططات من بوابة الشمراني، ويبعتها لـ Claude، ويرجّع البيانات JSON.
// المتغيرات (Settings ← Variables and Secrets):
//   ANTHROPIC_API_KEY  (Secret)  مفتاح Claude من console.anthropic.com
//   FIREBASE_PROJECT   (Text)    alshmorani-1a1a2
//   ALLOWED_ORIGINS    (Text)    https://alshomrani-co.github.io
//   MODEL              (Text)    اختياري — الافتراضي claude-sonnet-5-5
//   DAILY_LIMIT        (Text)    اختياري — أقصى عدد قراءات لكل مستخدم في اليوم (الافتراضي 80)
// اختياري: KV Namespace باسم RL لعدّ القراءات اليومية.

const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
let jwkCache = { at: 0, keys: [] };

const SCHEMA = `{
 "kind": "deed | license | plan | facade | site_photo | building_system | survey_report | other",
 "fields": {
  "owner": "", "ownerId": "", "nationality": "", "ownerPhone": "",
  "plot": "", "plan": "", "block": "", "district": "", "city": "", "sector": "",
  "deedNo": "", "deedDate": "", "deedArea": "",
  "licNo": "", "licType": "", "licDate": "", "licEnd": "",
  "projType": "", "streetWidth": "", "lat": "", "lng": ""
 },
 "bounds": { "N": {"desc":"","len":"","set":""}, "S": {"desc":"","len":"","set":""}, "E": {"desc":"","len":"","set":""}, "W": {"desc":"","len":"","set":""} },
 "comps": [ {"floor":"","units":"","use":"","area":""} ],
 "planTitle": "", "planStage": "before | after | ''",
 "unsure": ["أسماء الخانات اللي مش متأكد منها"]
}`;
const PROMPT = `انت بتقرا مستند سعودي (صك ملكية من وزارة العدل أو السجل العقاري، أو رخصة بناء من بلدي، أو مخطط معماري، أو صورة واجهة/موقع).
1) حدد نوعه في kind.
2) طلّع البيانات بالظبط زي ما هي مكتوبة في المستند، من غير تخمين. أي خانة مش موجودة سيبها "".
3) حوّل الأرقام العربية (٠-٩) لأرقام إنجليزية. التواريخ اكتبها زي ما هي (هجري yyyy/mm/dd لو هجري).
4) الحدود: شمالاً/جنوباً/شرقاً/غرباً — desc هو الوصف (مثلاً "شارع عرض 20م" أو "ملك البائع" أو "قطعة رقم 2039")، len الطول بالمتر رقم بس، set الارتداد لو موجود.
5) "قطعة رقم بدون" اكتب plot = "بدون".
6) المالك: في صكوك العدل غالباً بعد "انتقلت ملكيتها لـ:" أو "باسم"، ورقم الهوية بعد "سجل مدني رقم" أو "هوية".
7) deedArea رقم بس بالمتر المربع.
8) لو مخطط معماري: planTitle اسم الدور (مثلاً "الدور الأرضي") و planStage قبل/بعد التعديل لو مكتوب.
9) حط في unsure أسماء الخانات اللي الكتابة فيها مش واضحة أو عليها ختم.
رجّع JSON بس من غير أي كلام تاني، بالشكل ده:
${SCHEMA}`;

const b64url = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function verify(token, project) {
  const [h, p, sig] = (token || '').split('.'); if (!sig) throw new Error('no token');
  const head = JSON.parse(new TextDecoder().decode(b64url(h))), body = JSON.parse(new TextDecoder().decode(b64url(p)));
  if (Date.now() - jwkCache.at > 3600e3) { const r = await fetch(JWK_URL); jwkCache = { at: Date.now(), keys: (await r.json()).keys || [] }; }
  const jwk = jwkCache.keys.find(k => k.kid === head.kid); if (!jwk) throw new Error('bad kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(sig), new TextEncoder().encode(h + '.' + p));
  const now = Date.now() / 1000;
  if (!ok || body.aud !== project || body.iss !== 'https://securetoken.google.com/' + project || body.exp < now || !body.sub) throw new Error('bad token');
  return body;
}
const cors = (origin, env) => { const ok = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean); const allow = ok.includes(origin) ? origin : ok[0] || ''; return { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }; };
const json = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', ...h } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '', H = cors(origin, env);
    if (req.method === 'OPTIONS') return new Response(null, { headers: H });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, H);
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
    if (!allowed.includes(origin)) return json({ error: 'origin not allowed' }, 403, H);
    let user; try { user = await verify((req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, ''), env.FIREBASE_PROJECT); } catch (e) { return json({ error: 'سجّل دخول البوابة الأول' }, 401, H); }
    if (env.RL) { const k = user.sub + ':' + new Date().toISOString().slice(0, 10), n = +(await env.RL.get(k) || 0); if (n >= +(env.DAILY_LIMIT || 80)) return json({ error: 'وصلت للحد اليومي للقراءات' }, 429, H); await env.RL.put(k, String(n + 1), { expirationTtl: 172800 }); }
    let body; try { body = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400, H); }
    const imgs = (body.images || []).slice(0, 4).map(d => { const m = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(d || ''); return m && { type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } }; }).filter(Boolean);
    if (!imgs.length) return json({ error: 'مفيش صور' }, 400, H);
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: env.MODEL || 'claude-sonnet-5-5', max_tokens: 2000, messages: [{ role: 'user', content: [...imgs, { type: 'text', text: PROMPT + (body.hint ? '\nملاحظة: ' + String(body.hint).slice(0, 200) : '') }] }] }) });
    if (!r.ok) return json({ error: 'AI ' + r.status, detail: (await r.text()).slice(0, 300) }, 502, H);
    const out = await r.json(), txt = (out.content || []).map(c => c.text || '').join(''), m = txt.match(/\{[\s\S]*\}/);
    try { return json(JSON.parse(m[0]), 200, H); } catch (e) { return json({ error: 'رد غير مفهوم', raw: txt.slice(0, 500) }, 502, H); }
  }
};
