// 冠英 · 选型与报价中台 —— 人工维护知识层
// 说明：车型/车桥/适配关系为行业公开信息 + 官网产品目录整理，标注「待确认」的条目必须由研发复核后方可用于对外报价。

export const meta = {
  version: '1.0.0',
  name: '冠英 · 选型与报价中台',
  subtitle: '车型 / 车桥 / 编码 → 刹车片型号 → 报价与资料包',
  built: '2026-11-21',
  company: {
    name: '浙江冠英汽车零部件有限公司',
    nameEn: 'ZHEJIANG KOOYING AUTOPARTS CO., LTD.',
    brand: 'KOOYING / 冠英',
    founded: 2006,
    site: '浙江湖州 · 太湖园区',
    capacity: '刹车片及风电制动块 10000+ 吨/年，制动蹄总成 60 万套/年',
    staff: '100+ 人（营销 20 人，其中外贸 10 人）',
    markets: '东南亚、中东、南美、北美等 30 多个国家和地区',
    certs: ['IATF 16949:2016', 'GB 5763-2018', 'QC/T 25-2004', 'QC/T 27-2004', 'ECE R90（部分型号）'],
    web: 'https://www.kooying.com'
  },
  // 数据口径提示：所有价格、库存、交期为演示用示例值，接入 ERP 后自动覆盖
  notices: [
    '产品目录、编码、图片来自冠英官网公开产品页（272 个 SKU）。',
    '车型/车桥适配关系为公开行业资料整理，凡 conf 非「已确认」的条目，对外报价前须由研发复核。',
    '价格、MOQ、交期为演示示例值，接入报价表 / ERP 后一键覆盖。'
  ]
};

export const materials = [
  {
    id: 'NAO', name: 'NAO 无石棉有机', nameEn: 'NAO Non-Asbestos Organic',
    mu: '0.35 – 0.42', temp: '≤ 400 ℃', factor: 1.00,
    traits: ['低噪音', '对偶件磨损小', '粉尘少'],
    fit: '客运、轻中载卡车、城市配送、对舒适性要求高的市场',
    note: '出口欧盟/中东的常规首选，性价比最平衡'
  },
  {
    id: 'SM', name: '半金属', nameEn: 'Semi-Metallic',
    mu: '0.38 – 0.45', temp: '≤ 550 ℃', factor: 0.96,
    traits: ['抗热衰退好', '承载能力强', '价格低'],
    fit: '重载卡车、工程车、山区与高温工况',
    note: '北美、中东重载车队常用'
  },
  {
    id: 'LM', name: '低金属', nameEn: 'Low-Metallic',
    mu: '0.38 – 0.42', temp: '≤ 450 ℃', factor: 1.06,
    traits: ['欧系原厂手感', '初始咬合好', '高速稳定性好'],
    fit: '欧系卡车 / 挂车，替代 OE 件的首选',
    note: 'ECE R90 认证覆盖型号最多'
  },
  {
    id: 'CM', name: '陶瓷', nameEn: 'Ceramic',
    mu: '0.34 – 0.40', temp: '≤ 450 ℃', factor: 1.12,
    traits: ['极低粉尘', '安静', '轮毂干净'],
    fit: '高端售后、北美/澳洲零售市场、轻型商用车',
    note: '终端零售溢价最高'
  },
  {
    id: 'HD', name: '重载芳纶', nameEn: 'Heavy-Duty Aramid',
    mu: '0.42 – 0.48', temp: '≤ 650 ℃', factor: 1.18,
    traits: ['高温摩擦系数稳定', '寿命长', '抗剪切'],
    fit: '矿区、山区、超载工况、长途干线',
    note: '按里程计价时最有竞争力'
  },
  {
    id: 'WT', name: '风电高摩擦', nameEn: 'Wind Turbine High-Friction',
    mu: '0.45 – 0.50', temp: '≤ 700 ℃', factor: 1.45,
    traits: ['高静摩擦', '抗蠕变', '长换件周期'],
    fit: '风电偏航 / 主轴制动器',
    note: '单件价值高，按图纸与机型配套'
  }
];

export const brands = [
  { id: 'KOOYING', name: 'KOOYING', desc: '出口主品牌，覆盖欧美日韩及中国车型全系列' },
  { id: 'GUANYING', name: 'GUANYING 冠英', desc: '国内及东南亚渠道品牌' },
  { id: 'AD', name: 'AD 经济线', desc: '价格敏感市场，主攻中东、非洲、南美二级批发' },
  { id: 'SF', name: 'SF 制动蹄', desc: '制动蹄总成与蹄铁线' },
  { id: 'KY', name: 'KY 传动件', desc: '离合器面片等传动摩擦件' }
];

export const currency = { base: 'USD', rates: { USD: 1, CNY: 7.15, EUR: 0.92, AED: 3.6725, SAR: 3.75 } };

// ── 车桥主数据 ────────────────────────────────────────────────
export const axles = [
  { id: 'AX-BPW-TS2', brand: 'BPW', model: 'TS2 370', type: '盘式', cap: '13T 挂车', spec: '盘径 370 mm', alias: ['BPW桥', 'BPW TS2', 'BPW盘刹', 'BPW 370'] },
  { id: 'AX-BPW-95', brand: 'BPW', model: '95 / SN4218', type: '鼓式', cap: '14T 挂车', spec: '蹄总成 420×180', alias: ['BPW95', 'BPW 95', 'BPW鼓刹'] },
  { id: 'AX-FUWA-13', brand: '富华 FUWA', model: '13T', type: '鼓式', cap: '13T 挂车', spec: '蹄总成 420×180', alias: ['富华桥', '富华13吨', 'FUWA'] },
  { id: 'AX-FUWA-16', brand: '富华 FUWA', model: '16T', type: '鼓式', cap: '16T 挂车', spec: '蹄总成 420×200', alias: ['富华16吨'] },
  { id: 'AX-SAF-1943', brand: 'SAF', model: 'SKRS 1943', type: '鼓式', cap: '12T 挂车', spec: '衬片 420×200', alias: ['SAF桥', 'SAF 1943'] },
  { id: 'AX-YORK', brand: 'YORK', model: 'Trailer', type: '鼓式', cap: '13T 挂车', spec: '衬片 420×200', alias: ['约克桥', 'YORK桥'] },
  { id: 'AX-JF-457', brand: '一汽解放', model: '457 桥', type: '鼓式', cap: '13T 单级减速', spec: '衬片 8 孔', alias: ['457桥', '解放457', '457后桥'] },
  { id: 'AX-JF-485', brand: '一汽解放', model: '485 桥', type: '鼓式', cap: '16T 单级减速', spec: '衬片 15 孔', alias: ['485桥', '解放485'] },
  { id: 'AX-JF-498', brand: '一汽解放', model: '498 桥', type: '鼓式', cap: '16T 轮减桥', spec: '衬片 15 孔', alias: ['498桥', '解放498'] },
  { id: 'AX-DF-153', brand: '东风', model: '153 桥', type: '鼓式', cap: '10T', spec: '衬片 15 孔', alias: ['153桥', '东风153', '德纳153'] },
  { id: 'AX-DF-460', brand: '东风', model: '460 桥', type: '鼓式', cap: '13T', spec: '衬片 15 孔', alias: ['460桥', '东风460'] },
  { id: 'AX-HW-HC16', brand: '中国重汽', model: 'HC16 桥', type: '鼓式', cap: '16T 轮减桥', spec: '衬片 16 孔', alias: ['HC16', '豪沃桥', '重汽16吨桥'] },
  { id: 'AX-HD-MAN13', brand: '汉德 HANDE', model: 'MAN 13T', type: '鼓式', cap: '13T', spec: '衬片 16 孔', alias: ['汉德桥', 'MAN桥', '陕汽汉德'] },
  { id: 'AX-MER-RS', brand: '美驰 Meritor', model: 'RS 系列', type: '鼓式', cap: '13T', spec: '衬片 16 孔', alias: ['美驰桥', 'Meritor'] }
];

// ── 车型主数据 ────────────────────────────────────────────────
export const vehicles = [
  {
    id: 'V-HOWO-A7', brand: '中国重汽', series: '豪沃 HOWO', model: 'A7 / T7H', years: '2009 – 2019',
    alias: ['豪沃', 'HOWO', 'HOWO A7', 'T7H', '重汽豪沃', '豪沃A7', 'A7'], cls: '牵引车 / 自卸车',
    axles: ['AX-HW-HC16'], note: '国内保有量最大的重卡平台之一，出口中东/非洲/东南亚以 A7 为主'
  },
  {
    id: 'V-HOWO-TH7', brand: '中国重汽', series: '豪沃 HOWO', model: 'TH7 / TX', years: '2019 –',
    alias: ['TH7', 'TX', '豪沃TH7', '豪沃TX'], cls: '牵引车',
    axles: ['AX-HW-HC16'], note: 'MAN 技术平台，前后桥配置差异大，必须核车桥'
  },
  {
    id: 'V-J6P', brand: '一汽解放', series: 'J6', model: 'J6P', years: '2007 – 2021',
    alias: ['J6', 'J6P', '解放J6', 'FAW J6', '解放J6P'], cls: '牵引车 / 载货车',
    axles: ['AX-JF-457', 'AX-JF-485', 'AX-JF-498'], note: '457/485/498 三种后桥共存，是「同车型不同片」的典型'
  },
  {
    id: 'V-JH6', brand: '一汽解放', series: 'JH6', model: 'JH6', years: '2013 –',
    alias: ['JH6', '青岛解放JH6', '解放JH6'], cls: '牵引车',
    axles: ['AX-JF-457', 'AX-JF-485'], note: '青岛基地产品，桥型与 J6P 部分通用'
  },
  {
    id: 'V-J7', brand: '一汽解放', series: 'J7', model: 'J7', years: '2018 –',
    alias: ['J7', '解放J7'], cls: '高端牵引车',
    axles: ['AX-JF-498'], note: '部分车型配盘式桥，需实车确认'
  },
  {
    id: 'V-TIANLONG', brand: '东风', series: '天龙', model: '天龙 (2006–2013)', years: '2006 – 2013',
    alias: ['天龙', '东风天龙', 'Dongfeng Tianlong'], cls: '牵引车',
    axles: ['AX-DF-153', 'AX-DF-460'], note: '153 桥与 460 桥混装，片型不同'
  },
  {
    id: 'V-TIANLONG-KL', brand: '东风', series: '天龙', model: '天龙 KL', years: '2019 –',
    alias: ['天龙KL', 'KL', '东风KL'], cls: '牵引车',
    axles: ['AX-DF-460'], note: '460 桥为主，部分配 485'
  },
  {
    id: 'V-TIANJIN', brand: '东风', series: '天锦', model: '天锦', years: '2011 –',
    alias: ['天锦', '东风天锦'], cls: '中卡',
    axles: ['AX-DF-153'], note: '中卡平台，常与 EQ153 片通用'
  },
  {
    id: 'V-DELONG', brand: '陕汽', series: '德龙', model: 'F3000 / X3000 / M3000', years: '2006 –',
    alias: ['德龙', '陕汽德龙', 'F3000', 'X3000', 'M3000', 'Shacman'], cls: '牵引车 / 自卸车',
    axles: ['AX-HD-MAN13'], note: '斯太尔技术桥与 MAN 技术桥并存，早期车型多用斯太尔桥片'
  },
  {
    id: 'V-AUMAN', brand: '福田', series: '欧曼', model: 'ETX / GTL / EST', years: '2006 –',
    alias: ['欧曼', 'GTL', 'EST', 'ETX', '福田欧曼'], cls: '牵引车',
    axles: ['AX-HD-MAN13', 'AX-DF-460'], note: '青特桥 / 奔驰技术桥混装'
  },
  {
    id: 'V-JAC', brand: '江淮', series: '格尔发', model: '格尔发 K 系', years: '2010 –',
    alias: ['格尔发', '江淮格尔发', 'JAC'], cls: '中重卡',
    axles: ['AX-DF-153'], note: '中卡平台，出口南美较多'
  },
  {
    id: 'V-DAYUN', brand: '大运', series: 'N8 / N9', model: 'N8H / N9H', years: '2012 –',
    alias: ['大运', 'N8', 'N9', '大运重卡'], cls: '牵引车',
    axles: ['AX-HD-MAN13'], note: ''
  },
  {
    id: 'V-HONGYAN', brand: '上汽红岩', series: '杰狮', model: '杰狮 C / M', years: '2009 –',
    alias: ['红岩', '杰狮', 'IVECO 红岩'], cls: '自卸车',
    axles: ['AX-HD-MAN13'], note: '工程车工况，重载配方需求高'
  },
  {
    id: 'V-YUTONG', brand: '宇通', series: '客车', model: 'ZK 系列公路客车', years: '2005 –',
    alias: ['宇通', 'YUTONG', 'ZK'], cls: '客车',
    axles: ['AX-DF-153'], note: '客车前/后片与 EQ153 系列通用性高'
  },
  {
    id: 'V-KINGLONG', brand: '金龙', series: '客车', model: 'XMQ 系列', years: '2005 –',
    alias: ['金龙', 'KINGLONG', 'XMQ', '海格', 'HIGER'], cls: '客车',
    axles: ['AX-DF-153'], note: ''
  },
  {
    id: 'V-HYUNDAI-BUS', brand: '现代', series: '客车', model: 'Aero / Universe', years: '2005 –',
    alias: ['现代客车', 'HYUNDAI BUS', 'Universe', 'Aero'], cls: '客车',
    axles: [], note: '中东、东南亚、南美客车主力，前/后片分 F1/F2/R1/R2 四款'
  },
  {
    id: 'V-DAEWOO-BUS', brand: '大宇', series: '客车', model: 'BH / BS 系列', years: '2000 –',
    alias: ['大宇客车', 'DAEWOO BUS', 'DAWOO'], cls: '客车',
    axles: [], note: '前/后片两款'
  },
  {
    id: 'V-HINO500', brand: '日野', series: '500 系', model: 'HINO 500 / Ranger', years: '2003 –',
    alias: ['日野', 'HINO', 'HINO500', 'Ranger'], cls: '中卡',
    axles: [], note: '东南亚、南美保有量大'
  },
  {
    id: 'V-ISUZU-FVR', brand: '五十铃', series: 'FVR / FSR', model: 'FVR 系列', years: '2000 –',
    alias: ['五十铃', 'ISUZU', 'FVR', 'FSR', 'NPR', 'NPR 71', 'NPR71'], cls: '中卡',
    axles: [], note: ''
  },
  {
    id: 'V-FUSO', brand: '三菱扶桑', series: 'FUSO', model: 'Fighter / Super Great', years: '2000 –',
    alias: ['三菱', 'FUSO', '扶桑', 'MITSUBISHI'], cls: '中重卡',
    axles: [], note: ''
  },
  {
    id: 'V-NISSAN', brand: '日产', series: 'Condor', model: 'Condor / Atlas', years: '2000 –',
    alias: ['日产', 'NISSAN', 'Condor'], cls: '中卡',
    axles: [], note: ''
  },
  {
    id: 'V-DAF-XF', brand: 'DAF', series: 'XF / CF', model: 'XF 105 / CF', years: '2005 –',
    alias: ['DAF', '达夫', 'XF105', 'CF'], cls: '牵引车',
    axles: ['AX-BPW-TS2'], note: '欧洲挂车组合，盘式桥为主'
  },
  {
    id: 'V-ACTROS', brand: '梅赛德斯-奔驰', series: 'Actros', model: 'Actros MP2 / MP3', years: '2003 –',
    alias: ['奔驰', 'Actros', 'Benz', 'MERCEDES'], cls: '牵引车',
    axles: [], note: ''
  },
  {
    id: 'V-VOLVO-FH', brand: '沃尔沃', series: 'FH', model: 'FH12 / FH13', years: '2000 –',
    alias: ['沃尔沃', 'VOLVO', 'FH12', 'FH'], cls: '牵引车',
    axles: [], note: ''
  },
  {
    id: 'V-TRAILER-BPW', brand: '挂车', series: 'BPW 桥挂车', model: '半挂车 / 栏板挂车', years: '—',
    alias: ['挂车', '半挂车', 'BPW挂车', '骨架车'], cls: '挂车',
    axles: ['AX-BPW-TS2', 'AX-BPW-95'], note: '挂车换桥比例最高，车型完全无法锁定，只能靠桥'
  },
  {
    id: 'V-TRAILER-FUWA', brand: '挂车', series: '富华桥挂车', model: '半挂车', years: '—',
    alias: ['富华挂车', 'FUWA挂车'], cls: '挂车',
    axles: ['AX-FUWA-13', 'AX-FUWA-16'], note: ''
  }
];

// ── 适配关系（核心知识）────────────────────────────────────────
// conf: 已确认 = 有实车/试验依据；高 = 官网目录明确；中 = 行业通行对应；低 = 待验证
export const fitments = [
  { v: 'V-HOWO-A7', a: 'AX-HW-HC16', pos: '后', code: 'HOWO1', fit: 'OE 替代', conf: '高', src: '官网中国车型目录',
    q: ['后桥是 HC16 轮减桥还是 MAN 技术桥？', '数一下旧片孔数：16 孔 / 12 孔'] },
  { v: 'V-HOWO-A7', a: 'AX-HW-HC16', pos: '后', code: 'HOWO2', fit: '替代', conf: '中', src: '售后反馈',
    q: ['旧片宽度是 200 mm 还是 220 mm？'] },
  { v: 'V-HOWO-TH7', a: 'AX-HW-HC16', pos: '后', code: 'NEW HOWO1', fit: 'OE 替代', conf: '中', src: '官网中国车型目录',
    q: ['确认是否 MAN 技术桥（TH7 早期仍用 HC16）'] },

  { v: 'V-J6P', a: 'AX-JF-457', pos: '后', code: 'CA9T R', fit: 'OE 替代', conf: '高', src: '官网中国车型目录',
    q: ['后桥是 457 还是 485/498？', '数一下旧片孔数：8 孔多为 457 桥'] },
  { v: 'V-J6P', a: 'AX-JF-457', pos: '前', code: 'CA9T F', fit: 'OE 替代', conf: '中', src: '行业通行对应',
    q: ['前桥是 300 桥还是 457 前桥？'] },
  { v: 'V-J6P', a: 'AX-JF-485', pos: '后', code: 'CA9T R', fit: '通用', conf: '低', src: '待研发确认',
    q: ['485 桥需实测片长，不能直接按 457 桥下料'] },
  { v: 'V-JH6', a: 'AX-JF-457', pos: '后', code: 'CA9T R', fit: 'OE 替代', conf: '中', src: '行业通行对应',
    q: ['与 J6P 同桥则可直接互换，需确认桥号'] },
  { v: 'V-J7', a: 'AX-JF-498', pos: '后', code: 'CA9T R', fit: '待验证', conf: '低', src: '待研发确认',
    q: ['J7 多为盘式后桥，请拍制动器照片'] },

  { v: 'V-TIANLONG', a: 'AX-DF-153', pos: '后', code: 'EQ153 R', fit: 'OE 替代', conf: '高', src: '官网中国车型目录',
    q: ['后桥是 153 桥还是 460 桥？', '153 桥旧片为 15 孔'] },
  { v: 'V-TIANLONG', a: 'AX-DF-153', pos: '前', code: 'EQ153 F', fit: 'OE 替代', conf: '中', src: '行业通行对应',
    q: ['前桥片长是否约 180 mm？'] },
  { v: 'V-TIANLONG', a: 'AX-DF-460', pos: '后', code: 'NEW EQ153 R', fit: '替代', conf: '中', src: '售后反馈',
    q: ['460 桥请确认片宽 220 mm'] },
  { v: 'V-TIANLONG-KL', a: 'AX-DF-460', pos: '后', code: 'NEW EQ153 R', fit: 'OE 替代', conf: '中', src: '行业通行对应',
    q: ['KL 后桥多为 460 桥，确认孔数 15'] },
  { v: 'V-TIANJIN', a: 'AX-DF-153', pos: '后', code: 'EQ153 R', fit: '通用', conf: '中', src: '行业通行对应', q: [] },
  { v: 'V-DELONG', a: 'AX-HD-MAN13', pos: '后', code: 'STEYR R', fit: 'OE 替代', conf: '高', src: '官网中国车型目录',
    q: ['是斯太尔桥（早期 F3000）还是 MAN 桥（X3000）？', 'MAN 桥需另一款片，勿混发'] },
  { v: 'V-DELONG', a: 'AX-HD-MAN13', pos: '前', code: 'STEYR F2', fit: 'OE 替代', conf: '中', src: '官网中国车型目录',
    q: ['前片厚度 14.5 mm 还是 17 mm？'] },
  { v: 'V-AUMAN', a: 'AX-DF-460', pos: '后', code: 'NEW EQ153 R', fit: '替代', conf: '低', src: '待研发确认', q: ['欧曼桥型杂，需车桥铭牌照片'] },
  { v: 'V-JAC', a: 'AX-DF-153', pos: '后', code: 'EQ153 R', fit: '通用', conf: '中', src: '行业通行对应', q: [] },
  { v: 'V-DAYUN', a: 'AX-HD-MAN13', pos: '后', code: 'STEYR R', fit: '替代', conf: '低', src: '待研发确认', q: [] },
  { v: 'V-HONGYAN', a: 'AX-HD-MAN13', pos: '后', code: 'STEYR R', fit: '替代', conf: '低', src: '待研发确认',
    q: ['工程车重载，建议改 HD 配方'] },

  { v: 'V-YUTONG', a: 'AX-DF-153', pos: '后', code: 'NEW EQ153 R', fit: 'OE 替代', conf: '高', src: '官网中国车型目录',
    q: ['客车后片多为 15 孔，确认片宽'] },
  { v: 'V-YUTONG', a: 'AX-DF-153', pos: '前', code: 'NEW EQ153 F', fit: 'OE 替代', conf: '高', src: '官网中国车型目录', q: [] },
  { v: 'V-KINGLONG', a: 'AX-DF-153', pos: '后', code: 'NEW EQ153 R', fit: '通用', conf: '高', src: '官网中国车型目录', q: [] },

  { v: 'V-HYUNDAI-BUS', a: null, pos: '前', code: 'HYUNDAI BUS F1', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: ['前片是 F1 还是 F2？'] },
  { v: 'V-HYUNDAI-BUS', a: null, pos: '前', code: 'HYUNDAI BUS F2', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: [] },
  { v: 'V-HYUNDAI-BUS', a: null, pos: '后', code: 'HYUNDAI BUS R1', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: ['后片是 R1 还是 R2？'] },
  { v: 'V-HYUNDAI-BUS', a: null, pos: '后', code: 'HYUNDAI BUS R2', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: [] },
  { v: 'V-DAEWOO-BUS', a: null, pos: '前', code: 'DAWOO F', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: [] },
  { v: 'V-DAEWOO-BUS', a: null, pos: '后', code: 'DAWOO R', fit: 'OE 替代', conf: '中', src: '官网韩系目录', q: [] },

  { v: 'V-HINO500', a: null, pos: '后', code: '47441-4220', fit: 'OE 替代', conf: '高', src: '官网日系目录 + OE 编码', q: [] },
  { v: 'V-ISUZU-FVR', a: null, pos: '后', code: '47115-406', fit: 'OE 替代', conf: '高', src: '官网日系目录 + OE 编码', q: ['FVR 与 FSR 后片不同，需报车架号'] },
  { v: 'V-FUSO', a: null, pos: '后', code: 'MC809750', fit: 'OE 替代', conf: '高', src: '官网日系目录 + OE 编码', q: [] },
  { v: 'V-FUSO', a: null, pos: '后', code: 'MC828513', fit: '替代', conf: '中', src: '官网日系目录', q: ['8 孔为 MC828513，注意与 MC809750 区分'] },
  { v: 'V-NISSAN', a: null, pos: '后', code: '41039-90113', fit: 'OE 替代', conf: '高', src: '官网日系目录 + OE 编码', q: [] },

  { v: 'V-TRAILER-BPW', a: 'AX-BPW-TS2', pos: '后', code: '29087', fit: 'OE 替代', conf: '高', src: '官网欧系目录（BPW/DAF 通用）', q: ['盘式桥确认盘径 370 mm'] },
  { v: 'V-DAF-XF', a: 'AX-BPW-TS2', pos: '后', code: '29087', fit: 'OE 替代', conf: '高', src: '官网欧系目录（BPW/DAF 通用）', q: [] },
  { v: 'V-DAF-XF', a: null, pos: '前', code: '29090', fit: '替代', conf: '中', src: '官网欧系目录', q: [] },
  { v: 'V-ACTROS', a: null, pos: '后', code: '29162', fit: 'OE 替代', conf: '高', src: '官网产品页明确标注 Actros 适配', q: ['MP2 与 MP3 卡钳不同'] },
  { v: 'V-ACTROS', a: null, pos: '后', code: '29137', fit: '替代', conf: '中', src: '官网欧系目录', q: [] },
  { v: 'V-VOLVO-FH', a: null, pos: '后', code: 'VOLVO86', fit: 'OE 替代', conf: '中', src: '官网欧系目录', q: [] },
  { v: 'V-TRAILER-FUWA', a: 'AX-FUWA-13', pos: '后', code: 'WB 3025', fit: 'OE 替代', conf: '高', src: '官网制动蹄目录（BPW 14T）', q: ['蹄总成按 420×180 核对'] },
  { v: 'V-TRAILER-BPW', a: 'AX-BPW-95', pos: '后', code: 'BPW05090146170', fit: 'OE 替代', conf: '高', src: '官网制动蹄目录', q: [] },

  { v: null, a: null, pos: '后', code: '4702a', fit: 'OE 替代', conf: '中', src: '官网美系目录（FORD/IVECO）', q: [] },
  { v: null, a: null, pos: '后', code: '4515Ea', fit: 'OE 替代', conf: '中', src: '官网美系目录', q: ['16 孔为 4515Ec'] },
  { v: null, a: null, pos: '后', code: '4551Ba', fit: 'OE 替代', conf: '中', src: '官网美系目录', q: [] }
];

// ── 试验报告（示例台账，接入检测中心后替换）────────────────────
export const tests = [
  { code: '29087', std: 'ECE R90', item: '摩擦系数 μ', result: '0.41（cold 0.39 / hot 0.42）', verdict: '合格', lab: '国家非金属矿制品质量监督检验中心', no: 'R90-2025-0871', date: '2025-08-14' },
  { code: '29087', std: 'SAE J661', item: '磨损率', result: '0.18 mm/万km（等效）', verdict: '合格', lab: '内部台架', no: 'J661-2025-1102', date: '2025-10-02' },
  { code: '29087', std: 'GB 5763-2018', item: '剪切强度', result: '3.9 MPa', verdict: '合格（≥2.5）', lab: '国家非金属矿制品质量监督检验中心', no: 'GB5763-2025-0455', date: '2025-06-20' },
  { code: 'HOWO1', std: 'GB 5763-2018', item: '摩擦系数（100–350℃）', result: '0.38 – 0.44', verdict: '合格', lab: '国家非金属矿制品质量监督检验中心', no: 'GB5763-2025-0512', date: '2025-07-03' },
  { code: 'HOWO1', std: 'GB 5763-2018', item: '磨损率（mm/万km）', result: '0.22', verdict: '合格', lab: '内部台架', no: 'GB5763-2025-0513', date: '2025-07-03' },
  { code: 'EQ153 R', std: 'GB 5763-2018', item: '摩擦系数', result: '0.40', verdict: '合格', lab: '国家非金属矿制品质量监督检验中心', no: 'GB5763-2024-1188', date: '2024-11-28' },
  { code: 'EQ153 R', std: 'QC/T 25-2004', item: '台架耐久（5000 次）', result: '无裂纹、无脱层', verdict: '合格', lab: '内部台架', no: 'QC25-2025-0088', date: '2025-03-11' },
  { code: 'CA9T R', std: 'GB 5763-2018', item: '摩擦系数', result: '0.39', verdict: '合格', lab: '国家非金属矿制品质量监督检验中心', no: 'GB5763-2025-0033', date: '2025-01-16' },
  { code: 'WB 3025', std: 'ISO 15484', item: '蹄总成剪切', result: '4.6 MPa', verdict: '合格', lab: 'SGS', no: 'ISO15484-2025-0219', date: '2025-04-09' },
  { code: '9710081817', std: '企业标准 Q/GY 001-2024', item: '静摩擦系数', result: '0.48', verdict: '合格', lab: '内部台架', no: 'WT-2025-0021', date: '2025-05-22' },
  { code: '47441-4220', std: 'JIS D 4411', item: '摩擦系数', result: '0.37', verdict: '合格', lab: 'SGS', no: 'JIS-2024-0771', date: '2024-09-30' },
  { code: 'MC809750', std: 'ECE R90', item: '整车匹配', result: '通过（FUSO Fighter）', verdict: '合格', lab: 'TÜV', no: 'R90-2024-0664', date: '2024-12-05' }
];

// ── 客户与线索（演示数据）──────────────────────────────────────
export const customers = [
  { id: 'C-001', name: 'Al-Rashid Auto Parts Trading LLC', country: '阿联酋', region: '中东', type: '经销商', tz: 'Asia/Dubai', grade: 'A', brand: 'KOOYING', priceLevel: '标准', incoterm: 'CIF Jebel Ali', pay: 'T/T 30% 定金', last: '2026-09-18', note: '迪拜汽配城门店 + 阿曼分销，偏好欧系盘式片' },
  { id: 'C-002', name: 'PT Sinar Jaya Motor', country: '印度尼西亚', region: '东南亚', type: '经销商', tz: 'Asia/Jakarta', grade: 'B', brand: 'AD', priceLevel: '经济', incoterm: 'FOB Ningbo', pay: 'T/T 30 天', last: '2026-08-02', note: '日系中卡为主，价格敏感' },
  { id: 'C-003', name: 'Comercial Andina S.A.', country: '智利', region: '南美', type: '经销商', tz: 'America/Santiago', grade: 'A', brand: 'KOOYING', priceLevel: '标准', incoterm: 'CIF San Antonio', pay: 'L/C 60 天', last: '2026-10-27', note: '中国重卡出口配套售后，豪沃/解放保有量大' },
  { id: 'C-004', name: 'Transportes del Norte S.A. de C.V.', country: '墨西哥', region: '北美', type: '车队', tz: 'America/Mexico_City', grade: 'A', brand: 'KOOYING', priceLevel: '大客户', incoterm: 'DDP Monterrey', pay: 'T/T 45 天', last: '2026-11-05', note: '自有 480 台牵引车，按里程采购，重载芳纶配方' },
  { id: 'C-005', name: 'Guangzhou Sunny Import & Export Co., Ltd.', country: '中国', region: '国内', type: '贸易商', tz: 'Asia/Shanghai', grade: 'C', brand: 'AD', priceLevel: '经济', incoterm: 'EXW', pay: '现款', last: '2026-06-11', note: '转口贸易，只比价不下单，需谨慎投入' },
  { id: 'C-006', name: 'Frenos del Pacifico S.R.L.', country: '秘鲁', region: '南美', type: '修理厂连锁', tz: 'America/Lima', grade: 'B', brand: 'GUANYING', priceLevel: '标准', incoterm: 'CIF Callao', pay: 'T/T 30% 定金', last: '2026-07-19', note: '18 家门店，需要小批量多品种' },
  { id: 'C-007', name: 'Sahara Truck Center', country: '沙特阿拉伯', region: '中东', type: '修理厂', tz: 'Asia/Riyadh', grade: 'B', brand: 'KOOYING', priceLevel: '标准', incoterm: 'CIF Dammam', pay: 'T/T 30 天', last: '2026-10-08', note: '重卡维修，急需现场选型工具' },
  { id: 'C-008', name: 'Mekong Friction Parts Co., Ltd.', country: '越南', region: '东南亚', type: '贸易商', tz: 'Asia/Ho_Chi_Minh', grade: 'C', brand: 'AD', priceLevel: '经济', incoterm: 'FOB Hai Phong', pay: 'T/T 30 天', last: '2026-05-23', note: '贴牌采购，量大但压价狠' }
];

export const leads = [
  { id: 'L-2601', created: '2026-11-21 08:12', src: '官网表单', company: 'Transportes del Norte', contact: 'Jorge Ramírez（采购经理）', country: '墨西哥', tz: 'America/Mexico_City',
    need: 'Tenemos 480 unidades HOWO A7, necesitamos pastillas de freno traseras, 200 sets. ¿Precio FOB?', needZh: '480 台豪沃 A7，需后刹车片 200 套，问 FOB 价',
    status: '待跟进', score: 92, owner: 'Sophia', next: '回车型确认清单 + 报价', nextDate: '2026-11-21', product: ['HOWO1'], note: '官网留言含车队规模，是终端车队而非贸易商' },
  { id: 'L-2602', created: '2026-11-21 03:40', src: 'WhatsApp', company: 'Sahara Truck Center', contact: 'Ahmed（店主）', country: '沙特阿拉伯', tz: 'Asia/Riyadh',
    need: 'عندي شاحنة مرسيدس أكتروس، أبغى الفحمات الخلفية، كيف أعرف المقاس؟', needZh: '有台奔驰 Actros，要后片，怎么知道尺寸？',
    status: '待跟进', score: 78, owner: 'Jenny', next: '发现场选型卡片（拍照定位法）', nextDate: '2026-11-21', product: ['29162'], note: '典型「现场答不上」场景，先用消歧清单' },
  { id: 'L-2603', created: '2026-11-20 22:05', src: '海关数据', company: 'Global Friction Trading FZE', contact: '—', country: '阿联酋', tz: 'Asia/Dubai',
    need: '（无具体询盘，仅海关记录进口刹车片 3 柜）', needZh: '海关记录：进口刹车片 3 柜',
    status: '待甄别', score: 34, owner: '未分配', next: '先查是否贸易商再决定投入', nextDate: '2026-11-24', product: [], note: '名称含 Trading FZE，大概率为贸易公司' },
  { id: 'L-2604', created: '2026-11-20 19:22', src: 'LinkedIn', company: 'Frenos del Pacifico', contact: 'María Quispe（采购）', country: '秘鲁', tz: 'America/Lima',
    need: 'Necesitamos surtido para 18 tiendas, modelos chinos y japoneses, 20–50 sets por modelo.', needZh: '18 家门店要中国车+日本车混装，每款 20–50 套',
    status: '已报价', score: 71, owner: 'Sophia', next: '等客户确认车型清单', nextDate: '2026-11-23', product: ['EQ153 R', '47441-4220'], note: '小批量多品种，走拼柜' },
  { id: 'L-2605', created: '2026-11-20 11:03', src: '展会名片', company: 'Mekong Friction Parts', contact: 'Nguyen Van A', country: '越南', tz: 'Asia/Ho_Chi_Minh',
    need: 'Cần báo giá gấp, số lượng lớn, giá tốt nhất.', needZh: '急要报价，量大，要最低价',
    status: '待跟进', score: 41, owner: 'Jenny', next: '先问终端还是贴牌', nextDate: '2026-11-22', product: [], note: '只谈价格不谈型号，贸易商特征明显' },
  { id: 'L-2606', created: '2026-11-19 16:48', src: 'Facebook 评论', company: 'Taller El Rayo', contact: 'Carlos M.', country: '哥伦比亚', tz: 'America/Bogota',
    need: 'Busco pastillas para NPR 71, ¿tienen?', needZh: '找 NPR 71 的片，有吗',
    status: '待跟进', score: 66, owner: 'Sophia', next: '确认 NPR 71 后片 → 47115-406 系列', nextDate: '2026-11-22', product: ['47115-406'], note: '修理厂，单量小但复购稳定' },
  { id: 'L-2607', created: '2026-11-19 09:30', src: '阿里巴巴询盘', company: 'Sunrise Auto Spareparts', contact: 'Ravi', country: '印度', tz: 'Asia/Kolkata',
    need: 'Need brake lining for BPW axle, 500 pcs, best price CIF Chennai.', needZh: 'BPW 桥衬片 500 片，CIF 金奈最低价',
    status: '待跟进', score: 58, owner: 'Jenny', next: '确认 BPW 桥型号（95/TS2）', nextDate: '2026-11-22', product: ['29087'], note: '未说桥型，需先消歧' },
  { id: 'L-2608', created: '2026-11-18 21:15', src: '海关数据', company: 'Andes Truck Parts SpA', contact: '—', country: '智利', tz: 'America/Santiago',
    need: '（海关记录：连续 4 季度进口中国产刹车片，收货人为修理厂集团）', needZh: '连续 4 季度进口，收货人为修理厂集团',
    status: '待甄别', score: 81, owner: '未分配', next: '用收货人+终端地址验证后转 A 类', nextDate: '2026-11-22', product: [], note: '收货人为终端，值得投入' }
];

// ── 询盘评分规则（可解释）──────────────────────────────────────
export const scoreRules = [
  { k: 'terminal', w: 18, label: '终端属性', desc: '车队 / 修理厂 / 主机厂配套 = 加分；名称含 Trading / Import & Export = 减分' },
  { k: 'spec', w: 16, label: '需求具体度', desc: '给出车型+车桥+数量 = 高分；只说「要刹车片」= 低分' },
  { k: 'volume', w: 12, label: '数量与频次', desc: '车队规模、月度用量、复购记录' },
  { k: 'reach', w: 10, label: '可触达性', desc: '有实名联系人 / 电话 / 公司域名邮箱' },
  { k: 'fit', w: 10, label: '产品匹配度', desc: '需求型号在库且现货' },
  { k: 'market', w: 8, label: '市场价值', desc: '历史成交价、认证门槛、竞争强度' }
];

// ── 回复话术模板 ──────────────────────────────────────────────
export const templates = [
  {
    id: 'T-DISAMB', name: '车型消歧（3 问定型号）', lang: '中文 / EN',
    body: `Hi {{contact}},\n\nThanks for your inquiry about {{vehicle}}. To make sure we ship the exact pads (and avoid a wrong shipment), please confirm ONE of the following — any single one is enough:\n\n1) Axle brand & model on the nameplate (e.g. BPW TS2 370, FUWA 13T, HC16);\n2) A photo of the old pad next to a ruler (length × width × thickness);\n3) The OE / competitor number printed on the old pad or box.\n\nFrom our database, {{vehicle}} was built with {{axleCount}} different rear axles, so the model alone cannot lock the part. Once you confirm, we will send price + drawing + test report within 2 hours.\n\nBest regards,\n{{owner}} | KOOYING`
  },
  {
    id: 'T-QUOTE', name: '报价跟进（含资料包）', lang: 'EN',
    body: `Dear {{contact}},\n\nAttached is our quotation for {{items}} (valid 30 days), together with:\n• Specification sheet & drawing\n• Friction test report ({{std}})\n• Packing / container loading data\n\nKey points: {{keyPoints}}\n\nIf the axle is different from what we assumed, send us a photo of the old pad — we will re-match within 2 hours.\n\n{{owner}} | ZHEJIANG KOOYING AUTOPARTS`
  },
  {
    id: 'T-NOSPEC', name: '客户说不清型号时的兜底', lang: '中文',
    body: `您好 {{contact}}，\n\n不用提供编码也能定：拍 3 张照片给我就行——① 旧片正面（带字那一面）② 旧片侧面靠着卷尺 ③ 车桥铭牌。\n\n我们库里有 {{skuCount}} 个型号、{{fitCount}} 条车型/车桥适配记录，照片回来 2 小时内给型号和价格。\n\n{{owner}}`
  }
];

// ── 已知产品族（用于从官网标题中稳定提取型号编码）────────────────
export const knownFamilies = [
  { re: /NEW\s+HOWO1/i, code: 'NEW HOWO1', brand: 'KOOYING', mat: 'HD' },
  { re: /NEW\s+EQ153\s*F/i, code: 'NEW EQ153 F', brand: 'KOOYING', mat: 'NAO' },
  { re: /NEW\s+EQ153\s*R/i, code: 'NEW EQ153 R', brand: 'KOOYING', mat: 'NAO' },
  { re: /STEYR\s*F1/i, code: 'STEYR F1', brand: 'KOOYING', mat: 'SM' },
  { re: /STEYR\s*F2/i, code: 'STEYR F2', brand: 'KOOYING', mat: 'SM' },
  { re: /STEYR\s*R\b/i, code: 'STEYR R', brand: 'KOOYING', mat: 'SM' },
  { re: /HOWO\s*1(?!\d)/i, code: 'HOWO1', brand: 'KOOYING', mat: 'SM' },
  { re: /HOWO\s*2(?!\d)/i, code: 'HOWO2', brand: 'KOOYING', mat: 'SM' },
  { re: /EQ153\s*F/i, code: 'EQ153 F', brand: 'KOOYING', mat: 'SM' },
  { re: /EQ153\s*R/i, code: 'EQ153 R', brand: 'KOOYING', mat: 'SM' },
  { re: /CA9T\s*F/i, code: 'CA9T F', brand: 'KOOYING', mat: 'SM' },
  { re: /CA9T\s*R/i, code: 'CA9T R', brand: 'KOOYING', mat: 'SM' },
  { re: /EQ240/i, code: 'EQ240', brand: 'GUANYING', mat: 'NAO' },
  { re: /EQ1080R/i, code: 'EQ1080R', brand: 'GUANYING', mat: 'NAO' },
  { re: /HYUNDAI\s*BUS\s*F1/i, code: 'HYUNDAI BUS F1', brand: 'KOOYING', mat: 'NAO' },
  { re: /HYUNDAI\s*BUS\s*F2/i, code: 'HYUNDAI BUS F2', brand: 'KOOYING', mat: 'NAO' },
  { re: /HYUNDAI\s*BUS\s*R1/i, code: 'HYUNDAI BUS R1', brand: 'KOOYING', mat: 'NAO' },
  { re: /HYUNDAI\s*BUS\s*R2/i, code: 'HYUNDAI BUS R2', brand: 'KOOYING', mat: 'NAO' },
  { re: /DAWOO\s*F/i, code: 'DAWOO F', brand: 'KOOYING', mat: 'NAO' },
  { re: /DAWOO\s*R/i, code: 'DAWOO R', brand: 'KOOYING', mat: 'NAO' },
  { re: /VOLVO\s*86/i, code: 'VOLVO86', brand: 'KOOYING', mat: 'LM' },
  { re: /29162/i, code: '29162', brand: 'KOOYING', mat: 'LM' },
  { re: /BPW05090146170/i, code: 'BPW05090146170', brand: 'SF', mat: 'SM' },
  { re: /WB\s*3025/i, code: 'WB 3025', brand: 'SF', mat: 'SM' },
  { re: /SF\s*61540\/1/i, code: 'SF 61540/1', brand: 'SF', mat: 'CM' },
  { re: /SF\s*61540\/2/i, code: 'SF 61540/2', brand: 'SF', mat: 'CM' },
  { re: /SF4516|4516\s+14\.5T/i, code: 'SF4516', brand: 'SF', mat: 'SM' },
  { re: /SF\s*4515\s+4515|SF\s*4515\b/i, code: 'SF 4515', brand: 'SF', mat: 'SM' },
  { re: /SF45510/i, code: 'SF45510', brand: 'SF', mat: 'SM' }
];