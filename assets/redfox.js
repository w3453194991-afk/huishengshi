/* 数据接入 · RedFox（新媒体数据技能） */
(function () {
  const PLATS = [
    ['tiktok', 'TikTok', '海外卡车司机 / 车队号最活跃'],
    ['instagram', 'Instagram', '中东 / 拉美汽配商常用'],
    ['youtube', 'YouTube', '长测评、安装教程'],
    ['twitter', 'X (Twitter)', '行业新闻、贸易商'],
    ['douyin', '抖音', '国内卡友、修理厂'],
    ['xiaohongshu', '小红书', '国内 C 端与门店'],
    ['gongzhonghao', '公众号', '行业媒体、经销商'],
    ['kuaishou', '快手', '下沉市场、卡车司机'],
    ['shipinhao', '视频号', '微信生态'],
    ['bilibili', 'B 站', '技术科普'],
    ['jinritoutiao', '今日头条', '资讯流']
  ];
  const KEY_LS = 'gy_redfox_key';

  const ST = { key: '', platform: 'tiktok', tools: [], tool: '', result: null, err: '', busy: false, idead: [] };

  try { ST.key = localStorage.getItem(KEY_LS) || ''; } catch (e) { }

  function el(id) { return document.getElementById(id); }
  function toast(m) { if (window.__toast) window.__toast(m); }

  /* 从返回结构里挖出「条目数组」 */
  function pickItems(data) {
    let best = null;
    const walk = (v, d) => {
      if (!v || d > 4) return;
      if (Array.isArray(v)) {
        if (v.length && typeof v[0] === 'object' && !best) {
          const o = v[0];
          if (o.title || o.desc || o.author || o.nickname || o.user_name || o.aweme_id || o.id) best = v;
        }
        v.slice(0, 3).forEach(x => walk(x, d + 1));
        return;
      }
      if (typeof v === 'object') Object.keys(v).slice(0, 12).forEach(k => walk(v[k], d + 1));
    };
    walk(data, 0);
    return best || [];
  }
  const field = (o, ks) => { for (const k of ks) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k]; return ''; };

  function html(ctx) {
    const { esc, LZ } = ctx;
    const t2 = (zh, en) => (LZ ? LZ(zh, en) : en);
    const t = ST.tools.length;
    const platName = (PLATS.find(p => p[0] === ST.platform) || PLATS[0])[1];
    const items = ST.result ? pickItems(ST.result) : [];

    return `
    <div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">
      <div>
        <h1 style="margin:0">${LZ('短视频接口', 'Short-video API')} · RedFox</h1>
        <div class="muted small">${t2('新媒体数据技能（TikTok / Instagram / YouTube / X / 抖音 / 小红书…）。Key 只存在这台电脑，调用按次计费。', 'Short-video data skills (TikTok / Instagram / YouTube / X / Douyin / Xiaohongshu…). The key stays on this machine; calls are billed per request.')}</div>
      </div>
      <a class="btn" href="https://redfox.hk/skills" target="_blank" rel="noopener">Skills 广场 ↗</a>
    </div>

    <div class="card">
      <div class="card-h"><h3>① 连接</h3><span class="sub">Key 在 RedFoxHub 后台 → API Key 管理</span></div>
      <div class="card-b">
        <div class="sq-form">
          <label class="wide">API Key
            <input id="rfKey" type="password" value="${esc(ST.key)}" placeholder="粘贴 REDFOX_API_KEY">
          </label>
        </div>
        <div class="row wrap-gap" style="margin-top:10px">
          <button class="btn primary sm" data-act="rfConnect">保存并测连接</button>
          <button class="btn sm" data-act="rfClear">清除 Key</button>
          ${ST.busy ? '<span class="tiny muted">连接中…</span>' : ''}
          ${ST.err ? `<span class="tiny c-lo">${esc(ST.err)}</span>` : (t ? `<span class="tiny" style="color:#166534">已连接 ${esc(platName)} · ${t} 个技能</span>` : '')}
        </div>
        <div class="row wrap-gap" style="margin-top:10px">
          ${PLATS.map(([id, name, tip]) => `<button class="chip ${id === ST.platform ? 'on' : ''}" data-act="rfPlat" data-id="${id}" title="${esc(tip)}">${esc(name)}</button>`).join('')}
        </div>
      </div>
    </div>

    ${t ? `<div class="card">
      <div class="card-h"><h3>② 选技能、填参数、跑</h3><span class="sub">${esc(platName)} · ${t} 个技能</span></div>
      <div class="card-b" style="padding:4px 0 8px">
        ${ST.tools.map(tool => {
          const props = (tool.inputSchema && tool.inputSchema.properties) || {};
          const req = (tool.inputSchema && tool.inputSchema.required) || [];
          const keys = Object.keys(props).slice(0, 6);
          return `<div class="rf-tool">
            <div class="rf-h">
              <b class="mono">${esc(tool.name)}</b>
              <span class="small muted">${esc(String(tool.description || '').replace(/\s+/g, ' ').slice(0, 110))}</span>
            </div>
            <div class="sq-form" style="margin-top:8px">
              ${keys.map(k => {
                const p = props[k] || {};
                const dv = p.default !== undefined ? p.default : '';
                return `<label>${esc(k)}${req.includes(k) ? ' *' : ''}
                  <input id="rf-arg-${esc(tool.name)}-${esc(k)}" value="${esc(dv)}" placeholder="${esc(String(p.description || '').slice(0, 40))}">
                </label>`;
              }).join('')}
            </div>
            <div class="row wrap-gap" style="margin-top:8px">
              <button class="btn primary sm" data-act="rfRun" data-id="${esc(tool.name)}">运行</button>
              <span class="tiny muted">按次计费</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : `<div class="card"><div class="card-b small muted" style="line-height:1.9">
      <b>还没连上。</b>三步：<br>
      1. 打开 <a href="https://redfox.hk/login" target="_blank" rel="noopener">redfox.hk</a> 注册登录 → 后台「API Key 管理」复制 Key；<br>
      2. 粘到上面的输入框，点「保存并测连接」；<br>
      3. 连上后，这里会列出该平台的全部技能（如 tiktok_search_videos / tiktok_search_users）。
    </div></div>`}

    ${ST.result ? `<div class="card">
      <div class="card-h"><h3>③ 结果</h3><span class="sub">${items.length ? '识别到 ' + items.length + ' 条' : '原始返回'}</span></div>
      <div class="card-b">
        <div class="row wrap-gap" style="margin-bottom:8px">
          <button class="btn sm" data-act="rfCopy">复制 JSON</button>
          ${items.length ? `<button class="btn sm primary" data-act="rfImportLead">把作者导入线索</button>
          <button class="btn sm" data-act="rfSaveIdea">存为选题</button>` : ''}
          <button class="btn sm" data-act="rfClearRes">清空结果</button>
        </div>
        ${items.length ? `<div class="rf-list">${items.slice(0, 8).map((o, i) => {
          const title = field(o, ['title', 'desc', 'content', 'text']);
          const who = field(o, ['author', 'nickname', 'user_name', 'unique_id', 'name']);
          const likes = field(o, ['likes', 'digg_count', 'like_count', 'favorite_count']);
          return `<div class="rf-item"><b>${i + 1}. ${esc(String(title).slice(0, 70) || '(无标题)')}</b>
            <span class="tiny muted">${esc(who)} ${likes ? '· ♥ ' + esc(likes) : ''}</span></div>`;
        }).join('')}</div>` : ''}
        <pre class="rf-json">${esc(JSON.stringify(ST.result, null, 2).slice(0, 4000))}</pre>
      </div>
    </div>` : ''}

    ${ST.idead.length ? `<div class="card">
      <div class="card-h"><h3>已收进选题</h3><span class="sub">可在「用户画像 · 获客内容」里继续做脚本</span></div>
      <div class="card-b">${ST.idead.slice(-10).reverse().map(x => `<div class="rf-item"><b>${esc(x.title)}</b><span class="tiny muted">${esc(x.platform)} · ${esc(x.author)}${x.likes ? ' · ♥ ' + esc(x.likes) : ''}</span></div>`).join('')}</div>
    </div>` : ''}

    <details class="fold">
      <summary>用 MCP 直接接进 AI 客户端（Claude / Codex / WorkBuddy）<span class="sub">不走这个页面也能用</span></summary>
      <div class="fold-b small" style="line-height:1.8">
        <div>把下面 JSON 贴进客户端的 MCP 配置，把 <span class="mono">YOUR_API_KEY</span> 换成你的 Key：</div>
        <pre class="rf-json" id="rfMcpJson">${esc(mcpConfig())}</pre>
        <button class="btn sm" data-act="rfCopyMcp">复制 MCP 配置</button>
        <div class="muted" style="margin-top:8px">文档：<a href="https://redfox.hk/mcp" target="_blank" rel="noopener">redfox.hk/mcp</a> · 单次 ¥0.02–0.06，按调用量阶梯</div>
      </div>
    </details>`;
  }

  function mcpConfig() {
    const list = PLATS.map(([id]) => ({
      mcpServers: {
        ['redfox-' + id + '-mcp']: {
          url: 'https://mcp.redfox.hk/' + id + '/mcp',
          headers: { REDFOX_API_KEY: 'YOUR_API_KEY' }
        }
      }
    }));
    const merged = { mcpServers: {} };
    list.forEach(x => Object.assign(merged.mcpServers, x.mcpServers));
    return JSON.stringify(merged, null, 2);
  }

  async function connect(render) {
    const k = el('rfKey') ? el('rfKey').value.trim() : ST.key;
    ST.key = k; ST.err = ''; ST.busy = true;
    try { localStorage.setItem(KEY_LS, k); } catch (e) { }
    try {
      const r = await fetch('/api/redfox/tools?platform=' + encodeURIComponent(ST.platform), { headers: { 'x-redfox-key': k } });
      const j = await r.json();
      if (!j.ok) { ST.err = j.error || '连接失败'; ST.tools = []; }
      else { ST.tools = j.tools || []; ST.err = ''; toast('已连接：' + ST.tools.length + ' 个技能'); }
    } catch (e) {
      ST.err = '本地服务未启动（用 启动.bat 打开）';
      ST.tools = [];
    }
    ST.busy = false;
    render();
  }

  function setPlatform(p) { ST.platform = p; ST.tools = []; ST.result = null; ST.err = ''; }

  async function run(toolName, render) {
    const props = {};
    const tool = ST.tools.find(t => t.name === toolName);
    const keys = tool && tool.inputSchema && tool.inputSchema.properties ? Object.keys(tool.inputSchema.properties) : [];
    keys.forEach(k => {
      const inp = el('rf-arg-' + toolName + '-' + k);
      if (inp && inp.value !== '') props[k] = inp.value;
    });
    ST.busy = true; ST.err = '';
    try {
      const r = await fetch('/api/redfox/call?platform=' + encodeURIComponent(ST.platform), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-redfox-key': ST.key },
        body: JSON.stringify({ tool: toolName, args: props })
      });
      const j = await r.json();
      if (!j.ok) { ST.err = j.error || '调用失败'; ST.result = null; }
      else { ST.result = j.data; toast('拿到 ' + (Array.isArray(j.data) ? j.data.length : '') + ' 条'); }
    } catch (e) {
      ST.err = '请求失败：' + e.message;
    }
    ST.busy = false;
    render();
  }

  function importLead(ctx) {
    const items = pickItems(ST.result);
    if (!items.length) { toast('结果里没有可导入的条目'); return; }
    const o = items[0];
    const who = String(field(o, ['author', 'nickname', 'user_name', 'unique_id', 'name']) || '未知作者');
    const title = String(field(o, ['title', 'desc', 'content', 'text']) || '');
    const lead = {
      id: 'L' + Date.now(), company: who, country: ST.platform === 'tiktok' ? '' : '',
      contact: '', need: title.slice(0, 80), needZh: title.slice(0, 80),
      src: 'RedFox · ' + ST.platform + ' · ' + title.slice(0, 24),
      kind: '社媒', status: '待跟进',
      created: new Date().toISOString().slice(0, 16).replace('T', ' '),
      tz: 'Asia/Shanghai', score: 62, product: []
    };
    ctx.addLead(lead);
    toast('已导入线索：' + who);
  }

  function saveIdea() {
    const items = pickItems(ST.result);
    if (!items.length) { toast('结果里没有可保存的条目'); return; }
    const o = items[0];
    ST.idead.push({
      title: String(field(o, ['title', 'desc', 'content', 'text']) || '').slice(0, 90),
      author: String(field(o, ['author', 'nickname', 'user_name', 'unique_id']) || ''),
      likes: String(field(o, ['likes', 'digg_count', 'like_count']) || ''),
      platform: ST.platform
    });
    toast('已存为选题');
  }

  function copyJson() {
    const txt = JSON.stringify(ST.result, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('已复制 JSON'), () => toast('复制失败'));
    else toast('复制失败');
  }
  function copyMcp() {
    const txt = mcpConfig();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => toast('MCP 配置已复制'), () => toast('复制失败'));
    else toast('复制失败');
  }

  window.REDFOX = {
    html, connect, run, setPlatform, importLead, saveIdea, copyJson, copyMcp, mcpConfig,
    state: ST,
    setKey: k => { ST.key = k; },
    clearKey: () => { ST.key = ''; ST.tools = []; ST.result = null; try { localStorage.removeItem(KEY_LS); } catch (e) { } },
    clearRes: () => { ST.result = null; }
  };
})();