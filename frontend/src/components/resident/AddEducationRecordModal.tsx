import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { ResidentRecordModal } from "./ResidentRecordModal";

type FieldKey =
  | "recordDate"
  | "schoolName"
  | "enrollmentStatus"
  | "attendanceRate"
  | "progressPercent"
  | "completionStatus";

type Props = {
  open: boolean;
  onClose: () => void;
  residentId: number;
  onCreated: () => void;
};

const requiredMsg = "This field is required.";

const FIELD_KEYS: FieldKey[] = [
  "recordDate",
  "schoolName",
  "enrollmentStatus",
  "attendanceRate",
  "progressPercent",
  "completionStatus",
];

function isFieldKey(k: string): k is FieldKey {
  return (FIELD_KEYS as readonly string[]).includes(k);
}

/** Maps API error keys (camelCase or PascalCase) to form fields. */
function parseServerErrors(payload: unknown): Partial<Record<FieldKey, string>> {
  if (!payload || typeof payload !== "object") return {};
  const errors = (payload as { errors?: Record<string, string> }).errors;
  if (!errors || typeof errors !== "object") return {};
  const out: Partial<Record<FieldKey, string>> = {};
  for (const [rawKey, v] of Object.entries(errors)) {
    if (typeof v !== "string") continue;
    const camel = rawKey.length ? rawKey[0].toLowerCase() + rawKey.slice(1) : rawKey;
    if (isFieldKey(camel)) out[camel] = v;
  }
  return out;
}

export function AddEducationRecordModal({
  open,
  onClose,
  residentId,
  onCreated,
}: Props) {
  const [schoolNames, setSchoolNames] = useState<string[]>([]);
  const [recordDate, setRecordDate] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    "" | "Enrolled" | "Not Enrolled"
  >("");
  const [attendanceRate, setAttendanceRate] = useState("");
  const [progressPercent, setProgressPercent] = useState("");
  const [completionStatus, setCompletionStatus] = useState<
    "" | "NotStarted" | "InProgress"
  >("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setFormError(null);
    setRecordDate("");
    setSchoolName("");
    setEnrollmentStatus("");
    setAttendanceRate("");
    setProgressPercent("");
    setCompletionStatus("");
    setNotes("");
    fetch(`${BASE_URL}/EducationRecordSchoolNames`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) =>
        setSchoolNames(Array.isArray(data) ? (data as string[]).filter(Boolean) : []),
      )
      .catch(() => setSchoolNames([]));
  }, [open]);

  function labelSuffix(key: FieldKey) {
    return fieldErrors[key] ? (
      <span className="text-danger" aria-hidden>
        {" "}
        *
      </span>
    ) : null;
  }

  function validate(): Partial<Record<FieldKey, string>> {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!recordDate.trim()) e.recordDate = requiredMsg;
    if (!schoolName.trim()) e.schoolName = requiredMsg;
    if (!enrollmentStatus) e.enrollmentStatus = requiredMsg;
    if (!completionStatus) e.completionStatus = requiredMsg;

    const attRaw = attendanceRate.trim();
    if (!attRaw) e.attendanceRate = requiredMsg;
    else {
      const att = Number(attRaw);
      if (Number.isNaN(att)) e.attendanceRate = "Enter a valid number.";
      else if (att < 0 || att > 1) e.attendanceRate = "Must be between 0 and 1.";
    }

    const progRaw = progressPercent.trim();
    if (!progRaw) e.progressPercent = requiredMsg;
    else {
      const prog = Number(progRaw);
      if (Number.isNaN(prog)) e.progressPercent = "Enter a valid number.";
      else if (prog < 0 || prog > 100)
        e.progressPercent = "Must be between 0 and 100.";
    }

    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    const local = validate();
    setFieldErrors(local);
    if (Object.keys(local).length > 0) {
      setFormError("Please complete all required fields.");
      return;
    }

    const att = Math.round(Number(attendanceRate.trim()) * 1000) / 1000;
    const prog = Math.round(Number(progressPercent.trim()) * 10) / 10;

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/EducationRecord`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentId,
          recordDate,
          schoolName: schoolName.trim(),
          enrollmentStatus,
          attendanceRate: att,
          progressPercent: prog,
          completionStatus,
          notes: notes.trim() || null,
        }),
      });

      if (res.status === 201) {
        onCreated();
        onClose();
        return;
      }

      let payload: unknown;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (res.status === 400 && payload) {
        const serverErr = parseServerErrors(payload);
        setFieldErrors((prev) => ({ ...prev, ...serverErr }));
        const msg =
          typeof (payload as { message?: string }).message === "string"
            ? (payload as { message: string }).message
            : "Please correct the highlighted fields.";
        setFormError(msg);
        return;
      }

      setFormError(res.status === 401 ? "You must be signed in." : "Could not save.");
    } catch {
      setFormError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ResidentRecordModal
      title="Add education record"
      open={open}
      onClose={onClose}
    >
      <form className="p-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="alert alert-warning small" role="alert">
            {formError}
          </div>
        ) : null}

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="edu-record-date">
            Record date
            {labelSuffix("recordDate")}
          </label>
          <input
            id="edu-record-date"
            type="date"
            className={`form-control form-control-sm${fieldErrors.recordDate ? " is-invalid" : ""}`}
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
          />
          {fieldErrors.recordDate ? (
            <div className="invalid-feedback d-block">{fieldErrors.recordDate}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="edu-school">
            School name
            {labelSuffix("schoolName")}
          </label>
          <select
            id="edu-school"
            className={`form-select form-select-sm${fieldErrors.schoolName ? " is-invalid" : ""}`}
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          >
            <option value="">Select a school…</option>
            {schoolNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {fieldErrors.schoolName ? (
            <div className="invalid-feedback d-block">{fieldErrors.schoolName}</div>
          ) : null}
        </div>

        <fieldset className="mb-3">
          <legend className="form-label small fw-semibold mb-2">
            Enrollment status
            {labelSuffix("enrollmentStatus")}
          </legend>
          <div className="d-flex flex-wrap gap-3">
            <div className="form-check">
              <input
                className={`form-check-input${fieldErrors.enrollmentStatus ? " is-invalid" : ""}`}
                type="radio"
                name="enrollmentStatus"
                id="edu-enrolled"
                checked={enrollmentStatus === "Enrolled"}
                onChange={() => setEnrollmentStatus("Enrolled")}
              />
              <label className="form-check-label" htmlFor="edu-enrolled">
                Enrolled
              </label>
            </div>
            <div className="form-check">
              <input
                className={`form-check-input${fieldErrors.enrollmentStatus ? " is-invalid" : ""}`}
                type="radio"
                name="enrollmentStatus"
                id="edu-not-enrolled"
                checked={enrollmentStatus === "Not Enrolled"}
                onChange={() => setEnrollmentStatus("Not Enrolled")}
              />
              <label className="form-check-label" htmlFor="edu-not-enrolled">
                Not enrolled
              </label>
            </div>
          </div>
          {fieldErrors.enrollmentStatus ? (
            <div className="invalid-feedback d-block">{fieldErrors.enrollmentStatus}</div>
          ) : null}
        </fieldset>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="edu-attendance">
            Attendance rate (0–1)
            {labelSuffix("attendanceRate")}
          </label>
          <input
            id="edu-attendance"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 0.925"
            className={`form-control form-control-sm${fieldErrors.attendanceRate ? " is-invalid" : ""}`}
            value={attendanceRate}
            onChange={(e) => setAttendanceRate(e.target.value)}
          />
          <p className="form-text small mb-0">Stored rounded to three decimal places.</p>
          {fieldErrors.attendanceRate ? (
            <div className="invalid-feedback d-block">{fieldErrors.attendanceRate}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="edu-progress">
            Progress percentage (0–100)
            {labelSuffix("progressPercent")}
          </label>
          <input
            id="edu-progress"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 67.5"
            className={`form-control form-control-sm${fieldErrors.progressPercent ? " is-invalid" : ""}`}
            value={progressPercent}
            onChange={(e) => setProgressPercent(e.target.value)}
          />
          <p className="form-text small mb-0">Stored rounded to one decimal place.</p>
          {fieldErrors.progressPercent ? (
            <div className="invalid-feedback d-block">{fieldErrors.progressPercent}</div>
          ) : null}
        </div>

        <fieldset className="mb-3">
          <legend className="form-label small fw-semibold mb-2">
            Completion status
            {labelSuffix("completionStatus")}
          </legend>
          <div className="d-flex flex-wrap gap-3">
            <div className="form-check">
              <input
                className={`form-check-input${fieldErrors.completionStatus ? " is-invalid" : ""}`}
                type="radio"
                name="completionStatus"
                id="edu-not-started"
                checked={completionStatus === "NotStarted"}
                onChange={() => setCompletionStatus("NotStarted")}
              />
              <label className="form-check-label" htmlFor="edu-not-started">
                Not started
              </label>
            </div>
            <div className="form-check">
              <input
                className={`form-check-input${fieldErrors.completionStatus ? " is-invalid" : ""}`}
                type="radio"
                name="completionStatus"
                id="edu-in-progress"
                checked={completionStatus === "InProgress"}
                onChange={() => setCompletionStatus("InProgress")}
              />
              <label className="form-check-label" htmlFor="edu-in-progress">
                In progress
              </label>
            </div>
          </div>
          {fieldErrors.completionStatus ? (
            <div className="invalid-feedback d-block">{fieldErrors.completionStatus}</div>
          ) : null}
        </fieldset>

        <div className="mb-4">
          <label className="form-label small fw-semibold" htmlFor="edu-notes">
            Notes
          </label>
          <textarea
            id="edu-notes"
            className="form-control form-control-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-sm btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save record"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}
