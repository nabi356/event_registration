"""Build docs/Eventra-System-Overview.docx from docs/ARCHITECTURE.md.

Renders the Markdown with pandoc, then restyles the result so it reads like a
designed Word document rather than pandoc's plain default: Obsidian-Glass
coloured headings, shaded table headers, and a title block.

Usage:
    python scripts/build-docs.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "docs" / "ARCHITECTURE.md"
OUTPUT = ROOT / "docs" / "Eventra-System-Overview.docx"

# Obsidian Glass palette — matches the app shell (#0B0F19 background,
# #3B82F6 accent used as Event.accentColor's default).
INK = RGBColor(0x0F, 0x17, 0x2A)
ACCENT = RGBColor(0x1D, 0x4E, 0xD8)
ACCENT_SOFT = RGBColor(0x33, 0x41, 0x55)
MUTED = RGBColor(0x64, 0x74, 0x8B)
HEADER_FILL = "EFF6FF"  # blue-50
CODE_FILL = "F1F5F9"  # slate-100
RULE_COLOR = "CBD5E1"  # slate-300


def render_with_pandoc() -> None:
    subprocess.run(
        ["pandoc", str(SOURCE), "-o", str(OUTPUT), "--standalone"],
        check=True,
        cwd=ROOT,
    )


def set_style_font(style, name: str, size: float, colour: RGBColor, bold=None) -> None:
    style.font.name = name
    style.font.size = Pt(size)
    style.font.color.rgb = colour
    if bold is not None:
        style.font.bold = bold
    # Word keeps a separate East-Asian font slot; mirror it so the font sticks.
    rpr = style.element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for attr in ("w:ascii", "w:hAnsi", "w:cs"):
        rfonts.set(qn(attr), name)


def get_style(doc: Document, name: str):
    """Return a style by name, or None.

    `name in doc.styles` compares Style objects against a string and always
    returns False, so membership has to be probed by lookup instead.
    """
    try:
        return doc.styles[name]
    except KeyError:
        return None


def shade(element, fill: str) -> None:
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    element.append(shd)


def cell_shading(cell, fill: str) -> None:
    shade(cell._tc.get_or_add_tcPr(), fill)


def paragraph_rule(paragraph, colour: str = RULE_COLOR, size: int = 8) -> None:
    """Add a thin bottom border — used to separate headings from body text."""
    ppr = paragraph._p.get_or_add_pPr()
    borders = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), colour)
    borders.append(bottom)
    ppr.append(borders)


def table_borders(table, colour: str = RULE_COLOR) -> None:
    """Apply a hairline grid directly to the table.

    Pandoc's reference document ships without named table styles such as
    "Table Grid", so the borders are written into the table properties instead
    of relying on a style lookup that may not exist.
    """
    tbl_pr = table._tbl.tblPr
    for existing in tbl_pr.findall(qn("w:tblBorders")):
        tbl_pr.remove(existing)

    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        element = OxmlElement(f"w:{edge}")
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "4")
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), colour)
        borders.append(element)
    tbl_pr.append(borders)


def style_document() -> None:
    doc = Document(OUTPUT)

    # --- Base typography -------------------------------------------------
    normal = doc.styles["Normal"]
    set_style_font(normal, "Calibri", 11, INK)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.15

    # --- Headings --------------------------------------------------------
    heading_specs = {
        "Heading 1": (20, ACCENT, 20, 8),
        "Heading 2": (16, ACCENT, 18, 6),
        "Heading 3": (13, ACCENT_SOFT, 14, 4),
        "Heading 4": (11.5, ACCENT_SOFT, 12, 3),
    }
    for name, (size, colour, before, after) in heading_specs.items():
        style = get_style(doc, name)
        if style is None:
            continue
        set_style_font(style, "Calibri", size, colour, bold=True)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    # --- Code / preformatted ---------------------------------------------
    for name in ("Source Code", "Verbatim Char", "HTML Preformatted"):
        style = get_style(doc, name)
        if style is not None:
            set_style_font(style, "Consolas", 9.5, INK)

    # --- Title block ------------------------------------------------------
    # The markdown's H1 renders as "Heading 1"; promote the very first one to
    # the Title style so the document opens like a report cover.
    title_style = get_style(doc, "Title")
    subtitle_style = get_style(doc, "Subtitle")
    for paragraph in doc.paragraphs:
        if paragraph.style.name == "Heading 1" and paragraph.text.strip():
            if title_style is not None:
                paragraph.style = title_style
                set_style_font(title_style, "Calibri", 30, INK, bold=True)
                title_style.paragraph_format.space_after = Pt(4)
            paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT

            # Build the subtitle at the end, then relocate it to sit directly
            # beneath the title — insert_paragraph_before would put it above.
            subtitle = doc.add_paragraph(
                "Campus Event Operations & Zero-Trust Check-in System"
            )
            target = subtitle_style or get_style(doc, "Normal")
            if target is not None:
                subtitle.style = target
                # Only restyle when we actually resolved a dedicated Subtitle
                # style — falling back to Normal must not recolour the body.
                if subtitle_style is not None:
                    set_style_font(subtitle_style, "Calibri", 13, MUTED)
            paragraph._p.addnext(subtitle._p)
            break

    # --- Paragraph polish --------------------------------------------------
    for paragraph in doc.paragraphs:
        name = paragraph.style.name

        # Headings get a hairline rule underneath.
        if name in ("Heading 2", "Heading 3"):
            paragraph_rule(paragraph)

        # Code blocks: tinted background + fixed-width font.
        if name in ("Source Code", "HTML Preformatted"):
            shade(paragraph._p.get_or_add_pPr(), CODE_FILL)
            for run in paragraph.runs:
                run.font.name = "Consolas"
                run.font.size = Pt(9)

        # Blockquotes (the callout at the top of the doc).
        if name == "Block Text":
            block_style = get_style(doc, "Block Text")
            if block_style is not None:
                set_style_font(block_style, "Calibri", 11, ACCENT_SOFT)

    # --- Tables: shaded header row + hairline grid -------------------------
    for table in doc.tables:
        table_borders(table)
        for index, row in enumerate(table.rows):
            for cell in row.cells:
                if index == 0:
                    cell_shading(cell, HEADER_FILL)
                for paragraph in cell.paragraphs:
                    paragraph.paragraph_format.space_before = Pt(3)
                    paragraph.paragraph_format.space_after = Pt(3)
                    paragraph.paragraph_format.line_spacing = 1.0
                    for run in paragraph.runs:
                        run.font.size = Pt(9.5)
                        run.font.name = "Calibri"
                        if index == 0:
                            run.font.bold = True
                            run.font.color.rgb = ACCENT

    doc.save(OUTPUT)


def main() -> int:
    if not SOURCE.exists():
        print(f"missing source: {SOURCE}", file=sys.stderr)
        return 1
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    render_with_pandoc()
    style_document()
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
