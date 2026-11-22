/* 数据接入 · RedFox —— 可视化版（平台 → 查询 → 图表） */
(function () {
  const PLATS = [
    ['tiktok', 'TikTok', '话题 / 关键词 / 账号'],
    ['facebook', 'Facebook', '帖子评论'],
    ['x', 'X (Twitter)', '关键词搜索']
  ];

  /* 每个平台可用的查询类型。path 走本地 /api/redfox/rest 代理 */
  const KINDS = {
    tiktok: [
      {
        id: 'topic', name: '话题作品', path: '/story/api/tiktok/ability/topicAwemeList',
        fields: [
          { k: 'ch_id', label: '话题 ID', ph: '2525872', req: true, hint: 'challengeId / hashtagId' },
          { k: 'topic', label: '话题名（仅显示用）', ph: 'charlidamelio' }
        ]
      },
      {
        id: 'video', name: '关键词视频', path: '/story/api/tiktok/ability/searchVideo',
        fields: [{ k: 'keyword', label: '关键词', ph: 'brake pads', req: true }]
      },
      {
        id: 'user', name: '账号搜索', path: '/story/api/tiktok/ability/searchUser',
        fields: [{ k: 'keyword', label: '关键词', ph: 'brake pad', req: true }]
      }
    ],
    facebook: [
      {
        id: 'post', name: '帖子评论', path: '/story/api/fb/postComment',
        fields: [{ k: 'url', label: '帖子链接（原样粘贴）', ph: 'https://www.facebook.com/reel/1746412686633900', req: true }]
      }
    ],
    x: [
      {
        id: 'search', name: '关键词搜索', path: '/story/api/x/search',
        fields: [
          { k: 'keyword', label: '关键词', ph: 'brake pads', req: true },
          { k: 'searchType', label: '搜索类型', select: [['Top', '热门'], ['Latest', '最新'], ['Media', '媒体'], ['People', '用户'], ['Lists', '列表']] }
        ]
      }
    ]
  };

  const KEY_LS = 'gy_redfox_key';
  const COUNT_LS = 'gy_redfox_count';

  const ST = {
    key: '', plat: 'tiktok', kind: 'topic', count: 20,
    args: {}, res: null, norm: null, err: '', busy: false, msg: ''
  };
  try { ST.key = localStorage.getItem(KEY_LS) || ''; } catch (e) { }
  try { ST.count = Number(localStorage.getItem(COUNT_LS)) || 20; } catch (e) { }

  const el = id => document.getElementById(id);
  const toast = m => { if (window.__toast) window.__toast(m); };
  const kindsOf = p => KINDS[p] || [];
  const curKind = () => kindsOf(ST.plat).find(k => k.id === ST.kind) || kindsOf(ST.plat)[0];

  /* ---------------- 数字格式化 ---------------- */
  function fmt(n) {
    if (n === null || n === undefined || n === '' || isNaN(Number(n))) return '—';
    n = Number(n);
    if (n < 10000) return String(n);
    if (n < 1e8) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '万';
    return (n / 1e8).toFixed(2).replace(/\.?0+$/, '') + '亿';
  }
  function tsShort(v) {
    if (!v) return '';
    if (typeof v === 'number') {
      const d = new Date(v < 1e12 ? v * 1000 : v);
      return isNaN(d) ? '' : (d.getMonth() + 1) + '-' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    const s = String(v);
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return m[2] + '-' + m[3];
    const d = new Date(s);
    return isNaN(d) ? s.slice(0, 16) : (d.getMonth() + 1) + '-' + d.getDate();
  }
  const pick = (o, ks) => { for (const k of ks) if (o && o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; return ''; };

  /* ---------------- 把各家返回归一成统一条目 ---------------- */
  function normalize(plat, kind, raw) {
    const d = (raw && raw.data) || raw || {};
    let arr = [];
    if (Array.isArray(d)) arr = d;
    else arr = d.workList || d.videos || d.list || d.comments || d.tweets || d.users || d.userList || d.items || [];

    const items = (arr || []).map(o => {
      if (plat === 'tiktok') {
        const st = o.statsData || o.statistics || {};
        const au = o.authorData || o.author || {};
        const vd = o.videoData || {};
        return {
          title: String(o.content || o.desc || o.title || '').replace(/\s+/g, ' ').trim(),
          author: au.userName || au.nickname || au.uniqueId || '—',
          handle: au.userHandle ? '@' + au.userHandle : '',
          avatar: au.avatarImage || au.avatar || '',
          time: tsShort(o.publishTime || o.createTime),
          link: o.shareLink || (o.workId ? 'https://www.tiktok.com/@' + (au.userHandle || '') + '/video/' + o.workId : ''),
          cover: vd.coverImage || o.coverUrl || '',
          m: {
            views: pick(st, ['viewCount', 'playCount']),
            likes: pick(st, ['likeCount', 'diggCount']),
            comments: pick(st, ['commentTotal', 'commentCount']),
            shares: pick(st, ['shareTotal', 'shareCount']),
            collects: pick(st, ['favoriteCount', 'collectCount'])
          }
        };
      }
      if (plat === 'x') {
        const u = o.user || {};
        return {
          title: String(o.text || '').replace(/\s+/g, ' ').trim(),
          author: u.displayName || o.username || '—',
          handle: o.username ? '@' + o.username : '',
          avatar: u.avatar || '',
          time: tsShort(o.createdAt),
          link: o.tweetId ? 'https://x.com/' + (o.username || 'i') + '/status/' + o.tweetId : '',
          cover: (Array.isArray(o.medias) && o.medias[0] && o.medias[0].coverUrl) || '',
          m: {
            views: pick(o, ['viewCount']),
            likes: pick(o, ['likeCount']),
            comments: pick(o, ['replyCount']),
            shares: pick(o, ['retweetCount']),
            collects: pick(o, ['bookmarkCount'])
          }
        };
      }
      // facebook
      const au = o.author || {};
      return {
        title: String(o.text || o.message || '').replace(/\s+/g, ' ').trim(),
        author: au.displayName || au.name || '—',
        handle: '',
        avatar: au.avatar || '',
        time: tsShort(o.publishedAt || o.createdTime),
        link: o.commentId ? 'https://www.facebook.com/' + (o.commentId || '') : '',
        cover: '',
        m: {
          views: '',
          likes: pick(o, ['likeCount', 'likes']),
          comments: '',
          shares: '',
          collects: ''
        }
      };
    }).filter(x => x.title || x.author !== '—');

    const sum = k => items.reduce((s, x) => s + (Number(x.m[k]) || 0), 0);
    const totals = { views: sum('views'), likes: sum('likes'), comments: sum('comments'), shares: sum('shares'), collects: sum('collects') };
    const hasViews = totals.views > 0;
    const metricKey = hasViews ? 'views' : 'likes';
    /* 表格与柱子保持同一顺序：按主指标降序 */
    items.sort((a, b) => (Number(b.m[metricKey]) || 0) - (Number(a.m[metricKey]) || 0));
    return { items, totals, metricKey, metricLabel: hasViews ? '播放' : '点赞', plat, kind };
  }

  /* ---------------- 图表（纯 CSS/SVG，零依赖） ---------------- */
  function barChart(norm, esc) {
    const key = norm.metricKey;
    const rows = norm.items
      .map((x, i) => ({ i, v: Number(x.m[key]) || 0, x }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 10);
    const max = Math.max.apply(null, rows.map(r => r.v)) || 1;
    if (!rows.length) return '<div class="muted small">没有可画的数值</div>';
    return `<div class="rf-bars">${rows.map((r, i) => `
      <div class="rf-bar-row">
        <div class="rf-bar-rank">${i + 1}</div>
        <div class="rf-bar-mid">
          <div class="rf-bar-name" title="${esc(r.x.title)}">${esc(r.x.author)}${r.x.handle ? ' <span class="muted">' + esc(r.x.handle) + '</span>' : ''}</div>
          <div class="rf-bar-track"><div class="rf-bar-fill" style="width:${Math.max(2, (r.v / max) * 100).toFixed(1)}%"></div></div>
        </div>
        <div class="rf-bar-val">${fmt(r.v)}</div>
      </div>`).join('')}</div>`;
  }

  function composition(norm) {
    const t = norm.totals;
    const segs = [
      ['点赞', t.likes, '#c2410c'],
      ['评论', t.comments, '#0f766e'],
      ['分享', t.shares, '#1d4ed8'],
      ['收藏', t.collects, '#7c3aed']
    ].filter(s => s[1] > 0);
    const total = segs.reduce((s, x) => s + x[1], 0);
    if (!total) return '<div class="muted small">该数据源没有互动字段</div>';
    return `<div class="rf-stack">${segs.map(([n, v, c]) =>
      `<div class="rf-stack-seg" style="width:${(v / total * 100).toFixed(1)}%;background:${c}" title="${n} ${fmt(v)}"></div>`).join('')}</div>
      <div class="rf-legend">${segs.map(([n, v, c]) =>
      `<span><i style="background:${c}"></i>${n} <b>${fmt(v)}</b></span>`).join('')}</div>`;
  }

  function tableHTML(norm, esc) {
    const show = norm.items.slice(0, 30);
    /* 只显示这组数据里真实存在的指标列，避免出现两列「点赞」或一整列「—」 */
    const cols = [
      { k: 'views', label: '播放', on: norm.totals.views > 0 },
      { k: 'likes', label: '点赞', on: norm.totals.likes > 0 },
      { k: 'comments', label: '评论', on: norm.totals.comments > 0 },
      { k: 'shares', label: '分享', on: norm.totals.shares > 0 }
    ].filter(c => c.on);
    return `<div class="rf-tbl-wrap"><table class="rf-tbl">
      <thead><tr><th>#</th><th>作者</th><th>内容</th>${cols.map(c => `<th>${c.label}</th>`).join('')}<th>时间</th></tr></thead>
      <tbody>${show.map((x, i) => `<tr>
        <td class="rf-num">${i + 1}</td>
        <td class="rf-au">${x.avatar ? `<img src="${esc(x.avatar)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}<span>${esc(x.author)}${x.link ? `<a href="${esc(x.link)}" target="_blank" rel="noopener" title="打开原帖">↗</a>` : ''}</span></td>
        <td class="rf-txt">${esc(x.title || '（无文字）')}</td>
        ${cols.map(c => `<td class="rf-num">${fmt(x.m[c.k])}</td>`).join('')}
        <td class="rf-num muted">${esc(x.time)}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }

  /* ---------------- 页面 ---------------- */
  function html(ctx) {
    const { esc, LZ } = ctx;
    const t2 = (zh, en) => (LZ ? LZ(zh, en) : zh);
    const kind = curKind();
    const platMeta = PLATS.find(p => p[0] === ST.plat) || PLATS[0];
    const n = ST.norm;

    return `
    <div class="rf-head">
      <div>
        <h1 style="margin:0">${t2('热门追踪', 'Trending')} · RedFox</h1>
        <div class="muted small">${t2('选平台 → 填一个词 → 直接出图和表。Key 只存在这台电脑，按次计费。', 'Pick a platform, type a keyword, get charts and a table. The key stays on this machine; calls are billed per request.')}</div>
      </div>
      <div class="rf-head-r">
        <span class="rf-pill ${ST.key ? 'on' : ''}">${ST.key ? t2('已配 Key', 'Key set') : t2('未配 Key', 'No key')}</span>
        <a class="btn sm" href="https://redfox.hk/skills" target="_blank" rel="noopener">Skills 广场 ↗</a>
      </div>
    </div>

    <div class="card rf-conn">
      <div class="card-h"><h3>① 连接</h3><span class="sub">RedFoxHub 后台 → API Key 管理</span></div>
      <div class="card-b">
        <div class="rf-conn-row">
          <input id="rfKey" type="password" value="${esc(ST.key)}" placeholder="${t2('粘贴 REDFOX_API_KEY', 'Paste REDFOX_API_KEY')}">
          <button class="btn primary sm" data-act="rfConnect">${ST.busy ? t2('连接中…', 'Connecting…') : t2('保存并测连接', 'Save & test')}</button>
          <button class="btn sm" data-act="rfClear">${t2('清除', 'Clear')}</button>
        </div>
        ${ST.err ? `<div class="rf-err">${esc(ST.err)}</div>` : (ST.msg ? `<div class="rf-ok">${esc(ST.msg)}</div>` : '')}
      </div>
    </div>

    <div class="card rf-q">
      <div class="card-h"><h3>② 查询</h3><span class="sub">${esc(platMeta[2])}</span></div>
      <div class="card-b">
        <div class="rf-plats">
          ${PLATS.map(([id, name]) => `<button class="rf-plat ${id === ST.plat ? 'on' : ''}" data-act="rfPlat" data-id="${id}">${esc(name)}</button>`).join('')}
        </div>
        <div class="rf-kinds">
          ${kindsOf(ST.plat).map(k => `<button class="chip ${k.id === ST.kind ? 'on' : ''}" data-act="rfKind" data-id="${esc(k.id)}">${esc(k.name)}</button>`).join('')}
        </div>
        <div class="sq-form rf-form">
          ${(kind.fields || []).map(f => `<label>${esc(f.label)}${f.req ? ' *' : ''}
            ${f.select
        ? `<select id="rfarg-${esc(f.k)}">${f.select.map(([v, lb]) => `<option value="${esc(v)}">${esc(lb)}</option>`).join('')}</select>`
        : `<input id="rfarg-${esc(f.k)}" value="${esc(ST.args[f.k] || '')}" placeholder="${esc(f.ph || '')}">`}
          </label>`).join('')}
          <label>${t2('取几条', 'Count')}
            <input id="rfcount" type="number" min="1" max="50" value="${ST.count}">
          </label>
        </div>
        <div class="row wrap-gap" style="margin-top:10px">
          <button class="btn primary" data-act="rfQuery">${ST.busy ? t2('查询中…', 'Loading…') : t2('开始查询', 'Search')}</button>
          ${n ? `<button class="btn sm" data-act="rfClearRes">${t2('清空结果', 'Clear')}</button>` : ''}
          <span class="tiny muted">${t2('单次约 ¥0.02–0.06', '≈ ¥0.02–0.06 per call')}</span>
        </div>
      </div>
    </div>

    ${n ? viz(ctx, n, esc, t2) : ''}

    <details class="fold">
      <summary>${t2('用 MCP 接进 AI 客户端（Claude / Codex）', 'Hook up MCP in your AI client')}<span class="sub">${t2('不走这个页面也能用', 'Use it outside this page')}</span></summary>
      <div class="fold-b small" style="line-height:1.8">
        <pre class="rf-json">${esc(mcpConfig())}</pre>
        <button class="btn sm" data-act="rfCopyMcp">${t2('复制 MCP 配置', 'Copy MCP config')}</button>
      </div>
    </details>`;
  }

  function viz(ctx, n, esc, t2) {
    const maxV = n.items.reduce((m, x) => Math.max(m, Number(x.m[n.metricKey]) || 0), 0);
    const avg = n.items.length ? (n.totals[n.metricKey] / n.items.length) : 0;
    const star = n.items.slice().sort((a, b) => (Number(b.m[n.metricKey]) || 0) - (Number(a.m[n.metricKey]) || 0))[0];

    return `
    <div class="card rf-viz">
      <div class="card-h">
        <h3>③ 结果</h3>
        <span class="sub">${esc((curKind() || {}).name || '')} · ${n.items.length} 条</span>
      </div>
      <div class="card-b">
        <div class="rf-kpis">
          <div class="rf-kpi"><span>样本</span><b>${n.items.length}</b><i>条</i></div>
          <div class="rf-kpi"><span>总${n.metricLabel}</span><b>${fmt(n.totals[n.metricKey])}</b></div>
          <div class="rf-kpi"><span>最热一条</span><b>${fmt(maxV)}</b><i>${esc((star && star.author) || '')}</i></div>
          <div class="rf-kpi"><span>平均${n.metricLabel}</span><b>${fmt(Math.round(avg))}</b></div>
        </div>

        <div class="rf-charts">
          <div class="rf-chart">
            <div class="rf-chart-t">Top 10 · 按${n.metricLabel}</div>
            ${barChart(n, esc)}
          </div>
          <div class="rf-chart">
            <div class="rf-chart-t">互动构成</div>
            ${composition(n)}
            <div class="rf-chart-t" style="margin-top:16px">数据口径</div>
            <div class="tiny muted" style="line-height:1.8">${t2(
      '播放 / 点赞 / 评论 / 分享 / 收藏均取自平台返回的原始字段，未做估算。',
      'Views / likes / comments / shares / saves come straight from the platform payload — nothing estimated.')}</div>
          </div>
        </div>

        <div class="rf-toolbar">
          <button class="btn sm" data-act="rfCopy">${t2('复制 JSON', 'Copy JSON')}</button>
          <button class="btn sm" data-act="rfImportLead">${t2('把作者存为线索', 'Save author as lead')}</button>
          <button class="btn sm" data-act="rfSaveIdea">${t2('存为选题', 'Save as idea')}</button>
        </div>

        ${tableHTML(n, esc)}

        <details class="fold" style="margin-top:12px">
          <summary>${t2('原始 JSON', 'Raw JSON')}<span class="sub">${t2('给核对用', 'for verification')}</span></summary>
          <div class="fold-b"><pre class="rf-json">${esc(JSON.stringify(ST.res, null, 2).slice(0, 6000))}</pre></div>
        </details>
      </div>
    </div>`;
  }

  function mcpConfig() {
    const list = ['tiktok', 'twitter', 'instagram', 'youtube', 'douyin', 'xiaohongshu', 'gongzhonghao', 'kuaishou', 'shipinhao', 'bilibili', 'jinritoutiao'];
    const servers = {};
    list.forEach(id => {
      servers['redfox-' + id + '-mcp'] = {
        url: 'https://mcp.redfox.hk/' + id + '/mcp',
        headers: { REDFOX_API_KEY: 'YOUR_API_KEY' }
      };
    });
    return JSON.stringify({ mcpServers: servers }, null, 2);
  }

  /* ---------------- 动作 ---------------- */
  function readArgs() {
    const k = curKind();
    const out = {};
    (k.fields || []).forEach(f => {
      const i = el('rfarg-' + f.k);
      if (!i) return;
      let v = i.value.trim();
      if (f.select && !v) v = f.select[0][0];
      out[f.k] = v;
    });
    const c = el('rfcount');
    if (c) { ST.count = Math.max(1, Math.min(50, Number(c.value) || 20)); try { localStorage.setItem(COUNT_LS, ST.count); } catch (e) { } }
    ST.args = out;
    return out;
  }

  function buildPayload(kind) {
    const a = ST.args;
    const p = { source: 'RedFox · 冠英选型中台' };
    if (ST.plat === 'tiktok') {
      p.count = ST.count;
      if (kind.id === 'topic') {
        p.ch_id = Number(a.ch_id) || 0;
        p.cursor = 0;
      } else {
        p.keyword = a.keyword || '';
        p.offset = 0;
      }
    } else if (ST.plat === 'facebook') {
      p.url = a.url || '';
      p.cursor = '';
    } else {
      p.keyword = a.keyword || '';
      p.searchType = a.searchType || 'Top';
    }
    return p;
  }

  async function runQuery(render) {
    const kind = curKind();
    const a = readArgs();
    const need = (kind.fields || []).find(f => f.req);
    if (need && !a[need.k]) { ST.err = '请先填：' + need.label; ST.msg = ''; render(); return; }
    if (!ST.key) { ST.err = '请先填 API Key'; ST.msg = ''; render(); return; }

    ST.busy = true; ST.err = ''; ST.msg = ''; render();
    try {
      const r = await fetch('/api/redfox/rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-redfox-key': ST.key },
        body: JSON.stringify({ path: kind.path, payload: buildPayload(kind) })
      });
      const j = await r.json();
      if (!j.ok) {
        ST.err = j.error || '查询失败';
        ST.norm = null; ST.res = j.data || null;
      } else {
        ST.res = j.data;
        ST.norm = normalize(ST.plat, kind.id, j.data);
        if (!ST.norm.items.length) { ST.err = '没有拿到条目，换个关键词或参数试试'; ST.norm = null; }
        else ST.msg = '已取回 ' + ST.norm.items.length + ' 条';
      }
    } catch (e) {
      ST.err = '请求失败（本地服务没开？用「启动.bat」）: ' + e.message;
      ST.norm = null;
    }
    ST.busy = false;
    render();
  }

  async function connect(render) {
    const i = el('rfKey');
    const k = i ? i.value.trim() : ST.key;
    ST.key = k; ST.err = ''; ST.msg = ''; ST.busy = true;
    try { localStorage.setItem(KEY_LS, k); } catch (e) { }
    if (!k) { ST.busy = false; ST.err = 'Key 不能为空'; render(); return; }
    try {
      const r = await fetch('/api/redfox/rest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-redfox-key': k },
        body: JSON.stringify({ path: '/story/api/tiktok/ability/topicAwemeList', payload: { ch_id: 2525872, cursor: 0, count: 1, source: 'conn-test' } })
      });
      const j = await r.json();
      if (j.ok) { ST.msg = '连接正常，可以查询了'; toast('连接正常'); }
      else { ST.err = '连接失败：' + (j.error || '未知'); }
    } catch (e) {
      ST.err = '本地服务未启动（用 启动.bat 打开）';
    }
    ST.busy = false;
    render();
  }

  function importLead(ctx) {
    const n = ST.norm;
    if (!n || !n.items.length) { toast('还没有可导入的结果'); return; }
    const o = n.items[0];
    ctx.addLead({
      id: 'L' + Date.now(), company: o.author || '未知作者', country: '',
      contact: o.handle || '', need: String(o.title || '').slice(0, 80), needZh: String(o.title || '').slice(0, 80),
      src: 'RedFox · ' + ST.plat + ' · ' + String(o.title || '').slice(0, 24),
      kind: '社媒', status: '待跟进',
      created: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tz: 'Asia/Shanghai', score: 62, product: []
    });
    toast('已导入线索：' + (o.author || ''));
  }

  function saveIdea() {
    const n = ST.norm;
    if (!n || !n.items.length) { toast('还没有可保存的结果'); return; }
    const o = n.items[0];
    try {
      const arr = JSON.parse(localStorage.getItem('gy_rf_ideas') || '[]');
      arr.push({ title: String(o.title || '').slice(0, 90), author: o.author, plat: ST.plat, at: Date.now() });
      localStorage.setItem('gy_rf_ideas', JSON.stringify(arr.slice(-50)));
    } catch (e) { }
    toast('已存为选题');
  }

  function copyJson() {
    const txt = JSON.stringify(ST.res, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('已复制 JSON'), () => toast('复制失败'));
    else toast('复制失败');
  }
  function copyMcp() {
    const txt = mcpConfig();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('MCP 配置已复制'), () => toast('复制失败'));
    else toast('复制失败');
  }

  window.REDFOX = {
    html, connect, runQuery, importLead, saveIdea, copyJson, copyMcp,
    state: ST,
    setPlatform(p) { if (ST.plat === p) return; ST.plat = p; ST.kind = (kindsOf(p)[0] || {}).id; ST.args = {}; ST.norm = null; ST.res = null; ST.err = ''; ST.msg = ''; },
    setKind(k) { ST.kind = k; ST.args = {}; ST.norm = null; ST.res = null; ST.err = ''; ST.msg = ''; },
    setKey(k) { ST.key = k; },
    clearKey() { ST.key = ''; ST.norm = null; ST.res = null; ST.err = ''; ST.msg = ''; try { localStorage.removeItem(KEY_LS); } catch (e) { } },
    clearRes() { ST.norm = null; ST.res = null; ST.err = ''; ST.msg = ''; }
  };
})();
