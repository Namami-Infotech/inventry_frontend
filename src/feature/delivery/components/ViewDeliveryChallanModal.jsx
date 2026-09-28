import React, { useRef } from "react";
import {
  X,
  Printer,
  Truck,
  Building2,
  Calendar,
  User,
  Package,
  FileText,
  MapPin,
  Phone,
  Mail,
  ShieldCheck
} from "lucide-react";

export const ViewDeliveryChallanModal = ({ isOpen, onClose, delivery }) => {
  const printRef = useRef(null);

  if (!isOpen || !delivery) return null;

  const items = delivery.items || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Screen Only */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <Truck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Delivery Challan</h2>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                  {delivery.delivery_number}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Client Dispatch & Finished Goods Outward Document
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              Print Challan
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Challan Content */}
        <div ref={printRef} className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 print:p-0">
          {/* Company Branding / Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Manufacturing & Production System
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Industrial Manufacturing Division &bull; Finished Goods Delivery Challan
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-500 block">CHALLAN NO.</span>
              <span className="text-lg font-black text-blue-700 font-mono tracking-wider">
                {delivery.delivery_number}
              </span>
            </div>
          </div>

          {/* Top Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            {/* Client Info */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Consignee / Client
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {delivery.client_name || "Direct Client"}
              </h4>
              {delivery.client_contact_person && (
                <p className="text-slate-600 flex items-center gap-1">
                  <User size={12} className="text-slate-400" />
                  {delivery.client_contact_person}
                </p>
              )}
              {delivery.client_phone && (
                <p className="text-slate-600 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" />
                  {delivery.client_phone}
                </p>
              )}
              {delivery.client_gst && (
                <p className="text-[11px] font-mono text-slate-500">
                  GST: <span className="font-semibold text-slate-700">{delivery.client_gst}</span>
                </p>
              )}
            </div>

            {/* Project & Dates */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Project Details
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {delivery.project_name || `Project #${delivery.project_id}`}
              </h4>
              {delivery.project_code && (
                <p className="text-slate-600 font-mono">Code: {delivery.project_code}</p>
              )}
              <p className="text-slate-600 flex items-center gap-1 mt-1">
                <Calendar size={12} className="text-slate-400" />
                Dispatch Date:{" "}
                <span className="font-semibold text-slate-800">
                  {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </p>
            </div>

            {/* Transport & Location */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Transport & Dispatch
              </span>
              <p className="text-slate-700">
                <span className="font-medium">Vehicle:</span>{" "}
                <span className="font-semibold">{delivery.vehicle_details || "N/A"}</span>
              </p>
              <p className="text-slate-700">
                <span className="font-medium">Driver/Person:</span>{" "}
                <span className="font-semibold">{delivery.delivery_person || "N/A"}</span>
              </p>
              <p className="text-slate-700 flex items-start gap-1 mt-1">
                <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <span>{delivery.delivery_address}</span>
              </p>
            </div>
          </div>

          {/* Delivered Goods Items Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Package size={14} className="text-blue-600" />
              Delivered Finished Goods Particulars ({items.length} items)
            </h3>
            <div className="overflow-x-auto border border-slate-300 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold text-[11px] border-b border-slate-300">
                    <th className="py-2.5 px-4 w-12">#</th>
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4 text-right">Project Total Target</th>
                    <th className="py-2.5 px-4 text-right">Delivered Quantity</th>
                    <th className="py-2.5 px-4 text-right">Balance Remaining</th>
                    <th className="py-2.5 px-4 w-20">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        No finished goods items recorded for this delivery.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {item.item_name || item.finished_good_name || "Finished Good"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-slate-700">
                          {Number(item.project_quantity || delivery.project_quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-blue-700 font-mono text-sm">
                          {Number(item.delivery_quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-600 font-mono">
                          {Number(item.balance_quantity || 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {item.unit || "Nos"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          {delivery.remarks && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block text-[11px] mb-0.5">
                Special Delivery Instructions & Remarks:
              </span>
              <p className="text-slate-700 text-xs">{delivery.remarks}</p>
            </div>
          )}

          {/* Signature & Authorization Section */}
          <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                Prepared By ({delivery.created_by_name || "Store Manager"})
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-semibold text-slate-700">
                Transport / Driver Signature
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">
                Authorized Client Receiver
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Screen Only */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-[11px] text-slate-500">
            * Note: Confirmed delivery created a <strong>DELIVERY_OUT</strong> stock ledger entry and deducted Finished Goods stock.
          </div>
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
