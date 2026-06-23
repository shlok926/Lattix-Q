import io
import html
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, HRFlowable, PageBreak, KeepTogether)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.graphics.shapes import Drawing, Rect, String, Circle, Line
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie

# ── Palette ──────────────────────────────────────────────────────────────────
BG   = colors.HexColor("#0F172A")
ACC  = colors.HexColor("#7C3AED")
RED  = colors.HexColor("#EF4444")
ORG  = colors.HexColor("#F59E0B")
BLU  = colors.HexColor("#3B82F6")
GRN  = colors.HexColor("#10B981")
GRY  = colors.HexColor("#374151")
LGR  = colors.HexColor("#F8FAFC")
MID  = colors.HexColor("#64748B")
WHT  = colors.white
BDR  = colors.HexColor("#E2E8F0")

PW = A4[0] - 3.6*cm   # usable page width

SEV = {"Critical": RED, "High": ORG, "Medium": BLU, "Low": GRN}

def p(name, **kw):
    d = dict(fontName="Helvetica", fontSize=9, textColor=GRY, leading=14)
    d.update(kw)
    return ParagraphStyle(name, **d)

def hr(col=ACC):
    return HRFlowable(width="100%", thickness=0.6, color=col,
                      spaceBefore=3, spaceAfter=8)

def section_title(text):
    return Paragraph(text, p("st", fontSize=12, fontName="Helvetica-Bold",
                              textColor=ACC, spaceBefore=14, spaceAfter=2))

# ── Cover (single Drawing — no unicode) ──────────────────────────────────────
def make_cover(org, date):
    org_clean = html.escape(str(org))
    h = 250
    d = Drawing(PW, h)
    d.add(Rect(0, 0, PW, h, fillColor=BG, strokeColor=None))
    d.add(Rect(0, h-4, PW, 4, fillColor=ACC, strokeColor=None))
    d.add(Rect(0, 0,   PW, 4, fillColor=ACC, strokeColor=None))
    cy = h - 50
    d.add(String(PW/2, cy,      "CONFIDENTIAL SECURITY AUDIT",
                 fontName="Helvetica", fontSize=8,  fillColor=MID,  textAnchor="middle"))
    d.add(String(PW/2, cy-30,   "QuantumShield",
                 fontName="Helvetica-Bold", fontSize=32, fillColor=WHT, textAnchor="middle"))
    d.add(String(PW/2, cy-52,   "Post-Quantum Cryptographic Assessment Report",
                 fontName="Helvetica", fontSize=11, fillColor=colors.HexColor("#A78BFA"), textAnchor="middle"))
    d.add(Line(PW*0.2, cy-68, PW*0.8, cy-68, strokeColor=ACC, strokeWidth=0.8))
    d.add(String(PW/2, cy-84,  f"Organization : {org_clean}",
                 fontName="Helvetica", fontSize=9, fillColor=MID, textAnchor="middle"))
    d.add(String(PW/2, cy-100, f"Report Date  : {date}",
                 fontName="Helvetica", fontSize=9, fillColor=MID, textAnchor="middle"))
    d.add(String(PW/2, cy-118, "Classification : CONFIDENTIAL - For Authorized Personnel Only",
                 fontName="Helvetica-Oblique", fontSize=8, fillColor=MID, textAnchor="middle"))
    return d

# ── Gauge ────────────────────────────────────────────────────────────────────
def make_gauge(score):
    col   = GRN if score >= 80 else (ORG if score >= 50 else RED)
    label = "Quantum-Ready" if score >= 80 else ("Partially Ready" if score >= 50 else "Critical Risk")
    h = 100
    d = Drawing(PW, h)
    d.add(Rect(0, 0, PW, h, fillColor=LGR, strokeColor=BDR, strokeWidth=0.8))
    cx = PW / 2
    d.add(Circle(cx, 58, 38, fillColor=BG, strokeColor=col, strokeWidth=5))
    d.add(String(cx, 50, str(score),
                 fontName="Helvetica-Bold", fontSize=28, fillColor=col, textAnchor="middle"))
    d.add(String(cx, 34, "/ 100",
                 fontName="Helvetica", fontSize=8, fillColor=MID, textAnchor="middle"))
    d.add(String(cx, 8, f"QUANTUM READINESS SCORE  |  {label}",
                 fontName="Helvetica-Bold", fontSize=8, fillColor=GRY, textAnchor="middle"))
    return d

# ── 4-box stats row ──────────────────────────────────────────────────────────
def make_stats(score, n_total, n_crit, n_high):
    items = [
        ("READINESS SCORE", f"{score}/100", ACC),
        ("VULNERABILITIES", str(n_total),   RED),
        ("CRITICAL",        str(n_crit),     RED),
        ("HIGH RISK",       str(n_high),     ORG),
    ]
    cells = []
    for lbl, val, col in items:
        cells.append([
            Paragraph(lbl, p("sl", fontSize=7, fontName="Helvetica-Bold",
                              textColor=MID, alignment=TA_CENTER)),
            Paragraph(val, p("sv", fontSize=20, fontName="Helvetica-Bold",
                              textColor=col, alignment=TA_CENTER, leading=26)),
        ])
    t = Table([cells], colWidths=[PW/4]*4)
    t.setStyle(TableStyle([
        ("INNERGRID",     (0,0), (-1,-1), 0.5, BDR),
        ("BOX",           (0,0), (-1,-1), 0.5, BDR),
        ("BACKGROUND",    (0,0), (-1,-1), LGR),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    return t

# ── Severity bar chart ───────────────────────────────────────────────────────
def make_chart(findings):
    counts = [
        sum(1 for f in findings if f.get("risk") == "Critical"),
        sum(1 for f in findings if f.get("risk") == "High"),
        sum(1 for f in findings if f.get("risk") == "Medium"),
        sum(1 for f in findings if f.get("risk") == "Low"),
    ]
    if sum(counts) == 0:
        return None
    d  = Drawing(PW, 130)
    bc = VerticalBarChart()
    bc.x = 45; bc.y = 15; bc.height = 100; bc.width = PW - 60
    bc.data = [counts]
    bc.categoryAxis.categoryNames = ["Critical", "High", "Medium", "Low"]
    bc.categoryAxis.labels.fontName = "Helvetica"; bc.categoryAxis.labels.fontSize = 8
    bc.valueAxis.valueMin  = 0
    bc.valueAxis.valueStep = max(1, max(counts))
    bc.valueAxis.labels.fontName = "Helvetica"; bc.valueAxis.labels.fontSize = 8
    for i, col in enumerate([RED, ORG, BLU, GRN]):
        bc.bars[0, i].fillColor = col
    d.add(bc)
    return d

def make_pie_chart(findings):
    dist = {}
    for f in findings:
        tech = f.get("technology", "Other")
        dist[tech] = dist.get(tech, 0) + 1
    
    if not dist:
        return None
        
    d = Drawing(PW, 150)
    pc = Pie()
    pc.x = 100; pc.y = 25; pc.width = 100; pc.height = 100
    pc.data = list(dist.values())
    pc.labels = list(dist.keys())
    pc.sideLabels = 1
    pc.slices.strokeWidth = 0.5
    
    # Custom colors for slices
    slice_colors = [ACC, BLU, RED, ORG, GRN, MID]
    for i in range(len(pc.data)):
        pc.slices[i].fillColor = slice_colors[i % len(slice_colors)]
        
    d.add(pc)
    return d

# ── Finding cards ─────────────────────────────────────────────────────────────
def make_finding(idx, f):
    sev = html.escape(str(f.get("risk", "Medium")))
    sc  = SEV.get(f.get("risk", "Medium"), BLU)
    tech = html.escape(str(f.get("technology","")))
    # header
    hdr_data = [[
        Paragraph(f"  FINDING-{idx:02d}", p("fid", fontSize=9, fontName="Helvetica-Bold", textColor=WHT)),
        Paragraph(tech, p("ft", fontSize=9, fontName="Helvetica-Bold", textColor=WHT)),
        Paragraph(f"Line {f.get('line','?')}", p("fl", fontSize=8, textColor=WHT, alignment=TA_CENTER)),
        Paragraph(sev, p("fs", fontSize=8, fontName="Helvetica-Bold", textColor=WHT, alignment=TA_CENTER)),
    ]]
    ht = Table(hdr_data, colWidths=[PW*0.33, PW*0.27, PW*0.18, PW*0.22])
    ht.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (2,0), BG),
        ("BACKGROUND",    (3,0), (3,0), sc),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ]))
    # body
    raw_snippet = f.get("content","")[:80]
    escaped_snippet = html.escape(str(raw_snippet))
    suggestion = html.escape(str(f.get("suggestion","")))
    body_data = [
        [Paragraph("Evidence",       p("el", fontSize=8, fontName="Helvetica-Bold", textColor=MID)),
         Paragraph(f"<font name='Courier' size='8'>{escaped_snippet}</font>", p("ec", fontSize=8))],
        [Paragraph("Recommendation", p("rl", fontSize=8, fontName="Helvetica-Bold", textColor=MID)),
         Paragraph(suggestion, p("rc", fontSize=8))],
    ]
    bt = Table(body_data, colWidths=[PW*0.20, PW*0.80])
    bt.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), LGR),
        ("GRID",          (0,0), (-1,-1), 0.4, BDR),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ]))
    return KeepTogether([ht, bt, Spacer(1, 0.25*cm)])

# ── Risk matrix ───────────────────────────────────────────────────────────────
def make_risk_matrix():
    cells = [
        ["",              "Low Impact", "Medium Impact", "High Impact"],
        ["High Likelihood","Medium",    "High",          "Critical"],
        ["Med Likelihood", "Low",       "Medium",        "High"],
        ["Low Likelihood", "Low",       "Low",           "Medium"],
    ]
    cmap = {"Critical": RED, "High": ORG, "Medium": BLU, "Low": GRN}
    st = [
        ("FONTSIZE",  (0,0), (-1,-1), 8),
        ("FONTNAME",  (0,0), (-1,-1), "Helvetica"),
        ("ALIGN",     (0,0), (-1,-1), "CENTER"),
        ("VALIGN",    (0,0), (-1,-1), "MIDDLE"),
        ("GRID",      (0,0), (-1,-1), 0.5, WHT),
        ("TOPPADDING",(0,0), (-1,-1), 7),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("BACKGROUND",(0,0), (-1,0),  BG),
        ("TEXTCOLOR", (0,0), (-1,0),  WHT),
        ("FONTNAME",  (0,0), (-1,0),  "Helvetica-Bold"),
        ("BACKGROUND",(0,0), (0,-1),  BG),
        ("TEXTCOLOR", (0,0), (0,-1),  WHT),
        ("FONTNAME",  (0,0), (0,-1),  "Helvetica-Bold"),
    ]
    for r in range(1,4):
        for c in range(1,4):
            v = cells[r][c]
            st += [("BACKGROUND",(c,r),(c,r), cmap[v]),
                   ("TEXTCOLOR", (c,r),(c,r), WHT),
                   ("FONTNAME",  (c,r),(c,r), "Helvetica-Bold")]
    t = Table(cells, colWidths=[PW*0.22, PW*0.26, PW*0.26, PW*0.26])
    t.setStyle(TableStyle(st))
    return t

# ── Algo risk table ───────────────────────────────────────────────────────────
def make_algo_risk(risk_data):
    if not risk_data:
        return None
    hdr = ["Algorithm","Key Size","Risk Level","Score","Deprecation Timeline"]
    rows = [[Paragraph(h, p("ah", fontSize=8, fontName="Helvetica-Bold", textColor=WHT)) for h in hdr]]
    st   = [
        ("BACKGROUND",    (0,0), (-1,0), BG),
        ("GRID",          (0,0), (-1,-1), 0.4, BDR),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHT, LGR]),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("FONTSIZE",      (0,1), (-1,-1), 8),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]
    for i, r in enumerate(risk_data, 1):
        rk  = r.get("risk", {})
        lvl = str(rk.get("level",""))
        rows.append([r.get("algorithm",""), str(r.get("key_size","")),
                     lvl, str(rk.get("score","")), str(rk.get("timeline",""))])
        col = SEV.get(lvl, LGR)
        st += [("BACKGROUND",(2,i),(2,i), col),
               ("TEXTCOLOR", (2,i),(2,i), WHT),
               ("FONTNAME",  (2,i),(2,i), "Helvetica-Bold")]
    t = Table(rows, colWidths=[PW*0.20,PW*0.13,PW*0.16,PW*0.11,PW*0.40])
    t.setStyle(TableStyle(st))
    return t

# ── Compliance table ──────────────────────────────────────────────────────────
def make_compliance(score):
    rows_data = [
        ("NIST FIPS 203","ML-KEM (Kyber) Key Encapsulation Mechanism","Active Standard", score>=70),
        ("NIST FIPS 204","ML-DSA (Dilithium) Digital Signature Scheme","Active Standard", score>=70),
        ("NIST FIPS 205","SLH-DSA (SPHINCS+) Hash-Based Signature","Active Standard",   score>=80),
        ("SP 800-131A",  "Deprecate RSA < 3072-bit and legacy ECC by 2030","Required",  score>=60),
        ("CNSA 2.0",     "NSA Post-Quantum Algorithm Suite for NSS","Recommended",       score>=80),
    ]
    hdr  = ["Standard","Requirement","Status","Gap"]
    rows = [[Paragraph(h, p("ch", fontSize=8, fontName="Helvetica-Bold", textColor=WHT)) for h in hdr]]
    st   = [
        ("BACKGROUND",    (0,0), (-1,0), BG),
        ("GRID",          (0,0), (-1,-1), 0.4, BDR),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHT, LGR]),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING",   (0,0), (-1,-1), 7),
        ("FONTSIZE",      (0,1), (-1,-1), 8),
    ]
    for i, (std, req, stat, ok) in enumerate(rows_data, 1):
        badge = "PASS" if ok else "GAP"
        rows.append([
            Paragraph(std,  p(f"cs{i}", fontSize=8, fontName="Helvetica-Bold", textColor=ACC)),
            Paragraph(req,  p(f"cr{i}", fontSize=8)),
            Paragraph(stat, p(f"cst{i}",fontSize=8)),
            Paragraph(badge,p(f"cb{i}", fontSize=8, fontName="Helvetica-Bold",
                               textColor=WHT, alignment=TA_CENTER)),
        ])
        st += [("BACKGROUND",(3,i),(3,i), GRN if ok else RED),
               ("TEXTCOLOR", (3,i),(3,i), WHT)]
    t = Table(rows, colWidths=[PW*0.15, PW*0.45, PW*0.18, PW*0.12])
    t.setStyle(TableStyle(st))
    return t

# ── Roadmap ───────────────────────────────────────────────────────────────────
def make_roadmap(rm):
    if not rm:
        return []
    els = []
    phase_colors = [RED, ORG, GRN]
    for i, ph in enumerate(rm.get("phases",[]), 1):
        col = phase_colors[min(i-1,2)]
        name_esc = html.escape(str(ph.get("name","")))
        duration_esc = html.escape(str(ph.get("duration","")))
        hdr = [[
            Paragraph(f"  Phase {i}", p(f"ph{i}", fontSize=9, fontName="Helvetica-Bold", textColor=WHT)),
            Paragraph(name_esc,     p(f"pn{i}", fontSize=9, fontName="Helvetica-Bold", textColor=WHT)),
            Paragraph(duration_esc, p(f"pd{i}", fontSize=8, textColor=WHT, alignment=TA_CENTER)),
        ]]
        ht = Table(hdr, colWidths=[PW*0.16, PW*0.60, PW*0.24])
        ht.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,-1), col),
            ("TOPPADDING",    (0,0),(-1,-1), 6),
            ("BOTTOMPADDING", (0,0),(-1,-1), 6),
            ("LEFTPADDING",   (0,0),(-1,-1), 8),
        ]))
        task_rows = [[Paragraph(f"• {html.escape(str(t))}", p(f"pt{i}", fontSize=8, textColor=GRY, leading=13))]
                     for t in ph.get("tasks",[])]
        tt = Table(task_rows, colWidths=[PW])
        tt.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,-1), LGR),
            ("LEFTPADDING",   (0,0),(-1,-1), 20),
            ("TOPPADDING",    (0,0),(-1,-1), 4),
            ("BOTTOMPADDING", (0,0),(-1,-1), 4),
            ("GRID",          (0,0),(-1,-1), 0.3, BDR),
        ]))
        els.append(KeepTogether([ht, tt, Spacer(1, 0.2*cm)]))
    return els

# ── Benchmark table ───────────────────────────────────────────────────────────
def make_benchmarks(data):
    if not data:
        return None
    hdr  = ["Algorithm","Category","Keygen (ms)","Encrypt (ms)","Memory (KB)"]
    rows = [[Paragraph(h, p("bh", fontSize=8, fontName="Helvetica-Bold", textColor=WHT)) for h in hdr]]
    for b in data:
        rows.append([b.get("algorithm",""), b.get("category",""),
                     str(b.get("keygen_ms","-")), str(b.get("encrypt_ms","-")),
                     str(b.get("peak_memory_kb","-"))])
    t = Table(rows, colWidths=[PW*0.25,PW*0.20,PW*0.18,PW*0.18,PW*0.19])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,0),  BG),
        ("GRID",          (0,0),(-1,-1), 0.4, BDR),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHT, LGR]),
        ("ALIGN",         (0,0),(-1,-1), "CENTER"),
        ("FONTSIZE",      (0,0),(-1,-1), 8),
        ("TOPPADDING",    (0,0),(-1,-1), 5),
        ("BOTTOMPADDING", (0,0),(-1,-1), 5),
    ]))
    return t

# ── Main entry point ──────────────────────────────────────────────────────────
def generate_pdf_report(report_data: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            topMargin=1.4*cm, bottomMargin=1.4*cm,
                            leftMargin=1.8*cm, rightMargin=1.8*cm,
                            title="QuantumShield Audit Report")

    meta     = report_data.get("metadata", {})
    ai       = report_data.get("ai_enrichment", {})
    org      = meta.get("system_name", "Unknown Organisation")
    gen      = meta.get("generated_at", datetime.utcnow().isoformat())[:19].replace("T"," ")
    score    = ai.get("readiness_score", 100)
    findings = ai.get("findings", [])
    rm       = ai.get("roadmap", {})
    n_crit   = sum(1 for f in findings if f.get("risk") == "Critical")
    n_high   = sum(1 for f in findings if f.get("risk") == "High")

    els = []

    # ── Page 1: Cover + Score ────────────────────────────────────────────────
    els.append(make_cover(org, gen))
    els.append(Spacer(1, 0.3*cm))
    els.append(make_gauge(score))
    els.append(Spacer(1, 0.25*cm))
    els.append(make_stats(score, len(findings), n_crit, n_high))
    els.append(PageBreak())   # only forced break — after cover

    # ── Executive Summary ────────────────────────────────────────────────────
    els.append(section_title("1.  Executive Summary"))
    els.append(hr())
    els.append(Paragraph(
        f"This report presents findings from a Post-Quantum Cryptographic (PQC) security "
        f"assessment of <b>{org}</b> conducted by the QuantumShield AI Engine on <b>{gen}</b>. "
        f"A total of <b>{len(findings)} quantum-vulnerable cryptographic instance(s)</b> were "
        f"identified — <b>{n_crit} Critical</b> and <b>{n_high} High</b> severity. "
        f"The overall Quantum Readiness Score is <b>{score}/100</b>. "
        f"Immediate migration to NIST-standardised post-quantum algorithms is strongly recommended.",
        p("es", fontSize=9, leading=15)))
    els.append(Spacer(1, 0.3*cm))

    # ── Severity Chart ───────────────────────────────────────────────────────
    chart = make_chart(findings)
    if chart:
        els.append(chart)
        els.append(Spacer(1, 0.3*cm))

    pie = make_pie_chart(findings)
    if pie:
        els.append(section_title("3.  Algorithm Vulnerability Distribution"))
        els.append(hr())
        els.append(pie)
        els.append(Spacer(1, 0.3*cm))

    # ── Findings ─────────────────────────────────────────────────────────────
    els.append(section_title("3.  Vulnerability Findings"))
    els.append(hr())
    if findings:
        for i, f in enumerate(findings, 1):
            els.append(make_finding(i, f))
    else:
        els.append(Paragraph("No quantum-vulnerable patterns detected.", p("ok", textColor=GRN)))
    els.append(Spacer(1, 0.3*cm))

    # ── Algorithm Risk ────────────────────────────────────────────────────────
    els.append(section_title("4.  Algorithm Risk Assessment"))
    els.append(hr())
    algo_t = make_algo_risk(report_data.get("risk_assessment", []))
    if algo_t:
        els.append(algo_t)
        els.append(Spacer(1, 0.3*cm))
    else:
        els.append(Paragraph("No algorithm data provided.", p("na")))

    # ── Risk Matrix ───────────────────────────────────────────────────────────
    els.append(section_title("5.  Risk Matrix"))
    els.append(hr())
    els.append(make_risk_matrix())
    els.append(Spacer(1, 0.3*cm))

    # ── Migration Roadmap ─────────────────────────────────────────────────────
    if rm:
        els.append(section_title("6.  AI Migration Roadmap"))
        els.append(hr())
        els.append(Paragraph(rm.get("summary",""), p("rms", fontSize=9, textColor=MID, leading=14)))
        els.append(Spacer(1, 0.2*cm))
        els.extend(make_roadmap(rm))

    # ── Benchmarks ────────────────────────────────────────────────────────────
    bench_t = make_benchmarks(report_data.get("performance_benchmarks",[]))
    if bench_t:
        els.append(section_title("7.  Performance Benchmarks"))
        els.append(hr())
        els.append(bench_t)
        els.append(Spacer(1, 0.3*cm))

    # ── Compliance Gap ────────────────────────────────────────────────────────
    els.append(section_title("8.  NIST / CNSA 2.0 Compliance Gap Analysis"))
    els.append(hr())
    els.append(make_compliance(score))
    els.append(Spacer(1, 0.5*cm))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    els.append(HRFlowable(width="100%", thickness=0.5, color=MID, spaceBefore=6, spaceAfter=6))
    els.append(Paragraph(
        "Prepared by QuantumShield AI Intelligence Engine. CONFIDENTIAL - Authorised Personnel Only. "
        "Redistribution without written consent is strictly prohibited. "
        f"Generated: {gen}",
        p("disc", fontSize=7, textColor=MID, alignment=TA_CENTER)))

    doc.build(els)
    val = buf.getvalue()
    buf.close()
    return val
