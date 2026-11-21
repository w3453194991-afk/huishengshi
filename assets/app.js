/* 冠英 · 选型与报价中台 —— 界面层 */
(function () {
  const D = window.DB, E = window.Engine;
  const esc = E.esc, money = E.money, norm = E.norm;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ================= 状态 ================= */
  const KEY = 'gy_hub_v1';
  const S = {
    tab: 'home',
    q: '',
    heroQ: '',
    match: null,
    cart: [],
    customerId: D.customers[0].id,
    leads: D.leads.map(l => ({ ...l, product: l.product || [] })),
    quotes: [],
    overrides: {},
    draftFits: [],
    filters: { cat: '', brand: '', mat: '', q: '', onlyFit: false, sort: '' },
    packCfg: { cover: true, quote: true, spec: true, test: true, confirm: true },
    content: { pid: (D.products.find(p => p.code === 'HOWO1') || D.products[0]).id, market: '墨西哥', lang: 'ES', platform: 'TikTok', seconds: 30, pain: '同车型装不同桥，买错就抖、就吃片' },
    script: null,
    chat: { open: false, msgs: [], auto: true, idx: 0 },
    custMsgs: [],
    fuMute: {},
    fuFlags: {},
    fuNotes: {},
    fuFilter: 'all',
    quoteMeta: { no: '', date: new Date().toISOString().slice(0, 10), incoterm: '', pay: '', note: '' }
  };
  let storageOK = true;
  let RQ = null;
  let PRICE_ROWS = [];

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        cart: S.cart, customerId: S.customerId, leads: S.leads, quotes: S.quotes,
        overrides: S.overrides, draftFits: S.draftFits, quoteMeta: S.quoteMeta, custMsgs: S.custMsgs, deals: S.deals,
        fuMute: S.fuMute, fuFlags: S.fuFlags, fuNotes: S.fuNotes
      }));
    } catch (e) { storageOK = false; }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const o = JSON.parse(raw);
      Object.assign(S, o);
      S.leads = S.leads.map(l => ({ ...l, product: l.product || [] }));
    } catch (e) { storageOK = false; }
    // 覆盖产品字段
    Object.keys(S.overrides || {}).forEach(pid => { const p = E.byId.get(pid); if (p) Object.assign(p, S.overrides[pid]); });
    // 草稿适配并入
    (S.draftFits || []).forEach(f => {
      if (!E.byId.has(f.pid)) return;
      D.fitments.push({
        id: f.id, vid: f.vid, aid: f.aid, pid: f.pid, pos: f.pos, fit: f.fit, conf: f.conf, src: f.src, q: f.q || [],
        vName: (D.vehicles.find(v => v.id === f.vid) || {}).brand ? `${(D.vehicles.find(v => v.id === f.vid)).brand} ${D.vehicles.find(v => v.id === f.vid).series} ${D.vehicles.find(v => v.id === f.vid).model}` : '通用',
        aName: (D.axles.find(a => a.id === f.aid) || {}).brand ? `${(D.axles.find(a => a.id === f.aid)).brand} ${D.axles.find(a => a.id === f.aid).model}` : '按旧件确认'
      });
    });
  }
  load();

  const customer = () => {
    const base = D.customers.find(c => c.id === S.customerId) || D.customers[0];
    const u = A.me();
    if (u && u.role === 'customer') {
      return Object.assign({}, base, {
        name: u.company || u.name,
        country: u.country || base.country,
        type: LZ('客户端客户', 'Portal customer')
      });
    }
    return base;
  };
  const cartRows = () => S.cart.map(it => ({ ...it, product: E.byId.get(it.pid) })).filter(r => r.product);
  const pendingCount = () => D.fitments.filter(f => f.conf !== '已确认').length + S.draftFits.length;

  /* ================= 通用 UI ================= */
  function tag(text, cls) { return `<span class="tag ${cls || 'n'}">${text}</span>`; }
  const confTag = c => {
    const M = { '高': 'High', '中': 'Medium', '低': 'Low', '已确认': 'Verified' };
    return `<span class="tag ${E.confTag(c)}">${I.getLang() === 'zh' ? c : (M[c] || c)}</span>`;
  };
  const SRC_EN = {
    '官网产品目录': 'Official catalogue', '官网产品目录（同款多编码）': 'Official catalogue (multi-code)',
    '系统生成': 'System', '工厂码': 'Factory code', '客户提供': 'Customer provided', '行业资料': 'Industry data'
  };
  function srcI18n(v) { return I.getLang() === 'zh' ? v : (SRC_EN[v] || v); }

  function drawer(title, body, footer) {
    $('#drawerTitle').innerHTML = title;
    $('#drawerBody').innerHTML = body;
    $('#drawerFoot').innerHTML = footer || '';
    $('#drawer').classList.add('on'); $('#drawerMask').classList.add('on');
  }
  function closeDrawer() { $('#drawer').classList.remove('on'); $('#drawerMask').classList.remove('on'); }
  function modal(title, body, footer, wide) {
    $('#modalTitle').innerHTML = title;
    $('#modalBody').innerHTML = body;
    $('#modalFoot').innerHTML = footer || '';
    $('#modal').style.maxWidth = wide ? '1080px' : '900px';
    $('#modalMask').classList.add('on');
  }
  function closeModal() { $('#modalMask').classList.remove('on'); }
  window.__toast = (m) => toast(m);
  function toast(msg, kind) {
    const t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2200);
  }
  function printHTML(html) {
    $('#printRoot').innerHTML = html;
    window.print();
  }

  /* ---- 成交台账示例数据（首次打开时生成，可删） ---- */
  function isoDay(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function seedDeals() {
    const C = [
      ['Transportes Mendoza', '墨西哥'],
      ['Al-Sayed Auto Parts', '沙特阿拉伯'],
      ['Minh Phat Trucking', '越南'],
      ['Frenos Brasil Ltda', '巴西']
    ];
    const RAW = [
      ['HOWO1', 1200, '已成交', 4, '李娜', 0, 'A7 后桥 HC16，第三次复购'],
      ['29087', 600, '已成交', 9, '李娜', 3, 'BPW TS2 挂车，随资料包一起'],
      ['HOWO2', 800, '谈判中', 12, '李娜', 0, '要 12 孔版本，等样品确认'],
      ['4515EA', 1500, '已成交', 18, '张伟', 1, '沙特批发，先走一个柜'],
      ['29090', 400, '已报价', 21, '张伟', 1, '价格卡在 4.2，等对方回'],
      ['19049-1', 900, '已成交', 27, '张伟', 1, '老客户补单'],
      ['4709', 2000, '已成交', 33, '王强', 2, '越南车队，年单第一笔'],
      ['17276', 300, '已丢单', 39, '王强', 2, '对手便宜 8%，价格没跟上'],
      ['19150', 700, '谈判中', 44, '王强', 2, '想先要试验报告'],
      ['17991', 500, '已成交', 52, '张伟', 1, ''],
      ['19010', 1000, '已成交', 61, '李娜', 3, '巴西进口商，走海运'],
      ['29088', 350, '已报价', 70, '张伟', 1, '等对方确认车型']
    ];
    return RAW.map((r, i) => {
      const p = D.products.find(x => x.code === r[0]) || {};
      const dt = new Date(); dt.setDate(dt.getDate() - r[3]);
      return {
        id: 'D' + (100 + i), code: r[0], pname: p.nameEn || '', qty: r[1],
        price: p.price || 0, amount: Math.round(r[1] * (p.price || 5) * 100) / 100,
        status: r[2], date: isoDay(dt), staff: r[4], customer: C[r[5]][0],
        country: C[r[5]][1], note: r[6]
      };
    });
  }
  function ensureDeals() {
    if (!Array.isArray(S.deals)) { S.deals = seedDeals(); save(); }
  }

  /* ================= 路由 ================= */
  const TABS = [
    ['home', '工作台', '◱'], ['select', '智能选型', '◎'], ['products', '产品库', '▤'],
    ['graph', '适配图谱', '⋔'], ['quote', '报价单', '￥'], ['pack', '资料包', '❐'],
    ['visits', '客户浏览', '👁'], ['leads', '询盘线索', '✉'], ['network', '用户画像', '◉'], ['content', '获客内容', '▶'],
    ['import', '数据导入', '⇪']
  ];
  // 客户能看的：首页 / 选型 / 产品库 / 我的报价 / 自定义定制
  const CUST_TABS = ['home', 'select', 'products', 'quote', 'custom'];
  // 员工视角的基础页（比客户多一个「资料包」）
  const STAFF_TABS = ['home', 'select', 'products', 'quote', 'pack'];
  /** 仅员工可见的 9 个页面，按用途收进 2 个分组菜单（14 个入口一个不丢） */
  const NAV_GROUPS = [
    // 客户线索：客户提的需求 + 客户在我方站内的行为 + 我们要主动找的人
    { key: 'clues', label: 'nav.g.clues', items: ['inquiries', 'leads', 'visits', 'network', 'deals', 'redfox'] },
    // 型号数据：都是「补充 / 校正型号与适配」的维护动作
    { key: 'data', label: 'nav.g.data', items: ['xref', 'graph', 'import'] }
  ];
  const STAFF_ONLY = NAV_GROUPS.reduce((a, g) => a.concat(g.items), []);
  /** 分组菜单末尾的外部系统入口：新窗口打开，不进本站路由 */
  const NAV_EXT = [
    {
      group: 'clues', zh: '转单云', en: 'Zhuandan Cloud', href: 'https://admin.hqsmartcloud.com/#/home',
      tipZh: '外部系统 · 转单云后台（新窗口打开）', tipEn: 'External · Zhuandan Cloud admin (opens in a new tab)'
    }
  ];
  /** 分组菜单展开状态（纯 UI，不落 localStorage） */
  let navOpen = '';
  /** 获客的三种视图都收进「用户画像」这一个入口 */
  const ACQ_PAGES = ['network', 'search', 'content'];
  /** 客户只看选型、产品、报价、资料包；其余是员工端 */
  function allowedTab(k) {
    if (A.isBoss()) return true;
    if (A.isStaff()) return k !== 'boss';
    return CUST_TABS.includes(k);
  }
  /** 等宽铺满后，最右侧分组的菜单可能顶出屏幕 —— 展开时按视口夹一下位置 */
  function clampNavMenu() {
    if (!navOpen) return;
    const flyEl = document.querySelector('.nav-fly.open');
    if (!flyEl) return;
    const menu = flyEl.querySelector('.nav-menu');
    if (!menu) return;
    // 先复位到默认（贴分组按钮起始边），再按需平移
    menu.style.left = ''; menu.style.right = '';
    const vr = menu.getBoundingClientRect();
    const fr = flyEl.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const pad = 10;
    let dx = 0;
    if (vr.right > vw - pad) dx = (vw - pad) - vr.right;
    if (vr.left + dx < pad) dx = pad - vr.left;
    if (dx) {
      menu.style.left = Math.round(vr.left - fr.left + dx) + 'px';
      menu.style.right = 'auto';
    }
  }
  /** 客户端换几个更好懂的名字 */
  const CUST_LABEL = { home: 'nav.homeCust', quote: 'nav.cart' };
  /** 客户端只有「选购」一个入口：首页也收进同一个菜单里 */
  const CUST_MENU = [
    ['home', '⌂', '看类别、找型号、进客服', 'Categories, search and chat'],
    ['select', '◎', '车型 / 车桥 / 编码 → 候选型号', 'Vehicle, axle or code to candidates'],
    ['products', '▤', '全部型号，规格 · 材质 · 图片', 'All parts with specs and photos'],
    ['custom', '✂', '非标尺寸 / 材质 / 包装 / 打标', 'Non-standard size, mix, packing, marking'],
    ['quote', '￥', '已选型号，出阶梯价和报价单', 'Your picks, tier price and quote']
  ];
  /** 顶栏真实高度 → 导航吸顶位置，避免被压住 */
  function syncTopbarH() {
    const tb = document.querySelector('.topbar');
    if (tb) document.documentElement.style.setProperty('--topbar-h', tb.offsetHeight + 'px');
  }
  window.addEventListener('resize', syncTopbarH);
  function renderNav() {
    syncTopbarH();
    const staff = A.isStaff();
    const label = k => T((!staff && CUST_LABEL[k]) || ('nav.' + k));
    const badge = k => k === 'leads' ? S.leads.filter(l => l.status === '待跟进').length
      : (k === 'inquiries') ? A.inquiries().length
        : (k === 'quote' || k === 'pack') ? S.cart.length : 0;
    const isOn = k => (S.tab === k) || (k === 'network' && ACQ_PAGES.indexOf(S.tab) > 0);
    const btn = k => {
      const n = badge(k);
      return `<button data-act="tab" data-id="${k}" class="${isOn(k) ? 'on' : ''}">${label(k)}${n ? `<span class="badge">${n}</span>` : ''}</button>`;
    };
    const grp = (keys) => keys.filter(allowedTab).map(btn).join('');
    if (!staff) {
      // 客户端：保留「选购」单一下拉（菜单里含首页），触发器显示当前所在页
      const navBar0 = document.querySelector('nav.nav');
      if (navBar0) navBar0.classList.add('has-drop');
      $('#nav').classList.add('has-drop');
      const cz = I.getLang() === 'zh';
      const cur = CUST_MENU.find(m => m[0] === S.tab) || CUST_MENU[0];
      const items = CUST_MENU.map(m => {
        const n = badge(m[0]);
        const on = S.tab === m[0];
        return '<button data-act="tab" data-id="' + m[0] + '" class="' + (on ? 'on' : '') + '">' +
          '<span class="nd-ico">' + m[1] + '</span>' +
          '<span class="nd-txt"><b>' + label(m[0]) + (n ? ' <span class="badge">' + n + '</span>' : '') + '</b>' +
          '<i>' + (cz ? m[2] : m[3]) + '</i></span></button>';
      }).join('');
      $('#nav').innerHTML =
        '<div class="nav-drop" id="navDrop">' +
          '<button class="nav-drop-t" data-act="navDrop" aria-haspopup="true" aria-expanded="false">' +
            label(cur[0]) +
            '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>' +
          '</button>' +
          '<div class="nav-drop-p">' + items + '</div>' +
        '</div>';
      return;
    }
    // 员工侧：9 个页面收进 2 个下拉分组，分组标题本身也能点开看成员
    let first = true;
    const fly = g => {
      const items = g.items.filter(allowedTab);
      if (!items.length) return '';
      const sum = items.reduce((n, k) => n + badge(k), 0);
      const active = items.indexOf(S.tab) >= 0 ? S.tab : '';
      const sepCls = first ? ' divided' : '';
      first = false;
      const ext = NAV_EXT.filter(x => x.group === g.key).map(x =>
        `<a class="nav-ext" role="menuitem" href="${esc(x.href)}" target="_blank" rel="noopener noreferrer" title="${esc(LZ(x.tipZh, x.tipEn))}">${esc(LZ(x.zh, x.en))}<span class="ext" aria-hidden="true">↗</span></a>`).join('');
      return `<div class="nav-fly${sepCls}${navOpen === g.key ? ' open' : ''}" data-fly="${g.key}">
        <button class="nav-fly-btn${active ? ' cur' : ''}" data-act="navGroup" data-id="${g.key}"
          aria-haspopup="true" aria-expanded="${navOpen === g.key}">${T(g.label)}${sum ? `<span class="badge">${sum}</span>` : ''}<span class="caret">▾</span></button>
        <div class="nav-menu" role="menu">
          ${items.map(k => `<button role="menuitem" data-act="tab" data-id="${k}" class="${isOn(k) ? 'on' : ''}">${label(k)}${badge(k) ? `<span class="badge">${badge(k)}</span>` : ''}${active === k ? '<span class="tick">✓</span>' : ''}</button>`).join('')}${ext}
        </div></div>`;
    };
    // 老板页签同样走 .nav-fly，才能融进 Grid 等分
    const bossGrp = A.isBoss() ? `<div class="nav-fly divided"><button data-act="tab" data-id="boss" class="nav-fly-btn boss-only${isOn('boss') ? ' cur' : ''}">${LZ('业绩总览', 'Owner')}</button></div>` : '';
    // 扁平结构 + Grid 等分：每个顶层项都占同样宽度，不会因嵌套 flex 差几像素
    $('#nav').innerHTML = grp(STAFF_TABS) + NAV_GROUPS.map(fly).join('') + bossGrp;
    clampNavMenu();
  }
  /** 权限一览弹层 */
  const PERM_CUST = [
    ['首页', '看类别、找型号、提交询价'],
    ['智能选型', '报车型 / 车桥 / 旧件编码，出候选型号'],
    ['产品库', '看规格、材质、编码、图片'],
    ['我的报价', '自己组的单子，阶梯价 + 运费'],
    ['我的资料', '把报价 + 产品页 + 试验打包下载'],
    ['提交询价', '填数量，等员工回价（2 小时内）']
  ];
  const PERM_STAFF = [
    ['客户询价', '收到客户清单 → 一键载入报价'],
    ['客户浏览', '谁在看、看了什么、意向分'],
    ['询盘线索', '跟进状态、下一步动作'],
    ['用户画像', '画像 + 客户搜索 + 获客内容，一个入口三段切换'],
    ['适配图谱', '车型 → 车桥 → 型号的对应关系'],
    ['数据导入', 'Excel 批量导入型号 / 适配'],
    ['短视频接口', 'RedFox 短视频数据 → 选题与线索'],
    ['转单云（外部）', '「客户线索」菜单最后一项，新窗口打开转单云后台'],
    ['报价与资料', '同上，但可回写客户档案']
  ];
  function openPerm() {
    const zh = I.getLang() === 'zh';
    const row = (a, b) => `<div class="perm-row"><b>${esc(a)}</b><span>${esc(b)}</span></div>`;
    $('#permBody').innerHTML = `
      <div class="perm-col">
        <div class="perm-h cust"><span class="dot"></span> ${zh ? '客户登录后能做' : 'What the customer can do'}</div>
        ${PERM_CUST.map(([a, b]) => row(a, b)).join('')}
      </div>
      <div class="perm-col">
        <div class="perm-h staff"><span class="dot"></span> ${zh ? '员工端才有的' : 'Staff only'}</div>
        ${PERM_STAFF.map(([a, b]) => row(a, b)).join('')}
      </div>`;
    $('#permMask').classList.add('on');
  }
  function closePerm() { $('#permMask').classList.remove('on'); }
  function render() {
    renderNav();
    // 容错：缺页面容器时自动补上（旧版 index.html 有 8 个 section）
    if (!document.getElementById('p-' + S.tab)) {
      const sec = document.createElement('section');
      sec.className = 'page';
      sec.id = 'p-' + S.tab;
      $('.wrap').appendChild(sec);
    }
    $$('.page').forEach(p => p.classList.toggle('on', p.id === 'p-' + S.tab));
    ({ home: vHome, select: vSelect, products: vProducts, graph: vGraph, quote: vQuote, pack: vPack, inquiries: vInquiries, search: vSearch, xref: vXref, redfox: vRedfox, deals: vDeals, boss: vBoss, visits: vVisits, leads: vLeads, network: vNetwork, content: vContent, import: vImport, custom: vCustom }[S.tab])();
    if (S.tab === 'content') { const el = $('#p-content'); if (el) el.insertAdjacentHTML('afterbegin', acquireBar('content')); }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /* ================= 自定义定制（独立页面） ================= */
  let CU_SENT = null;
  function vCustom() {
    const cu = A.me() || {};
    const contact = cu.contact ? cu.contact.value : '';
    const zh = I.getLang() === 'zh';
    const caps = [
      ['尺寸', '厚度 / 宽度 / 长度按图纸做，公差 ±0.3mm', 'Size', 'Thickness, width, length to drawing, ±0.3mm'],
      ['材质', '半金属 / 陶瓷 / 风电专用配方可调', 'Compound', 'Semi-metallic, ceramic or wind-turbine mixes'],
      ['包装', '彩盒 / 中性盒 / 一箱几套，贴标自定义', 'Packing', 'Colour or neutral box, sets per carton, labels'],
      ['打标', '激光打标、丝印 logo、钢印编码', 'Marking', 'Laser, silk-screen logo, stamped code'],
      ['打样', '7 天出样，样品费下单可抵', 'Sampling', 'Sample in 7 days, cost credited to the order']
    ];
    const sentRows = (S.custMsgs || []).filter(m => m.from === 'me' && /^定制需求/.test(m.text)).slice(-3).reverse();
    $('#p-custom').innerHTML = `
      <h1>${T('nav.custom')}</h1>
      <p class="muted" style="margin:-4px 0 16px">${zh ? '非标尺寸、材质、包装、打标都能做。填完提交，2 小时内回你方案和打样价。' : 'Non-standard size, material, packing or marking — fill this in and we reply within 2 hours.'}</p>
      ${CU_SENT ? `<div class="cu-ok"><b>${zh ? '已提交' : 'Submitted'}</b><span>${esc(CU_SENT.prod)} × ${CU_SENT.qty}</span><i>${esc(CU_SENT.need)}</i></div>` : ''}
      <div class="cu-grid">
        <div class="card">
          <div class="field"><label>${zh ? '要定制的产品' : 'Product'}</label>
            <input id="cuProd" placeholder="${zh ? '如 HOWO1 鼓式衬片 / 风电片 / 制动蹄' : 'e.g. HOWO1 brake lining'}"></div>
          <div class="field"><label>${zh ? '数量' : 'Quantity'}</label>
            <input id="cuQty" type="number" min="1" value="200"></div>
          <div class="field"><label>${zh ? '改哪里（尺寸 / 材质 / 包装 / 打标）' : 'What to change'}</label>
            <textarea id="cuNeed" rows="4" placeholder="${zh ? '如：厚度加 2mm，改成 4 套一箱，箱面印我们的 logo' : 'e.g. +2mm thickness, 4 sets per carton, our logo on the box'}"></textarea></div>
          <div class="field"><label>${zh ? '联系方式' : 'Contact'}</label>
            <input id="cuContact" value="${esc(contact)}"></div>
          <div class="cu-act">
            <button class="btn primary" data-act="customSubmit">${zh ? '提交定制需求' : 'Send request'}</button>
            <button class="btn" data-act="tab" data-id="products">${zh ? '先看常规型号' : 'Browse standard parts'}</button>
          </div>
        </div>
        <div class="card cu-side">
          <div class="cu-h">${zh ? '我们能做' : 'What we can do'}</div>
          ${caps.map(c => `<div class="cu-row"><b>${zh ? c[0] : c[2]}</b><span>${zh ? c[1] : c[3]}</span></div>`).join('')}
          ${sentRows.length ? `<div class="cu-h" style="margin-top:14px">${zh ? '最近提交' : 'Recent'}</div>` + sentRows.map(m => `<div class="cu-row"><b>${esc(m.time || '')}</b><span>${esc(m.text.slice(0, 60))}</span></div>`).join('') : ''}
        </div>
      </div>`;
  }

  /* ================= 工作台 ================= */
  function vHome() {
    const st = D.stats;
    const cu = A.me();
    const isCust = !!cu && cu.role === 'customer';
    const todo = isCust
      ? A.stats(cu).events.filter(e => e.type === 'view' && e.d && e.d.code).slice(-3).reverse()
        .map(e => ({ n: '👁', t: e.d.code, tab: 'products' }))
      : [
        { n: S.leads.filter(l => l.status === '待跟进').length, t: T('home.t1'), tab: 'leads' },
        { n: pendingCount(), t: T('home.t2'), tab: 'graph' },
        { n: S.cart.length, t: T('home.t3'), tab: 'quote' },
        { n: S.quotes.length, t: T('home.t4'), tab: 'quote' }
      ].filter(x => x.n > 0);

    $('#p-home').innerHTML = window.HOME_HTML({
      st, isCust, isBoss: A.isBoss(), todo, ex: examples(), T, LZ, esc, I18N: I, confTag, tests: D.tests.length, cartCount: S.cart.length
    });

    if (window.HOME_INIT) window.HOME_INIT();
    const hq = $('#heroQ');
    if (hq) {
      hq.value = S.heroQ || '';
      hq.oninput = e => { S.heroQ = e.target.value; };
      hq.onkeydown = e => { if (e.key === 'Enter') ACT.heroMatch(); };
    }
  }

  /* ================= 社媒热度（按点赞量排序） ================= */
  const fmtN = n => {
    const zh = I.getLang() === 'zh';
    if (zh) return n >= 10000 ? (n / 10000).toFixed(1).replace(/\.0$/, '') + '万' : String(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };
  function contentOfCode(code) {
    const n = norm(code);
    const ps = (SOCIAL.posts || []).filter(x => norm(x.code) === n);
    const vs = (SOCIAL.videos || []).filter(x => norm(x.model) === n);
    const likes = ps.reduce((s, x) => s + x.likes, 0) + vs.reduce((s, x) => s + x.likes, 0);
    return { posts: ps, videos: vs, likes, count: ps.length + vs.length };
  }
  function vehicleHeat(vid) {
    const ps = (SOCIAL.posts || []).filter(x => x.vid === vid);
    const codes = new Set((E.fitsByV.get(vid) || []).map(f => norm(f.code)));
    const vs = (SOCIAL.videos || []).filter(x => codes.has(norm(x.model)));
    const likes = ps.reduce((s, x) => s + x.likes, 0) + vs.reduce((s, x) => s + x.likes, 0);
    const all = ps.map(x => ({ ...x, kind: 'post' })).concat(vs.map(x => ({ ...x, kind: 'video' })));
    all.sort((a, b) => b.likes - a.likes);
    return { posts: ps, videos: vs, likes, count: all.length, top: all[0] || null };
  }
  /** 官网标题里的品牌标签 → 库里已建档的车型（用于没有逐条适配关系时兜底） */
  const APP_VEH = {
    '重汽豪沃': ['V-HOWO-A7', 'V-HOWO-TH7'],
    '一汽解放': ['V-J6P', 'V-JH6', 'V-J7'],
    '东风': ['V-TIANLONG', 'V-TIANJIN'],
    '陕汽/斯太尔': ['V-DELONG'],
    '福田': ['V-AUMAN'],
    '江淮格尔发': ['V-JAC'],
    '大运': ['V-DAYUN'],
    '上汽红岩': ['V-HONGYAN'],
    '宇通': ['V-YUTONG'],
    '金龙': ['V-KINGLONG'],
    '现代客车/卡车': ['V-HYUNDAI-BUS'],
    '大宇': ['V-DAEWOO-BUS'],
    '日野 500': ['V-HINO500'],
    '五十铃 FVR/FSR': ['V-ISUZU-FVR'],
    '三菱 FUSO': ['V-FUSO'],
    '日产 Condor': ['V-NISSAN'],
    'DAF XF/CF': ['V-DAF-XF'],
    '奔驰 Actros': ['V-ACTROS'],
    '沃尔沃 FH': ['V-VOLVO-FH'],
    'BPW 挂车桥': ['V-TRAILER-BPW'],
    '富华桥挂车': ['V-TRAILER-FUWA'],
    '约克挂车桥': ['V-TRAILER-BPW'],
    'SAF 挂车桥': ['V-TRAILER-BPW'],
    'Trailor 挂车桥': ['V-TRAILER-BPW'],
    'ROR 挂车桥': ['V-TRAILER-BPW']
  };
  /** 某型号的常用车型：先取已建适配关系，再用官网标题的品牌推断兜底，按点赞量从高到低 */
  function productVehicles(p) {
    const fits = E.fitsByP.get(p.id) || [];
    const map = new Map();
    fits.forEach(f => {
      if (!f.vid) return;
      const e = map.get(f.vid) || { vid: f.vid, vName: f.vName, axles: new Set(), pos: new Set(), codes: new Set(), conf: f.conf, inferred: false };
      if (f.aName) e.axles.add(f.aName);
      e.pos.add(f.pos);
      e.codes.add(f.code);
      if (f.conf === '已确认') e.conf = '已确认';
      map.set(f.vid, e);
    });
    // 兜底：官网标题里写了适配哪个品牌/车系，但没有逐条适配关系
    (p.apps || []).forEach(app => {
      (APP_VEH[app] || []).forEach(vid => {
        if (map.has(vid)) return;
        const v = D.vehicles.find(x => x.id === vid);
        if (!v) return;
        map.set(vid, {
          vid, vName: `${v.brand} ${v.series} ${v.model}`.replace(/\s+/g, ' ').trim(),
          axles: new Set(), pos: new Set(), codes: new Set([p.code]), conf: '低', inferred: true
        });
      });
    });
    return [...map.values()].map(e => ({ ...e, heat: vehicleHeat(e.vid) }))
      .sort((a, b) => (b.heat.likes - a.heat.likes) || (Number(a.inferred) - Number(b.inferred)));
  }
  function heatTable(p) {
    const rows = productVehicles(p);
    if (!rows.length) {
      return `<div class="notice warn" style="font-size:12px">${I.getLang() === 'zh' ? '这个型号既没有适配关系，官网标题里也没有可识别的品牌。请在「适配图谱 → 新增适配关系」补一条，或先用「三步定位法」让客户确认车桥。' : 'No fitment and no brand in the catalog title. Add a fitment link, or confirm the axle with the customer first.'}</div>`;
    }
    const max = Math.max(...rows.map(r => r.heat.likes), 1);
    const anyInferred = rows.some(r => r.inferred);
    return `<table class="heat-tbl">
      <thead><tr><th style="width:34px">#</th><th>${T('h.apps')}</th><th>${I.getLang() === 'zh' ? '车桥 / 部位' : 'Axle / position'}</th><th>${T('h.code')}</th><th class="right">${T('nav.content')}</th><th class="right">${T('h.likes')}</th><th style="width:110px">${I.getLang() === 'zh' ? '热度' : 'Heat'}</th></tr></thead>
      <tbody>${rows.map((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `<span class="muted">${i + 1}</span>`;
        const pct = Math.max(4, Math.round(r.heat.likes / max * 100));
        return `<tr${r.inferred ? ' style="background:#fcfcfd"' : ''}>
          <td class="center">${medal}</td>
          <td><b>${esc(I.getLang() === 'zh' ? r.vName : vehEn(r.vName))}</b> ${r.inferred ? `<span class="tag n" title="${LZ('依据官网标题里的品牌推断，尚未逐车型确认', 'Inferred from the catalogue title brand, not confirmed per model')}">${LZ('推断', 'inferred')}</span>` : confTag(r.conf)}
            ${r.heat.top ? `<div class="tiny muted">${esc(r.heat.top.author)} · ${esc(r.heat.top.platform)} · ${fmtN(r.heat.top.likes)} ${LZ('赞', 'likes')}</div>` : `<div class="tiny muted">${LZ('暂无内容', 'No content')}</div>`}</td>
          <td class="small">${esc([...r.axles].join(' / ') || (r.inferred ? LZ('按车型确认', 'confirm by model') : LZ('按旧件', 'by old part')))}<div class="tiny muted">${r.pos.size ? esc([...r.pos].join('/')) + LZ('片', ' pcs') : '—'}</div></td>
          <td class="mono tiny">${esc([...r.codes].join(' / '))}</td>
          <td class="right small">${r.heat.count || '—'}</td>
          <td class="right mono b">${r.heat.likes ? fmtN(r.heat.likes) : '0'}</td>
          <td><span class="heat-bar"><i style="width:${pct}%"></i></span></td>
        </tr>`;
      }).join('')}</tbody></table>
      <div class="tiny muted" style="padding:6px 2px 0">${T('sel.heatNote')}</div>`;
  }
  function productHeat(p) {
    const rows = productVehicles(p);
    return rows.length ? rows.reduce((s, r) => s + r.heat.likes, 0) : contentOfCode(p.code).likes;
  }
  function relatedChips(p) {
    const codes = D.codes.filter(c => c.pid === p.id).length;
    const tests = (E.testsByP.get(p.id) || []).length;
    const rows = productVehicles(p);
    const others = new Set();
    rows.forEach(r => (E.fitsByV.get(r.vid) || []).forEach(f => { if (f.code !== p.code) others.add(f.code); }));
    const c = contentOfCode(p.code);
    const likes = rows.reduce((s, r) => s + r.heat.likes, 0);
    const zhL = I.getLang() === 'zh';
    const cnt = (n, zhUnit, enUnit) => n + (zhL ? ' ' + zhUnit : ' ' + enUnit);
    return [
      [zhL ? '编码' : 'Codes', cnt(codes, '条', 'items')],
      [zhL ? '试验' : 'Tests', cnt(tests, '条', 'reports')],
      [zhL ? '适配车型' : 'Fitments', cnt(rows.length, '个', 'vehicles')],
      [zhL ? '同车型其他型号' : 'Other codes', cnt(others.size, '个', 'codes')],
      [zhL ? '社媒内容' : 'Social posts', cnt(c.count, '条', 'posts')],
      [zhL ? '车型点赞' : 'Likes', likes ? fmtN(likes) : '0']
    ].map(([k, v]) => `<span class="chip"><span class="muted">${k}</span> <b>${v}</b></span>`).join('');
  }

  function otherModels(p) {
    const rows = productVehicles(p), m = new Map();
    rows.forEach(r => (E.fitsByV.get(r.vid) || []).forEach(f => {
      if (f.code !== p.code && f.pid) m.set(f.code, f.pid);
    }));
    return [...m.entries()];
  }

  /* ================= 智能选型 ================= */
  const EXAMPLES = {
    zh: ['豪沃A7 后片 200套', '解放J6P 457桥 后片', '天龙 153桥 后刹车片 100片', 'BPW TS2 370 盘片', '奔驰Actros 后片', '58144-45211', '富华13吨桥 刹车蹄', '德龙X3000 汉德桥 后片 陶瓷', 'HINO 500 后片', '客户说：我这车用哪个刹车片？'],
    en: ['HOWO A7 rear pads 200 pcs', 'FAW J6P 457 axle rear pads', 'Dongfeng Tianlong 153 axle rear 100 pcs', 'BPW TS2 370 disc pads', 'Mercedes Actros rear pads', '58144-45211', 'FUWA 13t axle brake shoes', 'Shacman X3000 rear ceramic pads', 'HINO 500 rear pads', 'Customer says: which pad fits my truck?'],
    es: ['HOWO A7 pastillas traseras 200 pzas', 'FAW J6P eje 457 pastillas traseras', 'Dongfeng Tianlong eje 153 traseras 100 pzas', 'BPW TS2 370 pastillas de disco', 'Mercedes Actros pastillas traseras', '58144-45211', 'FUWA eje 13t zapatas de freno', 'Shacman X3000 traseras cerámicas', 'HINO 500 pastillas traseras', 'Cliente: ¿qué pastilla lleva mi camión?'],
    pt: ['HOWO A7 pastilhas traseiras 200 pçs', 'FAW J6P eixo 457 pastilhas traseiras', 'Dongfeng Tianlong eixo 153 traseiras 100 pçs', 'BPW TS2 370 pastilhas de disco', 'Mercedes Actros pastilhas traseiras', '58144-45211', 'FUWA eixo 13t lonas de freio', 'Shacman X3000 traseiras cerâmicas', 'HINO 500 pastilhas traseiras', 'Cliente: qual pastilha serve no meu caminhão?'],
    ar: ['HOWO A7 فحمات خلفية 200 قطعة', 'FAW J6P محور 457 فحمات خلفية', 'Dongfeng Tianlong محور 153 خلفية 100 قطعة', 'BPW TS2 370 فحمات قرصية', 'Mercedes Actros فحمات خلفية', '58144-45211', 'FUWA محور 13 طن أحذية فرامل', 'Shacman X3000 خلفية سيراميك', 'HINO 500 فحمات خلفية', 'العميل: أي فحمات تناسب شاحنتي؟'],
    ru: ['HOWO A7 задние колодки 200 шт', 'FAW J6P мост 457 задние колодки', 'Dongfeng Tianlong мост 153 задние 100 шт', 'BPW TS2 370 дисковые колодки', 'Mercedes Actros задние колодки', '58144-45211', 'FUWA мост 13т тормозные накладки', 'Shacman X3000 задние керамика', 'HINO 500 задние колодки', 'Клиент: какие колодки подходят к моему грузовику?'],
    id: ['HOWO A7 kampas rem belakang 200 pcs', 'FAW J6P axle 457 kampas belakang', 'Dongfeng Tianlong axle 153 belakang 100 pcs', 'BPW TS2 370 kampas cakram', 'Mercedes Actros kampas belakang', '58144-45211', 'FUWA axle 13t kampas tromol', 'Shacman X3000 belakang keramik', 'HINO 500 kampas belakang', 'Pelanggan: kampas apa yang cocok untuk truk saya?'],
    vi: ['HOWO A7 má phanh sau 200 bộ', 'FAW J6P cầu 457 má phanh sau', 'Dongfeng Tianlong cầu 153 sau 100 bộ', 'BPW TS2 370 má phanh đĩa', 'Mercedes Actros má phanh sau', '58144-45211', 'FUWA cầu 13 tấn guốc phanh', 'Shacman X3000 sau gốm', 'HINO 500 má phanh sau', 'Khách: xe tôi dùng má phanh nào?'],
    th: ['HOWO A7 ผ้าเบรกหลัง 200 ชุด', 'FAW J6P เพลา 457 ผ้าเบรกหลัง', 'Dongfeng Tianlong เพลา 153 หลัง 100 ชุด', 'BPW TS2 370 ผ้าเบรกจาน', 'Mercedes Actros ผ้าเบรกหลัง', '58144-45211', 'FUWA เพลา 13 ตัน ผ้าเบรก drum', 'Shacman X3000 หลัง เซรามิก', 'HINO 500 ผ้าเบรกหลัง', 'ลูกค้า: รถผมใช้ผ้าเบรกรุ่นไหน?'],
    tr: ['HOWO A7 arka balata 200 adet', 'FAW J6P 457 aks arka balata', 'Dongfeng Tianlong 153 aks arka 100 adet', 'BPW TS2 370 disk balata', 'Mercedes Actros arka balata', '58144-45211', 'FUWA 13t aks kampana balatası', 'Shacman X3000 arka seramik', 'HINO 500 arka balata', 'Müşteri: benim kamyonuma hangi balata uyar?']
  };
  const examples = () => EXAMPLES[I.getLang()] || EXAMPLES.en;

  function vSelect() {
    const m = S.match;
    $('#p-select').innerHTML = `
    <div class="grid" style="grid-template-columns:1.15fr .85fr">
      <div class="card">
        <div class="card-h"><h3>${T('sel.in')}</h3><span class="sub">${T('sel.inSub')}</span></div>
        <div class="card-b">
          <textarea id="q" placeholder="${T('sel.ph')}">${esc(S.q)}</textarea>
          <div class="row wrap-gap mt-s">
            <button class="btn primary" data-act="doMatch">${T('sel.go')}</button>
            <button class="btn" data-act="clearMatch">${T('sel.clear')}</button>
            <span class="flex1"></span>
            <span class="tiny muted">${D.stats.products} ${T('nav.products')} · ${D.stats.codes} ${T('h.codes')} · ${D.stats.fitments} ${T('nav.graph')}</span>
          </div>
          <div class="row wrap-gap mt-s" style="gap:6px">
            ${examples().slice(0, 6).map(x => `<span class="chip" data-act="example" data-id="${esc(x)}">${esc(x)}</span>`).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${T('home.steps')}</h3><span class="sub">${T('home.stepsSub')}</span></div>
        <div class="card-b small" style="line-height:1.75">
          <div>${T('home.s1')}</div>
          <div>${T('home.s2')}</div>
          <div>${T('home.s3')}</div>
          ${I.getLang() === 'zh' ? '<div class="notice mt-s">把这段存成话术，客户说不清型号时直接发过去，比反复追问体面得多。</div>' : ''}
        </div>
      </div>
    </div>
    <div id="matchOut" class="mt">${m ? renderMatch(m) : `<div class="card"><div class="empty"><div class="ic">◎</div>${I.getLang() === 'zh' ? '输入车型、车桥、编码或客户原话，开始匹配' : 'Enter a vehicle, axle, part number or the customer\'s words.'}</div></div>`}</div>`;
    const ta = $('#q');
    if (ta) { ta.oninput = e => { S.q = e.target.value; }; }
  }

  function renderMatch(m) {
    const top = m.top;
    if (!top) {
      return `<div class="card"><div class="card-b"><div class="notice warn">${I.getLang() === 'zh' ? '没有匹配到型号。建议：① 换成车桥型号（如 457桥、BPW TS2）② 直接粘贴旧件上的编码 ③ 让客户拍旧件照片。' : 'No match. Try the axle (457 / BPW TS2), paste the number on the old pad, or ask for a photo.'}</div>
      <div class="mt-s"><button class="btn sm" data-act="tab" data-id="products">${T('nav.products')}</button></div></div></div>`;
    }
    const p = top.product;
    const mat = D.materials.find(x => x.id === p.material) || D.materials[0];
    const price100 = E.priceOf(p.id, 100, customer());
    return `
    <div class="card" style="border-color:#f6c9a8">
      <div class="card-h">
        <h3>${T('sel.res')}</h3><span class="sub">${T('sel.resSub', { n: m.candidates.length })}</span>
        <span class="flex1"></span>
        <span class="tag ${m.grade.c === 'c-hi' ? 'g' : m.grade.c === 'c-mid' ? 'y' : 'r'}">${m.grade.l}</span>
      </div>
      <div class="card-b">
        <div class="ents">
          ${m.entities.map(e => `<div class="ent ${e.k === '输入' ? '' : 'hit'}"><div class="k">${esc(e.k)}</div><div class="v">${esc(e.v)}</div><div class="c">${esc(e.c)}</div></div>`).join('')}
        </div>
        ${m.questions.length ? `<div class="qbox"><div class="t">⚠ ${T('sel.q')}</div><ul>${m.questions.map(q => `<li>${q}</li>`).join('')}</ul></div>` : `<div class="notice ok mt-s">${T('sel.enough')}</div>`}
      </div>
    </div>

    ${m.candidates.map((c, i) => {
      const pr = c.product;
      const m2 = D.materials.find(x => x.id === pr.material) || D.materials[0];
      const ts = E.testsByP.get(pr.id) || [];
      const fs = E.fitsByP.get(pr.id) || [];
      const sc = Math.min(100, Math.round(c.score));
      return `<div class="result ${i === 0 ? 'best' : ''}">
        <div class="res-h">
          <div class="res-img">${pr.img ? `<img src="${esc(pr.img)}" alt="">` : '<span class="muted tiny">无图</span>'}</div>
          <div class="res-main">
            <div class="res-title">${esc(pr.code)} <span class="res-code">${esc(pr.sku)}</span>
              ${i === 0 ? tag('首选', 'o') : ''} ${pr.dim ? tag(pr.dim, 'n') : tag('尺寸待补', 'y')}
              ${ts.length ? tag('有试验报告', 'b') : ''}
            </div>
            <div class="muted small" style="margin-top:2px">${esc(pr.nameEn.slice(0, 88))}</div>
            <div class="res-meta">
              <span>${esc(pCat(pr))}</span><span>${esc(mName(m2))} μ${esc(m2.mu)}</span>
              <span>MOQ ${pr.moq}</span><span>参考价 <b>$${money(price100)}</b>/套（100 套档）</span>
            </div>
            <div class="reasons">${c.reasons.map(r => `<div class="reason"><i>✓</i><span>${r}</span></div>`).join('')}</div>
            ${c.note ? `<div class="notice warn mt-s" style="font-size:12px">${c.note}</div>` : ''}
          </div>
          <div class="conf">
            <div style="text-align:right">
              <div class="v ${sc >= 90 ? 'c-hi' : sc >= 70 ? 'c-mid' : 'c-lo'}">${sc}</div>
              <div class="tiny muted">匹配分</div>
            </div>
          </div>
        </div>
        <div class="res-body">
          <div class="row wrap-gap" style="gap:8px">
            <input type="number" min="1" value="${m.parsed.qty || 100}" style="width:90px" id="qty-${pr.id}">
            <button class="btn primary sm" data-act="addCart" data-id="${pr.id}">加入报价</button>
            <button class="btn sm" data-act="openProduct" data-id="${pr.id}">产品详情</button>
            <button class="btn sm" data-act="detailPack" data-id="${pr.id}">生成资料页</button>
            <button class="btn sm" data-act="copyAnswer" data-id="${pr.id}">复制回复话术</button>
          </div>
        </div>
      </div>`;
    }).join('')}

    ${(() => {
      const p = m.top.product, rows = productVehicles(p);
      return `<div class="card mt" style="border-color:#e8d5c4">
      <div class="card-h"><h3>「${esc(p.code)}」${T('sel.heat')}</h3>
        <span class="sub">${rows.length ? T('sel.heatSub', { n: rows.length }) : T('sel.heatEmpty')}</span>
        <span class="flex1"></span>
        <button class="btn sm" data-act="contentFor" data-id="${p.id}">${T('sel.videos')}</button>
        <button class="btn sm" data-act="copyHeat" data-id="${p.id}">${T('sel.copyList')}</button></div>
      <div class="card-b" style="padding:6px 14px 10px">
        <div class="row wrap-gap" style="gap:6px;margin:2px 0 8px">${relatedChips(p)}</div>
        ${heatTable(p)}
        ${otherModels(p).length ? `<div class="row wrap-gap" style="gap:6px;margin-top:8px;align-items:center">
          <span class="tiny muted">${T('sel.other')}:</span>
          ${otherModels(p).slice(0, 8).map(([code, pid]) => `<span class="chip" data-act="openProduct" data-id="${pid}">${esc(code)}</span>`).join('')}
        </div>` : ''}
        ${!rows.length ? `<div class="row" style="margin-top:8px"><button class="btn sm" data-act="newFit">补一条适配关系</button></div>` : ''}
      </div></div>`;
    })()}

    ${m.parsed.vehicle ? `<div class="card mt">
      <div class="card-h"><h3>${esc(m.parsed.vehicle.brand + ' ' + m.parsed.vehicle.series + ' ' + m.parsed.vehicle.model)} · 车桥对应表</h3>
      <span class="sub">同一个车型，不同桥 → 不同片</span></div>
      <div class="card-b" style="padding:0">
        <table><thead><tr><th>车桥</th><th>部位</th><th>型号</th><th>规格</th><th>适配</th><th>置信度</th><th>来源</th><th></th></tr></thead><tbody>
        ${E.matrix(m.parsed.vehicle.id).map(x => `<tr>
          <td>${x.axle ? esc(x.axle.brand + ' ' + x.axle.model) : '<span class="muted">按旧件确认</span>'}</td>
          <td>${esc(x.pos)}</td><td class="mono b">${esc(x.code)}</td>
          <td>${esc(x.axle ? x.axle.spec : '—')}</td><td>${esc(x.fit)}</td><td>${confTag(x.conf)}</td>
          <td class="tiny muted">${esc(x.src)}</td>
          <td><button class="btn xs" data-act="addCart" data-id="${x.pid}">加入</button></td>
        </tr>`).join('')}
        </tbody></table>
      </div>
    </div>` : ''}`;
  }

  function doMatch(q) {
    const qEl = $('#q');
    if (q == null && qEl && typeof qEl.value === 'string') q = qEl.value;
    if (q != null) S.q = q;
    const text = (S.q || '').trim();
    if (!text) { toast('请输入车型、车桥或编码'); return; }
    S.match = E.match(text);
    A.track('search', { q: text, top: S.match.top ? S.match.top.product.code : '' });
    render();
  }

  /* ================= 产品库 ================= */
  function filtered() {
    const f = S.filters, q = norm(f.q);
    const list = D.products.filter(p => {
      if (f.cat && p.cat !== f.cat) return false;
      if (f.brand && p.brand !== f.brand) return false;
      if (f.mat && p.material !== f.mat) return false;
      if (f.onlyFit && !E.fitsByP.has(p.id)) return false;
      if (!q) return true;
      return norm(p.code + p.nameEn + p.sku).includes(q) || D.codes.some(c => c.pid === p.id && c.norm.includes(q));
    });
    if (f.sort === 'likes') list.sort((a, b) =>
      (productHeat(b) - productHeat(a)) ||
      (contentOfCode(b.code).likes - contentOfCode(a.code).likes) ||
      ((E.fitsByP.get(b.id) || []).length - (E.fitsByP.get(a.id) || []).length));
    else if (f.sort === 'fit') list.sort((a, b) => (E.fitsByP.get(b.id) || []).length - (E.fitsByP.get(a.id) || []).length);
    else if (f.sort === 'price') list.sort((a, b) => b.price - a.price);
    return list;
  }
  function vProducts() {
    const list = filtered();
    $('#p-products').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('prod.title')}</h1><div class="muted small">${T('prod.sub', { p: D.stats.products, c: D.stats.codes })}</div></div>
      <div class="row">
        <button class="btn sm" data-act="exportProducts">${T('prod.export')}</button>
      </div>
    </div>
    <div class="card mb">
      <div class="card-b row wrap-gap">
        <div class="field" style="width:240px"><label>${T('prod.ph')}</label><input type="text" id="fq" value="${esc(S.filters.q)}" placeholder="29087 / HOWO / 16 holes"></div>
        <div class="field" style="width:150px"><label>${T('prod.cat')}</label><select id="fcat"><option value="">${T('c.all')}</option>${[...new Set(D.products.map(p => p.cat))].map(c => `<option value="${esc(c)}" ${S.filters.cat === c ? 'selected' : ''}>${esc(catLabel(c))}</option>`).join('')}</select></div>
        <div class="field" style="width:130px"><label>${T('prod.brand')}</label><select id="fbrand"><option value="">${T('c.all')}</option>${D.brands.map(b => `<option value="${b.id}" ${S.filters.brand === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>
        <div class="field" style="width:130px"><label>${T('prod.mat')}</label><select id="fmat"><option value="">${T('c.all')}</option>${D.materials.map(m => `<option value="${m.id}" ${S.filters.mat === m.id ? 'selected' : ''}>${esc(mName(m))}</option>`).join('')}</select></div>
        <div class="field" style="justify-content:flex-end"><label>&nbsp;</label><label class="chk"><input type="checkbox" id="ffit" ${S.filters.onlyFit ? 'checked' : ''}> ${T('prod.only')}</label></div>
        <div class="field" style="width:140px"><label>${T('prod.sort')}</label><select id="fsort">
          <option value="" ${!S.filters.sort ? 'selected' : ''}>${T('prod.def')}</option>
          <option value="likes" ${S.filters.sort === 'likes' ? 'selected' : ''}>${T('prod.likes')}</option>
          <option value="fit" ${S.filters.sort === 'fit' ? 'selected' : ''}>${T('prod.fit')}</option>
          <option value="price" ${S.filters.sort === 'price' ? 'selected' : ''}>${T('prod.price')}</option>
        </select></div>
        <div style="margin-inline-start:auto;align-self:flex-end" class="muted small">${T('prod.res')} <b>${list.length}</b></div>
      </div>
    </div>
    <div class="card"><div class="tbl-wrap" style="max-height:calc(100vh - 300px)">
      <table><thead><tr><th style="width:46px"></th><th>${T('h.code')}</th><th>${T('h.name')}</th><th>${T('h.apps')}</th><th>${T('prod.cat')}</th><th>${T('h.spec')}</th><th>${T('prod.mat')}</th><th>${T('h.codes')}</th><th>${T('nav.graph')}</th><th class="right" title="likes of related vehicles (demo)">${T('h.likes')}</th><th class="right">${T('h.price')}</th><th>${LZ('成交', 'Deals')}</th><th></th></tr></thead><tbody>
      ${list.slice(0, 400).map(p => {
        const nCodes = D.codes.filter(c => c.pid === p.id).length;
        const nFit = (E.fitsByP.get(p.id) || []).length;
        const apps = appsOf(p);
        const likes = productHeat(p);
        return `<tr class="click" data-act="openProduct" data-id="${p.id}">
          <td><div class="thumb">${p.img ? `<img src="${esc(p.img)}" loading="lazy" alt="">` : ''}</div></td>
          <td class="mono b">${esc(p.code)}</td>
          <td class="small muted" style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(pName(p))}</td>
          <td class="small" style="max-width:220px">${apps.length ? esc(appsJoin(apps, 2)) + (apps.length > 2 ? ` +${apps.length - 2}` : '') : `<span class="tiny muted">${LZ('待补', 'TBD')}</span>`}</td>
          <td class="small">${esc(pCat(p))}</td><td class="small">${esc(p.dim || '—')}</td>
          <td class="small">${esc(p.material)}</td><td class="small">${nCodes}</td>
          <td>${nFit ? `<span class="tag b">${nFit}</span>` : '<span class="tiny muted">—</span>'}</td>
          <td class="right mono small">${likes ? fmtN(likes) : '<span class="tiny muted">—</span>'}</td>
          <td class="right mono">$${money(p.price)}</td>
          <td class="small">${(() => {
            const ds = (S.deals || []).filter(d => d.code === p.code);
            if (!ds.length) return '<span class="tiny muted">—</span>';
            const won = ds.filter(d => d.status === '已成交').length;
            return '<span class="tag ' + (won ? 'g' : 'y') + '">' + won + ' 单</span>';
          })()}</td>
          <td><button class="btn xs" data-act="addCart" data-id="${p.id}">${T('c.add')}</button></td>
        </tr>`;
      }).join('')}
      </tbody></table>
      ${list.length > 400 ? '<div class="muted small center" style="padding:10px">仅显示前 400 条，请细化筛选</div>' : ''}
      ${!list.length ? `<div class="empty">${T('c.empty')}</div>` : ''}
    </div></div>`;
    const bind = (id, ev, fn) => { const n = $('#' + id); if (n) n[ev] = fn; };
    bind('fq', 'oninput', e => { S.filters.q = e.target.value; vProducts(); });
    bind('fcat', 'onchange', e => { S.filters.cat = e.target.value; vProducts(); });
    bind('fbrand', 'onchange', e => { S.filters.brand = e.target.value; vProducts(); });
    bind('fmat', 'onchange', e => { S.filters.mat = e.target.value; vProducts(); });
    bind('ffit', 'onchange', e => { S.filters.onlyFit = e.target.checked; vProducts(); });
    bind('fsort', 'onchange', e => { S.filters.sort = e.target.value; vProducts(); });
  }

  /* ================= 适配图谱 ================= */
  function vGraph() {
    const vs = D.vehicles.slice().sort((a, b) => (b.fitCount || 0) - (a.fitCount || 0));
    $('#p-graph').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('nav.graph')}</h1><div class="muted small">${LZ('车型 → 车桥 → 型号。新增关系进入「待复核」队列，复核后才对外生效。','Vehicle → axle → part. New links wait for R&D review.')}</div></div>
      <button class="btn primary" data-act="newFit">${LZ('新增适配关系','Add fitment')}</button>
    </div>
    <div class="split">
      <div class="card"><div class="card-h"><h3>${T('h.apps')}（${D.vehicles.length}）</h3><span class="sub">${LZ('按适配条数排序','Sorted by fitment count')}</span></div>
        <div class="card-b" style="padding:8px 10px;max-height:calc(100vh - 240px);overflow:auto">
        ${vs.map(v => `
          <div class="tree-node">
            <div class="h">
              <b>${esc(v.brand + ' ' + v.series + ' ' + v.model)}</b>
              <span class="tiny muted">${esc(v.years)}</span>
              <span class="flex1"></span>
              ${v.fitCount ? `<span class="tag b">${v.fitCount} 条</span>` : '<span class="tag n">未建关系</span>'}
            </div>
            <div class="tiny muted" style="margin-top:3px">${esc(v.cls)} · ${esc(v.note || '')}</div>
            ${v.fitCount ? `<div class="branch">${E.matrix(v.id).map(x => `
              <div class="leaf">
                <span class="mono" style="width:120px">${x.axle ? esc(x.axle.brand + ' ' + x.axle.model) : '按旧件'}</span>
                <span class="arrow">→</span><b class="mono" style="width:96px">${esc(x.code)}</b>
                <span class="muted tiny">${esc(x.pos)} ${esc(x.fit)}</span>
                <span class="flex1"></span>${confTag(x.conf)}
              </div>`).join('')}</div>` : ''}
          </div>`).join('')}
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-h"><h3>${LZ('车桥主数据','Axle master')}（${D.axles.length}）</h3></div>
          <div class="card-b" style="padding:0">
            <table><thead><tr><th>${LZ('车桥','Axle')}</th><th>${LZ('型式','Type')}</th><th>${T('h.spec')}</th><th>${T('h.apps')}</th></tr></thead><tbody>
            ${D.axles.map(a => {
              const n = new Set(D.fitments.filter(f => f.aid === a.id).map(f => f.vid)).size;
              return `<tr><td><b>${esc(a.brand)}</b><div class="tiny muted">${esc(a.model)}</div></td>
                <td class="small">${esc(a.type)}<div class="tiny muted">${esc(a.cap)}</div></td>
                <td class="small">${esc(a.spec)}</td><td>${n ? `<span class="tag b">${n}</span>` : '<span class="tiny muted">—</span>'}</td></tr>`;
            }).join('')}
            </tbody></table>
          </div>
        </div>
        <div class="card mt">
          <div class="card-h"><h3>${LZ('待复核队列','Review queue')}（${pendingCount()}）</h3><span class="sub">${LZ('研发确认后转「已确认」','Becomes confirmed after R&D review')}</span></div>
          <div class="card-b" style="padding:0">
            <table><thead><tr><th>${T('h.apps')}</th><th>${T('h.code')}</th><th>${LZ('置信度','Confidence')}</th><th></th></tr></thead><tbody>
            ${D.fitments.filter(f => f.conf !== '已确认').slice(0, 10).map(f => `<tr>
              <td class="small">${esc(f.vName)}<div class="tiny muted">${esc(f.aName)}</div></td>
              <td class="mono">${esc(f.code)}</td><td>${confTag(f.conf)}</td>
              <td><button class="btn xs" data-act="confirmFit" data-id="${f.id}">${LZ('确认','OK')}</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty small">队列为空</td></tr>'}
            </tbody></table>
            ${S.draftFits.length ? `<div class="card-b small muted">另有 ${S.draftFits.length} 条本次新增，等待导出给研发。</div>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ================= 报价单 ================= */
  function vQuote() {
    const c = customer();
    const rows = cartRows();
    const calc = E.quoteCalc(rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })), c);
    const meta = S.quoteMeta;
    $('#p-quote').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('qt.title')}</h1><div class="muted small">${T('qt.sub')}</div></div>
      <div class="qt-actions">
        <div class="qt-tools">
          <button class="qt-btn" data-act="tab" data-id="select" title="${T('sel.go')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <span class="qt-lbl">${T('sel.go')}</span>
          </button>
          <span class="qt-div"></span>
          <button class="qt-btn" data-act="printQuote" title="${T('qt.gen')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="7.5" rx="2"/><path d="M7 16.5h10V21H7z"/></svg>
            <span class="qt-lbl">${LZ('生成报价单', 'Quote PDF')}</span>
          </button>
        </div>
        ${A.isStaff()
          ? `<button class="qt-cta" data-act="priceOpen">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M21.5 2.5 10.8 13.2"/><path d="M21.5 2.5 15 21.5l-4.2-8.3-8.3-4.2 19-6.5Z"/></svg>
               ${LZ('报价', 'Send price')}</button>`
          : `<button class="qt-cta" data-act="askPrice">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M21.5 2.5 10.8 13.2"/><path d="M21.5 2.5 15 21.5l-4.2-8.3-8.3-4.2 19-6.5Z"/></svg>
               ${LZ('询价', 'Ask price')}</button>`}
      </div>
    </div>
    <div class="split">
      <div>
        <div class="card">
          <div class="card-h"><h3>${T('qt.cust')}</h3></div>
          <div class="card-b grid" style="grid-template-columns:1fr 1fr;gap:10px">
            <div class="field"><label>${LZ('客户','Customer')}</label>${A.me() && A.me().role === 'customer'
              ? `<input type="text" value="${esc(A.me().company || A.me().name)} · ${esc(A.me().contact.value)}" disabled>`
              : `<select id="qCustomer">${D.customers.map(x => `<option value="${x.id}" ${x.id === S.customerId ? 'selected' : ''}>${esc(x.name)}（${esc(x.country)} · ${esc(x.type)}）</option>`).join('')}</select>`}</div>
            <div class="field"><label>${LZ('报价单号','Quote No.')}</label><input type="text" id="qNo" value="${esc(meta.no || autoNo())}"></div>
            <div class="field"><label>${LZ('日期','Date')}</label><input type="text" id="qDate" value="${esc(meta.date)}"></div>
            <div class="field"><label>${LZ('贸易术语','Incoterm')}</label><input type="text" id="qInco" value="${esc(meta.incoterm || c.incoterm)}"></div>
            <div class="field"><label>${LZ('付款方式','Payment')}</label><input type="text" id="qPay" value="${esc(meta.pay || c.pay)}"></div>
            <div class="field"><label>${LZ('价格等级','Price level')}</label><input type="text" value="${esc(c.grade + ' 类 · ' + c.priceLevel)}" disabled></div>
          </div>
        </div>
        <div class="card mt">
          <div class="card-h"><h3>${T('qt.items')}（${rows.length}）</h3><span class="flex1"></span>
            <button class="btn sm" data-act="clearCart">${T('sel.clear')}</button></div>
          <div class="card-b" style="padding:0">
            ${rows.length ? `<table><thead><tr><th style="width:44px"></th><th>${T('h.code')}</th><th>${T('prod.mat')}</th><th class="right">${LZ('数量','Qty')}</th><th class="right">${LZ('单价','Unit')}</th><th class="right">${LZ('金额','Amount')}</th><th></th></tr></thead><tbody>
            ${calc.rows.map((r, i) => `<tr>
              <td><div class="thumb sm">${r.product.img ? `<img src="${esc(r.product.img)}" loading="lazy" alt="">` : ''}</div></td>
              <td><b class="mono">${esc(r.product.code)}</b><div class="tiny muted">${esc(r.tier)}</div></td>
              <td><select data-act="setMat" data-id="${i}" style="width:112px;padding:3px 6px;font-size:12px">${D.materials.map(m => `<option value="${m.id}" ${((r.mat || r.product.material) === m.id) ? 'selected' : ''}>${esc(mName(m))}</option>`).join('')}</select></td>
              <td class="right"><input type="number" min="1" data-act="setQty" data-id="${i}" value="${r.qty}" style="width:82px;text-align:right;padding:3px 6px"></td>
              <td class="right mono">$${money(r.unit)}</td>
              <td class="right mono b">$${money(r.amt)}</td>
              <td><button class="btn xs" data-act="rmCart" data-id="${r.pid}">×</button></td>
            </tr>`).join('')}
            </tbody></table>` : `<div class="empty">${T('qt.empty')}</div>`}
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-h"><h3>${LZ('金额','Amount')}</h3></div>
          <div class="card-b">
            <table style="font-size:13px">
              <tr><td class="muted">${T('qt.amount')}</td><td class="right mono">$${money(calc.amount)}</td></tr>
              <tr><td class="muted">${T('qt.freight')}</td><td class="right mono">$${money(calc.freight)}</td></tr>
              <tr><td class="b" style="font-size:15px">${T('qt.total')} USD</td><td class="right mono b" style="font-size:20px">$${money(calc.total)}</td></tr>
            </table>
            <div class="hr"></div>
            <div class="tiny muted">${LZ('阶梯价规则：', 'Volume tiers: ')}${E.TIERS.slice().reverse().map(t => `${t.min}+ → ×${t.f}`).join(' · ')}${LZ('。客户等级与价格等级再乘系数。', '. Customer and price level factors apply.')}</div>
            <div class="mt-s row wrap-gap">
              <button class="btn sm" data-act="saveQuote">${T('qt.save')}</button>
              <button class="btn sm" data-act="tab" data-id="pack">${T('nav.pack')} →</button>
            </div>
          </div>
        </div>
        <div class="card mt">
          <div class="card-h"><h3>${T('qt.recent')}</h3></div>
          <div class="card-b" style="padding:0">
            <table><thead><tr><th>${LZ('单号','No.')}</th><th>${LZ('客户','Customer')}</th><th class="right">${LZ('金额','Amount')}</th><th></th></tr></thead><tbody>
            ${(S.quotes || []).slice(-6).reverse().map(q => `<tr><td class="mono small">${esc(q.no)}</td><td class="small">${esc(q.customer)}</td><td class="right mono">$${money(q.total)}</td>
              <td><button class="btn xs" data-act="loadQuote" data-id="${q.id}">${LZ('载入','Load')}</button></td></tr>`).join('') || `<tr><td colspan="4" class="empty small">${T('c.empty')}</td></tr>`}
            </tbody></table>
          </div>
        </div>
      </div>
    </div>`;
    const bind = (id, ev, fn) => { const n = $('#' + id); if (n) n[ev] = fn; };
    bind('qCustomer', 'onchange', e => { S.customerId = e.target.value; save(); vQuote(); });
    bind('qNo', 'oninput', e => { S.quoteMeta.no = e.target.value; });
    bind('qDate', 'oninput', e => { S.quoteMeta.date = e.target.value; });
    bind('qInco', 'oninput', e => { S.quoteMeta.incoterm = e.target.value; });
    bind('qPay', 'oninput', e => { S.quoteMeta.pay = e.target.value; });
  }

  function autoNo() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `GY${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${String((S.quotes.length || 0) + 1).padStart(3, '0')}`;
  }

  /* ================= 资料包 ================= */
  function vPack() {
    const rows = cartRows();
    const cfg = S.packCfg;
    const testN = rows.reduce((s, r) => s + (E.testsByP.get(r.pid) || []).length, 0);
    $('#p-pack').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('pk.title')}</h1><div class="muted small">${T('pk.sub')}</div></div>
      <div class="row">
        <button class="btn" data-act="zipPack">${T('pk.zip')}</button>
        <button class="btn primary" data-act="printPack">${T('pk.print')}</button>
      </div>
    </div>
    <div class="split">
      <div class="card">
        <div class="card-h"><h3>${T('pk.contents')}</h3><span class="sub">${LZ('按客户视角组织，可直接转发','Organised for the customer, ready to forward')}</span></div>
        <div class="card-b">
          ${[['cover', LZ('封面与选型依据','Cover & basis'), LZ('客户名 / 编号 / 型号清单 / 免责说明','Customer, part list, disclaimer')],
            ['quote', LZ('报价单','Quotation'), LZ('条款、阶梯价、运费估算','Terms, volume price, freight')],
            ['spec', LZ('产品数据页','Data sheets') + ` × ${rows.length}`, LZ('图片、规格、材质、编码对照、适配、试验摘要','Images, size, material, cross-reference, fitment')],
            ['test', LZ('试验报告摘要','Test summary') + ` ${testN}`, 'GB 5763 / ECE R90 / SAE J661'],
            ['confirm', LZ('发货前确认页','Pre-shipment check'), LZ('把「同车型不同桥」的风险前置到发货前','Catch the wrong-axle risk before shipping')]].map(([k, t, d]) => `
            <label class="chk" style="align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line-2)">
              <input type="checkbox" data-act="packCfg" data-id="${k}" ${cfg[k] ? 'checked' : ''}>
              <span><b>${t}</b><div class="tiny muted">${d}</div></span>
            </label>`).join('')}
          ${LZ('<div class="notice mt-s">提示：产品页里的图片在本机文件夹内，打印/另存 PDF 时会一起带出；ZIP 内为 HTML + CSV（体积小、可邮件发送）。</div>', '<div class="notice mt-s">Images are local files and print with the PDF. The ZIP contains HTML + CSV, small enough to email.</div>')}
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${T('pk.items')}（${rows.length}）</h3></div>
        <div class="card-b" style="padding:0">
          ${rows.length ? `<table><thead><tr><th style="width:44px"></th><th>${T('h.code')}</th><th>${T('h.spec')}</th><th>${LZ('试验','Tests')}</th><th></th></tr></thead><tbody>
          ${rows.map(r => `<tr><td><div class="thumb sm">${r.product.img ? `<img src="${esc(r.product.img)}" loading="lazy" alt="">` : ''}</div></td><td class="mono b">${esc(r.product.code)}</td><td class="small">${esc(r.product.dim || LZ('待补','TBD'))}</td>
            <td>${(E.testsByP.get(r.pid) || []).length ? tag((E.testsByP.get(r.pid) || []).length + ' 条', 'b') : '<span class="tiny muted">—</span>'}</td>
            <td><button class="btn xs" data-act="rmCart" data-id="${r.pid}">×</button></td></tr>`).join('')}
          </tbody></table>` : `<div class="empty">${T('pk.empty')}</div>`}
        </div>
      </div>
    </div>
    ${rows.length ? `<div class="card mt"><div class="card-h"><h3>${LZ('预览（打印版式）','Print preview')}</h3></div><div class="card-b"><div style="background:#fff;border:1px solid var(--line);border-radius:6px;padding:14px;transform-origin:top left">
      <div style="font-size:11px;color:var(--muted)">A4 · ${1 + (cfg.quote ? 1 : 0) + (cfg.spec ? rows.length : 0) + (cfg.confirm ? 1 : 0)} 页左右</div>
      <div style="font-size:22px;font-weight:800;margin:6px 0 2px">${LZ('产品与报价资料包','Product & quotation pack')}</div>
      <div class="muted small">${esc(customer().name)} · ${rows.map(r => esc(r.product.code)).join(' · ')}</div>
      <div class="hr"></div>
      <div class="row wrap-gap">${rows.slice(0, 6).map(r => `<div style="width:110px"><div class="imgbox" style="aspect-ratio:1">${r.product.img ? `<img src="${esc(r.product.img)}">` : ''}</div><div class="tiny center mono">${esc(r.product.code)}</div></div>`).join('')}</div>
    </div></div></div>` : ''}`;
  }

  /* ================= 询盘线索 ================= */
  function vLeads() {
    const rows = S.leads.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
    $('#p-leads').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('ld.title')}</h1><div class="muted small">${T('ld.sub')}</div></div>
      <button class="btn primary" data-act="newLead">+ ${T('ld.new')}</button>
    </div>
    <div class="card"><div class="tbl-wrap">
      <table><thead><tr><th>${LZ('线索','Lead')}</th><th>${LZ('来源','Source')}</th><th>${LZ('需求','Need')}</th><th>${LZ('客户类型','Type')}</th><th>${LZ('当地时间','Local time')}</th><th>${LZ('状态','Status')}</th><th class="right">${LZ('评分','Score')}</th><th></th></tr></thead><tbody>
      ${rows.map(l => {
        const sc = E.scoreLead(l), t = E.localTime(l.tz);
        return `<tr class="click" data-act="openLead" data-id="${l.id}">
          <td><b>${esc(l.company)}</b><div class="tiny muted">${esc(l.country)} · ${esc(l.contact)}</div></td>
          <td class="small">${esc(l.src)}<div class="tiny muted">${esc((l.created || '').slice(0, 16))}</div></td>
          <td class="small" style="max-width:300px">${esc(l.needZh || l.need).slice(0, 54)}</td>
          <td>${tag(sc.trading ? LZ('贸易商','Trader') : sc.terminal ? LZ('终端','End user') : LZ('待甄别','Verify'), sc.trading ? 'n' : sc.terminal ? 'g' : 'y')}</td>
          <td class="small"><span class="mono">${t.text}</span> <span class="tiny ${t.working ? '' : 'muted'}">${t.working ? '● 可联系' : '○ 休息'}</span></td>
          <td>${tag(l.status, l.status === '待跟进' ? 'o' : l.status === '已报价' ? 'b' : 'n')}</td>
          <td class="right"><div class="row" style="justify-content:flex-end;gap:6px">
            <span class="mono b ${sc.score >= 75 ? 'c-hi' : sc.score >= 55 ? 'c-mid' : 'c-lo'}">${sc.score}</span>
            <span class="tag ${sc.tier.c}">${sc.tier.l.split(' ')[0]}</span></div></td>
          <td><button class="btn xs" data-act="leadMatch" data-id="${l.id}">匹配型号</button></td>
        </tr>`;
      }).join('')}
      </tbody></table>
    </div></div>
    <div class="split mt">
      <div class="card"><div class="card-h"><h3>评分规则</h3><span class="sub">为什么这条是 A、那条是 C</span></div>
        <div class="card-b" style="padding:0">
          <table><thead><tr><th>维度</th><th>权重</th><th>说明</th></tr></thead><tbody>
          ${D.scoreRules.map(r => `<tr><td class="b">${esc(r.label)}</td><td class="mono">${r.w}</td><td class="small muted">${esc(r.desc)}</td></tr>`).join('')}
          </tbody></table>
        </div>
      </div>
      <div class="card"><div class="card-h"><h3>止损线：什么时候该放弃</h3></div>
        <div class="card-b small" style="line-height:1.8">
          <div>· 名称含 <b>Trading / Import &amp; Export / FZE</b>，且拿不出终端地址 → 只发目录，不投技术资源。</div>
          <div>· 只问价格、不给车型车桥、不接受小样 → 比价客户，报价即可，不做方案。</div>
          <div>· 海关数据里<b>收货人</b>才是终端；发货人是贸易公司 → 顺着收货人找。</div>
          <div>· 社媒私信 48 小时无回复 → 移到「待甄别」，不占用跟进配额。</div>
        </div>
      </div>
    </div>`;
  }

  /* ================= 数据导入 ================= */
  function vImport() {
    $('#p-import').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('im.title')}</h1><div class="muted small">${T('im.sub')}</div></div>
      <div class="row"><button class="btn" data-act="exportJson">${LZ('导出全量快照','Export snapshot')}</button>
        <button class="btn" data-act="resetData">${LZ('恢复默认数据','Reset data')}</button></div>
    </div>
    <div class="split">
      <div class="card">
        <div class="card-h"><h3>导入 CSV</h3><span class="sub">首行为表头，逗号或制表符分隔</span></div>
        <div class="card-b">
          <div class="field"><label>数据类型</label>
            <select id="impType">
              <option value="fit">适配关系（车型,车桥,部位,型号,适配类型,置信度,来源）</option>
              <option value="prod">产品更新（型号,规格,材质,价格,MOQ）</option>
              <option value="lead">询盘线索（公司,国家,来源,需求,联系人,时区）</option>
              <option value="code">编码对照（型号,编码,类型,来源）</option>
            </select></div>
          <div class="field mt-s"><label>粘贴内容</label><textarea id="impText" style="min-height:180px;font-family:var(--mono);font-size:12px" placeholder="车型,车桥,部位,型号,适配类型,置信度,来源
一汽解放 J6P,457桥,后,CA9T R,OE 替代,高,官网目录"></textarea></div>
          <div class="row mt-s"><button class="btn primary" data-act="runImport">校验并导入</button>
            <span class="tiny muted">导入后进入待复核队列，不直接影响对外报价</span></div>
          <div id="impOut" class="mt-s"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>字段字典</h3><span class="sub">与 SQLite 库、Excel 模板一致</span></div>
        <div class="card-b" style="padding:0">
          <table style="font-size:12px"><thead><tr><th>表</th><th>关键字段</th><th>说明</th></tr></thead><tbody>
            <tr><td class="b">products</td><td class="mono tiny">code, sku, cat, dim, material, price, moq</td><td class="tiny muted">型号主数据</td></tr>
            <tr><td class="b">codes</td><td class="mono tiny">code, norm, type, pid, conf</td><td class="tiny muted">OE / WVA / 工厂码 / 客户叫法</td></tr>
            <tr><td class="b">vehicles</td><td class="mono tiny">brand, series, model, alias[]</td><td class="tiny muted">车型及别名</td></tr>
            <tr><td class="b">axles</td><td class="mono tiny">brand, model, type, spec, alias[]</td><td class="tiny muted">车桥主数据</td></tr>
            <tr><td class="b">fitments</td><td class="mono tiny">vid, aid, pos, pid, conf, q[]</td><td class="tiny muted">适配关系 + 消歧问题</td></tr>
            <tr><td class="b">tests</td><td class="mono tiny">pid, std, item, result, no</td><td class="tiny muted">试验报告</td></tr>
            <tr><td class="b">leads</td><td class="mono tiny">company, country, need, score, tz</td><td class="tiny muted">询盘线索</td></tr>
          </tbody></table>
          <div class="card-b small muted">配套文件：<b>data/guanying.db</b>（SQLite，可直接给 IT / BI 用）、<b>data/导入模板.xlsx</b>（6 个 sheet）。</div>
        </div>
      </div>
    </div>`;
    const n = $('#impType'); if (n) n.onchange = () => { $('#impOut').innerHTML = ''; };
  }

  /* ================= 用户画像 / 关系网 ================= */
  S.personaId = S.personaId || null;
  function layoutNetwork() {
    const W = 920, H = 580, cx = W / 2, cy = H / 2 - 6;
    const pos = { A17: { x: cx, y: cy } };
    const comms = SOCIAL.communities;
    comms.forEach((c, i) => {
      const ang = -Math.PI / 2 + i * 2 * Math.PI / comms.length;
      const hx = cx + Math.cos(ang) * 195, hy = cy + Math.sin(ang) * 168;
      pos['C:' + c.id] = { x: hx, y: hy, comm: c };
      const members = SOCIAL.personas.filter(p => p.community === c.id);
      members.forEach((p, j) => {
        const a2 = ang + (j - (members.length - 1) / 2) * 0.62;
        const r = 74 + (j % 2) * 40;
        pos[p.id] = { x: hx + Math.cos(a2) * r, y: hy + Math.sin(a2) * r };
      });
    });
    return { pos, W, H, cx, cy };
  }
  function vNetwork() {
    const { pos, W, H } = layoutNetwork();
    const P = SOCIAL.personas;
    const byId = Object.fromEntries(P.map(p => [p.id, p]));
    const edges = SOCIAL.edges.filter(([a, b]) => pos[a] && pos[b]);
    const rOf = f => 6 + Math.sqrt(f) / 55;
    const ranked = P.slice().sort((a, b) => b.intent - a.intent);
    const totalFans = P.reduce((s, p) => s + p.followers, 0);
    const terminals = P.filter(p => /车队|修理厂|配件店|采购|司机/.test(p.type)).length;

    $('#p-network').innerHTML = acquireBar('network') + `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('nw.title')}</h1>
        <div class="muted small">${T('nw.sub')}</div></div>
      <div class="row"><button class="btn sm" data-act="tab" data-id="leads">与询盘池联动 →</button>
        <button class="btn sm primary" data-act="tab" data-id="content">用画像出内容 →</button></div>
    </div>
    <div class="kpis mb">
      <div class="kpi"><div class="n">${P.length}</div><div class="l">已建档账号</div><div class="d">${new Set(P.map(p => p.platform)).size} 个平台 · ${new Set(P.map(p => p.lang)).size} 种语言</div></div>
      <div class="kpi"><div class="n">${(totalFans / 1000).toFixed(0)}k</div><div class="l">粉丝覆盖（去重前）</div><div class="d">按账号粉丝数汇总</div></div>
      <div class="kpi"><div class="n">${terminals}</div><div class="l">终端型账号</div><div class="d">车队 / 修理厂 / 配件店 / 采购</div></div>
      <div class="kpi"><div class="n">${P.filter(p => p.intent >= 75).length}</div><div class="l">高意向（≥75）</div><div class="d">优先私信与寄样</div></div>
      <div class="kpi"><div class="n">${edges.length}</div><div class="l">关注关系</div><div class="d">用于找「关键节点」</div></div>
    </div>
    <div class="split" style="grid-template-columns:1.55fr 1fr">
      <div class="card">
        <div class="card-h"><h3>关系网</h3><span class="sub">点节点看画像；线=关注关系</span>
          <span class="flex1"></span>
          ${SOCIAL.communities.map(c => `<span class="tag" style="background:${c.color}1a;color:${c.color}">${c.name}</span>`).join(' ')}
        </div>
        <div class="card-b" style="padding:8px">
          <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block">
            <rect x="0" y="0" width="${W}" height="${H}" fill="#fbfcfd" rx="8"></rect>
            ${edges.map(([a, b]) => {
              const A = pos[a], B = pos[b];
              const brand = b === 'A17' || a === 'A17';
              return `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}"
                stroke="${brand ? '#f97316' : '#d3d9e1'}" stroke-width="${brand ? 1.1 : .8}" ${brand ? 'stroke-dasharray="3 3"' : ''} opacity="${brand ? .55 : .8}"></line>`;
            }).join('')}
            ${SOCIAL.communities.map(c => {
              const h = pos['C:' + c.id];
              return `<g><circle cx="${h.x}" cy="${h.y}" r="54" fill="${c.color}08" stroke="${c.color}33" stroke-dasharray="2 4"></circle>
                <text x="${h.x}" y="${h.y - 58}" text-anchor="middle" font-size="10" fill="${c.color}" font-weight="700">${c.name} · ${c.langs}</text></g>`;
            }).join('')}
            ${P.map(p => {
              const q = pos[p.id]; if (!q) return '';
              const r = rOf(p.followers);
              const c = p.id === 'A17' ? '#c2410c' : (SOCIAL.communities.find(x => x.id === p.community) || {}).color || '#666';
              return `<g data-act="persona" data-id="${p.id}" style="cursor:pointer">
                <circle cx="${q.x}" cy="${q.y}" r="${r + 3}" fill="#fff"></circle>
                <circle cx="${q.x}" cy="${q.y}" r="${r}" fill="${c}" opacity="${p.id === 'A17' ? .95 : .82}"></circle>
                ${p.intent >= 85 ? `<circle cx="${q.x}" cy="${q.y}" r="${r + 6}" fill="none" stroke="${c}" stroke-width="1" opacity=".45"></circle>` : ''}
                <text x="${q.x}" y="${q.y + r + 10}" text-anchor="middle" font-size="8.5" fill="#5a6472">${esc(p.handle)}</text>
              </g>`;
            }).join('')}
            <text x="${W - 10}" y="${H - 10}" text-anchor="end" font-size="9" fill="#98a1af">圆大小=粉丝量 · 外圈=高意向(≥85) · 橙色虚线=关注品牌号</text>
          </svg>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>按意向度排序</h3><span class="sub">先打谁，一目了然</span></div>
        <div class="card-b" style="padding:6px 10px;max-height:620px;overflow:auto">
          ${ranked.map(p => `<div style="display:flex;gap:9px;align-items:center;padding:8px 4px;border-bottom:1px solid var(--line-2);cursor:pointer" data-act="persona" data-id="${p.id}">
            <div style="width:26px;height:26px;border-radius:50%;background:${(SOCIAL.communities.find(c => c.id === p.community) || {}).color}1a;color:${(SOCIAL.communities.find(c => c.id === p.community) || {}).color};display:grid;place-items:center;font-size:11px;font-weight:700;flex:none">${esc(p.name.slice(0, 1).toUpperCase())}</div>
            <div style="min-width:0;flex:1">
              <div class="b small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div>
              <div class="tiny muted">${esc(p.platform)} · ${esc(p.country)} · ${(p.followers / 1000).toFixed(1)}k 粉</div>
            </div>
            <div style="text-align:right">
              <div class="mono b ${p.intent >= 75 ? 'c-hi' : p.intent >= 55 ? 'c-mid' : 'c-lo'}" style="font-size:13px">${p.intent}</div>
              <div class="tiny muted">${esc(p.type)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function openPersona(id) {
    const p = SOCIAL.personas.find(x => x.id === id); if (!p) return;
    const c = SOCIAL.communities.find(x => x.id === p.community) || {};
    const fans = SOCIAL.edges.filter(e => e[1] === id).map(e => SOCIAL.personas.find(x => x.id === e[0])).filter(Boolean);
    const following = SOCIAL.edges.filter(e => e[0] === id).map(e => SOCIAL.personas.find(x => x.id === e[1])).filter(Boolean);
    const m = p.tags.length ? E.match(p.tags.join(' ')) : null;
    const skus = (p.tags || []).map(t => {
      const v = D.vehicles.find(v => (v.model + ' ' + v.alias.join(' ')).toUpperCase().includes(t.toUpperCase()));
      if (!v) return null;
      const f = (E.fitsByV.get(v.id) || [])[0];
      return f ? { v: v.model, code: f.code, pid: f.pid } : null;
    }).filter(Boolean);
    drawer(`<div><div style="font-size:16px;font-weight:750">${esc(p.name)}</div>
      <div class="tiny muted">${esc(p.handle)} · ${esc(p.platform)} · ${esc(p.country)} · ${esc(p.lang)}</div></div>`,
      `<div class="row wrap-gap" style="gap:8px;margin-bottom:10px">
        ${tag(p.type, 'b')}${tag(c.name || '', 'n')}
        <span class="flex1"></span><span class="muted small">意向度</span><b class="mono" style="font-size:20px">${p.intent}</b>
      </div>
      <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:8px">
        <div class="card" style="padding:8px 10px;box-shadow:none"><div class="tiny muted">粉丝</div><div class="b">${(p.followers / 1000).toFixed(1)}k</div></div>
        <div class="card" style="padding:8px 10px;box-shadow:none"><div class="tiny muted">关注</div><div class="b">${p.following}</div></div>
        <div class="card" style="padding:8px 10px;box-shadow:none"><div class="tiny muted">作品</div><div class="b">${p.posts}</div></div>
        <div class="card" style="padding:8px 10px;box-shadow:none"><div class="tiny muted">互动率</div><div class="b">${p.engage}%</div></div>
      </div>
      <div class="sec-t">画像标签</div>
      <div class="row wrap-gap" style="gap:6px">${(p.tags.length ? p.tags : ['无明确车型']).map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <div class="notice mt-s">${esc(p.note)}</div>
      <div class="sec-t">关系网（粉丝 / 关注）</div>
      <div class="small muted">粉丝：${fans.length ? fans.map(f => esc(f.handle)).join('、') : '—'}</div>
      <div class="small muted mt-s">关注：${following.length ? following.map(f => esc(f.handle)).join('、') : '—'}</div>
      ${skus.length ? `<div class="sec-t">提到车型 → 可推型号</div>
        <table style="font-size:12px"><thead><tr><th>车型</th><th>型号</th><th>报价</th><th></th></tr></thead><tbody>
        ${skus.map(s => `<tr><td>${esc(s.v)}</td><td class="mono b">${esc(s.code)}</td><td class="mono">$${money(E.priceOf(s.pid, 100, customer()))}</td>
          <td><button class="btn xs" data-act="addCart" data-id="${s.pid}">加入</button></td></tr>`).join('')}
        </tbody></table>` : ''}
      <div class="sec-t">推荐动作</div>
      <div class="notice warn">${esc(p.action)}</div>`,
      `<button class="btn" data-act="dmPersona" data-id="${p.id}">生成私信</button>
       <button class="btn primary" data-act="addCart" data-id="${(skus[0] || {}).pid || 'P135'}">加入报价</button>`);
  }

  /* ================= 获客内容 ================= */
  function vContent() {
    const V = SOCIAL.videos;
    const cfg = S.content;
    const pr = E.byId.get(cfg.pid);
    const sc = S.script;
    const plats = [...new Set(V.map(v => v.platform))];
    $('#p-content').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${T('ct.title')}</h1>
        <div class="muted small">${T('ct.sub')}</div></div>
      <div class="row"><span class="tag o">演示数据</span><span class="tag n">接平台 API 后实时刷新</span></div>
    </div>
    <div class="kpis mb">
      <div class="kpi"><div class="n">${V.length}</div><div class="l">热门选题（近 7 天）</div><div class="d">${plats.length} 个平台 · ${new Set(V.map(v => v.lang)).size} 种语言</div></div>
      <div class="kpi"><div class="n">${(V.reduce((s, v) => s + v.views, 0) / 1e6).toFixed(1)}M</div><div class="l">合计播放</div><div class="d">选题侧需求已被验证</div></div>
      <div class="kpi"><div class="n">${V.filter(v => v.model).length}</div><div class="l">可直接挂型号</div><div class="d">选题 → SKU 一对多</div></div>
      <div class="kpi"><div class="n">7</div><div class="l">覆盖语种</div><div class="d">ES/PT/AR/EN/ID/VI/TR</div></div>
    </div>
    <div class="split" style="grid-template-columns:1.3fr 1fr">
      <div class="card">
        <div class="card-h"><h3>热门视频雷达</h3><span class="sub">按语种扒取，判断「那条片子为什么火」</span></div>
        <div class="card-b" style="padding:0;max-height:520px;overflow:auto">
          <table><thead><tr><th>平台 / 语种</th><th>选题</th><th class="right">播放</th><th class="right">互动</th><th>关联型号</th><th></th></tr></thead><tbody>
          ${V.map(v => `<tr>
            <td class="small"><b>${esc(v.platform)}</b><div class="tiny muted">${esc(v.lang)} · ${esc(v.country)}</div></td>
            <td class="small" style="max-width:250px">${esc(v.title)}<div class="tiny muted">${esc(v.angle)} · 趋势 ${esc(v.trend)}</div></td>
            <td class="right mono small">${(v.views / 1000).toFixed(0)}k</td>
            <td class="right small">${((v.likes + v.comments) / v.views * 100).toFixed(1)}%</td>
            <td class="mono tiny">${esc(v.model)}</td>
            <td><button class="btn xs" data-act="useTopic" data-id="${v.id}">用此选题</button></td>
          </tr>`).join('')}
          </tbody></table>
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>脚本生成器</h3><span class="sub">中文分镜 + 本地语言口播</span></div>
        <div class="card-b">
          <div class="grid" style="grid-template-columns:1fr 1fr;gap:8px">
            <div class="field"><label>产品</label><select id="cPid">${D.products.filter(p => (p.appsAll || []).length).slice(0, 60).map(p => `<option value="${p.id}" ${cfg.pid === p.id ? 'selected' : ''}>${esc(p.code)} · ${esc(pCat(p))}</option>`).join('')}</select></div>
            <div class="field"><label>市场</label><input id="cMarket" value="${esc(cfg.market)}"></div>
            <div class="field"><label>语种</label><select id="cLang">${Object.entries(SOCIAL.LANG).map(([k, v]) => `<option value="${k}" ${cfg.lang === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select></div>
            <div class="field"><label>平台</label><select id="cPlat">${['TikTok', 'Instagram', 'YouTube', 'Facebook'].map(x => `<option ${cfg.platform === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
            <div class="field"><label>时长（秒）</label><input id="cSec" type="number" value="${cfg.seconds}"></div>
            <div class="field"><label>核心痛点</label><input id="cPain" value="${esc(cfg.pain)}"></div>
          </div>
          <div class="row mt-s"><button class="btn primary" data-act="genScript">${T('ct.gen')}</button>
            <button class="btn" data-act="copyPrompt">复制 AI 提示词</button></div>
          <div class="tiny muted mt-s">生成的是「可拍的分镜稿 + 可配音的口播 + 一段 AI 提示词」，不是空泛文案；提示词下方可一键跳 Kling AI 出片。</div>
        </div>
      </div>
    </div>
    <div id="scriptOut" class="mt">${sc ? renderScript(sc) : ''}</div>`;
    ['cPid', 'cMarket', 'cLang', 'cPlat', 'cSec', 'cPain'].forEach(id => {
      const n = $('#' + id); if (!n) return;
      n.onchange = n.oninput = () => {
        S.content = { pid: $('#cPid').value, market: $('#cMarket').value, lang: $('#cLang').value, platform: $('#cPlat').value, seconds: Number($('#cSec').value) || 30, pain: $('#cPain').value };
      };
    });
  }
  function renderScript(sc) {
    return `<div class="card" style="border-color:#f6c9a8">
      <div class="card-h"><h3>${esc(sc.title)}</h3><span class="flex1"></span>
        <button class="btn sm" data-act="copyScript">复制全文</button>
        <button class="btn sm primary" data-act="copyPrompt">复制提示词</button></div>
      <div class="card-b">
        <div class="split" style="grid-template-columns:1fr 1fr">
          <div>
            <div class="sec-t" style="margin-top:0">分镜（${sc.board.length} 镜）</div>
            <div class="small" style="line-height:1.9">${sc.board.map(b => `<div style="padding:5px 0;border-bottom:1px dashed var(--line-2)">${esc(b)}</div>`).join('')}</div>
            <div class="sec-t">拍摄清单</div>
            <div class="row wrap-gap" style="gap:5px">${sc.shots.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>
          </div>
          <div>
            <div class="sec-t" style="margin-top:0">口播 / 字幕</div>
            <div style="background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:12.5px;white-space:pre-wrap;line-height:1.7">${esc(sc.voice)}</div>
            <div class="sec-t">话题标签</div>
            <div class="row wrap-gap" style="gap:5px">${sc.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
          </div>
        </div>
        <div class="sec-t">AI 提示词<span class="tiny muted" style="font-weight:400;margin-left:8px">复制后粘到 Kling / 任意大模型，直接出片</span></div>
        <div id="promptBox" style="background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:12.5px;line-height:1.75;white-space:pre-wrap;max-height:160px;overflow:auto">${esc(sc.prompt)}</div>
        <div class="row wrap-gap mt-s">
          <button class="btn sm" data-act="copyPrompt">复制提示词</button>
          <a class="btn sm primary" id="klingGo" href="https://kling.ai/" target="_blank" rel="noopener noreferrer"
             title="${esc(LZ('在 Kling AI 新窗口打开，粘贴提示词出片', 'Open Kling AI, paste the prompt, generate the video'))}">${LZ('去 Kling AI 生成视频', 'Generate video on Kling AI')}<span aria-hidden="true" style="opacity:.75;font-size:11px">↗</span></a>
          <span class="tiny muted">先「复制提示词」，到 Kling 粘贴即可（视频按这个脚本出）</span>
        </div>
      </div>
    </div>`;
  }

  /* ================= 产品详情 ================= */
  function openProduct(pid) {
    const p = E.byId.get(pid); if (!p) return;
    A.track('view', { code: p.code, pid: p.id });
    const mat = D.materials.find(m => m.id === p.material) || D.materials[0];
    const codes = D.codes.filter(c => c.pid === p.id);
    const fits = E.fitsByP.get(p.id) || [];
    const ts = E.testsByP.get(p.id) || [];
    const c = customer();
    drawer(`<div><div style="font-size:16px;font-weight:750">${esc(p.code)}</div>
      <div class="tiny muted">${esc(p.sku)} · ${esc(pCat(p))} · ${esc(p.brand)}</div></div>`,
      `<div class="split" style="grid-template-columns:200px 1fr">
        <div>
          <div class="imgbox">${p.img ? `<img src="${esc(p.img)}">` : ''}</div>
          <div class="tiny muted mt-s">${LZ('图片来源：官网产品页', 'Image: official product page')}</div>
        </div>
        <div>
          <dl class="kv">
            <dt>${LZ('中文名', 'Chinese name')}</dt><dd>${esc(p.nameZh || '')}</dd>
            <dt>${LZ('英文名', 'English name')}</dt><dd>${esc(p.nameEn)}</dd>
            <dt>${LZ('常用车型', 'Common vehicles')}</dt><dd>${(p.appsAll || []).length ? esc(appsJoin(appsOf(p))) : LZ('待补', 'TBD')}</dd>
            <dt>${LZ('规格', 'Spec')}</dt><dd>${esc(p.dim || LZ('待补', 'TBD'))}${p.holes ? ` · ${p.holes} ${LZ('孔', 'holes')}` : ''}</dd>
            <dt>${LZ('材质', 'Material')}</dt><dd>${esc(mName(mat))} μ ${esc(mat.mu)} / ${esc(mat.temp)}</dd>
            <dt>${LZ('部位', 'Position')}</dt><dd>${esc(p.pos || LZ('按适配', 'as fitted'))}</dd>
            <dt>${LZ('包装', 'Packing')}</dt><dd>${esc(packText(p.pack.per))} · ${LZ('毛重', 'GW')} ${p.pack.gw} kg · ${p.pack.cbm} CBM</dd>
            <dt>MOQ</dt><dd>${p.moq}</dd>
            <dt>HS</dt><dd>${esc(p.hs)}</dd>
            <dt>${LZ('参考价', 'Price')}</dt><dd><b>$${money(p.price)}</b> ${LZ('基准', 'base')} · ${LZ('100 套报价', 'at 100 sets')} $${money(E.priceOf(p.id, 100, c))}</dd>
          </dl>
          <div class="mt-s small muted">${esc(p.desc.slice(0, 300))}…</div>
        </div>
      </div>
      <div class="sec-t">${LZ('编码对照', 'Cross reference')}（${codes.length}）</div>
      <table style="font-size:12px"><thead><tr><th>${LZ('编码', 'Code')}</th><th>${LZ('类型', 'Type')}</th><th>${LZ('来源', 'Source')}</th><th>${LZ('置信度', 'Confidence')}</th></tr></thead><tbody>
      ${codes.map(x => `<tr><td class="mono">${esc(x.code)}</td><td>${esc(E.typeLabel(x.type))}</td><td class="tiny muted">${esc(srcI18n(x.source))}</td><td>${confTag(x.conf)}</td></tr>`).join('')}
      </tbody></table>
      <div class="sec-t">${LZ('常用车型', 'Common vehicles')} · ${LZ('按点赞量排序', 'by popularity')}（${fits.length} ${LZ('条适配', 'fits')}）</div>
      <div class="row wrap-gap" style="gap:6px;margin-bottom:6px">${relatedChips(p)}</div>
      ${heatTable(p)}
      ${otherModels(p).length ? `<div class="row wrap-gap" style="gap:6px;margin-top:8px;align-items:center">
        <span class="tiny muted">${LZ('同车型其他型号', 'Same vehicle, other codes')}：</span>
        ${otherModels(p).slice(0, 8).map(([code, pid]) => `<span class="chip" data-act="openProduct" data-id="${pid}">${esc(code)}</span>`).join('')}
      </div>` : ''}
      <div class="sec-t">${LZ('试验报告', 'Test reports')}（${ts.length}）</div>
      ${ts.length ? `<table style="font-size:12px"><thead><tr><th>${LZ('标准', 'Standard')}</th><th>${LZ('项目', 'Item')}</th><th>${LZ('结果', 'Result')}</th><th>${LZ('报告号', 'Report No.')}</th></tr></thead><tbody>
      ${ts.map(t => `<tr><td>${esc(t.std)}</td><td>${esc(t.item)}</td><td>${esc(t.result)}</td><td class="tiny">${esc(t.no)}<div class="muted">${esc(t.lab)}</div></td></tr>`).join('')}
      </tbody></table>` : `<div class="muted small">${LZ('暂无试验报告。', 'No test report yet.')}</div>`}`,
      `<button class="btn" data-act="detailPack" data-id="${p.id}">${LZ('生成资料页', 'Data sheet')}</button>
       <button class="btn" data-act="askPrice" data-id="${p.id}">${LZ('询价', 'Ask price')}</button>
       <button class="btn primary" data-act="addCart" data-id="${p.id}">${LZ('加入报价', 'Add to quote')}</button>`);
  }

  /* ================= 线索详情 ================= */
  function openLead(id) {
    const l = S.leads.find(x => x.id === id); if (!l) return;
    const sc = E.scoreLead(l), t = E.localTime(l.tz);
    const m = E.match(l.needZh || l.need);
    drawer(`<div><div style="font-size:16px;font-weight:750">${esc(l.company)}</div>
      <div class="tiny muted">${esc(l.id)} · ${esc(l.country)} · ${esc(l.src)} · ${esc((l.created || '').slice(0, 16))}</div></div>`,
      `<div class="row wrap-gap" style="gap:8px;margin-bottom:10px">
        ${tag(sc.tier.l, sc.tier.c)}${tag(sc.trading ? '贸易商特征' : sc.terminal ? '终端特征' : '待甄别', sc.trading ? 'n' : 'g')}
        ${tag('当地时间 ' + t.text, t.working ? 'g' : 'n')}
        <span class="flex1"></span><b class="mono" style="font-size:20px">${sc.score}</b>
      </div>
      <div class="sec-t">原始询盘</div>
      <div style="background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:10px;font-size:13px">${esc(l.need)}</div>
      <div class="tiny muted mt-s">中文摘要：${esc(l.needZh || '—')}</div>
      <div class="sec-t">评分依据</div>
      <ul class="list-none small">${sc.reasons.map(r => `<li style="padding:2px 0">· ${esc(r)}</li>`).join('')}</ul>
      <div class="sec-t">自动匹配（依据询盘原文）</div>
      ${m.top ? `<div class="result best" style="margin:0">
        <div class="res-h"><div class="res-img">${m.top.product.img ? `<img src="${esc(m.top.product.img)}">` : ''}</div>
        <div class="res-main"><div class="res-title">${esc(m.top.product.code)} ${tag(Math.round(m.top.score) + ' 分', 'o')}</div>
        <div class="muted small">${esc(m.top.product.nameEn.slice(0, 70))}</div>
        <div class="reasons">${m.top.reasons.map(r => `<div class="reason"><i>✓</i><span>${r}</span></div>`).join('')}</div></div></div>
        ${m.questions.length ? `<div class="qbox" style="margin:0 16px 12px"><div class="t">需确认</div><ul>${m.questions.slice(0, 2).map(q => `<li>${q}</li>`).join('')}</ul></div>` : ''}
      </div>` : '<div class="muted small">原文中没有可识别的车型/车桥/编码，建议用「三步定位法」索要照片。</div>'}
      <div class="sec-t">跟进</div>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>状态</label><select id="lStatus">${['待跟进', '待甄别', '已报价', '已成交', '已放弃'].map(s => `<option ${l.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>下次动作</label><input id="lNext" value="${esc(l.next || '')}"></div>
      </div>
      <div class="row wrap-gap mt-s">
        <button class="btn sm" data-act="replyLead" data-id="${l.id}">生成回复</button>
        <button class="btn sm" data-act="leadToCart" data-id="${l.id}">加入报价</button>
        <button class="btn sm" data-act="saveLead" data-id="${l.id}">保存</button>
      </div>`,
      `<button class="btn" data-act="closeDrawer">关闭</button>`);
  }

  /* ================= 聊天浮窗（消息监听 + 型号提醒） ================= */
  function chatTime() { return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }); }

  function pushChat(silent) {
    if (S.chat.idx >= SOCIAL.chatQueue.length) { toast(CT('queueEnd')); return; }
    const m = SOCIAL.chatQueue[S.chat.idx++];
    const match = E.match(m.text + ' ' + (m.zh || ''));
    const item = { ...m, time: chatTime(), match };
    S.chat.msgs.push(item);
    if (!silent && match.top && S.chat.auto && A.isStaff()) showAlert(item);
    renderChat();
  }

  function showAlert(item) {
    const p = item.match.top.product;
    const box = $('#chatAlert');
    box.innerHTML = `<div class="ca-h"><span class="dot"></span> ${CT('alertTitle')}</div>
      <div class="ca-b"><b>${esc(item.from.split('（')[0])}</b> ${CT('alertAsks')} ${esc(item.match.entities.find(e => e.k === '车型' || e.k === 'vehicle')?.v || item.match.entities.find(e => e.k === '车桥' || e.k === 'axle')?.v || CT('matchedLabel'))}
        <div class="ca-p">→ <b class="mono">${esc(p.code)}</b> · $${money(E.priceOf(p.id, 100, customer()))}${CT('perSet')} · ${esc(p.dim || CT('specPending'))}</div></div>
      <div class="row" style="gap:6px;margin-top:6px"><button class="btn xs primary" data-act="chatAlertGo" data-id="${p.id}">${CT('alertOpen')}</button>
        <button class="btn xs" data-act="chatToggle">${CT('alertOpenSupport')}</button></div>`;
    box.classList.add('on');
    clearTimeout(showAlert._t);
    showAlert._t = setTimeout(() => box.classList.remove('on'), 9000);
    $('#chatBadge').textContent = S.chat.msgs.filter(m => m.match && m.match.top).length;
    $('#chatBadge').style.display = 'inline-block';
  }


  /** 客户端客服：本地规则回答（不联网），能识别型号就报型号和价 */
  function csSay(raw) {
    const text = String(raw || '').trim();
    if (!text) return;
    const zh = I.getLang() === 'zh';
    const t = () => chatTime();
    if (!Array.isArray(S.custMsgs)) S.custMsgs = [];
    /* 记上是谁问的：员工端「待跟进客户」靠 uid 认出这个客户问过价 */
    const _cu = A.me();
    S.custMsgs.push({ from: 'me', text, time: t(), t: Date.now(), uid: (_cu && _cu.role === 'customer') ? _cu.id : '' });

    const m = E.match(text);
    const top = m && m.top;
    const btn = (act, id, label, cls) => `<button class="btn xs ${cls || ''}" data-act="${act}"${id ? ` data-id="${id}"` : ''}>${label}</button>`;

    if (top && top.score >= 55) {
      const p = top.product;
      S.custMsgs.push({
        from: 'bot', time: t(),
        text: CT('replyMatch'),
        card: {
          id: p.id, code: p.code, score: top.score,
          name: pName(p), dim: p.dim,
          price: '$' + money(E.priceOf(p.id, 100, customer())) + CT('perSet')
        }
      });
    } else if (/价|多少钱|报价|price|cost|quote|precio|preço|preco|سعر|цена|harga|giá|ราคา|fiyat|fiyatı/i.test(text)) {
      S.custMsgs.push({
        from: 'bot', time: t(),
        text: CT('replyPrice'),
        acts: btn('askPrice', '', CT('sendInquiry'), 'primary') + btn('tab', 'select', CT('matchFirst'))
      });
    } else if (/现货|库存|交期|多久|发货|stock|lead ?time|delivery|existencia|estoque|disponib|متوفر|наличи|stok|kho|สต็อก/i.test(text)) {
      S.custMsgs.push({
        from: 'bot', time: t(),
        text: CT('replyStock'),
        acts: btn('tab', 'products', CT('viewCatalog'))
      });
    } else {
      S.custMsgs.push({
        from: 'bot', time: t(),
        text: CT('replyFallback'),
        acts: btn('tab', 'select', CT('smartMatch'), 'primary') + btn('askPrice', '', CT('sendInquiry'))
      });
    }
    save();
    renderChat();
    const inp = $('#csInput');
    if (inp) { inp.value = ''; inp.focus(); }
  }

  function renderChat() {
    const zh = I.getLang() === 'zh';
    const msgs = S.chat.msgs;
    const staff = A.isStaff();
    const panel = $('#chatPanel');
    panel.classList.toggle('on', S.chat.open);
    panel.classList.toggle('cust-mode', !staff);
    $('#chatFab').classList.toggle('on', S.chat.open);

    /* 外壳文字：10 种语言 */
    const fab = document.querySelector('#chatFab .fab-txt');
    if (fab) fab.textContent = CT('support');
    const title = $('#chatTitle');
    if (title) title.textContent = CT('support');
    const live = $('#chatLive');
    if (live) live.innerHTML = '<i></i> ' + CT('listening');
    const hbtn = $('#chatHistTxt');
    if (hbtn) hbtn.textContent = CT('history');
    const onl = $('#chatOnline');
    if (onl) onl.innerHTML = '<i></i> ' + CT('online').split('·')[0].trim();
    const chans = $('#chatChans');
    if (chans) { const d = chans.querySelector('.tiny'); if (d) d.textContent = CT('demoReplay'); }
    const ci = $('#csInput');
    if (ci) ci.placeholder = CT('placeholder');
    const sb = document.querySelector('[data-act="csSend"]');
    if (sb) sb.textContent = CT('send');
    const nb = document.querySelector('[data-act="chatNext"]');
    if (nb) nb.textContent = CT('simulate');
    const ab = $('#chatAutoBtn');
    if (ab) ab.textContent = S.chat.auto ? CT('autoOn') : CT('autoOff');
    const cb = document.querySelector('[data-act="chatClear"]');
    if (cb) cb.textContent = CT('clear');

    /* ---- 客户端：问答式客服 ---- */
    if (!staff) {
      $('#chatStat').textContent = CT('online');
      if (!Array.isArray(S.custMsgs)) S.custMsgs = [];
      const msgsC = S.custMsgs;
      const bubbles = msgsC.map(m => {
        const card = m.card ? `<div class="cs-card">
            <div class="cs-c-h"><b class="mono">${esc(m.card.code)}</b><span class="tag g">${Math.round(m.card.score)} ${CT('pts')}</span></div>
            <div class="tiny muted">${esc(m.card.name)} · ${esc(m.card.dim || CT('specPending'))} · ${m.card.price}</div>
            <div class="row" style="gap:6px;margin-top:6px">
              <button class="btn xs primary" data-act="chatAdd" data-id="${m.card.id}">${CT('addQuote')}</button>
              <button class="btn xs" data-act="openProduct" data-id="${m.card.id}">${CT('details')}</button>
            </div>
          </div>` : '';
        const acts = m.acts ? `<div class="row wrap-gap" style="margin-top:6px">${m.acts}</div>` : '';
        return `<div class="cs-msg ${m.from === 'me' ? 'me' : 'bot'}">
          <div class="cs-b">${esc(m.text)}</div>${card}${acts}
          <div class="cs-t">${esc(m.time)}</div>
        </div>`;
      }).join('');
      const greet = msgsC.length ? '' : `<div class="cs-greet">
          <div class="cs-hi">${CT('greetHi')}</div>
          <div class="tiny muted" style="margin-top:4px">${CT('greetSub')}</div>
          <div class="row wrap-gap" style="margin-top:10px">
            <button class="btn xs" data-act="csQuick" data-id="${esc(CT('q1query'))}">${CT('q1label')}</button>
            <button class="btn xs" data-act="csQuick" data-id="${esc(CT('q2query'))}">${CT('q2label')}</button>
          </div>
        </div>`;
      $('#chatBody').innerHTML = `${greet}<div class="cs-thread" id="csThread">${bubbles}</div>`;
      const comp = $('#csCompose');
      if (comp) comp.hidden = false;
      const th = $('#csThread');
      if (th) th.scrollTop = th.scrollHeight;
      return;
    }

    /* ---- 员工端：聊天雷达 ---- */
    { const c = $('#csCompose'); if (c) c.hidden = true; }
    $('#chatStat').textContent = `${msgs.length} ${CT('staffMsgs')} · ${msgs.filter(m => m.match && m.match.top).length} ${CT('staffMatched')}`;
    $('#chatBody').innerHTML = msgs.length ? msgs.slice().reverse().map((m, i) => {
      const hit = m.match && m.match.top;
      const p = hit ? m.match.top.product : null;
      return `<div class="chat-msg">
        <div class="cm-h"><span class="tag b">${esc(m.ch)}</span><b>${esc(m.from)}</b><span class="flex1"></span><span class="tiny muted">${esc(m.time)}</span></div>
        <div class="cm-t">${esc(m.text)}</div>
        ${m.zh ? `<div class="tiny muted">${CT('chinese')}：${esc(m.zh)}</div>` : ''}
        ${hit ? `<div class="chat-suggest">
          <div class="cs-h">${CT('matchedLabel')}：<b class="mono">${esc(p.code)}</b> <span class="tag ${m.match.top.score >= 80 ? 'g' : 'y'}">${Math.round(m.match.top.score)} ${CT('pts')}</span></div>
          <div class="tiny muted">${esc(pName(p))} · ${esc(p.dim || CT('specPending'))} · ${esc(pCat(p))}</div>
          <div class="row" style="gap:6px;margin-top:5px">
            <button class="btn xs primary" data-act="chatAdd" data-id="${p.id}">${CT('addQuote')}</button>
            <button class="btn xs" data-act="chatReply" data-id="${p.id}">${CT('copyReply')}</button>
            <button class="btn xs" data-act="openProduct" data-id="${p.id}">${CT('details')}</button>
          </div>
        </div>` : `<div class="chat-miss">${CT('noMatchText')}
          <div style="margin-top:4px"><button class="btn xs" data-act="chatAskPhoto">${CT('copyPhotoScript')}</button></div></div>`}
      </div>`;
    }).join('') : `<div class="empty" style="padding:30px 12px"><div class="ic">💬</div>${CT('emptyHint')}</div>`;
  }

  /* ================= 获客（搜索 + 内容 同一入口） ================= */
  function acquireBar(active) {
    const b = (k, txt) => `<button class="btn sm ${active === k ? 'primary' : ''}" data-act="tab" data-id="${k}">${txt}</button>`;
    return `<div class="acq-bar">
      <span class="acq-lab">${LZ('获客', 'Acquire')}</span>
      ${b('network', LZ('用户画像', 'Profiles'))}${b('search', LZ('客户搜索', 'Find buyers'))}${b('content', LZ('获客内容', 'Content studio'))}
      <span class="acq-hint">${LZ('一个入口：先看画像 → 再找客户 → 再做内容', 'One entry: profiles → find buyers → make content')}</span>
    </div>`;
  }

  /* ================= 客户搜索 / 编号对照 ================= */
  function vSearch() {
    const box = $('#p-search');
    box.innerHTML = acquireBar('search') + window.SEARCHX.html({ esc, LZ, T });
    const doc = document;
    ['sqMarket', 'sqProd', 'sqType', 'sqNarrow'].forEach(id => {
      const el = doc.getElementById(id);
      if (el) el.onchange = () => { window.SEARCHX.readForm(doc); vSearch(); };
    });
    const ex = doc.getElementById('sqExcl');
    if (ex) ex.onchange = () => { window.SEARCHX.readForm(doc); vSearch(); };
    const xq = doc.getElementById('xrefQ');
    if (xq) xq.onkeydown = e => { if (e.key === 'Enter') ACT.xrefGo(); };
    const inp = doc.getElementById('xrefQ');
    if (inp) inp.onkeydown = e => { if (e.key === 'Enter') ACT.xrefGo(); };
  }
  /* ---- 成交台账 / 业绩总览 ---- */
  function dealCtx() {
    return {
      list: S.deals || [], esc, LZ, me: A.me(), isBoss: A.isBoss(),
      customers: A.customers(), custMsgs: S.custMsgs || [],
      fuMute: S.fuMute || {}, fuFlags: S.fuFlags || {}, fuNotes: S.fuNotes || {},
      fuFilter: S.fuFilter || 'all',
      flags: S.fuFlags || {}, notes: S.fuNotes || {},
      codes: D.products.map(p => p.code)
    };
  }
  function vDeals() {
    $('#p-deals').innerHTML = window.DEALS.htmlDeals(dealCtx());
    const q = id => { const el = $('#' + id); return el ? el.value : ''; };
    const priceOf = code => {
      const p = D.products.find(x => x.code === String(code || '').trim());
      return p ? p.price : '';
    };
    const sync = () => {
      const qty = Number(q('dQty')) || 0, pr = Number(q('dPrice')) || 0;
      const amt = Math.round(qty * pr * 100) / 100;
      const el = $('#dAmount'); if (el && amt) el.value = amt;
    };
    const bind = (id, ev, fn) => { const node = $('#' + id); if (node) node[ev] = fn; };
    bind('dCode', 'onchange', () => { const pr = priceOf(q('dCode')); const el = $('#dPrice'); if (el && pr) { el.value = pr; sync(); } });
    bind('dQty', 'oninput', sync);
    bind('dPrice', 'oninput', sync);
  }
  function vBoss() {
    const ctx = dealCtx();
    /* 老板看得到全部：待跟进客户全表（只读）+ 员工跟进汇总 */
    $('#p-boss').innerHTML = window.DEALS.htmlBoss(ctx) +
      (window.DEALS.htmlFollowups ? '<div class="boss-fu-wrap">' + window.DEALS.htmlFollowups(ctx) + '</div>' : '') +
      (window.DEALS.htmlFollowupBoss ? window.DEALS.htmlFollowupBoss(ctx) : '');
    /* 老板端是只读的：小旗不能点、备注和登记按钮去掉；筛选和查看截图保留 */
    document.querySelectorAll('#p-boss .fu-flag[data-act]').forEach(el => {
      el.removeAttribute('data-act');
      el.style.cursor = 'default';
      el.title = LZ('员工标的紧急度（老板只读）', 'Staff-set urgency (read-only)');
    });
    ['fuNote', 'fuDeal', 'fuContact'].forEach(a => {
      document.querySelectorAll('#p-boss [data-act="' + a + '"]').forEach(el => el.remove());
    });
  }

  /** 只重绘「待跟进客户」卡片，不整页刷新（保住滚动位置和输入焦点） */
  function renderFollowupsInPlace() {
    /* 老板端整页由 vBoss 统一渲染（含只读处理），直接重跑它 */
    if (S.tab === 'boss') { vBoss(); return; }
    const card = document.querySelector('.fu-card');
    if (!card) { render(); return; }
    const html = window.DEALS.htmlFollowups(dealCtx());
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const fresh = tmp.firstElementChild;
    if (fresh) card.replaceWith(fresh);
  }

  function vRedfox() {
    const box = $('#p-redfox');
    const render = () => vRedfox();
    box.innerHTML = window.REDFOX.html({ esc, LZ, T });
    const k = $('#rfKey');
    if (k) k.onchange = () => window.REDFOX.setKey(k.value.trim());
  }

  function vXref() {
    $('#p-xref').innerHTML = window.XREF.html({ esc, LZ, T });
    const box = $('#xrefQ');
    if (box) {
      box.onkeydown = e => { if (e.key === 'Enter') ACT.xrefGo(); };
      if (!window.__xrefFocused) { box.focus(); window.__xrefFocused = true; }
    }
  }

  /* ================= 交互动作 ================= */
  /** 体验版员工端：只读，不允许发送 / 导入 / 改数据 */
  const DEMO_BLOCK = new Set(['sendCustomer', 'pushLead', 'newFit', 'saveFit', 'confirmFit', 'runImport', 'resetData', 'saveQuote', 'priceSend', 'saveNewLead', 'saveLead', 'dealAdd', 'dealSet', 'dealDel', 'dealTo', 'dealToQuote', 'fuFlagCycle', 'fuSaveNote']);

  const ACT = {
    /** 首屏「选购」下拉 */
    heroPick() {
      const d = $('#heroPick'); if (!d) return;
      const open = d.classList.toggle('open');
      const t = d.querySelector('.hero-pick-t');
      if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
    navDrop() {
      const d = $('#navDrop'); if (!d) return;
      const open = d.classList.toggle('open');
      const t = d.querySelector('.nav-drop-t');
      if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    },
    tab(id) {
      if (!allowedTab(id)) { toast(LZ('这一页是员工端的', 'Staff only')); return; }
      S.tab = id; navOpen = ''; render();
    },
    openGate() { openGate(); },
    closeGate() { closeGate(); if (window.__askLang) { window.__askLang = false; setTimeout(openLang, 40); } },
    gateRole(id) { gateRole = (id === 'staff' || id === 'boss') ? id : 'customer'; renderGate(); },
    gateDemo(role) {
      const r = A.loginDemo(role === 'boss' ? 'boss' : role === 'staff' ? 'staff' : 'customer');
      closeGate();
      applySession();
      if (r.user.role === 'boss') { toast(LZ('体验老板端已开启：可看业绩，不能改', 'Demo owner on: view only')); }
      else toast(r.user.role === 'staff'
        ? LZ('体验员工端已开启：可看，不能改', 'Demo staff on: view only')
        : LZ('体验版已开启：数据只保存在本机', 'Demo mode: data stays on this device'));
      if (window.__askLang) { window.__askLang = false; setTimeout(openLang, 40); }
    },
    gateLogin() {
      const v = id => { const el = $('#' + id); return el ? el.value : ''; };
      const area = gateRole;
      const r = A.login(area === 'boss'
        ? { role: 'boss', code: v('gCode'), name: v('gName'), value: v('gValue') }
        : area === 'staff'
        ? { role: 'staff', code: v('gCode'), name: v('gName'), value: v('gValue') }
        : { role: 'customer', type: v('gType') || 'WhatsApp', value: v('gValue'), name: v('gName'), company: v('gCompany'), country: v('gCountry') });
      if (!r.ok) { const e = $('#gErr'); if (e) e.textContent = r.msg; return; }
      closeGate();
      applySession();
      toast(roleName(r.user));
      if (window.__askLang) { window.__askLang = false; setTimeout(openLang, 40); }
    },
    logout() { A.logout(); applySession(); renderGate(); toast(LZ('已退出登录', 'Signed out')); },
    openCustomer(id) { openCustomer(id); },
    sendCustomer(id) {
      const u = A.customers().find(x => x.id === id);
      if (!u) return;
      const ta = $('#sendMsg');
      const text = (ta ? ta.value : '') || '';
      const url = A.sendUrl(u, text);
      if (!url) { toast(LZ('这个联系方式没有可直接打开的 App', 'No direct app for this contact')); return; }
      A.setTag(u.id, LZ('已联系', 'Contacted'));
      window.open(url, '_blank');
      toast(LZ('已打开 ' + u.contact.type + '，确认内容后发送', 'Opened ' + u.contact.type + ' — review and send'));
    },
    pushLead(id) {
      const u = A.customers().find(x => x.id === id);
      if (!u) return;
      if (S.leads.some(l => l.contact === u.contact.value)) { toast(LZ('已经在询盘池里了', 'Already in leads')); return; }
      const st = A.stats(u);
      const q = (st.events.find(e => e.d && e.d.q) || { d: {} }).d.q || '';
      S.leads.push({
        id: 'L-' + Date.now(), created: new Date().toISOString().slice(0, 16).replace('T', ' '),
        company: u.company || u.name, country: u.country || '—', src: LZ('客户端登录', 'Customer portal') + ' · ' + u.contact.type,
        need: q, needZh: q, contact: u.contact.value, tz: 'Asia/Shanghai', status: '待跟进', owner: '未分配',
        product: [], score: st.score
      });
      save(); renderNav(); toast(LZ('已加入询盘池', 'Added to leads'));
    },
    openCat(cat) {
      S.filters.cat = cat;
      S.tab = 'products';
      render();
    },
    openProductByCode(code) {
      const p = D.products.find(x => x.code === code);
      if (p) { openProduct(p.id); return; }
      const c = D.codes.find(x => x.code === code);
      if (c && E.byId.get(c.pid)) openProduct(c.pid); else toast(LZ('没有这个型号', 'No such part'));
    },
    openLang() { openLang(); },
    /** 导航分组下拉：同一时间只开一个，再点同一个收起来 */
    navGroup(key) {
      navOpen = (navOpen === key) ? '' : key;
      renderNav();
    },
    pickLang(code) {
      I.setLang(code);
      applyLangChrome();
      renderLangGrid();
      renderNav();
      renderChat();
      render();
    },
    langConfirm() {
      closeLang();
      try {
        if ($('#langRemember') && $('#langRemember').checked) localStorage.setItem('gy_lang_remember', '1');
        else localStorage.setItem('gy_lang_remember', '0');
      } catch (e) { }
      render();
      toast(I.getLang() === 'zh' ? '界面语言：中文' : 'Language: ' + I.meta().native);
    },
    heroMatch() {
      const el = $('#heroQ');
      const v = ((el && el.value) || '').trim();
      if (!v) { toast('先输入车型、车桥或旧件编码'); if (el) el.focus(); return; }
      S.q = v; S.tab = 'select'; doMatch(v);
    },
    example(id) { S.tab = 'select'; doMatch(id); },
    doMatch() { doMatch(); },
    clearMatch() { S.q = ''; S.match = null; vSelect(); },
    addCart(pid) {
      const p = E.byId.get(pid); if (!p) return;
      const qtyEl = $('#qty-' + pid);
      const qty = qtyEl ? Math.max(1, Number(qtyEl.value) || 100) : 100;
      const hit = S.cart.find(x => x.pid === pid);
      if (hit) hit.qty += qty; else S.cart.push({ pid, qty, mat: p.material });
      A.track('addCart', { code: p.code, pid: p.id });
      save(); toast(`已加入 ${p.code} × ${qty}`); renderNav();
      if (S.tab === 'quote' || S.tab === 'pack') render();
    },
    rmCart(pid) { S.cart = S.cart.filter(x => x.pid !== pid); save(); render(); },
    clearCart() { S.cart = []; save(); render(); },
    setQty(idx) { }, // handled via change 事件
    openProduct(pid) { openProduct(pid); },
    closeDrawer() { closeDrawer(); },
    detailPack(pid) {
      const p = E.byId.get(pid);
      modal('产品资料页预览', `<div style="background:#fff">${E.docProduct(p, { customer: customer() })}</div>`,
        `<button class="btn" data-act="closeModal">关闭</button><button class="btn primary" data-act="printNow">打印 / 另存 PDF</button>`, true);
    },
    printNow() { const html = $('#modalBody').innerHTML; closeModal(); printHTML(html); },
    closeModal() { closeModal(); },
    printQuote() {
      const rows = cartRows();
      if (!rows.length) { toast('先加入型号'); return; }
      const c = customer();
      const html = E.docQuote({
        customer: c, items: rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })),
        no: S.quoteMeta.no || autoNo(), date: S.quoteMeta.date, valid: '30 days',
        incoterm: S.quoteMeta.incoterm, pay: S.quoteMeta.pay
      });
      A.track('quote', {});
      modal('报价单预览', `<div style="background:#fff">${html}</div>`,
        `<button class="btn" data-act="closeModal">关闭</button><button class="btn primary" data-act="printNow">打印 / 另存 PDF</button>`, true);
    },
    printPack() {
      const rows = cartRows();
      if (!rows.length) { toast('先加入型号'); return; }
      const html = E.docPack({ customer: customer(), items: rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })), no: S.quoteMeta.no || autoNo(), date: S.quoteMeta.date });
      A.track('pack', {});
      modal('资料包预览（多页）', `<div style="background:#fff">${html}</div>`,
        `<button class="btn" data-act="closeModal">关闭</button><button class="btn primary" data-act="printNow">打印 / 另存为 PDF</button>`, true);
    },
    /** 报价：逐个型号改单价 → 发给客户 */
    priceOpen() {
      const rows = cartRows();
      if (!rows.length) { toast(LZ('先把型号加入报价，再报价', 'Add a part to the quote first')); return; }
      const c = customer();
      const calc = E.quoteCalc(rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })), c);
      PRICE_ROWS = calc.rows.map(r => ({ ...r, price: r.unit }));
      const live = () => {
        let amt = 0;
        PRICE_ROWS.forEach((r, i) => {
          const el = $('#pp' + i);
          const v = el ? Math.max(0, Number(el.value) || 0) : r.price;
          const st = $('#pst' + i); if (st) st.textContent = '$' + money(Math.round(v * r.qty * 100) / 100);
          amt += v * r.qty;
        });
        const tot = $('#ppTotal');
        if (tot) tot.textContent = '$' + money(Math.round((amt + calc.freight) * 100) / 100);
      };
      modal(LZ('报价给客户', 'Send price'),
        `<div class="pp-hint">${LZ('单价已按阶梯价填好，可以逐个改。改完点「发给客户」，他在「客服解答」里能看到这张报价。', 'Prices are filled from your tiers — edit any line, then send. The customer sees it in their Support panel.')}</div>
        <table class="pp-tbl"><thead><tr>
          <th>${LZ('编码', 'Code')}</th><th class="r">${LZ('数量', 'Qty')}</th><th class="r">${LZ('原单价', 'List')}</th>
          <th class="r">${LZ('你的报价', 'Your price')}</th><th class="r">${LZ('小计', 'Subtotal')}</th>
        </tr></thead><tbody>
        ${PRICE_ROWS.map((r, i) => `<tr>
          <td class="mono b">${esc(r.product.code)}</td>
          <td class="r mono">${r.qty}</td>
          <td class="r mono muted">$${money(r.unit)}</td>
          <td class="r"><span class="pp-edit"><span class="pp-cur">$</span><input id="pp${i}" class="pp-in" type="number" min="0" step="0.01" value="${r.price}"></span></td>
          <td class="r mono b" id="pst${i}">$${money(Math.round(r.price * r.qty * 100) / 100)}</td>
        </tr>`).join('')}
        </tbody></table>
        <div class="pp-sum">
          <div class="pp-item"><span class="k">${LZ('运费（另计）', 'Freight (extra)')}</span><b class="mono">$${money(calc.freight)}</b></div>
          <span class="pp-vline"></span>
          <div class="pp-item pp-total"><span class="k">${LZ('合计', 'Total')}</span><b class="mono" id="ppTotal"></b></div>
        </div>
        <div class="field" style="margin-top:14px"><label>${LZ('备注（客户能看到）', 'Note (customer sees it)')}</label>
          <input id="ppNote" placeholder="${LZ('如：价格 30 天有效，FOB 上海', 'e.g. valid 30 days, FOB Shanghai')}"></div>
        <div class="pp-cust">${LZ('客户：', 'Customer: ')}${esc(c.name)} · ${LZ('报价单号：', 'Quote No. ')}${esc(S.quoteMeta.no || autoNo())}</div>`,
        `<button class="btn" data-act="closeModal">${LZ('取消', 'Cancel')}</button>
         <button class="btn primary lg" data-act="priceSend">${LZ('发给客户', 'Send to customer')}</button>`);
      PRICE_ROWS.forEach((r, i) => { const el = $('#pp' + i); if (el) el.oninput = live; });
      live();
    },
    priceSend() {
      const rows = PRICE_ROWS;
      if (!rows || !rows.length) { toast(LZ('没有可报价的型号', 'Nothing to price')); return; }
      const items = rows.map((r, i) => {
        const el = $('#pp' + i);
        const p = Math.max(0, Number(el ? el.value : r.price) || 0);
        return { pid: r.product.id, qty: r.qty, mat: r.mat, price: Math.round(p * 100) / 100 };
      });
      const c = customer();
      const calc = E.quoteCalc(items.map(it => ({ pid: it.pid, qty: it.qty, mat: it.mat })), c);
      const amount = Math.round(items.reduce((s, it) => s + it.price * it.qty, 0) * 100) / 100;
      const total = Math.round((amount + calc.freight) * 100) / 100;
      const note = ($('#ppNote') || {}).value || '';
      const no = S.quoteMeta.no || autoNo();
      S.quotes.push({
        id: 'Q' + Date.now(), no, customer: c.name, customerId: c.id, total, amount, freight: calc.freight,
        date: S.quoteMeta.date, items, note, sent: true
      });
      S.quoteMeta.no = '';
      if (!Array.isArray(S.custMsgs)) S.custMsgs = [];
      S.custMsgs.push({
        from: 'bot', time: chatTime(),
        text: LZ(`报价单 ${no}：${items.length} 个型号，合计 $${money(total)}（含运费 $${money(calc.freight)}）。${note ? '备注：' + note : ''}`,
          `Quotation ${no}: ${items.length} items, total $${money(total)} (freight $${money(calc.freight)}). ${note ? 'Note: ' + note : ''}`)
      });
      save();
      closeModal();
      vQuote();
      modal(LZ('报价已发给客户', 'Price sent to the customer'), `<div style="text-align:center;padding:8px 0">
        <div style="font-size:30px">✅</div>
        <div style="font-weight:700;font-size:15px;margin:8px 0">${LZ('报价已发给客户', 'Price sent to the customer')}</div>
        <div class="mono" style="font-size:20px;letter-spacing:1px">${esc(no)}</div>
        <div class="small muted" style="margin-top:8px">${esc(c.name)} · ${LZ('合计', 'Total')} <b>$${money(total)}</b></div>
        <div class="tiny muted" style="margin-top:10px">${LZ('客户登录后，在右下角「客服解答」里能看到这条报价。', 'The customer sees it in the Support panel after login.')}</div></div>`,
        `<button class="btn primary" data-act="closeModal">${LZ('知道了', 'Got it')}</button>`);
      toast(LZ('报价 ' + no + ' 已发送', 'Quote ' + no + ' sent'));
      PRICE_ROWS = [];
    },
    askPrice(pid) {
      const items = pid ? [{ pid, qty: 100 }] : cartRows().map(r => ({ pid: r.pid, qty: r.qty }));
      if (!items.length) { toast(LZ('先把型号加入报价，再来询价', 'Add a part to the quote first')); return; }
      RQ = items;
      const rows = items.map((it, i) => {
        const p = D.products.find(x => x.id === it.pid);
        return `<tr><td class="mono b">${esc(p.code)}</td><td>${esc(pCat(p))}</td><td>${esc(p.dim || '—')}</td>
          <td><input id="rqQ${i}" type="number" min="1" step="1" value="${it.qty}" style="width:96px"></td></tr>`;
      }).join('');
      modal(`<div class="small muted mb">${LZ('填个数量就行，我们按阶梯价回你，不用猜型号。', 'Just give us a quantity; we reply with tier pricing.')}</div>
        <table style="font-size:12.5px"><thead><tr><th>型号</th><th>类型</th><th>规格</th><th>${LZ('数量','Qty')}</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="field" style="margin-top:10px"><label>${LZ('备注 / 车型 / 目的地','Note / vehicle / destination')}</label>
        <input id="rqNote" placeholder="${LZ('如：HOWO A7 后片，发墨西哥', 'e.g. HOWO A7 rear pads, to Mexico')}"></div>`,
        `<button class="btn" data-act="closeModal">${LZ('取消','Cancel')}</button>
         <button class="btn primary" data-act="sendInquiry">${LZ('提交询价','Send inquiry')}</button>`);
    },
    sendInquiry() {
      const items = (RQ || []).map((it, i) => {
        const el = $('#rqQ' + i);
        return { pid: it.pid, qty: Math.max(1, parseInt(el ? el.value : it.qty, 10) || 1) };
      });
      const note = ($('#rqNote') || {}).value || '';
      const r = A.submitInquiry(items, note);
      if (!r.ok) { toast(r.msg || '提交失败'); return; }
      const u = A.me();
      closeModal();
      modal(`<div style="text-align:center;padding:8px 0">
        <div style="font-size:30px">✅</div>
        <div style="font-weight:700;font-size:15px;margin:8px 0">${LZ('询价已提交','Inquiry sent')}</div>
        <div class="mono" style="font-size:20px;letter-spacing:1px">${esc(r.no)}</div>
        <div class="small muted" style="margin-top:8px">${LZ('我们会在 2 小时内回复到这个联系方式：','We will reply within 2 hours to:')}<br><b>${esc(u.contact.value)}</b></div>
        <div class="tiny muted" style="margin-top:12px">${LZ('数量按阶梯价计算，运费按目的地另算。','Tier pricing applies; freight depends on destination.')}</div></div>`,
        `<button class="btn primary" data-act="closeModal">${LZ('知道了','Got it')}</button>`);
      toast(LZ('询价 ' + r.no + ' 已提交', 'Inquiry ' + r.no + ' sent'));
      A.track('inquiry', { no: r.no, n: items.length });
      RQ = null;
    },
    loadInquiry(no) {
      const q = A.inquiries().find(x => x.no === no);
      if (!q) { toast('询价单不存在'); return; }
      S.cart = q.items.map(it => ({ pid: it.pid, qty: it.qty, mat: (D.products.find(p => p.id === it.pid) || {}).material }));
      save(); ACT.tab('quote');
      toast(LZ('已载入 ' + q.items.length + ' 个型号，可直接生成报价', 'Loaded ' + q.items.length + ' items'));
    },
    async zipPack() {
      const rows = cartRows();
      if (!rows.length) { toast('先加入型号'); return; }
      const no = S.quoteMeta.no || autoNo();
      toast(LZ('正在打包，含图片…', 'Packing, including images…'));
      const files = await E.packFiles({ customer: customer(), items: rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })), no, date: S.quoteMeta.date });
      A.track('download', {});
      E.download(E.makeZip(files), `${no}_资料包.zip`);
      const imgs = files.filter(f => f.name.startsWith('img/')).length;
      toast(LZ(`ZIP 已生成：${files.length} 个文件（含 ${imgs} 张图）`, `ZIP ready: ${files.length} files, ${imgs} images`));
    },
    saveQuote() {
      const rows = cartRows(); if (!rows.length) { toast('先加入型号'); return; }
      const c = customer(), calc = E.quoteCalc(rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })), c);
      const q = { id: 'Q' + Date.now(), no: S.quoteMeta.no || autoNo(), customer: c.name, total: calc.total, date: S.quoteMeta.date, items: rows.map(r => ({ pid: r.pid, qty: r.qty, mat: r.mat })) };
      S.quotes.push(q); S.quoteMeta.no = ''; save(); vQuote(); toast('已保存 ' + q.no);
    },
    loadQuote(id) {
      const q = S.quotes.find(x => x.id === id); if (!q) return;
      S.cart = q.items.map(i => ({ ...i })); S.quoteMeta.no = q.no; save(); render(); toast('已载入 ' + q.no);
    },
    newFit() {
      modal('新增适配关系', `
        <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
          <div class="field"><label>车型</label><select id="nfV">${D.vehicles.map(v => `<option value="${v.id}">${esc(v.brand + ' ' + v.series + ' ' + v.model)}</option>`).join('')}</select></div>
          <div class="field"><label>车桥（可空）</label><select id="nfA"><option value="">按旧件确认</option>${D.axles.map(a => `<option value="${a.id}">${esc(a.brand + ' ' + a.model)}</option>`).join('')}</select></div>
          <div class="field"><label>部位</label><select id="nfP"><option>后</option><option>前</option></select></div>
          <div class="field"><label>型号（编码）</label><input id="nfC" placeholder="如 CA9T R"></div>
          <div class="field"><label>适配类型</label><select id="nfF"><option>OE 替代</option><option>通用</option><option>替代</option><option>原厂配套</option></select></div>
          <div class="field"><label>置信度</label><select id="nfConf"><option>中</option><option>高</option><option>低</option><option>已确认</option></select></div>
        </div>
        <div class="field mt-s"><label>消歧问题（一行一条）</label><textarea id="nfQ" placeholder="后桥是 457 还是 485？"></textarea></div>
        <div class="notice mt-s">新增关系默认进入待复核队列；「已确认」需有实车/试验依据。</div>`,
        `<button class="btn" data-act="closeModal">取消</button><button class="btn primary" data-act="saveFit">保存</button>`);
    },
    saveFit() {
      const code = $('#nfC').value.trim();
      if (!code) { toast('请填写型号编码'); return; }
      const pid = (E.codeFlat.find(c => E.norm(c.code) === E.norm(code)) || {}).pid;
      if (!pid) { toast('库里没有这个编码：' + code); return; }
      const f = {
        id: 'D' + Date.now(), vid: $('#nfV').value, aid: $('#nfA').value || null, pos: $('#nfP').value,
        pid, fit: $('#nfF').value, conf: $('#nfConf').value, src: '销售/研发手动录入',
        q: $('#nfQ').value.split('\n').map(s => s.trim()).filter(Boolean)
      };
      S.draftFits.push(f);
      const v = D.vehicles.find(x => x.id === f.vid), a = D.axles.find(x => x.id === f.aid);
      D.fitments.push({ ...f, code, vName: `${v.brand} ${v.series} ${v.model}`, aName: a ? `${a.brand} ${a.model}` : '按旧件确认' });
      save(); closeModal(); render(); toast('已加入待复核队列');
    },
    confirmFit(id) {
      const f = D.fitments.find(x => x.id === id); if (!f) return;
      f.conf = '已确认'; save();
      const v = D.vehicles.find(x => x.id === f.vid);
      if (v) v.fitCount = D.fitments.filter(x => x.vid === v.id).length;
      render(); toast('已确认为「已确认」');
    },
    copyAnswer(pid) {
      const p = E.byId.get(pid); if (!p) return;
      const fs = E.fitsByP.get(p.id) || [];
      const txt = `型号：${p.code}\n规格：${p.dim || '按旧件核对'}\n材质：${D.materials.find(m => m.id === p.material).name}\n适配：${fs.slice(0, 3).map(f => f.vName + '/' + f.aName).join('；') || '按旧件确认'}\n报价：$${money(E.priceOf(p.id, 100, customer()))}/套（100 套，FOB）\n\n如需确认：请拍旧片正面 + 侧面靠卷尺 + 车桥铭牌各一张，2 小时内回复准确型号。`;
      navigator.clipboard?.writeText(txt).then(() => toast('话术已复制'), () => toast('复制失败，请手动选择'));
    },
    openLead(id) { openLead(id); },
    leadMatch(id) { const l = S.leads.find(x => x.id === id); if (l) { S.tab = 'select'; doMatch(l.needZh || l.need); } },
    leadToCart(id) {
      const l = S.leads.find(x => x.id === id); if (!l) return;
      const m = E.match(l.needZh || l.need);
      if (m.top) { ACT.addCart(m.top.pid); closeDrawer(); }
    },
    saveLead(id) {
      const l = S.leads.find(x => x.id === id); if (!l) return;
      l.status = $('#lStatus').value; l.next = $('#lNext').value;
      save(); closeDrawer(); render(); toast('已保存');
    },
    replyLead(id) {
      const l = S.leads.find(x => x.id === id); if (!l) return;
      const m = E.match(l.needZh || l.need);
      const v = m.parsed.vehicle;
      const tpl = D.templates[0];
      const body = tpl.body
        .replace('{{contact}}', l.contact)
        .replace('{{vehicle}}', v ? `${v.brand} ${v.series} ${v.model}` : (l.needZh || '').slice(0, 30))
        .replace('{{axleCount}}', v ? String(new Set((E.fitsByV.get(v.id) || []).map(f => f.aid)).size || 1) : '2')
        .replace('{{owner}}', l.owner || 'Sales');
      modal('回复话术 · ' + l.company, `<div class="small muted mb">可直接复制到 WhatsApp / 邮件。已按该客户询盘自动填充车型与桥型数量。</div>
        <textarea style="min-height:260px;font-size:13px" id="replyBox">${esc(body)}</textarea>`,
        `<button class="btn" data-act="closeModal">关闭</button><button class="btn primary" data-act="copyReply">复制</button>`);
    },
    copyReply() {
      const t = $('#replyBox');
      navigator.clipboard?.writeText(t.value).then(() => toast('已复制'), () => toast('复制失败'));
    },
    newLead() {
      modal('录入询盘', `<div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
        <div class="field"><label>公司</label><input id="nlCo" placeholder="如 Transportes del Norte"></div>
        <div class="field"><label>国家</label><input id="nlCo2" placeholder="墨西哥"></div>
        <div class="field"><label>来源</label><select id="nlSrc">${['官网表单', 'WhatsApp', 'Facebook 评论', 'LinkedIn', '海关数据', '展会名片', '阿里巴巴询盘', '邮件'].map(s => `<option>${s}</option>`).join('')}</select></div>
        <div class="field"><label>联系人</label><input id="nlCt" placeholder="姓名（职位）"></div>
        <div class="field"><label>时区</label><select id="nlTz">${['Asia/Shanghai', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Jakarta', 'Asia/Ho_Chi_Minh', 'Asia/Kolkata', 'America/Mexico_City', 'America/Santiago', 'America/Lima', 'America/Bogota', 'Europe/Berlin', 'Africa/Lagos'].map(s => `<option>${s}</option>`).join('')}</select></div>
        <div class="field"><label>负责人</label><input id="nlOw" value="Sophia"></div>
      </div>
      <div class="field mt-s"><label>询盘原文</label><textarea id="nlNeed" placeholder="粘贴客户原话，系统会自动识别车型/车桥/数量"></textarea></div>
      <div class="notice mt-s">保存后自动评分，并识别是终端还是贸易商。</div>`,
        `<button class="btn" data-act="closeModal">取消</button><button class="btn primary" data-act="saveNewLead">保存并评分</button>`);
    },
    saveNewLead() {
      const need = $('#nlNeed').value.trim();
      if (!need) { toast('请填写询盘原文'); return; }
      const l = {
        id: 'L-' + String(Date.now()).slice(-6), created: new Date().toISOString().slice(0, 16).replace('T', ' '),
        src: $('#nlSrc').value, company: $('#nlCo').value || '（未命名）', contact: $('#nlCt').value || '—',
        country: $('#nlCo2').value || '—', tz: $('#nlTz').value, need, needZh: need.slice(0, 80),
        status: '待跟进', score: 0, owner: $('#nlOw').value, next: '首次回复', nextDate: new Date().toISOString().slice(0, 10), product: []
      };
      const m = E.match(need);
      l.product = m.top ? [m.top.product.code] : [];
      l.score = E.scoreLead(l).score;
      S.leads.push(l); save(); closeModal(); S.tab = 'leads'; render(); toast('已录入，评分 ' + l.score);
    },
    packCfg(k) { S.packCfg[k] = !S.packCfg[k]; vPack(); },
    exportProducts() {
      const rows = [['code', 'sku', 'cat', 'nameEn', 'dim', 'material', 'brand', 'moq', 'pack', 'price', 'hs']]
        .concat(D.products.map(p => [p.code, p.sku, p.cat, p.nameEn, p.dim, p.material, p.brand, p.moq, p.pack.per, p.price, p.hs]));
      E.download(new Blob(['\ufeff' + E.csv(rows)], { type: 'text/csv' }), '冠英产品目录.csv');
    },
    exportJson() {
      const blob = new Blob([JSON.stringify({ meta: D.meta, stats: D.stats, products: D.products, codes: D.codes, vehicles: D.vehicles, axles: D.axles, fitments: D.fitments, tests: D.tests, leads: S.leads, quotes: S.quotes }, null, 1)], { type: 'application/json' });
      E.download(blob, 'guanying-snapshot.json');
    },
    resetData() {
      if (!confirm('将清空本机修改（线索、报价、手动适配），恢复默认数据。继续？')) return;
      localStorage.removeItem(KEY); location.reload();
    },
    /* ---- 画像 / 内容 ---- */
    persona(id) { openPersona(id); },
    dmPersona(id) {
      const p = SOCIAL.personas.find(x => x.id === id); if (!p) return;
      const sku = (p.tags[0] || 'HOWO1');
      const txt = `Hi ${p.name.split(' ')[0]},\n\nI saw your post about ${p.tags.join(' / ') || 'brake pads'} — that is exactly what we make.\n\nWe are KOOYING, a brake pad factory in China (IATF 16949, ECE R90 for part of the range). For ${sku} we can offer $${money(E.priceOf((E.codeFlat.find(c => E.norm(c.code) === E.norm(sku)) || {}).pid || D.products[0].id, 100, customer()))}/set at 100 sets.\n\nIf you send a photo of the old pad next to a ruler, I will confirm the exact code within 2 hours — no need to guess the model.\n\nWould you like our catalog + test report?\n\nBest,\n${p.country === '中国' ? 'KOOYING Team' : 'Sophia | ZHEJIANG KOOYING'}`;
      modal('私信草稿 · ' + p.name, `<div class="small muted mb">按该账号的语种/市场/关注车型生成，可直接改。演示账号数据，接平台 API 后可自动带入最近作品。</div>
        <textarea style="min-height:280px;font-size:13px" id="dmBox">${esc(txt)}</textarea>`,
        `<button class="btn" data-act="closeModal">关闭</button><button class="btn primary" data-act="copyDm">复制</button>`);
    },
    copyDm() { const t = $('#dmBox'); navigator.clipboard?.writeText(t.value).then(() => toast('已复制'), () => toast('复制失败')); },
    useTopic(vid) {
      const v = SOCIAL.videos.find(x => x.id === vid); if (!v) return;
      const hit = E.codeFlat.find(c => E.norm(c.code) === E.norm(v.model));
      S.content.market = v.country; S.content.lang = v.lang; S.content.platform = v.platform;
      if (hit) S.content.pid = hit.pid;
      S.tab = 'content'; genScript(); toast('已按选题生成脚本');
    },
    genScript() {
      const cfg = S.content;
      S.script = SOCIAL.makeScript({ product: E.byId.get(cfg.pid) || D.products[0], lang: cfg.lang, platform: cfg.platform, market: cfg.market, pain: cfg.pain, seconds: cfg.seconds });
      if (S.tab === 'content') { vContent(); setTimeout(() => $('#scriptOut')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
    },
    copyPrompt() {
      const sc = S.script || (genScript(), S.script);
      navigator.clipboard?.writeText(sc.prompt).then(() => toast('AI 提示词已复制，可粘贴到任意大模型'), () => toast('复制失败'));
    },
    copyScript() {
      const sc = S.script; if (!sc) return;
      const txt = `${sc.title}\n\n【中文分镜】\n${sc.board.join('\n')}\n\n【口播】\n${sc.voice}\n\n【拍摄清单】\n${sc.shots.join('、')}\n\n【标签】\n${sc.tags.join(' ')}`;
      navigator.clipboard?.writeText(txt).then(() => toast('脚本已复制'), () => toast('复制失败'));
    },
    /* ---- 聊天浮窗 ---- */
    csSend() { csSay($('#csInput') ? $('#csInput').value : ''); },
    sqBuild() { window.SEARCHX.readForm(document); vSearch(); },
    sqCopy(id) { window.SEARCHX.copy(+id); },
    sqCopyAll() { window.SEARCHX.copyAll(); },
    sqOpen(id) { const [i, eng] = String(id).split(':'); window.SEARCHX.open(+i, eng); },
    sqPreCopy(id) { window.SEARCHX.presetCopy(+id); },
    sqPreOpen(id) { const [i, eng] = String(id).split(':'); window.SEARCHX.presetOpen(+i, eng); },
    sqPreAll() { window.SEARCHX.presetAll(); },
    sqPreMode(id) { window.SEARCHX.setPresetMode(id); vSearch(); },
    sqSave() {
      const v = k => { const el = document.getElementById(k); return el ? el.value.trim() : ''; };
      const co = v('sqCo');
      if (!co) { toast('先填公司名'); return; }
      const lead = {
        id: 'L' + Date.now(), company: co, country: v('sqCountry') || '',
        contact: '', need: v('sqNote') || '', needZh: v('sqNote') || '',
        src: '检索式' + (v('sqUrl') ? ' · ' + v('sqUrl') : ''), kind: v('sqKind'),
        status: '待跟进', created: new Date().toISOString().slice(0, 16).replace('T', ' '),
        tz: 'Asia/Shanghai', score: 60, product: []
      };
      S.leads.unshift(lead);
      save();
      toast('已加入线索：' + co);
      ACT.tab('leads');
    },
    xrefGo() {
      const el = document.getElementById('xrefQ');
      window.XREF.setQ(el ? el.value : '');
      vXref();
    },
    xrefQuick(id) { window.XREF.setQ(id); vXref(); },
    dealAdd() {
      const v = id => { const el = $('#' + id); return el ? el.value : ''; };
      const code = String(v('dCode') || '').trim();
      if (!code) { toast('先填型号'); return; }
      const p = D.products.find(x => x.code === code);
      const custRaw = v('dCust') || '|';
      const customer = custRaw.split('|')[0], country = custRaw.split('|')[1] || '';
      const qty = Math.max(1, Number(v('dQty')) || 1);
      const price = Number(v('dPrice')) || (p ? p.price : 0);
      const amount = Number(v('dAmount')) || Math.round(qty * price * 100) / 100;
      const me = A.me() || {};
      S.deals.unshift({
        id: 'D' + Math.random().toString(36).slice(2, 8),
        code, pname: p ? (p.nameEn || '') : '', qty, price, amount,
        status: v('dStatus') || '已成交', date: v('dDate') || new Date().toISOString().slice(0, 10),
        staff: me.name || '未分配', customer, country, note: v('dNote') || ''
      });
      save(); toast('已登记：' + code + ' · ' + customer); vDeals();
    },
    /** 点开一条成交记录 → 看这一单的全部信息 */
    dealOpen(id) {
      const ctx = dealCtx();
      const v = window.DEALS.dealDetail ? window.DEALS.dealDetail(ctx, id) : null;
      if (!v) { toast(LZ('这条记录不存在了', 'This record no longer exists')); return; }
      modal(v.title, v.body, v.footer);
    },
    /** 详情里直接改状态（st 从按钮 data-st 取） */
    dealTo(id, el) {
      const st = (typeof el === 'string') ? el : (el && el.dataset ? el.dataset.st : '');
      const d = (S.deals || []).find(x => x.id === id);
      if (!d || !st) return;
      d.status = st;
      save();
      closeModal();
      render();
      toast(LZ('状态已改为：', 'Status: ') + st);
    },
    /** 详情里把这一单整体加进报价单 */
    dealToQuote(id) {
      const d = (S.deals || []).find(x => x.id === id);
      if (!d) return;
      const p = D.products.find(x => x.code === d.code);
      if (!p) { toast(LZ('产品库里没有这个型号', 'Not in the catalog')); return; }
      const qty = +d.qty || 100;
      const hit = S.cart.find(x => x.pid === p.id);
      if (hit) hit.qty += qty; else S.cart.push({ pid: p.id, qty, mat: p.material });
      save(); closeModal(); renderNav();
      toast(LZ('已加入报价单：', 'Added to quote: ') + p.code + ' × ' + qty);
      S.tab = 'quote'; render();
    },
    dealSet(id) {
      const el = document.querySelector('select[data-act="dealSet"][data-id="' + id + '"]');
      const d = (S.deals || []).find(x => x.id === id);
      if (!d || !el) return;
      d.status = el.value;
      save(); toast('状态已改为：' + el.value);
      if (S.tab === 'boss') vBoss(); else vDeals();
    },
    dealDel(id) {
      S.deals = (S.deals || []).filter(x => x.id !== id);
      save(); toast('已删除'); vDeals();
    },
    /** 待跟进客户 → 跟进：打开这个客户的浏览履历 + 带话术的发送框 */
    fuContact(uid) {
      openCustomer(uid);
    },
    /** 待跟进客户 → 登记：把客户信息填进下面的登记表 */
    fuDeal(uid) {
      const u = A.customers().find(x => x.id === uid);
      if (!u) { toast(LZ('这个客户不在了', 'Customer not found')); return; }
      const sel = $('#dCust');
      if (sel) {
        const want = (u.company || u.name) + '|' + (u.country || '');
        const hit = [...sel.options].find(o => o.value === want);
        if (hit) sel.value = want;
        else {
          const o = document.createElement('option');
          o.value = want; o.textContent = (u.company || u.name) + ' · ' + (u.country || '');
          sel.appendChild(o); sel.value = want;
        }
      }
      /* 带出他问过的第一个型号 */
      const f = window.DEALS.followups(dealCtx()).find(x => x.uid === uid);
      if (f && f.wantCodes.length) {
        const codeEl = $('#dCode');
        if (codeEl) { codeEl.value = f.wantCodes[0]; codeEl.dispatchEvent(new Event('change')); }
      }
      const box = $('#dCode');
      if (box && box.scrollIntoView) box.scrollIntoView({ block: 'center', behavior: 'smooth' });
      toast(LZ('已带到登记表：' + (u.company || u.name), 'Prefilled: ' + (u.company || u.name)));
    },
    /** 标记「这个客户不用跟了」 */
    fuMute(uid) {
      S.fuMute = S.fuMute || {};
      const on = !S.fuMute[uid];
      if (on) S.fuMute[uid] = 1; else delete S.fuMute[uid];
      save(); vDeals();
      toast(on ? LZ('已忽略，不再提醒', 'Muted') : LZ('已恢复跟进', 'Restored'));
    },
    /** 点截图放大看原图 */
    fuZoom(src) {
      if (!src) return;
      modal('<div class="small muted">' + LZ('聊天记录截图', 'Chat screenshot') + '</div>',
        '<img class="fu-note-preview" src="' + src + '" alt="chat">',
        '<button class="btn" data-act="closeModal">' + LZ('关闭', 'Close') + '</button>', true);
    },
    /** 点小旗循环切换紧急度：无 → 红(最急) → 黄(较急) → 蓝(一般) → 无 */
    fuFlagCycle(uid) {
      S.fuFlags = S.fuFlags || {};
      const seq = ['red', 'yellow', 'blue', ''];
      const cur = S.fuFlags[uid] || '';
      const next = seq[(seq.indexOf(cur) + 1) % seq.length];
      if (next) S.fuFlags[uid] = next; else delete S.fuFlags[uid];
      save();
      const FLAG = (window.DEALS && window.DEALS.FLAG) || {};
      const nm = next && FLAG[next] ? LZ(FLAG[next].l[0], FLAG[next].l[1]) : LZ('未标', 'none');
      toast(LZ('紧急度：', 'Urgency: ') + nm);
      renderFollowupsInPlace();
    },
    /** 按紧急度筛选 */
    fuFilter(k) {
      S.fuFilter = k || 'all';
      renderFollowupsInPlace();
    },
    /** 给客户加备注：文字 + 聊天截图（可多张） */
    fuNote(uid) {
      const u = A.customers().find(x => x.id === uid);
      if (!u) { toast(LZ('这个客户不在了', 'Customer not found')); return; }
      const old = (S.fuNotes || {})[uid];
      const oldTxt = old ? (old.text || '') : '';
      const oldImgs = (old && old.imgs) || [];
      modal(
        '<div class="small muted mb">' + LZ('记下沟通要点，或贴上别的平台（WhatsApp / 微信 / TikTok）的聊天截图。老板端能看到这些内容。',
          'Note key points or attach chat screenshots from WhatsApp / WeChat / TikTok. The owner sees this.') + '</div>' +
        '<div class="field"><label>' + LZ('备注文字', 'Note') + '</label>' +
        '<textarea id="fuNoteText" rows="5" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:9px;font-family:inherit;font-size:13px;resize:vertical" placeholder="' +
        LZ('如：客户要 500 套 HOWO A7 后片，压价到 4.2，答应下周给样品', 'e.g. wants 500 sets, price push to 4.2, sample next week') + '">' + esc(oldTxt) + '</textarea></div>' +
        '<div class="field" style="margin-top:10px"><label>' + LZ('聊天截图', 'Chat screenshots') + '</label>' +
        '<input id="fuNoteImgs" type="file" accept="image/*" multiple style="font-size:12px">' +
        '<div class="tiny muted" style="margin-top:4px">' + LZ('可多选；图片压到 900px 宽存本机，不占太多空间。',
          'Multiple files; resized to 900px and stored locally.') + '</div>' +
        '<div id="fuNotePrev" class="fu-shots" style="margin-top:8px"></div></div>' +
        (oldImgs.length ? '<div class="tiny muted" style="margin-top:8px">' + LZ('已有 ', 'Existing ') + oldImgs.length + LZ(' 张截图，保存后会被替换', ' screenshots will be replaced') + '</div>' : ''),
        '<button class="btn" data-act="closeModal">' + LZ('取消', 'Cancel') + '</button>' +
        '<button class="btn primary" data-act="fuSaveNote" data-id="' + esc(uid) + '">' + LZ('保存备注', 'Save note') + '</button>',
        true
      );
      /* 选图后即时预览 */
      setTimeout(() => {
        const inp = $('#fuNoteImgs');
        if (inp) inp.onchange = () => {
          const box = $('#fuNotePrev');
          if (!box) return;
          box.innerHTML = '';
          [...(inp.files || [])].slice(0, 6).forEach(f => {
            const img = document.createElement('img');
            img.className = 'fu-shot';
            img.src = URL.createObjectURL(f);
            box.appendChild(img);
          });
        };
      }, 30);
    },
    /** 保存备注：文字立即存；图片压到 900px 转 dataURL 存 localStorage */
    fuSaveNote(uid) {
      const txtEl = $('#fuNoteText');
      const txt = txtEl ? txtEl.value.trim() : '';
      const inp = $('#fuNoteImgs');
      const files = inp && inp.files ? [...inp.files].slice(0, 6) : [];
      const me = A.me() || {};
      const stamp = (() => {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      })();

      const done = imgs => {
        if (!txt && !imgs.length) { toast(LZ('没有内容可存', 'Nothing to save')); return; }
        S.fuNotes = S.fuNotes || {};
        S.fuNotes[uid] = { text: txt, imgs, by: me.name || LZ('未署名', 'Unassigned'), at: stamp, role: me.role || '' };
        save();
        closeModal();
        toast(LZ('备注已保存，老板端可见', 'Note saved — visible to the owner'));
        renderFollowupsInPlace();
      };

      if (!files.length) {
        /* 没选新图：保留之前存的图 */
        const prev = (S.fuNotes || {})[uid];
        done((prev && prev.imgs) || []);
        return;
      }
      /* 压缩：最长边 900px，JPEG 0.72 */
      Promise.all(files.map(f => new Promise(res => {
        const rd = new FileReader();
        rd.onload = () => {
          const img = new Image();
          img.onload = () => {
            try {
              const max = 900;
              const sc = Math.min(1, max / Math.max(img.width, img.height));
              const cv = document.createElement('canvas');
              cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
              cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
              res(cv.toDataURL('image/jpeg', 0.72));
            } catch (e) { res(rd.result); }
          };
          img.onerror = () => res(rd.result);
          img.src = rd.result;
        };
        rd.onerror = () => res('');
        rd.readAsDataURL(f);
      }))).then(list => {
        const imgs = list.filter(Boolean);
        /* 存不下就提示，别静默失败 */
        const prevNotes = JSON.stringify(S.fuNotes || {});
        const test = imgs.reduce((n, s) => n + s.length, 0);
        if (prevNotes.length + test > 4.2 * 1024 * 1024) {
          toast(LZ('截图太大，超出本机存储上限，只存了文字', 'Images too large for local storage — text saved'));
          done([]);
          return;
        }
        done(imgs);
      }).catch(() => done([]));
    },
    rfConnect() { const b = $('#p-redfox'); window.REDFOX.connect(() => vRedfox()); },
    rfPlat(id) { window.REDFOX.setPlatform(id); vRedfox(); },
    rfRun(id) { window.REDFOX.run(id, () => vRedfox()); },
    rfImportLead() {
      window.REDFOX.importLead({
        addLead: (lead) => { S.leads.unshift(lead); save(); renderNav(); }
      });
      vRedfox();
    },
    rfSaveIdea() { window.REDFOX.saveIdea(); vRedfox(); },
    rfCopy() { window.REDFOX.copyJson(); },
    rfCopyMcp() { window.REDFOX.copyMcp(); },
    rfClear() { window.REDFOX.clearKey(); vRedfox(); toast('已清除本机 Key'); },
    rfClearRes() { window.REDFOX.clearRes(); vRedfox(); },
    xrefAdd(id) {
      const p = E.byId.get(id); if (!p) return;
      const hit = S.cart.find(x => x.pid === id);
      if (hit) hit.qty += 100; else S.cart.push({ pid: id, qty: 100, mat: p.material });
      save(); toast(`已加入 ${p.code} × 100`); renderNav();
    },
    csQuick(id) { csSay(id); },
    openPerm() { openPerm(); },
    closePerm() { closePerm(); },
    chatToggle() { S.chat.open = !S.chat.open; renderChat(); },
    chatNext() { pushChat(false); },
    /** 客服解答：浏览记录（历史聊天 + 浏览足迹） */
    chatHistory() {
      const zh = I.getLang() === 'zh';
      const staff = A.isStaff();
      const me = A.me();
      const convo = staff ? (S.chat.msgs || []).slice() : (S.custMsgs || []).slice();
      const c0 = staff ? A.customers()[0] : null;
      const who = staff ? (c0 ? c0.name : '') : (me && me.name ? me.name : '');
      const evs = staff ? (c0 ? A.stats(c0).events : []) : (me ? A.stats(me).events : []);
      const TYPE = { view: LZ('看型号', 'viewed'), search: LZ('搜索', 'searched'), addCart: LZ('加入购物车', 'added'),
        quote: LZ('生成报价单', 'quoted'), pack: LZ('资料包', 'data pack'), inquiry: LZ('询价', 'inquiry'), login: LZ('登录', 'login') };
      const hh = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
      const dd = t => { const d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); };

      const convoHtml = convo.length ? convo.map(m => {
        const isMe = m.from === 'me';
        const label = isMe ? CT('custLabel') : CT('staffLabel');
        const head = staff
          ? '<span class="tag b" style="margin-right:6px">' + esc(m.ch || '—') + '</span>' + esc(m.from || '') + ' · ' + esc(m.time || '')
          : esc(m.time || '');
        const line = staff
          ? '<div class="hx-t"><span class="hx-who">' + head + '</span>' + esc(m.text || '') + '</div>'
          : '<span class="hx-who">' + label + '</span><span class="hx-t">' + esc(m.text || '') + '</span><span class="hx-time">' + esc(m.time || '') + '</span>';
        return '<div class="hx-row ' + (isMe ? 'me' : 'bot') + '">' + line + '</div>';
      }).join('') : '<div class="hx-empty">' + CT('histEmpty') + '</div>';

      const evHtml = evs.length ? evs.slice().reverse().slice(0, 12).map(e => {
        const d = e.d || {};
        const what = d.code || d.q || d.no || (d.items && d.items.length ? d.items.length + LZ(' 项', ' items') : '');
        return '<div class="hx-ev"><span>' + dd(e.t) + ' ' + hh(e.t) + ' · ' + (TYPE[e.type] || e.type) + '</span><b class="mono">' + esc(String(what || '')) + '</b></div>';
      }).join('') : '<div class="hx-empty">' + LZ('还没有浏览记录', 'No browsing yet') + '</div>';

      modal(LZ('浏览记录', 'Records'),
        '<div class="hx-sec"><div class="hx-h">' + CT('histTitle') + (who ? ' · ' + esc(who) : '') + '</div>' +
        '<div class="hx-thread">' + convoHtml + '</div></div>' +
        '<div class="hx-sec"><div class="hx-h">' + CT('histBrowse') + '</div><div class="hx-evs">' + evHtml + '</div></div>',
        '<button class="btn" data-act="closeModal">' + LZ('关闭', 'Close') + '</button>');
    },
    /** 「自定义定制」是一个独立页面 */
    customOpen() { ACT.tab('custom'); },
    customSubmit() {
      const v = id => { const el = $('#' + id); return el ? String(el.value || '').trim() : ''; };
      const prod = v('cuProd'), need = v('cuNeed');
      if (!prod || !need) { toast(LZ('产品和改动内容都要填', 'Product and requirement are required')); return; }
      const qty = Math.max(1, Number(v('cuQty')) || 100);
      const contact = v('cuContact');
      const txt = LZ('定制需求', 'Custom request') + '：' + prod + ' × ' + qty + '；' + need;
      if (!Array.isArray(S.custMsgs)) S.custMsgs = [];
      S.custMsgs.push({ from: 'me', text: txt, time: chatTime() });
      S.custMsgs.push({ from: 'bot', text: LZ('收到，定制需求已登记，工艺和打样价 2 小时内回你：', 'Logged. Tooling and sample price within 2 hours to: ') + contact, time: chatTime() });
      save();
      CU_SENT = { prod: prod, qty: qty, need: need, contact: contact, time: chatTime() };
      toast(LZ('已提交，客服会回你', 'Submitted — we will reply'));
      render();
    },
    chatClear() { S.chat.msgs = []; S.chat.idx = 0; $('#chatAlert').classList.remove('on'); renderChat(); $('#chatBadge').style.display = 'none'; },
    chatAuto() { S.chat.auto = !S.chat.auto; renderChat(); },
    chatAdd(pid) { ACT.addCart(pid, null, null); },
    chatReply(pid) {
      const p = E.byId.get(pid); if (!p) return;
      const txt = `Thanks for your message. For the part you mentioned, our code is ${p.code} — ${p.nameEn || pCat(p)}, ${p.dim || 'size per drawing'}, ${D.materials.find(m => m.id === p.material).name}.\nPrice: $${money(E.priceOf(p.id, 100, customer()))}/set at 100 sets, FOB Ningbo.\nIf you send a photo of the old pad next to a ruler, I will double-check the code before you order.`;
      navigator.clipboard?.writeText(txt).then(() => toast('回复已复制'), () => toast('复制失败'));
    },
    chatAskPhoto() {
      const txt = '不用提供编码也能定：请拍 3 张照片 —— ① 旧片正面（带字的那一面）② 旧片侧面靠着卷尺 ③ 车桥铭牌。照片回来 2 小时内给型号和价格。';
      navigator.clipboard?.writeText(txt).then(() => toast('话术已复制'), () => toast('复制失败'));
    },
    chatAlertGo(pid) { ACT.openProduct(pid); },
    /* ---- 热度 / 车型榜 ---- */
    contentFor(pid) {
      const p = E.byId.get(pid); if (!p) return;
      S.content.pid = pid; S.tab = 'content'; genScript(); toast(`已按 ${p.code} 生成内容选题`);
    },
    copyHeat(pid) {
      const p = E.byId.get(pid); if (!p) return;
      const rows = productVehicles(p);
      if (!rows.length) { toast('该型号暂无适配车型'); return; }
      const txt = `【${p.code}】常用车型（按社媒点赞量排序）\n` + rows.map((r, i) =>
        `${i + 1}. ${r.vName}｜${[...r.axles].join('/') || '按旧件'}｜${[...r.pos].join('/')}片｜${[...r.codes].join('/')}｜点赞 ${r.heat.likes}（${r.heat.count} 条内容）`
      ).join('\n') + `\n\n数据来源：冠英选型与报价中台（点赞为演示口径）`;
      navigator.clipboard?.writeText(txt).then(() => toast('车型清单已复制'), () => toast('复制失败'));
    },
    runImport() {
      const type = $('#impType').value, text = $('#impText').value.trim();
      if (!text) { toast('请粘贴内容'); return; }
      const lines = text.split(/\r?\n/).filter(Boolean);
      const out = [];
      let ok = 0, bad = 0;
      lines.slice(1).forEach((line, i) => {
        const cols = line.split(/\t|,/).map(s => s.trim().replace(/^"|"$/g, ''));
        try {
          if (type === 'fit') {
            const [vName, aName, pos, code, fit, conf, src] = cols;
            const v = D.vehicles.find(x => (x.brand + x.series + x.model).includes(vName) || vName.includes(x.model));
            const pid = (E.codeFlat.find(c => E.norm(c.code) === E.norm(code)) || {}).pid;
            if (!v || !pid) throw new Error(!pid ? '型号不存在：' + code : '车型不存在：' + vName);
            const a = D.axles.find(x => (x.brand + x.model).includes(aName) || aName.includes(x.model));
            S.draftFits.push({ id: 'I' + Date.now() + i, vid: v.id, aid: a ? a.id : null, pid, pos: pos || '后', fit: fit || '通用', conf: conf || '中', src: src || 'CSV 导入', q: [] });
            D.fitments.push({ id: 'I' + Date.now() + i, vid: v.id, aid: a ? a.id : null, pid, pos: pos || '后', fit: fit || '通用', conf: conf || '中', src: src || 'CSV 导入', q: [], code, vName: `${v.brand} ${v.series} ${v.model}`, aName: a ? `${a.brand} ${a.model}` : '按旧件确认' });
          } else if (type === 'prod') {
            const [code, dim, mat, price, moq] = cols;
            const p = D.products.find(x => E.norm(x.code) === E.norm(code));
            if (!p) throw new Error('型号不存在：' + code);
            if (dim) { p.dim = dim; p.dimStatus = '已录入'; }
            if (mat && D.materials.some(m => m.id === mat)) p.material = mat;
            if (price && !isNaN(price)) p.price = Number(price);
            if (moq && !isNaN(moq)) p.moq = Number(moq);
            S.overrides[p.id] = { dim: p.dim, material: p.material, price: p.price, moq: p.moq };
          } else if (type === 'lead') {
            const [company, country, src, need, contact, tz] = cols;
            const l = { id: 'L-' + Date.now() + i, created: new Date().toISOString().slice(0, 16).replace('T', ' '), company, country, src: src || 'CSV 导入', need, needZh: need, contact: contact || '—', tz: tz || 'Asia/Shanghai', status: '待跟进', owner: '未分配', next: '首次回复', product: [] };
            const m = E.match(need || ''); l.product = m.top ? [m.top.product.code] : []; l.score = E.scoreLead(l).score;
            S.leads.push(l);
          } else if (type === 'code') {
            const [code, xcode, xtype, src] = cols;
            const p = D.products.find(x => E.norm(x.code) === E.norm(code));
            if (!p) throw new Error('型号不存在：' + code);
            D.codes.push({ id: 'X' + Date.now() + i, code: xcode, norm: E.norm(xcode), pid: p.id, type: xtype || '客户叫法', source: src || 'CSV 导入', conf: '中', note: '' });
          }
          ok++;
        } catch (e) { bad++; out.push(`第 ${i + 2} 行：${e.message}`); }
      });
      save();
      $('#impOut').innerHTML = `<div class="notice ${bad ? 'warn' : 'ok'}">成功 ${ok} 条${bad ? `，失败 ${bad} 条` : ''}</div>
        ${out.length ? `<ul class="small" style="color:var(--danger);margin:6px 0 0;padding-left:16px">${out.slice(0, 8).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`;
      toast(`导入完成：${ok} 成功 / ${bad} 失败`);
      renderNav();
    }
  };

  /* ================= 界面语言 ================= */
  const I = window.I18N, T = (k, v) => I.t(k, v);
  /** 双语小标签：中文界面用中文，其它语言用英文 */
  const LZ = (zh, en) => (I.getLang() === 'zh' ? zh : en);
  /** 客服文案：10 种语言，缺键回落英文 */
  const CT = k => {
    const T2 = window.CHAT_I18N || {};
    const row = T2[I.getLang()] || {};
    return row[k] || (T2.en && T2.en[k]) || k;
  };
  /** 产品字段随界面语言切换：中文界用中文，其余用英文（缺英文时回落中文） */
  function pName(p) { return I.getLang() === 'zh' ? (p.nameZh || p.nameEn || p.name || '') : (p.nameEn || p.nameZh || p.name || ''); }
  function pCat(p) { return I.getLang() === 'zh' ? (p.cat || '') : (p.catEn || p.cat || ''); }
  function mName(m) { return I.getLang() === 'zh' ? (m.name || '') : (m.nameEn || m.name || ''); }
  /** 车型名：中文界面原样，其它语言按词典英文化 */
  const VEH_DICT = {
    '中国重汽': 'SINOTRUK', '重汽豪沃': 'SINOTRUK HOWO', '上汽红岩': 'SAIC Hongyan',
    '一汽解放': 'FAW Jiefang', '梅赛德斯-奔驰': 'Mercedes-Benz', '三菱扶桑': 'Mitsubishi Fuso',
    '东风': 'Dongfeng', '陕汽': 'Shacman', '福田': 'Foton', '江淮': 'JAC', '大运': 'Dayun',
    '宇通': 'Yutong', '金龙': 'King Long', '现代': 'Hyundai', '大宇': 'Daewoo',
    '日野': 'Hino', '五十铃': 'Isuzu', '三菱': 'Mitsubishi', '日产': 'Nissan',
    '奔驰': 'Mercedes-Benz', '沃尔沃': 'Volvo', '福特': 'Ford', '尼奥普兰': 'Neoplan',
    '豪沃': 'HOWO', '德龙': 'Delong', '斯太尔': 'Steyr', '欧曼': 'Auman', '格尔发': 'Gallop',
    '杰狮': 'Genlyon', '天龙': 'Tianlong', '天锦': 'Tianjin', '约克': 'York', '富华': 'Fuwa',
    '挂车桥': 'trailer axle', '半挂车': 'semi-trailer', '挂车': 'trailer', '客车': 'bus',
    '卡车': 'truck', '栏板': 'dropside', '公路': 'road', '系列': 'series', '系': 'series', '桥': 'axle'
  };
  const VEH_KEYS = Object.keys(VEH_DICT).sort((x, y) => y.length - x.length);
  function vehEn(a) {
    let t = ' ' + a + ' ';
    VEH_KEYS.forEach(k => { t = t.split(k).join(' ' + VEH_DICT[k] + ' '); });
    const parts = t.replace(/\s+/g, ' ').replace(/\s*\/\s*/g, ' / ').trim().split(' ');
    const out = [];
    parts.forEach(w => { if (!out.length || out[out.length - 1].toLowerCase() !== w.toLowerCase()) out.push(w); });
    return out.join(' ').trim();
  }
  function appsOf(p) {
    const list = p.appsAll || [];
    return I.getLang() === 'zh' ? list : list.map(vehEn);
  }
  function appsJoin(list, max) {
    const sep = I.getLang() === 'zh' ? '、' : ', ';
    const arr = max ? list.slice(0, max) : list;
    return arr.join(sep);
  }
  function packText(v) {
    if (I.getLang() === 'zh') return v || '';
    return String(v || '')
      .replace(/片/g, ' pcs').replace(/件/g, ' pcs').replace(/套/g, ' set').replace(/盒/g, ' box')
      .replace(/箱/g, ' carton').replace(/按箱/g, 'Per carton').replace(/\s*\/\s*/g, ' / ')
      .replace(/\s+/g, ' ').trim();
  }
  function catLabel(cat) {
    if (I.getLang() === 'zh') return cat;
    const p = D.products.find(x => x.cat === cat);
    return (p && p.catEn) || cat;
  }
  function renderLangGrid() {
    const grid = $('#langGrid');
    if (!grid) return;
    grid.innerHTML = I.LANGS.map(l => `<button class="lang-opt ${l.code === I.getLang() ? 'on' : ''}" data-act="pickLang" data-id="${l.code}">
      <span class="fl">${l.flag}</span>
      <span><span class="nm">${l.native}</span><br><span class="rg">${l.region}</span></span>
      <span class="tick">✓</span></button>`).join('');
  }
  function openLang() { renderLangGrid(); $('#langMask').classList.add('on'); }
  function closeLang() { $('#langMask').classList.remove('on'); }
  function applyLangChrome() {
    const m = I.meta();
    if ($('#langFlag')) $('#langFlag').textContent = m.flag;
    if ($('#langName')) $('#langName').textContent = m.native;
    if ($('#langBtn')) $('#langBtn').title = T('top.lang');
    if ($('#gsearch')) $('#gsearch').placeholder = T('top.searchPh');
    if ($('#langTitle')) $('#langTitle').textContent = T('m.title');
    if ($('#langSub')) $('#langSub').textContent = T('m.sub');
    if ($('#langRememberTxt')) $('#langRememberTxt').textContent = T('m.auto');
    if ($('#langGo')) $('#langGo').textContent = T('m.btn');
    document.title = I.getLang() === 'zh' ? '冠英 · 选型与报价中台 · KOOYING Hub' : 'KOOYING · Selection & Quotation Hub';
    const bt = document.querySelector('.brand-t');
    if (bt) bt.textContent = I.getLang() === 'zh' ? '选型与报价中台' : 'Selection & Quotation Hub';
  }

  /* ================= 入口（员工 / 客户） ================= */
  const A = window.AUTH;
  let gateRole = 'customer';

  function roleName(u) {
    if (!u) return T('gate.none');
    return (u.role === 'boss' ? LZ('老板', 'Owner') : u.role === 'staff' ? T('gate.staff') : T('gate.cust')) + ' · ' + u.name;
  }
  function applySession() {
    const u = A.me();
    const chip = $('#userRole');
    if (chip) chip.textContent = u
      ? (u.demo ? (u.role === 'boss' ? LZ('体验版 · 老板', 'Demo · Owner') : u.role === 'staff' ? LZ('体验版 · 员工', 'Demo · Staff') : LZ('体验版 · 客户', 'Demo · Customer')) : roleName(u))
      : T('gate.none');
    const ub = $('#userBtn');
    if (ub) ub.classList.toggle('demo', !!(u && u.demo));
    const bar = $('#demoBar');
    if (bar) {
      bar.hidden = !(u && u.demo);
      if (u && u.demo) {
        bar.className = 'demo-bar' + (u.role === 'staff' ? ' staff' : u.role === 'boss' ? ' staff' : '');
        bar.innerHTML = u.role === 'boss'
          ? `<b>${LZ('体验版老板端', 'Demo owner')}</b><span>${LZ('可以看到员工成交与业绩总结，登记与改状态被禁用。', 'You can see the deal ledger and performance summary; edits are disabled.')}</span>
             <button class="btn xs" data-act="openGate">${LZ('退出体验', 'Leave demo')}</button>`
          : u.role === 'staff'
          ? `<b>${LZ('体验版员工端', 'Demo staff')}</b><span>${LZ('全部页面都能看，但发送、导入、改数据被禁用。切回正式员工请输入访问码。', 'Everything is viewable; sending, importing and edits are disabled. Use the access code for the real account.')}</span>
             <button class="btn xs" data-act="openGate">${LZ('退出体验', 'Leave demo')}</button>`
          : `<b>${LZ('体验版客户端', 'Demo customer')}</b><span>${LZ('这是客户看到的界面，数据只存在本机。', 'This is the customer view; data stays on this device.')}</span>
             <button class="btn xs" data-act="openGate">${LZ('退出体验', 'Leave demo')}</button>`;
      }
    }
    const b = $('#userBtn');
    if (b) b.title = u ? esc(u.contact.value) : T('gate.choose');
    if (u && u.role === 'customer' && !CUST_TABS.includes(S.tab)) S.tab = 'home';
    renderNav();
    render();
  }

  function renderGate() {
    const body = $('#gateBody');
    if (!body) return;
    const u = A.me();
    if (u) {
      body.innerHTML = `
      <div class="gate-roles" style="grid-template-columns:1fr">
        <div class="gate-role on" style="cursor:default">
          <div class="row wrap-gap" style="align-items:center;gap:8px">
            <span class="tag ${u.role === 'staff' ? 'b' : 'g'}">${u.role === 'staff' ? T('gate.staff') : T('gate.cust')}</span>${u.demo ? '<span class="tag y">' + LZ('体验版', 'Demo') + '</span>' : ''}
            <b>${esc(u.name)}</b><span class="tiny muted mono">${esc(u.contact.value)}</span>
          </div>
          <div class="d">${u.role === 'staff'
          ? LZ('可以看到客户浏览、跟进线索、编辑报价与资料包。', 'Can see customer activity, leads, quotes and data packs.')
          : LZ('你可以查看型号、测算价格；员工的报价与资料会发到这个联系方式。', 'You can browse parts and see prices; quotes will be sent to this contact.')}</div>
        </div>
      </div>
      <div class="gate-form" style="grid-template-columns:1fr">
        <div class="small muted">${LZ('登录状态保存在本机；换设备需要重新登录。', 'Session is stored on this device; log in again elsewhere.')}</div>
      </div>
      <div class="gate-foot">
        <button class="btn" data-act="logout">${T('gate.logout')}</button>
        <span class="flex1"></span>
        <button class="btn primary" data-act="closeGate">${LZ('继续', 'Continue')}</button>
      </div>`;
      return;
    }
    const staff = gateRole === 'staff';
    body.innerHTML = `
    <div class="gate-roles">
      <button class="gate-role ${staff ? '' : 'on'}" data-act="gateRole" data-id="customer">
        <div class="ic">🛒</div>
        <div class="t">${T('gate.cust')}</div>
        <div class="d">${T('gate.custSub')}</div>
      </button>
      <button class="gate-role ${staff ? 'on' : ''}" data-act="gateRole" data-id="staff">
        <div class="ic">🗂</div>
        <div class="t">${T('gate.staff')}</div>
        <div class="d">${T('gate.staffSub')}</div>
      </button>
      <button class="gate-role ${gateRole === 'boss' ? 'on' : ''}" data-act="gateRole" data-id="boss">
        <div class="ic">📊</div>
        <div class="t">${LZ('老板', 'Owner')}</div>
        <div class="d">${LZ('看员工业绩、成交、转化与产品结构', 'Staff performance, deals and product mix')}</div>
      </button>
    </div>
    <div class="gate-form">
      ${gateRole === 'boss' ? `
        <div class="full"><label>${LZ('老板访问码', 'Owner code')}</label><input id="gCode" type="text" autocomplete="off" placeholder="GYBOSS"></div>
        <div><label>${T('gate.name')}</label><input id="gName" type="text" placeholder="Owner"></div>
        <div><label>${T('gate.contactValue')}</label><input id="gValue" type="text" placeholder="boss@kooying.com"></div>
      ` : staff ? `
        <div class="full"><label>${T('gate.code')}</label><input id="gCode" type="text" autocomplete="off" placeholder="GY2024"></div>
        <div><label>${T('gate.name')}</label><input id="gName" type="text" placeholder="Sales"></div>
        <div><label>${T('gate.contactValue')}</label><input id="gValue" type="text" placeholder="sales@kooying.com"></div>
      ` : `
        <div><label>${T('gate.contactType')}</label><select id="gType">${A.CONTACT_TYPES.map(t => `<option ${t === 'WhatsApp' ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div><label>${T('gate.contactValue')}</label><input id="gValue" type="text" placeholder="+52 55 1234 5678"></div>
        <div><label>${T('gate.name')}</label><input id="gName" type="text" placeholder="Carlos"></div>
        <div><label>${T('gate.company')}</label><input id="gCompany" type="text" placeholder="Transportes Mendoza"></div>
        <div class="full"><label>${T('gate.country')}</label><input id="gCountry" type="text" placeholder="Mexico"></div>
      `}
      <div class="gate-err" id="gErr"></div>
    </div>
    <div class="gate-demo-wrap">
      <button class="gate-demo" data-act="gateDemo" data-id="customer">
        <span class="bolt">⚡</span>
        <span>${LZ('体验版 · 客户（不填联系方式）', 'Demo · Customer (no contact needed)')}</span>
        <span class="tiny muted">${LZ('随便点，数据只在本机', 'click anything, local only')}</span>
      </button>
      <button class="gate-demo staff" data-act="gateDemo" data-id="staff">
        <span class="bolt">⚡</span>
        <span>${LZ('体验版 · 员工（免访问码，只读）', 'Demo · Staff (no code, read-only)')}</span>
        <span class="tiny muted">${LZ('可看客户浏览，不能改数据', 'see activity, no edits')}</span>
      </button>
      <button class="gate-demo boss" data-act="gateDemo" data-id="boss">
        <span class="bolt">⚡</span>
        <span>${LZ('体验版 · 老板（免访问码，只读）', 'Demo · Owner (no code, read-only)')}</span>
        <span class="tiny muted">${LZ('看员工业绩与成交总结', 'staff performance summary')}</span>
      </button>
    </div>
    <div class="gate-foot">
      <span class="tip">${gateRole === 'boss' ? LZ('演示访问码：GYBOSS', 'Demo owner code: GYBOSS') : staff ? LZ('演示访问码：GY2024', 'Demo access code: GY2024') : T('gate.tip')}</span>
      <span class="flex1"></span>
      <button class="btn primary" data-act="gateLogin">${T('gate.in')}</button>
    </div>`;
  }

  function openGate() { renderGate(); $('#gateMask').classList.add('on'); }
  function closeGate() { $('#gateMask').classList.remove('on'); }

  /* ================= 客户浏览（员工端） ================= */
  const EV_LABEL = {
    login: ['登录', 'Signed in'],
    search: ['搜索', 'Search'],
    view: ['查看型号', 'Viewed part'],
    addCart: ['加入报价单', 'Added to quote'],
    inquiry: ['提交询价', 'Asked for price'],
    quote: ['打开报价单', 'Opened quote'],
    pack: ['打开资料包', 'Opened data pack'],
    download: ['下载资料', 'Downloaded']
  };
  function evName(t) { const r = EV_LABEL[t] || [t, t]; return LZ(r[0], r[1]); }
  function ago(ms) {
    const d = Date.now() - ms, m = Math.floor(d / 60000);
    if (m < 1) return LZ('刚刚', 'just now');
    if (m < 60) return LZ(m + ' 分钟前', m + ' min ago');
    const h = Math.floor(m / 60);
    if (h < 24) return LZ(h + ' 小时前', h + ' h ago');
    const day = Math.floor(h / 24);
    return LZ(day + ' 天前', day + ' d ago');
  }
  function dayLabel(ms) {
    const d = new Date(ms);
    return d.getMonth() + 1 + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ================= 客户询价（员工端） ================= */
  function vInquiries() {
    const list = A.inquiries();
    const el = $('#p-inquiries');
    if (!list.length) {
      el.innerHTML = `<h1>${T('nav.inquiries')}</h1>
        <div class="card"><div class="muted">${LZ('还没有客户询价。客户在客户端点「询价」提交后，这里会立刻出现。', 'No inquiries yet. They appear here the moment a customer sends one.')}</div></div>`;
      return;
    }
    const rows = list.map(q => {
      const items = q.items.map(it => {
        const p = D.products.find(x => x.id === it.pid);
        return `<span class="chip mono">${esc(p ? p.code : '?')} × ${it.qty}</span>`;
      }).join(' ');
      const pieces = q.items.reduce((n, it) => n + it.qty, 0);
      return `<tr>
        <td class="tiny muted">${esc(ago(q.t))}</td>
        <td><b>${esc(q.user.name)}</b>${q.user.demo ? ' <span class="tag y">' + LZ('体验','Demo') + '</span>' : ''}
          ${q.user.company ? `<div class="tiny muted">${esc(q.user.company)}</div>` : ''}</td>
        <td class="mono tiny">${esc(q.no)}<div class="tiny muted">${esc(q.items.length)} 型号 · ${pieces} 件</div></td>
        <td>${items}${q.note ? `<div class="tiny muted" style="margin-top:4px">📝 ${esc(q.note)}</div>` : ''}</td>
        <td class="tiny">${esc(q.user.contact.type)}<div class="muted">${esc(q.user.contact.value)}</div></td>
        <td><div class="row">
          <button class="btn xs primary" data-act="loadInquiry" data-id="${esc(q.no)}">${LZ('载入报价','Load quote')}</button>
          <button class="btn xs" data-act="openCustomer" data-id="${esc(q.user.id)}">${LZ('履历','History')}</button>
        </div></td></tr>`;
    }).join('');
    el.innerHTML = `<div class="row" style="justify-content:space-between;align-items:flex-end;margin-bottom:12px">
        <div><h1 style="margin:0">${T('nav.inquiries')}</h1>
        <div class="muted small">${LZ('客户在前台点「询价」提交的清单，带数量和留言；点「载入报价」直接生成正式报价单。', 'Requests submitted from the customer portal, with quantities and notes.')}</div></div>
        <span class="tag g">${list.length} 条待处理</span></div>
      <div class="card"><table><thead><tr><th>${LZ('时间','When')}</th><th>${LZ('客户','Customer')}</th><th>${LZ('询价号','No.')}</th><th>${LZ('要什么','Items')}</th><th>${LZ('联系方式','Contact')}</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function vVisits() {
    const list = A.customers();
    const today = list.filter(c => c.stat.last > Date.now() - 86400000).length;
    const views = list.reduce((s, c) => s + c.stat.views, 0);
    const orders = list.reduce((s, c) => s + c.stat.orders, 0);
    $('#p-visits').innerHTML = `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div><h1 style="margin:0">${LZ('客户浏览', 'Customer activity')}</h1>
        <div class="muted small">${LZ('客户在客户端搜了什么、看了哪些型号、有没有打开报价单——按最近活跃排序。', 'What customers searched, viewed and quoted — newest first.')}</div></div>
      <div class="row"><span class="tag ${list.length ? 'g' : 'n'}">${list.length} ${LZ('位客户', 'customers')}</span></div>
    </div>
    <div class="kpis mb">
      <div class="kpi"><div class="n">${today}</div><div class="l">${LZ('24 小时内活跃', 'Active in 24h')}</div></div>
      <div class="kpi"><div class="n">${views}</div><div class="l">${LZ('累计浏览型号', 'Part views')}</div></div>
      <div class="kpi"><div class="n">${orders}</div><div class="l">${LZ('打开报价 / 资料包', 'Quotes / packs opened')}</div></div>
      <div class="kpi"><div class="n">${list.filter(c => c.stat.score >= 60).length}</div><div class="l">${LZ('高意向待跟', 'Hot to follow up')}</div></div>
    </div>
    <div class="card"><div class="tbl-wrap">
      <table><thead><tr>
        <th>${LZ('客户', 'Customer')}</th><th>${LZ('联系方式', 'Contact')}</th><th>${LZ('国家', 'Country')}</th>
        <th>${LZ('最近活跃', 'Last seen')}</th><th class="right">${LZ('浏览', 'Views')}</th>
        <th class="right">${LZ('搜索', 'Searches')}</th><th class="right">${LZ('询价', 'Quote')}</th>
        <th class="right">${LZ('意向', 'Intent')}</th><th></th>
      </tr></thead><tbody>
      ${list.map(c => `<tr class="click" data-act="openCustomer" data-id="${c.id}">
        <td><b>${esc(c.name)}</b>${c.demo ? ' <span class="tag y">' + LZ('体验', 'Demo') + '</span>' : ''}${c.company ? `<div class="tiny muted">${esc(c.company)}</div>` : ''}</td>
        <td class="small"><span class="tag n">${esc(c.contact.type)}</span><div class="tiny mono muted">${esc(c.contact.value)}</div></td>
        <td class="small">${esc(c.country || '—')}</td>
        <td class="small">${ago(c.stat.last)}</td>
        <td class="right small">${c.stat.views || '—'}</td>
        <td class="right small">${c.stat.searches || '—'}</td>
        <td class="right small">${c.stat.orders || '—'}</td>
        <td class="right"><span class="tag ${c.stat.score >= 70 ? 'g' : c.stat.score >= 50 ? 'y' : 'n'}">${c.stat.score}</span></td>
        <td><button class="btn xs" data-act="sendCustomer" data-id="${c.id}">${LZ('发送', 'Send')}</button></td>
      </tr>`).join('') || `<tr><td colspan="9" class="empty small">${LZ('还没有客户登录记录。把本链接发给客户，他们登录后这里就有数据。', 'No customer sessions yet.')}</td></tr>`}
      </tbody></table>
    </div></div>`;
  }

  function openCustomer(uid) {
    const u = A.customers().find(x => x.id === uid);
    if (!u) return;
    const st = u.stat;
    const ev = st.events.slice().sort((a, b) => b.t - a.t);
    const searches = ev.filter(e => e.type === 'search' && e.d.q).map(e => e.d.q);
    const codes = [...new Set(ev.filter(e => e.d && e.d.code).map(e => e.d.code))];
    let lastDay = '';
    const rows = ev.slice(0, 40).map(e => {
      const day = new Date(e.t).toDateString();
      const head = day !== lastDay ? `<div class="tl-day">${dayLabel(e.t).split(' ')[0]}</div>` : '';
      lastDay = day;
      return head + `<div class="tl-item ${['addCart', 'quote', 'pack'].includes(e.type) ? 'hot' : ''}">
        <div class="tl-t">${evName(e.type)}${e.d && e.d.code ? ` <b class="mono">${esc(e.d.code)}</b>` : ''}</div>
        <div class="tl-d">${dayLabel(e.t)}${e.d && e.d.q ? ' · ' + esc(e.d.q) : ''}${e.d && e.d.top && !e.d.code ? ' · → ' + esc(e.d.top) : ''}</div>
      </div>`;
    }).join('');
    drawer(`<div><div class="b">${esc(u.name)}</div><div class="tiny muted">${esc(u.company || '')}${u.company && u.country ? ' · ' : ''}${esc(u.country || '')}</div></div>`,
      `<div class="row wrap-gap mb" style="gap:6px">
        <span class="tag n">${esc(u.contact.type)}</span>
        <span class="mono small">${esc(u.contact.value)}</span>
        <span class="flex1"></span>
        ${(u.tags || []).map(t => `<span class="tag b">${esc(t)}</span>`).join('')}
      </div>
      <div class="kpis" style="margin-bottom:12px">
        <div class="kpi"><div class="n">${st.score}</div><div class="l">${LZ('意向评分', 'Intent score')}</div></div>
        <div class="kpi"><div class="n">${st.views}</div><div class="l">${LZ('查看型号', 'Views')}</div></div>
        <div class="kpi"><div class="n">${st.searches}</div><div class="l">${LZ('搜索', 'Searches')}</div></div>
        <div class="kpi"><div class="n">${st.orders}</div><div class="l">${LZ('报价/资料', 'Quote/pack')}</div></div>
      </div>
      ${searches.length ? `<div class="sec-t">${LZ('他搜过什么', 'What they searched')}</div>
        <div class="row wrap-gap" style="gap:6px">${searches.slice(0, 6).map(q => `<span class="chip">${esc(q)}</span>`).join('')}</div>` : ''}
      ${codes.length ? `<div class="sec-t">${LZ('他看过哪些型号', 'Parts they viewed')}</div>
        <div class="row wrap-gap" style="gap:6px">${codes.map(c => `<span class="chip" data-act="openProductByCode" data-id="${esc(c)}">${esc(c)}</span>`).join('')}</div>` : ''}
      <div class="sec-t">${LZ('浏览轨迹', 'Timeline')}</div>
      <div class="tl">${rows || `<div class="muted small">${LZ('还没有记录', 'No events yet')}</div>`}</div>
      <div class="sec-t">${LZ('发给他的消息', 'Message to this customer')}</div>
      <textarea id="sendMsg" style="min-height:96px;font-size:12.5px">${esc(LZ('你好 ' + u.name + '，这里是冠英（KOOYING）。你之前看过 ' + (codes.slice(0, 3).join(' / ') || '我们的刹车片') + '，我把规格、适配车型和价格一起发你，方便的话回复数量，我按阶梯价报给你。',
        'Hi ' + u.name + ', this is KOOYING. You looked at ' + (codes.slice(0, 3).join(' / ') || 'our brake pads') + '. I can send specs, fitment and prices — just tell me the quantity.'))}</textarea>
      <div class="small muted mt-s">${LZ('发送后会打开 WhatsApp / 邮件客户端，内容可先编辑。', 'Opens WhatsApp or your mail app with the text above.')}</div>`,
      `<div class="row wrap-gap">
        <button class="btn primary" data-act="sendCustomer" data-id="${u.id}">${LZ('用 ' + u.contact.type + ' 发送', 'Send via ' + u.contact.type)}</button>
        <button class="btn" data-act="pushLead" data-id="${u.id}">${LZ('加入询盘池', 'Add to leads')}</button>
        <span class="flex1"></span>
        <button class="btn ghost" data-act="closeDrawer">${T('c.close')}</button>
      </div>`);
  }
  /* ================= 事件 ================= */
  // 图片兜底：加载失败时换成占位图，不留空白框
  document.addEventListener('error', e => {
    const el = e.target;
    if (el && el.tagName === 'IMG' && !el.dataset.fallback) {
      el.dataset.fallback = '1';
      el.src = 'assets/img/_placeholder.svg';
    }
  }, true);

  document.addEventListener('change', e => {
    const t = e.target.closest ? e.target.closest('select[data-act]') : null;
    if (!t) return;
    const act = t.dataset.act;
    if (!ACT[act]) return;
    if (DEMO_BLOCK.has(act) && A.isDemoStaff && A.isDemoStaff()) {
      toast(LZ('体验版是只读的，改不了状态', 'Demo mode is read-only'));
      return;
    }
    ACT[act](t.dataset.id, t, e);
  });

  document.addEventListener('click', e => {
    // 导航分组（员工侧）：点空白处自动收起
    if (navOpen && !(e.target.closest && e.target.closest('.nav-fly'))) {
      navOpen = ''; renderNav();
    }
    // 客户端「选购」下拉 与 首屏「选购」下拉：点空白处收起
    const nd = document.getElementById('navDrop');
    if (nd && nd.classList.contains('open') && !e.target.closest('#navDrop')) nd.classList.remove('open');
    const hp = document.getElementById('heroPick');
    if (hp && hp.classList.contains('open') && !e.target.closest('#heroPick')) hp.classList.remove('open');
    const shot = e.target.closest ? e.target.closest('img.fu-shot') : null;
    if (shot && shot.src) { e.preventDefault(); ACT.fuZoom(shot.src); return; }
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act;
    if (!ACT[act]) return;
    if (/^(INPUT|SELECT|TEXTAREA|LABEL)$/.test(t.tagName)) return;
    e.preventDefault(); e.stopPropagation();
    if (DEMO_BLOCK.has(act) && A.isDemoStaff && A.isDemoStaff()) {
      toast(LZ('体验版员工端是只读的，发送 / 导入 / 改数据都不能用', 'Demo staff is read-only: sending, importing and edits are disabled'));
      return;
    }
    ACT[act](t.dataset.id, t, e);
  });
  document.addEventListener('change', e => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.dataset.act, id = t.dataset.id;
    if (act === 'setQty') { const r = cartRows()[Number(id)]; if (r) { r.qty = Math.max(1, Number(t.value) || 1); const c = S.cart.find(x => x.pid === r.pid); if (c) c.qty = r.qty; save(); vQuote(); } }
    if (act === 'setMat') { const r = cartRows()[Number(id)]; if (r) { r.mat = t.value; const c = S.cart.find(x => x.pid === r.pid); if (c) c.mat = t.value; save(); vQuote(); } }
    if (act === 'packCfg') ACT.packCfg(id);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(); closeDrawer();
      if (navOpen) { navOpen = ''; renderNav(); }
      const nd = document.getElementById('navDrop'); if (nd) nd.classList.remove('open');
      const hp = document.getElementById('heroPick'); if (hp) hp.classList.remove('open');
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { if (S.tab === 'select') doMatch(); }
  });
  $('#gsearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = e.target.value.trim(); if (v) { S.tab = 'select'; doMatch(v); e.target.value = ''; } }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target && e.target.id === 'csInput') { e.preventDefault(); csSay(e.target.value); }
  });
  $('#drawerMask').onclick = closeDrawer;
  $('#modalMask').onclick = e => { if (e.target.id === 'modalMask') closeModal(); };
  // 视口变化时（拖动窗口 / 手机转屏）把展开中的菜单重新夹回屏幕内
  window.addEventListener('resize', () => { clampNavMenu(); });

  /* ================= 启动 ================= */
  $('#tzNow').textContent = '本地 ' + E.localTime('Asia/Shanghai').text;
  let savedLang = null, rememberLang = '1';
  try {
    savedLang = localStorage.getItem('gy_lang');
    rememberLang = localStorage.getItem('gy_lang_remember') || '1';
  } catch (e) { }
  const browserLang = (navigator.language || 'zh').slice(0, 2).toLowerCase();
  I.setLang(savedLang || (I.ORDER.includes(browserLang) ? browserLang : 'en'));
  applyLangChrome();
  if ($('#langRemember')) $('#langRemember').checked = rememberLang === '1';
  ensureDeals();
  render();
  applySession();
  window.__askLang = (!savedLang || rememberLang !== '1');
  setTimeout(openGate, 80);
  pushChat(true);
  $('#chatBadge').textContent = S.chat.msgs.filter(m => m.match && m.match.top).length;
  $('#chatBadge').style.display = S.chat.msgs.some(m => m.match && m.match.top) ? 'inline-block' : 'none';
  render();
  if (!storageOK) {
    const n = document.createElement('div');
    n.className = 'notice warn';
    n.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:99';
    n.textContent = '当前浏览器禁用了本地存储，本次修改不会自动保存。请用「导出全量快照」备份，或通过 启动.bat 以 http 方式打开。';
    document.body.appendChild(n);
  }
})();