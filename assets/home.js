/* 首页（官网风格）：视频/海报大图 + 关于 + 产品类别 + 工具入口 + 新闻 + 联系 */
(function () {
  const HERO_SLIDES = [
    'assets/img/site/hero-new.jpg',
    'assets/img/site/hero-drum.png',
    'assets/img/site/hero-2.png',
    'assets/img/site/hero-wind.png'
  ];
  const VIDEOS = ['assets/video/hero-1.mp4', 'assets/video/hero-2.mp4'];

  const NEWS = [
    { d: '2026.12.02', t: '冠英诚邀您莅临 2026 法兰克福国际汽车零部件展', s: '上海 · 国家会展中心 · 展位 1.1N59', tag: '展会' },
    { d: '2026.07.18', t: '携手攻坚 · 共拓新局｜2026 年度全国核心办事处市场研讨会', s: '湖州 · 聚焦渠道新布局与终端新服务', tag: '公司新闻' },
    { d: '2026.05.12', t: '智创新能源 安行天下路｜2026 新品发布会在重庆召开', s: '新能源商用车制动新品首次亮相', tag: '新品' }
  ];

  const CATS = [
    { k: '鼓式衬片', en: 'Brake Lining', n: 191, img: 'assets/img/site/cat-howo.jpg', d: '重卡 / 客车 / 挂车，覆盖东风、解放、重汽、陕汽、欧曼等 11 个系列' },
    { k: '盘式刹车片', en: 'Truck Brake Pad', n: 52, img: 'assets/img/site/cat-dongfeng.jpg', d: '欧系 / 日系 / 国产重卡盘式制动，含 BPW、WABCO 等桥型' },
    { k: '风电刹车片', en: 'Wind Turbine Pad', n: 6, img: 'assets/img/site/cat-jiefang.jpg', d: '风力发电机偏航制动块，耐高温、低磨损配方' }
  ];

  function home(o) {
    const { st, isCust, isBoss, todo, ex, T, LZ, esc, I18N } = o;    const lang = I18N.getLang();
    const zh = lang === 'zh';

    const hero = `
    <section class="site-hero" id="siteHero">
      <video id="heroVideo" class="hero-video" muted playsinline preload="auto" autoplay poster="assets/img/site/hero-new.jpg"></video>
      <div class="hero-slides" id="heroSlides">
        ${HERO_SLIDES.map((s, i) => `<div class="hero-slide ${i === 0 ? 'on' : ''}" style="background-image:url('${s}')"></div>`).join('')}
      </div>
      <div class="hero-veil"></div>
      <div class="hero-inner">
        <div class="hero-kicker">浙江冠英汽车零部件有限公司 · ZHEJIANG KOOYING AUTO PARTS</div>
        <h1 class="hero-h1">${zh ? '质量保证 · 制动自如' : 'Quality assured. Braking at ease.'}</h1>
        <p class="hero-p">${zh
          ? '专注摩擦材料 20 年 · 272 个型号 / 613 个编码 / 26 个车型 / 44 条适配关系'
          : '20 years in friction materials · 272 part numbers / 613 codes / 26 vehicles / 44 fitments'}</p>
        <div class="hero-cta">
          <button class="btn primary lg" data-act="tab" data-id="products">${zh ? '产品中心' : 'Products'}</button>
          <button class="btn ghost lg" data-act="tab" data-id="select">${zh ? '智能选型' : 'Find my part'}</button>
        </div>
      </div>
      <div class="hero-top">
        <div class="hero-search">
          <span class="ico">⌕</span>
          <input id="heroQ" type="text" placeholder="${T('sel.ph')}">
          <button class="btn primary" data-act="heroMatch">${T('home.btn')}</button>
        </div>
        <div class="hero-dots" id="heroDots"></div>
        <button class="hero-fit" id="heroFit" title="${zh ? '铺满全屏 / 完整显示' : 'Fill / fit'}">⤢</button>
      </div>
    </section>`;

    const about = `
    <section class="site-sec" id="aboutSec">
      <div class="sec-head">
        <div><h2>${zh ? '关于冠英' : 'About KOOYING'}</h2>
        <p>${zh ? '给您全方位的服务' : 'Full-service braking partner'}</p></div>
        <button class="btn sm" data-act="tab" data-id="products">${zh ? '查看产品' : 'View products'} ›</button>
      </div>
      <div class="about-grid">
        <div class="about-pic"><img src="assets/img/site/about.jpg" alt="KOOYING factory"></div>
        <div class="about-txt">
          <p>${zh
            ? '浙江冠英汽车零部件有限公司始创于 2006 年，坐落于太湖之滨的浙江湖州，建筑总面积 43000 平方米，专注汽车摩擦材料产品的研发、生产、销售与服务。'
            : 'Founded in 2006 beside Taihu Lake in Huzhou, Zhejiang, KOOYING builds 43,000 m² of friction-material capacity for R&D, production and service.'}</p>
          <p>${zh
            ? '公司专业生产国产、进口汽车刹车片、新能源风电制动块与制动蹄总成，年供应刹车片与风电制动块 10000 余吨、制动蹄总成 60 万套，产品远销欧美、非洲、中东与东南亚。'
            : 'We supply brake pads for Chinese and imported trucks, wind-turbine yaw pads and brake shoe assemblies — 10,000+ tons a year, exported to Europe, Africa, the Middle East and Southeast Asia.'}</p>
          <div class="about-stats">
            <div><b>43000<span>㎡</span></b><i>${zh ? '总建筑面积' : 'plant area'}</i></div>
            <div><b>100<span>+</span></b><i>${zh ? '在职员工' : 'employees'}</i></div>
            <div><b>60<span>%+</span></b><i>${zh ? '出口海外' : 'export share'}</i></div>
          </div>
        </div>
      </div>
    </section>`;

    const cats = `
    <section class="site-sec">
      <div class="sec-head">
        <div><h2>${zh ? '产品类别' : 'Product categories'}</h2>
        <p>${zh ? '鼓式 · 盘式 · 风电偏航制动' : 'Drum · Disc · Wind yaw'}</p></div>
        <button class="btn sm" data-act="tab" data-id="products">${zh ? '全部型号' : 'All parts'} ›</button>
      </div>
      <div class="cat-grid">
        ${CATS.map(c => `<div class="cat-card" data-act="openCat" data-id="${c.k}">
          <div class="cat-img"><img src="${c.img}" alt=""></div>
          <div class="cat-body">
            <div class="cat-t">${zh ? c.k : c.en}</div>
            <div class="cat-n">${c.n} ${zh ? '个型号' : 'part numbers'}</div>
            <div class="cat-d">${c.d}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="row wrap-gap" style="margin-top:12px">
        ${['制动蹄总成', '离合器面片', '其他配件'].map(k => `<button class="chip" data-act="openCat" data-id="${k}">${k}</button>`).join('')}
      </div>
    </section>`;

    const tools = `
    <section class="site-sec">
      <div class="sec-head">
        <div><h2>${zh ? '工具入口' : 'Workspace'}</h2>
        <p>${zh ? '选型 · 报价 · 资料，一条线走完' : 'Match, quote and pack in one flow'}</p></div>
      </div>
      <div class="tool-grid">
        <button class="tool-card" data-act="tab" data-id="select"><span class="ti">◎</span><b>${zh ? '智能选型' : 'Smart match'}</b><i>${zh ? '车型 / 车桥 / 旧件编码 → 候选型号 + 消歧问题' : 'Vehicle, axle or old code to ranked candidates'}</i></button>
        <button class="tool-card" data-act="tab" data-id="products"><span class="ti">▤</span><b>${zh ? '产品库' : 'Catalog'}</b><i>${zh ? st.products + ' 个型号，含规格、材质、编码与缩略图' : st.products + ' parts with specs, codes and photos'}</i></button>
        <button class="tool-card" data-act="tab" data-id="custom"><span class="ti">✂</span><b>${zh ? '自定义定制' : 'Custom parts'}</b><i>${zh ? '非标尺寸 / 材质 / 包装 / 打标，提交后 2 小时回方案' : 'Non-standard size, material, packing or marking'}</i></button>
        <button class="tool-card" data-act="tab" data-id="aftersale"><span class="ti">☎</span><b>${zh ? '售后服务' : 'After-sales'}</b><i>${zh ? '装车异常、退换、索赔，提交后销售和老板都能看到' : 'Install issues, returns and claims — sales and the owner both see it'}</i></button>
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="quote"><span class="ti">￥</span><b>${zh ? '报价单' : 'Quotation'}</b><i>${zh ? '阶梯价 + 运费，生成可打印 PDF' : 'Tier pricing, freight, printable PDF'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="pack"><span class="ti">▣</span><b>${zh ? '资料包' : 'Data pack'}</b><i>${zh ? '报价 + 产品页 + 试验 + 确认页，打包 ZIP' : 'Quote, data sheets, tests — one ZIP'}</i></button>` : ''}

        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="network"><span class="ti">◉</span><b>${zh ? '用户画像' : 'Profiles'}</b><i>${zh ? '画像 / 检索式搜客户 / 短视频选题，一个入口三段切换' : 'Profiles, buyer search and content studio in one entry'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="xref"><span class="ti">⇄</span><b>${zh ? '编号对照' : 'Cross reference'}</b><i>${zh ? 'WVA / FMSI / OE / 车桥 → 自家型号，还差什么一眼看到' : 'WVA, FMSI, OE or axle to your part number'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="deals"><span class="ti">✎</span><b>${zh ? '成交台账' : 'Deals'}</b><i>${zh ? '记一笔成交 / 改状态，老板那边立刻看到' : 'Log a deal and its status'}</i></button>` : ''}
        ${!isCust && isBoss ? `<button class="tool-card" data-act="tab" data-id="boss"><span class="ti">▦</span><b>${zh ? '业绩总览' : 'Overview'}</b><i>${zh ? '员工成交、转化率、产品结构 + 一句话总结' : 'Staff performance and product mix'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="redfox"><span class="ti">⌁</span><b>${zh ? '热门追踪' : 'Trending'}</b><i>${zh ? 'TikTok / IG / YouTube 热门内容 → 选题与线索' : 'Trending posts on TikTok, IG and YouTube → ideas and leads'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="inquiries"><span class="ti">✉</span><b>${zh ? '客户询价' : 'Inquiries'}</b><i>${zh ? '客户提交的清单，一键载入报价' : 'Customer requests, load into a quote'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="visits"><span class="ti">👁</span><b>${zh ? '客户浏览' : 'Activity'}</b><i>${zh ? '谁在看、看什么、意向多少' : 'Who is browsing, and how deep'}</i></button>` : ''}
      </div>
    </section>`;

    const news = `
    <section class="site-sec">
      <div class="sec-head">
        <div><h2>${zh ? '新闻中心' : 'News'}</h2>
        <p>${zh ? '展会 · 新品 · 公司动态' : 'Exhibitions, launches, company news'}</p></div>
        <a class="btn sm" href="https://cn.kooying.com/news/company-news/" target="_blank" rel="noopener">${zh ? '更多' : 'More'} ›</a>
      </div>
      <div class="news-grid">
        ${NEWS.map(n => `<div class="news-card">
          <div class="news-d"><span class="tag b">${n.tag}</span><span class="mono">${n.d}</span></div>
          <div class="news-t">${n.t}</div>
          <div class="news-s">${n.s}</div>
        </div>`).join('')}
      </div>
    </section>`;

    const contact = `
    <section class="site-sec contact">
      <div class="contact-grid">
        <div>
          <h2>${zh ? '联系我们' : 'Contact us'}</h2>
          <p class="muted">${zh ? '留下车型和数量，我们按阶梯价回你。' : 'Leave your vehicle and quantity; we reply with tier pricing.'}</p>
          <ul class="contact-list">
            <li><b>${zh ? '地址' : 'Address'}</b> ${zh ? '浙江省湖州市湖州经济技术开发区石林路 398 号' : '398 Shilin Rd, Huzhou Economic Zone, Zhejiang, China'}</li>
            <li><b>${zh ? '电话' : 'Tel'}</b> +86-0572-2087 398</li>
            <li><b>${zh ? '邮箱' : 'Email'}</b> 20721803@qq.com</li>
          </ul>
          <div class="row wrap-gap">
            <button class="btn primary" data-act="askPrice">${zh ? '提交询价' : 'Send inquiry'}</button>
            <button class="btn" data-act="tab" data-id="select">${zh ? '先选型' : 'Match a part first'}</button>
          </div>
        </div>
      </div>
    </section>`;

    const statline = `
    <div class="statline">
      <span><b>${st.products}</b> ${T('nav.products')}</span>
      <span><b>${st.codes}</b> ${T('h.codes')}</span>
      <span><b>${st.vehicles}</b> ${T('h.apps')}</span>
      <span><b>${st.axles}</b> ${zh ? '车桥' : 'axles'}</span>
      <span><b>${st.fitments}</b> ${T('nav.graph')}</span>
      <span><b>${o.tests}</b> ${zh ? '试验报告' : 'test reports'}</span>
    </div>`;

    const todoCard = `
    <div class="split">
      <div class="card">
        <div class="card-h"><h3>${isCust ? LZ('最近浏览', 'Recently viewed') : T('home.todo')}</h3><span class="sub">${isCust ? LZ('点一下回到产品库', 'Tap to open the catalog') : T('home.todoSub')}</span></div>
        <div class="card-b" style="padding:4px 15px 8px">
          ${todo.length ? todo.map(x => `<div class="todo" data-act="tab" data-id="${x.tab}">
            <div class="todo-n">${x.n}</div>
            <div style="flex:1"><div class="todo-t">${x.t}</div></div>
            <span class="muted">›</span></div>`).join('')
        : `<div class="muted small" style="padding:16px 0">${zh ? '今天没有待办。直接搜一个型号，或去「用户画像 · 获客内容」做一条脚本。' : 'Nothing pending. Search a part, or open Content to draft a video.'}</div>`}
        </div>
      </div>
      <div class="card">
        <div class="card-h"><h3>${T('home.steps')}</h3><span class="sub">${T('home.stepsSub')}</span></div>
        <div class="card-b small" style="line-height:1.95">
          <div>${T('home.s1')}</div>
          <div>${T('home.s2')}</div>
          <div>${T('home.s3')}</div>
          <div class="row wrap-gap mt-s">
            <button class="btn sm" data-act="tab" data-id="select">${T('home.select')}</button>
            <button class="btn sm" data-act="chatToggle">${T('home.chat')}</button>
          </div>
        </div>
      </div>
    </div>`;

    const why = `
    <details class="fold mt">
      <summary>${T('home.why')}<span class="sub">${T('home.whySub')}</span></summary>
      <div class="fold-b">
        ${(window.Engine || window.E).matrix('V-J6P').map(m => `<div class="leaf" style="border-bottom:1px solid var(--line-2)">
          <span class="mono" style="width:76px;color:var(--muted)">${esc(m.axle ? m.axle.model : (zh ? '按旧件' : 'by old part'))}</span>
          <span class="arrow">→</span><b class="mono" style="width:86px">${esc(m.code)}</b>
          <span class="muted small flex1">${esc(m.fit)}</span>${o.confTag(m.conf)}
        </div>`).join('')}
        <div class="row wrap-gap mt-s">
          <button class="chip" data-act="example" data-id="${esc(ex[1])}">${LZ('试一下「J6P 457 后片」', 'Try “J6P 457 rear”')}</button>
          <button class="chip" data-act="tab" data-id="graph">${T('nav.graph')}</button>
        </div>
      </div>
    </details>`;

    return hero + about + cats + tools + news + contact + statline + (isCust ? '' : todoCard) + why + `
      <footer class="site-foot">
        <img src="assets/img/site/logo-site.png" alt="KOOYING">
        <span>© 2026 浙江冠英汽车零部件有限公司 · ZHEJIANG KOOYING AUTO PARTS CO., LTD. · 未经授权不得复制、镜像或二次分发</span>
        <span class="flex1"></span>
        <span class="muted">${zh ? '本站数据用于选型与报价演示' : 'Demo data for selection and quoting'}</span>
      </footer>`;
  }

  /* 视频 / 海报轮播 */
  function init() {
    if (window.__homeCleanup) { try { window.__homeCleanup(); } catch (e) { } }
    const v = document.getElementById('heroVideo');
    const slides = document.getElementById('heroSlides');
    const dots = document.getElementById('heroDots');
    if (!v || !slides) return;
    let idx = 0, videoOK = false, vi = 0, timer = null;

    const paintDots = n => {
      if (!dots) return;
      dots.innerHTML = Array.from({ length: n }).map((_, i) =>
        `<span class="hero-dot ${i === idx ? 'on' : ''}" data-i="${i}"></span>`).join('');
    };

    const showSlide = i => {
      idx = i % HERO_SLIDES.length;
      [...slides.children].forEach((el, k) => el.classList.toggle('on', k === idx));
      paintDots(HERO_SLIDES.length);
    };

    const startSlides = () => {
      slides.classList.remove('off');
      v.classList.remove('ready');
      showSlide(0);
      clearInterval(timer);
      timer = setInterval(() => showSlide(idx + 1), 6000);
    };

    const playVideo = i => {
      vi = i % VIDEOS.length;
      v.muted = true;
      v.src = VIDEOS[vi];
      try { v.load(); } catch (e) { }
      v.play().catch(() => { });
    };

    // 先把海报轮播显示出来：视频加载好之前不空着
    startSlides();
    playVideo(0);
    v.addEventListener('error', () => { if (!videoOK) startSlides(); });
    const reveal = () => {
      if (videoOK) return;
      videoOK = true;
      clearInterval(timer);
      v.classList.add('ready');
      slides.classList.add('off');
      paintDots(VIDEOS.length);
      v.play().catch(() => { });
    };
    v.addEventListener('loadeddata', reveal);
    v.addEventListener('canplay', reveal);
    v.addEventListener('playing', reveal);
    v.addEventListener('ended', () => { if (videoOK) playVideo(vi + 1); });
    setTimeout(() => { if (!videoOK) startSlides(); }, 3000);

    if (dots) dots.addEventListener('click', e => {
      const d = e.target.closest('.hero-dot'); if (!d) return;
      const i = +d.dataset.i;
      if (videoOK) playVideo(i); else showSlide(i);
    });

    // 视频显示方式：contain（完整显示，不裁切）/ cover（铺满，可能裁边）
    const fitBtn = document.getElementById('heroFit');
    let fit = 'contain';
    try { fit = localStorage.getItem('gy_hero_fit') || 'contain'; } catch (e) { }
    v.classList.toggle('cover', fit === 'cover');
    if (fitBtn) {
      fitBtn.textContent = fit === 'cover' ? '⤢' : '⛶';
      fitBtn.onclick = () => {
        const next = v.classList.contains('cover') ? 'contain' : 'cover';
        v.classList.toggle('cover', next === 'cover');
        fitBtn.textContent = next === 'cover' ? '⤢' : '⛶';
        try { localStorage.setItem('gy_hero_fit', next); } catch (e) { }
      };
    }

    // 页面切换后清理
    window.__homeCleanup = () => { clearInterval(timer); try { v.pause(); } catch (e) { } };
  }

  window.HOME_HTML = home;
  window.HOME_INIT = init;
})();