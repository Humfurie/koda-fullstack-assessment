export function Pagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1 pt-4" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((page, i) => {
        const prevPage = pages[i - 1];
        const showEllipsis = prevPage !== undefined && page - prevPage > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-sm text-zinc-400">&hellip;</span>}
            <button
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-koda-teal text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {page}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
