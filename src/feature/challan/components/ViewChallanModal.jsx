import React, { useRef } from 'react';
import { X, Printer, FileText, Calendar, MapPin, User, Phone, CheckCircle2, Clock, Truck, ShieldCheck, Building2 } from 'lucide-react';

export const ViewChallanModal = ({ isOpen, onClose, challan }) => {
  if (!isOpen || !challan) return null;

  const printAreaRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const parts = dateStr.substring(0, 10).split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  let rawItems = challan.items || challan.delivery_items || [];
  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch (e) {
      rawItems = [];
    }
  }
  const items = Array.isArray(rawItems) ? rawItems : [];

  const totalDeliveredQty = items.reduce(
    (acc, curr) => acc + Number(curr.delivered_qty ?? curr.this_challan_qty ?? curr.qty ?? 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs print:max-h-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Modal Header (Hidden during Print) */}
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center bg-slate-50/90 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Challan: <span className="text-blue-600 font-mono">{challan.challan_no}</span>
              </h2>
              <p className="text-gray-500 text-[11px]">Official Delivery Challan & Dispatch Voucher</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Printer size={14} /> Print Challan
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Printable Body */}
        <div ref={printAreaRef} className="p-4 sm:p-6 overflow-y-auto space-y-4 print:p-0 print:overflow-visible challan-print-container">
          
          {/* Printable Document Box */}
          <div className="border border-gray-200 rounded-xl p-5 sm:p-6 print:border-none print:p-0 bg-white space-y-5">
            
            {/* 1. Header & Company Brand Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">NAMAMI INFOTECH</h1>
                <p className="text-xs text-gray-600 font-medium">Solar Mounting & Industrial Solutions</p>
                <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  Plot No. 42, Industrial Area, Phase-II, Noida, UP - 201301<br />
                  Email: info@namami-infotech.com | Tel: +91 98765 43210<br />
                  <span className="font-semibold text-gray-700">GSTIN: 07AAACN1234F1Z5</span> | State Code: 07
                </div>
              </div>

              <div className="sm:text-right border-l sm:border-l-0 sm:border-r-0 border-gray-200 pl-4 sm:pl-0">
                <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2">
                  Delivery Challan
                </div>
                <div className="text-xs text-gray-700 space-y-1">
                  <div>Challan No: <strong className="font-mono text-gray-900 text-sm font-bold">{challan.challan_no}</strong></div>
                  <div>Challan Date: <strong className="text-gray-900">{formatDate(challan.dispatch_date || challan.created_at)}</strong></div>
                  <div>SO / PO Ref: <strong className="text-blue-700 font-semibold">{challan.po_number || `SO #${challan.order_id || '-'}`}</strong></div>
                </div>
              </div>
            </div>

            {/* 2. Consignee / Ship To & Transport Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Consignee */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-blue-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} /> Consignee / Ship To (Customer)
                </div>
                <div className="font-bold text-gray-900 text-sm">{challan.customer_name || 'Customer'}</div>
                <div className="text-gray-600 flex items-start gap-1 text-[11px]">
                  <MapPin size={12} className="shrink-0 text-gray-400 mt-0.5" />
                  <span>{challan.delivery_address || 'Site Delivery Address N/A'}</span>
                </div>
                <div className="text-gray-600 flex items-center gap-1 text-[11px]">
                  <Phone size={12} className="text-gray-400" />
                  <span>Contact: {challan.customer_phone || '-'}</span>
                </div>
              </div>

              {/* Transport & Logistics */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-blue-700 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={12} /> Dispatch & Transport Details
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-700 pt-0.5">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Transporter:</span>
                    <strong className="text-gray-900">{challan.transporter_name || 'Self / By Hand'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Vehicle No:</span>
                    <strong className="font-mono text-gray-900">{challan.vehicle_no || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Dispatch Date:</span>
                    <strong className="text-gray-900">{formatDate(challan.dispatch_date || challan.created_at)}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Assigned Incharge:</span>
                    <strong className="text-gray-900">{challan.site_engineer_name || 'Store Dispatch'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Items Table */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 flex justify-between items-center">
                <span>Material / Items Dispatched</span>
                <span className="text-gray-500 font-normal">Total Items: {items.length}</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3 min-w-[200px]">Description of Goods / Item Name</th>
                      <th className="py-2 px-3 w-28">Category / Brand</th>
                      <th className="py-2 px-3 w-16 text-center">Unit</th>
                      <th className="py-2 px-3 w-24 text-right">Challan Qty</th>
                      <th className="py-2 px-3 w-32 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-400 text-xs">
                          No items found for this delivery challan.
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => {
                        const qty = Number(it.delivered_qty ?? it.this_challan_qty ?? it.qty ?? 0);
                        return (
                          <tr key={it.id || idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-center text-gray-400 font-semibold">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-gray-900">{it.item_name}</div>
                              {it.brand && <div className="text-[10px] text-gray-500">Brand: {it.brand}</div>}
                            </td>
                            <td className="py-2 px-3 text-gray-600 text-[11px]">{it.category || 'Finished Goods'}</td>
                            <td className="py-2 px-3 text-center font-mono text-gray-600">{it.unit || 'Nos'}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 text-xs">{qty}</td>
                            <td className="py-2 px-3 text-gray-500 text-[11px]">{it.remarks || 'Sound Condition'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-xs border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-slate-700 uppercase text-[10px]">
                        Total Dispatched Quantity
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 text-xs">
                        {totalDeliveredQty}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-[10px]">Lines: {items.length}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 4. Terms, Declaration & Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200 text-[10px] text-gray-600">
              <div>
                <div className="font-bold text-gray-800 uppercase mb-1">Terms & Conditions:</div>
                <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                  <li>Goods dispatched in sound condition for installation/delivery.</li>
                  <li>Please check the materials and verify quantity upon arrival.</li>
                  <li>Discrepancy, if any, should be reported within 24 hours of receipt.</li>
                  <li>Subject to Gautam Buddha Nagar (Noida) jurisdiction.</li>
                </ol>
              </div>

              <div className="flex flex-col justify-between items-end text-right space-y-6">
                <div className="text-gray-700 font-medium">
                  For <strong className="text-gray-900 font-bold">NAMAMI INFOTECH</strong>
                </div>
                <div className="w-full flex justify-between items-end pt-6">
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-28 mb-1"></div>
                    <span className="font-medium text-gray-700">Receiver's Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 w-32 mb-1"></div>
                    <span className="font-bold text-gray-900">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer (Hidden during Print) */}
        <div className="px-5 py-2.5 border-t border-gray-200 bg-gray-50 flex justify-between items-center print:hidden">
          <span className="text-[11px] text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-700 font-mono text-[10px]">Ctrl + P</kbd> to Print or Save as PDF
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Printer size={14} /> Print Challan
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .challan-print-container,
          .challan-print-container * {
            visibility: visible !important;
          }
          .challan-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
