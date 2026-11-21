// 生成 SQLite 数据库：data/guanying.db（可直接给 IT / BI / CRM 集成）
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DBJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'db.json'), 'utf8'));
const OUT = path.join(ROOT, 'data', 'guanying.db');
if (fs.existsSync(OUT)) fs.rmSync(OUT);

const db = new DatabaseSync(OUT);
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE meta        (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE materials   (id TEXT PRIMARY KEY, name TEXT, name_en TEXT, mu TEXT, temp TEXT, factor REAL, traits TEXT, fit TEXT, note TEXT);
CREATE TABLE brands      (id TEXT PRIMARY KEY, name TEXT, desc TEXT);
CREATE TABLE products    (id TEXT PRIMARY KEY, sku TEXT UNIQUE, code TEXT, name_zh TEXT, name_en TEXT, cat TEXT, cat_en TEXT,
                          brand TEXT, material TEXT, pos TEXT, dim TEXT, holes INTEGER, dim_status TEXT,
                          price_usd REAL, moq INTEGER, pack_per TEXT, pack_gw REAL, pack_cbm REAL, hs TEXT,
                          apps TEXT, common_vehicles TEXT, img TEXT, url TEXT, desc TEXT, spec_status TEXT);
CREATE TABLE codes       (id TEXT PRIMARY KEY, code TEXT, norm TEXT, pid TEXT, type TEXT, source TEXT, conf TEXT, note TEXT,
                          FOREIGN KEY(pid) REFERENCES products(id));
CREATE TABLE vehicles    (id TEXT PRIMARY KEY, brand TEXT, series TEXT, model TEXT, years TEXT, cls TEXT, alias TEXT, axles TEXT, note TEXT);
CREATE TABLE axles       (id TEXT PRIMARY KEY, brand TEXT, model TEXT, type TEXT, cap TEXT, spec TEXT, alias TEXT);
CREATE TABLE fitments    (id TEXT PRIMARY KEY, vid TEXT, aid TEXT, pid TEXT, code TEXT, pos TEXT, fit TEXT, conf TEXT, src TEXT, questions TEXT,
                          FOREIGN KEY(vid) REFERENCES vehicles(id), FOREIGN KEY(pid) REFERENCES products(id));
CREATE TABLE tests       (id TEXT PRIMARY KEY, pid TEXT, code TEXT, pname TEXT, std TEXT, item TEXT, result TEXT, verdict TEXT, lab TEXT, no TEXT, date TEXT);
CREATE TABLE customers   (id TEXT PRIMARY KEY, name TEXT, country TEXT, region TEXT, type TEXT, tz TEXT, grade TEXT, brand TEXT,
                          price_level TEXT, incoterm TEXT, pay TEXT, last_order TEXT, note TEXT);
CREATE TABLE leads       (id TEXT PRIMARY KEY, created TEXT, src TEXT, company TEXT, contact TEXT, country TEXT, tz TEXT,
                          need TEXT, need_zh TEXT, status TEXT, score INTEGER, owner TEXT, next_action TEXT, next_date TEXT, products TEXT, note TEXT);

CREATE INDEX idx_codes_norm ON codes(norm);
CREATE INDEX idx_codes_pid  ON codes(pid);
CREATE INDEX idx_fit_vid    ON fitments(vid);
CREATE INDEX idx_fit_pid    ON fitments(pid);
CREATE INDEX idx_fit_aid    ON fitments(aid);
CREATE INDEX idx_prod_cat   ON products(cat);

CREATE VIEW v_code_lookup AS
  SELECT c.code AS matched_code, c.type AS code_type, c.conf AS code_conf, c.source AS code_source,
         p.code AS model, p.name_zh, p.cat, p.dim, p.material, p.price_usd
  FROM codes c JOIN products p ON p.id = c.pid;

CREATE VIEW v_product_fitment AS
  SELECT p.code AS model, p.cat, p.dim, v.brand || ' ' || v.series || ' ' || v.model AS vehicle,
         a.brand || ' ' || a.model AS axle, f.pos, f.fit, f.conf, f.src
  FROM fitments f
  JOIN products p ON p.id = f.pid
  LEFT JOIN vehicles v ON v.id = f.vid
  LEFT JOIN axles a ON a.id = f.aid;
`);

const ins = t => db.prepare(`INSERT INTO ${t} VALUES (${Array.from({ length: cols[t] }, () => '?').join(',')})`);
const cols = {
  meta: 2, materials: 9, brands: 3, products: 25, codes: 8, vehicles: 9, axles: 7, fitments: 10,
  tests: 11, customers: 13, leads: 16
};

db.exec('BEGIN');
Object.entries(DBJ.meta).forEach(([k, v]) => ins('meta').run(k, typeof v === 'object' ? JSON.stringify(v) : String(v)));
DBJ.materials.forEach(m => ins('materials').run(m.id, m.name, m.nameEn, m.mu, m.temp, m.factor, JSON.stringify(m.traits), m.fit, m.note));
DBJ.brands.forEach(b => ins('brands').run(b.id, b.name, b.desc));
DBJ.products.forEach(p => ins('products').run(
  p.id, p.sku, p.code, p.nameZh, p.nameEn, p.cat, p.catEn, p.brand, p.material, p.pos || '', p.dim || '',
  p.holes ?? null, p.dimStatus, p.price, p.moq, p.pack.per, p.pack.gw, p.pack.cbm, p.hs,
  JSON.stringify(p.appsAll || []), JSON.stringify(p.commonVehicles || []), p.img, p.url, p.desc, p.specStatus
));
DBJ.codes.forEach(c => ins('codes').run(c.id, c.code, c.norm, c.pid, c.type, c.source, c.conf, c.note || ''));
DBJ.vehicles.forEach(v => ins('vehicles').run(v.id, v.brand, v.series, v.model, v.years, v.cls, JSON.stringify(v.alias), JSON.stringify(v.axles || []), v.note || ''));
DBJ.axles.forEach(a => ins('axles').run(a.id, a.brand, a.model, a.type, a.cap, a.spec, JSON.stringify(a.alias)));
DBJ.fitments.forEach(f => ins('fitments').run(f.id, f.vid, f.aid, f.pid, f.code, f.pos, f.fit, f.conf, f.src, JSON.stringify(f.q || [])));
DBJ.tests.forEach(t => ins('tests').run(t.id, t.pid, t.code, t.pname, t.std, t.item, t.result, t.verdict, t.lab, t.no, t.date));
DBJ.customers.forEach(c => ins('customers').run(c.id, c.name, c.country, c.region, c.type, c.tz, c.grade, c.brand, c.priceLevel, c.incoterm, c.pay, c.last, c.note));
DBJ.leads.forEach(l => ins('leads').run(l.id, l.created, l.src, l.company, l.contact, l.country, l.tz, l.need, l.needZh || '', l.status, null, l.owner, l.next || '', l.nextDate || '', JSON.stringify(l.product || []), l.note || ''));
db.exec('COMMIT');

// 线索评分写入（与前端规则一致）
const leads = db.prepare('SELECT * FROM leads').all();
const upd = db.prepare('UPDATE leads SET score = ? WHERE id = ?');
for (const l of leads) {
  const name = (l.company || '').toLowerCase();
  const trading = /trading|import|export|fze|贸易|进出口/.test(name);
  const terminal = /fleet|transport|taller|repair|center|车队|修理|物流|运输/.test(name) || /车队|修理厂/.test(l.note || '');
  const spec = JSON.parse(l.products || '[]').length ? 14 : (/howo|j6|bpw|actros|j6p|豪沃|解放|德龙|天龙|fvr|npr|hino/i.test(l.need || '') ? 10 : 0);
  const vol = /(\d{2,5})\s*(sets?|套|pcs|片|unidades|台)/i.test(l.need || '') ? 12 : 0;
  const reach = l.contact && l.contact !== '—' ? 10 : 0;
  let s = 30 + (terminal ? 18 : 0) - (trading ? 14 : 0) + spec + vol + reach + (l.tz ? 4 : 0);
  upd.run(Math.max(5, Math.min(99, Math.round(s))), l.id);
}

const count = t => db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
const summary = ['products', 'codes', 'vehicles', 'axles', 'fitments', 'tests', 'customers', 'leads'].map(t => `${t}=${count(t)}`).join(' ');
db.close();
console.log('SQLite 写入完成:', OUT);
console.log(summary);
console.log('size', (fs.statSync(OUT).size / 1024 / 1024).toFixed(2), 'MB');