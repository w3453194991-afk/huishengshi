// 本地静态服务（零依赖）。用途：让浏览器以 http 方式打开，localStorage / 打印 / 下载更稳。
// 支持 Range（大视频拖动/秒开必须）、HEAD、Content-Length。
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8765;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.csv': 'text/csv; charset=utf-8',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.db': 'application/octet-stream', '.zip': 'application/zip',
  '.md': 'text/markdown; charset=utf-8'
};

/* ---------- RedFox MCP 代理（浏览器无法直连，走本地服务中转） ---------- */
const RF_BASE = 'https://mcp.redfox.hk';
const RF_PLATFORMS = ['douyin', 'xiaohongshu', 'gongzhonghao', 'kuaishou', 'shipinhao', 'bilibili',
  'jinritoutiao', 'tiktok', 'twitter', 'youtube', 'instagram'];

function sseJson(text) {
  const out = [];
  String(text).split(/\r?\n/).forEach(line => {
    const m = /^data:\s*(.+)$/.exec(line.trim());
    if (!m) return;
    try { out.push(JSON.parse(m[1])); } catch (e) { }
  });
  return out;
}

async function rfRpc(platform, key, method, params, id) {
  const url = RF_BASE + '/' + platform + '/mcp';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'REDFOX_API_KEY': key || ''
    },
    body: JSON.stringify(Object.assign({ jsonrpc: '2.0', method }, id ? { id } : {}, { params: params || {} })),
    signal: AbortSignal.timeout(30000)
  });
  const text = await res.text();
  return { status: res.status, msgs: sseJson(text), text };
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

async function redfoxApi(req, res) {
  const u = url.parse(req.url, true);
  const key = req.headers['x-redfox-key'] || u.query.key || '';
  const platform = String(u.query.platform || '').toLowerCase();

  /* ---- REST 直连代理：/api/redfox/rest ---- */
  if (u.pathname === '/api/redfox/rest' && req.method === 'POST') {
    try {
      let body = '';
      await new Promise((resolve, reject) => {
        req.on('data', c => { body += c; if (body.length > 2e6) reject(new Error('请求体过大')); });
        req.on('end', resolve);
        req.on('error', reject);
      });
      const p = JSON.parse(body || '{}');
      const apiPath = String(p.path || '');
      // 白名单：只允许打到 redfox 的故事线接口，避免变成任意请求转发器
      if (!/^\/story\/api\/[A-Za-z0-9_\/.-]+$/.test(apiPath)) {
        return sendJson(res, 400, { ok: false, error: '非法接口路径' });
      }
      const r = await (async () => {
        let lastErr;
        for (let i = 0; i < 2; i++) {
          try {
            return await fetch('https://redfox.hk' + apiPath, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-API-KEY': key, 'User-Agent': 'QoderWork/1.0' },
              body: JSON.stringify(p.payload || {}),
              signal: AbortSignal.timeout(60000)
            });
          } catch (e) {
            lastErr = e;
            if (i === 0) await new Promise(r2 => setTimeout(r2, 800));
          }
        }
        throw lastErr;
      })();
      const text = await r.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = text; }
      if (r.status !== 200) return sendJson(res, 200, { ok: false, error: 'HTTP ' + r.status, data });
      if (data && data.code !== undefined && data.code !== 2000) {
        return sendJson(res, 200, { ok: false, error: data.msg || ('code=' + data.code), code: data.code, data });
      }
      return sendJson(res, 200, { ok: true, platform, path: apiPath, data });
    } catch (e) {
      return sendJson(res, 200, { ok: false, error: String(e && e.message || e) });
    }
  }

  if (!RF_PLATFORMS.includes(platform)) return sendJson(res, 400, { ok: false, error: '未知平台: ' + platform });

  try {
    if (u.pathname === '/api/redfox/tools') {
      await rfRpc(platform, key, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'gy-hub', version: '1' } }, 1);
      const r = await rfRpc(platform, key, 'tools/list', {}, 2);
      const msg = r.msgs.find(x => x.id === 2) || r.msgs[0] || {};
      if (msg.error) return sendJson(res, 200, { ok: false, error: msg.error.message || 'tools/list 失败' });
      const tools = (msg.result && msg.result.tools) || [];
      return sendJson(res, 200, { ok: true, platform, count: tools.length, tools });
    }
    if (u.pathname === '/api/redfox/call' && req.method === 'POST') {
      let body = '';
      await new Promise((resolve, reject) => {
        req.on('data', c => { body += c; if (body.length > 2e6) reject(new Error('请求体过大')); });
        req.on('end', resolve);
        req.on('error', reject);
      });
      const p = JSON.parse(body || '{}');
      const tool = String(p.tool || '');
      if (!tool) return sendJson(res, 400, { ok: false, error: '缺少 tool' });
      await rfRpc(platform, key, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'gy-hub', version: '1' } }, 1);
      const r = await rfRpc(platform, key, 'tools/call', { name: tool, arguments: p.args || {} }, 2);
      const msg = r.msgs.find(x => x.id === 2) || r.msgs[0] || {};
      if (msg.error) return sendJson(res, 200, { ok: false, error: msg.error.message || '调用失败' });
      const result = msg.result || {};
      const structured = result.structuredContent;
      if (structured && structured.error) return sendJson(res, 200, { ok: false, error: structured.message || structured.error, code: structured.code });
      const raw = (result.content || []).filter(c => c.type === 'text').map(c => c.text).join('\n');
      let data = raw;
      try { data = JSON.parse(raw); } catch (e) { }
      return sendJson(res, 200, { ok: true, platform, tool, data });
    }
    return sendJson(res, 404, { ok: false, error: 'not found' });
  } catch (e) {
    return sendJson(res, 200, { ok: false, error: String(e && e.message || e) });
  }
}

http.createServer((req, res) => {
  if (req.url.indexOf('/api/redfox') === 0) return redfoxApi(req, res);
  let rel = decodeURIComponent(url.parse(req.url).pathname);
  if (rel === '/') rel = '/index.html';
  const fp = path.join(ROOT, rel);
  // 防目录穿越
  if (!fp.startsWith(ROOT)) { res.writeHead(403); return res.end('403'); }
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + rel);
    }
    const type = MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream';
    const total = st.size;
    const base = {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
      'Accept-Ranges': 'bytes',
      'Content-Length': total
    };

    const range = req.headers.range;
    if (range && /^bytes=/.test(range)) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : total - 1;
      if (!m) { res.writeHead(200, base); return fs.createReadStream(fp).pipe(res); }
      if (start >= total || end < start) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }
      if (end >= total) end = total - 1;
      res.writeHead(206, {
        'Content-Type': type,
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': end - start + 1
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(fp, { start, end }).pipe(res);
    }

    res.writeHead(200, base);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(fp).pipe(res);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  冠英 · 选型与报价中台已启动');
  console.log('  浏览器打开： http://127.0.0.1:' + PORT + '/index.html');
  console.log('  关闭本窗口即停止服务。');
  console.log('');
});
