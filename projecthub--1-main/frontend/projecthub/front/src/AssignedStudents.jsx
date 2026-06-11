import React, { useState, useEffect, useCallback } from "react";
import "./AssignedStudents.css";
import {
  LayoutDashboard, BookOpen, BadgeCheck, Bell, LogOut, User,
  Users, Search, Menu, Download, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://localhost:8081";

const AssignedStudents = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Faculty");
  const studentCacheKey = userId ? `assignedStudents:${userId}` : "assignedStudents";
  const projectCacheKey = userId ? `assignedProjects:${userId}` : "assignedProjects";

  const [students, setStudents] = useState(() => {
    try {
      const cached = sessionStorage.getItem(studentCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [projects, setProjects] = useState(() => {
    try {
      const cached = sessionStorage.getItem(projectCacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => students.length === 0);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedSection, setSelectedSection] = useState("All Sections");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sectionOptions = ["All Sections", "A", "B"];
  const getDisplaySection = (student) => {
    const section = String(student?.section || "").trim().toUpperCase();
    if (section === "A" || section === "B") return section;
    return "A";
  };

  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const studentRequest = fetch(`${API}/users/faculty/${userId}/students`, { headers })
        .then(async (res) => {
          if (!res.ok) return [];
          const data = await res.json();
          setStudents(data);
          sessionStorage.setItem(studentCacheKey, JSON.stringify(data));
          setLoading(false);
          return data;
        });

      const projectRequest = fetch(`${API}/projects/mongo/faculty/${userId}`, { headers })
        .then(async (res) => {
          if (!res.ok) return [];
          const data = await res.json();
          setProjects(data);
          sessionStorage.setItem(projectCacheKey, JSON.stringify(data));
          return data;
        });

      const [studentData, projectData] = await Promise.all([studentRequest, projectRequest]);
      setLoading(false);
      return { students: studentData, projects: projectData };
    } catch (error) { console.error("Fetch assigned students error:", error); }
    setLoading(false);
    return { students: [], projects: [] };
  }, [token, userId, studentCacheKey, projectCacheKey]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchData();
  }, [token, userId, navigate, fetchData]);

  // Get project status for each student
  const getStudentProjectStatus = (studentUserId) => {
    const studentProjects = projects.filter(p => String(p.studentId) === String(studentUserId));
    if (studentProjects.length === 0) return "no-submission";
    const hasApproved = studentProjects.some(p => p.status?.toLowerCase() === "approved");
    if (hasApproved) return "approved";
    const hasPending = studentProjects.some(p => ["pending", "resubmitted"].includes(p.status?.toLowerCase()));
    if (hasPending) return "submitted";
    return "submitted";
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const name = student.user?.fullName || "";
    const code = student.studentCode || "";
    const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    const matchDept = selectedDepartment === "All Departments" ? true : (student.department || "") === selectedDepartment;
    if (!matchDept) return false;

    const matchSection = selectedSection === "All Sections" ? true : getDisplaySection(student) === selectedSection;
    if (!matchSection) return false;

    const status = getStudentProjectStatus(student.user?.id);
    if (activeTab === "all") return true;
    if (activeTab === "submitted") return status === "submitted";
    if (activeTab === "approved") return status === "approved";
    if (activeTab === "no-submission") return status === "no-submission";
    return true;
  });

  // Counts
  const allCount = students.length;
  const submittedCount = students.filter(s => getStudentProjectStatus(s.user?.id) === "submitted").length;
  const approvedCount = students.filter(s => getStudentProjectStatus(s.user?.id) === "approved").length;
  const noSubmissionCount = students.filter(s => getStudentProjectStatus(s.user?.id) === "no-submission").length;

  // Export
  const exportPDF = async () => {
    const latestStudents = await fetchData();
    const exportStudents = Array.isArray(latestStudents?.students) ? latestStudents.students : filteredStudents;
    const exportProjects = Array.isArray(latestStudents?.projects) ? latestStudents.projects : projects;
    const getExportStatus = (studentUserId) => {
      const studentProjects = exportProjects.filter(p => String(p.studentId) === String(studentUserId));
      if (studentProjects.length === 0) return "No Submission";
      if (studentProjects.some(p => p.status?.toLowerCase() === "approved")) return "Approved";
      return "Submitted";
    };

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Assigned Students Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Faculty: ${fullName}`, 14, 28);
    doc.text(`Tab: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 14, 34);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    const tableData = exportStudents.map((student, idx) => [
      idx + 1,
      student.user?.fullName || "-",
      student.studentCode || "-",
      student.department || "-",
      getDisplaySection(student),
      getExportStatus(student.user?.id)
    ]);

    autoTable(doc, {
      startY: 48,
      head: [["#", "Name", "Student Code", "Department", "Section", "Status"]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [31, 36, 48], textColor: [245, 193, 91] }
    });

    doc.save(`assigned_students_${activeTab}.pdf`);
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="faculty-page assigned-page">

      {/* MOBILE HAMBURGER */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="logo">
            <div className="logo-box">🎓</div>
            <h2>ProjectHub<span>+</span></h2>
          </div>
          <div className="menu">
            <div className="menu-item" onClick={() => navigate("/faculty-dashboard")}><LayoutDashboard size={20} /><span>Dashboard</span></div>
            <div className="menu-item" onClick={() => navigate("/review-projects")}><BookOpen size={20} /><span>Review Projects</span></div>
            <div className="menu-item active"><Users size={20} /><span>Assigned Students</span></div>
            <div className="menu-item" onClick={() => navigate("/verify-certificates")}><BadgeCheck size={20} /><span>Verify Certificates</span></div>
            <div className="menu-item" onClick={() => navigate("/faculty-profile")}><User size={20} /><span>Profile</span></div>
            <div className="menu-item" onClick={() => navigate("/faculty-notifications")}><Bell size={20} /><span>Notifications</span></div>
          </div>
        </div>
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text"><h4>{fullName}</h4><p>Faculty</p></div>
          </div>
          <div className="logout" onClick={handleLogout}><LogOut size={18} /><span>Sign Out</span></div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="assigned-main">
        <div className="assigned-header">
          <div>
            <h1>Assigned Students</h1>
            <p>View students assigned to you and their submission status.</p>
          </div>
          <button className="export-btn" onClick={exportPDF}>
            <Download size={18} /> Export PDF
          </button>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={activeTab === "all" ? "tab active" : "tab"} onClick={() => setActiveTab("all")}>
            All <span className="tab-count">{allCount}</span>
          </button>
          <button className={activeTab === "submitted" ? "tab active" : "tab"} onClick={() => setActiveTab("submitted")}>
            Submitted <span className="tab-count">{submittedCount}</span>
          </button>
          <button className={activeTab === "approved" ? "tab active" : "tab"} onClick={() => setActiveTab("approved")}>
            Approved <span className="tab-count">{approvedCount}</span>
          </button>
          <button className={activeTab === "no-submission" ? "tab active" : "tab"} onClick={() => setActiveTab("no-submission")}>
            No Submission <span className="tab-count">{noSubmissionCount}</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="assigned-filters">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by name or student code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="dept-filter" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option>All Departments</option>
            <option>CSE</option>
            <option>IT</option>
            <option>ECE</option>
            <option>AIDS</option>
            <option>MECH</option>
          </select>
          <select className="section-filter" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            {sectionOptions.map((section) => (
              <option key={section}>{section}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Student Code</th>
                <th>Department</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="6" className="empty-row">{loading ? "Loading..." : "No students found."}</td></tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const status = getStudentProjectStatus(student.user?.id);
                  return (
                    <tr key={student.id}>
                      <td>{idx + 1}</td>
                      <td>{student.user?.fullName || "-"}</td>
                      <td>{student.studentCode || "-"}</td>
                      <td>{student.department || "-"}</td>
                      <td>{getDisplaySection(student)}</td>
                      <td>
                        <span className={`status-badge ${status}`}>
                          {status === "no-submission" ? "No Submission" : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AssignedStudents;
