# 生成 data/导入模板.xlsx —— 与 SQLite 库、前端字段一致的 7 张表
import json, os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "data", "db.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "data", "导入模板.xlsx")

HEAD_FILL = PatternFill("solid", fgColor="0F1A2B")
HEAD_FONT = Font(color="FFFFFF", bold=True, size=10.5)
TITLE_FONT = Font(bold=True, size=14)
SUB_FONT = Font(color="6B7686", size=10)
THIN = Side(style="thin", color="D8DDE4")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
ALT_FILL = PatternFill("solid", fgColor="FAFBFC")

wb = Workbook()

# ---------- 说明 ----------
ws = wb.active
ws.title = "说明"
ws.column_dimensions["A"].width = 18
ws.column_dimensions["B"].width = 105
ws["A1"] = "冠英 · 选型与报价中台 —— 数据导入模板"
ws["A1"].font = TITLE_FONT
ws["A2"] = f"版本 {D['meta']['version']} · 构建于 {D['meta']['built']} · 配套 SQLite 库 data/guanying.db"
ws["A2"].font = SUB_FONT

rows = [
    ("怎么用", "① 在「产品主数据」「编码对照」「适配关系」三张表里按表头填数（不要改表头行）；② 另存为 CSV（UTF-8）；③ 打开 index.html →「数据导入」→ 选择对应类型 → 粘贴 → 校验并导入。"),
    ("最小可用集", "只要「产品主数据」+「适配关系」两张表就能跑通选型；编码对照用来提升老客户报编码时的命中率。"),
    ("置信度口径", "已确认 = 有实车/台架依据；高 = 官网目录或 OE 编码明确；中 = 行业通行对应；低 = 待验证。低置信度不要直接对外报价。"),
    ("型号口径", "「型号」列填冠英自己的型号（如 HOWO1、CA9T R、29087、58144-45211-1）。外部编码填到「编码对照」，不要混在型号里。"),
    ("消歧问题", "一行一条，用 | 分隔。这是「当场能答」的关键：告诉销售，还差哪一个信息就能锁定，而不是让客户猜。"),
    ("价格口径", "参考价 USD/套，为演示基准价；导入后前端按「数量阶梯 × 客户等级 × 材质系数」自动算价。"),
    ("不要做什么", "不要在这张表里写合并单元格、公式、批注；不要用型号列做分类（分类请填「品类」）。"),
    ("隐私", "客户与线索表仅存公司名、国家、联系人称谓，不存身份证/银行卡等敏感信息。"),
]
r = 4
for k, v in rows:
    ws.cell(row=r, column=1, value=k).font = Font(bold=True, size=10.5)
    c = ws.cell(row=r, column=2, value=v)
    c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.row_dimensions[r].height = 42 if len(v) > 60 else 24
    r += 1

r += 1
ws.cell(row=r, column=1, value="表清单").font = Font(bold=True, size=11)
r += 1
sheets_desc = [
    ("产品主数据", f"{D['stats']['products']} 行", "型号、名称、品类、规格、材质、价格、常用车型"),
    ("编码对照", f"{D['stats']['codes']} 行", "OE / WVA / 工厂码 / 客户叫法 → 型号"),
    ("车型", f"{D['stats']['vehicles']} 行", "车型主数据 + 别名（口语叫法）"),
    ("车桥", f"{D['stats']['axles']} 行", "车桥主数据 + 别名"),
    ("适配关系", f"{D['stats']['fitments']} 行", "车型 × 车桥 × 部位 → 型号，含消歧问题"),
    ("试验报告", f"{D['stats']['tests']} 行", "标准、项目、结果、报告号"),
    ("询盘线索", f"{len(D['leads'])} 行", "来源、国家、时区、原文、评分"),
]
for name, n, desc in sheets_desc:
    ws.cell(row=r, column=1, value=name).font = Font(bold=True)
    ws.cell(row=r, column=2, value=f"{n}　{desc}").font = SUB_FONT
    r += 1

# ---------- 通用写表 ----------
def sheet(title, headers, data, widths, wrap_cols=(), note=None):
    s = wb.create_sheet(title)
    s.append(headers)
    for i, w in enumerate(widths, 1):
        s.column_dimensions[get_column_letter(i)].width = w
    for c in s[1]:
        c.fill = HEAD_FILL; c.font = HEAD_FONT
        c.alignment = Alignment(vertical="center", horizontal="left")
        c.border = BORDER
    for ridx, row in enumerate(data, 2):
        s.append(list(row))
        for c in s[ridx]:
            c.border = BORDER
            c.alignment = Alignment(vertical="top", wrap_text=(c.column in wrap_cols))
            if ridx % 2 == 0:
                c.fill = ALT_FILL
    s.freeze_panes = "A2"
    s.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{len(data) + 1}"
    s.row_dimensions[1].height = 26
    if note:
        n = s.cell(row=len(data) + 3, column=1, value=note)
        n.font = SUB_FONT
    return s

# ---------- 产品主数据 ----------
sheet("产品主数据",
      ["型号", "SKU", "中文名", "英文名", "品类", "部位", "规格", "孔数", "材质代码", "品牌", "MOQ", "包装", "毛重kg", "CBM", "HS", "参考价USD", "常用车型", "数据状态"],
      [[p["code"], p["sku"], p.get("nameZh", ""), p["nameEn"], p["cat"], p.get("pos", ""), p.get("dim", ""),
        p.get("holes") or "", p["material"], p["brand"], p["moq"], p["pack"]["per"], p["pack"]["gw"], p["pack"]["cbm"],
        p["hs"], p["price"], "、".join(p.get("appsAll", [])), p.get("dimStatus", "")] for p in D["products"]],
      [16, 14, 30, 46, 12, 7, 14, 7, 9, 10, 8, 22, 8, 8, 9, 10, 30, 10],
      wrap_cols=(4, 12, 17),
      note="「部位」填 前/后；「孔数」没有就留空；材质代码：NAO / SM / LM / CM / HD / WT（见说明）。")

# ---------- 编码对照 ----------
sheet("编码对照",
      ["型号", "编码", "编码类型", "来源", "置信度", "备注"],
      [[next((p["code"] for p in D["products"] if p["id"] == c["pid"]), ""), c["code"], c["type"], c["source"], c["conf"], c.get("note", "")]
       for c in D["codes"]],
      [16, 26, 12, 30, 9, 26],
      note="编码类型：OE 原厂号 / WVA 号 / 工厂码 / 客户叫法 / 竞品码。一条型号可以有多个编码。")

# ---------- 车型 ----------
sheet("车型",
      ["车型ID", "品牌", "车系", "车型", "年款", "类别", "别名(用|分隔)", "常见车桥ID(用|分隔)", "备注"],
      [[v["id"], v["brand"], v["series"], v["model"], v["years"], v["cls"], "|".join(v["alias"]), "|".join(v.get("axles") or []), v.get("note", "")]
       for v in D["vehicles"]],
      [14, 12, 14, 20, 14, 16, 46, 26, 50],
      wrap_cols=(7, 9),
      note="别名是「销售和客户嘴里的叫法」，越多越容易命中：J6 / 解放J6 / FAW J6 都算。")

# ---------- 车桥 ----------
sheet("车桥",
      ["车桥ID", "品牌", "型号", "型式", "承载", "规格", "别名(用|分隔)"],
      [[a["id"], a["brand"], a["model"], a["type"], a["cap"], a["spec"], "|".join(a["alias"])] for a in D["axles"]],
      [14, 14, 18, 8, 14, 22, 40],
      wrap_cols=(7,))

# ---------- 适配关系 ----------
sheet("适配关系",
      ["车型ID", "车桥ID(可空)", "部位", "型号", "适配类型", "置信度", "来源", "消歧问题(用|分隔)"],
      [[f["vid"] or "", f["aid"] or "", f["pos"], f["code"], f["fit"], f["conf"], f["src"], "|".join(f.get("q") or [])]
       for f in D["fitments"]],
      [14, 16, 7, 16, 12, 9, 34, 70],
      wrap_cols=(7, 8),
      note="同一个车型可以有多行（不同车桥/部位）。「消歧问题」写客户一听就能答的问题，例如「数一下旧片孔数：8 孔还是 15 孔」。")

# ---------- 试验报告 ----------
sheet("试验报告",
      ["型号", "标准", "项目", "结果", "判定", "实验室", "报告号", "日期"],
      [[t["code"], t["std"], t["item"], t["result"], t["verdict"], t["lab"], t["no"], t["date"]] for t in D["tests"]],
      [16, 18, 24, 34, 12, 34, 22, 12],
      wrap_cols=(4, 6),
      note="标准写法：GB 5763-2018、ECE R90、SAE J661、ISO 15484、JIS D 4411、QC/T 25-2004。")

# ---------- 询盘线索 ----------
sheet("询盘线索",
      ["公司", "国家", "来源", "联系人", "时区", "询盘原文", "状态", "负责人"],
      [[l["company"], l["country"], l["src"], l["contact"], l["tz"], l["need"], l["status"], l["owner"]] for l in D["leads"]],
      [30, 12, 12, 26, 20, 62, 10, 10],
      wrap_cols=(6,),
      note="时区用 IANA 名称（Asia/Dubai、America/Mexico_City），浮窗才能算「客户现在是否上班」。")

wb.save(OUT)
print("saved", OUT, os.path.getsize(OUT) // 1024, "KB")