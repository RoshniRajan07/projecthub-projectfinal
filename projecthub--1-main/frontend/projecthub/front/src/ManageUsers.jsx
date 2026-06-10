import React, { useState, useEffect, useRef, useCallback } from "react";
import "./AdminDashboard.css";
import "./ManageUsers.css";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  LogOut,
  Search,
  ChevronDown,
  UserPlus,
  Pencil,
  Trash2,
  User,
  FileText,
  Upload,
  X,
  Menu
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConfirmToast from "./ConfirmToast";

const API = "http://localhost:8081";
const EMPTY_USER = { fullName: "", email: "", role: "", password: "", department: "", section: "", studentCode: "", enrollmentYear: "", facultyCode: "", joiningYear: "" };

const ManageUsers = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [token] = useState(() => localStorage.getItem("token"));
  const [userId] = useState(() => localStorage.getItem("userId"));
  const [fullName] = useState(() => localStorage.getItem("fullName") || "Admin");

  const [users, setUsers] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        const enrichedData = await Promise.all(data.map(async (user) => {
          const roleKey = (user.role || "").toUpperCase();
          if (roleKey !== "STUDENT" && roleKey !== "FACULTY") return user;

          const profilePath = roleKey === "STUDENT" ? "student" : "faculty";
          try {
            const profileRes = await fetch(`${API}/users/${profilePath}/profile/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              return {
                ...user,
                department: profile.department || user.department || "",
                section: profile.section || user.section || "",
                studentCode: profile.studentCode || user.studentCode || "",
                enrollmentYear: profile.enrollmentYear || user.enrollmentYear || "",
                facultyCode: profile.facultyCode || user.facultyCode || "",
                joiningYear: profile.joiningYear || user.joiningYear || ""
              };
            }
          } catch (error) {
            console.error("Fetch profile error:", error);
          }
          return user;
        }));
        setUsers(enrichedData);
        return enrichedData;
      }
    } catch (error) { console.error("Fetch users error:", error); }
    return [];
  }, [token]);

  useEffect(() => {
    if (!token || !userId) { navigate("/"); return; }
    fetchUsers();
  }, [token, userId, navigate, fetchUsers]);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      (user.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = role === "All Roles" ? true : (user.role || "").toUpperCase() === role.toUpperCase();
    return matchSearch && matchRole;
  });

  const deleteUsers = async (items) => {
    setDeleting(true);
    try {
      await Promise.all(items.map((user) =>
        fetch(`${API}/users/${user.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      const deletedIds = items.map((user) => user.id);
      setUsers((prev) => prev.filter((user) => !deletedIds.includes(user.id)));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  const openBulkModal = async () => {
    setShowBulkModal(true);
    setBulkFile(null);
    setBulkResult(null);
    fetchUsers();
  };

  const openAddModal = async () => {
    setNewUser(EMPTY_USER);
    setShowAddModal(true);
    fetchUsers();
  };

  const toggleRoleDropdown = async () => {
    setShowDropdown(!showDropdown);
    fetchUsers();
  };

  const selectRoleFilter = async (nextRole) => {
    setRole(nextRole);
    setShowDropdown(false);
    fetchUsers();
  };

  const refreshAndNavigate = (path) => {
    navigate(path);
  };

  const closeEditModal = async () => {
    setEditUser(null);
    fetchUsers();
  };

  const closeAddModal = async () => {
    setShowAddModal(false);
    fetchUsers();
  };

  const closeBulkModal = async () => {
    setShowBulkModal(false);
    fetchUsers();
  };

  const openFilePicker = async () => {
    fileInputRef.current?.click();
    fetchUsers();
  };

  const handleDelete = async (user) => {
    const latestUsers = await fetchUsers();
    const latestUser = latestUsers.find((item) => item.id === user.id) || user;
    setDeleteConfirm({
      title: "Delete user?",
      message: `Delete "${latestUser.fullName}"? This cannot be undone.`,
      items: [latestUser],
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName: editUser.fullName,
        email: editUser.email,
        role: editUser.role,
        department: editUser.department || "",
        section: editUser.section || "",
        studentCode: editUser.studentCode || "",
        enrollmentYear: editUser.enrollmentYear || "",
        facultyCode: editUser.facultyCode || "",
        joiningYear: editUser.joiningYear || ""
      };
      const res = await fetch(`${API}/users/${editUser.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
        setEditUser(null);
        fetchUsers();
      } else alert("Failed to update user");
    } catch (error) { console.error("Update error:", error); }
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.email || !newUser.role || !newUser.password) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newUser.fullName,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role.toUpperCase()
        })
      });
      if (res.ok) {
        const createdUser = await res.json();
        // Update role-specific fields via PUT /users/{id}
        if (createdUser && createdUser.id) {
          const profilePayload = {
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role.toUpperCase(),
            department: newUser.department,
            section: newUser.section,
            studentCode: newUser.studentCode,
            enrollmentYear: newUser.enrollmentYear,
            facultyCode: newUser.facultyCode,
            joiningYear: newUser.joiningYear
          };
          await fetch(`${API}/users/${createdUser.id}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(profilePayload)
          });
        }
        setShowAddModal(false);
        setNewUser(EMPTY_USER);
        fetchUsers();
      } else {
        const err = await res.text();
        alert(err.includes("registered") ? "Email already registered" : "Failed to create user");
      }
    } catch (error) { console.error("Create error:", error); }
  };

  const handleLogout = async () => {
    localStorage.clear();
    navigate("/");
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) { alert("Please select an Excel file"); return; }
    setBulkUploading(true);
    setBulkResult(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await fetch(`${API}/users/bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setBulkResult(data);
        fetchUsers();
      } else {
        const err = await res.text();
        alert("Upload failed: " + err);
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert("Bulk upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="faculty-page manage-users-page">

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
            <div className="menu-item active" onClick={fetchUsers}>
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
            <div className="user-text"><h4>{fullName}</h4><p>Admin</p></div>
          </div>
          <div className="logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="faculty-main manage-users-main">
        <div className="manage-users-header">
          <div>
            <h1>Manage Users</h1>
            <p>Create, edit and manage users.</p>
          </div>
          <div className="header-actions">
            <button className="bulk-upload-btn" onClick={openBulkModal}>
              <Upload size={18} /> Bulk Upload
            </button>
            <button className="add-user-btn" onClick={openAddModal}>
              <UserPlus size={18} /> Add User
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="manage-filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="role-dropdown" ref={dropdownRef}>
            <button className="role-btn" onClick={toggleRoleDropdown}>
              {role} <ChevronDown size={16} />
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                {["All Roles", "STUDENT", "FACULTY", "ADMIN"].map((r) => (
                  <div key={r} className="dropdown-item" onClick={() => selectRoleFilter(r)}>
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <h4>{user.fullName}</h4>
                      <p>{user.email}</p>
                    </div>
                  </td>
                  <td><span className={`role-badge ${((user.role || "").toLowerCase())}`}>{((user.role || "").toLowerCase())}</span></td>
                  <td>{user.department || "-"}</td>
                  <td>{((user.role || "").toUpperCase()) === "STUDENT" ? `STU-${String(user.id).padStart(3, "0")}` : ((user.role || "").toUpperCase()) === "FACULTY" ? `FAC-${String(user.id).padStart(3, "0")}` : `ADM-${String(user.id).padStart(3, "0")}`}</td>
                  <td>
                    <div className="action-cell">
                      <Pencil size={18} className="action-icon edit" onClick={async () => {
                        const editData = {
                          ...user,
                          department: user.department || "",
                          section: user.section || "",
                          studentCode: user.studentCode || "",
                          enrollmentYear: user.enrollmentYear || "",
                          facultyCode: user.facultyCode || "",
                          joiningYear: user.joiningYear || ""
                        };
                        try {
                          if (user.role === "STUDENT") {
                            const res = await fetch(`${API}/users/student/profile/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) { const d = await res.json(); editData.department = d.department || ""; editData.section = d.section || ""; editData.studentCode = d.studentCode || ""; editData.enrollmentYear = d.enrollmentYear || ""; }
                          } else if (user.role === "FACULTY") {
                            const res = await fetch(`${API}/users/faculty/profile/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });
                            if (res.ok) { const d = await res.json(); editData.department = d.department || ""; editData.section = d.section || ""; editData.facultyCode = d.facultyCode || ""; editData.joiningYear = d.joiningYear || ""; }
                          }
                        } catch (e) { console.error("Load profile error:", e); }
                        setEditUser(editData);
                      }} />
                      <Trash2 size={18} className="action-icon delete" onClick={() => handleDelete(user)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <p style={{ textAlign: "center", padding: "2rem", color: "#888" }}>No users found.</p>
          )}
        </div>
      </main>

      {/* EDIT MODAL */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <X size={22} className="close-icon" onClick={closeEditModal} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {editUser.role === "STUDENT" && (
                <>
                  <div className="form-group">
                    <label>Register Number</label>
                    <input type="text" value={editUser.studentCode || ""} onChange={(e) => setEditUser({ ...editUser, studentCode: e.target.value })} placeholder="e.g. 22CS101" />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={editUser.department || ""} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} placeholder="e.g. CSE" />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select value={editUser.section || ""} onChange={(e) => setEditUser({ ...editUser, section: e.target.value })}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Enrollment Year</label>
                    <input type="text" value={editUser.enrollmentYear || ""} onChange={(e) => setEditUser({ ...editUser, enrollmentYear: e.target.value })} placeholder="e.g. 2023" />
                  </div>
                </>
              )}

              {editUser.role === "FACULTY" && (
                <>
                  <div className="form-group">
                    <label>Faculty ID</label>
                    <input type="text" value={editUser.facultyCode || ""} onChange={(e) => setEditUser({ ...editUser, facultyCode: e.target.value })} placeholder="e.g. FAC-001" />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={editUser.department || ""} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} placeholder="e.g. CSE" />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select value={editUser.section || ""} onChange={(e) => setEditUser({ ...editUser, section: e.target.value })}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joining Year</label>
                    <input type="text" value={editUser.joiningYear || ""} onChange={(e) => setEditUser({ ...editUser, joiningYear: e.target.value })} placeholder="e.g. 2020" />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <X size={22} className="close-icon" onClick={closeAddModal} />
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  autoComplete="new-password"
                  name="projecthub-new-user-passcode"
                  readOnly
                  onFocus={(e) => { e.currentTarget.readOnly = false; }}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="">Select Role</option>
                  <option value="STUDENT">STUDENT</option>
                  <option value="FACULTY">FACULTY</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {newUser.role === "STUDENT" && (
                <>
                  <div className="form-group">
                    <label>Register Number</label>
                    <input type="text" value={newUser.studentCode} onChange={(e) => setNewUser({ ...newUser, studentCode: e.target.value })} placeholder="e.g. 22CS101" />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} placeholder="e.g. CSE" />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select value={newUser.section} onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Enrollment Year</label>
                    <input type="text" value={newUser.enrollmentYear} onChange={(e) => setNewUser({ ...newUser, enrollmentYear: e.target.value })} placeholder="e.g. 2023" />
                  </div>
                </>
              )}

              {newUser.role === "FACULTY" && (
                <>
                  <div className="form-group">
                    <label>Faculty ID</label>
                    <input type="text" value={newUser.facultyCode} onChange={(e) => setNewUser({ ...newUser, facultyCode: e.target.value })} placeholder="e.g. FAC-001" />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} placeholder="e.g. CSE" />
                  </div>
                  <div className="form-group">
                    <label>Section</label>
                    <select value={newUser.section} onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joining Year</label>
                    <input type="text" value={newUser.joiningYear} onChange={(e) => setNewUser({ ...newUser, joiningYear: e.target.value })} placeholder="e.g. 2020" />
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="save-btn" onClick={handleCreateUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal bulk-modal">
            <div className="modal-header">
              <h2>Bulk User Upload</h2>
              <X size={22} className="close-icon" onClick={closeBulkModal} />
            </div>
            <div className="modal-body">
              <p className="bulk-info">
                Upload an Excel file (.xlsx) with columns: <strong>fullName, email, password, role, department, section</strong>
              </p>
              <div className="bulk-upload-area" onClick={openFilePicker}>
                <Upload size={36} />
                <p>{bulkFile ? bulkFile.name : "Click to select Excel file"}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(e) => setBulkFile(e.target.files[0])}
                />
              </div>

              {bulkResult && (
                <div className="bulk-results">
                  <div className="bulk-summary">
                    <span className="bulk-success">✓ {bulkResult.totalSuccess} created successfully</span>
                    {bulkResult.totalFailed > 0 && (
                      <span className="bulk-failed">✗ {bulkResult.totalFailed} failed</span>
                    )}
                  </div>
                  {bulkResult.failures && bulkResult.failures.length > 0 && (
                    <div className="bulk-failures-list">
                      <h4>Failed Rows:</h4>
                      {bulkResult.failures.map((f, i) => (
                        <p key={i}>Row {f.row}: {f.email || "N/A"} — {f.reason}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={closeBulkModal}>Close</button>
              <button className="save-btn" onClick={handleBulkUpload} disabled={bulkUploading || !bulkFile}>
                {bulkUploading ? "Uploading..." : "Upload & Create Users"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmToast
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        busy={deleting}
        onCancel={() => { setDeleteConfirm(null); fetchUsers(); }}
        onConfirm={() => deleteUsers(deleteConfirm.items)}
      />
    </div>
  );
};

export default ManageUsers;
