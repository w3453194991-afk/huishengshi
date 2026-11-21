# -*- coding: utf-8 -*-
"""把 docs/方案说明.md 转成可直接提交的 docs/方案说明.docx"""
import os, re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "docs", "方案说明.md")
OUT = os.path.join(ROOT, "docs", "方案说明.docx")

ACCENT = RGBColor(0xC2, 0x41, 0x0C)
NAVY = RGBColor(0x0F, 0x1A, 0x2B)
GREY = RGBColor(0x5A, 0x64, 0x72)


def set_cn(run, font="微软雅黑"):
    run.font.name = font
    r = run._element
    rPr = r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:eastAsia"), font)
    rFonts.set(qn("w:ascii"), font)
    rFonts.set(qn("w:hAnsi"), font)


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def bottom_border(par, color="D8DDE4", size="6"):
    pPr = par._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color)
    pbdr.append(bottom)
    pPr.append(pbdr)


def add_page_number(par):
    run = par.add_run()
    fld1 = OxmlElement("w:fldChar"); fld1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve"); instr.text = " PAGE "
    fld2 = OxmlElement("w:fldChar"); fld2.set(qn("w:fldCharType"), "end")
    run._r.append(fld1); run._r.append(instr); run._r.append(fld2)
    set_cn(run, "微软雅黑"); run.font.size = Pt(9); run.font.color.rgb = GREY


INLINE = re.compile(r"(\*\*.+?\*\*|`[^`]+`|\*[^*\n]+\*)")


def rich(par, text, size=10.5, color=None, bold=False):
    """支持 **粗体**、`等宽`、*斜体* 的行内格式"""
    for seg in INLINE.split(text):
        if not seg:
            continue
        if seg.startswith("**") and seg.endswith("**") and len(seg) > 4:
            r = par.add_run(seg[2:-2]); r.bold = True
            set_cn(r); r.font.size = Pt(size)
            if color:
                r.font.color.rgb = color
        elif seg.startswith("`") and seg.endswith("`") and len(seg) > 2:
            r = par.add_run(seg[1:-1]); r.font.name = "Consolas"
            r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")
            r.font.size = Pt(size - 0.5)
            r.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)
        elif seg.startswith("*") and seg.endswith("*") and len(seg) > 2:
            r = par.add_run(seg[1:-1]); r.italic = True
            set_cn(r); r.font.size = Pt(size)
            if color:
                r.font.color.rgb = color
        else:
            r = par.add_run(seg); r.bold = bold
            set_cn(r); r.font.size = Pt(size)
            if color:
                r.font.color.rgb = color


doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.2)
sec.top_margin = Cm(2.0); sec.bottom_margin = Cm(2.0)

style = doc.styles["Normal"]
style.font.size = Pt(10.5)
style.paragraph_format.line_spacing = 1.45
style.paragraph_format.space_after = Pt(5)

# 页脚页码
footer_p = sec.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
add_page_number(footer_p)

lines = open(SRC, encoding="utf-8").read().splitlines()

# ---------- 封面 ----------
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(60)
r = p.add_run("冠英刹车片"); set_cn(r); r.font.size = Pt(30); r.bold = True; r.font.color.rgb = NAVY
p = doc.add_paragraph()
r = p.add_run("选型知识库 + 线索中台"); set_cn(r); r.font.size = Pt(22); r.bold = True; r.font.color.rgb = ACCENT
p = doc.add_paragraph()
r = p.add_run("把「车型 / 车桥 / 旧件编码」翻译成型号、依据、报价与资料包"); set_cn(r)
r.font.size = Pt(11); r.font.color.rgb = GREY
doc.add_paragraph()

meta = doc.add_table(rows=4, cols=2)
meta.alignment = WD_TABLE_ALIGNMENT.LEFT
rows = [("提交方", "浙江冠英汽车零部件有限公司（KOOYING）"),
        ("方案版本", "v1.0"),
        ("日期", "2026 年 11 月"),
        ("交付物", "离线 Web 应用 · SQLite 数据库 · Excel 导入模板 · 方案与使用文档")]
for i, (k, v) in enumerate(rows):
    c0, c1 = meta.rows[i].cells
    c0.width = Cm(3.2); c1.width = Cm(13)
    pr = c0.paragraphs[0]; rr = pr.add_run(k); set_cn(rr); rr.font.size = Pt(9.5); rr.font.color.rgb = GREY
    pr = c1.paragraphs[0]; rr = pr.add_run(v); set_cn(rr); rr.font.size = Pt(9.5)
    for c in (c0, c1):
        c._tc.get_or_add_tcPr().append(OxmlElement("w:tcBorders"))
doc.add_page_break()

# ---------- 正文 ----------
i = 0
seen_h1 = False
seen_quote = False
while i < len(lines):
    line = lines[i].rstrip()
    if not line.strip():
        i += 1; continue

    # 代码块 / 架构图
    if line.strip().startswith("```"):
        i += 1
        code_lines = []
        while i < len(lines) and not lines[i].strip().startswith("```"):
            code_lines.append(lines[i]); i += 1
        i += 1
        for cl in code_lines:
            par = doc.add_paragraph()
            par.paragraph_format.space_after = Pt(0)
            par.paragraph_format.line_spacing = 1.0
            par.paragraph_format.left_indent = Cm(0.3)
            r = par.add_run(cl if cl.strip() else " ")
            r.font.name = "Consolas"; r.font.size = Pt(8)
            r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")
            pPr = par._p.get_or_add_pPr()
            shd = OxmlElement("w:shd")
            shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), "F4F6F8")
            pPr.append(shd)
        doc.add_paragraph()
        continue

    # 表格
    if line.startswith("|"):
        block = []
        while i < len(lines) and lines[i].strip().startswith("|"):
            block.append(lines[i].strip()); i += 1
        rows = []
        for b in block:
            cells = [c.strip() for c in b.strip("|").split("|")]
            if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                continue
            rows.append(cells)
        if rows:
            ncol = max(len(r) for r in rows)
            t = doc.add_table(rows=len(rows), cols=ncol)
            t.style = "Table Grid"
            t.alignment = WD_TABLE_ALIGNMENT.CENTER
            for ri, row in enumerate(rows):
                for ci in range(ncol):
                    cell = t.rows[ri].cells[ci]
                    txt = row[ci] if ci < len(row) else ""
                    par = cell.paragraphs[0]
                    par.paragraph_format.space_after = Pt(1)
                    par.paragraph_format.line_spacing = 1.15
                    rich(par, txt, size=9, bold=(ri == 0),
                         color=RGBColor(0xFF, 0xFF, 0xFF) if ri == 0 else None)
                    if ri == 0:
                        shade(cell, "0F1A2B")
            doc.add_paragraph()
        continue

    # 标题
    m = re.match(r"^(#{1,3})\s+(.*)$", line)
    if m:
        level, text = len(m.group(1)), m.group(2)
        text = text.replace("`", "").replace("**", "").strip()
        if level == 1 and not seen_h1:
            seen_h1 = True          # 封面已有主标题，正文跳过第一个 H1
            i += 1; continue
        if level == 1:
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(6); h.paragraph_format.space_after = Pt(10)
            r = h.add_run(text); set_cn(r); r.bold = True; r.font.size = Pt(19); r.font.color.rgb = NAVY
            bottom_border(h, "C2410C", "10")
        elif level == 2:
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(14); h.paragraph_format.space_after = Pt(6)
            r = h.add_run(text); set_cn(r); r.bold = True; r.font.size = Pt(13.5); r.font.color.rgb = ACCENT
        else:
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(9); h.paragraph_format.space_after = Pt(3)
            r = h.add_run(text); set_cn(r); r.bold = True; r.font.size = Pt(11.5); r.font.color.rgb = NAVY
        i += 1; continue

    # 引用
    if line.startswith(">"):
        seen_quote = True
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(0.6)
        par.paragraph_format.space_before = Pt(4)
        rich(par, line.lstrip("> ").strip(), size=10, color=GREY)
        bottom_border(par, "E8EBF0", "4")
        i += 1; continue

    # 列表
    if re.match(r"^[-*]\s+", line) or re.match(r"^\d+\.\s+", line):
        ordered = bool(re.match(r"^\d+\.\s+", line))
        text = re.sub(r"^([-*]|\d+\.)\s+", "", line)
        par = doc.add_paragraph(style="List Number" if ordered else "List Bullet")
        par.paragraph_format.space_after = Pt(2)
        par.paragraph_format.line_spacing = 1.35
        rich(par, text, size=10.5)
        i += 1; continue

    # 分隔线
    if re.fullmatch(r"-{3,}", line.strip()):
        p = doc.add_paragraph(); bottom_border(p, "E8EBF0", "6"); i += 1; continue

    # 普通段落
    if re.fullmatch(r"\*\*方案说明\s*·.*\*\*", line.strip()):
        i += 1; continue          # 与封面版本信息重复
    par = doc.add_paragraph()
    rich(par, line.strip(), size=10.5)
    i += 1

doc.save(OUT)
print("saved", OUT, os.path.getsize(OUT) // 1024, "KB")