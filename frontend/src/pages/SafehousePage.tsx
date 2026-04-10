import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BASE_URL } from "../config/api";
import type { Safehouse } from "../types/Safehouse";
import { AdminDeleteRecordButton } from "../components/admin/AdminDeleteRecordButton";
import {
  CreateSafehouseModal,
  type SafehouseModalInitial,
} from "../components/admin/AdminCreateEntityModals";
import BeaconLoadingMark from "../components/BeaconLoadingMark.tsx";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

interface SafehousePageData {
  safehouse: Safehouse;
  assignedPartners: string[];
  residentCount: number;
  partnerAssignmentCount: number;
}

function SafehousePage() {
  const { id } = useParams();
  const [data, setData] = useState<SafehousePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/Safehouse/${id}`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Sign in as an admin to view this safehouse.");
        if (!res.ok) throw new Error("Safehouse not found");
        return res.json();
      })
      .then((json: SafehousePageData) =>
        setData({
          ...json,
          residentCount: json.residentCount ?? 0,
          partnerAssignmentCount: json.partnerAssignmentCount ?? json.assignedPartners?.length ?? 0,
        }),
      )
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const reloadSafehouse = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/Safehouse/${id}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const json = (await res.json()) as SafehousePageData;
      setData({
        ...json,
        residentCount: json.residentCount ?? 0,
        partnerAssignmentCount: json.partnerAssignmentCount ?? json.assignedPartners?.length ?? 0,
      });
    } catch {
      /* keep existing */
    }
  };

  const safehouseModalInitial = useMemo((): SafehouseModalInitial | null => {
    if (!data?.safehouse) return null;
    const s = data.safehouse;
    return {
      name: s.name ?? "",
      region: s.region ?? "",
      city: s.city ?? "",
      province: s.province ?? "",
      country: s.country ?? "",
      openDate: s.openDate ?? "",
      status: s.status ?? "",
      capacityGirls: s.capacityGirls != null ? String(s.capacityGirls) : "",
      capacityStaff: s.capacityStaff != null ? String(s.capacityStaff) : "",
      currentOccupancy: s.currentOccupancy != null ? String(s.currentOccupancy) : "",
    };
  }, [data]);

  if (loading) {
    return (
      <div className="beacon-page beacon-page--loading text-center glass-nav-offset">
        <BeaconLoadingMark />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="beacon-page container py-4 glass-nav-offset entity-dashboard">
        <div className="alert alert-danger">{error ?? "Safehouse not found."}</div>
      </div>
    );
  }

  const { safehouse, assignedPartners, residentCount, partnerAssignmentCount } = data;
  const cap = safehouse.capacityGirls;
  const occ = safehouse.currentOccupancy;
  const occupancyLabel =
    occ != null && cap != null && cap > 0
      ? `${occ} / ${cap} (${Math.round((occ / cap) * 100)}%)`
      : occ != null
        ? String(occ)
        : "\u2014";

  const metaRows: { label: string; value: string }[] = [
    { label: "Safehouse code", value: safehouse.safehouseCode || "\u2014" },
    { label: "City", value: safehouse.city || "\u2014" },
    { label: "Region", value: safehouse.region || "\u2014" },
    { label: "Province", value: safehouse.province || "\u2014" },
    { label: "Country", value: safehouse.country || "\u2014" },
    {
      label: "Open date",
      value: safehouse.openDate ? formatDate(safehouse.openDate) : "\u2014",
    },
    { label: "Status", value: safehouse.status || "\u2014" },
    {
      label: "Staff capacity",
      value:
        safehouse.capacityStaff != null ? String(safehouse.capacityStaff) : "\u2014",
    },
  ];
  if (safehouse.notes?.trim()) {
    metaRows.push({ label: "Notes", value: safehouse.notes.trim() });
  }

  return (
    <div className="admin-dashboard beacon-page entity-dashboard safehouse-dashboard">
      {safehouseModalInitial && id ? (
        <CreateSafehouseModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => void reloadSafehouse()}
          editSafehouseId={Number(id)}
          initialSafehouse={safehouseModalInitial}
        />
      ) : null}

      <header className="admin-dashboard__hero" aria-label="Safehouse header">
        <img
          className="admin-dashboard__hero-img"
          src="/houses.jpg"
          alt=""
          decoding="async"
        />
        <div className="admin-dashboard__hero-overlay" aria-hidden="true" />
        <div className="container admin-dashboard__hero-content">
          <p className="admin-dashboard__hero-eyebrow">Safehouse</p>
          <h1 className="admin-dashboard__hero-title">{safehouse.name}</h1>
        </div>
      </header>

      <section className="admin-dashboard__main">
        <div className="container">
          <div className="donor-dashboard__admin-below-hero mb-3 pb-1">
            <Link to="/admin/all-safehouses" className="admin-dashboard-back">
              <i className="bi bi-arrow-left-short" aria-hidden="true" />
              <span>All safehouses</span>
            </Link>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="admin-dashboard__panel donor-dashboard__glass-panel h-100">
                <p className="landing-section__eyebrow mb-2">Overview</p>
                <h2 className="landing-section__heading h4 mb-3">Facility profile</h2>
                <p className="landing-section__body text-muted small mb-4">
                  Census, capacity, and partner coverage for this location. Use the summary
                  tiles for a quick read on occupancy and coordination.
                </p>
                <p className="donor-overview-profile-eyebrow mb-2">Details</p>
                <dl className="donor-overview-meta mb-0">
                  {metaRows.map((row) => (
                    <div key={row.label} className="donor-overview-meta__row">
                      <dt className="donor-overview-meta__label">{row.label}</dt>
                      <dd className="donor-overview-meta__value">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Residents housed</p>
                  <p className="beacon-stat-value h3 mb-0">{residentCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Partner assignments</p>
                  <p className="beacon-stat-value h3 mb-0">
                    {partnerAssignmentCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Girl capacity</p>
                  <p className="beacon-stat-value h3 mb-0">
                    {cap != null ? cap.toLocaleString() : "\u2014"}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Occupancy</p>
                  <p className="beacon-stat-value h4 mb-0">{occupancyLabel}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="admin-dashboard__nav-card donor-dashboard__glass-panel h-100">
                <h2 className="landing-section__heading h4 mb-3">Assigned partners</h2>
                <p className="small text-muted mb-3">
                  Organizations linked to this safehouse for programs and coordination.
                </p>
                {assignedPartners.length === 0 ? (
                  <div className="alert alert-secondary mb-0 py-2">
                    No partner names on file for this safehouse.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Partner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedPartners.map((name) => (
                          <tr key={name}>
                            <td className="fw-semibold">{name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row mt-4 pt-3 border-top">
            <div className="col-12 d-flex flex-wrap gap-2 justify-content-end align-items-center">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setEditOpen(true)}
              >
                Edit safehouse
              </button>
              <AdminDeleteRecordButton
                entity="Safehouse"
                id={id}
                label="Delete safehouse"
                confirmMessage={`Delete safehouse "${safehouse.name}" (ID ${id})? Depending on the database, related residents and other rows may be removed too. This cannot be undone.`}
                redirectTo="/admin/all-safehouses"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SafehousePage;
