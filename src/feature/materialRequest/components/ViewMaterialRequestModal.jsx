import React, { useState, useEffect } from "react";
import { X, Calendar, User, Package, FileText, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { getMaterialRequestById } from "../services/materialRequestService";

export const ViewMaterialRequestModal = ({ isOpen, onClose, request, onOpenDispatch }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      const reqId = request.id || request.request_id;
      if (reqId) {
        setLoading(true);
        getMaterialRequestById(reqId)
          .then((res) => {
            if (res?.success && res?.data) {
              setDetails(res.data);
            } else {
              setDetails(request);
            }
          })
          .catch((err) => {
            console.error("Failed to load material request details:", err);
            setDetails(request);
          })
          .finally(() => setLoading(false));
      } else {
        setDetails(request);
      }
    } else {
      setDetails(null);
    }
  }, [isOpen, request]);

  if (!isOpen || !request) return null;

  const current = details || request;
  const items = current.items || current.dispatched_materials || [];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <FileText className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  Material Request #{current.request_code || current.request_id || current.id}
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(current.status)}`}>
                  {current.status}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Planning: {current.planning_code || `PLAN-${current.planning_id}`} &bull; Target: {current.product_name || current.project_name || `Product #${current.project_id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Target Product</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {current.product_name || current.project_name || `Product #${current.project_id}`}
              </p>
              {current.project_code && current.project_code !== (current.product_name || current.project_name) && (
                <span className="text-[10px] text-slate-500 font-mono">[{current.project_code}]</span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Planned Qty</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {current.planned_quantity ? Number(current.planned_quantity).toLocaleString() : '—'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Planning Code</span>
              <p className="text-sm font-semibold text-indigo-700 mt-0.5 font-mono">
                {current.planning_code || `PLAN-${current.planning_id}`}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Dispatch Date</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {current.rm_dispatch_date || current.request_date ? (() => {
                  const d = current.rm_dispatch_date || current.request_date;
                  const parts = String(d).split('T')[0].split('-');
                  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : d;
                })() : "N/A"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Requested By</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <User size={13} className="text-slate-400" />
                {current.requested_by_name || "Shift Incharge"}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-500 block">Status</span>
              <span className={`inline-block mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(current.status)}`}>
                {current.status}
              </span>
            </div>
          </div>

          {/* Remarks */}
          {current.remarks && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
              <span className="font-semibold text-amber-900 block text-[11px]">Remarks:</span>
              <p className="text-amber-800 text-xs mt-0.5">{current.remarks}</p>
            </div>
          )}

          {/* Requested Items Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5 flex items-center gap-2">
              <Package size={15} className="text-indigo-600" />
              Raw Material Requirement List ({items.length} items)
              {loading && <Loader2 size={14} className="animate-spin text-blue-600" />}
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Raw Material</th>
                    <th className="py-2.5 px-3 text-right">Required Qty</th>
                    <th className="py-2.5 px-3 text-right">Store Available</th>
                    <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                    <th className="py-2.5 px-3 text-right">Balance Needed</th>
                    <th className="py-2.5 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        <Loader2 className="animate-spin w-5 h-5 mx-auto mb-1 text-blue-500" />
                        Loading materials...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-400">
                        No raw material items found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const required = Number(item.required_quantity || item.required_qty || 0);
                      const dispatched = Number(item.dispatched_quantity || item.dispatched_qty || 0);
                      const balance = Math.max(0, required - dispatched);
                      const available = Number(item.available_stock || item.current_stock || 0);
                      const isShortage = available < balance;

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            <div>{item.raw_material_name || item.material_name || item.name || 'Raw Material'}</div>
                            {item.material_code && (
                              <span className="text-[10px] text-slate-500 font-mono">{item.material_code}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                            {required.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-semibold ${isShortage ? "text-rose-600" : "text-emerald-600"}`}>
                              {available.toLocaleString()}
                            </span>
                            {isShortage && balance > 0 && (
                              <span className="block text-[9px] text-rose-500">Low Stock</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-blue-600">
                            {dispatched.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-bold ${balance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                              {balance.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium">{item.unit || "KG"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            * Note: Material Requests do not reduce store inventory until confirmed Dispatch.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
            {request.status !== "Fully Dispatched" && request.status !== "Cancelled" && onOpenDispatch && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDispatch(request);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Package size={14} />
                Dispatch Materials
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
