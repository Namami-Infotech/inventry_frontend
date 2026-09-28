import React, { useState, useEffect, useCallback } from 'react';
import {
    Truck,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Building2
} from 'lucide-react';
import { getMaterialDispatches } from '../services/materialDispatchService.js';
import { ViewDispatchModal } from '../components/ViewDispatchModal.jsx';
import TableSearch from '../../../components/common/TableSearch.jsx';
import Pagination from '../../../components/common/pagination';

export const MaterialDispatchListPage = () => {
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    });
    const [viewingDispatchId, setViewingDispatchId] = useState(null);

    const fetchDispatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMaterialDispatches({
                page,
                limit,
                search: search || undefined
            });
            if (res.success) {
                setDispatches(res.data || []);
                if (res.pagination) {
                    setPagination(res.pagination);
                } else {
                    setPagination({
                        currentPage: page,
                        pageSize: limit,
                        totalItems: res.data?.length || 0,
                        totalPages: 1
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load dispatches", e);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchDispatches();
    }, [fetchDispatches]);

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                        <Truck size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Material Dispatches</h1>
                        <p className="text-xs text-gray-500">Store outward material issues deducted from inventory against job plannings</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-80">
                    <TableSearch
                        value={search}
                        onChange={(val) => {
                            setSearch(val);
                            setPage(1);
                        }}
                        placeholder="Search dispatch code, request, project..."
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Dispatch Code</th>
                                <th className="py-3.5 px-4">Request & Planning</th>
                                <th className="py-3.5 px-4">Project</th>
                                <th className="py-3.5 px-4">Dispatch Date</th>
                                <th className="py-3.5 px-4 text-right">Total Material Qty</th>
                                <th className="py-3.5 px-4">Store Manager</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                                        Loading material dispatches...
                                    </td>
                                </tr>
                            ) : dispatches.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                                        {search ? `No material dispatches found matching "${search}".` : 'No material dispatches recorded yet.'}
                                    </td>
                                </tr>
                            ) : (
                                dispatches.map(d => (
                                    <tr key={d.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-orange-700">{d.dispatch_code}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="font-mono text-blue-600 font-bold">{d.request_code}</div>
                                            <div className="font-mono text-[10px] text-purple-600">{d.planning_code}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            {d.project_name}
                                            <div className="text-[10px] text-gray-400 font-mono">{d.project_code}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-700 font-medium">{String(d.dispatch_date).split('T')[0]}</td>
                                        <td className="py-3.5 px-4 text-right font-bold text-base text-gray-900">
                                            {Number(d.total_dispatched_quantity || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">({d.total_items_count} items)</span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-700 font-medium">{d.store_manager_name || 'Store'}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex justify-center">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {d.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => setViewingDispatchId(d.id)}
                                                className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                                                title="View Dispatch Receipt"
                                            >
                                                <Eye size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalItems > 0 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.pageSize}
                        onPageChange={(p) => setPage(p)}
                        onPageSizeChange={(newLimit) => {
                            setLimit(newLimit);
                            setPage(1);
                        }}
                    />
                )}
            </div>

            {/* Modals */}
            <ViewDispatchModal
                isOpen={!!viewingDispatchId}
                dispatchId={viewingDispatchId}
                onClose={() => setViewingDispatchId(null)}
            />
        </div>
    );
};
