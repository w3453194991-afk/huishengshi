/* 成交台账（员工）+ 业绩总览（老板） */
(function () {
  const STATUS = {
    '待报价': { c: 'n', w: 0 },
    '已报价': { c: 'y', w: 1 },
    '谈判中': { c: 'b', w: 2 },
    '已成交': { c: 'g', w: 3 },
    '已丢单': { c: 'n', w: 4 }
  };
  const ORDER = ['待报价', '已报价', '谈判中', '已成交', '已丢单'];

  const monthKey = s => String(s || '').slice(0, 7);
  const thisMonth = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };
  const prevMonth = () => {
    const d = new Date();
    d.setDate(1); d.setMonth(d.getMonth() - 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };
  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  function metrics(list) {
    const cm = thisMonth(), pm = prevMonth();
    const won = list.filter(d => d.status === '已成交');
    const mWon = won.filter(d => monthKey(d.date) === cm);
    const pWon = won.filter(d => monthKey(d.date) === pm);
    const amount = mWon.reduce((s, d) => s + (+d.amount || 0), 0);
    const prevAmount = pWon.reduce((s, d) => s + (+d.amount || 0), 0);
    const pipeline = list.filter(d => d.status === '已报价' || d.status === '谈判中')
      .reduce((s, d) => s + (+d.amount || 0), 0);
    const lost = list.filter(d => d.status === '已丢单').length;
    const quoted = list.filter(d => d.status !== '待报价').length;
    return {
      cm, amount, prevAmount, count: mWon.length, prevCount: pWon.length,
      avg: mWon.length ? amount / mWon.length : 0,
      pipeline, lost, quoted,
      winRate: quoted ? Math.round(won.length / quoted * 100) : 0,
      custs: new Set(list.map(d => d.customer)).size,
      growth: prevAmount ? Math.round((amount - prevAmount) / prevAmount * 100) : (amount ? 100 : 0)
    };
  }

  function staffRows(list) {
    const names = [...new Set(list.map(d => d.staff || '未分配'))];
    return names.map(n => {
      const mine = list.filter(d => (d.staff || '未分配') === n);
      const won = mine.filter(d => d.status === '已成交');
      const amount = won.reduce((s, d) => s + (+d.amount || 0), 0);
      const quoted = mine.filter(d => d.status !== '待报价').length;
      const markets = {};
      mine.forEach(d => { markets[d.country || '—'] = (markets[d.country || '—'] || 0) + 1; });
      const top = Object.keys(markets).sort((a, b) => markets[b] - markets[a])[0] || '—';
      return {
        staff: n, deals: mine.length, won: won.length, amount,
        avg: won.length ? amount / won.length : 0,
        rate: quoted ? Math.round(won.length / quoted * 100) : 0,
        custs: new Set(mine.map(d => d.customer)).size,
        market: top,
        last: mine.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]
      };
    }).sort((a, b) => b.amount - a.amount);
  }

  function productRows(list) {
    const map = {};
    list.forEach(d => {
      const k = d.code || '—';
      if (!map[k]) map[k] = { code: k, name: d.pname || '', deals: 0, qty: 0, amount: 0, won: 0, lost: 0, last: '' };
      const r = map[k];
      r.deals++; r.qty += (+d.qty || 0); r.amount += (+d.amount || 0);
      if (d.status === '已成交') r.won++;
      if (d.status === '已丢单') r.lost++;
      if (!r.last || String(d.date) > r.last) r.last = String(d.date);
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }

  function summary(m, rows, prods) {
    const parts = [];
    const nl = '\n';
    if (m.amount) parts.push('本月成交 $' + fmt(m.amount) + '、' + m.count + ' 单，环比' + (m.growth >= 0 ? '增长 ' + m.growth : '下降 ' + Math.abs(m.growth)) + '%。');
    else parts.push('本月还没有登记成交，先把在谈的 ' + m.quoted + ' 笔往前推。');
    if (rows[0]) parts.push('贡献最大的是 ' + rows[0].staff + '（$' + fmt(rows[0].amount) + '，占 ' + (m.amount ? Math.round(rows[0].amount / m.amount * 100) : 0) + '%，主战场 ' + rows[0].market + '）。');
    const bestRate = rows.filter(r => r.deals >= 2).sort((a, b) => b.rate - a.rate)[0];
    if (bestRate) parts.push('转化率最高的是 ' + bestRate.staff + '（' + bestRate.rate + '%）。');
    if (m.pipeline) parts.push('在谈金额 $' + fmt(m.pipeline) + '，是下个月的粮。');
    if (prods[0]) parts.push('卖得最好的是 ' + prods[0].code + '（$' + fmt(prods[0].amount) + '，' + prods[0].won + ' 单成交）。');
    if (m.lost) parts.push('丢单 ' + m.lost + ' 笔，建议逐条记原因（价格 / 交期 / 认证）。');
    return parts.join(nl);
  }

  function fmt(n) {
    const v = Math.round(+n || 0);
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function kpi(label, value, sub, cls) {
    return '<div class="kpi ' + (cls || '') + '"><div class="kpi-l">' + label + '</div>' +
      '<div class="kpi-v">' + value + '</div>' +
      (sub ? '<div class="kpi-s">' + sub + '</div>' : '') + '</div>';
  }

  function htmlDeals(ctx) {
    const { esc } = ctx;
    const list = ctx.list || [];
    const m = metrics(list);
    const me = ctx.me || {};
    const isBoss = !!ctx.isBoss;
    const mine = (isBoss || (me && me.demo)) ? list : list.filter(d => d.staff === me.name);
    const rows = mine.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const custs = ctx.customers || [];
    const statusOpts = (cur) => ORDER.map(s => '<option' + (s === cur ? ' selected' : '') + '>' + s + '</option>').join('');

    return [
      '<div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">',
      '<div><h1 style="margin:0">成交台账</h1><div class="muted small">',
      isBoss ? '全部员工的成交记录，可逐条改状态。' : '登记你手上的单子；状态一改，老板那边立刻能看到。',
      '</div></div>',
      isBoss ? '<button class="btn" data-act="tab" data-id="boss">业绩总览 →</button>' : '',
      '</div>',

      '<div class="kpi-grid">',
      kpi('本月成交额', '$' + fmt(m.amount), m.growth >= 0 ? '↑ ' + m.growth + '% 环比' : '↓ ' + Math.abs(m.growth) + '% 环比', m.growth >= 0 ? 'up' : 'down'),
      kpi('成交单数', m.count, '上月 ' + m.prevCount + ' 单'),
      kpi('平均单额', '$' + fmt(m.avg), m.count ? '按本月成交' : '暂无'),
      kpi('在谈金额', '$' + fmt(m.pipeline), '报价 + 谈判中'),
      '</div>',

      '<div class="card"><div class="card-h"><h3>登记一笔</h3><span class="sub">金额自动按「数量 × 单价」，可改</span></div>',
      '<div class="card-b"><div class="sq-form">',
      '<label>客户 <select id="dCust">' + custs.map(c => '<option value="' + esc(c.name) + '|' + esc(c.country || '') + '">' + esc(c.company || c.name) + ' · ' + esc(c.country || '') + '</option>').join('') + '</select></label>',
      '<label>型号 <input id="dCode" list="dCodeList" placeholder="HOWO1 / 29087"><datalist id="dCodeList">' + (ctx.codes || []).slice(0, 120).map(c => '<option value="' + esc(c) + '">').join('') + '</datalist></label>',
      '<label>数量 <input id="dQty" type="number" min="1" step="50" value="500"></label>',
      '<label>单价 USD <input id="dPrice" type="number" min="0" step="0.1" placeholder="自动带出"></label>',
      '<label>金额 USD <input id="dAmount" type="number" min="0" step="1" placeholder="自动算"></label>',
      '<label>状态 <select id="dStatus">' + statusOpts('已成交') + '</select></label>',
      '<label>日期 <input id="dDate" type="date" value="' + today() + '"></label>',
      '<label class="wide">备注 <input id="dNote" placeholder="如：BPW TS2 挂车，含资料包"></label>',
      '</div>',
      '<div class="row wrap-gap" style="margin-top:10px"><button class="btn primary sm" data-act="dealAdd">登记</button>',
      '<span class="tiny muted">登记人：' + esc(me.name || '') + '</span></div></div></div>',

      '<div class="card"><div class="card-h"><h3>' + (isBoss ? '全部记录' : '我的记录') + '</h3><span class="sub">' + rows.length + ' 条</span></div>',
      '<div class="tbl-wrap"><table><thead><tr><th>日期</th><th>客户</th><th>型号</th><th class="right">数量</th><th class="right">金额</th><th>状态</th>' + (isBoss ? '<th>员工</th>' : '') + '<th>备注</th><th></th></tr></thead><tbody>',
      rows.map(d => [
        '<tr class="deal-row" data-act="dealOpen" data-id="' + esc(d.id) + '" title="点开看这一单的完整信息">',
        '<td class="mono small">' + esc(d.date) + '</td>',
        '<td class="small"><b>' + esc(d.customer) + '</b><div class="tiny muted">' + esc(d.country || '') + '</div></td>',
        '<td class="mono small">' + esc(d.code) + '</td>',
        '<td class="right mono small">' + fmt(d.qty) + '</td>',
        '<td class="right mono">$' + fmt(d.amount) + '</td>',
        '<td><select class="deal-st" data-act="dealSet" data-id="' + esc(d.id) + '">' + statusOpts(d.status) + '</select></td>',
        isBoss ? '<td class="small">' + esc(d.staff || '') + '</td>' : '',
        '<td class="small muted" style="max-width:220px">' + esc(d.note || '') + '</td>',
        '<td><button class="btn xs" data-act="dealDel" data-id="' + esc(d.id) + '">删</button></td>',
        '</tr>'
      ].join('')).join(''),
      '</tbody></table>',
      (!rows.length ? '<div class="empty">还没有记录，上面登记第一笔</div>' : ''),
      (!rows.length && list.length ? '<div class="tiny muted" style="padding:8px 2px">你名下还没有记录；系统里有 ' + list.length + ' 条示例（李娜 / 张伟 / 王强），老板端能看到全部。登记一笔就会出现在这里。</div>' : ''),
      '</div></div>'
    ].join('');
  }

  function htmlBoss(ctx) {
    const { esc } = ctx;
    const list = ctx.list || [];
    const m = metrics(list);
    const rows = staffRows(list);
    const prods = productRows(list);
    const max = Math.max.apply(null, rows.map(r => r.amount).concat([1]));

    return [
      '<div class="row wrap-gap" style="justify-content:space-between;margin-bottom:12px">',
      '<div><h1 style="margin:0">业绩总览</h1><div class="muted small">只有老板能看：员工成交、转化、在谈与产品结构。数据来自员工登记，示例数据可随时清空。</div></div>',
      '<div class="row wrap-gap"><button class="btn" data-act="tab" data-id="deals">成交台账 →</button>',
      '<button class="btn" data-act="tab" data-id="visits">客户浏览 →</button></div></div>',

      '<div class="kpi-grid">',
      kpi('本月成交额', '$' + fmt(m.amount), (m.growth >= 0 ? '↑ ' : '↓ ') + Math.abs(m.growth) + '% 环比上月', m.growth >= 0 ? 'up' : 'down'),
      kpi('成交单数', m.count, '上月 ' + m.prevCount + ' 单'),
      kpi('平均单额', '$' + fmt(m.avg), '客单价'),
      kpi('报价转化率', m.winRate + '%', '成交 / 已报价'),
      kpi('在谈金额', '$' + fmt(m.pipeline), '下个月的口粮'),
      kpi('覆盖客户', m.custs, '去重客户数'),
      '</div>',

      '<div class="card"><div class="card-h"><h3>员工业绩</h3><span class="sub">按成交额排序</span></div><div class="card-b" style="padding:4px 0 0">',
      '<div class="tbl-wrap"><table><thead><tr><th>员工</th><th class="right">客户</th><th class="right">记录</th><th class="right">成交单</th><th class="right">成交额</th><th class="right">平均单额</th><th class="right">转化率</th><th>主战场</th><th>最近</th></tr></thead><tbody>',
      rows.map(r => [
        '<tr>',
        '<td><b>' + esc(r.staff) + '</b><div class="deal-bar"><i style="width:' + Math.round(r.amount / max * 100) + '%"></i></div></td>',
        '<td class="right mono small">' + r.custs + '</td>',
        '<td class="right mono small">' + r.deals + '</td>',
        '<td class="right mono"><b>' + r.won + '</b></td>',
        '<td class="right mono b">$' + fmt(r.amount) + '</td>',
        '<td class="right mono small">$' + fmt(r.avg) + '</td>',
        '<td class="right"><span class="tag ' + (r.rate >= 60 ? 'g' : r.rate >= 35 ? 'y' : 'n') + '">' + r.rate + '%</span></td>',
        '<td class="small">' + esc(r.market) + '</td>',
        '<td class="small mono muted">' + esc(r.last ? r.last.date : '—') + '</td>',
        '</tr>'
      ].join('')).join(''),
      '</tbody></table></div></div></div>',

      '<div class="card"><div class="card-h"><h3>一句话总结</h3><span class="sub">自动生成，可照抄到周报</span></div>',
      '<div class="card-b"><div class="boss-sum">' + esc(summary(m, rows, prods)).split('\n').map(x => '<div>' + esc(x) + '</div>').join('') + '</div></div></div>',

      '<div class="card"><div class="card-h"><h3>产品成交状态</h3><span class="sub">哪些型号真的在走量</span></div>',
      '<div class="tbl-wrap"><table><thead><tr><th>型号</th><th class="right">记录</th><th class="right">成交量</th><th class="right">成交额</th><th class="right">成交</th><th class="right">丢单</th><th>最近</th><th>判断</th></tr></thead><tbody>',
      prods.slice(0, 10).map(p => {
        const verdict = p.won >= 2 ? '<span class="tag g">主力</span>' : p.won === 1 ? '<span class="tag b">起量</span>' : p.lost ? '<span class="tag n">只丢单</span>' : '<span class="tag y">在谈</span>';
        return '<tr><td class="mono b">' + esc(p.code) + '</td>' +
          '<td class="right mono small">' + p.deals + '</td>' +
          '<td class="right mono small">' + fmt(p.qty) + '</td>' +
          '<td class="right mono">$' + fmt(p.amount) + '</td>' +
          '<td class="right mono small">' + p.won + '</td>' +
          '<td class="right mono small">' + (p.lost || '—') + '</td>' +
          '<td class="mono small muted">' + esc(p.last) + '</td>' +
          '<td>' + verdict + '</td></tr>';
      }).join(''),
      '</tbody></table>',
      (!prods.length ? '<div class="empty">还没有成交数据</div>' : ''),
      '</div></div>'
    ].join('');
  }

  /** 单条记录详情：点开一行看到的全部信息 */
  function dealDetail(ctx, id) {
    const { esc, LZ } = ctx;
    const list = ctx.list || [];
    const d = list.find(x => x.id === id);
    if (!d) return null;
    const zh = !LZ || LZ('中', 'en') === '中';
    const STA = { '待报价': 'To quote', '已报价': 'Quoted', '谈判中': 'Negotiating', '已成交': 'Won', '已丢单': 'Lost' };
    const stName = v => zh ? v : (STA[v] || v);
    const money = v => '$' + fmt(v);
    const qty = +d.qty || 0;
    const amount = +d.amount || 0;
    const unit = qty ? amount / qty : 0;
    const st = STATUS[d.status] || { c: 'n', w: 0 };
    const stepW = st.w;
    const steps = [['待报价', '报价'], ['已报价', '报价'], ['谈判中', '谈判'], ['已成交', '成交'], ['已丢单', '丢单']];
    const tl = ORDER.map((k, i) => {
      let cls = 'dd-step';
      if (d.status === '已丢单') { if (k === '已丢单') cls += ' cur'; else if (i < 3) cls += ' done'; }
      else if (i < stepW) cls += ' done';
      else if (i === stepW) cls += ' cur';
      const label = stName(k);
      return '<div class="' + cls + '"><i></i>' + label + '</div>';
    }).join('');

    const sameCust = list.filter(x => x.customer === d.customer && x.id !== d.id);
    const sameCode = list.filter(x => x.code === d.code && x.id !== d.id);
    const row = (x) => '<div><span>' + esc(x.date) + ' · ' + esc(x.code || '—') + ' · ' + esc(stName(x.status)) +
      '</span><b>' + money(x.amount) + '</b></div>';
    const custSum = sameCust.reduce((a, x) => a + (+x.amount || 0), 0);
    const wonCnt = sameCust.filter(x => x.status === '已成交').length;

    return {
      title: LZ ? LZ('成交记录详情', 'Deal detail') : 'Deal detail',
      body: [
        '<div class="dd-top">',
        '<div><div class="dd-cust">' + esc(d.customer) + '</div>',
        '<div class="tiny muted">' + esc(d.country || '—') + (d.staff ? ' · ' + (LZ ? LZ('登记人', 'Owner') + '：' : 'Owner: ') + esc(d.staff) : '') + '</div></div>',
        '<span class="tag ' + st.c + '">' + esc(stName(d.status)) + '</span>',
        '</div>',

        '<div class="dd-kpis">',
        '<div class="dd-kpi"><span>' + (LZ ? LZ('成交金额', 'Amount') : 'Amount') + '</span><b>' + money(amount) + '</b></div>',
        '<div class="dd-kpi"><span>' + (LZ ? LZ('数量', 'Qty') : 'Qty') + '</span><b>' + fmt(qty) + '</b></div>',
        '<div class="dd-kpi"><span>' + (LZ ? LZ('单价', 'Unit price') : 'Unit price') + '</span><b>' + money(Math.round(unit * 100) / 100) + '</b></div>',
        '</div>',

        '<div class="dd-grid">',
        '<div><span class="k">' + (LZ ? LZ('型号', 'Part no.') : 'Part no.') + '</span><b class="mono">' + esc(d.code || '—') + '</b></div>',
        '<div><span class="k">' + (LZ ? LZ('产品名', 'Product') : 'Product') + '</span><b>' + esc(d.pname || '—') + '</b></div>',
        '<div><span class="k">' + (LZ ? LZ('日期', 'Date') : 'Date') + '</span><b class="mono">' + esc(d.date) + '</b></div>',
        '<div><span class="k">' + (LZ ? LZ('状态', 'Status') : 'Status') + '</span><b>' + esc(stName(d.status)) + '</b></div>',
        '<div><span class="k">' + (LZ ? LZ('国家 / 市场', 'Country') : 'Country') + '</span><b>' + esc(d.country || '—') + '</b></div>',
        '<div><span class="k">' + (LZ ? LZ('记录号', 'Record ID') : 'Record ID') + '</span><b class="mono tiny">' + esc(d.id) + '</b></div>',
        '<div style="grid-column:1/-1"><span class="k">' + (LZ ? LZ('备注', 'Note') : 'Note') + '</span><b>' + esc(d.note || '—') + '</b></div>',
        '</div>',

        '<div class="dd-sec"><h4>' + (LZ ? LZ('进度', 'Progress') : 'Progress') + '</h4><div class="dd-tl">' + tl + '</div></div>',

        (sameCust.length ? '<div class="dd-sec"><h4>' + (LZ ? LZ('这个客户的其他记录', 'Same customer') : 'Same customer') + '（' + sameCust.length + '）</h4>' +
          '<div class="tiny muted" style="margin-bottom:6px">' + (LZ ? LZ('累计 ', 'Total ') : 'Total ') + money(custSum) + ' · ' + (LZ ? LZ('成交 ', 'won ') : 'won ') + wonCnt + ' ' + (LZ ? LZ('单', 'deals') : 'deals') + '</div>' +
          '<div class="dd-list">' + sameCust.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6).map(row).join('') + '</div></div>' : ''),

        (sameCode.length ? '<div class="dd-sec"><h4>' + (LZ ? LZ('这个型号的其他记录', 'Same part') : 'Same part') + '（' + sameCode.length + '）</h4>' +
          '<div class="dd-list">' + sameCode.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6).map(row).join('') + '</div></div>' : '')
      ].join(''),
      footer: [
        '<button class="btn" data-act="closeModal">' + (LZ ? LZ('关闭', 'Close') : 'Close') + '</button>',
        '<span class="flex1"></span>',
        '<button class="btn sm" data-act="dealToQuote" data-id="' + esc(d.id) + '">' + (LZ ? LZ('加入报价单', 'Add to quote') : 'Add to quote') + '</button>',
        (d.status !== '已成交' ? '<button class="btn sm" data-act="dealTo" data-id="' + esc(d.id) + '" data-st="已成交">' + (zh ? '标记成交' : 'Mark won') + '</button>' : ''),
        (d.status !== '已丢单' ? '<button class="btn sm" data-act="dealTo" data-id="' + esc(d.id) + '" data-st="已丢单">' + (zh ? '标记丢单' : 'Mark lost') + '</button>' : '')
      ].join('')
    };
  }

  window.DEALS = { htmlDeals, htmlBoss, dealDetail, metrics, staffRows, productRows, summary, ORDER, STATUS, monthKey };
})();