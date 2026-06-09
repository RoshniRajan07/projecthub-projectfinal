import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ReviewProjects.css";
import {
  LayoutDashboard, BookOpen, BadgeCheck, Bell, LogOut, User,
  Search, ChevronDown, FileText, Eye, X, Download,
  ChevronLeft, ChevronRight, Menu, Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";

const API = "http://localhost:8081";
const ITEMS_PER_PAGE = 5;

const ReviewProjects = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Faculty");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [projects, setProjects] = useState([]);
  const [deadlineRules, setDeadlineRules] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ open: true, message, type });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const statusRef = useRef(null);
  const subjectRef = useRef(null);
  const deptRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusRef.current && !statusRef.current.contains(event.target)) setStatusOpen(false);
      if (subjectRef.current && !subjectRef.current.contains(event.target)) setSubjectOpen(false);
      if (deptRef.current && !deptRef.current.contains(event.target)) setDeptOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus, selectedSubject, selectedDepartment]);

  const fetchProjects = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [projectsRes, rulesRes] = await Promise.all([
        fetch(`${API}/projects/mongo/faculty/${userId}`, { headers }),
        fetch(`${API}/deadline-rules/type/Project`, { headers })
      ]);
      let projectData = [];
      if (projectsRes.ok) {
        projectData = await projectsRes.json();
        setProjects(projectData);
      }
      if (rulesRes.ok) setDeadlineRules(await rulesRes.json());
      return projectData;
    } catch (error) { console.error("Fetch projects error:", error); }
    return [];
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchProjects();
  }, [token, userId, navigate, fetchProjects]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
  const getLastDate = (project) =>
    project.lastSubmissionDate ||
    deadlineRules.find((rule) =>
      rule.status?.toLowerCase() === "active" &&
      rule.name?.trim().toLowerCase() === project.subject?.trim().toLowerCase()
    )?.deadline;
  const getStatusLabel = (value) => value?.toLowerCase() === "resubmitted" ? "resubmitted" : value?.toLowerCase();
  const isFinalStatus = (value) => ["approved", "rejected"].includes(value?.toLowerCase());
  const isReviewableStatus = (value) => ["pending", "resubmitted"].includes(value?.toLowerCase());

  // Filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" ? true : project.status?.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSubject = selectedSubject === "All Subjects" ? true : project.subject === selectedSubject;
    const matchesDept = selectedDepartment === "All Departments" ? true : project.department === selectedDepartment;
    return matchesSearch && matchesStatus && matchesSubject && matchesDept;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleReview = async (status) => {
    if (!feedback) { showToast("Please provide feedback", "warning"); return; }
    if (status === "APPROVED" && !grade) { showToast("Grade is required for approval", "warning"); return; }
    setReviewing(true);
    try {
      const params = new URLSearchParams({ status, feedback, grade: grade || "N/A" });
      const res = await fetch(`${API}/projects/mongo/review/${selectedProject.id}?${params}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedProject(null);
        setFeedback("");
        setGrade("");
        fetchProjects();
        showToast("Review submitted successfully", "success");
      } else {
        showToast("Review failed");
      }
    } catch (error) { console.error("Review error:", error); }
    setReviewing(false);
  };

  const getLatestProject = async (id) => {
    const latest = await fetchProjects();
    return latest.find((item) => item.id === id) || projects.find((item) => item.id === id);
  };

  const openReviewModal = async (project) => {
    const latestProject = await getLatestProject(project.id) || project;
    setSelectedProject(latestProject);
    setFeedback(isFinalStatus(latestProject.status) ? latestProject.feedback || "" : "");
    setGrade(isFinalStatus(latestProject.status) ? latestProject.grade || "" : "");
  };

  const refreshAndSet = async (setter, value) => {
    await fetchProjects();
    setter(value);
  };

  const refreshAndPage = async (updater) => {
    await fetchProjects();
    setCurrentPage(updater);
  };

  const closeReviewModal = async () => {
    await fetchProjects();
    setSelectedProject(null);
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

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="review-page">

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
            <div className="menu-item active"><BookOpen size={20} /><span>Review Projects</span></div>
            <div className="menu-item" onClick={() => navigate("/assigned-students")}><Users size={20} /><span>Assigned Students</span></div>
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
      <main className="review-main">

        {/* HEADER */}
        <div className="review-header">
          <div className="review-left">
            <h1>Review Projects</h1>
            <p>Review and grade student project submissions.</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by student or title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="dropdown-wrapper" ref={statusRef}>
            <div className="filter-dropdown" onClick={() => { fetchProjects(); setStatusOpen(!statusOpen); setSubjectOpen(false); setDeptOpen(false); }}>
              <span>{selectedStatus}</span><ChevronDown size={18} />
            </div>
            {statusOpen && (
              <div className="dropdown-menu">
                {["All Status", "Pending", "Approved", "Rejected", "Resubmitted"].map((item) => (
                  <div key={item} className={selectedStatus === item ? "dropdown-item active" : "dropdown-item"} onClick={() => { refreshAndSet(setSelectedStatus, item); setStatusOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-wrapper" ref={subjectRef}>
            <div className="filter-dropdown" onClick={() => { fetchProjects(); setSubjectOpen(!subjectOpen); setStatusOpen(false); setDeptOpen(false); }}>
              <span>{selectedSubject}</span><ChevronDown size={18} />
            </div>
            {subjectOpen && (
              <div className="dropdown-menu">
                {["All Subjects", "Machine Learning", "Web Development", "IoT", "Blockchain"].map((item) => (
                  <div key={item} className={selectedSubject === item ? "dropdown-item active" : "dropdown-item"} onClick={() => { refreshAndSet(setSelectedSubject, item); setSubjectOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-wrapper" ref={deptRef}>
            <div className="filter-dropdown" onClick={() => { fetchProjects(); setDeptOpen(!deptOpen); setStatusOpen(false); setSubjectOpen(false); }}>
              <span>{selectedDepartment}</span><ChevronDown size={18} />
            </div>
            {deptOpen && (
              <div className="dropdown-menu">
                {["All Departments", "CSE", "IT", "ECE", "AIDS", "MECH"].map((item) => (
                  <div key={item} className={selectedDepartment === item ? "dropdown-item active" : "dropdown-item"} onClick={() => { refreshAndSet(setSelectedDepartment, item); setDeptOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS INFO */}
        <div className="results-info">
          Showing {paginatedProjects.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProjects.length)} of {filteredProjects.length} projects
        </div>

        {/* PROJECT LIST */}
        <div className="projects-list">
          {paginatedProjects.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} color="#d1d5db" />
              <p>No projects found for selected filters.</p>
            </div>
          ) : (
            paginatedProjects.map((project) => (
              <div className="project-card" key={project.id}>
                <div className="project-left">
                  <div className="project-icon"><FileText size={24} /></div>
                  <div className="project-info">
                    <h3>{project.title}</h3>
                    <p>{project.studentName} · {project.subject} · v{project.version || 1}</p>
                    <span>{project.technology}</span>
                    <p className="deadline-meta">Last Date: {formatDate(getLastDate(project))}</p>
                  </div>
                </div>
                <div className="project-right">
                  {project.department && <span className="dept-tag">{project.department}</span>}
                  <div className={
                    project.status?.toLowerCase() === "approved" ? "approved-badge" :
                    project.status?.toLowerCase() === "rejected" ? "rejected-badge" :
                    project.status?.toLowerCase() === "resubmitted" ? "resubmit-badge" :
                    "pending-badge"
                  }>
                    {getStatusLabel(project.status)}
                  </div>
                  <button className="review-btn" onClick={() => openReviewModal(project)}>
                    <Eye size={18} /> {isFinalStatus(project.status) ? "View" : "Review"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => refreshAndPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} className={currentPage === page ? "page-number active" : "page-number"} onClick={() => refreshAndPage(page)}>{page}</button>
              ))}
            </div>
            <button className="page-btn" onClick={() => refreshAndPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* REVIEW MODAL */}
      {selectedProject && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <button className="close-btn" onClick={closeReviewModal}><X size={24} /></button>
            <h2>{isFinalStatus(selectedProject.status) ? "View" : "Review"}: {selectedProject.title}</h2>

            <div className="modal-grid">
              <div>
                <p><strong>Student:</strong> {selectedProject.studentName}</p>
                <p><strong>Tech:</strong> {selectedProject.technology}</p>
                <p><strong>Submitted Date:</strong> {formatDate(selectedProject.submittedDate)}</p>
              </div>
              <div>
                <p><strong>Subject:</strong> {selectedProject.subject}</p>
                <p><strong>Version:</strong> v{selectedProject.version || 1}</p>
                <p><strong>Last Date for Submission:</strong> {formatDate(getLastDate(selectedProject))}</p>
                <p><strong>Status:</strong> {getStatusLabel(selectedProject.status)}</p>
              </div>
            </div>

            <div className="abstract-box">
              <h4>Project Abstract</h4>
              <p>{selectedProject.abstractText || "No abstract provided."}</p>
            </div>

            {selectedProject.githubUrl && (
              <div className="github-link-box">
                <strong>GitHub Repository</strong>
                <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="github-btn">
                  {selectedProject.githubUrl}
                </a>
              </div>
            )}

            {selectedProject.fileName && (
              <button className="download-file-btn" onClick={() => handleDownloadProjectFile(selectedProject)}>
                Open {selectedProject.fileName}
              </button>
            )}

            <textarea
              placeholder="Write detailed feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isFinalStatus(selectedProject.status)}
            />

            <div className="grade-field">
              <label>Grade {isReviewableStatus(selectedProject.status) ? "*" : ""}:</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                disabled={isFinalStatus(selectedProject.status)}
              >
                <option value="">Select Grade</option>
                <option value="O">O (Outstanding)</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            {isReviewableStatus(selectedProject.status) && (
              <div className="modal-actions">
                <button className="approve-btn" onClick={() => handleReview("APPROVED")} disabled={reviewing}>
                  {reviewing ? "..." : "Approve"}
                </button>
                <button className="reject-btn" onClick={() => handleReview("REJECTED")} disabled={reviewing}>
                  {reviewing ? "..." : "Reject"}
                </button>
              </div>
            )}

            {isFinalStatus(selectedProject.status) && (
              <>
                {selectedProject.grade && (
                  <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#15803d" }}>
                    Grade Assigned: {selectedProject.grade}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} open={toast.open} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
};

export default ReviewProjects;
