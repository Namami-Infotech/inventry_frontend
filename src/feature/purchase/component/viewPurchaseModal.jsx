import React, { useState, useEffect } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { getPurchaseById } from '../services/purchaseService.jsx';

export const ViewPurchaseModal = ({ isOpen, purchaseId, onClose }) => {
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && purchaseId) {
            fetchPurchase();
        }
    }, [isOpen, purchaseId]);

    const fetchPurchase = async () => {
        setLoading(true);
        try {
            const res = await getPurchaseById(purchaseId);
            if (res.success && res.data) {
                setPurchase(res.data);
            }
        } catch (e) {
            console.error("Failed to load purchase", e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <ShoppingCart size={16} className="text-blue-400" />
                        Purchase Order Details ({purchase?.purchase_number})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading purchase details...</div>
                    ) : !purchase ? (
                        <div className="text-center py-8 text-gray-400">Purchase not found.</div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Vendor</span>
                                    <p className="font-bold text-gray-900 text-xs mt-0.5">{purchase.vendor_name}</p>
                                    <p className="text-[10px] text-gray-500">{purchase.vendor_phone || ''}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Invoice No</span>
                                    <p className="font-mono font-bold text-gray-900 text-xs mt-0.5">{purchase.invoice_number}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Purchase Date</span>
                                    <p className="font-semibold text-gray-700 text-xs mt-0.5">{String(purchase.purchase_date).split('T')[0]}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                                    <p className="font-bold text-xs mt-0.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                            purchase.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                                            purchase.status === 'Partially Received' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {purchase.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                            <th className="py-2.5 px-3">Raw Material</th>
                                            <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                                            <th className="py-2.5 px-3 text-right">Received Qty</th>
                                            <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                                            <th className="py-2.5 px-3 text-right">Tax %</th>
                                            <th className="py-2.5 px-3 text-right">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(purchase.items || []).map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-semibold text-gray-900">{item.raw_material_name}</td>
                                                <td className="py-2.5 px-3 text-right font-medium">{Number(item.quantity).toLocaleString()} {item.unit}</td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-emerald-600">{Number(item.received_quantity || 0).toLocaleString()} {item.unit}</td>
                                                <td className="py-2.5 px-3 text-right text-gray-700">₹{Number(item.rate || 0).toLocaleString()}</td>
                                                <td className="py-2.5 px-3 text-right text-gray-500">{item.tax_percent || 0}%</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{Number(item.amount || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 font-bold text-xs border-t border-gray-200">
                                            <td colSpan="5" className="py-2.5 px-3 text-right">Grand Total:</td>
                                            <td className="py-2.5 px-3 text-right text-blue-600">₹{Number(purchase.grand_total || 0).toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {purchase.remarks && (
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600">
                                    <span className="font-semibold text-gray-700">Remarks: </span>
                                    {purchase.remarks}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end p-3.5 border-t border-gray-200 bg-gray-50 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-gray-900 text-white rounded-xl font-semibold text-xs hover:bg-gray-800 transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};