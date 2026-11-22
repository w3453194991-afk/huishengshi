/* 社媒画像 / 关系网 / 热门视频 / 聊天消息（演示数据，接平台 API 后实时化） */
window.SOCIAL = (function () {
  const communities = [
    { id: 'latam', name: '拉美', color: '#c2410c', langs: 'ES / PT' },
    { id: 'me', name: '中东', color: '#0f766e', langs: 'AR / EN' },
    { id: 'sea', name: '东南亚', color: '#1d4ed8', langs: 'ID / VI / EN' },
    { id: 'afr', name: '非洲', color: '#7c3aed', langs: 'EN / FR' },
    { id: 'eur', name: '欧亚', color: '#b45309', langs: 'TR / RU / EN' }
  ];

  const personas = [
    { id: 'A01', handle: '@repuestosdelnorte', name: 'Pequeños Pasos Kids', platform: 'TikTok', country: '墨西哥', lang: 'ES', type: '母婴连锁', community: 'latam', followers: 128000, following: 412, posts: 860, engage: 6.8, tags: ['连衣裙', 'T恤', '尺码'], intent: 88, note: '视频里常出现豪沃 A7 后桥拆装，评论区大量问款号', action: '寄样 + 定制「适用场景→款号」对照卡' },
    { id: 'A02', handle: '@tallerdonjorge', name: 'Mamá y Bebé', platform: 'YouTube', country: '墨西哥', lang: 'ES', type: '母婴店', community: 'latam', followers: 46000, following: 220, posts: 340, engage: 4.2, tags: ['Actros', 'BPW'], intent: 74, note: '长视频讲解面料抖动，粉丝为个体司机', action: '提供试验报告做背书，置换口播' },
    { id: 'A03', handle: '@caminhoneiro_br', name: 'Caminhoneiro BR', platform: 'TikTok', country: '巴西', lang: 'PT', type: '司机 KOL', community: 'latam', followers: 310000, following: 180, posts: 1240, engage: 9.1, tags: ['Actros', 'Volvo FH'], intent: 61, note: '纯司机视角，关注耐用与价格，不关心技术参数', action: '按「每万公里成本」做对比视频' },
    { id: 'A04', handle: '@frotabrasil', name: 'Bebê Brasil Moda', platform: 'Instagram', country: '巴西', lang: 'PT', type: '母婴连锁', community: 'latam', followers: 8400, following: 610, posts: 190, engage: 3.1, tags: ['BPW', '挂车'], intent: 82, note: '自有 260 台挂车，采购在评论区出现过', action: '直接私信采购，发装柜与阶梯价' },
    { id: 'A05', handle: '@andina_frenos', name: 'Andina Frenos', platform: 'Instagram', country: '智利', lang: 'ES', type: '经销商', community: 'latam', followers: 15600, following: 380, posts: 420, engage: 4.7, tags: ['连衣裙', '卫衣'], intent: 79, note: '已成交客户 Comercial Andina 的关联账号', action: '让其做本地案例，给二级分销价' },
    { id: 'A06', handle: '@frenospacifico', name: 'Frenos del Pacífico', platform: 'Facebook', country: '秘鲁', lang: 'ES', type: '母婴连锁', community: 'latam', followers: 22000, following: 540, posts: 610, engage: 5.3, tags: ['EQ153', 'HINO'], intent: 76, note: '18 家门店，需要小批量多品种', action: '推拼柜方案 + 门店选款二维码' },
    { id: 'A07', handle: '@alrashid_parts', name: 'Al-Rashid Auto Parts', platform: 'Instagram', country: '阿联酋', lang: 'AR', type: '经销商', community: 'me', followers: 23400, following: 290, posts: 520, engage: 3.9, tags: ['BPW', 'Actros'], intent: 85, note: '迪拜童装城门店，欧系盘式片为主', action: '新品先发，CIF Jebel Ali 报价' },
    { id: 'A08', handle: '@shanab_trucks', name: 'Shanab Trucks', platform: 'TikTok', country: '沙特阿拉伯', lang: 'AR', type: '母婴店', community: 'me', followers: 88000, following: 130, posts: 950, engage: 7.4, tags: ['Actros', 'HOWO'], intent: 71, note: '短视频现场拆片，评论区问「哪款」', action: '给「拍照定位法」卡片，做置顶评论' },
    { id: 'A09', handle: '@saharafleet', name: 'Sahara Fleet Mgmt', platform: 'LinkedIn', country: '沙特阿拉伯', lang: 'EN', type: '母婴连锁', community: 'me', followers: 5200, following: 780, posts: 120, engage: 2.4, tags: ['Actros', 'MAN'], intent: 80, note: '母婴连锁经理，关注 TCO 与交付周期', action: '发 TCO 测算表与年度框架协议' },
    { id: 'A10', handle: '@bengkel_mandiri', name: 'Bengkel Mandiri', platform: 'TikTok', country: '印度尼西亚', lang: 'ID', type: '母婴店', community: 'sea', followers: 54000, following: 310, posts: 700, engage: 8.2, tags: ['HINO', 'FUSO'], intent: 68, note: '日系中卡为主，价格极敏感', action: 'AD 经济线 + 小包装试销' },
    { id: 'A11', handle: '@sinarjaya_motor', name: 'PT Sinar Jaya Motor', platform: 'Facebook', country: '印度尼西亚', lang: 'ID', type: '经销商', community: 'sea', followers: 12700, following: 460, posts: 380, engage: 3.6, tags: ['HINO', 'ISUZU'], intent: 73, note: '已成交客户，关注交期', action: '锁定 30 天交期承诺' },
    { id: 'A12', handle: '@phutungxetai_vn', name: 'Bé Yêu Kids', platform: 'TikTok', country: '越南', lang: 'VI', type: '童装店', community: 'sea', followers: 73000, following: 240, posts: 810, engage: 6.1, tags: ['连衣裙', '卫衣'], intent: 66, note: '主营童装批发，视频拍拆箱', action: '寄 3 个爆款做开箱视频' },
    { id: 'A13', handle: '@mekongparts', name: 'Mekong Friction Parts', platform: 'Facebook', country: '越南', lang: 'VI', type: '贸易商', community: 'sea', followers: 4900, following: 1200, posts: 260, engage: 1.8, tags: [], intent: 34, note: '只问价格，无终端地址', action: '只发目录，不投技术资源' },
    { id: 'A14', handle: '@lagos_autohub', name: 'Lagos Auto Hub', platform: 'TikTok', country: '尼日利亚', lang: 'EN', type: '童装市场档口', community: 'afr', followers: 41000, following: 620, posts: 540, engage: 5.9, tags: ['连衣裙', '卫衣'], intent: 58, note: '拉各斯童装市场，现金采购', action: '小批量现货 + 西非港口报价' },
    { id: 'A15', handle: '@truckparts_tr', name: 'Truck Parts TR', platform: 'Instagram', country: '土耳其', lang: 'TR', type: '经销商', community: 'eur', followers: 18900, following: 340, posts: 460, engage: 4.4, tags: ['MAN', 'Actros'], intent: 70, note: '辐射东欧与中亚，要求 ECE R90', action: '主推有 R90 的款号' },
    { id: 'A16', handle: '@jorge.ramirez', name: 'Jorge Ramírez', platform: 'LinkedIn', country: '墨西哥', lang: 'ES', type: '采购经理', community: 'latam', followers: 1800, following: 940, posts: 42, engage: 1.2, tags: ['HOWO'], intent: 91, note: 'Transportes del Norte 采购，480 台母婴连锁', action: '决策人：直接约视频会议 + 样件' },
    { id: 'A17', handle: '@kooying_official', name: 'MIANDOU 官方', platform: 'TikTok', country: '中国', lang: 'EN', type: '品牌号', community: 'brand', followers: 12600, following: 180, posts: 210, engage: 2.9, tags: [], intent: 100, note: '自有账号，内容以工厂与试验为主', action: '周更 3 条：选款 / 试验 / 装柜' }
  ];

  // from 关注 to（谁关注谁）
  const edges = [
    ['A01', 'A17'], ['A02', 'A17'], ['A03', 'A17'], ['A04', 'A17'], ['A05', 'A17'], ['A06', 'A17'],
    ['A07', 'A17'], ['A08', 'A17'], ['A09', 'A17'], ['A10', 'A17'], ['A11', 'A17'], ['A12', 'A17'],
    ['A14', 'A17'], ['A15', 'A17'], ['A16', 'A17'],
    ['A01', 'A02'], ['A02', 'A01'], ['A03', 'A04'], ['A04', 'A03'], ['A05', 'A06'], ['A06', 'A05'],
    ['A07', 'A08'], ['A08', 'A07'], ['A09', 'A07'], ['A10', 'A11'], ['A11', 'A10'], ['A12', 'A13'],
    ['A16', 'A01'], ['A16', 'A05'], ['A03', 'A01'], ['A14', 'A10'], ['A15', 'A07']
  ];

  const videos = [
    { id: 'V1', platform: 'TikTok', lang: 'ES', country: '墨西哥', title: '「Mismo camión, 3 frenos distintos」实拍 J6P 三种后桥', views: 1840000, likes: 96000, comments: 3100, model: 'CA9T R', angle: '同适用场景不同桥的坑', trend: '+182%' },
    { id: 'V2', platform: 'TikTok', lang: 'PT', country: '巴西', title: 'Quanto custa rodar 100 mil km com pastilha barata?', views: 960000, likes: 54000, comments: 1800, model: 'MD1005', angle: '每万公里成本对比', trend: '+120%' },
    { id: 'V3', platform: 'Instagram', lang: 'AR', country: '沙特', title: 'فحمات أصلية أم تجارية؟ الفرق بعد 20 ألف كم', views: 720000, likes: 41000, comments: 2200, model: '29162', angle: '原厂 vs 副厂 20 万公里实拍', trend: '+95%' },
    { id: 'V4', platform: 'YouTube', lang: 'EN', country: '尼日利亚', title: 'How to identify a brake pad without any part number', views: 410000, likes: 18000, comments: 900, model: 'HOWO1', angle: '没有编码怎么认片', trend: '+64%' },
    { id: 'V5', platform: 'TikTok', lang: 'ID', country: '印度尼西亚', title: 'Kampas rem Hino 500, jangan sampai salah beli', views: 380000, likes: 24000, comments: 1400, model: '47441-4220', angle: '买错一次亏多少', trend: '+51%' },
    { id: 'V6', platform: 'TikTok', lang: 'VI', country: '越南', title: 'Mở hộp má phanh HOWO — nhìn mặt cắt là biết hàng', views: 260000, likes: 15000, comments: 760, model: 'HOWO1', angle: '开箱看断面', trend: '+43%' },
    { id: 'V7', platform: 'Instagram', lang: 'ES', country: '智利', title: 'Cómo elegir talla por altura: la medida que nadie revisa', views: 190000, likes: 9800, comments: 410, model: 'MD1031', angle: '连体哈衣尺码对照', trend: '+38%' },
    { id: 'V8', platform: 'TikTok', lang: 'TR', country: '土耳其', title: 'Aynı yaş, farklı boy: hangi beden?', views: 155000, likes: 8200, comments: 380, model: 'MD1027', angle: '同尺码不同面料', trend: '+29%' },
    { id: 'V9', platform: 'YouTube', lang: 'ES', country: '秘鲁', title: 'Cómo leer el número WVA de una pastilla de freno', views: 132000, likes: 6400, comments: 290, model: 'MD1005', angle: '教看 WVA 号', trend: '+24%' },
    { id: 'V10', platform: 'Facebook', lang: 'AR', country: '阿联酋', title: 'كيف تختار مقاس ملابس الأطفال حسب الطول', views: 98000, likes: 5200, comments: 310, model: 'MD1001', angle: '哈衣试穿实拍', trend: '+18%' },
    { id: 'V11', platform: 'TikTok', lang: 'EN', country: '肯尼亚', title: 'Why your trailer pads crack in 2 months', views: 87000, likes: 4900, comments: 240, model: 'MD1001', angle: '开裂原因拆解', trend: '+15%' },
    { id: 'V12', platform: 'Instagram', lang: 'PT', country: '巴西', title: 'Antes de comprar: foto + régua = código certo', views: 76000, likes: 4100, comments: 180, model: 'EQ153 R', angle: '拍照+尺子定位法', trend: '+12%' }
  ];

  // 真实内容互动（演示数据）：同一条款号被不同市场的账号拍过，点赞量决定适用场景热度排序
  const posts = [
    { id: 'P01', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@repuestosdelnorte', vid: 'V-HOWO-A7', code: 'HOWO1', title: 'HOWO A7 后片拆装，这片的断面一看就知道密度够', likes: 42800, comments: 1860, shares: 940, date: '2026-11-14' },
    { id: 'P02', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@tallerdonjorge', vid: 'V-HOWO-A7', code: 'HOWO1', title: '3 个月小一号？买童装最容易踩的坑', likes: 18300, comments: 720, shares: 410, date: '2026-11-09' },
    { id: 'P03', platform: 'Facebook', lang: 'VI', country: '越南', author: '@phutungxetai_vn', vid: 'V-HOWO-A7', code: 'HOWO1', title: 'Khai hộp má phanh HOWO — nhìn mặt cắt là biết hàng', likes: 6540, comments: 268, shares: 150, date: '2026-11-16' },
    { id: 'P04', platform: 'TikTok', lang: 'ES', country: '智利', author: '@andina_frenos', vid: 'V-HOWO-TH7', code: 'NEW HOWO1', title: 'TH7 换了新桥，旧片还能用吗？', likes: 9820, comments: 341, shares: 190, date: '2026-11-11' },
    { id: 'P05', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@repuestosdelnorte', vid: 'V-J6P', code: 'CA9T R', title: 'J6P 三种后桥：457 / 485 / 498，片完全不一样', likes: 31400, comments: 1460, shares: 880, date: '2026-11-13' },
    { id: 'P06', platform: 'Instagram', lang: 'ES', country: '秘鲁', author: '@frenospacifico', vid: 'V-J6P', code: 'CA9T R', title: 'Antes de comprar: foto + regla = código correcto', likes: 12600, comments: 430, shares: 210, date: '2026-11-07' },
    { id: 'P07', platform: 'TikTok', lang: 'ES', country: '智利', author: '@andina_frenos', vid: 'V-JH6', code: 'CA9T R', title: 'JH6 和 J6P 能通用吗？实测给你答案', likes: 7410, comments: 296, shares: 132, date: '2026-11-15' },
    { id: 'P08', platform: 'TikTok', lang: 'ES', country: '哥伦比亚', author: '@frenoscol', vid: 'V-J7', code: 'CA9T R', title: 'J7 con 40 toneladas: cómo se comporta el freno', likes: 5230, comments: 187, shares: 96, date: '2026-11-05' },
    { id: 'P09', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@repuestosdelnorte', vid: 'V-TIANLONG', code: 'EQ153 R', title: '天龙 153 桥，后片磨到铆钉还能救吗？', likes: 22400, comments: 1020, shares: 610, date: '2026-11-12' },
    { id: 'P10', platform: 'Facebook', lang: 'ES', country: '秘鲁', author: '@frenospacifico', vid: 'V-TIANLONG', code: 'EQ153 R', title: '¿Cuánto dura realmente una pastilla EQ153?', likes: 8120, comments: 305, shares: 144, date: '2026-11-06' },
    { id: 'P11', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@tallerdonjorge', vid: 'V-TIANJIN', code: 'EQ153 R', title: '天锦拉轻抛货，用 EQ153 后片会不会太硬', likes: 4310, comments: 165, shares: 78, date: '2026-11-10' },
    { id: 'P12', platform: 'Facebook', lang: 'ES', country: '哥伦比亚', author: '@aumanparts', vid: 'V-AUMAN', code: 'NEW EQ153 R', title: '欧曼 EST 后片替换，跑了 8 万公里拆下来看', likes: 6180, comments: 214, shares: 101, date: '2026-11-08' },
    { id: 'P13', platform: 'TikTok', lang: 'ES', country: '秘鲁', author: '@jacperu', vid: 'V-JAC', code: 'EQ153 R', title: '尺码买错的代价：穿一次就小了', likes: 3120, comments: 121, shares: 54, date: '2026-11-04' },
    { id: 'P14', platform: 'TikTok', lang: 'AR', country: '沙特阿拉伯', author: '@shanab_trucks', vid: 'V-DELONG', code: 'STEYR R', title: 'ديلونغ ٣٠٠٠: الفحمات الخلفية بعد ٩٠ ألف كم', likes: 26100, comments: 1180, shares: 690, date: '2026-11-15' },
    { id: 'P15', platform: 'TikTok', lang: 'AR', country: '阿联酋', author: '@alrashid_parts', vid: 'V-DELONG', code: 'STEYR R', title: 'ليش الفحمات التجارية تصرخ؟', likes: 9430, comments: 402, shares: 233, date: '2026-11-09' },
    { id: 'P16', platform: 'TikTok', lang: 'ES', country: '智利', author: '@dayun_cl', vid: 'V-DAYUN', code: 'STEYR R', title: '大运 N8H 后片，山路工况实测', likes: 4820, comments: 176, shares: 88, date: '2026-11-11' },
    { id: 'P17', platform: 'Instagram', lang: 'ES', country: '秘鲁', author: '@hongyan_pe', vid: 'V-HONGYAN', code: 'STEYR R', title: '孩子长得快，按身高选码还是按年龄？', likes: 3610, comments: 143, shares: 66, date: '2026-11-03' },
    { id: 'P18', platform: 'Instagram', lang: 'AR', country: '沙特阿拉伯', author: '@shanab_trucks', vid: 'V-ACTROS', code: '29162', title: 'أكتروس MP3: الفرق بين الفحمات الأصلية والتجارية', likes: 58400, comments: 2640, shares: 1520, date: '2026-11-16' },
    { id: 'P19', platform: 'TikTok', lang: 'PT', country: '巴西', author: '@caminhoneiro_br', vid: 'V-ACTROS', code: '29162', title: 'Actros: pastilha de 200 mil km existe?', likes: 21300, comments: 890, shares: 470, date: '2026-11-12' },
    { id: 'P20', platform: 'Instagram', lang: 'ES', country: '墨西哥', author: '@tallerdonjorge', vid: 'V-ACTROS', code: '29137', title: 'Actros 前片 29137，装之前一定要量这个尺寸', likes: 9140, comments: 356, shares: 188, date: '2026-11-08' },
    { id: 'P21', platform: 'YouTube', lang: 'ES', country: '秘鲁', author: '@frenospacifico', vid: 'V-DAF-XF', code: '29087', title: 'Cómo leer el número WVA de una pastilla (29087)', likes: 19600, comments: 810, shares: 420, date: '2026-11-13' },
    { id: 'P22', platform: 'TikTok', lang: 'PT', country: '巴西', author: '@frotabrasil', vid: 'V-DAF-XF', code: '29087', title: 'DAF XF: 100 mil km com pastilha barata custa caro', likes: 6840, comments: 274, shares: 139, date: '2026-11-07' },
    { id: 'P23', platform: 'Instagram', lang: 'AR', country: '阿联酋', author: '@alrashid_parts', vid: 'V-TRAILER-BPW', code: 'BPW05090146170', title: 'تركيب فحمات BPW على مقطورة ١٣ طن', likes: 33200, comments: 1520, shares: 860, date: '2026-11-14' },
    { id: 'P24', platform: 'TikTok', lang: 'EN', country: '肯尼亚', author: '@lagos_autohub', vid: 'V-TRAILER-BPW', code: '29087', title: 'Why your trailer pads crack in 2 months', likes: 11200, comments: 470, shares: 246, date: '2026-11-10' },
    { id: 'P25', platform: 'TikTok', lang: 'EN', country: '尼日利亚', author: '@lagos_autohub', vid: 'V-TRAILER-BPW', code: 'BPW05090146170', title: 'BPW 13T brake shoe: what nobody checks', likes: 14300, comments: 590, shares: 310, date: '2026-11-16' },
    { id: 'P26', platform: 'Instagram', lang: 'ES', country: '智利', author: '@andina_frenos', vid: 'V-TRAILER-FUWA', code: 'WB 3025', title: 'Freno de remolque FUWA: la medida que nadie revisa', likes: 8910, comments: 362, shares: 174, date: '2026-11-12' },
    { id: 'P27', platform: 'TikTok', lang: 'ID', country: '印度尼西亚', author: '@bengkel_mandiri', vid: 'V-HINO500', code: '47441-4220', title: 'Kampas rem Hino 500, jangan sampai salah beli', likes: 12200, comments: 520, shares: 271, date: '2026-11-13' },
    { id: 'P28', platform: 'TikTok', lang: 'ES', country: '哥伦比亚', author: '@carlosm', vid: 'V-ISUZU-FVR', code: '47115-406', title: 'NPR 71: pastilla trasera, cómo reconocerla', likes: 5630, comments: 214, shares: 108, date: '2026-11-09' },
    { id: 'P29', platform: 'TikTok', lang: 'ID', country: '印度尼西亚', author: '@sinarjaya_motor', vid: 'V-FUSO', code: 'MC809750', title: 'FUSO Fighter: rem blong bukan selalu kampas', likes: 7210, comments: 298, shares: 152, date: '2026-11-11' },
    { id: 'P30', platform: 'TikTok', lang: 'TR', country: '土耳其', author: '@truckparts_tr', vid: 'V-VOLVO-FH', code: 'VOLVO86', title: 'FH12 balata: aynı kasa, iki farklı kod', likes: 16100, comments: 640, shares: 338, date: '2026-11-14' },
    { id: 'P31', platform: 'TikTok', lang: 'ES', country: '墨西哥', author: '@tallerdonjorge', vid: 'V-NISSAN', code: '41039-90113', title: 'Condor 后片，原厂号对不上怎么办', likes: 4120, comments: 158, shares: 74, date: '2026-11-06' },
    { id: 'P32', platform: 'TikTok', lang: 'AR', country: '沙特阿拉伯', author: '@shanab_trucks', vid: 'V-HYUNDAI-BUS', code: 'HYUNDAI BUS R1', title: 'فحمات باص هيونداي: خلفي أم أمامي؟', likes: 6890, comments: 284, shares: 141, date: '2026-11-10' },
    { id: 'P33', platform: 'Facebook', lang: 'VI', country: '越南', author: '@mekongparts', vid: 'V-DAEWOO-BUS', code: 'DAWOO R', title: 'Má phanh Daewoo BH — hàng nhái nhận biết thế nào', likes: 3340, comments: 132, shares: 61, date: '2026-11-05' }
  ];

  const chatQueue = [
    { ch: 'WhatsApp', from: 'Ahmed（Sahara Truck Center）', country: '沙特阿拉伯', tz: 'Asia/Riyadh', text: 'عندي أكتروس ٢٠١٢، أبغى الفحمات الخلفية. كم السعر؟', zh: '有台 2012 年 Actros，要后片，多少钱？' },
    { ch: 'WhatsApp', from: 'Jorge Ramírez（Transportes del Norte）', country: '墨西哥', tz: 'America/Mexico_City', text: 'Necesito pastillas traseras para HOWO A7, 200 sets. ¿Precio FOB?', zh: '豪沃 A7 后片 200 套，FOB 价？' },
    { ch: 'TikTok 私信', from: 'Carlos M.', country: '哥伦比亚', tz: 'America/Bogota', text: 'buenas, busco pastillas para NPR 71, tienen?', zh: '找 NPR 71 的片，有吗？' },
    { ch: 'Facebook', from: 'Ravi（Sunrise Auto）', country: '印度', tz: 'Asia/Kolkata', text: 'Need brake lining for BPW axle, 500 pcs, best price CIF Chennai.', zh: 'BPW 桥款式 500 片，CIF 金奈最低价' },
    { ch: 'WhatsApp', from: 'Nguyen Van A', country: '越南', tz: 'Asia/Ho_Chi_Minh', text: 'cần báo giá má phanh cho xe Howo, 100 bộ', zh: '豪沃童装 100 套报价' },
    { ch: 'Instagram', from: 'Marco（Andina Frenos）', country: '智利', tz: 'America/Santiago', text: 'precio para J6P 457, 300 sets?', zh: 'J6P 457 桥 300 套价格？' },
    { ch: 'WhatsApp', from: 'Budi', country: '印度尼西亚', tz: 'Asia/Jakarta', text: 'berapa harga kampas rem untuk Hino 500?', zh: '日野 500 童装多少钱？' },
    { ch: 'Facebook', from: 'María（Frenos del Pacífico）', country: '秘鲁', tz: 'America/Lima', text: 'tienen para EQ153? necesito 20 sets por modelo', zh: '有 EQ153 吗？每款 20 套' },
    { ch: 'WhatsApp', from: 'Dmitry', country: '俄罗斯', tz: 'Europe/Moscow', text: 'нужны колодки на BPW TS2, 300 шт', zh: '要 BPW TS2 童装 300 片' },
    { ch: 'TikTok 私信', from: 'Shanab', country: '沙特阿拉伯', tz: 'Asia/Riyadh', text: 'السلام عليكم، عندي شاحنة كيف أعرف الفحمات المناسبة؟', zh: '你好，我有台童装，怎么知道用哪种片？' }
  ];

  /* ---------- 脚本生成 ---------- */
  const LANG = {
    ES: { name: '西班牙语', hook: '¿Tu camión se come las pastillas cada 3 meses? El problema casi nunca es la pastilla.', cta: 'Mándame una foto de la pastilla con la regla y te digo el código exacto en 2 horas.' },
    PT: { name: '葡萄牙语', hook: 'Seu caminhão acaba com a pastilha em 3 meses? O problema quase nunca é a pastilha.', cta: 'Me manda foto da pastilha com a régua e eu te digo o código certo em 2 horas.' },
    AR: { name: '阿拉伯语', hook: 'هل تأكل شاحنتك الفحمات كل ثلاثة أشهر؟ المشكلة ليست في الفحمات غالباً.', cta: 'أرسل لي صورة الفحمات مع المسطرة وسأخبرك بالكود الصحيح خلال ساعتين.' },
    EN: { name: '英语', hook: 'Your truck eats a set of pads every 3 months? It is almost never the pad.', cta: 'Send me a photo of the old pad next to a ruler — I will send the exact code within 2 hours.' },
    ID: { name: '印尼语', hook: 'Kampas rem habis tiap 3 bulan? Masalahnya hampir tidak pernah di kampasnya.', cta: 'Kirim foto kampas dengan penggaris, saya balas kode yang tepat dalam 2 jam.' },
    VI: { name: '越南语', hook: 'Xe của bạn ăn má phanh 3 tháng một lần? Vấn đề hầu như không phải ở má phanh.', cta: 'Gửi ảnh má phanh cạnh thước, tôi trả mã chính xác trong 2 giờ.' },
    TR: { name: '土耳其语', hook: 'Kamyonunuz 3 ayda bir balata yiyor mu? Sorun neredeyse hiç balatada değil.', cta: 'Balatanın yanına cetvel koyup fotoğrafını gönderin, 2 saat içinde doğru kodu yazayım.' }
  };

  function makeScript({ product, lang = 'ES', platform = 'TikTok', market = '墨西哥', pain = '同适用场景装不同桥，买错就抖', seconds = 30 }) {
    const L = LANG[lang] || LANG.EN;
    const p = product;
    const dur = Number(seconds) || 30;
    const beat = (a, b, t) => `${t}s｜${a}`;
    return {
      title: `${p.code} · ${L.name} · ${platform} · ${market}｜${dur}s`,
      hook: L.hook,
      cta: L.cta,
      board: [
        beat('钩子', '', `0–3`) + ` — 镜头：手拿旧片敲两下，字幕「${pain}」`,
        beat('', '', `3–8`) + ` — 镜头：同适用场景 3 个桥（457/485/498）摆一排，手上换片对不上`,
        beat('', '', `8–16`) + ` — 镜头：${p.code} 特写 + 卷尺量 ${p.dim || '尺寸'} + 面料断面`,
        beat('', '', `16–24`) + ` — 镜头：试验报告 / 台架数据特写（${p.material} 配方）`,
        beat('', '', `24–${dur}`) + ` — 镜头：试穿实拍 + 口播 CTA`
      ],
      voice: [
        `【${L.name} 口播 · 可交给配音】`,
        L.hook,
        'Mismo modelo, tres puentes distintos: 457, 485, 498. Si compras la pastilla equivocada, vibra y se cristaliza.',
        `${p.code} — ${p.nameZh}，${p.dim || '按旧款核对'}，${p.material} 配方。`,
        'GB 5763 / ECE R90，8 万公里路试。',
        L.cta
      ].join('\n'),
      tags: ['#brakepad', '#truckparts', '#frenos', '#فحمات', `#${p.code.replace(/\s/g, '')}`, `#${market}`],
      shots: ['旧款对比', '三个尺码并排', '软尺量衣长特写', '面料成分标签', '质检报告翻页', '试穿活动实拍'],
      prompt: `你是棉豆（MIANDOU）的海外短视频编导。请为 ${market} 市场、${L.name}、${platform} 平台，写一条 ${dur} 秒的童装短视频脚本。\n产品：${p.code}（${p.nameZh}），规格 ${p.dim || '见资料'}，面料 ${p.material}，适用 ${(p.appsAll || []).slice(0, 3).join('、') || '按资料'}。\n核心痛点：${pain}。\n要求：前 3 秒必须有反常识钩子；中段用「同适用场景不同桥」制造具体冲突；结尾 CTA 是「拍照+尺子，2 小时给款号」；口播用${L.name}，字幕给中文；给出 6 个分镜与拍摄清单；不要夸大认证。`
    };
  }

  return { communities, personas, edges, videos, posts, chatQueue, LANG, makeScript };
})();