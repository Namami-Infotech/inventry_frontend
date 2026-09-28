import React from 'react';
import { RotateCcw } from 'lucide-react';
import TableSearch from '../../../components/common/TableSearch.jsx';

export const EmployeeFilter = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roles = [],
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(searchTerm || roleFilter || statusFilter);

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-xs text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
        {/* Search Input */}
        <div>
          <TableSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search code, name, email..."
          />
        </div>

        {/* Role Select */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 text-gray-800 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs cursor-pointer"
          >
            <option value="">-- All System Roles --</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 text-gray-800 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs cursor-pointer"
          >
            <option value="">-- All Statuses --</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              hasActiveFilters
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={13} />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
