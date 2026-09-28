import React, { useState, useEffect } from 'react';
import { Cpu, X, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import { getMachineById } from '../services/machineService.js';

export const MachineDetailsModal = ({ isOpen, machineId, onClose }) => {
    const [machine, setMachine] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && machineId) {
            fetchDetails();
        }
    }, [isOpen, machineId]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await getMachineById(machineId);
            if (res.success && res.data) {
                setMachine(res.data);
            }
        } catch (e) {
            console.error("Failed to load machine details", e);
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
                        <Cpu size={16} className="text-cyan-400" />
                        Machine Utilization & Log History
                    </h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400 font-medium">Loading machine history...</div>
                    ) : !machine ? (
                        <div className="text-center py-8 text-gray-400 font-medium">Machine not found.</div>
                    ) : (
                        <>
                            {/* Machine Info Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Machine Code</span>
                                    <p className="font-mono font-bold text-gray-900 text-xs mt-0.5">{machine.machine_code}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Machine Name</span>
                                    <p className="font-bold text-gray-900 text-xs mt-0.5">{machine.machine_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Type</span>
                                    <p className="font-medium text-gray-700 text-xs mt-0.5">{machine.machine_type}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Current Status</span>
                                    <p className="font-bold text-xs mt-0.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                            machine.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                                            machine.status === 'Running' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {machine.status}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Production History Table */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs">
                                    <Activity size={14} className="text-blue-600" />
                                    Machine Production Runs ({(machine.productions || []).length})
                                </h3>

                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                                                <th className="py-2.5 px-3">Run Code</th>
                                                <th className="py-2.5 px-3">Project</th>
                                                <th className="py-2.5 px-3">Date / Shift</th>
                                                <th className="py-2.5 px-3 text-right">OK Qty</th>
                                                <th className="py-2.5 px-3 text-right">Rej %</th>
                                                <th className="py-2.5 px-3 text-right">Prod/Hr</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(machine.productions || []).length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-6 text-gray-400">
                                                        No production entries recorded on this machine.
                                                    </td>
                                                </tr>
                                            ) : (
                                                machine.productions.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50">
                                                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">{p.production_code}</td>
                                                        <td className="py-2.5 px-3 font-medium">{p.project_name}</td>
                                                        <td className="py-2.5 px-3">{String(p.production_date).split('T')[0]} ({p.shift})</td>
                                                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{Number(p.ok_quantity).toLocaleString()}</td>
                                                        <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">{p.rejection_percentage}%</td>
                                                        <td className="py-2.5 px-3 text-right font-semibold text-blue-600">{p.production_per_hour}/hr</td>
                                                    </tr>
                                                ))
                                            )}
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
