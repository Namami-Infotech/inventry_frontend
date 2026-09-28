// src/components/common/TableSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export const TableSearch = ({
  value = '',
  onChange,
  placeholder = 'Search by name or code...',
  className = '',
  debounceMs = 350,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const isFirstRender = useRef(true);

  // Sync internal state if external value changes (e.g. reset from parent)
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Debounced search trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (onChange) {
        onChange(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`relative flex items-center min-w-[240px] max-w-sm ${className}`}>
      <Search className="absolute left-3 text-gray-400 pointer-events-none" size={16} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-sm placeholder:text-gray-400"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition cursor-pointer"
          title="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default TableSearch;
