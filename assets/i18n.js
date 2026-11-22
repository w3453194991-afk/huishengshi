/* 界面语言包：10 种语言。数组顺序固定，缺项回退英文，再回退中文。 */
window.I18N = (function () {
  const ORDER = ['zh', 'en', 'es', 'pt', 'ar', 'ru', 'id', 'vi', 'th', 'tr'];

  const LANGS = [
    { code: 'zh', native: '中文', region: '中国', flag: '🇨🇳', dir: 'ltr' },
    { code: 'en', native: 'English', region: 'International', flag: '🇬🇧', dir: 'ltr' },
    { code: 'es', native: 'Español', region: 'Latinoamérica / España', flag: '🇲🇽', dir: 'ltr' },
    { code: 'pt', native: 'Português', region: 'Brasil / Portugal', flag: '🇧🇷', dir: 'ltr' },
    { code: 'ar', native: 'العربية', region: 'الشرق الأوسط', flag: '🇸🇦', dir: 'rtl' },
    { code: 'ru', native: 'Русский', region: 'Россия / СНГ', flag: '🇷🇺', dir: 'ltr' },
    { code: 'id', native: 'Bahasa Indonesia', region: 'Indonesia', flag: '🇮🇩', dir: 'ltr' },
    { code: 'vi', native: 'Tiếng Việt', region: 'Việt Nam', flag: '🇻🇳', dir: 'ltr' },
    { code: 'th', native: 'ไทย', region: 'ประเทศไทย', flag: '🇹🇭', dir: 'ltr' },
    { code: 'tr', native: 'Türkçe', region: 'Türkiye', flag: '🇹🇷', dir: 'ltr' }
  ];

  // 每条：[zh, en, es, pt, ar, ru, id, vi, th, tr]
  const K = {
    'nav.home': ["工作台", "Dashboard", "Dashboard", "Dashboard", "Dashboard", "Dashboard", "Dashboard", "Dashboard", "Dashboard", "Dashboard"],
    'nav.homeCust': ["首页", "Home", "Home", "Home", "Home", "Home", "Home", "Home", "Home", "Home"],
    'nav.myQuote': ["我的报价", "My quotes", "My quotes", "My quotes", "My quotes", "My quotes", "My quotes", "My quotes", "My quotes", "My quotes"],
    'nav.custom': ["定制需求", "Custom order", "Custom order", "Custom order", "Custom order", "Custom order", "Custom order", "Custom order", "Custom order", "Custom order"],
  'nav.browse': ["选款", "Browse", "Browse", "Browse", "Browse", "Browse", "Browse", "Browse", "Browse", "Browse"],
  'nav.cart': ["购物车", "Cart", "Cart", "Cart", "Cart", "Cart", "Cart", "Cart", "Cart", "Cart"],
  'nav.myPack': ["我的资料", "My files", "My files", "My files", "My files", "My files", "My files", "My files", "My files", "My files"],
    'nav.search': ["客户搜索", "Prospect search", "Prospect search", "Prospect search", "Prospect search", "Prospect search", "Prospect search", "Prospect search", "Prospect search", "Prospect search"],
    'nav.xref': ["款号对照", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup"],
    'nav.visits': ["客户浏览", "Visitor log", "Visitor log", "Visitor log", "Visitor log", "Visitor log", "Visitor log", "Visitor log", "Visitor log", "Visitor log"],
    'nav.redfox': ["热门追踪", "Trending", "Trending", "Trending", "Trending", "Trending", "Trending", "Trending", "Trending", "Trending"],
    'nav.acquire': ["获客", "Acquire", "Acquire", "Acquire", "Acquire", "Acquire", "Acquire", "Acquire", "Acquire", "Acquire"],
    'nav.g.clues': ["客户管理", "Customers", "Customers", "Customers", "Customers", "Customers", "Customers", "Customers", "Customers", "Customers"],
    'nav.g.data': ["款号数据", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog"],
    'nav.g.tools': ["工具书", "Handbook", "Handbook", "Handbook", "Handbook", "Handbook", "Handbook", "Handbook", "Handbook", "Handbook"],
    'nav.tax': ["税务查询", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax", "Duty & tax"],
    'nav.model': ["款号查询", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup", "Style lookup"],
    'nav.fx': ["货币兑换", "Currency", "Currency", "Currency", "Currency", "Currency", "Currency", "Currency", "Currency", "Currency"],
    'nav.aftersales': ["售后服务", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales"],
    'nav.aftersale': ["售后服务", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales", "After-sales"],
    'nav.deals': ["成交台账", "Deals", "Deals", "Deals", "Deals", "Deals", "Deals", "Deals", "Deals", "Deals"],
    'nav.boss': ["业绩总览", "Overview", "Overview", "Overview", "Overview", "Overview", "Overview", "Overview", "Overview", "Overview"],
    'nav.select': ["智能选款", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector"],
    'nav.products': ["款式库", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog"],
    'nav.graph': ["搭配图谱", "Pairings", "Pairings", "Pairings", "Pairings", "Pairings", "Pairings", "Pairings", "Pairings", "Pairings"],
    'nav.quote': ["报价单", "Quote", "Quote", "Quote", "Quote", "Quote", "Quote", "Quote", "Quote", "Quote"],
    'nav.pack': ["订货资料", "Order pack", "Order pack", "Order pack", "Order pack", "Order pack", "Order pack", "Order pack", "Order pack", "Order pack"],
    'nav.leads': ["询盘线索", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads"],
    'nav.network': ["用户画像", "Audience", "Audience", "Audience", "Audience", "Audience", "Audience", "Audience", "Audience", "Audience"],
    'nav.content': ["获客内容", "Content", "Content", "Content", "Content", "Content", "Content", "Content", "Content", "Content"],
    'nav.import': ["数据导入", "Import", "Import", "Import", "Import", "Import", "Import", "Import", "Import", "Import"],
    'nav.inquiries': ["客户询价", "Inquiries", "Inquiries", "Inquiries", "Inquiries", "Inquiries", "Inquiries", "Inquiries", "Inquiries", "Inquiries"],
    'nav.addcust': ["增加客户", "Add customer", "Add customer", "Add customer", "Add customer", "Add customer", "Add customer", "Add customer", "Add customer", "Add customer"],
    'top.searchPh': ["输入品类 / 尺码 / 旧款号 / 客户原话，回车开始匹配", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter", "Category, size, old style no. or what the customer said — press Enter"],
    'top.lang': ["界面语言", "Language", "Language", "Language", "Language", "Language", "Language", "Language", "Language", "Language"],
    'top.offline': ["离线可用", "Offline", "Offline", "Offline", "Offline", "Offline", "Offline", "Offline", "Offline", "Offline"],

    'm.title': ["选择界面语言", "Choose your language", "Choose your language", "Choose your language", "Choose your language", "Choose your language", "Choose your language", "Choose your language", "Choose your language", "Choose your language"],
    'm.sub': ["面向国际市场的版本：界面文案会跟随语言切换，产品款号与编码保持原样。", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are.", "Built for export markets: the interface follows your language, part numbers stay as they are."],
    'm.note': ["部分长说明仍为中文，后续版本补齐。", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later.", "Some long help texts are still Chinese and will be completed later."],
    'm.btn': ["开始使用", "Continue", "Continue", "Continue", "Continue", "Continue", "Continue", "Continue", "Continue", "Continue"],
    'm.auto': ["记住选择，下次自动进入", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice", "Remember my choice"],

    'home.title': ["要找哪一款童装？", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?", "Which kids style are you looking for?"],
    'home.sub': ["品类、尺码、旧款号，或者客户的一句原话都行", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said.", "A category, a size, an old style number — or just what the customer said."],
    'home.btn': ["查款号", "Search", "Search", "Search", "Search", "Search", "Search", "Search", "Search", "Search"],
    'home.todo': ["今天要做的事", "Today", "Today", "Today", "Today", "Today", "Today", "Today", "Today", "Today"],
    'home.todoSub': ["点一行直接过去", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there", "Tap a row to jump there"],
    'home.t1':       ["待跟进询盘", "Leads to follow up", "Prospectos por seguir", "Leads a seguir", "عملاء للمتابعة", "Лиды в работе", "Prospek ditindaklanjuti", "Khách cần theo dõi", "ลีดที่ต้องติดตาม", "Takip edilecek"],
    'home.t2':       ["待研发复核的适用", "Fitments awaiting review", "Aplicaciones por revisar", "Aplicações a revisar", "توافقات بانتظار المراجعة", "Применяемость на проверке", "Kecocokan menunggu review", "Tương thích chờ duyệt", "การใช้งานรอตรวจ", "İnceleme bekleyen"],
    'home.t3':       ["已加入报价的款号", "Items in the quote", "Artículos en la cotización", "Itens no orçamento", "أصناف في عرض السعر", "Позиции в КП", "Item di penawaran", "Mục trong báo giá", "รายการในใบเสนอราคา", "Teklifteki kalemler"],
    'home.t4':       ["已保存的历史报价", "Saved quotes", "Cotizaciones guardadas", "Orçamentos salvos", "عروض محفوظة", "Сохранённые КП", "Penawaran tersimpan", "Báo giá đã lưu", "ใบเสนอราคาที่บันทึก", "Kayıtlı teklifler"],
    'home.steps': ["现场三步定码", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size"],
    'home.stepsSub': ["客户说不清尺码时，照着问", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size", "Ask these when the customer is unsure about size"],
    'home.s1':       ["先问身高，再问年龄 —— 「孩子现在多高？」比问岁数有效 10 倍。", "Ask the height, not the age — “How tall is the child?” works 10× better.", "Pregunta por el eje, no por el camión — funciona 10 veces mejor.", "Pergunte pelo eixo, não pelo caminhão — funciona 10× melhor.", "اسأل عن المحور لا عن الشاحنة — أفضل عشر مرات.", "Спросите про мост, а не про машину — в 10 раз эффективнее.", "Tanya axle, bukan truk — 10× lebih efektif.", "Hỏi cầu xe, không phải xe — hiệu quả gấp 10.", "ถามเพลา ไม่ใช่รุ่นรถ — ได้ผลกว่าสิบเท่า", "Aracı değil aksı sorun — 10 kat etkili."],
    'home.s2':       ["拍三张照 —— 旧片正面带字 / 侧面靠卷尺 / 尺码铭牌。", "Three photos — old pad face, side with a ruler, axle plate.", "Tres fotos: cara de la pastilla, lado con regla, placa del eje.", "Três fotos: face, lateral com régua, placa do eixo.", "ثلاث صور: وجه الفحمات، الجانب مع مسطرة، لوحة المحور.", "Три фото: лицо колодки, бок с линейкой, шильда моста.", "Tiga foto: muka kampas, sisi dengan penggaris, plat axle.", "Ba ảnh: mặt má, cạnh có thước, tem cầu.", "สามภาพ: หน้าผ้าเบรก ด้านข้างมีไม้บรรทัด ป้ายเพลา", "Üç fotoğraf: balata yüzü, cetvelli yan, aks plakası."],
    'home.s3':       ["数孔 —— 8 / 12 / 15 / 16 孔，现场最快的判据。", "Count the holes — 8 / 12 / 15 / 16 is the fastest check.", "Cuenta los agujeros: 8 / 12 / 15 / 16 es lo más rápido.", "Conte os furos: 8 / 12 / 15 / 16 é o mais rápido.", "عدّ الفتحات: ٨ / ١٢ / ١٥ / ١٦ أسرع دليل.", "Посчитайте отверстия: 8 / 12 / 15 / 16 — быстрее всего.", "Hitung lubang: 8 / 12 / 15 / 16 paling cepat.", "Đếm lỗ: 8 / 12 / 15 / 16 nhanh nhất.", "นับรู 8 / 12 / 15 / 16 เร็วที่สุด", "Delikleri sayın: 8 / 12 / 15 / 16 en hızlısı."],
    'home.select': ["打开选款台", "Open selector", "Open selector", "Open selector", "Open selector", "Open selector", "Open selector", "Open selector", "Open selector", "Open selector"],
    'home.chat': ["客服解答", "Ask support", "Ask support", "Ask support", "Ask support", "Ask support", "Ask support", "Ask support", "Ask support", "Ask support"],
    'home.why': ["为什么「先问身高，不问年龄」", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age", "Why height beats age"],
    'home.whySub': ["同样 6 岁，身高能差 15 cm —— 按身高定码才不退货", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age", "Same age, 15 cm apart — size by height, not by age"],

    'sel.title': ["智能选款", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector", "Selector"],
    'sel.in': ["客户原话 / 品类 / 尺码 / 旧款号", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code", "Customer words / category / size / old code"],
    'sel.inSub': ["支持中文、英文、款号混输", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed", "Chinese, English or codes, mixed"],
    'sel.ph': ["例：100 码 短袖T恤 300 件 / 防晒衣 90-130 / MD1001 / 女童连衣裙", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress", "e.g. 100 size tee 300 pcs / sun jacket 90-130 / MD1001 / girls dress"],
    'sel.go': ["解析并选款", "Match", "Match", "Match", "Match", "Match", "Match", "Match", "Match", "Match"],
    'sel.clear': ["清空", "Clear", "Clear", "Clear", "Clear", "Clear", "Clear", "Clear", "Clear", "Clear"],
    'sel.steps': ["现场三步定码", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size", "Three steps to lock the size"],
    'sel.res': ["识别结果", "What we understood", "What we understood", "What we understood", "What we understood", "What we understood", "What we understood", "What we understood", "What we understood", "What we understood"],
    'sel.resSub': ["共 {n} 个候选，按证据强度排序", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first", "{n} candidates, strongest evidence first"],
    'sel.q': ["还差一步就能锁定（先问这个，别急着报价）", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)", "One question away (ask this before quoting)"],
    'sel.enough': ["信息齐全，可以直接报价。", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote.", "Enough information — you can quote."],
    'sel.heat': ["常用场景 · 按热度排序", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity", "Common scenes · by popularity"],
    'sel.heatSub': ["共 {n} 个场景，按社媒热度排序", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first", "{n} scenes, most popular first"],
    'sel.heatEmpty': ["该款还没有场景线索", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style", "No scene link yet for this style"],
    'sel.heatNote': ["排序依据：该场景相关内容的互动量（演示数据）。", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data).", "Ranked by engagement on related posts (demo data)."],
    'sel.copyList': ["复制场景清单", "Copy list", "Copy list", "Copy list", "Copy list", "Copy list", "Copy list", "Copy list", "Copy list", "Copy list"],
    'sel.videos': ["看相关视频", "Related videos", "Related videos", "Related videos", "Related videos", "Related videos", "Related videos", "Related videos", "Related videos", "Related videos"],
    'sel.mx': ["尺码对照表", "Size chart", "Size chart", "Size chart", "Size chart", "Size chart", "Size chart", "Size chart", "Size chart", "Size chart"],
    'sel.other': ["同场景其他款", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene", "Other styles for this scene"],
    'sel.add': ["加入报价", "Add to quote", "Add to quote", "Add to quote", "Add to quote", "Add to quote", "Add to quote", "Add to quote", "Add to quote", "Add to quote"],
    'sel.detail': ["款式详情", "Details", "Details", "Details", "Details", "Details", "Details", "Details", "Details", "Details"],
    'sel.pack': ["生成资料页", "Data sheet", "Data sheet", "Data sheet", "Data sheet", "Data sheet", "Data sheet", "Data sheet", "Data sheet", "Data sheet"],
    'sel.copy': ["复制回复话术", "Copy reply", "Copy reply", "Copy reply", "Copy reply", "Copy reply", "Copy reply", "Copy reply", "Copy reply", "Copy reply"],

    'prod.title': ["款式库", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog", "Catalog"],
    'prod.sub': ["{p} 个款，{c} 条款号。点开看详情、适用场景与质检。", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports.", "{p} styles, {c} codes. Open a row for details and test reports."],
    'prod.ph': ["搜索款号 / 色号 / 名称", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name", "Search style, colour code, name"],
    'prod.cat': ["品类", "Category", "Category", "Category", "Category", "Category", "Category", "Category", "Category", "Category"],
    'prod.brand': ["品牌线", "Brand line", "Brand line", "Brand line", "Brand line", "Brand line", "Brand line", "Brand line", "Brand line", "Brand line"],
    'prod.mat': ["面料", "Fabric", "Fabric", "Fabric", "Fabric", "Fabric", "Fabric", "Fabric", "Fabric", "Fabric"],
    'prod.only': ["只看有场景关系", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links", "Only with scene links"],
    'prod.sort': ["排序", "Sort", "Sort", "Sort", "Sort", "Sort", "Sort", "Sort", "Sort", "Sort"],
    'prod.def': ["默认", "Default", "Default", "Default", "Default", "Default", "Default", "Default", "Default", "Default"],
    'prod.likes': ["按热度", "By popularity", "By popularity", "By popularity", "By popularity", "By popularity", "By popularity", "By popularity", "By popularity", "By popularity"],
    'prod.fit': ["按适用场景", "By scene", "By scene", "By scene", "By scene", "By scene", "By scene", "By scene", "By scene", "By scene"],
    'prod.price': ["按参考价", "By price", "By price", "By price", "By price", "By price", "By price", "By price", "By price", "By price"],
    'prod.export': ["导出 CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV", "Export CSV"],
    'prod.res': ["筛选结果", "Results", "Results", "Results", "Results", "Results", "Results", "Results", "Results", "Results"],
    'h.code': ["款号", "Style", "Style", "Style", "Style", "Style", "Style", "Style", "Style", "Style"],
    'h.name': ["名称", "Name", "Name", "Name", "Name", "Name", "Name", "Name", "Name", "Name"],
    'h.apps': ["常用场景", "Common scenes", "Common scenes", "Common scenes", "Common scenes", "Common scenes", "Common scenes", "Common scenes", "Common scenes", "Common scenes"],
    'h.spec': ["规格", "Spec", "Spec", "Spec", "Spec", "Spec", "Spec", "Spec", "Spec", "Spec"],
    'h.codes': ["款号数", "Codes", "Codes", "Codes", "Codes", "Codes", "Codes", "Codes", "Codes", "Codes"],
    'h.likes': ["热度", "Popularity", "Popularity", "Popularity", "Popularity", "Popularity", "Popularity", "Popularity", "Popularity", "Popularity"],
    'h.price': ["参考价", "Price", "Price", "Price", "Price", "Price", "Price", "Price", "Price", "Price"],

    'qt.title': ["报价单", "Quotation", "Quotation", "Quotation", "Quotation", "Quotation", "Quotation", "Quotation", "Quotation", "Quotation"],
    'qt.sub': ["阶梯价随数量自动计算；场景与尺码依据附在备注里，减少来回确认。", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote.", "Volume pricing is automatic; scene and size notes travel with the quote."],
    'qt.cust': ["客户与条款", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms", "Customer & terms"],
    'qt.items': ["明细", "Items", "Items", "Items", "Items", "Items", "Items", "Items", "Items", "Items"],
    'qt.gen': ["生成报价单（打印 / PDF）", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)", "Generate quote (print / PDF)"],
    'qt.save': ["保存报价", "Save quote", "Save quote", "Save quote", "Save quote", "Save quote", "Save quote", "Save quote", "Save quote", "Save quote"],
    'qt.amount': ["货值", "Goods value", "Goods value", "Goods value", "Goods value", "Goods value", "Goods value", "Goods value", "Goods value", "Goods value"],
    'qt.freight': ["运费估算", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)", "Freight (est.)"],
    'qt.total': ["合计", "Total", "Total", "Total", "Total", "Total", "Total", "Total", "Total", "Total"],
    'qt.recent': ["最近保存", "Recent", "Recent", "Recent", "Recent", "Recent", "Recent", "Recent", "Recent", "Recent"],
    'qt.empty': ["还没有款式。去「智能选款」或「款式库」加入。", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog.", "No items yet — add from Selector or Catalog."],

    'pk.title': ["客户订货资料", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack", "Customer order pack"],
    'pk.sub': ["一次生成：封面 + 报价 + 款式数据页 + 质检报告 + 发货确认页。", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page.", "One run: cover, quote, data sheets, test reports, confirmation page."],
    'pk.contents': ["打包内容", "What is included", "What is included", "What is included", "What is included", "What is included", "What is included", "What is included", "What is included", "What is included"],
    'pk.zip': ["下载 ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP", "Download ZIP"],
    'pk.print': ["生成并打印（另存为 PDF）", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)", "Generate & print (save as PDF)"],
    'pk.items': ["将被打包的款", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack", "Styles in this pack"],
    'pk.empty': ["先加入款", "Add styles first", "Add styles first", "Add styles first", "Add styles first", "Add styles first", "Add styles first", "Add styles first", "Add styles first", "Add styles first"],

    'ld.title': ["询盘线索", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads", "Leads"],
    'ld.sub': ["先判断「是不是终端」，再决定投入多少时间。", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time.", "Decide if it is an end user before spending time."],
    'ld.new': ["录入询盘", "New lead", "New lead", "New lead", "New lead", "New lead", "New lead", "New lead", "New lead", "New lead"],
    'nw.title': ["用户画像与关系网", "Audience & network", "Audience & network", "Audience & network", "Audience & network", "Audience & network", "Audience & network", "Audience & network", "Audience & network", "Audience & network"],
    'nw.sub': ["从关注 / 粉丝 / 评论还原谁影响谁。", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments.", "Who influences whom, from follows and comments."],
    'ct.title': ["获客内容引擎", "Content engine", "Content engine", "Content engine", "Content engine", "Content engine", "Content engine", "Content engine", "Content engine", "Content engine"],
    'ct.sub': ["按语种扒热门选题 → 出童装脚本 → 挂到款号。", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts.", "Trending topics by language → brake pad scripts."],
    'ct.gen': ["生成脚本", "Generate script", "Generate script", "Generate script", "Generate script", "Generate script", "Generate script", "Generate script", "Generate script", "Generate script"],
    'ct.prompt': ["复制 AI 提示词", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt", "Copy AI prompt"],
    'im.title': ["数据导入与导出", "Import & export", "Import & export", "Import & export", "Import & export", "Import & export", "Import & export", "Import & export", "Import & export", "Import & export"],
    'im.sub': ["把 CRM、进销存、测绘表、试验台账接进来。", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs.", "Bring in CRM, ERP, drawings and test logs."],

    'c.close': ["关闭", "Close", "Close", "Close", "Close", "Close", "Close", "Close", "Close", "Close"],
    'c.copy': ["复制", "Copy", "Copy", "Copy", "Copy", "Copy", "Copy", "Copy", "Copy", "Copy"],
    'c.add': ["加入", "Add", "Add", "Add", "Add", "Add", "Add", "Add", "Add", "Add"],
    'c.all': ["全部", "All", "All", "All", "All", "All", "All", "All", "All", "All"],
    'c.empty': ["暂无数据", "No data", "No data", "No data", "No data", "No data", "No data", "No data", "No data", "No data"],
    'gate.none': ["未登录", "Sign in", "Sign in", "Sign in", "Sign in", "Sign in", "Sign in", "Sign in", "Sign in", "Sign in"],
    'gate.choose': ["选择入口", "Choose portal", "Choose portal", "Choose portal", "Choose portal", "Choose portal", "Choose portal", "Choose portal", "Choose portal", "Choose portal"],
    'gate.cust': ["客户入口", "Customer", "Customer", "Customer", "Customer", "Customer", "Customer", "Customer", "Customer", "Customer"],
    'gate.staff': ["员工入口", "Staff", "Staff", "Staff", "Staff", "Staff", "Staff", "Staff", "Staff", "Staff"],
    'gate.custSub': ["看款号与价格，收到你的报价和资料", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs", "Browse parts and prices, receive quotes and packs"],
    'gate.staffSub': ["看客户浏览、跟进线索、出报价与资料包", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs", "Customer activity, leads, quotes and data packs"],
    'gate.contactType': ["联系方式类型", "Contact type", "Contact type", "Contact type", "Contact type", "Contact type", "Contact type", "Contact type", "Contact type", "Contact type"],
    'gate.contactValue': ["号码或邮箱", "Number or email", "Number or email", "Number or email", "Number or email", "Number or email", "Number or email", "Number or email", "Number or email", "Number or email"],
    'gate.name': ["称呼", "Name", "Name", "Name", "Name", "Name", "Name", "Name", "Name", "Name"],
    'gate.company': ["公司", "Company", "Company", "Company", "Company", "Company", "Company", "Company", "Company", "Company"],
    'gate.country': ["国家", "Country", "Country", "Country", "Country", "Country", "Country", "Country", "Country", "Country"],
    'gate.code': ["员工访问码", "Staff access code", "Staff access code", "Staff access code", "Staff access code", "Staff access code", "Staff access code", "Staff access code", "Staff access code", "Staff access code"],
    'gate.in': ["进入", "Enter", "Enter", "Enter", "Enter", "Enter", "Enter", "Enter", "Enter", "Enter"],
    'gate.tip': ["客户登录后，报价和资料会发到这个联系方式。", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact.", "Quotes and packs will be sent to this contact."],
    'gate.logout': ["切换身份", "Switch account", "Switch account", "Switch account", "Switch account", "Switch account", "Switch account", "Switch account", "Switch account", "Switch account"]
  };

  let cur = 'zh';
  const listeners = [];

  function idx(code) { const i = ORDER.indexOf(code); return i < 0 ? 0 : i; }
  function t(key, vars) {
    const row = K[key];
    if (!row) return key;
    let s = row[idx(cur)];
    if (!s && cur !== 'en') s = row[1];
    if (!s) s = row[0];
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function setLang(code) {
    cur = ORDER.includes(code) ? code : 'en';
    const meta = LANGS.find(l => l.code === cur) || LANGS[1];
    document.documentElement.lang = cur;
    document.documentElement.dir = meta.dir;
    document.documentElement.dataset.lang = cur;
    try { localStorage.setItem('gy_lang', cur); } catch (e) { }
    listeners.forEach(fn => { try { fn(cur); } catch (e) { } });
  }
  function getLang() { return cur; }
  function meta(code) { return LANGS.find(l => l.code === (code || cur)) || LANGS[0]; }
  function onChange(fn) { listeners.push(fn); }

  return { LANGS, ORDER, t, setLang, getLang, meta, onChange };
})();