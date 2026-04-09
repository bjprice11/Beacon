import { useState } from "react";
import type { HealthWellbeingRow } from "../../types/residentRecords";
import { ResidentRecordModal } from "./ResidentRecordModal";
import { clip, fmtBool, fmtNum, formatDate } from "./residentRecordFormat";

type Props = { records: HealthWellbeingRow[] };

export function HealthRecordsSection({ records }: Props) {
  const [open, setOpen] = useState(false);
  const count = records.length;

  return (
    <>
      <div className="card shadow-sm beacon-detail-card resident-record-preview-card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h5 mb-1 fw-semibold">Health</h3>
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

      <ResidentRecordModal title="Health" open={open} onClose={() => setOpen(false)}>
        <div className="table-responsive p-3">
          {count === 0 ? (
            <p className="text-muted small mb-0">No health records.</p>
          ) : (
            <table className="table table-sm table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>General</th>
                  <th>Nutrition</th>
                  <th>Sleep</th>
                  <th>Energy</th>
                  <th>Ht (cm)</th>
                  <th>Wt (kg)</th>
                  <th>BMI</th>
                  <th>Med</th>
                  <th>Dental</th>
                  <th>Psych</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((h) => (
                  <tr key={h.healthRecordId}>
                    <td>{formatDate(h.recordDate)}</td>
                    <td>{fmtNum(h.generalHealthScore)}</td>
                    <td>{fmtNum(h.nutritionScore)}</td>
                    <td>{fmtNum(h.sleepQualityScore)}</td>
                    <td>{fmtNum(h.energyLevelScore)}</td>
                    <td>{fmtNum(h.heightCm)}</td>
                    <td>{fmtNum(h.weightKg)}</td>
                    <td>{fmtNum(h.bmi)}</td>
                    <td>{fmtBool(h.medicalCheckupDone)}</td>
                    <td>{fmtBool(h.dentalCheckupDone)}</td>
                    <td>{fmtBool(h.psychologicalCheckupDone)}</td>
                    <td title={h.notes ?? ""}>{clip(h.notes)}</td>
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
