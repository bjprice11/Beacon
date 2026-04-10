import { type FormEvent, useEffect, useState } from "react";
import { BASE_URL } from "../../config/api";
import { createResident, type ResidentInput } from "../../api/Residents";
import type { Safehouse } from "../../types/Safehouse";
import { ResidentRecordModal } from "../resident/ResidentRecordModal";
import {
  messageFromJsonPayload,
  postBeaconJson,
  readResponseJson,
} from "../resident/residentRecordFormUtils";

const emptyResidentForm: ResidentInput = {
  firstName: "",
  lastInitial: "",
  caseControlNo: "",
  internalCode: "",
  safehouseId: 0,
  caseStatus: "",
  sex: "",
  dateOfBirth: "",
  birthStatus: "",
  placeOfBirth: "",
};

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function CreateResidentModal({ open, onClose, onCreated }: ModalShellProps) {
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [form, setForm] = useState<ResidentInput>(emptyResidentForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyResidentForm);
    setError(null);
    fetch(`${BASE_URL}/Safehouses`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: Safehouse[]) => setSafehouses(Array.isArray(data) ? data : []))
      .catch(() => setSafehouses([]));
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.safehouseId || form.safehouseId <= 0) {
      setError("Choose a safehouse.");
      return;
    }
    setSubmitting(true);
    try {
      await createResident(form);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create resident.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ResidentRecordModal title="New resident" open={open} onClose={onClose} narrow>
      <form className="p-4" onSubmit={onSubmit}>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <p className="small text-muted mb-3">
          Resident ID is assigned automatically. Safehouse is required in the database.
        </p>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-res-sh">
            Safehouse
          </label>
          <select
            id="create-res-sh"
            className="form-select"
            required
            value={form.safehouseId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, safehouseId: Number(e.target.value) }))
            }
          >
            <option value="">Select safehouse…</option>
            {safehouses.map((s) => (
              <option key={s.safehouseId} value={s.safehouseId}>
                {(s.name || s.city || s.safehouseCode) ?? `ID ${s.safehouseId}`}
              </option>
            ))}
          </select>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-fn">
              First name
            </label>
            <input
              id="create-res-fn"
              className="form-control"
              value={form.firstName ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-li">
              Last initial
            </label>
            <input
              id="create-res-li"
              className="form-control"
              maxLength={8}
              value={form.lastInitial ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastInitial: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-res-cc">
            Case control no.
          </label>
          <input
            id="create-res-cc"
            className="form-control"
            value={form.caseControlNo}
            onChange={(e) =>
              setForm((f) => ({ ...f, caseControlNo: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-res-ic">
            Internal code
          </label>
          <input
            id="create-res-ic"
            className="form-control"
            value={form.internalCode}
            onChange={(e) =>
              setForm((f) => ({ ...f, internalCode: e.target.value }))
            }
          />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-sex">
              Sex
            </label>
            <input
              id="create-res-sex"
              className="form-control"
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-dob">
              Date of birth
            </label>
            <input
              id="create-res-dob"
              type="date"
              className="form-control"
              value={form.dateOfBirth?.slice(0, 10) ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateOfBirth: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-res-cs">
            Case status
          </label>
          <input
            id="create-res-cs"
            className="form-control"
            value={form.caseStatus}
            onChange={(e) =>
              setForm((f) => ({ ...f, caseStatus: e.target.value }))
            }
          />
        </div>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-bs">
              Birth status
            </label>
            <input
              id="create-res-bs"
              className="form-control"
              value={form.birthStatus}
              onChange={(e) =>
                setForm((f) => ({ ...f, birthStatus: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-res-pob">
              Place of birth
            </label>
            <input
              id="create-res-pob"
              className="form-control"
              value={form.placeOfBirth}
              onChange={(e) =>
                setForm((f) => ({ ...f, placeOfBirth: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Create resident"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}

export function CreatePartnerModal({ open, onClose, onCreated }: ModalShellProps) {
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("");
  const [roleType, setRoleType] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPartnerName("");
    setPartnerType("");
    setRoleType("");
    setContactName("");
    setEmail("");
    setPhone("");
    setRegion("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setNotes("");
    setError(null);
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!partnerName.trim()) {
      setError("Partner name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        partnerName: partnerName.trim(),
        partnerType: partnerType.trim() || null,
        roleType: roleType.trim() || null,
        contactName: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        region: region.trim() || null,
        status: status.trim() || null,
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        notes: notes.trim() || null,
      };
      const res = await postBeaconJson("Partners", body);
      const { payload } = await readResponseJson(res);
      if (!res.ok) {
        setError(messageFromJsonPayload(payload, `Request failed (${res.status})`));
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create partner.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ResidentRecordModal title="New partner" open={open} onClose={onClose} narrow>
      <form className="p-4" onSubmit={onSubmit}>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <div className="mb-3">
          <label className="form-label" htmlFor="create-par-name">
            Partner name <span className="text-danger">*</span>
          </label>
          <input
            id="create-par-name"
            className="form-control"
            required
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
          />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-ptype">
              Organization type
            </label>
            <input
              id="create-par-ptype"
              className="form-control"
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-role">
              Role type
            </label>
            <input
              id="create-par-role"
              className="form-control"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-par-contact">
            Contact name
          </label>
          <input
            id="create-par-contact"
            className="form-control"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-email">
              Email
            </label>
            <input
              id="create-par-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-phone">
              Phone
            </label>
            <input
              id="create-par-phone"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-region">
              Region
            </label>
            <input
              id="create-par-region"
              className="form-control"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-status">
              Status
            </label>
            <input
              id="create-par-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-start">
              Start date
            </label>
            <input
              id="create-par-start"
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-par-end">
              End date
            </label>
            <input
              id="create-par-end"
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-par-notes">
            Notes
          </label>
          <textarea
            id="create-par-notes"
            className="form-control"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Create partner"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}

export function CreateSafehouseModal({ open, onClose, onCreated }: ModalShellProps) {
  const [safehouseCode, setSafehouseCode] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [openDate, setOpenDate] = useState("");
  const [status, setStatus] = useState("");
  const [capacityGirls, setCapacityGirls] = useState("");
  const [capacityStaff, setCapacityStaff] = useState("");
  const [currentOccupancy, setCurrentOccupancy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSafehouseCode("");
    setName("");
    setRegion("");
    setCity("");
    setProvince("");
    setCountry("");
    setOpenDate("");
    setStatus("");
    setCapacityGirls("");
    setCapacityStaff("");
    setCurrentOccupancy("");
    setNotes("");
    setError(null);
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!safehouseCode.trim() || !name.trim()) {
      setError("Safehouse code and name are required.");
      return;
    }
    const capG = capacityGirls.trim() ? Number(capacityGirls) : null;
    const capS = capacityStaff.trim() ? Number(capacityStaff) : null;
    const occ = currentOccupancy.trim() ? Number(currentOccupancy) : null;
    if (capacityGirls.trim() && !Number.isInteger(capG)) {
      setError("Girls capacity must be a whole number.");
      return;
    }
    if (capacityStaff.trim() && !Number.isInteger(capS)) {
      setError("Staff capacity must be a whole number.");
      return;
    }
    if (currentOccupancy.trim() && !Number.isInteger(occ)) {
      setError("Current occupancy must be a whole number.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        safehouseCode: safehouseCode.trim(),
        name: name.trim(),
        region: region.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        country: country.trim() || null,
        openDate: openDate.trim() || null,
        status: status.trim() || null,
        capacityGirls: capG,
        capacityStaff: capS,
        currentOccupancy: occ,
        notes: notes.trim() || null,
      };
      const res = await postBeaconJson("Safehouses", body);
      const { payload } = await readResponseJson(res);
      if (!res.ok) {
        setError(messageFromJsonPayload(payload, `Request failed (${res.status})`));
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create safehouse.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ResidentRecordModal title="New safehouse" open={open} onClose={onClose} narrow>
      <form className="p-4" onSubmit={onSubmit}>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-code">
              Safehouse code <span className="text-danger">*</span>
            </label>
            <input
              id="create-sh-code"
              className="form-control"
              required
              value={safehouseCode}
              onChange={(e) => setSafehouseCode(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-name">
              Name <span className="text-danger">*</span>
            </label>
            <input
              id="create-sh-name"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-region">
              Region
            </label>
            <input
              id="create-sh-region"
              className="form-control"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-city">
              City
            </label>
            <input
              id="create-sh-city"
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-prov">
              Province
            </label>
            <input
              id="create-sh-prov"
              className="form-control"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-country">
              Country
            </label>
            <input
              id="create-sh-country"
              className="form-control"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-open">
              Open date
            </label>
            <input
              id="create-sh-open"
              type="date"
              className="form-control"
              value={openDate}
              onChange={(e) => setOpenDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-sh-status">
              Status
            </label>
            <input
              id="create-sh-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-4">
            <label className="form-label" htmlFor="create-sh-capg">
              Capacity (girls)
            </label>
            <input
              id="create-sh-capg"
              inputMode="numeric"
              className="form-control"
              value={capacityGirls}
              onChange={(e) => setCapacityGirls(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="create-sh-caps">
              Capacity (staff)
            </label>
            <input
              id="create-sh-caps"
              inputMode="numeric"
              className="form-control"
              value={capacityStaff}
              onChange={(e) => setCapacityStaff(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="create-sh-occ">
              Current occupancy
            </label>
            <input
              id="create-sh-occ"
              inputMode="numeric"
              className="form-control"
              value={currentOccupancy}
              onChange={(e) => setCurrentOccupancy(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-sh-notes">
            Notes
          </label>
          <textarea
            id="create-sh-notes"
            className="form-control"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Create safehouse"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}

export function CreateDonorModal({ open, onClose, onCreated }: ModalShellProps) {
  const [displayName, setDisplayName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [supporterType, setSupporterType] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Active");
  const [firstDonationDate, setFirstDonationDate] = useState("");
  const [acquisitionChannel, setAcquisitionChannel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDisplayName("");
    setFirstName("");
    setLastName("");
    setOrganizationName("");
    setSupporterType("");
    setRelationshipType("");
    setRegion("");
    setCountry("");
    setEmail("");
    setPhone("");
    setStatus("Active");
    setFirstDonationDate("");
    setAcquisitionChannel("");
    setError(null);
  }, [open]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const hasId =
      displayName.trim() ||
      organizationName.trim() ||
      firstName.trim() ||
      lastName.trim();
    if (!hasId) {
      setError("Enter a display name, organization, or first/last name.");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        supporterType: supporterType.trim() || null,
        displayName: displayName.trim() || null,
        organizationName: organizationName.trim() || null,
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        relationshipType: relationshipType.trim() || null,
        region: region.trim() || null,
        country: country.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        status: status.trim() || null,
        firstDonationDate: firstDonationDate.trim() || null,
        acquisitionChannel: acquisitionChannel.trim() || null,
      };
      const res = await postBeaconJson("Supporters", body);
      const { payload } = await readResponseJson(res);
      if (!res.ok) {
        setError(messageFromJsonPayload(payload, `Request failed (${res.status})`));
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create donor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ResidentRecordModal title="New donor" open={open} onClose={onClose} narrow>
      <form className="p-4" onSubmit={onSubmit}>
        {error ? <div className="alert alert-danger py-2">{error}</div> : null}
        <p className="small text-muted mb-3">
          Creates a row in <code>supporters</code>. Donor user accounts still use the sign-up flow;
          this is for offline or admin-entered records.
        </p>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-don-dn">
            Display name
          </label>
          <input
            id="create-don-dn"
            className="form-control"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-fn">
              First name
            </label>
            <input
              id="create-don-fn"
              className="form-control"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-ln">
              Last name
            </label>
            <input
              id="create-don-ln"
              className="form-control"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-don-org">
            Organization name
          </label>
          <input
            id="create-don-org"
            className="form-control"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-stype">
              Supporter type
            </label>
            <input
              id="create-don-stype"
              className="form-control"
              value={supporterType}
              onChange={(e) => setSupporterType(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-rel">
              Relationship
            </label>
            <input
              id="create-don-rel"
              className="form-control"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-region">
              Region
            </label>
            <input
              id="create-don-region"
              className="form-control"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-country">
              Country
            </label>
            <input
              id="create-don-country"
              className="form-control"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-email">
              Email
            </label>
            <input
              id="create-don-email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-phone">
              Phone
            </label>
            <input
              id="create-don-phone"
              className="form-control"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-2 mb-2">
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-status">
              Status
            </label>
            <input
              id="create-don-status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="create-don-firstd">
              First donation date
            </label>
            <input
              id="create-don-firstd"
              type="date"
              className="form-control"
              value={firstDonationDate}
              onChange={(e) => setFirstDonationDate(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="create-don-acq">
            Acquisition channel
          </label>
          <input
            id="create-don-acq"
            className="form-control"
            value={acquisitionChannel}
            onChange={(e) => setAcquisitionChannel(e.target.value)}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Create donor"}
          </button>
        </div>
      </form>
    </ResidentRecordModal>
  );
}
