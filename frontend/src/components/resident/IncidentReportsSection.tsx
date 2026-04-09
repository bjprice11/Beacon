import { useState } from "react";
import type { IncidentReportRow } from "../../types/residentRecords";
import { ResidentRecordModal } from "./ResidentRecordModal";
import { clip, dashIfEmpty, fmtBool, formatDate } from "./residentRecordFormat";

type Props = { records: IncidentReportRow[] };

export function IncidentReportsSection({ records }: Props) {
  const [open, setOpen] = useState(false);
  const count = records.length;

  return (
    <>
      <div className="card shadow-sm beacon-detail-card resident-record-preview-card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h5 mb-1 fw-semibold">Incident Reports</h3>
              <p className="text-muted small mb-0">
                {count === 1 ? "1 report" : `${count} reports`}
              </p>
            </div>
            <span className="badge bg-secondary rounded-pill flex-shrink-0 align-self-start">
              {count}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-auto"
            onClick={() => setOpen(true)}
          >
            View
          </button>
        </div>
      </div>

      <ResidentRecordModal
        title="Incident Reports"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="table-responsive p-3">
          {count === 0 ? (
            <p className="text-muted small mb-0">No incident reports.</p>
          ) : (
            <table className="table table-sm table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Safehouse</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Response</th>
                  <th>Resolved</th>
                  <th>Resolution date</th>
                  <th>Reported by</th>
                  <th>Follow-up req.</th>
                </tr>
              </thead>
              <tbody>
                {records.map((i) => (
                  <tr key={i.incidentId}>
                    <td>{formatDate(i.incidentDate)}</td>
                    <td>{dashIfEmpty(i.safehouseName)}</td>
                    <td>{dashIfEmpty(i.incidentType)}</td>
                    <td>{dashIfEmpty(i.severity)}</td>
                    <td title={i.description ?? ""}>{clip(i.description)}</td>
                    <td title={i.responseTaken ?? ""}>{clip(i.responseTaken)}</td>
                    <td>{fmtBool(i.resolved)}</td>
                    <td>{formatDate(i.resolutionDate)}</td>
                    <td>{dashIfEmpty(i.reportedBy)}</td>
                    <td>{fmtBool(i.followUpRequired)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ResidentRecordModal>
    </>
  );
}
