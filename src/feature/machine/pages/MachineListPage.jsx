import React, { useState, useEffect, useCallback } from 'react';
import {
    Cpu,
    Plus,
    Search,
    Filter,
    Activity,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Eye,
    Edit2,
    BarChart3
} from 'lucide-react';
import { getMachines } from '../services/machineService.js';
import { AddMachineModal } from '../components/AddMachineModal.jsx';
import { EditMachineModal } from '../components/EditMachineModal.jsx';
import { MachineDetailsModal } from '../components/MachineDetailsModal.jsx';
import Pagination from '../../../components/common/pagination';
import TableSearch from '../../../components/common/TableSearch';

export const MachineListPage = () => {
    const [machines, setMachines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1
    });

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingMachine, setEditingMachine] = useState(null);
    const [viewingMachineId, setViewingMachineId] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const rawRole = (currentUser.role || '').toLowerCase();
    const canManageMachines = rawRole.includes('admin');

    const fetchMachines = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMachines({
                page,
                limit,
                search: searchTerm ? searchTerm.trim() : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                machine_type: typeFilter !== 'all' ? typeFilter : undefined
            });
            if (res.success) {
                const list = res.data || [];
                setMachines(list);
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
            console.error("Failed to load machines", e);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm, statusFilter, typeFilter]);

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);

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

    const totalMachines = machines.length;
    const availableCount = machines.filter(m => m.status === 'Available').length;
    const runningCount = machines.filter(m => m.status === 'Running').length;
    const maintenanceCount = machines.filter(m => m.status === 'Maintenance').length;

    const getStatusBadge = (status) => {
        if (status === 'Available') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Available</span>;
        }
        if (status === 'Running') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 w-max"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>Running</span>;
        }
        if (status === 'Maintenance') {
            return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max"><AlertTriangle size={12} />Maintenance</span>;
        }
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-1.5 w-max">Inactive</span>;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
                        <Cpu size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Machine Management</h1>
                        <p className="text-xs text-gray-500">Shop floor machines, utilization statistics, and maintenance tracking</p>
                    </div>
                </div>

                {canManageMachines && (
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-cyan-600/25 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    >
                        <Plus size={16} />
                        Add Machine
                    </button>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                        <Cpu size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Total Fleet</p>
                        <p className="text-lg font-bold text-gray-900">{totalMachines}</p>
                        <p className="text-[10px] text-gray-400 font-medium">All shop floor machinery</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Available</p>
                        <p className="text-lg font-bold text-emerald-600">{availableCount}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">Ready for job scheduling</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">In Production</p>
                        <p className="text-lg font-bold text-blue-600">{runningCount}</p>
                        <p className="text-[10px] text-blue-600 font-medium">Actively running shifts</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Maintenance</p>
                        <p className="text-lg font-bold text-amber-600">{maintenanceCount}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Under repair / inspection</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <TableSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search machine name, code, type, location..."
                    className="w-full sm:w-80"
                />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={15} className="text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Running">Running</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Machine Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Code</th>
                                <th className="py-3.5 px-4">Machine Name</th>
                                <th className="py-3.5 px-4">Type</th>
                                <th className="py-3.5 px-4">Capacity</th>
                                <th className="py-3.5 px-4">Location</th>
                                <th className="py-3.5 px-4 text-right">Production Runs</th>
                                <th className="py-3.5 px-4 text-right">Total Output</th>
                                <th className="py-3.5 px-4 text-center">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-gray-400 font-medium">
                                        Loading machinery fleet...
                                    </td>
                                </tr>
                            ) : machines.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-gray-400 font-medium">
                                        {searchTerm ? `No machines found matching "${searchTerm}".` : "No machines found matching your filters."}
                                    </td>
                                </tr>
                            ) : (
                                machines.map(m => (
                                    <tr key={m.id} className="hover:bg-cyan-50/40 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-700">{m.machine_code}</td>
                                        <td className="py-3.5 px-4 font-bold text-gray-900">{m.machine_name}</td>
                                        <td className="py-3.5 px-4 text-gray-600">{m.machine_type}</td>
                                        <td className="py-3.5 px-4 text-gray-600">{m.capacity || 'N/A'}</td>
                                        <td className="py-3.5 px-4 text-gray-600">{m.location || 'Shop Floor'}</td>
                                        <td className="py-3.5 px-4 text-right font-semibold text-gray-800">{Number(m.total_production_runs || 0).toLocaleString()}</td>
                                        <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{Number(m.total_output_quantity || 0).toLocaleString()}</td>
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex justify-center">{getStatusBadge(m.status)}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setViewingMachineId(m.id)}
                                                    title="View Production Log"
                                                    className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                {canManageMachines && (
                                                    <button
                                                        onClick={() => setEditingMachine(m)}
                                                        title="Edit Machine Details"
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                )}
                                            </div>
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
            <AddMachineModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchMachines}
            />

            <EditMachineModal
                isOpen={!!editingMachine}
                machine={editingMachine}
                onClose={() => setEditingMachine(null)}
                onSuccess={fetchMachines}
            />

            <MachineDetailsModal
                isOpen={!!viewingMachineId}
                machineId={viewingMachineId}
                onClose={() => setViewingMachineId(null)}
            />
        </div>
    );
};
