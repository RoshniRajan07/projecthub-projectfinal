import React, { useEffect, useState, useCallback } from "react";
import "./AdminNotifications.css";
import {
  Bell,
  FileText,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Trash2,
  UserPlus,
  Clock3,
  AlertTriangle,
  User,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmToast from "./ConfirmToast";

const API = "http://localhost:8081";

const AdminNotifications = () => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Admin");

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
    if (t.includes("user") || t.includes("register")) return <UserPlus size={24} />;
    if (t.includes("project") || t.includes("certificate")) return <FileText size={24} />;
    if (t.includes("deadline") || t.includes("reminder")) return <Clock3 size={24} />;
    if (t.includes("alert") || t.includes("reject")) return <AlertTriangle size={24} />;
    return <Bell size={24} />;
  };

  return (
    <div className="notifications-page">

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
            <div className="menu-item" onClick={() => refreshAndNavigate("/view-submissions")}>
              <FileText size={20} /><span>View Submissions</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-settings")}>
              <Settings size={20} /><span>Settings</span>
            </div>
            <div className="menu-item" onClick={() => refreshAndNavigate("/admin-profile")}>
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
            <div className="user-text"><h4>{fullName}</h4><p>Admin</p></div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="notifications-main">

        <div className="notifications-header">
          <div className="header-left">
            <h1>Notifications</h1>
            <p>Stay updated on system alerts and user activity.</p>
          </div>
          <div className="notification-actions">
            {unreadCount > 0 && <div className="new-count">{unreadCount} new</div>}
            <button className="mark-read-btn" onClick={handleMarkAllRead}>Mark all read</button>
          </div>
        </div>

        <div className="notifications-list">
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
                        {!item.read && <span className="yellow-dot"></span>}
                      </h3>
                      <p>{item.message}</p>
                      <span>{formatTime(item.createdAt)}</span>
                    </div>
                  </div>
                  <div className="delete-notification" onClick={() => handleDelete(item)}>
                    <Trash2 size={22} />
                  </div>
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

export default AdminNotifications;
