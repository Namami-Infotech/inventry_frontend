import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Truck,
  Building2,
  Calendar,
  User,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Clock,
  Sparkles
} from "lucide-react";
import { getProjects } from "../../project/services/projectService";
import {
  getNextDeliveryNumber,
  getProjectForDelivery,
  getEligibleProjectsForDelivery,
  createDelivery
} from "../services/deliveryService";

export const CreateDeliveryPage = ({ onBack, onSuccess }) => {
  const [deliveryNumber, setDeliveryNumber] = useState("");
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectSummary, setProjectSummary] = useState(null);

  // Form Fields
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [deliveryPerson, setDeliveryPerson] = useState("");
  const [remarks, setRemarks] = useState("");

  // Items
  const [items, setItems] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingInitial(true);
      try {
        const [numRes, projRes] = await Promise.all([
          getNextDeliveryNumber().catch(() => ({})),
          getEligibleProjectsForDelivery().catch(() => ({ data: [] }))
        ]);

        if (numRes?.delivery_number) setDeliveryNumber(numRes.delivery_number);
        const pList = Array.isArray(projRes) ? projRes : projRes?.data || [];
        const activePendingDelivery = pList.filter((p) => {
          const totalQty = Number(p.project_quantity) || 0;
          const deliveredQty = Number(p.total_delivered_quantity) || 0;
          if (p.status === 'Completed' || p.status === 'Delivered') return false;
          if (totalQty > 0 && deliveredQty >= totalQty) return false;
          return true;
        });
        setProjectsList(activePendingDelivery);
      } catch (err) {
        console.error("Error loading delivery init data:", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    loadInitialData();
  }, []);

  const handleProjectSelect = async (projectId) => {
    setSelectedProjectId(projectId);
    setFormError("");
    if (!projectId) {
      setProjectSummary(null);
      setItems([]);
      setDeliveryAddress("");
      return;
    }

    setLoadingProject(true);
    try {
      const res = await getProjectForDelivery(projectId);
      if (res?.success && res.data) {
        const { project, finished_goods, total_delivered, remaining_to_deliver } = res.data;
        setProjectSummary({
          ...project,
          total_delivered,
          remaining_to_deliver
        });

        // Set delivery address from project or client address
        const addr = project.delivery_address || project.site_address || project.client_address || "";
        setDeliveryAddress(addr);

        // Pre-populate items from finished goods
        const fgItems = (finished_goods || []).map((fg) => {
          const avail = Number(fg.available_stock || 0);
          const rem = Math.max(0, Number(remaining_to_deliver || 0));
          const defaultDispatch = Math.min(avail, rem);

          return {
            finished_good_id: fg.finished_good_id,
            item_name: fg.item_name || "Finished Good",
            available_stock: avail,
            remaining_balance: rem,
            delivery_quantity: defaultDispatch,
            unit: fg.unit || "Nos"
          };
        });

        if (fgItems.length === 0) {
          // If no separate FG store item created yet, fallback to virtual project item
          fgItems.push({
            finished_good_id: null,
            item_name: `${project.project_name} Finished Good`,
            available_stock: 0,
            remaining_balance: Number(remaining_to_deliver || project.project_quantity || 0),
            delivery_quantity: 0,
            unit: "Nos"
          });
        }

        setItems(fgItems);
      }
    } catch (err) {
      console.error("Error fetching project for delivery:", err);
      setFormError("Could not fetch project details.");
    } finally {
      setLoadingProject(false);
    }
  };

  const handleItemQtyChange = (idx, val) => {
    const updated = [...items];
    const num = Math.max(0, Number(val) || 0);
    updated[idx].delivery_quantity = num;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!selectedProjectId) {
      setFormError("Please select a Project for delivery.");
      return;
    }
    if (!deliveryAddress?.trim()) {
      setFormError("Please enter the delivery site destination address.");
      return;
    }
    if (!deliveryDate) {
      setFormError("Delivery date is required.");
      return;
    }
    if (items.length === 0) {
      setFormError("At least one finished good item must be configured for delivery.");
      return;
    }

    const totalDeliveryQty = items.reduce((acc, it) => acc + Number(it.delivery_quantity || 0), 0);
    if (totalDeliveryQty <= 0) {
      setFormError("Total delivery quantity must be greater than 0.");
      return;
    }

    // Check store stock constraint
    for (const item of items) {
      if (item.finished_good_id && item.delivery_quantity > item.available_stock) {
        setFormError(
          `Delivery quantity for "${item.item_name}" (${item.delivery_quantity}) exceeds available Finished Goods stock (${item.available_stock}).`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        delivery_number: deliveryNumber,
        project_id: selectedProjectId,
        delivery_date: deliveryDate,
        delivery_address: deliveryAddress,
        vehicle_details: vehicleDetails,
        delivery_person: deliveryPerson,
        remarks,
        status: "Delivered",
        items: items.map((it) => ({
          finished_good_id: it.finished_good_id,
          delivery_quantity: Number(it.delivery_quantity),
          unit: it.unit
        }))
      };

      const res = await createDelivery(payload);
      if (res?.success) {
        if (onSuccess) onSuccess();
      } else {
        setFormError(res?.message || "Failed to create delivery challan.");
      }
    } catch (err) {
      console.error("Create delivery error:", err);
      setFormError(err.response?.data?.message || "Failed to record delivery.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="text-blue-600 w-6 h-6" />
              New Project Delivery Challan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dispatch manufactured finished goods against approved Project orders with automatic inventory deduction.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-xl">
          {deliveryNumber || "DEL-AUTO"}
        </span>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Project Selection */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" />
            1. Select Destination Project
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Project Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                disabled={loadingInitial || loadingProject}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer font-semibold"
                required
              >
                <option value="">
                  {loadingInitial
                    ? "-- Loading Eligible Projects --"
                    : projectsList.length === 0
                      ? "-- No Projects Available (Requires Confirmed Sales Order & Completed Production) --"
                      : "-- Choose Project (Confirmed Sales Order & Produced) --"}
                </option>
                {projectsList.map((p) => {
                  const rem = p.remaining_delivery_quantity != null
                    ? Number(p.remaining_delivery_quantity)
                    : Math.max(0, (Number(p.project_quantity) || 0) - (Number(p.total_delivered_quantity) || 0));
                  return (
                    <option key={p.id} value={p.id}>
                      {p.project_name} ({p.po_number ? `PO: ${p.po_number}` : p.project_code || `PRJ-${p.id}`}) &bull; Remaining to Deliver: {rem} / {p.project_quantity} Nos
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Only projects with Confirmed Sales Orders and completed production appear here.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
              <input
                type="text"
                value={projectSummary?.client_name || "Auto-detected from project"}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-semibold text-slate-800"
              />
            </div>
          </div>

          {projectSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Project Order</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {Number(projectSummary.project_quantity || 0).toLocaleString()} Nos
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Already Delivered</span>
                <span className="font-bold text-blue-700 font-mono text-sm">
                  {Number(projectSummary.total_delivered || 0).toLocaleString()} Nos
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Remaining Balance</span>
                <span className="font-bold text-amber-700 font-mono text-sm">
                  {Number(projectSummary.remaining_to_deliver || 0).toLocaleString()} Nos
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Client Contact</span>
                <span className="font-semibold text-slate-800">
                  {projectSummary.client_contact_person || projectSummary.client_phone || "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Transport & Delivery Details */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Truck size={16} className="text-indigo-600" />
            2. Transport & Logistics Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Delivery Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Vehicle Details / Truck No.
              </label>
              <input
                type="text"
                placeholder="e.g. MH 04 AB 1234 / Tata 407"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Driver / Delivery Person
              </label>
              <input
                type="text"
                placeholder="Driver name & phone"
                value={deliveryPerson}
                onChange={(e) => setDeliveryPerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-700 font-semibold mb-1">
                Destination Site Delivery Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter complete client site address..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Finished Goods Items Table */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package size={16} className="text-emerald-600" />
              3. Finished Goods Delivery Items ({items.length} items)
            </h3>
            <span className="text-[11px] text-slate-500">
              * Delivery Quantity cannot exceed Available Finished Goods Stock.
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Finished Good Item</th>
                  <th className="py-2.5 px-3 text-right">Store Available Stock</th>
                  <th className="py-2.5 px-3 text-right">Project Balance Needed</th>
                  <th className="py-2.5 px-3 text-right">Deliver Quantity</th>
                  <th className="py-2.5 px-3">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Please select a Project above to inspect finished goods stock.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isExceeding =
                      item.finished_good_id &&
                      Number(item.delivery_quantity) > Number(item.available_stock);

                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.item_name}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`font-bold font-mono ${
                              item.available_stock === 0 ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {Number(item.available_stock).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700 font-mono">
                          {Number(item.remaining_balance).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            max={item.available_stock}
                            value={item.delivery_quantity}
                            onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                            className={`w-28 px-2.5 py-1.5 border rounded-lg text-right font-bold text-sm focus:outline-none ${
                              isExceeding
                                ? "bg-rose-50 border-rose-400 text-rose-700"
                                : "bg-blue-50/60 border-blue-300 text-blue-800"
                            }`}
                          />
                          {isExceeding && (
                            <span className="block text-[9px] text-rose-500 font-semibold mt-0.5">
                              Exceeds store stock!
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">{item.unit}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Remarks */}
        <div className="p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
          <label className="block text-slate-700 font-semibold mb-1">
            Challan Remarks & Special Dispatch Instructions
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Special unloading instructions, transit insurance notes, receiver details..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating Challan...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Generate Delivery Challan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
