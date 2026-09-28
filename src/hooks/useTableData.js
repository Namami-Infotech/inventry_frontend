// src/hooks/useTableData.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Common hook for managing table data with pagination, search, and delete handling.
 *
 * @param {Function} fetchApi - Async function returning { data, pagination: { currentPage, totalPages, totalItems, pageSize } } or { data: [] }
 * @param {Object} options - Initial configuration { initialPage: 1, initialLimit: 10, initialSearch: '', extraParams: {} }
 */
export const useTableData = (fetchApi, options = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    extraParams = {},
    autoFetch = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearchState] = useState(initialSearch);

  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    pageSize: initialLimit,
    totalItems: 0,
    totalPages: 1,
  });

  const extraParamsRef = useRef(extraParams);
  extraParamsRef.current = extraParams;

  // Custom search updater that resets page to 1
  const setSearch = useCallback((newSearch) => {
    setSearchState((prev) => {
      if (prev !== newSearch) {
        setPage(1); // Auto reset page to 1 when search query changes
      }
      return newSearch;
    });
  }, []);

  // Custom limit updater that resets page to 1
  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Fetch data execution
  const fetchData = useCallback(async (overrideParams = {}) => {
    if (!fetchApi) return;
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
        search: search ? search.trim() : '',
        ...extraParamsRef.current,
        ...overrideParams,
      };

      const res = await fetchApi(params);

      // Handle common response formats: { success, data, pagination } or axios response { data: { success, data, pagination } }
      const resData = res?.data !== undefined ? (res.data.data !== undefined ? res.data : res) : res;
      const items = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      setData(items);

      if (resData?.pagination) {
        setPagination({
          currentPage: resData.pagination.currentPage || page,
          pageSize: resData.pagination.pageSize || limit,
          totalItems: resData.pagination.totalItems !== undefined ? resData.pagination.totalItems : items.length,
          totalPages: resData.pagination.totalPages || Math.ceil((resData.pagination.totalItems || items.length) / limit) || 1,
        });
      } else {
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          pageSize: limit,
          totalItems: items.length,
          totalPages: Math.ceil(items.length / limit) || 1,
        }));
      }

      return res;
    } catch (err) {
      console.error('Failed to fetch table data:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchApi, page, limit, search]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  /**
   * Helper after successful deletion.
   * If the user deleted the last record on the current page (and page > 1),
   * shifts the page backward to page - 1. Otherwise re-fetches current page.
   */
  const handleDeleteSuccess = useCallback(() => {
    if (page > 1 && data.length <= 1) {
      setPage((prev) => Math.max(1, prev - 1));
    } else {
      fetchData();
    }
  }, [page, data.length, fetchData]);

  return {
    data,
    setData,
    loading,
    setLoading,
    error,
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,
    search,
    setSearch,
    pagination,
    setPagination,
    fetchData,
    handleDeleteSuccess,
  };
};

export default useTableData;
