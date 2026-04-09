import { useState } from "react";
import type { EducationRecordRow } from "../../types/residentRecords";
import { ResidentRecordModal } from "./ResidentRecordModal";
import { clip, dashIfEmpty, fmtNum, formatDate } from "./residentRecordFormat";

type Props = { records: EducationRecordRow[] };

export function EducationRecordsSection({ records }: Props) {
  const [open, setOpen] = useState(false);
  const count = records.length;

  return (
    <>
      <div className="card shadow-sm beacon-detail-card resident-record-preview-card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h5 mb-1 fw-semibold">Education</h3>
              <p className="text-muted small mb-0">
                {count === 1 ? "1 record" : `${count} records`}
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
        title="Education"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="table-responsive p-3">
          {count === 0 ? (
            <p className="text-muted small mb-0">No education records.</p>
          ) : (
            <table className="table table-sm table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>School</th>
                  <th>Enrollment</th>
                  <th>Attendance %</th>
                  <th>Progress %</th>
                  <th>Completion</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((e) => (
                  <tr key={e.educationRecordId}>
                    <td>{formatDate(e.recordDate)}</td>
                    <td>{dashIfEmpty(e.educationLevel)}</td>
                    <td>{dashIfEmpty(e.schoolName)}</td>
                    <td>{dashIfEmpty(e.enrollmentStatus)}</td>
                    <td>{fmtNum(e.attendanceRate)}</td>
                    <td>{fmtNum(e.progressPercent)}</td>
                    <td>{dashIfEmpty(e.completionStatus)}</td>
                    <td title={e.notes ?? ""}>{clip(e.notes)}</td>
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
