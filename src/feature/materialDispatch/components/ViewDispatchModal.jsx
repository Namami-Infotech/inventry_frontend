import React, { useState, useEffect } from 'react';
import { Truck, X } from 'lucide-react';
import { getMaterialDispatchById } from '../services/materialDispatchService.js';

export const ViewDispatchModal = ({ isOpen, dispatchId, onClose }) => {
    const [dispatch, setDispatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && dispatchId) {
            fetchDispatch();
        }
    }, [isOpen, dispatchId]);

    const fetchDispatch = async () => {
        setLoading(true);
        try {
            const res = await getMaterialDispatchById(dispatchId);
            if (res.success && res.data) {
                setDispatch(res.data);
            }
        } catch (e) {
            console.error("Failed to load dispatch details", e);
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
                        <Truck size={16} className="text-orange-400" />
                        Material Dispatch Receipt ({dispatch?.dispatch_code})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading dispatch details...</div>
                    ) : !dispatch ? (
                        <div className="text-center py-8 text-gray-400">Dispatch record not found.</div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Project</span>
                                    <p className="font-bold text-gray-900 text-xs mt-0.5">{dispatch.project_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Request Code</span>
                                    <p className="font-mono font-bold text-blue-600 text-xs mt-0.5">{dispatch.request_code}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Planning Code</span>
                                    <p className="font-mono font-bold text-purple-600 text-xs mt-0.5">{dispatch.planning_code}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Dispatched Date</span>
                                    <p className="font-semibold text-gray-800 text-xs mt-0.5">{String(dispatch.dispatch_date).split('T')[0]}</p>
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                            <th className="py-2.5 px-3">Raw Material</th>
                                            <th className="py-2.5 px-3 text-right">Requested Qty</th>
                                            <th className="py-2.5 px-3 text-right">Dispatched Qty</th>
                                            <th className="py-2.5 px-3 text-right">Remaining in Store</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(dispatch.items || []).map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="py-2.5 px-3 font-semibold text-gray-900">{item.raw_material_name}</td>
                                                <td className="py-2.5 px-3 text-right font-medium">{Number(item.requested_quantity).toLocaleString()} {item.unit}</td>
                                                <td className="py-2.5 px-3 text-right font-bold text-orange-600">{Number(item.dispatched_quantity).toLocaleString()} {item.unit}</td>
                                                <td className="py-2.5 px-3 text-right text-gray-500">{Number(item.current_store_stock || 0).toLocaleString()} {item.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {dispatch.remarks && (
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600">
                                    <span className="font-semibold text-gray-700">Remarks: </span>
                                    {dispatch.remarks}
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
