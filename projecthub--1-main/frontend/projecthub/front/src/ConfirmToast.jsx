import React from "react";
import "./ConfirmToast.css";

const ConfirmToast = ({
  open,
  title = "Confirm delete",
  message = "This cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirm-toast-layer">
      <div className="confirm-toast" role="alertdialog" aria-modal="true" aria-labelledby="confirm-toast-title">
        <div>
          <h3 id="confirm-toast-title">{title}</h3>
          <p>{message}</p>
        </div>
        <div className="confirm-toast-actions">
          <button className="confirm-toast-cancel" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button className="confirm-toast-delete" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmToast;
