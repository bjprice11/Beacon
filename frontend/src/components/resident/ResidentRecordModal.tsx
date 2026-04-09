import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

type ResidentRecordModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function ResidentRecordModal({
  title,
  open,
  onClose,
  children,
}: ResidentRecordModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="resident-record-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="resident-record-modal-dialog card shadow-lg border-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="resident-record-modal-header card-header bg-transparent border-bottom py-3 px-4 d-flex align-items-center justify-content-between gap-3">
          <h2 id={titleId} className="h5 mb-0 fw-semibold">
            {title}
          </h2>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="resident-record-modal-body card-body p-0">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
