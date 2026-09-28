import React, { useState } from 'react';
import { Layers, X, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adjustStock } from '../services/storeItemService.jsx';

export const AdjustStockModal = ({ isOpen, item, onClose, onSuccess }) => {
    const [adjustmentType, setAdjustmentType] = useState('add'); // 'add' | 'subtract'
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !item) return null;

    const currentQty = Number(item.quantity) || 0;
    const adjustQty = Number(quantity) || 0;
    const newExpectedStock = adjustmentType === 'add' ? (currentQty + adjustQty) : (currentQty - adjustQty);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (adjustQty <= 0) {
            setError('Please enter a valid quantity greater than 0.');
            return;
        }

        if (adjustmentType === 'subtract' && adjustQty > currentQty) {
            setError(`Cannot deduct ${adjustQty} ${item.unit}. Available stock is only ${currentQty} ${item.unit}.`);
            return;
        }

        const delta = adjustmentType === 'add' ? adjustQty : -adjustQty;

        setSubmitting(true);
        try {
            const res = await adjustStock(item.id, {
                adjustment_quantity: delta,
                notes: notes.trim() || `Manual stock adjustment (${adjustmentType === 'add' ? 'Increase' : 'Deduction'})`
            });
            if (res.success) {
                onSuccess?.();
                onClose();
            } else {
                setError(res.message || 'Failed to adjust stock.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Server error adjusting stock.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 animate-in zoom-in-95">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <Layers size={16} className="text-amber-400" />
                        Stock Adjustment ({item.item_name})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                    {error && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Current Stock Preview */}
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">Current Stock</span>
                            <p className="text-base font-bold text-gray-900">{currentQty} {item.unit}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold">New Stock Result</span>
                            <p className={`text-base font-bold ${newExpectedStock < 0 ? 'text-rose-600' : 'text-blue-600'}`}>
                                {isNaN(newExpectedStock) ? currentQty : newExpectedStock} {item.unit}
                            </p>
                        </div>
                    </div>

                    {/* Adjustment Type Selector */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1.5">Adjustment Action</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('add')}
                                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                    adjustmentType === 'add'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <ArrowUpRight size={14} className="text-emerald-600" />
                                Add Stock (+)
                            </button>

                            <button
                                type="button"
                                onClick={() => setAdjustmentType('subtract')}
                                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                                    adjustmentType === 'subtract'
                                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <ArrowDownRight size={14} className="text-rose-600" />
                                Deduct Stock (-)
                            </button>
                        </div>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Adjustment Quantity ({item.unit}) *</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter quantity to adjust..."
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                        />
                    </div>

                    {/* Reason / Notes */}
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Audit Reason / Remarks *</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Physical stock count discrepancy, quality batch write-off..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                        />
                    </div>

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
                            disabled={submitting}
                            className="px-5 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 disabled:opacity-50 transition cursor-pointer shadow-md shadow-amber-600/20"
                        >
                            {submitting ? 'Applying Adjustment...' : 'Confirm Stock Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
