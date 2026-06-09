import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyCertificates.css";
import {
  LayoutDashboard, BookOpen, ShieldCheck, Bell, LogOut, User, Users,
  Award, Search, ChevronDown, Eye, Download, X,
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";

const API = "http://localhost:8081";
const ITEMS_PER_PAGE = 5;

export default function VerifyCertificates() {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Faculty");

  const statusDropdownRef = useRef(null);
  const deptDropdownRef = useRef(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [department, setDepartment] = useState("All Departments");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [certificates, setCertificates] = useState([]);
  const [deadlineRules, setDeadlineRules] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const DEPARTMENTS = ["All Departments", "CSE", "IT", "ECE", "AIDS", "MECH"];

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) setShowStatusDropdown(false);
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) setShowDeptDropdown(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [search, status, department]);

  const fetchCertificates = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [certificatesRes, rulesRes] = await Promise.all([
        fetch(`${API}/certificates/faculty/${userId}`, { headers }),
        fetch(`${API}/deadline-rules/type/Certificate`, { headers })
      ]);
      let certificateData = [];
      if (certificatesRes.ok) {
        certificateData = await certificatesRes.json();
        setCertificates(certificateData);
      }
      if (rulesRes.ok) setDeadlineRules(await rulesRes.json());
      return certificateData;
    } catch (error) { console.error("Fetch certificates error:", error); }
    return [];
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchCertificates();
  }, [token, userId, navigate, fetchCertificates]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";
  const getLastDate = (certificate) =>
    certificate.lastSubmissionDate ||
    deadlineRules.find((rule) =>
      rule.status?.toLowerCase() === "active" &&
      rule.name?.trim().toLowerCase() === certificate.category?.trim().toLowerCase()
    )?.deadline;
  const getStatusLabel = (value) => value?.toLowerCase() === "resubmitted" ? "resubmitted" : value?.toLowerCase();
  const isFinalStatus = (value) => ["approved", "rejected"].includes(value?.toLowerCase());
  const isReviewableStatus = (value) => ["pending", "resubmitted"].includes(value?.toLowerCase());

  // Filter
  const filteredCertificates = certificates.filter((item) => {
    const matchSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.studentName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === "All Status" ? true : item.status?.toLowerCase() === status.toLowerCase();
    const matchDept = department === "All Departments" ? true : item.department === department;
    return matchSearch && matchStatus && matchDept;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / ITEMS_PER_PAGE);
  const paginatedCertificates = filteredCertificates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDownload = async (fileURL) => {
    if (!fileURL) { alert("File not found"); return; }
    try {
      const res = await fetch(fileURL);
      if (!res.ok) { alert("Download failed: file not found"); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileURL.split("/").pop() || "certificate";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed");
    }
  };

  const getLatestCertificate = async (id) => {
    const latest = await fetchCertificates();
    return latest.find((item) => item.id === id) || certificates.find((item) => item.id === id);
  };

  const openReviewModal = async (item) => {
    const latestCertificate = await getLatestCertificate(item.id) || item;
    setSelectedCertificate(latestCertificate);
    setRemarks(isFinalStatus(latestCertificate.status) ? latestCertificate.remarks || "" : "");
  };

  const refreshAndSet = async (setter, value) => {
    await fetchCertificates();
    setter(value);
  };

  const refreshAndPage = async (updater) => {
    await fetchCertificates();
    setCurrentPage(updater);
  };

  const closeReviewModal = async () => {
    await fetchCertificates();
    setSelectedCertificate(null);
    setRemarks("");
  };

  const handleCertificateReview = async (nextStatus) => {
    if (!remarks.trim()) { alert("Please provide feedback"); return; }
    setVerifying(true);
    try {
      const params = new URLSearchParams({ status: nextStatus, remarks });
      const res = await fetch(`${API}/certificates/${selectedCertificate.id}/verify?${params}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSelectedCertificate(null);
        setRemarks("");
        fetchCertificates();
      } else {
        alert("Certificate review failed");
      }
    } catch (error) {
      console.error("Certificate review error:", error);
      alert("Certificate review failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  return (
    <div className="verify-page">

      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="logo">
            <div className="logo-box">🎓</div>
            <h2>ProjectHub+</h2>
          </div>
          <div className="menu">
            <div className="menu-item" onClick={() => navigate("/faculty-dashboard")}><LayoutDashboard size={20} /><span>Dashboard</span></div>
            <div className="menu-item" onClick={() => navigate("/review-projects")}><BookOpen size={20} /><span>Review Projects</span></div>
            <div className="menu-item" onClick={() => navigate("/assigned-students")}><Users size={20} /><span>Assigned Students</span></div>
            <div className="menu-item active"><ShieldCheck size={20} /><span>Verify Certificates</span></div>
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
      <main className="verify-main">
        <div className="verify-header">
          <div className="verify-left">
            <h1>Verify Certificates</h1>
            <p>View student certificates.</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="filters">
          <div className="search-box">
            <Search size={20} color="#9ca3af" />
            <input type="text" placeholder="Search by student or title..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="dropdown-wrapper" ref={deptDropdownRef}>
            <div className="filter-dropdown" onClick={() => { fetchCertificates(); setShowDeptDropdown(!showDeptDropdown); }}>
              {department}<ChevronDown size={20} />
            </div>
            {showDeptDropdown && (
              <div className="dropdown-menu">
                {DEPARTMENTS.map((item) => (
                  <div key={item} className={department === item ? "dropdown-item active" : "dropdown-item"} onClick={() => { refreshAndSet(setDepartment, item); setShowDeptDropdown(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>

          <div className="dropdown-wrapper" ref={statusDropdownRef}>
            <div className="filter-dropdown" onClick={() => { fetchCertificates(); setShowStatusDropdown(!showStatusDropdown); }}>
              {status}<ChevronDown size={20} />
            </div>
            {showStatusDropdown && (
              <div className="dropdown-menu">
                {["All Status", "Pending", "Approved", "Rejected", "Resubmitted"].map((item) => (
                  <div key={item} className={status === item ? "dropdown-item active" : "dropdown-item"} onClick={() => { refreshAndSet(setStatus, item); setShowStatusDropdown(false); }}>{item}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS */}
        <div className="results-info">
          Showing {paginatedCertificates.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCertificates.length)} of {filteredCertificates.length} certificates
        </div>

        {/* LIST */}
        <div className="certificate-list">
          {paginatedCertificates.length === 0 ? (
            <div className="empty-state"><Award size={48} color="#d1d5db" /><p>No certificates found.</p></div>
          ) : (
            paginatedCertificates.map((item) => (
              <div className="certificate-card" key={item.id}>
                <div className="certificate-left">
                  <div className="certificate-icon"><Award size={28} /></div>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.studentName} · {item.organization} · {item.category}</p>
                    <p className="deadline-meta">Last Date: {formatDate(getLastDate(item))}</p>
                  </div>
                </div>
                <div className="certificate-right">
                  {item.department && <span className="dept-tag">{item.department}</span>}
                  <div className={item.status?.toLowerCase() === "approved" ? "approved-badge" : item.status?.toLowerCase() === "rejected" ? "rejected-badge" : item.status?.toLowerCase() === "resubmitted" ? "resubmit-badge" : "pending-badge"}>
                    {getStatusLabel(item.status)}
                  </div>
                  <button className="review-btn" onClick={() => openReviewModal(item)}>
                    <Eye size={18} /> {isFinalStatus(item.status) ? "View" : "Review"}
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

      {/* VIEW MODAL */}
      {selectedCertificate && (
        <div className="review-modal-overlay">
          <div className="certificate-review-modal">
            <button className="close-btn" onClick={closeReviewModal}><X size={24} /></button>
            <h2>{isFinalStatus(selectedCertificate.status) ? "View" : "Review"}: {selectedCertificate.title}</h2>

            <div className="modal-grid">
              <div>
                <p><strong>Student:</strong> {selectedCertificate.studentName}</p>
                <p><strong>Category:</strong> {selectedCertificate.category}</p>
                <p><strong>Issue Date:</strong> {selectedCertificate.issueDate || "-"}</p>
                <p><strong>Submitted Date:</strong> {formatDate(selectedCertificate.submittedDate || selectedCertificate.uploadDate)}</p>
                <p><strong>Last Date for Submission:</strong> {formatDate(getLastDate(selectedCertificate))}</p>
              </div>
              <div>
                <p><strong>Organization:</strong> {selectedCertificate.organization}</p>
                <p><strong>Department:</strong> {selectedCertificate.department || "-"}</p>
                <p><strong>Status:</strong> {getStatusLabel(selectedCertificate.status)}</p>
              </div>
            </div>

            {selectedCertificate.fileURL && (
              <button className="download-file-btn" onClick={() => handleDownload(selectedCertificate.fileURL)}>
                <Download size={20} /> Download Certificate File
              </button>
            )}

            <div className="remarks-box">
              <label>Feedback</label>
              <textarea
                placeholder="Write certificate feedback..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={isFinalStatus(selectedCertificate.status)}
              />
            </div>

            {isReviewableStatus(selectedCertificate.status) && (
              <div className="modal-actions">
                <button className="approve-btn" onClick={() => handleCertificateReview("APPROVED")} disabled={verifying}>
                  {verifying ? "..." : "Approve"}
                </button>
                <button className="reject-btn" onClick={() => handleCertificateReview("REJECTED")} disabled={verifying}>
                  {verifying ? "..." : "Reject"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
