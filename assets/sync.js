/* 共享数据同步层（放到服务器上跑的时候才生效；file:// 打开自动关闭）
   服务端接口见 tools/server.js 的 /api/store。
   设计原则：
   - 服务端是「共享区」的唯一真相，本地 localStorage 继续当离线缓存
   - 每次写入先落本地再推服务端，失败也不影响当前操作
   - 轮询 15 秒拉一次，只有 seq 变了才重绘，避免页面闪烁 */
window.SYN = (function () {
  const COLLS = ['inquiries', 'quotes', 'settlements', 'aftersales'];
  const POLL_MS = 15000;

  let state = { on: false, seq: -1, at: 0, data: {} };
  COLLS.forEach(c => { state.data[c] = []; });
  let busy = false, timer = null, lastErr = '';

  function available() { return location.protocol !== 'file:'; }
  function on() { return state.on; }
  function seq() { return state.seq; }
  function at() { return state.at; }
  function err() { return lastErr; }
  function list(coll) { return (state.data[coll] || []).slice(); }

  async function ping() {
    if (!available()) return false;
    try {
      const r = await fetch('/api/store/ping', { cache: 'no-store' });
      const j = await r.json();
      state.on = !!(j && j.ok);
      return state.on;
    } catch (e) { state.on = false; lastErr = String(e.message || e); return false; }
  }

  async function pull() {
    if (!available() || busy) return null;
    busy = true;
    try {
      const r = await fetch('/api/store/all', { cache: 'no-store' });
      const j = await r.json();
      if (!j || !j.ok) { state.on = false; return null; }
      state.on = true;
      state.seq = Number(j.seq) || 0;
      state.at = Date.now();
      COLLS.forEach(c => { state.data[c] = Array.isArray((j.data || {})[c]) ? j.data[c] : []; });
      return j;
    } catch (e) {
      state.on = false; lastErr = String(e.message || e);
      return null;
    } finally { busy = false; }
  }

  async function post(path, body) {
    if (!available()) return null;
    try {
      const r = await fetch(path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      return await r.json();
    } catch (e) { lastErr = String(e.message || e); return null; }
  }

  async function add(coll, item) {
    const j = await post('/api/store/add', { coll: coll, item: item });
    if (j && j.ok && j.item) {
      state.data[coll] = (state.data[coll] || []).concat([j.item]);
      state.seq = Number(j.item.seq) || state.seq;
    }
    return j;
  }
  async function patch(coll, id, p) {
    const j = await post('/api/store/patch', { coll: coll, id: id, patch: p });
    if (j && j.ok && j.item) {
      const arr = state.data[coll] || [];
      const i = arr.findIndex(x => x.id === j.item.id);
      if (i >= 0) arr[i] = j.item; else arr.push(j.item);
    }
    return j;
  }
  async function del(coll, id) {
    const j = await post('/api/store/del', { coll: coll, id: id });
    if (j && j.ok) state.data[coll] = (state.data[coll] || []).filter(x => x.id !== id);
    return j;
  }

  /* 轮询：只有服务端 seq 变了才回调，避免无意义重绘 */
  function start(onChange) {
    stop();
    if (!available()) return;
    pull().then(j => { if (j) onChange && onChange(true); });
    timer = setInterval(async () => {
      const before = state.seq;
      const j = await pull();
      if (j && state.seq !== before) onChange && onChange(false);
    }, POLL_MS);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function forceRefresh() { return pull(); }

  return {
    COLLS: COLLS, available: available, on: on, seq: seq, at: at, err: err,
    list: list, ping: ping, pull: pull, add: add, patch: patch, del: del,
    start: start, stop: stop, refresh: forceRefresh
  };
})();