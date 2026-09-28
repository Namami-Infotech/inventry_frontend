import React, { useState, useEffect } from 'react';
import { ClipboardList, X, Package, Truck, Calendar, CheckCircle2 } from 'lucide-react';
import { getPlanningById } from '../services/planningService.js';

export const ViewPlanningModal = ({ isOpen, planningId, onClose }) => {
    const [planning, setPlanning] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && planningId) {
            fetchPlanning();
        }
    }, [isOpen, planningId]);

    const fetchPlanning = async () => {
        setLoading(true);
        try {
            const res = await getPlanningById(planningId);
            if (res.success && res.data) {
                setPlanning(res.data);
            }
        } catch (e) {
            console.error("Failed to load planning details", e);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-200 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center px-5 py-4 bg-gray-900 text-white shrink-0">
                    <h2 className="text-sm font-bold flex items-center gap-2">
                        <ClipboardList size={16} className="text-purple-400" />
                        Production Planning Details ({planning?.planning_code})
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400 font-medium">Loading planning details...</div>
                    ) : !planning ? (
                        <div className="text-center py-8 text-gray-400 font-medium">Planning not found.</div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Target Project</span>
                                    <p className="font-bold text-gray-900 text-xs mt-0.5">{planning.project_name}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Planned Production Qty</span>
                                    <p className="font-bold text-gray-900 text-base mt-0.5">{Number(planning.planned_quantity).toLocaleString()}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">RM Dispatch Date</span>
                                    <p className="font-semibold text-gray-800 text-xs mt-0.5">
                                        {planning.rm_dispatch_date ? (() => {
                                            const parts = String(planning.rm_dispatch_date).split('T')[0].split('-');
                                            return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : planning.rm_dispatch_date;
                                        })() : '—'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Status</span>
                                    <p className="font-bold text-xs mt-0.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                            {planning.status}
                                        </span>
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Planning Remarks</span>
                                    <p className="font-medium text-gray-800 text-xs mt-0.5">{planning.remarks || '—'}</p>
                                </div>

                                <div className="sm:col-span-2">
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Material Request</span>
                                    <p className="font-semibold text-blue-600 text-xs mt-0.5 font-mono">
                                        {planning.material_request ? `${planning.material_request.request_code} (${planning.material_request.status})` : 'Auto-generated'}
                                    </p>
                                </div>
                            </div>

                            {/* Raw Materials Requirement Table */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                                    <Package size={14} className="text-purple-600" />
                                    Required Raw Materials Requirement
                                </h3>

                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                                <th className="py-2.5 px-3">Raw Material</th>
                                                <th className="py-2.5 px-3 text-right">Required Qty</th>
                                                <th className="py-2.5 px-3 text-right">Available Store Stock</th>
                                                <th className="py-2.5 px-3 text-right">Already Dispatched</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(planning.materials || []).map(mat => (
                                                <tr key={mat.id} className="hover:bg-gray-50">
                                                    <td className="py-2.5 px-3 font-semibold text-gray-900">{mat.raw_material_name}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">{Number(mat.required_quantity).toLocaleString()} {mat.unit}</td>
                                                    <td className="py-2.5 px-3 text-right text-gray-600">{Number(mat.available_stock || 0).toLocaleString()} {mat.unit}</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{Number(mat.total_dispatched_quantity || 0).toLocaleString()} {mat.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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

