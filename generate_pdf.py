import sys
import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def build_pdf(filename):
    # Landscape orientation matching the original presentation slides (11 x 8.5 inches)
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Color Palette matching Lovable / HostelHub PDF Theme
    NAVY = colors.HexColor('#0F172A')
    TEAL = colors.HexColor('#0D9488')
    RED_ACCENT = colors.HexColor('#DC2626')
    LIGHT_BG = colors.HexColor('#F8FAFC')
    CARD_BG = colors.HexColor('#FFFFFF')
    BORDER_COLOR = colors.HexColor('#CBD5E1')
    TEXT_DARK = colors.HexColor('#1E293B')
    TEXT_MUTED = colors.HexColor('#64748B')
    LIGHT_RED = colors.HexColor('#FEF2F2')
    AMBER_BG = colors.HexColor('#FFFBEB')

    # Typography Styles
    slide_title_style = ParagraphStyle(
        'SlideTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.white
    )

    slide_sub_style = ParagraphStyle(
        'SlideSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#94A3B8')
    )

    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=NAVY,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=TEXT_DARK
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0F766E')
    )

    error_style = ParagraphStyle(
        'ErrorStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=RED_ACCENT
    )

    story = []

    def make_header_banner(title_text, subtitle_text):
        content = [
            [Paragraph(title_text, slide_title_style)],
            [Paragraph(subtitle_text, slide_sub_style)]
        ]
        t = Table(content, colWidths=[720])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), NAVY),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LEFTPADDING', (0,0), (-1,-1), 16),
            ('RIGHTPADDING', (0,0), (-1,-1), 16),
        ]))
        return t

    def make_footer_bar(page_num):
        data = [[
            Paragraph("HostelHub — Project Review & Diagrams Audit", ParagraphStyle('F1', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED)),
            Paragraph(f"Page {page_num} of 9", ParagraphStyle('F2', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED, alignment=TA_RIGHT))
        ]]
        t = Table(data, colWidths=[520, 200])
        t.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        return t

    # ==========================================
    # SLIDE 1: MongoDB / JPA Data Model
    # ==========================================
    story.append(make_header_banner("1. MongoDB / JPA Data Model (Corrected)", "Database design for HostelHub implementation"))
    story.append(Spacer(1, 12))

    s1_text = """
    <b>Critical Corrections & Missing Fields Added:</b><br/>
    • <b>users Collection:</b> Added <code>faceEmbedding</code> (128D Float Vector Array/TEXT) & <code>isFaceVerified</code> (Boolean).<br/>
    • <b>complaints Collection:</b> Added <code>locationBlock</code>, <code>locationRoom</code>, <code>slaDeadline</code>, <code>slaBreached</code> (Boolean), <code>isMerged</code> (Boolean), and <code>parentTicketId</code>.<br/>
    • <b>work_logs / spare_parts:</b> Replaced raw string with structured parts table <code>parts: [{partName, quantity, unitCost, lineTotal}]</code> and <code>totalCost</code>.
    """
    story.append(Paragraph(s1_text, body_style))
    story.append(Spacer(1, 10))

    data_s1 = [
        [Paragraph("<b>users</b>", body_style), Paragraph("<b>complaints</b>", body_style), Paragraph("<b>work_logs / spare_parts</b>", body_style)],
        [
            Paragraph("• _id (PK)<br/>• name<br/>• email<br/>• password<br/>• role [STUDENT|WARDEN|TECH]<br/>• <b>faceEmbedding (128D)</b><br/>• <b>isFaceVerified</b><br/>• studentId / roomNumber", body_style),
            Paragraph("• _id (e.g. #CH1025)<br/>• studentId<br/>• title & description<br/>• category & priority<br/>• status / stage<br/>• <b>locationBlock & room</b><br/>• <b>slaBreached & isMerged</b><br/>• rating & photos", body_style),
            Paragraph("• _id (PK)<br/>• complaintId (FK)<br/>• technicianId (FK)<br/>• partName & quantity<br/>• unitCost & lineTotal<br/>• <b>totalCost</b><br/>• beforePhoto & afterPhoto", body_style)
        ]
    ]
    t_s1 = Table(data_s1, colWidths=[240, 240, 240])
    t_s1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_s1)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(1))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 2: Java Class Hierarchy (OOP Structure)
    # ==========================================
    story.append(make_header_banner("2. Java Class Hierarchy (Corrected)", "Core Object-Oriented Structure & Polymorphism"))
    story.append(Spacer(1, 12))

    s2_text = """
    <b>Missing OOP Fields & Methods Added:</b><br/>
    • <b>User &lt;&lt;abstract&gt;&gt;:</b> Added <code>faceEmbedding: String</code> and <code>+ verifyFace()</code>.<br/>
    • <b>Student:</b> Added <code>+ reopenComplaint()</code> and <code>+ submitComplaintWithPhoto()</code>.<br/>
    • <b>Warden:</b> Attribute updated to <code>blockAssigned</code>. Added <code>+ mergeDuplicateComplaints()</code> and <code>+ autoAssignTechnician()</code>.<br/>
    • <b>Technician:</b> Attribute updated to <code>specialty</code> and <code>activeTasksCount</code>. Added <code>+ logSpareParts()</code> and <code>+ markCompleted()</code>.
    """
    story.append(Paragraph(s2_text, body_style))
    story.append(Spacer(1, 10))

    data_s2 = [
        [Paragraph("<b>Student</b> (extends User)", body_style), Paragraph("<b>Warden</b> (extends User)", body_style), Paragraph("<b>Technician</b> (extends User)", body_style)],
        [
            Paragraph("- studentId: String<br/>- hostelBlock: String<br/>- roomNumber: String<br/><br/>+ submitComplaint()<br/>+ trackStatus()<br/>+ rateService()<br/><b>+ reopenComplaint()</b><br/><b>+ verifyFaceBiometrics()</b>", body_style),
            Paragraph("- blockAssigned: String<br/>- designation: String<br/><br/>+ viewComplaints()<br/><b>+ autoAssignTechnician()</b><br/><b>+ mergeDuplicateComplaints()</b><br/>+ viewAnalytics()<br/><b>+ escalateSLA()</b>", body_style),
            Paragraph("- specialty: String<br/>- activeTasksCount: int<br/>- avgRating: double<br/><br/>+ viewAssignedQueue()<br/><b>+ logSpareParts()</b><br/><b>+ uploadAfterPhoto()</b><br/><b>+ markCompleted()</b>", body_style)
        ]
    ]
    t_s2 = Table(data_s2, colWidths=[240, 240, 240])
    t_s2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_s2)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(2))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 3: State Pattern — Complaint Lifecycle
    # ==========================================
    story.append(make_header_banner("3. State Pattern — Complaint Lifecycle (Corrected)", "State Pattern controlling ticket lifecycle transitions"))
    story.append(Spacer(1, 12))

    s3_text = """
    <b>Missing Lifecycle Transitions Added:</b><br/>
    1. <b>Forward Lifecycle:</b> SUBMITTED ──► UNDER REVIEW ──► ASSIGNED ──► IN PROGRESS ──► COMPLETED ──► CLOSED<br/>
    2. <b>Reopen Loop:</b> From <code>COMPLETED</code> / <code>CLOSED</code> back to <code>UNDER REVIEW</code> / <code>IN PROGRESS</code> if student reopens an unresolved ticket.<br/>
    3. <b>Duplicate Merge Shortcut:</b> Direct transition from <code>SUBMITTED</code> ──► <code>CLOSED (MERGED)</code> when warden merges duplicate complaints.
    """
    story.append(Paragraph(s3_text, body_style))
    story.append(Spacer(1, 12))

    state_flow_data = [
        [
            Paragraph("<b>1. SUBMITTED</b><br/>Ticket created by student", body_style),
            Paragraph("<b>2. UNDER REVIEW</b><br/>Warden triages ticket", body_style),
            Paragraph("<b>3. ASSIGNED</b><br/>Tech assigned via Strategy", body_style)
        ],
        [
            Paragraph("<b>4. IN PROGRESS</b><br/>Tech starts work & parts log", body_style),
            Paragraph("<b>5. COMPLETED</b><br/>After photo uploaded", body_style),
            Paragraph("<b>6. CLOSED</b><br/>Rated or merged duplicate", body_style)
        ]
    ]
    t_s3 = Table(state_flow_data, colWidths=[240, 240, 240])
    t_s3.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('GRID', (0,0), (-1,-1), 1, TEAL),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s3)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(3))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 4: Observer Pattern — Notifications
    # ==========================================
    story.append(make_header_banner("4. Observer Pattern — Complaint Notifications", "Dispatches real-time event updates to registered listeners"))
    story.append(Spacer(1, 12))

    s4_text = """
    <b>Missing Observer Added:</b><br/>
    • The original slide omitted <b>WardenObserver</b>. Added <code>WardenObserver</code> to notify the Warden instantly when tickets are submitted, SLA deadlines breach, or duplicate complaints accumulate.
    """
    story.append(Paragraph(s4_text, body_style))
    story.append(Spacer(1, 12))

    obs_data = [
        [Paragraph("<b>Subject: ComplaintSubject</b>", body_style), Paragraph("<b>Observers Registered</b>", body_style)],
        [
            Paragraph("- status: Stage<br/>- observers: List&lt;ComplaintObserver&gt;<br/><br/>+ registerObserver()<br/>+ removeObserver()<br/>+ notifyStatusChange()", body_style),
            Paragraph("• <b>StudentNotifier:</b> Receives status transition alerts (e.g. Assigned ──► In Progress).<br/>• <b>TechnicianNotifier:</b> Receives new job queue assignments.<br/>• <b>WardenNotifier (NEW):</b> Receives SLA breach warnings & duplicate alerts.", body_style)
        ]
    ]
    t_s4 = Table(obs_data, colWidths=[300, 420])
    t_s4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s4)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(4))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 5: Strategy Pattern — Technician Assignment
    # ==========================================
    story.append(make_header_banner("5. Strategy Pattern — Technician Assignment", "Smart technician workload balancing & specialty matching algorithms"))
    story.append(Spacer(1, 12))

    s5_text = """
    <b>Assignment Strategies Implemented:</b><br/>
    • <b>LeastLoadedStrategy:</b> Inspects active tasks count of all technicians and assigns the candidate with minimum active workload.<br/>
    • <b>SpecialtyStrategy:</b> Filters technicians by category specialty (e.g. Plumbing) first, then applies workload balancing.<br/>
    • <b>AssignmentService:</b> Context class that dynamically executes the active strategy selected by the Warden.
    """
    story.append(Paragraph(s5_text, body_style))
    story.append(Spacer(1, 12))

    strat_data = [
        [Paragraph("<b>Strategy 1: LeastLoadedStrategy</b>", body_style), Paragraph("<b>Strategy 2: SpecialtyStrategy</b>", body_style)],
        [
            Paragraph("<code>@Component(\"leastLoadedStrategy\")</code><br/>Selects technician with minimum <code>activeTasksCount</code> to balance workload across staff.", body_style),
            Paragraph("<code>@Component(\"specialtyStrategy\")</code><br/>Matches complaint category (e.g. Electrical) to technician's specialty before fallback.", body_style)
        ]
    ]
    t_s5 = Table(strat_data, colWidths=[360, 360])
    t_s5.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s5)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(5))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 6: Factory Pattern — Complaint Creation
    # ==========================================
    story.append(make_header_banner("6. Factory Pattern — Complaint Creation (Recommended)", "Centralized complaint object creation & auto-priority tagging"))
    story.append(Spacer(1, 12))

    s6_text = """
    <b>Factory Pattern Enhancement (ComplaintFactory):</b><br/>
    • Instead of simple User creation, <code>ComplaintFactory</code> encapsulates business rules for ticket generation.<br/>
    • <b>Auto-Priority Rule:</b> Category <code>ELECTRICAL</code> is automatically assigned <b>HIGH Priority</b> due to hazard risks.<br/>
    • <b>Ticket ID Generation:</b> Generates unique <code>CHxxxx</code> identifier and sets initial state to <code>SUBMITTED</code>.
    """
    story.append(Paragraph(s6_text, body_style))
    story.append(Spacer(1, 12))

    fact_data = [
        [Paragraph("<b>ComplaintFactory Input</b>", body_style), Paragraph("<b>ComplaintFactory Output</b>", body_style)],
        [
            Paragraph("• Student Reference<br/>• Category (e.g. ELECTRICAL)<br/>• Description & Photos<br/>• Block & Room Location", body_style),
            Paragraph("• Unique ID: <code>#CH1025</code><br/>• Priority: <b>HIGH (Auto-tagged)</b><br/>• Stage: <b>SUBMITTED</b><br/>• Timestamp & SLA Deadline", body_style)
        ]
    ]
    t_s6 = Table(fact_data, colWidths=[360, 360])
    t_s6.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_s6)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(6))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 7: Singleton / Spring Bean Scope
    # ==========================================
    story.append(make_header_banner("7. Singleton Scope — Spring Beans", "Spring Boot manages singleton scope by default for service components"))
    story.append(Spacer(1, 12))

    s7_text = """
    <b>Missing Singleton Services Added:</b><br/>
    • <b>FaceVerificationService:</b> Singleton bean executing 128D face embedding cosine similarity calculations.<br/>
    • <b>GeofenceService:</b> Singleton bean validating client IP against hostel Wi-Fi subnets.<br/>
    • <b>ComplaintService:</b> Central singleton bean injected across controllers.
    """
    story.append(Paragraph(s7_text, body_style))
    story.append(Spacer(1, 12))

    sing_data = [
        [Paragraph("<b>Spring Container (Singleton Scope Beans)</b>", body_style)],
        [Paragraph("1. <code>FaceVerificationService</code> — Singleton for biometrics comparison<br/>2. <code>GeofenceService</code> — Singleton for Wi-Fi IP subnet check<br/>3. <code>ComplaintService</code> — Singleton for ticket business logic", body_style)]
    ]
    t_s7 = Table(sing_data, colWidths=[720])
    t_s7.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('GRID', (0,0), (-1,-1), 1, TEAL),
        ('PADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(t_s7)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(7))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 8: Overall System Architecture
    # ==========================================
    story.append(make_header_banner("8. Overall System Architecture", "HostelHub — React + Spring Boot 3 + JPA / MySQL / H2"))
    story.append(Spacer(1, 12))

    s8_text = """
    <b>Complete System Stack:</b><br/>
    React 18 Frontend ──► Spring Security (JWT + Face Auth) ──► Controllers ──► Services ──► Repositories ──► Database
    """
    story.append(Paragraph(s8_text, body_style))
    story.append(Spacer(1, 12))

    arch_layers = [
        [Paragraph("<b>1. React 18 Frontend:</b> Role Switcher, Face Biometric Guard, Student/Warden/Tech views, Chart.js", body_style)],
        [Paragraph("<b>2. Security & Biometrics Layer:</b> Face-api.js + FaceVerificationService (128D) + Geofence IP check", body_style)],
        [Paragraph("<b>3. Controllers Layer:</b> AuthController, ComplaintController, WardenController, TechnicianController", body_style)],
        [Paragraph("<b>4. Services & OOP Patterns:</b> Factory, Strategy, Observer, State, Singleton services", body_style)],
        [Paragraph("<b>5. Persistence & Cloud Layer:</b> Spring Data JPA Repositories + MySQL/H2 DB + Cloudinary photo storage", body_style)]
    ]
    t_s8 = Table(arch_layers, colWidths=[720])
    t_s8.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_s8)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(8))
    story.append(PageBreak())

    # ==========================================
    # SLIDE 9: Review Checklist & Viva Presentation Guide
    # ==========================================
    story.append(make_header_banner("9. Review Checklist & Viva Guide", "Recommended presentation flow for project review"))
    story.append(Spacer(1, 12))

    checklist_data = [
        [Paragraph("<b>Step</b>", body_style), Paragraph("<b>Topic</b>", body_style), Paragraph("<b>Key Viva Defense Points</b>", body_style)],
        [Paragraph("01", body_style), Paragraph("Database Data Model", body_style), Paragraph("Explain entity fields, 128D face vector storage, SLA breach flags, duplicate ticket references.", body_style)],
        [Paragraph("02", body_style), Paragraph("Java Class Hierarchy", body_style), Paragraph("Explain abstract User class, Student, Warden, Technician inheritance & encapsulation.", body_style)],
        [Paragraph("03", body_style), Paragraph("State Pattern", body_style), Paragraph("Demonstrate ticket lifecycle, Reopen loop from Completed, and Duplicate Merge shortcut.", body_style)],
        [Paragraph("04", body_style), Paragraph("Observer Pattern", body_style), Paragraph("Show real-time notifications dispatched to StudentObserver, TechnicianObserver & WardenObserver.", body_style)],
        [Paragraph("05", body_style), Paragraph("Strategy Pattern", body_style), Paragraph("Explain LeastLoadedStrategy vs SpecialtyStrategy for smart workload balancing.", body_style)],
        [Paragraph("06", body_style), Paragraph("Factory Pattern", body_style), Paragraph("Explain ComplaintFactory auto-assigning High Priority for Electrical hazard tickets.", body_style)],
        [Paragraph("07", body_style), Paragraph("Singleton Scope", body_style), Paragraph("Explain Spring-managed singletons: FaceVerificationService & GeofenceService.", body_style)],
        [Paragraph("08", body_style), Paragraph("System Architecture", body_style), Paragraph("Show full end-to-end integration: React ──► Spring Boot ──► JPA/MySQL ──► Cloudinary.", body_style)]
    ]
    t_s9 = Table(checklist_data, colWidths=[40, 160, 520])
    t_s9.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_s9)
    story.append(Spacer(1, 20))
    story.append(make_footer_bar(9))

    doc.build(story)
    print(f"PDF generated successfully: {filename}")

if __name__ == '__main__':
    out_file = os.path.join(os.getcwd(), "HostelHub_Presentation_Review_and_Corrections.pdf")
    build_pdf(out_file)
