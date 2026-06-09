import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ViewSubmissions.css";
import {
  LayoutDashboard, Users, Settings, Bell, LogOut, User,
  Search, ChevronDown, FileText, Eye, X, Award,
  ChevronLeft, ChevronRight, ClipboardList, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8081";
const ITEMS_PER_PAGE = 8;

const ViewSubmissions = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Admin");

  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);

  const [typeOpen, setTypeOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [viewItem, setViewItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const typeRef = useRef(null);
  const deptRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeRef.current && !typeRef.current.contains(event.target)) setTypeOpen(false);
      if (deptRef.current && !deptRef.current.contains(event.target)) setDeptOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target)) setStatusOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedType, selectedDepartment, selectedStatus]);

  const fetchData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [projRes, certRes] = await Promise.all([
        fetch(`${API}/admin/projects`, { headers }),
        fetch(`${API}/admin/certificates`, { headers })
      ]);
      let projectData = [];
      let certificateData = [];
      if (projRes.ok) {
        projectData = await projRes.json();
        setProjects(projectData);
      }
      if (certRes.ok) {
        certificateData = await certRes.json();
        setCertificates(certificateData);
      }
      setLoading(false);
      return { projectData, certificateData };
    } catch (error) { console.error("Fetch error:", error); }
    setLoading(false);
    return { projectData: [], certificateData: [] };
  }, [token]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchData();
  }, [token, userId, navigate, fetchData]);

  // Combine projects and certificates into unified list
  const allSubmissions = [
    ...projects.map(p => ({
      id: p.id,
      type: "Project",
      title: p.title,
      studentName: p.studentName,
      department: p.department || "-",
      status: p.status,
      submittedDate: p.submittedDate,
      technology: p.technology,
      subject: p.subject,
      facultyName: p.facultyName,
      abstractText: p.abstractText,
      githubUrl: p.githubUrl,
      fileName: p.fileName
    })),
    ...certificates.map(c => ({
      id: c.id,
      type: "Certificate",
      title: c.title,
      studentName: c.studentName,
      department: c.department || "-",
      status: c.status,
      submittedDate: c.submittedDate || c.uploadDate,
      organization: c.organization,
      category: c.category,
      issueDate: c.issueDate,
      fileName: c.fileName
    }))
  ];

  // Filter
  const filtered = allSubmissions.filter(item => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "All" ? true : item.type === selectedType;
    const matchesDept = selectedDepartment === "All Departments" ? true : item.department === selectedDepartment;
    const matchesStatus = selectedStatus === "All Status" ? true : item.status?.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesType && matchesDept && matchesStatus;
  });

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => {
    const da = a.submittedDate ? new Date(a.submittedDate) : new Date(0);
    const db = b.submittedDate ? new Date(b.submittedDate) : new Date(0);
    return db - da;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleLogout = async () => {
    await fetchData();
    localStorage.clear();
    navigate("/");
  };

  const refreshAndNavigate = (path) => {
    navigate(path);
  };

  const refreshAndSet = async (setter, value) => {
    await fetchData();
    setter(value);
  };

  const refreshAndPage = async (updater) => {
    await fetchData();
    setCurrentPage(updater);
  };

  const openViewItem = async (item) => {
    const latest = await fetchData();
    const source = item.type === "Project" ? latest.projectData : latest.certificateData;
    const latestItem = source.find((entry) => entry.id === item.id);
    setViewItem(latestItem ? {
      ...item,
      ...latestItem,
      type: item.type,
      submittedDate: item.type === "Certificate" ? latestItem.submittedDate || latestItem.uploadDate : latestItem.submittedDate,
    } : item);
  };

  return (
    <div className="vs-page">

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
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-dashboard")}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/manage-users")}>
              <Users size={20} /><span>Manage Users</span>
            </div>
            <div className="menu-item active" onClick={fetchData}>
              <ClipboardList size={20} /><span>View Submissions</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-settings")}>
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
      <main className="vs-main">

        <div className="vs-header">
          <h1>View Submissions</h1>
          <p>View all project and certificate submissions by students.</p>
        </div>

        {/* FILTERS */}
        <div className="vs-filters">
          <div className="vs-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search by student or title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="vs-dropdown-wrapper" ref={typeRef}>
            <div className="vs-filter-dropdown" onClick={() => { fetchData(); setTypeOpen(!typeOpen); setDeptOpen(false); setStatusOpen(false); }}>
              <span>{selectedType}</span><ChevronDown size={18} />
            </div>
            {typeOpen && (
              <div className="vs-dropdown-menu">
                {["All", "Project", "Certificate"].map(item => (
                  <div key={item} className={selectedType === item ? "vs-dropdown-item active" : "vs-dropdown-item"} onClick={() => { refreshAndSet(setSelectedType, item); setTypeOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="vs-dropdown-wrapper" ref={deptRef}>
            <div className="vs-filter-dropdown" onClick={() => { fetchData(); setDeptOpen(!deptOpen); setTypeOpen(false); setStatusOpen(false); }}>
              <span>{selectedDepartment}</span><ChevronDown size={18} />
            </div>
            {deptOpen && (
              <div className="vs-dropdown-menu">
                {["All Departments", "CSE", "IT", "ECE", "AIDS", "MECH"].map(item => (
                  <div key={item} className={selectedDepartment === item ? "vs-dropdown-item active" : "vs-dropdown-item"} onClick={() => { refreshAndSet(setSelectedDepartment, item); setDeptOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="vs-dropdown-wrapper" ref={statusRef}>
            <div className="vs-filter-dropdown" onClick={() => { fetchData(); setStatusOpen(!statusOpen); setTypeOpen(false); setDeptOpen(false); }}>
              <span>{selectedStatus}</span><ChevronDown size={18} />
            </div>
            {statusOpen && (
              <div className="vs-dropdown-menu">
                {["All Status", "Pending", "Approved", "Rejected", "Resubmitted"].map(item => (
                  <div key={item} className={selectedStatus === item ? "vs-dropdown-item active" : "vs-dropdown-item"} onClick={() => { refreshAndSet(setSelectedStatus, item); setStatusOpen(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS */}
        <div className="vs-results-info">
          Showing {paginated.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of {sorted.length} submissions
        </div>

        {/* TABLE */}
        <div className="vs-table-wrapper">
          <table className="vs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Student</th>
                <th>Type</th>
                <th>Department</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="vs-empty">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan="7" className="vs-empty">No submissions found.</td></tr>
              ) : (
                paginated.map(item => (
                  <tr key={`${item.type}-${item.id}`}>
                    <td className="vs-title-cell">
                      {item.type === "Project" ? <FileText size={16} className="vs-icon-gold" /> : <Award size={16} className="vs-icon-blue" />}
                      <span>{item.title}</span>
                    </td>
                    <td>{item.studentName || "-"}</td>
                    <td><span className={item.type === "Project" ? "vs-type-project" : "vs-type-cert"}>{item.type}</span></td>
                    <td>{item.department}</td>
                    <td>
                      <span className={
                        item.status?.toLowerCase() === "approved" ? "vs-status-approved" :
                        item.status?.toLowerCase() === "rejected" ? "vs-status-rejected" :
                        item.status?.toLowerCase() === "resubmitted" ? "vs-status-resubmitted" :
                        "vs-status-pending"
                      }>
                        {item.status?.toLowerCase()}
                      </span>
                    </td>
                    <td>{item.submittedDate ? new Date(item.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</td>
                    <td>
                      <button className="vs-view-btn" onClick={() => openViewItem(item)}>
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="vs-pagination">
            <button className="vs-page-btn" onClick={() => refreshAndPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              <ChevronLeft size={18} /> Previous
            </button>
            <div className="vs-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} className={currentPage === page ? "vs-page-number active" : "vs-page-number"} onClick={() => refreshAndPage(page)}>{page}</button>
              ))}
            </div>
            <button className="vs-page-btn" onClick={() => refreshAndPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* VIEW MODAL */}
      {viewItem && (
        <div className="vs-modal-overlay">
          <div className="vs-modal">
            <button className="vs-close-btn" onClick={async () => { await fetchData(); setViewItem(null); }}><X size={24} /></button>
            <h2>{viewItem.title}</h2>
            <span className={viewItem.type === "Project" ? "vs-type-project" : "vs-type-cert"}>{viewItem.type}</span>

            <div className="vs-modal-grid">
              <p><strong>Student:</strong> {viewItem.studentName || "-"}</p>
              <p><strong>Department:</strong> {viewItem.department}</p>
              <p><strong>Status:</strong> <span className={
                viewItem.status?.toLowerCase() === "approved" ? "vs-status-approved" :
                viewItem.status?.toLowerCase() === "rejected" ? "vs-status-rejected" :
                "vs-status-pending"
              }>{viewItem.status?.toLowerCase()}</span></p>
              <p><strong>Submitted:</strong> {viewItem.submittedDate ? new Date(viewItem.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-"}</p>

              {viewItem.type === "Project" && (
                <>
                  <p><strong>Subject:</strong> {viewItem.subject || "-"}</p>
                  <p><strong>Technology:</strong> {viewItem.technology || "-"}</p>
                  <p><strong>Faculty:</strong> {viewItem.facultyName || "-"}</p>
                </>
              )}

              {viewItem.type === "Certificate" && (
                <>
                  <p><strong>Organization:</strong> {viewItem.organization || "-"}</p>
                  <p><strong>Category:</strong> {viewItem.category || "-"}</p>
                  <p><strong>Issue Date:</strong> {viewItem.issueDate || "-"}</p>
                </>
              )}
            </div>

            {viewItem.type === "Project" && viewItem.abstractText && (
              <div className="vs-abstract-box">
                <h4>Abstract</h4>
                <p>{viewItem.abstractText}</p>
              </div>
            )}

            {viewItem.type === "Project" && viewItem.githubUrl && (
              <div className="vs-github-box">
                <strong>GitHub Repository</strong>
                <a href={viewItem.githubUrl} target="_blank" rel="noreferrer">{viewItem.githubUrl}</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewSubmissions;
