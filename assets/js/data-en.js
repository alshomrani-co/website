// English overlay — same shape as DEFAULT; only text fields. Empty/missing → falls back to Arabic.
export const EN = {
  brand: { name: 'Saad M. Al-Shamrani Engineering Consultancy', short: 'Al-Shamrani Engineering', tagline: 'From plan to handover' },
  contact: {
    address: 'Riyadh — Al-Arid District — Rayhana Bint Zaid St., 13338',
    hours: ['Saturday: 11 AM – 9 PM', 'Sunday – Wednesday: 9 AM – 9 PM', 'Thursday: 9 AM – 5 PM'],
    replyNote: 'We reply during working hours · Sat – Thu',
    waText: 'Hello, I would like to request an engineering consultation.'
  },
  hero: {
    eyebrow: 'Licensed engineering consultancy since 2016',
    title: 'From the plan', highlight: 'to the handover',
    lead: 'Design, building permits, land surveying, engineering supervision and fire-safety systems — all under one roof, with a licensed and officially accredited team.',
    cta1: 'Get a free consultation', cta2: 'Explore our services'
  },
  stats: [{ l: 'Founded' }, { l: 'Branches in KSA' }, { l: 'Detailed engineering services' }, { l: 'Delivered & documented projects' }],
  services: [
    { title: 'Design Services', short: 'Architectural, structural, electrical, mechanical, energy-efficiency and fire-safety designs.',
      desc: 'A complete design package covering every discipline — from architectural and structural drawings to interior design and landscape — with cross-discipline internal review before delivery.',
      items: ['Structural design', 'Architectural design', 'Electrical design', 'Mechanical design', 'Energy-efficiency design', 'Fire-safety drawings', 'Exterior façades', 'Landscape design', 'Interior design'],
      fit: 'Villas, residential buildings, commercial & office buildings, educational, healthcare and hospitality facilities' },
    { title: 'Permits & Municipal Services', short: 'Issuing and renewing building, demolition and renovation permits, occupancy and completion certificates.',
      desc: 'Sixteen permitting services handled entirely on your behalf — from opening the file until the permit or occupancy certificate is issued, without you visiting any authority.',
      items: ['Building permits', 'Demolition permits', 'Renovation permits', 'Building permit renewal', 'Adding / modifying building components', 'Occupancy certificate', 'Fencing & annex permits', 'Permit ownership transfer', 'Existing-building regularisation permit', 'Technical report', 'Building completion certificate', 'Deed subdivision & merger', 'Site preparation permit', 'Well drilling permit', 'Electronic deed amendment', 'Paper deed update'],
      fit: 'All residential and commercial buildings within the Riyadh, Asir and Makkah municipalities' },
    { title: 'Land Surveying & Planning', short: 'Survey reports, topographic surveys, land subdivision and unit sorting.',
      desc: 'Accurate field surveys and complete land transactions — from the survey report to real-estate unit sorting.',
      items: ['Survey reports (Iqrar Masahi)', 'Topographic surveying', 'Land subdivision', 'Real-estate unit sorting'],
      fit: 'Raw land, existing buildings, residential and commercial compounds' },
    { title: 'Engineering Supervision', short: 'Supervision of all construction stages, off-plan sales and civil defence.',
      desc: 'Documented on-site supervision of every construction stage, including off-plan projects approved by the Real Estate General Authority.',
      items: ['Supervision of all structural and architectural works', 'Off-plan sales project supervision', 'Civil defence supervision', 'Quantity surveying'],
      fit: 'Residential and commercial projects, and REGA-supervised real-estate developments' },
    { title: 'Fire & Life Safety', short: 'Alarm and fire-fighting systems, escape routes and hydraulic calculations.',
      desc: 'Fire-safety system design to international standards and its approval by Civil Defence — a prerequisite for operating any facility.',
      items: ['Design of all engineering safety systems to international standards', 'Early-warning alarm and fire-fighting design', 'Escape routes and evacuation plans per Civil Defence', 'Hydraulic calculations for fire-fighting systems', 'Supervising installation and conformity to drawings', 'Construction-material review against Civil Defence codes', 'Drawing approval by the competent authorities'],
      fit: 'Commercial, educational, healthcare and hospitality facilities, warehouses, fuel stations, high-occupancy buildings' },
    { title: 'Project Management', short: 'Engineering, technical and financial studies, owner representation and progress tracking.',
      desc: 'Engineering, technical and financial consulting for projects, and full owner representation throughout delivery.',
      items: ['Engineering & technical consulting', 'Financial studies & cost estimation', 'Owner representation before contractors and authorities', 'Schedule & progress tracking', 'Contract, payment and change-order review', 'Periodic management reports'],
      fit: 'Medium and large projects that need a neutral party representing the owner' },
    { title: '3D Design & Visualisation', short: 'Realistic building and villa design, interior & exterior renders, modern façades.',
      desc: 'We turn the plan into a realistic image before construction — 3D design and rendering of façades and interiors so you can approve your project with confidence.',
      items: ['Realistic architectural design for buildings and villas', 'Professional interior & exterior renders', 'Modern architectural façades'],
      fit: 'Villas, buildings, restaurants and shops, real-estate developments' }
  ],
  cats: ['Commercial', 'Hospitality', 'Education', 'Healthcare', 'Residential', 'Services', 'Industrial', '3D Design', 'Surveying'],
  projects: [
    { tag: 'Commercial · Banking', title: 'Arab National Bank — Laban Branch', desc: 'Fit-out of a bank branch to the approved brand identity, coordinated with security, safety and Civil Defence requirements.', loc: 'Riyadh', scope: 'Design & construction supervision' },
    { tag: 'Commercial · Banking', title: 'Arab National Bank — Al-Waalan, East Naseem', desc: 'A second bank branch within the same identity, security and safety framework.', loc: 'Riyadh', scope: 'Design & construction supervision' },
    { tag: 'Commercial · Retail', title: 'Jawaher Al-Qimma Mall', desc: 'Multi-shop retail centre designed around escape routes, occupancy load and mall safety requirements.', loc: 'Riyadh', scope: 'Design & supervision' },
    { tag: 'Commercial · Retail', title: 'Dar\'a Perfumes Showrooms', desc: 'A chain of retail showrooms with unified visual identity, interiors and lighting that serve the product.', loc: 'Riyadh', scope: 'Interior design & supervision' },
    { tag: 'Commercial', title: 'Al-Maadin — Makkah Road', desc: 'Commercial project on Makkah Road including design and construction supervision.', loc: 'Riyadh', scope: 'Design & supervision' },
    { tag: 'Hospitality', title: '4-Star Hotel — Qurtubah', desc: 'Four-star hotel covering architectural design, safety systems and escape routes with Civil Defence approval.', loc: 'Riyadh', scope: 'Design & engineering supervision' },
    { tag: 'Education', title: 'American International School', desc: 'Educational facility fully compliant with safety, escape-route and occupancy requirements.', loc: 'Riyadh', scope: 'Design & engineering supervision' },
    { tag: 'Healthcare', title: 'Sajaya Medical Care Clinic', desc: 'MEP, alarm and fire-fighting design for a medical facility, approved by the authorities.', loc: 'Riyadh', scope: 'MEP & safety systems design' },
    { tag: 'Residential', title: 'Residential Compound — Al-Sulaiman Real Estate', desc: 'Multi-unit residential compound with architectural and structural design and construction supervision.', loc: 'Riyadh', scope: 'Design & supervision' },
    { tag: 'Residential', title: 'Maskan Rafaha Real Estate Project', desc: 'Residential development including design and supervision of construction stages.', loc: 'Riyadh', scope: 'Design & supervision' },
    { tag: 'Residential · Private', title: 'Oval Palace', desc: 'Private residential palace with bespoke architecture and full supervision to final finishes.', loc: 'Riyadh', scope: 'Architectural design & supervision' },
    { tag: 'Residential', title: 'Residential Building', desc: 'Residential building covering design, permit and supervision through to the occupancy certificate.', loc: 'Riyadh', scope: 'Design, permit & supervision' },
    { tag: 'Services', title: 'Petro Sahm Fuel Station', desc: 'Fuel station with special safety requirements, fire-fighting systems and strict Civil Defence codes.', loc: 'Riyadh', scope: 'Design & safety systems' },
    { tag: 'Services', title: 'Liter Fuel Station', desc: 'A second fuel station in the same technical and safety category.', loc: 'Riyadh', scope: 'Design & safety systems' },
    { tag: 'Industrial', title: 'Al-Murini Warehouses', desc: 'Industrial warehouses with long-span structural design and fire-fighting suited to the stored goods.', loc: 'Riyadh', scope: 'Structural design & supervision' },
    { tag: 'Services', title: 'Kia Service Workshop', desc: 'Vehicle workshop with special ventilation, safety and waste-handling requirements.', loc: 'Riyadh', scope: 'Design & supervision' },
    { tag: 'Services', title: 'Gas Retail Outlet', desc: 'Gas outlet with strict Civil Defence codes and dedicated alarm and fire-fighting systems.', loc: 'Riyadh', scope: 'Design & safety systems' },
    { tag: '3D Design', title: '3D Design — Architectural Models', desc: '3D models and perspectives showing the building and its finishes before construction starts.', loc: 'Riyadh', scope: 'Modelling & renders' },
    { tag: '3D Design', title: '3D Design — Restaurant', desc: 'Restaurant interior with 3D modelling of lighting, finishes and seating layout.', loc: 'Riyadh', scope: 'Interior design & modelling' },
    { tag: 'Surveying', title: 'Surveying & Deeds', desc: 'Field surveys, survey reports, deed subdivision and merger, and unit sorting for individuals and developers.', loc: 'Riyadh · Bisha · Makkah', scope: 'Surveying & sorting' }
  ],
  confidential: 'Much of our work is covered by confidentiality agreements with banks, healthcare providers and developers, and is published only with the owner\'s written consent. We prefer to state the actual scope rather than publish images that are not ours. The full portfolio is available on request.',
  gallery: [
    { title: 'Surveying Department', sub: 'Field survey with a total station' }, { title: 'Land Staking', sub: 'Fixing boundary points on site' },
    { title: 'On-site Supervision', sub: 'Rebar inspection before casting' }, { title: 'From the Field', sub: 'Our team on site every day' },
    { title: 'Architectural Working Drawing', sub: 'Approved space planning and dimensions' }, { title: '3D Design', sub: 'See your project before it is built' },
    { title: 'Topographic Surveying', sub: 'Precision from the first point' }, { title: 'Structural Design', sub: 'Complete structural model' }
  ],
  packages: {
    title: 'Comprehensive Supervision Packages', sub: 'Choose the package that fits your project — all details are set out in the contract before we start.',
    list: [
      { name: 'Basic', unit: 'SAR', note: 'Covers structure stages or finishing stages', features: ['Accredited engineering supervision', 'Site visits with photo-documented reports'] },
      { name: 'Advanced', unit: 'SAR', note: 'Covers structure stages or finishing stages', features: ['Accredited engineering supervision', 'Site visits with photo-documented reports', 'Closer follow-up of construction stages'] },
      { name: 'Comprehensive', unit: 'SAR / month', note: 'Resident engineer on site throughout construction', features: ['Resident site engineer', 'Periodic reports and photo documentation'] }
    ]
  },
  about: {
    title: 'A Saudi engineering firm — from one branch to a network',
    lead: 'Founded in 2016 to be a leading engineering consultancy, with quality, precision and commitment at the heart of everything we do.',
    story: ['Saad M. Al-Shamrani Engineering Consultancy was founded in 2016. After the success of the main branch, it expanded with branches across Saudi Arabia — in Riyadh, Bisha and Makkah — reflecting the growing trust of our clients.',
      'Our specialised engineering team delivers integrated solutions that combine a modern vision with the highest technical and regulatory standards, across six service categories with more than forty sub-services — partnering with you to turn ideas into reality.'],
    quote: 'Our goal is to turn your idea into a real building — with the least hassle and the clearest agreement, from the first call to the keys.',
    quote2: 'A client does not need to understand engineering — they need to understand what will happen, when, and for how much. Our job is to make that clear from day one.',
    ceo: 'Eng. Saad M. Al-Shamrani', ceoTitle: 'General Manager',
    why: [
      { t: 'One integrated team', d: 'Architecture, structure, electrical, mechanical, surveying and safety — all coordinated in-house, so you deal with one party.' },
      { t: 'Experience since 2016', d: 'Over twenty documented projects across commercial, residential, industrial, hospitality, healthcare and education, for individuals and twelve developers.' },
      { t: 'Valid licences & accreditations', d: 'Saudi Council of Engineers licence, REGA off-plan accreditation, and Balady classification for city service providers.' },
      { t: 'Wider coverage', d: 'Branches in Riyadh, Bisha and Makkah — following up your files with three municipalities with minimal waiting.' }
    ],
    steps: [
      { t: 'Contact us', d: 'By WhatsApp or phone — we listen to your needs and your project or transaction.' },
      { t: 'Free consultation', d: 'We review your site, deed and requirements and recommend the best technical path and timeline.' },
      { t: 'Clear proposal & price', d: 'A detailed contract with scope and payment schedule — no surprises later.' },
      { t: 'Delivery & follow-up', d: 'Periodic reports and photo documentation until handover or the transaction is complete.' }
    ],
    licenses: [
      { name: 'Saudi Council of Engineers (SCE) Licence', badge: 'Final licence', desc: 'Licence to practise engineering consultancy, authorising the firm to prepare drawings and supervise works before official authorities.', fields: [['Licence no.', '5110104772'], ['Category', 'Engineering consultancy office'], ['Issued', '30/05/1443 H'], ['Expires', '10/06/1449 H']] },
      { name: 'Real Estate General Authority (REGA)', badge: 'Accredited consultant', desc: 'Accreditation as an engineering consultant qualified to supervise off-plan sale and lease projects and issue progress reports.', fields: [['Type', 'Engineering consultant — off-plan sale & lease'], ['Certificate no.', 'E0731'], ['Granted', '2025/08/07'], ['Issue no.', '199011']] },
      { name: 'Balady City Service Providers Classification', badge: 'Classified', desc: 'Approved classification in the engineering offices field on the Balady platform, with a documented credit rating.', fields: [['Classification no.', '2024010049'], ['Field', 'Engineering offices'], ['Credit rating', '65.0'], ['Issued', '12/09/2024']] },
      { name: 'Commercial Registration & Activity Licence', badge: 'Valid', desc: 'Commercial registration from the Ministry of Commerce and an activity licence from the Riyadh Municipality.', fields: [['Unified no.', '2028159650'], ['Activity licence no.', '43089488218'], ['CR issued', '03/01/2022']] },
      { name: 'VAT Registration (ZATCA)', badge: 'Valid', desc: 'Registered with the Zakat, Tax and Customs Authority with a quarterly tax period.', fields: [['VAT no.', '301358763600003'], ['Effective', '31/01/2021'], ['Tax period', 'Quarterly']] }
    ],
    isic: [['711011', 'Engineering consultancy in fire prevention and protection'], ['711012', 'Technical services for fire prevention and protection'], ['711013', 'Engineering and architectural consultancy'], ['711014', 'Construction project management'], ['711015', 'Urban-planning engineering consultancy'], ['711016', 'Environmental-architecture consultancy'], ['711031', 'Roads, bridges and tunnels consultancy'], ['711032', 'Electrical, excavation, safety and chemical engineering'], ['711035', 'Railway engineering consultancy'], ['711036', 'Seaports and marine construction consultancy'], ['711037', 'Water and wastewater consultancy'], ['711041', 'Mechanical engineering consultancy'], ['749063', 'Marine consultancy'], ['749072', 'Geological consultancy']]
  },
  branches: [
    { name: 'Head Office — Riyadh', addr: 'Al-Arid District, Rayhana Bint Zaid St., 13338', auth: 'Riyadh Municipality' },
    { name: 'Second Branch — Riyadh', addr: 'Riyadh', auth: 'Riyadh Municipality' },
    { name: 'Bisha Branch', addr: 'Bisha', auth: 'Asir Municipality' },
    { name: 'Makkah Branch', addr: 'Makkah', auth: 'Holy Capital Municipality' }
  ],
  partners: ['Ministry of Municipalities and Housing', 'State Properties General Authority', 'Riyadh Municipality', 'Ehkaam', 'Asir Municipality', 'Saudi Council of Engineers', 'Real Estate General Authority (REGA)', 'General Directorate of Civil Defence'],
  faq: [
    { q: 'How long does a building permit take?', a: 'It depends on the municipality and completeness of documents, but complete files are usually done within a few weeks. We give you a realistic timeline after reviewing the deed and your plot\'s building codes.', cat: 'Permits' },
    { q: 'Can I request just one service?', a: 'Yes. Every service can be contracted on its own — design only, permit only, supervision only or survey only. Many clients start with one service and expand later.', cat: 'General' },
    { q: 'What determines the price?', a: 'Project type, area, number of floors and the scope required. After a site review we send a written proposal with clear items and a payment schedule — no open items or surprise fees.', cat: 'Pricing' },
    { q: 'Do you supervise off-plan projects?', a: 'Yes. The firm is accredited by the Real Estate General Authority (REGA) as an engineering consultant for off-plan sale and lease projects and progress reports, certificate no. E0731.', cat: 'Supervision' },
    { q: 'Which regions do you cover?', a: 'We have branches in Riyadh, Bisha and Makkah — covering the Riyadh, Asir and Holy Capital municipalities and nearby areas.', cat: 'General' },
    { q: 'Do you work with developers?', a: 'Yes, we currently work with twelve developers and contractors, providing design, off-plan supervision, unit sorting and project management.', cat: 'General' },
    { q: 'What should I prepare before contacting you?', a: 'A copy of the deed, the plot location on the map, and an initial idea of what you want to build. That is enough to start a useful consultation.', cat: 'General' },
    { q: 'How do I track my request?', a: 'After submitting a support request you receive a request number. Open "Track request", enter the number and your mobile, and see the status and our replies.', cat: 'Support' }
  ],
  prepare: [
    { t: 'Copy of the deed', d: 'Shows us the plot area, boundaries and ownership type.' },
    { t: 'Plot location', d: 'A maps link is enough to know the plan and building codes.' },
    { t: 'Your initial idea', d: 'Number of floors or units, or the intended use.' }
  ],
  cta: { title: 'Ready to start your project or transaction?', text: 'Send us the deed and plot location and our engineering team will reply with a clear technical path, timeline and written price — free and without obligation.' },
  offer: { title: 'Limited-time offer', text: 'A discount on supervision packages for contracts signed this month.', badge: 'Offer', btn: 'Claim the offer' },
  media: { title: 'Follow us on social media', sub: 'Our daily field work — videos and photos from project sites.' },
  seo: { title: 'Al-Shamrani Engineering Consultancy | Design, Permits, Surveying, Supervision, Safety', desc: 'Licensed engineering consultancy in Riyadh since 2016: architectural & structural design, building permits, surveying, engineering supervision and fire-safety systems — under one roof.' }
};
