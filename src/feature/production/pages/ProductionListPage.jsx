import React, { useState, useEffect, useCallback } from "react";
import {
  Cpu,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Layers,
  Package,
  TrendingUp,
  AlertTriangle,
  Filter,
  RefreshCw,
  XCircle,
  Scale
} from "lucide-react";
import { getProductions, cancelProduction } from "../services/productionService";
import { CreateProductionModal } from "../components/CreateProductionModal";
import { ProductionDetailDrawer } from "../components/ProductionDetailDrawer";
import Pagination from "../../../components/common/pagination";
import TableSearch from "../../../components/common/TableSearch";
import DeleteConfirmation from "../../../components/common/DeleteConfirmation";

export const ProductionListPage = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [shiftFilter, setShiftFilter] = useState("all");
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

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProductionId, setSelectedProductionId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Cancel/Delete Confirmation state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [prodToCancel, setProdToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRole = (currentUser?.role || currentUser?.Role || "").trim().toLowerCase();
  const canCreate =
    rawRole === "admin" ||
    rawRole === "super admin" ||
    rawRole === "shift incharge" ||
    rawRole === "manager";

  const fetchProductionsList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProductions({
        page,
        limit,
        search: searchTerm ? searchTerm.trim() : undefined,
        shift: shiftFilter !== "all" ? shiftFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setProductions(list);

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
      console.error("Failed to fetch productions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, shiftFilter, statusFilter]);

  useEffect(() => {
    fetchProductionsList();
  }, [fetchProductionsList]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setPage(1);
  };

  const handleShiftChange = (val) => {
    setShiftFilter(val);
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

  const handleOpenCancel = (prod) => {
    setProdToCancel(prod);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!prodToCancel) return;
    try {
      setCancelLoading(true);
      await cancelProduction(prodToCancel.id);
      setCancelModalOpen(false);
      setProdToCancel(null);

      // Edge case: if last record on page > 1, shift back
      if (page > 1 && productions.length <= 1) {
        setPage((prev) => Math.max(1, prev - 1));
      } else {
        fetchProductionsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel production entry");
    } finally {
      setCancelLoading(false);
    }
  };

  // Calculations for KPI cards
  const totalEntries = productions.length;
  const totalActualProduced = productions.reduce((acc, p) => acc + Number(p.actual_production_quantity || 0), 0);
  const totalOkProduced = productions.reduce((acc, p) => acc + Number(p.ok_quantity || 0), 0);
  const totalRejections = productions.reduce((acc, p) => acc + Number(p.rejection_quantity || 0), 0);
  const avgRejectionPct =
    totalActualProduced > 0
      ? ((totalRejections / totalActualProduced) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="text-blue-600 w-6 h-6" />
            Production Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track daily machine runs, shift incharge allocations, OK parts, rejection analysis & finished goods generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProductionsList}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            Refresh
          </button>

          {canCreate && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus size={15} />
              New Production Entry
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Production Runs</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalEntries}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Cpu size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-indigo-600">Total Actual Output</span>
            <p className="text-2xl font-bold text-indigo-700 mt-1 font-mono">
              {totalActualProduced.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-600">OK Finished Goods</span>
            <p className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
              {totalOkProduced.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-rose-600">Rejections</span>
              <span className="text-[11px] font-bold text-rose-700">({avgRejectionPct}%)</span>
            </div>
            <p className="text-2xl font-bold text-rose-700 mt-1 font-mono">
              {totalRejections.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <TableSearch
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by production code, project, machine..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={shiftFilter}
              onChange={(e) => handleShiftChange(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Shifts</option>
              <option value="Day">Day Shift</option>
              <option value="Night">Night Shift</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Production Runs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3.5 px-4">Production ID</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Machine & Shift</th>
                <th className="py-3.5 px-4">Shift Incharge</th>
                <th className="py-3.5 px-4 text-right">Actual Qty</th>
                <th className="py-3.5 px-4 text-right">OK Parts</th>
                <th className="py-3.5 px-4 text-right">Rejection</th>
                <th className="py-3.5 px-4 text-right">Rate/Hr</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-500" />
                    Loading production entries...
                  </td>
                </tr>
              ) : productions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No production logs found matching your filters.
                  </td>
                </tr>
              ) : (
                productions.map((p) => {
                  const rejPct = Number(p.rejection_percentage || 0);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {p.production_code || `PRD-${p.id}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="font-bold text-slate-800">{p.product_name || p.project_name || `Product #${p.project_id}`}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.planning_code || `PLAN-${p.planning_id}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.machine_name}</div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.shift} Shift &bull; {p.production_date ? new Date(p.production_date).toLocaleDateString("en-IN") : ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{p.shift_incharge_1_name || "Shift Incharge"}</div>
                        {p.shift_incharge_2_name && (
                          <div className="text-[10px] text-slate-500">2nd: {p.shift_incharge_2_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {Number(p.actual_production_quantity || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 font-mono">
                        {Number(p.ok_quantity || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-rose-600 font-mono">
                          {Number(p.rejection_quantity || 0).toLocaleString()}
                        </span>
                        <span className="block text-[10px] text-rose-500">
                          ({rejPct}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-700 font-mono">
                        {p.production_per_hour || 0}/hr
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            p.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : p.status === "Cancelled"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-blue-100 text-blue-800 border-blue-300"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProductionId(p.id);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Production Details"
                          >
                            <Eye size={15} />
                          </button>

                          {p.status !== "Cancelled" && (
                            <button
                              onClick={() => handleOpenCancel(p)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Cancel Production Record"
                            >
                              <XCircle size={15} />
                            </button>
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
        title="Cancel Production Record?"
        itemName={prodToCancel?.production_code}
        message="Are you sure you want to cancel this Production record? This will revert finished goods stock."
        confirmText="Cancel Record"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setProdToCancel(null);
        }}
        loading={cancelLoading}
      />

      {/* Modals */}
      <CreateProductionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          fetchProductionsList();
          setIsCreateOpen(false);
        }}
      />

      <ProductionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedProductionId(null);
        }}
        productionId={selectedProductionId}
      />
    </div>
  );
};
