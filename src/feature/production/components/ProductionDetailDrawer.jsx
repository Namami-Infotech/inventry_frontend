import React, { useEffect, useState } from "react";
import {
  X,
  Cpu,
  Package,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RotateCcw,
  Loader2,
  Truck,
  Factory
} from "lucide-react";
import { getProductionById } from "../services/productionService";

export const ProductionDetailDrawer = ({ isOpen, onClose, productionId }) => {
  const [production, setProduction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && productionId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getProductionById(productionId);
          if (res?.success && res.data) {
            setProduction(res.data);
          } else {
            setProduction(res);
          }
        } catch (err) {
          console.error("Failed to load production details:", err);
          setError("Failed to load production details.");
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, productionId]);

  if (!isOpen) return null;

  const materials = production?.materials || [];

  const rejectionPct = production
    ? Number(production.rejection_percentage || 0).toFixed(2)
    : "0.00";

  const productionPerHour = production
    ? (Number(production.actual_working_hours || 0) > 0
        ? (Number(production.actual_production_quantity || 0) / Number(production.actual_working_hours)).toFixed(2)
        : Number(production.production_per_hour || 0).toFixed(2))
    : "0.00";

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
                <h2 className="text-lg font-bold">
                  {production?.production_code || `Production #${productionId}`}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {production?.status || "Completed"}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {production?.planning_code || `PLAN-${production?.planning_id}`} &bull; {production?.product_name || production?.project_name || `Product #${production?.project_id}`}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <Loader2 className="animate-spin w-8 h-8 mx-auto mb-2 text-blue-600" />
              Loading production details...
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">{error}</div>
          ) : production ? (
            <>
              {/* ── Row 1: Date / Shift / Machine / Customer / Part Name ── */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Factory size={13} className="text-indigo-600" />
                  Production Identity
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <Calendar size={10} /> Date
                    </span>
                    <p className="font-bold text-slate-900">
                      {production.production_date
                        ? new Date(production.production_date).toLocaleDateString("en-IN")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <Clock size={10} /> Shift
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                      {production.shift} Shift
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <Cpu size={10} /> Machine
                    </span>
                    <p className="font-bold text-slate-900">
                      {production.machine_name || `#${production.machine_id}`}
                    </p>
                    {production.machine_code && (
                      <span className="text-[10px] text-slate-400 font-mono">[{production.machine_code}]</span>
                    )}
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <User size={10} /> Customer
                    </span>
                    <p className="font-bold text-slate-900">
                      {production.client_name || "—"}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                      <Package size={10} /> Product / Part Name
                    </span>
                    <p className="font-bold text-slate-900 truncate">
                      {production.product_name || production.project_name || `Product #${production.project_id}`}
                    </p>
                    {production.project_code && (
                      <span className="text-[10px] text-slate-400 font-mono">[{production.project_code}]</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Row 2: Cycle Time / Working Hours / Per Hour / Production Qty / OK / Rejection / Rejection Wt / Rejection% ── */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Package size={13} className="text-emerald-600" />
                  Production Quantities & Time Analysis
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">CYCLE TIME (Sec)</span>
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-slate-500 font-normal text-[10px]">Actual: </span>{production.actual_cycle_time || 0}s
                    </p>
                    <p className="text-[10px] text-slate-500">Planned: {production.planned_cycle_time || 0}s</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">ACTUAL WORKING HOURS</span>
                    <p className="text-sm font-bold text-slate-900">{production.actual_working_hours || 0} Hrs</p>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-indigo-600 block mb-1">PER HOUR</span>
                    <p className="text-sm font-bold text-indigo-900">{productionPerHour} Nos/Hr</p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-blue-600 block mb-1">PRODUCTION QTY</span>
                    <p className="text-xl font-bold text-blue-900 font-mono">
                      {Number(production.actual_production_quantity || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-blue-500">Planned: {production.planned_quantity || 0}</span>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-emerald-600 block mb-1">OK PARTS</span>
                    <p className="text-xl font-bold text-emerald-900 font-mono">
                      {Number(production.ok_quantity || 0).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-emerald-600">→ FG Stock</span>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-rose-600 block mb-1">REJECTION PARTS</span>
                    <p className="text-xl font-bold text-rose-900 font-mono">
                      {Number(production.rejection_quantity || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                    <span className="text-[10px] font-semibold text-rose-600 block mb-1">REJECTION WEIGHT</span>
                    <p className="text-sm font-bold text-rose-900">{production.rejection_weight || 0} KG</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${Number(rejectionPct) > 5 ? "bg-rose-100 border-rose-300" : "bg-slate-50 border-slate-200"}`}>
                    <span className={`text-[10px] font-semibold block mb-1 ${Number(rejectionPct) > 5 ? "text-rose-700" : "text-slate-500"}`}>REJECTION %</span>
                    <p className={`text-xl font-bold font-mono ${Number(rejectionPct) > 5 ? "text-rose-900" : "text-slate-800"}`}>
                      {rejectionPct}%
                    </p>
                    {Number(rejectionPct) > 5 && (
                      <span className="text-[10px] text-rose-600 flex items-center gap-0.5 mt-0.5">
                        <AlertTriangle size={9} /> High Rejection
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Row 3: Lumps / Runner / Part Weight ── */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Scale size={13} className="text-amber-600" />
                  Weight Analysis
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-semibold text-amber-700 block mb-1">LUMPS WEIGHT</span>
                    <p className="text-sm font-bold text-amber-900">{production.lumps_weight || 0} KG</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-semibold text-amber-700 block mb-1">RUNNER WEIGHT</span>
                    <p className="text-sm font-bold text-amber-900">{production.runner_weight || 0} KG</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-100">
                    <span className="text-[10px] font-semibold text-amber-700 block mb-1">PART WEIGHT (Grams)</span>
                    <p className="text-sm font-bold text-amber-900">{production.part_weight_gram || 0} g</p>
                  </div>
                </div>
              </div>

              {/* ── Row 4: RM Usage Table ── */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <RotateCcw size={13} className="text-blue-600" />
                  RM Usage (Kgs) & Returns — {materials.length} materials
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">RM Name</th>
                        <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                        <th className="py-2.5 px-3 text-right">RM Usage (Kgs)</th>
                        <th className="py-2.5 px-3 text-right">Wastage Qty</th>
                        <th className="py-2.5 px-3 text-right">Returned To Store</th>
                        <th className="py-2.5 px-3">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {materials.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400">
                            No raw material consumption logged.
                          </td>
                        </tr>
                      ) : (
                        materials.map((mat, idx) => {
                          const totalRmUsage = Number(mat.actual_used_quantity || 0) + Number(mat.wastage_quantity || 0);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">{mat.raw_material_name}</td>
                              <td className="py-2.5 px-3 text-right font-medium text-slate-700">{mat.dispatched_quantity}</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                                {mat.actual_used_quantity}
                                {totalRmUsage > 0 && (
                                  <span className="block text-[10px] text-slate-400 font-normal">incl. wastage: {totalRmUsage.toFixed(3)}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right text-amber-700 font-medium">{mat.wastage_quantity || 0}</td>
                              <td className="py-2.5 px-3 text-right text-blue-700 font-bold">{mat.return_quantity || 0}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">{mat.unit || "KG"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Row 5: Shift Incharge / Operator 1 / Operator 2 ── */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
                <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <User size={13} className="text-indigo-600" />
                  Crew Assignment
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <span className="text-[10px] font-semibold text-indigo-600 block mb-1">SHIFT INCHARGE</span>
                    <p className="font-bold text-indigo-900 flex items-center gap-1">
                      <User size={12} /> {production.shift_incharge_1_name || "Not Assigned"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">SHIFT INCHARGE 2</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> {production.shift_incharge_2_name || "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">OPERATOR 1</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> {production.operator_name || production.operator_1_name || "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">OPERATOR 2</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <User size={12} className="text-slate-400" /> {production.operator_2_name || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Row 6: Remarks ── */}
              {production.remarks && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl">
                  <span className="font-semibold text-amber-900 block text-[11px] mb-0.5">REMARKS</span>
                  <p className="text-amber-800 text-xs">{production.remarks}</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
