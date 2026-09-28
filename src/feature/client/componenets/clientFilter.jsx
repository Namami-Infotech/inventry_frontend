import React from 'react';
import TableSearch from '../../../components/common/TableSearch.jsx';

export const ClientFilters = ({
  searchQuery,
  setSearchQuery,
  hasActiveFilters,
  onClearAll,
}) => {
  return (
    <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex flex-wrap gap-3 justify-between items-center">
      <div className="flex-1 min-w-[260px]">
        <TableSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by company, contact person, GSTIN..."
        />
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="px-3.5 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition shrink-0"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};