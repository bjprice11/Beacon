import React from "react";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  className,
}) => {
  const safePageSize: number = pageSize > 0 ? pageSize : 15;

  const totalPages: number = Math.max(1, Math.ceil(totalCount / safePageSize));
  const startItem: number = totalCount === 0 ? 0 : (page - 1) * safePageSize + 1;
  const endItem: number = Math.min(page * safePageSize, totalCount);

  const clampedPage: number = Math.min(Math.max(page, 1), totalPages);
  const pageNumbers: number[] = Array.from({ length: totalPages }, (_, index) => index + 1);

  const handlePageChange = (nextPage: number): void => {
    const safePage: number = Math.min(Math.max(nextPage, 1), totalPages);

    if (safePage !== clampedPage) {
      onPageChange(safePage);
    }
  };

  const isPreviousDisabled: boolean = totalCount === 0 || clampedPage <= 1;
  const isNextDisabled: boolean = totalCount === 0 || clampedPage >= totalPages;
  const visiblePages: number[] = pageNumbers.filter(
    (pageNumber: number) => pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - clampedPage) <= 1,
  );

  return (
    <div className={className}>
      <nav aria-label="Pagination navigation" className="beacon-pagination mx-auto">
        <div className="beacon-pagination__pill">
          <button
            type="button"
            className="beacon-pagination__btn"
            onClick={() => handlePageChange(clampedPage - 1)}
            disabled={isPreviousDisabled}
            aria-label="Previous page"
          >
            Prev
          </button>
          {visiblePages.map((pageNumber: number, index: number) => {
            const previousPage = visiblePages[index - 1];
            const showGap = previousPage !== undefined && pageNumber - previousPage > 1;
            const isActive: boolean = pageNumber === clampedPage;
            return (
              <React.Fragment key={pageNumber}>
                {showGap && (
                  <span className="beacon-pagination__ellipsis" aria-hidden>
                    …
                  </span>
                )}
                <button
                  type="button"
                  className={`beacon-pagination__btn ${isActive ? "beacon-pagination__btn--active" : ""}`}
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            className="beacon-pagination__btn"
            onClick={() => handlePageChange(clampedPage + 1)}
            disabled={isNextDisabled}
            aria-label="Next page"
          >
            Next
          </button>
          <span className="beacon-pagination__summary">
            {startItem}–{endItem} of {totalCount}
          </span>
        </div>
      </nav>
    </div>
  );
};

export default Pagination;
