import { useEffect, useState } from "react";
import type { HomeVisitationRow } from "../../types/residentRecords";
import Pagination from "../Pagination";
import { InlineDetailsCell } from "./InlineDetailsCell";
import { ResidentRecordModal } from "./ResidentRecordModal";
import { clip, dashIfEmpty, fmtBool, formatDate } from "./residentRecordFormat";

const MODAL_PAGE_SIZE = 10;

type Props = { records: HomeVisitationRow[] };

export function HomeVisitsRecordsSection({ records }: Props) {
  const [open, setOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const count = records.length;

  useEffect(() => {
    if (open) setModalPage(1);
  }, [open]);

  const totalPages = Math.max(1, Math.ceil(count / MODAL_PAGE_SIZE));
  const currentPage = Math.min(Math.max(modalPage, 1), totalPages);
  const startIndex = (currentPage - 1) * MODAL_PAGE_SIZE;
  const pagedRecords = records.slice(startIndex, startIndex + MODAL_PAGE_SIZE);

  return (
    <>
      <div className="card shadow-sm beacon-detail-card resident-record-preview-card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
            <div>
              <h3 className="h5 mb-1 fw-semibold">Home Visits</h3>
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
        title="Home Visits"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="table-responsive p-3">
          {count === 0 ? (
            <p className="text-muted small mb-0">No home visits.</p>
          ) : (
            <>
              <table className="table table-sm table-striped table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Visit date</th>
                    <th>Social worker</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Family cooperation</th>
                    <th>Safety concern</th>
                    <th>Follow-up</th>
                    <th>Outcome</th>
                    <th>Follow-up notes</th>
                    <th>Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRecords.map((v) => (
                    <tr key={v.visitationId}>
                      <td>{formatDate(v.visitDate)}</td>
                      <td>{dashIfEmpty(v.socialWorker)}</td>
                      <td>{dashIfEmpty(v.visitType)}</td>
                      <td>{clip(v.locationVisited, 60)}</td>
                      <td>{dashIfEmpty(v.familyCooperationLevel)}</td>
                      <td>{fmtBool(v.safetyConcernsNoted)}</td>
                      <td>{fmtBool(v.followUpNeeded)}</td>
                      <td>{clip(v.visitOutcome)}</td>
                      <td title={v.followUpNotes ?? ""}>{clip(v.followUpNotes)}</td>
                      <td className="align-top">
                        <InlineDetailsCell
                          text={v.observations}
                          ariaLabel="Show or hide full visit observations"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                className="mt-3 d-flex justify-content-center pb-2"
                page={currentPage}
                pageSize={MODAL_PAGE_SIZE}
                totalCount={count}
                onPageChange={setModalPage}
              />
            </>
          )}
        </div>
      </ResidentRecordModal>
    </>
  );
}
