// المساعد الذكي (مجاني — بدون API): يفهم التحية والطلبات ويقترح أزرار تنقل العميل
const norm = s => String(s || '').toLowerCase()
  .replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[؟?!.,،]/g, ' ').replace(/\s+/g, ' ').trim();

const SVC_KW = {
  design: /تصميم|تصاميم|مخطط|خريطه|معماري|انشائي|كهربا|ميكانيك|ديكور|واجه|لاند|design|drawing|architect|structur|interior|facade/,
  permits: /رخص|ترخيص|تصريح|اشغال|هدم|ترميم|تسوير|ملحق|بلدي|اتمام بناء|نقل ملكيه|صك|صكوك|بير|permit|licen[cs]e|occupancy|demoli|deed/,
  survey: /مساح|رفع مساحي|تجزي|فرز|حدود|اقرار|طبوغراف|تحديد|survey|subdivi|boundar|topograph/,
  supervision: /اشراف|مشرف|اشرف|خارطه|متابعه تنفيذ|استلام|مقاول|supervis|off.?plan|site engineer/,
  mep: /كهروميكانيك|الكتروميكانيك|تكييف|تهويه|سباك|صرف صحي|تيار خفيف|mep|hvac|plumb|electromech/,
  safety: /سلامه|دفاع مدني|الدفاع|حريق|انذار|اطفا|هروب|safety|fire|civil defen|alarm/,
  pm: /اداره مشاريع|اداره المشروع|دراسه جدوي|مستخلص|عقود|تمثيل المالك|project manag|cost estim/,
  '3d': /3d|ثري دي|ثلاثي|ريندر|مجسم|تصور|render|visuali/
};
// تصحيح الأخطاء الإملائية: كلمة قريبة (فرق حرف أو اتنين) من كلمة مفتاحية بتتحسب
const lev = (a, b) => { if (Math.abs(a.length - b.length) > 2) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
const SVC_WORDS = { survey: ['مساحه', 'مساحي', 'كروكي', 'تجزئه', 'فرز', 'رفع', 'احداثيات', 'اقرار'], design: ['تصميم', 'تصاميم', 'مخطط', 'مخططات', 'معماري', 'انشائي', 'واجهه', 'واجهات'], permits: ['رخصه', 'رخص', 'ترخيص', 'بلدي', 'اشغال', 'ترميم'], supervision: ['اشراف', 'مشرف', 'خارطه'], safety: ['سلامه', 'حريق', 'دفاع'], mep: ['تكييف', 'كهربا', 'سباكه'], '3d': ['ريندر', 'ثلاثي', 'مجسم'] };
function fuzzySvc(n) { const w = n.split(' ').filter(x => x.length >= 4); for (const id in SVC_WORDS) for (const k of SVC_WORDS[id]) for (const x of w) if (lev(x, k) <= (k.length >= 6 ? 2 : 1)) return id; return null; }
const I = [
  { k: 'salam', re: /(^|\s)(السلام|سلام عليكم|سلام عليك|السلام عليكم|سلام)(\s|$)|assalam|salam/ },
  { k: 'hello', re: /^(مرحبا|مرحبتين|هلا|هلا والله|اهلا|اهلين|هاي|صباح|مساء|يا هلا|hi|hello|hey|good (morning|evening))/ },
  { k: 'howru', re: /كيفك|كيف حالك|شلونك|اخبارك|كيف الحال|how are you/ },
  { k: 'thanks', re: /شكرا|مشكور|يعطيك العافيه|الله يعطيك|جزاك|تسلم|ما قصرت|thank|thx/ },
  { k: 'bye', re: /مع السلامه|باي|في امان الله|الله معك|bye|goodbye/ },
  { k: 'human', re: /موظف|مهندس|بشري|شخص|اكلم احد|ابي اكلم|ابغى اكلم|انسان|human|agent|real person|speak to/ },
  { k: 'track', re: /تتبع|طلبي|رقم الطلب|رقم طلب|حاله الطلب|وين وصل|track|my request|status/ },
  { k: 'price', re: /سعر|اسعار|كم السعر|بكم|كم يكلف|تكلفه|تكلف|كم ياخذ|كم تاخذ|فلوس|مبلغ|خصم|عرض سعر|price|cost|how much|quote|fee/ },
  { k: 'time', re: /كم ياخذ وقت|كم مده|المده|مده|كم يوم|كم اسبوع|متي يخلص|متي تخلص|how long|duration|time does/ },
  { k: 'location', re: /وين|موقعكم|عنوان|لوكيشن|فرع|فروع|مكانكم|location|where|address|branch/ },
  { k: 'hours', re: /دوام|ساعات|اوقات|متي تفتح|مفتوح|متي|hours|open|working/ },
  { k: 'contact', re: /رقم|جوال|تلفون|هاتف|اتصال|اتصل|واتس|ايميل|بريد|تواصل|phone|number|call|whatsapp|email|contact/ },
  { k: 'license', re: /ترخيص الهيئه|معتمد|معتمدين|اعتماد|هيئه المهندسين|ريجا|rega|sce|licens|accredit|certified/ },
  { k: 'jobs', re: /وظيفه|وظايف|توظيف|تدريب|سيره ذاتيه|cv|job|career|hiring|intern/ },
  { k: 'complain', re: /شكوي|مشكله|زعلان|متضايق|سيء|تاخير|complain|problem|issue|bad/ },
  { k: 'offer', re: /عرض|عروض|تخفيض|offer|discount|promo/ },
  { k: 'social', re: /انستا|تيك|سناب|يوتيوب|تويتر|اكس|سوشيال|instagram|tiktok|snap|youtube|twitter|social/ },
  { k: 'who', re: /مين انتم|من انتم|عن الشركه|نبذه|مين انت|من انت|who are you|about you|about the company/ },
  { k: 'project', re: /مشروعي|متابعه مشروع|تقرير مشروعي|تقارير|كود|الكود|ربط|حسابي|my project|follow my|my reports|code/ },
  { k: 'deed', re: /صك|صكوك|وثيقه|عقد|رقم القطعه|قطعه|مخطط رقم|deed|plot/ },
  { k: 'lost', re: /مش فاهم|ما فهمت|مافهمت|مو فاهم|مفيش فايده|ما في فايده|غلط|مو هذا|مش ده|not helpful|wrong answer|you don.?t understand/ },
  { k: 'want', re: /ابغي|ابغا|ابي|اريد|احتاج|محتاج|عندي|ودي|need|want|looking for|i'd like/ }
];

export function makeBot(ctx) {
  // ctx: { V(), lang(), t(k), wa(text), tel }
  const en = () => ctx.lang() === 'en';
  const S = (ar, e) => en() ? e : ar;
  const chip = (label, go, ext) => ({ label, go, ext });
  const svcChips = () => ctx.V().services.map(v => chip(v.title, '#/service/' + v.id));
  const liveChip = () => chip(S('🧑‍💼 كلّم موظف هنا', '🧑‍💼 Chat with our team'), '#chat');
  const contactChips = q => [liveChip(), chip(S('📞 اتصال', '📞 Call'), ctx.tel(), 1), chip(S('💬 واتساب', '💬 WhatsApp'), ctx.wa(q), 1)];
  function findSvc(q) { const n = norm(q); for (const id in SVC_KW) if (SVC_KW[id].test(n)) { const v = ctx.V().services.find(x => x.id === id); if (v) return v; } const f = fuzzySvc(n); return f ? ctx.V().services.find(x => x.id === f) || null : null; }
  // أسئلة وأجوبة بتتضاف من لوحة التحكم (كلمات مفتاحية مفصولة بفاصلة)
  function custom(q) { const n = norm(q), L = ctx.V().botQA || []; let best = null, sc = 0; L.forEach(x => { if (!x || !x.k || !x.a) return; const ks = String(x.k).split(/[،,]/).map(k => norm(k)).filter(Boolean); const s = ks.filter(k => n.includes(k) || n.split(' ').some(w => w.length >= 4 && lev(w, k) <= 1)).length; if (s > sc) { sc = s; best = x; } }); return sc ? best : null; }
  function faq(q) {
    const w = norm(q).split(' ').filter(x => x.length > 2); let best = null, sc = 0;
    ctx.V().faq.forEach(f => { const t = norm(f.q + ' ' + f.a), tq = norm(f.q); let s = 0; w.forEach(x => { if (t.includes(x)) s += tq.includes(x) ? 2 : 1; }); if (s > sc) { sc = s; best = f; } });
    return sc >= 3 ? best : null;
  }
  function answer(q) {
    const V = ctx.V(), n = norm(q), hit = k => I.find(x => x.k === k).re.test(n), C = V.contact;
    const svc = findSvc(q);
    const out = (text, chips = [], extra) => Object.assign({ text, chips }, extra || {});
    const cq = custom(q); if (cq) return out(cq.a.replace(/\n/g, '<br>'), cq.link ? [chip(cq.btn || S('التفاصيل', 'Details'), cq.link, /^https?:/.test(cq.link) ? 1 : 0)] : []);
    if (hit('lost')) return out(S('آسف إني ما فهمتك صح 🙏', 'Sorry I didn\'t get that right 🙏'), [], { human: 1 });
    if (hit('project')) return out(S('تقدر تتابع مشروعك وتقاريره من «دخول» ← حسابك. لو حسابك لسه مش مربوط بمشروعك، ابعت الكود اللي ظهرلك وقت التسجيل للمهندس أو كلّمنا هنا ونربطك.', 'Follow your project from Login → your account. If it\'s not linked yet, send the code you got at sign-up to your engineer.'), [chip(S('دخول', 'Login'), '#/account')]);
    if (hit('deed')) return out(S('ابعتلنا صورة الصك وموقع الأرض (لوكيشن) ونرد عليك بالمطلوب والتكلفة 👌 تقدر ترفع الصك من صفحة طلب الخدمة.', 'Send us the deed photo and land location 👌 You can upload it on the request page.'), [chip(S('اطلب خدمة وارفع الصك', 'Request & upload deed'), '#/request')].concat(contactChips(q).slice(2)));
    if (hit('salam')) return out(S('وعليكم السلام ورحمة الله وبركاته 🌷 حيّاك الله في شركة سعد الشمراني. وش اللي تحتاجه اليوم؟', 'Wa alaikum assalam 🌷 Welcome to Al-Shamrani Engineering. How can we help you today?'), svcChips().slice(0, 4).concat([chip(S('كل الخدمات', 'All services'), '#/services')]));
    if (hit('hello') && !svc) return out(S('هلا والله وغلا 👋 حيّاك الله! وش اللي تحتاجه؟ تصميم، رخصة، رفع مساحي، إشراف، أو سلامة؟', 'Hello and welcome 👋 What do you need? Design, permits, surveying, supervision or safety?'), svcChips().slice(0, 5));
    if (hit('howru')) return out(S('الحمد لله بخير، الله يسلّمك 🌷 كيف أقدر أخدمك؟', 'All good, thank you 🌷 How can I help you?'), svcChips().slice(0, 4));
    if (hit('thanks')) return out(S('العفو، هذا واجبنا 🌷 لو احتجت أي شي ثاني أنا موجود.', 'You\'re welcome 🌷 I\'m here if you need anything else.'), [chip(S('اطلب خدمة', 'Request a service'), '#/request')]);
    if (hit('bye')) return out(S('في أمان الله 🌷 نتشرّف بخدمتك في أي وقت.', 'Goodbye 🌷 We\'re always happy to help.'));
    if (hit('human') || hit('complain')) return out(S(`أكيد 🙏 تقدر تكلّم فريقنا مباشرة على <b dir="ltr">${C.phone}</b> أو واتساب، أو تفتح طلب دعم ونرد عليك برقم طلب.`, `Sure 🙏 You can reach our team directly on <b dir="ltr">${C.phone}</b> or WhatsApp, or open a support request.`), contactChips(q).concat([chip(S('افتح طلب دعم', 'Open a request'), '#/request')]));
    if (hit('track')) return out(S('تقدر تتابع طلبك برقم الطلب وجوالك من صفحة «تتبع طلبك».', 'You can track your request with its number and your mobile on the "Track request" page.'), [chip(S('تتبع طلبك', 'Track request'), '#/track')]);
    if (hit('price')) {
      const pk = V.packages.on && (/اشراف|باق|supervis|package/.test(n) || (svc && svc.id === 'supervision'));
      if (pk) return out(S('باقات الإشراف الشامل:<br>', 'Supervision packages:<br>') + V.packages.list.map(p => `• <b>${p.name}</b> — ${p.price} ${p.unit}`).join('<br>') + S('<br>والتفاصيل النهائية تتحدد حسب المشروع.', '<br>Final details depend on the project.'), [chip(S('تفاصيل الباقات', 'Package details'), '#/packages'), chip(S('اطلب عرض سعر', 'Get a quote'), '#/request?s=supervision')].concat(contactChips(q).slice(1)));
      return out(S(`السعر يعتمد على المشروع 👌 — نوعه ومساحته وعدد أدواره ونطاق العمل${svc ? ` في <b>${svc.title}</b>` : ''}. أرسل لنا صورة الصك وموقع الأرض ونعطيك عرض سعر مكتوب وواضح، والاستشارة الأولى مجانية.`, `The price depends on the project 👌 — its type, area, floors and scope${svc ? ` for <b>${svc.title}</b>` : ''}. Send the deed and location and we\'ll give you a clear written quote; the first consultation is free.`), [chip(S('اطلب عرض سعر', 'Get a quote'), '#/request' + (svc ? '?s=' + svc.id : ''))].concat(V.packages.on ? [chip(S('باقات الإشراف', 'Supervision packages'), '#/packages')] : []).concat(contactChips(q).slice(1)));
    }
    if (hit('time')) { const f = faq(q) || V.faq[0]; return out(f.a, [chip(S('اطلب الخدمة', 'Request now'), '#/request' + (svc ? '?s=' + svc.id : ''))].concat(contactChips(q).slice(1))); }
    if (hit('location')) return out(S(`📍 ${C.address}<br>وعندنا ${V.branches.length} فروع: ${V.branches.map(b => b.name).join('، ')}.`, `📍 ${C.address}<br>We have ${V.branches.length} branches: ${V.branches.map(b => b.name).join(', ')}.`), [chip(S('الخريطة', 'Map'), C.map, 1), chip(S('الفروع', 'Branches'), '#/contact')]);
    if (hit('hours')) return out('🕘 ' + C.hours.join('<br>'), contactChips(q));
    if (hit('license')) return out(S('الشركة مرخّصة من الهيئة السعودية للمهندسين، ومعتمدة من الهيئة العامة للعقار (REGA) للإشراف على البيع على الخارطة، ومصنّفة في منصة بلدي.', 'The firm is licensed by the Saudi Council of Engineers, accredited by REGA for off-plan supervision, and classified on Balady.'), [chip(S('التراخيص', 'Licences'), '#/about')]);
    if (hit('jobs')) return out(S(`حيّاك الله 🌷 أرسل سيرتك الذاتية على الإيميل <b>${C.email}</b> واكتب التخصص في العنوان.`, `Welcome 🌷 Send your CV to <b>${C.email}</b> with your specialty in the subject.`), [chip(S('أرسل إيميل', 'Send email'), 'mailto:' + C.email, 1)]);
    if (hit('offer')) { const o = V.offer; return out(o && o.on ? `🎁 <b>${o.title}</b><br>${o.text}` : S('حالياً ما فيه عرض معلن، بس الاستشارة الأولى دايماً مجانية 🌷', 'No active offer right now, but the first consultation is always free 🌷'), o && o.on ? [chip(o.btn || S('استفد من العرض', 'Claim'), o.link || '#/request')] : [chip(S('اطلب استشارة', 'Free consultation'), '#/request')]); }
    if (hit('social')) return out(S('تابع شغلنا اليومي على حساباتنا 👇', 'Follow our daily work 👇'), [chip(S('السوشيال ميديا', 'Social media'), '#/media')]);
    if (hit('who')) return out(V.about.lead, [chip(S('من نحن', 'About us'), '#/about'), chip(S('أعمالنا', 'Our projects'), '#/projects')]);
    if (hit('contact')) return out(S(`📞 <b dir="ltr">${C.phone}</b><br>✉️ ${C.email}`, `📞 <b dir="ltr">${C.phone}</b><br>✉️ ${C.email}`), contactChips(q));
    if (svc) return out(`<b>${svc.title}</b><br>${svc.desc}`, [chip(S('تفاصيل الخدمة', 'Service details'), '#/service/' + svc.id), chip(S('اطلب الخدمة', 'Request it'), '#/request?s=' + svc.id)].concat(contactChips(q).slice(1)));
    const f = faq(q); if (f) return out(f.a, [chip(S('مركز الدعم', 'Support centre'), '#/support')]);
    if (hit('want')) return out(S('أبشر 👌 اختر الخدمة اللي تحتاجها:', 'Sure 👌 pick the service you need:'), svcChips());
    return out(S(`ما فهمت طلبك تماماً 🙏 تقدر تكلّم فريقنا مباشرة على <b dir="ltr">${C.phone}</b> وبيخدمونك.`, `I didn\'t quite get that 🙏 You can call our team directly on <b dir="ltr">${C.phone}</b>.`), contactChips(q).concat([chip(S('افتح طلب', 'Open a request'), '#/request')]), { miss: 1 });
  }
  const answer2 = q => { const a = answer(q); const n = norm(q); if (I.find(x => x.k === 'human').re.test(n)) a.human = 1; return a; };
  return { answer: answer2 };
}
