import { Link } from "react-router-dom";

function AdminDashboardBackLink() {
  return (
    <div className="admin-dashboard-back-wrap">
      <Link to="/admin" className="admin-dashboard-back">
        <i className="bi bi-arrow-left-short" aria-hidden="true" />
        <span>Dashboard</span>
      </Link>
    </div>
  );
}

export default AdminDashboardBackLink;
