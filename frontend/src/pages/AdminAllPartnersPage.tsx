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
      <h1 className="mb-4">All Partners</h1>
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
    </div>
  );
}

export default AdminAllPartnersPage;
