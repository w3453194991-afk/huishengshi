/* 生成童装演示数据：assets/data.js + assets/img/kids/*.svg
   内容全部为虚构款式与公开行业常识，不含任何第三方品牌、授权形象或受版权保护的图案。 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_IMG = path.join(ROOT, 'assets/img/kids');
const BRAND = 'MIANDOU';

const materials = [
  { id: 'CO', name: '纯棉针织', nameEn: 'Cotton Jersey', mu: '180 g/m²', temp: '四季', factor: 1,
    traits: ['亲肤透气', '不易起球', '好打理'], fit: '日常打底、幼儿园通勤', note: '基础款首选，成本最稳' },
  { id: 'OR', name: '有机棉', nameEn: 'Organic Cotton', mu: '190 g/m²', temp: '四季', factor: 1.28,
    traits: ['GOTS 认证', '无荧光增白', '敏感肌友好'], fit: '0–3 岁婴幼儿、贴身穿', note: '客单价高，欧美客户偏好' },
  { id: 'MO', name: '莫代尔混纺', nameEn: 'Modal Blend', mu: '160 g/m²', temp: '春夏', factor: 1.12,
    traits: ['柔软垂顺', '凉感', '回弹好'], fit: '夏季连衣裙、家居服', note: '手感溢价明显' },
  { id: 'FL', name: '摇粒绒', nameEn: 'Polar Fleece', mu: '260 g/m²', temp: '秋冬', factor: 0.96,
    traits: ['保暖轻', '不掉毛', '快干'], fit: '秋冬外套、家居服', note: '北方市场秋冬主力' },
  { id: 'DN', name: '水洗牛仔', nameEn: 'Washed Denim', mu: '10 oz', temp: '四季', factor: 1.08,
    traits: ['挺括耐穿', '水洗柔软', '不易变形'], fit: '大童裤装、背带裤', note: '出口欧美常青款' },
  { id: 'SU', name: '防晒面料', nameEn: 'UPF50+ Sunblock Knit', mu: '150 g/m²', temp: '夏季', factor: 1.18,
    traits: ['UPF50+', '凉感', '轻薄速干'], fit: '夏季户外、出行防晒', note: '东南亚/中东夏季爆款' }
];

const brands = [
  { id: 'MD', name: '棉豆 MIANDOU', desc: '自有主品牌，0–14 岁全尺码基础与时尚线' },
  { id: 'MDK', name: '棉豆小童 MIANDOU KIDS', desc: '0–6 岁婴幼儿线，A 类标准' },
  { id: 'MDJ', name: '棉豆大童 MIANDOU JUNIOR', desc: '7–14 岁大童线，校园与运动场景' }
];

const scenes = [
  { id: 'V-KG', brand: '棉豆日常', series: '幼儿园日常', model: '3–6 岁', years: '春 / 秋',
    alias: ['幼儿园', '园服', '日常', 'kindergarten', 'daily', '上学'], cls: '日常穿着',
    note: '家长复购最高的场景，主打耐洗、不起球' },
  { id: 'V-SC', brand: '棉豆活力', series: '户外运动', model: '6–12 岁', years: '春 / 秋',
    alias: ['运动', '户外', '跑步', 'sport', 'outdoor', 'playground'], cls: '运动场景',
    note: '弹力与耐磨优先，裤装占比高' },
  { id: 'V-HM', brand: '棉豆居家', series: '居家睡眠', model: '0–3 岁', years: '四季',
    alias: ['家居服', '睡衣', '睡觉', 'homewear', 'pajamas', 'sleep'], cls: '居家场景',
    note: 'A 类标准，家长最看重安全类别' },
  { id: 'V-PT', brand: '棉豆礼遇', series: '派对演出', model: '3–10 岁', years: '四季',
    alias: ['派对', '演出', '生日', 'party', 'performance', '礼物'], cls: '礼遇场景',
    note: '客单价高，节假日集中出货' },
  { id: 'V-SH', brand: '棉豆日常', series: '校园通勤', model: '6–14 岁', years: '春 / 秋',
    alias: ['校园', '校服', '通勤', 'school', 'uniform'], cls: '校园场景',
    note: '大童码段为主，版型偏宽松' },
  { id: 'V-SU', brand: '棉豆活力', series: '出行防晒', model: '0–12 岁', years: '夏季',
    alias: ['防晒', '夏天', '出行', 'sunblock', 'summer', 'beach'], cls: '夏季场景',
    note: '东南亚与中东夏季主推，UPF50+' },
  { id: 'V-WN', brand: '棉豆暖冬', series: '冬季保暖', model: '0–14 岁', years: '冬季',
    alias: ['冬款', '保暖', '加绒', 'winter', 'warm', 'fleece'], cls: '冬季场景',
    note: '摇粒绒与棉服为主，出货集中在 9–11 月' },
  { id: 'V-BB', brand: '棉豆居家', series: '婴儿爬服', model: '0–18 月', years: '四季',
    alias: ['哈衣', '爬服', '新生儿', 'baby', 'bodysuit', 'newborn'], cls: '婴童场景',
    note: '无骨缝工艺、按扣位加固，A 类必检' },
  { id: 'V-DN', brand: '棉豆日常', series: '牛仔系列', model: '4–12 岁', years: '四季',
    alias: ['牛仔', 'denim', 'jeans', '背带裤'], cls: '丹宁场景',
    note: '水洗工艺稳定，出口欧美常青' },
  { id: 'V-SP', brand: '棉豆校园', series: '校服配套', model: '6–12 岁', years: '春 / 秋',
    alias: ['校服配套', '运动服', 'classwear'], cls: '校园场景',
    note: '批次大、交期紧，需提前排产' },
  { id: 'V-TR', brand: '棉豆出行', series: '旅行出行', model: '0–12 岁', years: '四季',
    alias: ['旅行', '出行', 'travel', 'trip'], cls: '出行场景',
    note: '轻量、易打包，机场与度假渠道好卖' },
  { id: 'V-GF', brand: '棉豆礼遇', series: '送礼礼盒', model: '0–6 岁', years: '四季',
    alias: ['礼盒', '满月', 'gift', 'giftbox', 'shower'], cls: '礼赠场景',
    note: '礼盒装溢价高，适合母婴连锁陈列' }
];

const sizeSpec = [
  ['80', '12–18 月', '75–85'], ['90', '1.5–3 岁', '85–95'], ['100', '3–4 岁', '95–105'],
  ['110', '4–5 岁', '105–115'], ['120', '5–6 岁', '115–125'], ['130', '6–7 岁', '125–135'],
  ['140', '8–9 岁', '135–145'], ['150', '10–11 岁', '145–155'], ['160', '12–14 岁', '155–165']
];
const sizes = sizeSpec.map(function (sp) {
  return {
    id: 'AX-' + sp[0], brand: '棉豆', model: sp[0] + ' 码', type: '童装尺码',
    cap: '身高 ' + sp[2] + ' cm', spec: '适合 ' + sp[1],
    alias: [sp[0], sp[0] + '码', sp[1].replace('岁', ''), sp[2].split('–')[0] + 'cm']
  };
});

const COLORS = [
  { c: '奶白', en: 'Ivory' }, { c: '雾霾蓝', en: 'Mist' }, { c: '燕麦', en: 'Oat' }, { c: '浅卡其', en: 'Sand' },
  { c: '樱花粉', en: 'Blossom' }, { c: '薄荷绿', en: 'Mint' }, { c: '焦糖', en: 'Caramel' }, { c: '藏青', en: 'Navy' }
];

const styles = [
  { key: 'tee', cat: '上衣', catEn: 'Tops', zh: '圆领纯棉短袖T恤', en: 'Cotton Crew-Neck Tee',
    fab: ['CO', 'OR'], price: [3.2, 4.4], sz: ['90', '160'], sc: ['V-KG', 'V-SH', 'V-SU'],
    desc: '圆领罗纹领口，肩缝包边不易变形，下摆双针压线。适合幼儿园与日常打底，水洗 30 次领口不松。' },
  { key: 'lstripe', cat: '上衣', catEn: 'Tops', zh: '条纹长袖T恤', en: 'Striped Long-Sleeve Tee',
    fab: ['CO', 'MO'], price: [3.8, 5.2], sz: ['90', '150'], sc: ['V-KG', 'V-SH'],
    desc: '细条纹针织，对条对格，袖口罗纹收口。春秋单穿或内搭都合适。' },
  { key: 'polo', cat: '上衣', catEn: 'Tops', zh: '翻领POLO衫', en: 'Piqué Polo Shirt',
    fab: ['CO'], price: [4.2, 5.6], sz: ['100', '160'], sc: ['V-SH', 'V-SP'],
    desc: '珠地网眼组织，两粒扣门襟，领口加衬更挺括。校园与校服配套场景主推。' },
  { key: 'vest', cat: '上衣', catEn: 'Tops', zh: '无袖针织背心', en: 'Knit Tank Top',
    fab: ['MO', 'CO'], price: [2.9, 3.9], sz: ['80', '140'], sc: ['V-KG', 'V-TR'],
    desc: '轻薄弹力针织，腋下开口加大不磨皮肤，夏季叠穿或单穿均可。' },
  { key: 'hoodie', cat: '上衣', catEn: 'Tops', zh: '连帽卫衣', en: 'Hooded Sweatshirt',
    fab: ['CO', 'FL'], price: [6.5, 8.8], sz: ['100', '160'], sc: ['V-SC', 'V-WN'],
    desc: '380 g 大毛圈，帽里双层，抽绳固定嵌绳（符合儿童绳带安全要求）。' },
  { key: 'corduroy', cat: '上衣', catEn: 'Tops', zh: '灯芯绒衬衫', en: 'Corduroy Shirt',
    fab: ['DN'], price: [5.4, 7.0], sz: ['100', '150'], sc: ['V-SH', 'V-WN'],
    desc: '14 条细灯芯绒，柔软不扎，前襟贴袋，可外穿可内搭。' },
  { key: 'ruffle', cat: '上衣', catEn: 'Tops', zh: '木耳边打底衫', en: 'Ruffle-Cuff Base Layer',
    fab: ['MO'], price: [3.6, 4.8], sz: ['80', '130'], sc: ['V-PT', 'V-KG'],
    desc: '领口与袖口木耳边，弹力莫代尔贴身不勒，女童打底常青款。' },
  { key: 'jogger', cat: '裤子', catEn: 'Bottoms', zh: '束脚运动裤', en: 'Jogger Pants',
    fab: ['FL', 'CO'], price: [4.6, 6.2], sz: ['100', '160'], sc: ['V-SC', 'V-SP'],
    desc: '松紧腰内置调节抽绳，裤脚罗纹收口，膝盖处双层加固。' },
  { key: 'denim', cat: '裤子', catEn: 'Bottoms', zh: '直筒牛仔长裤', en: 'Straight-Leg Denim',
    fab: ['DN'], price: [6.2, 8.0], sz: ['100', '160'], sc: ['V-DN', 'V-SH'],
    desc: '10 oz 水洗牛仔，裆部十字加固，腰头内侧加软衬，久坐不勒。' },
  { key: 'overall', cat: '裤子', catEn: 'Bottoms', zh: '背带裤', en: 'Dungarees',
    fab: ['DN', 'CO'], price: [7.0, 9.0], sz: ['90', '150'], sc: ['V-DN', 'V-KG'],
    desc: '肩带三档可调，前胸贴袋，100 码及以下裆部加按扣方便穿脱。' },
  { key: 'shorts', cat: '裤子', catEn: 'Bottoms', zh: '松紧短裤', en: 'Elastic-Waist Shorts',
    fab: ['CO', 'SU'], price: [3.4, 4.6], sz: ['90', '150'], sc: ['V-SU', 'V-KG'],
    desc: '薄款斜纹或针织，宽腰头不卷边，侧缝口袋加深。' },
  { key: 'fleecepant', cat: '裤子', catEn: 'Bottoms', zh: '加绒卫裤', en: 'Fleece-Lined Pants',
    fab: ['FL'], price: [5.8, 7.6], sz: ['100', '160'], sc: ['V-WN', 'V-SC'],
    desc: '外层毛圈内层抓绒，膝盖立体剪裁，秋冬单条可穿。' },
  { key: 'cargo', cat: '裤子', catEn: 'Bottoms', zh: '工装束脚裤', en: 'Cargo Joggers',
    fab: ['CO', 'DN'], price: [5.6, 7.4], sz: ['110', '160'], sc: ['V-SC', 'V-SH'],
    desc: '侧贴袋带翻盖，裤脚抽绳可调，大童最常买的户外款。' },
  { key: 'tutu', cat: '裙装', catEn: 'Dresses', zh: '公主纱裙', en: 'Tulle Party Dress',
    fab: ['MO'], price: [7.5, 9.8], sz: ['90', '150'], sc: ['V-PT', 'V-GF'],
    desc: '三层软纱加棉内衬，纱不扎皮肤，后背隐形拉链，节日演出常选。' },
  { key: 'alinedress', cat: '裙装', catEn: 'Dresses', zh: '背带A字裙', en: 'A-Line Pinafore Dress',
    fab: ['CO', 'DN'], price: [6.0, 7.8], sz: ['90', '150'], sc: ['V-KG', 'V-SH'],
    desc: 'A 字版型不挑身材，肩带可调，内搭长袖可跨季穿。' },
  { key: 'knitdress', cat: '裙装', catEn: 'Dresses', zh: '针织连衣裙', en: 'Knitted Dress',
    fab: ['MO', 'CO'], price: [6.8, 8.8], sz: ['90', '140'], sc: ['V-WN', 'V-KG'],
    desc: '中厚针织不透，下摆微喇，领口罗纹加弹，秋冬内搭外穿都行。' },
  { key: 'floral', cat: '裙装', catEn: 'Dresses', zh: '碎花衬衫裙', en: 'Floral Shirt Dress',
    fab: ['CO'], price: [5.8, 7.6], sz: ['90', '150'], sc: ['V-SU', 'V-KG'],
    desc: '自印花型（原创小碎花），前襟开扣，腰侧抽绳可收腰。' },
  { key: 'pleated', cat: '裙装', catEn: 'Dresses', zh: '半身百褶裙', en: 'Pleated Skirt',
    fab: ['CO', 'MO'], price: [4.4, 5.8], sz: ['100', '150'], sc: ['V-SH', 'V-PT'],
    desc: '定形压褶不易散，内衬防走光，松紧腰加里布更平整。' },
  { key: 'windbreaker', cat: '外套', catEn: 'Outerwear', zh: '连帽风衣', en: 'Hooded Windbreaker',
    fab: ['SU', 'CO'], price: [8.5, 11.5], sz: ['100', '160'], sc: ['V-TR', 'V-SC'],
    desc: '防风梭织，轻微防泼水，帽檐加硬衬，袖口魔术贴可调。' },
  { key: 'padded', cat: '外套', catEn: 'Outerwear', zh: '轻薄棉服', en: 'Lightweight Padded Jacket',
    fab: ['FL'], price: [11.0, 14.5], sz: ['100', '160'], sc: ['V-WN', 'V-TR'],
    desc: '仿丝棉填充，可机洗不结块，压线分格防跑棉。' },
  { key: 'shell', cat: '外套', catEn: 'Outerwear', zh: '冲锋衣', en: 'Shell Jacket',
    fab: ['SU'], price: [12.0, 15.5], sz: ['110', '160'], sc: ['V-SC', 'V-WN'],
    desc: '三层复合面料，防水 5000 mm，接缝压胶，腋下透气孔。' },
  { key: 'suncoat', cat: '外套', catEn: 'Outerwear', zh: '防晒外套', en: 'Sun Protection Jacket',
    fab: ['SU'], price: [6.5, 8.5], sz: ['90', '150'], sc: ['V-SU', 'V-TR'],
    desc: 'UPF50+ 凉感面料，帽子可收纳进领口，夏季出行主推。' },
  { key: 'cardigan', cat: '外套', catEn: 'Outerwear', zh: '针织开衫', en: 'Knit Cardigan',
    fab: ['CO', 'MO'], price: [7.0, 9.2], sz: ['90', '150'], sc: ['V-KG', 'V-SH'],
    desc: '细针距平纹，纽扣加大好抓握，袖口领口同料罗纹。' },
  { key: 'shortset', cat: '套装', catEn: 'Sets', zh: '短袖短裤两件套', en: 'Tee & Shorts Set',
    fab: ['CO', 'SU'], price: [7.2, 9.4], sz: ['90', '150'], sc: ['V-SU', 'V-KG'],
    desc: '上衣下装同缸染色，色差可控；短裤松紧腰，套装出货省搭配。' },
  { key: 'tracksuit', cat: '套装', catEn: 'Sets', zh: '卫衣卫裤套装', en: 'Sweatshirt & Jogger Set',
    fab: ['FL', 'CO'], price: [10.0, 13.5], sz: ['100', '160'], sc: ['V-SC', 'V-WN'],
    desc: '同色系套装，上衣下装可拆卖，校园与运动渠道都走得动。' },
  { key: 'pajama', cat: '家居服', catEn: 'Homewear', zh: '分体家居服', en: 'Two-Piece Pyjamas',
    fab: ['CO', 'MO'], price: [5.4, 7.2], sz: ['90', '150'], sc: ['V-HM', 'V-GF'],
    desc: 'A 类标准，无骨缝工艺，领口袖口不磨皮肤，可直接贴身穿。' },
  { key: 'sleepbag', cat: '家居服', catEn: 'Homewear', zh: '婴儿睡袋', en: 'Baby Sleep Bag',
    fab: ['OR'], price: [6.0, 8.0], sz: ['80', '100'], sc: ['V-HM', 'V-BB'],
    desc: '分腿式设计，双向拉链换尿布不脱整件，肩扣两档可调。' },
  { key: 'romper', cat: '家居服', catEn: 'Homewear', zh: '连体哈衣', en: 'Baby Romper',
    fab: ['OR', 'CO'], price: [4.2, 5.6], sz: ['80', '100'], sc: ['V-BB', 'V-GF'],
    desc: '斜襟系带或按扣，裆部全开，无骨缝拼接，新生儿礼盒常配。' }
];

function sizeRange(lo, hi) {
  return sizeSpec.map(function (x) { return x[0]; })
    .filter(function (c) { return Number(c) >= Number(lo) && Number(c) <= Number(hi); });
}

const products = [];
const codes = [];
let pi = 0, ci = 0;

styles.forEach(function (st, si) {
  const pal = [
    COLORS[(si * 2) % COLORS.length],
    COLORS[(si * 2 + 3) % COLORS.length],
    COLORS[(si * 5 + 1) % COLORS.length],
    COLORS[(si * 7 + 5) % COLORS.length]
  ];
  const variants = [];
  st.fab.forEach(function (fab, fi) {
    variants.push({ fab: fab, color: pal[(fi * 2) % pal.length] });
    variants.push({ fab: fab, color: pal[(fi * 2 + 1) % pal.length] });
  });

  variants.forEach(function (v) {
    pi += 1;
    const id = 'P' + String(pi).padStart(3, '0');
    const code = 'MD' + String(1000 + pi);
    const mat = materials.filter(function (m) { return m.id === v.fab; })[0];
    const price = Math.round((st.price[0] + (pi % 5) * 0.28) * 100) / 100;
    const scs = st.sc.map(function (idv) {
      return scenes.filter(function (s) { return s.id === idv; })[0];
    }).filter(Boolean);
    const sizeList = sizeRange(st.sz[0], st.sz[1]);
    const moq = st.cat === '外套' ? 100 : st.cat === '套装' ? 150 : 200;
    const cbm = st.cat === '外套' ? 0.09 : st.cat === '套装' ? 0.07 : 0.045;
    const gw = st.cat === '外套' ? 14 : st.cat === '套装' ? 12 : 9;
    const per = st.cat === '外套' ? 20 : st.cat === '套装' ? 25 : 30;

    products.push({
      id: id, sku: 'MD-' + (1000 + pi), code: code,
      altCodes: [code + '-' + v.color.en.slice(0, 2).toUpperCase()],
      name: code + ' · ' + st.en,
      nameZh: code + ' · ' + st.zh + '（' + mat.name + ' / ' + v.color.c + '）',
      apps: scs.map(function (s) { return s.series; }),
      commonVehicles: [],
      nameEn: st.en + ' for Kids — ' + mat.nameEn + ', ' + v.color.en,
      cat: st.cat, catEn: st.catEn, brand: BRAND, material: v.fab,
      pos: '标准版型',
      dim: '胸围 ' + (50 + si % 12) + '–' + (78 + si % 12) + ' cm（按尺码递增）',
      holes: null, dimStatus: '已核对',
      price: price, moq: moq,
      pack: { per: per + ' 件/箱', gw: gw, cbm: cbm },
      hs: st.cat === '家居服' ? '6111.20' : st.cat === '裤子' ? '6203.42' : '6109.10',
      status: '在售',
      img: 'assets/img/kids/' + st.key + '.svg',
      desc: st.desc + ' 面料克重 ' + mat.mu + '，' + mat.traits.join('、') + '。',
      url: '', specStatus: '已核对',
      appsAll: scs.map(function (s) { return s.series; }),
      color: v.color.c, sizes: sizeList
    });

    codes.push({ id: 'X' + String(++ci).padStart(4, '0'), code: code, norm: code.toLowerCase(),
      pid: id, type: '款号', source: '棉豆款式库', conf: '高', note: st.zh + ' · ' + v.color.c });
    codes.push({ id: 'X' + String(++ci).padStart(4, '0'),
      code: code + '-' + v.color.en.slice(0, 2).toUpperCase(),
      norm: (code + v.color.en.slice(0, 2)).toLowerCase(), pid: id, type: '色号',
      source: '棉豆款式库', conf: '高', note: '同款不同色' });
  });
});

const fitments = [];
let fi2 = 0;
products.forEach(function (p) {
  const scIds = p.apps.map(function (a) {
    const s = scenes.filter(function (x) { return x.series === a; })[0];
    return s ? s.id : null;
  }).filter(Boolean);
  scIds.slice(0, 2).forEach(function (sid) {
    p.sizes.slice(0, 4).forEach(function (sz) {
      const ax = sizes.filter(function (a) { return a.id === 'AX-' + sz; })[0];
      const sc = scenes.filter(function (s) { return s.id === sid; })[0];
      if (!ax || !sc) return;
      fi2 += 1;
      fitments.push({
        id: 'F' + String(fi2).padStart(3, '0'),
        vid: sid, aid: ax.id, pid: p.id, code: p.code,
        pos: '', fit: '标准版型', conf: fi2 % 9 === 0 ? '中' : '已确认',
        src: '样衣实测 / 客户反馈',
        q: ['偏胖建议大一码', '内搭与外穿建议差一码'],
        vName: sc.brand + ' ' + sc.series + ' ' + sc.model,
        aName: ax.model + '（' + ax.spec + '）'
      });
    });
  });
});

scenes.forEach(function (v) {
  v.axles = Array.from(new Set(fitments.filter(function (f) { return f.vid === v.id; })
    .map(function (f) { return f.aid; })));
  v.skus = fitments.filter(function (f) { return f.vid === v.id; })
    .map(function (f) { return f.code; }).slice(0, 8);
  v.fitCount = fitments.filter(function (f) { return f.vid === v.id; }).length;
});

const testItems = [
  ['GB 31701-2015 A 类', '甲醛含量', '≤ 20 mg/kg', '国家纺织制品质量监督检验中心'],
  ['GB 31701-2015 A 类', 'pH 值', '6.2（标准 4.0–7.5）', '国家纺织制品质量监督检验中心'],
  ['GB 31701-2015 A 类', '可分解致癌芳香胺染料', '未检出（< 5 mg/kg）', '国家纺织制品质量监督检验中心'],
  ['GB 31701-2015 A 类', '耐唾液色牢度', '4–5 级', '国家纺织制品质量监督检验中心'],
  ['GB 31701-2015 B 类', '耐水色牢度', '4 级', '浙江省纺检院'],
  ['GB 31701-2015 B 类', '耐摩擦色牢度（干/湿）', '4 / 3–4 级', '浙江省纺检院'],
  ['GB/T 4802.1', '起球性能', '3–4 级（标准 ≥ 3）', '浙江省纺检院'],
  ['GB/T 3923.1', '断裂强力（纬向）', '286 N（标准 ≥ 200）', '内部实验室'],
  ['GB 31701-2015', '绳带安全（头颈部无绳带）', '符合', '国家纺织制品质量监督检验中心'],
  ['GB 31701-2015', '附件抗拉强力', '≥ 70 N，无脱落', '国家纺织制品质量监督检验中心'],
  ['OEKO-TEX 100', '甲醛 / 重金属 / 邻苯', '符合 Class I（婴幼儿）', 'Hohenstein 研究所'],
  ['AATCC 135', '水洗尺寸变化率', '直向 −2.1% / 横向 −1.8%', '内部实验室']
];
const tests = testItems.map(function (t, i) {
  const p = products[(i * 7) % products.length];
  return {
    id: 'T' + String(i + 1).padStart(3, '0'),
    pid: p.id, code: p.code, pname: p.code + ' · ' + p.cat,
    std: t[0], item: t[1], result: t[2], verdict: '合格', lab: t[3],
    no: 'TXT-2026-' + String(101 + i),
    date: '2026-0' + ((i % 9) + 1) + '-' + String(10 + i).padStart(2, '0')
  };
});

const customers = [
  { id: 'C-001', name: 'Babyland Retail S.A. de C.V.', country: '墨西哥', region: '北美', type: '经销商',
    tz: 'America/Mexico_City', grade: 'A', brand: 'MD', priceLevel: '标准', incoterm: 'CIF Manzanillo',
    pay: 'T/T 30% 定金', last: '2026-10-18', note: '12 家母婴门店 + 电商，主推 90–140 码针织' },
  { id: 'C-002', name: 'Kinderwelt Handel GmbH', country: '德国', region: '欧洲', type: '经销商',
    tz: 'Europe/Berlin', grade: 'A', brand: 'MDK', priceLevel: '大客户', incoterm: 'CIF Hamburg',
    pay: 'T/T 30% 定金', last: '2026-10-06', note: '要求 OEKO-TEX Class I，A 类全检' },
  { id: 'C-003', name: 'Tiny Threads Trading LLC', country: '阿联酋', region: '中东', type: '批发',
    tz: 'Asia/Dubai', grade: 'B', brand: 'MD', priceLevel: '标准', incoterm: 'CIF Jebel Ali',
    pay: 'T/T 30% 定金', last: '2026-09-28', note: '迪拜童装批发档口，走量为主' },
  { id: 'C-004', name: '萌宝童装批发商行', country: '中国', region: '国内', type: '批发',
    tz: 'Asia/Shanghai', grade: 'B', brand: 'MD', priceLevel: '经济', incoterm: 'FOB 宁波',
    pay: '款到发货', last: '2026-11-02', note: '内销批发，看重现货与起订量' },
  { id: 'C-005', name: 'Kids Kingdom Co., Ltd.', country: '泰国', region: '东南亚', type: '经销商',
    tz: 'Asia/Bangkok', grade: 'B', brand: 'MD', priceLevel: '标准', incoterm: 'CIF Laem Chabang',
    pay: 'T/T 30% 定金', last: '2026-08-22', note: '夏季防晒与短袖系列需求集中' },
  { id: 'C-006', name: 'Little Planet SAS', country: '哥伦比亚', region: '南美', type: '经销商',
    tz: 'America/Bogota', grade: 'C', brand: 'MD', priceLevel: '经济', incoterm: 'CIF Buenaventura',
    pay: 'T/T 30% 定金', last: '2026-07-15', note: '价格敏感，偏好基础款大宗' },
  { id: 'C-007', name: '向日葵母婴连锁', country: '中国', region: '国内', type: '渠道',
    tz: 'Asia/Shanghai', grade: 'A', brand: 'MDK', priceLevel: '大客户', incoterm: 'FOB 上海',
    pay: '月结 30 天', last: '2026-11-12', note: '华东 60 家门店，A 类标准硬性要求' },
  { id: 'C-008', name: 'Rainbow Kids Ltd.', country: '英国', region: '欧洲', type: '电商',
    tz: 'Europe/London', grade: 'B', brand: 'MD', priceLevel: '标准', incoterm: 'FOB 宁波',
    pay: 'T/T 30% 定金', last: '2026-09-09', note: '线上独立站，小单快反，看重新款速度' }
];

const leads = [
  { id: 'L-2601', created: '2026-11-21 08:12', src: '官网表单', company: 'Babyland Retail',
    contact: 'Jorge Ramírez（采购经理）', country: '墨西哥', tz: 'America/Mexico_City',
    need: 'Necesitamos 3000 piezas de playera manga corta talla 100-140 para temporada primavera.',
    needZh: '要 3000 件短袖T恤，100–140 码，春季档', status: '待跟进', score: 92, owner: 'Sophia',
    next: '确认配色与打包方式，回 FOB 价', nextDate: '2026-11-22', product: ['MD1001'],
    note: '连锁门店，返单稳定' },
  { id: 'L-2602', created: '2026-11-21 03:40', src: 'WhatsApp', company: 'Kinderwelt Handel',
    contact: 'Anke（Buyer）', country: '德国', tz: 'Europe/Berlin',
    need: 'Haben Sie A-Klasse Zertifikat für Baby-Bodysuit? 1200 Stück, Größe 80-100.',
    needZh: '哈衣要 A 类认证，1200 件，80–100 码', status: '待跟进', score: 88, owner: 'Jenny',
    next: '发 GB31701 + OEKO-TEX 报告', nextDate: '2026-11-22', product: ['MD1078'],
    note: '对认证文件要求很细' },
  { id: 'L-2603', created: '2026-11-20 22:05', src: 'TikTok 私信', company: 'Tiny Threads',
    contact: 'Ahmed（店主）', country: '阿联酋', tz: 'Asia/Dubai',
    need: 'كم سعر فستان بناتي مقاس 110؟ أريد 500 حبة',
    needZh: '110 码女童连衣裙多少钱？要 500 件', status: '已回复', score: 74, owner: 'Lily',
    next: '等客户确认款式', nextDate: '2026-11-24', product: ['MD1050'], note: '偏好亮色系' },
  { id: 'L-2604', created: '2026-11-20 16:30', src: '询价按钮', company: '萌宝童装批发商行',
    contact: '王先生', country: '中国', tz: 'Asia/Shanghai',
    need: '卫衣卫裤套装 500 套，110-150 码，能不能给批发价',
    needZh: '卫衣卫裤套装 500 套，110–150 码', status: '待跟进', score: 81, owner: 'Sophia',
    next: '报阶梯价并确认交期', nextDate: '2026-11-22', product: ['MD1092'], note: '内销批发，走量' },
  { id: 'L-2605', created: '2026-11-20 09:15', src: 'Facebook', company: 'Kids Kingdom',
    contact: 'Ploy（Owner）', country: '泰国', tz: 'Asia/Bangkok',
    need: 'Need sun protection jacket UPF50+, 800 pcs, size 90-130, ship to Bangkok.',
    needZh: '防晒外套 UPF50+，800 件，90–130 码，发曼谷', status: '待跟进', score: 86, owner: 'Jenny',
    next: '寄样衣 + 报价', nextDate: '2026-11-23', product: ['MD1077'], note: '夏季主力采购' },
  { id: 'L-2606', created: '2026-11-19 21:40', src: '官网表单', company: 'Rainbow Kids Ltd.',
    contact: 'Emma（Buyer）', country: '英国', tz: 'Europe/London',
    need: 'Looking for 600 pcs pyjamas, organic cotton, size 100-150. Can you do custom packaging?',
    needZh: '600 套家居服，有机棉，100–150 码，能定制包装吗', status: '已报价', score: 79, owner: 'Lily',
    next: '跟进包装打样', nextDate: '2026-11-25', product: ['MD1103'], note: '独立站卖家' },
  { id: 'L-2607', created: '2026-11-19 14:20', src: 'WhatsApp', company: 'Little Planet SAS',
    contact: 'Diego（Gerente）', country: '哥伦比亚', tz: 'America/Bogota',
    need: 'Precio de jeans para niños, talla 8-14, 2000 unidades.',
    needZh: '大童牛仔裤，8–14 码，2000 件，问价', status: '待跟进', score: 70, owner: 'Sophia',
    next: '先确认牛仔面料克重', nextDate: '2026-11-23', product: ['MD1025'], note: '价格敏感' },
  { id: 'L-2608', created: '2026-11-18 10:05', src: '展会', company: '向日葵母婴连锁',
    contact: '李女士（采购）', country: '中国', tz: 'Asia/Shanghai',
    need: '睡袋和爬服，各 1000 件，要 A 类，最好现货',
    needZh: '睡袋、爬服各 1000 件，A 类，最好有现货', status: '已成交', score: 95, owner: 'Jenny',
    next: '安排第二批返单', nextDate: '2026-12-05', product: ['MD1100'], note: '老客户，签年框' }
];

const scoreRules = [
  { k: 'channel', w: 18, label: '渠道类型', desc: '母婴连锁 / 品牌电商 = 加分；名称含 Trading / 货代 = 减分' },
  { k: 'spec', w: 16, label: '需求具体度', desc: '给出款式 + 尺码 + 数量 = 高分；只说「要童装」= 低分' },
  { k: 'volume', w: 14, label: '数量规模', desc: '500 件以上加分，50 件以下按打样处理' },
  { k: 'market', w: 12, label: '市场匹配', desc: '已有出货记录的国家/区域优先' },
  { k: 'cert', w: 12, label: '认证要求', desc: '主动问 A 类 / OEKO-TEX = 专业买家，加分' },
  { k: 'history', w: 10, label: '历史合作', desc: '返单客户直接进优先跟进池' }
];

const templates = [
  { id: 'T-SIZE', name: '尺码确认（3 问定码）', lang: '中文 / EN',
    body: 'Hi {{contact}},\n\nThanks for your inquiry about {{style}}. To make sure the size chart fits your market, please confirm ONE of the following:\n\n1) The height (cm) range of your target kids, e.g. 100–120 cm;\n2) Your best-selling size in similar styles last season;\n3) Whether you need Asian fit or EU/US fit sizing.\n\nOur size run is 80–160 cm. Once confirmed we will send the size chart, price and fabric swatches within 2 hours.\n\nBest regards,\n{{owner}} | MIANDOU KIDS' },
  { id: 'T-QUOTE', name: '报价跟进（含资料包）', lang: 'EN',
    body: 'Dear {{contact}},\n\nAttached is our quotation for {{items}} (valid 30 days), including:\n· size chart (80–160 cm)\n· fabric swatches & composition\n· test reports (GB 31701 A class / OEKO-TEX if needed)\n\nMOQ is listed per style. Tier pricing: 100+ / 300+ / 1000+ pcs.\n\nBest regards,\n{{owner}}' },
  { id: 'T-SAMPLE', name: '打样与改版确认', lang: '中文',
    body: 'Hi {{contact}},\n\n样衣进度：\n1) 版型确认稿已发出，请标注需要修改的部位（领口 / 袖长 / 裤长）；\n2) 面料色卡已寄出，确认后我们安排染色；\n3) 大货前会再寄一件确认样，签样后 25–35 天出货。\n\n打样周期 7–10 天，费用在大货 500 件以上可返还。\n\n{{owner}}' }
];

const catCount = {};
products.forEach(function (p) { catCount[p.cat] = (catCount[p.cat] || 0) + 1; });
const confCount = {};
fitments.forEach(function (f) { confCount[f.conf] = (confCount[f.conf] || 0) + 1; });

const stats = {
  products: products.length,
  codes: codes.length,
  vehicles: scenes.length,
  axles: sizes.length,
  fitments: fitments.length,
  tests: tests.length,
  materials: materials.length,
  images: Array.from(new Set(products.map(function (p) { return p.img; }))).length,
  withVehicle: products.filter(function (p) { return p.apps.length; }).length,
  cats: Object.keys(catCount).map(function (k) { return { cat: k, n: catCount[k] }; }),
  conf: Object.keys(confCount).map(function (k) { return { c: k, n: confCount[k] }; })
};

const DB = {
  meta: {
    version: '2.0.0',
    name: '棉豆 · 童装选款与订货中台',
    subtitle: '品类 / 尺码 / 款号 → 童装款式 → 报价与订货资料',
    built: '2026-11-22',
    company: {
      name: '湖州棉豆服饰有限公司',
      nameEn: 'HUZHOU MIANDOU GARMENT CO., LTD.',
      brand: 'MIANDOU / 棉豆',
      founded: 2014,
      site: '浙江湖州 · 织里童装产业园',
      capacity: '年产童装 300 万件，针织 / 梭织 / 家居服三条产线',
      staff: '120+ 人（设计 18 人，外贸 12 人）',
      markets: '东南亚、中东、欧洲、南美等 40 多个国家和地区',
      certs: ['GB 31701-2015 A 类', 'GB/T 22849 针织 T 恤衫', 'OEKO-TEX Standard 100', 'BSCI 社会责任审核', 'ISO 9001:2015'],
      web: ''
    },
    notices: [
      '全部款式、款号、价格均为演示用示例数据，不含任何第三方品牌、授权形象或受版权保护的图案。',
      '面料克重、尺码表、检测结果为公开行业标准与常规工艺参数的示例整理。',
      '实际下单前请以打样确认样与工厂大货样为准。'
    ]
  },
  stats: stats,
  materials: materials,
  brands: brands,
  currency: { base: 'USD', rates: { USD: 1, CNY: 7.15, EUR: 0.92, AED: 3.6725, SAR: 3.75, GBP: 0.79 } },
  products: products,
  codes: codes,
  vehicles: scenes,
  axles: sizes,
  fitments: fitments,
  tests: tests,
  customers: customers,
  leads: leads,
  scoreRules: scoreRules,
  templates: templates
};

fs.writeFileSync(path.join(ROOT, 'assets/data.js'), 'window.DB = ' + JSON.stringify(DB) + ';\n', 'utf8');

fs.mkdirSync(OUT_IMG, { recursive: true });
const PALETTE = ['#A9C3D6', '#F0C3C8', '#B7D8C4', '#D8C8B4', '#C9B79A', '#F5EFE6'];
const shapes = {
  tee: '<path d="M60 40 L95 28 L120 40 L140 62 L126 74 L120 66 L120 150 Q100 156 80 150 L80 66 L74 74 L60 62 Z"/>',
  lstripe: '<path d="M60 40 L95 28 L120 40 L140 62 L126 74 L120 66 L120 150 Q100 156 80 150 L80 66 L74 74 L60 62 Z"/><path d="M82 74 h36 M82 92 h36 M82 110 h36 M82 128 h36" stroke="#fff" stroke-width="3" opacity=".55"/>',
  polo: '<path d="M60 40 L95 28 L100 44 L120 44 L125 28 L140 62 L126 74 L120 66 L120 150 Q100 156 80 150 L80 66 L74 74 L60 62 Z"/>',
  vest: '<path d="M70 38 L100 30 L130 38 L134 60 L124 66 L124 148 Q100 154 76 148 L76 66 L66 60 Z"/>',
  hoodie: '<path d="M100 24 q22 0 22 18 q0 12 -22 12 q-22 0 -22 -12 q0 -18 22 -18 Z M62 48 L138 48 L142 70 L128 78 L128 150 Q100 158 72 150 L72 78 L58 70 Z"/>',
  corduroy: '<path d="M62 42 L96 30 L104 46 L124 40 L140 60 L128 72 L122 64 L122 150 Q100 156 78 150 L78 64 L72 72 L60 60 Z"/><path d="M86 70 v76 M110 70 v76" stroke="#fff" stroke-width="2" opacity=".4"/>',
  ruffle: '<path d="M64 42 L96 32 L120 40 L136 62 L124 72 L120 64 L120 146 Q100 152 80 146 L80 64 L76 72 L64 62 Z"/><path d="M64 42 q10 8 22 10 M136 62 q-10 8 -22 10" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>',
  jogger: '<path d="M74 34 h52 l6 20 -4 96 h-22 l-6 -60 -6 60 h-22 l-4 -96 Z"/>',
  denim: '<path d="M74 34 h52 l8 24 -6 92 h-24 l-4 -58 -4 58 h-24 l-6 -92 Z"/><path d="M88 60 v66 M112 60 v66" stroke="#fff" stroke-width="2" opacity=".45"/>',
  overall: '<path d="M78 30 L100 26 L122 30 L126 54 L140 60 L136 150 Q100 158 64 150 L60 60 L74 54 Z"/><rect x="60" y="58" width="80" height="10" fill="#fff" opacity=".45"/>',
  shorts: '<path d="M70 44 h60 l6 22 -6 58 h-22 l-4 -40 -4 40 h-22 l-6 -58 Z"/>',
  fleecepant: '<path d="M72 32 h56 l8 22 -6 98 h-26 l-6 -64 -6 64 h-26 l-6 -98 Z"/><path d="M76 50 h48" stroke="#fff" stroke-width="4" opacity=".5"/>',
  cargo: '<path d="M74 34 h52 l10 26 -8 90 h-22 l-4 -56 -4 56 h-22 l-6 -90 Z"/><rect x="112" y="80" width="16" height="18" fill="#fff" opacity=".45"/>',
  tutu: '<path d="M78 34 L100 26 L122 34 L136 52 L128 60 L124 54 L128 92 Q100 104 72 92 L76 54 L72 60 L64 52 Z"/><path d="M72 92 q28 26 56 0 q6 34 -28 52 q-34 -18 -28 -52 Z"/>',
  alinedress: '<path d="M78 32 L100 24 L122 32 L132 70 Q100 82 68 70 Z M68 70 Q100 82 132 70 L150 150 Q100 160 50 150 Z"/>',
  knitdress: '<path d="M78 30 L100 24 L122 30 L130 66 L146 150 Q100 158 54 150 L70 66 Z"/><path d="M76 60 h48 M72 88 h56 M70 116 h60" stroke="#fff" stroke-width="2" opacity=".4"/>',
  floral: '<path d="M78 32 L100 24 L122 32 L134 74 Q100 86 66 74 Z M66 74 Q100 86 134 74 L146 150 Q100 158 54 150 Z"/><circle cx="86" cy="104" r="5" fill="#fff" opacity=".6"/><circle cx="108" cy="126" r="4" fill="#fff" opacity=".6"/><circle cx="118" cy="98" r="3.5" fill="#fff" opacity=".6"/>',
  pleated: '<path d="M74 54 h52 l18 96 h-88 Z"/><path d="M88 60 l-6 88 M104 60 v88 M120 60 l6 88" stroke="#fff" stroke-width="2" opacity=".5"/>',
  windbreaker: '<path d="M60 42 L96 28 L104 46 L132 40 L142 66 L128 76 L128 152 Q100 160 72 152 L72 76 L58 66 Z"/><path d="M96 40 q14 10 0 22" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>',
  padded: '<path d="M58 44 L96 30 L104 48 L134 42 L144 68 L130 78 L130 152 Q100 160 70 152 L70 78 L56 68 Z"/><path d="M62 92 h76 M62 114 h76 M62 136 h76" stroke="#fff" stroke-width="2" opacity=".45"/>',
  shell: '<path d="M58 44 L96 30 L104 48 L136 42 L146 68 L130 78 L130 152 Q100 160 70 152 L70 78 L54 68 Z"/><path d="M104 48 v104" stroke="#fff" stroke-width="2" opacity=".5"/>',
  suncoat: '<path d="M62 44 L96 30 L104 46 L130 40 L140 64 L128 74 L128 148 Q100 156 74 148 L74 74 L60 64 Z"/><circle cx="100" cy="40" r="8" fill="#fff" opacity=".55"/>',
  cardigan: '<path d="M62 44 L96 30 L98 40 L102 40 L104 30 L138 44 L144 66 L130 76 L130 150 Q100 158 70 150 L70 76 L56 66 Z"/><path d="M100 44 v104" stroke="#fff" stroke-width="2" opacity=".6"/>',
  shortset: '<path d="M56 26 h44 v10 h-44 Z M60 40 l4 50 h-22 Z M96 40 l-4 50 h22 Z" opacity=".95"/><path d="M140 30 h44 l4 18 -4 44 h-16 l-4 -32 -4 32 h-16 l-4 -44 Z" opacity=".85"/>',
  tracksuit: '<path d="M52 24 L80 16 L86 30 L104 26 L112 44 L100 52 L100 108 Q78 114 56 108 L56 52 L46 44 Z"/><path d="M120 30 h44 l6 18 -6 76 h-18 l-4 -50 -4 50 h-18 l-4 -76 Z"/>',
  pajama: '<path d="M50 34 L80 24 L86 40 L108 34 L118 56 L106 66 L106 126 Q78 132 52 126 L52 66 L42 56 Z"/><path d="M124 40 h40 l6 16 -6 66 h-16 l-3 -44 -3 44 h-16 l-4 -66 Z"/>',
  sleepbag: '<path d="M78 26 q22 -8 44 0 l10 40 -8 88 q-24 8 -48 0 l-8 -88 Z"/><path d="M100 30 v122" stroke="#fff" stroke-width="2" opacity=".55"/>',
  romper: '<path d="M76 34 q24 -10 48 0 l8 30 -6 66 q-26 8 -52 0 l-6 -66 Z"/><path d="M76 92 h48" stroke="#fff" stroke-width="3" opacity=".55"/>'
};
Object.keys(shapes).forEach(function (key, i) {
  const bg = PALETTE[i % PALETTE.length];
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">' +
    '<rect width="200" height="200" fill="#f7f8fa"/>' +
    '<ellipse cx="100" cy="168" rx="52" ry="8" fill="#000" opacity=".05"/>' +
    '<g fill="' + bg + '" stroke="#6b7280" stroke-opacity=".25" stroke-width="1.5">' + shapes[key] + '</g></svg>';
  fs.writeFileSync(path.join(OUT_IMG, key + '.svg'), svg, 'utf8');
});

console.log('products=' + products.length + ' codes=' + codes.length + ' scenes=' + scenes.length +
  ' sizes=' + sizes.length + ' fitments=' + fitments.length + ' tests=' + tests.length +
  ' customers=' + customers.length + ' leads=' + leads.length + ' svg=' + Object.keys(shapes).length);
console.log('data.js 大小: ' + Math.round(fs.statSync(path.join(ROOT, 'assets/data.js')).size / 1024) + ' KB');