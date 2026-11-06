/* Every UI string, in both languages.
 * Values hold PLAIN TEXT — escaping happens once, at render time. */

export const ui = {
  /* ------------------------------------------------------------ chrome -- */
  skip:        { en: 'Skip to content', zh: '跳至内容' },
  topBar:      { en: 'Letterbox & mailbox locks · Supply + installation from S$50 · Open 24 hours · Pay only after you confirm',
                 zh: '信箱锁 · 供应加安装 S$50 起 · 24 小时营业 · 确认后才付款' },
  brandName:   { en: 'LETTERBOX LOCK', zh: '信箱锁' },
  brandSub:    { en: 'SINGAPORE', zh: '新加坡' },
  homeAria:    { en: 'Letterbox Lock Singapore home', zh: '新加坡信箱锁首页' },
  primaryNav:  { en: 'Primary', zh: '主要导航' },
  openMenu:    { en: 'Open navigation menu', zh: '开启导航选单' },
  call:        { en: 'Call', zh: '致电' },
  whatsapp:    { en: 'WhatsApp', zh: 'WhatsApp' },
  order:       { en: 'Order', zh: '下单' },
  langSwitch:  { en: '中文', zh: 'English' },
  langAria:    { en: 'Switch to Chinese', zh: '切换至英文' },

  /* -------------------------------------------------------------- nav --- */
  navProducts: { en: 'Products', zh: '产品' },
  navWhy:      { en: 'Why us', zh: '为何选我们' },
  navPartners: { en: 'For trade', zh: '商业合作' },
  navReviews:  { en: 'Reviews', zh: '客户评价' },
  navAreas:    { en: 'Areas', zh: '服务范围' },
  navFaq:      { en: 'FAQ', zh: '常见问题' },

  /* ------------------------------------------------------------- hero --- */
  heroLabel:   { en: "✓ SINGAPORE'S DEDICATED LETTERBOX LOCK PROVIDER, INSTALLER & SPECIALIST",
                 zh: '✓ 新加坡专门的信箱锁供应、安装与维修专家' },
  heroH1a:     { en: 'Letterbox Lock Installation & Replacement', zh: '信箱锁安装与更换' },
  heroH1b:     { en: 'in Singapore', zh: '新加坡全岛服务' },
  heroLead:    { en: 'We supply and install letterbox locks — digital touch-PIN, no-battery combination and traditional keyed. Send one photo, we confirm the model and price in writing, fit it, then send you a video. <strong>You pay only after you confirm.</strong>',
                 zh: '我们供应并安装信箱锁 — 数码触控密码、免电池密码与传统钥匙款。传一张照片，我们以书面确认型号与价格，安装后传影片给您。<strong>确认后才付款。</strong>' },
  heroCtaAll:  { en: 'See all 9 locks & prices', zh: '查看全部 9 款与价格' },
  heroCtaWa:   { en: 'Send a photo on WhatsApp', zh: 'WhatsApp 传照片' },
  proof1:      { en: 'Installation included, from', zh: '含安装，价格' },
  proof2a:     { en: 'of', zh: '／' },
  proof2b:     { en: 'models need no battery', zh: '款免电池' },
  proof3:      { en: 'Pay after you see it working', zh: '看到运作后才付款' },

  urgentH:     { en: 'Lost key or jammed lock?', zh: '钥匙遗失或锁卡住？' },
  urgentP:     { en: 'Send one photo of the mailbox door and your postal sector. We reply with a written price before we travel — day or night.',
                 zh: '传一张信箱门照片与您的邮区号码。无论白天或深夜，我们都会在出发前提供书面价格。' },
  urgentNote:  { en: 'Open 24 hours, every day of the year. Urgent installation is a special arrangement outside our planned route and adds S$10, stated in your written quote before we travel. No night rate, no emergency multiplier.',
                 zh: '全年无休，24 小时营业。紧急安装属既定路线之外的特别安排，加收 S$10，出发前于书面报价中列明。没有夜间费率，也没有紧急加成。' },

  /* --------------------------------------------------- guarantee card --- */
  guarH:       { en: 'No fit, no fee', zh: '装不上，不收费' },
  guarP:       { en: 'If we confirm a model from your photo and it does not fit when we arrive, you pay nothing at all.',
                 zh: '若我们依您的照片确认了型号，到场却装不上，您完全不必付费。' },
  guarList:    { en: ['No attendance fee', 'No call-out charge', 'No transport charge', 'Nothing at all'],
                 zh: ['不收出勤费', '不收上门费', '不收车马费', '完全不收费'] },
  guarNote:    { en: 'Reading your photo correctly is our risk, not yours.',
                 zh: '正确判读照片是我们的责任，不是您的风险。' },

  /* --------------------------------------------------------- trust bar -- */
  trust1a: { en: 'Letterbox only', zh: '只做信箱锁' },
  trust1b: { en: 'a specialist, not a general locksmith', zh: '专门店，不是一般锁匠' },
  trust2b: { en: 'lock + installation from', zh: '锁加安装，价格起' },
  trust3a: { en: '24 hours', zh: '24 小时' },
  trust3b: { en: 'every day of the year', zh: '全年无休' },
  trust4a: { en: 'Pay last', zh: '最后付款' },
  trust4b: { en: 'after video confirmation', zh: '影片确认后才付' },

  /* ---------------------------------------------------------- products -- */
  prodEyebrow: { en: 'All lock models & prices', zh: '全部型号与价格' },
  prodH2:      { en: 'All 9 letterbox locks — installation included', zh: '全部 9 款信箱锁 — 已含安装' },
  prodIntro:   { en: 'Digital touch-PIN, no-battery combination and traditional keyed. Every price covers the lock <strong>and</strong> professional installation — fitting is never billed separately.',
                 zh: '数码触控密码、免电池密码与传统钥匙款。每个价格皆包含锁具<strong>与</strong>专业安装 — 绝不另外收取安装费。' },
  filterAll:   { en: 'All 9', zh: '全部 9 款' },
  filterNoBat: { en: 'No battery', zh: '免电池' },
  filterDigi:  { en: 'Digital', zh: '数码' },
  filterCombo: { en: 'Combination', zh: '密码' },
  filterKey:   { en: 'Key', zh: '钥匙' },
  filterStatus:{ en: 'Showing all 9 models.', zh: '显示全部 9 款。' },
  bestFor:     { en: 'Best for:', zh: '适合：' },
  priceFrom:   { en: 'Lock + installation from', zh: '锁加安装，价格起' },
  addToOrder:  { en: 'Add to order', zh: '加入订单' },
  added:       { en: 'Added', zh: '已加入' },
  fullSpecs:   { en: 'Full specifications →', zh: '完整规格 →' },
  colourFor:   { en: 'Colour for', zh: '颜色 —' },
  noBatteryTag:{ en: 'No battery', zh: '免电池' },
  batteryTag:  { en: 'Battery', zh: '需电池' },
  popularTag:  { en: 'Most popular', zh: '最受欢迎' },

  /* ------------------------------------------------ long-form product --- */
  advantages:  { en: 'Advantages', zh: '优点' },
  considerations: { en: 'Considerations', zh: '注意事项' },
  notSuitable: { en: 'Not suitable when', zh: '不适合的情况' },
  atAGlance:   { en: 'At a glance', zh: '规格一览' },
  catalogueH2: { en: 'The full range, model by model', zh: '完整系列，逐款介绍' },
  specAccess:  { en: 'Access', zh: '开启方式' },
  specPower:   { en: 'Power', zh: '电源' },
  specDigits:  { en: 'Code digits', zh: '密码位数' },
  specBackup:  { en: 'Backup key', zh: '备用钥匙' },
  specColours: { en: 'Finishes', zh: '颜色' },
  specPrice:   { en: 'Installed from', zh: '安装价格起' },

  soonH3:      { en: 'Need something not listed above?', zh: '需要上方未列出的款式？' },
  soonIntro:   { en: 'Our range is wider than the nine models above. Tell us what you are looking for and we will source it, confirm what is possible and quote in writing — with no obligation.',
                 zh: '我们的产品线不只上方九款。告诉我们您在找什么，我们会为您寻找、确认可行性并提供书面报价 — 绝无义务。' },
  soonTag:     { en: 'Ask us', zh: '欢迎询问' },
  registerInt: { en: 'Tell us your need', zh: '告诉我们您的需求' },

  /* ---------------------------------------------------------- compare --- */
  cmpEyebrow:  { en: 'Compare & what it costs', zh: '比较与费用' },
  cmpH2:       { en: 'Side by side, with the real installed price', zh: '并排比较，实际安装价格' },
  cmpIntro:    { en: 'One table, one number. The figure you see is the lock plus installation — nothing is added for fitting.',
                 zh: '一张表，一个数字。您看到的价格就是锁具加安装 — 不会另外加收安装费。' },
  cmpNote:     { en: 'Showing all 9 models. Tick up to three to compare side by side.', zh: '显示全部 9 款。最多勾选三款并排比较。' },
  cmpReset:    { en: 'Reset', zh: '重设' },
  cmpCaption:  { en: 'All 9 models — the price shown includes supply <strong>and</strong> installation.', zh: '全部 9 款 — 显示价格已含供应<strong>与</strong>安装。' },
  colModel:    { en: 'Model', zh: '型号' },
  compareAria: { en: 'Compare', zh: '比较' },

  includedH3:  { en: 'Every price includes', zh: '每个价格皆包含' },
  extrasH3:    { en: 'Charged separately — only if it applies', zh: '另行收费 — 仅在适用时' },
  priceFine:   { en: 'Estimates only. The written quote is the price that applies — and you pay nothing until the job is done and you have confirmed it.',
                 zh: '仅供参考。书面报价才是实际价格 — 完工并经您确认前无需付任何费用。' },
  fullPriceList:{ en: 'Full price list →', zh: '完整价目表 →' },

  /* --------------------------------------------------------- why / B2B -- */
  whyEyebrow:  { en: 'Why residents choose us', zh: '住户为何选择我们' },
  whyH2:       { en: (n) => `${n} reasons this is a risk-free job`, zh: (n) => `${n} 个让您零风险的理由` },
  operatorH3:  { en: 'How we work', zh: '我们的做法' },
  operatorP:   { en: 'We are a dedicated letterbox lock specialist. Every quote is prepared by the team that carries out the work, so the written price and the final price are the same number. Our installers are trained on every model we supply and carry the full range and fittings on every visit.',
                 zh: '我们是专门的信箱锁服务商。每份报价皆由实际施作的团队拟定，因此书面价格与最终价格完全一致。我们的技师熟悉所供应的每一款型号，每次上门皆备齐完整产品与配件。' },
  operatorList:{ en: ['One specialist, one visit — no subcontractors, no handover',
                      'Available 24 hours a day, every day of the year',
                      'Written quote before we travel; no call-out or attendance fee',
                      'Payment only after the finished lock is tested and you have confirmed it',
                      'Workmanship warranty on every installation, in writing',
                      'ID sighted, never copied, before any locked mailbox is opened'],
                 zh: ['一位专家、一次上门 — 不转包，不交接',
                      '全年无休，24 小时服务',
                      '出发前提供书面报价；无上门费或出勤费',
                      '完工测试并经您确认后才收款',
                      '每次安装皆附书面工艺保固',
                      '开启上锁信箱前查看证件，绝不复印留存'] },

  partEyebrow: { en: 'Trade & project partners', zh: '商业与项目合作' },
  partH2:      { en: 'One-stop letterbox lock solution — for every kind of client', zh: '一站式信箱锁方案 — 服务各类客户' },
  partIntro:   { en: 'Interior designers, renovation firms, developers, MCSTs, managing agents, town councils, property agents and landlords — as well as individual residents. Whatever the letterbox lock need is, it is handled end to end by the same specialist.',
                 zh: '室内设计师、装修公司、发展商、管理机构、物业经理、市镇理事会、房产经纪与房东 — 也服务个别住户。无论何种信箱锁需求，皆由同一位专家从头负责到完工。' },
  partCtaH:    { en: 'Working on a project?', zh: '有项目在进行？' },
  partCtaP:    { en: 'Send the estate name, the unit count and one photo of a representative mailbox. You get a written per-unit scope and a single consolidated quote.',
                 zh: '提供楼盘名称、单位数量，以及一张代表性信箱的照片。我们会提供逐户书面范围与单一整合报价。' },
  partCtaBtn:  { en: 'Request a project quote', zh: '索取项目报价' },

  /* ---------------------------------------------------------- reviews --- */
  revEyebrow:  { en: 'Customer feedback', zh: '客户回馈' },
  revH2:       { en: 'What Singapore residents say', zh: '新加坡住户怎么说' },
  revIntro:    { en: 'Feedback from 6 customers who agreed we could share it, with the job and model shown so you can see what was actually done.',
                 zh: '6 位同意我们分享的客户回馈，并列出工作内容与型号，让您清楚实际做了什么。' },
  revCustomers:{ en: 'customers', zh: '位客户' },
  revSrc:      { en: 'Every entry above is a real customer who agreed we could publish their feedback. A public review profile is being set up — until then, ask us for references before you book.',
                 zh: '以上每则皆为同意我们公开回馈的真实客户。公开评价页面正在设立中 — 在此之前，欢迎在预约前向我们索取推荐人。' },
  starsAria:   { en: 'out of 5 stars', zh: '分（满分 5 分）' },

  /* --------------------------------------------------------- how it works */
  howEyebrow:  { en: 'How it works', zh: '服务流程' },
  howH2:       { en: 'Five steps. You pay last.', zh: '五个步骤，最后才付款。' },
  howIntro:    { en: 'Nothing is charged until you have seen the finished lock working and told us you are happy.',
                 zh: '在您看到完工的锁正常运作并表示满意之前，不收取任何费用。' },
  howCta:      { en: 'Start my order', zh: '开始下单' },
  schedH3:     { en: 'Standard or urgent — your choice', zh: '标准或紧急 — 由您选择' },
  schedP:      { en: 'We plan routes across the island every day. A standard job joins the next run that passes your postal sector, at no travel charge. Need it sooner? Choose urgent installation and we make a special arrangement to reach you, for S$10.',
                 zh: '我们每天规划全岛路线。标准工作会排入下一趟经过您邮区的行程，不收车马费。需要更快？选择紧急安装，我们会为您特别安排，加收 S$10。' },
  schedList:   { en: [['Standard — free', 'Your job joins the next run through your sector, usually within a day or two. No travel charge.'],
                      ['Urgent installation — +S$10', 'A special arrangement outside our planned route. Subject to availability, your location and stock.'],
                      ['Any hour, any day', 'We are open 24 hours. Late-night and early-morning lost-key openings are routine for us.']],
                 zh: [['标准 — 免费', '排入下一趟经过您邮区的行程，通常一两天内。不收车马费。'],
                      ['紧急安装 — 加 S$10', '既定路线之外的特别安排。视档期、您的位置与库存而定。'],
                      ['任何时间，任何一天', '我们 24 小时营业。深夜与清晨的钥匙遗失开锁对我们是家常便饭。']] },
  photoH3:     { en: 'Start here — the mailbox front', zh: '从这里开始 — 信箱正面' },
  photoP:      { en: 'One straight-on photo showing the whole door and the existing lock or keyhole. Send this and we will reply.',
                 zh: '一张正视照片，拍到整个门板与现有的锁或钥匙孔。传来我们就会回复。' },
  sendPhoto:   { en: 'Send your photo', zh: '传送照片' },
  willItFit:   { en: 'Will it fit?', zh: '装得上吗？' },

  /* ---------------------------------------------------------- gallery --- */
  galEyebrow:  { en: 'Installation gallery', zh: '安装实例' },
  galH2:       { en: 'Real jobs, across the island', zh: '全岛实际案例' },
  galIntro:    { en: 'Every photo is a completed installation, labelled with the job type and the estate it was done in. Tap any photo to enlarge.',
                 zh: '每张皆为完工的安装案例，并标注工作类型与所在楼盘。点击照片可放大。' },
  enlarge:     { en: 'Enlarge', zh: '放大' },
  closePhoto:  { en: 'Close photo', zh: '关闭照片' },
  photoDialog: { en: 'Installation photo', zh: '安装照片' },

  /* ------------------------------------------------------------ group --- */
  grpEyebrow:  { en: 'Group & bulk orders', zh: '批量订购' },
  grpH2:       { en: 'Ordering for a whole block or development?', zh: '为整栋或整个楼盘订购？' },
  grpLead:     { en: 'Interior designers, developers, managing agents, MCSTs, town councils and neighbours upgrading together get group pricing, one coordinated visit and a single invoice. Orders of 20+ units are priced by written quote after a survey — never an automatic total.',
                 zh: '室内设计师、发展商、物业经理、管理机构、市镇理事会与共同更换的邻居可享批量价格、一次统筹上门与单一发票。20 个单位以上须经勘察后书面报价 — 绝非自动计算总额。' },
  grpCardH:    { en: 'Get a group quote', zh: '索取批量报价' },
  grpCardP:    { en: 'Send your estate name, unit count and a photo of one representative mailbox.', zh: '提供楼盘名称、单位数量，以及一张代表性信箱的照片。' },
  grpList:     { en: ['Volume discount from 5 units', 'One scheduled visit, minimal disruption', 'Single invoice for MCST / developer / ID firm', 'Approval paperwork prepared before booking'],
                 zh: ['5 个单位起享批量折扣', '一次排程上门，减少干扰', '为管理机构／发展商／设计公司开立单一发票', '预约前先备妥审批文件'] },
  grpBtn:      { en: 'Request group quote on WhatsApp', zh: 'WhatsApp 索取批量报价' },
  grpHow:      { en: 'How bulk jobs run', zh: '批量工程流程' },
  units:       { en: 'units', zh: '个单位' },
  off:         { en: 'off', zh: '折扣' },
  writtenQuote:{ en: 'written quote', zh: '书面报价' },

  /* ------------------------------------------------------------ areas --- */
  areaEyebrow: { en: 'Islandwide service areas', zh: '全岛服务范围' },
  areaH2:      { en: 'Every MRT station, every postal code', zh: '每个地铁站，每个邮区' },
  areaIntro:   { en: 'We cover all of Singapore, 24 hours a day. Find your station below, or just send your postal sector — we will tell you the next run passing it.',
                 zh: '我们 24 小时服务全新加坡。在下方找到您的车站，或直接传邮区号码 — 我们会告知下一趟行程。' },
  mrtLabel:    { en: 'Find your MRT station', zh: '寻找您的地铁站' },
  mrtPlace:    { en: 'Type a station, e.g. Tampines', zh: '输入车站名称，例如 Tampines' },
  stations:    { en: 'stations', zh: '个车站' },
  townsH3:     { en: 'HDB towns and estates we cover', zh: '我们服务的组屋区与楼盘' },
  townsIntro:  { en: 'Letterbox and mailbox lock replacement across every HDB town, condominium and landed estate in Singapore. If your estate is not listed, send your postal sector — it is still covered.',
                 zh: '服务新加坡所有组屋区、公寓与有地住宅的信箱锁更换。若未列出您的楼盘，请传邮区号码 — 同样在服务范围内。' },
  areaFine:    { en: 'Landed homes and estates away from a station are covered too — MRT lines are listed simply because they are the easiest way to find your area.',
                 zh: '远离地铁站的有地住宅与楼盘同样服务 — 列出地铁线只是因为这是最容易找到您区域的方式。' },

  /* ------------------------------------------------------------- form --- */
  ordEyebrow:  { en: 'Written quotation', zh: '书面报价' },
  ordH2:       { en: 'Order your lock — nothing to pay now', zh: '订购您的锁 — 现在无需付款' },
  ordIntro:    { en: 'Choose one lock or build a list for multiple letterboxes, then add your address. WhatsApp opens with your order ready to send.',
                 zh: '选择一个锁，或建立多个信箱的清单，然后填入地址。WhatsApp 会带着您的订单开启，随时可传送。' },
  ordChecks:   { en: ['Itemised estimate with every charge shown', 'Lock and installation in one price', 'Bulk discount applied automatically', 'You pay only after you confirm the finished job'],
                 zh: ['逐项估价，所有费用一目了然', '锁具与安装合并为一个价格', '自动套用批量折扣', '完工确认后才付款'] },
  schedNoteB:  { en: 'No date picker — here is why.', zh: '没有日期选择器 — 原因在此。' },
  schedNoteP:  { en: 'We schedule by route. Your postal code tells us which daily run covers your area, and we reply with the next available window. If you need it today, pick the urgent option below.',
                 zh: '我们按路线排程。您的邮区号码让我们知道哪条每日路线经过您的区域，我们会回复下一个可用时段。若需要当天完成，请在下方选择紧急选项。' },
  privacyB:    { en: 'Your privacy:', zh: '您的隐私：' },
  privacyP:    { en: 'the WhatsApp link carries only your product choice, quantity, mailbox condition, the <strong>2-digit postal sector</strong> and the estimate. Your <strong>name, phone, block, unit and full postal code are never placed in the link</strong> — use the copy button and paste them inside the encrypted chat.',
                 zh: 'WhatsApp 连结只包含您选择的产品、数量、信箱状况、<strong>两位数邮区</strong>与估价。您的<strong>姓名、电话、座号、单位与完整邮区绝不会放入连结</strong> — 请使用复制按钮，贴到加密对话中。' },
  privacyLink: { en: 'See our Privacy Policy', zh: '查看隐私政策' },

  modeLegend:  { en: 'What do you need?', zh: '您需要什么？' },
  modeOneB:    { en: 'One lock', zh: '单个锁' },
  modeOneS:    { en: 'Quick single order', zh: '快速单件订购' },
  modeMultiB:  { en: 'Multiple / bulk', zh: '多个／批量' },
  modeMultiS:  { en: 'Build an order list', zh: '建立订单清单' },
  fProduct:    { en: 'Product', zh: '产品' },
  fColour:     { en: 'Colour', zh: '颜色' },
  fQuantity:   { en: 'Quantity', zh: '数量' },
  fCondition:  { en: 'Existing mailbox condition', zh: '现有信箱状况' },
  fSchedule:   { en: 'When do you need it?', zh: '您何时需要？' },
  fPostal:     { en: 'Postal code', zh: '邮区号码' },
  fPostalHint: { en: 'decides which daily route reaches you', zh: '决定哪条每日路线到达您处' },
  fPostalPlace:{ en: 'e.g. 520123 or 52', zh: '例如 520123 或 52' },
  fBlock:      { en: 'Block no.', zh: '座号' },
  fBlockPlace: { en: 'e.g. 123 or 123A', zh: '例如 123 或 123A' },
  fUnit:       { en: 'Unit no.', zh: '单位号码' },
  fUnitPlace:  { en: 'e.g. 12-345 or 1518', zh: '例如 12-345 或 1518' },
  fAuth:       { en: 'I confirm I am the resident, owner, tenant or an authorised person for this mailbox, and I understand proof will be required on site before it is opened.',
                 zh: '我确认自己是此信箱的住户、屋主、租户或授权人，并了解开启前须在现场出示证明。' },
  fSubmit:     { en: 'Send my order on WhatsApp', zh: '以 WhatsApp 传送订单' },
  fCopy:       { en: 'Copy my block & unit to paste in chat', zh: '复制座号与单位，贴到对话中' },
  yourOrder:   { en: 'Your order', zh: '您的订单' },
  clear:       { en: 'Clear', zh: '清除' },
  listEmpty:   { en: 'No locks added yet — use <b>Add to order</b> on any product above.', zh: '尚未加入任何锁 — 请在上方产品点选<b>加入订单</b>。' },

  /* -------------------------------------------------------------- FAQ --- */
  faqEyebrow:  { en: 'Frequently asked questions', zh: '常见问题' },
  faqH2:       { en: 'Letterbox lock questions, answered', zh: '信箱锁问题解答' },
  faqMore:     { en: 'More about how we work →', zh: '了解更多服务方式 →' },
  commonQ:     { en: 'Common questions', zh: '常见问题' },

  /* ----------------------------------------------------------- footer --- */
  ftAbout:     { en: "Singapore's Dedicated Letterbox Lock Provider, Installer & Specialist. Open 24 hours. We supply and install letterbox locks for HDB, condo, landed and outdoor mailboxes, and work with interior designers, developers, MCSTs and managing agents. We do not service door, gate, car or safe locks.",
                 zh: '新加坡专门的信箱锁供应、安装与维修专家，24 小时营业。我们为组屋、公寓、有地住宅与户外信箱供应并安装信箱锁，也与室内设计师、发展商、管理机构及物业经理合作。我们不提供大门、闸门、汽车或保险箱锁服务。' },
  ftHours:     { en: 'Open 24 hours, every day', zh: '全年无休，24 小时营业' },
  ftServices:  { en: 'Services & prices', zh: '服务与价格' },
  ftGuides:    { en: 'Guides & company', zh: '指南与公司' },
  ftLegal:     { en: 'Legal & contact', zh: '法律与联络' },
  ftCallUs:    { en: 'Call us', zh: '致电我们' },
  ftCopy:      { en: 'Website estimates are indicative; the final price is confirmed in writing before work begins.',
                 zh: '网站估价仅供参考；最终价格于施工前以书面确认。' },

  noscript:    { en: 'JavaScript is off, so the live estimate is disabled. All products, prices and policies above are fully readable. To order, WhatsApp or call',
                 zh: 'JavaScript 已关闭，即时估价功能停用。以上所有产品、价格与政策仍可完整阅读。如需订购，请用 WhatsApp 或致电' },

  home:        { en: 'Home', zh: '首页' },
  breadcrumb:  { en: 'Breadcrumb', zh: '路径导航' },

  ctaH2:       { en: 'Send one photo, get a written price', zh: '传一张照片，取得书面价格' },
  ctaP:        { en: 'No deposit, no card details, and nothing to pay until the lock is fitted and you have confirmed it works. We answer 24 hours.',
                 zh: '无需订金、不收信用卡资料，锁具安装完成并经您确认前无需付款。我们 24 小时接听。' },
  ctaWa:       { en: 'WhatsApp a photo of your mailbox', zh: 'WhatsApp 传送信箱照片' },

  e404H1:      { en: 'That page has moved or never existed', zh: '该页面已移动或不存在' },
  e404Lead:    { en: 'No harm done. Here is everything worth going to instead.', zh: '没关系。以下是值得前往的页面。' },
  e404H2:      { en: 'Popular pages', zh: '热门页面' }
};

/* WhatsApp message templates, per locale. */
export const waMsg = {
  quote: {
    en: "Hi, I'd like a written quote for a letterbox lock. I'll send a photo of the mailbox front.",
    zh: '您好，我想要信箱锁的书面报价。我会传送信箱正面的照片。'
  },
  urgent: {
    en: 'Hi, urgent: my letterbox is locked / jammed. Sending a photo and my postal sector now.',
    zh: '您好，紧急：我的信箱上锁／卡住了。现在传送照片与邮区号码。'
  },
  group: {
    en: "Hi, I'd like a GROUP/BULK written quote for letterbox locks. Estate: ___ | Units: ___",
    zh: '您好，我想要信箱锁的批量书面报价。楼盘：___｜单位数量：___'
  },
  project: {
    en: "Hi, I'd like a PROJECT quote for letterbox locks. Company/Estate: ___ | Units: ___ | Handover date: ___",
    zh: '您好，我想要信箱锁的项目报价。公司／楼盘：___｜单位数量：___｜交屋日期：___'
  },
  lostKey: {
    en: 'Hi, I have lost my letterbox key. Sending a photo of the mailbox front and my postal sector now.',
    zh: '您好，我弄丢了信箱钥匙。现在传送信箱正面照片与邮区号码。'
  },
  notify: {
    en: (id, name) => `Hi, please notify me when the ${id} ${name} is available.`,
    zh: (id, name) => `您好，${id} ${name} 上市时请通知我。`
  }
};
