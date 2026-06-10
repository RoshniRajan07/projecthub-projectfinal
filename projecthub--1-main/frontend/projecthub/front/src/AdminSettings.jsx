import React, { useEffect, useState, useCallback } from "react";
import "./AdminSettings.css";
import "./AdminDashboard.css";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Clock,
  User,
  Calendar,
  FileText,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8081";

const AdminSettings = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Admin");

  const [deadlineRules, setDeadlineRules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({ maxFileSize: 25, maxResubmissions: 3, submissionDeadline: "", allowedFileTypes: "PDF, ZIP, DOC, DOCX" });
  const [faculty, setFaculty] = useState([]);
  const [assignForm, setAssignForm] = useState({ facultyId: "", subject: "" });
  const [studentAssignFacultyId, setStudentAssignFacultyId] = useState("");
  const [studentAssignDepartments, setStudentAssignDepartments] = useState([]);
  const [studentAssignSection, setStudentAssignSection] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [assigningStudents, setAssigningStudents] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [deadlineForm, setDeadlineForm] = useState({
    type: "Project",
    name: "Machine Learning",
    deadline: "",
    resubmissions: 3
  });

  const projectSubjects = ["Machine Learning", "Web Development", "Blockchain", "IoT"];
  const sectionOptions = ["", "A", "B"];
  const departmentOptions = ["CSE", "IT", "ECE", "AIDS", "MECH"];
  const studentAssignDept = studentAssignDepartments[0] || "";
  const setStudentAssignDept = (department) => setStudentAssignDepartments(department ? [department] : []);
  const certificateCategories = ["Cloud", "Frontend", "Backend", "AI/ML", "DevOps"];
  const deadlineOptions = deadlineForm.type === "Project" ? projectSubjects : certificateCategories;

  const fetchDeadlineRules = useCallback(async () => {
    try {
      const res = await fetch(`${API}/deadline-rules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeadlineRules(data);
        return data;
      }
    } catch (error) { console.error("Deadline rules fetch error:", error); }
    return [];
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.slice(-10).reverse());
        return data;
      }
    } catch (error) { console.error("Audit logs fetch error:", error); }
    return [];
  }, [token]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setSettings({
            maxFileSize: data[0].maxFileSize || 25,
            maxResubmissions: data[0].maxResubmissions || 3,
            submissionDeadline: data[0].submissionDeadline || "",
            allowedFileTypes: data[0].allowedFileTypes || "PDF, ZIP, DOC, DOCX"
          });
        }
        return data;
      }
    } catch (error) { console.error("Settings fetch error:", error); }
    return [];
  }, [token]);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/filter/role?role=FACULTY`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaculty(data);
        return data;
      }
    } catch (error) { console.error("Faculty fetch error:", error); }
    return [];
  }, [token]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchDeadlineRules();
    fetchAuditLogs();
    fetchSettings();
    fetchFaculty();
  }, [token, userId, navigate, fetchDeadlineRules, fetchAuditLogs, fetchSettings, fetchFaculty]);

  const saveDeadlineRule = async () => {
    if (!deadlineForm.name || !deadlineForm.deadline) {
      alert("Please select name and deadline");
      return;
    }
    try {
      const res = await fetch(`${API}/deadline-rules`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: deadlineForm.type,
          name: deadlineForm.name,
          deadline: deadlineForm.deadline,
          resubmissions: Number(deadlineForm.resubmissions),
          status: "Active"
        })
      });
      if (res.ok) {
        await fetchDeadlineRules();
        setDeadlineForm({ ...deadlineForm, deadline: "", resubmissions: 3 });
      }
    } catch (error) { console.error("Save deadline error:", error); }
  };

  const saveSettings = async () => {
    try {
      const res = await fetch(`${API}/users/settings`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          maxFileSize: Number(settings.maxFileSize),
          maxResubmissions: Number(settings.maxResubmissions),
          submissionDeadline: settings.submissionDeadline,
          allowedFileTypes: settings.allowedFileTypes
        })
      });
      if (res.ok) await fetchSettings();
      if (res.ok) alert("Settings saved ✅");
      else alert("Failed to save settings");
    } catch (error) { console.error("Save settings error:", error); }
  };

  const handleAssignFaculty = async () => {
    if (!assignForm.facultyId || !assignForm.subject) {
      alert("Please select faculty and subject");
      return;
    }
    try {
      const res = await fetch(`${API}/users/assign-faculty/${assignForm.facultyId}?subject=${assignForm.subject}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await fetchFaculty();
      if (res.ok) alert("Faculty assigned ✅");
      else alert("Failed to assign faculty");
    } catch (error) { console.error("Assign faculty error:", error); }
  };

  const handleAssignStudentsByDept = async () => {
    if (!studentAssignDept || !studentAssignFacultyId) {
      alert("Please select a department and a faculty member.");
      return;
    }

    const destFaculty = faculty.find((f) => String(f.id) === String(studentAssignFacultyId));
    if (!destFaculty) {
      alert("Selected faculty not found. Please refresh and try again.");
      return;
    }

    setAssigningStudents(true);
    try {
      const url = new URL(`${API}/users/admin/assign-students-by-department`);
      url.searchParams.append("department", studentAssignDept);
      if (studentAssignSection) url.searchParams.append("section", studentAssignSection);
      url.searchParams.append("facultyUserId", studentAssignFacultyId);
      const res = await fetch(url.toString(), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const assigned = await res.json();
        alert(`✅ ${assigned.length} student(s) from ${studentAssignDept} assigned to ${destFaculty.fullName}`);
        setStudentAssignDept("");
        setStudentAssignFacultyId("");
      } else {
        alert("Failed to assign students");
      }
    } catch (error) {
      console.error("Assign students error:", error);
      alert("Failed to assign students. Please check the console.");
    }
    setAssigningStudents(false);
  };

  const handleAssignStudentsByDepartments = async () => {
    if (studentAssignDepartments.length === 0 || !studentAssignFacultyId) {
      alert("Please select at least one department and a faculty member.");
      return;
    }

    const destFaculty = faculty.find((f) => String(f.id) === String(studentAssignFacultyId));
    if (!destFaculty) {
      alert("Selected faculty not found. Please refresh and try again.");
      return;
    }

    setAssigningStudents(true);
    try {
      const assignedResults = await Promise.all(studentAssignDepartments.map(async (department) => {
        const url = new URL(`${API}/users/admin/assign-students-by-department`);
        url.searchParams.append("department", department);
        if (studentAssignSection) url.searchParams.append("section", studentAssignSection);
        url.searchParams.append("facultyUserId", studentAssignFacultyId);
        const res = await fetch(url.toString(), {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Failed to assign ${department}`);
        return res.json();
      }));
      const totalAssigned = assignedResults.reduce((sum, assigned) => sum + assigned.length, 0);
      alert(`Assigned ${totalAssigned} student(s) from ${studentAssignDepartments.join(", ")} to ${destFaculty.fullName}`);
      setStudentAssignDepartments([]);
      setStudentAssignFacultyId("");
      setStudentAssignSection("");
    } catch (error) {
      console.error("Assign students error:", error);
      alert("Failed to assign students. Please check the console.");
    }
    setAssigningStudents(false);
  };

  const toggleStudentAssignDepartment = (department) => {
    setStudentAssignDepartments((currentDepartments) => (
      currentDepartments.includes(department)
        ? currentDepartments.filter((item) => item !== department)
        : [...currentDepartments, department]
    ));
  };

  const refreshSettingsPage = async () => {
    await Promise.all([fetchDeadlineRules(), fetchAuditLogs(), fetchSettings(), fetchFaculty()]);
  };

  const refreshAndNavigate = async (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/");
  };

  const formatDeadline = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "";
    const now = new Date();
    const date = new Date(createdAt);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="settings-page">

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="logo">
            <div className="logo-box">🎓</div>
            <h2 className="settings-logo-title">ProjectHub<span>+</span></h2>
          </div>
          <div className="menu">
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-dashboard")}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/manage-users")}>
              <Users size={20} /><span>Manage Users</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/view-submissions")}>
              <FileText size={20} /><span>View Submissions</span>
            </div>
            <div className="menu-item active" onClick={refreshSettingsPage}>
              <Settings size={20} /><span>Settings</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-profile")}>
              <User size={20} /><span>Profile</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-notifications")}>
              <Bell size={20} /><span>Notifications</span>
            </div>
          </div>
        </div>
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text"><h4>{fullName}</h4><p>Admin</p></div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="settings-main">

        <div className="settings-header">
          <div>
            <h1>System Settings</h1>
            <p>Configure submission rules, deadlines, and system preferences.</p>
          </div>
        </div>

        {/* GENERAL SUBMISSION RULES */}
        <div className="settings-card">
          <h2>General Submission Rules</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label>Max File Size (MB)</label>
              <input type="number" value={settings.maxFileSize} onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Allowed File Types</label>
              <input type="text" value={settings.allowedFileTypes} onChange={(e) => setSettings({ ...settings, allowedFileTypes: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Max Resubmissions</label>
              <input type="number" value={settings.maxResubmissions} onChange={(e) => setSettings({ ...settings, maxResubmissions: e.target.value })} />
            </div>
          </div>
          <button className="assign-btn" onClick={saveSettings}>Save Settings</button>
        </div>

        {/* DEADLINE MANAGER */}
        <div className="settings-card">
          <div className="deadline-header">
            <div>
              <h2>Subject & Certificate Deadlines</h2>
              <p className="sub-text">Set separate deadlines for project subjects and certificate categories.</p>
            </div>
          </div>

          <div className="deadline-form-grid">
            <div className="form-group">
              <label>Deadline Type</label>
              <div className="select-box">
                <select value={deadlineForm.type} onChange={(e) => { setDeadlineForm({ ...deadlineForm, type: e.target.value, name: e.target.value === "Project" ? projectSubjects[0] : certificateCategories[0] }); }}>
                  <option>Project</option>
                  <option>Certificate</option>
                </select>
                <ChevronDown size={20} />
              </div>
            </div>

            <div className="form-group">
              <label>{deadlineForm.type === "Project" ? "Subject" : "Certificate Category"}</label>
              <div className="select-box">
                <select value={deadlineForm.name} onChange={(e) => { setDeadlineForm({ ...deadlineForm, name: e.target.value }); }}>
                  {deadlineOptions.map((item) => (<option key={item}>{item}</option>))}
                </select>
                <ChevronDown size={20} />
              </div>
            </div>

            <div className="form-group">
              <label>Submission Deadline</label>
              <div className="date-input-wrapper">
                <input type="date" id="deadlineDateInput" value={deadlineForm.deadline} onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline: e.target.value })} />
                <Calendar size={18} className="date-icon" onClick={() => { document.getElementById('deadlineDateInput').showPicker(); }} />
              </div>
            </div>

            <div className="form-group">
              <label>Max Resubmissions</label>
              <input type="number" min="0" value={deadlineForm.resubmissions} onChange={(e) => setDeadlineForm({ ...deadlineForm, resubmissions: e.target.value })} />
            </div>
          </div>

          <button className="assign-btn" onClick={saveDeadlineRule}>Save Deadline</button>

          <div className="deadline-table-wrapper">
            <table className="deadline-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Subject / Category</th>
                  <th>Deadline</th>
                  <th>Resubmissions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deadlineRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.type}</td>
                    <td>{rule.name}</td>
                    <td>{formatDeadline(rule.deadline)}</td>
                    <td>{rule.resubmissions}</td>
                    <td><span className="deadline-status">{rule.status}</span></td>
                  </tr>
                ))}
                {deadlineRules.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: "center", color: "#888" }}>No deadline rules yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FACULTY ASSIGNMENT */}
        <div className="settings-card">
          <h2>Faculty Assignment</h2>
          <p className="sub-text">Assign faculty to a subject.</p>
          <div className="settings-grid">
            <div className="form-group">
              <label>Faculty Member</label>
              <div className="select-box">
                <select value={assignForm.facultyId} onChange={(e) => { setAssignForm({ ...assignForm, facultyId: e.target.value }); }}>
                  <option value="">Select faculty</option>
                  {faculty.map((f) => (<option key={f.id} value={f.id}>{f.fullName}</option>))}
                </select>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <div className="select-box">
                <select value={assignForm.subject} onChange={(e) => { setAssignForm({ ...assignForm, subject: e.target.value }); }}>
                  <option value="">Select subject</option>
                  {projectSubjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          <button className="assign-btn" onClick={handleAssignFaculty}>Assign Faculty to Subject</button>

          {/* Show current faculty-subject mapping */}
          {faculty.filter(f => f.assignedSubject).length > 0 && (
            <div className="deadline-table-wrapper" style={{ marginTop: "16px" }}>
              <table className="deadline-table">
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Assigned Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.filter(f => f.assignedSubject).map(f => (
                    <tr key={f.id}>
                      <td>{f.fullName}</td>
                      <td><span className="deadline-status">{f.assignedSubject}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* STUDENT ASSIGNMENT BY DEPARTMENT */}
        <div className="settings-card">
          <h2>Student Assignment</h2>
          <p className="sub-text">Assign all students in a department to the selected faculty member.</p>
          <div className="settings-grid">
            <div className="form-group">
              <label>Faculty Member</label>
              <div className="select-box">
                <select value={studentAssignFacultyId} onChange={(e) => setStudentAssignFacultyId(e.target.value)}>
                  <option value="">Select faculty</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>{f.fullName}</option>
                  ))}
                </select>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <div className="check-dropdown">
                <button
                  type="button"
                  className="check-dropdown-btn"
                  onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                >
                  <span>{studentAssignDepartments.length > 0 ? studentAssignDepartments.join(", ") : "Select department"}</span>
                  <ChevronDown size={20} />
                </button>
                {showDeptDropdown && (
                  <div className="check-dropdown-menu" role="group" aria-label="Select department">
                    {departmentOptions.map((department) => (
                      <label
                        key={department}
                        className={`department-check ${studentAssignDepartments.includes(department) ? "selected" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={studentAssignDepartments.includes(department)}
                          onChange={() => toggleStudentAssignDepartment(department)}
                        />
                        <span>{department}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Section</label>
              <div className="select-box">
                <select value={studentAssignSection} onChange={(e) => setStudentAssignSection(e.target.value)}>
                  <option value="">All Sections</option>
                  {sectionOptions.filter((section) => section).map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          <button className="assign-btn" onClick={handleAssignStudentsByDepartments} disabled={assigningStudents}>
            {assigningStudents ? "Assigning..." : "Assign Students to Faculty"}
          </button>
        </div>

        {/* AUDIT LOG */}
        <div className="settings-card audit-card">
          <div className="audit-header">
            <div className="audit-title">
              <ShieldCheck size={22} className="audit-icon" />
              <h2>Audit Log</h2>
            </div>
          </div>
          <div className="audit-list">
            {auditLogs.length === 0 ? (
              <p style={{ color: "#888", padding: "1rem" }}>No audit logs yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div className="audit-item" key={log.id}>
                  <div className="audit-left">
                    <Clock size={18} className="audit-clock" />
                    <div>
                      <span className="audit-item-title">{log.actionTitle}</span>
                      <p className="audit-item-desc">{log.description}</p>
                    </div>
                  </div>
                  <span className="audit-time">{formatTime(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminSettings;
