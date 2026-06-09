import React, { useEffect, useState, useCallback } from "react";
import "./Notifications.css";
import {
  LayoutDashboard, Upload, Award, User, Bell, LogOut,
  CheckCircle2, FileText, AlertCircle, Clock3, Trash2, Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmToast from "./ConfirmToast";

const API = "http://localhost:8081";

const Notifications = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Student");

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
      }
    } catch (error) { console.error("Notifications fetch error:", error); }
    setLoading(false);
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

  const handleDelete = (item) => {
    setDeleteConfirm({
      title: "Delete notification?",
      message: `Delete "${item.title}"? This cannot be undone.`,
      items: [item],
    });
  };

  const handleMarkRead = async () => {
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

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

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
    <div className="notifications-page">

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
            <div className="menu-item" onClick={() => navigate("/certificates")}><Award size={20} /><span>Certificates</span></div>
            <div className="menu-item" onClick={() => navigate("/profile")}><User size={20} /><span>Profile</span></div>
            <div className="menu-item active"><Bell size={20} /><span>Notifications</span></div>
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
      <main className="notifications-main">

        {/* HEADER */}
        <div className="notifications-header">
          <div className="header-left">
            <h1>Notifications</h1>
            <p>Stay updated on your submissions and reviews.</p>
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="new-btn">{unreadCount} new</button>
            )}
            <button className="mark-btn" onClick={handleMarkRead}>Mark all read</button>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        {loading && (
          <p style={{ padding: "1rem", color: "#888" }}>Loading...</p>
        )}

        {!loading && notifications.length === 0 && (
          <p style={{ padding: "1rem", color: "#888" }}>No notifications yet.</p>
        )}

        {!loading && notifications.map((item) => (
          <div
            key={item.id}
            className={`notification-card ${!item.read ? "unread-card" : "read-card"}`}
          >
            <div className="notification-left">
              <div className={`icon-box ${item.type}`}>
                {item.type === "success" && <CheckCircle2 size={24} />}
                {item.type === "info" && <FileText size={24} />}
                {item.type === "danger" && <AlertCircle size={24} />}
                {item.type === "warning" && <Clock3 size={24} />}
              </div>

              <div className="notification-content">
                <h3>
                  {item.title}
                  {!item.read && <span className="dot"></span>}
                </h3>
                <p>{item.message}</p>
                <span>{formatTime(item.createdAt)}</span>
              </div>
            </div>

            <Trash2 className="delete-icon" onClick={() => handleDelete(item)} />
          </div>
        ))}

      </main>
      <ConfirmToast
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        busy={deleting}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => deleteNotifications(deleteConfirm.items)}
      />
    </div>
  );
};

export default Notifications;
