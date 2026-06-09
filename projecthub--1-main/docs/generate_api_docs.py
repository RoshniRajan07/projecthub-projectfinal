import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUT_DIR = Path(__file__).resolve().parent
JSON_OUT = OUT_DIR / "ProjectHub_API_ModuleWise.json"
PDF_OUT = OUT_DIR / "ProjectHub_API_ModuleWise_Documentation.pdf"
URLS_JSON_OUT = OUT_DIR / "ProjectHub_API_URLs_Table.json"
URLS_CSV_OUT = OUT_DIR / "ProjectHub_API_URLs_Table.csv"
URLS_PDF_OUT = OUT_DIR / "ProjectHub_API_URLs_Table.pdf"


BASE_URL = "http://localhost:8081"


SQL_SAMPLES = {
    "admin_user": {
        "id": 8,
        "fullName": "Admin",
        "email": "admin@gmail.com",
        "role": "ADMIN",
        "username": None,
        "assignedSubject": None,
    },
    "student_user": {
        "id": 30,
        "fullName": "siva",
        "email": "siva062005@gmail.com",
        "role": "STUDENT",
        "username": None,
        "assignedSubject": None,
    },
    "faculty_user": {
        "id": 38,
        "fullName": "John Doe",
        "email": "faculty1@demo.com",
        "role": "FACULTY",
        "username": None,
        "assignedSubject": "Computer Science",
    },
    "student_profile": {
        "id": 2,
        "department": "ai/ds",
        "studentCode": "STU-S157",
        "section": None,
        "enrollmentYear": None,
        "year": "2024",
        "githubUrl": "https://github.com/testuser",
        "linkedinUrl": "https://linkedin.com/in/testuser",
        "leetcodeUrl": "https://leetcode.com/testuser",
        "hackerrankUrl": "https://hackerrank.com/testuser",
        "portfolioUrl": "https://testuser.dev",
        "faculty": {"id": 2, "department": "CSE", "specialization": "Artificial Intelligence"},
        "user": {"id": 30, "fullName": "siva", "email": "siva062005@gmail.com", "role": "STUDENT"},
    },
    "faculty_profile": {
        "id": 2,
        "department": "CSE",
        "specialization": "Artificial Intelligence",
        "facultyCode": None,
        "section": None,
        "joiningYear": None,
        "user": {"id": 38, "fullName": "John Doe", "email": "faculty1@demo.com", "role": "FACULTY"},
    },
    "admin_settings": {
        "id": 1,
        "submissionDeadline": "30-05-2026",
        "maxResubmissions": 3,
        "maxFileSize": 25,
        "allowedFileTypes": None,
    },
    "audit_log": {
        "id": 11,
        "actionTitle": "User Created",
        "description": "Created new user: priyasri",
        "performedBy": {"id": 43, "fullName": "priyasri"},
        "createdAt": "2026-06-01T15:54:03",
    },
}


MONGO_SAMPLES = {
    "project": {
        "id": "665f10b2e6a7c1f0a91c0001",
        "title": "AI Student Project Hub",
        "abstractText": "A portal for submitting and reviewing student projects.",
        "technology": "React, Spring Boot, MongoDB",
        "status": "PENDING",
        "feedback": "",
        "grade": "",
        "studentId": 2,
        "studentName": "siva",
        "facultyId": 2,
        "facultyName": "John Doe",
        "githubUrl": "https://github.com/testuser/projecthub",
        "linkedinUrl": "https://linkedin.com/in/testuser",
        "fileName": "projecthub.pdf",
        "fileURL": "/projects/download/projecthub.pdf?inline=true",
        "subject": "Computer Science",
        "department": "CSE",
        "submittedDate": "2026-06-02",
        "version": 1,
    },
    "certificate": {
        "id": "665f11c7e6a7c1f0a91c0002",
        "title": "AWS Cloud Practitioner",
        "organization": "Amazon Web Services",
        "category": "Cloud",
        "department": "CSE",
        "issueDate": "2026-05-28",
        "status": "PENDING",
        "remarks": "",
        "studentId": 2,
        "studentName": "siva",
        "facultyId": 2,
        "facultyName": "John Doe",
        "fileName": "aws.pdf",
        "fileURL": "/projects/download/aws.pdf?inline=true",
        "uploadDate": "2026-06-02",
        "submittedDate": "2026-06-02",
        "version": 1,
    },
    "notification": {
        "id": "665f12d8e6a7c1f0a91c0003",
        "userId": 30,
        "role": "STUDENT",
        "title": "Project Approved",
        "message": "Your project review has been updated.",
        "type": "success",
        "read": False,
        "createdAt": "2026-06-02T09:30:00",
    },
    "deadline_rule": {
        "id": "665f13e9e6a7c1f0a91c0004",
        "type": "Project",
        "name": "Final Project Submission",
        "deadline": "2026-06-15",
        "resubmissions": 3,
        "status": "Active",
    },
}


def ep(method, path, module, purpose, request=None, response=None, query=None, notes=None, auth=True):
    return {
        "module": module,
        "method": method,
        "url": f"{BASE_URL}{path}",
        "path": path,
        "auth": "Bearer JWT required after login" if auth else "Public / no JWT required in current SecurityConfig",
        "purpose": purpose,
        "queryOrPathParams": query or {},
        "requestJson": request,
        "responseJson": response,
        "notes": notes or "",
    }


ENDPOINTS = [
    ep("POST", "/users/login", "Authentication", "Login and receive JWT token.", {"email": "admin@gmail.com", "password": "123"}, {"token": "eyJhbGciOiJIUzI1NiJ9...", "id": 8, "role": "ADMIN", "fullName": "Admin"}, auth=False),
    ep("POST", "/auth/register", "Authentication", "Register a new user.", {"fullName": "Test Student", "email": "student@test.com", "password": "Password@123", "role": "STUDENT", "username": "teststudent"}, SQL_SAMPLES["student_user"], auth=False),

    ep("POST", "/users", "Users", "Create a user.", {"fullName": "Swathi", "email": "swathi@test.com", "password": "Password@123", "role": "STUDENT"}, {"id": 41, "fullName": "Swathi", "email": "swathi@test.com", "role": "STUDENT"}),
    ep("GET", "/users", "Users", "Get all users.", response=[SQL_SAMPLES["admin_user"], SQL_SAMPLES["student_user"], SQL_SAMPLES["faculty_user"]]),
    ep("GET", "/users/{id}", "Users", "Get user by id.", response=SQL_SAMPLES["student_user"], query={"id": 30}),
    ep("PUT", "/users/{id}", "Users", "Update user and role profile fields.", {"fullName": "Student Updated", "department": "CSE", "year": "2026"}, {"id": 30, "fullName": "Student Updated", "email": "siva062005@gmail.com", "role": "STUDENT"}, query={"id": 30}),
    ep("DELETE", "/users/{id}", "Users", "Delete user by id.", response="User deleted successfully", query={"id": 42}),
    ep("GET", "/users/search?name=siva", "Users", "Search users by full name.", response=[SQL_SAMPLES["student_user"]], query={"name": "siva"}),
    ep("GET", "/users/filter/role?role=STUDENT", "Users", "Filter users by role.", response=[SQL_SAMPLES["student_user"]], query={"role": "STUDENT"}),
    ep("PUT", "/users/assign-faculty/{id}?subject=Computer%20Science", "Users", "Assign subject to a faculty user.", response=SQL_SAMPLES["faculty_user"], query={"id": 38, "subject": "Computer Science"}),
    ep("POST", "/users/bulk-upload", "Users", "Bulk register users from Excel file.", request={"file": "users.xlsx (multipart/form-data)"}, response={"created": 10, "failed": 0, "errors": []}, notes="Consumes multipart/form-data."),

    ep("GET", "/users/student/profile/{id}", "Profiles", "Get student profile.", response=SQL_SAMPLES["student_profile"], query={"id": 2}),
    ep("PUT", "/users/student/profile/{id}", "Profiles", "Update student profile.", {"department": "CSE", "year": "2026", "githubUrl": "https://github.com/testuser"}, SQL_SAMPLES["student_profile"], query={"id": 2}),
    ep("GET", "/users/faculty/profile/{id}", "Profiles", "Get faculty profile.", response=SQL_SAMPLES["faculty_profile"], query={"id": 2}),
    ep("PUT", "/users/faculty/profile/{id}", "Profiles", "Update faculty profile.", {"department": "CSE", "specialization": "Cloud Computing", "section": "A"}, SQL_SAMPLES["faculty_profile"], query={"id": 2}),

    ep("POST", "/users/settings", "Settings and Analytics", "Save admin settings.", {"submissionDeadline": "30-05-2026", "maxResubmissions": 3, "maxFileSize": 25, "allowedFileTypes": "pdf,docx,png"}, SQL_SAMPLES["admin_settings"]),
    ep("GET", "/users/settings", "Settings and Analytics", "Get admin settings.", response=[SQL_SAMPLES["admin_settings"]]),
    ep("GET", "/users/admin/analytics", "Settings and Analytics", "Get admin analytics.", response={"totalUsers": 13, "totalProjects": 0, "approvedProjects": 0, "pendingProjects": 0, "totalCertificates": 0, "approvedCertificates": 0, "facultyCount": 2}),
    ep("GET", "/dashboard", "Settings and Analytics", "Get dashboard counts.", response={"totalProjects": 1, "approvedProjects": 0, "pendingProjects": 1, "verifiedCertificates": 0}),

    ep("POST", "/users/notifications", "Notifications", "Create MongoDB notification.", MONGO_SAMPLES["notification"], MONGO_SAMPLES["notification"]),
    ep("GET", "/users/notifications/{userId}", "Notifications", "Get notifications for a user.", response=[MONGO_SAMPLES["notification"]], query={"userId": 30}),
    ep("PUT", "/users/notifications/read/{id}", "Notifications", "Mark notification as read.", response={**MONGO_SAMPLES["notification"], "read": True}, query={"id": MONGO_SAMPLES["notification"]["id"]}),
    ep("DELETE", "/users/notifications/{id}", "Notifications", "Delete notification.", response="Notification deleted", query={"id": MONGO_SAMPLES["notification"]["id"]}),
    ep("GET", "/users/audit-logs", "Audit Logs", "Get audit logs from MySQL.", response=[SQL_SAMPLES["audit_log"]]),

    ep("POST", "/projects/upload", "Projects", "Upload project/certificate file.", request={"file": "projecthub.pdf (multipart/form-data)"}, response="1717315200000_projecthub.pdf", notes="Consumes multipart/form-data."),
    ep("GET", "/projects/download/{fileName}?inline=true", "Projects", "Download or preview uploaded file.", response="Binary file stream", query={"fileName": "projecthub.pdf", "inline": True}),
    ep("POST", "/projects/mongo", "Projects", "Create MongoDB project.", MONGO_SAMPLES["project"], MONGO_SAMPLES["project"]),
    ep("GET", "/projects/mongo", "Projects", "Get all MongoDB projects.", response=[MONGO_SAMPLES["project"]]),
    ep("GET", "/projects/mongo/student/{studentId}", "Projects", "Get projects by student.", response=[MONGO_SAMPLES["project"]], query={"studentId": 2}),
    ep("GET", "/projects/mongo/faculty/{facultyId}", "Projects", "Get projects assigned to faculty.", response=[MONGO_SAMPLES["project"]], query={"facultyId": 2}),
    ep("GET", "/projects/mongo/{id}", "Projects", "Get project by Mongo id.", response=MONGO_SAMPLES["project"], query={"id": MONGO_SAMPLES["project"]["id"]}),
    ep("PUT", "/projects/mongo/review/{id}?status=APPROVED&feedback=Good&grade=A", "Projects", "Review project.", response={**MONGO_SAMPLES["project"], "status": "APPROVED", "feedback": "Good", "grade": "A"}, query={"id": MONGO_SAMPLES["project"]["id"], "status": "APPROVED", "feedback": "Good", "grade": "A"}),
    ep("PUT", "/projects/mongo/update/{id}", "Projects", "Update project details.", {**MONGO_SAMPLES["project"], "title": "Updated Project Hub"}, {**MONGO_SAMPLES["project"], "title": "Updated Project Hub"}, query={"id": MONGO_SAMPLES["project"]["id"]}),
    ep("PUT", "/projects/mongo/resubmit/{id}", "Projects", "Resubmit project and increment version.", response={**MONGO_SAMPLES["project"], "status": "PENDING", "version": 2}, query={"id": MONGO_SAMPLES["project"]["id"]}),
    ep("DELETE", "/projects/mongo/{id}", "Projects", "Delete project.", response="Project deleted", query={"id": MONGO_SAMPLES["project"]["id"]}),
    ep("GET", "/projects/mongo/search?title=AI", "Projects", "Search projects by title.", response=[MONGO_SAMPLES["project"]], query={"title": "AI"}),
    ep("GET", "/projects/mongo/filter/status?status=PENDING", "Projects", "Filter projects by status.", response=[MONGO_SAMPLES["project"]], query={"status": "PENDING"}),
    ep("GET", "/projects/mongo/filter/technology?technology=React", "Projects", "Filter projects by technology.", response=[MONGO_SAMPLES["project"]], query={"technology": "React"}),
    ep("GET", "/projects/mongo/filter?status=PENDING&technology=React", "Projects", "Filter projects by status and technology.", response=[MONGO_SAMPLES["project"]], query={"status": "PENDING", "technology": "React"}),
    ep("GET", "/projects/analytics/student/{studentId}", "Projects", "Get student project analytics.", response={"totalProjects": 1, "approvedProjects": 0, "pendingProjects": 1, "rejectedProjects": 0}, query={"studentId": 2}),

    ep("POST", "/certificates", "Certificates", "Create MongoDB certificate.", MONGO_SAMPLES["certificate"], MONGO_SAMPLES["certificate"]),
    ep("GET", "/certificates", "Certificates", "Get all certificates.", response=[MONGO_SAMPLES["certificate"]]),
    ep("GET", "/certificates/student/{studentId}", "Certificates", "Get certificates by student.", response=[MONGO_SAMPLES["certificate"]], query={"studentId": 2}),
    ep("GET", "/certificates/faculty/{facultyId}", "Certificates", "Get certificates by faculty.", response=[MONGO_SAMPLES["certificate"]], query={"facultyId": 2}),
    ep("PUT", "/certificates/{id}/verify?status=APPROVED&remarks=Verified", "Certificates", "Approve or reject certificate.", response={**MONGO_SAMPLES["certificate"], "status": "APPROVED", "remarks": "Verified"}, query={"id": MONGO_SAMPLES["certificate"]["id"], "status": "APPROVED", "remarks": "Verified"}),
    ep("PUT", "/certificates/{id}", "Certificates", "Update certificate.", {**MONGO_SAMPLES["certificate"], "category": "Cloud Computing"}, {**MONGO_SAMPLES["certificate"], "category": "Cloud Computing"}, query={"id": MONGO_SAMPLES["certificate"]["id"]}),
    ep("PUT", "/certificates/{id}/resubmit", "Certificates", "Resubmit certificate.", response={**MONGO_SAMPLES["certificate"], "status": "PENDING", "version": 2}, query={"id": MONGO_SAMPLES["certificate"]["id"]}),
    ep("DELETE", "/certificates/{id}", "Certificates", "Delete certificate.", response="Certificate deleted", query={"id": MONGO_SAMPLES["certificate"]["id"]}),

    ep("GET", "/deadline-rules", "Deadline Rules", "Get all deadline rules.", response=[MONGO_SAMPLES["deadline_rule"]]),
    ep("GET", "/deadline-rules/type/{type}", "Deadline Rules", "Get deadline rules by type.", response=[MONGO_SAMPLES["deadline_rule"]], query={"type": "Project"}),
    ep("POST", "/deadline-rules", "Deadline Rules", "Create or update deadline rule.", MONGO_SAMPLES["deadline_rule"], MONGO_SAMPLES["deadline_rule"]),
    ep("DELETE", "/deadline-rules/{id}", "Deadline Rules", "Delete deadline rule.", response="Deadline rule deleted", query={"id": MONGO_SAMPLES["deadline_rule"]["id"]}),

    ep("GET", "/admin/users", "Admin", "Admin: get all users.", response=[SQL_SAMPLES["admin_user"], SQL_SAMPLES["student_user"], SQL_SAMPLES["faculty_user"]]),
    ep("DELETE", "/admin/users/{id}", "Admin", "Admin: delete user.", response="User deleted successfully", query={"id": 42}),
    ep("GET", "/admin/projects", "Admin", "Admin: get all projects.", response=[MONGO_SAMPLES["project"]]),
    ep("GET", "/admin/certificates", "Admin", "Admin: get all certificates.", response=[MONGO_SAMPLES["certificate"]]),
    ep("GET", "/admin/dashboard", "Admin", "Admin: get dashboard counts.", response={"totalProjects": 1, "approvedProjects": 0, "pendingProjects": 1, "totalCertificates": 1}),
]


def pretty(value):
    if value is None:
        return "No request body"
    if isinstance(value, str):
        return value
    return json.dumps(value, indent=2, ensure_ascii=False)


def draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#5F6368"))
    canvas.drawString(inch * 0.65, 0.45 * inch, "ProjectHub API Documentation")
    canvas.drawRightString(A4[0] - inch * 0.65, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def make_pdf():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("CoverTitle", parent=styles["Title"], fontSize=24, leading=30, textColor=colors.HexColor("#17324D"), spaceAfter=12))
    styles.add(ParagraphStyle("Section", parent=styles["Heading1"], fontSize=16, leading=20, textColor=colors.HexColor("#17324D"), spaceBefore=14, spaceAfter=8))
    styles.add(ParagraphStyle("Endpoint", parent=styles["Heading2"], fontSize=11, leading=14, textColor=colors.HexColor("#0B5CAD"), spaceBefore=10, spaceAfter=4))
    styles.add(ParagraphStyle("BodySmall", parent=styles["BodyText"], fontSize=9, leading=12, alignment=TA_LEFT))
    code_style = ParagraphStyle("Code", fontName="Courier", fontSize=7.3, leading=9, leftIndent=6, rightIndent=6, spaceBefore=3, spaceAfter=5)

    doc = SimpleDocTemplate(
        str(PDF_OUT),
        pagesize=A4,
        rightMargin=0.6 * inch,
        leftMargin=0.6 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
    )
    story = []

    story.append(Paragraph("ProjectHub API Documentation", styles["CoverTitle"]))
    story.append(Paragraph("Module-wise endpoints with request and response JSON samples", styles["Heading2"]))
    story.append(Spacer(1, 8))
    summary = [
        ["Base URL", BASE_URL],
        ["Backend", "Spring Boot, MySQL demo database, MongoDB projecthub database"],
        ["MySQL source", "demo.sql: users, students, faculty, admin_settings, audit_logs"],
        ["MongoDB source", "Code models: projects, certificates, notifications, deadline_rules"],
        ["Test status", "Only DemoApplicationTests.contextLoads() exists. Module-wise API tests are not implemented."],
        ["Verification note", "mvnw.cmd test failed locally: Cannot start maven from wrapper."],
    ]
    table = Table(summary, colWidths=[1.45 * inch, 5.35 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EAF1F8")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#17324D")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.8),
        ("LEADING", (0, 0), (-1, -1), 11),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C8D3DF")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(table)
    story.append(Spacer(1, 12))

    module_order = []
    for item in ENDPOINTS:
        if item["module"] not in module_order:
            module_order.append(item["module"])

    toc_rows = [["Module", "Endpoint Count"]]
    for module in module_order:
        toc_rows.append([module, str(sum(1 for endpoint in ENDPOINTS if endpoint["module"] == module))])
    toc = Table(toc_rows, colWidths=[4.8 * inch, 2.0 * inch])
    toc.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C8D3DF")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFC")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(Paragraph("Module Summary", styles["Section"]))
    story.append(toc)
    story.append(PageBreak())

    for module in module_order:
        story.append(Paragraph(module, styles["Section"]))
        for endpoint in [item for item in ENDPOINTS if item["module"] == module]:
            story.append(Paragraph(f"{endpoint['method']} {endpoint['path']}", styles["Endpoint"]))
            detail = [
                ["Purpose", endpoint["purpose"]],
                ["Auth", endpoint["auth"]],
                ["Params", pretty(endpoint["queryOrPathParams"])],
            ]
            if endpoint["notes"]:
                detail.append(["Notes", endpoint["notes"]])
            detail_table = Table(detail, colWidths=[1.0 * inch, 5.8 * inch])
            detail_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F0F4F8")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("LEADING", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#D7DEE7")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(detail_table)
            story.append(Paragraph("Request JSON", styles["BodySmall"]))
            story.append(Preformatted(pretty(endpoint["requestJson"]), code_style))
            story.append(Paragraph("Response JSON", styles["BodySmall"]))
            story.append(Preformatted(pretty(endpoint["responseJson"]), code_style))
            story.append(Spacer(1, 4))
        story.append(PageBreak())

    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)


def make_urls_pdf():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("UrlTitle", parent=styles["Title"], fontSize=20, leading=24, textColor=colors.HexColor("#17324D"), spaceAfter=10))
    styles.add(ParagraphStyle("CellSmall", parent=styles["BodyText"], fontSize=7.5, leading=9))

    doc = SimpleDocTemplate(
        str(URLS_PDF_OUT),
        pagesize=A4,
        rightMargin=0.45 * inch,
        leftMargin=0.45 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
    )
    story = [
        Paragraph("ProjectHub API URL Table", styles["UrlTitle"]),
        Paragraph("API URL mattum thani tabulation", styles["BodyText"]),
        Spacer(1, 8),
    ]

    rows = [[
        Paragraph("S.No", styles["CellSmall"]),
        Paragraph("Module", styles["CellSmall"]),
        Paragraph("Method", styles["CellSmall"]),
        Paragraph("Reference", styles["CellSmall"]),
        Paragraph("API URL", styles["CellSmall"]),
    ]]
    for idx, endpoint in enumerate(ENDPOINTS, start=1):
        demo_url = resolve_demo_url(endpoint)
        rows.append([
            Paragraph(str(idx), styles["CellSmall"]),
            Paragraph(endpoint["module"], styles["CellSmall"]),
            Paragraph(endpoint["method"], styles["CellSmall"]),
            Paragraph(format_reference(endpoint), styles["CellSmall"]),
            Paragraph(demo_url, styles["CellSmall"]),
        ])

    table = Table(rows, colWidths=[0.38 * inch, 1.05 * inch, 0.52 * inch, 1.25 * inch, 3.9 * inch], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#C8D3DF")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7FAFC")]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(table)
    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)


def resolve_demo_url(endpoint):
    url = endpoint["url"]
    params = endpoint.get("queryOrPathParams") or {}
    replacements = {
        "{id}": params.get("id", SQL_SAMPLES["student_user"]["id"]),
        "{studentId}": params.get("studentId", SQL_SAMPLES["student_profile"]["id"]),
        "{facultyId}": params.get("facultyId", SQL_SAMPLES["faculty_profile"]["id"]),
        "{userId}": params.get("userId", SQL_SAMPLES["student_user"]["id"]),
        "{fileName}": params.get("fileName", "projecthub.pdf"),
        "{type}": params.get("type", "Project"),
    }
    for placeholder, value in replacements.items():
        if placeholder in url:
            url = url.replace(placeholder, str(value))
    return url


def format_reference(endpoint):
    params = endpoint.get("queryOrPathParams") or {}
    if not params:
        return "-"
    key_order = ["id", "studentId", "facultyId", "fileName", "type", "name", "role", "status", "technology", "subject"]
    parts = []
    for key in key_order:
        if key in params:
            parts.append(f"{key}={params[key]}")
    for key, value in params.items():
        if key not in key_order:
            parts.append(f"{key}={value}")
    return ", ".join(parts) if parts else "-"


def write_urls_files():
    url_rows = [
        {
            "sNo": idx,
            "module": endpoint["module"],
            "method": endpoint["method"],
            "reference": format_reference(endpoint),
            "apiUrl": resolve_demo_url(endpoint),
            "originalApiUrl": endpoint["url"],
        }
        for idx, endpoint in enumerate(ENDPOINTS, start=1)
    ]
    URLS_JSON_OUT.write_text(json.dumps(url_rows, indent=2, ensure_ascii=False), encoding="utf-8")
    csv_lines = ["S.No,Module,Method,Reference,API URL,Original API URL"]
    for row in url_rows:
        api_url = row["apiUrl"].replace('"', '""')
        original_api_url = row["originalApiUrl"].replace('"', '""')
        module = row["module"].replace('"', '""')
        reference = row["reference"].replace('"', '""')
        csv_lines.append(f'{row["sNo"]},"{module}",{row["method"]},"{reference}","{api_url}","{original_api_url}"')
    URLS_CSV_OUT.write_text("\n".join(csv_lines) + "\n", encoding="utf-8")
    make_urls_pdf()


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "project": "ProjectHub",
        "baseUrl": BASE_URL,
        "generatedFrom": {
            "mysql": "demo.sql",
            "mongodb": "Spring @Document models; live MongoDB export was not present in the workspace",
        },
        "testStatus": {
            "existingTests": ["DemoApplicationTests.contextLoads()"],
            "moduleWiseApiTests": False,
            "testRun": "mvnw.cmd test failed locally: Cannot start maven from wrapper",
        },
        "sqlSamples": SQL_SAMPLES,
        "mongoSamples": MONGO_SAMPLES,
        "modules": {},
    }
    for endpoint in ENDPOINTS:
        payload["modules"].setdefault(endpoint["module"], []).append(endpoint)

    JSON_OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    make_pdf()
    write_urls_files()
    print(f"Wrote {JSON_OUT}")
    print(f"Wrote {PDF_OUT}")
    print(f"Wrote {URLS_JSON_OUT}")
    print(f"Wrote {URLS_CSV_OUT}")
    print(f"Wrote {URLS_PDF_OUT}")


if __name__ == "__main__":
    main()
