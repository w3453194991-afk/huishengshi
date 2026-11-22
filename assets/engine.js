/* 引擎：查询理解 / 选款匹配 / 报价 / 资料包 / ZIP */
window.Engine = (function () {
  const D = window.DB;

  /* ---------- 基础 ---------- */
  const norm = s => String(s == null ? '' : s).toUpperCase().replace(/[\s\u3000\-_.\/\\()（）【】\[\]，,。:：;；'"`~!！?？、+*#]/g, '');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => Number(n).toFixed(2);

  function lev(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length; if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }

  /* ---------- 索引 ---------- */
  const byId = new Map(D.products.map(p => [p.id, p]));
  const codeMap = new Map();       // norm -> [ {pid, code, type, conf} ]
  const codeFlat = [];             // 所有编码，用于包含匹配
  D.codes.forEach(c => {
    if (!codeMap.has(c.norm)) codeMap.set(c.norm, []);
    codeMap.get(c.norm).push(c);
    codeFlat.push(c);
  });
  const vAlias = [], aAlias = [];
  D.vehicles.forEach(v => {
    [v.model, v.series, ...v.alias].forEach(a => { const n = norm(a); if (n.length >= 2) vAlias.push({ n, v }); });
  });
  D.axles.forEach(a => {
    [a.model, ...a.alias].forEach(x => { const n = norm(x); if (n.length >= 2) aAlias.push({ n, a }); });
  });
  const fitsByV = new Map(), fitsByA = new Map(), fitsByP = new Map();
  D.fitments.forEach(f => {
    if (f.vid) { if (!fitsByV.has(f.vid)) fitsByV.set(f.vid, []); fitsByV.get(f.vid).push(f); }
    if (f.aid) { if (!fitsByA.has(f.aid)) fitsByA.set(f.aid, []); fitsByA.get(f.aid).push(f); }
    if (!fitsByP.has(f.pid)) fitsByP.set(f.pid, []); fitsByP.get(f.pid).push(f);
  });
  const testsByP = new Map();
  D.tests.forEach(t => { if (!testsByP.has(t.pid)) testsByP.set(t.pid, []); testsByP.get(t.pid).push(t); });

  const CONF = { '已确认': 14, '高': 10, '中': 4, '低': -6 };
  const confTag = c => c === '已确认' || c === '高' ? 'g' : c === '中' ? 'y' : 'r';
  const typeLabel = t => {
    const M = {
      OE: ['OE 原厂号', 'OE number'], WVA: ['WVA 号', 'WVA number'],
      '客户叫法': ['客户叫法', "Customer's name"], '工厂码': ['工厂码', 'Factory code'],
      '内部码': ['内部码', 'Internal code'], '竞品码': ['竞品码', 'Competitor code']
    };
    const zh = !window.I18N || window.I18N.getLang() === 'zh';
    const p = M[t];
    return p ? (zh ? p[0] : p[1]) : t;
  };

  /* ---------- 查询理解 ---------- */
  const POSWORDS = { '大童': '大', '少年': '大', 'junior': '大', '小童': '小', '幼童': '小', 'kids': '小', '婴童': '婴', 'baby': '婴', '新生儿': '婴', 'newborn': '婴' };
  const MATWORDS = { '陶瓷': 'CM', 'ceramic': 'CM', '半金属': 'SM', 'semi': 'SM', '低金属': 'LM', 'lowmetallic': 'LM', 'nao': 'NAO', '无石棉': 'NAO', '芳纶': 'HD', '重载': 'HD', 'heavy': 'HD', '风电': 'WT' };

  function parse(q) {
    const raw = String(q || '');
    const qn = norm(raw);
    const qLow = raw.toLowerCase();
    const entities = [];
    let vehicle = null, axle = null, pos = null, mat = null, qty = null;
    const codeHits = [];

    // 数量
    const qm = qLow.match(/(\d{2,5})\s*(套|片|件|组|pcs|sets?|set|pairs?)/);
    if (qm) { qty = Number(qm[1]); entities.push({ k: '数量', v: qty + ' ' + qm[2], c: '来自询盘原文' }); }
    else { const qm2 = raw.match(/(?:数量|qty|quantity)\s*[:：]?\s*(\d{2,5})/i); if (qm2) { qty = Number(qm2[1]); entities.push({ k: '数量', v: qty + ' 套', c: '来自询盘原文' }); } }

    // 位置
    for (const k in POSWORDS) if (qLow.includes(k.toLowerCase())) { pos = POSWORDS[k]; break; }
    if (pos) entities.push({ k: '部位', v: pos + '轮 / ' + (pos === '前' ? 'front' : 'rear'), c: '关键词识别' });

    // 面料
    for (const k in MATWORDS) if (qLow.includes(k.toLowerCase())) { mat = MATWORDS[k]; break; }
    if (mat) entities.push({ k: '面料诉求', v: D.materials.find(m => m.id === mat).name, c: '客户指定配方' });

    // 适用场景（最长别名优先）
    let bestV = 0, vHit = '';
    vAlias.forEach(x => { if (qn.includes(x.n) && x.n.length > bestV) { bestV = x.n.length; vehicle = x.v; vHit = x.n; } });
    if (vehicle) entities.push({ k: '适用场景', v: `${vehicle.brand} ${vehicle.series} ${vehicle.model}`, c: `命中别名「${vHit}」` });

    // 尺码
    let bestA = 0, aHit = '';
    aAlias.forEach(x => { if (qn.includes(x.n) && x.n.length > bestA) { bestA = x.n.length; axle = x.a; aHit = x.n; } });
    if (axle) entities.push({ k: '尺码', v: `${axle.brand} ${axle.model}（${axle.type} ${axle.cap}）`, c: `命中别名「${aHit}」` });

    // 编码：包含匹配（取最长）+ 模糊
    let bestCode = null;
    codeFlat.forEach(c => {
      if (c.norm.length < 4 || !/[0-9]/.test(c.norm)) return;
      if (qn.includes(c.norm) && (!bestCode || c.norm.length > bestCode.norm.length)) bestCode = c;
    });
    if (bestCode) {
      codeHits.push(bestCode);
      entities.push({ k: '编码', v: bestCode.code, c: `命中 ${typeLabel(bestCode.type)}` });
    } else if (qn.length >= 4) {
      let bestD = 3;
      codeFlat.forEach(c => {
        if (Math.abs(c.norm.length - qn.length) > 2 || c.norm.length < 5) return;
        const d = lev(qn, c.norm);
        if (d < bestD) { bestD = d; codeHits.length = 0; codeHits.push(c); }
      });
      if (bestD <= 1 && codeHits.length) {
        entities.push({ k: '编码', v: codeHits[0].code, c: `模糊匹配（编辑距离 ${bestD}）` });
      }
    }

    if (!entities.length) entities.push({ k: '输入', v: raw.slice(0, 26) || '（空）', c: '未识别到结构化实体' });
    return { raw, qn, vehicle, axle, pos, mat, qty, codeHits, entities };
  }

  /* ---------- 匹配 ---------- */
  function match(q) {
    const p = parse(q);
    const cand = new Map();
    const add = (pid, score, reason) => {
      if (!pid || !byId.has(pid)) return;
      const cur = cand.get(pid) || { pid, score: 0, reasons: [] };
      if (score > cur.score) cur.score = score;
      if (reason && !cur.reasons.includes(reason)) cur.reasons.push(reason);
      cand.set(pid, cur);
    };

    // 1) 编码
    p.codeHits.slice(0, 4).forEach(c => {
      add(c.pid, c.type === 'OE' ? 98 : 96, `命中编码 <b>${esc(c.code)}</b>（${typeLabel(c.type)}，来源：${esc(c.source)}）`);
    });
    // 2) 适用场景 × 尺码
    if (p.vehicle) {
      const fs = fitsByV.get(p.vehicle.id) || [];
      fs.forEach(f => {
        const ax = f.aid ? D.axles.find(a => a.id === f.aid) : null;
        let s = 70 + (CONF[f.conf] || 0);
        const rs = [`适用场景匹配：${esc(f.vName)}`];
        if (ax) rs.push(`尺码匹配：${esc(ax.brand + ' ' + ax.model)}（${ax.type}）`);
        if (p.pos && f.pos === p.pos) { s += 6; rs.push(`部位一致：${f.pos}轮`); }
        if (p.pos && f.pos && f.pos !== p.pos) { s -= 8; rs.push(`注意：本关系为${f.pos}轮，与询价部位不同`); }
        if (p.axle && ax && p.axle.id === ax.id) { s += 14; rs.push('尺码已确认，可直接锁定'); }
        rs.push(`适用类型：${esc(f.fit)}｜置信度：${esc(f.conf)}｜来源：${esc(f.src)}`);
        add(f.pid, s, rs.join('<br>'));
      });
    }
    // 3) 尺码
    if (p.axle) {
      (fitsByA.get(p.axle.id) || []).forEach(f => {
        const s = 62 + (CONF[f.conf] || 0) + (p.pos && f.pos === p.pos ? 6 : 0);
        add(f.pid, s, `尺码匹配：${esc(p.axle.brand + ' ' + p.axle.model)}<br>适用：${esc(f.vName)}｜${esc(f.fit)}｜置信度 ${esc(f.conf)}`);
      });
    }
    // 4) 产品名 / 编码全文兜底
    if (!cand.size && p.qn.length >= 3) {
      D.products.forEach(pr => {
        const hay = norm(pr.code + ' ' + pr.nameEn + ' ' + pr.cat + ' ' + pr.desc.slice(0, 200));
        if (hay.includes(p.qn)) add(pr.id, 55, `产品名/描述包含「${esc(p.raw.slice(0, 30))}」`);
        else {
          const tk = p.qn.match(/[A-Z0-9]{4,}/g) || [];
          tk.slice(0, 3).forEach(t => { if (hay.includes(t)) add(pr.id, 42, `关键词命中：${esc(t)}`); });
        }
      });
    }

    let list = [...cand.values()].sort((a, b) => b.score - a.score).slice(0, 8);
    // 面料提示
    list = list.map(c => {
      const pr = byId.get(c.pid);
      let note = '';
      if (p.mat && pr.material !== p.mat) note = `客户指定 <b>${D.materials.find(m => m.id === p.mat).name}</b>，本品默认 ${D.materials.find(m => m.id === pr.material).name}，下单时可指定配方`;
      return { ...c, product: pr, note };
    });

    const top = list[0];
    const questions = [];
    if (top) {
      const fs = fitsByP.get(top.pid) || [];
      (fs[0] && fs[0].q || []).forEach(x => questions.push(x));
    }
    const vFitCount = p.vehicle ? (fitsByV.get(p.vehicle.id) || []).length : 0;
    if (p.vehicle && vFitCount > 1) {
      const axNames = [...new Set((fitsByV.get(p.vehicle.id) || []).map(f => f.aid ? D.axles.find(a => a.id === f.aid) : null).filter(Boolean).map(a => `${a.brand} ${a.model}`))];
      questions.unshift(`<b>${esc(p.vehicle.brand + ' ' + p.vehicle.series + ' ' + p.vehicle.model)}</b> 在本库有 ${axNames.length} 种尺码配置（${axNames.map(esc).join(' / ')}），仅凭适用场景不能唯一锁定——需确认尺码或数旧片孔数。`);
      if (!p.axle) questions.push('让客户拍尺码铭牌，或直接数旧片孔数（8 孔 / 15 孔 / 16 孔差异最明显）。');
    }
    if (p.vehicle && !p.axle) {
      const options = (fitsByV.get(p.vehicle.id) || []).map(f => {
        const ax = f.aid ? D.axles.find(a => a.id === f.aid) : null;
        const pr = byId.get(f.pid);
        return `<li>${ax ? esc(ax.brand + ' ' + ax.model + '（' + ax.spec + '）') : '按旧款确认'} → <b>${esc(pr.code)}</b>（${esc(f.pos)}轮 · ${esc(f.conf)}）</li>`;
      });
      if (options.length > 1) questions.push('可能的对应关系：<ul style="margin:4px 0 0;padding-left:16px">' + options.join('') + '</ul>');
    }
    if (top && top.score < 80 && p.qn.length >= 3) questions.push('当前匹配为推断结果，请核对旧款尺寸或编码后再报价。');

    const L = (zh, en) => { try { return window.I18N && window.I18N.getLang() !== 'zh' ? en : zh; } catch (e) { return zh; } };
    const grade = !top ? { l: L('无匹配', 'No match'), c: 'c-lo' } : top.score >= 90 ? { l: L('可直接报价', 'Ready to quote'), c: 'c-hi' }
      : top.score >= 75 ? { l: L('高置信 · 建议一次确认', 'High confidence · confirm once'), c: 'c-hi' }
      : top.score >= 58 ? { l: L('需消歧', 'Needs disambiguation'), c: 'c-mid' } : { l: L('需人工处理', 'Needs manual review'), c: 'c-lo' };

    return { entities: p.entities, parsed: p, candidates: list, questions, grade, top };
  }

  /* ---- 适用场景 → 尺码 → 款号 矩阵 ---- */
  function matrix(vid) {
    const fs = fitsByV.get(vid) || [];
    return fs.map(f => ({
      axle: f.aid ? D.axles.find(a => a.id === f.aid) : null,
      pos: f.pos, code: f.code, pid: f.pid, product: byId.get(f.pid), fit: f.fit, conf: f.conf, src: f.src, q: f.q
    }));
  }

  /* ---------- 报价 ---------- */
  const TIERS = [{ min: 1000, f: .82 }, { min: 300, f: .88 }, { min: 100, f: .94 }, { min: 0, f: 1 }];
  const GRADES = { A: .97, B: 1, C: 1.03, '': 1 };
  const LEVELS = { '大客户': .95, '标准': 1, '经济': .96, '': 1 };
  const tierOf = q => TIERS.find(t => q >= t.min).f;
  const tierName = q => q >= 1000 ? '1000+ 套' : q >= 300 ? '300–999 套' : q >= 100 ? '100–299 套' : '1–99 套';

  function priceOf(pid, qty, customer, matId) {
    const pr = byId.get(pid);
    const mat = D.materials.find(m => m.id === (matId || pr.material)) || D.materials[0];
    const base = pr.price * mat.factor * tierOf(qty) * (GRADES[customer?.grade] || 1) * (LEVELS[customer?.priceLevel] || 1);
    return Math.max(0.5, Math.round(base * 100) / 100);
  }

  function quoteCalc(items, customer) {
    let amount = 0, qty = 0;
    const rows = items.map(it => {
      const pr = byId.get(it.pid);
      const unit = priceOf(it.pid, it.qty, customer, it.mat);
      const amt = unit * it.qty;
      amount += amt; qty += it.qty;
      return { ...it, product: pr, unit, amt, tier: tierName(it.qty) };
    });
    const freight = items.reduce((s, it) => {
      const pr = byId.get(it.pid);
      return s + (pr.pack.cbm * it.qty / 40) * 120;
    }, 0);
    return { rows, amount, qty, freight: Math.round(freight * 100) / 100, total: Math.round((amount + freight) * 100) / 100 };
  }

  /* ---------- 线索评分 ---------- */
  function scoreLead(l) {
    const name = (l.company || '').toLowerCase();
    const trading = /trading|import|export|fze|贸易|进出口/.test(name);
    const terminal = /fleet|transport|taller|repair|center|母婴连锁|修理|物流|运输/.test(name) || /母婴连锁|修理厂/.test(l.note || '');
    const spec = (l.product || []).length ? 14 : (/howo|j6|bpw|actros|j6p|豪沃|解放|德龙|天龙|fvr|npr|hino/i.test(l.need || '') ? 10 : 0);
    const vol = /(\d{2,5})\s*(sets?|套|pcs|片|unidades|台)/i.test(l.need || '') ? 12 : 0;
    const reach = l.contact && l.contact !== '—' ? 10 : 0;
    const base = 30;
    let s = base + (terminal ? 18 : 0) - (trading ? 14 : 0) + spec + vol + reach + (l.tz ? 4 : 0);
    s = Math.max(5, Math.min(99, Math.round(s)));
    const reasons = [
      terminal ? '终端属性：母婴连锁/修理厂/物流（+18）' : '未见终端属性（0）',
      trading ? '名称/备注含贸易商特征（-14）' : '未见贸易商特征（0）',
      spec ? '需求含具体适用场景或款号（+14）' : '需求描述笼统（0）',
      vol ? '含明确数量/母婴连锁规模（+12）' : '未给数量（0）',
      reach ? '有实名联系人（+10）' : '无联系人（0）'
    ];
    const tier = s >= 75 ? { l: 'A 优先跟进', c: 'g' } : s >= 55 ? { l: 'B 常规跟进', c: 'y' } : { l: 'C 暂缓投入', c: 'n' };
    return { score: s, reasons, tier, trading, terminal };
  }

  /* ---------- 当地时间 ---------- */
  function localTime(tz) {
    try {
      const now = new Date();
      const f = new Intl.DateTimeFormat('zh-CN', { timeZone: tz || 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' });
      const parts = f.formatToParts(now);
      const hh = parts.find(p => p.type === 'hour')?.value || '00';
      const mm = parts.find(p => p.type === 'minute')?.value || '00';
      const h = Number(hh);
      return { text: `${hh}:${mm}`, working: h >= 9 && h < 18, hour: h };
    } catch (e) { return { text: '--:--', working: false, hour: 0 }; }
  }

  /* ---------- 文档：报价单 ---------- */
  function docQuote({ customer, items, no, date, valid, incoterm, pay, remark }) {
    const calc = quoteCalc(items, customer);
    const co = D.meta.company;
    const rows = calc.rows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><b>${esc(r.product.code)}</b><br><span style="font-size:9px;color:#666">${esc(r.product.nameEn.slice(0, 70))}</span></td>
        <td>${esc(r.product.cat)}<br><span style="font-size:9px;color:#666">${esc(D.materials.find(m => m.id === (r.mat || r.product.material)).name)}</span></td>
        <td>${esc(r.product.dim || '—')}</td>
        <td class="right">${r.qty}</td>
        <td class="right">${money(r.unit)}</td>
        <td class="right">${money(r.amt)}</td>
      </tr>`).join('');
    return `
    <div class="p-page">
      <div class="p-head">
        <div>
          <div class="p-logo">${esc(co.nameEn)}</div>
          <div style="font-size:9px;color:#555;margin-top:2px">${esc(co.site)} ｜ ${esc(co.certs.slice(0, 3).join(' · '))}</div>
        </div>
        <div class="right" style="font-size:10px">
          <div style="font-size:16px;font-weight:800;letter-spacing:1px">QUOTATION</div>
          <div>No. ${esc(no)}</div><div>Date: ${esc(date)}</div><div>Valid: ${esc(valid)}</div>
        </div>
      </div>
      <div style="display:flex;gap:24px;margin-bottom:10px;font-size:10.5px">
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:3px">TO / 客户</div>
          <div>${esc(customer.name)}</div>
          <div style="color:#555">${esc(customer.country)} · ${esc(customer.type)} · ${esc(customer.incoterm || '')}</div>
        </div>
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:3px">TERMS / 条款</div>
          <div>Incoterm: ${esc(incoterm || customer.incoterm || 'FOB Ningbo')}</div>
          <div>Payment: ${esc(pay || customer.pay || 'T/T 30% deposit')}</div>
          <div>Currency: USD</div>
        </div>
      </div>
      <table class="p-table">
        <thead><tr><th>#</th><th>Item / 款号</th><th>Type / 类型</th><th>Size / 规格</th><th class="right">Qty</th><th class="right">Unit (USD)</th><th class="right">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="6" class="right"><b>Goods subtotal</b></td><td class="right"><b>${money(calc.amount)}</b></td></tr>
          <tr><td colspan="6" class="right">Freight estimate</td><td class="right">${money(calc.freight)}</td></tr>
          <tr><td colspan="6" class="right"><span class="p-tot">TOTAL (USD)</span></td><td class="right"><span class="p-tot">${money(calc.total)}</span></td></tr>
        </tfoot>
      </table>
      <div style="display:flex;gap:24px;margin-top:10px;font-size:9.5px">
        <div style="flex:1">
          <div style="font-weight:700;margin-bottom:3px">REMARKS</div>
          <div>${esc(remark || `Quantity tier applied: ${tierName(calc.qty)}. Lead time 25–35 days after deposit. Packing: ${esc(calc.rows[0]?.product.pack.per || '标准出口包装')}.`)}</div>
          <div style="margin-top:6px">Validity 30 days. Prices exclude bank charges. Certificate of origin available on request.</div>
        </div>
        <div style="width:180px">
          <div style="font-weight:700;margin-bottom:3px">FOR AND ON BEHALF OF</div>
          <div>${esc(co.nameEn)}</div>
          <div style="height:34px"></div>
          <div style="border-top:1px solid #333;padding-top:3px">Authorized Signature</div>
        </div>
      </div>
      <div class="p-note">${esc(co.name)} ｜ ${esc(co.web)} ｜ 本报价单由「棉豆 · 选款与报价中台」自动生成，款号依据见适用关系与试验报告附页。</div>
    </div>`;
  }

  /* ---------- 文档：产品资料页 ---------- */
  function docProduct(pr, { customer, withImage = true } = {}) {
    const mat = D.materials.find(m => m.id === pr.material) || D.materials[0];
    const ts = testsByP.get(pr.id) || [];
    const fs = fitsByP.get(pr.id) || [];
    const codes = D.codes.filter(c => c.pid === pr.id);
    return `
    <div class="p-page">
      <div class="p-head">
        <div><div class="p-logo">${esc(D.meta.company.nameEn)}</div>
        <div style="font-size:9px;color:#555">PRODUCT DATA SHEET · ${esc(pr.catEn)}</div></div>
        <div class="right" style="font-size:9px;color:#555">${esc(pr.sku)}<br>Rev. ${esc(D.meta.built)}</div>
      </div>
      <div style="display:flex;gap:14px">
        <div style="width:34%">
          ${withImage && pr.img ? `<img src="${esc(pr.img)}" style="width:100%;border:1px solid #ccc;border-radius:4px">` : '<div style="height:120px;border:1px solid #ccc;border-radius:4px"></div>'}
          <div style="font-size:8.5px;color:#666;margin-top:3px">Image for reference only.</div>
        </div>
        <div style="flex:1">
          <div style="font-size:17px;font-weight:800;letter-spacing:.5px">${esc(pr.code)}</div>
          <div style="font-size:10px;color:#555;margin-bottom:6px">${esc(pr.nameEn.slice(0, 90))}</div>
          <table class="p-table">
            <tr><th style="width:31%">Type 类型</th><td>${esc(pr.cat)} / ${esc(pr.catEn)}</td></tr>
            <tr><th>Position 部位</th><td>${esc(pr.pos ? pr.pos + '轮' : '按适用适用场景')}</td></tr>
            <tr><th>Size 规格</th><td>${esc(pr.dim || '待确认（见适用页）')}${pr.holes ? ' · ' + pr.holes + ' 孔' : ''}</td></tr>
            <tr><th>Material 面料</th><td>${esc(mat.name)} / ${esc(mat.nameEn)}（μ ${esc(mat.mu)}，${esc(mat.temp)}）</td></tr>
            <tr><th>Brand 品牌</th><td>${esc(pr.brand)}</td></tr>
            <tr><th>Packing 包装</th><td>${esc(pr.pack.per)}；毛重 ${pr.pack.gw} kg/箱；${pr.pack.cbm} CBM/箱</td></tr>
            <tr><th>HS Code</th><td>${esc(pr.hs)}</td></tr>
            <tr><th>MOQ</th><td>${pr.moq} ${pr.cat === '风电童装' ? '件' : '套'}</td></tr>
          </table>
        </div>
      </div>
      <div style="display:flex;gap:14px;margin-top:10px">
        <div style="flex:1">
          <div style="font-weight:700;font-size:10px;border-bottom:1px solid #999;padding-bottom:2px;margin-bottom:4px">CROSS REFERENCE / 编码对照</div>
          <table class="p-table"><thead><tr><th>Code</th><th>Type</th><th>Source</th></tr></thead><tbody>
          ${codes.slice(0, 8).map(c => `<tr><td>${esc(c.code)}</td><td>${esc(typeLabel(c.type))}</td><td>${esc(c.source)}</td></tr>`).join('') || '<tr><td colspan="3">—</td></tr>'}
          </tbody></table>
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:10px;border-bottom:1px solid #999;padding-bottom:2px;margin-bottom:4px">FITMENT / 适用适用场景</div>
          <table class="p-table"><thead><tr><th>Vehicle</th><th>Axle</th><th>Conf.</th></tr></thead><tbody>
          ${fs.slice(0, 6).map(f => `<tr><td>${esc(f.vName)}</td><td>${esc(f.aName)}</td><td>${esc(f.conf)}</td></tr>`).join('') || '<tr><td colspan="3">通用件，按旧款确认</td></tr>'}
          </tbody></table>
        </div>
      </div>
      ${ts.length ? `<div style="margin-top:10px">
        <div style="font-weight:700;font-size:10px;border-bottom:1px solid #999;padding-bottom:2px;margin-bottom:4px">TEST REPORT / 试验报告摘要</div>
        <table class="p-table"><thead><tr><th>Standard</th><th>Item</th><th>Result</th><th>Lab</th><th>Report No.</th><th>Date</th></tr></thead><tbody>
        ${ts.map(t => `<tr><td>${esc(t.std)}</td><td>${esc(t.item)}</td><td>${esc(t.result)}</td><td>${esc(t.lab)}</td><td>${esc(t.no)}</td><td>${esc(t.date)}</td></tr>`).join('')}
        </tbody></table></div>` : ''}
      <div class="p-note">数据来源：${esc(D.meta.company.name)} 产品目录与检测台账。规格以实际产品为准；如与旧款不符，以实物测绘结果为准。</div>
    </div>`;
  }

  function docCover({ customer, items, date, no }) {
    const co = D.meta.company;
    return `<div class="p-page">
      <div style="height:40px"></div>
      <div style="font-size:11px;letter-spacing:3px;color:#777">TECHNICAL &amp; COMMERCIAL PACKAGE</div>
      <div style="font-size:30px;font-weight:800;margin:6px 0 2px">产品与报价资料包</div>
      <div style="font-size:13px;color:#444">${esc(co.nameEn)}</div>
      <div style="height:18px"></div>
      <table class="p-table" style="font-size:11px">
        <tr><th style="width:26%">Customer 客户</th><td>${esc(customer.name)}（${esc(customer.country)} · ${esc(customer.type)}）</td></tr>
        <tr><th>Reference 编号</th><td>${esc(no)}</td></tr>
        <tr><th>Date 日期</th><td>${esc(date)}</td></tr>
        <tr><th>Items 款号</th><td>${items.map(it => esc(byId.get(it.pid).code)).join(' · ')}</td></tr>
        <tr><th>Prepared by 编制</th><td>棉豆选款与报价中台（数据版本 ${esc(D.meta.version)}）</td></tr>
      </table>
      <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.7">
        <b>本资料包包含：</b>封面 · 报价单 · 产品数据页（含图片/编码对照/适用/试验报告）· 装箱与装柜参数 · 免责与确认页。<br>
        <b>选款依据：</b>适用场景 / 尺码 / 旧款编码三路校验，每条适用关系标注来源与置信度。<br>
        <b>重要提示：</b>同一适用场景可能配不同尺码，若客户未确认尺码，请在发货前核对旧款尺寸或编码（见确认页）。
      </div>
      <div style="margin-top:20px;font-size:9px;color:#666;border-top:1px solid #ccc;padding-top:6px">
        ${esc(co.name)} ｜ ${esc(co.site)} ｜ ${esc(co.capacity)} ｜ ${esc(co.certs.join(' · '))}
      </div>
    </div>`;
  }

  function docConfirm({ items, customer }) {
    const rows = items.map(it => {
      const pr = byId.get(it.pid);
      const fs = (fitsByP.get(pr.id) || [])[0];
      const qs = (fs && fs.q || []).concat(['旧款尺寸（长×宽×厚）是否与资料页一致？', '尺码铭牌/孔数是否已拍照确认？']);
      return `<tr><td><b>${esc(pr.code)}</b></td><td>${qs.slice(0, 3).map(esc).join('<br>')}</td></tr>`;
    }).join('');
    return `<div class="p-page">
      <div class="p-head"><div class="p-logo">${esc(D.meta.company.nameEn)}</div><div class="right" style="font-size:9px">ORDER CONFIRMATION</div></div>
      <div style="font-size:13px;font-weight:700;margin-bottom:6px">发货前确认页 / Pre-shipment confirmation</div>
      <div style="font-size:10px;color:#444;margin-bottom:8px">为避免「同适用场景不同尺码」导致的错发，请客户逐项确认。任一项不符，请立即联系我们重新匹配。</div>
      <table class="p-table"><thead><tr><th style="width:18%">Model</th><th>需客户确认（任一方式即可：尺码铭牌 / 旧款照片带尺 / 旧款编码）</th></tr></thead><tbody>${rows}</tbody></table>
      <div style="margin-top:14px;font-size:10px">
        <div>客户确认人 / Confirmed by：__________________</div>
        <div style="margin-top:12px">日期 / Date：__________________　　签章 / Stamp：</div>
      </div>
      <div class="p-note">Technical support: 棉豆研发部 · 匹配依据存档于选款中台（可追溯到每条适用关系的来源与复核人）。</div>
    </div>`;
  }

  function docPack({ customer, items, no, date }) {
    return docCover({ customer, items, no, date })
      + docQuote({ customer, items, no, date, valid: '30 days' })
      + items.map(it => docProduct(byId.get(it.pid), { customer })).join('')
      + docConfirm({ items, customer });
  }

  /* ---------- ZIP（store，无压缩）---------- */
  const crcTable = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c >>> 0;
    }
    return t;
  })();
  const crc32 = bytes => {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  };
  const enc = s => new TextEncoder().encode(s);
  function dosTime(d = new Date()) {
    return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2), date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
  }
  function makeZip(files) {
    const parts = [], central = [];
    let offset = 0;
    const t = dosTime();
    files.forEach(f => {
      const name = enc(f.name);
      const data = f.data instanceof Uint8Array ? f.data : enc(f.data);
      const crc = crc32(data);
      const head = new Uint8Array(30 + name.length);
      const dv = new DataView(head.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
      dv.setUint16(10, t.time, true); dv.setUint16(12, t.date, true); dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, name.length, true);
      head.set(name, 30);
      parts.push(head, data);
      const ch = new Uint8Array(46 + name.length);
      const cdv = new DataView(ch.buffer);
      cdv.setUint32(0, 0x02014b50, true); cdv.setUint16(4, 20, true); cdv.setUint16(6, 20, true); cdv.setUint16(8, 0x0800, true);
      cdv.setUint16(10, 0, true); cdv.setUint16(12, t.time, true); cdv.setUint16(14, t.date, true);
      cdv.setUint32(16, crc, true); cdv.setUint32(20, data.length, true); cdv.setUint32(24, data.length, true);
      cdv.setUint16(28, name.length, true); cdv.setUint32(42, offset, true);
      ch.set(name, 46);
      central.push(ch);
      offset += head.length + data.length;
    });
    const cdSize = central.reduce((s, c) => s + c.length, 0);
    const eocd = new Uint8Array(22);
    const edv = new DataView(eocd.buffer);
    edv.setUint32(0, 0x06054b50, true); edv.setUint16(8, files.length, true); edv.setUint16(10, files.length, true);
    edv.setUint32(12, cdSize, true); edv.setUint32(16, offset, true);
    return new Blob([...parts, ...central, eocd], { type: 'application/zip' });
  }

  function csv(rows) {
    return rows.map(r => r.map(x => {
      const s = String(x == null ? '' : x);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\r\n');
  }

  async function packFiles({ customer, items, no, date }) {
    const pr = items.map(it => byId.get(it.pid));
    // 把图片一起打进去，客户解压后直接能看到图（否则 HTML 里的相对路径在别人电脑上是空图）
    const imgFiles = [], imgMap = new Map();
    for (const p of pr) {
      if (!p.img) continue;
      const nm = 'img/' + p.img.split('/').pop();
      if (!imgMap.has(p.id)) imgMap.set(p.id, nm);
      if (!imgFiles.some(f => f.name === nm)) {
        try {
          const r = await fetch(p.img);
          if (r.ok) imgFiles.push({ name: nm, data: new Uint8Array(await r.arrayBuffer()) });
        } catch (e) { }
      }
    }
    const calc = quoteCalc(items, customer);
    const specRows = [['SKU', '款号', '英文名', '类型', '部位', '规格', '面料', '品牌', 'MOQ', '包装', 'HS', '单价USD', '数量']]
      .concat(calc.rows.map(r => [r.product.sku, r.product.code, r.product.nameEn, r.product.cat, r.product.pos, r.product.dim, r.product.material, r.product.brand, r.product.moq, r.product.pack.per, r.product.hs, r.unit, r.qty]));
    const codeRows = [['款号', '编码', '编码类型', '来源', '置信度']]
      .concat(pr.flatMap(p => D.codes.filter(c => c.pid === p.id).map(c => [p.code, c.code, c.type, c.source, c.conf])));
    const fitRows = [['款号', '适用场景', '尺码', '部位', '适用类型', '置信度', '来源']]
      .concat(pr.flatMap(p => (fitsByP.get(p.id) || []).map(f => [p.code, f.vName, f.aName, f.pos, f.fit, f.conf, f.src])));
    const readme = `棉豆 · 产品与报价资料包\n编号：${no}\n客户：${customer.name}（${customer.country}）\n日期：${date}\n\n文件说明：\n1) 报价单.html       —— 可直接打开/打印为 PDF\n2) 产品规格.csv      —— 款号、规格、面料、包装、单价\n3) 编码对照.csv      —— 款号与 OE/WVA/工厂码/客户叫法的对应关系\n4) 适用关系.csv      —— 适用场景/尺码与款号的对应关系（含置信度与来源）\n5) 产品数据页.html   —— 含图片、编码对照、适用与试验报告摘要（打印为 PDF 用）\n\n重要提示：同一适用场景可能配多种尺码。发货前请客户确认尺码铭牌、旧款照片（带尺）或旧款编码任一即可。\n技术支持：${D.meta.company.name} 研发部\n`;
    const qHtml = `<!doctype html><meta charset="utf-8"><title>报价单 ${no}</title>
<style>body{font-family:"Segoe UI","Microsoft YaHei",sans-serif;margin:28px;color:#111}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}th,td{border:1px solid #bbb;padding:6px 8px}
th{background:#f2f2f2;text-align:left}h1{font-size:18px;margin:0}small{color:#666}
.right{text-align:right}</style>
<h1>${esc(D.meta.company.nameEn)}</h1><small>${esc(D.meta.company.name)} ｜ ${esc(D.meta.company.site)}</small>
<h2>QUOTATION ${esc(no)} · ${esc(date)}</h2>
<p><b>TO：</b>${esc(customer.name)}（${esc(customer.country)} · ${esc(customer.type)}）<br>
<b>Incoterm：</b>${esc(customer.incoterm)} ｜ <b>Payment：</b>${esc(customer.pay)} ｜ <b>Currency：</b>USD</p>
<table><thead><tr><th>#</th><th>Model 款号</th><th>Type 类型</th><th>Size 规格</th><th class="right">Qty</th><th class="right">Unit</th><th class="right">Amount</th></tr></thead>
<tbody>${calc.rows.map((r, i) => `<tr><td>${i + 1}</td><td><b>${esc(r.product.code)}</b><br><small>${esc(r.product.nameEn.slice(0, 60))}</small></td><td>${esc(r.product.cat)}</td><td>${esc(r.product.dim || '—')}</td><td class="right">${r.qty}</td><td class="right">${money(r.unit)}</td><td class="right">${money(r.amt)}</td></tr>`).join('')}</tbody>
<tfoot><tr><td colspan="6" class="right"><b>Goods subtotal</b></td><td class="right"><b>${money(calc.amount)}</b></td></tr>
<tr><td colspan="6" class="right">Freight (est.)</td><td class="right">${money(calc.freight)}</td></tr>
<tr><td colspan="6" class="right"><b>TOTAL USD</b></td><td class="right"><b>${money(calc.total)}</b></td></tr></tfoot></table>
<p><small>Validity 30 days · Lead time 25–35 days after deposit · Data version ${esc(D.meta.version)}</small></p>`;
    const pHtml = `<!doctype html><meta charset="utf-8"><title>产品数据页</title>
<style>body{font-family:"Segoe UI","Microsoft YaHei",sans-serif;margin:24px;color:#111}
.p{page-break-after:always;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:11px}
th,td{border:1px solid #bbb;padding:4px 6px}th{background:#f2f2f2;text-align:left}h2{font-size:16px;margin:0 0 6px}
img{max-width:180px;border:1px solid #ccc}</style>
${pr.map(p => {
      const mat = D.materials.find(m => m.id === p.material) || D.materials[0];
      const ts = testsByP.get(p.id) || [];
      return `<div class="p"><h2>${esc(p.code)} · ${esc(p.catEn)}</h2>
${imgMap.get(p.id) ? `<img src="${esc(imgMap.get(p.id))}">` : ''}
<table><tr><th>Type</th><td>${esc(p.cat)}</td><th>Material</th><td>${esc(mat.name)} μ ${esc(mat.mu)}</td></tr>
<tr><th>Size</th><td>${esc(p.dim || '—')}</td><th>Packing</th><td>${esc(p.pack.per)}</td></tr>
<tr><th>Brand</th><td>${esc(p.brand)}</td><th>HS</th><td>${esc(p.hs)}</td></tr></table>
${ts.length ? `<table style="margin-top:6px"><tr><th>Standard</th><th>Item</th><th>Result</th></tr>${ts.map(t => `<tr><td>${esc(t.std)}</td><td>${esc(t.item)}</td><td>${esc(t.result)}</td></tr>`).join('')}</table>` : ''}</div>`;
    }).join('')}`;
    return [
      ...imgFiles,
      { name: 'README.txt', data: readme },
      { name: '报价单.html', data: qHtml },
      { name: '产品数据页.html', data: pHtml },
      { name: '产品规格.csv', data: '\ufeff' + csv(specRows) },
      { name: '编码对照.csv', data: '\ufeff' + csv(codeRows) },
      { name: '适用关系.csv', data: '\ufeff' + csv(fitRows) }
    ];
  }

  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  return {
    norm, esc, money, lev, parse, match, matrix, priceOf, quoteCalc, scoreLead, localTime,
    byId, testsByP, fitsByP, fitsByV, fitsByA, codeMap, codeFlat,
    confTag, typeLabel, tierName, TIERS,
    docQuote, docProduct, docPack, makeZip, packFiles, download, csv, MATWORDS
  };
})();