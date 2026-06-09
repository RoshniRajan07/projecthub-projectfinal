import React, { useState, useEffect, useCallback } from "react";
import "./Dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Upload,
  Award,
  User,
  Bell,
  Download,
  FileText,
  CheckCircle,
  Clock,
  LogOut,
  Menu
} from "lucide-react";

const API = "http://localhost:8081";

export default function Dashboard() {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Student");

  const [analytics, setAnalytics] = useState({
    totalProjects: 0,
    approvedProjects: 0,
    pendingProjects: 0,
    rejectedProjects: 0
  });
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [analyticsRes, projectsRes, certsRes, profileRes] = await Promise.all([
        fetch(`${API}/projects/analytics/student/${userId}`, { headers }),
        fetch(`${API}/projects/mongo/student/${userId}`, { headers }),
        fetch(`${API}/certificates/student/${userId}`, { headers }),
        fetch(`${API}/users/student/profile/${userId}`, { headers })
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (certsRes.ok) setCertificates(await certsRes.json());
      if (profileRes.ok) setProfile(await profileRes.json());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
    setLoading(false);
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [token, userId, navigate, fetchDashboardData]);

  const projectStats = projects.length > 0
    ? {
        totalProjects: projects.length,
        approvedProjects: projects.filter(p => p.status?.toLowerCase() === "approved").length,
        pendingProjects: projects.filter(p => ["pending", "resubmitted"].includes(p.status?.toLowerCase())).length,
        rejectedProjects: projects.filter(p => p.status?.toLowerCase() === "rejected").length
      }
    : analytics;

  const verifiedCerts = certificates.filter(c => c.status?.toLowerCase() === "approved").length;

  const handleExportPDF = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    let exportAnalytics = projectStats;
    let exportProjects = projects;
    let exportCertificates = certificates;

    try {
      const [analyticsRes, projectsRes, certsRes] = await Promise.all([
        fetch(`${API}/projects/analytics/student/${userId}`, { headers }),
        fetch(`${API}/projects/mongo/student/${userId}`, { headers }),
        fetch(`${API}/certificates/student/${userId}`, { headers })
      ]);

      if (analyticsRes.ok) exportAnalytics = await analyticsRes.json();
      if (projectsRes.ok) exportProjects = await projectsRes.json();
      if (certsRes.ok) exportCertificates = await certsRes.json();
    } catch (error) {
      console.error("Export data fetch error:", error);
    }

    if (exportProjects.length > 0) {
      exportAnalytics = {
        totalProjects: exportProjects.length,
        approvedProjects: exportProjects.filter(p => p.status?.toLowerCase() === "approved").length,
        pendingProjects: exportProjects.filter(p => p.status?.toLowerCase() === "pending").length,
        rejectedProjects: exportProjects.filter(p => p.status?.toLowerCase() === "rejected").length
      };
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Student Academic Report", 14, 20);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Student: ${fullName}`, 14, 37);

    doc.setFontSize(15);
    doc.text("Dashboard Summary", 14, 50);

    autoTable(doc, {
      startY: 57,
      head: [["Category", "Value"]],
      body: [
        ["Total Submissions", exportAnalytics.totalProjects],
        ["Approved Projects", exportAnalytics.approvedProjects],
        ["Certificates", exportCertificates.length],
        ["Pending Review", exportAnalytics.pendingProjects],
        ["Rejected", exportAnalytics.rejectedProjects]
      ]
    });

    if (exportProjects.length > 0) {
      doc.setFontSize(15);
      doc.text("Recent Submissions", 14, doc.lastAutoTable.finalY + 15);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [["Project", "Technology", "Status", "Date"]],
        body: exportProjects.slice(0, 10).map(p => [
          p.title,
          p.technology,
          p.status,
          p.submittedDate ? new Date(p.submittedDate).toLocaleDateString() : "-"
        ])
      });
    }

    doc.save("Student_Report.pdf");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    navigate("/");
  };

  return (
    <div className="dashboard">

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
            <div className="menu-item active">
              <LayoutDashboard size={18} /> Dashboard
            </div>
            <div className="menu-item" onClick={() => navigate("/submit-project")}>
              <Upload size={18} />
              <span>Submit Project</span>
            </div>
            <div className="menu-item" onClick={() => navigate("/certificates")}>
              <Award size={18} /> Certificates
            </div>
            <div className="menu-item" onClick={() => navigate("/profile")}>
              <User size={18} /> Profile
            </div>
            <div className="menu-item" onClick={() => navigate("/notifications")}>
              <Bell size={18} /> Notifications
            </div>
          </div>
        </div>

        {/* USER */}
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text">
              <h4>{fullName}</h4>
              <p>Student</p>
            </div>
          </div>

          <div className="logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className="header">
          <div className="header-left">
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {fullName}! Here&#39;s your academic overview.</p>
          </div>

          <button className="export-btn" onClick={handleExportPDF}>
            <Download size={16} /> Export Report
          </button>
        </div>

        {/* CARDS */}
        <div className="cards">
          <div className="card">
            <div className="card-top">
              <span>Total Submissions</span>
              <FileText className="icon gold" />
            </div>
            <h2>{projectStats.totalProjects}</h2>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Approved Projects</span>
              <CheckCircle className="icon green" />
            </div>
            <h2>{projectStats.approvedProjects}</h2>
            <p className="sub">
              {projectStats.totalProjects > 0
                ? `${Math.round((projectStats.approvedProjects / projectStats.totalProjects) * 100)}% approval`
                : "No submissions yet"}
            </p>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Certificates</span>
              <Award className="icon blue" />
            </div>
            <h2>{certificates.length}</h2>
            <p className="sub">{verifiedCerts} verified</p>
          </div>

          <div className="card">
            <div className="card-top">
              <span>Pending Review</span>
              <Clock className="icon orange" />
            </div>
            <h2>{projectStats.pendingProjects}</h2>
          </div>
        </div>

        {/* RECENT SUBMISSIONS */}
        <div className="recent">
          <div className="recent-header">
            <h3>Recent Submissions</h3>
            <span className="view" onClick={() => navigate("/submit-project")}>View All</span>
          </div>

          {loading && <p style={{ padding: "1rem", color: "#888" }}>Loading...</p>}
          {!loading && projects.length === 0 && <p style={{ padding: "1rem", color: "#888" }}>No submissions yet.</p>}

          {!loading && projects.slice(0, 5).map((p) => (
            <div className="recent-item" key={p.id}>
              <div className="left">
                <div className="file-icon">
                  <FileText size={20} />
                </div>
                <div>
                  <h5>{p.title}</h5>
                  <h5>{p.technology} · {p.subject}</h5>
                </div>
              </div>

              <div className="right">
                <span className={`status ${p.status?.toLowerCase()}`}>{p.status?.toLowerCase()}</span>
                <span className="date">
                  {p.submittedDate ? new Date(p.submittedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* EXTRA SECTION */}
        <div className="extra-section">
          <div className="extra-top">

            {/* CERTIFICATES */}
            <div className="extra-card">
              <div className="extra-header">
                <h3>Certificates</h3>
                <span className="link" onClick={() => navigate("/certificates")}>Manage</span>
              </div>

              {loading && <p style={{ padding: "0.5rem", color: "#888" }}>Loading...</p>}
              {!loading && certificates.length === 0 && <p style={{ padding: "0.5rem", color: "#888" }}>No certificates yet.</p>}

              {!loading && certificates.slice(0, 3).map((c) => (
                <div className="extra-item" key={c.id}>
                  <div>
                    <h4>{c.title}</h4>
                    <p>{c.organization}</p>
                  </div>
                  <span className={`status ${c.status?.toLowerCase()}`}>{c.status?.toLowerCase()}</span>
                </div>
              ))}
            </div>

            {/* PROFILES */}
            <div className="extra-card">
              <div className="extra-header">
                <h3>Professional Profiles</h3>
                <span className="link" onClick={() => navigate("/profile")}>Edit</span>
              </div>

              {profile.githubUrl && (
                <div className="profile-item">
                  <span>GitHub</span>
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer">{profile.githubUrl} ↗</a>
                </div>
              )}
              {profile.linkedinUrl && (
                <div className="profile-item">
                  <span>LinkedIn</span>
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer">{profile.linkedinUrl} ↗</a>
                </div>
              )}
              {profile.leetcodeUrl && (
                <div className="profile-item">
                  <span>LeetCode</span>
                  <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer">{profile.leetcodeUrl} ↗</a>
                </div>
              )}
              {profile.hackerrankUrl && (
                <div className="profile-item">
                  <span>HackerRank</span>
                  <a href={profile.hackerrankUrl} target="_blank" rel="noreferrer">{profile.hackerrankUrl} ↗</a>
                </div>
              )}
              {!profile.githubUrl && !profile.linkedinUrl && !profile.leetcodeUrl && !profile.hackerrankUrl && (
                <p style={{ padding: "0.5rem", color: "#888" }}>No profiles added yet.</p>
              )}
            </div>

          </div>

          {/* ANALYTICS */}
          <div className="analytics">
            <div className="analytics-header">
              <h3>Academic Analytics Summary</h3>
            </div>

            <div className="analytics-cards">
              <div className="analytics-box gold">
                <h2>{projectStats.totalProjects}</h2>
                <p>Total Projects</p>
              </div>
              <div className="analytics-box green">
                <h2>{projectStats.approvedProjects}</h2>
                <p>Approved</p>
              </div>
              <div className="analytics-box blue">
                <h2>{verifiedCerts}</h2>
                <p>Verified Certs</p>
              </div>
              <div className="analytics-box orange">
                <h2>{projectStats.rejectedProjects}</h2>
                <p>Rejected</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
