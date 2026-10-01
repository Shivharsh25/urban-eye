"""
Urban EYE - Comprehensive Architecture & Technical Specification Report Generator
Builds an executive-grade, publication-ready PDF documenting the entire Urban EYE platform.
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas for precise total page numbering ('Page X of Y')
    and professional running headers and footers.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_page_decorations(page_count)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress running header/footer on title cover
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 11 * inch - 36, "URBAN EYE  |  Comprehensive Project & Technical Specification Report")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer
        self.line(54, 45, 8.5 * inch - 54, 45)
        self.drawString(54, 32, "SMART CITY MUNICIPAL SURVEILLANCE & INFRASTRUCTURE AUTOMATION")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 32, page_str)
        self.restoreState()


def build_pdf(filename="Urban_EYE_Comprehensive_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Color Tokens
    c_primary = colors.HexColor("#0F172A")    # Midnight Navy
    c_secondary = colors.HexColor("#0284C7")  # Cyber Sky Blue
    c_dark = colors.HexColor("#1E293B")       # Slate Dark
    c_text = colors.HexColor("#334155")       # Charcoal Slate Text
    c_light_bg = colors.HexColor("#F8FAFC")   # Off-white / light slate
    c_card_bg = colors.HexColor("#F1F5F9")    # Subdued gray card
    c_border = colors.HexColor("#E2E8F0")     # Subtle border
    c_accent_green = colors.HexColor("#059669")
    c_accent_amber = colors.HexColor("#D97706")
    c_accent_red = colors.HexColor("#DC2626")

    # Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=c_primary,
        spaceAfter=10
    )

    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=c_secondary,
        spaceAfter=18
    )

    style_cover_meta = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=14,
        textColor=colors.HexColor("#475569")
    )

    style_h1 = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14.5,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=13,
        textColor=c_text,
        spaceAfter=4.5
    )

    style_bullet = ParagraphStyle(
        'BulletCustom',
        parent=style_body,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    )

    style_code = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0F172A")
    )

    style_callout = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#1E293B")
    )

    style_th = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=colors.white
    )

    style_td = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=c_text
    )

    style_td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=c_primary
    )

    story = []

    # =========================================================================
    # PAGE 1: COVER & EXECUTIVE SUMMARY
    # =========================================================================
    story.append(Spacer(1, 15))
    
    tag_table = Table([[
        Paragraph("<b>CIVIC TECH  |  COMPUTER VISION  |  GEOSPATIAL INTELLIGENCE  |  SMART MUNICIPAL DISPATCH</b>", 
                  ParagraphStyle('Tag', fontName='Helvetica-Bold', fontSize=7.5, textColor=c_secondary))
    ]], colWidths=[504])
    tag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#E0F2FE")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(tag_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("URBAN EYE", style_cover_title))
    story.append(Paragraph(
        "Autonomous Smart-City Infrastructure Surveillance, Computer Vision Defect Recognition, "
        "Geospatial Deduplication & Instant Municipal Work Order Dispatch",
        style_cover_subtitle
    ))

    story.append(HRFlowable(width="100%", thickness=2.5, color=c_secondary, spaceAfter=15))

    cover_summary = (
        "<b>Executive Summary:</b> Urban EYE is an end-to-end, production-grade smart-city surveillance platform "
        "engineered to replace slow, manual citizen complaint triage with automated defect recognition, geospatial clustering, "
        "and instantaneous municipal work order dispatch. When citizens capture photos or video feeds of municipal hazards "
        "(potholes, garbage dumping, water pipe bursts, broken streetlights), Urban EYE's multi-stage pipeline executes "
        "client-side compression, binary EXIF GPS geotagging, YOLOv8 deep-learning computer vision inference, rule-based "
        "severity classification, 50-meter/30-day duplicate clustering, municipal department routing, and automated email dispatch "
        "within 2 to 3 seconds. The platform bridges the gap between active citizen participation and agile civic administration."
    )
    summary_table = Table([[Paragraph(cover_summary, style_callout)]], colWidths=[504])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BAE6FD")),
        ('LINEBEFORE', (0,0), (-1,-1), 4, c_secondary),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 18))

    meta_data = [
        [Paragraph("<b>Document Scope:</b>", style_cover_meta), Paragraph("Full Architecture, End-to-End Technology Stack, Pipelines, Schemas & API Contracts", style_cover_meta)],
        [Paragraph("<b>System Edition:</b>", style_cover_meta), Paragraph("Urban EYE v1.0.0 Production Release", style_cover_meta)],
        [Paragraph("<b>Architectural Tiers:</b>", style_cover_meta), Paragraph("Python FastAPI AI Microservice | Node.js Express API & Socket.io | React 18 UI | MongoDB", style_cover_meta)],
        [Paragraph("<b>Key Breakthroughs:</b>", style_cover_meta), Paragraph("Sub-3s Edge-to-Dispatch Triage, 50m/30d Geospatial Deduplication, Closed-Loop Citizen Notification", style_cover_meta)],
        [Paragraph("<b>Verification Mode:</b>", style_cover_meta), Paragraph("Verifiable Nodemailer Ethereal Preview Links + Live Socket.io Progress Stepper", style_cover_meta)],
        [Paragraph("<b>Report Date:</b>", style_cover_meta), Paragraph("September 2026", style_cover_meta)],
    ]
    meta_table = Table(meta_data, colWidths=[120, 384])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 16))

    # Table of Contents
    toc_data = [
        [Paragraph("<b>TABLE OF CONTENTS</b>", style_th), Paragraph("", style_th)],
        [Paragraph("1. The Core Idea, Problem Statement & Civic Impact", style_td_bold), Paragraph("5. Downstream Severity & Urgency Classifier", style_td_bold)],
        [Paragraph("2. System Architecture & Component Design", style_td_bold), Paragraph("6. Geospatial Clustering & 2dsphere Database", style_td_bold)],
        [Paragraph("3. Complete Technology Stack (Without Omission)", style_td_bold), Paragraph("7. REST API & WebSocket Event Specifications", style_td_bold)],
        [Paragraph("4. The 6-Stage Autonomous Incident Pipeline", style_td_bold), Paragraph("8. User Portals, Security & Deployment Blueprint", style_td_bold)],
    ]
    toc_table = Table(toc_data, colWidths=[252, 252])
    toc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(toc_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: THE CORE IDEA & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("1. The Core Idea, Problem Statement & Civic Impact", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph("<b>1.1 The Municipal Infrastructure Dilemma</b>", style_h2))
    story.append(Paragraph(
        "Civil infrastructure is the lifeline of modern urban civilization. However, public assets undergo constant decay "
        "due to weather, heavy traffic, and civic neglect. In traditional municipal workflows, city departments operate reactively, "
        "relying on citizen complaint hotlines or web portals. This legacy approach suffers from critical structural flaws:",
        style_body
    ))
    story.append(Paragraph("&bull; <b>High Redressal Latency:</b> Grievances sit unread in general municipal inboxes for days before human clerks categorize and route them.", style_bullet))
    story.append(Paragraph("&bull; <b>Duplicate Report Proliferation:</b> A single pothole on a major arterial road often generates 20 to 50 separate citizen complaints. Each creates a disjointed ticket, inflating backlog metrics and misallocating inspection crews.", style_bullet))
    story.append(Paragraph("&bull; <b>Subjective and Unverified Severity:</b> Without objective computer vision quantification, complaints cannot be accurately prioritized.", style_bullet))
    story.append(Paragraph("&bull; <b>Bureaucratic Black Hole:</b> Citizens rarely know if their report was dispatched or repaired, leading to civic frustration and voter apathy.", style_bullet))

    story.append(Paragraph("<b>1.2 The Urban EYE Vision: Autonomous Civic Governance</b>", style_h2))
    story.append(Paragraph(
        "Urban EYE transforms this manual, error-prone cycle into a self-driving civic dispatch pipeline. "
        "Any visual submission (mobile photo, live camera stream, or uploaded media) is instantaneously analyzed by an AI computer vision "
        "microservice, matched against existing geo-clusters within 50 meters, assigned a mathematical severity score, packaged into "
        "a formal legal complaint letter, and delivered directly to the designated department's mailbox with verifiable proof.",
        style_body
    ))

    # Four Categories Table
    story.append(Paragraph("<b>1.3 Targeted Civil Hazard Categories</b>", style_h2))
    categories_data = [
        [Paragraph("Category", style_th), Paragraph("Hazard & Risk Profile", style_th), Paragraph("Assigned Municipal Authority", style_th), Paragraph("Mandated Action Plan", style_th)],
        [Paragraph("<b>Potholes</b>", style_td_bold), Paragraph("Carriageway craters, asphalt fissures, and road surface collapses causing two-wheeler fatalities, vehicle suspension damage, and acute traffic bottlenecks.", style_td), Paragraph("Roads & Public Works Dept (PWD)", style_td), Paragraph("Dispatch road crew with hot/cold-mix asphalt patch unit to level surface.", style_td)],
        [Paragraph("<b>Garbage Dumping</b>", style_td_bold), Paragraph("Illegal solid waste dumps, uncollected community refuse heaps generating noxious leachate, pest infestation, and public bio-sanitary hazards.", style_td), Paragraph("Public Health & Sanitation Dept", style_td), Paragraph("Deploy compactor trucks, sanitation sweepers, and disinfectant powder.", style_td)],
        [Paragraph("<b>Water Leakages</b>", style_td_bold), Paragraph("Ruptured distribution mains and hydrant failures wasting potable municipal water, eroding sub-road foundations, and causing localized inundation.", style_td), Paragraph("Water Supply & Sewerage Dept", style_td), Paragraph("Isolate pipe sector valve, excavate subterranean conduit, replace pipe segment.", style_td)],
        [Paragraph("<b>Faulty Streetlights</b>", style_td_bold), Paragraph("Defective luminaires and severed underground cables plunging public roads into darkness, facilitating pedestrian danger and night collisions.", style_td), Paragraph("Electrical & Public Lighting Dept", style_td), Paragraph("Depute bucket-truck unit to replace LED luminaire/choke and repair wiring.", style_td)],
    ]
    cat_table = Table(categories_data, colWidths=[80, 160, 114, 150])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(cat_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 2: ARCHITECTURE & SYSTEM DESIGN
    # =========================================================================
    story.append(Paragraph("2. System Architecture & High-Level Design", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph(
        "Urban EYE implements a decoupled microservices pattern across four discrete layers: "
        "Presentation (React 18), API Gateway & Real-Time Hub (Node.js/Express), Computer Vision Microservice (Python FastAPI/YOLOv8), "
        "and Persistence & Spatial Indexing (MongoDB/Mongoose).",
        style_body
    ))

    arch_box = (
        "+-----------------------------------------------------------------------------------------+\n"
        "|                              PRESENTATION TIER (CLIENT)                                 |\n"
        "|   React 18 + Vite | Leaflet / Google Maps GIS | Recharts Analytics | Socket.io Client   |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "            | Photo Upload (Compressed JPEG + Multipart Form Data)  ^ Real-Time Progress\n"
        "            v                                                       | (Socket.io Rooms)\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "|                       API GATEWAY & BUSINESS ENGINE (NODE.JS)                           |\n"
        "|   Express 4.19 | Multer MemoryStorage | JWT RBAC | Rate Limiting | Socket.io Hub        |\n"
        "+-----------------------------------------------------------------------------------------+\n"
        "      |                          |                         |                        |     \n"
        "      | POST /detect Form-Data   | 2dsphere Spatial Query  | Media Storage          | SMTP\n"
        "      v                          v                         v                        v     \n"
        "+-------------------+     +--------------------+    +------------------+    +-------------+\n"
        "|  AI FASTAPI CORE  |     |   MONGODB ATLAS    |    | CLOUDINARY/LOCAL |    | NODEMAILER  |\n"
        "|  Python 3.10+     |     |   2dsphere Index   |    | Storage Adapter  |    | Ethereal/   |\n"
        "|  Ultralytics      |     |   Dual In-Memory   |    | Evidence Photos  |    | Resend/     |\n"
        "|  YOLOv8 PyTorch   |     |   Fallback         |    | CDN / Disk       |    | Gmail SMTP  |\n"
        "+-------------------+     +--------------------+    +------------------+    +-------------+\n"
        "      |                          |                                                  |     \n"
        "      +---- [BBox, Conf, Type] --+-- [50m Deduplication & Escalation]               v     \n"
        "                                                                         [MUNICIPAL DEPT] "
    )
    story.append(Table([[Paragraph(f"<pre>{arch_box}</pre>", style_code)]], colWidths=[504],
                       style=[
                           ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
                           ('BOX', (0,0), (-1,-1), 1, c_border),
                           ('PADDING', (0,0), (-1,-1), 6)
                       ]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>2.1 Microservice Responsibilities & Inter-Service Communication</b>", style_h2))
    ms_data = [
        [Paragraph("Subsystem", style_th), Paragraph("Runtime Stack", style_th), Paragraph("Boundary, Responsibilities & Protocols", style_th)],
        [
            Paragraph("<b>AI Inference Microservice</b>", style_td_bold),
            Paragraph("Python 3.10+<br/>FastAPI / Uvicorn<br/>Ultralytics YOLOv8", style_td),
            Paragraph("Dedicated computational node. Accepts raw binary image buffers via <code>POST /detect</code>; executes YOLOv8 model prediction; outputs strict Pydantic bounding boxes <code>{ x, y, width, height }</code>, class labels, and confidence scores. Exposes <code>GET /health</code>.", style_td)
        ],
        [
            Paragraph("<b>API Gateway & Triage Core</b>", style_td_bold),
            Paragraph("Node.js 18+ / 24+<br/>Express.js 4.19<br/>Socket.io 4.7", style_td),
            Paragraph("Central controller. Handles user auth, JWT validation, client-side EXIF GPS injection, image persistence, inter-service proxying to AI, spatial duplicate clustering, formal complaint generation, email dispatch, and WebSockets broadcasting.", style_td)
        ],
        [
            Paragraph("<b>Spatial Persistence Layer</b>", style_td_bold),
            Paragraph("MongoDB 7.0<br/>Mongoose 9.x<br/>MongoMemoryServer", style_td),
            Paragraph("Maintains <code>Detection</code>, <code>User</code>, and <code>Announcement</code> collections. Utilizes GeoJSON <code>Point</code> with 2dsphere indexing for sub-millisecond proximity queries. Employs automatic in-memory failover if cloud network/IP whitelisting fails.", style_td)
        ],
        [
            Paragraph("<b>Command Center & Client UI</b>", style_td_bold),
            Paragraph("React 18.2<br/>Vite 5.1<br/>Tailwind CSS 3.4<br/>Leaflet GIS", style_td),
            Paragraph("Delivers rich citizen reporting forms with live camera, client compression, 6-stage animated stepper, GIS map with pulsating pins, and administrative triage dashboard.", style_td)
        ]
    ]
    ms_table = Table(ms_data, colWidths=[105, 95, 304])
    ms_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(ms_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: EXHAUSTIVE TECH STACK BREAKDOWN
    # =========================================================================
    story.append(Paragraph("3. Complete Technology Stack (Without Omission)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph(
        "Every single library, engine, protocol, and driver deployed across the Urban EYE platform is specified below:",
        style_body
    ))

    # Python AI Tier
    story.append(Paragraph("<b>3.1 Computer Vision & AI Microservice (Python Tier)</b>", style_h2))
    ai_tech_data = [
        [Paragraph("Technology / Library", style_th), Paragraph("Version", style_th), Paragraph("Specific Purpose & Architectural Role", style_th)],
        [Paragraph("<b>Python</b>", style_td_bold), Paragraph(">= 3.10", style_td), Paragraph("High-performance core runtime environment for numerical computation and tensor processing.", style_td)],
        [Paragraph("<b>FastAPI</b>", style_td_bold), Paragraph(">= 0.110.0", style_td), Paragraph("Asynchronous web framework exposing high-throughput REST inference endpoints with automatic schema validation.", style_td)],
        [Paragraph("<b>Uvicorn [standard]</b>", style_td_bold), Paragraph(">= 0.28.0", style_td), Paragraph("High-performance ASGI server with uvloop and httptools handling concurrent network requests.", style_td)],
        [Paragraph("<b>Ultralytics</b>", style_td_bold), Paragraph(">= 8.1.0", style_td), Paragraph("YOLOv8 framework executing computer vision inference, non-maximum suppression (NMS), and box extraction.", style_td)],
        [Paragraph("<b>PyTorch (torch, torchvision)</b>", style_td_bold), Paragraph(">= 2.0.0", style_td), Paragraph("Deep learning tensor computation engine powering neural network weight loading and CUDA GPU acceleration.", style_td)],
        [Paragraph("<b>Pillow (PIL)</b>", style_td_bold), Paragraph(">= 10.2.0", style_td), Paragraph("Image decoding, format normalization (RGB conversion), and in-memory byte buffer manipulation.", style_td)],
        [Paragraph("<b>Pydantic</b>", style_td_bold), Paragraph(">= 2.6.0", style_td), Paragraph("Data contract enforcement, verifying strict request parameters and BoundingBox/Detection response models.", style_td)],
        [Paragraph("<b>Python-Multipart</b>", style_td_bold), Paragraph(">= 0.0.9", style_td), Paragraph("Streaming multipart/form-data parser for processing raw uploaded image files from Node.js.", style_td)],
        [Paragraph("<b>Python-Dotenv</b>", style_td_bold), Paragraph(">= 1.0.0", style_td), Paragraph("Parses .env configuration controlling the YOLOv8 model path and stub detector toggle.", style_td)],
    ]
    t_ai = Table(ai_tech_data, colWidths=[120, 70, 314])
    t_ai.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_ai)
    story.append(Spacer(1, 8))

    # Node.js Backend Tier
    story.append(Paragraph("<b>3.2 Backend API, Real-Time & Triage Engine (Node.js Tier)</b>", style_h2))
    node_tech_data = [
        [Paragraph("Technology / Library", style_th), Paragraph("Version", style_th), Paragraph("Specific Purpose & Architectural Role", style_th)],
        [Paragraph("<b>Node.js</b>", style_td_bold), Paragraph("v18+ / v24+", style_td), Paragraph("Event-driven JavaScript runtime executing the API Gateway and asynchronous business logic.", style_td)],
        [Paragraph("<b>Express.js</b>", style_td_bold), Paragraph("^4.19.2", style_td), Paragraph("HTTP web framework handling routing, middleware chaining, and RESTful service endpoints.", style_td)],
        [Paragraph("<b>Socket.io</b>", style_td_bold), Paragraph("^4.7.5", style_td), Paragraph("WebSocket engine providing two-way real-time event streaming for the 6-stage pipeline and dashboard synchronization.", style_td)],
        [Paragraph("<b>Mongoose</b>", style_td_bold), Paragraph("^9.9.4", style_td), Paragraph("Object Document Mapper providing schema enforcement, lifecycle hooks, and 2dsphere index management.", style_td)],
        [Paragraph("<b>mongodb-memory-server</b>", style_td_bold), Paragraph("^11.2.0", style_td), Paragraph("Zero-config local in-memory MongoDB instance providing 100% automated fallback if cloud Atlas is blocked.", style_td)],
        [Paragraph("<b>Nodemailer</b>", style_td_bold), Paragraph("^6.9.13", style_td), Paragraph("Transactional email client managing automated dispatch, custom SMTP, Gmail, and Ethereal test accounts.", style_td)],
        [Paragraph("<b>Resend REST API</b>", style_td_bold), Paragraph("REST v1", style_td), Paragraph("Direct HTTP email dispatch fallback that bypasses cloud host (e.g. Render) port 25/587 outbound SMTP blocks.", style_td)],
        [Paragraph("<b>Multer</b>", style_td_bold), Paragraph("^1.4.5-lts.1", style_td), Paragraph("MemoryStorage file upload middleware buffering image streams up to 20MB before processing.", style_td)],
        [Paragraph("<b>Cloudinary SDK</b>", style_td_bold), Paragraph("^2.11.0", style_td), Paragraph("Cloud media storage provider managing evidence photos with secure CDN delivery and local disk fallback.", style_td)],
        [Paragraph("<b>Exif-Parser</b>", style_td_bold), Paragraph("^0.1.12", style_td), Paragraph("Binary metadata decoder extracting GPS latitude/longitude directly from incoming JPEG buffers.", style_td)],
        [Paragraph("<b>Piexifjs</b>", style_td_bold), Paragraph("^1.0.6", style_td), Paragraph("Binary EXIF injector converting manual GPS coordinates into standard EXIF Rational format inside JPEG buffers.", style_td)],
        [Paragraph("<b>Axios</b>", style_td_bold), Paragraph("^1.6.8", style_td), Paragraph("Promise-based HTTP client dispatching form-data payloads to the Python AI service and geocoding queries.", style_td)],
        [Paragraph("<b>Form-Data</b>", style_td_bold), Paragraph("^4.0.0", style_td), Paragraph("Constructs multi-part HTTP request streams for passing image buffers across process boundaries.", style_td)],
        [Paragraph("<b>JSONWebToken (JWT)</b>", style_td_bold), Paragraph("^9.0.2", style_td), Paragraph("Stateless cryptographic bearer token generation and verification for Role-Based Access Control.", style_td)],
        [Paragraph("<b>Bcryptjs</b>", style_td_bold), Paragraph("^2.4.3", style_td), Paragraph("One-way cryptographic password hashing using 10 salt rounds for secure credential storage.", style_td)],
        [Paragraph("<b>Express-Rate-Limit</b>", style_td_bold), Paragraph("^7.2.0", style_td), Paragraph("Sliding-window IP rate limiting mitigating burst upload spam and brute-force authentication attacks.", style_td)],
        [Paragraph("<b>UUID</b>", style_td_bold), Paragraph("^14.0.2", style_td), Paragraph("RFC4122 compliant UUIDv4 generator for incident references, job tracking IDs, and file naming.", style_td)],
        [Paragraph("<b>Dotenv</b>", style_td_bold), Paragraph("^16.6.1", style_td), Paragraph("Loads environment variables from .env files into process.env across development and production.", style_td)],
        [Paragraph("<b>CORS</b>", style_td_bold), Paragraph("^2.8.5", style_td), Paragraph("Configures Cross-Origin headers allowing web clients to communicate securely with the API.", style_td)],
    ]
    t_node = Table(node_tech_data, colWidths=[120, 70, 314])
    t_node.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_node)

    story.append(PageBreak())

    # Frontend Tier
    story.append(Paragraph("<b>3.3 Presentation & Command Center (React Tier)</b>", style_h2))
    front_tech_data = [
        [Paragraph("Technology / Library", style_th), Paragraph("Version", style_th), Paragraph("Specific Purpose & Architectural Role", style_th)],
        [Paragraph("<b>React</b>", style_td_bold), Paragraph("^18.2.0", style_td), Paragraph("Component architecture managing declarative UI rendering, concurrent features, and state.", style_td)],
        [Paragraph("<b>Vite</b>", style_td_bold), Paragraph("^5.1.6", style_td), Paragraph("Modern build tool providing native ES module bundling and fast Hot Module Replacement.", style_td)],
        [Paragraph("<b>React Router DOM</b>", style_td_bold), Paragraph("^6.22.3", style_td), Paragraph("Client-side routing engine managing authenticated route guards and role-based redirects.", style_td)],
        [Paragraph("<b>Socket.io-client</b>", style_td_bold), Paragraph("^4.7.5", style_td), Paragraph("Client WebSocket subscriber listening to 6-stage pipeline progress and global incident broadcasts.", style_td)],
        [Paragraph("<b>Leaflet & OpenStreetMap</b>", style_td_bold), Paragraph("1.9.4", style_td), Paragraph("Interactive GIS map view with OpenStreetMap tile layers, pulsating severity markers, and cluster boundaries.", style_td)],
        [Paragraph("<b>@vis.gl/react-google-maps</b>", style_td_bold), Paragraph("^1.9.0", style_td), Paragraph("Official Google Maps React wrapper for satellite hybrid imagery and high-accuracy street geocoding.", style_td)],
        [Paragraph("<b>Recharts</b>", style_td_bold), Paragraph("^3.10.1", style_td), Paragraph("Composable SVG charting library rendering incident trend graphs, department distributions, and resolution velocity.", style_td)],
        [Paragraph("<b>Browser-Image-Compression</b>", style_td_bold), Paragraph("^2.0.2", style_td), Paragraph("Client-side image optimizer downsampling high-res smartphone photos (1600px max, 80% quality) prior to transit.", style_td)],
        [Paragraph("<b>Exifr</b>", style_td_bold), Paragraph("^7.1.3", style_td), Paragraph("Client-side EXIF extractor reading GPS tags directly from file inputs before network transmission.", style_td)],
        [Paragraph("<b>Lucide React</b>", style_td_bold), Paragraph("^0.359.0", style_td), Paragraph("Comprehensive icon system providing visual cues for issue categories, severity ranks, and navigation.", style_td)],
        [Paragraph("<b>jsPDF</b>", style_td_bold), Paragraph("^4.2.1", style_td), Paragraph("Client-side vector PDF generator allowing citizens and admins to export official grievance letters.", style_td)],
        [Paragraph("<b>Tailwind CSS</b>", style_td_bold), Paragraph("^3.4.1", style_td), Paragraph("Utility-first CSS framework enabling responsive layout, custom themes, dark-mode styling, and micro-interactions.", style_td)],
        [Paragraph("<b>PostCSS & Autoprefixer</b>", style_td_bold), Paragraph("^8.4.35", style_td), Paragraph("CSS compilation engine handling automated vendor prefixing and modern CSS parsing.", style_td)],
        [Paragraph("<b>Tailwind-Merge & Clsx</b>", style_td_bold), Paragraph("^2.2.2", style_td), Paragraph("Dynamic utility class conditional concatenation without CSS rule conflicts.", style_td)],
    ]
    t_front = Table(front_tech_data, colWidths=[120, 70, 314])
    t_front.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_front)
    story.append(Spacer(1, 8))

    # Infrastructure & DevOps Tier
    story.append(Paragraph("<b>3.4 Infrastructure, Orchestration & DevOps Tier</b>", style_h2))
    devops_tech_data = [
        [Paragraph("Technology / Tool", style_th), Paragraph("Specification", style_th), Paragraph("Operational Deployment & Infrastructure Role", style_th)],
        [Paragraph("<b>Docker</b>", style_td_bold), Paragraph("Engine v24+", style_td), Paragraph("Container engine encapsulating Node.js, Python, MongoDB, and frontend runtimes into isolated images.", style_td)],
        [Paragraph("<b>Docker Compose</b>", style_td_bold), Paragraph("v3.8 Compose Spec", style_td), Paragraph("Multi-container orchestration orchestrating 4 services (<code>mongodb</code>, <code>ai_service</code>, <code>backend</code>, <code>frontend</code>).", style_td)],
        [Paragraph("<b>Docker Named Volumes</b>", style_td_bold), Paragraph("<code>mongodb_data</code>", style_td), Paragraph("Persistent host storage ensuring 100% database survival across container rebuilds.", style_td)],
        [Paragraph("<b>Bridge Networking</b>", style_td_bold), Paragraph("<code>urban_eye_network</code>", style_td), Paragraph("Isolated virtual bridge network enabling internal service discovery and secure container routing.", style_td)],
        [Paragraph("<b>OpenStreetMap Nominatim</b>", style_td_bold), Paragraph("REST API", style_td), Paragraph("Reverse geocoding engine translating decimal lat/lng coordinates to standard municipal street addresses.", style_td)],
        [Paragraph("<b>Ethereal Email</b>", style_td_bold), Paragraph("Virtual SMTP", style_td), Paragraph("Provides zero-configuration verifiable email inbox URLs for testing automated work orders.", style_td)],
    ]
    t_devops = Table(devops_tech_data, colWidths=[120, 95, 289])
    t_devops.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_devops)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: THE 6-STAGE AUTONOMOUS PIPELINE
    # =========================================================================
    story.append(Paragraph("4. The 6-Stage Autonomous Incident Pipeline", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph(
        "When an image is submitted via <code>POST /api/detect</code>, Urban EYE executes a synchronized 6-stage pipeline. "
        "Each stage boundary emits a <code>pipeline:progress</code> WebSocket event to the submitting client's UI room, "
        "enabling real-time animated stepper visualization.",
        style_body
    ))

    p_stages = [
        [
            Paragraph("<b>Stage 1: Received & Ingested</b>", style_td_bold),
            Paragraph("<b>Payload Validation & Geotag Injection:</b> The uploaded image is received into memory via Multer. The system extracts GPS coordinates from image EXIF metadata (via <code>exif-parser</code>). If missing, it uses frontend pin coordinates. The system then uses <code>piexifjs</code> to inject binary GPS EXIF tags directly into the JPEG buffer before persisting the file to Cloudinary or local disk.", style_td)
        ],
        [
            Paragraph("<b>Stage 2: AI Computer Vision</b>", style_td_bold),
            Paragraph("<b>YOLOv8 Deep Learning Inference:</b> The image buffer is dispatched to the Python FastAPI microservice. The model predicts the defect type (pothole, garbage, water_leak, streetlight), calculates detection confidence (0.0 to 1.0), and extracts precise bounding box dimensions (x, y, width, height). An integration seam allows instant zero-code swapping between trained weights and a deterministic stub.", style_td)
        ],
        [
            Paragraph("<b>Stage 3: Geocoding & Address</b>", style_td_bold),
            Paragraph("<b>Reverse Geocoding Standardization:</b> GPS decimal coordinates are resolved into human-readable physical addresses using Google Maps Geocoding API with automated fallback to OpenStreetMap Nominatim and localized ward naming heuristics.", style_td)
        ],
        [
            Paragraph("<b>Stage 4: Geospatial Clustering</b>", style_td_bold),
            Paragraph("<b>50-Meter / 30-Day Deduplication:</b> MongoDB executes a 2dsphere proximity search (<code>$near</code>, 50m radius, non-resolved status within past 30 days). If a match is found, the report is merged, <code>reportCount</code> increments, the user ID is added to <code>reporterIds</code>, and severity is re-evaluated. If no match exists, a new incident is created.", style_td)
        ],
        [
            Paragraph("<b>Stage 5: Department Routing</b>", style_td_bold),
            Paragraph("<b>Authority Mapping & Grievance Generation:</b> The defect type is mapped against <code>departments.json</code> to determine the assigned authority. <code>routingService.js</code> generates a formal legal complaint letter including Complaint Reference No, hazard description, citizen impact, and legal relief prayer.", style_td)
        ],
        [
            Paragraph("<b>Stage 6: Instant Municipal Dispatch</b>", style_td_bold),
            Paragraph("<b>Automated Work Order Email & Broadcast:</b> The work order is dispatched via Nodemailer/SMTP (or Resend API) to the department's inbox. An Ethereal preview link is generated for administrative verification. Status transitions to <b>ASSIGNED</b> and a <code>detection:created</code> event is broadcast across all command centers.", style_td)
        ]
    ]
    p_table = Table(p_stages, colWidths=[120, 384])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('LINEBEFORE', (0,0), (0,-1), 3, c_secondary),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 5: DOWNSTREAM SEVERITY & URGENCIES
    # =========================================================================
    story.append(Paragraph("5. Rule-Based Severity & Urgency Classifier", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph(
        "To prevent false alarms and reflect real-world community impact, Urban EYE combines AI confidence with physical "
        "defect geometry and citizen report volume into an objective composite score:",
        style_body
    ))

    formula_text = (
        "<b>Composite Severity Score Formula:</b><br/>"
        "<code>Composite Score = (S_confidence + S_area) * W_type + S_community</code><br/><br/>"
        "&bull; <b>S_confidence (Max 35 pts):</b> &ge; 0.85 &rarr; 35 pts | &ge; 0.65 &rarr; 25 pts | &lt; 0.65 &rarr; 15 pts<br/>"
        "&bull; <b>S_area (Max 35 pts):</b> &ge; 70,000 px&sup2; &rarr; 35 pts | &ge; 25,000 px&sup2; &rarr; 25 pts | &lt; 25,000 px&sup2; &rarr; 15 pts<br/>"
        "&bull; <b>W_type (Hazard Multiplier):</b> Water Leak = 1.25x | Pothole = 1.15x | Streetlight = 1.10x | Garbage = 1.00x<br/>"
        "&bull; <b>S_community (Surge Escalation):</b> 2+ Citizen Reports &rarr; +20 pts | 4+ Citizen Reports &rarr; +35 pts<br/><br/>"
        "<b>Priority Thresholds:</b> HIGH Priority: Score &ge; 75 or Reports &ge; 4 | MEDIUM Priority: Score &ge; 45 or Reports &ge; 2 | LOW Priority: Score &lt; 45"
    )
    formula_table = Table([[Paragraph(formula_text, style_callout)]], colWidths=[504])
    formula_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('LINEBEFORE', (0,0), (-1,-1), 4, c_accent_amber),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(formula_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "<b>Automatic Surge Escalation:</b> When duplicate reports push an incident's severity rank up (e.g. from Low to Medium, "
        "or Medium to High), the system automatically triggers an <b>Escalation Alert Email</b> to the department head and emits a "
        "WebSocket event causing the incident pin on the command center GIS map to pulse vigorously.",
        style_body
    ))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: GEOSPATIAL CLUSTERING & DATABASE SPECIFICATION
    # =========================================================================
    story.append(Paragraph("6. Geospatial Clustering & Database Architecture", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph(
        "Urban EYE uses MongoDB's <b>2dsphere geospatial index</b> to evaluate physical distances over Earth's spherical surface. "
        "The schema guarantees high performance across spatial queries, reporter tracking, and resolution notifications.",
        style_body
    ))

    # Schema definition table
    schema_fields = [
        [Paragraph("Field Name", style_th), Paragraph("BSON Type", style_th), Paragraph("Indexing / Constraints", style_th), Paragraph("Functional Purpose in Urban EYE", style_th)],
        [Paragraph("<code>id</code>", style_td_bold), Paragraph("String", style_td), Paragraph("Unique (UUIDv4)", style_td), Paragraph("Deterministic external incident reference (e.g. <code>UE-A8F3C192</code>).", style_td)],
        [Paragraph("<code>location</code>", style_td_bold), Paragraph("GeoJSON Object", style_td), Paragraph("<b>2dsphere Spatial Index</b>", style_td), Paragraph("Stores <code>{ type: 'Point', coordinates: [lng, lat] }</code> for <code>$near</code> proximity clustering.", style_td)],
        [Paragraph("<code>lat, lng</code>", style_td_bold), Paragraph("Number (Double)", style_td), Paragraph("Required", style_td), Paragraph("Decimal latitude and longitude coordinates extracted from EXIF or map pin.", style_td)],
        [Paragraph("<code>type</code>", style_td_bold), Paragraph("String", style_td), Paragraph("Indexed (Enum)", style_td), Paragraph("Defect category: <code>pothole | garbage | water_leak | streetlight</code>.", style_td)],
        [Paragraph("<code>confidence</code>", style_td_bold), Paragraph("Number", style_td), Paragraph("0.0 to 1.0", style_td), Paragraph("Deep learning detection confidence output by YOLOv8 model.", style_td)],
        [Paragraph("<code>severity</code>", style_td_bold), Paragraph("String", style_td), Paragraph("Indexed (low/med/high)", style_td), Paragraph("Dynamic severity calculated via multi-factor rule engine.", style_td)],
        [Paragraph("<code>status</code>", style_td_bold), Paragraph("String", style_td), Paragraph("new | assigned | resolved", style_td), Paragraph("Municipal lifecycle state. Setting to <code>resolved</code> triggers citizen notices.", style_td)],
        [Paragraph("<code>reportCount</code>", style_td_bold), Paragraph("Number", style_td), Paragraph("Default 1", style_td), Paragraph("Count of independent citizen reports merged into this specific spatial cluster.", style_td)],
        [Paragraph("<code>reporterIds</code>", style_td_bold), Paragraph("Array of Strings", style_td), Paragraph("Array of User IDs", style_td), Paragraph("Audit list of all citizens who contributed reports to this incident cluster.", style_td)],
        [Paragraph("<code>reportText</code>", style_td_bold), Paragraph("String", style_td), Paragraph("Full Text", style_td), Paragraph("Formal legal civic complaint letter generated for municipal dispatch.", style_td)],
        [Paragraph("<code>dispatchStatus</code>", style_td_bold), Paragraph("String", style_td), Paragraph("pending | sent | failed", style_td), Paragraph("Delivery tracking flag for the outbound email work order.", style_td)],
        [Paragraph("<code>dispatchPreviewUrl</code>", style_td_bold), Paragraph("String", style_td), Paragraph("URL string", style_td), Paragraph("Verifiable Ethereal test inbox link allowing live review of the dispatched email.", style_td)],
    ]
    t_schema = Table(schema_fields, colWidths=[80, 75, 105, 244])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>6.1 Dual Persistence & Zero-Downtime Fallback Architecture</b>", style_h2))
    story.append(Paragraph(
        "To guarantee 100% operational resilience during demonstrations, evaluation, or offline deployments, "
        "<code>backend/config/database.js</code> implements an automated failover hierarchy: it first attempts connection to "
        "MongoDB Atlas (timeout: 5000ms). If blocked by cloud network policies or firewall restrictions, it seamlessly "
        "launches an embedded in-memory MongoDB daemon (<code>MongoMemoryServer</code>) without interrupting application availability.",
        style_body
    ))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: REST API & WEBSOCKET SPECIFICATIONS
    # =========================================================================
    story.append(Paragraph("7. REST API & WebSocket Event Specifications", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph("<b>7.1 RESTful API Endpoint Directory</b>", style_h2))
    api_data = [
        [Paragraph("Method", style_th), Paragraph("Route", style_th), Paragraph("Auth Scope", style_th), Paragraph("Payload & Functional Description", style_th)],
        [Paragraph("POST", style_td_bold), Paragraph("<code>/api/auth/register</code>", style_td), Paragraph("Public", style_td), Paragraph("Creates a citizen account with name, email, phone, and bcrypt password hash.", style_td)],
        [Paragraph("POST", style_td_bold), Paragraph("<code>/api/auth/login</code>", style_td), Paragraph("Public", style_td), Paragraph("Authenticates credentials; issues signed JWT bearer token with user role.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/auth/me</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Returns current authenticated user profile, permissions, and neighborhood.", style_td)],
        [Paragraph("POST", style_td_bold), Paragraph("<code>/api/detect</code>", style_td_bold), Paragraph("JWT Bearer", style_td), Paragraph("Primary triage trigger. Multipart upload (image, lat, lng). Executes full 6-stage pipeline.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/detections</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Fetches detections list. Admins access citywide ledger; citizens receive own reports.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/detections/:id</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Returns single incident record with evidence image, bounding boxes, and work order.", style_td)],
        [Paragraph("PATCH", style_td_bold), Paragraph("<code>/api/detections/:id/status</code>", style_td), Paragraph("Admin Only", style_td), Paragraph("Updates status (new, assigned, resolved). 'resolved' triggers citizen resolution notices.", style_td)],
        [Paragraph("PATCH", style_td_bold), Paragraph("<code>/api/detections/:id</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Edits formal grievance text, corrected physical address, or citizen observations.", style_td)],
        [Paragraph("DELETE", style_td_bold), Paragraph("<code>/api/detections/:id</code>", style_td), Paragraph("Admin / Owner", style_td), Paragraph("Removes incident record; broadcasts deletion event to GIS map across all clients.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/stats/summary</code>", style_td), Paragraph("Admin Only", style_td), Paragraph("Calculates system totals, status counts, breakdown by type, and department workload.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/stats/public-summary</code>", style_td), Paragraph("Public", style_td), Paragraph("Returns resolved count and active citizen metrics for the public landing page.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/stats/user-summary</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Calculates citizen personal contributions, resolved count, and civic trust score.", style_td)],
        [Paragraph("GET", style_td_bold), Paragraph("<code>/api/announcements</code>", style_td), Paragraph("JWT Bearer", style_td), Paragraph("Retrieves active municipal emergency broadcasts and civic maintenance notices.", style_td)],
        [Paragraph("POST", style_td_bold), Paragraph("<code>/api/announcements</code>", style_td), Paragraph("Admin Only", style_td), Paragraph("Publishes citywide public advisory with urgency level (normal, urgent, emergency).", style_td)],
    ]
    t_api = Table(api_data, colWidths=[40, 130, 70, 264])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_api)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>7.2 Real-Time WebSocket Event Contracts (Socket.io)</b>", style_h2))
    ws_data = [
        [Paragraph("Event Identifier", style_th), Paragraph("Transmission Scope", style_th), Paragraph("Payload Schema & Operational Significance", style_th)],
        [
            Paragraph("<code>pipeline:progress</code>", style_td_bold),
            Paragraph("Job Room & Broadcast", style_td),
            Paragraph("<code>{ jobId, stage, step, totalSteps: 6, message, details }</code><br/>Fired at each of the 6 pipeline stage boundaries to animate the frontend stepper in real time.", style_td)
        ],
        [
            Paragraph("<code>detection:created</code>", style_td_bold),
            Paragraph("Global Broadcast", style_td),
            Paragraph("<code>{ ...detectionRecord }</code><br/>Notifies all active command centers of a brand-new, non-duplicate municipal issue dispatch.", style_td)
        ],
        [
            Paragraph("<code>detection:merged</code>", style_td_bold),
            Paragraph("Broadcast & User", style_td),
            Paragraph("<code>{ detection, details: { isDuplicate, reportCount, escalated } }</code><br/>Informs clients that an existing incident absorbed a duplicate report. Updates map pin pulse if escalated.", style_td)
        ],
        [
            Paragraph("<code>detection:updated</code>", style_td_bold),
            Paragraph("Broadcast & Reporters", style_td),
            Paragraph("<code>{ ...updatedDetectionRecord }</code><br/>Broadcasts administrative triage changes (e.g. status changed to <code>resolved</code>). Citizens receive immediate resolution banner.", style_td)
        ],
        [
            Paragraph("<code>detection:deleted</code>", style_td_bold),
            Paragraph("Broadcast & Reporters", style_td),
            Paragraph("<code>{ id: detectionId }</code><br/>Removes pin from GIS maps and incident tables instantly across all connected screens.", style_td)
        ],
        [
            Paragraph("<code>announcement:created</code>", style_td_bold),
            Paragraph("Global Broadcast", style_td),
            Paragraph("<code>{ ...announcementRecord }</code><br/>Pushes critical municipal emergency alerts and maintenance schedules to all active users.", style_td)
        ],
    ]
    t_ws = Table(ws_data, colWidths=[115, 95, 294])
    t_ws.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_ws)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 8: USER PORTALS, SECURITY & DEPLOYMENT
    # =========================================================================
    story.append(Paragraph("8. User Portals, Security & Deployment Blueprint", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=c_secondary, spaceAfter=8))

    story.append(Paragraph("<b>8.1 Citizen Portal Experience</b>", style_h2))
    story.append(Paragraph(
        "Designed for rapid field reporting from mobile devices with zero friction:",
        style_body
    ))
    story.append(Paragraph("&bull; <b>Direct Camera Capture:</b> Uses HTML5 media stream APIs for instant rear camera capture or desktop webcam snapshots.", style_bullet))
    story.append(Paragraph("&bull; <b>Client-Side Image Optimization:</b> Compresses multi-megabyte photos to 1600px max at 80% JPEG quality before network transit.", style_bullet))
    story.append(Paragraph("&bull; <b>Real-Time 6-Stage Progress Stepper:</b> Connects to Socket.io to visually display progress through Received, Detecting, Geotagging, Deduplication, Routing, and Dispatched.", style_bullet))
    story.append(Paragraph("&bull; <b>Closed-Loop Resolution Feedback:</b> Citizens receive automated resolution emails the moment field crews resolve their reported issue.", style_bullet))
    story.append(Paragraph("&bull; <b>Civic Trust Scoring:</b> Citizens earn trust score increments upon verified resolutions, gamifying community civic responsibility.", style_bullet))

    story.append(Paragraph("<b>8.2 Municipal Command Center (Admin Experience)</b>", style_h2))
    story.append(Paragraph(
        "Provides municipal decision-makers with comprehensive situational awareness:",
        style_body
    ))
    story.append(Paragraph("&bull; <b>Interactive GIS Heatmap:</b> Live geospatial map plotting all active city incidents with pulsating severity markers (Red = High, Orange = Medium, Green = Low).", style_bullet))
    story.append(Paragraph("&bull; <b>Incident Triage Ledger:</b> Real-time table with instant multi-facet filtering (defect type, severity, status, assigned department) and search.", style_bullet))
    story.append(Paragraph("&bull; <b>Verifiable Email Previewer:</b> Direct modal button to open the actual Ethereal work order dispatch email for audit and inspection.", style_bullet))
    story.append(Paragraph("&bull; <b>Executive Workload Analytics:</b> Dynamic Recharts breakdowns of department volume, average turnaround time, and resolution velocity.", style_bullet))

    story.append(Paragraph("<b>8.3 Security & Hardening Architecture</b>", style_h2))
    story.append(Paragraph("&bull; <b>Role-Based Access Control (RBAC):</b> JWT tokens encode user roles (`user` vs `admin`). Administrative routes are protected by <code>requireAdmin</code> middleware.", style_bullet))
    story.append(Paragraph("&bull; <b>Cryptographic Hashing:</b> Passwords hashed using bcrypt with 10 salt rounds. Strict complexity rules enforced.", style_bullet))
    story.append(Paragraph("&bull; <b>Sliding-Window Rate Limiting:</b> <code>express-rate-limit</code> prevents upload spamming and brute-force authentication attacks.", style_bullet))
    story.append(Paragraph("&bull; <b>Sanitized Media Ingestion:</b> Image buffers are validated against magic bytes, stripped of potential code payloads, and capped at 20MB.", style_bullet))

    story.append(Paragraph("<b>8.4 Docker Multi-Container Orchestration</b>", style_h2))

    docker_summary = (
        "<b>Container Architecture & Ports:</b><br/>"
        "• <b>urban_eye_db (mongo:7.0):</b> Port 27017 | Volume: <code>mongodb_data:/data/db</code><br/>"
        "• <b>urban_eye_ai (Python FastAPI):</b> Port 8000 | Ultralytics YOLOv8 inference service<br/>"
        "• <b>urban_eye_api (Node.js/Express):</b> Port 5000 | Volumes: <code>uploads</code>, <code>data</code> | Depends on Mongo & AI<br/>"
        "• <b>urban_eye_ui (React/Vite):</b> Port 5173 | Command Center Web Application | Connects to Backend API<br/>"
        "<b>Single-Command Launch:</b> <code>docker-compose up --build</code>"
    )
    d_table = Table([[Paragraph(docker_summary, style_callout)]], colWidths=[504])
    d_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(d_table)
    story.append(Spacer(1, 6))

    conclusion_text = (
        "<b>Conclusion:</b> Urban EYE establishes a new paradigm in smart-city civil engineering. By replacing manual "
        "complaint backlogs with autonomous computer vision, intelligent 50m spatial deduplication, rule-based severity "
        "escalation, and instant verifiable municipal dispatch, the platform delivers the speed, accountability, and operational "
        "intelligence demanded by modern 21st-century cities."
    )
    c_table = Table([[Paragraph(conclusion_text, style_callout)]], colWidths=[504])
    c_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('BOX', (0,0), (-1,-1), 1, c_secondary),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(c_table)

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[PDF Generation] Success! Document built: {filename}")

if __name__ == '__main__':
    output_filename = "Urban_EYE_Comprehensive_Report.pdf"
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
    build_pdf(output_filename)
