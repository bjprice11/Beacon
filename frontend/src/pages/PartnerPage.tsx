import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BASE_URL } from "../config/api";
import type { Partner } from "../types/Partner";
import { AdminDeleteRecordButton } from "../components/admin/AdminDeleteRecordButton";
import {
  CreatePartnerModal,
  type PartnerModalInitial,
} from "../components/admin/AdminCreateEntityModals";
import { useAuth } from "../context/AuthContext";
import BeaconLoadingMark from "../components/BeaconLoadingMark.tsx";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

interface SafehouseAssignment {
  safehouseName: string;
  safehouseCity?: string;
  programArea?: string;
  status?: string;
}

interface PartnerPageData {
  partner: Partner;
  safehouseAssignments: SafehouseAssignment[];
  assignmentCount?: number;
  distinctSafehouseCount?: number;
}

function PartnerPage() {
  const { id } = useParams();
  const { authSession } = useAuth();
  const isAdmin = authSession?.roles.includes("Admin") ?? false;
  const [data, setData] = useState<PartnerPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${BASE_URL}/Partner/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Partner not found");
        return res.json();
      })
      .then((json: PartnerPageData) =>
        setData({
          ...json,
          assignmentCount: json.assignmentCount ?? json.safehouseAssignments?.length ?? 0,
          distinctSafehouseCount:
            json.distinctSafehouseCount ??
            new Set(
              (json.safehouseAssignments ?? []).map((a) => a.safehouseName).filter(Boolean),
            ).size,
        }),
      )
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const reloadPartner = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/Partner/${id}`, { credentials: "include" });
      if (!res.ok) return;
      const json = (await res.json()) as PartnerPageData;
      setData({
        ...json,
        assignmentCount: json.assignmentCount ?? json.safehouseAssignments?.length ?? 0,
        distinctSafehouseCount:
          json.distinctSafehouseCount ??
          new Set(
            (json.safehouseAssignments ?? []).map((a) => a.safehouseName).filter(Boolean),
          ).size,
      });
    } catch {
      /* keep existing */
    }
  };

  const partnerModalInitial = useMemo((): PartnerModalInitial | null => {
    if (!data?.partner) return null;
    const p = data.partner;
    return {
      partnerName: p.partnerName ?? "",
      partnerType: p.partnerType ?? "",
      roleType: p.roleType ?? "",
      email: p.email ?? "",
      phone: p.phone ?? "",
      region: p.region ?? "",
      status: p.status ?? "",
      startDate: p.startDate ?? "",
      notes: p.notes ?? "",
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
        <div className="alert alert-danger">{error ?? "Partner not found."}</div>
      </div>
    );
  }

  const { partner, safehouseAssignments, assignmentCount, distinctSafehouseCount } = data;

  const activeAssignments = safehouseAssignments.filter((a) =>
    (a.status ?? "").toLowerCase().includes("active"),
  ).length;

  const metaRows: { label: string; value: string }[] = [
    { label: "Organization type", value: partner.partnerType || "\u2014" },
    { label: "Role", value: partner.roleType || "\u2014" },
    { label: "Email", value: partner.email || "\u2014" },
    { label: "Phone", value: partner.phone || "\u2014" },
    { label: "Region", value: partner.region || "\u2014" },
    { label: "Status", value: partner.status || "\u2014" },
    {
      label: "Start date",
      value: partner.startDate ? formatDate(partner.startDate) : "\u2014",
    },
    {
      label: "End date",
      value: partner.endDate ? formatDate(partner.endDate) : "\u2014",
    },
  ];
  if (partner.notes?.trim()) {
    metaRows.push({ label: "Notes", value: partner.notes.trim() });
  }

  return (
    <div className="admin-dashboard beacon-page entity-dashboard partner-dashboard">
      {isAdmin && partnerModalInitial && id ? (
        <CreatePartnerModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => void reloadPartner()}
          editPartnerId={Number(id)}
          initialPartner={partnerModalInitial}
        />
      ) : null}

      <header className="admin-dashboard__hero" aria-label="Partner header">
        <img
          className="admin-dashboard__hero-img"
          src="/houses.jpg"
          alt=""
          decoding="async"
        />
        <div className="admin-dashboard__hero-overlay" aria-hidden="true" />
        <div className="container admin-dashboard__hero-content">
          <p className="admin-dashboard__hero-eyebrow">Partner organization</p>
          <h1 className="admin-dashboard__hero-title">{partner.partnerName}</h1>
        </div>
      </header>

      <section className="admin-dashboard__main">
        <div className="container">
          <div className="donor-dashboard__admin-below-hero mb-3 pb-1">
            <Link to="/admin/all-partners" className="admin-dashboard-back">
              <i className="bi bi-arrow-left-short" aria-hidden="true" />
              <span>All partners</span>
            </Link>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="admin-dashboard__panel donor-dashboard__glass-panel h-100">
                <p className="landing-section__eyebrow mb-2">Overview</p>
                <h2 className="landing-section__heading h4 mb-3">Partner profile</h2>
                <p className="landing-section__body text-muted small mb-4">
                  Contact and classification for this organization, plus a live view of
                  safehouse assignments and coverage.
                </p>
                <p className="donor-overview-profile-eyebrow mb-2">Contact &amp; status</p>
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
                  <p className="beacon-section-subtitle mb-2">Assignment rows</p>
                  <p className="beacon-stat-value h3 mb-0">
                    {(assignmentCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Safehouses covered</p>
                  <p className="beacon-stat-value h3 mb-0">
                    {(distinctSafehouseCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Active assignments</p>
                  <p className="beacon-stat-value h3 mb-0">{activeAssignments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="card beacon-stat-card donor-dashboard__glass-panel h-100">
                <div className="card-body">
                  <p className="beacon-section-subtitle mb-2">Primary role</p>
                  <p className="beacon-stat-value h5 mb-0 text-truncate">
                    {partner.roleType || "\u2014"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-12">
              <div className="admin-dashboard__nav-card donor-dashboard__glass-panel h-100">
                <h2 className="landing-section__heading h4 mb-3">Safehouse assignments</h2>
                <p className="small text-muted mb-3">
                  Program areas and status for each placement tied to this partner.
                </p>
                {safehouseAssignments.length === 0 ? (
                  <div className="alert alert-secondary mb-0 py-2">
                    No safehouse assignments found.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Safehouse</th>
                          <th>City</th>
                          <th>Program area</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safehouseAssignments.map((a, i) => (
                          <tr key={`${a.safehouseName}-${i}`}>
                            <td className="fw-semibold">{a.safehouseName}</td>
                            <td>{a.safehouseCity ?? "\u2014"}</td>
                            <td>{a.programArea ?? "\u2014"}</td>
                            <td>{a.status ?? "\u2014"}</td>
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
              {isAdmin ? (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => setEditOpen(true)}
                >
                  Edit partner
                </button>
              ) : null}
              <AdminDeleteRecordButton
                entity="Partner"
                id={id}
                label="Delete partner"
                confirmMessage={`Delete partner "${partner.partnerName}" (ID ${id})? Safehouse assignments will be removed. This cannot be undone.`}
                redirectTo="/admin/all-partners"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PartnerPage;
