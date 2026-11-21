// 构建：抓取的产品目录 + 人工知识层 → assets/data.js（供前端离线使用）
import fs from 'node:fs';
import path from 'node:path';
import * as K from './knowledge.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const S = path.join(ROOT, 'data', 'source').replace(/\\/g, '/');
const list = JSON.parse(fs.readFileSync(`${S}/list_raw.json`, 'utf8'));
const detail = JSON.parse(fs.readFileSync(`${S}/detail.json`, 'utf8'));
const imgmap = fs.existsSync(`${S}/imgmap.json`) ? JSON.parse(fs.readFileSync(`${S}/imgmap.json`, 'utf8')) : {};

const catMap = (href) => {
  if (/vehicle-brake-lining|existing-models-brake-lining|brake-lining\//.test(href)) return { cat: '鼓式衬片', en: 'Brake Lining' };
  if (href.includes('brake-pad-for-truck')) return { cat: '盘式刹车片', en: 'Truck Brake Pad' };
  if (href.includes('wind-turbine')) return { cat: '风电刹车片', en: 'Wind Turbine Pad' };
  if (href.includes('brake-shoe')) return { cat: '制动蹄总成', en: 'Brake Shoe' };
  if (href.includes('clutch-facing')) return { cat: '离合器面片', en: 'Clutch Facing' };
  return { cat: '其他配件', en: 'Accessory' };
};

const STOP = new Set(['TRUCK','TRCUK','BRAKE','PAD','LINING','SHOE','BLOCK','HEAVY','DUTY','HIGH','QUALITY','HIGHEND','PREMIUM','QUALITTY','AMERICAN','JAPANESE','KOREA','KOREAN','CHINESE','EUROPEAN','AUTO','PARTS','SYSTEM','FOR','THE','WITH','AND','NEW','MODEL','HOLES','HOLE','MM','OF','ENDURA','COMPACT','STRONG','GRIP','SHIELD','THERM','SILICONE','LINE','RUGGED','SAFE','SURE','DRIVE','POWER','HOLD','ULTRA','FLEX','HARD','WEAR','TORQUE','PRO','ADVANCED','ENHANCED','INDUSTRIAL','GRADE','LOW','ENERGY','STABLE','PRECISION','FIT','RELIABLE','DURABLE','PROTECTION','LOAD','CONTROL','NOISE','CANCELING','IMPACT','RESISTANT','HEAT','TEMPERATURE','PERFORMANCE','DURABILITY','BEAKE']);

function extractCodes(title) {
  const toks = (' ' + title.toUpperCase().replace(/[®™]/g, ' ') + ' ')
    .split(/[\s,()\[\]]+/).filter(Boolean)
    .filter(tk => !STOP.has(tk) && !(tk.length > 6 && /^[A-Z]+$/.test(tk)));
  const isCode = tk => /[0-9]/.test(tk)
    ? (!/^\d{1,3}$/.test(tk) && !/^\d{2,3}(MM|T)$/.test(tk) && !/^\d{4}(\.\d+)?T$/.test(tk))
    : /^[A-Z]{2,6}$/.test(tk);
  const idx = toks.findIndex(isCode);
  if (idx < 0) return { primary: '', alts: [] };

  let primary = toks[idx];
  const alts = [];
  if (primary.includes('/') && !/\d/.test(primary.split('/')[0])) {
    // 非数字开头（如 DF/24/1）不作为主编码，留作别名
    alts.push(primary);
    return { primary: alts.shift(), alts: alts.concat(toks.slice(idx + 1).filter(isCode).slice(0, 2)) };
  }
  if (primary.includes('/') && primary.length <= 13) {
    return { primary, alts: toks.slice(idx + 1).filter(t => /^[A-Z]{2,6}$/.test(t)).slice(0, 2) };
  }
  if (primary.includes('/') && primary.split('/').every(s => s.length <= 9)) {
    const p = primary.split('/');
    return { primary: p[0], alts: p.slice(1).concat(toks.slice(idx + 1).filter(t => t.includes('/') || /^[A-Z]{2,6}$/.test(t)).slice(0, 2)) };
  }
  // 合并位置 / 版本后缀：CANTER R、HINO ZY F-2、FAW FJ RB、DAWOO BUS R
  let j = idx + 1;
  while (j < toks.length && (primary + ' ' + toks[j]).length <= 16) {
    const t = toks[j];
    const tail = /^[A-Z]{1,3}$/.test(t) || /^[A-Z]-?\d$/.test(t)
      || (/^\d{1,6}$/.test(t) && /^[A-Z]{2,6}$/.test(primary))
      || (/^[A-Z]{2,4}$/.test(t) && /^[A-Z]{2,5}(\s|$)/.test(primary));
    if (!tail) break;
    primary += ' ' + t; j++;
    if (!/^[A-Z]{2,5}\s[A-Z]{1,3}$/.test(primary)) break;
  }
  for (const t of toks.slice(j)) {
    if (alts.length >= 3) break;
    if (t.includes('/') || (/^[A-Z]{2,6}$/.test(t) && !STOP.has(t))) alts.push(t);
  }
  return { primary, alts: alts.filter(Boolean) };
}

function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
const rnd = (seed, a, b) => a + ((hash(seed) % 1000) / 1000) * (b - a);

const PRICE = { '鼓式衬片': [4.2, 7.8], '盘式刹车片': [9, 26], '风电刹车片': [58, 158], '制动蹄总成': [32, 72], '离合器面片': [6, 18], '其他配件': [3, 25] };
const MOQ = { '鼓式衬片': 100, '盘式刹车片': 50, '风电刹车片': 10, '制动蹄总成': 20, '离合器面片': 50, '其他配件': 100 };
const PACK = {
  '鼓式衬片': { per: '20 片/箱', gw: 24, cbm: 0.035 },
  '盘式刹车片': { per: '4 片/盒 · 10 盒/箱', gw: 19, cbm: 0.028 },
  '风电刹车片': { per: '2 件/箱', gw: 12, cbm: 0.02 },
  '制动蹄总成': { per: '2 套/箱', gw: 38, cbm: 0.055 },
  '离合器面片': { per: '10 片/盒', gw: 8, cbm: 0.012 },
  '其他配件': { per: '按箱', gw: 10, cbm: 0.02 }
};

// 从官网标题推断适用车型/车桥（厂商自己写的适配对象）
const APPMAP = [
  [/\bBPW\b/i, 'BPW 挂车桥'], [/\bDAF\b/i, 'DAF XF/CF'], [/MERCEDES|BENZ|\bMB\b/i, '奔驰 Actros'],
  [/\bMAN\b/i, 'MAN TGA/TGS'], [/VOLVO/i, '沃尔沃 FH'], [/\bSAF\b/i, 'SAF 挂车桥'], [/YORK/i, '约克挂车桥'],
  [/TRAILOR/i, 'Trailor 挂车桥'], [/HYUNDAI/i, '现代客车/卡车'], [/HINO/i, '日野 500'], [/ISUZU/i, '五十铃 FVR/FSR'],
  [/MITSUBISHI|FUSO/i, '三菱 FUSO'], [/NISSAN/i, '日产 Condor'], [/HOWO/i, '重汽豪沃'], [/DONGFENG|EQ\d/i, '东风'],
  [/JAC/i, '江淮格尔发'], [/FAW|CA9T/i, '一汽解放'], [/STEYR/i, '陕汽/斯太尔'], [/NEOPLAN/i, '尼奥普兰'],
  [/BOVA/i, 'Bova 客车'], [/FORD/i, '福特'], [/IVECO/i, '依维柯'], [/PERROT/i, 'Perrot 挂车'], [/ROR/i, 'ROR 挂车桥']
];
const appsOf = title => [...new Set(APPMAP.filter(([re]) => re.test(title)).map(([, v]) => v))];

// ── 产品 ─────────────────────────────────────────────────────
const byHref = new Map(detail.map(d => [d.href, d]));
const products = [];
const usedCodes = new Set();

list.forEach((item, i) => {
  const { cat, en } = catMap(item.href);
  const d = byHref.get(item.href);
  const title = (d && d.name) || item.title;
  let fam = K.knownFamilies.find(f => f.re.test(title));
  let codes = fam ? { primary: fam.code, alts: [] } : extractCodes(title);

  // 型号去重：同族多页时追加后缀
  let base = codes.primary || (en.replace(/\s+/g, '').toUpperCase() + '-' + (i + 1));
  let code = base, n = 2;
  while (usedCodes.has(code.toUpperCase())) code = base + ' #' + n++;
  usedCodes.add(code.toUpperCase());

  const [lo, hi] = PRICE[cat];
  const mat = fam ? fam.mat : (cat === '风电刹车片' ? 'WT' : cat === '盘式刹车片' ? 'LM' : cat === '离合器面片' ? 'NAO' : 'SM');
  const dimMatch = title.match(/(\d{2,3})\s*[xX×]\s*(\d{2,3})/);
  const holeMatch = title.match(/(\d{1,2})\s*HOLE/i);
  const thickMatch = title.match(/(\d{1,2}(?:\.\d)?)\s*MM\s*THICKNESS|THICKNESS\s*(\d{1,2}(?:\.\d)?)/i);
  const cm = code.toUpperCase();
  const posMatch = /\sF[12]?$/.test(cm) || /\bFRONT\b/.test(title.toUpperCase()) ? '前'
    : /\sR[12]?$/.test(cm) || /\bREAR\b/.test(title.toUpperCase()) ? '后' : '';
  const dim = dimMatch ? `${dimMatch[1]} × ${dimMatch[2]} mm`
    : holeMatch ? `${holeMatch[1]} 孔`
    : (thickMatch ? `厚度 ${thickMatch[1] || thickMatch[2]} mm` : '');

  const apps = appsOf(title);
  products.push({
    id: 'P' + String(i + 1).padStart(3, '0'),
    sku: 'GY-' + code.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    code,
    altCodes: codes.alts,
    name: code + ' · ' + en,
    nameZh: `${cat} ${code}${apps.length ? '（' + apps[0] + '）' : ''}`,
    apps,
    commonVehicles: [],
    nameEn: title,
    cat,
    catEn: en,
    brand: fam ? fam.brand : (cat === '其他配件' ? 'KOOYING' : 'KOOYING'),
    material: mat,
    pos: posMatch,
    dim,
    holes: holeMatch ? Number(holeMatch[1]) : null,
    dimStatus: dim ? '已录入' : '待补',
    price: Math.round(rnd(code + cat, lo, hi) * 100) / 100,
    moq: MOQ[cat],
    pack: PACK[cat],
    hs: cat === '离合器面片' ? '8708.93' : '8708.30',
    status: cat === '其他配件' ? '在售' : '在售',
    img: imgmap[item.href] ? 'assets/img/p/' + imgmap[item.href] : '',
    desc: ((d && d.desc) || '').slice(0, 620),
    url: 'https://www.kooying.com' + item.href,
    specStatus: '待研发复核'
  });
});

// ── 编码索引（外部编码 → 产品）──────────────────────────────
const codeIndex = new Map();
const codes = [];
let cid = 0;
function addCode(code, pid, type, source, conf, note) {
  const norm = String(code).toUpperCase().replace(/[\s\-_.\/]/g, '');
  if (!norm || norm.length < 2) return;
  const key = norm;
  if (!codeIndex.has(key)) { codeIndex.set(key, []); }
  codeIndex.get(key).push(pid);
  codes.push({ id: 'X' + String(++cid).padStart(4, '0'), code: String(code), norm, pid, type, source, conf, note: note || '' });
}
for (const p of products) {
  const type = /^\d{4,5}$/.test(p.code) && /^(29|19|47|45|43|46)/.test(p.code) ? 'WVA' : /-/i.test(p.code) ? 'OE' : '工厂码';
  addCode(p.code, p.id, type, '官网产品目录', '高', '');
  for (const a of p.altCodes) {
    if (!/[0-9]/.test(a) || String(a).length < 3) continue;   // 过滤 BPW / FOR / 无数字的泛词
    addCode(a, p.id, type, '官网产品目录（同款多编码）', '高', '与主编码同款');
  }
  addCode(p.sku, p.id, '内部码', '系统生成', '高', '');
}
const findPid = (code) => {
  const norm = String(code).toUpperCase().replace(/[\s\-_.\/]/g, '');
  const hit = codeIndex.get(norm);
  return hit && hit.length ? hit[0] : null;
};

// ── 适配关系 ─────────────────────────────────────────────────
const fitments = [];
const unresolved = [];
K.fitments.forEach((f, i) => {
  const pid = findPid(f.code);
  if (!pid) { unresolved.push(f.code); return; }
  const v = K.vehicles.find(x => x.id === f.v) || null;
  const a = f.a ? K.axles.find(x => x.id === f.a) || null : null;
  fitments.push({
    id: 'F' + String(i + 1).padStart(3, '0'),
    vid: f.v || null, aid: f.a || null, pid, code: f.code,
    pos: f.pos, fit: f.fit, conf: f.conf, src: f.src,
    q: f.q || [],
    vName: v ? `${v.brand} ${v.series} ${v.model}` : '通用 / 待指定',
    aName: a ? `${a.brand} ${a.model}` : '按旧件确认'
  });
});

// ── 常用车型回填（适配关系 + 官网标题推断）──────────────────
products.forEach(p => {
  const vs = [...new Set(fitments.filter(f => f.pid === p.id && f.vid).map(f => f.vName))];
  p.commonVehicles = vs;
  p.appsAll = [...new Set([...p.apps, ...vs])];
});

// ── 试验报告 ─────────────────────────────────────────────────
const tests = K.tests.map((t, i) => {
  const pid = findPid(t.code);
  const p = products.find(x => x.id === pid);
  return { id: 'T' + String(i + 1).padStart(3, '0'), pid, code: t.code, pname: p ? p.name : t.code, std: t.std, item: t.item, result: t.result, verdict: t.verdict, lab: t.lab, no: t.no, date: t.date };
}).filter(t => t.pid);

// ── 车型 / 车桥补充统计 ───────────────────────────────────────
const vehicles = K.vehicles.map(v => ({
  ...v,
  fitCount: fitments.filter(f => f.vid === v.id).length,
  skus: [...new Set(fitments.filter(f => f.vid === v.id).map(f => products.find(p => p.id === f.pid)?.code))].filter(Boolean)
}));

const stats = {
  products: products.length,
  codes: codes.length,
  vehicles: vehicles.length,
  axles: K.axles.length,
  fitments: fitments.length,
  tests: tests.length,
  materials: K.materials.length,
  images: products.filter(p => p.img).length,
  withVehicle: products.filter(p => p.appsAll.length).length,
  cats: [...new Set(products.map(p => p.cat))].map(c => ({ cat: c, n: products.filter(p => p.cat === c).length })),
  conf: ['已确认', '高', '中', '低'].map(c => ({ c, n: fitments.filter(f => f.conf === c).length }))
};

const DB = {
  meta: K.meta, stats,
  materials: K.materials, brands: K.brands, currency: K.currency,
  products, codes, vehicles, axles: K.axles, fitments, tests,
  customers: K.customers, leads: K.leads, scoreRules: K.scoreRules, templates: K.templates
};

fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'data.js'), 'window.DB = ' + JSON.stringify(DB) + ';\n', 'utf8');
fs.writeFileSync(path.join(ROOT, 'data', 'db.json'), JSON.stringify(DB, null, 1), 'utf8');

console.log('products', products.length, '| codes', codes.length, '| fitments', fitments.length, '/', K.fitments.length, '| tests', tests.length, '| imgs', stats.images);
if (unresolved.length) console.log('UNRESOLVED fitment codes:', [...new Set(unresolved)].join(', '));
const dup = [...usedCodes].filter((c, i) => products.filter(p => p.code === c).length > 1);
if (dup.length) console.log('DUP codes:', dup.join(', '));
