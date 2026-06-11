import React, { useState, useEffect, useCallback } from "react";
import "./SubmitProject.css";
import {
  LayoutDashboard,
  Upload,
  Award,
  User,
  Bell,
  LogOut,
  Download,
  ChevronDown,
  Eye,
  RotateCcw,
  X,
  Pencil,
  Trash2,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import ConfirmToast from "./ConfirmToast";
import Toast from "./Toast";

const API = "http://localhost:8081";

export default function SubmitProject() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Student";

  const [activeTab, setActiveTab] = useState("new");
  const [viewModal, setViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [formMode, setFormMode] = useState("new");
  const [editingProject, setEditingProject] = useState(null);

  const [projectTitle, setProjectTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [abstract, setAbstract] = useState("");
  const [technology, setTechnology] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [submissions, setSubmissions] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ open: true, message, type });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [deadlineRules, setDeadlineRules] = useState([]);
  const [maxResubmissions] = useState(3);

  const fetchProjects = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${API}/projects/mongo/student/${userId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
        return data;
      }
    } catch (err) { console.error(err); }
    return [];
  }, [token, userId]);

  const fetchFaculty = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${API}/users/filter/role?role=FACULTY`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data); // [{id, fullName, ...}]
        return data;
      }
    } catch (err) { console.error(err); }
    return [];
  }, [token]);

  const fetchDeadlineRules = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const res = await fetch(`${API}/deadline-rules/type/Project`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDeadlineRules(data);
        return data;
      }
    } catch (err) { console.error(err); }
    return [];
  }, [token]);

  // Fetch data on mount
  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchProjects();
    fetchFaculty();
    fetchDeadlineRules();
  }, [token, userId, navigate, fetchProjects, fetchFaculty, fetchDeadlineRules]);

  const visibleSubmissions = [...submissions]
    .sort((a, b) => {
      const versionDiff = (b.version || 1) - (a.version || 1);
      if (versionDiff !== 0) return versionDiff;
      return new Date(b.updatedDate || b.submittedDate || 0) - new Date(a.updatedDate || a.submittedDate || 0);
    })
    .filter((item, index, list) =>
      index === list.findIndex((other) =>
        `${other.title || ""}|${other.subject || ""}|${other.technology || ""}` ===
        `${item.title || ""}|${item.subject || ""}|${item.technology || ""}`
      )
    );

  const selectedDeadline = deadlineRules.find(
    (rule) => rule.name === subject && rule.status === "Active"
  );

  const formatDeadline = (value) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const getProjectLastDate = (item) =>
    item.lastSubmissionDate ||
    deadlineRules.find((rule) =>
      rule.type?.toLowerCase() === "project" &&
      rule.status?.toLowerCase() === "active" &&
      rule.name?.trim().toLowerCase() === item.subject?.trim().toLowerCase()
    )?.deadline;
  const formatLastDate = (item) => getProjectLastDate(item) ? formatDeadline(getProjectLastDate(item)) : "Not set";

  const getDaysLeft = (value) => {
    const today = new Date();
    const deadline = new Date(value);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  };

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const getResubmissionLimit = (item) => {
    const rule = deadlineRules.find((deadline) =>
      deadline.name === item.subject && deadline.status === "Active"
    );
    const ruleLimit = rule?.resubmissions !== undefined ? Number(rule.resubmissions) : maxResubmissions;
    return Math.min(ruleLimit, maxResubmissions);
  };

  const canResubmit = (item) => Math.max(0, (item.version || 1) - 1) < getResubmissionLimit(item);

  const notifyFaculty = async (facultyId, projectName, mode) => {
    if (!facultyId) return;
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await fetch(`${API}/users/notifications`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(facultyId),
          role: "FACULTY",
          title: mode === "edit" ? "Project Updated" : mode === "resubmit" ? "Project Resubmitted" : "New Project Submitted",
          message: `${fullName} ${mode === "edit" ? "updated" : mode === "resubmit" ? "resubmitted" : "submitted"} "${projectName}" for review.`,
          type: "info"
        })
      });
    } catch (error) {
      console.error("Faculty notification error:", error);
    }
  };

  const resetForm = () => {
    setProjectTitle("");
    setSubject("");
    setAbstract("");
    setTechnology("");
    setGithubUrl("");
    setSelectedFaculty("");
    setFile(null);
    setErrors({});
    setEditingProject(null);
    setFormMode("new");
  };

  const getLatestProject = async (id) => {
    const latest = await fetchProjects();
    return latest.find((item) => item.id === id) || submissions.find((item) => item.id === id);
  };

  const getStudentStatus = (status) => {
    const normalized = status?.toLowerCase() || "pending";
    return normalized === "resubmitted" ? "pending" : normalized;
  };

  const canDownloadFeedback = (status) => ["approved", "rejected"].includes(status?.toLowerCase());

  const openNewSubmission = async () => {
    await Promise.all([fetchFaculty(), fetchDeadlineRules()]);
    setActiveTab("new");
    if (formMode === "new") resetForm();
  };

  const openSubmissionHistory = async () => {
    await fetchProjects();
    setActiveTab("history");
  };

  const handleViewProject = async (project) => {
    const latestProject = await getLatestProject(project.id) || project;
    setSelectedProject(latestProject);
    setViewModal(true);
  };

  const deleteProjectItems = async (items) => {
    setDeleting(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await Promise.all(items.map((project) =>
        fetch(`${API}/projects/mongo/${project.id}`, { method: "DELETE", headers })
      ));
      const deletedIds = items.map((project) => project.id);
      setSubmissions((prev) => prev.filter((item) => !deletedIds.includes(item.id)));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteProject = async (project) => {
    const latestProject = await getLatestProject(project.id) || project;
    setDeleteConfirm({
      title: "Delete project?",
      message: `Delete "${latestProject.title}"? This cannot be undone.`,
      items: [latestProject],
    });
  };

  const handleDownloadFeedback = async (project) => {
    const latestProject = await getLatestProject(project.id) || project;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Faculty Feedback Report", 20, 20);
    doc.setFontSize(13);
    doc.text(`Project : ${latestProject.title}`, 20, 50);
    doc.text(`Subject : ${latestProject.subject}`, 20, 65);
    doc.text(`Technology : ${latestProject.technology}`, 20, 80);
    doc.text(`Status : ${latestProject.status}`, 20, 95);
    doc.text("Faculty Feedback", 20, 125);
    doc.text(latestProject.feedback || "No feedback yet.", 20, 145);
    doc.save(`${latestProject.title}_Feedback.pdf`);
  };

  const handleDownloadProjectFile = async (project) => {
    const latestProject = await getLatestProject(project.id) || project;
    if (!latestProject.fileName) { showToast("File not found"); return; }
    try {
      const res = await fetch(`${API}/projects/download/${latestProject.fileName}`);
      if (!res.ok) { showToast("Download failed"); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = latestProject.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed");
    }
  };

  const handleOpenEdit = async (item) => {
    const latestItem = await getLatestProject(item.id) || item;
    setEditingProject(latestItem);
    setProjectTitle(latestItem.title);
    setSubject(latestItem.subject);
    setAbstract(latestItem.abstractText || "");
    setTechnology(latestItem.technology);
    setGithubUrl(latestItem.githubUrl || "");
    setSelectedFaculty(latestItem.facultyId?.toString() || "");
    setFile(null);
    setErrors({});
    setFormMode("edit");
    setActiveTab("new");
  };

  const handleResubmit = async (item) => {
    try {
      const latestItem = await getLatestProject(item.id) || item;
      if (!canResubmit(latestItem)) {
        showToast(`Maximum resubmission limit reached (${getResubmissionLimit(latestItem)}).`, "warning");
        return;
      }
      setEditingProject(latestItem);
      setProjectTitle(latestItem.title);
      setSubject(latestItem.subject);
      setAbstract(latestItem.abstractText || "");
      setTechnology(latestItem.technology);
      setGithubUrl(latestItem.githubUrl || "");
      setSelectedFaculty(latestItem.facultyId?.toString() || "");
      setFile(null);
      setErrors({});
      setFormMode("resubmit");
      setActiveTab("new");
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    if (!projectTitle || !subject || !abstract || !technology || !selectedFaculty) {
      setErrors({ message: "All fields are required" });
      return;
    }
    if (formMode !== "edit" && !file) {
      setErrors({ message: "File upload is required" });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Step 1: Upload file if selected
      let fileName = editingProject?.fileName || "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${API}/projects/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        if (!uploadRes.ok) { setErrors({ message: "File upload failed" }); setSubmitting(false); return; }
        fileName = await uploadRes.text();
      }

      // Find selected faculty details
      const faculty = facultyList.find(f => f.id.toString() === selectedFaculty);

      // Step 2: Save/Update project metadata in MongoDB
      const projectData = {
        title: projectTitle,
        subject,
        abstractText: abstract,
        technology,
        githubUrl,
        studentId: parseInt(userId),
        studentName: fullName,
        facultyId: faculty ? faculty.id : parseInt(selectedFaculty),
        facultyName: faculty ? faculty.fullName : "",
        fileName,
        fileURL: `${API}/projects/download/${fileName}`,
        status: formMode === "resubmit" ? "RESUBMITTED" : "PENDING",
        submittedDate: formMode === "resubmit" ? todayISO() : editingProject?.submittedDate || todayISO(),
        updatedDate: todayISO()
      };

      let res;
      const headers = { Authorization: `Bearer ${token}` };
      if ((formMode === "edit" || formMode === "resubmit") && editingProject) {
        res = await fetch(`${API}/projects/mongo/update/${editingProject.id}`, {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(projectData)
        });
      } else {
        res = await fetch(`${API}/projects/mongo`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(projectData)
        });
      }

      if (!res.ok) {
        const err = await res.json();
        setErrors({ message: err.message || "Submission failed" });
        setSubmitting(false);
        return;
      }

      // Success
      await notifyFaculty(projectData.facultyId, projectTitle, formMode);
      resetForm();
      await fetchProjects();
      setActiveTab("history");
    } catch {
      setErrors({ message: "Server error. Please try again." });
    }
    setSubmitting(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="submit-page">

      {/* MOBILE HAMBURGER */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="logo">
            <div className="logo-box">🎓</div>
            <h2>ProjectHub+</h2>
          </div>
          <div className="menu">
            <div className="menu-item" onClick={() => navigate("/dashboard")}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </div>
            <div className="menu-item active">
              <Upload size={20} /><span>Submit Project</span>
            </div>
            <div className="menu-item" onClick={() => navigate("/certificates")}>
              <Award size={20} /><span>Certificates</span>
            </div>
            <div className="menu-item" onClick={() => navigate("/profile")}>
              <User size={20} /><span>Profile</span>
            </div>
            <div className="menu-item" onClick={() => navigate("/notifications")}>
              <Bell size={20} /><span>Notifications</span>
            </div>
          </div>
        </div>
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text">
              <h4>{fullName}</h4>
              <p>Student</p>
            </div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="submit-main">

        <div className="top-header">
          <div>
            <h1>Submit Project</h1>
            <p>Upload and manage your project submissions.</p>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "new" ? "active" : ""}`}
            onClick={openNewSubmission}
          >
            {formMode === "edit" ? "Edit Project" : formMode === "resubmit" ? "Resubmit Project" : "New Submission"}
          </button>
          <button
            className={`tab ${activeTab === "history" ? "active" : ""}`}
            onClick={openSubmissionHistory}
          >
            Submission History
          </button>
        </div>

        {/* FORM */}
        {activeTab === "new" && (
          <div className="form-card">

            {formMode === "edit" && editingProject && (
              <div style={{ background: "#fffaf0", border: "1px solid #ead7ad", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "14px", color: "#b98a2e" }}>
                ✏️ Editing: <strong>{editingProject.title}</strong> — Update the fields below and save.
              </div>
            )}

            {formMode === "resubmit" && editingProject && (
              <div style={{ background: "#fff8e1", border: "1px solid #f0c040", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", fontSize: "14px", color: "#7a5800" }}>
                🔄 Resubmitting: <strong>{editingProject.title}</strong> — Edit your details and upload a new file.
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Project Title *</label>
                <input type="text" placeholder="Enter project title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <div className="select-box">
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Select Subject</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="IoT">IoT</option>
                  </select>
                  <ChevronDown size={18} />
                </div>
                {selectedDeadline && (
                  <div className={getDaysLeft(selectedDeadline.deadline) < 0 ? "deadline-hint closed" : "deadline-hint"}>
                    Deadline: {formatDeadline(selectedDeadline.deadline)}
                    {" · "}
                    {getDaysLeft(selectedDeadline.deadline) < 0 ? "Closed" : `${getDaysLeft(selectedDeadline.deadline)} days left`}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Abstract *</label>
              <textarea placeholder="Describe your project..." value={abstract} onChange={(e) => setAbstract(e.target.value)}></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Technology Used *</label>
                <input type="text" placeholder="React, Python" value={technology} onChange={(e) => setTechnology(e.target.value)} />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input type="url" placeholder="https://github.com/username/repo" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Select Faculty *</label>
                <div className="select-box">
                  <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
                    <option value="">Select Faculty</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>{f.fullName}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Upload Files {formMode === "edit" ? "(optional — leave empty to keep existing)" : "*"}</label>
              <label htmlFor="fileUpload" className="upload-box">
                <input type="file" id="fileUpload" hidden onChange={(e) => setFile(e.target.files[0])} />
                <Upload size={40} />
                <p className="upload-text">Click to upload your files</p>
                <span className="upload-subtext">PDF / ZIP / DOC</span>
                {file && <div className="selected-file">{file.name}</div>}
                {!file && formMode === "edit" && editingProject?.fileName && (
                  <div className="selected-file" style={{ color: "#6b7280" }}>Current: {editingProject.fileName}</div>
                )}
              </label>
            </div>

            {errors.message && <div className="top-error">{errors.message}</div>}

            <div className="submit-actions">
              <button className="cancel-btn" onClick={() => { resetForm(); openSubmissionHistory(); }}>Cancel</button>
              <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : formMode === "edit" ? "Save Changes" : formMode === "resubmit" ? "Resubmit Project" : "Submit Project"}
              </button>
            </div>

          </div>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <div className="history-list">
            {visibleSubmissions.length === 0 && <p style={{ padding: "1rem", color: "#888" }}>No submissions yet.</p>}

            {visibleSubmissions.map((item) => (
              <div className="history-card" key={item.id}>
                <div className="history-left">
                  <div className="history-icon"><Upload size={24} /></div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.subject} · {item.technology} · v{item.version || 1}</p>
                    <p className="deadline-meta">Last Date: {formatLastDate(item)}</p>
                    {item.status?.toLowerCase() === "approved" && item.grade && (
                      <span className="grade">Grade: {item.grade}</span>
                    )}
                  </div>
                </div>
                <div className="history-right">
                  <span className="date">
                    {item.submittedDate ? new Date(item.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                  </span>
                  <span className={`status ${getStudentStatus(item.status)}`}>
                    {getStudentStatus(item.status)}
                  </span>

                  <button className="icon-btn" onClick={() => handleViewProject(item)}>
                    <Eye size={20} />
                  </button>

                  {(item.status?.toLowerCase() === "pending" || item.status?.toLowerCase() === "resubmitted") && (
                    <button className="icon-btn" onClick={() => handleOpenEdit(item)} title="Edit Project">
                      <Pencil size={20} />
                    </button>
                  )}

                  {item.status?.toLowerCase() === "rejected" && canResubmit(item) && (
                    <button className="resubmit-btn" onClick={() => handleResubmit(item)}>
                      <RotateCcw size={18} /> Resubmit
                    </button>
                  )}

                  <button className="icon-btn delete-btn" onClick={() => handleDeleteProject(item)} title="Delete Project">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW MODAL */}
        {viewModal && selectedProject && (
          <div className="modal-overlay">
            <div className="view-modal">
              <button className="close-btn" onClick={() => setViewModal(false)}>
                <X size={26} />
              </button>
              <h2>{selectedProject.title}</h2>
              <div className="view-grid">
                <p><strong>Submitted:</strong> {selectedProject.submittedDate ? new Date(selectedProject.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</p>
                <p><strong>Last Date for Submission:</strong> {formatLastDate(selectedProject)}</p>
                <p><strong>Last Updated:</strong> {selectedProject.updatedDate ? new Date(selectedProject.updatedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : selectedProject.submittedDate ? new Date(selectedProject.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</p>
                <p><strong>Student ID:</strong> {selectedProject.studentId || userId}</p>
                <p><strong>Student:</strong> {selectedProject.studentName || fullName}</p>
                <p><strong>Subject:</strong> {selectedProject.subject}</p>
                <p><strong>Tech:</strong> {selectedProject.technology}</p>
                <p><strong>Version:</strong> v{selectedProject.version || 1}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${getStudentStatus(selectedProject.status)}`}>
                    {getStudentStatus(selectedProject.status)}
                  </span>
                </p>
                <p><strong>Faculty:</strong> {selectedProject.facultyName || "-"}</p>
                {selectedProject.grade && <p><strong>Grade:</strong> {selectedProject.grade}</p>}
              </div>
              {selectedProject.githubUrl && (
                <div className="github-section">
                  <strong>GitHub Repository</strong>
                  <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="github-btn">
                    {selectedProject.githubUrl}
                  </a>
                </div>
              )}
              <div className="view-section">
                <h4>Abstract</h4>
                <div className="view-box">{selectedProject.abstractText || "No abstract provided."}</div>
              </div>
              {selectedProject.fileName && (
                <div className="file-action-card">
                  <div className="file-action-main">
                    <div className="file-action-icon"><Upload size={18} /></div>
                    <div>
                      <h4>Uploaded Project</h4>
                      <p>{selectedProject.fileName}</p>
                    </div>
                  </div>
                  <button
                    className="file-action-btn"
                    onClick={() => handleDownloadProjectFile(selectedProject)}
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              )}
              {selectedProject.feedback && (
                <div className="view-section">
                  <h4>Faculty Feedback</h4>
                  <div className="feedback-box">{selectedProject.feedback}</div>
                </div>
              )}
              {canDownloadFeedback(selectedProject.status) && (
                <button className="download-feedback-btn" onClick={() => handleDownloadFeedback(selectedProject)}>
                  <Download size={16} /> Download Feedback
                </button>
              )}
            </div>
          </div>
        )}

      </div>
      <ConfirmToast
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        busy={deleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteProjectItems(deleteConfirm.items)}
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
