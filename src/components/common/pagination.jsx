// src/components/common/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const currentLimit = itemsPerPage || pageSize || 10;

  if (totalItems === 0) return null;


  const startItem = totalItems > 0 ? (currentPage - 1) * currentLimit + 1 : 0;
  const endItem = Math.min(currentPage * currentLimit, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 border-t border-gray-200 text-xs text-gray-600 select-none">
      {/* Result Count Text & Page Size Selector */}
      <div className="flex items-center gap-3">
        <div>
          Showing <span className="font-semibold text-gray-900">{startItem}</span>–
          <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
          <span className="font-semibold text-gray-900">{totalItems}</span>
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-gray-400">|</span>
            <select
              value={currentLimit}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-md px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Controls: <<  <  1 2 3 ... 100  >  >> */}
      <div className="flex items-center gap-1">
        {/* First Page (<<) */}
        <button
          onClick={() => onPageChange && onPageChange(1)}
          disabled={currentPage <= 1}
          className={`flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition ${currentPage <= 1
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer'
            }`}
          title="First Page (Page 1)"
          aria-label="First Page"
        >
          <ChevronsLeft size={14} />
        </button>

        {/* Previous Page (<) */}
        <button
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition ${currentPage <= 1
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer'
            }`}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page Numbers (1, 2, 3 ... 100) */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-gray-400 font-bold select-none">
                  ...
                </span>
              );
            }
            const isActive = currentPage === p;
            return (
              <button
                key={p}
                onClick={() => onPageChange && onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-md border text-xs font-semibold transition cursor-pointer ${isActive
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                title={`Page ${p}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page (>) */}
        <button
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition ${currentPage >= totalPages
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer'
            }`}
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={14} />
        </button>

        {/* Last Page (>>) */}
        <button
          onClick={() => onPageChange && onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className={`flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition ${currentPage >= totalPages
              ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer'
            }`}
          title={`Last Page (Page ${totalPages})`}
          aria-label="Last Page"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;