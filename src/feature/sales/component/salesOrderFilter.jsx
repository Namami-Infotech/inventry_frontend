import React from 'react';
import { Plus, Download } from 'lucide-react';
import TableSearch from '../../../components/common/TableSearch.jsx';

export const SalesOrderFilter = ({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  onClearAll,
  onOpenCreateModal,
  onDownloadReport,
}) => {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs">
      {/* Global Search Bar */}
      <div className="w-full sm:w-auto flex-1 sm:max-w-md">
        <TableSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by client, PO, product, project..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition text-center shrink-0 cursor-pointer"
          >
            Clear All
          </button>
        )}

        <button
          type="button"
          onClick={onDownloadReport}
          title="Download Sales Orders Report (Excel)"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer"
        >
          <Download size={14} />
          <span>Report</span>
        </button>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus size={14} />
          <span>Create SO</span>
        </button>
      </div>
    </div>
  );
};