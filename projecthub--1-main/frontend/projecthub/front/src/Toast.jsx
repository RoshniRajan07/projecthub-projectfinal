import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "error", open, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`toast-popup toast-${type}`} role="alert">
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
