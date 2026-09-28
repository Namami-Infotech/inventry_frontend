import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { getPurchaseById, receivePurchase } from '../services/purchaseService.jsx';

export const ReceivePurchaseModal = ({ isOpen, purchaseId, onClose, onSuccess }) => {
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [receivingQtys, setReceivingQtys] = useState({});
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && purchaseId) {
            fetchPurchase();
        }
    }, [isOpen, purchaseId]);

    const fetchPurchase = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getPurchaseById(purchaseId);
            if (res.success && res.data) {
                setPurchase(res.data);
                // Pre-fill remaining quantity for each item
                const initial = {};
                (res.data.items || []).forEach(item => {
                    const remaining = Math.max(0, Number(item.quantity) - Number(item.received_quantity || 0));
                    initial[item.id] = remaining;
                });
                setReceivingQtys(initial);
            }
        } catch (e) {
            console.error("Failed to load purchase", e);
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (itemId, val) => {
        setReceivingQtys(prev => ({
            ...prev,
            [itemId]: val
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const itemsToReceive = Object.keys(receivingQtys).map(itemId => ({
            id: Number(itemId),
            receiving_quantity: Number(receivingQtys[itemId]) || 0
        })).filter(i => i.receiving_quantity > 0);

        if (itemsToReceive.length === 0) {
            setError('Please enter receiving quantity for at least one item.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await receivePurchase(purchaseId, {
                received_items: itemsToReceive,
                remarks: remarks.trim() || 'Received into store inventory'
            });

            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to receive purchase items.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error during receiving.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <ShoppingCart size={16} className="text-emerald-400" />
                        Receive Raw Materials Into Store ({purchase?.purchase_number})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading purchase details...</div>
                    ) : !purchase ? (
                        <div className="text-center py-8 text-gray-400">Purchase not found.</div>
                    ) : (
                        <>
                            {/* Vendor & Invoice Info */}
                            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Vendor</span>
                                    <p className="font-bold text-gray-900 mt-0.5">{purchase.vendor_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Invoice No</span>
                                    <p className="font-mono font-bold text-gray-900 mt-0.5">{purchase.invoice_number}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Purchase Date</span>
                                    <p className="font-semibold text-gray-700 mt-0.5">{String(purchase.purchase_date).split('T')[0]}</p>
                                </div>
                            </div>

                            {/* Items Receiving Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                            <th className="py-2.5 px-3">Raw Material</th>
                                            <th className="py-2.5 px-3 text-right">Ordered Qty</th>
                                            <th className="py-2.5 px-3 text-right">Already Received</th>
                                            <th className="py-2.5 px-3 text-right">Remaining</th>
                                            <th className="py-2.5 px-3 text-right">Qty to Receive Now</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(purchase.items || []).map(item => {
                                            const ordered = Number(item.quantity) || 0;
                                            const received = Number(item.received_quantity) || 0;
                                            const remaining = Math.max(0, ordered - received);

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="py-2.5 px-3 font-semibold text-gray-900">{item.raw_material_name}</td>
                                                    <td className="py-2.5 px-3 text-right font-medium">{ordered} {item.unit}</td>
                                                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{received} {item.unit}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-amber-600">{remaining} {item.unit}</td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={remaining}
                                                            step="0.01"
                                                            value={receivingQtys[item.id] !== undefined ? receivingQtys[item.id] : remaining}
                                                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                            disabled={remaining <= 0}
                                                            className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-right text-xs font-bold text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Store Receiving Remarks</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Quality verified, goods unloaded in Raw Material Bay A"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || loading || !purchase}
                            className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                            <ArrowUpRight size={15} />
                            {submitting ? 'Confirming Inward...' : 'Confirm Store Receiving'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
