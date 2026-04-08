import { useEffect, useState } from "react";
import { BASE_URL } from "../config/api";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

interface AdminResident {
  residentId: number;
  name: string;
  safehouseCity?: string;
  sex?: string;
  dateOfBirth?: string;
  religion?: string;
  caseCategory?: string;
  dateOfAdmission?: string;
  reintegrationStatus?: string;
  currentRiskLevel?: string;
}

function AdminAllResidentsPage() {
  const [residents, setResidents] = useState<AdminResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/AllResidents`)
      .then((res) => res.json())
      .then(setResidents)
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
      <h1 className="mb-4">All Residents</h1>
      <div className="card">
        <div className="card-body table-responsive">
          <table className="table table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Safehouse</th>
                <th>Sex</th>
                <th>Date of Birth</th>
                <th>Religion</th>
                <th>Case Category</th>
                <th>Date of Admission</th>
                <th>Reintegration</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r.residentId}>
                  <td>{r.name}</td>
                  <td>{r.residentId}</td>
                  <td>{r.safehouseCity ?? "—"}</td>
                  <td>{r.sex ?? "—"}</td>
                  <td>{r.dateOfBirth ? formatDate(r.dateOfBirth) : "—"}</td>
                  <td>{r.religion ?? "—"}</td>
                  <td>{r.caseCategory ?? "—"}</td>
                  <td>{r.dateOfAdmission ? formatDate(r.dateOfAdmission) : "—"}</td>
                  <td>{r.reintegrationStatus ?? "—"}</td>
                  <td>{r.currentRiskLevel ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAllResidentsPage;
