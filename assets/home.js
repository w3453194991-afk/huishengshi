/* 首页（官网风格）：视频/海报大图 + 关于 + 产品类别 + 工具入口 + 新闻 + 联系 */
(function () {
  const HERO_SLIDES = [
    'assets/img/site/hero-kids-1.svg',
    'assets/img/site/hero-kids-2.svg',
    'assets/img/site/hero-kids-3.svg'
  ];
  const VIDEOS = [];

  const NEWS = [
    { d: '2026.12.02', t: '棉豆童装 2027 春夏订货会（杭州）', s: '杭州国际博览中心 · 展位 3B-21 · 现场看样衣', tag: '订货会' },
    { d: '2026.07.18', t: '织里童装产业园三期投产，针织产能翻倍', s: '湖州 · 新增 6 条圆机产线，交期缩短 5 天', tag: '公司新闻' },
    { d: '2026.05.12', t: '2026 春夏新品发布：有机棉家居服系列', s: 'GOTS 认证面料，A 类标准，sizes 80–150', tag: '新品' }
  ];

  const CATS = [
    { k: '上衣', en: 'Tops', n: 22, img: 'assets/img/kids/tee.svg', d: 'T恤 / POLO / 卫衣 / 衬衫，90–160 码，纯棉与莫代尔' },
    { k: '裤子', en: 'Bottoms', n: 20, img: 'assets/img/kids/jogger.svg', d: '运动裤 / 牛仔裤 / 背带裤 / 短裤，100–160 码' },
    { k: '裙装', en: 'Dresses', n: 16, img: 'assets/img/kids/tutu.svg', d: '纱裙 / A 字裙 / 针织裙 / 碎花裙，90–150 码' },
    { k: '外套', en: 'Outerwear', n: 14, img: 'assets/img/kids/windbreaker.svg', d: '风衣 / 棉服 / 冲锋衣 / 防晒衣，100–160 码' },
    { k: '套装', en: 'Sets', n: 8, img: 'assets/img/kids/tracksuit.svg', d: '短袖短裤套 / 卫衣卫裤套，出货省搭配' },
    { k: '家居服', en: 'Homewear', n: 10, img: 'assets/img/kids/pajama.svg', d: '分体家居服 / 睡袋 / 哈衣，A 类标准' }
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
        <div class="hero-kicker">湖州棉豆服饰有限公司 · HUZHOU MIANDOU GARMENT</div>
        <h1 class="hero-h1">${zh ? '安心面料 · 好穿好洗' : 'Safe fabrics. Easy wear, easy wash.'}</h1>
        <p class="hero-p">${zh
          ? '专注童装 12 年 · 90 个款号 / 9 个尺码 / 12 个场景 / 708 条搭配关系'
          : '12 years in kidswear · 90 styles / 9 sizes / 12 scenes / 708 pairings'}</p>
        <div class="hero-cta">
          <button class="btn primary lg" data-act="tab" data-id="products">${zh ? '款式中心' : 'Catalog'}</button>
          <button class="btn ghost lg" data-act="tab" data-id="select">${zh ? '智能选款' : 'Find my style'}</button>
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
        <div><h2>${zh ? '关于棉豆' : 'About MIANDOU'}</h2>
        <p>${zh ? '从面料到出货，一条线做完' : 'From fabric to shipment, one line'}</p></div>
        <button class="btn sm" data-act="tab" data-id="products">${zh ? '查看产品' : 'View products'} ›</button>
      </div>
      <div class="about-grid">
        <div class="about-pic"><img src="assets/img/site/about.jpg" alt="MIANDOU factory"></div>
        <div class="about-txt">
          <p>${zh
            ? '湖州棉豆服饰有限公司创立于 2014 年，位于中国童装之都——浙江湖州织里，厂房面积 12000 平方米，专注 0–14 岁童装的设计、打样、生产与出口。'
            : 'Founded in 2014 in Zhili, Huzhou — China’s kidswear hub — MIANDOU runs a 12,000 m² plant for design, sampling, production and export of 0–14 kids wear.'}</p>
          <p>${zh
            ? '主营针织与梭织童装，覆盖上衣、裤装、裙装、外套、套装与家居服六条产线，年产 300 万件；通过 GB 31701 A 类、OEKO-TEX 100 与 BSCI 审核，出口东南亚、中东、欧洲与南美。'
            : 'Six lines cover tops, bottoms, dresses, outerwear, sets and homewear — 3 million pieces a year, certified to GB 31701 A class, OEKO-TEX 100 and BSCI, shipped to Southeast Asia, the Middle East, Europe and South America.'}</p>
          <div class="about-stats">
            <div><b>12000<span>㎡</span></b><i>${zh ? '厂房面积' : 'plant area'}</i></div>
            <div><b>120<span>+</span></b><i>${zh ? '在职员工' : 'employees'}</i></div>
            <div><b>40<span>+</span></b><i>${zh ? '出口国家' : 'export markets'}</i></div>
          </div>
        </div>
      </div>
    </section>`;

    const cats = `
    <section class="site-sec">
      <div class="sec-head">
        <div><h2>${zh ? '产品类别' : 'Product categories'}</h2>
        <p>${zh ? '上衣 · 裤子 · 裙装 · 外套 · 套装 · 家居服' : 'Tops · Bottoms · Dresses · Outerwear · Sets · Homewear'}</p></div>
        <button class="btn sm" data-act="tab" data-id="products">${zh ? '全部款号' : 'All styles'} ›</button>
      </div>
      <div class="cat-grid">
        ${CATS.map(c => `<div class="cat-card" data-act="openCat" data-id="${c.k}">
          <div class="cat-img"><img src="${c.img}" alt=""></div>
          <div class="cat-body">
            <div class="cat-t">${zh ? c.k : c.en}</div>
            <div class="cat-n">${c.n} ${zh ? '个款号' : 'part numbers'}</div>
            <div class="cat-d">${c.d}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="row wrap-gap" style="margin-top:12px">
        ${['童装套装总成', '离合器面片', '其他配件'].map(k => `<button class="chip" data-act="openCat" data-id="${k}">${k}</button>`).join('')}
      </div>
    </section>`;

    const tools = `
    <section class="site-sec">
      <div class="sec-head">
        <div><h2>${zh ? '工具入口' : 'Workspace'}</h2>
        <p>${zh ? '选款 · 报价 · 资料，一条线走完' : 'Match, quote and pack in one flow'}</p></div>
      </div>
      <div class="tool-grid">
        <button class="tool-card" data-act="tab" data-id="select"><span class="ti">◎</span><b>${zh ? '智能选款' : 'Smart match'}</b><i>${zh ? '适用场景 / 尺码 / 旧款编码 → 候选款号 + 消歧问题' : 'Vehicle, axle or old code to ranked candidates'}</i></button>
        <button class="tool-card" data-act="tab" data-id="products"><span class="ti">▤</span><b>${zh ? '产品库' : 'Catalog'}</b><i>${zh ? st.products + ' 个款号，含规格、面料、编码与缩略图' : st.products + ' parts with specs, codes and photos'}</i></button>
        <button class="tool-card" data-act="tab" data-id="custom"><span class="ti">✂</span><b>${zh ? '自定义定制' : 'Custom parts'}</b><i>${zh ? '非标尺寸 / 面料 / 包装 / 打标，提交后 2 小时回方案' : 'Non-standard size, material, packing or marking'}</i></button>
        <button class="tool-card" data-act="tab" data-id="aftersale"><span class="ti">☎</span><b>${zh ? '售后服务' : 'After-sales'}</b><i>${zh ? '尺码不合适、色差、开线，提交后销售和老板都能看到' : 'Size, colour or stitching issues — sales and the owner both see it'}</i></button>
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="quote"><span class="ti">￥</span><b>${zh ? '报价单' : 'Quotation'}</b><i>${zh ? '阶梯价 + 运费，生成可打印 PDF' : 'Tier pricing, freight, printable PDF'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="pack"><span class="ti">▣</span><b>${zh ? '资料包' : 'Data pack'}</b><i>${zh ? '报价 + 产品页 + 试验 + 确认页，打包 ZIP' : 'Quote, data sheets, tests — one ZIP'}</i></button>` : ''}

        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="network"><span class="ti">◉</span><b>${zh ? '用户画像' : 'Profiles'}</b><i>${zh ? '画像 / 检索式搜客户 / 短视频选题，一个入口三段切换' : 'Profiles, buyer search and content studio in one entry'}</i></button>` : ''}
        ${!isCust ? `<button class="tool-card" data-act="tab" data-id="xref"><span class="ti">⇄</span><b>${zh ? '编号对照' : 'Cross reference'}</b><i>${zh ? 'WVA / FMSI / OE / 尺码 → 自家款号，还差什么一眼看到' : 'WVA, FMSI, OE or axle to your part number'}</i></button>` : ''}
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
          <p class="muted">${zh ? '留下适用场景和数量，我们按阶梯价回你。' : 'Leave your vehicle and quantity; we reply with tier pricing.'}</p>
          <ul class="contact-list">
            <li><b>${zh ? '地址' : 'Address'}</b> ${zh ? '浙江省湖州市湖州经济技术开发区石林路 398 号' : '398 Shilin Rd, Huzhou Economic Zone, Zhejiang, China'}</li>
            <li><b>${zh ? '电话' : 'Tel'}</b> +86-0572-2087 398</li>
            <li><b>${zh ? '邮箱' : 'Email'}</b> 20721803@qq.com</li>
          </ul>
          <div class="row wrap-gap">
            <button class="btn primary" data-act="askPrice">${zh ? '提交询价' : 'Send inquiry'}</button>
            <button class="btn" data-act="tab" data-id="select">${zh ? '先选款' : 'Match a part first'}</button>
          </div>
        </div>
      </div>
    </section>`;

    const statline = `
    <div class="statline">
      <span><b>${st.products}</b> ${T('nav.products')}</span>
      <span><b>${st.codes}</b> ${T('h.codes')}</span>
      <span><b>${st.vehicles}</b> ${T('h.apps')}</span>
      <span><b>${st.axles}</b> ${zh ? '尺码' : 'axles'}</span>
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
        : `<div class="muted small" style="padding:16px 0">${zh ? '今天没有待办。直接搜一个款号，或去「用户画像 · 获客内容」做一条脚本。' : 'Nothing pending. Search a part, or open Content to draft a video.'}</div>`}
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
        ${(window.Engine || window.E).matrix('V-KG').map(m => `<div class="leaf" style="border-bottom:1px solid var(--line-2)">
          <span class="mono" style="width:76px;color:var(--muted)">${esc(m.axle ? m.axle.model : (zh ? '按旧款号' : 'by old code'))}</span>
          <span class="arrow">→</span><b class="mono" style="width:86px">${esc(m.code)}</b>
          <span class="muted small flex1">${esc(m.fit)}</span>${o.confTag(m.conf)}
        </div>`).join('')}
        <div class="row wrap-gap mt-s">
          <button class="chip" data-act="example" data-id="${esc(ex[0])}">${LZ('试一下「100 码 短袖T恤」', 'Try “size 100 tee”')}</button>
          <button class="chip" data-act="tab" data-id="graph">${T('nav.graph')}</button>
        </div>
      </div>
    </details>`;

    return hero + about + cats + tools + news + contact + statline + (isCust ? '' : todoCard) + why + `
      <footer class="site-foot">
        <img src="assets/img/site/logo-site.png" alt="MIANDOU">
        <span>© 2026 湖州棉豆服饰有限公司 · HUZHOU MIANDOU GARMENT CO., LTD.</span>
        <span class="flex1"></span>
        <span class="muted">${zh ? '本站数据用于选款与报价演示' : 'Demo data for selection and quoting'}</span>
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
      if (!VIDEOS.length) return;
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