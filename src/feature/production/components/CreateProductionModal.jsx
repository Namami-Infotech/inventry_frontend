import React, { useState, useEffect } from "react";
import {
  X,
  Cpu,
  Package,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Layers,
  Scale,
  Clock,
  RotateCcw,
  Truck,
  Search,
  ChevronDown
} from "lucide-react";
import {
  getNextProductionCode,
  createProduction,
  getDispatchedRequestsForProduction
} from "../services/productionService";
import { getMachines } from "../../machine/services/machineService";
import { getEmployees } from "../../employee/services/employeeService";

export const CreateProductionModal = ({ isOpen, onClose, onSuccess }) => {
  const [productionCode, setProductionCode] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [planningId, setPlanningId] = useState("");
  const [requestId, setRequestId] = useState("");
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  const [productionDate, setProductionDate] = useState(todayStr);
  const [shift, setShift] = useState("Day");
  const [machineId, setMachineId] = useState("");
  const [shiftInchargeId1, setShiftInchargeId1] = useState("");
  const [shiftInchargeId2, setShiftInchargeId2] = useState("");
  const [operatorId1, setOperatorId1] = useState("");
  const [operatorId2, setOperatorId2] = useState("");
  const [remarks, setRemarks] = useState("");

  // Quantities
  const [plannedQty, setPlannedQty] = useState(0);
  const [actualQty, setActualQty] = useState(0);
  const [okQty, setOkQty] = useState(0);
  const [rejectionQty, setRejectionQty] = useState(0);
  const [rejectionWeight, setRejectionWeight] = useState(0);

  // Weights
  const [lumpsWeight, setLumpsWeight] = useState(0);
  const [runnerWeight, setRunnerWeight] = useState(0);
  const [partWeightGram, setPartWeightGram] = useState(0);

  // Times
  const [plannedCycleTime, setPlannedCycleTime] = useState(0);
  const [actualCycleTime, setActualCycleTime] = useState(0);
  const [actualWorkingHours, setActualWorkingHours] = useState(8);

  // Raw Materials
  const [materials, setMaterials] = useState([]);

  // Master Data
  const [dispatchedRequests, setDispatchedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [machinesList, setMachinesList] = useState([]);
  const [shiftInchargesList, setShiftInchargesList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);

  // Search/Dropdown
  const [requestSearch, setRequestSearch] = useState("");
  const [requestDropOpen, setRequestDropOpen] = useState(false);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Calculated
  const rejectionPct =
    Number(actualQty) > 0
      ? ((Number(rejectionQty) / Number(actualQty)) * 100).toFixed(2)
      : "0.00";

  const productionPerHour =
    Number(actualWorkingHours) > 0
      ? (Number(actualQty) / Number(actualWorkingHours)).toFixed(2)
      : "0.00";

  useEffect(() => {
    if (isOpen) {
      setFormError("");
      resetForm();
      const loadInitial = async () => {
        setLoadingInitial(true);
        try {
          const codeRes = await getNextProductionCode().catch(() => ({}));
          if (codeRes?.production_code) setProductionCode(codeRes.production_code);

          const [dispRes, machRes, empRes] = await Promise.all([
            getDispatchedRequestsForProduction().catch(() => ({ data: [] })),
            getMachines().catch(() => []),
            getEmployees().catch(() => [])
          ]);

          setDispatchedRequests(dispRes?.data || []);

          const mList = Array.isArray(machRes) ? machRes : machRes?.data || [];
          setMachinesList(mList);

          const eList = Array.isArray(empRes) ? empRes : empRes?.employees || empRes?.data || [];

          const incharges = eList.filter(
            (e) =>
              (e.role || "").toLowerCase() === "shift incharge" ||
              (e.designation || "").toLowerCase().includes("incharge") ||
              (e.department || "").toLowerCase().includes("production")
          );
          setShiftInchargesList(incharges.length > 0 ? incharges : eList);

          const operators = eList.filter(
            (e) =>
              (e.role || "").toLowerCase() === "operator" ||
              (e.designation || "").toLowerCase().includes("operator")
          );
          setOperatorsList(operators.length > 0 ? operators : eList);
        } catch (err) {
          console.error("Error loading data:", err);
          setFormError("Failed to load reference data.");
        } finally {
          setLoadingInitial(false);
        }
      };
      loadInitial();
    }
  }, [isOpen]);

  const resetForm = () => {
    setProjectId(""); setProjectName(""); setProjectCode("");
    setPlanningId(""); setRequestId(""); setSelectedRequest(null);
    setProductionDate(getTodayStr());
    setShift("Day"); setMachineId("");
    setShiftInchargeId1(""); setShiftInchargeId2("");
    setOperatorId1(""); setOperatorId2("");
    setRemarks(""); setPlannedQty(0); setActualQty(0);
    setOkQty(0); setRejectionQty(0); setRejectionWeight(0);
    setLumpsWeight(0); setRunnerWeight(0); setPartWeightGram(0);
    setPlannedCycleTime(0); setActualCycleTime(0); setActualWorkingHours(8);
    setMaterials([]); setRequestSearch(""); setRequestDropOpen(false);
    setFormError("");
  };

  // Handle Planning/Request Selection
  const handleRequestSelect = (req) => {
    setSelectedRequest(req);
    setRequestId(req.id);
    setPlanningId(req.planning_id);
    setProjectId(req.project_id);
    setProjectName(req.product_name || req.project_name || "");
    setProjectCode(req.project_code || "");
    const remaining = req.remaining_planned_quantity != null
      ? Number(req.remaining_planned_quantity)
      : Math.max(0, (Number(req.planned_quantity) || 0) - (Number(req.total_produced_quantity) || 0));
    setPlannedQty(remaining > 0 ? remaining : req.planned_quantity || 0);
    setShift(req.shift || "Day");
    if (req.machine_id) setMachineId(String(req.machine_id));
    if (req.shift_incharge_id) setShiftInchargeId1(String(req.shift_incharge_id));

    // Pre-fill materials from dispatched items
    const matItems = (req.dispatched_materials || []).map((m) => {
      const dispQty = Number(m.dispatched_quantity) || 0;
      return {
        raw_material_id: m.raw_material_id,
        raw_material_name: m.raw_material_name,
        dispatched_quantity: dispQty,
        actual_used_quantity: dispQty,
        wastage_quantity: 0,
        return_quantity: 0,
        unit: m.unit || "KG"
      };
    });
    setMaterials(matItems);
    setRequestDropOpen(false);
    setRequestSearch("");
    setFormError("");
  };

  const handleActualQtyChange = (val) => {
    const num = Math.max(0, Number(val));
    setActualQty(num);
    setOkQty(Math.max(0, num - Number(rejectionQty)));
  };

  const handleRejectionQtyChange = (val) => {
    const num = Math.max(0, Number(val));
    setRejectionQty(num);
    setOkQty(Math.max(0, Number(actualQty) - num));
  };

  const handleMaterialFieldChange = (idx, field, val) => {
    const updated = [...materials];
    const num = Math.max(0, Number(val) || 0);
    updated[idx][field] = num;
    if (field === "actual_used_quantity" || field === "wastage_quantity") {
      const disp = updated[idx].dispatched_quantity || 0;
      const used = updated[idx].actual_used_quantity || 0;
      const waste = updated[idx].wastage_quantity || 0;
      if (disp >= used + waste) {
        updated[idx].return_quantity = Number((disp - (used + waste)).toFixed(3));
      }
    }
    setMaterials(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const currentToday = getTodayStr();
    if (!productionDate) {
      setFormError("Production Date is required.");
      return;
    }
    if (productionDate !== currentToday) {
      setFormError(`Production Date must be today's current date (${currentToday}).`);
      return;
    }

    if (!planningId || !projectId) {
      setFormError("Please select a dispatched Planning / Material Request.");
      return;
    }
    if (!machineId) {
      setFormError("Please select the Machine used for this production run.");
      return;
    }
    if (!shiftInchargeId1) {
      setFormError("Minimum 1 Shift Incharge is mandatory.");
      return;
    }
    if (shiftInchargeId1 && shiftInchargeId2 && shiftInchargeId1 === shiftInchargeId2) {
      setFormError("Shift Incharge 1 and Shift Incharge 2 cannot be the same person.");
      return;
    }
    if (Number(actualQty) <= 0) {
      setFormError("Actual Production Quantity must be greater than 0.");
      return;
    }
    if (Number(rejectionQty) > Number(actualQty)) {
      setFormError("Rejection quantity cannot exceed actual production quantity.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        production_code: productionCode,
        project_id: projectId,
        product_name: selectedRequest?.product_name || projectName,
        planning_id: planningId,
        material_request_id: requestId || null,
        production_date: productionDate,
        shift,
        machine_id: machineId,
        shift_incharge_id_1: shiftInchargeId1,
        shift_incharge_id_2: shiftInchargeId2 || null,
        operator_id: operatorId1 || null,
        operator_id_2: operatorId2 || null,
        remarks,
        planned_quantity: Number(plannedQty),
        actual_production_quantity: Number(actualQty),
        ok_quantity: Number(okQty),
        rejection_quantity: Number(rejectionQty),
        rejection_weight: Number(rejectionWeight),
        lumps_weight: Number(lumpsWeight),
        runner_weight: Number(runnerWeight),
        part_weight_gram: Number(partWeightGram),
        planned_cycle_time: Number(plannedCycleTime),
        actual_cycle_time: Number(actualCycleTime),
        actual_working_hours: Number(actualWorkingHours),
        status: "Completed",
        materials
      };

      const res = await createProduction(payload);
      if (res?.success) {
        onSuccess();
        onClose();
      } else {
        setFormError(res?.message || "Failed to save production entry.");
      }
    } catch (err) {
      console.error("Create production error:", err);
      setFormError(err.response?.data?.message || "Failed to record production.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredRequests = dispatchedRequests
    .filter((r) => {
      // Must have materials dispatched from store
      const isDispatched =
        ['Fully Dispatched', 'Partially Dispatched', 'Dispatched'].includes(r.status) ||
        ['Fully Dispatched', 'Partially Dispatched', 'Dispatched', 'In Production'].includes(r.planning_status) ||
        (r.dispatched_materials || []).some((m) => Number(m.dispatched_quantity) > 0);
      return isDispatched;
    })
    .filter((r) => {
      // Exclude plannings where production is already 100% completed
      if (r.planning_status === 'Completed') return false;
      const planned = Number(r.planned_quantity) || 0;
      const produced = Number(r.total_produced_quantity) || 0;
      if (planned > 0 && produced >= planned) return false;
      return true;
    })
    .filter((r) => {
      const q = requestSearch.toLowerCase();
      return (
        (r.request_code || "").toLowerCase().includes(q) ||
        (r.planning_code || "").toLowerCase().includes(q) ||
        (r.project_name || "").toLowerCase().includes(q) ||
        (r.project_code || "").toLowerCase().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">New Production Entry</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                  {productionCode || "PRD-AUTO"}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Select a planning with materials dispatched from store to log actual production.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Select Planning & Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Truck size={15} className="text-orange-600" />
                1. Select Planning
              </h3>
              {selectedRequest && (
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${selectedRequest.status === 'Fully Dispatched'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                  {selectedRequest.status || 'Dispatched'}
                </span>
              )}
            </div>

            {/* Row 1: Full-width / Spacious Select Planning */}
            <div className="relative z-30">
              <label className="block text-slate-700 font-semibold mb-1 text-xs">
                Select Planning <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setRequestDropOpen(v => !v)}
                disabled={loadingInitial}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-left transition-colors cursor-pointer shadow-xs"
              >
                {selectedRequest ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 whitespace-nowrap">
                      {selectedRequest.planning_code}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-slate-800 text-xs truncate">
                      {selectedRequest.product_name || selectedRequest.project_name}
                    </span>
                    {selectedRequest.request_code && (
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">
                        ({selectedRequest.request_code})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">
                    {loadingInitial
                      ? "Loading plannings..."
                      : filteredRequests.length === 0
                        ? "No plannings with dispatched materials available"
                        : "-- Select Planning for Production --"}
                  </span>
                )}
                <ChevronDown
                  size={15}
                  className={`text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${requestDropOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {requestDropOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search by planning code, request code, or project name..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 px-4">
                        {requestSearch
                          ? "No matching plannings found."
                          : "No plannings with dispatched materials found. Materials must be dispatched from Store first."}
                      </div>
                    ) : (
                      filteredRequests.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRequestSelect(r)}
                          className={`w-full text-left px-4 py-3 text-xs hover:bg-blue-50/80 transition-colors cursor-pointer ${selectedRequest?.id === r.id ? "bg-blue-50/90" : ""
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded text-[11px] shrink-0 whitespace-nowrap">
                                {r.planning_code}
                              </span>
                              <span className="font-semibold text-slate-900 text-xs truncate">
                                {r.product_name || r.project_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400">{r.request_code}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${r.status === 'Fully Dispatched'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                {r.status || 'Dispatched'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-1.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                              <Package size={12} className="text-slate-400" />
                              {(r.dispatched_materials || []).filter(m => Number(m.dispatched_quantity) > 0).length || (r.dispatched_materials || []).length} Dispatched Materials
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Planned Qty: <strong className="text-slate-700">{r.planned_quantity}</strong> (Remaining: <strong className="text-emerald-700">{r.remaining_planned_quantity ?? Math.max(0, (Number(r.planned_quantity) || 0) - (Number(r.total_produced_quantity) || 0))}</strong>)</span>
                            {r.client_name && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600 truncate max-w-xs">Customer: {r.client_name}</span>
                              </>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Row 2: Customer, Part Name & Planned Qty */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">Customer / Client</label>
                <input
                  type="text"
                  value={selectedRequest?.client_name || ""}
                  readOnly
                  placeholder="Auto-filled from planning"
                  className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs"
                />
              </div> */}

              {/* <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">Part Name / Project</label>
                <input
                  type="text"
                  value={projectName ? `${projectName}${projectCode ? ` [${projectCode}]` : ""}` : ""}
                  readOnly
                  placeholder="Auto-filled from planning"
                  className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-800 font-semibold text-xs truncate"
                />
              </div> */}

              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[11px]">Planned Quantity</label>
                <input
                  type="text"
                  value={selectedRequest ? `${selectedRequest.planned_quantity} Nos` : ""}
                  readOnly
                  placeholder="Auto-filled from planning"
                  className="w-full px-3 py-2 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-800 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shift, Machine & Crew */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User size={15} className="text-indigo-600" />
              2. Shift, Machine & Crew
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Production Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={productionDate}
                  min={todayStr}
                  max={todayStr}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProductionDate(val);
                    if (val && val !== todayStr) {
                      setFormError(`Only today's current date (${todayStr}) is allowed.`);
                    } else {
                      setFormError("");
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Only today's date ({todayStr}) is allowed
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift <span className="text-rose-500">*</span></label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer font-semibold"
                  required
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Machine <span className="text-rose-500">*</span></label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  required
                >
                  <option value="">-- Choose Machine --</option>
                  {machinesList.map((m) => (
                    <option key={m.id} value={m.id}>{m.machine_name} [{m.machine_code}]</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Actual Working Hours</label>
                <input
                  type="number" step="0.1" min="0.1"
                  value={actualWorkingHours}
                  onChange={(e) => setActualWorkingHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Incharge 1 <span className="text-rose-500">*</span></label>
                <select
                  value={shiftInchargeId1}
                  onChange={(e) => setShiftInchargeId1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  required
                >
                  <option value="">-- Primary Incharge --</option>
                  {shiftInchargesList.map((inc) => (
                    <option key={inc.id} value={inc.id}>{inc.employee_name} ({inc.employee_code || "EMP"})</option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Incharge 2 <span className="text-slate-400 font-normal">(Optional)</span></label>
                <select
                  value={shiftInchargeId2}
                  onChange={(e) => setShiftInchargeId2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">-- Secondary Incharge --</option>
                  {shiftInchargesList
                    .filter((inc) => String(inc.id) !== String(shiftInchargeId1))
                    .map((inc) => (
                      <option key={inc.id} value={inc.id}>{inc.employee_name} ({inc.employee_code || "EMP"})</option>
                    ))}
                </select>
              </div> */}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operator 1</label>
                <select
                  value={operatorId1}
                  onChange={(e) => setOperatorId1(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">-- Operator 1 (Optional) --</option>
                  {operatorsList.map((op) => (
                    <option key={op.id} value={op.id}>{op.employee_name} ({op.employee_code || "EMP"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operator 2</label>
                <select
                  value={operatorId2}
                  onChange={(e) => setOperatorId2(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="">-- Operator 2 (Optional) --</option>
                  {operatorsList
                    .filter((op) => String(op.id) !== String(operatorId1))
                    .map((op) => (
                      <option key={op.id} value={op.id}>{op.employee_name} ({op.employee_code || "EMP"})</option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Production Quantities */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package size={15} className="text-emerald-600" />
                3. Production Quantities & Quality Inspection
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Rejection Rate:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold ${Number(rejectionPct) > 5 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {rejectionPct}%
                </span>
                <span className="text-slate-500 ml-2">Per Hour:</span>
                <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-100 text-indigo-700">{productionPerHour} Nos/Hr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Production Qty <span className="text-rose-500">*</span></label>
                <input
                  type="number" min="1"
                  value={actualQty}
                  onChange={(e) => handleActualQtyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">OK Parts <span className="text-emerald-600">*</span></label>
                <input
                  type="number" min="0" max={actualQty}
                  value={okQty}
                  onChange={(e) => setOkQty(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rejection Parts (Nos)</label>
                <input
                  type="number" min="0" max={actualQty}
                  value={rejectionQty}
                  onChange={(e) => handleRejectionQtyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl font-bold text-rose-700 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rejection Weight (KG)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={rejectionWeight}
                  onChange={(e) => setRejectionWeight(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Weights & Cycle Times */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale size={15} className="text-amber-600" />
              4. Weight Analysis & Cycle Timings
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lumps Weight (KG)</label>
                <input type="number" step="0.01" min="0" value={lumpsWeight} onChange={(e) => setLumpsWeight(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Runner Weight (KG)</label>
                <input type="number" step="0.01" min="0" value={runnerWeight} onChange={(e) => setRunnerWeight(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Part Weight (Grams)</label>
                <input type="number" step="0.1" min="0" value={partWeightGram} onChange={(e) => setPartWeightGram(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl" />
              </div>
              {/* <div>
                <label className="block text-slate-700 font-semibold mb-1">Planned Cycle (Sec)</label>
                <input type="number" step="0.1" min="0" value={plannedCycleTime} onChange={(e) => setPlannedCycleTime(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl" />
              </div> */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Actual Cycle (Sec)</label>
                <input type="number" step="0.1" min="0" value={actualCycleTime} onChange={(e) => setActualCycleTime(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Section 5: Raw Material Consumption */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw size={15} className="text-blue-600" />
                5. Raw Material (RM) Usage & Returns â€” {materials.length} items
              </h3>
              <span className="text-[10px] text-slate-500">
                * RM Usage (Kgs) deducted from store. Return qty credited back.
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">RM Name</th>
                    <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                    <th className="py-2.5 px-3 text-right">RM Usage (Kgs) <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-3 text-right">Wastage Qty</th>
                    <th className="py-2.5 px-3 text-right">Return to Store</th>
                    <th className="py-2.5 px-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {selectedRequest ? "No dispatched materials found for this request." : "Select a dispatched planning above to load raw materials."}
                      </td>
                    </tr>
                  ) : (
                    materials.map((mat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{mat.raw_material_name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-700">{mat.dispatched_quantity}</td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number" step="0.01" min="0"
                            value={mat.actual_used_quantity}
                            onChange={(e) => handleMaterialFieldChange(idx, "actual_used_quantity", e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-right font-semibold text-slate-900 focus:bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number" step="0.01" min="0"
                            value={mat.wastage_quantity}
                            onChange={(e) => handleMaterialFieldChange(idx, "wastage_quantity", e.target.value)}
                            className="w-24 px-2 py-1 bg-amber-50/60 border border-amber-200 rounded-lg text-right text-amber-900 focus:bg-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number" step="0.01" min="0"
                            value={mat.return_quantity}
                            onChange={(e) => handleMaterialFieldChange(idx, "return_quantity", e.target.value)}
                            className="w-24 px-2 py-1 bg-blue-50/60 border border-blue-200 rounded-lg text-right font-bold text-blue-700 focus:bg-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{mat.unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Remarks */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Production Log Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter downtime reasons, shift notes, quality observations..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            * Submitting will log <strong>PRODUCTION_IN</strong> stock ledger movement for OK parts.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={onClose} disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button" onClick={handleSubmit} disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Recording...</>
              ) : (
                <><CheckCircle2 size={14} /> Complete Production Entry</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

