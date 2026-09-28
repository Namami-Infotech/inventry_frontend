import React, { useState, useEffect } from 'react';
import { Truck, X, AlertCircle, CheckCircle2, ArrowDownRight, Store } from 'lucide-react';
import { getMaterialRequestById } from '../../materialRequest/services/materialRequestService.js';
import { createMaterialDispatch } from '../services/materialDispatchService.js';

export const CreateDispatchModal = ({ isOpen, requestId, onClose, onSuccess }) => {
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dispatchQtys, setDispatchQtys] = useState({});
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && requestId) {
            fetchRequest();
        }
    }, [isOpen, requestId]);

    const fetchRequest = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getMaterialRequestById(requestId);
            if (res.success && res.data) {
                setRequest(res.data);
                // Pre-fill default dispatch quantities (min of remaining balance and available stock)
                const initial = {};
                (res.data.items || []).forEach(item => {
                    const balance = Number(item.balance_required) || 0;
                    const stock = Number(item.available_stock) || 0;
                    const autoDispatch = Math.min(balance, stock);
                    initial[item.id] = autoDispatch > 0 ? autoDispatch : 0;
                });
                setDispatchQtys(initial);
            }
        } catch (e) {
            console.error("Failed to load material request", e);
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (itemId, val) => {
        setDispatchQtys(prev => ({
            ...prev,
            [itemId]: val
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const itemsToDispatch = Object.keys(dispatchQtys).map(itemId => {
            const rawItem = (request.items || []).find(i => Number(i.id) === Number(itemId));
            return {
                request_item_id: Number(itemId),
                raw_material_id: rawItem?.raw_material_id,
                dispatched_quantity: Number(dispatchQtys[itemId]) || 0
            };
        }).filter(i => i.dispatched_quantity > 0);

        if (itemsToDispatch.length === 0) {
            setError('Please enter dispatch quantity greater than 0 for at least one raw material.');
            return;
        }

        // Validate on client side as well
        for (const item of itemsToDispatch) {
            const reqItem = (request.items || []).find(i => Number(i.id) === item.request_item_id);
            if (reqItem) {
                const balance = Number(reqItem.balance_required) || 0;
                const stock = Number(reqItem.available_stock) || 0;
                if (item.dispatched_quantity > stock) {
                    setError(`Cannot dispatch ${item.dispatched_quantity} ${reqItem.unit} of "${reqItem.raw_material_name}". Only ${stock} ${reqItem.unit} is available in store stock.`);
                    return;
                }
                if (item.dispatched_quantity > balance) {
                    setError(`Cannot dispatch ${item.dispatched_quantity} ${reqItem.unit} of "${reqItem.raw_material_name}". Only ${balance} ${reqItem.unit} is remaining to fulfill.`);
                    return;
                }
            }
        }

        setSubmitting(true);
        try {
            const res = await createMaterialDispatch({
                request_id: requestId,
                dispatch_date: new Date().toISOString().split('T')[0],
                remarks: remarks.trim() || 'Store material dispatch confirmed',
                items: itemsToDispatch
            });

            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to confirm dispatch.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error creating dispatch.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Truck size={16} className="text-orange-400" />
                        Execute Material Dispatch ({request?.request_code})
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
                        <div className="text-center py-8 text-gray-400 font-medium">Loading request items...</div>
                    ) : !request ? (
                        <div className="text-center py-8 text-gray-400 font-medium">Material request not found.</div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Target Product</span>
                                    <p className="font-bold text-gray-900 mt-0.5">{request.product_name || request.project_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Planning Code</span>
                                    <p className="font-mono font-bold text-purple-700 mt-0.5">{request.planning_code}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Requested By</span>
                                    <p className="font-semibold text-gray-800 mt-0.5">{request.requested_by_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                                    <p className="font-bold text-xs mt-0.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                            {request.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Line Items Table with Stock Check */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                            <th className="py-2.5 px-3">Raw Material</th>
                                            <th className="py-2.5 px-3 text-right">Required Qty</th>
                                            <th className="py-2.5 px-3 text-right">Available Stock</th>
                                            <th className="py-2.5 px-3 text-right">Already Dispatched</th>
                                            <th className="py-2.5 px-3 text-right">Balance Required</th>
                                            <th className="py-2.5 px-3 text-right">Qty to Dispatch Now</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(request.items || []).map(item => {
                                            const totalReq = Number(item.required_quantity) || 0;
                                            const alreadyDisp = Number(item.dispatched_quantity) || 0;
                                            const balance = Number(item.balance_required) || 0;
                                            const availableStock = Number(item.available_stock) || 0;
                                            const isStockSufficient = availableStock >= balance;
                                            const isFulfilled = balance <= 0;
                                            const isOutOfStock = balance > 0 && availableStock <= 0;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                                                        <div>{item.raw_material_name}</div>
                                                        {isFulfilled && (
                                                            <span className="text-[10px] text-emerald-600 font-semibold">✓ Already Fulfilled</span>
                                                        )}
                                                        {isOutOfStock && (
                                                            <span className="text-[10px] text-rose-500 font-semibold">⚠ Out of Stock in Store</span>
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-medium">{totalReq} {item.unit}</td>
                                                    <td className={`py-2.5 px-3 text-right font-bold ${isStockSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {availableStock} {item.unit}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right text-gray-600 font-semibold">{alreadyDisp} {item.unit}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-amber-600">{balance} {item.unit}</td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        {isFulfilled ? (
                                                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">Done</span>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={Math.min(balance, availableStock)}
                                                                step="0.01"
                                                                value={dispatchQtys[item.id] !== undefined ? dispatchQtys[item.id] : Math.min(balance, availableStock)}
                                                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                                disabled={balance <= 0 || availableStock <= 0}
                                                                placeholder={isOutOfStock ? "No Stock" : "0"}
                                                                className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-right text-xs font-bold text-orange-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Informational notice when no stock can be dispatched */}
                            {(() => {
                                const anyDispatchable = (request.items || []).some(
                                    item => (Number(item.balance_required) || 0) > 0 && (Number(item.available_stock) || 0) > 0
                                );
                                const allFulfilled = (request.items || []).every(
                                    item => (Number(item.balance_required) || 0) <= 0
                                );

                                if (allFulfilled) {
                                    return (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                            <span>All requested raw materials have already been dispatched. This request is complete.</span>
                                        </div>
                                    );
                                }

                                if (!anyDispatchable) {
                                    return (
                                        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center gap-2">
                                            <AlertCircle size={16} className="text-amber-600 shrink-0" />
                                            <span>
                                                <strong>Store stock is unavailable:</strong> None of the remaining required materials currently have available stock in the store. Please add stock in Store Management to complete this dispatch.
                                            </span>
                                        </div>
                                    );
                                }

                                return null;
                            })()}

                            {/* Remarks */}
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Dispatch Remarks</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Issued from Bay A to Shift Incharge Line 1"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
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
                        {(() => {
                            const anyDispatchable = (request?.items || []).some(
                                item => (Number(item.balance_required) || 0) > 0 && (Number(item.available_stock) || 0) > 0
                            );

                            return (
                                <button
                                    type="submit"
                                    disabled={submitting || loading || !request || !anyDispatchable}
                                    className="px-5 py-2 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-orange-600/20 flex items-center gap-1.5"
                                >
                                    <ArrowDownRight size={15} />
                                    {submitting
                                        ? 'Deducting Stock & Confirming...'
                                        : !anyDispatchable
                                        ? 'No Stock Available to Dispatch'
                                        : 'Confirm Material Dispatch (-Stock)'}
                                </button>
                            );
                        })()}
                    </div>
                </form>
            </div>
        </div>
    );
};
