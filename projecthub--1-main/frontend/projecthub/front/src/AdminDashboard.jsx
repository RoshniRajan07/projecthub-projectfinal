import React, { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminDashboard.css";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  LogOut,
  Download,
  UserPlus,
  FileText,
  TrendingUp,
  BookOpen,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  BarChart3,
  User,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8081";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Admin");

  const [analytics, setAnalytics] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        return data;
      }
    } catch (error) { console.error("Analytics fetch error:", error); }
    return {};
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(
          data
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5)
        );
        return data;
      }
    } catch (error) { console.error("Audit logs fetch error:", error); }
    return [];
  }, [token]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchAnalytics();
    fetchAuditLogs();
  }, [token, userId, navigate, fetchAnalytics, fetchAuditLogs]);

  const approvalRate = analytics.totalProjects
    ? Math.round((analytics.approvedProjects / analytics.totalProjects) * 100)
    : 0;

  const pendingCertificates = analytics.pendingCertificates ?? 0;

  const handleExportPDF = async () => {
    const latestAnalytics = await fetchAnalytics();
    const reportData = Object.keys(latestAnalytics).length ? latestAnalytics : analytics;
    const latestApprovalRate = reportData.totalProjects
      ? Math.round((reportData.approvedProjects / reportData.totalProjects) * 100)
      : 0;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("ProjectHub+ Analytics Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.setFontSize(14);
    doc.text("Dashboard Summary", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Category", "Count"]],
      body: [
        ["Total Users", reportData.totalUsers || 0],
        ["Faculty", reportData.facultyCount || 0],
        ["Total Projects", reportData.totalProjects || 0],
        ["Approved Projects", reportData.approvedProjects || 0],
        ["Pending Projects", reportData.pendingProjects || 0],
        ["Total Certificates", reportData.totalCertificates || 0],
        ["Approved Certificates", reportData.approvedCertificates || 0],
        ["Approval Rate", `${latestApprovalRate}%`]
      ]
    });

    doc.save("ProjectHub_Analytics.pdf");
  };

  const refreshDashboard = async () => {
    await Promise.all([fetchAnalytics(), fetchAuditLogs()]);
  };

  const refreshAndNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await refreshDashboard();
    localStorage.clear();
    navigate("/");
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
    <div className="faculty-page">

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
            <div className="menu-item active" onClick={refreshDashboard}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/manage-users")}>
              <Users size={20} /><span>Manage Users</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/view-submissions")}>
              <FileText size={20} /><span>View Submissions</span>
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
            <div className="user-text">
              <h4>{fullName}</h4>
              <p>Admin</p>
            </div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="faculty-main">

        <div className="faculty-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System overview and management.</p>
          </div>
          <button className="export-btn" onClick={handleExportPDF}>
            <Download size={18} /> Export Analytics
          </button>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="card-top">
              <span>Total Users</span>
              <UserPlus className="gold" />
            </div>
            <h2>{analytics.totalUsers || 0}</h2>
            <p className="admin-small-text">{analytics.facultyCount || 0} Faculty</p>
          </div>

          <div className="stat-card">
            <div className="card-top">
              <span>Total Submissions</span>
              <FileText className="blue" />
            </div>
            <h2>{analytics.totalProjects || 0}</h2>
            <p className="admin-small-text">{analytics.pendingProjects || 0} Pending</p>
          </div>

          <div className="stat-card">
            <div className="card-top">
              <span>Approval Rate</span>
              <TrendingUp className="green" />
            </div>
            <h2>{approvalRate}%</h2>
            <p className="admin-small-text">{analytics.approvedProjects || 0} Approved</p>
          </div>

          <div className="stat-card">
            <div className="card-top">
              <span>Active Faculty</span>
              <BookOpen className="orange" />
            </div>
            <h2>{analytics.facultyCount || 0}</h2>
            <p className="admin-small-text">Managing projects</p>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="bottom-grid">

          {/* CERTIFICATE STATS */}
          <div className="small-card">
            <div className="small-card-header">
              <h3>Certificate Verification</h3>
              <ShieldCheck size={22} className="gold" />
            </div>
            <div className="admin-verification-list">
              <div className="admin-row">
                <span>Total Certificates</span>
                <strong>{analytics.totalCertificates || 0}</strong>
              </div>
              <div className="admin-row">
                <span>Verified</span>
                <strong className="green-text">{analytics.approvedCertificates || 0}</strong>
              </div>
              <div className="admin-row">
                <span>Pending Verification</span>
                <strong className="yellow-text">{pendingCertificates}</strong>
              </div>
              <div className="admin-row">
                <span>Project Approval Rate</span>
                <strong className="green-text">{approvalRate}%</strong>
              </div>
              <div className="admin-row">
                <span>Pending Project Reviews</span>
                <strong className="yellow-text">{analytics.pendingProjects || 0}</strong>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="small-card">
            <div className="small-card-header">
              <h3>Recent Activity</h3>
              <Clock3 size={22} className="gold" />
            </div>
            <div className="admin-activity-list">
              {auditLogs.length === 0 ? (
                <p style={{ color: "#888", padding: "1rem" }}>No recent activity.</p>
              ) : (
                auditLogs.map((log) => (
                  <div className="admin-activity-item" key={log.id}>
                    <div>
                      <AlertTriangle size={18} />
                      <span>{log.description || log.actionTitle}</span>
                    </div>
                    <p>{formatTime(log.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="quick-actions-grid">
          <div className="quick-card" onClick={() => refreshAndNavigate("/manage-users")}>
            <Users size={28} /><h3>Manage Users</h3>
          </div>
          <div className="quick-card" onClick={() => refreshAndNavigate("/admin-settings")}>
            <BarChart3 size={28} /><h3>System Settings</h3>
          </div>
          <div className="quick-card" onClick={() => refreshAndNavigate("/view-submissions")}>
            <FileText size={28} /><h3>View Submissions</h3>
          </div>
          <div className="quick-card" onClick={() => refreshAndNavigate("/admin-notifications")}>
            <Bell size={28} /><h3>Notifications</h3>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
