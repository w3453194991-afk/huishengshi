/* 客户搜索（检索式生成器）+ 编号对照 */
(function () {
  const DB = () => window.DB;
  const EN = () => window.Engine;

  /* ---------------- 市场 / 本地语言 ---------------- */
  const MARKETS = [
    { id: 'mx', name: '墨西哥', dom: '.mx', lang: 'es', city: 'Ciudad de México', terms: { pad: 'pastillas de freno', lining: 'forros de freno', shop: 'taller de frenos' } },
    { id: 'br', name: '巴西', dom: '.br', lang: 'pt', city: 'São Paulo', terms: { pad: 'pastilha de freio', lining: 'lona de freio', shop: 'oficina de freios' } },
    { id: 'cl', name: '智利', dom: '.cl', lang: 'es', city: 'Santiago', terms: { pad: 'pastillas de freno', lining: 'forros de freno', shop: 'taller de frenos' } },
    { id: 'ae', name: '阿联酋', dom: '.ae', lang: 'en', city: 'Dubai', terms: { pad: 'brake pads', lining: 'brake lining', shop: 'truck brake service' } },
    { id: 'sa', name: '沙特', dom: '.sa', lang: 'ar', city: 'Riyadh', terms: { pad: 'فحمات فرامل', lining: 'بطانة فرامل', shop: 'ورشة فرامل' } },
    { id: 'eg', name: '埃及', dom: '.eg', lang: 'ar', city: 'Cairo', terms: { pad: 'فحمات فرامل', lining: 'بطانة فرامل', shop: 'ورشة فرامل' } },
    { id: 'za', name: '南非', dom: '.za', lang: 'en', city: 'Johannesburg', terms: { pad: 'brake pads', lining: 'brake lining', shop: 'truck brake service' } },
    { id: 'ru', name: '俄罗斯', dom: '.ru', lang: 'ru', city: 'Москва', terms: { pad: 'тормозные колодки', lining: 'тормозные накладки', shop: 'ремонт тормозов грузовик' } },
    { id: 'tr', name: '土耳其', dom: '.tr', lang: 'tr', city: 'İstanbul', terms: { pad: 'fren balatası', lining: 'fren balata', shop: 'kamyon fren servisi' } },
    { id: 'id', name: '印尼', dom: '.co.id', lang: 'id', city: 'Jakarta', terms: { pad: 'kampas rem', lining: 'kampas rem tromol', shop: 'servis rem truk' } },
    { id: 'vn', name: '越南', dom: '.vn', lang: 'vi', city: 'Hồ Chí Minh', terms: { pad: 'má phanh', lining: 'má phanh tang trống', shop: 'sửa phanh xe tải' } },
    { id: 'global', name: '全球（英文）', dom: '', lang: 'en', city: '', terms: { pad: 'brake pads', lining: 'brake lining', shop: 'truck brake service' } }
  ];

  const TYPES = {
    distributor: { en: 'distributor', zh: '经销商', local: { es: 'distribuidor', pt: 'distribuidor', ar: 'موزع', ru: 'дистрибьютор', tr: 'distribütör', id: 'distributor', vi: 'nhà phân phối', en: 'distributor' } },
    importer: { en: 'importer', zh: '进口商', local: { es: 'importador', pt: 'importador', ar: 'مستورد', ru: 'импортёр', tr: 'ithalatçı', id: 'importir', vi: 'nhà nhập khẩu', en: 'importer' } },
    wholesaler: { en: 'wholesaler', zh: '批发商', local: { es: 'mayorista', pt: 'atacadista', ar: 'تاجر جملة', ru: 'оптовик', tr: 'toptancı', id: 'grosir', vi: 'bán buôn', en: 'wholesaler' } },
    fleet: { en: 'fleet', zh: '车队', local: { es: 'flotilla', pt: 'frota', ar: 'أسطول', ru: 'автопарк', tr: 'filo', id: 'armada truk', vi: 'đội xe', en: 'fleet' } },
    workshop: { en: 'workshop', zh: '修理厂', local: { es: 'taller', pt: 'oficina', ar: 'ورشة', ru: 'СТО', tr: 'servis', id: 'bengkel', vi: 'xưởng', en: 'workshop' } }
  };

  const PRODUCTS = {
    pad: { zh: '盘式刹车片', en: 'brake pads', cat: '盘式刹车片' },
    lining: { zh: '鼓式衬片', en: 'brake lining', cat: '鼓式衬片' },
    shoe: { zh: '制动蹄总成', en: 'brake shoe assembly', cat: '制动蹄总成' },
    wind: { zh: '风电刹车片', en: 'wind turbine brake pad', cat: '风电刹车片' }
  };

  const NARROW = {
    none: { zh: '不加收窄', suffix: '' },
    site: { zh: '只搜本国域名 site:', suffix: 'SITE' },
    intitle: { zh: '标题含 fleet/brake', suffix: 'INTITLE' },
    inurl: { zh: 'URL 含 dealer/contact', suffix: 'INURL' },
    pdf: { zh: '只要 PDF 目录', suffix: 'PDF' }
  };

  let current = [];
  let opts = { market: 'mx', type: 'distributor', prod: 'pad', narrow: 'none', excl: '-trading -alibaba -marketplace' };

  /* ---------------- 预设库（按区域、含 Google 长版 / DDG 短版） ---------------- */
  const PRESET_REGIONS = [
    {
      k: 'sea', label: '东南亚 SEA',
      langs: 'en / kampas rem（印尼）/ má phanh（越南）/ pha brek（泰语转写）',
      chan: 'Facebook / WhatsApp / Zalo / LINE',
      note: '时差小，漏单主因是刷屏淹没',
      rows: [
        {
          tag: '刹车片 · 车队修理厂 · 泰国',
          google: 'SEA "brake pads" fleet workshop TH -"alibaba" -"made-in-china" -marketplace' , g2: '"brake pads" (fleet OR workshop OR garage) Bangkok filetype:pdf OR contact',
          ddg: '"brake pads" fleet workshop TH -alibaba'
        },
        {
          tag: '鼓式衬片 · 卡车制动服务 · 泰国',
          google: 'SEA "brake lining" truck brake service TH -"alibaba" -"made-in-china" -marketplace', g2: '"brake lining" (fleet OR workshop OR garage) Bangkok filetype:pdf OR contact',
          ddg: '"brake lining" truck brake service TH -alibaba'
        }
      ]
    },
    {
      k: 'me', label: '中东 ME',
      langs: 'en / ar（阿语）/ fren balata（土耳其）',
      chan: 'WhatsApp / LinkedIn',
      note: '迪拜是转口集散地，满屏贸易公司最典型',
      rows: [
        {
          tag: '重卡刹车片 · 车队维保 · 阿联酋',
          google: 'ME "heavy duty brake pads" fleet maintenance AE -"alibaba" -"made-in-china" -marketplace', g2: '"heavy duty brake pads" (fleet OR workshop OR garage) Dubai filetype:pdf OR contact',
          ddg: '"heavy duty brake pads" fleet maintenance AE -alibaba'
        },
        {
          tag: '鼓式衬片 · 卡车修理厂 · 阿联酋',
          google: 'ME "brake lining" truck workshop AE -"alibaba" -"made-in-china" -marketplace', g2: '"brake lining" (fleet OR workshop OR garage) Dubai filetype:pdf OR contact',
          ddg: '"brake lining" truck workshop AE -alibaba'
        }
      ]
    },
    {
      k: 'sa', label: '南美 SA',
      langs: 'pastilha de freio（葡）/ pastillas / balatas de freno（西）/ lonas de freno',
      chan: 'WhatsApp（绝对主渠道）',
      note: '时差最大，夜间询盘必漏',
      rows: [
        {
          tag: '刹车片 · 车队 · 巴西',
          google: 'SA "pastilha de freio" frota BR -"alibaba" -"made-in-china" -marketplace', g2: '"pastilha de freio" (fleet OR workshop OR garage) Sao Paulo filetype:pdf OR contact',
          ddg: '"pastilha de freio" frota BR -alibaba'
        },
        {
          tag: '刹车片 · 修理厂 · 巴西',
          google: 'SA "pastillas de freno" oficina BR -"alibaba" -"made-in-china" -marketplace', g2: '"pastillas de freno" (fleet OR workshop OR garage) Sao Paulo filetype:pdf OR contact',
          ddg: '"pastillas de freno" oficina BR -alibaba'
        }
      ]
    },
    {
      k: 'na', label: '北美 NA',
      langs: 'en / FMSI D 编号是通用语言',
      chan: 'LinkedIn / 电话 / 邮件',
      note: '提单相对可用，但准入认证更严',
      rows: [
        {
          tag: '重卡刹车片 · 车队维保 · 美国',
          google: 'NA "heavy duty brake pads" fleet maintenance US -"alibaba" -"made-in-china" -marketplace', g2: '"heavy duty brake pads" (fleet OR workshop OR garage) Dallas filetype:pdf OR contact',
          ddg: '"heavy duty brake pads" fleet maintenance US -alibaba'
        },
        {
          tag: 'FMSI D1369 · 卡车修理厂 · 美国',
          google: 'NA "FMSI D1369" truck repair shop US -"alibaba" -"made-in-china" -marketplace', g2: '"FMSI D1369" (fleet OR workshop OR garage) Dallas filetype:pdf OR contact',
          ddg: '"FMSI D1369" truck repair shop US -alibaba'
        }
      ]
    },
    {
      k: 'eu', label: '欧洲 EU',
      langs: 'en / WVA 29087 / 29108 / Bremsbeläge（德）',
      chan: '邮件 / LinkedIn / 展会',
      note: 'WVA 编号是通用语言',
      rows: [
        {
          tag: 'WVA 29087 · 车队修理厂 · 波兰',
          google: 'EU "WVA 29087" fleet workshop PL -"alibaba" -"made-in-china" -marketplace', g2: '"WVA 29087" (fleet OR workshop OR garage) Warsaw filetype:pdf OR contact',
          ddg: '"WVA 29087" fleet workshop PL -alibaba'
        },
        {
          tag: 'WVA 29108 · 经销商 · 波兰',
          google: 'EU "WVA 29108" distributor PL -"alibaba" -"made-in-china" -marketplace', g2: '"WVA 29108" (fleet OR workshop OR garage) Warsaw filetype:pdf OR contact',
          ddg: '"WVA 29108" distributor PL -alibaba'
        }
      ]
    },
    {
      k: 'sas', label: '南亚 SAS',
      langs: 'en / hi（印地）/ ur（乌尔都）· ब्रेक पैड / بریک لائننگ',
      chan: 'WhatsApp / IndiaMART / 电话',
      note: '价格极敏感，先问 AIS 认证；巴基斯坦多做转口',
      rows: [
        {
          tag: '重卡刹车片 · 车队修理厂 · 印度',
          google: 'SAS "heavy duty brake pads" fleet workshop IN -"alibaba" -"made-in-china" -marketplace', g2: '"heavy duty brake pads" (fleet OR workshop OR garage) Mumbai filetype:pdf OR contact',
          ddg: '"heavy duty brake pads" fleet workshop IN -alibaba'
        },
        {
          tag: '鼓式衬片 · 经销商 · 印度',
          google: 'SAS "brake lining" distributor IN -"alibaba" -"made-in-china" -marketplace', g2: '"brake lining" (distributor OR dealer OR wholesaler) Delhi filetype:pdf OR contact',
          ddg: '"brake lining" distributor IN -alibaba'
        }
      ]
    },
    {
      k: 'ru', label: '俄语区 RU',
      langs: 'ru（тормозные колодки / накладки）/ en · 哈语多走俄语',
      chan: 'WhatsApp / Telegram / 邮件',
      note: '本地化要求高（EAC 认证），哈萨克多做转口与矿山车队',
      rows: [
        {
          tag: '刹车片 · 车队修理厂 · 俄罗斯',
          google: 'RU "тормозные колодки" автопарк СТО RU -"alibaba" -"made-in-china" -marketplace', g2: '"тормозные колодки" (автопарк OR СТО OR сервис) Москва filetype:pdf OR contact',
          ddg: '"тормозные колодки" автопарк СТО RU -alibaba'
        },
        {
          tag: '鼓式衬片 · 矿山车队 · 哈萨克斯坦',
          google: 'RU "тормозные накладки" автопарк KZ -"alibaba" -"made-in-china" -marketplace', g2: '"тормозные накладки" (автопарк OR карьер OR сервис) Алматы filetype:pdf OR contact',
          ddg: '"тормозные накладки" автопарк KZ -alibaba'
        }
      ]
    },
    {
      k: 'af', label: '非洲 AF',
      langs: 'en / fr（部分）',
      chan: 'WhatsApp / Facebook',
      note: '矿山与港口车队集中',
      rows: [
        {
          tag: '卡车刹车片 · 车队修理厂 · 南非',
          google: 'AF "truck brake pads" fleet workshop ZA -"alibaba" -"made-in-china" -marketplace', g2: '"truck brake pads" (fleet OR workshop OR garage) Johannesburg filetype:pdf OR contact',
          ddg: '"truck brake pads" fleet workshop ZA -alibaba'
        },
        {
          tag: '鼓式衬片 · 矿山车队 · 南非',
          google: 'AF "brake lining" mining fleet ZA -"alibaba" -"made-in-china" -marketplace', g2: '"brake lining" (fleet OR workshop OR garage) Johannesburg filetype:pdf OR contact',
          ddg: '"brake lining" mining fleet ZA -alibaba'
        }
      ]
    }
  ];
  let presetMode = 'ddg';
  let presetFlat = [];
  function flatPresets() {
    const out = [];
    PRESET_REGIONS.forEach(r => r.rows.forEach((row, i) => out.push({
      i: out.length, region: r.label, tag: row.tag, ddg: row.ddg, google: row.google, g2: row.g2
    })));
    return out;
  }
  function presetText(p) { return presetMode === 'google' ? p.google + '\n' + p.g2 : p.ddg; }

  function presetHtml(esc) {
    presetFlat = flatPresets();
    return `
    <div class="card">
      <div class="card-h"><h3>④ 预设库（按区域，${presetFlat.length} 组）</h3><span class="sub">脚本跑过的一批，可直接抄</span></div>
      <div class="pre-verify">每条都带 <b>Google / Bing / Yandex / DDG</b> 四个按钮，点一下就是真搜，当场能看出这条管不管用。
        注意：<b>site: / filetype: / 括号 OR</b> 这套长语法只有 Google、Bing 认，DDG 会忽略——短版就是为此准备的。</div>
      <div class="card-b" style="padding:4px 0 10px">
        <div class="row wrap-gap" style="padding:0 15px 8px">
          <button class="chip ${presetMode === 'ddg' ? 'on' : ''}" data-act="sqPreMode" data-id="ddg">短版（DDG / Serper）</button>
          <button class="chip ${presetMode === 'google' ? 'on' : ''}" data-act="sqPreMode" data-id="google">长版（Google 全语法）</button>
          <button class="btn sm" data-act="sqPreAll">复制全部 ${presetFlat.length} 组</button>
        </div>
        ${PRESET_REGIONS.map(r => `
          <div class="pre-region">
            <div class="pre-h"><b>${esc(r.label)}</b><span class="tiny muted">${esc(r.langs)}</span></div>
            ${r.rows.map(row => {
              const idx = presetFlat.findIndex(p => p.ddg === row.ddg);
              const text = presetMode === 'google' ? row.google + ' ' + row.g2 : row.ddg;
              return `<div class="pre-row">
                <span class="pre-tag">${esc(row.tag)}</span>
                <code class="sq-code" data-act="sqPreCopy" data-id="${idx}">${esc(text)}</code>
                <div class="sq-acts">
                  <button class="btn xs" data-act="sqPreCopy" data-id="${idx}">复制</button>
                  <button class="btn xs" data-act="sqPreOpen" data-id="${idx}:google">Google</button>
                  <button class="btn xs" data-act="sqPreOpen" data-id="${idx}:bing">Bing</button>
                  <button class="btn xs" data-act="sqPreOpen" data-id="${idx}:yandex">Yandex</button>
                  <button class="btn xs" data-act="sqPreOpen" data-id="${idx}:ddg">DDG</button>
                </div>
              </div>`;
            }).join('')}
            <div class="pre-note">主渠道：${esc(r.chan)} · ${esc(r.note)}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }


  function marketById(id) { return MARKETS.find(m => m.id === id) || MARKETS[0]; }

  /* WVA / FMSI 号：从目录里挑真号 */
  function pickCodes() {
    const ps = DB().products;
    const wva = ps.filter(p => /^29\d{3}$/.test(p.code)).slice(0, 2).map(p => p.code);
    const fmsi = ps.filter(p => /^(D\d{3,4}|\d{4}[A-Z]{0,2})$/.test(p.code) && p.cat === '鼓式衬片').slice(0, 2).map(p => p.code);
    return { wva: wva.length ? wva : ['29087', '29108'], fmsi: fmsi.length ? fmsi : ['4709', '4515'] };
  }

  function build(o) {
    const m = marketById(o.market);
    const t = TYPES[o.type] || TYPES.distributor;
    const p = PRODUCTS[o.prod] || PRODUCTS.pad;
    const local = t.local[m.lang] || t.en;
    const padLocal = m.terms.pad, liningLocal = m.terms.lining, shopLocal = m.terms.shop;
    const site = m.dom ? 'site:' + m.dom + ' ' : '';
    const excl = (o.excl || '').trim();
    const q = [];

    /* 1 组合公式 */
    let s1 = `"${m.lang === 'en' ? p.en : (o.prod === 'lining' ? liningLocal : padLocal)}" (${local} OR ${TYPES.importer.local[m.lang] || 'importer'} OR ${TYPES.wholesaler.local[m.lang] || 'wholesaler'})`;
    if (site) s1 = site + s1;
    if (o.narrow === 'pdf') s1 += ' filetype:pdf';
    if (o.narrow === 'intitle') s1 = `intitle:${t.en} ` + s1;
    if (o.narrow === 'inurl') s1 += ' inurl:dealer';
    q.push({ k: '组合公式', tip: '产品词 + 客户类型 + 国家域名，最通用的一条', text: (s1 + ' ' + excl).trim() });

    /* 2 行业编号式 */
    const codes = pickCodes();
    q.push({
      k: '行业编号（WVA）', tip: '客户手里只有通用号时，用这个号去搜',
      text: `("WVA ${codes.wva[0]}" OR "WVA ${codes.wva[1]}") (catalogue OR supplier OR "cross reference") ${excl}`.trim()
    });
    q.push({
      k: '行业编号（FMSI）', tip: '北美/鼓式用形状码，常出现在 PDF 目录里',
      text: `("FMSI ${codes.fmsi[0]}" OR "FMSI ${codes.fmsi[1]}") (catalogue OR cross reference) filetype:pdf`
    });

    /* 3 本地语言 */
    q.push({
      k: '本地语言（终端）', tip: '终端客户不用英文搜，这条命中修理厂/车队',
      text: `${site}"${shopLocal}" ("${padLocal}" OR "${liningLocal}") ${excl}`.trim()
    });

    /* 4 车桥 / 卡钳 */
    q.push({
      k: '车桥 / 卡钳', tip: '挂车与商用车是「车桥问题」，不是车标问题',
      text: `("BPW" OR "SAF-Holland" OR "Meritor" OR "Fuwa") "${p.en}" ("cross reference" OR catalogue) filetype:pdf`
    });

    /* 5 车队 */
    q.push({
      k: '车队 / 维修', tip: '按维保页面找车队，而不是按产品词',
      text: `intitle:"fleet" ("${p.en}" OR "brake maintenance") ${m.dom ? 'site:' + m.dom : ''} -trading -marketplace`.replace(/\s+/g, ' ').trim()
    });

    /* 6 地图 */
    q.push({
      k: '地图（找人）', tip: 'Google Maps 定位城市，拿电话与 WhatsApp',
      text: `${shopLocal} ${m.city}`.trim(),
      map: true
    });

    return q;
  }

  const engines = {
    google: q => 'https://www.google.com/search?q=' + encodeURIComponent(q),
    bing: q => 'https://www.bing.com/search?q=' + encodeURIComponent(q),
    yandex: q => 'https://yandex.com/search/?text=' + encodeURIComponent(q),
    ddg: q => 'https://duckduckgo.com/?q=' + encodeURIComponent(q),
    maps: q => 'https://www.google.com/maps/search/' + encodeURIComponent(q)
  };

  function html(ctx) {
    const { esc, LZ } = ctx;
    current = build(opts);
    const m = marketById(opts.market);
    const sel = (id, list, cur) => `<select id="${id}">${list.map(x => `<option value="${x.v}"${x.v === cur ? ' selected' : ''}>${esc(x.t)}</option>`).join('')}</select>`;

    return `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div>
        <h1 style="margin:0">客户搜索</h1>
        <div class="muted small">按「产品词 + 客户类型 + 国家」生成检索式，直接投喂 Google / Bing / Yandex / Maps；搜到人一键回填线索。</div>
      </div>
      <button class="btn" data-act="tab" data-id="leads">询盘线索 →</button>
    </div>

    <div class="card">
      <div class="card-h"><h3>① 选参数</h3><span class="sub">改完点「重新生成」，或直接改完就生效</span></div>
      <div class="card-b">
        <div class="sq-form">
          <label>市场 ${sel('sqMarket', MARKETS.map(x => ({ v: x.id, t: x.name + ' · ' + x.lang + (x.dom ? ' · ' + x.dom : '') })), opts.market)}</label>
          <label>产品 ${sel('sqProd', Object.keys(PRODUCTS).map(k => ({ v: k, t: PRODUCTS[k].zh + ' / ' + PRODUCTS[k].en })), opts.prod)}</label>
          <label>客户类型 ${sel('sqType', Object.keys(TYPES).map(k => ({ v: k, t: TYPES[k].zh + ' / ' + TYPES[k].en })), opts.type)}</label>
          <label>收窄 ${sel('sqNarrow', Object.keys(NARROW).map(k => ({ v: k, t: NARROW[k].zh })), opts.narrow)}</label>
          <label class="wide">排除词 <input id="sqExcl" value="${esc(opts.excl)}" placeholder="-trading -alibaba -marketplace"></label>
        </div>
        <div class="row wrap-gap" style="margin-top:10px">
          <button class="btn primary sm" data-act="sqBuild">重新生成</button>
          <button class="btn sm" data-act="sqCopyAll">复制全部 ${current.length} 条</button>
          <span class="tiny muted">当前：${esc(m.name)} · ${esc(m.lang)} · ${m.dom || '全球'}</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-h"><h3>② 检索式</h3><span class="sub">点一下复制；后面四个按钮直接开对应引擎</span></div>
      <div class="card-b" style="padding:4px 0 8px">
        ${current.map((x, i) => `<div class="sq-item">
          <div class="sq-h"><b>${esc(x.k)}</b><span class="tiny muted">${esc(x.tip)}</span></div>
          <code class="sq-code" data-act="sqCopy" data-id="${i}">${esc(x.text)}</code>
          <div class="sq-acts">
            <button class="btn xs" data-act="sqCopy" data-id="${i}">复制</button>
            <button class="btn xs" data-act="sqOpen" data-id="${i}:google">Google</button>
            <button class="btn xs" data-act="sqOpen" data-id="${i}:bing">Bing</button>
            <button class="btn xs" data-act="sqOpen" data-id="${i}:yandex">Yandex</button>
            <button class="btn xs" data-act="sqOpen" data-id="${i}:maps">${x.map ? '地图' : 'Maps'}</button>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-h"><h3>③ 搜到的人，回填成线索</h3><span class="sub">带来源链接，后面好复核</span></div>
      <div class="card-b">
        <div class="sq-form">
          <label>公司名 <input id="sqCo" placeholder="如 Frenos del Norte S.A."></label>
          <label>国家 ${sel('sqCountry', MARKETS.map(x => ({ v: x.name, t: x.name })), m.name)}</label>
          <label>类型 ${sel('sqKind', Object.keys(TYPES).map(k => ({ v: TYPES[k].zh, t: TYPES[k].zh })), '经销商')}</label>
          <label class="wide">来源链接 <input id="sqUrl" placeholder="https://..."></label>
          <label class="wide">备注 <input id="sqNote" placeholder="搜到什么：主营 BPW 挂车件 / 有 3 家门店"></label>
        </div>
        <div class="row wrap-gap" style="margin-top:10px">
          <button class="btn primary sm" data-act="sqSave">加入线索</button>
          <span class="tiny muted">进「询盘线索」后可以继续打分、匹配型号</span>
        </div>
      </div>
    </div>

    ${presetHtml(esc)}

    <details class="fold">
      <summary>筛客户的 4 条硬规则<span class="sub">别按直觉筛，按这些筛</span></summary>
      <div class="fold-b small" style="line-height:1.9">
        <div>① 只看近 12 个月，三年前的记录不算数</div>
        <div>② 一年 ≥4 票且间隔稳定 → 优先名单；一年一票多是调货贸易商 → 观察区</div>
        <div>③ 抓切换信号：从印度/越南转中国采购、新增 shipper、原供应商份额下滑</div>
        <div>④ 别信 notify party（多为清关行/货代）；别只按 HS 编码拉（8708.30 太宽，摩擦材料可能落 6813.81）</div>
        <div class="muted">海关数据本身不含电话邮箱，平台上的联系方式是拼凑的，命中率有限，必须二次验证。</div>
      </div>
    </details>`;
  }

  function toast(msg) { if (window.__toast) window.__toast(msg); }

  function copy(i) {
    const x = current[i]; if (!x) return;
    const done = () => toast('已复制：' + x.k);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(x.text).then(done, () => fallback(x.text, done));
    else fallback(x.text, done);
  }
  function copyAll() {
    const text = current.map(x => '# ' + x.k + ' — ' + x.tip + '\n' + x.text).join('\n\n');
    const done = () => toast('已复制 ' + current.length + ' 条检索式');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    else fallback(text, done);
  }
  function fallback(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { }
    document.body.removeChild(ta); done();
  }
  function open(i, engine) {
    const x = current[i]; if (!x) return;
    const url = (engines[engine] || engines.google)(x.text);
    window.open(url, '_blank');
  }
  function setOpt(k, v) { opts[k] = v; }
  function getOpts() { return opts; }
  function readForm(doc) {
    const v = id => (doc.getElementById(id) || {}).value;
    if (v('sqMarket')) opts.market = v('sqMarket');
    if (v('sqProd')) opts.prod = v('sqProd');
    if (v('sqType')) opts.type = v('sqType');
    if (v('sqNarrow')) opts.narrow = v('sqNarrow');
    if (v('sqExcl') !== undefined) opts.excl = v('sqExcl');
  }

  /* ---- 预设库操作 ---- */
  function presetCopy(i) {
    const p = presetFlat[i]; if (!p) return;
    copyText(presetText(p), () => toast('已复制（' + p.region + '）'));
  }
  function presetOpen(i, eng) {
    const p = presetFlat[i]; if (!p) return;
    const q = presetText(p).split('\n').pop();
    window.open((engines[eng] || engines.google)(q), '_blank');
  }
  function presetAll() {
    const date = new Date();
    const stamp = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') +
      'T' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0') + ':' + String(date.getSeconds()).padStart(2, '0');
    const out = [];
    out.push('# 全球汽配可销售端检索式 · 生成于 ' + stamp);
    out.push('# Google 版（可直接抄进浏览器；DDG 不完全支持 site:/filetype: 等语法）');
    out.push('');
    PRESET_REGIONS.forEach(r => r.rows.forEach(row => { out.push(row.google); out.push(row.g2); }));
    out.push('');
    out.push('# 脚本实际发出的 DDG / Serper 版');
    out.push('');
    PRESET_REGIONS.forEach(r => r.rows.forEach(row => out.push(row.ddg)));
    out.push('');
    out.push('# 本地语种锚点（终端客户不用英文搜）');
    out.push('');
    PRESET_REGIONS.forEach(r => out.push('[' + r.k + ' ' + r.label.split(' ')[0] + '] ' + r.langs + ' ｜ 主渠道 ' + r.chan + ' ｜ ' + r.note));
    copyText(out.join('\n'), () => toast('已复制 ' + flatPresets().length + ' 组预设（含注释）'));
  }
  function setPresetMode(m) { presetMode = m === 'google' ? 'google' : 'ddg'; }
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    else fallback(text, done);
  }

  window.SEARCHX = { html, build, copy, copyAll, open, readForm, getOpts, setOpt, MARKETS, TYPES, PRODUCTS,
    presetCopy, presetOpen, presetAll, setPresetMode, PRESET_REGIONS };

  /* ================= 编号对照 ================= */
  const Q = { q: '' };

  function norm(s) { return String(s || '').toUpperCase().replace(/\s+/g, '').replace(/[-_/.]/g, ''); }

  function lookup(q) {
    const db = DB(); const out = [];
    const nq = norm(q), raw = String(q || '').trim();
    if (!nq) return out;

    const seen = new Set();
    const push = (p, why, score) => { if (seen.has(p.id)) return; seen.add(p.id); out.push({ p, why, score }); };

    db.products.forEach(p => {
      const codes = [p.code, p.sku].concat(p.altCodes || []);
      for (const c of codes) {
        const nc = norm(c);
        if (!nc) continue;
        if (nc === nq) { push(p, '编号精确命中 ' + c, 100); return; }
        if (nc.startsWith(nq) && nq.length >= 3) { push(p, '编号前缀命中 ' + c, 78); return; }
      }
    });

    const axles = (db.axles || []).filter(a => norm(a.model).includes(nq) || norm(a.brand).includes(nq) || (a.alias || []).some(x => norm(x).includes(nq)));
    axles.slice(0, 3).forEach(a => {
      db.fitments.filter(f => f.aid === a.id).forEach(f => {
        const p = db.products.find(x => x.id === (f.pid || f.productId));
        if (p) push(p, '车桥命中 ' + a.brand + ' ' + a.model, 72);
      });
    });

    const vehs = (db.vehicles || []).filter(v => norm(v.model).includes(nq) || norm(v.brand || '').includes(nq) || (v.alias || []).some(x => norm(x).includes(nq)));
    vehs.slice(0, 3).forEach(v => {
      db.fitments.filter(f => f.vid === v.id).forEach(f => {
        const p = db.products.find(x => x.id === (f.pid || f.productId));
        if (p) push(p, '车型命中 ' + (v.brand ? v.brand + ' ' : '') + v.model, 66);
      });
    });

    if (!out.length && nq.length >= 2) {
      db.products.forEach(p => {
        const hay = norm([p.code, p.nameZh, p.nameEn, p.cat, (p.apps || []).join('')].join(' '));
        if (hay.includes(nq)) push(p, '模糊命中', 50);
      });
    }
    return out.slice(0, 12).sort((a, b) => b.score - a.score);
  }

  function gapOf(p, db) {
    const tests = (db.tests || []).filter(t => t.pid === p.id);
    const gaps = [];
    if (!p.dim || p.dimStatus !== '完整') gaps.push('尺寸（长×高×厚）没齐');
    if (!tests.length) gaps.push('没有对应试验报告');
    if (!(p.apps || []).length) gaps.push('适配车型待核');
    return { tests: tests.length, gaps };
  }

  function xrefHtml(ctx) {
    const { esc, LZ } = ctx;
    const db = DB();
    const res = Q.q ? lookup(Q.q) : [];
    const axles = (db.axles || []).slice(0, 6);
    return `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div>
        <h1 style="margin:0">编号对照</h1>
        <div class="muted small">输入自家型号 / WVA / FMSI / OE 别名 / 车型 / 车桥，查它在这张表里能对上谁，还差什么。</div>
      </div>
      <button class="btn" data-act="tab" data-id="products">产品库 →</button>
    </div>

    <div class="card"><div class="card-b">
      <div class="row wrap-gap">
        <input id="xrefQ" value="${esc(Q.q)}" placeholder="如 29087 / 4709 / MB/60/1 / 豪沃A7 / BPW TS2" style="flex:1;min-width:220px;padding:10px 12px;border:1px solid var(--line);border-radius:9px;font-size:13.5px">
        <button class="btn primary" data-act="xrefGo">查</button>
        ${['29087', '4709', 'BPW', '豪沃A7'].map(x => `<button class="chip" data-act="xrefQuick" data-id="${x}">${x}</button>`).join('')}
      </div>
      <div class="tiny muted" style="margin-top:8px">同一 WVA 号可能覆盖多个车桥与车型；这里给候选集，不给唯一答案——这是行业事实，不是能力不足。</div>
    </div></div>

    ${Q.q ? (res.length ? `<div class="xref-list">
      ${res.map(({ p, why, score }) => {
        const g = gapOf(p, db);
        const ask = g.gaps.length ? (p.dim && p.dimStatus === '完整' ? '装哪个桥？BPW / 富华 / 约克？' : '这两片的长×高×厚各是多少？') : '已齐，可直接报价';
        return `<div class="xref-item">
          <div class="xref-h">
            <b class="mono">${esc(p.code)}</b>
            <span class="tag ${score >= 90 ? 'g' : score >= 70 ? 'b' : 'y'}">${Math.round(score)}</span>
            <span class="small muted">${esc(p.cat)} · ${esc(p.material || '')} ${p.pos ? '· ' + esc(p.pos) : ''}</span>
            <span class="flex1"></span>
            <button class="btn xs" data-act="openProduct" data-id="${p.id}">详情</button>
            <button class="btn xs primary" data-act="xrefAdd" data-id="${p.id}">加入报价</button>
          </div>
          <div class="xref-meta small">
            <span>${esc(why)}</span>
            <span class="mono">${esc(p.dim || '尺寸待补')}</span>
            <span class="mono">${esc((p.altCodes || []).join(' / ') || '无 OE 别名')}</span>
            <span>${g.tests} 份试验报告</span>
          </div>
          <div class="xref-gap ${g.gaps.length ? '' : 'ok'}">
            ${g.gaps.length ? '缺口：' + esc(g.gaps.join('、')) + ' → 只追问一句：<b>' + esc(ask) + '</b>' : '资料齐：尺寸 + 试验报告 + 适配都在，可作报价依据'}
          </div>
        </div>`;
      }).join('')}
    </div>` : `<div class="card"><div class="card-b muted small">没对上。换个号试试：目录里的 WVA 形如 <span class="mono">29087</span>，鼓式形状码形如 <span class="mono">4709</span>/<span class="mono">4515EA</span>，OE 别名形如 <span class="mono">MB/60/1</span>。</div></div>`) : ''}

    <div class="card">
      <div class="card-h"><h3>这张表要建的四列</h3><span class="sub">建起来，三件事同时解决</span></div>
      <div class="card-b small" style="line-height:1.9">
        <div><b>自家型号</b> ↔ <b>WVA / FMSI 形状码</b> ↔ <b>车桥与卡钳平台</b> ↔ <b>尺寸（长/高/厚/鼓径）</b></div>
        <div>↔ 各主机厂 OE 别名 ↔ 材质与摩擦等级（FF/GG）↔ 对应测试报告编号 ↔ 照片</div>
        <div class="muted" style="margin-top:8px">常见车桥：BPW · SAF-Holland · Meritor / ROR · Fuwa 富华 · Schmitz；常见卡钳：Knorr-Bremse · Bendix ADB22X · Meritor EX225</div>
        <div class="muted">认证：ECE R90 · IATF 16949 · SAE J866（FF/GG）· SAE J2522 台架矩阵</div>
        <div class="muted" style="margin-top:8px">现有车桥：${axles.map(a => esc(a.brand + ' ' + a.model)).join(' · ')}</div>
      </div>
    </div>`;
  }

  function setQ(q) { Q.q = String(q || ''); }
  window.XREF = { html: xrefHtml, lookup, setQ, getQ: () => Q.q };
})();