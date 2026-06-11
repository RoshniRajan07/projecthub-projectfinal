import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Certificates.css";
import jsPDF from "jspdf";
import {
  LayoutDashboard, Upload, Award, User, Bell, LogOut,
  Download, Trash2, Plus, RotateCcw, Pencil, ChevronDown, Calendar, Eye, X, Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmToast from "./ConfirmToast";
import Toast from "./Toast";

const API = "http://localhost:8081";

const Certificates = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Student");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("upload");
  const [editingCert, setEditingCert] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const [certificateList, setCertificateList] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ open: true, message, type });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [deadlineRules, setDeadlineRules] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [maxResubmissions] = useState(3);

  const [certificateData, setCertificateData] = useState({
    title: "", organization: "", category: "", issueDate: "", faculty: "", file: null,
  });

  const fileInputRef = useRef(null);

  const fetchCertificates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/certificates/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCertificateList(data);
        return data;
      }
    } catch (error) { console.error("Fetch certificates error:", error); }
    return [];
  }, [token, userId]);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/filter/role?role=FACULTY`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFacultyList(data);
        return data;
      }
    } catch (error) { console.error("Fetch faculty error:", error); }
    return [];
  }, [token]);

  const fetchDeadlineRules = useCallback(async () => {
    try {
      const res = await fetch(`${API}/deadline-rules/type/Certificate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeadlineRules(data);
        return data;
      }
    } catch (error) { console.error("Fetch deadlines error:", error); }
    return [];
  }, [token]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchCertificates();
    fetchFaculty();
    fetchDeadlineRules();
  }, [token, userId, navigate, fetchCertificates, fetchFaculty, fetchDeadlineRules]);

  const selectedDeadline = deadlineRules.find(
    (rule) => rule.name === certificateData.category && rule.status === "Active"
  );

  const visibleCertificates = [...certificateList]
    .sort((a, b) => {
      const versionDiff = (b.version || 1) - (a.version || 1);
      if (versionDiff !== 0) return versionDiff;
      return new Date(b.updatedDate || b.submittedDate || b.uploadDate || 0) -
        new Date(a.updatedDate || a.submittedDate || a.uploadDate || 0);
    })
    .filter((item, index, list) =>
      index === list.findIndex((other) =>
        `${other.title || ""}|${other.organization || ""}|${other.category || ""}` ===
        `${item.title || ""}|${item.organization || ""}|${item.category || ""}`
      )
    );

  const formatDeadline = (value) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const getCertificateLastDate = (item) =>
    item.lastSubmissionDate ||
    deadlineRules.find((rule) =>
      rule.type?.toLowerCase() === "certificate" &&
      rule.status?.toLowerCase() === "active" &&
      rule.name?.trim().toLowerCase() === item.category?.trim().toLowerCase()
    )?.deadline;
  const formatLastDate = (item) => getCertificateLastDate(item) ? formatDeadline(getCertificateLastDate(item)) : "Not set";

  const getDaysLeft = (value) => {
    const today = new Date();
    const deadline = new Date(value);
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  };

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const getResubmissionLimit = (cert) => {
    const rule = deadlineRules.find((deadline) =>
      deadline.name === cert.category && deadline.status === "Active"
    );
    const ruleLimit = rule?.resubmissions !== undefined ? Number(rule.resubmissions) : maxResubmissions;
    return Math.min(ruleLimit, maxResubmissions);
  };

  const canResubmit = (cert) => Math.max(0, (cert.version || 1) - 1) < getResubmissionLimit(cert);

  const notifyFaculty = async (facultyId, certificateName, mode) => {
    if (!facultyId) return;
    try {
      await fetch(`${API}/users/notifications`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(facultyId),
          role: "FACULTY",
          title: mode === "edit" ? "Certificate Updated" : mode === "resubmit" ? "Certificate Resubmitted" : "New Certificate Submitted",
          message: `${fullName} ${mode === "edit" ? "updated" : mode === "resubmit" ? "resubmitted" : "submitted"} "${certificateName}" for verification.`,
          type: "info"
        })
      });
    } catch (error) {
      console.error("Faculty notification error:", error);
    }
  };

  const handleChange = (e) => {
    setCertificateData({ ...certificateData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setCertificateData({ ...certificateData, file: selectedFile });
  };

  const getLatestCertificate = async (id) => {
    const latest = await fetchCertificates();
    return latest.find((item) => item.id === id) || certificateList.find((item) => item.id === id);
  };

  const getStudentStatus = (status) => {
    const normalized = status?.toLowerCase() || "pending";
    return normalized === "resubmitted" ? "pending" : normalized;
  };

  const canDownloadFeedback = (status) => ["approved", "rejected"].includes(status?.toLowerCase());

  const openUploadModal = async () => {
    await Promise.all([fetchFaculty(), fetchDeadlineRules()]);
    setCertificateData({ title: "", organization: "", category: "", issueDate: "", faculty: "", file: null });
    setModalMode("upload");
    setEditingCert(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (cert) => {
    const latestCert = await getLatestCertificate(cert.id) || cert;
    setCertificateData({
      title: latestCert.title || "",
      organization: latestCert.organization || "",
      category: latestCert.category || "",
      issueDate: latestCert.issueDate || "",
      faculty: latestCert.facultyId?.toString() || "",
      file: null,
    });
    setModalMode("edit");
    setEditingCert(latestCert);
    setShowModal(true);
  };

  const handleOpenResubmit = async (cert) => {
    const latestCert = await getLatestCertificate(cert.id) || cert;
    if (!canResubmit(latestCert)) {
      showToast(`Maximum resubmission limit reached (${getResubmissionLimit(latestCert)}).`, "warning");
      return;
    }
    setCertificateData({
      title: latestCert.title || "",
      organization: latestCert.organization || "",
      category: latestCert.category || "",
      issueDate: latestCert.issueDate || "",
      faculty: latestCert.facultyId?.toString() || "",
      file: null,
    });
    setModalMode("resubmit");
    setEditingCert(latestCert);
    setShowModal(true);
  };

  const handleCertificateSubmit = async () => {
    const { title, organization, category, issueDate, faculty, file } = certificateData;

    if (!title || !organization || !category || !issueDate || !faculty) {
      showToast("All fields are required", "warning");
      return;
    }
    if (modalMode !== "edit" && !file) {
      showToast("Please upload a certificate file", "warning");
      return;
    }

    setSubmitting(true);

    try {
      let fileName = editingCert?.fileName || "";
      let fileURL = editingCert?.fileURL || "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch(`${API}/projects/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!uploadRes.ok) { showToast("File upload failed"); setSubmitting(false); return; }
        fileName = await uploadRes.text();
        fileURL = `${API}/projects/download/${fileName}`;
      }

      const selectedFaculty = facultyList.find(f => f.id.toString() === faculty);

      const certPayload = {
        title,
        organization,
        category,
        issueDate,
        studentId: parseInt(userId),
        studentName: fullName,
        facultyId: selectedFaculty ? selectedFaculty.id : parseInt(faculty),
        facultyName: selectedFaculty ? selectedFaculty.fullName : "",
        fileName,
        fileURL,
        status: modalMode === "resubmit" ? "RESUBMITTED" : "PENDING",
        submittedDate: modalMode === "resubmit" ? todayISO() : editingCert?.submittedDate || editingCert?.uploadDate || todayISO(),
        uploadDate: editingCert?.uploadDate || todayISO(),
        updatedDate: todayISO(),
      };

      let res;
      if ((modalMode === "edit" || modalMode === "resubmit") && editingCert) {
        res = await fetch(`${API}/certificates/${editingCert.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(certPayload),
        });
      } else {
        res = await fetch(`${API}/certificates`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(certPayload),
        });
      }

      if (!res.ok) { showToast("Submission failed"); setSubmitting(false); return; }

      await notifyFaculty(certPayload.facultyId, title, modalMode);
      setShowModal(false);
      setEditingCert(null);
      setCertificateData({ title: "", organization: "", category: "", issueDate: "", faculty: "", file: null });
      fetchCertificates();
    } catch {
      showToast("Server error. Please try again.");
    }
    setSubmitting(false);
  };

  const deleteCertificates = async (items) => {
    setDeleting(true);
    try {
      await Promise.all(items.map((cert) =>
        fetch(`${API}/certificates/${cert.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      const deletedIds = items.map((cert) => cert.id);
      setCertificateList((prev) => prev.filter((cert) => !deletedIds.includes(cert.id)));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (cert) => {
    const latestCert = await getLatestCertificate(cert.id) || cert;
    setDeleteConfirm({
      title: "Delete certificate?",
      message: `Delete "${latestCert.title}"? This cannot be undone.`,
      items: [latestCert],
    });
  };

  const handleOpenView = async (item) => {
    const latestCert = await getLatestCertificate(item.id) || item;
    setSelectedCert(latestCert);
    setViewModal(true);
  };

  const handleViewCertificate = async (item) => {
    const latestCert = await getLatestCertificate(item.id) || item;
    if (!latestCert.fileURL) { showToast("File not found"); return; }
    try {
      const res = await fetch(latestCert.fileURL);
      if (!res.ok) { showToast("Download failed"); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = latestCert.fileName || latestCert.fileURL.split("/").pop() || "certificate";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      showToast("Download failed");
    }
  };

  const handleDownloadFeedback = async (cert) => {
    const latestCert = await getLatestCertificate(cert.id) || cert;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Certificate Feedback Report", 20, 20);
    doc.setFontSize(13);
    doc.text(`Certificate : ${latestCert.title}`, 20, 50);
    doc.text(`Organization : ${latestCert.organization}`, 20, 65);
    doc.text(`Category : ${latestCert.category}`, 20, 80);
    doc.text(`Status : ${latestCert.status}`, 20, 95);
    doc.text("Faculty Feedback", 20, 125);
    doc.text(latestCert.remarks || "No feedback yet.", 20, 145);
    doc.save(`${latestCert.title}_Feedback.pdf`);
  };

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "-";

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const modalTitle = modalMode === "edit" ? "Edit Certificate" : modalMode === "resubmit" ? "Resubmit Certificate" : "Upload Certificate";
  const modalBtn = modalMode === "edit" ? "Save Changes" : modalMode === "resubmit" ? "Resubmit for Verification" : "Submit for Verification";

  return (
    <div className="certificate-page">

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
            <div className="menu-item" onClick={() => navigate("/dashboard")}><LayoutDashboard size={20} /><span>Dashboard</span></div>
            <div className="menu-item" onClick={() => navigate("/submit-project")}><Upload size={20} /><span>Submit Project</span></div>
            <div className="menu-item active"><Award size={20} /><span>Certificates</span></div>
            <div className="menu-item" onClick={() => navigate("/profile")}><User size={20} /><span>Profile</span></div>
            <div className="menu-item" onClick={() => navigate("/notifications")}><Bell size={20} /><span>Notifications</span></div>
          </div>
        </div>
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text"><h4>{fullName}</h4><p>Student</p></div>
          </div>
          <div className="logout" onClick={handleLogout}><LogOut size={16} /><span>Sign Out</span></div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="certificate-main">
        <div className="certificate-header">
          <div className="header-left">
            <h1>Certificates</h1>
            <p>Upload and track your certificate verifications.</p>
          </div>
          <div className="header-actions">
            <button className="add-btn" onClick={openUploadModal}>
              <Plus size={18} /> Add Certificate
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="certificate-list">
          {visibleCertificates.length === 0 && <p style={{ padding: "1rem", color: "#888" }}>No certificates yet.</p>}

          {visibleCertificates.map((item) => (
            <div className="certificate-card" key={item.id}>
              <div className="certificate-left">
                <div className="certificate-icon"><Award size={22} /></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.organization} · {item.category}</p>
                  <p className="deadline-meta">Last Date: {formatLastDate(item)}</p>
                </div>
              </div>
              <div className="certificate-right">
                <span className="date">{item.issueDate || "-"}</span>
                <span className={`status ${getStudentStatus(item.status)}`}>{getStudentStatus(item.status)}</span>

                <Eye className="action-icon" size={18} onClick={() => handleOpenView(item)} style={{ cursor: "pointer" }} title="View" />

                {item.status?.toLowerCase() === "pending" && (
                  <Pencil size={18} style={{ cursor: "pointer", color: "#6b7280" }} onClick={() => handleOpenEdit(item)} title="Edit" />
                )}

                {item.status?.toLowerCase() === "rejected" && canResubmit(item) && (
                  <button className="resubmit-btn" onClick={() => handleOpenResubmit(item)}>
                    <RotateCcw size={15} /> Resubmit
                  </button>
                )}

                <Trash2 className="delete-icon" size={18} onClick={() => handleDelete(item)} style={{ cursor: "pointer" }} />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* VIEW MODAL */}
      {viewModal && selectedCert && (
        <div className="modal-overlay">
          <div className="view-modal">
            <button className="close-btn" onClick={() => setViewModal(false)}>
              <X size={26} />
            </button>
            <h2>{selectedCert.title}</h2>
            <div className="view-grid">
              <p><strong>Issue Date:</strong> {selectedCert.issueDate || "-"}</p>
              <p><strong>Submitted:</strong> {formatDate(selectedCert.submittedDate || selectedCert.uploadDate)}</p>
              <p><strong>Last Date for Submission:</strong> {formatLastDate(selectedCert)}</p>
              <p><strong>Last Updated:</strong> {formatDate(selectedCert.updatedDate || selectedCert.submittedDate || selectedCert.uploadDate)}</p>
              <p><strong>Student ID:</strong> {selectedCert.studentId || userId}</p>
              <p><strong>Student:</strong> {selectedCert.studentName || fullName}</p>
              <p><strong>Organization:</strong> {selectedCert.organization}</p>
              <p><strong>Category:</strong> {selectedCert.category}</p>
              <p><strong>Faculty:</strong> {selectedCert.facultyName || "-"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${getStudentStatus(selectedCert.status)}`}>
                  {getStudentStatus(selectedCert.status)}
                </span>
              </p>
            </div>
            {selectedCert.fileName && (
              <div className="file-action-card">
                <div className="file-action-main">
                  <div className="file-action-icon"><Award size={18} /></div>
                  <div>
                    <h4>Uploaded Certificate</h4>
                    <p>{selectedCert.fileName}</p>
                  </div>
                </div>
                <button className="file-action-btn" onClick={() => handleViewCertificate(selectedCert)}>
                  <Download size={16} /> Download
                </button>
              </div>
            )}
            {selectedCert.remarks && (
              <div className="view-section">
                <h4>Faculty Feedback</h4>
                <div className="feedback-box">{selectedCert.remarks}</div>
              </div>
            )}
            {canDownloadFeedback(selectedCert.status) && (
              <button className="download-feedback-btn" onClick={() => handleDownloadFeedback(selectedCert)}>
                <Download size={16} /> Download Feedback
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h2>{modalTitle}</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); setEditingCert(null); }} style={{ flexShrink: 0 }}>✕</button>
            </div>

            {modalMode === "edit" && editingCert && (
              <div style={{ background: "#fffaf0", border: "1px solid #ead7ad", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#b98a2e" }}>
                ✏️ Editing: <strong>{editingCert.title}</strong>
              </div>
            )}

            {modalMode === "resubmit" && editingCert && (
              <div style={{ background: "#fff8e1", border: "1px solid #f0c040", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", color: "#7a5800" }}>
                🔄 Resubmitting: <strong>{editingCert.title}</strong>
              </div>
            )}

            <div className="modal-group">
              <label>Certificate Title *</label>
              <input type="text" name="title" placeholder="e.g. AWS Cloud Practitioner" value={certificateData.title} onChange={handleChange} />
            </div>

            <div className="modal-row">
              <div className="modal-group">
                <label>Organization *</label>
                <input type="text" name="organization" placeholder="e.g. Amazon" value={certificateData.organization} onChange={handleChange} />
              </div>
              <div className="modal-group">
                <label>Category *</label>
                <select name="category" value={certificateData.category} onChange={handleChange}>
                  <option value="">Select</option>
                  <option>Cloud</option>
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>AI/ML</option>
                  <option>DevOps</option>
                </select>
                {selectedDeadline && (
                  <div className={getDaysLeft(selectedDeadline.deadline) < 0 ? "deadline-hint closed" : "deadline-hint"}>
                    Deadline: {formatDeadline(selectedDeadline.deadline)}
                    {" · "}
                    {getDaysLeft(selectedDeadline.deadline) < 0 ? "Closed" : `${getDaysLeft(selectedDeadline.deadline)} days left`}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-group">
              <label>Issue Date *</label>
              <div className="date-input-wrapper">
                <input type="date" id="issueDateInput" name="issueDate" value={certificateData.issueDate} onChange={handleChange} />
                <Calendar size={18} className="date-icon" onClick={() => document.getElementById('issueDateInput').showPicker()} />
              </div>
            </div>

            <div className="modal-group">
              <label>Select Faculty *</label>
              <div style={{ position: "relative" }}>
                <select name="faculty" value={certificateData.faculty} onChange={handleChange}
                  style={{ width: "100%", height: "40px", borderRadius: "12px", padding: "0 36px 0 14px", border: "1px solid #d1d5db", fontSize: "13px", appearance: "none" }}>
                  <option value="">Select Faculty</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>{f.fullName}</option>
                  ))}
                </select>
                <ChevronDown size={16} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>
            </div>

            <div className="modal-group">
              <label>Upload Certificate {modalMode === "edit" ? "(optional)" : "*"}</label>
              <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                <Upload size={24} />
                <p>Click to upload certificate</p>
                {certificateData.file && <span className="selected-file">{certificateData.file.name}</span>}
                {!certificateData.file && modalMode === "edit" && editingCert?.fileName && (
                  <span className="selected-file" style={{ color: "#6b7280" }}>Current: {editingCert.fileName}</span>
                )}
              </div>
              <input type="file" accept="application/pdf,image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            <button className="submit-certificate-btn" onClick={handleCertificateSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : modalBtn}
            </button>
          </div>
        </div>
      )}

      <ConfirmToast
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        busy={deleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteCertificates(deleteConfirm.items)}
      />
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />

    </div>
  );
};

export default Certificates;
