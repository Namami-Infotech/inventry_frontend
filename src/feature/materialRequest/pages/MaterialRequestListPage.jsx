import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Package,
  Plus,
  MoreVertical,
  Trash2
} from "lucide-react";
import { getMaterialRequests, cancelMaterialRequest } from "../services/materialRequestService";
import { ViewMaterialRequestModal } from "../components/ViewMaterialRequestModal";
import { CreateDispatchModal } from "../../materialDispatch/components/CreateDispatchModal";
import { CreateMaterialRequestModal } from "../components/CreateMaterialRequestModal";
import Pagination from "../../../components/common/pagination";
import TableSearch from "../../../components/common/TableSearch";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";

export const MaterialRequestListPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Dispatch modal state
  const [dispatchRequestId, setDispatchRequestId] = useState(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  // Create Material Request modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Cancel Confirmation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // 3-dots actions menu state
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleCloseMenu = () => setOpenMenuId(null);
    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (currentUser?.role || currentUser?.Role || "").trim().toLowerCase();
  const isStoreOrAdmin =
    rawRole === "admin" ||
    rawRole === "super admin" ||
    rawRole === "store manager" ||
    rawRole === "warehouse manager" ||
    rawRole === "manager";

  const isShiftInchargeOrAdmin =
    rawRole === "admin" ||
    rawRole === "super admin" ||
    rawRole === "shift incharge" ||
    rawRole === "manager" ||
    rawRole === "store manager";

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        search: search ? search.trim() : undefined,
        status: statusFilter === "all" ? undefined : statusFilter
      };
      const data = await getMaterialRequests(params);
      const list = Array.isArray(data) ? data : data?.data || data?.requests || [];
      setRequests(list);

      if (data?.pagination) {
        setPagination(data.pagination);
      } else {
        setPagination({
          currentPage: page,
          pageSize: limit,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / limit) || 1
        });
      }
    } catch (err) {
      console.error("Failed to load material requests:", err);
      setError("Failed to load material requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePageSizeChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleOpenCancel = (req) => {
    setRequestToCancel(req);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    const reqId = requestToCancel.id || requestToCancel.request_id;
    try {
      setCancelLoading(true);
      await cancelMaterialRequest(reqId);
      setCancelModalOpen(false);
      setRequestToCancel(null);

      // Edge case: if only 1 item on page > 1, shift back
      if (page > 1 && requests.length <= 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel material request");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenDispatch = (req) => {
    // Pass the actual request id (from id or request_id field)
    const reqId = req.id || req.request_id;
    setDispatchRequestId(reqId);
    setIsDispatchOpen(true);
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const partialCount = requests.filter((r) => r.status === "Partially Dispatched").length;
  const fulfilledCount = requests.filter((r) => r.status === "Fully Dispatched").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Fully Dispatched":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Partially Dispatched":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-blue-600 w-6 h-6" />
            Material Request Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Raw material requisitions raised against Production Plannings by Shift Incharges.
          </p>
        </div>
        {/* <div className="flex items-center gap-2">
          {isShiftInchargeOrAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              New Material Request
            </button>
          )}
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh
          </button>
        </div> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Requests</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-600">Pending Store Review</span>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-indigo-600">Partially Dispatched</span>
            <p className="text-2xl font-bold text-indigo-700 mt-1">{partialCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-600">Fully Dispatched</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{fulfilledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <TableSearch
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by request code, planning, product, project..."
          className="w-full sm:w-96"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Dispatched">Partially Dispatched</option>
            <option value="Fully Dispatched">Fully Dispatched</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">

                <th className="py-3.5 px-4">Planning Reference</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Product Quantity</th>
                <th className="py-3.5 px-4">Requested By</th>
                <th className="py-3.5 px-4">Dispatch Date</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500" />
                    Loading material requests...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-rose-500">
                    {error}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {search ? `No material requests found for "${search}".` : "No material requests found."}
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const reqId = req.id || req.request_id;
                  const itemsCount = (req.items || req.raw_materials || []).length || Number(req.total_items_count) || 0;

                  return (
                    <tr key={reqId} className="hover:bg-slate-50/70 transition-colors">

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        <div className="text-indigo-700 font-bold">{req.planning_code || `PLAN-${req.planning_id}`}</div>
                        {/* {req.planned_quantity && (
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                            Planned: <span className="font-bold text-slate-800">{Number(req.planned_quantity).toLocaleString()}</span>
                          </div>
                        )} */}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="font-bold text-slate-900">
                          {req.product_name || req.project_name || `Product #${req.project_id}`}
                        </div>
                        {req.project_code && req.project_code !== (req.product_name || req.project_name) && (
                          <span className="text-[10px] text-slate-400 font-mono">[{req.project_code}]</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {req.planned_quantity && (
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                            <span className="font-bold text-slate-800">{Number(req.planned_quantity).toLocaleString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {req.requested_by_name || "Shift Incharge"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {req.request_date ? (() => {
                          const parts = String(req.request_date).split('T')[0].split('-');
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : req.request_date;
                        })() : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
                              {itemsCount} {itemsCount === 1 ? 'material' : 'materials'}
                            </span>
                          </div>

                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === reqId ? null : reqId);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${openMenuId === reqId
                                ? "bg-slate-200 text-slate-900"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              }`}
                            title="Actions"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openMenuId === reqId && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                            >
                              {/* View */}
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setSelectedRequest(req);
                                  setIsViewOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                <Eye size={14} className="text-slate-400" />
                                View Details
                              </button>

                              {/* Dispatch */}
                              {isStoreOrAdmin && req.status !== "Fully Dispatched" && req.status !== "Cancelled" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleOpenDispatch(req);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                                >
                                  <Truck size={14} />
                                  Dispatch Materials
                                </button>
                              )}

                              {/* Delete / Cancel */}
                              {req.status === "Pending" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    handleOpenCancel(req);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1 pt-1.5"
                                >
                                  <Trash2 size={14} />
                                  Delete / Cancel
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Common Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Common Cancel / Delete Confirmation */}
      <DeleteConfirmation
        open={cancelModalOpen}
        title="Cancel Material Request?"
        itemName={requestToCancel?.request_code || `REQ-${requestToCancel?.id || requestToCancel?.request_id}`}
        message={`Are you sure you want to cancel Material Request "${requestToCancel?.request_code || `REQ-${requestToCancel?.id || requestToCancel?.request_id}`}"? This action cannot be undone.`}
        confirmText="Cancel Request"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setRequestToCancel(null);
        }}
        loading={cancelLoading}
      />

      {/* Create Material Request Modal */}
      <CreateMaterialRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchRequests();
          setIsCreateOpen(false);
        }}
      />

      {/* View Modal */}
      <ViewMaterialRequestModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onOpenDispatch={handleOpenDispatch}
      />

      {/* Dispatch Modal — uses requestId prop */}
      <CreateDispatchModal
        isOpen={isDispatchOpen}
        requestId={dispatchRequestId}
        onClose={() => {
          setIsDispatchOpen(false);
          setDispatchRequestId(null);
        }}
        onSuccess={() => {
          fetchRequests();
          setIsDispatchOpen(false);
          setDispatchRequestId(null);
        }}
      />
    </div>
  );
};
