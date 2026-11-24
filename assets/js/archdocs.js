// قسم المعماري: نصوص النماذج الرسمية ورسم كل مستند بنفس شكل ورقته الأصلية
export const DIRS = { N: 'شمال', S: 'جنوب', E: 'شرق', W: 'غرب' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const AR = s => String(s ?? '').replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const num = v => { const x = parseFloat(String(v ?? '').replace(/[^\d.\-]/g, '')); return isFinite(x) ? x : NaN; };
const f2 = v => isFinite(num(v)) ? num(v).toFixed(2) : '';
const isFence = f => /سور|أسوار|اسوار/.test(f || '');
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const DOCS = [
  { k: 'tech', t: 'التقرير الفني', ic: '📘' }, { k: 'facade', t: 'نموذج الواجهات', ic: '🏛' }, { k: 'loads', t: 'شهادة الأحمال', ic: '⚖', soon: 1 },
  { k: 'letter', t: 'خطاب (تعديل / تجديد)', ic: '✉' }, { k: 'insurance', t: 'تعهد التأمين', ic: '🛡' }, { k: 'waste', t: 'تعهد المخلفات', ic: '🚛' },
  { k: 'office', t: 'تعهد المكتب', ic: '🏢' }, { k: 'owner', t: 'تعهد المالك', ic: '✍' }, { k: 'decl', t: 'إقرار المكتب', ic: '📝' }, { k: 'fence', t: 'تعهد السور', ic: '🚧' }
];
// الخانات اللي كل مستند محتاجها (بتظهر في فورم المستند)
export const NEEDS = {
  tech: ['owner', 'plot', 'plan', 'district', 'city', 'deedArea', 'licNo', 'projType', 'req'],
  facade: ['transNo', 'plan', 'plot', 'projType', 'owner', 'city', 'district', 'buildCoef', 'designGuide', 'deedArea'],
  letter: ['sector', 'letterType', 'req'],
  insurance: ['owner', 'nationality', 'ownerId', 'plan', 'plot'],
  waste: ['sector', 'projType', 'district', 'streetWidth', 'owner', 'ownerId', 'licNo', 'wasteQty'],
  office: ['owner', 'plot', 'plan', 'district'],
  owner: ['owner', 'ownerId', 'plot', 'plan', 'district'],
  decl: ['owner'],
  fence: ['owner', 'ownerId', 'plot', 'plan', 'district', 'buildingDesc', 'ownerPhone', 'serviceNo', 'reqYear'],
  loads: []
};
export const LABELS = { owner: 'المالك', ownerId: 'هوية / سجل رقم', nationality: 'الجنسية', ownerPhone: 'جوال المالك', plot: 'رقم القطعة', plan: 'رقم المخطط', district: 'الحي', city: 'المدينة', sector: 'القطاع / نطاق البلدية', deedNo: 'رقم الصك', deedDate: 'تاريخ الصك', deedArea: 'مساحة الأرض م²', licNo: 'رقم الرخصة', licType: 'نوع الطلب في الرخصة', licDate: 'تاريخ الرخصة', projType: 'نوع المشروع / المبنى', req: 'المطلوب', transNo: 'رقم المعاملة', buildCoef: 'معامل البناء', designGuide: 'الموجه التصميمي', streetWidth: 'عرض الشارع', wasteQty: 'كمية نواتج الحفر م³', buildingDesc: 'وصف المبنى (فيلا سكنية / عمارة…)', serviceNo: 'رقم طلب الخدمة', reqYear: 'سنة الطلب (هـ)', letterType: 'نوع الخطاب' };

/* ===== النصوص الرسمية (بتتعدل من غرفة التحكم) ===== */
export const TXT = {
  owner: [
    'التعاقد مع مكتب هندسي مصمم ومشرف معتمد ومقاول نظامي معتمد لدى الهيئة السعودية للمقاولين، وأتحمل المسؤولية الكاملة في حالة حدوث أي مخالفة أو عدم الالتزام بالشروط والأنظمة، وأتعهد بإيقاف العمل بالمشروع فوراً، وللأمانة اتخاذ الإجراءات التي تراها مناسبة ضدي وتطبيق ما تقتضي به الأنظمة المعمول بها ومنها لائحة تصنيف مخالفات كود البناء السعودي ولائحة الغرامات والجزاءات عن المخالفات البلدية الصادرة المحدثة بتاريخ 1444/11/26هـ، ونظام مكافحة التزوير والغرامات المالية.',
    'التعاقد فيما يخص أعمال تنفيذ المصاعد الكهربائية وأعمال الوقاية والحماية من الحريق مع مؤسسات وشركات معتمدة من المديرية العامة للدفاع المدني وهيئة الأمن الصناعي.',
    'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان مطابقة جميع الأعمال في المشروع لمتطلبات واشتراطات كود البناء السعودي ولائحته التنفيذية، وأتحمل المسؤولية النظامية في حال مخالفة ذلك.',
    'الالتزام بتوفير جميع المستندات والبيانات المطلوبة من الجهات المختصة لضمان تنفيذ المشروع وفقاً للأنظمة والاشتراطات المعتمدة.',
    'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان تنفيذ جميع متطلبات السلامة والصحة المهنية في موقع العمل طبقاً لكود البناء السعودي، وتسوير الموقع طبقاً لدليل اشتراطات تسوير المواقع الإنشائية، ودليل تغطية المباني تحت الإنشاء.',
    'التعاون الكامل مع المكتب الهندسي المشرف والمقاول لضمان تطبيق العزل الحراري في جميع المباني الجديدة وفقاً للأمر السامي الكريم رقم (م ب/6927) وتاريخ 1431/09/22هـ، وأتحمل المسؤولية النظامية في حالة مخالفة ذلك.',
    'توفير جميع التسهيلات والمعلومات اللازمة للمكتب الهندسي المشرف والمقاول لضمان تنفيذ المشروع بفعالية.',
    'إبلاغ المكتب الهندسي المشرف والمقاول بأي تغييرات أو تعديلات أرغب في تنفيذها في المشروع، والحصول على الموافقات اللازمة من الجهات ذات العلاقة قبل التنفيذ.',
    'عدم إشغال المبنى دون إصدار شهادة الإشغال، وذلك طبقاً لما ورد في نظام تطبيق الكود السعودي الصادر بالمرسوم الملكي رقم (م/43) وتاريخ 1438/4/26هـ والمعدل بالمرسوم الملكي رقم (م/15) وتاريخ 1441/1/19هـ والمرسوم الملكي رقم (م/88) وتاريخ 1446/4/10هـ، واللائحة التنفيذية لنظام تطبيق كود البناء السعودي الصادرة بالقرار الوزاري رقم (1213ق/أع/39) وتاريخ 1439/10/14هـ والمعدلة بالقرار الوزاري (304) وتاريخ 1444/7/8هـ، ونظام إجراءات التراخيص البلدية ولائحته التنفيذية. وفي حال ثبوت عدم إصدار شهادة الإشغال يتم تطبيق الإجراءات والغرامات الواردة في لائحة تصنيف مخالفات كود البناء السعودي.',
    'تبليغ الأمانة / البلدية والجهات ذات العلاقة في حال وجود أي مخالفة يرتكبها أحد الأطراف.'
  ],
  office: [
    'مراجعة المخططات التصميمية المعدة من قبل المكتب المصمم قبل البدء بالبناء وإشعار الجهات ذات العلاقة ببدء أعمال التنفيذ.',
    'الإشراف الكامل على تنفيذ جميع أعمال المشروع وفقًا لرخصة البناء والرسومات الهندسية المعتمدة والمواصفات المعتمدة، وأتحمل المسؤولية الكاملة في حالة وجود أي مخالفة أو عدم التزام بذلك، وفي حال تقديم المكتب معلومات غير صحيحة فإن للأمانة الحق في اتخاذ الإجراءات التي تراها مناسبة ضد المكتب وتطبيق ما تقتضي به الأنظمة المعمول بها ومنها لائحة تصنيف مخالفات كود البناء السعودي ولائحة الجزاءات عن المخالفات البلدية الصادرة المحدثة بتاريخ 1444/11/26هـ، ونظام مكافحة التزوير والغرامات المالية وتعويض المتضرر في المشروع لمتطلبات واشتراطات كود البناء السعودي ولائحته التنفيذية، وأتحمل المسؤولية النظامية المخالفة وإيقاف العمل بالمشروع.',
    'التأكد من مطابقة جميع الأعمال في المشروع، وأتحمل المسؤولية في حال مخالفة ذلك.',
    'الالتزام بالإشراف على أعمال المقاول وتطبيقه لدليل تسوير المواقع الإنشائية ودليل تغطية المباني تحت الإنشاء وإبلاغ الأمانة في حال مخالفة الدليل.',
    'أتعهد أنا المكتب الهندسي المشرف بالإشراف والتأكد من التزام المقاول بالتدعيم السفلي وذلك طبقًا لما ورد بالفقرة رقم 1233 من كود البناء السعودي للتربة والأساسات (SBC303 – AR) الخاص بتتابع التدعيم السفلي والتي تنص على «يجب تنفيذ التدعيم السفلي بطريقة تتابعية لحماية المنشأة المجاورة وموقع التشييد ويجب تحديد تتابع تنفيذ التدعيم السفلي في وثائق التشييد المعتمدة».',
    'التأكد من الالتزام بنظام البناء الخاص برخصة البناء ومتابعة تطبيق جميع التعليمات والضوابط الصادرة عن الجهات الرسمية ذات الاختصاص.',
    'التنسيق المستمر مع الجهات الحكومية المختصة لضمان تنفيذ جميع الأعمال وفقًا للأنظمة واللوائح المعمول بها.',
    'تقديم تقارير دورية للمالك حول سير العمل والتحديات التي قد تواجه المشروع والحلول المقترحة.',
    'التحقق من جودة المواد المستخدمة في المشروع وضمان مطابقتها للمواصفات القياسية والمعايير المطلوبة طبقًا لكود البناء السعودي.',
    'المراجعة والعمل مع المالك والمكتب المصمم على اعتماد أي تعديلات أو تغييرات في التصاميم المعتمدة.',
    'أتعهد أنا المكتب الهندسي المشرف بالالتزام برفع التقارير الإشرافية لكل مرحلة فور الانتهاء منها، ورفع التقرير النهائي للأعمال، وإصدار شهادة الإشغال للمبنى، وإبلاغ الأمانة والجهات ذات العلاقة حال إشغال المبنى دون الحصول على شهادة الإشغال، وذلك طبقًا لما ورد في نظام تطبيق الكود السعودي الصادر بالمرسوم الملكي رقم (م / 43) وتاريخ 26 / 4 / 1438هـ والمعدل بالمرسوم الملكي رقم (م / 15) وتاريخ 19 / 1 / 1441هـ والمرسوم الملكي رقم (م / 88) وتاريخ 10 / 4 / 1446هـ، واللائحة التنفيذية لنظام تطبيق كود البناء السعودي الصادر بالقرار الوزاري رقم (1213ق/أع/39) وتاريخ 1439/10/14هـ والمعدلة بالقرار الوزاري (304) وتاريخ 1444/7/8هـ، ونظام إجراءات التراخيص البلدية ولائحته التنفيذية. وفي حال ثبوت عدم إصدار شهادة الإشغال يتم تطبيق الإجراءات والغرامات الواردة في لائحة تصنيف مخالفات كود البناء السعودي.',
    'التأكد من تطبيق العزل الحراري في جميع المباني الجديدة وفقًا للأمر السامي الكريم رقم (م ب/6927) وتاريخ 1431/09/22هـ، وأتحمل المسؤولية النظامية في حالة مخالفة ذلك.',
    'الالتزام بالحضور والتواجد خلال فترة المواعيد المحددة للتفتيش من قبل الجهات ذات العلاقة وتهيئة الموقع بشكل كامل وتوفير كافة الوثائق والمخططات وما يلزم لإتمام عملية التفتيش على الأعمال المنفذة.',
    'أتعهد أنا المكتب الهندسي المشرف بالتأكد من تنفيذ جميع متطلبات السلامة والصحة المهنية في موقع العمل وفقًا للأنظمة المعمول بها والاشتراطات الواردة في كود البناء السعودي والتعليمات الصادرة من المديرية العامة للدفاع المدني.',
    'أتعهد أنا المكتب الهندسي المشرف بالإشراف على تطبيق الاشتراطات والمعايير الخاصة في فحص وسلامة الرافعات بالفصل الرابع (الأحمال الحية) من الكود السعودي للأحمال والقوى (SBC301) ومتطلبات تصميم وسلامة هياكل التشييد (السقالات) بالفصل الثاني (تصميم هياكل التشييد)، والفصل الثالث (الأحمال في هياكل التشييد)، والفصل الرابع (اعتبارات التشييد)، والفصل الخامس (السلامة والتفتيش على هياكل التشييد) من الكود السعودي للتشييد (SBC302).',
    'أتعهد أنا المكتب الهندسي المشرف بالإشراف على تطبيق الاشتراطات والمعايير الخاصة بالتصميم المقاوم للزلازل طبقًا للدليل الإنشائي للمباني الوارد بكود البناء السعودي للاشتراطات الإنشائية (SBC300).'
  ],
  declOwner: 'بالإطلاع على اشتراطات وأنظمة البناء الواردة في الاتفاقية القانونية لرخصة اليوم الواحد أتعهد بالالتزام التام والكامل بهذه الاشتراطات والأنظمة والالتزام بتنفيذ المشروع وفقاً للمخططات المعتمدة ورخصة البناء الصادرة من أمانة منطقة الرياض للمشروع، وأن للأمانة في حال مخالفتي أحكام هذه الرخصة تطبيق علي ما تقتضي به الأنظمة المرعية، ومنها نظام البلديات، ولائحة الغرامات والجزاءات عن المخالفات البلدية الصادرة بقرار مجلس الوزراء رقم (218) في 1422/8/6هـ، والتعليمات التنفيذية للائحة مجلس الوزراء، ونظام مكافحة التزوير، التي تشتمل عقوبات الحبس، وإلغاء الرخصة، وإيقافها، والغرامات المالية، وإزالة المبنى المخالف على نفقة المالك.',
  declOffice: 'بالإطلاع على الاشتراطات والأنظمة الواردة في الاتفاقية القانونية لرخصة اليوم الواحد أتعهد بصحة كامل البيانات المقدمة من قبلنا والمذكورة في نماذج الاتفاقية وتصميم كامل مخططات المشروع بموجبها، وفي حال تقديم المكتب لمعلومات غير صحيحة أو مخططات مخالفة للاشتراطات والأنظمة فإن لأمانة منطقة الرياض اتخاذ الإجراءات التي تراها مناسبة ضد المكتب وتطبيق ما تقتضي به الأنظمة المرعية، ومنها نظام البلديات، ولائحة الغرامات والجزاءات عن المخالفات البلدية الصادرة بقرار مجلس الوزراء رقم (218) في 1422/8/6هـ، والتعليمات التنفيذية للائحة مجلس الوزراء، ونظام مكافحة التزوير، والغرامات المالية، وتعويض المتضرر من المخالفة، وأحقية الأمانة رفع دعوى التقصير المهني ضد المكتب وأن توقيع المالك لا يعفيني من المسؤولية.',
  insurance: 'أتعهد انا المذكور أعلاه بعدم الشروع في البناء نهائيا الا بعد التعاقد مع شركة التأمين وإصدار وثيقة تأمين ضد العيوب الخفية على المبنى وأتحمل كامل المسؤولية حال تم مخالفة ذلك',
  waste: 'مالك المشروع بالمسئولية الكاملة عن إزالة كافة مخلفات البناء من المبنى المذكور بياناته أعلاه ومتابعة أعمال البناء والحرص على متابعة خزان الماء المكشوف والتأكد من تغطيته وعدم تجمع النفايات حوله، والالتزام بتقديم ما يثبت تفريغ نواتج الحفر من موقع المشروع والبالغ كمياتها المتوقعة نحو {qty} م³ في المكبات الرسمية تفادياً لتطبيق لائحة الجزاءات والغرامات.',
  fence: 'وفقاً للمواصفات الموضحة بدليل اشتراطات تسوير المواقع الإنشائية الواقعة على المحاور التجارية وطبقا للنموذج الموضح أدناه وفي حال مخالفتي لما ورد بهذا التعهد فإن لأمانة منطقة الرياض الحق في تطبيق ما جاء في نظام البلديات ولائحة الغرامات والجزاءات عن المخالفات البلدية الصادرة بقرار مجلس الوزراء رقم 812 وتاريخ 1441/08/06 هـ والتعليمات التنفيذية الخاصة بها والتي تشمل ايقاف العمل بالمشروع وتوقيع الغرامات المالية وازالة ومعالجة أي أضرار تلحق بالمبنى أو المجاورين او اي اطراف أخرى تنتج عن هذه المخالفات وذلك على نفقتي الخاصة.',
  letter: 'نفيدكم نحن {office} ان رخصة {req} .',
  philo: ['الفلسفة التصميمية للعمارة السلمانية المحلية تتمحور حول الموازنة بين الأصالة والحداثة، استلهام التراث الثقافي، والتركيز على الإنسان والاستدامة البيئية.', 'دمج عناصر العمارة النجدية التقليدية (مثل الطين، الحجر، الأقواس) مع التقنيات الحديثة والمواد المعاصرة.', 'خلق هويات عمرانية سعودية مميزة تتناغم مع الطبيعة وتلبي الاحتياجات المستقبلية.', 'اختيار مجموعة من الألوان والمواد التي تستلهم من العمارة التاريخية والسياق الطبيعي لمدينة الرياض.', 'اختيار مواد تمر بمعالجات وتعكس خصائص العمارة السلمانية تجعلها الأكثر تميزا.'],
  techNotes: []
};

/* ===== أدوات الرسم ===== */
const fv = (v, w) => `<b class="fv" ${w ? `style="min-width:${w}mm"` : ''}>${esc(v || '')}</b>`;
const sigImg = (S) => S.mgrSig ? `<img class="sg" src="${S.mgrSig}" alt="">` : '';
const stampImg = (S, cls = 'stp') => S.stamp ? `<img class="${cls}" src="${S.stamp}" alt="">` : '';
const logo = S => `<img class="rlogo" src="${esc(S.amanahLogo || 'assets/img/docs/riyadh.png')}" alt="">`;
// ورقة المكتب (الخلفية الأصلية: اللوجو فوق والفوتر تحت)
const lhPage = (body, n, cls = '') => `<section class="lhp ${cls}"><div class="lhp-b">${body}</div>${n ? `<span class="lhp-n">${AR(n)}</span>` : ''}</section>`;
// هيدر نماذج الأمانة (لوجو + 3 سطور + الشريط الأخضر)
const amHead = (S, title) => `<header class="amh"><div class="amh-r">${logo(S)}<div class="amh-t">${(S.amanah || []).map((x, i) => `<span class="${i ? '' : 'b'}">${esc(x)}</span>`).join('')}</div></div><div class="amh-ttl">${esc(title)}</div></header>`;
const amFoot = () => `<footer class="amf-f"><span>amanatalriyadh</span><span>www.alriyadh.gov.sa</span></footer>`;

/* ===== 1. التقرير الفني ===== */
export async function techReport(P, S, I, today) {
  const pages = [], d = today; let n = 1;
  const reqTxt = P.req || 'تعديل مكونات الرخصة';
  pages.push(lhPage(`<div class="tr-date">${DAYS[d.getDay()]} : ${AR(d.getDate())} / ${AR(d.getMonth() + 1)} / ${AR(d.getFullYear())}</div>
    <div class="tr-cv"><h1>تقرير فني :</h1><h2>نوع المشروع / ${esc(P.projType || '')}</h2></div>
    <div class="tr-req"><mark>المطلوب :-</mark> <span>${esc(reqTxt)}</span></div>`, n++, 'tr-cover'));
  pages.push(lhPage(`<h3 class="tr-h">محتويات التقرير:</h3><table class="tr-toc"><tr><th>م</th><th>البيان</th><th>الصفحة</th></tr><tr><td>١</td><td>بيانات المكتب الهندسي</td><td>٣</td></tr><tr><td>٢</td><td>بيانات المبنى</td><td>٣</td></tr><tr><td>٣</td><td>الملاحظات</td><td>${AR('4 - ' + (6 + (P.plans || []).length))}</td></tr></table>`, n++));
  const O = S.office, kv = rows => `<table class="tr-kv">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v || '')}</td></tr>`).join('')}</table>`;
  pages.push(lhPage(`<h3 class="tr-h">بيانات المكتب الاستشاري: -</h3>${kv([['اسم المكتب الهندسي', O.short + ' ' + O.sub], ['العنوان', AR(O.addr)], ['الجوال', AR(O.phone)], ['رقم السجل التجاري', AR(O.cr)], ['المدير العام', S.mgr]])}
    <h3 class="tr-h">بيانات المبنى: -</h3>${kv([['المالك', P.owner], ['الموقع', `${/^حي/.test(P.district || '') ? '' : 'حي '}${P.district || ''} – مدينة ${P.city || 'الرياض'}`], ['رقم القطعة', AR(P.plot)], ['نوع المبنى', P.projType], ['مساحة الأرض', P.deedArea ? AR(P.deedArea) + ' م²' : ''], ['البند المطلوب فحصه', 'تقرير فني ' + reqTxt], ['التاريخ', AR(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`) + ' م']])}`, n++));
  const comps = (L, t) => `<p class="tr-cap">${t}</p><table class="tr-t"><tr><th>اسم المكون</th><th>عدد الوحدات</th><th>الاستخدام</th><th>عدد الأدوار</th><th>المساحة</th><th>النسبة</th></tr>${(L || []).map(c => `<tr><td>${esc(c.floor)}</td><td>${AR(c.units)}</td><td>${esc(c.use)}</td><td>${AR(c.count || 1)}</td><td>${AR(f2(c.area))} م${isFence(c.floor) ? ' ط' : '²'}</td><td>${num(P.deedArea) && num(c.area) && !isFence(c.floor) ? '٪ ' + AR((num(c.area) / num(P.deedArea) * 100).toFixed(2)) : ''}</td></tr>`).join('')}</table>`;
  pages.push(lhPage(`${comps(P.compsOld, 'مكونات رخصة البناء السابقة :')}${comps(P.compsNew, 'مكونات رخصة البناء حسب المخطط المقترح :')}
    <p class="tr-cap">الحدود والأطوال والارتدادات حسب المخطط المقترح :</p><table class="tr-t"><tr><th colspan="4">الحدود و الابعاد و الارتدادات بالمتر</th></tr><tr><th>الجهة</th><th>حدود الأرض</th><th>الابعاد (م)</th><th>الارتداد (م)</th></tr>${Object.entries(DIRS).map(([k, l]) => `<tr><td>${l}</td><td>${esc(P.bounds[k].desc || '')}</td><td>${AR(f2(P.bounds[k].len))} م</td><td>${AR(f2(P.bounds[k].set))} م</td></tr>`).join('')}</table>`, n++));
  let first = true;
  for (const pl of P.plans || []) {
    const added = !pl.before;
    pages.push(lhPage(`${first ? '<p class="tr-bul">• التعديلات في المخطط :</p>' : ''}<p class="tr-fl ${added ? 'add' : ''}">${added ? 'إضافة ' : ''}${esc(pl.title || '')} :</p>
      <div class="tr-ba ${added ? 'one' : ''}">${added ? '' : `<figure><figcaption>قبل التعديل</figcaption>${await I(pl.before)}</figure>`}<figure><figcaption>بعد التعديل</figcaption>${await I(pl.after)}</figure></div>`, n++)); first = false;
  }
  const old = P.compsOld || [], nw = P.compsNew || [];
  pages.push(lhPage(`<p class="tr-cap u">- جداول المقارنة بين المساحات واختلاف المساحات على الطبيعة عن المخططات المعتمدة:</p><table class="tr-t cmp"><tr><th>مساحة الأدوار</th><th>حسب الرخصة</th><th>حسب المخطط المقترح</th><th>الاستخدام</th><th>مقدار الزيادة</th></tr>${nw.map((c, i) => { const o = old.find(x => x.floor === c.floor) || old[i] || {}; const dd = (num(c.area) || 0) - (num(o.area) || 0); return `<tr><th>${esc(c.floor)}</th><td>${AR(f2(o.area))}</td><td>${AR(f2(c.area))}</td><td>${esc(c.use)}</td><td>${AR(dd.toFixed(1))}</td></tr>`; }).join('')}</table>`, n++));
  if (P.facade) pages.push(lhPage(`<p class="tr-cap c">صورة الواجهه</p><div class="tr-one">${await I(P.facade)}</div>`, n++));
  if ((P.site || []).length) pages.push(lhPage(`<p class="tr-cap">صور من الطبيعة :</p><p class="tr-bul">• ${esc(P.siteNote || 'ارض فضاء')}</p><div class="tr-site">${(await Promise.all(P.site.slice(0, 2).map(I))).join('')}</div>`, n++));
  if (P.system) pages.push(lhPage(`<p class="tr-cap">نظام البناء الجديد :</p><div class="tr-one">${await I(P.system)}</div>`, n++));
  const notes = (P.notes && P.notes.length ? P.notes : S.techNotes) || [];
  pages.push(lhPage(`${notes.length ? `<p class="tr-cap">الملاحظات :</p><ol class="tr-nt">${notes.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}<div class="tr-sig"><b>${esc(S.mgrTitle || 'المدير العام')}</b><b>${esc(S.mgr)}</b>${sigImg(S)}${stampImg(S)}</div>`, n++));
  return pages.join('');
}

/* ===== 2. نموذج الواجهات (A4 بالعرض) ===== */
export async function facadeModel(P, S, I) {
  const z = P.fz || {}, pages = [], box = (h, cls = '') => `<div class="fz-box ${cls}">${h}</div>`, note = t => t ? `<div class="fz-note"><b>ملاحظة :</b><span>${t}</span></div>` : '';
  const pg = (title, body, nt, cls = '') => `<section class="fzp ${cls}"><i class="fz-deco"></i>${title ? `<h2 class="fz-t">${title}</h2>` : ''}${body}${note(nt)}</section>`;
  const img = async (id, cap) => id ? `<figure class="fz-img">${await I(id)}${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>` : '<div class="fz-ph">مكان الصورة</div>';
  pages.push(pg('', '<h1 class="fz-cover">نموذج التقديم لمناقشة الواجهات للعمارة المحلية</h1>', '', 'cover'));
  const r = (a, b, c, d, e, f) => `<tr><th>${a}</th><td>${esc(b || '')}</td><th>${c || ''}</th><td>${esc(d || '')}</td><th>${e || ''}</th><td>${esc(f || '')}</td></tr>`;
  pages.push(pg('معلومات المشروع :', `<table class="fz-info">${r('رقم المعاملة:', P.transNo, 'رقم المخطط:', P.plan, 'رقم القطعة:', P.plot)}<tr><th>نوع المشروع:</th><td colspan="5">${esc(P.projType || '')}</td></tr>${r('اسم المالك:', P.owner, 'موقع المشروع:', P.city || 'الرياض', 'الحي:', String(P.district || '').replace(/^حي\s*/, ''))}${r('الموجه التصميمي:', P.designGuide, 'معامل البناء:', P.buildCoef, 'مساحة الارض:', P.deedArea ? P.deedArea + ' م²' : '')}</table>
    <p class="fz-sub">الموقع العام:</p><div class="fz-two">${box(await img(z.site1))}${box(await img(z.site2))}</div>`, '*توضيح الربط مع المجاورين والارصفة والشوارع ومداخل ومخارج المشروع .'));
  pages.push(pg('المصور الجوي:', box(`<div class="fz-two in">${await img(z.aerial1)}${await img(z.aerial2)}</div>`), '*توضيح الشوارع المحيطة والمباني المجاورة والمعالم .'));
  pages.push(pg('المصور الجوي:', box(await img(z.aerial3)), '*توضيح الشوارع المحيطة والمباني المجاورة والمعالم .'));
  pages.push(pg('منظور المشروع في التقديم الأولي :', box(await img(z.persp0 || P.facade))));
  const pct = (l, v) => `<tr><th>${l}</th><td>${esc(v || '')}</td></tr>`;
  pages.push(pg('', `<div class="fz-phil"><div><h2 class="fz-t">المواد المستخدمة:</h2>${box(`<div class="fz-mats">${await img(z.swatch)}<div class="fz-cols">${(z.colors || []).filter(c => c && (c.name || c.code)).map(c => `<span><i style="background:${esc(c.hex || '#ddd')}"></i>${esc(c.name || '')} <small>${esc(c.code || '')}</small></span>`).join('') || '<em>الألوان والمواد بتتكتب من الفورم</em>'}</div>${await img(z.mat1)}</div>`)}${box('<p>1-صور المواد المستخدمة<br><small>(مقاسات الحجر , تفاصيل مواد التغطية وكيفية التركيب)</small></p><p>2-توضيح المصمت والفتحات<br><small>(تحسب النسب الإجمالية)</small></p>', 'sm')}</div>
    <div><h2 class="fz-t">الفلسفة التصميمية:</h2>${box(`<ul class="fz-ul">${(z.philo && z.philo.length ? z.philo : S.philo || TXT.philo).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${await img(z.mat2)}`)}${box(`<table class="fz-pct">${pct('نسبة الألوان الأساسية :', z.pPrimary ? z.pPrimary + '%' : '')}${pct('نسبة الألوان الثانوية:', z.pSecondary ? z.pSecondary + '%' : '')}${pct('نسبة المصمت:', z.pSolid ? z.pSolid + '%' : '')}${pct('نسبة الفتحات:', z.pOpen ? z.pOpen + '%' : '')}</table>`, 'sm')}</div></div>`));
  for (const [k, cap] of [['identity', ''], ['colorsImg', 'COLORS & MATERIALS'], ['solidImg', 'SOLID & VOIDS'], ['lightImg', 'ARTIFICAL LIGHT']]) pages.push(pg('الفلسفة التصميمية:', box(await img(z[k], cap))));
  for (const [k, t] of [['front', 'الواجهة الامامية:'], ['back', 'الواجهة الخلفية:'], ['side1', 'الواجهة الجانبية 1 :'], ['side2', 'الواجهة الجانبية 2 :']]) pages.push(pg(t, box(await img(z[k])), '*توضيح الكتلة مراعاة خصوصية المجاورين (عدم الرؤية المباشرة للمجاورين).'));
  pages.push(pg('مناظير للمشروع:', box(await img((z.persp || [])[0] || P.facade))));
  const T = (z.trees || []).length ? z.trees : [{ name: 'Acacia ampliceps', t: 'الشجر' }, { name: 'Acalypha wilkesiana', t: 'الشجيرات' }, { name: 'Carissa grandiflora', t: 'نباتات مغطيات التربة' }];
  pages.push(pg('التشجير:', box(`<div class="fz-trees">${(await Promise.all(T.slice(0, 3).map(async t => `<div><b>${esc(t.t || '')}</b>${await img(t.img)}<span>${esc(t.name || '')}</span></div>`))).join('')}</div>`), '*توضيح النباتات المستخدمة وفق دليل الرياض الحضري.'));
  return pages.join('');
}

/* ===== 4. الخطاب ===== */
export function letter(P, S) {
  const body = (S.letter || TXT.letter).replace('{office}', S.office.short + ' ' + S.office.sub).replace('{req}', P.letterReq || (P.letterType === 'تجديد' ? 'تجديد رخصة بناء' : 'تعديل مكونات رخصة بناء'));
  return lhPage(`<div class="lt"><p class="lt-s">السلام عليكم ورحمة الله وبركاته</p><p class="lt-to"><span>سعادة رئيس ${esc(String(P.sector || '').replace(/^رئيس\s*/, ''))}</span><span>المحترم،،،</span></p><p>${esc(body)}</p><p class="lt-c">وشكرا لجهودكم الواضحه ،،،</p>
    <div class="lt-sig"><span>مقدم لسيادتكم</span><b>${esc(S.mgrFull || 'سعد مفرح مبارك الشمراني')}</b><span>مدير المكتب</span><div class="lt-st">${sigImg(S)}${stampImg(S)}</div><i></i></div></div>`, 0, 'letter');
}
/* ===== 5. تعهد التأمين ===== */
export function insurance(P, S, hdate) {
  return `<section class="pl ins">${logo(S)}<h2 class="pl-t">تعهد التأمين</h2>
  <p>الاسم: ${fv(P.owner, 70)}</p><p class="pl-2"><span>الجنسية : ${fv(P.nationality || 'سعودي', 25)}</span><span>بطاقة الأحوال : ${fv(P.ownerId, 35)}</span></p><p class="pl-2"><span>رقم المخطط: ${fv(P.plan, 25)}</span><span>رقم القطعة : ${fv(P.plot, 45)}</span></p>
  <p class="pl-body">${esc(S.insurance || TXT.insurance)}</p><p class="c">وهذا تعهد مني بذلك</p>
  <div class="pl-sig"><p>الأسم : ${fv(P.owner)}</p><p>التاريخ: ${fv(hdate + ' هـ')}</p><p>التوقيع: <i class="ln"></i></p></div></section>`;
}
/* ===== 6. تعهد المخلفات ===== */
export function waste(P, S, hdate) {
  return `<section class="pl wst">${logo(S)}<p class="c b">أمانة منطقة الرياض</p><h2 class="pl-t q">" تعهد إزالة النفايات ونواتج الحفر بالموقع "</h2>
  <p class="u b">بيانات الموقع:</p><table class="pl-tb"><tr><th>نطاق البلدية</th><th>نوع المبنى</th><th>اسم الحي</th><th>عرض الشارع</th></tr><tr><td>${esc(P.sector)}</td><td>${esc(P.projType)}</td><td>${esc(String(P.district || '').replace(/^حي\s*/, ''))}</td><td>${esc(P.streetWidth ? (/شارع/.test(P.streetWidth) ? P.streetWidth : 'شارع عرض ' + P.streetWidth + ' م') : '')}</td></tr><tr><th>اسم صاحب الرخصة</th><th>رقم الهوية الوطنية / السجل التجاري</th><th>رقم الرخصة</th><th>التاريخ</th></tr><tr><td>${esc(P.owner)}</td><td>${esc(P.ownerId)}</td><td>${esc(P.licNo)}</td><td>${esc(hdate)} هـ</td></tr></table>
  <p>أتعهد أنا / ${fv(P.owner)}</p><p class="pl-body">${esc((S.waste || TXT.waste).replace('{qty}', P.wasteQty || '……'))}</p>
  <div class="pl-sig r"><p>الإســــم: ${fv(P.owner)}</p><p>التوقيــــع: <i class="ln"></i></p><p>التــاريــخ: ${fv(hdate + ' هـ')}</p></div><div class="pl-stp">${stampImg(S)}</div></section>`;
}
/* ===== 7. تعهد المكتب الهندسي المشرف ===== */
export function officePledge(P, S, gdate) {
  const O = S.office;
  return `<section class="pl am">${amHead(S, 'نموذج تعهد المكتب الهندسي المشرف')}<div class="am-b">
  <p class="am-in">اتعهد انا المكتب الهندسي المشرف : ${fv(O.short + ' ' + O.sub)} ترخيص رقم : ${fv(O.lic)} المشرف على تنفيذ مشروع المالك : ${fv(P.owner)} المقام على قطعة الأرض رقم : ${fv(P.plot)} ضمن المخطط التنظيمي رقم : ${fv(P.plan)} بحي : ${fv(String(P.district || '').replace(/^حي\s*/, ''))} بالالتزام بالتالي :</p>
  <ul class="am-l sm">${(S.officeTxt || TXT.office).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  <div class="am-s"><div><span>توقيع صاحب المكتب الهندسي المشرف :</span>${sigImg(S)}</div><div><span>ختم المكتب الهندسي :</span>${stampImg(S, 'stp sm')}</div><div><span>البريد الالكتروني :</span>${fv(O.email)}</div><div><span>رقم التواصل:</span>${fv(O.phone)}</div><div><span>التاريخ :</span>${fv(gdate)}</div></div></div>${amFoot()}</section>`;
}
/* ===== 8. تعهد المالك ===== */
export function ownerPledge(P, S, gdate) {
  return `<section class="pl am">${amHead(S, 'نموذج تعهد المالك')}<div class="am-b">
  <p class="am-in">أتعهد أنا: ${fv(P.owner)} هوية / سجل رقم: ${fv(P.ownerId)} مالك المشروع لقطعة الأرض رقم: ${fv(P.plot)} ضمن المخطط التنظيمي رقم: ${fv(P.plan)} بحي: ${fv(String(P.district || '').replace(/^حي\s*/, ''))} بالالتزام بالتالي:</p>
  <ul class="am-l">${(S.pledge || TXT.owner).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
  <div class="am-s two"><div><span>الاسم:</span>${fv(P.owner)}</div><div><span>التوقيع:</span><i class="ln"></i></div><div><span>التاريخ:</span>${fv(gdate)}</div><div><span>رقم التواصل:</span>${fv(P.ownerPhone)}</div></div></div>${amFoot()}</section>`;
}
/* ===== 9. إقرار المكتب ===== */
export function declaration(P, S) {
  const O = S.office;
  return `<section class="pl dcl"><h3>إقرار مالك العقار</h3><p>أقر أنا مالك العقار : ${fv(P.owner)}</p><p class="pl-body">${esc(S.declOwner || TXT.declOwner)}</p><p>التوقيع المالك: <i class="ln"></i></p>
  <h3>إقرار المكتب الهندسي المصمم للمشروع</h3><p>أقر أنا المكتب الهندسي: ${fv(O.short + ' ' + O.sub)}</p><p>المصمم لمشروع المالك: ${fv(P.owner)}</p><p class="pl-body">${esc(S.declOffice || TXT.declOffice)}</p>
  <div class="dcl-s"><div><p>التوقيع صاحب المكتب: ${sigImg(S)}</p><p>ختم المكتب:</p></div>${stampImg(S)}</div>
  <h3>تدقيق مهندس إدارة رخص البناء في البلدية الفرعية</h3><p>بعد معاينة وتدقيق جميع الوثائق والمرفقات الخاصة بمشروع صاحب الرخصة تبين:</p><p class="dcl-c"><span>☐ مطابقتها لاشتراطات وبيانات رخصة البناء.</span><span>☐ غير مطابقة لاشتراطات وبيانات رخصة البناء.</span></p><p>اسم مهندس إدارة رخص البناء المدقق للمشروع :</p><p>التوقيع:</p><p>ختم البلدية:</p></section>`;
}
/* ===== 10. تعهد السور + كروكي أوتوماتيك ===== */
function fenceSketch(P) {
  const B = P.bounds || {}, L = k => num(B[k] && B[k].len) || 0, W = Math.max(L('N'), L('S')) || 20, H = Math.max(L('E'), L('W')) || 25, k = Math.min(420 / W, 300 / H), w = W * k, h = H * k, x0 = 340 - w / 2, y0 = 70, st = d => /شارع|طريق|ممر/.test((B[d] && B[d].desc) || '');
  const set = d => (num(B[d] && B[d].set) || 0) * k, ix = x0 + set('W'), iy = y0 + set('N'), iw = Math.max(20, w - set('W') - set('E')), ih = Math.max(20, h - set('N') - set('S'));
  const lbl = (x, y, t, r = 0, c = '#E1262B', s = 15) => `<text x="${x}" y="${y}" fill="${c}" font-size="${s}" text-anchor="middle" transform="rotate(${r} ${x} ${y})">${esc(t)}</text>`;
  const desc = (d, x, y, r) => lbl(x, y, (B[d] && B[d].desc) || 'جار', r, '#444', 12) + (st(d) ? lbl(x + (r ? (d === 'E' ? 20 : -20) : 0), y + (r ? 0 : (d === 'N' ? -18 : 18)), 'حاجز ممر مشاة مؤقت', r, '#666', 10) : '');
  return `<svg class="fen-svg" viewBox="0 0 680 460"><defs><pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="10" stroke="#555" stroke-width="1.4"/></pattern></defs>
  <rect x="${x0 - 8}" y="${y0 - 8}" width="${w + 16}" height="${h + 16}" fill="none" stroke="#7fd3c7" stroke-width="2"/><rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="#e6a" stroke-width="2"/>
  <rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="url(#hatch)" stroke="#333" stroke-width="1.5"/>
  ${lbl(340, y0 - 22, f2(L('N')) || '')}${lbl(340, y0 + h + 30, f2(L('S')) || '')}${lbl(x0 - 26, y0 + h / 2, f2(L('W')) || '', -90)}${lbl(x0 + w + 30, y0 + h / 2, f2(L('E')) || '', 90)}
  ${desc('N', 340, y0 - 40, 0)}${desc('S', 340, y0 + h + 52, 0)}${desc('W', x0 - 52, y0 + h / 2, -90)}${desc('E', x0 + w + 56, y0 + h / 2, 90)}
  ${lbl(x0 + w - 30, y0 + h + 18, 'سور مؤقت', 0, '#666', 10)}</svg>`;
}
export async function fence(P, S, I) {
  return `<section class="pl fen"><img class="fen-h" src="assets/img/docs/amanah-head.jpg" alt=""><p class="fen-d">التاريخ / &nbsp; / </p><div class="fen-ttl">تعهد التسوير المؤقت للأعمال الإنشائية</div>
  <p>اتعهد انا المواطن / الشركة / المؤسسة/ ${fv(P.owner)} بطاقة رقم / سجل تجاري / جواز سفر / ${fv(P.ownerId)}</p>
  <p>مالك المشروع لقطعة الأرض رقم ( ${fv(P.plot, 15)} ) ضمن المخطط التنظيمي رقم ( ${fv(P.plan, 15)} ) لواقعة بحي ( ${fv(String(P.district || '').replace(/^حي\s*/, ''), 15)} )</p>
  <p class="pl-body b">بإقامة سور مؤقت أثناء أعمال تنفيذ المشروع عمارة : " <span class="red">${esc(P.buildingDesc || '')}</span> " ${esc(S.fence || TXT.fence)}</p>
  <div class="fen-bar">كروكي للتسوير المقترح وفقا ابعاد الارض والشوارع المطلة عليها بموجب الرفع المساحي المعد من قبل المكتب الهندسي المصمم أو التقرير المساحي</div>
  <div class="fen-sk">${P.fenceImg ? await I(P.fenceImg) : fenceSketch(P)}</div>
  <div class="fen-f"><span>ختم وتوقيع المكتب الهندسي المشرف</span><span>رقم طلب الخدمة ${fv(P.serviceNo, 18)}</span><span>سنة الطلب ${esc(P.reqYear || '1447')} هـ</span><span>توقيع المالك</span></div>
  <div class="fen-f2"><div><b>رقم جوال المالك / الهاتف</b><b>${esc(P.ownerPhone || '')}</b></div>${stampImg(S)}${sigImg(S)}</div></section>`;
}
