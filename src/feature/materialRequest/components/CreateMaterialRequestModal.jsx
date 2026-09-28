import React, { useState, useEffect } from "react";
import {
  X,
  ClipboardList,
  ChevronDown,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Search
} from "lucide-react";
import { getPlannings } from "../../planning/services/planningService.js";
import { createMaterialRequest } from "../services/materialRequestService.js";
import axios from "axios";
import { API_BASE_URL } from "../../../services/apiConfig.js";

const getShiftIncharges = async () => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(`${API_BASE_URL}/api/employees/by-role/shift incharge`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true
  });
  return response.data;
};

export const CreateMaterialRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [plannings, setPlannings] = useState([]);
  const [shiftIncharges, setShiftIncharges] = useState([]);
  const [loadingPlannings, setLoadingPlannings] = useState(false);
  const [loadingIncharges, setLoadingIncharges] = useState(false);

  const [selectedPlanningId, setSelectedPlanningId] = useState("");
  const [selectedInchargeId, setSelectedInchargeId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [planningSearch, setPlanningSearch] = useState("");
  const [inchargeSearch, setInchargeSearch] = useState("");
  const [planningDropOpen, setPlanningDropOpen] = useState(false);
  const [inchargeDropOpen, setInchargeDropOpen] = useState(false);

  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoadingPlannings(true);
    setLoadingIncharges(true);
    try {
      const [planRes, inchargeRes] = await Promise.all([
        getPlannings(),
        getShiftIncharges()
      ]);
      const allPlannings = planRes?.data || [];
      const eligible = allPlannings.filter(p =>
        !p.material_request_status ||
        p.material_request_status === "None" ||
        p.material_request_status === "Cancelled"
      );
      setPlannings(eligible);
      setShiftIncharges(inchargeRes?.data || []);
    } catch (e) {
      console.error("Failed to load data:", e);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoadingPlannings(false);
      setLoadingIncharges(false);
    }
  };

  const resetForm = () => {
    setSelectedPlanningId("");
    setSelectedInchargeId("");
    setSelectedPlanning(null);
    setSelectedIncharge(null);
    setRemarks("");
    setPlanningSearch("");
    setInchargeSearch("");
    setPlanningDropOpen(false);
    setInchargeDropOpen(false);
    setError("");
    setSuccess("");
    setSubmitting(false);
  };

  const filteredPlannings = plannings.filter(p => {
    const q = planningSearch.toLowerCase();
    return (
      (p.planning_code || "").toLowerCase().includes(q) ||
      (p.product_name || "").toLowerCase().includes(q) ||
      (p.project_name || "").toLowerCase().includes(q) ||
      (p.project_code || "").toLowerCase().includes(q)
    );
  });

  const filteredIncharges = shiftIncharges.filter(e => {
    const q = inchargeSearch.toLowerCase();
    return (
      (e.employee_name || "").toLowerCase().includes(q) ||
      (e.employee_code || "").toLowerCase().includes(q)
    );
  });

  const handleSelectPlanning = (p) => {
    setSelectedPlanningId(String(p.id));
    setSelectedPlanning(p);
    setPlanningDropOpen(false);
    setPlanningSearch("");
    setError("");
  };

  const handleSelectIncharge = (e) => {
    setSelectedInchargeId(String(e.id));
    setSelectedIncharge(e);
    setInchargeDropOpen(false);
    setInchargeSearch("");
    setError("");
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedPlanningId) {
      setError("Please select a Planning.");
      return;
    }
    if (!selectedInchargeId) {
      setError("Please select a Shift Incharge.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createMaterialRequest({
        planning_id: Number(selectedPlanningId),
        requested_by: Number(selectedInchargeId),
        remarks: remarks.trim() || undefined
      });

      if (res.success) {
        setSuccess(`Material Request ${res.data?.request_code} created successfully!`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1300);
      } else {
        setError(res.message || "Failed to create material request.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) { setPlanningDropOpen(false); setInchargeDropOpen(false); } }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-visible flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold">New Material Request</h2>
              <p className="text-[11px] text-blue-200 mt-0.5">Select planning &amp; Shift Incharge</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Planning Dropdown */}
          <div className="relative z-20">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Production Planning <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => { setPlanningDropOpen(v => !v); setInchargeDropOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer text-left"
            >
              {selectedPlanning ? (
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  <span className="font-mono text-indigo-700">{selectedPlanning.planning_code}</span>
                  <span className="text-slate-400">—</span>
                  <span className="truncate">{selectedPlanning.product_name || selectedPlanning.project_name || `Product #${selectedPlanning.project_id}`}</span>
                </span>
              ) : (
                <span className="text-slate-400">
                  {loadingPlannings ? "Loading plannings..." : "Select a Planning..."}
                </span>
              )}
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${planningDropOpen ? "rotate-180" : ""}`} />
            </button>

            {planningDropOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by code or product..."
                      value={planningSearch}
                      onChange={(e) => setPlanningSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {filteredPlannings.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400">
                      {loadingPlannings ? "Loading..." : planningSearch ? "No plannings match your search." : "No eligible plannings available."}
                    </div>
                  ) : (
                    filteredPlannings.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPlanning(p)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${selectedPlanningId === String(p.id) ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-indigo-700 shrink-0">{p.planning_code}</span>
                            <span className="text-slate-400 shrink-0">—</span>
                            <span className="font-semibold text-slate-800 truncate">{p.product_name || p.project_name || `Product #${p.project_id}`}</span>
                          </div>
                          {p.project_code && <span className="text-[10px] text-slate-400 font-mono shrink-0">{p.project_code}</span>}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-500 flex items-center gap-1.5 pl-0">
                          <Package size={10} />
                          <span>{p.total_materials_count || 0} materials</span>
                          <span>•</span>
                          <span>Qty: {p.planned_quantity}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Planning preview */}
            {selectedPlanning && (
              <div className="mt-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-700 flex items-center gap-3 flex-wrap">
                <Package size={13} />
                <span><strong>{selectedPlanning.total_materials_count || 0}</strong> raw material items</span>
                <span className="text-indigo-300">|</span>
                <span>Planned Qty: <strong>{selectedPlanning.planned_quantity}</strong></span>
                {selectedPlanning.rm_dispatch_date && (
                  <>
                    <span className="text-indigo-300">|</span>
                    <span>Dispatch Date: <strong>{(() => {
                      const parts = String(selectedPlanning.rm_dispatch_date).split('T')[0].split('-');
                      return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : selectedPlanning.rm_dispatch_date;
                    })()}</strong></span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shift Incharge Dropdown */}
          <div className="relative z-10">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Shift Incharge (Requested By) <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => { setInchargeDropOpen(v => !v); setPlanningDropOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer text-left"
            >
              {selectedIncharge ? (
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  <User size={13} className="text-blue-500 shrink-0" />
                  {selectedIncharge.employee_name}
                  <span className="text-slate-400 font-mono text-[10px]">({selectedIncharge.employee_code})</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-2">
                  <User size={13} className="shrink-0" />
                  {loadingIncharges ? "Loading..." : "Select Shift Incharge..."}
                </span>
              )}
              <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${inchargeDropOpen ? "rotate-180" : ""}`} />
            </button>

            {inchargeDropOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search by name or code..."
                      value={inchargeSearch}
                      onChange={(e) => setInchargeSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {filteredIncharges.length === 0 ? (
                    <div className="py-5 text-center text-xs text-slate-400">
                      {loadingIncharges ? "Loading..." : inchargeSearch ? "No incharge found." : "No Shift Incharges available."}
                    </div>
                  ) : (
                    filteredIncharges.map(e => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => handleSelectIncharge(e)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer ${selectedInchargeId === String(e.id) ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold shrink-0">
                            {(e.employee_name || "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{e.employee_name}</div>
                            <div className="text-[10px] text-slate-400">{e.employee_code} &bull; {e.role || "Shift Incharge"}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Urgent — production starts tomorrow morning"
              rows={2}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Info Note */}
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 flex items-start gap-2">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>
              Raw materials will be automatically copied from the selected planning.
              Store inventory is <strong>not deducted</strong> until a Dispatch is confirmed by the Store Manager.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedPlanningId || !selectedInchargeId}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-blue-600/20 transition-colors cursor-pointer"
          >
            {submitting ? (
              <><Loader2 size={13} className="animate-spin" /> Submitting...</>
            ) : (
              <><ClipboardList size={13} /> Create Request</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
