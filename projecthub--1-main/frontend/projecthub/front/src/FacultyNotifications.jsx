import React, { useEffect, useState, useCallback } from "react";
import "./FacultyNotifications.css";
import {
  LayoutDashboard,
  BookOpen,
  ShieldCheck,
  Bell,
  LogOut,
  User,
  Users,
  FileText,
  Award,
  Clock3,
  Trash2,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmToast from "./ConfirmToast";

const API = "http://localhost:8081";

const FacultyNotifications = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Faculty");

  const [notifications, setNotifications] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        setLoading(false);
        return data;
      }
    } catch (error) { console.error("Notifications fetch error:", error); }
    setLoading(false);
    return [];
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchNotifications();
  }, [token, userId, navigate, fetchNotifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const deleteNotifications = async (items) => {
    setDeleting(true);
    try {
      await Promise.all(items.map((item) =>
        fetch(`${API}/users/notifications/${item.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      const deletedIds = items.map((item) => item.id);
      setNotifications((prev) => prev.filter((item) => !deletedIds.includes(item.id)));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDelete = async (item) => {
    const latest = await fetchNotifications();
    const latestItem = latest.find((entry) => entry.id === item.id) || item;
    setDeleteConfirm({
      title: "Delete notification?",
      message: `Delete "${latestItem.title}"? This cannot be undone.`,
      items: [latestItem],
    });
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((item) => !item.read);
      await Promise.all(
        unread.map((item) =>
          fetch(`${API}/users/notifications/read/${item.id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
          })
        )
      );
      setNotifications(notifications.map((item) => ({ ...item, read: true })));
    } catch (error) { console.error("Mark read error:", error); }
  };

  const refreshAndNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await fetchNotifications();
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

  const getIcon = (title) => {
    if (!title) return <Bell size={24} />;
    const t = title.toLowerCase();
    if (t.includes("project") || t.includes("submission")) return <FileText size={24} />;
    if (t.includes("certificate")) return <Award size={24} />;
    if (t.includes("deadline") || t.includes("reminder")) return <Clock3 size={24} />;
    return <Bell size={24} />;
  };

  return (
    <div className="faculty-notification-page">

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
            <div className="menu-item" onClick={() => refreshAndNavigate("/faculty-dashboard")}>
              <LayoutDashboard size={20} /><span>Dashboard</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/review-projects")}>
              <BookOpen size={20} /><span>Review Projects</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/assigned-students")}>
              <Users size={20} /><span>Assigned Students</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/verify-certificates")}>
              <ShieldCheck size={20} /><span>Verify Certificates</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/faculty-profile")}>
              <User size={20} /><span>Profile</span>
            </div>
            <div className="menu-item active" onClick={fetchNotifications}>
              <Bell size={20} /><span>Notifications</span>
            </div>
          </div>
        </div>

        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text">
              <h4>{fullName}</h4>
              <p>Faculty</p>
            </div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="faculty-notification-page-main">

        <div className="faculty-notification-page-header">
          <div className="faculty-notification-page-left-header">
            <h1>Notifications</h1>
            <p>Stay updated on submissions and reviews.</p>
          </div>
          <div className="faculty-notification-page-actions">
            {unreadCount > 0 && <div className="unread-count">{unreadCount} new</div>}
            <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all read</button>
          </div>
        </div>

        <div className="notification-list">
          {loading ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No notifications yet.</p>
          ) : (
            notifications.map((item) => (
                <div
                  key={item.id}
                  className={item.read ? "notification-card" : "notification-card unread"}
                >
                  <div className="notification-left">
                    <div className="notification-icon">{getIcon(item.title)}</div>
                    <div className="notification-content">
                      <h3>
                        {item.title}
                        {!item.read && <span className="dot"></span>}
                      </h3>
                      <p>{item.message}</p>
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(item)}>
                    <Trash2 size={20} />
                  </button>
                </div>
            ))
          )}
        </div>
      </main>
      <ConfirmToast
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        busy={deleting}
        onCancel={async () => { await fetchNotifications(); setDeleteConfirm(null); }}
        onConfirm={() => deleteNotifications(deleteConfirm.items)}
      />
    </div>
  );
};

export default FacultyNotifications;
