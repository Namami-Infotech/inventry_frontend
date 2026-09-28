import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  Package,
  RefreshCw,
  XCircle,
  Filter,
  Loader2,
  Clock
} from "lucide-react";
import { getDeliveries, getDeliveryById, cancelDelivery } from "../services/deliveryService";
import { ViewDeliveryChallanModal } from "../components/ViewDeliveryChallanModal";
import Pagination from "../../../components/common/pagination";
import TableSearch from "../../../components/common/TableSearch";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";

export const DeliveryList = ({ onAddNew }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Cancel Confirmation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deliveryToCancel, setDeliveryToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (currentUser?.role || currentUser?.Role || "").trim().toLowerCase();
  const canDispatch =
    rawRole === "admin" ||
    rawRole === "super admin" ||
    rawRole === "store manager" ||
    rawRole === "warehouse manager" ||
    rawRole === "manager";

  const fetchDeliveriesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDeliveries({
        page,
        limit,
        search: searchTerm ? searchTerm.trim() : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setDeliveries(list);

      if (res?.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({
          currentPage: page,
          pageSize: limit,
          totalItems: list.length,
          totalPages: Math.ceil(list.length / limit) || 1
        });
      }
    } catch (err) {
      console.error("Failed to load deliveries:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchDeliveriesList();
  }, [fetchDeliveriesList]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
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

  const handleView = async (delivery) => {
    try {
      const res = await getDeliveryById(delivery.id);
      if (res?.success && res.data) {
        setSelectedDelivery(res.data);
      } else {
        setSelectedDelivery(delivery);
      }
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Error loading delivery details:", err);
      setSelectedDelivery(delivery);
      setIsViewModalOpen(true);
    }
  };

  const handleOpenCancel = (del) => {
    setDeliveryToCancel(del);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!deliveryToCancel) return;
    try {
      setCancelLoading(true);
      await cancelDelivery(deliveryToCancel.id);
      setCancelModalOpen(false);
      setDeliveryToCancel(null);

      // Edge case: if last record on page > 1, shift back
      if (page > 1 && deliveries.length <= 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        fetchDeliveriesList();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel delivery challan");
    } finally {
      setCancelLoading(false);
    }
  };

  // KPI Calculations
  const totalDeliveriesCount = deliveries.length;
  const totalQuantityDelivered = deliveries.reduce(
    (acc, d) => acc + Number(d.total_delivery_quantity || 0),
    0
  );
  const activeProjectsDelivering = new Set(deliveries.map((d) => d.project_id)).size;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-blue-600 w-6 h-6" />
            Delivery Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Finished goods dispatch challans to clients with automatic stock outward and balance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDeliveriesList}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh
          </button>

          {canDispatch && (
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              New Delivery Challan
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Delivery Challans</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalDeliveriesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-600">Total Units Dispatched</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
              {totalQuantityDelivered.toLocaleString()} Nos
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-indigo-600">Active Client Projects</span>
            <p className="text-2xl font-bold text-indigo-700 mt-1 font-mono">
              {activeProjectsDelivering}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <TableSearch
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by challan no, project, client, vehicle..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Partially Delivered">Partially Delivered</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Challan No.</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Delivery Date</th>
                <th className="py-3.5 px-4 text-right">Dispatched Qty</th>
                <th className="py-3.5 px-4">Vehicle / Driver</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500" />
                    Loading deliveries...
                  </td>
                </tr>
              ) : deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No delivery records found.
                  </td>
                </tr>
              ) : (
                deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {del.delivery_number || `DEL-${del.id}`}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{del.project_name || `Project #${del.project_id}`}</div>
                      {del.project_code && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{del.project_code}]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {del.client_name || "Direct Client"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {del.delivery_date ? new Date(del.delivery_date).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {Number(del.total_delivery_quantity || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{del.vehicle_details || "Direct Transport"}</div>
                      {del.delivery_person && (
                        <span className="text-[10px] text-slate-400">{del.delivery_person}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          del.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : del.status === "Cancelled"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : "bg-blue-100 text-blue-800 border-blue-300"
                        }`}
                      >
                        {del.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleView(del)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View / Print Delivery Challan"
                        >
                          <Eye size={15} />
                        </button>

                        {del.status !== "Cancelled" && (
                          <button
                            onClick={() => handleOpenCancel(del)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Delivery Challan"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
        title="Cancel Delivery Challan?"
        itemName={deliveryToCancel?.delivery_number}
        message="Are you sure you want to cancel this delivery challan? This will restore Finished Goods inventory in the store."
        confirmText="Cancel Challan"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setDeliveryToCancel(null);
        }}
        loading={cancelLoading}
      />

      {/* View Challan Modal */}
      <ViewDeliveryChallanModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedDelivery(null);
        }}
        delivery={selectedDelivery}
      />
    </div>
  );
};
