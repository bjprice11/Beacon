import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

interface AdminPartner {
  partnerId: number;
  partnerName: string;
  organizationType?: string;
  roleType?: string;
  email?: string;
  phone?: string;
  region?: string;
  status?: string;
  startDate?: string;
  assignedSafehouse?: string;
}

function AdminAllPartnersPage() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"table" | "card">("table");

  useEffect(() => {
    fetch(`${BASE_URL}/AllPartners`)
      .then((res) => res.json())
      .then(setPartners)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">All Partners</h1>
        <div className="btn-group">
          <button className={`btn ${view === "table" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("table")}>Table</button>
          <button className={`btn ${view === "card" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("card")}>Cards</button>
        </div>
      </div>

      {view === "table" ? (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Partner Name</th>
                  <th>Organization Type</th>
                  <th>Role Type</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Assigned Safehouse</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p, i) => (
                  <tr key={`${p.partnerId}-${i}`}>
                    <td>{p.partnerId}</td>
                    <td>{p.partnerName}</td>
                    <td>{p.organizationType ?? "—"}</td>
                    <td>{p.roleType ?? "—"}</td>
                    <td>{p.email ?? "—"}</td>
                    <td>{p.phone ?? "—"}</td>
                    <td>{p.region ?? "—"}</td>
                    <td>{p.status ?? "—"}</td>
                    <td>{p.startDate ? formatDate(p.startDate) : "—"}</td>
                    <td>{p.assignedSafehouse ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {partners.map((p, i) => (
            <div key={`${p.partnerId}-${i}`} className="col-sm-6 col-lg-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title mb-3">{p.partnerName}</h5>
                  <table className="table table-sm mb-0">
                    <tbody>
                      {p.assignedSafehouse && <tr><th>Safehouse</th><td>{p.assignedSafehouse}</td></tr>}
                      {p.roleType && <tr><th>Role</th><td>{p.roleType}</td></tr>}
                      {p.status && <tr><th>Status</th><td>{p.status}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAllPartnersPage;
