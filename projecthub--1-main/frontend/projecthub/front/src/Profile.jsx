import React, { useState, useEffect, useCallback } from "react";
import "./Profile.css";
import {
  LayoutDashboard,
  Upload,
  Award,
  User,
  Bell,
  FileText,
  LogOut,
  ExternalLink,
  ChevronDown,
  BookOpen,
  ShieldCheck,
  Users,
  Settings,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8081";

const profileLinkFields = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/username" },
  { key: "hackerrank", label: "HackerRank", placeholder: "https://hackerrank.com/username" },
  { key: "portfolio", label: "Portfolio", placeholder: "https://yourportfolio.com" },
];

const getExternalUrl = (value) => {
  const url = value.trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const roleConfigs = {
  STUDENT: {
    subtitle: "Manage your personal details and professional profiles.",
    roleLabel: "Student",
    activePath: "/profile",
    idLabel: "Register Number",
    menu: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Submit Project", path: "/submit-project", icon: Upload },
      { label: "Certificates", path: "/certificates", icon: Award },
      { label: "Profile", path: "/profile", icon: User },
      { label: "Notifications", path: "/notifications", icon: Bell },
    ],
  },
  FACULTY: {
    subtitle: "Manage your faculty details and professional profiles.",
    roleLabel: "Faculty",
    activePath: "/faculty-profile",
    idLabel: "Faculty ID",
    menu: [
      { label: "Dashboard", path: "/faculty-dashboard", icon: LayoutDashboard },
      { label: "Review Projects", path: "/review-projects", icon: BookOpen },
      { label: "Assigned Students", path: "/assigned-students", icon: Users },
      { label: "Verify Certificates", path: "/verify-certificates", icon: ShieldCheck },
      { label: "Profile", path: "/faculty-profile", icon: User },
      { label: "Notifications", path: "/faculty-notifications", icon: Bell },
    ],
  },
  ADMIN: {
    subtitle: "Manage your admin details and professional profiles.",
    roleLabel: "Admin",
    activePath: "/admin-profile",
    idLabel: "Admin ID",
    menu: [
      { label: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
      { label: "Manage Users", path: "/manage-users", icon: Users },
      { label: "View Submissions", path: "/view-submissions", icon: FileText },
      { label: "Settings", path: "/admin-settings", icon: Settings },
      { label: "Profile", path: "/admin-profile", icon: User },
      { label: "Notifications", path: "/admin-notifications", icon: Bell },
    ],
  },
};

const Profile = ({ role: roleProp }) => {
  const navigate = useNavigate();

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "User");
  const [role] = useState(() => roleProp || localStorage.getItem("role") || "STUDENT");

  const config = roleConfigs[role] || roleConfigs.STUDENT;

  // Personal info is always read-only for student/faculty (admin assigns it)
  const isPersonalReadOnly = role !== "ADMIN";
  // Professional profiles are editable by students
  const isProfileLinksEditable = role === "STUDENT";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    section: "",
    enrollmentYear: "",
    studentCode: "",
    facultyCode: "",
    github: "",
    linkedin: "",
    leetcode: "",
    hackerrank: "",
    portfolio: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/student/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          fullName: data.user?.fullName || "",
          email: data.user?.email || "",
          department: data.department || "",
          section: data.section || "",
          enrollmentYear: data.enrollmentYear || "",
          studentCode: data.studentCode || "",
          github: data.githubUrl || "",
          linkedin: data.linkedinUrl || "",
          leetcode: data.leetcodeUrl || "",
          hackerrank: data.hackerrankUrl || "",
          portfolio: data.portfolioUrl || "",
        });
        return data;
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
    return null;
  }, [token, userId]);

  const fetchBasicProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users/faculty/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          fullName: data.user?.fullName || "",
          email: data.user?.email || "",
          department: data.department || "",
          section: data.section || "",
          enrollmentYear: data.joiningYear || "",
          facultyCode: data.facultyCode || `FAC-${String(userId).padStart(3, '0')}`,
        }));
        return data;
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
    return null;
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) {
      navigate("/");
      return;
    }
    const loadProfile = async () => {
      if (role === "STUDENT") {
        await fetchProfile();
      } else {
        await fetchBasicProfile();
      }
    };
    loadProfile();
  }, [token, userId, navigate, role, fetchProfile, fetchBasicProfile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const refreshProfile = async () => {
    if (role === "STUDENT") {
      await fetchProfile();
    } else {
      await fetchBasicProfile();
    }
  };

  const refreshAndNavigate = (path) => {
    navigate(path);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    if (role === "STUDENT") {
      // Students can only save professional profile links
      const payload = {
        githubUrl: formData.github,
        linkedinUrl: formData.linkedin,
        leetcodeUrl: formData.leetcode,
        hackerrankUrl: formData.hackerrank,
        portfolioUrl: formData.portfolio,
      };

      try {
        const res = await fetch(`${API}/users/student/profile/${userId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) await fetchProfile();
        if (res.ok) {
          setMessage("Profile links saved successfully ✅");
        } else {
          setMessage("Failed to save profile");
        }
      } catch {
        setMessage("Server error. Please try again.");
      }
    } else if (role === "ADMIN") {
      // Admin can save everything (when viewing their own profile via faculty endpoint)
      const payload = {
        user: { fullName: formData.fullName, email: formData.email },
        department: formData.department,
        section: formData.section,
        joiningYear: formData.enrollmentYear,
        facultyCode: formData.facultyCode,
      };
      try {
        const res = await fetch(`${API}/users/faculty/profile/${userId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) await fetchBasicProfile();
        if (res.ok) {
          setMessage("Profile saved successfully ✅");
          localStorage.setItem("fullName", formData.fullName);
          setFullName(formData.fullName);
        } else {
          setMessage("Failed to save profile");
        }
      } catch {
        setMessage("Server error. Please try again.");
      }
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await refreshProfile();
    localStorage.clear();
    navigate("/");
  };

  const selectStyle = {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "14px 40px 14px 14px",
    fontSize: "14px",
    outline: "none",
    background: "white",
    color: "#111827",
    boxSizing: "border-box",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <div className="profile-page">
      {/* MOBILE HAMBURGER */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div>
          <div className="logo">
            <div className="logo-box">🎓</div>
            <h2>ProjectHub<span>+</span></h2>
          </div>
          <div className="menu">
            {config.menu.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  className={item.path === config.activePath ? "menu-item active" : "menu-item"}
                  onClick={() => item.path === config.activePath ? refreshProfile() : refreshAndNavigate(item.path)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="user-section">
          <div className="user">
            <div className="avatar">{fullName.charAt(0)}</div>
            <div className="user-text">
              <h4>{fullName}</h4>
              <p>{config.roleLabel}</p>
            </div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      <main className="profile-main">
        <div className="profile-header">
          <div className="profile-header-left">
            <h1>Profile</h1>
            <p>{config.subtitle}</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="top-profile">
            <div className="profile-avatar">{formData.fullName.charAt(0) || "U"}</div>
            <div>
              <h2>{formData.fullName}</h2>
              <p>{formData.email}</p>
              <span>{config.roleLabel} {role === "STUDENT" && formData.studentCode ? `- ${formData.studentCode}` : ""}{role === "FACULTY" && formData.facultyCode ? ` - ${formData.facultyCode}` : ""}</span>
            </div>
          </div>

          <div className="profile-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={isPersonalReadOnly} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange} disabled={isPersonalReadOnly} />
            </div>
            {role === "STUDENT" && (
              <div className="input-group">
                <label>{config.idLabel}</label>
                <input type="text" name="studentCode" value={formData.studentCode} onChange={handleChange} placeholder="Enter your register number" disabled={isPersonalReadOnly} />
              </div>
            )}
            {role === "FACULTY" && (
              <div className="input-group">
                <label>{config.idLabel}</label>
                <input type="text" name="facultyCode" value={formData.facultyCode} onChange={handleChange} placeholder="Enter your faculty ID" disabled={isPersonalReadOnly} />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr", gap: "20px", marginTop: "4px" }}>
            <div className="input-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={isPersonalReadOnly} />
            </div>
            <div className="input-group">
              <label>Section</label>
              <div style={{ position: "relative" }}>
                <select name="section" value={formData.section} onChange={handleChange} style={selectStyle} disabled={isPersonalReadOnly}>
                  <option value="">-</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <ChevronDown size={18} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#6b7280" }} />
              </div>
            </div>
            <div className="input-group">
              <label>{role === "STUDENT" ? "Enrollment Year" : "Joining Year"}</label>
              <input type="text" name="enrollmentYear" value={formData.enrollmentYear} onChange={handleChange} disabled={isPersonalReadOnly} />
            </div>
          </div>
        </div>

        {role === "STUDENT" && (
          <div className="professional-card">
            <h2>Professional Profiles</h2>
            <p>Add your coding profile URLs for faculty review and portfolio.</p>

            {profileLinkFields.map(({ key, label, placeholder }) => {
              const externalUrl = getExternalUrl(formData[key] || "");
              return (
                <div className="profile-link-row" key={key}>
                  <label>{label}</label>
                  <div className="profile-link-input">
                    <input
                      type="text"
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      placeholder={placeholder}
                    />
                    {externalUrl ? (
                      <a
                        className="profile-link-action"
                        href={externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        title={`Open ${label}`}
                        aria-label={`Open ${label}`}
                      >
                        <ExternalLink size={18} />
                      </a>
                    ) : (
                      <span className="profile-link-action disabled" title={`Add ${label} URL`}>
                        <ExternalLink size={18} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {message && (
          <p style={{ margin: "14px 0", fontSize: "14px", color: message.includes("✅") ? "green" : "red" }}>{message}</p>
        )}

        {(isProfileLinksEditable || role === "ADMIN") && (
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}

        {role === "FACULTY" && (
          <p style={{ margin: "14px 0", fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>
            Profile can only be edited by an administrator.
          </p>
        )}
      </main>
    </div>
  );
};

export default Profile;
