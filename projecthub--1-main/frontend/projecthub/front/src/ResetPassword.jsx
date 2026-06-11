import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";

const getErrorMessage = (data, fallback) => {
  const message = data?.message || data?.error || "";
  if (message.includes("INTERNAL_SERVER_ERROR")) {
    return fallback;
  }
  return message || fallback;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Enter new password and confirm password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8081/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(getErrorMessage(data, "Password change failed"));
        setLoading(false);
        return;
      }

      setMessage(data.message || "Password changed successfully");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("Server not reachable. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="logo" onClick={() => navigate("/")}>
          <div className="logo-box">🎓</div>
          <h1>ProjectHub+</h1>
        </div>
        <p className="left-description">
          Reset your student account password and continue tracking your projects.
        </p>
      </div>

      <div className="login-right">
        <h2>Reset password</h2>
        <p className="subtitle">Enter your new password</p>

        <form className="form" autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
          <label>New Password</label>
          <div className="password-box">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <label>Confirm New Password</label>
          <div className="password-box">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span className="eye-icon" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {error && <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>{error}</p>}
          {message && <div className="reset-sent-box"><strong>{message}</strong></div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>

          <button type="button" className="forgot-link" onClick={() => navigate("/login")}>
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
