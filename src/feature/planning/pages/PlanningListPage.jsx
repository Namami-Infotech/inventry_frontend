import React, { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList,
    Plus,
    Search,
    Filter,
    Calendar,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Package,
    Truck
} from 'lucide-react';
import { getPlannings } from '../services/planningService.js';
import { CreatePlanningModal } from '../components/CreatePlanningModal.jsx';
import { ViewPlanningModal } from '../components/ViewPlanningModal.jsx';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch';

export const PlanningListPage = () => {
    const [plannings, setPlannings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewingPlanningId, setViewingPlanningId] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (currentUser.role || '').toLowerCase();
    const canCreatePlanning = rawRole.includes('admin') || rawRole.includes('incharge') || rawRole.includes('manager');

    const fetchPlannings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPlannings({
                page,
                limit,
                search: searchTerm ? searchTerm.trim() : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });
            if (res.success) {
                const list = res.data || [];
                setPlannings(list);
                if (res.pagination) {
                    setPagination(res.pagination);
                } else {
                    setPagination({
                        currentPage: page,
                        pageSize: limit,
                        totalItems: list.length,
                        totalPages: Math.ceil(list.length / limit) || 1
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load plannings", e);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm, statusFilter]);

    useEffect(() => {
        fetchPlannings();
    }, [fetchPlannings]);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        setPage(1);
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        setPage(1);
    };

    const handlePageSizeChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max"><CheckCircle2 size={12} />Completed</span>;
            case 'In Production':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>In Production</span>;
            case 'Fully Dispatched':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1.5 w-max"><Truck size={12} />Ready for Production</span>;
            case 'Partially Dispatched':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max"><Clock size={12} />Partially Dispatched</span>;
            case 'Material Requested':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5 w-max"><Clock size={12} />Material Requested</span>;
            case 'Cancelled':
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max"><AlertCircle size={12} />Cancelled</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5 w-max">Draft</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                        <ClipboardList size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Production Planning</h1>
                        <p className="text-xs text-gray-500">Plan batches, set RM dispatch dates, and define raw material requirements</p>
                    </div>
                </div>

                {canCreatePlanning && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        Create Planning
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <TableSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search planning code, project, remarks..."
                    className="w-full sm:w-80"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={15} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Material Requested">Material Requested</option>
                        <option value="Partially Dispatched">Partially Dispatched</option>
                        <option value="Fully Dispatched">Fully Dispatched</option>
                        <option value="In Production">In Production</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Planning Code</th>
                                <th className="py-3.5 px-4">Target Product</th>
                                <th className="py-3.5 px-4 text-right">Planned Production Qty</th>
                                <th className="py-3.5 px-4">RM Dispatch Date</th>
                                <th className="py-3.5 px-4 text-center">Raw Materials</th>
                                <th className="py-3.5 px-4">Planning Remarks</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                                        Loading production plannings...
                                    </td>
                                </tr>
                            ) : plannings.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-12 text-gray-400 font-medium">
                                        {searchTerm ? `No plannings found for "${searchTerm}".` : 'No planning sessions found.'}
                                    </td>
                                </tr>
                            ) : (
                                plannings.map(p => (
                                    <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{p.planning_code}</td>
                                        <td className="py-3.5 px-4 font-bold text-gray-900">
                                            {p.project_name}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-bold text-sm text-gray-900">
                                            {Number(p.planned_quantity).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-gray-700">
                                            {p.rm_dispatch_date ? (() => {
                                                const parts = String(p.rm_dispatch_date).split('T')[0].split('-');
                                                return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : p.rm_dispatch_date;
                                            })() : '—'}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[11px]">
                                                <Package size={12} />
                                                {p.total_materials_count} items
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-600 max-w-[200px] truncate" title={p.remarks}>
                                            {p.remarks || <span className="text-gray-300 italic">—</span>}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex justify-center">{getStatusBadge(p.status)}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => setViewingPlanningId(p.id)}
                                                className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                                title="View Planning Details"
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

                {/* Common Pagination */}
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            {/* Modals */}
            <CreatePlanningModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchPlannings}
            />

            <ViewPlanningModal
                isOpen={!!viewingPlanningId}
                planningId={viewingPlanningId}
                onClose={() => setViewingPlanningId(null)}
            />
        </div>
    );
};

