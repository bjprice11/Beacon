import { useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { ResidentRecordModal } from "./ResidentRecordModal";
import {
  parseServerErrors,
  requiredFieldMsg,
  triStateToBool,
  validateResidentIdInput,
} from "./residentRecordFormUtils";

const FIELD_KEYS = ["resident_id", "visit_date"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

type Props = {
  open: boolean;
  onClose: () => void;
  initialResidentId?: number;
  onCreated: () => void;
};

function labelSuffix(fieldErrors: Partial<Record<FieldKey, string>>, key: FieldKey) {
  return fieldErrors[key] ? (
    <span className="text-danger" aria-hidden>
      {" "}
      *
    </span>
  ) : null;
}

export function AddHomeVisitationModal({
  open,
  onClose,
  initialResidentId,
  onCreated,
}: Props) {
  const [residentIdInput, setResidentIdInput] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [socialWorker, setSocialWorker] = useState("");
  const [visitType, setVisitType] = useState("");
  const [locationVisited, setLocationVisited] = useState("");
  const [familyMembersPresent, setFamilyMembersPresent] = useState("");
  const [purpose, setPurpose] = useState("");
  const [observations, setObservations] = useState("");
  const [familyCooperationLevel, setFamilyCooperationLevel] = useState("");
  const [safetyConcernsNoted, setSafetyConcernsNoted] = useState("");
  const [followUpNeeded, setFollowUpNeeded] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [visitOutcome, setVisitOutcome] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFieldErrors({});
    setFormError(null);
    setResidentIdInput(
      initialResidentId !== undefined &&
        initialResidentId !== null &&
        Number.isFinite(initialResidentId)
        ? String(Math.trunc(initialResidentId))
        : "",
    );
    setVisitDate("");
    setSocialWorker("");
    setVisitType("");
    setLocationVisited("");
    setFamilyMembersPresent("");
    setPurpose("");
    setObservations("");
    setFamilyCooperationLevel("");
    setSafetyConcernsNoted("");
    setFollowUpNeeded("");
    setFollowUpNotes("");
    setVisitOutcome("");
  }, [open, initialResidentId]);

  function validate(): Partial<Record<FieldKey, string>> {
    const e: Partial<Record<FieldKey, string>> = {};
    const ridErr = validateResidentIdInput(residentIdInput);
    if (ridErr) e.resident_id = ridErr;
    if (!visitDate.trim()) e.visit_date = requiredFieldMsg;
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

    const residentId = Math.trunc(Number(residentIdInput.trim()));
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/HomeVisitation`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resident_id: residentId,
          visit_date: visitDate,
          social_worker: socialWorker.trim() || null,
          visit_type: visitType.trim() || null,
          location_visited: locationVisited.trim() || null,
          family_members_present: familyMembersPresent.trim() || null,
          purpose: purpose.trim() || null,
          observations: observations.trim() || null,
          family_cooperation_level: familyCooperationLevel.trim() || null,
          safety_concerns_noted: triStateToBool(safetyConcernsNoted),
          follow_up_needed: triStateToBool(followUpNeeded),
          follow_up_notes: followUpNotes.trim() || null,
          visit_outcome: visitOutcome.trim() || null,
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
        setFieldErrors((prev) => ({ ...prev, ...parseServerErrors(FIELD_KEYS, payload) }));
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

  function triSelect(id: string, label: string, value: string, onChange: (v: string) => void) {
    return (
      <div className="mb-3">
        <label className="form-label small fw-semibold" htmlFor={id}>
          {label}
        </label>
        <select
          id={id}
          className="form-select form-select-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Not Set</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
    );
  }

  return (
    <ResidentRecordModal title="Add Home Visit" open={open} onClose={onClose} narrow>
      <form className="p-4" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div className="alert alert-warning small" role="alert">
            {formError}
          </div>
        ) : null}

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-resident-id">
            Resident ID
            {labelSuffix(fieldErrors, "resident_id")}
          </label>
          <input
            id="v-resident-id"
            type="text"
            inputMode="numeric"
            className={`form-control form-control-sm${fieldErrors.resident_id ? " is-invalid" : ""}`}
            value={residentIdInput}
            onChange={(e) => setResidentIdInput(e.target.value)}
          />
          {fieldErrors.resident_id ? (
            <div className="invalid-feedback d-block">{fieldErrors.resident_id}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-visit-date">
            Visit Date
            {labelSuffix(fieldErrors, "visit_date")}
          </label>
          <input
            id="v-visit-date"
            type="date"
            className={`form-control form-control-sm${fieldErrors.visit_date ? " is-invalid" : ""}`}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
          />
          {fieldErrors.visit_date ? (
            <div className="invalid-feedback d-block">{fieldErrors.visit_date}</div>
          ) : null}
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-sw">
            Social Worker
          </label>
          <input
            id="v-sw"
            type="text"
            className="form-control form-control-sm"
            value={socialWorker}
            onChange={(e) => setSocialWorker(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-type">
            Visit Type
          </label>
          <input
            id="v-type"
            type="text"
            className="form-control form-control-sm"
            value={visitType}
            onChange={(e) => setVisitType(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-loc">
            Location Visited
          </label>
          <input
            id="v-loc"
            type="text"
            className="form-control form-control-sm"
            value={locationVisited}
            onChange={(e) => setLocationVisited(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-fam">
            Family Members Present
          </label>
          <input
            id="v-fam"
            type="text"
            className="form-control form-control-sm"
            value={familyMembersPresent}
            onChange={(e) => setFamilyMembersPresent(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-purpose">
            Purpose
          </label>
          <input
            id="v-purpose"
            type="text"
            className="form-control form-control-sm"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-obs">
            Observations
          </label>
          <textarea
            id="v-obs"
            className="form-control form-control-sm"
            rows={3}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-coop">
            Family Cooperation Level
          </label>
          <input
            id="v-coop"
            type="text"
            className="form-control form-control-sm"
            value={familyCooperationLevel}
            onChange={(e) => setFamilyCooperationLevel(e.target.value)}
          />
        </div>

        {triSelect("v-safe", "Safety Concerns Noted", safetyConcernsNoted, setSafetyConcernsNoted)}
        {triSelect("v-fun", "Follow Up Needed", followUpNeeded, setFollowUpNeeded)}

        <div className="mb-3">
          <label className="form-label small fw-semibold" htmlFor="v-funotes">
            Follow Up Notes
          </label>
          <textarea
            id="v-funotes"
            className="form-control form-control-sm"
            rows={2}
            value={followUpNotes}
            onChange={(e) => setFollowUpNotes(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold" htmlFor="v-out">
            Visit Outcome
          </label>
          <textarea
            id="v-out"
            className="form-control form-control-sm"
            rows={2}
            value={visitOutcome}
            onChange={(e) => setVisitOutcome(e.target.value)}
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
            {submitting ? "Saving…" : "Save Record"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}
